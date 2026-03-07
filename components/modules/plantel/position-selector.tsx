"use client"

import type { PosicaoJogador } from "@/lib/storage/plantel"

type PosCoord = { x: number; y: number; label: string; fontSize: number }

const POSITIONS: Record<PosicaoJogador, PosCoord> = {
  GK:  { x: 0.50, y: 0.08, label: "GK",  fontSize: 9 },
  RB:  { x: 0.85, y: 0.24, label: "RB",  fontSize: 9 },
  CBR: { x: 0.63, y: 0.24, label: "CBR", fontSize: 7 },
  CBL: { x: 0.37, y: 0.24, label: "CBL", fontSize: 7 },
  LB:  { x: 0.15, y: 0.24, label: "LB",  fontSize: 9 },
  CM:  { x: 0.50, y: 0.42, label: "CM",  fontSize: 9 },
  CMR: { x: 0.68, y: 0.56, label: "CMR", fontSize: 7 },
  CML: { x: 0.32, y: 0.56, label: "CML", fontSize: 7 },
  WR:  { x: 0.85, y: 0.70, label: "WR",  fontSize: 9 },
  OM:  { x: 0.50, y: 0.70, label: "OM",  fontSize: 9 },
  WL:  { x: 0.15, y: 0.70, label: "WL",  fontSize: 9 },
  ST:  { x: 0.50, y: 0.86, label: "ST",  fontSize: 9 },
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
  const H = 330

  return (
    <div className="flex flex-col items-center gap-2">
      <p className="text-xs text-muted-foreground">Clica para seleccionar posições (múltiplas permitidas)</p>
      <svg
        width={W}
        height={H}
        viewBox={`0 0 ${W} ${H}`}
        className="rounded-xl overflow-hidden"
        style={{ background: "linear-gradient(180deg, #14532d 0%, #166534 40%, #14532d 100%)" }}
      >
        {/* Outer border */}
        <rect x={8} y={8} width={W - 16} height={H - 16} fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth={1.5} rx={3} />
        {/* Penalty area top */}
        <rect x={60} y={8} width={W - 120} height={52} fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth={1} />
        {/* Goal top */}
        <rect x={88} y={8} width={44} height={14} fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth={1} />
        {/* Penalty area bottom */}
        <rect x={60} y={H - 60} width={W - 120} height={52} fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth={1} />
        {/* Goal bottom */}
        <rect x={88} y={H - 22} width={44} height={14} fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth={1} />
        {/* Center line */}
        <line x1={8} y1={H / 2} x2={W - 8} y2={H / 2} stroke="rgba(255,255,255,0.18)" strokeWidth={1} />
        {/* Center circle */}
        <circle cx={W / 2} cy={H / 2} r={26} fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth={1} />

        {/* Position dots */}
        {(Object.entries(POSITIONS) as [PosicaoJogador, PosCoord][]).map(([pos, coord]) => {
          const cx = coord.x * W
          const cy = coord.y * H
          const isSelected = selected.includes(pos)
          const isPrimary = selected[0] === pos
          return (
            <g key={pos} onClick={() => toggle(pos)} style={{ cursor: "pointer" }}>
              {/* Outer glow for selected */}
              {isSelected && (
                <circle cx={cx} cy={cy} r={20} fill={isPrimary ? "#00D66C30" : "#00D66C18"} />
              )}
              <circle
                cx={cx}
                cy={cy}
                r={16}
                fill={isSelected ? (isPrimary ? "#00D66C" : "#00D66C88") : "rgba(0,0,0,0.6)"}
                stroke={isSelected ? "#00D66C" : "rgba(255,255,255,0.4)"}
                strokeWidth={isSelected ? 2 : 1.5}
              />
              <text
                x={cx}
                y={cy + 4}
                textAnchor="middle"
                fontSize={coord.fontSize}
                fontWeight="800"
                fill={isSelected ? (isPrimary ? "#000" : "#fff") : "rgba(255,255,255,0.9)"}
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
                background: i === 0 ? "#00D66C" : "#00D66C22",
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
