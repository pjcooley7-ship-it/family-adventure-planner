import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'

export function useMyTrips() {
  return useQuery({
    queryKey: ['my-trips'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('trips')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      return data
    },
  })
}

export function useTrip(tripId: string) {
  return useQuery({
    queryKey: ['trip', tripId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('trips')
        .select('*')
        .eq('id', tripId)
        .single()
      if (error) throw error
      return data
    },
    enabled: !!tripId,
  })
}

export function useTripByCode(code: string) {
  return useQuery({
    queryKey: ['trip-by-code', code],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('trips')
        .select('*')
        .eq('code', code.toUpperCase())
        .single()
      if (error) throw error
      return data
    },
    enabled: !!code,
  })
}

export function useTripMembers(tripId: string) {
  return useQuery({
    queryKey: ['trip-members', tripId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('trip_members')
        .select('*')
        .eq('trip_id', tripId)
        .order('joined_at')
      if (error) throw error
      return data
    },
    enabled: !!tripId,
  })
}

export function useTripPreferences(tripId: string) {
  return useQuery({
    queryKey: ['trip-preferences', tripId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('preferences')
        .select('*')
        .eq('trip_id', tripId)
      if (error) throw error
      return data
    },
    enabled: !!tripId,
  })
}

export function useMyPreferences(tripId: string, userId: string | undefined) {
  return useQuery({
    queryKey: ['my-preferences', tripId, userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('preferences')
        .select('*')
        .eq('trip_id', tripId)
        .eq('user_id', userId!)
        .maybeSingle()
      if (error) throw error
      return data
    },
    enabled: !!tripId && !!userId,
  })
}
