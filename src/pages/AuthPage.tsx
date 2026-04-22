import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Loader } from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import { DocContainer } from '@/components/DocContainer'

type Mode = 'signin' | 'signup'

function Wordmark() {
  return (
    <button
      onClick={() => history.back()}
      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
    >
      <span style={{ fontFamily: 'var(--f-display)', fontSize: 17, fontWeight: 500, letterSpacing: '-0.02em', color: 'var(--ink)' }}>
        wanderlust<span style={{ color: 'var(--coral)' }}>.</span>
      </span>
    </button>
  )
}

export default function AuthPage() {
  const navigate = useNavigate()
  const [mode, setMode] = useState<Mode>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { data: { display_name: displayName } },
        })
        if (error) throw error
        toast.success('Account created — check your email to confirm, or sign in if confirmation is disabled.')
        navigate('/')
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        navigate('/')
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const isSignIn = mode === 'signin'

  return (
    <DocContainer>
      {/* Nav */}
      <nav style={{
        padding: '18px 24px',
        borderBottom: '1px solid var(--hairline)',
        display: 'flex', alignItems: 'center',
        background: 'var(--paper)',
      }}>
        <Wordmark />
      </nav>

      {/* Content */}
      <div style={{ padding: '48px 28px 32px' }}>
        <p className="eyebrow" style={{ marginBottom: 14 }}>
          {isSignIn ? 'WELCOME BACK' : 'NEW TRAVELER'}
        </p>
        <h1 className="display" style={{ fontSize: 40, marginBottom: 8 }}>
          {isSignIn
            ? <>Sign <em style={{ fontStyle: 'italic', color: 'var(--coral)' }}>in.</em></>
            : <>Create <em style={{ fontStyle: 'italic', color: 'var(--coral)' }}>account.</em></>}
        </h1>
        <p style={{ fontFamily: 'var(--f-sans)', fontSize: 14, color: 'var(--ink-2)', marginBottom: 36 }}>
          {isSignIn ? 'Pick up where you left off.' : 'Start planning trips with your people.'}
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
          {mode === 'signup' && (
            <UnderlineField label="YOUR NAME">
              <input
                type="text"
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                placeholder="e.g. Sarah"
                required
                className="input-underline"
                style={{ fontSize: 17 }}
              />
            </UnderlineField>
          )}

          <UnderlineField label="EMAIL">
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@somewhere.com"
              required
              className="input-underline"
              style={{ fontSize: 17 }}
            />
          </UnderlineField>

          <UnderlineField
            label="PASSWORD"
            right={isSignIn ? <button type="button" className="btn-text" style={{ fontSize: 10 }}>FORGOT?</button> : undefined}
          >
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder={isSignIn ? '••••••••••' : 'Min. 6 characters'}
              required
              minLength={6}
              className="input-underline"
              style={{ fontSize: 17 }}
            />
          </UnderlineField>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary coral"
            style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: 15, marginTop: 10 }}
          >
            {loading
              ? <><Loader size={15} className="spin" /> Please wait…</>
              : 'Continue →'}
          </button>
        </form>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0' }}>
          <div style={{ flex: 1, height: 1, background: 'var(--hairline)' }} />
          <span className="mono" style={{ fontSize: 9, color: 'var(--ink-3)', letterSpacing: '0.2em' }}>OR</span>
          <div style={{ flex: 1, height: 1, background: 'var(--hairline)' }} />
        </div>

        <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--ink-2)', fontFamily: 'var(--f-sans)' }}>
          {isSignIn ? 'New here?' : 'Already have an account?'}{' '}
          <button
            type="button"
            onClick={() => setMode(isSignIn ? 'signup' : 'signin')}
            style={{
              background: 'none', border: 'none', cursor: 'pointer', padding: 0,
              fontFamily: 'var(--f-sans)', fontSize: 13, fontWeight: 500,
              color: 'var(--coral)', letterSpacing: 0, textTransform: 'none',
            }}
          >
            {isSignIn ? 'Create account →' : 'Sign in →'}
          </button>
        </p>
      </div>
    </DocContainer>
  )
}

function UnderlineField({ label, children, right }: { label: string; children: React.ReactNode; right?: React.ReactNode }) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
        <p className="eyebrow">{label}</p>
        {right}
      </div>
      {children}
    </div>
  )
}
