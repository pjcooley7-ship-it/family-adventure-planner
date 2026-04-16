import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { toast } from 'sonner'
import { ArrowLeft, RotateCcw, Plane, Clock, AlertCircle } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useTrip, useTripMembers } from '@/hooks/useTrip'
import { useDestinations, useTripVotes, useToggleVote } from '@/hooks/useDestinations'
import { useLockDestination } from '@/hooks/useTripMutations'
import { useFlightResults, useSearchFlights } from '@/hooks/useFlights'
import { useAuth } from '@/hooks/useAuth'
import type { FlightResult, Destination } from '@/integrations/supabase/types'
import { DocContainer } from '@/components/DocContainer'
import { countryCodeToFlag } from '@/lib/utils'

type GeneratingStatus = 'idle' | 'generating' | 'done' | 'error'

export default function ResultsPage() {
  const { tripId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()

  const [status, setStatus] = useState<GeneratingStatus>('idle')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [selectedRun, setSelectedRun] = useState<number | null>(null)
  const hasTriggered = useRef(false)
  const queryClient = useQueryClient()

  const { data: trip } = useTrip(tripId!)
  const { data: members = [] } = useTripMembers(tripId!)
  const { data: allDestinations = [], isLoading: destLoading } = useDestinations(tripId!)
  const { data: votes = [] } = useTripVotes(tripId!)
  const toggleVote = useToggleVote(tripId!)
  const lockDestination = useLockDestination(tripId!)
  const searchFlights = useSearchFlights(tripId!)
  const { data: flightResults = [] } = useFlightResults(
    tripId!,
    trip?.decided_destination_id ?? null,
  )

  // ── Derive run groups ─────────────────────────────────────────────────────
  const runNumbers = [...new Set(allDestinations.map(d => d.run_number))].sort((a, b) => a - b)
  const latestRun = runNumbers.length > 0 ? runNumbers[runNumbers.length - 1] : 1
  const activeRun = selectedRun ?? latestRun
  const destinations = allDestinations.filter(d => d.run_number === activeRun)

  // ── Decided state ─────────────────────────────────────────────────────────
  const isDecided = trip?.status === 'decided'
  const isCreator = trip?.created_by === user?.id
  const decidedDestination = isDecided && trip?.decided_destination_id
    ? allDestinations.find(d => d.id === trip.decided_destination_id) ?? null
    : null

  useEffect(() => {
    if (destLoading) return
    if (allDestinations.length > 0) { setStatus('done'); return }
    if (hasTriggered.current) return

    hasTriggered.current = true
    runGeneration()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [destLoading, allDestinations.length])

  // When a new run lands, switch to it automatically
  useEffect(() => {
    if (runNumbers.length > 0) setSelectedRun(latestRun)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [latestRun])

  async function runGeneration() {
    setStatus('generating')
    setErrorMsg(null)

    // Get a fresh token — refreshSession exchanges the refresh token for a new access token
    const { data: refreshed, error: refreshError } = await supabase.auth.refreshSession()
    if (refreshError || !refreshed.session) {
      navigate('/auth', { state: { from: location } })
      return
    }
    const accessToken = refreshed.session.access_token

    // Use fetch directly so we control the Authorization header — functions.invoke
    // re-calls getSession() internally and can send a stale token if the cache hasn't
    // updated yet.
    const fnUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/find-destinations`
    let fnResponse: Response
    let fnBody: unknown
    try {
      fnResponse = await fetch(fnUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({ tripId }),
      })
      fnBody = await fnResponse.json()
    } catch (fetchErr) {
      console.error('[find-destinations] fetch threw:', fetchErr)
      setStatus('error')
      setErrorMsg('Network error — check your connection and try again.')
      return
    }
    const data = fnResponse!.ok ? fnBody : null
    const error = fnResponse!.ok ? null : { message: (fnBody as { error?: string })?.error ?? 'Unknown error' }

    if (error) {
      const message = (error as { message?: string }).message ?? 'Something went wrong — please try again.'
      console.error('[find-destinations] error:', message)
      setStatus('error')
      setErrorMsg(message)
      toast.error(message)
      return
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((data as any)?.error) {
      setStatus('error')
      setErrorMsg((data as any).error)
      toast.error((data as any).error)
      return
    }

    await queryClient.invalidateQueries({ queryKey: ['destinations', tripId] })
    setStatus('done')
  }

  function handleRerun() {
    hasTriggered.current = true
    runGeneration()
  }

  // Votes scoped to currently-viewed run's destinations
  const runDestinationIds = new Set(destinations.map(d => d.id))
  const runVotes = votes.filter(v => runDestinationIds.has(v.destination_id))
  const myVote = runVotes.find(v => v.user_id === user?.id)

  // ── Majority detection (latest run only) ──────────────────────────────────
  const latestRunDests = allDestinations.filter(d => d.run_number === latestRun)
  const latestRunDestIds = new Set(latestRunDests.map(d => d.id))
  const latestRunVotes = votes.filter(v => latestRunDestIds.has(v.destination_id))
  const latestVoteCounts = new Map(
    latestRunDests.map(d => [d.id, latestRunVotes.filter(v => v.destination_id === d.id).length])
  )
  const leadingDest = latestRunDests.length > 0
    ? latestRunDests.reduce((best, d) =>
        (latestVoteCounts.get(d.id) ?? 0) > (latestVoteCounts.get(best.id) ?? 0) ? d : best
      )
    : null
  const leadingVotes = leadingDest ? (latestVoteCounts.get(leadingDest.id) ?? 0) : 0
  const hasMajority = members.length > 0 && leadingVotes > members.length / 2

  // ── Generating screen ─────────────────────────────────────────────────────

  if (status === 'generating') {
    return <GeneratingScreen tripName={trip?.name} />
  }

  // ── Error screen ──────────────────────────────────────────────────────────

  if (status === 'error') {
    return (
      <DocContainer>
        <nav style={{
          padding: '20px 32px',
          borderBottom: '2.5px solid var(--color-ink)',
          display: 'flex', alignItems: 'center',
        }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 600, color: 'var(--color-ink)', letterSpacing: '-0.3px' }}>
            Wanderlust
          </span>
        </nav>
        <div style={{ padding: '60px 32px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <p className="brut-label" style={{ marginBottom: 12 }}>ERROR</p>
          <h2 style={{
            fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 600,
            color: 'var(--color-ink)', marginBottom: 12, letterSpacing: '-0.4px',
          }}>
            Something went wrong
          </h2>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--color-ink-2)', lineHeight: 1.7, marginBottom: 28, maxWidth: 380 }}>
            {errorMsg}
          </p>
          <div style={{ display: 'flex', gap: 12 }}>
            <button
              onClick={() => navigate(`/trip/${tripId}`)}
              style={{
                fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase',
                color: 'var(--color-ink-2)', background: 'none', border: 'none', cursor: 'pointer',
              }}
            >
              ← BACK
            </button>
            <button onClick={handleRerun} className="brut-btn-primary" style={{ fontSize: 12 }}>
              TRY AGAIN
            </button>
          </div>
        </div>
      </DocContainer>
    )
  }

  // ── Results ───────────────────────────────────────────────────────────────

  const voteCounts = new Map(destinations.map(d => [d.id, runVotes.filter(v => v.destination_id === d.id).length]))
  const maxVotesInRun = Math.max(0, ...voteCounts.values())
  void Math.max(0, ...voteCounts.values()) // maxVotes — kept for future use

  // ── Decided full page ─────────────────────────────────────────────────────
  if (isDecided && decidedDestination) {
    const hasFlights = flightResults.length > 0
    return (
      <DocContainer>
        <nav style={{
          padding: '20px 32px',
          borderBottom: '2.5px solid var(--color-ink)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <button
            onClick={() => navigate(`/trip/${tripId}`)}
            className="flex items-center gap-2"
            style={{
              fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase',
              color: 'var(--color-ink-2)', background: 'none', border: 'none', cursor: 'pointer',
            }}
          >
            <ArrowLeft size={12} />
            BACK
          </button>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 600, color: 'var(--color-ink)', letterSpacing: '-0.3px' }}>
            Wanderlust
          </span>
          <div style={{ width: 60 }} />
        </nav>

        {/* Destination banner */}
        <section style={{
          margin: '32px 32px 0',
          border: '2.5px solid var(--color-ink)',
          background: 'var(--color-accent)',
          boxShadow: '6px 6px 0 var(--color-ink)',
        }}>
          <div style={{ padding: '10px 20px', borderBottom: '2.5px solid var(--color-ink)', background: 'var(--color-ink)' }}>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.15em', color: 'var(--color-bg)', textTransform: 'uppercase' }}>
              DESTINATION LOCKED IN
            </p>
          </div>
          <div style={{ padding: '28px 24px' }}>
            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(2rem, 8vw, 3.5rem)',
              fontWeight: 600,
              color: 'var(--color-bg)',
              lineHeight: 1.05,
              letterSpacing: '-0.8px',
              marginBottom: 6,
            }}>
              {decidedDestination.city}
            </h1>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: 'rgba(255,253,247,0.8)', marginBottom: 20 }}>
              {decidedDestination.country}
            </p>
            {decidedDestination.ai_reasoning && (
              <p style={{
                fontFamily: 'var(--font-body)', fontSize: 13, color: 'rgba(255,253,247,0.75)',
                lineHeight: 1.75, borderLeft: '3px solid rgba(255,253,247,0.4)', paddingLeft: 14, marginBottom: 16,
              }}>
                {decidedDestination.ai_reasoning}
              </p>
            )}
            {decidedDestination.vibe_tags && decidedDestination.vibe_tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {decidedDestination.vibe_tags.map((tag: string) => (
                  <span key={tag} style={{
                    fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase',
                    padding: '3px 8px', border: '2px solid rgba(255,253,247,0.5)', color: 'rgba(255,253,247,0.9)',
                  }}>
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Flights section */}
        <section style={{ padding: '32px 32px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div>
              <p className="brut-label" style={{ marginBottom: 4 }}>FLIGHTS PER TRAVELER</p>
              {decidedDestination.destination_iata && (
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-ink-3)' }}>
                  ARRIVING AT {decidedDestination.destination_iata}
                </p>
              )}
            </div>
            <button
              onClick={() => searchFlights.mutate()}
              disabled={searchFlights.isPending}
              className="brut-btn-primary"
              style={{ fontSize: 11, padding: '9px 16px' }}
            >
              <Plane size={11} style={{ marginRight: 6 }} />
              {searchFlights.isPending
                ? 'SEARCHING…'
                : hasFlights ? 'REFRESH' : 'SEARCH FLIGHTS'}
            </button>
          </div>

          {!hasFlights && !searchFlights.isPending && (
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--color-ink-3)', lineHeight: 1.6, marginBottom: 24 }}>
              Search for the cheapest round-trip flight per traveler based on their submitted dates and origin airport.
            </p>
          )}

          {searchFlights.isPending && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
              {[1, 2].map(i => (
                <div key={i} style={{
                  border: '2.5px solid var(--color-ink)', padding: '16px 20px',
                  background: 'var(--color-surface)', opacity: 0.5,
                  display: 'flex', alignItems: 'center', gap: 12,
                }}>
                  <div style={{
                    width: 16, height: 16, border: '2px solid var(--color-ink)',
                    borderTopColor: 'transparent', borderRadius: 0,
                    animation: 'spin 1s linear infinite',
                  }} />
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-ink-2)' }}>
                    SEARCHING…
                  </span>
                </div>
              ))}
            </div>
          )}

          {hasFlights && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
              {flightResults.map(result => (
                <FlightCard key={result.id} result={result} destinationIata={decidedDestination.destination_iata ?? undefined} />
              ))}
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-ink-3)', textAlign: 'right', marginTop: 4 }}>
                PRICES AS OF {new Date(flightResults[0]?.fetched_at ?? '').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} · REFRESH TO UPDATE
              </p>
            </div>
          )}
        </section>

        <footer style={{
          borderTop: '2.5px solid var(--color-ink)', margin: '16px 0 0',
          padding: '16px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
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

  return (
    <DocContainer>

      {/* Nav */}
      <nav style={{
        padding: '20px 32px',
        borderBottom: '2.5px solid var(--color-ink)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <button
          onClick={() => navigate(`/trip/${tripId}`)}
          className="flex items-center gap-2"
          style={{
            fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase',
            color: 'var(--color-ink-2)', background: 'none', border: 'none', cursor: 'pointer',
          }}
        >
          <ArrowLeft size={12} />
          BACK
        </button>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 600, color: 'var(--color-ink)', letterSpacing: '-0.3px' }}>
          Wanderlust
        </span>
        <div style={{ width: 60 }} />
      </nav>

      {/* Header */}
      <section style={{ padding: '36px 32px 28px', borderBottom: '2.5px solid var(--color-ink)' }}>
        <p className="brut-label animate-fade-up" style={{ marginBottom: 10 }}>
          AI RECOMMENDATIONS · {trip?.name?.toUpperCase()}
        </p>
        <h1
          className="animate-fade-up delay-100"
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(1.8rem, 6vw, 2.8rem)',
            fontWeight: 600,
            color: 'var(--color-ink)',
            lineHeight: 1.1,
            letterSpacing: '-0.6px',
            marginBottom: 10,
          }}
        >
          Your destinations
        </h1>
        <p className="animate-fade-up delay-200" style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--color-ink-2)', lineHeight: 1.6 }}>
          Each traveler gets one vote. The group's choice appears below.
        </p>
      </section>

      {/* Run history tabs — shown only when >1 run exists */}
      {runNumbers.length > 1 && (
        <div style={{
          display: 'flex',
          borderBottom: '2.5px solid var(--color-ink)',
          overflowX: 'auto',
        }}>
          {runNumbers.map(run => {
            const isActive = run === activeRun
            return (
              <button
                key={run}
                onClick={() => setSelectedRun(run)}
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 10,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  padding: '12px 20px',
                  background: isActive ? 'var(--color-ink)' : 'transparent',
                  color: isActive ? 'var(--color-bg)' : 'var(--color-ink-3)',
                  border: 'none',
                  borderRight: '2.5px solid var(--color-ink)',
                  cursor: 'pointer',
                  flexShrink: 0,
                  transition: 'background 150ms ease, color 150ms ease',
                }}
              >
                RUN {run}{run === latestRun ? ' ·  LATEST' : ''}
              </button>
            )
          })}
        </div>
      )}

      {/* Majority prompt — creator only, latest run, not yet decided */}
      {!isDecided && isCreator && hasMajority && leadingDest && activeRun === latestRun && (
        <div style={{
          margin: '0 32px',
          marginTop: 24,
          border: '2.5px solid var(--color-ink)',
          background: 'var(--color-surface)',
          boxShadow: '4px 4px 0 var(--color-ink)',
          padding: '16px 20px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
        }}>
          <div>
            <p className="brut-label" style={{ marginBottom: 4 }}>MAJORITY REACHED</p>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--color-ink-2)', lineHeight: 1.5 }}>
              <strong style={{ color: 'var(--color-ink)' }}>{leadingDest.city}</strong> has the majority.
              Lock it in as the group's choice?
            </p>
          </div>
          <button
            onClick={() => lockDestination.mutate(leadingDest.id)}
            disabled={lockDestination.isPending}
            className="brut-btn-primary"
            style={{ fontSize: 11, padding: '9px 18px', flexShrink: 0 }}
          >
            {lockDestination.isPending ? 'LOCKING…' : "LOCK IT IN"}
          </button>
        </div>
      )}

      {/* Destination cards */}
      <section style={{ padding: '24px 32px', borderBottom: '2.5px solid var(--color-ink)' }}>
        <div className="flex flex-col gap-4">
          {destinations.map((dest, i) => (
            <DestinationCard
              key={dest.id}
              destination={dest}
              rank={dest.rank ?? i + 1}
              voteCount={voteCounts.get(dest.id) ?? 0}
              totalMembers={members.length}
              myVoteDestinationId={myVote?.destination_id ?? null}
              onVote={(isCurrentlyVoted) => toggleVote.mutate({ destinationId: dest.id, isCurrentlyVoted })}
              isVoting={toggleVote.isPending}
              isDecided={isDecided}
              isLeading={!isDecided && activeRun === latestRun && (voteCounts.get(dest.id) ?? 0) === maxVotesInRun && maxVotesInRun > 0}
            />
          ))}
        </div>

        {/* None of these — available to all members, hidden when decided */}
        {!isDecided && destinations.length > 0 && (
          <div style={{
            marginTop: 24,
            paddingTop: 20,
            borderTop: '2.5px dashed var(--color-ink-3)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 10,
          }}>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--color-ink-2)', textAlign: 'center' }}>
              Not feeling any of these?
            </p>
            <button
              onClick={handleRerun}
              className="flex items-center gap-2"
              style={{
                fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase',
                color: 'var(--color-ink)', background: 'none',
                border: '2.5px solid var(--color-ink)',
                padding: '9px 16px',
                cursor: 'pointer',
                transition: 'box-shadow 150ms ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = '3px 3px 0 var(--color-ink)' }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none' }}
            >
              <RotateCcw size={11} />
              NONE OF THESE — TRY AGAIN
            </button>
          </div>
        )}
      </section>

      {/* Vote tally — scoped to active run */}
      {runVotes.length > 0 && (
        <section style={{ padding: '24px 32px', borderBottom: '2.5px solid var(--color-ink)' }}>
          <p className="brut-label" style={{ marginBottom: 16 }}>
            GROUP VOTES · {runVotes.length} OF {members.length} CAST
          </p>
          <div className="flex flex-col gap-4">
            {destinations.map(dest => {
              const count = voteCounts.get(dest.id) ?? 0
              const pct = members.length > 0 ? (count / members.length) * 100 : 0
              const isLeading = count === maxVotesInRun && count > 0
              return (
                <div key={dest.id}>
                  <div className="flex justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span style={{ fontFamily: 'var(--font-body)', fontWeight: 500, fontSize: 13, color: 'var(--color-ink)' }}>
                        {dest.city}
                      </span>
                      {isLeading && <span className="badge-positive">LEADING</span>}
                    </div>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-ink-3)' }}>
                      {count} vote{count !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div style={{ height: 4, background: 'var(--border-soft)' }}>
                    <div style={{
                      height: '100%',
                      width: `${pct}%`,
                      background: isLeading ? 'var(--color-green)' : 'var(--color-ink-3)',
                      transition: 'width 0.6s ease',
                    }} />
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}

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
  isDecided,
  isLeading,
}: {
  destination: Destination
  rank: number
  voteCount: number
  totalMembers: number
  myVoteDestinationId: string | null
  onVote: (isCurrentlyVoted: boolean) => void
  isVoting: boolean
  isDecided: boolean
  isLeading: boolean
}) {
  const isMyVote = myVoteDestinationId === destination.id
  const score = destination.match_score ?? 0

  return (
    <div
      className="animate-fade-up brut-card"
      style={{
        border: '2.5px solid var(--color-ink)',
        background: isMyVote ? 'var(--color-surface-2)' : 'var(--color-bg)',
        opacity: isDecided ? 0.45 : 1,
        transition: 'opacity 300ms ease',
      }}
    >
      {/* Top bar — rank + flag + match score */}
      <div
        className="flex items-center justify-between px-5 py-3"
        style={{ borderBottom: '2.5px solid var(--color-ink)' }}
      >
        <div className="flex items-center gap-3">
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em',
            color: 'var(--color-ink)', border: '2.5px solid var(--color-ink)', padding: '2px 8px',
          }}>
            #{rank}
          </span>
          {isLeading && !isDecided && (
            <span className="badge-positive">LEADING</span>
          )}
          {destination.country_code && (
            <span style={{ fontSize: 18 }}>{countryCodeToFlag(destination.country_code)}</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div style={{ width: 64, height: 4, background: 'var(--border-soft)' }}>
            <div style={{ height: '100%', width: `${score}%`, background: 'var(--color-green)' }} />
          </div>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700, color: 'var(--color-green)' }}>
            {Math.round(score)}%
          </span>
          <span className="brut-label">MATCH</span>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: '20px 20px 16px' }}>
        {/* City + country */}
        <h2 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(1.6rem, 4vw, 2.4rem)',
          fontWeight: 600,
          color: 'var(--color-ink)',
          lineHeight: 1.05,
          letterSpacing: '-0.4px',
          marginBottom: 4,
        }}>
          {destination.city}
        </h2>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--color-ink-2)', marginBottom: 14 }}>
          {destination.country}
        </p>

        {/* Vibe tags */}
        {destination.vibe_tags && destination.vibe_tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5" style={{ marginBottom: 16 }}>
            {destination.vibe_tags.map((tag: string) => (
              <span
                key={tag}
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 9,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  padding: '3px 8px',
                  border: '2px solid var(--color-ink)',
                  color: isMyVote ? 'var(--color-bg)' : 'var(--color-ink)',
                  background: isMyVote ? 'transparent' : 'transparent',
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* AI reasoning */}
        {destination.ai_reasoning && (
          <p style={{
            fontFamily: 'var(--font-body)', fontSize: 13,
            color: 'var(--color-ink-2)',
            lineHeight: 1.75,
            borderLeft: '3px solid var(--color-ink)',
            paddingLeft: 14,
            marginBottom: 16,
          }}>
            {destination.ai_reasoning}
          </p>
        )}

        {/* Meta row — best months + flight note */}
        {(destination.best_months || destination.flight_note) && (
          <div className="flex flex-wrap gap-x-6 gap-y-1.5">
            {destination.best_months && (
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-ink-3)', letterSpacing: '0.05em' }}>
                BEST TIME · {destination.best_months.toUpperCase()}
              </p>
            )}
            {destination.flight_note && (
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-ink-3)', letterSpacing: '0.05em' }}>
                FLIGHT · {destination.flight_note.toUpperCase()}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Footer — vote */}
      <div
        className="flex items-center justify-between px-5 py-3"
        style={{ borderTop: '2.5px solid var(--color-ink)' }}
      >
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-ink-3)', letterSpacing: '0.06em' }}>
          {voteCount} of {totalMembers} vote{totalMembers !== 1 ? 's' : ''}
        </span>

        <button
          onClick={() => onVote(isMyVote)}
          disabled={isVoting || isDecided}
          className="brut-btn-primary"
          style={{ fontSize: 11, padding: '7px 16px', opacity: isDecided ? 0.4 : 1 }}
        >
          {isMyVote ? '✓ MY VOTE' : 'VOTE FOR THIS'}
        </button>
      </div>
    </div>
  )
}

/* ─── Flight card ─────────────────────────────────────────────────────────── */

function FlightCard({ result, destinationIata }: { result: FlightResult; destinationIata?: string }) {
  const hasError = !!result.error_message
  const price = result.price != null
    ? new Intl.NumberFormat('en-US', { style: 'currency', currency: result.currency ?? 'USD', maximumFractionDigits: 0 }).format(result.price)
    : null

  const durationText = result.duration_minutes != null
    ? `${Math.floor(result.duration_minutes / 60)}h ${result.duration_minutes % 60}m`
    : null

  const stopsText = result.stops === 0 ? 'Direct' : `${result.stops} stop${result.stops !== 1 ? 's' : ''}`

  const outDate = result.outbound_date
    ? new Date(result.outbound_date + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
    : null
  const retDate = result.return_date
    ? new Date(result.return_date + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
    : null

  const bookingUrl = !hasError && destinationIata && result.origin_iata && result.outbound_date && result.return_date
    ? `https://www.google.com/flights#flt=${result.origin_iata}.${destinationIata}.${result.outbound_date}*${destinationIata}.${result.origin_iata}.${result.return_date};tt=r`
    : null

  return (
    <div style={{
      border: '2.5px solid var(--color-ink)',
      background: 'var(--color-bg)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '14px 18px', gap: 12,
      opacity: hasError ? 0.6 : 1,
    }}>
      {/* Traveler + route */}
      <div style={{ minWidth: 0 }}>
        <div className="flex items-center gap-2" style={{ marginBottom: 4 }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, color: 'var(--color-ink)' }}>
            {result.origin_iata}
          </span>
          <Plane size={10} style={{ color: 'var(--color-ink-3)', flexShrink: 0 }} />
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--color-ink-2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {result.traveler_name}
          </span>
        </div>
        {hasError ? (
          <div className="flex items-center gap-1.5">
            <AlertCircle size={10} style={{ color: 'var(--color-coral)', flexShrink: 0 }} />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-coral)' }}>
              {result.error_message}
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            {outDate && retDate && (
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-ink-3)' }}>
                {outDate} – {retDate}
              </span>
            )}
            {durationText && (
              <span className="flex items-center gap-1" style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-ink-3)' }}>
                <Clock size={9} />
                {durationText}
              </span>
            )}
            {result.stops != null && (
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: result.stops === 0 ? 'var(--color-green)' : 'var(--color-ink-3)' }}>
                {stopsText}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Price + book */}
      {!hasError && (
        <div style={{ flexShrink: 0, textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
          <div className="flex items-center gap-2">
            {result.airline_logo && (
              <img src={result.airline_logo} alt={result.airline ?? ''} style={{ height: 14 }} />
            )}
            {price && (
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 700, color: 'var(--color-ink)' }}>
                {price}
              </span>
            )}
          </div>
          {bookingUrl && (
            <a
              href={bookingUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase',
                color: 'var(--color-bg)', background: 'var(--color-ink)',
                border: '2px solid var(--color-ink)',
                padding: '3px 8px',
                textDecoration: 'none',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--color-accent)'; e.currentTarget.style.borderColor = 'var(--color-accent)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'var(--color-ink)'; e.currentTarget.style.borderColor = 'var(--color-ink)' }}
            >
              BOOK →
            </a>
          )}
        </div>
      )}
    </div>
  )
}

/* ─── Generating screen ───────────────────────────────────────────────────── */

const GENERATING_PHRASES = [
  'Consulting the atlas…',
  'Weighing the winds…',
  'Charting common ground…',
  'Scanning flight paths…',
  'Balancing the scales…',
]

function GeneratingScreen({ tripName }: { tripName?: string }) {
  const [phraseIndex, setPhraseIndex] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setPhraseIndex(i => (i + 1) % GENERATING_PHRASES.length), 2200)
    return () => clearInterval(t)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <DocContainer>
      <nav style={{
        padding: '20px 32px',
        borderBottom: '2.5px solid var(--color-ink)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 600, color: 'var(--color-ink)', letterSpacing: '-0.3px' }}>
          Wanderlust
        </span>
      </nav>

      <div style={{ padding: '80px 32px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>

        <div style={{
          width: 52, height: 52,
          border: '3px solid var(--color-ink)',
          borderTopColor: 'transparent',
          borderRadius: 0,
          animation: 'spin 1.2s linear infinite',
          marginBottom: 32,
        }} />

        {tripName && (
          <p className="brut-label" style={{ marginBottom: 12 }}>{tripName.toUpperCase()}</p>
        )}
        <h2 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(1.4rem, 4vw, 1.9rem)',
          fontWeight: 600,
          color: 'var(--color-ink)',
          letterSpacing: '-0.4px',
          lineHeight: 1.2,
          marginBottom: 14,
        }}>
          Finding your common ground
        </h2>
        <p
          key={phraseIndex}
          style={{
            fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--color-ink-2)',
            letterSpacing: '0.04em',
            animation: 'fadeIn 0.5s ease',
          }}
        >
          {GENERATING_PHRASES[phraseIndex]}
        </p>
      </div>
    </DocContainer>
  )
}
