import { useEffect, useRef, useState } from 'react'

interface City {
  name: string
  x: number
  y: number
  label: string
}

const ORIGIN_CITIES: City[] = [
  { name: 'New York', x: 195, y: 185, label: 'NEW YORK' },
  { name: 'London', x: 430, y: 148, label: 'LONDON' },
  { name: 'Tokyo', x: 755, y: 192, label: 'TOKYO' },
  { name: 'Sydney', x: 760, y: 370, label: 'SYDNEY' },
  { name: 'São Paulo', x: 248, y: 345, label: 'SÃO PAULO' },
  { name: 'Nairobi', x: 540, y: 295, label: 'NAIROBI' },
]

const DESTINATION = { x: 490, y: 220, name: 'Lisbon' }

function quadraticBezierPath(
  x1: number, y1: number,
  x2: number, y2: number
): string {
  const cx = (x1 + x2) / 2 + (y2 - y1) * 0.3
  const cy = (y1 + y2) / 2 - (x2 - x1) * 0.2
  return `M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`
}

export function FlightPathMap() {
  const [revealed, setRevealed] = useState(false)
  const [destinationVisible, setDestinationVisible] = useState(false)
  const containerRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    const timer = setTimeout(() => setRevealed(true), 600)
    const destTimer = setTimeout(() => setDestinationVisible(true), 2800)
    return () => {
      clearTimeout(timer)
      clearTimeout(destTimer)
    }
  }, [])

  return (
    <div className="relative w-full" style={{ maxWidth: 900 }}>
      <svg
        ref={containerRef}
        viewBox="0 0 900 480"
        className="w-full"
        style={{ filter: 'drop-shadow(0 0 40px rgba(6, 13, 31, 0.8))' }}
      >
        {/* Subtle world map outline — simplified continents */}
        <g fill="none" stroke="rgba(201, 149, 42, 0.08)" strokeWidth="1">
          {/* North America */}
          <path d="M 100 120 L 220 100 L 260 130 L 240 200 L 200 240 L 150 220 L 110 180 Z" />
          {/* South America */}
          <path d="M 200 270 L 270 260 L 290 320 L 270 400 L 220 420 L 190 370 L 185 310 Z" />
          {/* Europe */}
          <path d="M 400 110 L 470 100 L 500 130 L 480 165 L 430 170 L 400 150 Z" />
          {/* Africa */}
          <path d="M 460 200 L 560 195 L 590 260 L 570 360 L 510 390 L 460 340 L 440 270 Z" />
          {/* Asia */}
          <path d="M 510 100 L 720 90 L 800 140 L 790 220 L 700 240 L 590 210 L 520 170 Z" />
          {/* Australia */}
          <path d="M 710 320 L 810 310 L 830 380 L 770 410 L 700 390 Z" />
        </g>

        {/* Latitude/longitude grid */}
        <g stroke="rgba(201, 149, 42, 0.05)" strokeWidth="0.5">
          {[120, 180, 240, 300, 360].map(y => (
            <line key={y} x1="0" y1={y} x2="900" y2={y} />
          ))}
          {[150, 300, 450, 600, 750].map(x => (
            <line key={x} x1={x} y1="0" x2={x} y2="480" />
          ))}
        </g>

        {/* Flight paths */}
        {revealed && ORIGIN_CITIES.map((city, i) => {
          const pathD = quadraticBezierPath(city.x, city.y, DESTINATION.x, DESTINATION.y)
          const delay = i * 0.35
          const duration = 1.4

          return (
            <g key={city.name}>
              {/* Path glow */}
              <path
                d={pathD}
                fill="none"
                stroke="rgba(201, 149, 42, 0.15)"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray="1000"
                strokeDashoffset="1000"
                style={{
                  animation: `draw-path ${duration}s ease-out ${delay}s forwards`,
                }}
              />
              {/* Main path */}
              <path
                d={pathD}
                fill="none"
                stroke="#c9952a"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeDasharray="1000"
                strokeDashoffset="1000"
                style={{
                  animation: `draw-path ${duration}s ease-out ${delay}s forwards`,
                }}
              />

              {/* Origin dot */}
              <circle
                cx={city.x}
                cy={city.y}
                r="3"
                fill="#c9952a"
                opacity="0"
                style={{
                  animation: `fade-in 0.3s ease ${delay}s forwards`,
                }}
              />
              <text
                x={city.x + 8}
                y={city.y - 6}
                fill="rgba(201, 149, 42, 0.7)"
                fontSize="7"
                fontFamily="'Jost', sans-serif"
                fontWeight="500"
                letterSpacing="0.08em"
                opacity="0"
                style={{
                  animation: `fade-in 0.3s ease ${delay + 0.1}s forwards`,
                }}
              >
                {city.label}
              </text>
            </g>
          )
        })}

        {/* Destination — Lisbon */}
        {destinationVisible && (
          <g>
            {/* Glow rings */}
            <circle
              cx={DESTINATION.x}
              cy={DESTINATION.y}
              r="28"
              fill="none"
              stroke="rgba(201, 149, 42, 0.12)"
              strokeWidth="1"
              style={{ animation: 'fade-in 0.5s ease forwards' }}
            />
            <circle
              cx={DESTINATION.x}
              cy={DESTINATION.y}
              r="18"
              fill="none"
              stroke="rgba(201, 149, 42, 0.2)"
              strokeWidth="1"
              style={{ animation: 'fade-in 0.5s ease 0.1s forwards', opacity: 0 }}
            />
            {/* Core dot */}
            <circle
              cx={DESTINATION.x}
              cy={DESTINATION.y}
              r="6"
              fill="#c9952a"
              style={{
                animation: 'fade-in 0.3s ease 0.2s forwards, glow-pulse 2s ease-in-out 0.5s infinite',
                opacity: 0,
              }}
            />
            {/* Label */}
            <text
              x={DESTINATION.x}
              y={DESTINATION.y + 44}
              textAnchor="middle"
              fill="#f2eadb"
              fontSize="11"
              fontFamily="'Cormorant Garamond', serif"
              fontStyle="italic"
              fontWeight="400"
              letterSpacing="0.12em"
              opacity="0"
              style={{ animation: 'fade-in 0.5s ease 0.4s forwards' }}
            >
              Lisbon, Portugal
            </text>
          </g>
        )}

        {/* Compass rose — bottom right */}
        <g transform="translate(840, 430)" opacity="0.2" fill="none" stroke="#c9952a" strokeWidth="0.8">
          <circle cx="0" cy="0" r="16" />
          <line x1="0" y1="-20" x2="0" y2="20" />
          <line x1="-20" y1="0" x2="20" y2="0" />
          <polygon points="0,-14 3,-6 0,-9 -3,-6" fill="#c9952a" />
          <text x="0" y="-22" textAnchor="middle" fontSize="7" fontFamily="'Jost', sans-serif" fill="#c9952a" stroke="none">N</text>
        </g>
      </svg>
    </div>
  )
}
