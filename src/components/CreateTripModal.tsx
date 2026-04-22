import { useState } from 'react'
import { useCreateTrip } from '@/hooks/useTripMutations'
import { useAuth } from '@/hooks/useAuth'

const SUGGESTIONS = ['Bach weekend 🥂', 'Family summer ☀️', 'Ski week ⛷️', 'Big 3-0 🎂']

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
      style={{
        position: 'fixed', inset: 0, zIndex: 50,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '0 16px',
        background: 'rgba(26,26,26,0.5)',
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="animate-fade-up"
        style={{
          width: '100%', maxWidth: 460,
          background: 'var(--paper)', borderRadius: 16,
          boxShadow: '0 20px 60px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)',
          border: '1px solid var(--hairline)',
          padding: '28px 24px',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 18 }}>
          <p className="eyebrow eyebrow-ink">NEW TRIP</p>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 22, color: 'var(--ink-3)', lineHeight: 1, padding: '0 2px' }}
          >×</button>
        </div>
        <h2 className="display" style={{ fontSize: 30, marginBottom: 8 }}>
          Name your <em style={{ fontStyle: 'italic', color: 'var(--coral)' }}>trip.</em>
        </h2>
        <p style={{ fontFamily: 'var(--f-sans)', fontSize: 13, color: 'var(--ink-2)', marginBottom: 24 }}>
          Something memorable. You can change it later.
        </p>

        <form onSubmit={handleSubmit}>
          {/* Trip name field */}
          <div style={{ marginBottom: 20 }}>
            <p className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', letterSpacing: '0.15em', marginBottom: 8 }}>TRIP NAME</p>
            <input
              type="text"
              value={tripName}
              onChange={e => setTripName(e.target.value)}
              placeholder="e.g. Cousins' Reunion"
              required
              autoFocus
              className="input-underline"
              style={{ fontSize: 18 }}
            />
          </div>

          {/* Suggestion chips */}
          <p className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', letterSpacing: '0.15em', marginBottom: 8 }}>OR PICK A VIBE</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 24 }}>
            {SUGGESTIONS.map(s => (
              <button
                key={s}
                type="button"
                onClick={() => setTripName(s.replace(/\s[\S]+$/, ''))}
                style={{
                  background: tripName.startsWith(s.replace(/\s[\S]+$/, '')) ? 'var(--ink)' : 'var(--paper-2)',
                  color: tripName.startsWith(s.replace(/\s[\S]+$/, '')) ? 'var(--paper)' : 'var(--ink)',
                  border: '1px solid var(--hairline)', borderRadius: 999,
                  cursor: 'pointer', fontSize: 12, padding: '6px 12px',
                  fontFamily: 'var(--f-sans)',
                  transition: 'background 150ms, color 150ms',
                }}
              >{s}</button>
            ))}
          </div>

          {/* Your name */}
          <div style={{ marginBottom: 28 }}>
            <p className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', letterSpacing: '0.15em', marginBottom: 8 }}>YOUR NAME IN THIS TRIP</p>
            <input
              type="text"
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              placeholder="e.g. Sarah"
              required
              className="input-underline"
              style={{ fontSize: 17 }}
            />
          </div>

          <button
            type="submit"
            disabled={createTrip.isPending || !tripName.trim() || !displayName.trim()}
            className="btn-primary coral"
            style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: 15 }}
          >
            {createTrip.isPending ? 'Creating…' : 'Create & invite →'}
          </button>
          <p className="mono" style={{ textAlign: 'center', fontSize: 10, color: 'var(--ink-3)', marginTop: 12, letterSpacing: '0.08em' }}>
            YOU'LL GET AN INVITE CODE NEXT
          </p>
        </form>
      </div>
    </div>
  )
}
