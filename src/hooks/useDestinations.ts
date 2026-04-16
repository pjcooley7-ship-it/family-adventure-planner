import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import type { Destination, Vote } from '@/integrations/supabase/types'

export function useDestinations(tripId: string) {
  return useQuery({
    queryKey: ['destinations', tripId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('destinations')
        .select('*')
        .eq('trip_id', tripId)
        .order('run_number', { ascending: true })
        .order('rank', { ascending: true })
      if (error) throw error
      return data as Destination[]
    },
    enabled: !!tripId,
  })
}

export function useTripVotes(tripId: string) {
  return useQuery({
    queryKey: ['votes', tripId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('votes')
        .select('*')
        .eq('trip_id', tripId)
      if (error) throw error
      return data as Vote[]
    },
    enabled: !!tripId,
  })
}

export function useToggleVote(tripId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      destinationId,
      isCurrentlyVoted,
    }: {
      destinationId: string
      isCurrentlyVoted: boolean
    }) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      if (isCurrentlyVoted) {
        const { error } = await supabase
          .from('votes')
          .delete()
          .eq('trip_id', tripId)
          .eq('user_id', user.id)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('votes')
          .upsert(
            { trip_id: tripId, destination_id: destinationId, user_id: user.id },
            { onConflict: 'trip_id,user_id' },
          )
        if (error) throw error
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['votes', tripId] })
    },
  })
}
