// screens.jsx — redesigned Wanderlust screens (refined)
// Each screen is sized 390×780 (mobile-first, which is what the app is)

const { useState } = React;

// ═══════════════════════════════════════════════════════════════════════════
// Shared primitives
// ═══════════════════════════════════════════════════════════════════════════

const Frame = ({ children, style }) => (
  <div className="doc" style={{
    width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
    background: 'var(--paper)', ...style,
  }}>{children}</div>
);

const Nav = ({ left, right, center }) => (
  <div style={{
    padding: '18px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    borderBottom: '1px solid var(--hairline)', background: 'var(--paper)',
  }}>
    <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-start' }}>{left}</div>
    {center && <div style={{ flex: 0 }}>{center}</div>}
    <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', gap: 12, alignItems: 'center' }}>{right}</div>
  </div>
);

const Wordmark = ({ size = 17 }) => (
  <span style={{
    fontFamily: 'var(--f-display)', fontSize: size, fontWeight: 500,
    letterSpacing: '-0.02em', color: 'var(--ink)',
  }}>
    wanderlust<span style={{ color: 'var(--coral)' }}>.</span>
  </span>
);

const Avatar = ({ initial, color = 'var(--paper-3)', fg = 'var(--ink)', size = 36, ring }) => (
  <div className="avatar" style={{
    width: size, height: size, background: color, color: fg,
    fontSize: size * 0.4, boxShadow: ring ? `0 0 0 2px var(--paper), 0 0 0 3.5px ${ring}` : 'none',
  }}>{initial}</div>
);

// ═══════════════════════════════════════════════════════════════════════════
// 1. LANDING — refined
// Hero "Where should we all meet?" + one clear primary + map that breathes
// ═══════════════════════════════════════════════════════════════════════════

window.LandingRefined = () => (
  <Frame>
    <Nav
      left={<Wordmark />}
      right={<>
        <button className="btn-text">SIGN IN</button>
        <button className="btn-ghost" style={{ padding: '7px 14px', fontSize: 12 }}>CREATE TRIP</button>
      </>}
    />

    <div style={{ padding: '40px 28px 28px', flex: 1, overflow: 'auto' }}>
      <p className="eyebrow" style={{ marginBottom: 18 }}>GROUP TRIP PLANNER</p>
      <h1 className="display" style={{ fontSize: 52, marginBottom: 18, color: 'var(--ink)' }}>
        Where should<br/>we all <em style={{ fontStyle: 'italic', color: 'var(--coral)' }}>meet?</em>
      </h1>
      <p style={{ fontSize: 15, color: 'var(--ink-2)', lineHeight: 1.55, marginBottom: 28, maxWidth: 310 }}>
        Everyone submits where they're flying from, budget, and what they love doing. AI finds the destination that works for all of you.
      </p>

      {/* ONE primary CTA. Join code demoted to a quiet field below. */}
      <button className="btn-primary coral" style={{ fontSize: 15, padding: '14px 26px', width: '100%', justifyContent: 'center', marginBottom: 14 }}>
        Start a trip →
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 0 18px' }}>
        <span className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', letterSpacing: '0.1em' }}>OR JOIN WITH CODE</span>
        <div style={{ flex: 1, height: 1, background: 'var(--hairline)' }} />
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
        <input className="input mono" placeholder="ABCD12" style={{ fontSize: 18, letterSpacing: '0.15em', textTransform: 'uppercase' }} />
        <button className="btn-text">JOIN →</button>
      </div>
    </div>

    {/* Map band */}
    <div style={{ height: 180, background: 'var(--paper-3)', borderTop: '1px solid var(--hairline)', position: 'relative', overflow: 'hidden' }}>
      <svg viewBox="0 0 390 180" style={{ width: '100%', height: '100%' }}>
        <defs>
          <pattern id="dots" width="8" height="8" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="0.8" fill="rgba(26,26,26,0.12)" />
          </pattern>
        </defs>
        <rect width="390" height="180" fill="url(#dots)" />
        {/* Flight paths */}
        <path d="M 40 140 Q 120 30 195 90" stroke="var(--ink)" strokeWidth="1.2" fill="none" strokeDasharray="3 3" />
        <path d="M 350 150 Q 260 40 195 90" stroke="var(--ink)" strokeWidth="1.2" fill="none" strokeDasharray="3 3" />
        <path d="M 80 30 Q 140 60 195 90" stroke="var(--ink)" strokeWidth="1.2" fill="none" strokeDasharray="3 3" />
        {/* Origin dots */}
        <circle cx="40" cy="140" r="3" fill="var(--ink)" />
        <circle cx="350" cy="150" r="3" fill="var(--ink)" />
        <circle cx="80" cy="30" r="3" fill="var(--ink)" />
        {/* Destination */}
        <circle cx="195" cy="90" r="8" fill="var(--coral)" />
        <circle cx="195" cy="90" r="14" fill="none" stroke="var(--coral)" strokeWidth="1" opacity="0.4" />
      </svg>
      <div style={{ position: 'absolute', bottom: 12, left: 16 }}>
        <p className="mono" style={{ fontSize: 9, color: 'var(--ink-3)', letterSpacing: '0.12em' }}>LISBON · 3 TRAVELERS · 92% MATCH</p>
      </div>
    </div>
  </Frame>
);

// ═══════════════════════════════════════════════════════════════════════════
// 2. LANDING — bold editorial variant (pushed further)
// ═══════════════════════════════════════════════════════════════════════════

window.LandingBold = () => (
  <Frame style={{ background: 'var(--ink)' }}>
    <div style={{
      padding: '18px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      color: 'var(--paper)',
    }}>
      <span style={{ fontFamily: 'var(--f-display)', fontSize: 17, fontWeight: 500, letterSpacing: '-0.02em' }}>
        wanderlust<span style={{ color: 'var(--coral)' }}>.</span>
      </span>
      <button style={{
        background: 'transparent', border: '1.5px solid rgba(255,253,247,0.25)', color: 'var(--paper)',
        fontFamily: 'var(--f-mono)', fontSize: 11, letterSpacing: '0.12em', padding: '7px 14px',
        borderRadius: 999, cursor: 'pointer',
      }}>SIGN IN</button>
    </div>

    <div style={{ padding: '24px 28px', flex: 1, color: 'var(--paper)' }}>
      <p className="mono" style={{ fontSize: 10, letterSpacing: '0.2em', color: 'var(--coral)', marginBottom: 24 }}>№ 001 · GROUP PLANNER</p>

      <h1 style={{
        fontFamily: 'var(--f-display)', fontWeight: 400, fontSize: 64, lineHeight: 0.95,
        letterSpacing: '-0.035em', marginBottom: 24,
      }}>
        Where<br/>
        should<br/>
        <em style={{ fontStyle: 'italic' }}>we all</em><br/>
        meet?
      </h1>

      <div style={{ height: 1, background: 'rgba(255,253,247,0.2)', margin: '28px 0 20px' }} />

      <p style={{ fontSize: 14, lineHeight: 1.6, color: 'rgba(255,253,247,0.7)', maxWidth: 280, marginBottom: 32 }}>
        Seven people. Three continents. One destination that makes sense for every one of them.
      </p>

      <button style={{
        background: 'var(--coral)', color: 'var(--paper)', border: 'none',
        borderRadius: 999, padding: '15px 26px', fontSize: 15, fontWeight: 500,
        display: 'inline-flex', alignItems: 'center', gap: 10, cursor: 'pointer',
      }}>
        Start planning
        <span style={{
          width: 26, height: 26, borderRadius: '50%', background: 'var(--paper)', color: 'var(--coral)',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 12,
        }}>→</span>
      </button>
    </div>

    <div style={{
      padding: '20px 28px', borderTop: '1px solid rgba(255,253,247,0.15)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      color: 'rgba(255,253,247,0.5)',
    }}>
      <span className="mono" style={{ fontSize: 10, letterSpacing: '0.15em' }}>HAVE A CODE?</span>
      <input placeholder="ABCD12" style={{
        background: 'transparent', border: 'none', borderBottom: '1px solid rgba(255,253,247,0.3)',
        color: 'var(--paper)', fontFamily: 'var(--f-mono)', fontSize: 13, letterSpacing: '0.2em',
        textTransform: 'uppercase', padding: '4px 0', outline: 'none', width: 100, textAlign: 'right',
      }} />
    </div>
  </Frame>
);

Object.assign(window, { Frame, Nav, Wordmark, Avatar });
