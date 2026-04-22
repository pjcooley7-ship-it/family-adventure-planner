import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { toast } from 'sonner'
import { Plane, Clock, AlertCircle, Hotel, Sparkles, ExternalLink, Star } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useTrip, useTripMembers, useTripPreferences } from '@/hooks/useTrip'
import { useDestinations, useTripVotes, useToggleVote } from '@/hooks/useDestinations'
import { useLockDestination } from '@/hooks/useTripMutations'
import { useFlightResults, useSearchFlights } from '@/hooks/useFlights'
import { useHotelResults, useSearchHotels } from '@/hooks/useHotels'
import { useSuggestActivities } from '@/hooks/useActivities'
import type { Activity } from '@/hooks/useActivities'
import { useAuth } from '@/hooks/useAuth'
import { useIsMobile } from '@/hooks/useIsMobile'
import type { FlightResult, HotelResult, Destination } from '@/integrations/supabase/types'
import { DocContainer } from '@/components/DocContainer'
import { countryCodeToFlag } from '@/lib/utils'

// ── Avatar palette ────────────────────────────────────────────────────────────
const AVATAR_PALETTE = [
  { bg: '#FED7C7', fg: '#993C1D' }, { bg: '#C4E8DA', fg: '#0F6E56' },
  { bg: '#FFE8B3', fg: '#9A6410' }, { bg: '#D4D1F0', fg: '#4A4290' },
  { bg: '#F5E0D8', fg: '#8A5A40' }, { bg: '#D1E8F5', fg: '#1A5C7A' },
  { bg: '#E8D4F0', fg: '#6A2A8A' }, { bg: '#D4F0E8', fg: '#1A6A4A' },
]
function avatarColors(name: string) {
  let h = 0; for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0
  return AVATAR_PALETTE[h % AVATAR_PALETTE.length]
}
function Avatar({ name, size = 28 }: { name: string; size?: number }) {
  const { bg, fg } = avatarColors(name)
  return (
    <div className="avatar" style={{ width: size, height: size, background: bg, color: fg, fontSize: size * 0.42 }}>
      {name[0].toUpperCase()}
    </div>
  )
}

function Wordmark() {
  return (
    <span style={{ fontFamily: 'var(--f-display)', fontSize: 15, fontWeight: 400, letterSpacing: '-0.02em', color: 'var(--ink)' }}>
      wanderlust<span style={{ color: 'var(--coral)' }}>.</span>
    </span>
  )
}

type GeneratingStatus = 'idle' | 'generating' | 'done' | 'error'

export default function ResultsPage() {
  const { tripId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const isMobile = useIsMobile()

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
  const { data: flightResults = [] } = useFlightResults(tripId!, trip?.decided_destination_id ?? null)
  const { data: allPrefs = [] } = useTripPreferences(tripId!)
  const searchHotels = useSearchHotels(tripId!)
  const { data: hotelResults = [] } = useHotelResults(tripId!, trip?.decided_destination_id ?? null)
  const suggestActivities = useSuggestActivities(tripId!)
  const [activities, setActivities] = useState<Activity[]>([])

  const runNumbers = [...new Set(allDestinations.map(d => d.run_number))].sort((a, b) => a - b)
  const latestRun = runNumbers.length > 0 ? runNumbers[runNumbers.length - 1] : 1
  const activeRun = selectedRun ?? latestRun
  const destinations = allDestinations.filter(d => d.run_number === activeRun)

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

  useEffect(() => {
    if (runNumbers.length > 0) setSelectedRun(latestRun)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [latestRun])

  async function runGeneration() {
    setStatus('generating')
    setErrorMsg(null)

    const { data: refreshed, error: refreshError } = await supabase.auth.refreshSession()
    if (refreshError || !refreshed.session) {
      navigate('/auth', { state: { from: location } })
      return
    }
    const accessToken = refreshed.session.access_token
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
      setStatus('error'); setErrorMsg(message); toast.error(message); return
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((data as any)?.error) {
      setStatus('error'); setErrorMsg((data as any).error); toast.error((data as any).error); return
    }
    await queryClient.invalidateQueries({ queryKey: ['destinations', tripId] })
    setStatus('done')
  }

  function handleRerun() {
    hasTriggered.current = true
    runGeneration()
  }

  const runDestinationIds = new Set(destinations.map(d => d.id))
  const runVotes = votes.filter(v => runDestinationIds.has(v.destination_id))
  const myVote = runVotes.find(v => v.user_id === user?.id)

  const latestRunDests = allDestinations.filter(d => d.run_number === latestRun)
  const latestRunDestIds = new Set(latestRunDests.map(d => d.id))
  const latestRunVotes = votes.filter(v => latestRunDestIds.has(v.destination_id))
  const latestVoteCounts = new Map(latestRunDests.map(d => [d.id, latestRunVotes.filter(v => v.destination_id === d.id).length]))
  const leadingDest = latestRunDests.length > 0
    ? latestRunDests.reduce((best, d) => (latestVoteCounts.get(d.id) ?? 0) > (latestVoteCounts.get(best.id) ?? 0) ? d : best)
    : null
  const leadingVotes = leadingDest ? (latestVoteCounts.get(leadingDest.id) ?? 0) : 0
  const hasMajority = members.length > 0 && leadingVotes > members.length / 2

  const datesOverlap = (() => {
    const withDates = allPrefs.filter(p => p.earliest_departure && p.latest_return)
    if (withDates.length < 2 || withDates.length < members.length) return true
    const overlapStart = withDates.reduce((max, p) => p.earliest_departure! > max ? p.earliest_departure! : max, '')
    const overlapEnd   = withDates.reduce((min, p) => p.latest_return! < min ? p.latest_return! : min, '9999-12-31')
    return overlapStart <= overlapEnd
  })()

  // ── Generating ────────────────────────────────────────────────────────────
  if (status === 'generating') {
    return <GeneratingScreen tripName={trip?.name} />
  }

  // ── Error ─────────────────────────────────────────────────────────────────
  if (status === 'error') {
    return (
      <DocContainer>
        <PageNav onBack={() => navigate(`/trip/${tripId}`)} />
        <div style={{ padding: '80px 28px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>😕</div>
          <p className="eyebrow" style={{ marginBottom: 12 }}>SOMETHING WENT WRONG</p>
          <p style={{ fontFamily: 'var(--f-sans)', fontSize: 14, color: 'var(--ink-2)', lineHeight: 1.7, marginBottom: 28, maxWidth: 380 }}>
            {errorMsg}
          </p>
          <div style={{ display: 'flex', gap: 12 }}>
            <button className="btn-text" onClick={() => navigate(`/trip/${tripId}`)}>← BACK</button>
            <button className="btn-primary coral" onClick={handleRerun} style={{ padding: '10px 20px' }}>Try again</button>
          </div>
        </div>
      </DocContainer>
    )
  }

  const voteCounts = new Map(destinations.map(d => [d.id, runVotes.filter(v => v.destination_id === d.id).length]))
  const maxVotesInRun = Math.max(0, ...voteCounts.values())

  // ── Decided ───────────────────────────────────────────────────────────────
  if (isDecided && decidedDestination) {
    const hasFlights = flightResults.length > 0
    return (
      <DocContainer>
        <PageNav onBack={() => navigate(`/trip/${tripId}`)} />

        {/* Dark ink hero banner */}
        <div style={{ margin: '20px 20px 0', borderRadius: 16, overflow: 'hidden', background: 'var(--ink)', color: 'var(--paper)' }}>
          <div style={{
            padding: '10px 20px', borderBottom: '1px solid rgba(255,253,247,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <span className="mono" style={{ fontSize: 9, letterSpacing: '0.2em', color: 'var(--coral)' }}>✦ LOCKED IN</span>
            <span className="mono" style={{ fontSize: 9, letterSpacing: '0.15em', color: 'rgba(255,253,247,0.5)' }}>
              {decidedDestination.destination_iata ? `ARRIVING ${decidedDestination.destination_iata}` : decidedDestination.country?.toUpperCase()}
            </span>
          </div>
          <div style={{ padding: '28px 24px 24px' }}>
            {decidedDestination.country_code && (
              <p style={{ fontSize: 32, marginBottom: 4 }}>{countryCodeToFlag(decidedDestination.country_code)}</p>
            )}
            <h1 style={{ fontFamily: 'var(--f-display)', fontSize: 52, fontWeight: 400, letterSpacing: '-0.03em', lineHeight: 1, color: 'var(--paper)' }}>
              {decidedDestination.city}
            </h1>
            <p style={{ fontSize: 14, color: 'rgba(255,253,247,0.65)', marginTop: 6 }}>
              {decidedDestination.country}
            </p>
            {decidedDestination.ai_reasoning && (
              <p style={{
                fontSize: 13, color: 'rgba(255,253,247,0.75)', lineHeight: 1.65,
                marginTop: 20, paddingLeft: 14, borderLeft: '2px solid var(--coral)',
              }}>
                {decidedDestination.ai_reasoning}
              </p>
            )}
            {decidedDestination.vibe_tags && decidedDestination.vibe_tags.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 16 }}>
                {decidedDestination.vibe_tags.map((tag: string) => (
                  <span key={tag} className="chip-new" style={{ background: 'rgba(255,253,247,0.12)', color: 'rgba(255,253,247,0.8)' }}>
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Date-overlap warning */}
        {!datesOverlap && (
          <div style={{ margin: '16px 20px 0' }}>
            <div style={{
              background: 'var(--amber-bg)', borderRadius: 10, padding: '12px 16px',
              display: 'flex', alignItems: 'flex-start', gap: 10, border: '1px solid var(--amber)',
            }}>
              <AlertCircle size={15} style={{ flexShrink: 0, marginTop: 1, color: 'var(--amber-fg)' }} />
              <p style={{ fontFamily: 'var(--f-sans)', fontSize: 13, color: 'var(--amber-fg)', lineHeight: 1.5 }}>
                <strong>Travel dates don't overlap.</strong> Members have non-overlapping date windows — flight prices shown are per each traveler's own dates, not shared trip dates.
              </p>
            </div>
          </div>
        )}

        {/* Flights */}
        <div style={{ padding: '24px 28px 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14 }}>
            <p className="eyebrow eyebrow-ink">FLIGHTS PER TRAVELER</p>
            <button
              className="btn-text"
              onClick={() => searchFlights.mutate()}
              disabled={searchFlights.isPending}
            >
              {searchFlights.isPending ? '…' : '↻ REFRESH'}
            </button>
          </div>

          {!hasFlights && !searchFlights.isPending && (
            <p style={{ fontFamily: 'var(--f-sans)', fontSize: 13, color: 'var(--ink-3)', lineHeight: 1.6, marginBottom: 16 }}>
              Find the cheapest round-trip per traveler based on their submitted dates and origin airports.
            </p>
          )}

          {!hasFlights && !searchFlights.isPending && (
            <button
              className="btn-primary coral"
              style={{ width: '100%', justifyContent: 'center', padding: '13px', fontSize: 14, marginBottom: 24 }}
              onClick={() => searchFlights.mutate()}
              disabled={searchFlights.isPending}
            >
              <Plane size={14} /> Search flights
            </button>
          )}

          {searchFlights.isPending && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
              {[1, 2, 3].map(i => (
                <div key={i} style={{
                  background: 'var(--paper-2)', borderRadius: 10, padding: '16px 14px',
                  display: 'flex', gap: 10, alignItems: 'center', opacity: 0.5,
                }}>
                  <div style={{ width: 12, height: 12, borderRadius: '50%', background: 'var(--ink-4)' }} />
                  <span className="mono" style={{ fontSize: 10, color: 'var(--ink-3)' }}>SEARCHING…</span>
                </div>
              ))}
            </div>
          )}

          {hasFlights && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 8 }}>
              {flightResults.map(result => (
                <FlightCard key={result.id} result={result} destinationIata={decidedDestination.destination_iata ?? undefined} />
              ))}
            </div>
          )}
          {hasFlights && (
            <p className="mono" style={{ fontSize: 9, color: 'var(--ink-3)', textAlign: 'right', marginBottom: 24 }}>
              PRICES AS OF {new Date(flightResults[0]?.fetched_at ?? '').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} · REFRESH TO UPDATE
            </p>
          )}
        </div>

        {/* Hotels */}
        <div style={{ padding: '0 28px', borderTop: '1px solid var(--hairline)', paddingTop: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14 }}>
            <p className="eyebrow eyebrow-ink">HOTELS</p>
            <button
              className="btn-text"
              onClick={() => searchHotels.mutate()}
              disabled={searchHotels.isPending}
            >
              {searchHotels.isPending ? '…' : hotelResults.length > 0 ? '↻ REFRESH' : ''}
            </button>
          </div>

          {!hotelResults.length && !searchHotels.isPending && (
            <>
              <p style={{ fontFamily: 'var(--f-sans)', fontSize: 13, color: 'var(--ink-3)', lineHeight: 1.6, marginBottom: 16 }}>
                Find top-rated hotels in {decidedDestination.city} for your group's travel dates.
              </p>
              <button
                className="btn-primary"
                style={{ width: '100%', justifyContent: 'center', padding: '13px', fontSize: 14, marginBottom: 24 }}
                onClick={() => searchHotels.mutate()}
              >
                <Hotel size={14} /> Find hotels
              </button>
            </>
          )}

          {searchHotels.isPending && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
              {[1, 2, 3].map(i => (
                <div key={i} style={{ background: 'var(--paper-2)', borderRadius: 10, padding: '16px 14px', opacity: 0.5 }}>
                  <div style={{ height: 12, width: '60%', background: 'var(--hairline)', borderRadius: 4 }} />
                </div>
              ))}
            </div>
          )}

          {hotelResults.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 8 }}>
              {hotelResults.map(hotel => <HotelCard key={hotel.id} hotel={hotel} />)}
            </div>
          )}
          {hotelResults.length > 0 && (
            <p className="mono" style={{ fontSize: 9, color: 'var(--ink-3)', textAlign: 'right', marginBottom: 24 }}>
              PRICES AS OF {new Date(hotelResults[0].fetched_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
            </p>
          )}
        </div>

        {/* Activities */}
        <div style={{ padding: '0 28px 32px', borderTop: '1px solid var(--hairline)', paddingTop: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14 }}>
            <p className="eyebrow eyebrow-ink">ACTIVITIES</p>
            <button
              className="btn-text"
              onClick={() => suggestActivities.mutate(undefined, { onSuccess: setActivities })}
              disabled={suggestActivities.isPending}
            >
              {suggestActivities.isPending ? '…' : activities.length > 0 ? '↻ REGENERATE' : ''}
            </button>
          </div>

          {!activities.length && !suggestActivities.isPending && (
            <>
              <p style={{ fontFamily: 'var(--f-sans)', fontSize: 13, color: 'var(--ink-3)', lineHeight: 1.6, marginBottom: 16 }}>
                Get AI-curated activity ideas tailored to your group's interests.
              </p>
              <button
                className="btn-primary"
                style={{ width: '100%', justifyContent: 'center', padding: '13px', fontSize: 14, marginBottom: 24 }}
                onClick={() => suggestActivities.mutate(undefined, { onSuccess: setActivities })}
              >
                <Sparkles size={14} /> Suggest activities
              </button>
            </>
          )}

          {suggestActivities.isPending && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
              {[1, 2].map(i => (
                <div key={i} style={{ background: 'var(--paper-2)', borderRadius: 10, padding: '16px 14px', opacity: 0.5 }}>
                  <div style={{ height: 12, width: '70%', background: 'var(--hairline)', borderRadius: 4 }} />
                </div>
              ))}
            </div>
          )}

          {activities.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 10, marginBottom: 24 }}>
              {activities.map((activity, i) => <ActivityCard key={i} activity={activity} />)}
            </div>
          )}
        </div>

        <footer style={{
          borderTop: '1px solid var(--hairline)', padding: '16px 28px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <Wordmark />
          <span className="mono" style={{ fontSize: 9, letterSpacing: '0.12em', color: 'var(--ink-3)', textTransform: 'uppercase' }}>
            Find your common ground
          </span>
        </footer>
      </DocContainer>
    )
  }

  // ── Results ───────────────────────────────────────────────────────────────

  const votedCount = new Set(runVotes.map(v => v.user_id)).size
  const waitingOn = members.filter(m => !runVotes.some(v => v.user_id === m.user_id))

  return (
    <DocContainer>
      <PageNav
        onBack={() => navigate(`/trip/${tripId}`)}
        right={
          <button className="btn-text" onClick={handleRerun} style={{ fontSize: 12 }}>↻</button>
        }
      />

      {/* Header */}
      <div style={{ padding: '24px 28px 16px' }}>
        <p className="eyebrow" style={{ marginBottom: 8 }}>
          AI RECOMMENDATIONS · {destinations.length} MATCH{destinations.length !== 1 ? 'ES' : ''}
        </p>
        <h1 className="display" style={{ fontSize: 34 }}>
          Your <em style={{ fontStyle: 'italic', color: 'var(--coral)' }}>destinations</em>
        </h1>
        <p style={{ fontFamily: 'var(--f-sans)', fontSize: 13, color: 'var(--ink-2)', marginTop: 8 }}>
          Everyone gets one vote. Tap a card to cast yours.
        </p>
      </div>

      {/* Group tally */}
      {members.length > 0 && (
        <div style={{ padding: '0 28px 16px' }}>
          <div style={{ display: 'flex', gap: 4 }}>
            {members.map((m, i) => (
              <div key={m.id} style={{ marginLeft: i === 0 ? 0 : -6 }}>
                <Avatar name={m.display_name} size={28} />
              </div>
            ))}
          </div>
          <p className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', marginTop: 8, letterSpacing: '0.1em' }}>
            {votedCount} OF {members.length} VOTED
            {waitingOn.length > 0 && ` · WAITING ON ${waitingOn.map(m => m.display_name.split(' ')[0]).join(', ')}`}
          </p>
        </div>
      )}

      {/* Run history tabs */}
      {runNumbers.length > 1 && (
        <div style={{ display: 'flex', gap: 6, padding: '0 28px 16px', overflowX: 'auto' }}>
          {runNumbers.map(run => {
            const isActive = run === activeRun
            return (
              <button
                key={run}
                onClick={() => setSelectedRun(run)}
                className={isActive ? 'chip-new ink' : 'chip-new'}
                style={{ cursor: 'pointer', flexShrink: 0, border: 'none' }}
              >
                RUN {run}{run === latestRun ? ' · LATEST' : ''}
              </button>
            )
          })}
        </div>
      )}

      {/* Majority prompt */}
      {!isDecided && isCreator && hasMajority && leadingDest && activeRun === latestRun && (
        <div style={{
          margin: '0 28px 16px',
          background: 'var(--green-bg)', borderRadius: 12, padding: '16px 20px',
          display: 'flex', flexDirection: isMobile ? 'column' : 'row',
          alignItems: isMobile ? 'flex-start' : 'center',
          justifyContent: 'space-between', gap: 12,
          border: '1.5px solid var(--green)',
        }}>
          <div>
            <p className="eyebrow" style={{ color: 'var(--green-fg)', marginBottom: 4 }}>MAJORITY REACHED</p>
            <p style={{ fontFamily: 'var(--f-sans)', fontSize: 13, color: 'var(--green-fg)', lineHeight: 1.5 }}>
              <strong>{leadingDest.city}</strong> has the majority — lock it in as the group's choice?
            </p>
          </div>
          <button
            className="btn-primary"
            style={{ padding: '10px 18px', fontSize: 13, flexShrink: 0, background: 'var(--green)', ...(isMobile && { width: '100%', justifyContent: 'center' }) }}
            onClick={() => lockDestination.mutate(leadingDest.id)}
            disabled={lockDestination.isPending}
          >
            {lockDestination.isPending ? 'Locking…' : 'Lock it in →'}
          </button>
        </div>
      )}

      {/* Destination cards */}
      <div style={{ padding: '0 28px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
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

        {/* Re-run */}
        {!isDecided && destinations.length > 0 && (
          <div style={{ marginTop: 6, padding: '16px', textAlign: 'center', border: '1px dashed var(--ink-4)', borderRadius: 12 }}>
            <p style={{ fontFamily: 'var(--f-sans)', fontSize: 12, color: 'var(--ink-2)', marginBottom: 8 }}>Not feeling any of these?</p>
            <button className="btn-text" onClick={handleRerun}>↻ GET {destinations.length} NEW OPTIONS</button>
          </div>
        )}
      </div>

      {/* Vote tally */}
      {runVotes.length > 0 && (
        <div style={{ padding: '0 28px 32px', borderTop: '1px solid var(--hairline)', paddingTop: 20 }}>
          <p className="eyebrow eyebrow-ink" style={{ marginBottom: 14 }}>
            GROUP VOTES · {votedCount} OF {members.length} CAST
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {destinations.map(dest => {
              const count = voteCounts.get(dest.id) ?? 0
              const pct = members.length > 0 ? (count / members.length) * 100 : 0
              const isLeading = count === maxVotesInRun && count > 0
              return (
                <div key={dest.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontFamily: 'var(--f-sans)', fontWeight: 500, fontSize: 13, color: 'var(--ink)' }}>
                        {dest.city}
                      </span>
                      {isLeading && <span className="chip-new green">LEADING</span>}
                    </div>
                    <span className="mono" style={{ fontSize: 10, color: 'var(--ink-3)' }}>
                      {count} vote{count !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div style={{ height: 4, background: 'var(--hairline)', borderRadius: 2 }}>
                    <div style={{
                      height: '100%', width: `${pct}%`, borderRadius: 2,
                      background: isLeading ? 'var(--green)' : 'var(--ink-3)',
                      transition: 'width 0.6s ease',
                    }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <footer style={{
        borderTop: '1px solid var(--hairline)', padding: '16px 28px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <Wordmark />
        <span className="mono" style={{ fontSize: 9, letterSpacing: '0.12em', color: 'var(--ink-3)', textTransform: 'uppercase' }}>
          Find your common ground
        </span>
      </footer>
    </DocContainer>
  )
}

/* ─── Page nav ────────────────────────────────────────────────────────────── */

function PageNav({ onBack, right }: { onBack: () => void; right?: React.ReactNode }) {
  return (
    <nav style={{
      padding: '14px 24px', borderBottom: '1px solid var(--hairline)', background: 'var(--paper)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    }}>
      <button className="btn-text" onClick={onBack}>← TRIP</button>
      <Wordmark />
      <div style={{ minWidth: 40, display: 'flex', justifyContent: 'flex-end' }}>{right ?? <div />}</div>
    </nav>
  )
}

/* ─── Destination card ────────────────────────────────────────────────────── */

function DestinationCard({
  destination, rank, voteCount, totalMembers, myVoteDestinationId, onVote, isVoting, isDecided, isLeading,
}: {
  destination: Destination; rank: number; voteCount: number; totalMembers: number
  myVoteDestinationId: string | null; onVote: (isCurrentlyVoted: boolean) => void
  isVoting: boolean; isDecided: boolean; isLeading: boolean
}) {
  const isMyVote = myVoteDestinationId === destination.id
  const score = destination.match_score ?? 0

  return (
    <div style={{
      borderRadius: 14,
      background: isMyVote ? 'var(--paper-2)' : 'var(--paper)',
      border: `1.5px solid ${isMyVote ? 'var(--coral)' : 'var(--hairline)'}`,
      overflow: 'hidden',
      opacity: isDecided ? 0.45 : 1,
      transition: 'opacity 300ms',
    }}>
      {/* Leading banner */}
      {isLeading && !isDecided && (
        <div style={{ background: 'var(--green)', color: 'var(--paper)', padding: '6px 16px', fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.15em' }}>
          ▲ LEADING · {voteCount} VOTE{voteCount !== 1 ? 'S' : ''}
        </div>
      )}

      <div style={{ padding: '16px 18px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
              {destination.country_code && (
                <span style={{ fontSize: 20 }}>{countryCodeToFlag(destination.country_code)}</span>
              )}
              <h3 style={{ fontFamily: 'var(--f-display)', fontSize: 26, fontWeight: 500, letterSpacing: '-0.02em', lineHeight: 1, color: 'var(--ink)' }}>
                {destination.city}
              </h3>
            </div>
            <p className="mono" style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 4, letterSpacing: '0.08em' }}>
              {destination.country?.toUpperCase()}
              {destination.best_months && ` · BEST ${destination.best_months.toUpperCase()}`}
            </p>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <p style={{ fontFamily: 'var(--f-mono)', fontSize: 22, fontWeight: 700, color: 'var(--green-fg)', lineHeight: 1 }}>
              {Math.round(score)}%
            </p>
            <p className="mono" style={{ fontSize: 9, color: 'var(--ink-3)', letterSpacing: '0.12em', marginTop: 2 }}>MATCH</p>
          </div>
        </div>

        {/* AI reasoning */}
        {destination.ai_reasoning && (
          <p style={{ fontFamily: 'var(--f-sans)', fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.6, marginBottom: 12 }}>
            {destination.ai_reasoning}
          </p>
        )}

        {/* Vibe tags */}
        {destination.vibe_tags && destination.vibe_tags.length > 0 && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
            {destination.vibe_tags.map((tag: string) => (
              <span key={tag} className="chip-new">{tag}</span>
            ))}
          </div>
        )}

        {/* Vote row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 12, borderTop: '1px solid var(--hairline)' }}>
          <span className="mono" style={{ fontSize: 11, color: 'var(--ink-2)', letterSpacing: '0.08em' }}>
            {voteCount} of {totalMembers} {voteCount === 1 ? 'VOTE' : 'VOTES'}
          </span>
          <button
            onClick={() => onVote(isMyVote)}
            disabled={isVoting || isDecided}
            className={isMyVote ? 'btn-primary coral' : 'btn-ghost'}
            style={{ fontSize: 12, padding: '8px 16px' }}
          >
            {isMyVote ? '✓ Your vote' : 'Vote for this'}
          </button>
        </div>
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
    ? `${Math.floor(result.duration_minutes / 60)}h ${result.duration_minutes % 60}m` : null
  const stopsText = result.stops === 0 ? 'Direct' : `${result.stops} stop${result.stops !== 1 ? 's' : ''}`
  const outDate = result.outbound_date ? new Date(result.outbound_date + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : null
  const retDate = result.return_date ? new Date(result.return_date + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : null
  const bookingUrl = !hasError && destinationIata && result.origin_iata && result.outbound_date && result.return_date
    ? `https://www.kayak.com/flights/${result.origin_iata}-${destinationIata}/${result.outbound_date}/${result.return_date}` : null

  return (
    <div style={{
      background: 'var(--paper)', borderRadius: 10, border: '1px solid var(--hairline)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '12px 14px', gap: 12, opacity: hasError ? 0.6 : 1,
    }}>
      <div style={{ minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <span className="mono" style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink)' }}>{result.origin_iata}</span>
          <Plane size={10} style={{ color: 'var(--ink-3)', flexShrink: 0 }} />
          <span style={{ fontFamily: 'var(--f-sans)', fontSize: 13, fontWeight: 500, color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {result.traveler_name}
          </span>
        </div>
        {hasError ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <AlertCircle size={10} style={{ color: 'var(--coral)', flexShrink: 0 }} />
            <span className="mono" style={{ fontSize: 10, color: 'var(--coral)' }}>{result.error_message}</span>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', rowGap: 3 }}>
            {outDate && retDate && (
              <span className="mono" style={{ fontSize: 10, color: 'var(--ink-3)' }}>{outDate} – {retDate}</span>
            )}
            {durationText && (
              <span className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', display: 'flex', alignItems: 'center', gap: 3 }}>
                <Clock size={9} />{durationText}
              </span>
            )}
            {result.stops != null && (
              <span className="mono" style={{ fontSize: 10, color: result.stops === 0 ? 'var(--green-fg)' : 'var(--ink-3)' }}>
                {result.stops === 0 ? '● ' : '◆ '}{stopsText}
              </span>
            )}
          </div>
        )}
      </div>

      {!hasError && (
        <div style={{ flexShrink: 0, textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 5 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {result.airline_logo && <img src={result.airline_logo} alt={result.airline ?? ''} style={{ height: 14 }} />}
            {price && <span className="mono" style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)' }}>{price}</span>}
          </div>
          {bookingUrl && (
            <a href={bookingUrl} target="_blank" rel="noopener noreferrer" className="btn-text" style={{ fontSize: 9, color: 'var(--coral)' }}>
              BOOK →
            </a>
          )}
        </div>
      )}
    </div>
  )
}

/* ─── Hotel card ──────────────────────────────────────────────────────────── */

function HotelCard({ hotel }: { hotel: HotelResult }) {
  const price = hotel.price_per_night != null
    ? new Intl.NumberFormat('en-US', { style: 'currency', currency: hotel.currency ?? 'USD', maximumFractionDigits: 0 }).format(hotel.price_per_night)
    : null
  const hotelStars = hotel.hotel_class != null ? '★'.repeat(hotel.hotel_class) + '☆'.repeat(Math.max(0, 5 - hotel.hotel_class)) : null

  return (
    <div style={{
      background: 'var(--paper)', borderRadius: 10, border: '1px solid var(--hairline)',
      display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
    }}>
      {hotel.thumbnail && (
        <img src={hotel.thumbnail} alt={hotel.name} style={{ width: 52, height: 52, objectFit: 'cover', borderRadius: 8, flexShrink: 0 }} />
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontFamily: 'var(--f-sans)', fontSize: 14, fontWeight: 500, color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 4 }}>
          {hotel.name}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          {hotel.property_type && (
            <span className="chip-new" style={{ padding: '2px 6px' }}>{hotel.property_type}</span>
          )}
          {hotelStars && <span className="mono" style={{ fontSize: 10, color: 'var(--coral)' }}>{hotelStars}</span>}
          {hotel.rating != null && (
            <span className="mono" style={{ fontSize: 10, color: 'var(--ink-2)' }}>
              <Star size={9} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 2 }} />{hotel.rating.toFixed(1)}
            </span>
          )}
        </div>
      </div>
      <div style={{ flexShrink: 0, textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 5 }}>
        {price && (
          <div>
            <span className="mono" style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)' }}>{price}</span>
            <span className="mono" style={{ fontSize: 9, color: 'var(--ink-3)', marginLeft: 3 }}>/night</span>
          </div>
        )}
        <a
          href={hotel.booking_link ?? `https://www.google.com/maps/search/${encodeURIComponent(hotel.name)}`}
          target="_blank" rel="noopener noreferrer"
          className="btn-text" style={{ fontSize: 9, color: 'var(--coral)' }}
        >
          VIEW →
        </a>
      </div>
    </div>
  )
}

/* ─── Activity card ───────────────────────────────────────────────────────── */

const CATEGORY_COLORS: Record<string, { bg: string; fg: string }> = {
  'Food & Drink':  { bg: '#FBE9E3', fg: '#993C1D' },
  'Culture':       { bg: '#E8E7F5', fg: '#4A4290' },
  'Adventure':     { bg: '#E3F2EC', fg: '#0F6E56' },
  'Nature':        { bg: '#E3F2EC', fg: '#0F6E56' },
  'Nightlife':     { bg: '#EEE8F7', fg: '#6A2A8A' },
  'Wellness':      { bg: '#E3F2EC', fg: '#0F6E56' },
  'Shopping':      { bg: '#FEF4E2', fg: '#9A6410' },
  'Day Trip':      { bg: '#D1E8F5', fg: '#1A5C7A' },
}

function ActivityCard({ activity }: { activity: Activity }) {
  const colors = CATEGORY_COLORS[activity.category] ?? { bg: 'var(--paper-2)', fg: 'var(--ink-2)' }
  return (
    <div style={{ background: 'var(--paper)', borderRadius: 12, border: '1px solid var(--hairline)', overflow: 'hidden' }}>
      <div style={{ padding: '6px 14px', background: colors.bg }}>
        <span className="mono" style={{ fontSize: 9, letterSpacing: '0.12em', color: colors.fg, textTransform: 'uppercase' }}>
          {activity.category}
        </span>
      </div>
      <div style={{ padding: '12px 14px' }}>
        <p style={{ fontFamily: 'var(--f-sans)', fontSize: 14, fontWeight: 500, color: 'var(--ink)', marginBottom: 6 }}>
          {activity.name}
        </p>
        <p style={{ fontFamily: 'var(--f-sans)', fontSize: 12, color: 'var(--ink-2)', lineHeight: 1.65, marginBottom: 10 }}>
          {activity.description}
        </p>
        <a
          href={activity.link} target="_blank" rel="noopener noreferrer"
          className="btn-text"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 9 }}
          onMouseEnter={e => { e.currentTarget.style.color = 'var(--coral)' }}
          onMouseLeave={e => { e.currentTarget.style.color = '' }}
        >
          <ExternalLink size={9} /> FIND ON MAPS
        </a>
      </div>
    </div>
  )
}

/* ─── Generating screen ───────────────────────────────────────────────────── */

const GENERATING_STEPS = [
  'Reading all submissions',
  'Mapping overlapping interests',
  'Weighing flight paths & budgets',
  'Scoring destinations',
]

function GeneratingScreen({ tripName }: { tripName?: string }) {
  const [activeStep, setActiveStep] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setActiveStep(i => Math.min(i + 1, GENERATING_STEPS.length - 1)), 2500)
    return () => clearInterval(t)
  }, [])

  return (
    <DocContainer>
      <nav style={{
        padding: '14px 24px', borderBottom: '1px solid var(--hairline)', background: 'var(--paper)',
        display: 'flex', justifyContent: 'center',
      }}>
        <Wordmark />
      </nav>
      <div style={{ padding: '80px 32px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
        {/* Compass spinner */}
        <div style={{ position: 'relative', width: 100, height: 100, marginBottom: 36 }}>
          <div className="spin" style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '2px dashed var(--ink-4)' }} />
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: 32 }}>🧭</div>
        </div>

        {tripName && (
          <p className="eyebrow" style={{ marginBottom: 10, color: 'var(--coral)' }}>{tripName.toUpperCase()}</p>
        )}
        <h2 className="display" style={{ fontSize: 30, marginBottom: 28 }}>
          Finding your<br /><em style={{ fontStyle: 'italic', color: 'var(--coral)' }}>common ground</em>
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%', maxWidth: 280 }}>
          {GENERATING_STEPS.map((step, i) => {
            const done = i < activeStep
            const active = i === activeStep
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, textAlign: 'left' }}>
                <span style={{ width: 16, textAlign: 'center', fontSize: 13 }}>
                  {done ? '✓' : active ? <span className="pulse" style={{ color: 'var(--coral)' }}>●</span> : <span style={{ color: 'var(--ink-4)' }}>○</span>}
                </span>
                <span className="mono" style={{ fontSize: 11, color: done || active ? 'var(--ink)' : 'var(--ink-3)', letterSpacing: '0.04em' }}>
                  {step}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </DocContainer>
  )
}
