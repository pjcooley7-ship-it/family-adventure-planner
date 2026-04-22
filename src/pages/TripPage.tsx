import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Check, Mail } from 'lucide-react'
import { useTrip, useTripMembers, useTripPreferences, useMyPreferences } from '@/hooks/useTrip'
import { useAuth } from '@/hooks/useAuth'
import { DocContainer } from '@/components/DocContainer'

// ── Avatar color palette — deterministic from name ───────────────────────────
const AVATAR_PALETTE = [
  { bg: '#FED7C7', fg: '#993C1D' },
  { bg: '#C4E8DA', fg: '#0F6E56' },
  { bg: '#FFE8B3', fg: '#9A6410' },
  { bg: '#D4D1F0', fg: '#4A4290' },
  { bg: '#F5E0D8', fg: '#8A5A40' },
  { bg: '#D1E8F5', fg: '#1A5C7A' },
  { bg: '#E8D4F0', fg: '#6A2A8A' },
  { bg: '#D4F0E8', fg: '#1A6A4A' },
]

function avatarColors(name: string) {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0
  return AVATAR_PALETTE[hash % AVATAR_PALETTE.length]
}

// ── Wordmark ─────────────────────────────────────────────────────────────────
function Wordmark() {
  return (
    <span style={{ fontFamily: 'var(--f-display)', fontSize: 15, fontWeight: 400, color: 'var(--ink)', letterSpacing: '-0.02em' }}>
      wanderlust<span style={{ color: 'var(--coral)' }}>.</span>
    </span>
  )
}

// ── Avatar ───────────────────────────────────────────────────────────────────
function Avatar({ name, size = 36, ring }: { name: string; size?: number; ring?: string }) {
  const { bg, fg } = avatarColors(name)
  return (
    <div
      className="avatar"
      style={{
        width: size, height: size, background: bg, color: fg,
        fontSize: size * 0.42,
        ...(ring ? { boxShadow: `0 0 0 2px var(--paper), 0 0 0 3.5px ${ring}` } : {}),
      }}
    >
      {name[0].toUpperCase()}
    </div>
  )
}

// ── Hairline rule ─────────────────────────────────────────────────────────────
function Rule({ mx = 28 }: { mx?: number }) {
  return <hr className="rule" style={{ margin: `0 ${mx}px` }} />
}

// ── Split headline — italicise last word in coral ─────────────────────────────
function ItalicLastWord({ text, fontSize }: { text: string; fontSize: number }) {
  const words = text.trim().split(' ')
  const last  = words.pop()
  return (
    <h1 className="display" style={{ fontSize, color: 'var(--ink)' }}>
      {words.length > 0 ? words.join(' ') + ' ' : ''}
      <em style={{ fontStyle: 'italic', color: 'var(--coral)' }}>{last}</em>
    </h1>
  )
}

// ─────────────────────────────────────────────────────────────────────────────

export default function TripPage() {
  const { tripId } = useParams()
  const navigate   = useNavigate()
  const { user }   = useAuth()

  const [copied,   setCopied]   = useState(false)
  // nudge cooldowns keyed by member id
  const [nudgedAt, setNudgedAt] = useState<Record<string, number>>({})

  const { data: trip,           isLoading: tripLoading } = useTrip(tripId!)
  const { data: members = [] }                           = useTripMembers(tripId!)
  const { data: allPreferences = [] }                    = useTripPreferences(tripId!)
  const { data: myPreferences }                          = useMyPreferences(tripId!, user?.id)

  const submittedUserIds = new Set(allPreferences.map(p => p.user_id))
  const submitted        = members.filter(m =>  submittedUserIds.has(m.user_id))
  const pending          = members.filter(m => !submittedUserIds.has(m.user_id))
  const allSubmitted     = members.length > 0 && pending.length === 0
  const enoughToMatch    = submitted.length >= 2
  const hasSubmitted     = !!myPreferences

  function copyInvite() {
    navigator.clipboard.writeText(trip?.code ?? '').then(() => {
      setCopied(true)
      toast.success('Trip code copied')
      setTimeout(() => setCopied(false), 2000)
    })
  }

  function nudge(memberId: string, name: string) {
    setNudgedAt(prev => ({ ...prev, [memberId]: Date.now() }))
    toast.success(`Nudge sent to ${name} 👋`)
  }

  function canNudge(memberId: string) {
    const t = nudgedAt[memberId]
    return !t || Date.now() - t > 60_000
  }

  function createdLabel() {
    if (!trip) return ''
    const d = new Date(trip.created_at)
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase()
  }

  if (tripLoading) {
    return (
      <DocContainer>
        <div style={{ padding: '80px 28px', textAlign: 'center' }}>
          <p className="eyebrow">LOADING…</p>
        </div>
      </DocContainer>
    )
  }

  if (!trip) {
    return (
      <DocContainer>
        <div style={{ padding: '80px 28px', textAlign: 'center' }}>
          <h1 className="display" style={{ fontSize: 32, marginBottom: 16 }}>Trip not found</h1>
          <button className="btn-text" onClick={() => navigate('/')}>← BACK HOME</button>
        </div>
      </DocContainer>
    )
  }

  return (
    <DocContainer>

      {/* Nav */}
      <nav style={{
        padding: '16px 28px',
        borderBottom: '1px solid var(--hairline)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <button className="btn-text" onClick={() => navigate('/')}>← HOME</button>
        <Wordmark />
        <div style={{ width: 60 }} /> {/* balance */}
      </nav>

      {/* Trip header */}
      <div style={{ padding: '28px 28px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 10 }}>
          <span
            className="chip-new ink"
            style={{ fontSize: 10, letterSpacing: '0.12em' }}
          >
            TRIP · {trip.code}
          </span>
          <button
            onClick={copyInvite}
            style={{ background: 'none', border: 'none', color: 'var(--ink-3)', fontSize: 11, cursor: 'pointer', padding: 0 }}
          >
            {copied ? '✓ copied' : 'copy ⧉'}
          </button>
        </div>

        <ItalicLastWord text={trip.name} fontSize={36} />

        <p className="mono" style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 6, letterSpacing: '0.08em' }}>
          CREATED {createdLabel()} · {members.length} TRAVELER{members.length !== 1 ? 'S' : ''}
        </p>
      </div>

      <Rule />

      {/* Action card */}
      <div style={{ padding: '24px 28px' }}>
        {hasSubmitted ? (
          allSubmitted ? (
            /* All in — find destinations is the one CTA */
            <>
              <div style={{
                background: 'var(--green-bg)', borderRadius: 12, padding: '18px 20px',
                display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12,
              }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>✓</div>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--green-fg)', marginBottom: 2 }}>Everyone's in!</p>
                  <p style={{ fontSize: 12, color: 'var(--green-fg)', opacity: 0.85 }}>All preferences submitted — time to find your destination.</p>
                </div>
              </div>
              <button
                className="btn-primary coral"
                style={{ width: '100%', justifyContent: 'center', fontSize: 15, padding: '14px' }}
                onClick={() => navigate(`/trip/${tripId}/results`)}
              >
                Find our destination →
              </button>
            </>
          ) : (
            /* Submitted, waiting on others */
            <div style={{
              background: 'var(--green-bg)', borderRadius: 12, padding: '18px 20px',
              display: 'flex', alignItems: 'center', gap: 14,
            }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>✓</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--green-fg)', marginBottom: 2 }}>You're in!</p>
                <p style={{ fontSize: 12, color: 'var(--green-fg)', opacity: 0.85 }}>Waiting on {pending.length} other{pending.length !== 1 ? 's' : ''}.</p>
                <button
                  className="btn-text"
                  style={{ marginTop: 8, fontSize: 10, color: 'var(--green-fg)' }}
                  onClick={() => navigate(`/trip/${tripId}/preferences`)}
                >
                  EDIT PREFERENCES
                </button>
              </div>
            </div>
          )
        ) : (
          /* Haven't submitted yet */
          <>
            <div style={{
              background: 'var(--amber-bg)', borderRadius: 12, padding: '18px 20px',
              display: 'flex', alignItems: 'center', gap: 14,
            }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--amber)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>⏳</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--amber-fg)', marginBottom: 2 }}>Your turn!</p>
                <p style={{ fontSize: 12, color: 'var(--amber-fg)', opacity: 0.85 }}>Add your preferences so we can find the match.</p>
              </div>
            </div>
            <button
              className="btn-primary coral"
              style={{ width: '100%', justifyContent: 'center', marginTop: 12, fontSize: 15, padding: '14px' }}
              onClick={() => navigate(`/trip/${tripId}/preferences`)}
            >
              Add my preferences →
            </button>
          </>
        )}

        {/* Find destinations — available even if not all submitted, when enough have */}
        {enoughToMatch && hasSubmitted && !allSubmitted && (
          <button
            className="btn-ghost"
            style={{ width: '100%', justifyContent: 'center', marginTop: 10, fontSize: 12 }}
            onClick={() => navigate(`/trip/${tripId}/results`)}
          >
            Find destinations so far
          </button>
        )}
      </div>

      <Rule />

      {/* The Party */}
      <div style={{ padding: '22px 28px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 14 }}>
          <p className="eyebrow eyebrow-ink">THE PARTY</p>
          <span className="mono" style={{ fontSize: 10, color: 'var(--ink-2)' }}>
            {submitted.length} OF {members.length} IN
          </span>
        </div>

        {/* Progress pips */}
        {members.length > 0 && (
          <div style={{ display: 'flex', gap: 4, marginBottom: 18 }}>
            {members.map(m => (
              <div
                key={m.id}
                style={{
                  flex: 1, height: 3, borderRadius: 2,
                  background: submittedUserIds.has(m.user_id) ? 'var(--green)' : 'var(--hairline)',
                }}
              />
            ))}
          </div>
        )}

        {members.length === 0 ? (
          <p style={{ fontSize: 13, color: 'var(--ink-2)' }}>
            No one else has joined yet — share the invite code below.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {members.map(m => {
              const isSubmitted = submittedUserIds.has(m.user_id)
              const isYou       = m.user_id === user?.id
              return (
                <div
                  key={m.id}
                  style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 4px' }}
                >
                  <Avatar
                    name={m.display_name}
                    ring={isSubmitted ? 'var(--green)' : undefined}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--ink)' }}>{m.display_name}</span>
                      {isYou && (
                        <span className="mono" style={{ fontSize: 9, color: 'var(--ink-3)', letterSpacing: '0.12em' }}>YOU</span>
                      )}
                    </div>
                    <p className="mono" style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 1 }}>
                      {isSubmitted ? '✓ in' : '· waiting'}
                    </p>
                  </div>
                  {!isSubmitted && !isYou && (
                    <button
                      className="btn-text"
                      style={{ fontSize: 10, opacity: canNudge(m.id) ? 1 : 0.4 }}
                      disabled={!canNudge(m.id)}
                      onClick={() => nudge(m.id, m.display_name)}
                    >
                      NUDGE 👋
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* Rotten-egg nudge card */}
        {pending.filter(m => m.user_id !== user?.id).length > 0 && (
          <div style={{
            marginTop: 18, padding: '12px 14px', background: 'var(--paper-2)', borderRadius: 10,
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <span style={{ fontSize: 18 }}>🥚</span>
            <p style={{ fontSize: 12, color: 'var(--ink-2)', flex: 1, lineHeight: 1.5 }}>
              {pending.filter(m => m.user_id !== user?.id).map((m, i, arr) => (
                <span key={m.id}>
                  <b style={{ color: 'var(--ink)' }}>{m.display_name}</b>
                  {i < arr.length - 2 ? ', ' : i === arr.length - 2 ? ' & ' : ''}
                </span>
              ))}
              {' '}— last {pending.length === 1 ? 'one' : 'ones'} in {pending.length === 1 ? 'is a' : 'are'} rotten egg{pending.length !== 1 ? 's' : ''}!
            </p>
          </div>
        )}
      </div>

      {/* Invite code footer */}
      <div style={{ padding: '0 28px 28px', marginTop: 'auto' }}>
        <Rule mx={0} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginTop: 16 }}>
          <div>
            <p className="eyebrow" style={{ marginBottom: 4 }}>INVITE CODE</p>
            <p className="mono" style={{ fontSize: 24, fontWeight: 700, color: 'var(--ink)', letterSpacing: '0.15em' }}>
              {trip.code}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn-ghost" style={{ padding: '8px 14px', fontSize: 11 }} onClick={copyInvite}>
              {copied ? <Check size={12} /> : 'COPY'}
            </button>
            <a
              className="btn-ghost"
              style={{ padding: '8px 14px', fontSize: 11, textDecoration: 'none' }}
              href={`mailto:?subject=Join my Wanderlust trip: ${trip.name}&body=Hey!%0A%0AI'm planning a trip and want you to join.%0A%0AUse this code: ${trip.code}%0A%0ASign in at ${window.location.origin} and click "Join a trip".`}
            >
              <Mail size={12} style={{ marginRight: 4 }} />EMAIL
            </a>
          </div>
        </div>
      </div>

    </DocContainer>
  )
}
