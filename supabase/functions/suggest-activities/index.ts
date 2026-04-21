// @ts-nocheck — Deno runtime, no Node types
import { createClient } from 'npm:@supabase/supabase-js@2'
import Anthropic from 'npm:@anthropic-ai/sdk@0.39.0'

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

    const supabaseUrl    = Deno.env.get('SUPABASE_URL')!
    const anonKey        = Deno.env.get('SUPABASE_ANON_KEY')!
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const anthropicKey   = Deno.env.get('ANTHROPIC_API_KEY')!

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
      .select('id, city, country, vibe_tags')
      .eq('id', trip.decided_destination_id)
      .single()
    if (destErr) throw destErr

    // ── Collect group's activity interests ───────────────────────────────────
    const { data: prefs, error: prefsErr } = await admin
      .from('preferences')
      .select('activities, traveler_name')
      .eq('trip_id', tripId)
    if (prefsErr) throw prefsErr

    const allTags = (prefs ?? []).flatMap((p: { activities: string[] | null }) => p.activities ?? [])
    const uniqueTags = [...new Set(allTags)]

    // ── Build Claude prompt ───────────────────────────────────────────────────
    const anthropic = new Anthropic({ apiKey: anthropicKey })

    const systemPrompt = `You are a knowledgeable travel concierge. Your job is to suggest specific,
bookable activities for a group trip. Always return valid JSON and nothing else.`

    const userPrompt = `Suggest 6–8 activities for a group trip to ${dest.city}, ${dest.country}.

The group's collective interests include: ${uniqueTags.length > 0 ? uniqueTags.join(', ') : 'general sightseeing, food, culture'}.
${dest.vibe_tags && dest.vibe_tags.length > 0 ? `The destination vibe: ${dest.vibe_tags.join(', ')}.` : ''}

For each activity, provide a real, specific option — not generic categories. Include a mix of must-do classics and lesser-known gems.

Return a JSON array of exactly 6–8 objects with this shape:
{
  "name": "string — specific activity name",
  "category": "string — one of: Food & Drink, Culture, Adventure, Nature, Nightlife, Wellness, Shopping, Day Trip",
  "description": "string — 1–2 sentences, be specific and evocative",
  "link": "string — URL to TripAdvisor, Viator, GetYourGuide, or the official site. Must be a real URL for a real place."
}

Return only the JSON array — no markdown, no explanation.`

    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1500,
      messages: [{ role: 'user', content: userPrompt }],
      system: systemPrompt,
    })

    const raw = message.content[0].type === 'text' ? message.content[0].text.trim() : '[]'

    // Strip markdown fences if Claude wrapped the JSON
    const jsonStr = raw.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim()
    const activities = JSON.parse(jsonStr) as Array<{
      name: string
      category: string
      description: string
      link: string
    }>

    return new Response(JSON.stringify({ activities }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('[suggest-activities] error:', message)
    return new Response(JSON.stringify({ error: message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
