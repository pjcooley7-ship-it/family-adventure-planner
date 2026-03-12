import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Copy, Check, ArrowRight, Clock, MapPin, Users } from 'lucide-react'
import { PartyMap } from '@/components/PartyMap'

// ─── Mock data — replace with Supabase queries once schema is wired ───────────

const MOCK_TRIP = {
  id: 'demo',
  name: 'Summer Family Reunion',
  createdAt: '2026-03-12',
  status: 'collecting' as 'collecting' | 'ready' | 'matched',
}

const MOCK_MEMBERS = [
  { name: 'Sarah', originCity: 'New York', submitted: true,  x: 195, y: 185 },
  { name: 'Tom',   originCity: 'London',   submitted: true,  x: 430, y: 148 },
  { name: 'Yuki',  originCity: 'Tokyo',    submitted: false, x: 755, y: 192 },
  { name: 'Marco', originCity: 'Rome',     submitted: false, x: 480, y: 158 },
]

const CURRENT_USER_NAME = 'You' // Will come from Supabase auth

// ─────────────────────────────────────────────────────────────────────────────

export default function TripPage() {
  const { tripId } = useParams()
  const navigate = useNavigate()
  const [copied, setCopied] = useState(false)

  const inviteLink = `wanderlust.app/join/${tripId}`
  const submitted = MOCK_MEMBERS.filter(m => m.submitted)
  const pending = MOCK_MEMBERS.filter(m => !m.submitted)
  const allSubmitted = pending.length === 0
  const enoughToMatch = submitted.length >= 2

  function copyInvite() {
    navigator.clipboard.writeText(inviteLink).then(() => {
      setCopied(true)
      toast.success('Invite link copied')
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="min-h-screen topo-curves" style={{ background: '#060d1f' }}>

      {/* Nav */}
      <nav
        className="flex items-center justify-between px-8 py-5"
        style={{ borderBottom: '1px solid rgba(201,149,42,0.1)' }}
      >
        <button
          onClick={() => navigate('/')}
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 18,
            letterSpacing: '0.2em',
            color: '#c9952a',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontStyle: 'italic',
          }}
        >
          Wanderlust
        </button>

        <div className="flex items-center gap-2">
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: allSubmitted ? '#4ade80' : enoughToMatch ? '#c9952a' : 'rgba(201,149,42,0.3)',
              animation: !allSubmitted ? 'pulse-dot 2s ease-in-out infinite' : 'none',
            }}
          />
          <span
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 11,
              letterSpacing: '0.2em',
              color: allSubmitted ? 'rgba(74,222,128,0.8)' : 'rgba(201,149,42,0.7)',
            }}
          >
            {allSubmitted ? 'ALL SUBMITTED' : `${submitted.length} OF ${MOCK_MEMBERS.length} SUBMITTED`}
          </span>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-10">

        {/* Trip header */}
        <div className="mb-10 animate-fade-up">
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 10,
              letterSpacing: '0.3em',
              color: 'rgba(201,149,42,0.45)',
              marginBottom: 8,
            }}
          >
            TRIP · {String(tripId).toUpperCase()}
          </p>
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(2rem, 5vw, 3.5rem)',
              fontWeight: 300,
              color: '#f2eadb',
              lineHeight: 1.1,
            }}
          >
            {MOCK_TRIP.name}
          </h1>
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 13,
              color: 'rgba(242,234,219,0.35)',
              marginTop: 8,
            }}
          >
            Created {MOCK_TRIP.createdAt}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left — Party + Map */}
          <div className="lg:col-span-2 flex flex-col gap-6">

            {/* Party map */}
            <div
              className="animate-fade-in delay-200"
              style={{ border: '1px solid rgba(201,149,42,0.15)', background: 'rgba(13,24,48,0.5)' }}
            >
              <div
                className="px-5 py-4 flex items-center justify-between"
                style={{ borderBottom: '1px solid rgba(201,149,42,0.1)' }}
              >
                <span
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: 10,
                    letterSpacing: '0.25em',
                    color: 'rgba(201,149,42,0.6)',
                  }}
                >
                  PARTY LOCATIONS
                </span>
                <span
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: 11,
                    color: 'rgba(242,234,219,0.3)',
                  }}
                >
                  {submitted.length} pinned
                </span>
              </div>
              <div className="p-2">
                <PartyMap members={MOCK_MEMBERS} />
              </div>
            </div>

            {/* Party member cards */}
            <div className="animate-fade-up delay-300">
              <p
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 10,
                  letterSpacing: '0.25em',
                  color: 'rgba(201,149,42,0.5)',
                  marginBottom: 12,
                }}
              >
                TRAVEL PARTY
              </p>
              <div className="flex flex-col gap-3">
                {MOCK_MEMBERS.map((member, i) => (
                  <MemberCard key={i} member={member} isYou={member.name === CURRENT_USER_NAME} />
                ))}
              </div>
            </div>
          </div>

          {/* Right — Actions */}
          <div className="flex flex-col gap-5 animate-fade-up delay-200">

            {/* Your status */}
            <ActionCard
              tripId={tripId!}
              navigate={navigate}
              hasSubmitted={false} // Will come from auth + Supabase
            />

            {/* Invite */}
            <div style={{ border: '1px solid rgba(201,149,42,0.18)', background: 'rgba(13,24,48,0.6)', padding: 24 }}>
              <p
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 10,
                  letterSpacing: '0.25em',
                  color: 'rgba(201,149,42,0.55)',
                  marginBottom: 14,
                }}
              >
                INVITE YOUR PARTY
              </p>
              <p
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 13,
                  color: 'rgba(242,234,219,0.45)',
                  marginBottom: 16,
                  lineHeight: 1.6,
                }}
              >
                Share this link with everyone joining the trip.
              </p>

              {/* Link box */}
              <div
                className="flex items-center gap-0"
                style={{ border: '1px solid rgba(201,149,42,0.2)' }}
              >
                <span
                  className="flex-1 px-3 py-3 text-xs truncate"
                  style={{
                    fontFamily: 'var(--font-body)',
                    color: 'rgba(242,234,219,0.5)',
                    letterSpacing: '0.03em',
                  }}
                >
                  {inviteLink}
                </span>
                <button
                  onClick={copyInvite}
                  style={{
                    padding: '12px 14px',
                    background: copied ? 'rgba(74,222,128,0.1)' : 'rgba(201,149,42,0.08)',
                    border: 'none',
                    borderLeft: '1px solid rgba(201,149,42,0.2)',
                    cursor: 'pointer',
                    color: copied ? '#4ade80' : '#c9952a',
                    transition: 'all 0.2s',
                    flexShrink: 0,
                  }}
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                </button>
              </div>

              {/* Trip code */}
              <div className="mt-4 text-center">
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 10, color: 'rgba(242,234,219,0.25)', letterSpacing: '0.2em', marginBottom: 6 }}>
                  OR SHARE CODE
                </p>
                <p
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 28,
                    color: '#c9952a',
                    letterSpacing: '0.3em',
                    fontWeight: 400,
                  }}
                >
                  {String(tripId).toUpperCase()}
                </p>
              </div>
            </div>

            {/* Progress */}
            <div style={{ border: '1px solid rgba(201,149,42,0.18)', background: 'rgba(13,24,48,0.6)', padding: 24 }}>
              <p
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 10,
                  letterSpacing: '0.25em',
                  color: 'rgba(201,149,42,0.55)',
                  marginBottom: 16,
                }}
              >
                SUBMISSION PROGRESS
              </p>

              <div style={{ height: 4, background: 'rgba(201,149,42,0.1)', borderRadius: 2, marginBottom: 8 }}>
                <div
                  style={{
                    height: '100%',
                    width: `${(submitted.length / MOCK_MEMBERS.length) * 100}%`,
                    background: 'linear-gradient(90deg, #c9952a, #e8b84b)',
                    borderRadius: 2,
                    transition: 'width 0.6s ease',
                  }}
                />
              </div>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'rgba(242,234,219,0.4)' }}>
                {submitted.length} of {MOCK_MEMBERS.length} submitted
              </p>

              {pending.length > 0 && (
                <div className="mt-4 flex flex-col gap-2">
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: 10, letterSpacing: '0.15em', color: 'rgba(242,234,219,0.25)', marginBottom: 4 }}>
                    WAITING ON
                  </p>
                  {pending.map((m, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <Clock size={11} style={{ color: 'rgba(201,149,42,0.4)', flexShrink: 0 }} />
                      <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'rgba(242,234,219,0.4)' }}>
                        {m.name} · {m.originCity}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Find destinations CTA */}
            {enoughToMatch && (
              <button
                onClick={() => navigate(`/trip/${tripId}/results`)}
                className="flex items-center justify-center gap-3 animate-fade-up"
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 13,
                  letterSpacing: '0.15em',
                  color: '#060d1f',
                  background: '#c9952a',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '18px 24px',
                  transition: 'background 0.2s',
                  width: '100%',
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

function MemberCard({
  member,
  isYou,
}: {
  member: { name: string; originCity: string; submitted: boolean }
  isYou: boolean
}) {
  return (
    <div
      className="flex items-center justify-between px-5 py-4"
      style={{
        border: `1px solid ${member.submitted ? 'rgba(201,149,42,0.25)' : 'rgba(201,149,42,0.1)'}`,
        background: member.submitted ? 'rgba(201,149,42,0.04)' : 'rgba(13,24,48,0.4)',
        transition: 'all 0.2s',
      }}
    >
      <div className="flex items-center gap-4">
        {/* Avatar initial */}
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            border: `1px solid ${member.submitted ? 'rgba(201,149,42,0.4)' : 'rgba(201,149,42,0.15)'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: member.submitted ? 'rgba(201,149,42,0.1)' : 'transparent',
            fontFamily: 'var(--font-display)',
            fontSize: 16,
            color: member.submitted ? '#c9952a' : 'rgba(201,149,42,0.3)',
          }}
        >
          {member.name[0]}
        </div>

        <div>
          <div className="flex items-center gap-2">
            <span
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: 14,
                color: member.submitted ? '#f2eadb' : 'rgba(242,234,219,0.45)',
              }}
            >
              {member.name}
            </span>
            {isYou && (
              <span
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 9,
                  letterSpacing: '0.15em',
                  color: 'rgba(201,149,42,0.6)',
                  border: '1px solid rgba(201,149,42,0.25)',
                  padding: '1px 6px',
                }}
              >
                YOU
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 mt-1">
            <MapPin size={10} style={{ color: 'rgba(201,149,42,0.5)' }} />
            <span
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: 11,
                color: 'rgba(242,234,219,0.35)',
                letterSpacing: '0.05em',
              }}
            >
              {member.originCity}
            </span>
          </div>
        </div>
      </div>

      {/* Status */}
      <div className="flex items-center gap-2">
        {member.submitted ? (
          <>
            <Check size={12} style={{ color: '#c9952a' }} />
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 10, letterSpacing: '0.15em', color: 'rgba(201,149,42,0.7)' }}>
              SUBMITTED
            </span>
          </>
        ) : (
          <>
            <Clock size={12} style={{ color: 'rgba(242,234,219,0.2)' }} />
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 10, letterSpacing: '0.15em', color: 'rgba(242,234,219,0.2)' }}>
              PENDING
            </span>
          </>
        )}
      </div>
    </div>
  )
}

/* ─── Action card ─────────────────────────────────────────────────────────── */

function ActionCard({
  tripId,
  navigate,
  hasSubmitted,
}: {
  tripId: string
  navigate: (path: string) => void
  hasSubmitted: boolean
}) {
  if (hasSubmitted) {
    return (
      <div
        style={{
          border: '1px solid rgba(74,222,128,0.2)',
          background: 'rgba(74,222,128,0.04)',
          padding: 24,
        }}
      >
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
          style={{
            marginTop: 14,
            fontFamily: 'var(--font-body)',
            fontSize: 11,
            letterSpacing: '0.15em',
            color: 'rgba(242,234,219,0.4)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
            textDecoration: 'underline',
            textDecorationColor: 'rgba(242,234,219,0.2)',
          }}
        >
          EDIT PREFERENCES
        </button>
      </div>
    )
  }

  return (
    <div
      style={{
        border: '1px solid rgba(201,149,42,0.35)',
        background: 'rgba(201,149,42,0.05)',
        padding: 24,
      }}
    >
      <div className="flex items-center gap-2 mb-3">
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#c9952a', animation: 'pulse-dot 2s ease-in-out infinite' }} />
        <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, letterSpacing: '0.2em', color: 'rgba(201,149,42,0.8)' }}>
          ACTION NEEDED
        </span>
      </div>
      <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'rgba(242,234,219,0.5)', lineHeight: 1.6, marginBottom: 18 }}>
        You haven't submitted your travel preferences yet.
      </p>
      <button
        onClick={() => navigate(`/trip/${tripId}/preferences`)}
        className="flex items-center gap-2 w-full justify-center"
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: 12,
          letterSpacing: '0.15em',
          color: '#060d1f',
          background: '#c9952a',
          border: 'none',
          cursor: 'pointer',
          padding: '13px 20px',
          transition: 'background 0.2s',
          width: '100%',
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
