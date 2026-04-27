import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { supabase } from '@/integrations/supabase/client'
import type { TravelPreferences } from '@/lib/types'
import type { Trip } from '@/integrations/supabase/types'

async function fireNotification(type: string, tripId: string) {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return
    await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-notification`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
          apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({ type, tripId }),
      },
    )
  } catch {
    // notifications are best-effort — never surface errors to the user
  }
}

// ── Create a new trip ─────────────────────────────────────────

export function useCreateTrip() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: async ({ name, displayName }: { name: string; displayName: string }) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data: trip, error: tripError } = await supabase
        .from('trips')
        .insert({ name, created_by: user.id })
        .select()
        .single()
      if (tripError) throw tripError

      const { error: memberError } = await supabase
        .from('trip_members')
        .insert({ trip_id: trip.id, user_id: user.id, display_name: displayName })
      if (memberError) throw memberError

      return trip as Trip
    },
    onSuccess: (trip) => {
      queryClient.invalidateQueries({ queryKey: ['trip', trip.id] })
      toast.success(`Trip created — code: ${trip.code}`)
      navigate(`/trip/${trip.id}`)
    },
    onError: (err: Error) => {
      toast.error(err.message)
    },
  })
}

// ── Join a trip by code ───────────────────────────────────────

export function useJoinTrip() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: async ({ code, displayName }: { code: string; displayName: string }) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data: trip, error: tripError } = await supabase
        .from('trips')
        .select('*')
        .eq('code', code.toUpperCase())
        .single()
      if (tripError) throw new Error('Trip not found — check the code and try again')

      const { data: existing } = await supabase
        .from('trip_members')
        .select('id')
        .eq('trip_id', trip.id)
        .eq('user_id', user.id)
        .maybeSingle()

      if (existing) {
        return { trip: trip as Trip, isNew: false }
      }

      const { error: memberError } = await supabase
        .from('trip_members')
        .insert({ trip_id: trip.id, user_id: user.id, display_name: displayName })
      if (memberError) throw memberError

      return { trip: trip as Trip, isNew: true }
    },
    onSuccess: ({ trip, isNew }) => {
      queryClient.invalidateQueries({ queryKey: ['trip', trip.id] })
      queryClient.invalidateQueries({ queryKey: ['trip-members', trip.id] })
      if (isNew) {
        toast.success(`Joined trip: ${trip.name}`)
        navigate(`/trip/${trip.id}/preferences`)
      } else {
        toast.info(`You're already in ${trip.name}`)
        navigate(`/trip/${trip.id}`)
      }
    },
    onError: (err: Error) => {
      toast.error(err.message)
    },
  })
}

// ── Lock in a decided destination (creator only) ──────────────

export function useLockDestination(tripId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (destinationId: string) => {
      const { error } = await supabase
        .from('trips')
        .update({ status: 'decided', decided_destination_id: destinationId })
        .eq('id', tripId)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trip', tripId] })
      toast.success("It's decided! Your destination is locked in.")
      fireNotification('destination-decided', tripId)
    },
    onError: (err: Error) => {
      toast.error(err.message)
    },
  })
}

// ── Submit / update preferences ───────────────────────────────

export function useSubmitPreferences(tripId: string) {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: async (prefs: TravelPreferences) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { error } = await supabase
        .from('preferences')
        .upsert({
          trip_id:              tripId,
          user_id:              user.id,
          traveler_name:        prefs.travelerName,
          origin_city:          prefs.originCity,
          adults:               prefs.adults,
          kids:                 prefs.kids,
          earliest_departure:   prefs.earliestDeparture || null,
          latest_return:        prefs.latestReturn || null,
          flexible_dates:       prefs.flexibleDates,
          trip_duration_min:    prefs.tripDurationMin,
          trip_duration_max:    prefs.tripDurationMax,
          budget_min:           prefs.budgetMin,
          budget_max:           prefs.budgetMax,
          currency:             prefs.currency,
          activities:           prefs.activities,
          accommodation_types:  prefs.accommodationTypes,
          origin_airports:      prefs.originAirports,
          special_requirements: prefs.specialRequirements || null,
          submitted_at:         new Date().toISOString(),
        })
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trip-preferences', tripId] })
      queryClient.invalidateQueries({ queryKey: ['my-preferences', tripId] })
      queryClient.invalidateQueries({ queryKey: ['trip-members', tripId] })
      toast.success('Preferences saved!')
      fireNotification('all-prefs-in', tripId)
      navigate(`/trip/${tripId}`)
    },
    onError: (err: Error) => {
      toast.error(err.message)
    },
  })
}
