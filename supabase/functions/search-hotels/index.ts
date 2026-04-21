// @ts-nocheck — Deno runtime, no Node types
import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const CACHE_TTL_MS = 6 * 60 * 60 * 1000 // 6 hours

interface SerpHotelProperty {
  name: string
  overall_rating?: number
  rate_per_night?: {
    lowest?: string
    extracted_lowest?: number
  }
  thumbnail?: string
  link?: string
}

interface SerpHotelsResponse {
  properties?: SerpHotelProperty[]
  error?: string
}

/** Parse a price string like "$120" or "€95" into a number */
function parsePrice(str?: string): number | null {
  if (!str) return null
  const match = str.replace(/,/g, '').match(/[\d.]+/)
  return match ? parseFloat(match[0]) : null
}

/** Infer currency symbol from price string */
function parseCurrency(str?: string): string {
  if (!str) return 'USD'
  if (str.includes('€')) return 'EUR'
  if (str.includes('£')) return 'GBP'
  if (str.includes('¥')) return 'JPY'
  return 'USD'
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
      .select('id, city, country')
      .eq('id', trip.decided_destination_id)
      .single()
    if (destErr) throw destErr

    // ── Check cache ───────────────────────────────────────────────────────────
    const { data: cached } = await admin
      .from('hotel_results')
      .select('*')
      .eq('trip_id', tripId)
      .eq('destination_id', dest.id)
      .order('position')

    if (cached && cached.length > 0) {
      const oldestFetch = Math.min(...cached.map((r: { fetched_at: string }) => new Date(r.fetched_at).getTime()))
      if (Date.now() - oldestFetch < CACHE_TTL_MS) {
        console.log('[search-hotels] returning cached results')
        return new Response(JSON.stringify({ results: cached }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
    }

    // ── Derive group date window ──────────────────────────────────────────────
    // check_in  = latest earliest_departure (everyone has arrived)
    // check_out = earliest latest_return    (no one has left yet)
    const { data: prefs, error: prefsErr } = await admin
      .from('preferences')
      .select('earliest_departure, latest_return, adults, currency')
      .eq('trip_id', tripId)
    if (prefsErr) throw prefsErr
    if (!prefs || prefs.length === 0) throw new Error('No preferences found')

    const departures = prefs.map((p: { earliest_departure: string | null }) => p.earliest_departure).filter(Boolean) as string[]
    const returns_   = prefs.map((p: { latest_return: string | null }) => p.latest_return).filter(Boolean) as string[]

    // Overlap window; fall back to first member's dates if no overlap
    let checkIn  = departures.length > 0 ? departures.reduce((a, b) => a > b ? a : b) : null
    let checkOut = returns_.length > 0   ? returns_.reduce((a, b) => a < b ? a : b) : null

    // If dates don't overlap, fall back to majority range
    if (checkIn && checkOut && checkIn >= checkOut) {
      checkIn  = departures.reduce((a, b) => a < b ? a : b)
      checkOut = returns_.reduce((a, b) => a > b ? a : b)
    }

    const totalAdults = prefs.reduce((sum: number, p: { adults: number | null }) => sum + (p.adults ?? 1), 0)
    const currency = (prefs.find((p: { currency: string | null }) => p.currency)?.currency) ?? 'USD'

    // ── Call SerpAPI google_hotels ────────────────────────────────────────────
    const params = new URLSearchParams({
      engine:   'google_hotels',
      q:        `hotels in ${dest.city}`,
      hl:       'en',
      gl:       'us',
      currency,
      adults:   String(totalAdults),
      api_key:  serpApiKey,
    })
    if (checkIn)  params.set('check_in_date', checkIn)
    if (checkOut) params.set('check_out_date', checkOut)

    const serpRes = await fetch(`https://serpapi.com/search.json?${params}`)
    const serpData = await serpRes.json() as SerpHotelsResponse

    if (serpData.error) throw new Error(serpData.error)

    const properties = (serpData.properties ?? []).slice(0, 5)

    if (properties.length === 0) {
      return new Response(JSON.stringify({ results: [] }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // ── Build rows ────────────────────────────────────────────────────────────
    const rows = properties.map((p: SerpHotelProperty, i: number) => {
      const priceStr = p.rate_per_night?.lowest
      const priceNum = p.rate_per_night?.extracted_lowest ?? parsePrice(priceStr)
      return {
        trip_id:        tripId,
        destination_id: dest.id,
        position:       i + 1,
        name:           p.name,
        rating:         p.overall_rating ?? null,
        price_per_night: priceNum ?? null,
        currency:       priceNum ? parseCurrency(priceStr) : null,
        thumbnail:      p.thumbnail ?? null,
        booking_link:   p.link ?? null,
        check_in_date:  checkIn ?? null,
        check_out_date: checkOut ?? null,
        fetched_at:     new Date().toISOString(),
      }
    })

    // ── Upsert ────────────────────────────────────────────────────────────────
    const { data: upserted, error: upsertErr } = await admin
      .from('hotel_results')
      .upsert(rows, { onConflict: 'trip_id,destination_id,position' })
      .select()
    if (upsertErr) throw upsertErr

    return new Response(JSON.stringify({ results: upserted ?? rows }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('[search-hotels] error:', message)
    return new Response(JSON.stringify({ error: message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
