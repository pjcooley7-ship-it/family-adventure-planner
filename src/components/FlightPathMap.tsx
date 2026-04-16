import { useEffect, useState } from 'react'

// Equirectangular projection — viewBox 900 × 460
// x = (lon + 180) * 2.5
// y = (90 − lat) * 2.556

interface City {
  name: string
  x: number
  y: number
  label: string
}

const ORIGIN_CITIES: City[] = [
  { name: 'New York',     x: 265, y: 126, label: 'NEW YORK'     }, // 40.7°N  74.0°W
  { name: 'Buenos Aires', x: 304, y: 320, label: 'BUENOS AIRES' }, // 34.6°S  58.4°W
  { name: 'Nairobi',      x: 542, y: 233, label: 'NAIROBI'      }, //  1.3°S  36.8°E
  { name: 'Mumbai',       x: 632, y: 181, label: 'MUMBAI'       }, // 19.1°N  72.9°E
  { name: 'Tokyo',        x: 799, y: 139, label: 'TOKYO'        }, // 35.7°N 139.7°E
  { name: 'Sydney',       x: 828, y: 319, label: 'SYDNEY'       }, // 33.9°S 151.2°E
]

// Destination — Lisbon  38.7°N  9.1°W
const DESTINATION = { x: 427, y: 131 }

// Continent fills — simplified but geographically positioned bezier paths
const CONTINENTS = [
  // North America
  `M 35,92 C 85,102 125,115 143,148 C 158,172 175,186 218,207
   L 252,222 L 255,200 L 248,175 C 252,160 260,148 264,126
   C 275,118 295,112 315,110 L 305,92
   C 285,80 258,76 248,77 C 225,68 192,47 162,41
   C 128,40 88,43 35,92 Z`,

  // South America
  `M 252,222 L 255,210 C 272,204 290,204 293,208
   C 325,228 356,246 362,254 C 358,268 352,286 350,296
   C 340,332 315,368 288,385 C 272,371 265,353 265,336
   C 255,305 248,270 248,248 C 250,236 251,228 252,222 Z`,

  // Europe (mainland + Scandinavia)
  `M 427,132 C 440,124 462,128 480,130 L 523,130
   C 524,108 525,90 526,78
   C 518,60 505,51 488,51 C 470,50 458,58 455,72
   C 450,86 448,97 450,98
   C 446,112 437,118 431,120 C 429,125 427,130 427,132 Z`,

  // Africa
  `M 407,200 C 425,156 432,140 437,137
   C 464,132 495,132 542,133
   C 558,155 565,186 580,210
   C 563,238 552,254 550,258
   C 535,298 515,316 495,322
   C 470,335 448,330 430,320
   C 415,305 408,272 407,252 C 406,232 406,215 407,200 Z`,

  // Asia (mainland + Indian subcontinent, simplified)
  `M 526,78 L 523,130
   C 555,160 580,180 592,183
   C 620,200 642,217 643,220
   C 665,210 693,193 707,222
   C 734,192 755,172 800,140
   C 822,125 840,98 857,60
   C 835,38 795,34 762,37
   C 720,38 680,40 635,43
   C 595,44 555,50 526,78 Z`,

  // Australia
  `M 730,286 C 758,268 790,258 812,258
   C 820,280 828,312 826,332
   C 814,340 796,338 785,332
   C 775,326 775,318 775,312
   C 762,312 748,310 737,320
   C 736,308 732,298 730,286 Z`,
]

function arcPath(x1: number, y1: number, x2: number, y2: number): string {
  const cx = (x1 + x2) / 2 + (y2 - y1) * 0.22
  const cy = (y1 + y2) / 2 - (x2 - x1) * 0.16
  return `M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`
}

export function FlightPathMap() {
  const [revealed, setRevealed] = useState(false)
  const [destinationVisible, setDestinationVisible] = useState(false)

  useEffect(() => {
    const t1 = setTimeout(() => setRevealed(true), 500)
    const t2 = setTimeout(() => setDestinationVisible(true), 2600)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  return (
    <div className="relative w-full">
      <svg viewBox="0 0 900 460" className="w-full" style={{ display: 'block' }}>

        {/* Lat/lon grid */}
        <g stroke="rgba(26,26,26,0.05)" strokeWidth="0.5">
          {[92, 138, 184, 230, 276, 322, 368].map(y => (
            <line key={y} x1="0" y1={y} x2="900" y2={y} />
          ))}
          {[90, 180, 270, 360, 450, 540, 630, 720, 810].map(x => (
            <line key={x} x1={x} y1="0" x2={x} y2="460" />
          ))}
        </g>

        {/* Continent fills */}
        {CONTINENTS.map((d, i) => (
          <path
            key={i}
            d={d}
            fill="rgba(26,26,26,0.06)"
            stroke="rgba(26,26,26,0.14)"
            strokeWidth="0.8"
            strokeLinejoin="round"
          />
        ))}

        {/* Flight paths */}
        {revealed && ORIGIN_CITIES.map((city, i) => {
          const d = arcPath(city.x, city.y, DESTINATION.x, DESTINATION.y)
          const delay = i * 0.3
          const dur = 1.3
          return (
            <g key={city.name}>
              {/* Glow */}
              <path
                d={d} fill="none"
                stroke="rgba(212,82,42,0.18)" strokeWidth="2.5" strokeLinecap="round"
                strokeDasharray="1200" strokeDashoffset="1200"
                style={{ animation: `draw-path ${dur}s ease-out ${delay}s forwards` }}
              />
              {/* Line */}
              <path
                d={d} fill="none"
                stroke="#D4522A" strokeWidth="1.2" strokeLinecap="round"
                strokeDasharray="1200" strokeDashoffset="1200"
                style={{ animation: `draw-path ${dur}s ease-out ${delay}s forwards` }}
              />
              {/* Origin dot */}
              <circle
                cx={city.x} cy={city.y} r="2.5"
                fill="var(--color-ink)" opacity="0"
                style={{ animation: `fade-in 0.3s ease ${delay}s forwards` }}
              />
              {/* Label */}
              <text
                x={city.x + 7} y={city.y - 5}
                fill="rgba(26,26,26,0.5)"
                fontSize="6.5"
                fontFamily="'Space Mono', monospace"
                letterSpacing="0.08em"
                opacity="0"
                style={{ animation: `fade-in 0.3s ease ${delay + 0.1}s forwards` }}
              >
                {city.label}
              </text>
            </g>
          )
        })}

        {/* Destination — Lisbon */}
        {destinationVisible && (
          <g>
            {/* Pulse rings */}
            <circle cx={DESTINATION.x} cy={DESTINATION.y} r="22"
              fill="none" stroke="rgba(212,82,42,0.12)" strokeWidth="1"
              style={{ animation: 'fade-in 0.5s ease forwards' }}
            />
            <circle cx={DESTINATION.x} cy={DESTINATION.y} r="13"
              fill="none" stroke="rgba(212,82,42,0.22)" strokeWidth="1"
              style={{ animation: 'fade-in 0.5s ease 0.1s forwards', opacity: 0 }}
            />
            {/* Core dot */}
            <circle cx={DESTINATION.x} cy={DESTINATION.y} r="5"
              fill="#D4522A"
              style={{ animation: 'fade-in 0.3s ease 0.15s forwards', opacity: 0 }}
            />
            {/* Label */}
            <text
              x={DESTINATION.x} y={DESTINATION.y + 38}
              textAnchor="middle"
              fill="rgba(26,26,26,0.8)"
              fontSize="9"
              fontFamily="'DM Sans', sans-serif"
              fontWeight="600"
              letterSpacing="0.04em"
              opacity="0"
              style={{ animation: 'fade-in 0.5s ease 0.35s forwards' }}
            >
              Lisbon, Portugal
            </text>
          </g>
        )}

      </svg>
    </div>
  )
}
