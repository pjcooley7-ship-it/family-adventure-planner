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
      {hint && (
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'rgba(242,234,219,0.3)' }}>
          {hint}
        </p>
      )}
    </div>
  )
}

const inputBase: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: 15,
  color: '#f2eadb',
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(201,149,42,0.25)',
  padding: '12px 16px',
  outline: 'none',
  width: '100%',
  transition: 'border-color 0.2s',
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
      style={{ ...inputBase, colorScheme: 'dark' }}
      onFocus={e => { e.currentTarget.style.borderColor = 'rgba(201,149,42,0.7)' }}
      onBlur={e => { e.currentTarget.style.borderColor = 'rgba(201,149,42,0.25)' }}
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
      style={{ ...inputBase, cursor: 'pointer', colorScheme: 'dark' }}
      onFocus={e => { e.currentTarget.style.borderColor = 'rgba(201,149,42,0.7)' }}
      onBlur={e => { e.currentTarget.style.borderColor = 'rgba(201,149,42,0.25)' }}
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
    <div className="flex items-center gap-0" style={{ display: 'inline-flex' }}>
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        style={{
          width: 44,
          height: 44,
          fontFamily: 'var(--font-body)',
          fontSize: 20,
          color: '#c9952a',
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(201,149,42,0.25)',
          cursor: 'pointer',
          transition: 'background 0.2s',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(201,149,42,0.1)' }}
        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)' }}
      >
        −
      </button>
      <span
        style={{
          width: 56,
          height: 44,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'var(--font-display)',
          fontSize: 22,
          color: '#f2eadb',
          background: 'rgba(255,255,255,0.03)',
          borderTop: '1px solid rgba(201,149,42,0.25)',
          borderBottom: '1px solid rgba(201,149,42,0.25)',
        }}
      >
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        style={{
          width: 44,
          height: 44,
          fontFamily: 'var(--font-body)',
          fontSize: 20,
          color: '#c9952a',
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(201,149,42,0.25)',
          cursor: 'pointer',
          transition: 'background 0.2s',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(201,149,42,0.1)' }}
        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)' }}
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
      <div
        style={{
          width: 44,
          height: 24,
          borderRadius: 12,
          background: checked ? '#c9952a' : 'rgba(255,255,255,0.08)',
          border: '1px solid rgba(201,149,42,0.3)',
          position: 'relative',
          transition: 'background 0.25s',
          flexShrink: 0,
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 3,
            left: checked ? 22 : 3,
            width: 16,
            height: 16,
            borderRadius: '50%',
            background: '#f2eadb',
            transition: 'left 0.25s',
          }}
        />
      </div>
      <span style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'rgba(242,234,219,0.7)' }}>
        {label}
      </span>
    </button>
  )
}
