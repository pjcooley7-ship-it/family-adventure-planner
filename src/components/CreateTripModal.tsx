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
      style={{ background: 'rgba(6,13,31,0.85)', backdropFilter: 'blur(4px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="w-full animate-fade-up"
        style={{
          maxWidth: 460,
          background: '#0d1830',
          border: '1px solid rgba(201,149,42,0.3)',
          padding: '40px',
        }}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '2rem',
                fontWeight: 300,
                color: '#f2eadb',
                lineHeight: 1.1,
              }}
            >
              New trip
            </h2>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'rgba(242,234,219,0.4)', marginTop: 4 }}>
              You'll get an invite code to share with your party.
            </p>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(242,234,219,0.3)', padding: 4 }}
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Trip name */}
          <div className="flex flex-col gap-2">
            <label style={labelStyle}>Trip name</label>
            <input
              type="text"
              value={tripName}
              onChange={e => setTripName(e.target.value)}
              placeholder="e.g. Summer Family Reunion"
              required
              autoFocus
              style={inputStyle}
              onFocus={e => { e.currentTarget.style.borderColor = 'rgba(201,149,42,0.7)' }}
              onBlur={e => { e.currentTarget.style.borderColor = 'rgba(201,149,42,0.25)' }}
            />
          </div>

          {/* Your name */}
          <div className="flex flex-col gap-2">
            <label style={labelStyle}>Your name in this trip</label>
            <input
              type="text"
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              placeholder="e.g. Sarah"
              required
              style={inputStyle}
              onFocus={e => { e.currentTarget.style.borderColor = 'rgba(201,149,42,0.7)' }}
              onBlur={e => { e.currentTarget.style.borderColor = 'rgba(201,149,42,0.25)' }}
            />
          </div>

          <div className="flex gap-3 mt-2">
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                fontFamily: 'var(--font-body)',
                fontSize: 12,
                letterSpacing: '0.15em',
                color: 'rgba(242,234,219,0.4)',
                background: 'none',
                border: '1px solid rgba(201,149,42,0.15)',
                cursor: 'pointer',
                padding: '14px',
              }}
            >
              CANCEL
            </button>
            <button
              type="submit"
              disabled={createTrip.isPending}
              style={{
                flex: 2,
                fontFamily: 'var(--font-body)',
                fontSize: 12,
                letterSpacing: '0.15em',
                color: '#060d1f',
                background: createTrip.isPending ? 'rgba(201,149,42,0.5)' : '#c9952a',
                border: 'none',
                cursor: createTrip.isPending ? 'not-allowed' : 'pointer',
                padding: '14px',
                transition: 'background 0.2s',
              }}
              onMouseEnter={e => { if (!createTrip.isPending) e.currentTarget.style.background = '#e8b84b' }}
              onMouseLeave={e => { if (!createTrip.isPending) e.currentTarget.style.background = '#c9952a' }}
            >
              {createTrip.isPending ? 'CREATING...' : 'CREATE TRIP'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const labelStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: 11,
  letterSpacing: '0.2em',
  color: 'rgba(201,149,42,0.8)',
  textTransform: 'uppercase',
}

const inputStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: 15,
  color: '#f2eadb',
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(201,149,42,0.25)',
  padding: '12px 16px',
  outline: 'none',
  width: '100%',
  colorScheme: 'dark',
  transition: 'border-color 0.2s',
}
