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

    // ── Call Claude ──────────────────────────────────────────────────────────
    const anthropic = new Anthropic({ apiKey: anthropicKey })

    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1200,
      messages: [{
        role: 'user',
        content: `You are an expert travel planner helping a group find the perfect shared destination.

Given these travelers' preferences, recommend exactly 3 destinations that best satisfy the whole group. Weigh geographic accessibility (minimize combined travel), budget overlap, shared activities, and date flexibility. Prioritise destinations where everyone can actually fly (consider their origin airports).

${travelersText}

Return ONLY a valid JSON array — no markdown fences, no extra text. Each object must have exactly these fields:
- "city": string
- "country": string (full name)
- "country_code": string (ISO 3166-1 alpha-2, e.g. "PT")
- "match_score": integer 0–100 (how well it fits the whole group)
- "ai_reasoning": string (2–3 sentences explaining why this works for THIS specific group — mention the travelers by name and reference their specific constraints)

Order from best match to worst.`,
      }],
    })

    // ── Parse response ───────────────────────────────────────────────────────
    const raw = message.content[0].type === 'text' ? message.content[0].text.trim() : ''
    const jsonStr = raw.replace(/^```(?:json)?\n?/m, '').replace(/\n?```$/m, '').trim()

    let destinations: Array<{
      city: string; country: string; country_code: string
      match_score: number; ai_reasoning: string
    }>

    try {
      destinations = JSON.parse(jsonStr)
    } catch {
      throw new Error(`Failed to parse AI response: ${raw.slice(0, 200)}`)
    }

    if (!Array.isArray(destinations) || destinations.length === 0) {
      throw new Error('AI returned an unexpected format')
    }

    // ── Replace existing destinations ────────────────────────────────────────
    await admin.from('destinations').delete().eq('trip_id', tripId)

    const rows = destinations.slice(0, 3).map((d, i) => ({
      trip_id:      tripId,
      city:         d.city,
      country:      d.country,
      country_code: d.country_code ?? null,
      ai_reasoning: d.ai_reasoning ?? null,
      match_score:  typeof d.match_score === 'number' ? d.match_score : null,
      rank:         i + 1,
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
    return new Response(JSON.stringify({ error: message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
