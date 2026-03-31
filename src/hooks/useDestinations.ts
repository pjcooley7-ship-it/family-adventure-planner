import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'

export function useDestinations(tripId: string) {
  return useQuery({
    queryKey: ['destinations', tripId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('destinations')
        .select('*')
        .eq('trip_id', tripId)
        .order('rank')
      if (error) throw error
      return data
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
      return data
    },
    enabled: !!tripId,
  })
}

// Toggle: if user already voted for this destination → remove vote.
// If user voted for a different destination → switch vote.
// If user hasn't voted → cast vote.
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
        // Un-vote: remove the row
        const { error } = await supabase
          .from('votes')
          .delete()
          .eq('trip_id', tripId)
          .eq('user_id', user.id)
        if (error) throw error
      } else {
        // Vote / switch vote: upsert on (trip_id, user_id) — atomic, no race condition
        const { error } = await supabase.from('votes').upsert(
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
