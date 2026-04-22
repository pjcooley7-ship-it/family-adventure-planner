import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FlightPathMap } from '@/components/FlightPathMap'
import { CreateTripModal } from '@/components/CreateTripModal'
import { DocContainer } from '@/components/DocContainer'
import { useAuth } from '@/hooks/useAuth'
import { useMyTrips } from '@/hooks/useTrip'
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Trip = any

function Wordmark() {
  return (
    <span style={{ fontFamily: 'var(--f-display)', fontSize: 17, fontWeight: 500, letterSpacing: '-0.02em', color: 'var(--ink)' }}>
      wanderlust<span style={{ color: 'var(--coral)' }}>.</span>
    </span>
  )
}

export default function LandingPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [joinCode, setJoinCode] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const { data: myTrips = [] } = useMyTrips(user?.id)

  function handleCreate() {
    if (!user) { navigate('/auth'); return }
    setShowCreateModal(true)
  }

  function handleJoin(e: React.FormEvent) {
    e.preventDefault()
    const code = joinCode.trim().toUpperCase()
    if (!code) return
    if (!user) {
      sessionStorage.setItem('pendingJoinCode', code)
      navigate('/auth')
      return
    }
    navigate(`/join/${code}`)
  }

  function handleSignOut() {
    import('@/integrations/supabase/client').then(({ supabase }) => { supabase.auth.signOut() })
  }

  return (
    <>
      {showCreateModal && <CreateTripModal onClose={() => setShowCreateModal(false)} />}
      <DocContainer>

        {/* Nav */}
        <nav style={{
          padding: '18px 24px',
          borderBottom: '1px solid var(--hairline)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'var(--paper)',
        }}>
          <Wordmark />
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {user ? (
              <button className="btn-text" onClick={handleSignOut}>SIGN OUT</button>
            ) : (
              <button className="btn-text" onClick={() => navigate('/auth')}>SIGN IN</button>
            )}
            <button
              className="btn-ghost"
              style={{ padding: '7px 14px', fontSize: 12 }}
              onClick={handleCreate}
            >
              CREATE TRIP
            </button>
          </div>
        </nav>

        {/* Hero */}
        <section style={{ padding: '40px 28px 32px' }}>
          <p className="eyebrow animate-fade-up" style={{ marginBottom: 18 }}>GROUP TRIP PLANNER</p>
          <h1 className="display animate-fade-up delay-100" style={{ fontSize: 'clamp(2.6rem, 8vw, 3.2rem)', marginBottom: 18, color: 'var(--ink)' }}>
            Where should<br />we all <em style={{ fontStyle: 'italic', color: 'var(--coral)' }}>meet?</em>
          </h1>
          <p className="animate-fade-up delay-200" style={{ fontSize: 15, color: 'var(--ink-2)', lineHeight: 1.55, marginBottom: 28, maxWidth: 360 }}>
            Everyone submits where they're flying from, budget, and what they love doing.
            AI finds the destination that works for all of you.
          </p>

          {/* Primary CTA */}
          <button
            className="btn-primary coral animate-fade-up delay-300"
            style={{ fontSize: 15, padding: '14px 26px', width: '100%', justifyContent: 'center', marginBottom: 14 }}
            onClick={handleCreate}
          >
            Start a trip →
          </button>

          {/* Join code — demoted */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 0 16px' }}>
            <span className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', letterSpacing: '0.1em', whiteSpace: 'nowrap' }}>OR JOIN WITH CODE</span>
            <div style={{ flex: 1, height: 1, background: 'var(--hairline)' }} />
          </div>
          <form onSubmit={handleJoin} style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
            <input
              value={joinCode}
              onChange={e => setJoinCode(e.target.value.toUpperCase())}
              placeholder="ABCD12"
              maxLength={8}
              style={{
                flex: 1, background: 'var(--paper)', color: 'var(--ink)',
                border: 'none', borderBottom: '1.5px solid var(--ink-4)',
                fontFamily: 'var(--f-mono)', fontSize: 18, letterSpacing: '0.15em',
                textTransform: 'uppercase', padding: '6px 2px', outline: 'none',
                transition: 'border-color 160ms',
              }}
              onFocus={e => { e.currentTarget.style.borderBottomColor = 'var(--ink)' }}
              onBlur={e => { e.currentTarget.style.borderBottomColor = 'var(--ink-4)' }}
            />
            <button type="submit" className="btn-text">JOIN →</button>
          </form>
        </section>

        {/* Map band */}
        <div style={{ borderTop: '1px solid var(--hairline)', position: 'relative', overflow: 'hidden', background: 'var(--paper-3)' }}>
          <FlightPathMap />
        </div>

        {/* My Trips */}
        {user && myTrips.length > 0 && (
          <section style={{ padding: '28px 28px' }}>
            <p className="eyebrow" style={{ marginBottom: 12 }}>YOUR TRIPS</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {myTrips.map((trip, i) => (
                <TripRow
                  key={trip.id}
                  trip={trip}
                  onClick={() => navigate(`/trip/${trip.id}`)}
                  delay={i * 80}
                />
              ))}
            </div>
          </section>
        )}

        {/* Footer */}
        <footer style={{
          borderTop: '1px solid var(--hairline)',
          padding: '16px 28px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <Wordmark />
          <span className="mono" style={{ fontSize: 9, letterSpacing: '0.12em', color: 'var(--ink-3)', textTransform: 'uppercase' }}>
            Find your common ground
          </span>
        </footer>

      </DocContainer>
    </>
  )
}

/* ─── Trip row ────────────────────────────────────────────────────────────── */

const STATUS_LABEL: Record<string, string> = {
  collecting: 'COLLECTING',
  matching:   'MATCHING',
  matched:    'MATCHED',
}

function TripRow({ trip, onClick, delay }: { trip: Trip; onClick: () => void; delay: number }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 16px', width: '100%', textAlign: 'left', cursor: 'pointer',
        background: 'var(--paper)', border: '1.5px solid var(--hairline)', borderRadius: 12,
        animationDelay: `${delay}ms`,
        transition: 'border-color 150ms, background 150ms',
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--ink)'; e.currentTarget.style.background = 'var(--paper-2)' }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--hairline)'; e.currentTarget.style.background = 'var(--paper)' }}
    >
      <div>
        <p style={{ fontFamily: 'var(--f-display)', fontSize: 16, fontWeight: 500, color: 'var(--ink)', letterSpacing: '-0.02em' }}>
          {trip.name}
        </p>
        <p className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', marginTop: 2, letterSpacing: '0.08em' }}>
          {trip.code}
        </p>
      </div>
      <span
        className={trip.status === 'matched' ? 'chip-new green' : 'chip-new'}
        style={{ flexShrink: 0 }}
      >
        {STATUS_LABEL[trip.status] ?? trip.status.toUpperCase()}
      </span>
    </button>
  )
}
