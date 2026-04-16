interface StepIndicatorProps {
  steps: string[]
  current: number
}

export function StepIndicator({ steps, current }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-center gap-0 mb-10">
      {steps.map((label, i) => {
        const done   = i < current
        const active = i === current

        return (
          <div key={i} className="flex items-center">
            {/* Step block */}
            <div className="flex flex-col items-center gap-2">
              <div
                style={{
                  width: 32,
                  height: 32,
                  border: '2.5px solid var(--color-ink)',
                  background: active || done ? 'var(--color-ink)' : 'var(--color-bg)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background 200ms ease',
                }}
              >
                {done ? (
                  <svg width="12" height="9" viewBox="0 0 12 9" fill="none">
                    <path d="M1 4L4.5 7.5L11 1" stroke="#FFFDF7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 11,
                      fontWeight: 700,
                      color: active ? '#FFFDF7' : 'var(--color-ink-3)',
                    }}
                  >
                    {i + 1}
                  </span>
                )}
              </div>

              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 9,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: active || done ? 'var(--color-ink)' : 'var(--color-ink-3)',
                  whiteSpace: 'nowrap',
                  transition: 'color 200ms ease',
                }}
              >
                {label}
              </span>
            </div>

            {/* Connector */}
            {i < steps.length - 1 && (
              <div
                style={{
                  width: 36,
                  height: 2.5,
                  marginBottom: 20,
                  background: i < current ? 'var(--color-ink)' : 'var(--border-soft)',
                  transition: 'background 200ms ease',
                }}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
