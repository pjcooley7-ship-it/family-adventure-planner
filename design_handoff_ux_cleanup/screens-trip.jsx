// screens-trip.jsx — Trip hub + Auth + Create modal + Join
const { useState: useStateT } = React;

// ═══════════════════════════════════════════════════════════════════════════
// AUTH — refined (clearer single primary, less visual noise)
// ═══════════════════════════════════════════════════════════════════════════

window.AuthRefined = () => (
  <Frame>
    <Nav left={<Wordmark />} />
    <div style={{ padding: '48px 28px 32px', flex: 1 }}>
      <p className="eyebrow" style={{ marginBottom: 14 }}>WELCOME BACK</p>
      <h1 className="display" style={{ fontSize: 40, marginBottom: 8 }}>
        Sign <em style={{ fontStyle: 'italic', color: 'var(--coral)' }}>in.</em>
      </h1>
      <p style={{ fontSize: 14, color: 'var(--ink-2)', marginBottom: 36 }}>
        Pick up where you left off.
      </p>

      <div style={{ marginBottom: 22 }}>
        <p className="eyebrow" style={{ marginBottom: 8 }}>EMAIL</p>
        <input className="input" placeholder="you@somewhere.com" defaultValue="sarah@wanderlust.co" />
      </div>
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
          <p className="eyebrow">PASSWORD</p>
          <button className="btn-text" style={{ fontSize: 10 }}>FORGOT?</button>
        </div>
        <input className="input" type="password" defaultValue="••••••••••" />
      </div>

      <button className="btn-primary coral" style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: 15, marginBottom: 24 }}>
        Continue →
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '16px 0' }}>
        <div style={{ flex: 1, height: 1, background: 'var(--hairline)' }} />
        <span className="mono" style={{ fontSize: 9, color: 'var(--ink-3)', letterSpacing: '0.2em' }}>OR</span>
        <div style={{ flex: 1, height: 1, background: 'var(--hairline)' }} />
      </div>

      <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--ink-2)' }}>
        New here? <button className="btn-text" style={{ fontSize: 13, letterSpacing: 0, textTransform: 'none', color: 'var(--coral)', fontFamily: 'var(--f-sans)', fontWeight: 500 }}>Create account →</button>
      </p>
    </div>
  </Frame>
);

// ═══════════════════════════════════════════════════════════════════════════
// TRIP HUB — refined (playful, clear ONE action, avatar stack)
// ═══════════════════════════════════════════════════════════════════════════

const MEMBERS = [
  { name: 'Sarah',  color: '#FED7C7', fg: '#993C1D', submitted: true,  you: true  },
  { name: 'Marcus', color: '#C4E8DA', fg: '#0F6E56', submitted: true,  you: false },
  { name: 'Ami',    color: '#FFE8B3', fg: '#9A6410', submitted: true,  you: false },
  { name: 'Jules',  color: '#D4D1F0', fg: '#4A4290', submitted: false, you: false },
  { name: 'Theo',   color: '#F5E0D8', fg: '#8A5A40', submitted: false, you: false },
];

window.TripHubRefined = () => {
  const submitted = MEMBERS.filter(m => m.submitted).length;
  return (
    <Frame>
      <Nav
        left={<button className="btn-text">← HOME</button>}
        center={<Wordmark size={15} />}
        right={<div />}
      />

      {/* Trip header — giant serif name, subtle code */}
      <div style={{ padding: '28px 28px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 10 }}>
          <span className="chip" style={{ background: 'var(--ink)', color: 'var(--paper)' }}>TRIP · WNDR42</span>
          <button style={{ background: 'none', border: 'none', color: 'var(--ink-3)', fontSize: 11, cursor: 'pointer' }}>copy ⧉</button>
        </div>
        <h1 className="display" style={{ fontSize: 36, color: 'var(--ink)' }}>
          Cousins' <em style={{ fontStyle: 'italic', color: 'var(--coral)' }}>reunion</em>
        </h1>
        <p style={{ fontSize: 12, color: 'var(--ink-3)', fontFamily: 'var(--f-mono)', marginTop: 6 }}>
          CREATED APR 12 · 5 TRAVELERS
        </p>
      </div>

      <hr className="rule" style={{ margin: '0 28px' }} />

      {/* THE primary action — bold, unmissable */}
      <div style={{ padding: '24px 28px' }}>
        <div style={{
          background: 'var(--amber-bg)', borderRadius: 12, padding: '18px 20px',
          display: 'flex', alignItems: 'center', gap: 14,
        }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--amber)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>⏳</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--amber-fg)', marginBottom: 2 }}>Your turn!</p>
            <p style={{ fontSize: 12, color: 'var(--amber-fg)', opacity: 0.85 }}>Add your preferences so we can find the match.</p>
          </div>
        </div>
        <button className="btn-primary coral" style={{ width: '100%', justifyContent: 'center', marginTop: 12, fontSize: 15, padding: '14px' }}>
          Add my preferences →
        </button>
      </div>

      <hr className="rule" style={{ margin: '0 28px' }} />

      {/* Party — live avatars + playful nudge */}
      <div style={{ padding: '22px 28px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 14 }}>
          <p className="eyebrow eyebrow-ink">THE PARTY</p>
          <span className="mono" style={{ fontSize: 10, color: 'var(--ink-2)' }}>{submitted} OF {MEMBERS.length} IN</span>
        </div>

        {/* Progress pips */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 18 }}>
          {MEMBERS.map((m, i) => (
            <div key={i} style={{ flex: 1, height: 3, background: m.submitted ? 'var(--green)' : 'var(--hairline)', borderRadius: 2 }} />
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {MEMBERS.map((m, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '8px 4px',
            }}>
              <Avatar initial={m.name[0]} color={m.color} fg={m.fg}
                ring={m.submitted ? 'var(--green)' : undefined} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 14, fontWeight: 500 }}>{m.name}</span>
                  {m.you && <span style={{ fontFamily: 'var(--f-mono)', fontSize: 9, color: 'var(--ink-3)', letterSpacing: '0.12em' }}>YOU</span>}
                </div>
                <p style={{ fontSize: 11, color: 'var(--ink-3)', fontFamily: 'var(--f-mono)', marginTop: 1 }}>
                  {m.submitted ? '✓ in' : '· waiting'}
                </p>
              </div>
              {!m.submitted && (
                <button className="btn-text" style={{ fontSize: 10 }}>NUDGE 👋</button>
              )}
            </div>
          ))}
        </div>

        {/* Rotten egg nudge */}
        <div style={{
          marginTop: 18, padding: '12px 14px', background: 'var(--paper-2)', borderRadius: 10,
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <span style={{ fontSize: 18 }}>🥚</span>
          <p style={{ fontSize: 12, color: 'var(--ink-2)', flex: 1 }}>
            <b style={{ color: 'var(--ink)' }}>Jules</b> & <b style={{ color: 'var(--ink)' }}>Theo</b> — last ones in are rotten eggs!
          </p>
        </div>
      </div>

      {/* Invite code — quieter, bottom */}
      <div style={{ padding: '0 28px 24px', marginTop: 'auto' }}>
        <hr className="rule" style={{ marginBottom: 16 }} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <div>
            <p className="eyebrow" style={{ marginBottom: 4 }}>INVITE CODE</p>
            <p className="mono" style={{ fontSize: 24, fontWeight: 700, color: 'var(--ink)', letterSpacing: '0.15em' }}>WNDR42</p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn-ghost" style={{ padding: '8px 14px', fontSize: 11 }}>COPY</button>
            <button className="btn-ghost" style={{ padding: '8px 14px', fontSize: 11 }}>EMAIL</button>
          </div>
        </div>
      </div>
    </Frame>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// CREATE TRIP MODAL — refined
// ═══════════════════════════════════════════════════════════════════════════

window.CreateModalRefined = () => (
  <Frame style={{ background: 'var(--paper-2)' }}>
    <Nav left={<Wordmark />} />
    <div style={{ padding: '60px 24px 20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
      {/* Modal card */}
      <div style={{
        background: 'var(--paper)', borderRadius: 16, padding: '28px 24px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04)',
        border: '1px solid var(--hairline)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 22 }}>
          <p className="eyebrow eyebrow-ink">NEW TRIP</p>
          <button style={{ background: 'none', border: 'none', fontSize: 20, color: 'var(--ink-3)', cursor: 'pointer' }}>×</button>
        </div>

        <h2 className="display" style={{ fontSize: 30, marginBottom: 8 }}>
          Name your <em style={{ fontStyle: 'italic', color: 'var(--coral)' }}>trip.</em>
        </h2>
        <p style={{ fontSize: 13, color: 'var(--ink-2)', marginBottom: 28 }}>
          Something memorable. You can change it later.
        </p>

        <div style={{ marginBottom: 24 }}>
          <p className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', letterSpacing: '0.15em', marginBottom: 8 }}>TRIP NAME</p>
          <input className="input" placeholder="e.g. Cousins' Reunion" defaultValue="Cousins' Reunion" style={{ fontSize: 18 }} />
        </div>

        {/* Suggestion chips — playful */}
        <p className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', letterSpacing: '0.15em', marginBottom: 10 }}>OR PICK A VIBE</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 32 }}>
          {['Bach weekend 🥂', 'Family summer ☀️', 'Ski week ⛷️', 'Big 3-0 🎂'].map(s => (
            <button key={s} className="chip" style={{
              background: 'var(--paper-2)', color: 'var(--ink)', border: '1px solid var(--hairline)',
              cursor: 'pointer', fontSize: 11, textTransform: 'none', letterSpacing: 0,
              padding: '6px 12px', fontFamily: 'var(--f-sans)',
            }}>{s}</button>
          ))}
        </div>

        <button className="btn-primary coral" style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: 15 }}>
          Create & invite →
        </button>
        <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--ink-3)', marginTop: 14, fontFamily: 'var(--f-mono)', letterSpacing: '0.08em' }}>
          YOU'LL GET AN INVITE CODE NEXT
        </p>
      </div>
    </div>
  </Frame>
);

// ═══════════════════════════════════════════════════════════════════════════
// JOIN — refined
// ═══════════════════════════════════════════════════════════════════════════

window.JoinRefined = () => (
  <Frame>
    <Nav left={<button className="btn-text">← BACK</button>} center={<Wordmark size={15} />} right={<div/>} />
    <div style={{ padding: '48px 28px', flex: 1, textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <div style={{ fontSize: 48, marginBottom: 18 }}>✈️</div>
      <p className="eyebrow" style={{ marginBottom: 12 }}>YOU'RE INVITED TO</p>
      <h1 className="display" style={{ fontSize: 40, marginBottom: 24 }}>
        Cousins'<br/><em style={{ fontStyle: 'italic', color: 'var(--coral)' }}>Reunion</em>
      </h1>

      {/* Who's going */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
        {MEMBERS.slice(0, 4).map((m, i) => (
          <div key={i} style={{ marginLeft: i === 0 ? 0 : -10 }}>
            <Avatar initial={m.name[0]} color={m.color} fg={m.fg} size={38} ring="var(--paper)" />
          </div>
        ))}
        <div style={{
          marginLeft: -10, width: 38, height: 38, borderRadius: '50%', background: 'var(--paper-3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: 'var(--ink-2)',
          fontFamily: 'var(--f-mono)', fontWeight: 600, boxShadow: '0 0 0 2px var(--paper)',
        }}>+1</div>
      </div>
      <p style={{ fontSize: 13, color: 'var(--ink-2)', marginBottom: 36 }}>
        Sarah, Marcus, Ami and 2 others are planning a trip.
      </p>

      <button className="btn-primary coral" style={{ justifyContent: 'center', padding: '15px 32px', fontSize: 15, marginBottom: 10 }}>
        Join the trip →
      </button>
      <button className="btn-text" style={{ marginTop: 12 }}>DECLINE</button>
    </div>
  </Frame>
);
