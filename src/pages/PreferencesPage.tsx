import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { ArrowLeft, ArrowRight, Check } from 'lucide-react'
import { StepIndicator } from '@/components/StepIndicator'
import { FormField, TextInput, Counter, Toggle, Select } from '@/components/FormField'
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

const STEPS = ['Who', 'When', 'Budget', 'Interests', 'Notes']

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

  return (
    <DocContainer>

      {/* Nav */}
      <nav style={{
        padding: '18px 32px',
        borderBottom: '2.5px solid var(--color-ink)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <button
          onClick={goBack}
          className="flex items-center gap-2"
          style={{
            fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase',
            color: 'var(--color-ink-2)', background: 'none', border: 'none', cursor: 'pointer',
          }}
        >
          <ArrowLeft size={12} />
          BACK
        </button>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 600, color: 'var(--color-ink)' }}>
          Wanderlust
        </span>
        <div style={{ width: 60 }} />
      </nav>

      {/* Form */}
      <div style={{ padding: '40px 32px' }}>

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <p className="brut-label" style={{ marginBottom: 8 }}>
            TRAVEL PREFERENCES
          </p>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(1.5rem, 4vw, 2rem)',
            fontWeight: 600,
            color: 'var(--color-ink)',
            lineHeight: 1.1,
            letterSpacing: '-0.4px',
          }}>
            Tell us about your trip
          </h1>
        </div>

        <StepIndicator steps={STEPS} current={step} />

        {/* Step content */}
        <div
          style={{
            opacity: animating ? 0 : 1,
            transform: animating ? 'translateY(8px)' : 'translateY(0)',
            transition: 'opacity 0.15s, transform 0.15s',
            marginTop: 28,
          }}
        >
          {step === 0 && <StepWho prefs={prefs} update={update} />}
          {step === 1 && <StepWhen prefs={prefs} update={update} />}
          {step === 2 && <StepBudget prefs={prefs} update={update} />}
          {step === 3 && <StepInterests prefs={prefs} toggleActivity={toggleActivity} toggleAccommodation={toggleAccommodation} />}
          {step === 4 && <StepNotes prefs={prefs} update={update} />}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between" style={{ marginTop: 36, borderTop: '2.5px solid var(--border-soft)', paddingTop: 24 }}>
          <button
            onClick={goBack}
            style={{
              fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase',
              color: 'var(--color-ink-2)', background: 'none', border: 'none', cursor: 'pointer', padding: '8px 0',
            }}
          >
            {step === 0 ? 'CANCEL' : '← BACK'}
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-ink-3)', letterSpacing: '0.1em' }}>
              {step + 1} / {STEPS.length}
            </span>
            <button
              onClick={goNext}
              className="brut-btn-primary"
              style={{ fontSize: 12 }}
            >
              {step === STEPS.length - 1 ? (
                submitPreferences.isPending
                  ? 'SAVING…'
                  : <><Check size={13} /> SUBMIT</>
              ) : (
                <>NEXT <ArrowRight size={13} /></>
              )}
            </button>
          </div>
        </div>
      </div>

    </DocContainer>
  )
}

/* ─── Step 1: Who ─────────────────────────────────────────────────────────── */

function StepWho({
  prefs,
  update,
}: {
  prefs: TravelPreferences
  update: <K extends keyof TravelPreferences>(k: K, v: TravelPreferences[K]) => void
}) {
  return (
    <div className="flex flex-col gap-7">
      <FormField label="Traveling as">
        <div
          style={{
            fontFamily: 'var(--font-body)', fontSize: 14,
            color: 'var(--color-ink-2)',
            background: 'var(--color-surface-2)',
            border: '2.5px solid var(--border-soft)',
            padding: '11px 14px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}
        >
          <span>{prefs.travelerName}</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.15em', color: 'var(--color-ink-3)' }}>
            LOCKED
          </span>
        </div>
      </FormField>

      <FormField label="Flying from" hint="Enter your city or town — we'll find nearby airports">
        <AirportPicker
          cityLabel={prefs.originCity}
          selectedIatas={prefs.originAirports}
          onCityLabel={v => update('originCity', v)}
          onSelectedIatas={v => update('originAirports', v)}
        />
      </FormField>

      <div className="grid grid-cols-2 gap-6">
        <FormField label="Adults">
          <Counter value={prefs.adults} onChange={v => update('adults', v)} min={1} />
        </FormField>
        <FormField label="Children">
          <Counter value={prefs.kids} onChange={v => update('kids', v)} />
        </FormField>
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
    <div className="flex flex-col gap-7">
      <div className="grid grid-cols-2 gap-6">
        <FormField label="Earliest departure">
          <TextInput
            type="date"
            value={prefs.earliestDeparture}
            onChange={e => update('earliestDeparture', e.target.value)}
          />
        </FormField>
        <FormField label="Latest return">
          <TextInput
            type="date"
            value={prefs.latestReturn}
            onChange={e => update('latestReturn', e.target.value)}
          />
        </FormField>
      </div>

      <Toggle
        checked={prefs.flexibleDates}
        onChange={v => update('flexibleDates', v)}
        label="My dates are flexible — show me deals nearby"
      />

      <FormField label="Trip length (nights)" hint={`${prefs.tripDurationMin}–${prefs.tripDurationMax} nights`}>
        <div className="flex items-center gap-4">
          <div className="flex flex-col gap-1 flex-1">
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-ink-3)', letterSpacing: '0.1em' }}>MIN</span>
            <Counter value={prefs.tripDurationMin} onChange={v => update('tripDurationMin', Math.min(v, prefs.tripDurationMax))} min={1} max={30} />
          </div>
          <span style={{ color: 'var(--color-ink-3)', marginTop: 20 }}>—</span>
          <div className="flex flex-col gap-1 flex-1">
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-ink-3)', letterSpacing: '0.1em' }}>MAX</span>
            <Counter value={prefs.tripDurationMax} onChange={v => update('tripDurationMax', Math.max(v, prefs.tripDurationMin))} min={1} max={30} />
          </div>
        </div>
      </FormField>
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
  return (
    <div className="flex flex-col gap-7">
      <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--color-ink-2)', lineHeight: 1.65 }}>
        Budget per person, covering flights and accommodation. Activities and food are extra.
      </p>

      <FormField label="Currency">
        <Select value={prefs.currency} onChange={e => update('currency', e.target.value)}>
          {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
        </Select>
      </FormField>

      <div className="grid grid-cols-2 gap-6">
        <FormField label={`Minimum (${prefs.currency})`}>
          <TextInput
            type="number"
            value={String(prefs.budgetMin)}
            onChange={e => update('budgetMin', Number(e.target.value))}
            placeholder="500"
          />
        </FormField>
        <FormField label={`Maximum (${prefs.currency})`}>
          <TextInput
            type="number"
            value={String(prefs.budgetMax)}
            onChange={e => update('budgetMax', Number(e.target.value))}
            placeholder="3000"
          />
        </FormField>
      </div>

      {/* Budget range bar */}
      <div>
        <div style={{ height: 5, background: 'var(--border-soft)', position: 'relative' }}>
          <div
            style={{
              position: 'absolute',
              left: `${Math.min((prefs.budgetMin / 10000) * 100, 95)}%`,
              right: `${Math.max(100 - (prefs.budgetMax / 10000) * 100, 2)}%`,
              height: '100%',
              background: 'var(--color-ink)',
              transition: 'left 0.2s, right 0.2s',
            }}
          />
        </div>
        <div className="flex justify-between mt-2">
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-ink-2)' }}>
            {prefs.currency} {prefs.budgetMin.toLocaleString()}
          </span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-ink-2)' }}>
            {prefs.currency} {prefs.budgetMax.toLocaleString()}
          </span>
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
    <div className="flex flex-col gap-8">
      <FormField label="Activities you enjoy" hint="Pick everything that applies">
        <div className="grid grid-cols-3 gap-2 mt-1">
          {ACTIVITY_OPTIONS.map(({ id, label, emoji }) => {
            const selected = prefs.activities.includes(id)
            return (
              <button
                key={id}
                type="button"
                onClick={() => toggleActivity(id)}
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 12,
                  padding: '10px 8px',
                  border: '2.5px solid var(--color-ink)',
                  background: selected ? 'var(--color-ink)' : 'var(--color-bg)',
                  color: selected ? 'var(--color-bg)' : 'var(--color-ink-2)',
                  cursor: 'pointer',
                  transition: 'background 120ms ease, color 120ms ease',
                  textAlign: 'center',
                  lineHeight: 1.4,
                }}
              >
                <div style={{ fontSize: 18, marginBottom: 4 }}>{emoji}</div>
                {label}
              </button>
            )
          })}
        </div>
      </FormField>

      <FormField label="Accommodation style">
        <div className="flex flex-col gap-2 mt-1">
          {ACCOMMODATION_OPTIONS.map(({ id, label }) => {
            const selected = prefs.accommodationTypes.includes(id)
            return (
              <button
                key={id}
                type="button"
                onClick={() => toggleAccommodation(id)}
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 13,
                  padding: '12px 16px',
                  border: '2.5px solid var(--color-ink)',
                  background: selected ? 'var(--color-ink)' : 'var(--color-bg)',
                  color: selected ? 'var(--color-bg)' : 'var(--color-ink-2)',
                  cursor: 'pointer',
                  transition: 'background 120ms ease, color 120ms ease',
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                {label}
                {selected && (
                  <svg width="12" height="9" viewBox="0 0 12 9" fill="none">
                    <path d="M1 4L4.5 7.5L11 1" stroke="var(--color-bg)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>
            )
          })}
        </div>
      </FormField>
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
    <div className="flex flex-col gap-7">
      <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--color-ink-2)', lineHeight: 1.7 }}>
        Anything that would make or break the trip? Dietary needs, accessibility requirements,
        passport restrictions, or simply things you absolutely won't do.
      </p>

      <FormField label="Special requirements or notes">
        <textarea
          value={prefs.specialRequirements}
          onChange={e => update('specialRequirements', e.target.value)}
          placeholder="e.g. Travelling with a toddler so need direct flights. Vegetarian. No extreme heat."
          rows={5}
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 14,
            color: 'var(--color-ink)',
            background: 'var(--color-bg)',
            border: '2.5px solid var(--color-ink)',
            padding: '12px 14px',
            outline: 'none',
            width: '100%',
            resize: 'vertical',
            lineHeight: 1.7,
            transition: 'box-shadow 150ms ease',
          }}
          onFocus={e => { e.currentTarget.style.boxShadow = '4px 4px 0 var(--color-ink)' }}
          onBlur={e => { e.currentTarget.style.boxShadow = 'none' }}
        />
      </FormField>

      {/* Summary */}
      <div style={{ borderTop: '2.5px solid var(--border-soft)', paddingTop: 20 }}>
        <p className="brut-label" style={{ marginBottom: 14 }}>YOUR SUBMISSION</p>
        <div className="flex flex-col gap-2">
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
              className="flex justify-between"
              style={{ borderBottom: '1.5px solid var(--border-soft)', paddingBottom: 8 }}
            >
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-ink-3)', letterSpacing: '0.1em' }}>{k}</span>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--color-ink)', fontWeight: 500 }}>{v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
