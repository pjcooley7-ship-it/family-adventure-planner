import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { ArrowLeft, ArrowRight, Check } from 'lucide-react'
import { StepIndicator } from '@/components/StepIndicator'
import { FormField, TextInput, Counter, Toggle, Select } from '@/components/FormField'
import { useSubmitPreferences } from '@/hooks/useTripMutations'
import { useTripMembers, useMyPreferences } from '@/hooks/useTrip'
import { useAuth } from '@/hooks/useAuth'
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

  // Derive display name from member record — not editable
  const myMember = members.find(m => m.user_id === user?.id)
  const displayName = myMember?.display_name ?? ''

  // Pre-fill form from existing preferences (edit flow) or member name (first time)
  useEffect(() => {
    if (existingPrefs) {
      setPrefs({
        travelerName:        existingPrefs.traveler_name,
        originCity:          existingPrefs.origin_city,
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
      if (!prefs.originCity.trim()) { toast.error('Please enter your origin city'); return false }
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
      handleSubmit()
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

  function handleSubmit() {
    submitPreferences.mutate(prefs)
  }

  return (
    <div className="min-h-screen topo-curves flex flex-col" style={{ background: '#060d1f' }}>
      {/* Nav */}
      <nav className="flex items-center px-8 py-6" style={{ borderBottom: '1px solid rgba(201,149,42,0.1)' }}>
        <button
          onClick={goBack}
          className="flex items-center gap-2 text-sm tracking-widest opacity-50 hover:opacity-100 transition-opacity"
          style={{ fontFamily: 'var(--font-body)', color: '#f2eadb', background: 'none', border: 'none', cursor: 'pointer' }}
        >
          <ArrowLeft size={14} />
          BACK
        </button>
        <span
          className="mx-auto font-display text-xl tracking-widest"
          style={{ color: '#c9952a', letterSpacing: '0.2em', fontFamily: 'var(--font-display)' }}
        >
          WANDERLUST
        </span>
        <div style={{ width: 60 }} />
      </nav>

      {/* Form container */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div
          style={{
            width: '100%',
            maxWidth: 600,
            border: '1px solid rgba(201,149,42,0.2)',
            background: 'rgba(13,24,48,0.7)',
            padding: '48px',
            backdropFilter: 'blur(8px)',
          }}
        >
          {/* Header */}
          <div className="text-center mb-10">
            <p
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: 10,
                letterSpacing: '0.3em',
                color: 'rgba(201,149,42,0.6)',
                marginBottom: 8,
              }}
            >
              TRIP · {String(tripId).toUpperCase()}
            </p>
            <h1
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(1.8rem, 4vw, 2.6rem)',
                fontWeight: 300,
                color: '#f2eadb',
                lineHeight: 1.1,
              }}
            >
              Your travel <em style={{ color: '#c9952a' }}>preferences</em>
            </h1>
          </div>

          <StepIndicator steps={STEPS} current={step} />

          {/* Step content */}
          <div
            style={{
              opacity: animating ? 0 : 1,
              transform: animating ? 'translateY(8px)' : 'translateY(0)',
              transition: 'opacity 0.15s, transform 0.15s',
            }}
          >
            {step === 0 && <StepWho prefs={prefs} update={update} displayName={displayName} />}
            {step === 1 && <StepWhen prefs={prefs} update={update} />}
            {step === 2 && <StepBudget prefs={prefs} update={update} />}
            {step === 3 && <StepInterests prefs={prefs} toggleActivity={toggleActivity} toggleAccommodation={toggleAccommodation} />}
            {step === 4 && <StepNotes prefs={prefs} update={update} />}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-10">
            <button
              onClick={goBack}
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: 12,
                letterSpacing: '0.15em',
                color: 'rgba(242,234,219,0.4)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '12px 0',
              }}
            >
              {step === 0 ? 'CANCEL' : '← BACK'}
            </button>

            <button
              onClick={goNext}
              className="flex items-center gap-3"
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: 12,
                letterSpacing: '0.15em',
                color: '#060d1f',
                background: '#c9952a',
                border: 'none',
                cursor: 'pointer',
                padding: '14px 32px',
                transition: 'background 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#e8b84b' }}
              onMouseLeave={e => { e.currentTarget.style.background = '#c9952a' }}
            >
              {step === STEPS.length - 1 ? (
                submitPreferences.isPending
                  ? 'SAVING...'
                  : <><Check size={14} /> SUBMIT</>
              ) : (
                <>NEXT <ArrowRight size={14} /></>
              )}
            </button>
          </div>
        </div>

        {/* Step count */}
        <p
          style={{
            marginTop: 20,
            fontFamily: 'var(--font-body)',
            fontSize: 11,
            letterSpacing: '0.15em',
            color: 'rgba(201,149,42,0.3)',
          }}
        >
          {step + 1} of {STEPS.length}
        </p>
      </div>
    </div>
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
    <div className="flex flex-col gap-7">
      <FormField label="Traveling as">
        <div
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 15,
            color: '#f2eadb',
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(201,149,42,0.15)',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span>{prefs.travelerName}</span>
          <span style={{ fontSize: 10, letterSpacing: '0.15em', color: 'rgba(201,149,42,0.4)' }}>LOCKED</span>
        </div>
      </FormField>

      <FormField label="Flying from" hint="City or airport you'll depart from">
        <TextInput
          value={prefs.originCity}
          onChange={e => update('originCity', e.target.value)}
          placeholder="e.g. New York, JFK"
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
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'rgba(242,234,219,0.4)', letterSpacing: '0.1em' }}>MIN</span>
            <Counter value={prefs.tripDurationMin} onChange={v => update('tripDurationMin', Math.min(v, prefs.tripDurationMax))} min={1} max={30} />
          </div>
          <span style={{ color: 'rgba(201,149,42,0.4)', marginTop: 20 }}>—</span>
          <div className="flex flex-col gap-1 flex-1">
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'rgba(242,234,219,0.4)', letterSpacing: '0.1em' }}>MAX</span>
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
      <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'rgba(242,234,219,0.45)', lineHeight: 1.6 }}>
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

      {/* Budget visual indicator */}
      <div>
        <div style={{ height: 4, background: 'rgba(201,149,42,0.1)', borderRadius: 2, position: 'relative' }}>
          <div
            style={{
              position: 'absolute',
              left: `${Math.min((prefs.budgetMin / 10000) * 100, 95)}%`,
              right: `${Math.max(100 - (prefs.budgetMax / 10000) * 100, 2)}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #c9952a, #e8b84b)',
              borderRadius: 2,
              transition: 'left 0.2s, right 0.2s',
            }}
          />
        </div>
        <div className="flex justify-between mt-2">
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'rgba(201,149,42,0.6)' }}>
            {prefs.currency} {prefs.budgetMin.toLocaleString()}
          </span>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'rgba(201,149,42,0.6)' }}>
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
                  border: selected ? '1px solid #c9952a' : '1px solid rgba(201,149,42,0.2)',
                  background: selected ? 'rgba(201,149,42,0.12)' : 'rgba(255,255,255,0.02)',
                  color: selected ? '#f2eadb' : 'rgba(242,234,219,0.5)',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  textAlign: 'center',
                  lineHeight: 1.4,
                }}
                onMouseEnter={e => { if (!selected) e.currentTarget.style.borderColor = 'rgba(201,149,42,0.45)' }}
                onMouseLeave={e => { if (!selected) e.currentTarget.style.borderColor = 'rgba(201,149,42,0.2)' }}
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
                  border: selected ? '1px solid #c9952a' : '1px solid rgba(201,149,42,0.2)',
                  background: selected ? 'rgba(201,149,42,0.1)' : 'rgba(255,255,255,0.02)',
                  color: selected ? '#f2eadb' : 'rgba(242,234,219,0.5)',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                {label}
                {selected && (
                  <svg width="12" height="9" viewBox="0 0 12 9" fill="none">
                    <path d="M1 4L4.5 7.5L11 1" stroke="#c9952a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
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
      <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'rgba(242,234,219,0.45)', lineHeight: 1.7 }}>
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
            color: '#f2eadb',
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(201,149,42,0.25)',
            padding: '14px 16px',
            outline: 'none',
            width: '100%',
            resize: 'vertical',
            lineHeight: 1.7,
            colorScheme: 'dark',
          }}
          onFocus={e => { e.currentTarget.style.borderColor = 'rgba(201,149,42,0.7)' }}
          onBlur={e => { e.currentTarget.style.borderColor = 'rgba(201,149,42,0.25)' }}
        />
      </FormField>

      {/* Summary */}
      <div style={{ borderTop: '1px solid rgba(201,149,42,0.12)', paddingTop: 20 }}>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 10, letterSpacing: '0.2em', color: 'rgba(201,149,42,0.5)', marginBottom: 12 }}>
          YOUR SUBMISSION
        </p>
        <div className="flex flex-col gap-2">
          {[
            [`Traveler`, prefs.travelerName || '—'],
            [`From`, prefs.originCity || '—'],
            [`Party`, `${prefs.adults} adult${prefs.adults !== 1 ? 's' : ''}${prefs.kids > 0 ? `, ${prefs.kids} child${prefs.kids !== 1 ? 'ren' : ''}` : ''}`],
            [`Dates`, prefs.earliestDeparture ? `${prefs.earliestDeparture} → ${prefs.latestReturn}` : '—'],
            [`Budget`, prefs.budgetMin ? `${prefs.currency} ${prefs.budgetMin.toLocaleString()}–${prefs.budgetMax.toLocaleString()} pp` : '—'],
            [`Interests`, prefs.activities.length > 0 ? `${prefs.activities.length} selected` : '—'],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between">
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'rgba(242,234,219,0.35)' }}>{k}</span>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'rgba(242,234,219,0.7)' }}>{v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
