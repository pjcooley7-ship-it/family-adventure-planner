import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div
        className="min-h-screen topo-curves flex items-center justify-center"
        style={{ background: '#060d1f' }}
      >
        <p
          className="font-display text-2xl italic animate-pulse"
          style={{ fontFamily: 'var(--font-display)', color: '#c9952a' }}
        >
          charting your course...
        </p>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />
  }

  return <>{children}</>
}
