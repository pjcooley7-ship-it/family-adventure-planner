import { useState, useEffect, useRef } from 'react'
import { Search, X, MapPin, Loader } from 'lucide-react'
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
    <div className="flex flex-col gap-3">
      {/* City search input */}
      <div style={{ position: 'relative' }}>
        <div
          style={{
            position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
            color: status === 'searching' ? 'var(--color-ink)' : 'var(--color-ink-3)',
            pointerEvents: 'none',
          }}
        >
          {status === 'searching'
            ? <Loader size={14} style={{ animation: 'spin 1s linear infinite' }} />
            : <Search size={14} />}
        </div>
        <input
          type="text"
          value={query}
          onChange={e => { setQuery(e.target.value); onCityLabel(e.target.value) }}
          placeholder="Enter your city or town…"
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 14,
            color: 'var(--color-ink)',
            background: 'var(--color-bg)',
            border: '2.5px solid var(--color-ink)',
            padding: '11px 14px 11px 36px',
            outline: 'none',
            width: '100%',
            transition: 'box-shadow 150ms ease',
          }}
          onFocus={e => { e.currentTarget.style.boxShadow = '4px 4px 0 var(--color-ink)' }}
          onBlur={e => { e.currentTarget.style.boxShadow = 'none' }}
        />
        {query && (
          <button
            type="button"
            onClick={() => { setQuery(''); setNearby([]); setStatus('idle'); onCityLabel(''); onSelectedIatas([]) }}
            style={{
              position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--color-ink-3)', padding: 2,
            }}
          >
            <X size={13} />
          </button>
        )}
      </div>

      {/* Status feedback */}
      {status === 'not-found' && (
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-coral)' }}>
          Location not found — try a nearby larger city.
        </p>
      )}
      {error && (
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-coral)' }}>
          {error}
        </p>
      )}

      {/* Nearby airports */}
      {status === 'found' && nearby.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="brut-label">NEARBY AIRPORTS — SELECT UP TO {MAX_SELECTED}</p>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-ink-3)' }}>
              {selectedIatas.length}/{MAX_SELECTED}
            </p>
          </div>

          <div className="flex flex-col gap-1.5">
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
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 12px',
                    border: '2.5px solid var(--color-ink)',
                    background: selected ? 'var(--color-ink)' : 'var(--color-bg)',
                    cursor: maxed ? 'not-allowed' : 'pointer',
                    opacity: maxed ? 0.35 : 1,
                    transition: 'background 150ms ease, box-shadow 150ms ease',
                    textAlign: 'left', width: '100%',
                  }}
                  onMouseEnter={e => { if (!maxed && !selected) e.currentTarget.style.boxShadow = '3px 3px 0 var(--color-ink)' }}
                  onMouseLeave={e => { if (!maxed && !selected) e.currentTarget.style.boxShadow = 'none' }}
                >
                  {/* Checkbox + info */}
                  <div className="flex items-center gap-3">
                    <div style={{
                      width: 16, height: 16, flexShrink: 0,
                      border: '2px solid',
                      borderColor: selected ? 'var(--color-bg)' : 'var(--color-ink)',
                      background: selected ? 'var(--color-bg)' : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {selected && (
                        <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                          <path d="M1 3L3.5 5.5L8 1" stroke="#1a1a1a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span style={{
                          fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 12,
                          color: selected ? 'var(--color-bg)' : 'var(--color-ink)',
                        }}>
                          {airport.iata}
                        </span>
                        <span style={{
                          fontFamily: 'var(--font-body)', fontSize: 13,
                          color: selected ? 'rgba(255,253,247,0.75)' : 'var(--color-ink-2)',
                        }}>
                          {airport.name.replace(' International Airport', ' Intl').replace(' International', ' Intl')}
                        </span>
                      </div>
                      <p style={{
                        fontFamily: 'var(--font-mono)', fontSize: 10, marginTop: 1,
                        color: selected ? 'rgba(255,253,247,0.5)' : 'var(--color-ink-3)',
                      }}>
                        {countryName(airport.country)}
                      </p>
                    </div>
                  </div>

                  {/* Distance */}
                  <div className="flex items-center gap-1" style={{ flexShrink: 0, marginLeft: 12 }}>
                    <MapPin size={10} style={{ color: selected ? 'rgba(255,253,247,0.5)' : 'var(--color-ink-3)' }} />
                    <span style={{
                      fontFamily: 'var(--font-mono)', fontSize: 10,
                      color: selected ? 'rgba(255,253,247,0.5)' : 'var(--color-ink-3)',
                    }}>
                      {Math.round(airport.distanceMiles)} mi
                    </span>
                  </div>
                </button>
              )
            })}
          </div>

          {selectedIatas.length === 0 && (
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-ink-3)', marginTop: 8, letterSpacing: '0.05em' }}>
              Select the airport(s) you'd prefer to fly from.
            </p>
          )}
        </div>
      )}

      {/* Selected chips */}
      {selectedIatas.length > 0 && status !== 'found' && (
        <div className="flex flex-wrap gap-2">
          {selectedIatas.map(iata => (
            <div
              key={iata}
              className="flex items-center gap-2"
              style={{
                border: '2.5px solid var(--color-ink)',
                background: 'var(--color-ink)',
                padding: '4px 10px',
              }}
            >
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700, color: 'var(--color-bg)' }}>
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
