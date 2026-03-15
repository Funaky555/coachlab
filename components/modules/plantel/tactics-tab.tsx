"use client"

import { useState, useEffect, useRef, useCallback, useId } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Camera, RotateCcw, ChevronDown } from "lucide-react"
import {
  type Jogador, type TacticaConfig, type TacticArrow, type TacticArrowType,
  getJogadores, getTatica, saveTatica, getPrimarySetor, displayName,
} from "@/lib/storage/plantel"

// ─── Formações ────────────────────────────────────────────────────────────────

const FORMATION_POSITIONS: Record<string, { posicao: string; label: string; row: number }[]> = {
  "1-2-3-5": [
    { posicao: "GK",  label: "GK",  row: 5 },
    { posicao: "CBL", label: "CB",  row: 4 }, { posicao: "CBR", label: "CB",  row: 4 },
    { posicao: "CML", label: "LM",  row: 3 }, { posicao: "CM",  label: "CM",  row: 3 }, { posicao: "CMR", label: "RM",  row: 3 },
    { posicao: "WL",  label: "LW",  row: 2 }, { posicao: "OM",  label: "SS",  row: 2 }, { posicao: "ST",  label: "ST",  row: 2 }, { posicao: "WR",  label: "RW",  row: 2 },
    { posicao: "ST",  label: "CF",  row: 1 },
  ],
  "1-2-4-4": [
    { posicao: "GK",  label: "GK",  row: 5 },
    { posicao: "CBL", label: "CB",  row: 4 }, { posicao: "CBR", label: "CB",  row: 4 },
    { posicao: "WL",  label: "LM",  row: 3 }, { posicao: "CML", label: "CM",  row: 3 }, { posicao: "CMR", label: "CM",  row: 3 }, { posicao: "WR",  label: "RM",  row: 3 },
    { posicao: "ST",  label: "LW",  row: 2 }, { posicao: "OM",  label: "SS",  row: 2 }, { posicao: "ST",  label: "ST",  row: 2 }, { posicao: "ST",  label: "RW",  row: 1 },
  ],
  "1-3-3-3-1": [
    { posicao: "GK",  label: "GK",  row: 5 },
    { posicao: "CBL", label: "CB",  row: 4 }, { posicao: "CM",  label: "CB",  row: 4 }, { posicao: "CBR", label: "CB",  row: 4 },
    { posicao: "CML", label: "DM",  row: 3 }, { posicao: "CMR", label: "DM",  row: 3 }, { posicao: "OM",  label: "DM",  row: 3 },
    { posicao: "WL",  label: "LW",  row: 2 }, { posicao: "WR",  label: "AM",  row: 2 }, { posicao: "LB",  label: "RW",  row: 2 },
    { posicao: "ST",  label: "ST",  row: 1 },
  ],
  "1-3-4-3": [
    { posicao: "GK",  label: "GK",  row: 5 },
    { posicao: "CBL", label: "CB",  row: 4 }, { posicao: "CM",  label: "CB",  row: 4 }, { posicao: "CBR", label: "CB",  row: 4 },
    { posicao: "LB",  label: "LM",  row: 3 }, { posicao: "CML", label: "CM",  row: 3 },
    { posicao: "CMR", label: "CM",  row: 3 }, { posicao: "RB",  label: "RM",  row: 3 },
    { posicao: "WL",  label: "LW",  row: 2 }, { posicao: "ST",  label: "ST",  row: 2 }, { posicao: "WR",  label: "RW",  row: 2 },
  ],
  "1-3-5-2": [
    { posicao: "GK",  label: "GK",  row: 5 },
    { posicao: "CBL", label: "CB",  row: 4 }, { posicao: "CM",  label: "CB",  row: 4 }, { posicao: "CBR", label: "CB",  row: 4 },
    { posicao: "LB",  label: "LWB", row: 3 }, { posicao: "CML", label: "CM",  row: 3 }, { posicao: "CMR", label: "CM",  row: 3 },
    { posicao: "OM",  label: "CM",  row: 3 }, { posicao: "RB",  label: "RWB", row: 3 },
    { posicao: "ST",  label: "ST",  row: 2 }, { posicao: "ST",  label: "ST",  row: 2 },
  ],
  "1-3-6-1": [
    { posicao: "GK",  label: "GK",  row: 5 },
    { posicao: "CBL", label: "CB",  row: 4 }, { posicao: "CM",  label: "CB",  row: 4 }, { posicao: "CBR", label: "CB",  row: 4 },
    { posicao: "LB",  label: "LWB", row: 3 }, { posicao: "CML", label: "CM",  row: 3 }, { posicao: "CMR", label: "CM",  row: 3 },
    { posicao: "OM",  label: "CM",  row: 3 }, { posicao: "WL",  label: "AM",  row: 3 }, { posicao: "RB",  label: "RWB", row: 3 },
    { posicao: "ST",  label: "ST",  row: 2 },
  ],
  "1-4-1-2-3": [
    { posicao: "GK",  label: "GK",  row: 5 },
    { posicao: "LB",  label: "LB",  row: 4 }, { posicao: "CBL", label: "CB",  row: 4 },
    { posicao: "CBR", label: "CB",  row: 4 }, { posicao: "RB",  label: "RB",  row: 4 },
    { posicao: "CM",  label: "DM",  row: 3 },
    { posicao: "CML", label: "CM",  row: 2 }, { posicao: "CMR", label: "CM",  row: 2 },
    { posicao: "WL",  label: "LW",  row: 1 }, { posicao: "ST",  label: "ST",  row: 1 }, { posicao: "WR",  label: "RW",  row: 1 },
  ],
  "1-4-1-3-2": [
    { posicao: "GK",  label: "GK",  row: 5 },
    { posicao: "LB",  label: "LB",  row: 4 }, { posicao: "CBL", label: "CB",  row: 4 },
    { posicao: "CBR", label: "CB",  row: 4 }, { posicao: "RB",  label: "RB",  row: 4 },
    { posicao: "CM",  label: "DM",  row: 3 },
    { posicao: "WL",  label: "LM",  row: 2 }, { posicao: "CMR", label: "CM",  row: 2 }, { posicao: "WR",  label: "RM",  row: 2 },
    { posicao: "ST",  label: "ST",  row: 1 }, { posicao: "ST",  label: "ST",  row: 1 },
  ],
  "1-4-1-4-1": [
    { posicao: "GK",  label: "GK",  row: 5 },
    { posicao: "LB",  label: "LB",  row: 4 }, { posicao: "CBL", label: "CB",  row: 4 },
    { posicao: "CBR", label: "CB",  row: 4 }, { posicao: "RB",  label: "RB",  row: 4 },
    { posicao: "CM",  label: "DM",  row: 3 },
    { posicao: "WL",  label: "LM",  row: 2 }, { posicao: "CML", label: "CM",  row: 2 },
    { posicao: "CMR", label: "CM",  row: 2 }, { posicao: "WR",  label: "RM",  row: 2 },
    { posicao: "ST",  label: "ST",  row: 1 },
  ],
  "1-4-2-2-2": [
    { posicao: "GK",  label: "GK",  row: 5 },
    { posicao: "LB",  label: "LB",  row: 4 }, { posicao: "CBL", label: "CB",  row: 4 },
    { posicao: "CBR", label: "CB",  row: 4 }, { posicao: "RB",  label: "RB",  row: 4 },
    { posicao: "CML", label: "DM",  row: 3 }, { posicao: "CMR", label: "DM",  row: 3 },
    { posicao: "WL",  label: "LM",  row: 2 }, { posicao: "WR",  label: "RM",  row: 2 },
    { posicao: "ST",  label: "ST",  row: 1 }, { posicao: "ST",  label: "ST",  row: 1 },
  ],
  "1-4-2-3-1": [
    { posicao: "GK",  label: "GK",  row: 5 },
    { posicao: "LB",  label: "LB",  row: 4 }, { posicao: "CBL", label: "CB",  row: 4 },
    { posicao: "CBR", label: "CB",  row: 4 }, { posicao: "RB",  label: "RB",  row: 4 },
    { posicao: "CML", label: "DM",  row: 3 }, { posicao: "CMR", label: "DM",  row: 3 },
    { posicao: "WL",  label: "LW",  row: 2 }, { posicao: "CM",  label: "AM",  row: 2 }, { posicao: "WR",  label: "RW",  row: 2 },
    { posicao: "ST",  label: "ST",  row: 1 },
  ],
  "1-4-3-2-1": [
    { posicao: "GK",  label: "GK",  row: 5 },
    { posicao: "LB",  label: "LB",  row: 4 }, { posicao: "CBL", label: "CB",  row: 4 },
    { posicao: "CBR", label: "CB",  row: 4 }, { posicao: "RB",  label: "RB",  row: 4 },
    { posicao: "CML", label: "CM",  row: 3 }, { posicao: "CM",  label: "CM",  row: 3 }, { posicao: "CMR", label: "CM",  row: 3 },
    { posicao: "WL",  label: "SS",  row: 2 }, { posicao: "WR",  label: "SS",  row: 2 },
    { posicao: "ST",  label: "ST",  row: 1 },
  ],
  "1-4-3-3": [
    { posicao: "GK",  label: "GK",  row: 5 },
    { posicao: "LB",  label: "LB",  row: 4 }, { posicao: "CBL", label: "CB",  row: 4 },
    { posicao: "CBR", label: "CB",  row: 4 }, { posicao: "RB",  label: "RB",  row: 4 },
    { posicao: "CML", label: "CM",  row: 3 }, { posicao: "CM",  label: "CM",  row: 3 }, { posicao: "CMR", label: "CM",  row: 3 },
    { posicao: "WL",  label: "LW",  row: 2 }, { posicao: "ST",  label: "ST",  row: 2 }, { posicao: "WR",  label: "RW",  row: 2 },
  ],
  "1-4-4-2": [
    { posicao: "GK",  label: "GK",  row: 5 },
    { posicao: "LB",  label: "LB",  row: 4 }, { posicao: "CBL", label: "CB",  row: 4 },
    { posicao: "CBR", label: "CB",  row: 4 }, { posicao: "RB",  label: "RB",  row: 4 },
    { posicao: "WL",  label: "LM",  row: 3 }, { posicao: "CML", label: "CM",  row: 3 },
    { posicao: "CMR", label: "CM",  row: 3 }, { posicao: "WR",  label: "RM",  row: 3 },
    { posicao: "ST",  label: "ST",  row: 2 }, { posicao: "ST",  label: "ST",  row: 2 },
  ],
  "1-4-5-1": [
    { posicao: "GK",  label: "GK",  row: 5 },
    { posicao: "LB",  label: "LB",  row: 4 }, { posicao: "CBL", label: "CB",  row: 4 },
    { posicao: "CBR", label: "CB",  row: 4 }, { posicao: "RB",  label: "RB",  row: 4 },
    { posicao: "WL",  label: "LM",  row: 3 }, { posicao: "CML", label: "CM",  row: 3 }, { posicao: "CM",  label: "CM",  row: 3 },
    { posicao: "CMR", label: "CM",  row: 3 }, { posicao: "WR",  label: "RM",  row: 3 },
    { posicao: "ST",  label: "ST",  row: 2 },
  ],
  "1-5-2-2-1": [
    { posicao: "GK",  label: "GK",  row: 5 },
    { posicao: "LB",  label: "LB",  row: 4 }, { posicao: "CBL", label: "CB",  row: 4 }, { posicao: "CM",  label: "CB",  row: 4 },
    { posicao: "CBR", label: "CB",  row: 4 }, { posicao: "RB",  label: "RB",  row: 4 },
    { posicao: "CML", label: "CM",  row: 3 }, { posicao: "CMR", label: "CM",  row: 3 },
    { posicao: "WL",  label: "LW",  row: 2 }, { posicao: "WR",  label: "RW",  row: 2 },
    { posicao: "ST",  label: "ST",  row: 1 },
  ],
  "1-5-2-3": [
    { posicao: "GK",  label: "GK",  row: 5 },
    { posicao: "LB",  label: "LB",  row: 4 }, { posicao: "CBL", label: "CB",  row: 4 }, { posicao: "CM",  label: "CB",  row: 4 },
    { posicao: "CBR", label: "CB",  row: 4 }, { posicao: "RB",  label: "RB",  row: 4 },
    { posicao: "CML", label: "CM",  row: 3 }, { posicao: "CMR", label: "CM",  row: 3 },
    { posicao: "WL",  label: "LW",  row: 2 }, { posicao: "ST",  label: "ST",  row: 2 }, { posicao: "WR",  label: "RW",  row: 2 },
  ],
  "1-5-3-2": [
    { posicao: "GK",  label: "GK",  row: 5 },
    { posicao: "LB",  label: "LB",  row: 4 }, { posicao: "CBL", label: "CB",  row: 4 }, { posicao: "CM",  label: "CB",  row: 4 },
    { posicao: "CBR", label: "CB",  row: 4 }, { posicao: "RB",  label: "RB",  row: 4 },
    { posicao: "CML", label: "CM",  row: 3 }, { posicao: "CMR", label: "CM",  row: 3 }, { posicao: "OM",  label: "CM",  row: 3 },
    { posicao: "ST",  label: "ST",  row: 2 }, { posicao: "ST",  label: "ST",  row: 2 },
  ],
  "1-5-4-1": [
    { posicao: "GK",  label: "GK",  row: 5 },
    { posicao: "LB",  label: "LB",  row: 4 }, { posicao: "CBL", label: "CB",  row: 4 }, { posicao: "CM",  label: "CB",  row: 4 },
    { posicao: "CBR", label: "CB",  row: 4 }, { posicao: "RB",  label: "RB",  row: 4 },
    { posicao: "WL",  label: "LM",  row: 3 }, { posicao: "CML", label: "CM",  row: 3 },
    { posicao: "CMR", label: "CM",  row: 3 }, { posicao: "WR",  label: "RM",  row: 3 },
    { posicao: "ST",  label: "ST",  row: 2 },
  ],
}

const FORMATIONS = Object.keys(FORMATION_POSITIONS)

function getPositions(formacao: string) {
  return FORMATION_POSITIONS[formacao] ?? FORMATION_POSITIONS["1-4-3-3"]
}

// ─── Cores por setor ──────────────────────────────────────────────────────────

function sectorColor(posicoes: string[]): string {
  const setor = getPrimarySetor(posicoes as Parameters<typeof getPrimarySetor>[0])
  if (setor === "GR")  return "#7F0000"
  if (setor === "DEF") return "#0277BD"
  if (setor === "MED") return "#8B5CF6"
  return "#FF6B35"
}

// ─── Mentalidade → Zonas Y absolutas por linha ────────────────────────────────
// SVG field: 780x510, jogável y=20–490; halfway y=255
// Offensive half = y < 255 (topo), Defensive half = y > 255 (fundo)
// rows: 5=GK, 4=DEF, 3=MID, 2=FWD, 1=ST (mais ofensivo)

const MENTALITY_ROW_Y: Record<TacticaConfig["mentalidade"], Record<number, number>> = {
  very_offensive: { 5: 360, 4: 220, 3: 170, 2: 120, 1: 80  },
  offensive:      { 5: 420, 4: 260, 3: 195, 2: 135, 1: 90  },
  balanced:       { 5: 420, 4: 340, 3: 260, 2: 180, 1: 110 },
  defensive:      { 5: 420, 4: 400, 3: 340, 2: 275, 1: 260 },
  very_defensive: { 5: 430, 4: 435, 3: 375, 2: 315, 1: 285 },
}

// ─── Calcular posições absolutas (SVG) ───────────────────────────────────────

interface SlotPos { x: number; y: number; slotKey: string; label: string; posicao: string }

const WIDE_POSITIONS = ["LB", "RB", "LWB", "RWB", "WL", "WR", "LW", "RW", "LM", "RM"]

function computeSlotPositions(
  formacao: string,
  mentalidade: TacticaConfig["mentalidade"],
  atacarPorCorredor: "wide" | "center",
): SlotPos[] {
  const positions = getPositions(formacao)
  const rowY = MENTALITY_ROW_Y[mentalidade]
  const xSpread = atacarPorCorredor === "wide" ? 28 : -20

  // Group by row to distribute x evenly
  const byRow: Record<number, typeof positions> = {}
  positions.forEach(p => {
    if (!byRow[p.row]) byRow[p.row] = []
    byRow[p.row].push(p)
  })

  return positions.map((p, i) => {
    const rowSlots = byRow[p.row]
    const idxInRow = rowSlots.indexOf(p)
    const count = rowSlots.length
    const xStep = 680 / (count + 1)
    let baseX = 50 + xStep * (idxInRow + 1)

    // Apply xSpread to wide positions
    if (WIDE_POSITIONS.includes(p.label) || WIDE_POSITIONS.includes(p.posicao)) {
      if (idxInRow === 0) baseX -= xSpread
      if (idxInRow === count - 1 && count > 1) baseX += xSpread
    }

    const baseY = rowY[p.row] ?? 300

    return {
      x: Math.max(40, Math.min(740, baseX)),
      y: Math.max(40, Math.min(470, baseY)),
      slotKey: `slot_${i}`,
      label: p.label,
      posicao: p.posicao,
    }
  })
}

// ─── SVG Pitch ────────────────────────────────────────────────────────────────

function PitchLines() {
  return (
    <g stroke="rgba(255,255,255,0.55)" strokeWidth="1.5" fill="none">
      {/* Border */}
      <rect x="20" y="20" width="740" height="470" rx="2" />
      {/* Center line */}
      <line x1="20" y1="255" x2="760" y2="255" />
      {/* Center circle */}
      <circle cx="390" cy="255" r="60" />
      <circle cx="390" cy="255" r="3" fill="rgba(255,255,255,0.55)" />
      {/* Goal areas */}
      <rect x="290" y="20"  width="200" height="55" />
      <rect x="340" y="20"  width="100" height="25" />
      <rect x="290" y="435" width="200" height="55" />
      <rect x="340" y="435" width="100" height="25" />
      {/* Penalty spots */}
      <circle cx="390" cy="85"  r="3" fill="rgba(255,255,255,0.55)" />
      <circle cx="390" cy="425" r="3" fill="rgba(255,255,255,0.55)" />
      {/* Corner arcs */}
      <path d="M20,30 A10,10 0 0,1 30,20" />
      <path d="M750,20 A10,10 0 0,1 760,30" />
      <path d="M760,480 A10,10 0 0,1 750,490" />
      <path d="M30,490 A10,10 0 0,1 20,480" />
    </g>
  )
}

// ─── Seta SVG ─────────────────────────────────────────────────────────────────

function ArrowSVG({ arrow, fromX, fromY, onRemove }: {
  arrow: TacticArrow; fromX: number; fromY: number; onRemove: () => void
}) {
  const dx = arrow.toX - fromX
  const dy = arrow.toY - fromY
  const len = Math.sqrt(dx * dx + dy * dy)
  if (len < 10) return null

  const nx = dx / len, ny = dy / len
  const startX = fromX + nx * 22
  const startY = fromY + ny * 22
  const endX = arrow.toX - nx * 5
  const endY = arrow.toY - ny * 5

  const color = arrow.type === "run" ? "#ffffff" : arrow.type === "run_no_ball" ? "#FFD700" : "#60A5FA"
  const dash = arrow.type === "run_no_ball" ? "8,5" : arrow.type === "ball" ? "3,4" : "none"

  const angle = Math.atan2(ny, nx) * (180 / Math.PI)
  const arrowId = `arrowhead-${arrow.id}`

  return (
    <g className="cursor-pointer" onClick={onRemove}>
      <defs>
        <marker id={arrowId} markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0,0 L0,6 L8,3 z" fill={color} />
        </marker>
      </defs>
      {/* Invisible wider click area */}
      <line x1={startX} y1={startY} x2={endX} y2={endY}
        stroke="transparent" strokeWidth="12" />
      <line x1={startX} y1={startY} x2={endX} y2={endY}
        stroke={color} strokeWidth="2.5" strokeDasharray={dash}
        markerEnd={`url(#${arrowId})`} opacity="0.9" />
      {/* Rotation indicator for debuggin: unused */}
      <text x={(startX + endX) / 2} y={(startY + endY) / 2 - 6}
        fill={color} fontSize="0" textAnchor="middle">{angle}</text>
    </g>
  )
}

// ─── Player Pin ───────────────────────────────────────────────────────────────

interface PlayerPinProps {
  slotKey: string
  x: number
  y: number
  label: string
  jogador: Jogador | null
  arrows: TacticArrow[]
  selectedArrowType: TacticArrowType
  isDrawingFrom: boolean
  onStartArrow: (slotKey: string) => void
  onEndArrow: (toX: number, toY: number) => void
  onRemoveArrow: (id: string) => void
  onSlotClick: () => void
  onDragOver: (e: React.DragEvent) => void
  onDrop: (e: React.DragEvent) => void
  onDragStart: (e: React.DragEvent) => void
  isOver: boolean
  scale?: number
}

function PlayerPin({
  slotKey, x, y, label, jogador, arrows, selectedArrowType,
  isDrawingFrom, onStartArrow, onEndArrow, onRemoveArrow,
  onSlotClick, onDragOver, onDrop, onDragStart, isOver, scale = 1,
}: PlayerPinProps) {
  const [hovered, setHovered] = useState(false)
  const R = 22 * scale

  const color = jogador ? sectorColor(jogador.posicoes) : "#444"
  const borderColor = isDrawingFrom ? "#FFD700" : isOver ? "#00D66C" : hovered ? "#fff" : "rgba(255,255,255,0.4)"

  return (
    <g
      transform={`translate(${x},${y})`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Arrows from this pin */}
      {arrows.map(a => (
        <ArrowSVG
          key={a.id}
          arrow={a}
          fromX={0}
          fromY={0}
          onRemove={() => onRemoveArrow(a.id)}
        />
      ))}

      {/* Drop zone (invisible, larger) */}
      <foreignObject x={-R - 8} y={-R - 8} width={(R + 8) * 2} height={(R + 8) * 2 + 16}
        style={{ overflow: "visible" }}
        onDragOver={onDragOver}
        onDrop={onDrop}
      >
        <div style={{ width: "100%", height: "100%", opacity: 0 }} />
      </foreignObject>

      {/* Pin circle */}
      <circle r={R} fill={color} stroke={borderColor} strokeWidth={isDrawingFrom ? 2.5 : 1.5}
        style={{ cursor: "pointer", filter: hovered ? `drop-shadow(0 0 6px ${color})` : "none", transition: "all 0.15s" }}
        onClick={onSlotClick}
      />

      {/* Photo or number */}
      {jogador?.foto ? (
        <>
          <clipPath id={`clip-${slotKey}`}>
            <circle r={R - 2} />
          </clipPath>
          <image
            href={jogador.foto}
            x={-(R - 2)} y={-(R - 2)}
            width={(R - 2) * 2} height={(R - 2) * 2}
            clipPath={`url(#clip-${slotKey})`}
            preserveAspectRatio="xMidYMid slice"
          />
        </>
      ) : (
        <text textAnchor="middle" dominantBaseline="central"
          fill="white" fontSize={R * 0.65} fontWeight="bold" style={{ pointerEvents: "none", userSelect: "none" }}>
          {jogador ? jogador.numero : "+"}
        </text>
      )}

      {/* Position label */}
      <text textAnchor="middle" y={R + 11 * scale} fill="rgba(255,255,255,0.9)"
        fontSize={9 * scale} fontWeight="600" style={{ pointerEvents: "none", userSelect: "none", letterSpacing: "0.05em" }}>
        {label}
      </text>

      {/* Player name */}
      {jogador && (
        <text textAnchor="middle" y={R + 20 * scale} fill="rgba(255,255,255,0.7)"
          fontSize={8 * scale} style={{ pointerEvents: "none", userSelect: "none" }}>
          {displayName(jogador).split(" ").slice(-1)[0].substring(0, 8)}
        </text>
      )}

      {/* Arrow handle (shown on hover) — drag to draw arrow */}
      {(hovered || isDrawingFrom) && (
        <g>
          <circle r={R + 8} fill="transparent" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" strokeDasharray="3,2" />
          <circle r={6} cx={0} cy={-(R + 8)}
            fill={isDrawingFrom ? "#FFD700" : "#00D66C"}
            stroke="white" strokeWidth="1"
            style={{ cursor: "crosshair" }}
            onMouseDown={(e) => { e.stopPropagation(); onStartArrow(slotKey) }}
          />
        </g>
      )}
    </g>
  )
}

// ─── SVG Pitch Container ──────────────────────────────────────────────────────

interface PitchSVGProps {
  tatica: TacticaConfig
  jogadores: Jogador[]
  onUpdate: (partial: Partial<TacticaConfig>) => void
  mode: "ip" | "oop"
  compact?: boolean
  label?: string
  showSettingsCenter?: boolean
}

function PitchSVG({ tatica, jogadores, onUpdate, mode, compact = false, label }: PitchSVGProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [drawingFrom, setDrawingFrom] = useState<string | null>(null)
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null)
  const [dragOver, setDragOver] = useState<string | null>(null)
  const [selectedArrowType, setSelectedArrowType] = useState<TacticArrowType>("run")

  const arrows = mode === "ip" ? tatica.ipArrows : tatica.oopArrows
  const setArrows = (fn: (prev: TacticArrow[]) => TacticArrow[]) => {
    const updated = fn(arrows)
    onUpdate(mode === "ip" ? { ipArrows: updated } : { oopArrows: updated })
  }

  const slotPositions = computeSlotPositions(tatica.formacao, tatica.mentalidade, tatica.atacarPorCorredor)

  // Convert SVG coordinates from mouse event
  function svgCoords(e: React.MouseEvent): { x: number; y: number } {
    const svg = svgRef.current
    if (!svg) return { x: 0, y: 0 }
    const rect = svg.getBoundingClientRect()
    const scaleX = 780 / rect.width
    const scaleY = 510 / rect.height
    return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY }
  }

  function getSlotJogador(slotKey: string): Jogador | null {
    const slot = tatica.titulares.find(s => s.posicao === slotKey)
    return slot?.jogadorId ? jogadores.find(j => j.id === slot.jogadorId) ?? null : null
  }

  function assignToSlot(slotKey: string, jogadorId: string | undefined) {
    const filtered = tatica.titulares.filter(s => s.posicao !== slotKey)
    // Also remove from other slots if already assigned
    const deduped = jogadorId ? filtered.filter(s => s.jogadorId !== jogadorId) : filtered
    const updated = jogadorId ? [...deduped, { posicao: slotKey, jogadorId }] : deduped
    onUpdate({ titulares: updated })
  }

  function handleSlotClick(slotKey: string) {
    if (drawingFrom) return
    const current = getSlotJogador(slotKey)
    if (current) assignToSlot(slotKey, undefined)
  }

  function handleDrop(slotKey: string, e: React.DragEvent) {
    e.preventDefault()
    const jogadorId = e.dataTransfer.getData("jogadorId")
    if (jogadorId) assignToSlot(slotKey, jogadorId)
    setDragOver(null)
  }

  function handleStartArrow(slotKey: string) {
    setDrawingFrom(slotKey)
  }

  function handleSvgMouseMove(e: React.MouseEvent) {
    if (!drawingFrom) return
    setMousePos(svgCoords(e))
  }

  function handleSvgMouseUp(e: React.MouseEvent) {
    if (!drawingFrom) return
    const pos = svgCoords(e)
    // Find if we're over a slot (to prevent arrow pointing to same pin area)
    const fromSlot = slotPositions.find(s => s.slotKey === drawingFrom)
    if (!fromSlot) { setDrawingFrom(null); setMousePos(null); return }

    const dist = Math.sqrt((pos.x - fromSlot.x) ** 2 + (pos.y - fromSlot.y) ** 2)
    if (dist > 25) {
      const newArrow: TacticArrow = {
        id: crypto.randomUUID(),
        slotKey: drawingFrom,
        toX: pos.x,
        toY: pos.y,
        type: selectedArrowType,
      }
      setArrows(prev => [...prev, newArrow])
    }
    setDrawingFrom(null)
    setMousePos(null)
  }

  const scale = compact ? 0.85 : 1

  return (
    <div className="flex flex-col gap-1">
      {/* Arrow type selector */}
      {!compact && (
        <div className="flex items-center gap-1 justify-center">
          <span className="text-[9px] text-muted-foreground uppercase tracking-wider mr-1">Seta:</span>
          {([
            { v: "run",         label: "Com bola",    color: "#ffffff" },
            { v: "run_no_ball", label: "Sem bola",    color: "#FFD700" },
            { v: "ball",        label: "Passe/Bola",  color: "#60A5FA" },
          ] as const).map(opt => (
            <button key={opt.v} onClick={() => setSelectedArrowType(opt.v)}
              className="flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-semibold border transition-all"
              style={selectedArrowType === opt.v
                ? { background: opt.color + "33", borderColor: opt.color, color: opt.color }
                : { borderColor: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.4)" }}>
              <span style={{ display: "inline-block", width: 20, height: 2, background: opt.color,
                borderTop: opt.v === "run_no_ball" ? `2px dashed ${opt.color}` : opt.v === "ball" ? `2px dotted ${opt.color}` : `2px solid ${opt.color}`,
              }} />
              {opt.label}
            </button>
          ))}
        </div>
      )}

      <div className="relative">
        <svg
          ref={svgRef}
          viewBox="0 0 780 510"
          className="w-full rounded-xl"
          style={{
            cursor: drawingFrom ? "crosshair" : "default",
            userSelect: "none",
          }}
          onMouseMove={handleSvgMouseMove}
          onMouseUp={handleSvgMouseUp}
          onMouseLeave={() => { if (drawingFrom) { setDrawingFrom(null); setMousePos(null) } }}
        >
          {/* Real grass photo background */}
          <image href="/pitch-grass-real.jpg" x="0" y="0" width="780" height="510" preserveAspectRatio="xMidYMid slice" />
          <rect x="0" y="0" width="780" height="510" fill="rgba(0,0,0,0.22)" />
          <PitchLines />

          {/* Preview arrow while drawing */}
          {drawingFrom && mousePos && (() => {
            const from = slotPositions.find(s => s.slotKey === drawingFrom)
            if (!from) return null
            const color = selectedArrowType === "run" ? "#ffffff" : selectedArrowType === "run_no_ball" ? "#FFD700" : "#60A5FA"
            const dash = selectedArrowType === "run_no_ball" ? "8,5" : selectedArrowType === "ball" ? "3,4" : "none"
            return (
              <line x1={from.x} y1={from.y} x2={mousePos.x} y2={mousePos.y}
                stroke={color} strokeWidth="2" strokeDasharray={dash} opacity="0.6"
                markerEnd="none" />
            )
          })()}

          {/* Arrows not attached to a pin (all arrows in absolute coords) */}
          {arrows.map(arrow => {
            const from = slotPositions.find(s => s.slotKey === arrow.slotKey)
            if (!from) return null
            return (
              <g key={arrow.id}>
                <ArrowSVG
                  arrow={{ ...arrow, toX: arrow.toX, toY: arrow.toY }}
                  fromX={from.x}
                  fromY={from.y}
                  onRemove={() => setArrows(prev => prev.filter(a => a.id !== arrow.id))}
                />
              </g>
            )
          })}

          {/* Player pins */}
          {slotPositions.map(slot => (
            <PlayerPin
              key={slot.slotKey}
              slotKey={slot.slotKey}
              x={slot.x}
              y={slot.y}
              label={slot.label}
              jogador={getSlotJogador(slot.slotKey)}
              arrows={[]} // arrows handled above globally
              selectedArrowType={selectedArrowType}
              isDrawingFrom={drawingFrom === slot.slotKey}
              onStartArrow={handleStartArrow}
              onEndArrow={() => {}}
              onRemoveArrow={() => {}}
              onSlotClick={() => handleSlotClick(slot.slotKey)}
              onDragOver={e => { e.preventDefault(); setDragOver(slot.slotKey) }}
              onDrop={e => handleDrop(slot.slotKey, e)}
              onDragStart={() => {}}
              isOver={dragOver === slot.slotKey}
              scale={scale}
            />
          ))}

          {/* Label in SVG only when not compact */}
          {label && !compact && (
            <text x="30" y="498" fill="rgba(255,255,255,0.5)" fontSize="11" fontWeight="600"
              letterSpacing="0.08em" style={{ textTransform: "uppercase" }}>
              {label}
            </text>
          )}
        </svg>
        {/* Label below SVG when compact */}
        {label && compact && (
          <div className="text-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 mt-1">
            {label}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Bench Panel ──────────────────────────────────────────────────────────────

function BenchPanel({ jogadores, tatica, onUnassign }: {
  jogadores: Jogador[]
  tatica: TacticaConfig
  onUnassign: (jogadorId: string) => void
}) {
  const assignedIds = new Set(tatica.titulares.map(s => s.jogadorId).filter(Boolean))
  const bench = jogadores.filter(j => !assignedIds.has(j.id))

  return (
    <div className="flex flex-col gap-1 h-full">
      <div className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">
        Bench <span className="text-[#00D66C]">{bench.length}</span>
      </div>
      <div className="flex flex-col gap-1.5 overflow-y-auto flex-1 pr-0.5" style={{ maxHeight: 480 }}>
        {bench.map(j => {
          const color = sectorColor(j.posicoes)
          return (
            <div
              key={j.id}
              draggable
              onDragStart={e => e.dataTransfer.setData("jogadorId", j.id)}
              className="flex items-center gap-2 p-1.5 rounded-lg border border-border/30 bg-background/40
                hover:bg-background/70 cursor-grab active:cursor-grabbing transition-all group"
              style={{ borderLeftColor: color, borderLeftWidth: 2 }}
            >
              {j.foto ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={j.foto} alt={displayName(j)} className="w-8 h-8 rounded-full object-cover shrink-0 border border-border/40" />
              ) : (
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                  style={{ background: color + "33", color, border: `1px solid ${color}55` }}>
                  {j.numero}
                </div>
              )}
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-[10px] font-semibold truncate leading-tight">
                  {displayName(j).split(" ").slice(-1)[0]}
                </span>
                <span className="text-[9px]" style={{ color }}>{j.posicoes[0]}</span>
              </div>
            </div>
          )
        })}
        {bench.length === 0 && (
          <div className="text-[9px] text-muted-foreground/40 py-4 text-center">Todos em campo</div>
        )}
      </div>

      {/* Assigned players — drag back to bench */}
      <div className="border-t border-border/20 pt-1 mt-1">
        <div className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40 mb-1">Em campo</div>
        <div className="flex flex-col gap-1 overflow-y-auto" style={{ maxHeight: 180 }}>
          {tatica.titulares.filter(s => s.jogadorId).map(slot => {
            const j = jogadores.find(p => p.id === slot.jogadorId)
            if (!j) return null
            const color = sectorColor(j.posicoes)
            return (
              <div
                key={slot.posicao}
                draggable
                onDragStart={e => {
                  e.dataTransfer.setData("jogadorId", j.id)
                  // Remove from field when drag starts from "em campo"
                  onUnassign(j.id)
                }}
                className="flex items-center gap-2 p-1 rounded border border-border/20 bg-muted/20
                  hover:bg-muted/40 cursor-grab active:cursor-grabbing transition-all"
                style={{ borderLeftColor: color, borderLeftWidth: 2 }}
              >
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0"
                  style={{ background: color + "22", color }}>
                  {j.numero}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[9px] font-medium truncate leading-tight">
                    {displayName(j).split(" ").slice(-1)[0]}
                  </span>
                  <span className="text-[8px] text-muted-foreground/60">{j.posicoes[0]}</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ─── Mentality Selector ───────────────────────────────────────────────────────

const MENTALITY_OPTIONS: { value: TacticaConfig["mentalidade"]; label: string; color: string; short: string }[] = [
  { value: "very_offensive",  label: "Very Offensive",  color: "#FF4444", short: "V.OFF" },
  { value: "offensive",       label: "Offensive",        color: "#FF6B35", short: "OFF"   },
  { value: "balanced",        label: "Balanced",         color: "#00D66C", short: "BAL"   },
  { value: "defensive",       label: "Defensive",        color: "#0066FF", short: "DEF"   },
  { value: "very_defensive",  label: "Very Defensive",   color: "#8B5CF6", short: "V.DEF" },
]

function MentalitySelector({ value, onChange }: {
  value: TacticaConfig["mentalidade"]
  onChange: (v: TacticaConfig["mentalidade"]) => void
}) {
  return (
    <div className="flex flex-col gap-1">
      <div className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60 mb-1">Mentality</div>
      {MENTALITY_OPTIONS.map(opt => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className="flex items-center gap-2 px-2 py-1.5 rounded-lg border transition-all text-left"
          style={value === opt.value
            ? { background: opt.color + "22", borderColor: opt.color, boxShadow: `0 0 8px ${opt.color}44` }
            : { borderColor: "rgba(255,255,255,0.08)", background: "transparent" }}
        >
          <div className="w-2 h-2 rounded-full shrink-0 transition-all"
            style={{ background: value === opt.value ? opt.color : "rgba(255,255,255,0.15)" }} />
          <span className="text-[10px] font-semibold"
            style={{ color: value === opt.value ? opt.color : "rgba(255,255,255,0.5)" }}>
            {opt.label}
          </span>
        </button>
      ))}
    </div>
  )
}

// ─── Tactics Settings Panel ───────────────────────────────────────────────────

function TBtn({ active, color, onClick, children }: {
  active: boolean; color: string; onClick: () => void; children: React.ReactNode
}) {
  return (
    <button onClick={onClick}
      className="px-2 py-1 rounded text-[10px] font-semibold border transition-all"
      style={active
        ? { background: color + "33", borderColor: color, color }
        : { borderColor: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.4)" }}>
      {children}
    </button>
  )
}

function TacticsSettingsPanel({ tatica, onUpdate }: {
  tatica: TacticaConfig
  onUpdate: (p: Partial<TacticaConfig>) => void
}) {
  return (
    <div className="flex flex-col gap-3 px-2 py-3 rounded-xl border border-border/30 bg-background/30 backdrop-blur-sm min-w-[130px]">
      <div className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60 text-center">Settings</div>

      <div className="space-y-2.5">
        <div>
          <div className="text-[8px] text-muted-foreground/50 uppercase tracking-wider mb-1">Attack via</div>
          <div className="flex gap-1">
            <TBtn active={tatica.atacarPorCorredor === "wide"} color="#00D66C" onClick={() => onUpdate({ atacarPorCorredor: "wide" })}>Wide</TBtn>
            <TBtn active={tatica.atacarPorCorredor === "center"} color="#0066FF" onClick={() => onUpdate({ atacarPorCorredor: "center" })}>Center</TBtn>
          </div>
        </div>

        <div>
          <div className="text-[8px] text-muted-foreground/50 uppercase tracking-wider mb-1">Crosses</div>
          <div className="flex flex-col gap-1">
            <TBtn active={tatica.cruzamentos === "low"} color="#8B5CF6" onClick={() => onUpdate({ cruzamentos: "low" })}>Low</TBtn>
            <TBtn active={tatica.cruzamentos === "whipped"} color="#FF6B35" onClick={() => onUpdate({ cruzamentos: "whipped" })}>Whipped</TBtn>
            <TBtn active={tatica.cruzamentos === "floated"} color="#0066FF" onClick={() => onUpdate({ cruzamentos: "floated" })}>Floated</TBtn>
          </div>
        </div>

        <div>
          <div className="text-[8px] text-muted-foreground/50 uppercase tracking-wider mb-1">Pass Type</div>
          <div className="flex gap-1">
            <TBtn active={tatica.tipoJogada === "short"} color="#00D66C" onClick={() => onUpdate({ tipoJogada: "short" })}>Short</TBtn>
            <TBtn active={tatica.tipoJogada === "long"} color="#FF6B35" onClick={() => onUpdate({ tipoJogada: "long" })}>Long</TBtn>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Tactics Settings Panel (Horizontal — modo Both) ─────────────────────────

function TacticsSettingsPanelHorizontal({ tatica, onUpdate }: {
  tatica: TacticaConfig
  onUpdate: (p: Partial<TacticaConfig>) => void
}) {
  return (
    <div className="flex items-center gap-8 px-4 py-2.5 rounded-xl border border-border/30 bg-background/30 backdrop-blur-sm">
      <div className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/50 shrink-0">Settings</div>

      <div className="flex items-center gap-2">
        <div className="text-[8px] text-muted-foreground/50 uppercase tracking-wider">Attack via</div>
        <TBtn active={tatica.atacarPorCorredor === "wide"} color="#00D66C" onClick={() => onUpdate({ atacarPorCorredor: "wide" })}>Wide</TBtn>
        <TBtn active={tatica.atacarPorCorredor === "center"} color="#0066FF" onClick={() => onUpdate({ atacarPorCorredor: "center" })}>Center</TBtn>
      </div>

      <div className="flex items-center gap-2">
        <div className="text-[8px] text-muted-foreground/50 uppercase tracking-wider">Crosses</div>
        <TBtn active={tatica.cruzamentos === "low"} color="#8B5CF6" onClick={() => onUpdate({ cruzamentos: "low" })}>Low</TBtn>
        <TBtn active={tatica.cruzamentos === "whipped"} color="#FF6B35" onClick={() => onUpdate({ cruzamentos: "whipped" })}>Whipped</TBtn>
        <TBtn active={tatica.cruzamentos === "floated"} color="#0066FF" onClick={() => onUpdate({ cruzamentos: "floated" })}>Floated</TBtn>
      </div>

      <div className="flex items-center gap-2">
        <div className="text-[8px] text-muted-foreground/50 uppercase tracking-wider">Pass Type</div>
        <TBtn active={tatica.tipoJogada === "short"} color="#00D66C" onClick={() => onUpdate({ tipoJogada: "short" })}>Short</TBtn>
        <TBtn active={tatica.tipoJogada === "long"} color="#FF6B35" onClick={() => onUpdate({ tipoJogada: "long" })}>Long</TBtn>
      </div>
    </div>
  )
}

// ─── Formation Shape Mini SVG ─────────────────────────────────────────────────

function FormationShape({ formation }: { formation: string }) {
  const slots = computeSlotPositions(formation, "balanced", "wide")
  return (
    <svg width="80" height="56" viewBox="0 0 80 56">
      <rect x="0" y="0" width="80" height="56" rx="3" fill="#1a4a2e" />
      <line x1="0" y1="28" x2="80" y2="28" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" />
      {slots.map((s, i) => {
        const cx = 4 + (s.x - 40) / 700 * 72
        const cy = 4 + (s.y - 40) / 430 * 48
        const isGK = s.posicao === "GK"
        return <circle key={i} cx={cx} cy={cy} r={isGK ? 3.5 : 3} fill={isGK ? "#7F0000" : "#0066FF"} />
      })}
    </svg>
  )
}

// ─── Formation Picker Dialog ──────────────────────────────────────────────────

function FormationPickerDialog({ value, onChange }: {
  value: string
  onChange: (f: string) => void
}) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1 h-7 px-3 rounded-lg border border-border/40 bg-background/60 hover:bg-background/90 transition-all text-xs font-bold font-mono"
      >
        {value}
        <ChevronDown className="w-3 h-3 text-muted-foreground" />
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">Select Formation</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-4 gap-3 py-2">
            {FORMATIONS.map(f => (
              <button
                key={f}
                onClick={() => { onChange(f); setOpen(false) }}
                className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all
                  ${value === f
                    ? "border-[#00D66C] bg-[#00D66C]/10 shadow-[0_0_10px_rgba(0,214,108,0.2)]"
                    : "border-border/30 hover:border-border/60 hover:bg-muted/20"}`}
              >
                <FormationShape formation={f} />
                <span className="text-[11px] font-mono font-bold">{f}</span>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

// ─── Main TacticsTab ──────────────────────────────────────────────────────────

type TabMode = "ip" | "oop" | "both"

export function TacticsTab() {
  const [jogadores, setJogadores] = useState<Jogador[]>([])
  const [tatica, setTatica] = useState<TacticaConfig>(getTatica())
  const [tab, setTab] = useState<TabMode>("ip")
  const pitchRef = useRef<HTMLDivElement>(null)
  const uid = useId()

  useEffect(() => {
    setJogadores(getJogadores())
    setTatica(getTatica())
  }, [])

  const update = useCallback((partial: Partial<TacticaConfig>) => {
    setTatica(prev => {
      const updated = { ...prev, ...partial }
      saveTatica(updated)
      return updated
    })
  }, [])

  function changeFormation(formacao: string) {
    update({ formacao, titulares: [], ipArrows: [], oopArrows: [] })
  }

  function handleUnassign(jogadorId: string) {
    update({ titulares: tatica.titulares.filter(s => s.jogadorId !== jogadorId) })
  }

  async function handleExport() {
    const el = pitchRef.current
    if (!el) return
    try {
      const { default: html2canvas } = await import("html2canvas")
      const canvas = await html2canvas(el, { backgroundColor: null, scale: 2 })
      const link = document.createElement("a")
      link.download = `tatica-${tatica.formacao}-${tab}.png`
      link.href = canvas.toDataURL("image/png")
      link.click()
    } catch {
      console.warn("html2canvas not available")
    }
  }

  function handleReset() {
    if (!confirm("Limpar todos os jogadores e setas das táticas?")) return
    update({ titulares: [], ipArrows: [], oopArrows: [] })
  }

  const tabBtnClass = (active: boolean) =>
    `px-3 py-1.5 text-[11px] font-bold rounded-lg border transition-all ${
      active
        ? "bg-[#00D66C]/20 border-[#00D66C] text-[#00D66C]"
        : "border-border/30 text-muted-foreground hover:text-foreground hover:border-border/60"
    }`

  return (
    <div className="flex flex-col gap-3 min-h-[700px]">
      {/* ── TOP BAR ── */}
      <div className="flex items-center gap-2 flex-wrap justify-between">
        <div className="flex items-center gap-1.5">
          <button className={tabBtnClass(tab === "ip")}   onClick={() => setTab("ip")}>In Possession</button>
          <button className={tabBtnClass(tab === "oop")}  onClick={() => setTab("oop")}>Out of Possession</button>
          <button className={tabBtnClass(tab === "both")} onClick={() => setTab("both")}>Both</button>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-[9px] text-muted-foreground uppercase tracking-wider">Formation</div>
          <FormationPickerDialog value={tatica.formacao} onChange={changeFormation} />

          {/* Action buttons */}
          <button onClick={handleExport}
            className="flex items-center gap-1 px-2 py-1 rounded border border-[#8B5CF6]/40 text-[#8B5CF6] hover:bg-[#8B5CF6]/10 transition-all"
            title="Exportar PNG">
            <Camera className="w-3.5 h-3.5" />
            <span className="text-[10px] font-semibold">PNG</span>
          </button>
          <button onClick={handleReset}
            className="flex items-center gap-1 px-2 py-1 rounded border border-red-500/40 text-red-400 hover:bg-red-500/10 transition-all"
            title="Reset táticas">
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="text-[10px] font-semibold">Reset</span>
          </button>
        </div>
      </div>

      {/* ── MAIN AREA ── */}
      <div className="flex gap-2 flex-1 min-h-0">

        {/* LEFT — Mentality */}
        <div className="w-24 shrink-0">
          <MentalitySelector value={tatica.mentalidade} onChange={v => update({ mentalidade: v })} />
        </div>

        {/* CENTER — Pitch(es) */}
        <div ref={pitchRef} className="flex-1 min-w-0">
          {tab === "ip" && (
            <PitchSVG tatica={tatica} jogadores={jogadores} onUpdate={update} mode="ip" label="In Possession" />
          )}
          {tab === "oop" && (
            <PitchSVG tatica={tatica} jogadores={jogadores} onUpdate={update} mode="oop" label="Out of Possession" />
          )}
          {tab === "both" && (
            <div className="flex flex-col gap-3">
              <div className="flex gap-3 items-start">
                <div className="flex-1 min-w-0">
                  <PitchSVG tatica={tatica} jogadores={jogadores} onUpdate={update} mode="ip"  compact label="In Possession" />
                </div>
                <div className="flex-1 min-w-0">
                  <PitchSVG tatica={tatica} jogadores={jogadores} onUpdate={update} mode="oop" compact label="Out of Possession" />
                </div>
              </div>
              <TacticsSettingsPanelHorizontal tatica={tatica} onUpdate={update} />
            </div>
          )}
        </div>

        {/* RIGHT — Bench */}
        <div className="w-28 shrink-0 border-l border-border/20 pl-2">
          <BenchPanel jogadores={jogadores} tatica={tatica} onUnassign={handleUnassign} />
        </div>
      </div>

      {/* Hidden uid usage to suppress lint warning */}
      <span className="hidden" aria-hidden>{uid}</span>
    </div>
  )
}
