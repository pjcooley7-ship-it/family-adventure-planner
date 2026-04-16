import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useTripByCode, useTripMembers } from '@/hooks/useTrip'
import { useJoinTrip } from '@/hooks/useTripMutations'
import { useAuth } from '@/hooks/useAuth'
import { FormField, TextInput } from '@/components/FormField'
import { DocContainer } from '@/components/DocContainer'

export default function JoinPage() {
  const { code } = useParams<{ code: string }>()
  const navigate = useNavigate()
  const [displayName, setDisplayName] = useState('')

  const { user } = useAuth()
  const { data: trip, isLoading, isError } = useTripByCode(code ?? '')
  const { data: members = [] } = useTripMembers(trip?.id ?? '')
  const joinTrip = useJoinTrip()

  const alreadyMember = !!user && members.some(m => m.user_id === user.id)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!displayName.trim() || !code) return
    joinTrip.mutate({ code, displayName: displayName.trim() })
  }

  return (
    <DocContainer>
      {/* Nav */}
      <nav style={{
        padding: '18px 32px',
        borderBottom: '2.5px solid var(--color-ink)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2"
          style={{
            fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase',
            color: 'var(--color-ink-2)', background: 'none', border: 'none', cursor: 'pointer',
          }}
        >
          <ArrowLeft size={12} />
          BACK
        </button>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 600, color: 'var(--color-ink)' }}>
          Wanderlust
        </span>
        <div style={{ width: 60 }} />
      </nav>

      <div style={{ padding: '48px 32px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {/* Code badge */}
        <p className="brut-label" style={{ marginBottom: 10 }}>
          TRIP CODE · {(code ?? '').toUpperCase()}
        </p>

        {/* Heading */}
        <h1
          className="text-center"
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(1.5rem, 5vw, 2.2rem)',
            fontWeight: 600,
            letterSpacing: '-0.5px',
            color: 'var(--color-ink)',
            lineHeight: 1.15,
            marginBottom: 32,
          }}
        >
          {isLoading
            ? <span style={{ color: 'var(--color-ink-3)' }}>Finding trip…</span>
            : isError
            ? <span style={{ color: 'var(--color-coral)' }}>Trip not found</span>
            : <>Joining <em style={{ fontStyle: 'normal', textDecoration: 'underline', textDecorationThickness: '2.5px' }}>{trip?.name}</em></>
          }
        </h1>

        {isError && (
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--color-ink-2)', marginBottom: 24 }}>
            Double-check the code and try again.
          </p>
        )}

        {!isError && !isLoading && alreadyMember && (
          <div style={{ width: '100%', maxWidth: 400 }} className="flex flex-col items-center gap-5">
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--color-ink-2)', textAlign: 'center', lineHeight: 1.6 }}>
              You're already part of this trip.
            </p>
            <button
              onClick={() => navigate(`/trip/${trip!.id}`)}
              className="brut-btn-primary"
              style={{ justifyContent: 'center', width: '100%', fontSize: 13, padding: '13px' }}
            >
              GO TO TRIP
            </button>
          </div>
        )}

        {!isError && !isLoading && !alreadyMember && (
          <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: 400 }} className="flex flex-col gap-7">
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
              className="brut-btn-primary"
              style={{ justifyContent: 'center', width: '100%', fontSize: 13, padding: '13px' }}
            >
              {joinTrip.isPending ? 'JOINING…' : 'JOIN TRIP'}
            </button>
          </form>
        )}
      </div>
    </DocContainer>
  )
}
