import { useParams } from 'react-router-dom'

export default function TripPage() {
  const { tripId } = useParams()

  return (
    <div className="min-h-screen topo-curves flex flex-col items-center justify-center gap-6 px-8" style={{ background: '#060d1f' }}>
      <span className="text-xs tracking-widest" style={{ color: '#c9952a', letterSpacing: '0.3em', fontFamily: 'var(--font-body)' }}>
        TRIP
      </span>
      <h1 className="font-display text-5xl text-center" style={{ fontFamily: 'var(--font-display)', color: '#f2eadb', fontWeight: 300 }}>
        {tripId}
      </h1>
      <p style={{ color: 'rgba(242,234,219,0.4)', fontFamily: 'var(--font-body)', fontSize: 14 }}>
        Trip dashboard — coming soon
      </p>
    </div>
  )
}
