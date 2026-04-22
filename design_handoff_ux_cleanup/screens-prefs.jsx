// screens-prefs.jsx — Preferences flow (5 steps) + empty/error states

// ═══════════════════════════════════════════════════════════════════════════
// PREFERENCES — Step header (shared top)
// ═══════════════════════════════════════════════════════════════════════════

const PrefsHeader = ({ step, total, title }) => (
  <>
    <Nav left={<button className="btn-text">← BACK</button>} center={<Wordmark size={15} />} right={<span className="mono" style={{ fontSize: 10, color: 'var(--ink-2)', letterSpacing: '0.1em' }}>{step}/{total}</span>} />
    {/* Segmented progress */}
    <div style={{ padding: '14px 28px 18px', display: 'flex', gap: 4 }}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} style={{
          flex: 1, height: 3, borderRadius: 2,
          background: i < step ? 'var(--coral)' : 'var(--hairline)',
          transition: 'background 200ms',
        }} />
      ))}
    </div>
    <div style={{ padding: '4px 28px 0' }}>
      <p className="eyebrow" style={{ marginBottom: 6 }}>STEP {String(step).padStart(2, '0')} · {title}</p>
    </div>
  </>
);

const PrefsFooter = ({ next = 'Continue →', secondary }) => (
  <div style={{ padding: '20px 28px', borderTop: '1px solid var(--hairline)', background: 'var(--paper)' }}>
    <button className="btn-primary coral" style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: 15 }}>
      {next}
    </button>
    {secondary && (
      <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--ink-3)', marginTop: 12, fontFamily: 'var(--f-mono)', letterSpacing: '0.08em' }}>
        {secondary}
      </p>
    )}
  </div>
);

// ═══════════════════════════════════════════════════════════════════════════
// PREFS 01 · WHO (origin + party size)
// ═══════════════════════════════════════════════════════════════════════════

window.Prefs01Who = () => (
  <Frame>
    <PrefsHeader step={1} total={5} title="WHO" />
    <div style={{ padding: '12px 28px 24px', flex: 1, overflow: 'auto' }}>
      <h2 className="display" style={{ fontSize: 32, marginBottom: 28 }}>
        Where are you <em style={{ fontStyle: 'italic', color: 'var(--coral)' }}>flying from?</em>
      </h2>

      <div style={{ marginBottom: 28 }}>
        <p className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', letterSpacing: '0.15em', marginBottom: 8 }}>YOUR CITY</p>
        <input className="input" defaultValue="Brooklyn, NY" style={{ fontSize: 17 }} />
      </div>

      <div style={{ marginBottom: 28 }}>
        <p className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', letterSpacing: '0.15em', marginBottom: 12 }}>NEARBY AIRPORTS</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[
            { iata: 'JFK', name: 'John F. Kennedy Intl', dist: '12 mi', selected: true },
            { iata: 'LGA', name: 'LaGuardia',             dist: '9 mi',  selected: true },
            { iata: 'EWR', name: 'Newark Liberty Intl',   dist: '15 mi', selected: false },
          ].map(a => (
            <div key={a.iata} style={{
              padding: '12px 14px', borderRadius: 10,
              background: a.selected ? 'var(--paper-2)' : 'transparent',
              border: `1.5px solid ${a.selected ? 'var(--ink)' : 'var(--hairline)'}`,
              display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer',
            }}>
              <span className="mono" style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.08em' }}>{a.iata}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 13, fontWeight: 500 }}>{a.name}</p>
                <p className="mono" style={{ fontSize: 10, color: 'var(--ink-3)' }}>{a.dist} AWAY</p>
              </div>
              <div style={{
                width: 20, height: 20, borderRadius: 4,
                border: `1.5px solid ${a.selected ? 'var(--ink)' : 'var(--ink-4)'}`,
                background: a.selected ? 'var(--ink)' : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {a.selected && <span style={{ color: 'var(--paper)', fontSize: 12 }}>✓</span>}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <div>
          <p className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', letterSpacing: '0.15em', marginBottom: 8 }}>ADULTS</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, border: '1px solid var(--hairline)', borderRadius: 10, padding: '6px 10px' }}>
            <button style={{ width: 28, height: 28, border: 'none', background: 'var(--paper-2)', borderRadius: 6, cursor: 'pointer', fontSize: 16 }}>−</button>
            <span style={{ flex: 1, textAlign: 'center', fontSize: 18, fontWeight: 600 }}>2</span>
            <button style={{ width: 28, height: 28, border: 'none', background: 'var(--paper-2)', borderRadius: 6, cursor: 'pointer', fontSize: 16 }}>+</button>
          </div>
        </div>
        <div>
          <p className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', letterSpacing: '0.15em', marginBottom: 8 }}>KIDS</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, border: '1px solid var(--hairline)', borderRadius: 10, padding: '6px 10px' }}>
            <button style={{ width: 28, height: 28, border: 'none', background: 'var(--paper-2)', borderRadius: 6, cursor: 'pointer', fontSize: 16 }}>−</button>
            <span style={{ flex: 1, textAlign: 'center', fontSize: 18, fontWeight: 600 }}>1</span>
            <button style={{ width: 28, height: 28, border: 'none', background: 'var(--paper-2)', borderRadius: 6, cursor: 'pointer', fontSize: 16 }}>+</button>
          </div>
        </div>
      </div>
    </div>
    <PrefsFooter />
  </Frame>
);

// ═══════════════════════════════════════════════════════════════════════════
// PREFS 03 · BUDGET (key clunky screen in original)
// ═══════════════════════════════════════════════════════════════════════════

window.Prefs03Budget = () => (
  <Frame>
    <PrefsHeader step={3} total={5} title="BUDGET" />
    <div style={{ padding: '12px 28px 24px', flex: 1, overflow: 'auto' }}>
      <h2 className="display" style={{ fontSize: 32, marginBottom: 10 }}>
        What's your <em style={{ fontStyle: 'italic', color: 'var(--coral)' }}>budget?</em>
      </h2>
      <p style={{ fontSize: 13, color: 'var(--ink-2)', marginBottom: 32, lineHeight: 1.55 }}>
        Per person, flights + accommodation. Food & activities are extra.
      </p>

      {/* Big live number */}
      <div style={{ background: 'var(--paper-2)', borderRadius: 16, padding: '24px 20px', marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14 }}>
          <span className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', letterSpacing: '0.15em' }}>USD PER PERSON</span>
          <button className="btn-text" style={{ fontSize: 10 }}>CHANGE CURRENCY</button>
        </div>
        <p style={{ fontFamily: 'var(--f-display)', fontSize: 42, fontWeight: 500, letterSpacing: '-0.02em', marginBottom: 4 }}>
          $800 – $2,400
        </p>
        <p className="mono" style={{ fontSize: 11, color: 'var(--ink-3)' }}>~ comfortable midrange</p>

        {/* Range slider visual */}
        <div style={{ marginTop: 22, position: 'relative', height: 28 }}>
          <div style={{ position: 'absolute', top: 13, left: 0, right: 0, height: 2, background: 'var(--hairline)', borderRadius: 1 }} />
          <div style={{ position: 'absolute', top: 13, left: '8%', right: '24%', height: 2, background: 'var(--ink)', borderRadius: 1 }} />
          <div style={{ position: 'absolute', top: 6, left: '8%', width: 16, height: 16, background: 'var(--coral)', borderRadius: '50%', transform: 'translateX(-50%)', border: '2px solid var(--paper)', boxShadow: '0 2px 6px rgba(0,0,0,0.15)' }} />
          <div style={{ position: 'absolute', top: 6, left: '76%', width: 16, height: 16, background: 'var(--coral)', borderRadius: '50%', transform: 'translateX(-50%)', border: '2px solid var(--paper)', boxShadow: '0 2px 6px rgba(0,0,0,0.15)' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
          <span className="mono" style={{ fontSize: 10, color: 'var(--ink-3)' }}>$0</span>
          <span className="mono" style={{ fontSize: 10, color: 'var(--ink-3)' }}>$10k</span>
        </div>
      </div>

      {/* Quick presets — playful */}
      <p className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', letterSpacing: '0.15em', marginBottom: 10 }}>QUICK PICK</p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        {[
          { lbl: 'Backpack', rng: '$300–800', emoji: '🎒' },
          { lbl: 'Midrange', rng: '$800–2.4k', emoji: '🏨', sel: true },
          { lbl: 'Comfort', rng: '$2.4–5k', emoji: '🏝', },
          { lbl: 'Splurge', rng: '$5k+', emoji: '🥂', },
        ].map(p => (
          <button key={p.lbl} style={{
            padding: '12px 14px', textAlign: 'left', borderRadius: 10,
            border: `1.5px solid ${p.sel ? 'var(--ink)' : 'var(--hairline)'}`,
            background: p.sel ? 'var(--paper-2)' : 'var(--paper)',
            cursor: 'pointer', fontFamily: 'var(--f-sans)',
          }}>
            <div style={{ fontSize: 16, marginBottom: 6 }}>{p.emoji}</div>
            <p style={{ fontSize: 13, fontWeight: 600 }}>{p.lbl}</p>
            <p className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', marginTop: 2 }}>{p.rng}</p>
          </button>
        ))}
      </div>
    </div>
    <PrefsFooter />
  </Frame>
);

// ═══════════════════════════════════════════════════════════════════════════
// PREFS 04 · INTERESTS (tight 3-col grid, proper spacing)
// ═══════════════════════════════════════════════════════════════════════════

const ACTIVITIES = [
  { id: 'beach',    label: 'Beach',    emoji: '🏖', sel: true  },
  { id: 'food',     label: 'Food',     emoji: '🍝', sel: true  },
  { id: 'culture',  label: 'Culture',  emoji: '🏛', sel: true  },
  { id: 'hiking',   label: 'Hiking',   emoji: '🥾', sel: false },
  { id: 'nightlife',label: 'Nightlife',emoji: '🕺', sel: false },
  { id: 'shopping', label: 'Shopping', emoji: '🛍', sel: false },
  { id: 'nature',   label: 'Nature',   emoji: '🌲', sel: true  },
  { id: 'adventure',label: 'Adventure',emoji: '🪂', sel: false },
  { id: 'chill',    label: 'Chill',    emoji: '📚', sel: true  },
];

window.Prefs04Interests = () => (
  <Frame>
    <PrefsHeader step={4} total={5} title="INTERESTS" />
    <div style={{ padding: '12px 28px 24px', flex: 1, overflow: 'auto' }}>
      <h2 className="display" style={{ fontSize: 32, marginBottom: 10 }}>
        What do you <em style={{ fontStyle: 'italic', color: 'var(--coral)' }}>love</em> doing?
      </h2>
      <p style={{ fontSize: 13, color: 'var(--ink-2)', marginBottom: 28, lineHeight: 1.55 }}>
        Pick at least 3. More is better — we'll match overlap across the group.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
        {ACTIVITIES.map(a => (
          <button key={a.id} style={{
            padding: '16px 8px', borderRadius: 12,
            border: `1.5px solid ${a.sel ? 'var(--coral)' : 'var(--hairline)'}`,
            background: a.sel ? 'var(--coral-bg)' : 'var(--paper)',
            cursor: 'pointer', fontFamily: 'var(--f-sans)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
          }}>
            <span style={{ fontSize: 24 }}>{a.emoji}</span>
            <span style={{ fontSize: 12, fontWeight: 500, color: a.sel ? 'var(--coral-fg)' : 'var(--ink)' }}>{a.label}</span>
          </button>
        ))}
      </div>

      <p className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', letterSpacing: '0.15em', margin: '28px 0 10px' }}>ACCOMMODATION</p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {[
          { lbl: 'Hotel', sel: true },
          { lbl: 'Airbnb', sel: true },
          { lbl: 'Hostel', sel: false },
          { lbl: 'Resort', sel: false },
        ].map(a => (
          <button key={a.lbl} className="chip" style={{
            padding: '8px 14px', fontSize: 12,
            background: a.sel ? 'var(--ink)' : 'var(--paper)',
            color: a.sel ? 'var(--paper)' : 'var(--ink)',
            border: `1.5px solid ${a.sel ? 'var(--ink)' : 'var(--hairline)'}`,
            cursor: 'pointer', letterSpacing: 0, textTransform: 'none',
            fontFamily: 'var(--f-sans)', fontWeight: 500,
          }}>{a.lbl}</button>
        ))}
      </div>
    </div>
    <PrefsFooter />
  </Frame>
);
