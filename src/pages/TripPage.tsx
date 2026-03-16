import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Copy, Check, ArrowRight, Clock, MapPin, Users } from 'lucide-react'
import { useTrip, useTripMembers, useTripPreferences, useMyPreferences } from '@/hooks/useTrip'
import { useAuth } from '@/hooks/useAuth'

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
  const submitted = members.filter(m => submittedUserIds.has(m.user_id))
  const pending   = members.filter(m => !submittedUserIds.has(m.user_id))
  const allSubmitted   = members.length > 0 && pending.length === 0
  const enoughToMatch  = submitted.length >= 2
  const hasSubmitted   = !!myPreferences

  const inviteLink = `${window.location.origin}/join/${trip?.code ?? ''}`

  function copyInvite() {
    const text = trip?.code ?? ''
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      toast.success('Trip code copied')
      setTimeout(() => setCopied(false), 2000)
    })
  }

  if (tripLoading) {
    return (
      <div className="min-h-screen topo-curves flex items-center justify-center" style={{ background: '#060d1f' }}>
        <p className="font-display text-2xl italic animate-pulse" style={{ fontFamily: 'var(--font-display)', color: '#c9952a' }}>
          charting your course...
        </p>
      </div>
    )
  }

  if (!trip) {
    return (
      <div className="min-h-screen topo-curves flex flex-col items-center justify-center gap-4" style={{ background: '#060d1f' }}>
        <p style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: '#f2eadb' }}>Trip not found</p>
        <button onClick={() => navigate('/')} style={{ fontFamily: 'var(--font-body)', color: '#c9952a', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, letterSpacing: '0.15em' }}>
          ← BACK HOME
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen topo-curves" style={{ background: '#060d1f' }}>

      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-5" style={{ borderBottom: '1px solid rgba(201,149,42,0.1)' }}>
        <button
          onClick={() => navigate('/')}
          style={{ fontFamily: 'var(--font-display)', fontSize: 18, letterSpacing: '0.2em', color: '#c9952a', background: 'none', border: 'none', cursor: 'pointer', fontStyle: 'italic' }}
        >
          Wanderlust
        </button>
        <div className="flex items-center gap-2">
          <div style={{
            width: 8, height: 8, borderRadius: '50%',
            background: allSubmitted ? '#4ade80' : enoughToMatch ? '#c9952a' : 'rgba(201,149,42,0.3)',
            animation: !allSubmitted ? 'pulse-dot 2s ease-in-out infinite' : 'none',
          }} />
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, letterSpacing: '0.2em', color: allSubmitted ? 'rgba(74,222,128,0.8)' : 'rgba(201,149,42,0.7)' }}>
            {members.length === 0
              ? 'NO MEMBERS YET'
              : allSubmitted
              ? 'ALL SUBMITTED'
              : `${submitted.length} OF ${members.length} SUBMITTED`}
          </span>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-10">

        {/* Trip header */}
        <div className="mb-10 animate-fade-up">
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 10, letterSpacing: '0.3em', color: 'rgba(201,149,42,0.45)', marginBottom: 8 }}>
            TRIP · {trip.code}
          </p>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 300, color: '#f2eadb', lineHeight: 1.1 }}>
            {trip.name}
          </h1>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'rgba(242,234,219,0.35)', marginTop: 8 }}>
            Created {new Date(trip.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left — Party */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <div className="animate-fade-up delay-300">
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 10, letterSpacing: '0.25em', color: 'rgba(201,149,42,0.5)', marginBottom: 12 }}>
                TRAVEL PARTY
              </p>
              {members.length === 0 ? (
                <div style={{ border: '1px solid rgba(201,149,42,0.1)', padding: '32px', textAlign: 'center' }}>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'rgba(242,234,219,0.3)' }}>
                    No one else has joined yet — share the invite code below.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {members.map(member => {
                    const pref = allPreferences.find(p => p.user_id === member.user_id)
                    const isYou = member.user_id === user?.id
                    return (
                      <MemberCard
                        key={member.id}
                        name={member.display_name}
                        originCity={pref?.origin_city ?? null}
                        submitted={submittedUserIds.has(member.user_id)}
                        isYou={isYou}
                      />
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right — Actions */}
          <div className="flex flex-col gap-5 animate-fade-up delay-200">

            {/* Your status */}
            <ActionCard tripId={tripId!} navigate={navigate} hasSubmitted={hasSubmitted} />

            {/* Invite */}
            <div style={{ border: '1px solid rgba(201,149,42,0.18)', background: 'rgba(13,24,48,0.6)', padding: 24 }}>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 10, letterSpacing: '0.25em', color: 'rgba(201,149,42,0.55)', marginBottom: 14 }}>
                INVITE YOUR PARTY
              </p>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'rgba(242,234,219,0.45)', marginBottom: 16, lineHeight: 1.6 }}>
                Share your trip code with everyone joining.
              </p>

              <div className="mt-4 text-center" style={{ border: '1px solid rgba(201,149,42,0.2)', padding: '20px 16px' }}>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 10, color: 'rgba(242,234,219,0.25)', letterSpacing: '0.2em', marginBottom: 10 }}>
                  TRIP CODE
                </p>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: 36, color: '#c9952a', letterSpacing: '0.3em', fontWeight: 400 }}>
                  {trip.code}
                </p>
                <button
                  onClick={copyInvite}
                  className="flex items-center gap-2 mx-auto mt-4"
                  style={{
                    fontFamily: 'var(--font-body)', fontSize: 11, letterSpacing: '0.15em',
                    color: copied ? '#4ade80' : 'rgba(201,149,42,0.7)',
                    background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                  }}
                >
                  {copied ? <Check size={13} /> : <Copy size={13} />}
                  {copied ? 'COPIED' : 'COPY CODE'}
                </button>
              </div>
            </div>

            {/* Progress */}
            {members.length > 0 && (
              <div style={{ border: '1px solid rgba(201,149,42,0.18)', background: 'rgba(13,24,48,0.6)', padding: 24 }}>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 10, letterSpacing: '0.25em', color: 'rgba(201,149,42,0.55)', marginBottom: 16 }}>
                  SUBMISSION PROGRESS
                </p>
                <div style={{ height: 4, background: 'rgba(201,149,42,0.1)', borderRadius: 2, marginBottom: 8 }}>
                  <div style={{
                    height: '100%',
                    width: `${(submitted.length / members.length) * 100}%`,
                    background: 'linear-gradient(90deg, #c9952a, #e8b84b)',
                    borderRadius: 2, transition: 'width 0.6s ease',
                  }} />
                </div>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'rgba(242,234,219,0.4)' }}>
                  {submitted.length} of {members.length} submitted
                </p>
                {pending.length > 0 && (
                  <div className="mt-4 flex flex-col gap-2">
                    <p style={{ fontFamily: 'var(--font-body)', fontSize: 10, letterSpacing: '0.15em', color: 'rgba(242,234,219,0.25)', marginBottom: 4 }}>
                      WAITING ON
                    </p>
                    {pending.map(m => (
                      <div key={m.id} className="flex items-center gap-2">
                        <Clock size={11} style={{ color: 'rgba(201,149,42,0.4)', flexShrink: 0 }} />
                        <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'rgba(242,234,219,0.4)' }}>
                          {m.display_name}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Find destinations CTA */}
            {enoughToMatch && (
              <button
                onClick={() => navigate(`/trip/${tripId}/results`)}
                className="flex items-center justify-center gap-3"
                style={{
                  fontFamily: 'var(--font-body)', fontSize: 13, letterSpacing: '0.15em',
                  color: '#060d1f', background: '#c9952a', border: 'none', cursor: 'pointer',
                  padding: '18px 24px', transition: 'background 0.2s', width: '100%',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#e8b84b' }}
                onMouseLeave={e => { e.currentTarget.style.background = '#c9952a' }}
              >
                {allSubmitted ? 'FIND OUR DESTINATION' : 'FIND DESTINATIONS SO FAR'}
                <ArrowRight size={15} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
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
      className="flex items-center justify-between px-5 py-4"
      style={{
        border: `1px solid ${submitted ? 'rgba(201,149,42,0.25)' : 'rgba(201,149,42,0.1)'}`,
        background: submitted ? 'rgba(201,149,42,0.04)' : 'rgba(13,24,48,0.4)',
      }}
    >
      <div className="flex items-center gap-4">
        <div style={{
          width: 36, height: 36, borderRadius: '50%',
          border: `1px solid ${submitted ? 'rgba(201,149,42,0.4)' : 'rgba(201,149,42,0.15)'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: submitted ? 'rgba(201,149,42,0.1)' : 'transparent',
          fontFamily: 'var(--font-display)', fontSize: 16,
          color: submitted ? '#c9952a' : 'rgba(201,149,42,0.3)',
        }}>
          {name[0].toUpperCase()}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: submitted ? '#f2eadb' : 'rgba(242,234,219,0.45)' }}>
              {name}
            </span>
            {isYou && (
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 9, letterSpacing: '0.15em', color: 'rgba(201,149,42,0.6)', border: '1px solid rgba(201,149,42,0.25)', padding: '1px 6px' }}>
                YOU
              </span>
            )}
          </div>
          {originCity && (
            <div className="flex items-center gap-1 mt-1">
              <MapPin size={10} style={{ color: 'rgba(201,149,42,0.5)' }} />
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'rgba(242,234,219,0.35)' }}>
                {originCity}
              </span>
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        {submitted ? (
          <>
            <Check size={12} style={{ color: '#c9952a' }} />
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 10, letterSpacing: '0.15em', color: 'rgba(201,149,42,0.7)' }}>SUBMITTED</span>
          </>
        ) : (
          <>
            <Clock size={12} style={{ color: 'rgba(242,234,219,0.2)' }} />
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 10, letterSpacing: '0.15em', color: 'rgba(242,234,219,0.2)' }}>PENDING</span>
          </>
        )}
      </div>
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
      <div style={{ border: '1px solid rgba(74,222,128,0.2)', background: 'rgba(74,222,128,0.04)', padding: 24 }}>
        <div className="flex items-center gap-3 mb-3">
          <Check size={16} style={{ color: '#4ade80' }} />
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, letterSpacing: '0.2em', color: 'rgba(74,222,128,0.8)' }}>
            YOUR PREFERENCES SAVED
          </span>
        </div>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'rgba(242,234,219,0.4)', lineHeight: 1.6 }}>
          Waiting for the rest of your party to submit.
        </p>
        <button
          onClick={() => navigate(`/trip/${tripId}/preferences`)}
          style={{ marginTop: 14, fontFamily: 'var(--font-body)', fontSize: 11, letterSpacing: '0.15em', color: 'rgba(242,234,219,0.4)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, textDecoration: 'underline', textDecorationColor: 'rgba(242,234,219,0.2)' }}
        >
          EDIT PREFERENCES
        </button>
      </div>
    )
  }

  return (
    <div style={{ border: '1px solid rgba(201,149,42,0.35)', background: 'rgba(201,149,42,0.05)', padding: 24 }}>
      <div className="flex items-center gap-2 mb-3">
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#c9952a', animation: 'pulse-dot 2s ease-in-out infinite' }} />
        <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, letterSpacing: '0.2em', color: 'rgba(201,149,42,0.8)' }}>ACTION NEEDED</span>
      </div>
      <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'rgba(242,234,219,0.5)', lineHeight: 1.6, marginBottom: 18 }}>
        You haven't submitted your travel preferences yet.
      </p>
      <button
        onClick={() => navigate(`/trip/${tripId}/preferences`)}
        className="flex items-center gap-2 w-full justify-center"
        style={{
          fontFamily: 'var(--font-body)', fontSize: 12, letterSpacing: '0.15em',
          color: '#060d1f', background: '#c9952a', border: 'none', cursor: 'pointer',
          padding: '13px 20px', transition: 'background 0.2s', width: '100%',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = '#e8b84b' }}
        onMouseLeave={e => { e.currentTarget.style.background = '#c9952a' }}
      >
        <Users size={13} />
        ADD MY PREFERENCES
      </button>
    </div>
  )
}
