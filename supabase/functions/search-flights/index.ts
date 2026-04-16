// @ts-nocheck — Deno runtime, no Node types
import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const CACHE_TTL_MS = 6 * 60 * 60 * 1000 // 6 hours

interface SerpFlightOption {
  flights: Array<{
    airline: string
    airline_logo: string
    duration: number
  }>
  total_duration: number
  price: number
  booking_token?: string
}

interface SerpResponse {
  best_flights?: SerpFlightOption[]
  other_flights?: SerpFlightOption[]
  error?: string
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { tripId } = await req.json() as { tripId: string }
    if (!tripId) throw new Error('tripId is required')

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) throw new Error('Not authenticated')

    const supabaseUrl    = Deno.env.get('SUPABASE_URL')!
    const anonKey        = Deno.env.get('SUPABASE_ANON_KEY')!
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const serpApiKey     = Deno.env.get('SERP_API_KEY')!

    // ── Verify membership ────────────────────────────────────────────────────
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    })
    const { data: isMember, error: memberErr } = await userClient.rpc('is_trip_member', {
      trip_uuid: tripId,
    })
    if (memberErr || !isMember) throw new Error('Not a member of this trip')

    const admin = createClient(supabaseUrl, serviceRoleKey)

    // ── Get the decided destination ───────────────────────────────────────────
    const { data: trip, error: tripErr } = await admin
      .from('trips')
      .select('status, decided_destination_id')
      .eq('id', tripId)
      .single()
    if (tripErr) throw tripErr
    if (trip.status !== 'decided' || !trip.decided_destination_id) {
      throw new Error('Trip does not have a decided destination yet')
    }

    const { data: dest, error: destErr } = await admin
      .from('destinations')
      .select('id, city, destination_iata')
      .eq('id', trip.decided_destination_id)
      .single()
    if (destErr) throw destErr
    if (!dest.destination_iata) {
      throw new Error(`No airport code stored for ${dest.city} — re-run the AI search to get an updated result`)
    }

    // ── Check cache — return early if all results are fresh ──────────────────
    const { data: cached } = await admin
      .from('flight_results')
      .select('*')
      .eq('trip_id', tripId)
      .eq('destination_id', dest.id)
      .order('fetched_at', { ascending: false })

    if (cached && cached.length > 0) {
      const oldestFetch = Math.min(...cached.map((r: { fetched_at: string }) => new Date(r.fetched_at).getTime()))
      if (Date.now() - oldestFetch < CACHE_TTL_MS) {
        console.log('[search-flights] returning cached results')
        return new Response(JSON.stringify({ results: cached }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
    }

    // ── Fetch preferences ────────────────────────────────────────────────────
    const { data: prefs, error: prefsErr } = await admin
      .from('preferences')
      .select('user_id, traveler_name, origin_airports, earliest_departure, latest_return, adults, currency')
      .eq('trip_id', tripId)
    if (prefsErr) throw prefsErr
    if (!prefs || prefs.length === 0) throw new Error('No preferences found')

    // ── Search SerpAPI for each member ───────────────────────────────────────
    const results = []

    for (const pref of prefs) {
      const originIata = Array.isArray(pref.origin_airports) && pref.origin_airports.length > 0
        ? pref.origin_airports[0]
        : null

      // Skip members with no airport or no dates
      if (!originIata || !pref.earliest_departure || !pref.latest_return) {
        results.push({
          trip_id:          tripId,
          destination_id:   dest.id,
          user_id:          pref.user_id,
          traveler_name:    pref.traveler_name,
          origin_iata:      originIata ?? 'N/A',
          error_message:    !originIata
            ? 'No origin airport set'
            : 'No travel dates set — update preferences to see flights',
        })
        continue
      }

      try {
        const params = new URLSearchParams({
          engine:        'google_flights',
          departure_id:  originIata,
          arrival_id:    dest.destination_iata,
          outbound_date: pref.earliest_departure,
          return_date:   pref.latest_return,
          adults:        String(pref.adults ?? 1),
          currency:      pref.currency ?? 'USD',
          hl:            'en',
          type:          '1', // round trip
          api_key:       serpApiKey,
        })

        const serpRes = await fetch(`https://serpapi.com/search.json?${params}`)
        const serpData = await serpRes.json() as SerpResponse

        if (serpData.error) {
          throw new Error(serpData.error)
        }

        // Combine best + other, sort by price, pick cheapest
        const allOptions: SerpFlightOption[] = [
          ...(serpData.best_flights ?? []),
          ...(serpData.other_flights ?? []),
        ].filter(o => typeof o.price === 'number')

        if (allOptions.length === 0) {
          results.push({
            trip_id:        tripId,
            destination_id: dest.id,
            user_id:        pref.user_id,
            traveler_name:  pref.traveler_name,
            origin_iata:    originIata,
            outbound_date:  pref.earliest_departure,
            return_date:    pref.latest_return,
            error_message:  'No flights found for these dates',
          })
          continue
        }

        allOptions.sort((a, b) => a.price - b.price)
        const cheapest = allOptions[0]
        const firstLeg = cheapest.flights[0]

        results.push({
          trip_id:          tripId,
          destination_id:   dest.id,
          user_id:          pref.user_id,
          traveler_name:    pref.traveler_name,
          origin_iata:      originIata,
          price:            cheapest.price,
          currency:         pref.currency ?? 'USD',
          airline:          firstLeg?.airline ?? null,
          airline_logo:     firstLeg?.airline_logo ?? null,
          outbound_date:    pref.earliest_departure,
          return_date:      pref.latest_return,
          duration_minutes: cheapest.total_duration ?? null,
          stops:            Math.max(0, cheapest.flights.length - 1),
          booking_token:    cheapest.booking_token ?? null,
          error_message:    null,
        })
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Search failed'
        console.error(`[search-flights] error for ${pref.traveler_name}:`, msg)
        results.push({
          trip_id:        tripId,
          destination_id: dest.id,
          user_id:        pref.user_id,
          traveler_name:  pref.traveler_name,
          origin_iata:    originIata,
          error_message:  msg,
        })
      }
    }

    // ── Upsert all results ───────────────────────────────────────────────────
    const { data: upserted, error: upsertErr } = await admin
      .from('flight_results')
      .upsert(
        results.map(r => ({ ...r, fetched_at: new Date().toISOString() })),
        { onConflict: 'trip_id,destination_id,user_id' }
      )
      .select()
    if (upsertErr) throw upsertErr

    return new Response(JSON.stringify({ results: upserted }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('[search-flights] error:', message)
    return new Response(JSON.stringify({ error: message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
