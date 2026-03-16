import { useState, useEffect, useRef } from 'react'
import { Search, X, MapPin, Loader } from 'lucide-react'
import { geocodeCity, findNearbyAirports, type NearbyAirport } from '@/lib/airportUtils'

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

  // Trigger geocode after 600ms of no typing
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
    <div className="flex flex-col gap-4">
      {/* City search input */}
      <div style={{ position: 'relative' }}>
        <div
          style={{
            position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
            color: status === 'searching' ? '#c9952a' : 'rgba(201,149,42,0.5)',
            pointerEvents: 'none',
          }}
        >
          {status === 'searching'
            ? <Loader size={15} style={{ animation: 'spin 1s linear infinite' }} />
            : <Search size={15} />}
        </div>
        <input
          type="text"
          value={query}
          onChange={e => { setQuery(e.target.value); onCityLabel(e.target.value) }}
          placeholder="Enter your city or town (e.g. Winfield, PA)"
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 14,
            color: '#f2eadb',
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(201,149,42,0.25)',
            padding: '12px 16px 12px 42px',
            outline: 'none',
            width: '100%',
            colorScheme: 'dark',
            transition: 'border-color 0.2s',
          }}
          onFocus={e => { e.currentTarget.style.borderColor = 'rgba(201,149,42,0.7)' }}
          onBlur={e => { e.currentTarget.style.borderColor = 'rgba(201,149,42,0.25)' }}
        />
        {query && (
          <button
            type="button"
            onClick={() => { setQuery(''); setNearby([]); setStatus('idle'); onCityLabel(''); onSelectedIatas([]) }}
            style={{
              position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'rgba(242,234,219,0.3)', padding: 2,
            }}
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Status feedback */}
      {status === 'not-found' && (
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'rgba(176,92,58,0.9)' }}>
          Location not found — try a nearby larger city or the airport code directly.
        </p>
      )}
      {error && (
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'rgba(176,92,58,0.9)' }}>
          {error}
        </p>
      )}

      {/* Nearby airports list */}
      {status === 'found' && nearby.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 10, letterSpacing: '0.2em', color: 'rgba(201,149,42,0.55)' }}>
              NEARBY AIRPORTS — SELECT UP TO {MAX_SELECTED}
            </p>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 10, color: 'rgba(242,234,219,0.25)' }}>
              {selectedIatas.length}/{MAX_SELECTED} selected
            </p>
          </div>

          <div className="flex flex-col gap-2">
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
                    padding: '12px 16px',
                    border: selected
                      ? '1px solid #c9952a'
                      : '1px solid rgba(201,149,42,0.15)',
                    background: selected
                      ? 'rgba(201,149,42,0.1)'
                      : maxed
                      ? 'rgba(255,255,255,0.01)'
                      : 'rgba(255,255,255,0.02)',
                    cursor: maxed ? 'not-allowed' : 'pointer',
                    opacity: maxed ? 0.4 : 1,
                    transition: 'all 0.15s',
                    textAlign: 'left',
                    width: '100%',
                  }}
                >
                  {/* Left: checkbox + airport info */}
                  <div className="flex items-center gap-3">
                    <div style={{
                      width: 18, height: 18, borderRadius: 2, flexShrink: 0,
                      border: `1px solid ${selected ? '#c9952a' : 'rgba(201,149,42,0.3)'}`,
                      background: selected ? '#c9952a' : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {selected && (
                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                          <path d="M1 3.5L3.5 6.5L9 1" stroke="#060d1f" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span style={{
                          fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 14,
                          color: selected ? '#c9952a' : '#f2eadb', letterSpacing: '0.05em',
                        }}>
                          {airport.iata}
                        </span>
                        <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'rgba(242,234,219,0.6)' }}>
                          {airport.name.replace(' International Airport', ' Intl').replace(' International', ' Intl')}
                        </span>
                      </div>
                      <p style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'rgba(242,234,219,0.3)', marginTop: 2 }}>
                        {airport.country}
                      </p>
                    </div>
                  </div>

                  {/* Right: distance */}
                  <div className="flex items-center gap-1" style={{ flexShrink: 0, marginLeft: 12 }}>
                    <MapPin size={11} style={{ color: 'rgba(201,149,42,0.4)' }} />
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'rgba(242,234,219,0.35)' }}>
                      {Math.round(airport.distanceMiles)} mi
                    </span>
                  </div>
                </button>
              )
            })}
          </div>

          {selectedIatas.length === 0 && (
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'rgba(242,234,219,0.3)', marginTop: 10 }}>
              Select the airport(s) you'd prefer to fly from — we'll check fares from each.
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
                border: '1px solid rgba(201,149,42,0.4)',
                background: 'rgba(201,149,42,0.08)',
                padding: '6px 10px',
              }}
            >
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: '#c9952a', fontWeight: 600 }}>
                {iata}
              </span>
              <button
                type="button"
                onClick={() => removeSelected(iata)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(201,149,42,0.5)', padding: 0, display: 'flex' }}
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
