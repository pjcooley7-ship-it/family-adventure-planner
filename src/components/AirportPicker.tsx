import { useState, useEffect, useRef } from 'react'
import { Search, X, Loader } from 'lucide-react'
import { geocodeCity, findNearbyAirports, type NearbyAirport } from '@/lib/airportUtils'

const regionNames = new Intl.DisplayNames(['en'], { type: 'region' })
function countryName(iso: string): string {
  try { return regionNames.of(iso) ?? iso } catch { return iso }
}

interface AirportPickerProps {
  cityLabel: string
  selectedIatas: string[]
  onCityLabel: (label: string) => void
  onSelectedIatas: (iatas: string[]) => void
}

const MAX_SELECTED = 3

export function AirportPicker({
  cityLabel,
  selectedIatas,
  onCityLabel,
  onSelectedIatas,
}: AirportPickerProps) {
  const [query, setQuery] = useState(cityLabel)
  const [nearby, setNearby] = useState<NearbyAirport[]>([])
  const [status, setStatus] = useState<'idle' | 'searching' | 'found' | 'not-found'>('idle')
  const [error, setError] = useState<string | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (!query.trim() || query.trim().length < 2) {
      setNearby([])
      setStatus('idle')
      return
    }

    debounceRef.current = setTimeout(async () => {
      setStatus('searching')
      setError(null)

      const result = await geocodeCity(query)
      if (!result) {
        setStatus('not-found')
        setNearby([])
        return
      }

      const airports = findNearbyAirports(result.lat, result.lon)
      if (!airports.length) {
        setStatus('not-found')
        setNearby([])
        return
      }

      onCityLabel(result.displayName)
      setNearby(airports)
      setStatus('found')
    }, 600)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query])

  function toggle(iata: string) {
    if (selectedIatas.includes(iata)) {
      onSelectedIatas(selectedIatas.filter(i => i !== iata))
    } else {
      if (selectedIatas.length >= MAX_SELECTED) {
        setError(`Select up to ${MAX_SELECTED} airports`)
        return
      }
      onSelectedIatas([...selectedIatas, iata])
      setError(null)
    }
  }

  function removeSelected(iata: string) {
    onSelectedIatas(selectedIatas.filter(i => i !== iata))
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* City search input */}
      <div style={{ position: 'relative' }}>
        <div style={{
          position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
          color: 'var(--ink-3)', pointerEvents: 'none',
        }}>
          {status === 'searching'
            ? <Loader size={14} className="spin" />
            : <Search size={14} />}
        </div>
        <input
          type="text"
          value={query}
          onChange={e => { setQuery(e.target.value); onCityLabel(e.target.value) }}
          placeholder="Enter your city or town…"
          style={{
            fontFamily: 'var(--f-sans)', fontSize: 15, color: 'var(--ink)',
            background: 'var(--paper)',
            border: '1.5px solid var(--hairline)', borderRadius: 10,
            padding: '11px 36px 11px 36px', outline: 'none', width: '100%',
            transition: 'border-color 160ms',
          }}
          onFocus={e => { e.currentTarget.style.borderColor = 'var(--ink)' }}
          onBlur={e => { e.currentTarget.style.borderColor = 'var(--hairline)' }}
        />
        {query && (
          <button
            type="button"
            onClick={() => { setQuery(''); setNearby([]); setStatus('idle'); onCityLabel(''); onSelectedIatas([]) }}
            style={{
              position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--ink-3)', padding: 2,
            }}
          >
            <X size={13} />
          </button>
        )}
      </div>

      {status === 'not-found' && (
        <p className="mono" style={{ fontSize: 11, color: 'var(--coral)' }}>
          Location not found — try a nearby larger city.
        </p>
      )}
      {error && (
        <p className="mono" style={{ fontSize: 11, color: 'var(--coral)' }}>
          {error}
        </p>
      )}

      {/* Nearby airports */}
      {status === 'found' && nearby.length > 0 && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <p className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', letterSpacing: '0.15em' }}>
              NEARBY AIRPORTS
            </p>
            <p className="mono" style={{ fontSize: 10, color: 'var(--ink-3)' }}>
              {selectedIatas.length}/{MAX_SELECTED}
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {nearby.map(airport => {
              const selected = selectedIatas.includes(airport.iata)
              const maxed = !selected && selectedIatas.length >= MAX_SELECTED

              return (
                <button
                  key={airport.iata}
                  type="button"
                  onClick={() => toggle(airport.iata)}
                  disabled={maxed}
                  style={{
                    padding: '12px 14px', borderRadius: 10, cursor: maxed ? 'not-allowed' : 'pointer',
                    background: selected ? 'var(--paper-2)' : 'transparent',
                    border: `1.5px solid ${selected ? 'var(--ink)' : 'var(--hairline)'}`,
                    display: 'flex', alignItems: 'center', gap: 12,
                    opacity: maxed ? 0.4 : 1,
                    transition: 'background 150ms, border-color 150ms',
                    textAlign: 'left', width: '100%',
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                      <span className="mono" style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--ink)', flexShrink: 0 }}>
                        {airport.iata}
                      </span>
                      <span style={{ fontFamily: 'var(--f-sans)', fontSize: 13, fontWeight: 500, color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {airport.name.replace(' International Airport', ' Intl').replace(' International', ' Intl')}
                      </span>
                    </div>
                    <p className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', marginTop: 2 }}>
                      {Math.round(airport.distanceMiles)} mi · {countryName(airport.country)}
                    </p>
                  </div>

                  {/* Checkbox on right */}
                  <div style={{
                    width: 20, height: 20, borderRadius: 4, flexShrink: 0,
                    border: `1.5px solid ${selected ? 'var(--ink)' : 'var(--ink-4)'}`,
                    background: selected ? 'var(--ink)' : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'background 150ms, border-color 150ms',
                  }}>
                    {selected && (
                      <svg width="11" height="8" viewBox="0 0 11 8" fill="none">
                        <path d="M1 4L4 7L10 1" stroke="var(--paper)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                </button>
              )
            })}
          </div>

          {selectedIatas.length === 0 && (
            <p className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', marginTop: 8, letterSpacing: '0.05em' }}>
              Select the airport(s) you'd prefer to fly from.
            </p>
          )}
        </div>
      )}

      {/* Selected chips when list is hidden */}
      {selectedIatas.length > 0 && status !== 'found' && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {selectedIatas.map(iata => (
            <div
              key={iata}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: 'var(--ink)', borderRadius: 999,
                padding: '5px 12px',
              }}
            >
              <span className="mono" style={{ fontSize: 12, fontWeight: 700, color: 'var(--paper)' }}>
                {iata}
              </span>
              <button
                type="button"
                onClick={() => removeSelected(iata)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,253,247,0.6)', padding: 0, display: 'flex' }}
              >
                <X size={11} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
