// @ts-nocheck — Deno runtime, no Node types
import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const RESEND_API = 'https://api.resend.com/emails'
const FROM = 'Wanderlust <onboarding@resend.dev>'
const APP_URL = 'https://global-family-adventures.lovable.app'

async function sendEmail(apiKey: string, to: string[], subject: string, html: string) {
  const res = await fetch(RESEND_API, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from: FROM, to, subject, html }),
  })
  if (!res.ok) {
    console.error('[send-notification] Resend error:', await res.text())
  }
}

function btnHtml(href: string, label: string) {
  return `<a href="${href}" style="display:inline-block;padding:12px 24px;background:#c0392b;color:#fff;text-decoration:none;border-radius:6px;font-family:sans-serif;font-weight:600;margin-top:16px">${label}</a>`
}

function footer() {
  return `<p style="color:#aaa;margin-top:40px;font-size:12px;font-family:sans-serif">You're receiving this because you joined a Wanderlust trip.</p>`
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { type, tripId } = await req.json() as { type: string; tripId: string }
    if (!type || !tripId) throw new Error('type and tripId are required')

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) throw new Error('Not authenticated')

    const supabaseUrl    = Deno.env.get('SUPABASE_URL')!
    const anonKey        = Deno.env.get('SUPABASE_ANON_KEY')!
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const resendApiKey   = Deno.env.get('RESEND_API_KEY')!

    // Verify caller is a trip member
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    })
    const { data: isMember } = await userClient.rpc('is_trip_member', { trip_uuid: tripId })
    if (!isMember) throw new Error('Not a member of this trip')

    const admin = createClient(supabaseUrl, serviceRoleKey)

    // Fetch trip
    const { data: trip } = await admin.from('trips').select('*').eq('id', tripId).single()
    if (!trip) throw new Error('Trip not found')

    // Fetch members + their emails via admin auth
    const { data: members } = await admin
      .from('trip_members')
      .select('user_id, display_name')
      .eq('trip_id', tripId)
    if (!members?.length) throw new Error('No members found')

    const emails: string[] = []
    for (const m of members) {
      const { data: { user } } = await admin.auth.admin.getUserById(m.user_id)
      if (user?.email) emails.push(user.email)
    }

    // ── all-prefs-in ─────────────────────────────────────────────────────────
    if (type === 'all-prefs-in') {
      const { count: prefCount } = await admin
        .from('preferences')
        .select('*', { count: 'exact', head: true })
        .eq('trip_id', tripId)

      if (prefCount !== members.length) {
        return new Response(
          JSON.stringify({ skipped: true, reason: `${prefCount}/${members.length} prefs in` }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        )
      }

      if (!emails.length) {
        return new Response(JSON.stringify({ sent: 0 }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      const html = `
        <div style="font-family:sans-serif;max-width:520px;margin:0 auto">
          <h2 style="margin-bottom:8px">Everyone's preferences are in ✈️</h2>
          <p style="color:#555">All members of <strong>${trip.name}</strong> have submitted their travel preferences.</p>
          <p style="color:#555">Head back to find your perfect destination.</p>
          ${btnHtml(`${APP_URL}/trip/${tripId}`, 'Find destinations →')}
          ${footer()}
        </div>
      `
      await sendEmail(resendApiKey, emails, `${trip.name} — everyone's preferences are in!`, html)
      console.log(`[send-notification] all-prefs-in sent to ${emails.length} members`)
      return new Response(JSON.stringify({ sent: emails.length }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // ── destination-decided ───────────────────────────────────────────────────
    if (type === 'destination-decided') {
      if (!trip.decided_destination_id) throw new Error('No decided destination set')

      const { data: dest } = await admin
        .from('destinations')
        .select('city, country, ai_reasoning')
        .eq('id', trip.decided_destination_id)
        .single()
      if (!dest) throw new Error('Destination not found')

      if (!emails.length) {
        return new Response(JSON.stringify({ sent: 0 }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      const html = `
        <div style="font-family:sans-serif;max-width:520px;margin:0 auto">
          <h2 style="margin-bottom:8px">Your group has decided! 🎉</h2>
          <p style="color:#555"><strong>${trip.name}</strong> is heading to <strong>${dest.city}, ${dest.country}</strong>.</p>
          ${dest.ai_reasoning ? `<p style="color:#777;font-style:italic">${dest.ai_reasoning}</p>` : ''}
          ${btnHtml(`${APP_URL}/trip/${tripId}/results`, 'See flights & hotels →')}
          ${footer()}
        </div>
      `
      await sendEmail(resendApiKey, emails, `${trip.name} — you're going to ${dest.city}!`, html)
      console.log(`[send-notification] destination-decided sent to ${emails.length} members`)
      return new Response(JSON.stringify({ sent: emails.length }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    throw new Error(`Unknown notification type: ${type}`)
  } catch (err) {
    console.error('[send-notification] error:', err)
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
