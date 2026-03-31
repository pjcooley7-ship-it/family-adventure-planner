import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { ArrowLeft, RefreshCw } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useTrip, useTripMembers } from '@/hooks/useTrip'
import { useDestinations, useTripVotes, useToggleVote } from '@/hooks/useDestinations'
import { useAuth } from '@/hooks/useAuth'
import type { Destination } from '@/integrations/supabase/types'

type GeneratingStatus = 'idle' | 'generating' | 'done' | 'error'

export default function ResultsPage() {
  const { tripId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [status, setStatus] = useState<GeneratingStatus>('idle')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const hasTriggered = useRef(false)
  const queryClient = useQueryClient()

  const { data: trip } = useTrip(tripId!)
  const { data: members = [] } = useTripMembers(tripId!)
  const { data: destinations = [], isLoading: destLoading } = useDestinations(tripId!)
  const { data: votes = [] } = useTripVotes(tripId!)
  const toggleVote = useToggleVote(tripId!)

  // Auto-trigger generation once if no destinations exist
  useEffect(() => {
    if (destLoading) return
    if (destinations.length > 0) { setStatus('done'); return }
    if (hasTriggered.current) return

    hasTriggered.current = true
    runGeneration()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [destLoading, destinations.length])

  async function runGeneration() {
    setStatus('generating')
    setErrorMsg(null)

    const { data, error } = await supabase.functions.invoke('find-destinations', {
      body: { tripId },
    })

    if (error) {
      // Try to extract the real error message from the function response body
      let message = 'Something went wrong — please try again.'
      try {
        const body = await (error as { context?: Response }).context?.json?.()
        if (body?.error) message = body.error
      } catch { /* use default */ }
      setStatus('error')
      setErrorMsg(message)
      toast.error(message)
      return
    }

    if (data?.error) {
      setStatus('error')
      setErrorMsg(data.error)
      toast.error(data.error)
      return
    }

    await queryClient.invalidateQueries({ queryKey: ['destinations', tripId] })
    setStatus('done')
  }

  function handleRerun() {
    hasTriggered.current = true
    runGeneration()
  }

  const myVote = votes.find(v => v.user_id === user?.id)

  // ── Loading / generating screens ──────────────────────────────────────────

  if (status === 'generating') {
    return <GeneratingScreen tripName={trip?.name} />
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen topo-curves flex flex-col items-center justify-center gap-6 px-4" style={{ background: '#060d1f' }}>
        <p style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: '#f2eadb', textAlign: 'center' }}>
          Something went wrong
        </p>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'rgba(242,234,219,0.45)', maxWidth: 400, textAlign: 'center', lineHeight: 1.7 }}>
          {errorMsg}
        </p>
        <div className="flex gap-4">
          <button
            onClick={() => navigate(`/trip/${tripId}`)}
            style={{ fontFamily: 'var(--font-body)', fontSize: 12, letterSpacing: '0.15em', color: 'rgba(242,234,219,0.4)', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            ← BACK
          </button>
          <button
            onClick={handleRerun}
            style={{ fontFamily: 'var(--font-body)', fontSize: 12, letterSpacing: '0.15em', color: '#060d1f', background: '#c9952a', border: 'none', cursor: 'pointer', padding: '12px 24px' }}
          >
            TRY AGAIN
          </button>
        </div>
      </div>
    )
  }

  // ── Results ───────────────────────────────────────────────────────────────

  const isCreator = trip?.created_by === user?.id

  return (
    <div className="min-h-screen topo-curves" style={{ background: '#060d1f' }}>

      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-5" style={{ borderBottom: '1px solid rgba(201,149,42,0.1)' }}>
        <button
          onClick={() => navigate(`/trip/${tripId}`)}
          className="flex items-center gap-2 opacity-50 hover:opacity-100 transition-opacity"
          style={{ fontFamily: 'var(--font-body)', fontSize: 12, letterSpacing: '0.15em', color: '#f2eadb', background: 'none', border: 'none', cursor: 'pointer' }}
        >
          <ArrowLeft size={14} />
          BACK TO TRIP
        </button>

        <span style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: '#c9952a', letterSpacing: '0.2em', fontStyle: 'italic' }}>
          Wanderlust
        </span>

        {isCreator && destinations.length > 0 && (
          <button
            onClick={handleRerun}
            className="flex items-center gap-2 opacity-50 hover:opacity-100 transition-opacity"
            style={{ fontFamily: 'var(--font-body)', fontSize: 11, letterSpacing: '0.15em', color: '#c9952a', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            <RefreshCw size={13} />
            RE-RUN
          </button>
        )}
        {!isCreator && <div style={{ width: 80 }} />}
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-12">

        {/* Header */}
        <div className="text-center mb-14 animate-fade-up">
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 10, letterSpacing: '0.3em', color: 'rgba(201,149,42,0.5)', marginBottom: 10 }}>
            AI RECOMMENDATIONS · {trip?.name?.toUpperCase()}
          </p>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.2rem, 6vw, 4rem)', fontWeight: 300, color: '#f2eadb', lineHeight: 1.1 }}>
            Your <em style={{ color: '#c9952a' }}>destinations</em>
          </h1>
          <p style={{ marginTop: 14, fontFamily: 'var(--font-body)', fontSize: 13, color: 'rgba(242,234,219,0.4)', lineHeight: 1.7 }}>
            Each traveler gets one vote. The group's choice appears below.
          </p>
        </div>

        {/* Destination cards */}
        <div className="flex flex-col gap-6">
          {destinations.map((dest, i) => (
            <DestinationCard
              key={dest.id}
              destination={dest}
              rank={dest.rank ?? i + 1}
              voteCount={votes.filter(v => v.destination_id === dest.id).length}
              totalMembers={members.length}
              myVoteDestinationId={myVote?.destination_id ?? null}
              onVote={(isCurrentlyVoted) => toggleVote.mutate({ destinationId: dest.id, isCurrentlyVoted })}
              isVoting={toggleVote.isPending}
            />
          ))}
        </div>

        {/* Vote tally summary */}
        {votes.length > 0 && (
          <div
            className="mt-10 animate-fade-up"
            style={{ border: '1px solid rgba(201,149,42,0.15)', background: 'rgba(13,24,48,0.5)', padding: '24px 28px' }}
          >
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 10, letterSpacing: '0.25em', color: 'rgba(201,149,42,0.5)', marginBottom: 14 }}>
              GROUP VOTES · {votes.length} OF {members.length} CAST
            </p>
            <div className="flex flex-col gap-3">
              {destinations.map(dest => {
                const count = votes.filter(v => v.destination_id === dest.id).length
                const pct = members.length > 0 ? (count / members.length) * 100 : 0
                const isLeading = count === Math.max(...destinations.map(d => votes.filter(v => v.destination_id === d.id).length))
                return (
                  <div key={dest.id}>
                    <div className="flex justify-between mb-1">
                      <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: isLeading && count > 0 ? '#c9952a' : 'rgba(242,234,219,0.5)' }}>
                        {dest.city}
                        {isLeading && count > 0 && <span style={{ marginLeft: 8, fontSize: 10, letterSpacing: '0.1em', color: 'rgba(201,149,42,0.6)' }}>LEADING</span>}
                      </span>
                      <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'rgba(242,234,219,0.35)' }}>
                        {count} vote{count !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <div style={{ height: 3, background: 'rgba(201,149,42,0.1)', borderRadius: 2 }}>
                      <div style={{
                        height: '100%',
                        width: `${pct}%`,
                        background: isLeading && count > 0 ? 'linear-gradient(90deg, #c9952a, #e8b84b)' : 'rgba(201,149,42,0.3)',
                        borderRadius: 2,
                        transition: 'width 0.6s ease',
                      }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

/* ─── Destination card ────────────────────────────────────────────────────── */

function DestinationCard({
  destination,
  rank,
  voteCount,
  totalMembers,
  myVoteDestinationId,
  onVote,
  isVoting,
}: {
  destination: Destination
  rank: number
  voteCount: number
  totalMembers: number
  myVoteDestinationId: string | null
  onVote: (isCurrentlyVoted: boolean) => void
  isVoting: boolean
}) {
  const isMyVote = myVoteDestinationId === destination.id
  const score = destination.match_score ?? 0

  return (
    <div
      className="animate-fade-up"
      style={{
        border: `1px solid ${isMyVote ? 'rgba(201,149,42,0.5)' : 'rgba(201,149,42,0.15)'}`,
        background: isMyVote ? 'rgba(201,149,42,0.05)' : 'rgba(13,24,48,0.6)',
        transition: 'border-color 0.3s, background 0.3s',
      }}
    >
      {/* Card top bar */}
      <div
        className="flex items-center justify-between px-6 py-3"
        style={{ borderBottom: '1px solid rgba(201,149,42,0.1)' }}
      >
        <div className="flex items-center gap-3">
          <span
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 11,
              letterSpacing: '0.15em',
              color: 'rgba(201,149,42,0.5)',
              border: '1px solid rgba(201,149,42,0.25)',
              padding: '2px 8px',
            }}
          >
            #{rank}
          </span>
          {destination.country_code && (
            <span style={{ fontSize: 20 }}>
              {countryCodeToFlag(destination.country_code)}
            </span>
          )}
        </div>

        {/* Match score */}
        <div className="flex items-center gap-3">
          <div style={{ width: 80, height: 3, background: 'rgba(201,149,42,0.1)', borderRadius: 2 }}>
            <div style={{
              height: '100%',
              width: `${score}%`,
              background: 'linear-gradient(90deg, #c9952a, #e8b84b)',
              borderRadius: 2,
            }} />
          </div>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: '#c9952a', fontWeight: 600 }}>
            {Math.round(score)}%
          </span>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 10, letterSpacing: '0.15em', color: 'rgba(201,149,42,0.4)' }}>
            MATCH
          </span>
        </div>
      </div>

      {/* Card body */}
      <div className="px-6 py-6">
        <h2 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(2rem, 5vw, 3rem)',
          fontWeight: 300,
          color: '#f2eadb',
          lineHeight: 1,
          marginBottom: 4,
        }}>
          {destination.city}
        </h2>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'rgba(242,234,219,0.4)', marginBottom: 20, letterSpacing: '0.05em' }}>
          {destination.country}
        </p>

        {destination.ai_reasoning && (
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: 14,
            color: 'rgba(242,234,219,0.6)',
            lineHeight: 1.75,
            borderLeft: '2px solid rgba(201,149,42,0.25)',
            paddingLeft: 16,
          }}>
            {destination.ai_reasoning}
          </p>
        )}
      </div>

      {/* Card footer — vote */}
      <div
        className="flex items-center justify-between px-6 py-4"
        style={{ borderTop: '1px solid rgba(201,149,42,0.1)' }}
      >
        <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'rgba(242,234,219,0.3)' }}>
          {voteCount} of {totalMembers} vote{totalMembers !== 1 ? 's' : ''}
        </span>

        <button
          onClick={() => onVote(isMyVote)}
          disabled={isVoting}
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 11,
            letterSpacing: '0.15em',
            color: isMyVote ? '#060d1f' : '#c9952a',
            background: isMyVote ? '#c9952a' : 'transparent',
            border: `1px solid ${isMyVote ? '#c9952a' : 'rgba(201,149,42,0.4)'}`,
            cursor: isVoting ? 'wait' : 'pointer',
            padding: '8px 20px',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => { if (!isMyVote) e.currentTarget.style.background = 'rgba(201,149,42,0.1)' }}
          onMouseLeave={e => { if (!isMyVote) e.currentTarget.style.background = 'transparent' }}
        >
          {isMyVote ? '✓ MY VOTE' : 'VOTE FOR THIS'}
        </button>
      </div>
    </div>
  )
}

/* ─── Generating screen ───────────────────────────────────────────────────── */

function GeneratingScreen({ tripName }: { tripName?: string }) {
  const phrases = [
    'Consulting the atlas…',
    'Weighing the winds…',
    'Charting common ground…',
    'Scanning flight paths…',
    'Balancing the scales…',
  ]
  const [phraseIndex, setPhraseIndex] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setPhraseIndex(i => (i + 1) % phrases.length), 2200)
    return () => clearInterval(t)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="min-h-screen topo-curves flex flex-col items-center justify-center gap-8 px-4" style={{ background: '#060d1f' }}>
      {/* Compass animation */}
      <div style={{ position: 'relative', width: 80, height: 80 }}>
        <svg viewBox="0 0 80 80" width="80" height="80">
          <circle cx="40" cy="40" r="36" fill="none" stroke="rgba(201,149,42,0.15)" strokeWidth="1" />
          <circle cx="40" cy="40" r="36" fill="none" stroke="rgba(201,149,42,0.6)" strokeWidth="1"
            strokeDasharray="226" strokeDashoffset="56"
            style={{ animation: 'spin 3s linear infinite', transformOrigin: '40px 40px' }}
          />
          {/* N/S/E/W */}
          {[['N', 40, 10], ['S', 40, 72], ['E', 72, 43], ['W', 6, 43]].map(([l, x, y]) => (
            <text key={l as string} x={x as number} y={y as number} textAnchor="middle"
              style={{ fontFamily: 'var(--font-body)', fontSize: 9, fill: 'rgba(201,149,42,0.4)', letterSpacing: '0.05em' }}>
              {l}
            </text>
          ))}
          {/* Needle */}
          <line x1="40" y1="16" x2="40" y2="40" stroke="#c9952a" strokeWidth="1.5" strokeLinecap="round"
            style={{ animation: 'spin 6s ease-in-out infinite', transformOrigin: '40px 40px' }} />
          <line x1="40" y1="40" x2="40" y2="60" stroke="rgba(201,149,42,0.3)" strokeWidth="1" strokeLinecap="round"
            style={{ animation: 'spin 6s ease-in-out infinite', transformOrigin: '40px 40px' }} />
          <circle cx="40" cy="40" r="3" fill="#c9952a" />
        </svg>
      </div>

      <div className="text-center">
        {tripName && (
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 10, letterSpacing: '0.3em', color: 'rgba(201,149,42,0.4)', marginBottom: 12 }}>
            {tripName.toUpperCase()}
          </p>
        )}
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', fontWeight: 300, color: '#f2eadb', marginBottom: 12 }}>
          Finding your <em style={{ color: '#c9952a' }}>common ground</em>
        </h2>
        <p
          key={phraseIndex}
          style={{
            fontFamily: 'var(--font-body)', fontSize: 14, color: 'rgba(242,234,219,0.4)',
            animation: 'fade-in 0.5s ease',
          }}
        >
          {phrases[phraseIndex]}
        </p>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}

/* ─── Utility ─────────────────────────────────────────────────────────────── */

function countryCodeToFlag(code: string): string {
  return code.toUpperCase().split('').map(c =>
    String.fromCodePoint(0x1F1E0 - 65 + c.charCodeAt(0))
  ).join('')
}
