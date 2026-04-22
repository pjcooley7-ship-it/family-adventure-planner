// screens-results.jsx — Results + Decided + Generating

// ═══════════════════════════════════════════════════════════════════════════
// GENERATING — refined (playful, progress feel)
// ═══════════════════════════════════════════════════════════════════════════

window.GeneratingRefined = () => (
  <Frame>
    <Nav left={<div />} center={<Wordmark size={15} />} right={<div />} />
    <div style={{ padding: '80px 32px', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
      {/* Orbiting dots */}
      <div style={{ position: 'relative', width: 120, height: 120, marginBottom: 36 }}>
        <div className="spin" style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '2px dashed var(--ink-4)' }} />
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: 36 }}>🧭</div>
      </div>

      <p className="eyebrow" style={{ marginBottom: 10, color: 'var(--coral)' }}>COUSINS' REUNION</p>
      <h2 className="display" style={{ fontSize: 32, marginBottom: 14 }}>
        Finding your<br/><em style={{ fontStyle: 'italic', color: 'var(--coral)' }}>common ground</em>
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 24, width: '100%', maxWidth: 280 }}>
        {[
          { step: 'Reading all 5 submissions', done: true },
          { step: 'Mapping overlapping interests', done: true },
          { step: 'Weighing flight paths & budgets', active: true },
          { step: 'Scoring destinations', done: false },
        ].map((s, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, textAlign: 'left' }}>
            <span style={{ width: 16, textAlign: 'center' }}>
              {s.done ? '✓' : s.active ? <span className="pulse">●</span> : <span style={{ color: 'var(--ink-4)' }}>○</span>}
            </span>
            <span className="mono" style={{ fontSize: 11, color: s.done || s.active ? 'var(--ink)' : 'var(--ink-3)', letterSpacing: '0.04em' }}>
              {s.step}
            </span>
          </div>
        ))}
      </div>
    </div>
  </Frame>
);

// ═══════════════════════════════════════════════════════════════════════════
// RESULTS — refined (cards with clear vote CTA, group tally)
// ═══════════════════════════════════════════════════════════════════════════

const DESTS = [
  { rank: 1, city: 'Lisbon',    country: 'Portugal', flag: '🇵🇹', score: 92, votes: 3, tags: ['warm', 'foodie', 'walkable'], reason: 'Cheapest average flights, beaches within 30min, and everyone\'s interests overlap here — food, culture, chill.', months: 'MAY–OCT', myVote: true },
  { rank: 2, city: 'Mexico City', country: 'Mexico',   flag: '🇲🇽', score: 87, votes: 1, tags: ['culture', 'foodie', 'budget'], reason: 'Strong match on food + culture. Budget-friendly and kid-friendly neighborhoods like Coyoacán.', months: 'NOV–APR', myVote: false },
  { rank: 3, city: 'Split',     country: 'Croatia',  flag: '🇭🇷', score: 78, votes: 1, tags: ['beach', 'nature'], reason: 'Great for the beach/hiking crowd, but flights are ~40% pricier than Lisbon for Marcus & Theo.', months: 'JUN–SEP', myVote: false },
];

window.ResultsRefined = () => (
  <Frame>
    <Nav left={<button className="btn-text">← TRIP</button>} center={<Wordmark size={15} />} right={<button className="btn-text">↻</button>} />

    <div style={{ padding: '24px 28px 16px' }}>
      <p className="eyebrow" style={{ marginBottom: 8 }}>AI RECOMMENDATIONS · 3 MATCHES</p>
      <h1 className="display" style={{ fontSize: 34 }}>
        Your <em style={{ fontStyle: 'italic', color: 'var(--coral)' }}>destinations</em>
      </h1>
      <p style={{ fontSize: 13, color: 'var(--ink-2)', marginTop: 8 }}>
        Everyone gets one vote. Tap a card to cast yours.
      </p>
    </div>

    {/* Group tally snapshot */}
    <div style={{ padding: '0 28px 16px' }}>
      <div style={{ display: 'flex', gap: 6 }}>
        {MEMBERS.map((m, i) => (
          <Avatar key={i} initial={m.name[0]} color={m.color} fg={m.fg} size={28}
            ring={i < 4 ? 'var(--green)' : undefined} />
        ))}
      </div>
      <p className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', marginTop: 8, letterSpacing: '0.1em' }}>
        4 OF 5 VOTED · WAITING ON THEO
      </p>
    </div>

    <div style={{ padding: '8px 28px 24px', flex: 1, overflow: 'auto' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {DESTS.map(d => (
          <div key={d.rank} style={{
            borderRadius: 14, background: d.myVote ? 'var(--paper-2)' : 'var(--paper)',
            border: `1.5px solid ${d.myVote ? 'var(--coral)' : 'var(--hairline)'}`,
            overflow: 'hidden',
          }}>
            {/* Leading banner */}
            {d.rank === 1 && (
              <div style={{ background: 'var(--green)', color: 'var(--paper)', padding: '6px 16px', fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.15em' }}>
                ▲ LEADING · {d.votes} VOTES
              </div>
            )}
            <div style={{ padding: '16px 18px' }}>
              {/* Head */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
                    <span style={{ fontSize: 20 }}>{d.flag}</span>
                    <h3 style={{ fontFamily: 'var(--f-display)', fontSize: 26, fontWeight: 500, letterSpacing: '-0.02em', lineHeight: 1 }}>
                      {d.city}
                    </h3>
                  </div>
                  <p style={{ fontSize: 11, color: 'var(--ink-3)', fontFamily: 'var(--f-mono)', marginTop: 4, letterSpacing: '0.08em' }}>
                    {d.country.toUpperCase()} · BEST {d.months}
                  </p>
                </div>
                {/* Match score ring */}
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <p style={{ fontFamily: 'var(--f-mono)', fontSize: 22, fontWeight: 700, color: 'var(--green-fg)', lineHeight: 1 }}>
                    {d.score}%
                  </p>
                  <p className="mono" style={{ fontSize: 9, color: 'var(--ink-3)', letterSpacing: '0.12em', marginTop: 2 }}>MATCH</p>
                </div>
              </div>

              {/* Reason */}
              <p style={{ fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.6, marginBottom: 12 }}>
                {d.reason}
              </p>

              {/* Tags */}
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
                {d.tags.map(t => (
                  <span key={t} className="chip" style={{ fontSize: 10 }}>{t}</span>
                ))}
              </div>

              {/* Vote row */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 12, borderTop: '1px solid var(--hairline)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span className="mono" style={{ fontSize: 11, color: 'var(--ink-2)', letterSpacing: '0.08em' }}>
                    {d.votes} {d.votes === 1 ? 'VOTE' : 'VOTES'}
                  </span>
                  {d.votes > 0 && (
                    <div style={{ display: 'flex', marginLeft: 4 }}>
                      {MEMBERS.slice(0, d.votes).map((m, i) => (
                        <div key={i} style={{ marginLeft: i === 0 ? 0 : -6 }}>
                          <Avatar initial={m.name[0]} color={m.color} fg={m.fg} size={20} ring="var(--paper)" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {d.myVote ? (
                  <button className="btn-primary" style={{ fontSize: 12, padding: '8px 16px', background: 'var(--coral)' }}>
                    ✓ Your vote
                  </button>
                ) : (
                  <button className="btn-ghost" style={{ fontSize: 12, padding: '8px 16px' }}>
                    Vote for this
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Re-run */}
      <div style={{ marginTop: 20, padding: '16px', textAlign: 'center', border: '1px dashed var(--ink-4)', borderRadius: 10 }}>
        <p style={{ fontSize: 12, color: 'var(--ink-2)', marginBottom: 8 }}>Not feeling any of these?</p>
        <button className="btn-text">↻ GET 3 NEW OPTIONS</button>
      </div>
    </div>
  </Frame>
);

// ═══════════════════════════════════════════════════════════════════════════
// DECIDED — refined (celebratory, flights below)
// ═══════════════════════════════════════════════════════════════════════════

window.DecidedRefined = () => (
  <Frame style={{ background: 'var(--paper-2)' }}>
    <Nav left={<button className="btn-text">← TRIP</button>} center={<Wordmark size={15} />} right={<div />} />

    {/* Hero banner */}
    <div style={{
      margin: '20px 20px 0', borderRadius: 16, overflow: 'hidden',
      background: 'var(--ink)', color: 'var(--paper)',
      position: 'relative',
    }}>
      <div style={{
        padding: '10px 20px', borderBottom: '1px solid rgba(255,253,247,0.15)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <span className="mono" style={{ fontSize: 9, letterSpacing: '0.2em', color: 'var(--coral)' }}>✦ LOCKED IN</span>
        <span className="mono" style={{ fontSize: 9, letterSpacing: '0.15em', color: 'rgba(255,253,247,0.5)' }}>DECIDED APR 20</span>
      </div>
      <div style={{ padding: '28px 24px 24px' }}>
        <p style={{ fontSize: 32, marginBottom: 4 }}>🇵🇹</p>
        <h1 style={{ fontFamily: 'var(--f-display)', fontSize: 52, fontWeight: 400, letterSpacing: '-0.03em', lineHeight: 1 }}>
          Lisbon
        </h1>
        <p style={{ fontSize: 14, color: 'rgba(255,253,247,0.65)', marginTop: 6 }}>Portugal · arriving LIS</p>

        <p style={{ fontSize: 13, color: 'rgba(255,253,247,0.75)', lineHeight: 1.65, marginTop: 20, paddingLeft: 14, borderLeft: '2px solid var(--coral)' }}>
          Everyone's top 3. Food, beach, culture — the overlap is huge. Flights fit all 5 budgets.
        </p>
      </div>
    </div>

    {/* Flights */}
    <div style={{ padding: '24px 28px', flex: 1, overflow: 'auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14 }}>
        <p className="eyebrow eyebrow-ink">FLIGHTS PER TRAVELER</p>
        <button className="btn-text">↻ REFRESH</button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {[
          { name: 'Sarah',  iata: 'JFK', price: '$512', direct: true  },
          { name: 'Marcus', iata: 'SFO', price: '$687', direct: false },
          { name: 'Ami',    iata: 'ORD', price: '$598', direct: true  },
          { name: 'Jules',  iata: 'LAX', price: '$702', direct: false },
          { name: 'Theo',   iata: 'ATL', price: '$544', direct: true  },
        ].map((f, i) => {
          const m = MEMBERS.find(mm => mm.name === f.name);
          return (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '12px 14px', background: 'var(--paper)', borderRadius: 10,
              border: '1px solid var(--hairline)',
            }}>
              <Avatar initial={f.name[0]} color={m.color} fg={m.fg} size={32} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 500 }}>{f.name}</span>
                  <span className="mono" style={{ fontSize: 10, color: 'var(--ink-3)' }}>{f.iata} → LIS</span>
                </div>
                <span className="mono" style={{ fontSize: 10, color: f.direct ? 'var(--green-fg)' : 'var(--ink-3)' }}>
                  {f.direct ? '● DIRECT' : '◆ 1 STOP'}
                </span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontFamily: 'var(--f-mono)', fontSize: 14, fontWeight: 700 }}>{f.price}</p>
                <button className="btn-text" style={{ fontSize: 9, color: 'var(--coral)' }}>BOOK →</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  </Frame>
);
