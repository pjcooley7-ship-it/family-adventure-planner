import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Loader } from 'lucide-react'
import { useTripByCode, useTripMembers } from '@/hooks/useTrip'
import { useJoinTrip } from '@/hooks/useTripMutations'
import { useAuth } from '@/hooks/useAuth'
import { DocContainer } from '@/components/DocContainer'

// ── Avatar color palette — deterministic from name ────────────────────────────
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

function Wordmark() {
  return (
    <span style={{ fontFamily: 'var(--f-display)', fontSize: 15, fontWeight: 400, letterSpacing: '-0.02em', color: 'var(--ink)' }}>
      wanderlust<span style={{ color: 'var(--coral)' }}>.</span>
    </span>
  )
}

// Split trip name — italicise last word in coral
function ItalicLastWord({ text, fontSize }: { text: string; fontSize: number }) {
  const words = text.trim().split(' ')
  const last = words.pop()
  return (
    <h1 className="display" style={{ fontSize, color: 'var(--ink)', textAlign: 'center' }}>
      {words.length > 0 ? words.join(' ') + '\n' : ''}
      <em style={{ fontStyle: 'italic', color: 'var(--coral)' }}>{last}</em>
    </h1>
  )
}

export default function JoinPage() {
  const { code } = useParams<{ code: string }>()
  const navigate = useNavigate()
  const [displayName, setDisplayName] = useState('')

  const { user } = useAuth()
  const { data: trip, isLoading, isError } = useTripByCode(code ?? '')
  const { data: members = [] } = useTripMembers(trip?.id ?? '')
  const joinTrip = useJoinTrip()

  const alreadyMember = !!user && members.some(m => m.user_id === user.id)
  const visibleMembers = members.slice(0, 4)
  const extraCount = Math.max(0, members.length - 4)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!displayName.trim() || !code) return
    joinTrip.mutate({ code, displayName: displayName.trim() })
  }

  return (
    <DocContainer>
      {/* Nav */}
      <nav style={{
        padding: '14px 24px',
        borderBottom: '1px solid var(--hairline)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'var(--paper)',
      }}>
        <button className="btn-text" onClick={() => navigate('/')}>← BACK</button>
        <Wordmark />
        <div style={{ width: 60 }} />
      </nav>

      <div style={{ padding: '48px 28px 40px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>

        {isLoading && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, color: 'var(--ink-3)' }}>
            <Loader size={24} className="spin" />
            <p className="mono" style={{ fontSize: 11, letterSpacing: '0.15em' }}>FINDING TRIP…</p>
          </div>
        )}

        {isError && (
          <>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
            <p className="eyebrow" style={{ marginBottom: 12 }}>TRIP NOT FOUND</p>
            <p style={{ fontFamily: 'var(--f-sans)', fontSize: 14, color: 'var(--ink-2)', marginBottom: 28, maxWidth: 280 }}>
              Double-check the code and try again.
            </p>
            <button className="btn-ghost" onClick={() => navigate('/')}>← Back home</button>
          </>
        )}

        {!isLoading && !isError && alreadyMember && (
          <>
            <div style={{ fontSize: 48, marginBottom: 18 }}>✈️</div>
            <p className="eyebrow" style={{ marginBottom: 12 }}>ALREADY ON BOARD</p>
            <ItalicLastWord text={trip!.name} fontSize={40} />
            <p style={{ fontFamily: 'var(--f-sans)', fontSize: 14, color: 'var(--ink-2)', margin: '16px 0 28px' }}>
              You're already part of this trip.
            </p>
            <button
              className="btn-primary coral"
              style={{ justifyContent: 'center', padding: '15px 32px', fontSize: 15 }}
              onClick={() => navigate(`/trip/${trip!.id}`)}
            >
              Go to trip →
            </button>
          </>
        )}

        {!isLoading && !isError && !alreadyMember && (
          <>
            <div style={{ fontSize: 48, marginBottom: 18 }}>✈️</div>
            <p className="eyebrow" style={{ marginBottom: 12 }}>YOU'RE INVITED TO</p>
            <ItalicLastWord text={trip!.name} fontSize={40} />

            {/* Avatar stack */}
            {members.length > 0 && (
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: 24, marginBottom: 12 }}>
                {visibleMembers.map((m, i) => {
                  const { bg, fg } = avatarColors(m.display_name)
                  return (
                    <div
                      key={m.id}
                      className="avatar"
                      style={{
                        width: 38, height: 38, background: bg, color: fg,
                        fontSize: 15, marginLeft: i === 0 ? 0 : -10,
                        boxShadow: '0 0 0 2px var(--paper)',
                      }}
                    >
                      {m.display_name[0].toUpperCase()}
                    </div>
                  )
                })}
                {extraCount > 0 && (
                  <div style={{
                    marginLeft: -10, width: 38, height: 38, borderRadius: '50%',
                    background: 'var(--paper-3)', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontSize: 11, color: 'var(--ink-2)',
                    fontFamily: 'var(--f-mono)', fontWeight: 600,
                    boxShadow: '0 0 0 2px var(--paper)',
                  }}>
                    +{extraCount}
                  </div>
                )}
              </div>
            )}

            <p style={{ fontFamily: 'var(--f-sans)', fontSize: 13, color: 'var(--ink-2)', marginBottom: 32 }}>
              {members.length > 0
                ? `${members.map(m => m.display_name).slice(0, 2).join(', ')}${members.length > 2 ? ` and ${members.length - 2} other${members.length - 2 !== 1 ? 's' : ''}` : ''} ${members.length === 1 ? 'is' : 'are'} planning a trip.`
                : 'Be the first to join this trip.'}
            </p>

            <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: 320, textAlign: 'left' }}>
              <p className="eyebrow" style={{ marginBottom: 8, textAlign: 'left' }}>WHAT SHOULD WE CALL YOU?</p>
              <input
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                placeholder="e.g. Sarah, Uncle Dave…"
                autoFocus
                required
                className="input-underline"
                style={{ fontSize: 17, marginBottom: 28, textAlign: 'left' }}
              />

              <button
                type="submit"
                disabled={!displayName.trim() || joinTrip.isPending}
                className="btn-primary coral"
                style={{ width: '100%', justifyContent: 'center', padding: '15px 32px', fontSize: 15, marginBottom: 10 }}
              >
                {joinTrip.isPending
                  ? <><Loader size={15} className="spin" /> Joining…</>
                  : 'Join the trip →'}
              </button>

              <div style={{ textAlign: 'center', marginTop: 8 }}>
                <button type="button" className="btn-text" onClick={() => navigate('/')}>DECLINE</button>
              </div>
            </form>
          </>
        )}
      </div>
    </DocContainer>
  )
}
