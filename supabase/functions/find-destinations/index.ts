// @ts-nocheck — Deno runtime, no Node types
import { createClient } from 'npm:@supabase/supabase-js@2'
import Anthropic from 'npm:@anthropic-ai/sdk'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { tripId } = await req.json() as { tripId: string }
    console.log('[find-destinations] invoked for tripId:', tripId)
    if (!tripId) throw new Error('tripId is required')

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) throw new Error('Not authenticated')

    const supabaseUrl      = Deno.env.get('SUPABASE_URL')!
    const anonKey          = Deno.env.get('SUPABASE_ANON_KEY')!
    const serviceRoleKey   = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const anthropicKey     = Deno.env.get('ANTHROPIC_API_KEY')!

    // ── Verify the caller is a trip member ──────────────────────────────────
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    })
    const { data: isMember, error: memberCheckError } = await userClient.rpc('is_trip_member', {
      trip_uuid: tripId,
    })
    if (memberCheckError || !isMember) throw new Error('Not a member of this trip')

    // ── All DB work uses service role (bypasses RLS) ─────────────────────────
    const admin = createClient(supabaseUrl, serviceRoleKey)

    // ── Fetch preferences ────────────────────────────────────────────────────
    const { data: preferences, error: prefsError } = await admin
      .from('preferences')
      .select('*')
      .eq('trip_id', tripId)
    if (prefsError) throw prefsError
    if (!preferences || preferences.length === 0) {
      throw new Error('No preferences submitted yet — everyone needs to submit before running.')
    }

    // ── Build the prompt ─────────────────────────────────────────────────────
    const travelersText = preferences.map((p, i) => {
      const airports = Array.isArray(p.origin_airports) && p.origin_airports.length > 0
        ? p.origin_airports.join(', ')
        : 'not specified'
      const kids = p.kids > 0 ? `, ${p.kids} child(ren)` : ''
      const dep = p.earliest_departure ?? 'flexible'
      const ret = p.latest_return ?? 'flexible'
      const notes = p.special_requirements ? `\n  - Notes: ${p.special_requirements}` : ''
      return `Traveler ${i + 1}: ${p.traveler_name}
  - Flying from: ${p.origin_city} (preferred airports: ${airports})
  - Party: ${p.adults} adult(s)${kids}
  - Travel window: ${dep} → ${ret}, ${p.trip_duration_min}–${p.trip_duration_max} nights
  - Budget: ${p.currency} ${p.budget_min}–${p.budget_max} per person (flights + accommodation)
  - Activities: ${p.activities.length > 0 ? p.activities.join(', ') : 'no preference'}
  - Accommodation: ${p.accommodation_types.length > 0 ? p.accommodation_types.join(', ') : 'no preference'}${notes}`
    }).join('\n\n')

    // ── Determine next run number + collect previously suggested cities ────────
    const { data: existingDests } = await admin
      .from('destinations')
      .select('run_number, city')
      .eq('trip_id', tripId)
      .order('run_number', { ascending: false })
    const nextRun = existingDests && existingDests.length > 0 ? existingDests[0].run_number + 1 : 1
    const excludedCities: string[] = existingDests && existingDests.length > 0
      ? [...new Set(existingDests.map((d: { city: string }) => d.city))]
      : []

    // ── Call Claude ──────────────────────────────────────────────────────────
    const anthropic = new Anthropic({ apiKey: anthropicKey })

    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 2000,
      messages: [{
        role: 'user',
        content: `You are an expert travel planner helping a group find the perfect shared destination.

Given these travelers' preferences, recommend exactly 5 destinations that best satisfy the whole group. Weigh geographic accessibility (minimize combined travel), budget overlap, shared activities, and date flexibility. Prioritise destinations where everyone can actually fly (consider their origin airports).

${travelersText}
${excludedCities.length > 0 ? `\nIMPORTANT: The following cities have already been suggested to this group — do NOT include any of them in your response:\n${excludedCities.join(', ')}\n` : ''}
Return ONLY a valid JSON array — no markdown fences, no extra text. Each object must have exactly these fields:
- "city": string
- "country": string (full name)
- "country_code": string (ISO 3166-1 alpha-2 for the COUNTRY the city is in — e.g. Crete → "GR", Canary Islands → "ES", Madeira → "PT", Sicily → "IT")
- "destination_iata": string (IATA code of the nearest major commercial airport serving this destination — e.g. Crete → "HER", Barcelona → "BCN", Lisbon → "LIS", Paris → "CDG")
- "match_score": integer 0–100 (how well it fits the whole group)
- "ai_reasoning": string (2–3 sentences explaining why this works for THIS specific group — mention the travelers by name and reference their specific constraints)
- "vibe_tags": array of 2–4 short strings from this set: Beach, Culture, Nightlife, Nature, Food, History, Adventure, Relaxation, Family, Romance, City Break, Mountains
- "best_months": string describing the best travel window, e.g. "May–September" or "Year-round"
- "flight_note": string summarising approximate flight time from the group's origins, e.g. "3–5 hrs from all origins" or "4 hrs (LHR), 9 hrs (JFK)"

Order from best match to worst.`,
      }],
    })

    // ── Parse response ───────────────────────────────────────────────────────
    const raw = message.content[0].type === 'text' ? message.content[0].text.trim() : ''
    const jsonStr = raw.replace(/^```(?:json)?\n?/m, '').replace(/\n?```$/m, '').trim()

    let destinations: Array<{
      city: string; country: string; country_code: string; destination_iata: string
      match_score: number; ai_reasoning: string
      vibe_tags: string[]; best_months: string; flight_note: string
    }>

    try {
      destinations = JSON.parse(jsonStr)
    } catch {
      throw new Error(`Failed to parse AI response: ${raw.slice(0, 200)}`)
    }

    if (!Array.isArray(destinations) || destinations.length === 0) {
      throw new Error('AI returned an unexpected format')
    }

    // ── Insert new run (old runs are preserved) ──────────────────────────────
    const rows = destinations.slice(0, 5).map((d, i) => ({
      trip_id:          tripId,
      city:             d.city,
      country:          d.country,
      country_code:     d.country_code ?? null,
      destination_iata: d.destination_iata ?? null,
      ai_reasoning:     d.ai_reasoning ?? null,
      match_score:      typeof d.match_score === 'number' ? d.match_score : null,
      rank:             i + 1,
      run_number:       nextRun,
      vibe_tags:        Array.isArray(d.vibe_tags) ? d.vibe_tags : [],
      best_months:      d.best_months ?? null,
      flight_note:      d.flight_note ?? null,
    }))

    const { data: inserted, error: insertError } = await admin
      .from('destinations')
      .insert(rows)
      .select()
    if (insertError) throw insertError

    // ── Mark trip as matched ─────────────────────────────────────────────────
    await admin.from('trips').update({ status: 'matched' }).eq('id', tripId)

    return new Response(JSON.stringify({ destinations: inserted }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('[find-destinations] error:', message, err)
    return new Response(JSON.stringify({ error: message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
