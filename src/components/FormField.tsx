interface FormFieldProps {
  label: string
  hint?: string
  children: React.ReactNode
}

export function FormField({ label, hint, children }: FormFieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <label
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 10,
          letterSpacing: '0.1em',
          color: 'var(--color-ink-2)',
          textTransform: 'uppercase',
        }}
      >
        {label}
      </label>
      {children}
      {hint && (
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-ink-3)' }}>
          {hint}
        </p>
      )}
    </div>
  )
}

const inputBase: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: 15,
  color: 'var(--color-ink)',
  background: 'var(--color-bg)',
  border: '2.5px solid var(--color-ink)',
  padding: '12px 14px',
  outline: 'none',
  width: '100%',
  transition: 'box-shadow 150ms ease',
}

interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export function TextInput({ value, onChange, placeholder, type = 'text', ...rest }: TextInputProps) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      style={inputBase}
      onFocus={e => { e.currentTarget.style.boxShadow = '4px 4px 0 var(--color-ink)' }}
      onBlur={e => { e.currentTarget.style.boxShadow = 'none' }}
      {...rest}
    />
  )
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  value: string
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
  children: React.ReactNode
}

export function Select({ value, onChange, children, ...rest }: SelectProps) {
  return (
    <select
      value={value}
      onChange={onChange}
      style={{ ...inputBase, cursor: 'pointer' }}
      onFocus={e => { e.currentTarget.style.boxShadow = '4px 4px 0 var(--color-ink)' }}
      onBlur={e => { e.currentTarget.style.boxShadow = 'none' }}
      {...rest}
    >
      {children}
    </select>
  )
}

interface CounterProps {
  value: number
  onChange: (val: number) => void
  min?: number
  max?: number
}

export function Counter({ value, onChange, min = 0, max = 20 }: CounterProps) {
  return (
    <div style={{ display: 'inline-flex' }}>
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        style={{
          width: 40, height: 40,
          fontFamily: 'var(--font-mono)', fontSize: 18,
          color: 'var(--color-ink)',
          background: 'var(--color-bg)',
          border: '2.5px solid var(--color-ink)', borderRight: 'none',
          cursor: 'pointer', transition: 'background 150ms ease, color 150ms ease',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = 'var(--color-ink)'; e.currentTarget.style.color = 'var(--color-bg)' }}
        onMouseLeave={e => { e.currentTarget.style.background = 'var(--color-bg)'; e.currentTarget.style.color = 'var(--color-ink)' }}
      >
        −
      </button>
      <span
        style={{
          width: 52, height: 40,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'var(--font-mono)', fontSize: 16, fontWeight: 700,
          color: 'var(--color-ink)',
          background: 'var(--color-surface)',
          border: '2.5px solid var(--color-ink)',
          borderLeft: 'none', borderRight: 'none',
        }}
      >
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        style={{
          width: 40, height: 40,
          fontFamily: 'var(--font-mono)', fontSize: 18,
          color: 'var(--color-ink)',
          background: 'var(--color-bg)',
          border: '2.5px solid var(--color-ink)', borderLeft: 'none',
          cursor: 'pointer', transition: 'background 150ms ease, color 150ms ease',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = 'var(--color-ink)'; e.currentTarget.style.color = 'var(--color-bg)' }}
        onMouseLeave={e => { e.currentTarget.style.background = 'var(--color-bg)'; e.currentTarget.style.color = 'var(--color-ink)' }}
      >
        +
      </button>
    </div>
  )
}

interface ToggleProps {
  checked: boolean
  onChange: (val: boolean) => void
  label: string
}

export function Toggle({ checked, onChange, label }: ToggleProps) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex items-center gap-3"
      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
    >
      {/* Square track — no border-radius */}
      <div
        style={{
          width: 44, height: 24,
          background: checked ? 'var(--color-ink)' : 'var(--color-bg)',
          border: '2.5px solid var(--color-ink)',
          position: 'relative',
          transition: 'background 150ms ease',
          flexShrink: 0,
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 2,
            left: checked ? 20 : 2,
            width: 16, height: 16,
            background: checked ? 'var(--color-bg)' : 'var(--color-ink)',
            transition: 'left 150ms ease',
          }}
        />
      </div>
      <span style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--color-ink)' }}>
        {label}
      </span>
    </button>
  )
}
