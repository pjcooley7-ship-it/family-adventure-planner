import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/integrations/supabase/client'

export default function AuthCallbackPage() {
  const navigate = useNavigate()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      navigate(session ? '/' : '/auth', { replace: true })
    })
  }, [navigate])

  return (
    <div
      className="min-h-screen topo-curves flex items-center justify-center"
      style={{ background: '#060d1f' }}
    >
      <p
        className="font-display text-2xl italic animate-pulse"
        style={{ fontFamily: 'var(--font-display)', color: '#c9952a' }}
      >
        confirming your account...
      </p>
    </div>
  )
}
