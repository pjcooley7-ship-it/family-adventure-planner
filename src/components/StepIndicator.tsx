interface StepIndicatorProps {
  steps: string[]
  current: number
}

export function StepIndicator({ steps, current }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-center gap-0 mb-12">
      {steps.map((label, i) => {
        const done = i < current
        const active = i === current

        return (
          <div key={i} className="flex items-center">
            {/* Node */}
            <div className="flex flex-col items-center gap-2">
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  border: active
                    ? '2px solid #c9952a'
                    : done
                    ? '2px solid rgba(201,149,42,0.5)'
                    : '1px solid rgba(201,149,42,0.2)',
                  background: active
                    ? 'rgba(201,149,42,0.15)'
                    : done
                    ? 'rgba(201,149,42,0.08)'
                    : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.3s',
                  position: 'relative',
                }}
              >
                {done ? (
                  <svg width="12" height="9" viewBox="0 0 12 9" fill="none">
                    <path d="M1 4L4.5 7.5L11 1" stroke="#c9952a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  <span
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: 11,
                      fontWeight: 500,
                      color: active ? '#c9952a' : 'rgba(201,149,42,0.35)',
                    }}
                  >
                    {i + 1}
                  </span>
                )}

                {/* Glow for active */}
                {active && (
                  <div
                    style={{
                      position: 'absolute',
                      inset: -4,
                      borderRadius: '50%',
                      background: 'radial-gradient(circle, rgba(201,149,42,0.15) 0%, transparent 70%)',
                    }}
                  />
                )}
              </div>

              <span
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 9,
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  color: active
                    ? 'rgba(201,149,42,0.9)'
                    : done
                    ? 'rgba(201,149,42,0.4)'
                    : 'rgba(242,234,219,0.2)',
                  whiteSpace: 'nowrap',
                  transition: 'color 0.3s',
                }}
              >
                {label}
              </span>
            </div>

            {/* Connector line */}
            {i < steps.length - 1 && (
              <div
                style={{
                  width: 48,
                  height: 1,
                  marginBottom: 20,
                  background: i < current
                    ? 'rgba(201,149,42,0.4)'
                    : 'rgba(201,149,42,0.1)',
                  transition: 'background 0.3s',
                  backgroundImage: i < current
                    ? 'none'
                    : 'repeating-linear-gradient(90deg, rgba(201,149,42,0.15) 0, rgba(201,149,42,0.15) 4px, transparent 4px, transparent 8px)',
                }}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
