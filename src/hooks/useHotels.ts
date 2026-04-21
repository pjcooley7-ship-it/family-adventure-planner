import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { supabase } from '@/integrations/supabase/client'
import type { HotelResult } from '@/integrations/supabase/types'

export type { HotelResult } from '@/integrations/supabase/types'

export function useHotelResults(tripId: string, destinationId: string | null) {
  return useQuery({
    queryKey: ['hotel-results', tripId, destinationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('hotel_results')
        .select('*')
        .eq('trip_id', tripId)
        .eq('destination_id', destinationId!)
        .order('position')
      if (error) throw error
      return data as HotelResult[]
    },
    enabled: !!tripId && !!destinationId,
  })
}

export function useSearchHotels(tripId: string) {
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

      const fnUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/search-hotels`
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
      if (!res.ok) throw new Error(body.error ?? 'Hotel search failed')
      return body.results as HotelResult[]
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hotel-results', tripId] })
    },
    onError: (err: Error) => {
      toast.error(err.message)
    },
  })
}
