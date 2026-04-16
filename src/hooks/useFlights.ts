import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { supabase } from '@/integrations/supabase/client'
import { fromTable } from '@/lib/supabaseHelpers'
import type { FlightResult } from '@/lib/customTypes'

export type { FlightResult } from '@/lib/customTypes'

export function useFlightResults(tripId: string, destinationId: string | null) {
  return useQuery({
    queryKey: ['flight-results', tripId, destinationId],
    queryFn: async () => {
      const { data, error } = await fromTable('flight_results')
        .select('*')
        .eq('trip_id', tripId)
        .eq('destination_id', destinationId!)
        .order('fetched_at', { ascending: false })
      if (error) throw error
      return data as FlightResult[]
    },
    enabled: !!tripId && !!destinationId,
  })
}

export function useSearchFlights(tripId: string) {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const location = useLocation()

  return useMutation({
    mutationFn: async () => {
      const { data: refreshed, error: refreshErr } = await supabase.auth.refreshSession()
      if (refreshErr || !refreshed.session) {
        navigate('/auth', { state: { from: location } })
        throw new Error('Session expired')
      }

      const fnUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/search-flights`
      const res = await fetch(fnUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${refreshed.session.access_token}`,
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({ tripId }),
      })
      const body = await res.json()
      if (!res.ok) throw new Error(body.error ?? 'Flight search failed')
      return body.results as FlightResult[]
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flight-results', tripId] })
    },
    onError: (err: Error) => {
      toast.error(err.message)
    },
  })
}
