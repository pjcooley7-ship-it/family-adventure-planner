import { useMutation } from '@tanstack/react-query'
import { useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { supabase } from '@/integrations/supabase/client'

export interface Activity {
  name: string
  category: string
  description: string
  link: string
}

export function useSuggestActivities(tripId: string) {
  const navigate = useNavigate()
  const location = useLocation()

  return useMutation({
    mutationFn: async () => {
      const { data: refreshed, error: refreshErr } = await supabase.auth.refreshSession()
      if (refreshErr || !refreshed.session) {
        navigate('/auth', { state: { from: location } })
        throw new Error('Session expired')
      }

      const fnUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/suggest-activities`
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
      if (!res.ok) throw new Error(body.error ?? 'Failed to suggest activities')
      return body.activities as Activity[]
    },
    onError: (err: Error) => {
      toast.error(err.message)
    },
  })
}
