import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { supabase } from '@/integrations/supabase/client'

type Mode = 'signin' | 'signup'

export default function AuthPage() {
  const navigate = useNavigate()
  const [mode, setMode] = useState<Mode>('signup')
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
          email,
          password,
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
    <div
      className="min-h-screen topo-curves flex flex-col items-center justify-center px-4"
      style={{ background: '#060d1f' }}
    >
      {/* Logo */}
      <button
        onClick={() => navigate('/')}
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 22,
          letterSpacing: '0.2em',
          color: '#c9952a',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          marginBottom: 48,
          fontStyle: 'italic',
        }}
      >
        Wanderlust
      </button>

      {/* Card */}
      <div
        style={{
          width: '100%',
          maxWidth: 420,
          border: '1px solid rgba(201,149,42,0.2)',
          background: 'rgba(13,24,48,0.8)',
          padding: '48px 40px',
          backdropFilter: 'blur(8px)',
        }}
        className="animate-fade-up"
      >
        {/* Heading */}
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '2.2rem',
            fontWeight: 300,
            color: '#f2eadb',
            marginBottom: 6,
            lineHeight: 1.1,
          }}
        >
          {mode === 'signup' ? 'Create account' : 'Welcome back'}
        </h1>
        <p
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 13,
            color: 'rgba(242,234,219,0.4)',
            marginBottom: 36,
          }}
        >
          {mode === 'signup'
            ? 'Start planning trips with your people.'
            : 'Sign in to your Wanderlust account.'}
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {mode === 'signup' && (
            <Field label="Your name">
              <input
                type="text"
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                placeholder="e.g. Sarah"
                required
                style={inputStyle}
                onFocus={e => { e.currentTarget.style.borderColor = 'rgba(201,149,42,0.7)' }}
                onBlur={e => { e.currentTarget.style.borderColor = 'rgba(201,149,42,0.25)' }}
              />
            </Field>
          )}

          <Field label="Email">
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              style={inputStyle}
              onFocus={e => { e.currentTarget.style.borderColor = 'rgba(201,149,42,0.7)' }}
              onBlur={e => { e.currentTarget.style.borderColor = 'rgba(201,149,42,0.25)' }}
            />
          </Field>

          <Field label="Password">
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder={mode === 'signup' ? 'Min. 6 characters' : '••••••••'}
              required
              minLength={6}
              style={inputStyle}
              onFocus={e => { e.currentTarget.style.borderColor = 'rgba(201,149,42,0.7)' }}
              onBlur={e => { e.currentTarget.style.borderColor = 'rgba(201,149,42,0.25)' }}
            />
          </Field>

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: 8,
              fontFamily: 'var(--font-body)',
              fontSize: 12,
              letterSpacing: '0.15em',
              color: '#060d1f',
              background: loading ? 'rgba(201,149,42,0.5)' : '#c9952a',
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              padding: '15px 24px',
              transition: 'background 0.2s',
              width: '100%',
            }}
            onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#e8b84b' }}
            onMouseLeave={e => { if (!loading) e.currentTarget.style.background = '#c9952a' }}
          >
            {loading ? 'PLEASE WAIT...' : mode === 'signup' ? 'CREATE ACCOUNT' : 'SIGN IN'}
          </button>
        </form>

        {/* Toggle */}
        <p
          style={{
            marginTop: 28,
            fontFamily: 'var(--font-body)',
            fontSize: 13,
            color: 'rgba(242,234,219,0.35)',
            textAlign: 'center',
          }}
        >
          {mode === 'signup' ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            onClick={() => setMode(mode === 'signup' ? 'signin' : 'signup')}
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 13,
              color: '#c9952a',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              textDecoration: 'underline',
              textDecorationColor: 'rgba(201,149,42,0.4)',
            }}
          >
            {mode === 'signup' ? 'Sign in' : 'Create one'}
          </button>
        </p>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <label
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: 11,
          letterSpacing: '0.2em',
          color: 'rgba(201,149,42,0.8)',
          textTransform: 'uppercase',
        }}
      >
        {label}
      </label>
      {children}
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: 15,
  color: '#f2eadb',
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(201,149,42,0.25)',
  padding: '12px 16px',
  outline: 'none',
  width: '100%',
  colorScheme: 'dark',
  transition: 'border-color 0.2s',
}
