import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Copy, Check, ArrowRight, Clock, MapPin, Mail } from 'lucide-react'
import { useTrip, useTripMembers, useTripPreferences, useMyPreferences } from '@/hooks/useTrip'
import { useAuth } from '@/hooks/useAuth'
import { DocContainer } from '@/components/DocContainer'

export default function TripPage() {
  const { tripId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [copied, setCopied] = useState(false)

  const { data: trip, isLoading: tripLoading } = useTrip(tripId!)
  const { data: members = [] } = useTripMembers(tripId!)
  const { data: allPreferences = [] } = useTripPreferences(tripId!)
  const { data: myPreferences } = useMyPreferences(tripId!, user?.id)

  const submittedUserIds = new Set(allPreferences.map(p => p.user_id))
  const submitted    = members.filter(m => submittedUserIds.has(m.user_id))
  const pending      = members.filter(m => !submittedUserIds.has(m.user_id))
  const allSubmitted  = members.length > 0 && pending.length === 0
  const enoughToMatch = submitted.length >= 2
  const hasSubmitted  = !!myPreferences

  function copyInvite() {
    navigator.clipboard.writeText(trip?.code ?? '').then(() => {
      setCopied(true)
      toast.success('Trip code copied')
      setTimeout(() => setCopied(false), 2000)
    })
  }

  if (tripLoading) {
    return (
      <DocContainer>
        <div style={{ padding: '80px var(--section-px)', textAlign: 'center' }}>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.15em', color: 'var(--color-ink-3)' }}>
            LOADING…
          </p>
        </div>
      </DocContainer>
    )
  }

  if (!trip) {
    return (
      <DocContainer>
        <div style={{ padding: '80px var(--section-px)', textAlign: 'center' }}>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 600, color: 'var(--color-ink)', marginBottom: 16 }}>
            Trip not found
          </p>
          <button
            onClick={() => navigate('/')}
            style={{
              fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase',
              color: 'var(--color-ink-2)', background: 'none', border: 'none', cursor: 'pointer',
            }}
          >
            ← BACK HOME
          </button>
        </div>
      </DocContainer>
    )
  }

  return (
    <DocContainer>

      {/* Nav */}
      <nav style={{
        padding: '20px var(--section-px)',
        borderBottom: '2.5px solid var(--color-ink)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <button
          onClick={() => navigate('/')}
          style={{
            fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 600,
            color: 'var(--color-ink)', background: 'none', border: 'none', cursor: 'pointer',
            letterSpacing: '-0.3px',
          }}
        >
          Wanderlust
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 7, height: 7,
            background: allSubmitted ? 'var(--color-green)' : enoughToMatch ? 'var(--color-amber)' : 'var(--color-ink-3)',
          }} />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.12em', color: 'var(--color-ink-2)' }}>
            {members.length === 0
              ? 'NO MEMBERS YET'
              : allSubmitted
              ? 'ALL SUBMITTED'
              : `${submitted.length} OF ${members.length} SUBMITTED`}
          </span>
        </div>
      </nav>

      {/* Trip header */}
      <section style={{ padding: '32px var(--section-px) 24px', borderBottom: '2.5px solid var(--color-ink)' }}>
        <p className="brut-label animate-fade-up" style={{ marginBottom: 8 }}>
          TRIP · {trip.code}
        </p>
        <h1
          className="animate-fade-up delay-100"
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(1.8rem, 5vw, 2.6rem)',
            fontWeight: 600,
            color: 'var(--color-ink)',
            lineHeight: 1.1,
            letterSpacing: '-0.5px',
            marginBottom: 6,
          }}
        >
          {trip.name}
        </h1>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-ink-3)', letterSpacing: '0.06em' }}>
          Created {new Date(trip.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </p>
      </section>

      {/* Your action */}
      <section style={{ padding: '24px var(--section-px)', borderBottom: '2.5px solid var(--color-ink)' }}>
        <ActionCard tripId={tripId!} navigate={navigate} hasSubmitted={hasSubmitted} />
      </section>

      {/* Travel party */}
      <section style={{ padding: '24px var(--section-px)', borderBottom: '2.5px solid var(--color-ink)' }}>
        <p className="brut-label" style={{ marginBottom: 14 }}>TRAVEL PARTY</p>
        {members.length === 0 ? (
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--color-ink-2)' }}>
            No one else has joined yet — share the invite code below.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {members.map(member => {
              const pref = allPreferences.find(p => p.user_id === member.user_id)
              return (
                <MemberCard
                  key={member.id}
                  name={member.display_name}
                  originCity={pref?.origin_city ?? null}
                  submitted={submittedUserIds.has(member.user_id)}
                  isYou={member.user_id === user?.id}
                />
              )
            })}
          </div>
        )}
      </section>

      {/* Invite */}
      <section style={{ padding: '24px var(--section-px)', borderBottom: '2.5px solid var(--color-ink)' }}>
        <p className="brut-label" style={{ marginBottom: 12 }}>INVITE YOUR PARTY</p>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--color-ink-2)', marginBottom: 16, lineHeight: 1.6 }}>
          Share this code with everyone joining the trip.
        </p>

        <div style={{
          border: '2.5px solid var(--color-ink)',
          padding: '20px',
          background: 'var(--color-surface-2)',
          textAlign: 'center',
        }}>
          <p className="brut-label" style={{ marginBottom: 8 }}>TRIP CODE</p>
          <p style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 40,
            fontWeight: 700,
            color: 'var(--color-ink)',
            letterSpacing: '0.2em',
            lineHeight: 1,
            marginBottom: 16,
          }}>
            {trip.code}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20 }}>
            <button
              onClick={copyInvite}
              className="flex items-center gap-2"
              style={{
                fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase',
                color: copied ? 'var(--color-green)' : 'var(--color-ink-2)',
                background: 'none', border: 'none', cursor: 'pointer', padding: 0,
              }}
            >
              {copied ? <Check size={12} /> : <Copy size={12} />}
              {copied ? 'COPIED' : 'COPY CODE'}
            </button>
            <span style={{ color: 'var(--color-ink-3)' }}>|</span>
            <a
              href={`mailto:?subject=Join my Wanderlust trip: ${trip.name}&body=Hey!%0A%0AI'm planning a trip and want you to join.%0A%0AUse this code: ${trip.code}%0A%0ASign in at ${window.location.origin} and click "Join a trip".`}
              className="flex items-center gap-2"
              style={{
                fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase',
                color: 'var(--color-ink-2)', textDecoration: 'none',
              }}
            >
              <Mail size={12} />
              EMAIL INVITE
            </a>
          </div>
        </div>
      </section>

      {/* Submission progress */}
      {members.length > 0 && (
        <section style={{ padding: '24px var(--section-px)', borderBottom: '2.5px solid var(--color-ink)' }}>
          <p className="brut-label" style={{ marginBottom: 12 }}>SUBMISSION PROGRESS</p>
          <div style={{ height: 5, background: 'var(--border-soft)', marginBottom: 8 }}>
            <div style={{
              height: '100%',
              width: `${(submitted.length / members.length) * 100}%`,
              background: 'var(--color-green)',
              transition: 'width 0.6s ease',
            }} />
          </div>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-ink-2)', letterSpacing: '0.06em' }}>
            {submitted.length} of {members.length} submitted
          </p>
          {pending.length > 0 && (
            <div style={{ marginTop: 12 }}>
              <p className="brut-label" style={{ marginBottom: 8 }}>WAITING ON</p>
              <div className="flex flex-col gap-1.5">
                {pending.map(m => (
                  <div key={m.id} className="flex items-center gap-2">
                    <Clock size={10} style={{ color: 'var(--color-ink-3)', flexShrink: 0 }} />
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--color-ink-2)' }}>
                      {m.display_name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {/* Find destinations CTA */}
      {enoughToMatch && (
        <section style={{ padding: '24px var(--section-px)', borderBottom: '2.5px solid var(--color-ink)' }}>
          <button
            onClick={() => navigate(`/trip/${tripId}/results`)}
            className="brut-btn-primary"
            style={{ width: '100%', justifyContent: 'center', fontSize: 13 }}
          >
            {allSubmitted ? 'FIND OUR DESTINATION' : 'FIND DESTINATIONS SO FAR'}
            <ArrowRight size={14} />
          </button>
        </section>
      )}

      {/* Footer */}
      <footer style={{
        borderTop: '2.5px solid var(--color-ink)',
        padding: '16px var(--section-px)',
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
  )
}

/* ─── Member card ─────────────────────────────────────────────────────────── */

function MemberCard({ name, originCity, submitted, isYou }: {
  name: string
  originCity: string | null
  submitted: boolean
  isYou: boolean
}) {
  return (
    <div
      className="flex items-center justify-between px-4 py-3"
      style={{
        border: '2.5px solid var(--color-ink)',
        background: 'var(--color-bg)',
      }}
    >
      <div className="flex items-center gap-3">
        <div style={{
          width: 34, height: 34, flexShrink: 0,
          border: '2.5px solid var(--color-ink)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: submitted ? 'var(--color-ink)' : 'transparent',
          fontFamily: 'var(--font-display)',
          fontWeight: 600,
          fontSize: 14,
          color: submitted ? 'var(--color-bg)' : 'var(--color-ink-3)',
        }}>
          {name[0].toUpperCase()}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span style={{ fontFamily: 'var(--font-body)', fontWeight: 500, fontSize: 14, color: 'var(--color-ink)' }}>
              {name}
            </span>
            {isYou && (
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.1em',
                color: 'var(--color-ink-3)', border: '1.5px solid var(--color-ink-3)', padding: '1px 5px',
              }}>
                YOU
              </span>
            )}
          </div>
          {originCity && (
            <div className="flex items-center gap-1 mt-0.5">
              <MapPin size={9} style={{ color: 'var(--color-ink-3)' }} />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-ink-3)' }}>
                {originCity}
              </span>
            </div>
          )}
        </div>
      </div>

      <span className={submitted ? 'badge-positive' : 'badge-neutral'}>
        {submitted ? 'SUBMITTED' : 'PENDING'}
      </span>
    </div>
  )
}

/* ─── Action card ─────────────────────────────────────────────────────────── */

function ActionCard({ tripId, navigate, hasSubmitted }: {
  tripId: string
  navigate: (path: string) => void
  hasSubmitted: boolean
}) {
  if (hasSubmitted) {
    return (
      <div style={{ border: '2.5px solid var(--color-green)', padding: '20px 20px 16px' }}>
        <div className="flex items-center gap-2 mb-2">
          <Check size={14} style={{ color: 'var(--color-green)' }} />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.12em', fontWeight: 700, color: 'var(--color-green)' }}>
            PREFERENCES SAVED
          </span>
        </div>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--color-ink-2)', lineHeight: 1.6 }}>
          Waiting for the rest of your party to submit.
        </p>
        <button
          onClick={() => navigate(`/trip/${tripId}/preferences`)}
          style={{
            marginTop: 12,
            fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase',
            color: 'var(--color-ink-2)', background: 'none', border: 'none', cursor: 'pointer',
            padding: 0, textDecoration: 'underline', textDecorationThickness: '1.5px',
          }}
        >
          EDIT PREFERENCES
        </button>
      </div>
    )
  }

  return (
    <div style={{ border: '2.5px solid var(--color-amber)', padding: '20px 20px 16px' }}>
      <div className="flex items-center gap-2 mb-2">
        <div style={{ width: 7, height: 7, background: 'var(--color-amber)' }} />
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.12em', fontWeight: 700, color: 'var(--color-amber)' }}>
          ACTION NEEDED
        </span>
      </div>
      <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--color-ink-2)', lineHeight: 1.6, marginBottom: 14 }}>
        You haven't submitted your travel preferences yet.
      </p>
      <button
        onClick={() => navigate(`/trip/${tripId}/preferences`)}
        className="brut-btn-primary"
        style={{ width: '100%', justifyContent: 'center', fontSize: 12 }}
      >
        ADD MY PREFERENCES
      </button>
    </div>
  )
}
