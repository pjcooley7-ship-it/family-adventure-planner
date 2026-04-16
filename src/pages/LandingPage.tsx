import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FlightPathMap } from '@/components/FlightPathMap'
import { CreateTripModal } from '@/components/CreateTripModal'
import { DocContainer } from '@/components/DocContainer'
import { useAuth } from '@/hooks/useAuth'
import { useMyTrips } from '@/hooks/useTrip'
import { ArrowRight, Globe, Users, Sparkles } from 'lucide-react'
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Trip = any

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
          padding: '20px 32px',
          borderBottom: '2.5px solid var(--color-ink)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 600, color: 'var(--color-ink)', letterSpacing: '-0.3px' }}>
            Wanderlust
          </span>
          <div className="flex items-center gap-3">
            {user ? (
              <button
                onClick={handleSignOut}
                style={{
                  fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase',
                  color: 'var(--color-ink-2)', background: 'none', border: 'none', cursor: 'pointer',
                }}
              >
                SIGN OUT
              </button>
            ) : (
              <button
                onClick={() => navigate('/auth')}
                style={{
                  fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase',
                  color: 'var(--color-ink-2)', background: 'none', border: 'none', cursor: 'pointer',
                }}
              >
                SIGN IN
              </button>
            )}
            <button onClick={handleCreate} className="brut-btn-ghost" style={{ padding: '8px 14px' }}>
              CREATE TRIP
            </button>
          </div>
        </nav>

        {/* Hero */}
        <section style={{ padding: '48px 32px 40px', borderBottom: '2.5px solid var(--color-ink)' }}>
          <p className="brut-label animate-fade-up" style={{ marginBottom: 14 }}>
            GROUP TRIP PLANNER
          </p>
          <h1
            className="animate-fade-up delay-100"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(2.2rem, 7vw, 3.2rem)',
              fontWeight: 600,
              color: 'var(--color-ink)',
              letterSpacing: '-0.7px',
              lineHeight: 1.1,
              marginBottom: 16,
            }}
          >
            Where should we<br />all meet?
          </h1>
          <p
            className="animate-fade-up delay-200"
            style={{
              fontFamily: 'var(--font-body)', fontSize: 15, fontWeight: 400,
              color: 'var(--color-ink-2)', lineHeight: 1.65,
              maxWidth: 480, marginBottom: 28,
            }}
          >
            Everyone submits where they're flying from, what they can spend,
            and what they love doing. AI finds the destination that works for all of you.
          </p>

          {/* CTAs */}
          <div className="animate-fade-up delay-300 flex flex-col sm:flex-row items-start gap-3">
            <button onClick={handleCreate} className="brut-btn-primary" style={{ fontSize: 14, padding: '11px 20px' }}>
              Start a trip <ArrowRight size={15} />
            </button>

            <form onSubmit={handleJoin} style={{ display: 'flex' }}>
              <input
                value={joinCode}
                onChange={e => setJoinCode(e.target.value)}
                placeholder="Enter trip code…"
                style={{
                  fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--color-ink)',
                  background: 'var(--color-bg)', border: '2.5px solid var(--color-ink)', borderRight: 'none',
                  padding: '11px 14px', outline: 'none', width: 180,
                  transition: 'box-shadow 150ms ease',
                }}
                onFocus={e => { e.currentTarget.style.boxShadow = '4px 4px 0 var(--color-ink)' }}
                onBlur={e => { e.currentTarget.style.boxShadow = 'none' }}
              />
              <button
                type="submit"
                className="brut-btn-ghost"
                style={{ borderLeft: 'none', fontSize: 11, padding: '11px 16px' }}
              >
                JOIN
              </button>
            </form>
          </div>
        </section>

        {/* Map */}
        <section
          className="animate-fade-in delay-500"
          style={{ background: 'var(--color-surface-2)', borderBottom: '2.5px solid var(--color-ink)', padding: '0' }}
        >
          <FlightPathMap />
        </section>

        {/* My Trips */}
        {user && myTrips.length > 0 && (
          <section style={{ padding: '28px 32px', borderBottom: '2.5px solid var(--color-ink)' }}>
            <p className="brut-label" style={{ marginBottom: 12 }}>YOUR TRIPS</p>
            <div className="flex flex-col gap-2">
              {myTrips.map((trip, i) => (
                <TripRow
                  key={trip.id}
                  trip={trip}
                  onClick={() => navigate(`/trip/${trip.id}`)}
                  delay={i * 100}
                />
              ))}
            </div>
          </section>
        )}

        {/* How it works */}
        <section style={{ padding: '36px 32px' }}>
          <p className="brut-label" style={{ marginBottom: 20 }}>HOW IT WORKS</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 8 }}>
            {[
              { icon: <Globe size={18} />, step: '01', title: 'Create a trip', body: "Start a group trip and share the invite code with your travel party." },
              { icon: <Users size={18} />, step: '02', title: 'Everyone submits', body: "Each person shares their origin city, dates, budget, and activity preferences." },
              { icon: <Sparkles size={18} />, step: '03', title: 'AI finds the match', body: "We analyze all submissions and surface the best-fit destinations for your group." },
            ].map(({ icon, step, title, body }, i) => (
              <div
                key={step}
                className="animate-fade-up brut-card"
                style={{
                  padding: '20px',
                  animationDelay: `${i * 100}ms`,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
                  <span style={{ color: 'var(--color-ink-2)' }}>{icon}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 28, fontWeight: 700, color: 'rgba(26,26,26,0.07)', lineHeight: 1 }}>{step}</span>
                </div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 600, color: 'var(--color-ink)', marginBottom: 8, letterSpacing: '-0.2px' }}>
                  {title}
                </h3>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--color-ink-2)', lineHeight: 1.6 }}>
                  {body}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer style={{
          borderTop: '2.5px solid var(--color-ink)',
          padding: '16px 32px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 600, color: 'var(--color-ink)' }}>
            Wanderlust
          </span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.1em', color: 'var(--color-ink-3)', textTransform: 'uppercase' }}>
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
      className="flex items-center justify-between px-4 py-3 w-full text-left brut-card"
      style={{
        animationDelay: `${delay}ms`,
        cursor: 'pointer',
      }}
    >
      <div>
        <p style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 600, color: 'var(--color-ink)', letterSpacing: '-0.2px' }}>
          {trip.name}
        </p>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-ink-3)', marginTop: 2, letterSpacing: '0.06em' }}>
          {trip.code}
        </p>
      </div>
      <span
        className={trip.status === 'matched' ? 'badge-positive' : 'badge-neutral'}
        style={{ flexShrink: 0 }}
      >
        {STATUS_LABEL[trip.status] ?? trip.status.toUpperCase()}
      </span>
    </button>
  )
}
