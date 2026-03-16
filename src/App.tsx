import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import { RequireAuth } from '@/components/RequireAuth'

const LandingPage       = lazy(() => import('@/pages/LandingPage'))
const AuthPage          = lazy(() => import('@/pages/AuthPage'))
const AuthCallbackPage  = lazy(() => import('@/pages/AuthCallbackPage'))
const JoinPage          = lazy(() => import('@/pages/JoinPage'))
const TripPage          = lazy(() => import('@/pages/TripPage'))
const PreferencesPage   = lazy(() => import('@/pages/PreferencesPage'))
const ResultsPage       = lazy(() => import('@/pages/ResultsPage'))

function LoadingScreen() {
  return (
    <div className="min-h-screen topo-curves flex items-center justify-center" style={{ background: '#060d1f' }}>
      <p className="font-display text-2xl italic animate-pulse" style={{ fontFamily: 'var(--font-display)', color: '#c9952a' }}>
        charting your course...
      </p>
    </div>
  )
}

export default function App() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        <Route path="/"                           element={<LandingPage />} />
        <Route path="/auth"                       element={<AuthPage />} />
        <Route path="/auth/callback"              element={<AuthCallbackPage />} />
        <Route path="/join/:code"                 element={<RequireAuth><JoinPage /></RequireAuth>} />
        <Route path="/trip/:tripId"               element={<RequireAuth><TripPage /></RequireAuth>} />
        <Route path="/trip/:tripId/preferences"   element={<RequireAuth><PreferencesPage /></RequireAuth>} />
        <Route path="/trip/:tripId/results"       element={<RequireAuth><ResultsPage /></RequireAuth>} />
      </Routes>
    </Suspense>
  )
}
