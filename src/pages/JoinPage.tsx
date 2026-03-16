import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useTripByCode } from '@/hooks/useTrip'
import { useJoinTrip } from '@/hooks/useTripMutations'
import { FormField, TextInput } from '@/components/FormField'

export default function JoinPage() {
  const { code } = useParams<{ code: string }>()
  const navigate = useNavigate()
  const [displayName, setDisplayName] = useState('')

  const { data: trip, isLoading, isError } = useTripByCode(code ?? '')
  const joinTrip = useJoinTrip()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!displayName.trim() || !code) return
    joinTrip.mutate({ code, displayName: displayName.trim() })
  }

  return (
    <div className="min-h-screen topo-curves flex flex-col" style={{ background: '#060d1f' }}>
      {/* Nav */}
      <nav
        className="flex items-center px-8 py-6"
        style={{ borderBottom: '1px solid rgba(201,149,42,0.1)' }}
      >
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-sm tracking-widest opacity-50 hover:opacity-100 transition-opacity"
          style={{ fontFamily: 'var(--font-body)', color: '#f2eadb', background: 'none', border: 'none', cursor: 'pointer' }}
        >
          <ArrowLeft size={14} />
          BACK
        </button>
        <span
          className="mx-auto font-display text-xl tracking-widest"
          style={{ color: '#c9952a', letterSpacing: '0.2em', fontFamily: 'var(--font-display)' }}
        >
          WANDERLUST
        </span>
        <div style={{ width: 60 }} />
      </nav>

      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div
          style={{
            width: '100%',
            maxWidth: 480,
            border: '1px solid rgba(201,149,42,0.2)',
            background: 'rgba(13,24,48,0.7)',
            padding: '48px',
            backdropFilter: 'blur(8px)',
          }}
        >
          {/* Trip code badge */}
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 10,
              letterSpacing: '0.3em',
              color: 'rgba(201,149,42,0.5)',
              marginBottom: 8,
              textAlign: 'center',
            }}
          >
            TRIP CODE · {(code ?? '').toUpperCase()}
          </p>

          {/* Heading */}
          <h1
            className="text-center mb-10"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(1.8rem, 5vw, 2.6rem)',
              fontWeight: 300,
              color: '#f2eadb',
              lineHeight: 1.1,
            }}
          >
            {isLoading
              ? <span className="animate-pulse" style={{ color: '#c9952a' }}>Finding trip…</span>
              : isError
              ? <span style={{ color: 'rgba(176,92,58,0.9)' }}>Trip not found</span>
              : <>You're joining <em style={{ color: '#c9952a' }}>{trip?.name}</em></>
            }
          </h1>

          {isError && (
            <p
              className="text-center mb-6"
              style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'rgba(242,234,219,0.4)' }}
            >
              Double-check the code and try again.
            </p>
          )}

          {!isError && !isLoading && (
            <form onSubmit={handleSubmit} className="flex flex-col gap-8">
              <FormField
                label="What should the group call you?"
                hint="This is how your fellow travelers will see you"
              >
                <TextInput
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                  placeholder="e.g. Sarah, Uncle Dave, Mom…"
                  autoFocus
                />
              </FormField>

              <button
                type="submit"
                disabled={!displayName.trim() || joinTrip.isPending}
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 12,
                  letterSpacing: '0.15em',
                  color: '#060d1f',
                  background: displayName.trim() ? '#c9952a' : 'rgba(201,149,42,0.3)',
                  border: 'none',
                  cursor: displayName.trim() ? 'pointer' : 'not-allowed',
                  padding: '16px 32px',
                  transition: 'background 0.2s',
                  width: '100%',
                }}
                onMouseEnter={e => { if (displayName.trim()) e.currentTarget.style.background = '#e8b84b' }}
                onMouseLeave={e => { if (displayName.trim()) e.currentTarget.style.background = '#c9952a' }}
              >
                {joinTrip.isPending ? 'JOINING…' : 'JOIN TRIP'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
