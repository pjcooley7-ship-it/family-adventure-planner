import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { Loader } from 'lucide-react'
import { AirportPicker } from '@/components/AirportPicker'
import { useSubmitPreferences } from '@/hooks/useTripMutations'
import { useTripMembers, useMyPreferences } from '@/hooks/useTrip'
import { useAuth } from '@/hooks/useAuth'
import { DocContainer } from '@/components/DocContainer'
import {
  DEFAULT_PREFERENCES,
  ACTIVITY_OPTIONS,
  ACCOMMODATION_OPTIONS,
  CURRENCIES,
  type TravelPreferences,
} from '@/lib/types'

const STEPS = [
  { label: 'WHO',       headline: 'Where are you',           italic: 'flying from?' },
  { label: 'WHEN',      headline: 'When do you want to',     italic: 'travel?' },
  { label: 'BUDGET',    headline: "What's your",             italic: 'budget?' },
  { label: 'INTERESTS', headline: 'What do you',             italic: 'love doing?' },
  { label: 'NOTES',     headline: 'Anything else we should', italic: 'know?' },
]

const BUDGET_PRESETS = [
  { lbl: 'Backpack', rng: '$300–800',   emoji: '🎒', min: 300,  max: 800   },
  { lbl: 'Midrange', rng: '$800–2.4k',  emoji: '🏨', min: 800,  max: 2400  },
  { lbl: 'Comfort',  rng: '$2.4k–5k',   emoji: '🏝', min: 2400, max: 5000  },
  { lbl: 'Splurge',  rng: '$5k+',        emoji: '🥂', min: 5000, max: 10000 },
]

function formatBudget(min: number, max: number): string {
  const f = (n: number) => n >= 1000 ? `$${(n / 1000 % 1 === 0 ? n / 1000 : (n / 1000).toFixed(1))}k` : `$${n}`
  return `${f(min)} – ${f(max)}`
}

function Wordmark() {
  return (
    <span style={{ fontFamily: 'var(--f-display)', fontSize: 15, fontWeight: 400, color: 'var(--ink)', letterSpacing: '-0.02em' }}>
      wanderlust<span style={{ color: 'var(--coral)' }}>.</span>
    </span>
  )
}

// ── Stepper (adults / kids / trip duration) ──────────────────────────────────
function Stepper({ value, onChange, min = 0, max = 99 }: { value: number; onChange: (v: number) => void; min?: number; max?: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, border: '1px solid var(--hairline)', borderRadius: 10, padding: '6px 10px' }}>
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        style={{ width: 40, height: 40, border: 'none', background: 'var(--paper-2)', borderRadius: 8, cursor: 'pointer', fontSize: 18, color: 'var(--ink)', fontFamily: 'var(--f-sans)', lineHeight: 1 }}
      >−</button>
      <span style={{ flex: 1, textAlign: 'center', fontSize: 18, fontWeight: 600, fontFamily: 'var(--f-sans)', color: 'var(--ink)' }}>{value}</span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        style={{ width: 40, height: 40, border: 'none', background: 'var(--paper-2)', borderRadius: 8, cursor: 'pointer', fontSize: 18, color: 'var(--ink)', fontFamily: 'var(--f-sans)', lineHeight: 1 }}
      >+</button>
    </div>
  )
}

// ── Section label ─────────────────────────────────────────────────────────────
function Label({ children }: { children: React.ReactNode }) {
  return (
    <p className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', letterSpacing: '0.15em', marginBottom: 8 }}>
      {children}
    </p>
  )
}

// ── Toggle ────────────────────────────────────────────────────────────────────
function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      style={{
        display: 'flex', alignItems: 'center', gap: 12, background: 'none',
        border: 'none', cursor: 'pointer', padding: 0, textAlign: 'left',
      }}
    >
      <div style={{
        width: 40, height: 24, borderRadius: 12,
        background: checked ? 'var(--coral)' : 'var(--hairline)',
        position: 'relative', flexShrink: 0,
        transition: 'background 200ms',
      }}>
        <div style={{
          position: 'absolute', top: 3, left: checked ? 19 : 3,
          width: 18, height: 18, borderRadius: '50%', background: 'var(--paper)',
          boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
          transition: 'left 200ms',
        }} />
      </div>
      <span style={{ fontFamily: 'var(--f-sans)', fontSize: 14, color: 'var(--ink-2)', lineHeight: 1.4 }}>{label}</span>
    </button>
  )
}

// ─────────────────────────────────────────────────────────────────────────────

export default function PreferencesPage() {
  const { tripId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [step, setStep] = useState(0)
  const [prefs, setPrefs] = useState<TravelPreferences>(DEFAULT_PREFERENCES)
  const [animating, setAnimating] = useState(false)
  const submitPreferences = useSubmitPreferences(tripId!)

  const { data: members = [] } = useTripMembers(tripId!)
  const { data: existingPrefs } = useMyPreferences(tripId!, user?.id)

  const myMember = members.find(m => m.user_id === user?.id)
  const displayName = myMember?.display_name ?? ''

  useEffect(() => {
    if (existingPrefs) {
      setPrefs({
        travelerName:        existingPrefs.traveler_name,
        originCity:          existingPrefs.origin_city,
        originAirports:      existingPrefs.origin_airports,
        adults:              existingPrefs.adults,
        kids:                existingPrefs.kids,
        earliestDeparture:   existingPrefs.earliest_departure ?? '',
        latestReturn:        existingPrefs.latest_return ?? '',
        flexibleDates:       existingPrefs.flexible_dates,
        tripDurationMin:     existingPrefs.trip_duration_min,
        tripDurationMax:     existingPrefs.trip_duration_max,
        budgetMin:           existingPrefs.budget_min,
        budgetMax:           existingPrefs.budget_max,
        currency:            existingPrefs.currency,
        activities:          existingPrefs.activities,
        accommodationTypes:  existingPrefs.accommodation_types,
        specialRequirements: existingPrefs.special_requirements ?? '',
      })
    } else if (displayName) {
      setPrefs(p => ({ ...p, travelerName: displayName }))
    }
  }, [existingPrefs, displayName])

  function update<K extends keyof TravelPreferences>(key: K, value: TravelPreferences[K]) {
    setPrefs(p => ({ ...p, [key]: value }))
  }

  function toggleActivity(id: string) {
    setPrefs(p => ({
      ...p,
      activities: p.activities.includes(id)
        ? p.activities.filter(a => a !== id)
        : [...p.activities, id],
    }))
  }

  function toggleAccommodation(id: string) {
    setPrefs(p => ({
      ...p,
      accommodationTypes: p.accommodationTypes.includes(id)
        ? p.accommodationTypes.filter(a => a !== id)
        : [...p.accommodationTypes, id],
    }))
  }

  function validateStep(): boolean {
    if (step === 0) {
      if (!prefs.originCity.trim()) { toast.error('Please enter your city or town'); return false }
      if (prefs.originAirports.length === 0) { toast.error('Please select at least one departure airport'); return false }
    }
    if (step === 1) {
      if (!prefs.earliestDeparture) { toast.error('Please set your earliest departure date'); return false }
      if (!prefs.latestReturn) { toast.error('Please set your latest return date'); return false }
      if (prefs.earliestDeparture >= prefs.latestReturn) { toast.error('Return must be after departure'); return false }
    }
    if (step === 3) {
      if (prefs.activities.length === 0) { toast.error('Pick at least one activity'); return false }
    }
    return true
  }

  function goNext() {
    if (!validateStep()) return
    if (step < STEPS.length - 1) {
      setAnimating(true)
      setTimeout(() => { setStep(s => s + 1); setAnimating(false) }, 150)
    } else {
      submitPreferences.mutate(prefs)
    }
  }

  function goBack() {
    if (step > 0) {
      setAnimating(true)
      setTimeout(() => { setStep(s => s - 1); setAnimating(false) }, 150)
    } else {
      navigate(`/trip/${tripId}`)
    }
  }

  const current = STEPS[step]

  return (
    <DocContainer>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh' }}>

        {/* ── Sticky header ── */}
        <div style={{ position: 'sticky', top: 0, zIndex: 10, background: 'var(--paper)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 28px' }}>
            <button className="btn-text" onClick={goBack}>← BACK</button>
            <Wordmark />
            <span className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', letterSpacing: '0.1em' }}>
              {step + 1}/{STEPS.length}
            </span>
          </div>
          <div style={{ display: 'flex', gap: 4, padding: '0 28px 14px' }}>
            {STEPS.map((_, i) => (
              <div
                key={i}
                style={{
                  flex: 1, height: 3, borderRadius: 2,
                  background: i <= step ? 'var(--coral)' : 'var(--hairline)',
                  transition: 'background 200ms',
                }}
              />
            ))}
          </div>
          <div style={{ padding: '0 28px 14px' }}>
            <p className="eyebrow">STEP {String(step + 1).padStart(2, '0')} · {current.label}</p>
          </div>
        </div>

        {/* ── Scrollable content ── */}
        <div
          style={{
            flex: 1,
            padding: '12px 28px 24px',
            opacity: animating ? 0 : 1,
            transform: animating ? 'translateY(8px)' : 'translateY(0)',
            transition: 'opacity 0.15s, transform 0.15s',
          }}
        >
          <h2 className="display" style={{ fontSize: 32, marginBottom: 28 }}>
            {current.headline}{' '}
            <em style={{ fontStyle: 'italic', color: 'var(--coral)' }}>{current.italic}</em>
          </h2>

          {step === 0 && <StepWho prefs={prefs} update={update} displayName={displayName} />}
          {step === 1 && <StepWhen prefs={prefs} update={update} />}
          {step === 2 && <StepBudget prefs={prefs} update={update} />}
          {step === 3 && <StepInterests prefs={prefs} toggleActivity={toggleActivity} toggleAccommodation={toggleAccommodation} />}
          {step === 4 && <StepNotes prefs={prefs} update={update} />}
        </div>

        {/* ── Sticky footer ── */}
        <div style={{ position: 'sticky', bottom: 0, padding: '16px 28px', paddingBottom: 'max(16px, calc(16px + env(safe-area-inset-bottom)))', borderTop: '1px solid var(--hairline)', background: 'var(--paper)' }}>
          <button
            className="btn-primary coral"
            style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: 15 }}
            onClick={goNext}
            disabled={submitPreferences.isPending}
          >
            {step === STEPS.length - 1
              ? submitPreferences.isPending
                ? <><Loader size={15} className="spin" /> Saving…</>
                : 'Submit →'
              : 'Continue →'}
          </button>
        </div>

      </div>
    </DocContainer>
  )
}

/* ─── Step 1: Who ─────────────────────────────────────────────────────────── */

function StepWho({
  prefs,
  update,
  displayName,
}: {
  prefs: TravelPreferences
  update: <K extends keyof TravelPreferences>(k: K, v: TravelPreferences[K]) => void
  displayName: string
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {displayName && (
        <div>
          <Label>TRAVELING AS</Label>
          <div style={{
            padding: '11px 14px', borderRadius: 10,
            border: '1.5px solid var(--hairline)', background: 'var(--paper-2)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <span style={{ fontFamily: 'var(--f-sans)', fontSize: 14, color: 'var(--ink-2)' }}>{displayName}</span>
            <span className="mono" style={{ fontSize: 9, letterSpacing: '0.15em', color: 'var(--ink-4)' }}>LOCKED</span>
          </div>
        </div>
      )}

      <div>
        <Label>YOUR CITY</Label>
        <AirportPicker
          cityLabel={prefs.originCity}
          selectedIatas={prefs.originAirports}
          onCityLabel={v => update('originCity', v)}
          onSelectedIatas={v => update('originAirports', v)}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <div>
          <Label>ADULTS</Label>
          <Stepper value={prefs.adults} onChange={v => update('adults', v)} min={1} />
        </div>
        <div>
          <Label>KIDS</Label>
          <Stepper value={prefs.kids} onChange={v => update('kids', v)} />
        </div>
      </div>
    </div>
  )
}

/* ─── Step 2: When ────────────────────────────────────────────────────────── */

function StepWhen({
  prefs,
  update,
}: {
  prefs: TravelPreferences
  update: <K extends keyof TravelPreferences>(k: K, v: TravelPreferences[K]) => void
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <div>
          <Label>EARLIEST DEPARTURE</Label>
          <input
            type="date"
            value={prefs.earliestDeparture}
            onChange={e => update('earliestDeparture', e.target.value)}
            style={{
              width: '100%', fontFamily: 'var(--f-sans)', fontSize: 14,
              color: 'var(--ink)', background: 'var(--paper)',
              border: '1.5px solid var(--hairline)', borderRadius: 10,
              padding: '10px 12px', outline: 'none',
              transition: 'border-color 160ms',
            }}
            onFocus={e => { e.currentTarget.style.borderColor = 'var(--ink)' }}
            onBlur={e => { e.currentTarget.style.borderColor = 'var(--hairline)' }}
          />
        </div>
        <div>
          <Label>LATEST RETURN</Label>
          <input
            type="date"
            value={prefs.latestReturn}
            onChange={e => update('latestReturn', e.target.value)}
            style={{
              width: '100%', fontFamily: 'var(--f-sans)', fontSize: 14,
              color: 'var(--ink)', background: 'var(--paper)',
              border: '1.5px solid var(--hairline)', borderRadius: 10,
              padding: '10px 12px', outline: 'none',
              transition: 'border-color 160ms',
            }}
            onFocus={e => { e.currentTarget.style.borderColor = 'var(--ink)' }}
            onBlur={e => { e.currentTarget.style.borderColor = 'var(--hairline)' }}
          />
        </div>
      </div>

      <Toggle
        checked={prefs.flexibleDates}
        onChange={v => update('flexibleDates', v)}
        label="My dates are flexible — show me deals nearby"
      />

      <div>
        <Label>TRIP LENGTH (NIGHTS)</Label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: 12 }}>
          <div>
            <p className="mono" style={{ fontSize: 9, color: 'var(--ink-4)', letterSpacing: '0.12em', marginBottom: 6 }}>MIN</p>
            <Stepper
              value={prefs.tripDurationMin}
              onChange={v => update('tripDurationMin', Math.min(v, prefs.tripDurationMax))}
              min={1} max={30}
            />
          </div>
          <span style={{ color: 'var(--ink-4)', fontSize: 18, marginTop: 20 }}>—</span>
          <div>
            <p className="mono" style={{ fontSize: 9, color: 'var(--ink-4)', letterSpacing: '0.12em', marginBottom: 6 }}>MAX</p>
            <Stepper
              value={prefs.tripDurationMax}
              onChange={v => update('tripDurationMax', Math.max(v, prefs.tripDurationMin))}
              min={1} max={30}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── Step 3: Budget ──────────────────────────────────────────────────────── */

function StepBudget({
  prefs,
  update,
}: {
  prefs: TravelPreferences
  update: <K extends keyof TravelPreferences>(k: K, v: TravelPreferences[K]) => void
}) {
  const MAX = 10000
  const activePreset = BUDGET_PRESETS.find(p => p.min === prefs.budgetMin && p.max === prefs.budgetMax)
  const barLeft = (prefs.budgetMin / MAX) * 100
  const barRight = 100 - (prefs.budgetMax / MAX) * 100
  const displayRange = prefs.budgetMax >= MAX
    ? `${formatBudget(prefs.budgetMin, prefs.budgetMax).split(' – ')[0]} – $10k+`
    : formatBudget(prefs.budgetMin, prefs.budgetMax)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <style>{`
        .wl-range { position:absolute; width:100%; height:100%; -webkit-appearance:none; appearance:none; pointer-events:none; background:transparent; outline:none; margin:0; }
        .wl-range::-webkit-slider-runnable-track { -webkit-appearance:none; height:2px; background:transparent; }
        .wl-range::-webkit-slider-thumb { -webkit-appearance:none; pointer-events:all; width:20px; height:20px; border-radius:50%; background:var(--coral); cursor:grab; border:2px solid var(--paper); box-shadow:0 2px 6px rgba(0,0,0,.18); margin-top:-9px; }
        .wl-range:active::-webkit-slider-thumb { cursor:grabbing; }
        .wl-range::-moz-range-thumb { pointer-events:all; width:16px; height:16px; border-radius:50%; background:var(--coral); cursor:grab; border:2px solid var(--paper); box-shadow:0 2px 6px rgba(0,0,0,.18); }
        .wl-range::-moz-range-track { background:transparent; }
      `}</style>

      <p style={{ fontFamily: 'var(--f-sans)', fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.55 }}>
        Per person, flights + accommodation. Food &amp; activities are extra.
      </p>

      {/* Live range display + slider */}
      <div style={{ background: 'var(--paper-2)', borderRadius: 16, padding: '20px 20px 18px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
          <span className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', letterSpacing: '0.15em' }}>
            {prefs.currency} PER PERSON
          </span>
          <select
            value={prefs.currency}
            onChange={e => update('currency', e.target.value)}
            style={{
              appearance: 'none', background: 'none', border: 'none', cursor: 'pointer',
              fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.12em',
              textTransform: 'uppercase', color: 'var(--ink-2)',
            }}
          >
            {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <p className="display" style={{ fontSize: 38, marginBottom: 2 }}>{displayRange}</p>
        <p className="mono" style={{ fontSize: 11, color: 'var(--ink-3)', minHeight: 16 }}>
          {activePreset ? `~ ${activePreset.lbl.toLowerCase()} travel` : 'custom budget'}
        </p>

        {/* Dual range slider */}
        <div style={{ marginTop: 18, position: 'relative', height: 28 }}>
          <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: 2, background: 'var(--hairline)', borderRadius: 1, transform: 'translateY(-50%)' }} />
          <div style={{
            position: 'absolute', top: '50%', height: 2, background: 'var(--ink)', borderRadius: 1,
            left: `${barLeft}%`, right: `${barRight}%`, transform: 'translateY(-50%)',
            transition: 'left 60ms, right 60ms',
          }} />
          <input
            type="range" className="wl-range"
            min={0} max={MAX} step={100}
            value={prefs.budgetMin}
            style={{ zIndex: prefs.budgetMin > MAX / 2 ? 2 : 1 }}
            onChange={e => update('budgetMin', Math.min(Number(e.target.value), prefs.budgetMax - 100))}
          />
          <input
            type="range" className="wl-range"
            min={0} max={MAX} step={100}
            value={prefs.budgetMax}
            style={{ zIndex: prefs.budgetMin > MAX / 2 ? 1 : 2 }}
            onChange={e => update('budgetMax', Math.max(Number(e.target.value), prefs.budgetMin + 100))}
          />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
          <span className="mono" style={{ fontSize: 10, color: 'var(--ink-3)' }}>$0</span>
          <span className="mono" style={{ fontSize: 10, color: 'var(--ink-3)' }}>$10k+</span>
        </div>
      </div>

      {/* Preset tiles */}
      <div>
        <Label>QUICK PICK</Label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {BUDGET_PRESETS.map(p => {
            const sel = p.min === prefs.budgetMin && p.max === prefs.budgetMax
            return (
              <button
                key={p.lbl}
                type="button"
                onClick={() => { update('budgetMin', p.min); update('budgetMax', p.max) }}
                style={{
                  padding: '12px 14px', textAlign: 'left', borderRadius: 10, cursor: 'pointer',
                  border: `1.5px solid ${sel ? 'var(--ink)' : 'var(--hairline)'}`,
                  background: sel ? 'var(--paper-2)' : 'var(--paper)',
                  fontFamily: 'var(--f-sans)',
                  transition: 'border-color 150ms, background 150ms',
                }}
              >
                <div style={{ fontSize: 16, marginBottom: 6 }}>{p.emoji}</div>
                <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>{p.lbl}</p>
                <p className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', marginTop: 2 }}>{p.rng}</p>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

/* ─── Step 4: Interests ───────────────────────────────────────────────────── */

function StepInterests({
  prefs,
  toggleActivity,
  toggleAccommodation,
}: {
  prefs: TravelPreferences
  toggleActivity: (id: string) => void
  toggleAccommodation: (id: string) => void
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      <div>
        <p style={{ fontSize: 13, color: 'var(--ink-2)', marginBottom: 20, lineHeight: 1.55 }}>
          Pick at least 3. More is better — we'll match overlap across the group.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
          {ACTIVITY_OPTIONS.map(({ id, label, emoji }) => {
            const sel = prefs.activities.includes(id)
            return (
              <button
                key={id}
                type="button"
                onClick={() => toggleActivity(id)}
                style={{
                  padding: '16px 8px', borderRadius: 12, cursor: 'pointer',
                  border: `1.5px solid ${sel ? 'var(--coral)' : 'var(--hairline)'}`,
                  background: sel ? 'var(--coral-bg)' : 'var(--paper)',
                  fontFamily: 'var(--f-sans)',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                  transition: 'border-color 150ms, background 150ms',
                }}
              >
                <span style={{ fontSize: 24 }}>{emoji}</span>
                <span style={{ fontSize: 12, fontWeight: 500, color: sel ? 'var(--coral-fg)' : 'var(--ink)' }}>{label}</span>
              </button>
            )
          })}
        </div>
      </div>

      <div>
        <Label>ACCOMMODATION</Label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {ACCOMMODATION_OPTIONS.map(({ id, label }) => {
            const sel = prefs.accommodationTypes.includes(id)
            return (
              <button
                key={id}
                type="button"
                onClick={() => toggleAccommodation(id)}
                style={{
                  padding: '8px 16px', fontSize: 13, borderRadius: 999, cursor: 'pointer',
                  border: `1.5px solid ${sel ? 'var(--ink)' : 'var(--hairline)'}`,
                  background: sel ? 'var(--ink)' : 'var(--paper)',
                  color: sel ? 'var(--paper)' : 'var(--ink)',
                  fontFamily: 'var(--f-sans)', fontWeight: 500,
                  transition: 'background 150ms, color 150ms, border-color 150ms',
                }}
              >
                {label}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

/* ─── Step 5: Notes ───────────────────────────────────────────────────────── */

function StepNotes({
  prefs,
  update,
}: {
  prefs: TravelPreferences
  update: <K extends keyof TravelPreferences>(k: K, v: TravelPreferences[K]) => void
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <p style={{ fontFamily: 'var(--f-sans)', fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.7 }}>
        Anything that would make or break the trip? Dietary needs, accessibility requirements,
        passport restrictions, or simply things you absolutely won't do.
      </p>

      <textarea
        value={prefs.specialRequirements}
        onChange={e => update('specialRequirements', e.target.value)}
        placeholder="e.g. Travelling with a toddler so need direct flights. Vegetarian. No extreme heat."
        rows={5}
        style={{
          fontFamily: 'var(--f-sans)', fontSize: 14, color: 'var(--ink)',
          background: 'var(--paper)',
          border: '1.5px solid var(--hairline)', borderRadius: 12,
          padding: '14px 16px', outline: 'none', width: '100%', resize: 'vertical',
          lineHeight: 1.7, transition: 'border-color 160ms',
        }}
        onFocus={e => { e.currentTarget.style.borderColor = 'var(--ink)' }}
        onBlur={e => { e.currentTarget.style.borderColor = 'var(--hairline)' }}
      />

      {/* Summary */}
      <div>
        <hr className="rule" style={{ marginBottom: 20 }} />
        <p className="eyebrow" style={{ marginBottom: 14 }}>YOUR SUBMISSION</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {[
            ['Traveler', prefs.travelerName || '—'],
            ['From',     prefs.originAirports.length > 0 ? prefs.originAirports.join(', ') : prefs.originCity || '—'],
            ['Party',    `${prefs.adults} adult${prefs.adults !== 1 ? 's' : ''}${prefs.kids > 0 ? `, ${prefs.kids} child${prefs.kids !== 1 ? 'ren' : ''}` : ''}`],
            ['Dates',    prefs.earliestDeparture ? `${prefs.earliestDeparture} → ${prefs.latestReturn}` : '—'],
            ['Budget',   prefs.budgetMin ? `${prefs.currency} ${prefs.budgetMin.toLocaleString()}–${prefs.budgetMax.toLocaleString()} pp` : '—'],
            ['Interests', prefs.activities.length > 0 ? `${prefs.activities.length} selected` : '—'],
          ].map(([k, v]) => (
            <div
              key={k}
              style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
                padding: '10px 0', borderBottom: '1px solid var(--hairline)',
              }}
            >
              <span className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', letterSpacing: '0.1em' }}>{k}</span>
              <span style={{ fontFamily: 'var(--f-sans)', fontSize: 13, color: 'var(--ink)', fontWeight: 500, maxWidth: '60%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
