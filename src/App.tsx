import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'

const LandingPage = lazy(() => import('@/pages/LandingPage'))
const TripPage = lazy(() => import('@/pages/TripPage'))
const PreferencesPage = lazy(() => import('@/pages/PreferencesPage'))
const ResultsPage = lazy(() => import('@/pages/ResultsPage'))

function LoadingScreen() {
  return (
    <div className="min-h-screen topo-bg flex items-center justify-center">
      <div className="font-display text-gold text-2xl italic animate-pulse">
        charting your course...
      </div>
    </div>
  )
}

export default function App() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/trip/:tripId" element={<TripPage />} />
        <Route path="/trip/:tripId/preferences" element={<PreferencesPage />} />
        <Route path="/trip/:tripId/results" element={<ResultsPage />} />
      </Routes>
    </Suspense>
  )
}
