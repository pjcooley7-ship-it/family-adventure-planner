interface DocContainerProps {
  children: React.ReactNode
}

/**
 * The "paper document on surface" wrapper used by every page.
 * Outer div = --color-surface (paper table).
 * Inner div = --color-bg (the document itself), max-width 720px, thick border.
 */
export function DocContainer({ children }: DocContainerProps) {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-surface)' }}>
      <div
        className="doc-inner"
        style={{
          maxWidth: 720,
          margin: '0 auto',
          background: 'var(--color-bg)',
          border: '2.5px solid var(--color-ink)',
          borderTop: 'none',
          borderBottom: 'none',
          minHeight: '100vh',
        }}
      >
        {children}
      </div>
    </div>
  )
}
