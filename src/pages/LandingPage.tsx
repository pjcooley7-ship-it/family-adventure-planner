import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FlightPathMap } from '@/components/FlightPathMap'
import { ArrowRight, Globe, Users, Sparkles } from 'lucide-react'

export default function LandingPage() {
  const navigate = useNavigate()
  const [joinCode, setJoinCode] = useState('')

  function handleCreate() {
    // Will wire to Supabase — placeholder navigation for now
    navigate('/trip/demo')
  }

  function handleJoin(e: React.FormEvent) {
    e.preventDefault()
    if (joinCode.trim()) navigate(`/trip/${joinCode.trim().toLowerCase()}`)
  }

  return (
    <div className="min-h-screen topo-curves" style={{ background: '#060d1f' }}>

      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-6" style={{ borderBottom: '1px solid rgba(201,149,42,0.12)' }}>
        <span
          className="font-display text-2xl tracking-widest"
          style={{ color: '#c9952a', letterSpacing: '0.2em' }}
        >
          WANDERLUST
        </span>
        <div className="flex items-center gap-6">
          <button
            onClick={() => {}}
            className="text-sm tracking-widest opacity-60 hover:opacity-100 transition-opacity"
            style={{ fontFamily: 'var(--font-body)', letterSpacing: '0.12em', color: '#f2eadb' }}
          >
            SIGN IN
          </button>
          <button
            onClick={handleCreate}
            className="text-sm tracking-widest px-5 py-2 transition-all hover:bg-gold"
            style={{
              fontFamily: 'var(--font-body)',
              letterSpacing: '0.12em',
              color: '#c9952a',
              border: '1px solid rgba(201,149,42,0.4)',
              background: 'transparent',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(201,149,42,0.1)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'transparent'
            }}
          >
            CREATE TRIP
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative px-8 pt-16 pb-8 flex flex-col items-center text-center">
        {/* Eyebrow */}
        <p
          className="animate-fade-up text-xs tracking-widest mb-6"
          style={{ color: '#c9952a', letterSpacing: '0.3em', fontFamily: 'var(--font-body)' }}
        >
          WHERE SHALL WE MEET
        </p>

        {/* Main headline */}
        <h1
          className="animate-fade-up delay-200 font-display leading-none mb-4"
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(4rem, 10vw, 8.5rem)',
            fontWeight: 300,
            color: '#f2eadb',
            letterSpacing: '-0.01em',
          }}
        >
          Find your
          <br />
          <em style={{ color: '#c9952a', fontStyle: 'italic' }}>common ground</em>
        </h1>

        <p
          className="animate-fade-up delay-400 mt-6 max-w-lg text-base leading-relaxed"
          style={{
            color: 'rgba(242, 234, 219, 0.55)',
            fontFamily: 'var(--font-body)',
            fontWeight: 300,
          }}
        >
          Everyone submits where they're coming from, what they can spend,
          and what they love doing. AI finds the destination that works for all of you.
        </p>

        {/* CTA row */}
        <div className="animate-fade-up delay-600 mt-10 flex flex-col sm:flex-row items-center gap-4">
          <button
            onClick={handleCreate}
            className="flex items-center gap-3 px-8 py-4 text-sm tracking-widest transition-all"
            style={{
              fontFamily: 'var(--font-body)',
              letterSpacing: '0.15em',
              background: '#c9952a',
              color: '#060d1f',
              border: 'none',
              cursor: 'pointer',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#e8b84b' }}
            onMouseLeave={e => { e.currentTarget.style.background = '#c9952a' }}
          >
            START A TRIP
            <ArrowRight size={16} />
          </button>

          <form onSubmit={handleJoin} className="flex items-center gap-0">
            <input
              value={joinCode}
              onChange={e => setJoinCode(e.target.value)}
              placeholder="enter trip code"
              className="px-4 py-4 text-sm bg-transparent outline-none"
              style={{
                fontFamily: 'var(--font-body)',
                color: '#f2eadb',
                border: '1px solid rgba(201,149,42,0.3)',
                borderRight: 'none',
                width: 180,
                letterSpacing: '0.05em',
              }}
            />
            <button
              type="submit"
              className="px-4 py-4 text-sm transition-all"
              style={{
                fontFamily: 'var(--font-body)',
                color: '#c9952a',
                border: '1px solid rgba(201,149,42,0.3)',
                background: 'transparent',
                cursor: 'pointer',
                letterSpacing: '0.1em',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(201,149,42,0.1)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
            >
              JOIN
            </button>
          </form>
        </div>
      </section>

      {/* Map */}
      <section className="animate-fade-in delay-800 flex justify-center px-4 py-8">
        <FlightPathMap />
      </section>

      {/* How it works */}
      <section className="px-8 py-16 max-w-5xl mx-auto">
        <p
          className="text-xs tracking-widest text-center mb-14"
          style={{ color: 'rgba(201,149,42,0.5)', letterSpacing: '0.3em', fontFamily: 'var(--font-body)' }}
        >
          HOW IT WORKS
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-px" style={{ border: '1px solid rgba(201,149,42,0.15)' }}>
          {[
            {
              icon: <Globe size={20} />,
              step: '01',
              title: 'Create a trip',
              body: 'Start a group trip and share the invite link with your travel party — family, friends, whoever\'s joining.',
            },
            {
              icon: <Users size={20} />,
              step: '02',
              title: 'Everyone submits',
              body: 'Each person shares their origin city, travel dates, budget, party size, and what they love doing.',
            },
            {
              icon: <Sparkles size={20} />,
              step: '03',
              title: 'AI finds the match',
              body: 'We analyze all submissions and surface 2–3 destinations with real flights, hotels, and activities for each.',
            },
          ].map(({ icon, step, title, body }) => (
            <div
              key={step}
              className="p-10 flex flex-col gap-5"
              style={{
                background: 'rgba(13, 24, 48, 0.6)',
                borderRight: '1px solid rgba(201,149,42,0.1)',
              }}
            >
              <div className="flex items-start justify-between">
                <span style={{ color: '#c9952a' }}>{icon}</span>
                <span
                  className="font-display text-5xl"
                  style={{ color: 'rgba(201,149,42,0.1)', fontFamily: 'var(--font-display)', fontWeight: 300 }}
                >
                  {step}
                </span>
              </div>
              <h3
                className="font-display text-2xl"
                style={{ fontFamily: 'var(--font-display)', color: '#f2eadb', fontWeight: 400 }}
              >
                {title}
              </h3>
              <p
                className="text-sm leading-relaxed"
                style={{ color: 'rgba(242, 234, 219, 0.45)', fontFamily: 'var(--font-body)', fontWeight: 300 }}
              >
                {body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer
        className="px-8 py-8 text-center text-xs tracking-widest"
        style={{
          color: 'rgba(201,149,42,0.25)',
          borderTop: '1px solid rgba(201,149,42,0.08)',
          fontFamily: 'var(--font-body)',
          letterSpacing: '0.2em',
        }}
      >
        WANDERLUST — FIND YOUR COMMON GROUND
      </footer>
    </div>
  )
}
