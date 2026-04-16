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
    <div
      className="min-h-screen flex flex-col items-center justify-center gap-5"
      style={{ background: 'var(--color-surface)' }}
    >
      <div
        style={{
          width: 36, height: 36,
          border: '3px solid var(--color-ink)',
          borderTopColor: 'transparent',
          animation: 'spin 1s linear infinite',
        }}
      />
      <p
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          color: 'var(--color-ink-3)',
        }}
      >
        Loading…
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
