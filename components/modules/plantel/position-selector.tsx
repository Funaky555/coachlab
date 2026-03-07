"use client"

import type { PosicaoJogador } from "@/lib/storage/plantel"

type PosCoord = { x: number; y: number; label: string }

const POSITIONS: Record<PosicaoJogador, PosCoord> = {
  GR:       { x: 0.50, y: 0.08, label: "GR" },
  DD:       { x: 0.82, y: 0.26, label: "DD" },
  DC:       { x: 0.50, y: 0.24, label: "DC" },
  DE:       { x: 0.18, y: 0.26, label: "DE" },
  MDC:      { x: 0.50, y: 0.42, label: "MDC" },
  MC:       { x: 0.50, y: 0.56, label: "MC" },
  MD:       { x: 0.78, y: 0.50, label: "MD" },
  MDE:      { x: 0.82, y: 0.68, label: "MDE" },
  MEE:      { x: 0.18, y: 0.68, label: "MEE" },
  "MEE/MC": { x: 0.22, y: 0.56, label: "MEE/MC" },
  "MDE/MC": { x: 0.78, y: 0.56, label: "MDE/MC" },
  AV:       { x: 0.35, y: 0.84, label: "AV" },
  PL:       { x: 0.65, y: 0.84, label: "PL" },
}

interface PositionSelectorProps {
  selected: PosicaoJogador[]
  onChange: (posicoes: PosicaoJogador[]) => void
}

export function PositionSelector({ selected, onChange }: PositionSelectorProps) {
  function toggle(pos: PosicaoJogador) {
    if (selected.includes(pos)) {
      onChange(selected.filter(p => p !== pos))
    } else {
      onChange([...selected, pos])
    }
  }

  const W = 220
  const H = 320

  return (
    <div className="flex flex-col items-center gap-2">
      <p className="text-xs text-muted-foreground">Clica para seleccionar posições (múltiplas permitidas)</p>
      <svg
        width={W}
        height={H}
        viewBox={`0 0 ${W} ${H}`}
        className="rounded-lg overflow-hidden"
        style={{ background: "linear-gradient(180deg, #1a5c2a 0%, #1e6b2f 50%, #1a5c2a 100%)" }}
      >
        {/* Pitch markings */}
        {/* Outer border */}
        <rect x={10} y={10} width={W - 20} height={H - 20} fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth={1.5} rx={2} />
        {/* Center line */}
        <line x1={10} y1={H / 2} x2={W - 10} y2={H / 2} stroke="rgba(255,255,255,0.2)" strokeWidth={1} />
        {/* Center circle */}
        <circle cx={W / 2} cy={H / 2} r={28} fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth={1} />
        {/* Penalty area top */}
        <rect x={55} y={10} width={W - 110} height={50} fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth={1} />
        {/* Penalty area bottom */}
        <rect x={55} y={H - 60} width={W - 110} height={50} fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth={1} />
        {/* Goal top */}
        <rect x={85} y={10} width={50} height={12} fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth={1} />
        {/* Goal bottom */}
        <rect x={85} y={H - 22} width={50} height={12} fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth={1} />

        {/* Position dots */}
        {(Object.entries(POSITIONS) as [PosicaoJogador, PosCoord][]).map(([pos, coord]) => {
          const cx = coord.x * W
          const cy = coord.y * H
          const isSelected = selected.includes(pos)
          const isPrimary = selected[0] === pos
          return (
            <g key={pos} onClick={() => toggle(pos)} style={{ cursor: "pointer" }}>
              <circle
                cx={cx}
                cy={cy}
                r={14}
                fill={isSelected ? (isPrimary ? "#00D66C" : "#00D66C99") : "rgba(0,0,0,0.55)"}
                stroke={isSelected ? "#00D66C" : "rgba(255,255,255,0.5)"}
                strokeWidth={isSelected ? 2 : 1}
              />
              <text
                x={cx}
                y={cy + 4}
                textAnchor="middle"
                fontSize={pos.length > 2 ? "6" : "8"}
                fontWeight="700"
                fill={isSelected ? "#000" : "rgba(255,255,255,0.85)"}
                style={{ pointerEvents: "none", userSelect: "none" }}
              >
                {coord.label}
              </text>
            </g>
          )
        })}
      </svg>
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1 justify-center">
          {selected.map((p, i) => (
            <span
              key={p}
              className="text-xs px-2 py-0.5 rounded-full font-semibold"
              style={{
                background: i === 0 ? "#00D66C" : "#00D66C33",
                color: i === 0 ? "#000" : "#00D66C",
                border: "1px solid #00D66C55",
              }}
            >
              {i === 0 ? `★ ${p}` : p}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
