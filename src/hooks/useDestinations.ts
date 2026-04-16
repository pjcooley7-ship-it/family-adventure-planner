import { useQuery } from '@tanstack/react-query'
import { fromTable } from '@/lib/supabaseHelpers'

export function useDestinations(tripId: string) {
  return useQuery({
    queryKey: ['destinations', tripId],
    queryFn: async () => {
      const { data, error } = await fromTable('destinations')
        .select('*')
        .eq('trip_id', tripId)
        .order('run_number', { ascending: true })
        .order('rank', { ascending: true })
      if (error) throw error
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return data as any[]
    },
    enabled: !!tripId,
  })
}

export function useTripVotes(tripId: string) {
  return useQuery({
    queryKey: ['votes', tripId],
    queryFn: async () => {
      const { data, error } = await fromTable('votes')
        .select('*')
        .eq('trip_id', tripId)
      if (error) throw error
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return data as any[]
    },
    enabled: !!tripId,
  })
}

// Toggle: if user already voted for this destination → remove vote.
// If user voted for a different destination → switch vote.
// If user hasn't voted → cast vote.
export function useToggleVote(tripId: string) {
  const queryClient = await import('@tanstack/react-query').then(m => m.useQueryClient)

  return useMutation({
    mutationFn: async ({
      destinationId,
      isCurrentlyVoted,
    }: {
      destinationId: string
      isCurrentlyVoted: boolean
    }) => {
      const { supabase } = await import('@/integrations/supabase/client')
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      if (isCurrentlyVoted) {
        const { error } = await fromTable('votes')
          .delete()
          .eq('trip_id', tripId)
          .eq('user_id', user.id)
        if (error) throw error
      } else {
        const { error } = await fromTable('votes').upsert(
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
