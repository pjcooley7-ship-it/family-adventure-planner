import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { supabase } from '@/integrations/supabase/client'
import { DocContainer } from '@/components/DocContainer'

type Mode = 'signin' | 'signup'

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

  return (
    <DocContainer>
      {/* Nav */}
      <nav style={{
        padding: '20px 32px',
        borderBottom: '2.5px solid var(--color-ink)',
        display: 'flex', alignItems: 'center',
      }}>
        <button
          onClick={() => navigate('/')}
          style={{
            fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 600,
            color: 'var(--color-ink)', background: 'none', border: 'none', cursor: 'pointer',
            letterSpacing: '-0.3px',
          }}
        >
          Wanderlust
        </button>
      </nav>

      {/* Content */}
      <div style={{ padding: '48px 32px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

        {/* Mode tabs */}
        <div style={{
          display: 'flex', width: '100%', maxWidth: 400,
          border: '2.5px solid var(--color-ink)', marginBottom: 32,
        }}>
          {(['signin', 'signup'] as Mode[]).map(m => (
            <button
              key={m}
              onClick={() => setMode(m)}
              style={{
                flex: 1,
                fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase',
                color: mode === m ? 'var(--color-bg)' : 'var(--color-ink-2)',
                background: mode === m ? 'var(--color-ink)' : 'transparent',
                border: 'none', padding: '10px 0',
                cursor: 'pointer', transition: 'background 150ms ease, color 150ms ease',
              }}
            >
              {m === 'signin' ? 'Sign In' : 'Create Account'}
            </button>
          ))}
        </div>

        {/* Form card */}
        <div
          style={{ width: '100%', maxWidth: 400 }}
          className="animate-fade-up"
        >
          <h1 style={{
            fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 600,
            color: 'var(--color-ink)', marginBottom: 4, letterSpacing: '-0.5px',
          }}>
            {mode === 'signup' ? 'Create account' : 'Welcome back'}
          </h1>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--color-ink-2)', marginBottom: 28 }}>
            {mode === 'signup' ? 'Start planning trips with your people.' : 'Sign in to your Wanderlust account.'}
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {mode === 'signup' && (
              <Field label="Your name">
                <input type="text" value={displayName} onChange={e => setDisplayName(e.target.value)}
                  placeholder="e.g. Sarah" required style={inputStyle}
                  onFocus={e => { e.currentTarget.style.boxShadow = '4px 4px 0 var(--color-ink)' }}
                  onBlur={e => { e.currentTarget.style.boxShadow = 'none' }}
                />
              </Field>
            )}
            <Field label="Email">
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com" required style={inputStyle}
                onFocus={e => { e.currentTarget.style.boxShadow = '4px 4px 0 var(--color-ink)' }}
                onBlur={e => { e.currentTarget.style.boxShadow = 'none' }}
              />
            </Field>
            <Field label="Password">
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder={mode === 'signup' ? 'Min. 6 characters' : '••••••••'}
                required minLength={6} style={inputStyle}
                onFocus={e => { e.currentTarget.style.boxShadow = '4px 4px 0 var(--color-ink)' }}
                onBlur={e => { e.currentTarget.style.boxShadow = 'none' }}
              />
            </Field>

            <button
              type="submit"
              disabled={loading}
              className="brut-btn-primary"
              style={{ marginTop: 4, justifyContent: 'center', width: '100%', fontSize: 14, padding: '13px 16px' }}
            >
              {loading ? 'PLEASE WAIT...' : mode === 'signup' ? 'CREATE ACCOUNT' : 'SIGN IN'}
            </button>
          </form>

          <p style={{
            marginTop: 24, fontFamily: 'var(--font-body)', fontSize: 13,
            color: 'var(--color-ink-2)', textAlign: 'center',
          }}>
            {mode === 'signup' ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              onClick={() => setMode(mode === 'signup' ? 'signin' : 'signup')}
              style={{
                fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600,
                color: 'var(--color-ink)', background: 'none', border: 'none',
                cursor: 'pointer', padding: 0, textDecoration: 'underline',
                textDecorationThickness: '2px',
              }}
            >
              {mode === 'signup' ? 'Sign in' : 'Create one'}
            </button>
          </p>
        </div>
      </div>
    </DocContainer>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label style={{
        fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.1em',
        color: 'var(--color-ink-2)', textTransform: 'uppercase',
      }}>
        {label}
      </label>
      {children}
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)', fontSize: 15,
  color: 'var(--color-ink)', background: 'var(--color-bg)',
  border: '2.5px solid var(--color-ink)', padding: '12px 14px',
  outline: 'none', width: '100%', transition: 'box-shadow 150ms ease',
}
