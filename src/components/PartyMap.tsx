import { useEffect, useState } from 'react'

interface PartyMember {
  name: string
  originCity: string
  submitted: boolean
  // Approximate SVG coordinates on a 900x480 world map viewbox
  x: number
  y: number
}

interface PartyMapProps {
  members: PartyMember[]
}

export function PartyMap({ members }: PartyMapProps) {
  const [visible, setVisible] = useState<number[]>([])

  useEffect(() => {
    const submitted = members
      .map((m, i) => ({ m, i }))
      .filter(({ m }) => m.submitted)

    submitted.forEach(({ i }, idx) => {
      setTimeout(() => setVisible(v => [...v, i]), idx * 400 + 300)
    })
  }, [members])

  return (
    <svg
      viewBox="0 0 900 480"
      style={{ width: '100%', opacity: 0.9 }}
    >
      {/* Grid */}
      <g stroke="rgba(201,149,42,0.05)" strokeWidth="0.5">
        {[120, 180, 240, 300, 360].map(y => <line key={y} x1="0" y1={y} x2="900" y2={y} />)}
        {[150, 300, 450, 600, 750].map(x => <line key={x} x1={x} y1="0" x2={x} y2="480" />)}
      </g>

      {/* Continent outlines */}
      <g fill="none" stroke="rgba(201,149,42,0.07)" strokeWidth="1">
        <path d="M 100 120 L 220 100 L 260 130 L 240 200 L 200 240 L 150 220 L 110 180 Z" />
        <path d="M 200 270 L 270 260 L 290 320 L 270 400 L 220 420 L 190 370 L 185 310 Z" />
        <path d="M 400 110 L 470 100 L 500 130 L 480 165 L 430 170 L 400 150 Z" />
        <path d="M 460 200 L 560 195 L 590 260 L 570 360 L 510 390 L 460 340 L 440 270 Z" />
        <path d="M 510 100 L 720 90 L 800 140 L 790 220 L 700 240 L 590 210 L 520 170 Z" />
        <path d="M 710 320 L 810 310 L 830 380 L 770 410 L 700 390 Z" />
      </g>

      {/* Member dots */}
      {members.map((member, i) => {
        const isVisible = visible.includes(i)
        return (
          <g key={i}>
            {isVisible && (
              <>
                {/* Pulse ring */}
                <circle
                  cx={member.x}
                  cy={member.y}
                  r="12"
                  fill="none"
                  stroke="rgba(201,149,42,0.2)"
                  strokeWidth="1"
                  style={{ animation: 'fade-in 0.5s ease forwards' }}
                />
                {/* Dot */}
                <circle
                  cx={member.x}
                  cy={member.y}
                  r="4"
                  fill="#c9952a"
                  style={{ animation: 'fade-in 0.3s ease forwards' }}
                />
                {/* Name label */}
                <text
                  x={member.x + 10}
                  y={member.y - 8}
                  fill="rgba(242,234,219,0.7)"
                  fontSize="8"
                  fontFamily="'Jost', sans-serif"
                  fontWeight="500"
                  letterSpacing="0.08em"
                  style={{ animation: 'fade-in 0.4s ease 0.1s forwards', opacity: 0 }}
                >
                  {member.name.toUpperCase()}
                </text>
                <text
                  x={member.x + 10}
                  y={member.y + 4}
                  fill="rgba(201,149,42,0.5)"
                  fontSize="7"
                  fontFamily="'Jost', sans-serif"
                  letterSpacing="0.05em"
                  style={{ animation: 'fade-in 0.4s ease 0.15s forwards', opacity: 0 }}
                >
                  {member.originCity}
                </text>
              </>
            )}
            {/* Pending dot — dimmed */}
            {!isVisible && (
              <circle
                cx={member.x}
                cy={member.y}
                r="3"
                fill="rgba(201,149,42,0.15)"
                stroke="rgba(201,149,42,0.2)"
                strokeWidth="1"
              />
            )}
          </g>
        )
      })}

      {/* Compass */}
      <g transform="translate(860, 440)" opacity="0.15" fill="none" stroke="#c9952a" strokeWidth="0.8">
        <circle cx="0" cy="0" r="14" />
        <line x1="0" y1="-18" x2="0" y2="18" />
        <line x1="-18" y1="0" x2="18" y2="0" />
        <polygon points="0,-12 2.5,-5 0,-8 -2.5,-5" fill="#c9952a" />
        <text x="0" y="-20" textAnchor="middle" fontSize="7" fontFamily="'Jost', sans-serif" fill="#c9952a" stroke="none">N</text>
      </g>
    </svg>
  )
}
