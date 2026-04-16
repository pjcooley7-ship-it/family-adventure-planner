import { useState } from 'react'
import { X } from 'lucide-react'
import { useCreateTrip } from '@/hooks/useTripMutations'
import { useAuth } from '@/hooks/useAuth'

interface CreateTripModalProps {
  onClose: () => void
}

export function CreateTripModal({ onClose }: CreateTripModalProps) {
  const { user } = useAuth()
  const createTrip = useCreateTrip()
  const [tripName, setTripName] = useState('')
  const [displayName, setDisplayName] = useState(
    (user?.user_metadata?.display_name as string) ?? ''
  )

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!tripName.trim() || !displayName.trim()) return
    createTrip.mutate({ name: tripName.trim(), displayName: displayName.trim() })
  }

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 px-4"
      style={{ background: 'rgba(26,26,26,0.6)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="w-full animate-fade-up"
        style={{
          maxWidth: 460,
          background: 'var(--color-bg)',
          border: '2.5px solid var(--color-ink)',
          boxShadow: '6px 6px 0 var(--color-ink)',
          padding: '36px',
        }}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-7">
          <div>
            <p className="brut-label mb-1">NEW TRIP</p>
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.6rem',
                fontWeight: 600,
                color: 'var(--color-ink)',
                lineHeight: 1.15,
                letterSpacing: '-0.4px',
              }}
            >
              Create a trip
            </h2>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--color-ink-2)', marginTop: 4 }}>
              You'll get a code to share with your party.
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--color-ink-2)', padding: 4,
            }}
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <Field label="Trip name">
            <input
              type="text"
              value={tripName}
              onChange={e => setTripName(e.target.value)}
              placeholder="e.g. Summer Family Reunion"
              required
              autoFocus
              style={inputStyle}
              onFocus={e => { e.currentTarget.style.boxShadow = '4px 4px 0 var(--color-ink)' }}
              onBlur={e => { e.currentTarget.style.boxShadow = 'none' }}
            />
          </Field>

          <Field label="Your name in this trip">
            <input
              type="text"
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              placeholder="e.g. Sarah"
              required
              style={inputStyle}
              onFocus={e => { e.currentTarget.style.boxShadow = '4px 4px 0 var(--color-ink)' }}
              onBlur={e => { e.currentTarget.style.boxShadow = 'none' }}
            />
          </Field>

          <div className="flex gap-3 mt-1">
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase',
                color: 'var(--color-ink-2)', background: 'transparent',
                border: '2.5px solid var(--border-soft)', cursor: 'pointer', padding: '12px',
              }}
            >
              CANCEL
            </button>
            <button
              type="submit"
              disabled={createTrip.isPending}
              className="brut-btn-primary"
              style={{ flex: 2, justifyContent: 'center', fontSize: 13 }}
            >
              {createTrip.isPending ? 'CREATING...' : 'CREATE TRIP'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label style={{
        fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.1em',
        color: 'var(--color-ink-2)', textTransform: 'uppercase',
      }}>
        {label}
      </label>
      {children}
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)', fontSize: 15,
  color: 'var(--color-ink)', background: 'var(--color-bg)',
  border: '2.5px solid var(--color-ink)', padding: '12px 14px',
  outline: 'none', width: '100%', transition: 'box-shadow 150ms ease',
}
