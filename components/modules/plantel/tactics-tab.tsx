"use client"

import { useState, useEffect, useRef, useCallback, useId } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Camera, RotateCcw, ChevronDown, Settings2 } from "lucide-react"
import {
  type Jogador, type TacticaConfig, type TacticArrow, type TacticArrowType,
  getJogadores, getTatica, saveTatica, getPrimarySetor, displayName,
} from "@/lib/storage/plantel"

// ─── Formações ────────────────────────────────────────────────────────────────

const FORMATION_POSITIONS: Record<string, { posicao: string; label: string; row: number }[]> = {
  // ── 2 DEF ──
  "1-2-3-5": [
    { posicao: "GK",  label: "GK",  row: 5 },
    { posicao: "CBL", label: "CB",  row: 4 }, { posicao: "CBR", label: "CB",  row: 4 },
    { posicao: "WL",  label: "LM",  row: 3 }, { posicao: "CM",  label: "CM",  row: 3 }, { posicao: "WR",  label: "RM",  row: 3 },
    { posicao: "WL",  label: "LW",  row: 2 }, { posicao: "OM",  label: "SS",  row: 2 }, { posicao: "ST",  label: "ST",  row: 2 }, { posicao: "WR",  label: "RW",  row: 2 },
    { posicao: "ST",  label: "CF",  row: 1 },
  ],
  "1-2-4-4": [
    { posicao: "GK",  label: "GK",  row: 5 },
    { posicao: "CBL", label: "CB",  row: 4 }, { posicao: "CBR", label: "CB",  row: 4 },
    { posicao: "WL",  label: "LM",  row: 3 }, { posicao: "CML", label: "CM",  row: 3 }, { posicao: "CMR", label: "CM",  row: 3 }, { posicao: "WR",  label: "RM",  row: 3 },
    { posicao: "WL",  label: "LW",  row: 2 }, { posicao: "OM",  label: "SS",  row: 2 }, { posicao: "WR",  label: "RW",  row: 2 },
    { posicao: "ST",  label: "ST",  row: 1 },
  ],
  "1-2-5-3": [
    { posicao: "GK",  label: "GK",  row: 5 },
    { posicao: "CBL", label: "CB",  row: 4 }, { posicao: "CBR", label: "CB",  row: 4 },
    { posicao: "WL",  label: "LM",  row: 3 }, { posicao: "CML", label: "CM",  row: 3 }, { posicao: "CM",  label: "CM",  row: 3 }, { posicao: "CMR", label: "CM",  row: 3 }, { posicao: "WR",  label: "RM",  row: 3 },
    { posicao: "WL",  label: "LW",  row: 1 }, { posicao: "ST",  label: "ST",  row: 1 }, { posicao: "WR",  label: "RW",  row: 1 },
  ],
  // ── 3 DEF ──
  "1-3-2-5": [
    { posicao: "GK",  label: "GK",  row: 5 },
    { posicao: "CBL", label: "CB",  row: 4 }, { posicao: "CB",  label: "CB",  row: 4 }, { posicao: "CBR", label: "CB",  row: 4 },
    { posicao: "CML", label: "DM",  row: 3 }, { posicao: "CMR", label: "DM",  row: 3 },
    { posicao: "WL",  label: "LW",  row: 2 }, { posicao: "OM",  label: "SS",  row: 2 }, { posicao: "ST",  label: "ST",  row: 2 }, { posicao: "WR",  label: "RW",  row: 2 },
    { posicao: "ST",  label: "CF",  row: 1 },
  ],
  "1-3-3-4": [
    { posicao: "GK",  label: "GK",  row: 5 },
    { posicao: "CBL", label: "CB",  row: 4 }, { posicao: "CB",  label: "CB",  row: 4 }, { posicao: "CBR", label: "CB",  row: 4 },
    { posicao: "WL",  label: "LM",  row: 3 }, { posicao: "CM",  label: "CM",  row: 3 }, { posicao: "WR",  label: "RM",  row: 3 },
    { posicao: "WL",  label: "LW",  row: 2 }, { posicao: "OM",  label: "SS",  row: 2 }, { posicao: "WR",  label: "RW",  row: 2 },
    { posicao: "ST",  label: "ST",  row: 1 },
  ],
  "1-3-4-3": [
    { posicao: "GK",  label: "GK",  row: 5 },
    { posicao: "CBL", label: "CB",  row: 4 }, { posicao: "CB",  label: "CB",  row: 4 }, { posicao: "CBR", label: "CB",  row: 4 },
    { posicao: "WL",  label: "LM",  row: 3 }, { posicao: "CML", label: "CM",  row: 3 }, { posicao: "CMR", label: "CM",  row: 3 }, { posicao: "WR",  label: "RM",  row: 3 },
    { posicao: "WL",  label: "LW",  row: 1 }, { posicao: "ST",  label: "ST",  row: 1 }, { posicao: "WR",  label: "RW",  row: 1 },
  ],
  "1-3-5-2": [
    { posicao: "GK",  label: "GK",  row: 5 },
    { posicao: "CBL", label: "CB",  row: 4 }, { posicao: "CB",  label: "CB",  row: 4 }, { posicao: "CBR", label: "CB",  row: 4 },
    { posicao: "WL",  label: "LWB", row: 3 }, { posicao: "CML", label: "CM",  row: 3 }, { posicao: "CM",  label: "CM",  row: 3 }, { posicao: "CMR", label: "CM",  row: 3 }, { posicao: "WR",  label: "RWB", row: 3 },
    { posicao: "ST",  label: "ST",  row: 1 }, { posicao: "ST",  label: "ST",  row: 1 },
  ],
  "1-3-4-2-1": [
    { posicao: "GK",  label: "GK",  row: 5 },
    { posicao: "CBL", label: "CB",  row: 4 }, { posicao: "CB",  label: "CB",  row: 4 }, { posicao: "CBR", label: "CB",  row: 4 },
    { posicao: "WL",  label: "LM",  row: 3 }, { posicao: "CML", label: "CM",  row: 3 }, { posicao: "CMR", label: "CM",  row: 3 }, { posicao: "WR",  label: "RM",  row: 3 },
    { posicao: "WL",  label: "LAM", row: 2 }, { posicao: "WR",  label: "RAM", row: 2 },
    { posicao: "ST",  label: "ST",  row: 1 },
  ],
  "1-3-4-1-2": [
    { posicao: "GK",  label: "GK",  row: 5 },
    { posicao: "CBL", label: "CB",  row: 4 }, { posicao: "CB",  label: "CB",  row: 4 }, { posicao: "CBR", label: "CB",  row: 4 },
    { posicao: "WL",  label: "LM",  row: 3 }, { posicao: "CML", label: "CM",  row: 3 }, { posicao: "CMR", label: "CM",  row: 3 }, { posicao: "WR",  label: "RM",  row: 3 },
    { posicao: "OM",  label: "AM",  row: 2 },
    { posicao: "ST",  label: "ST",  row: 1 }, { posicao: "ST",  label: "ST",  row: 1 },
  ],
  "1-3-3-3-1": [
    { posicao: "GK",  label: "GK",  row: 5 },
    { posicao: "CBL", label: "CB",  row: 4 }, { posicao: "CB",  label: "CB",  row: 4 }, { posicao: "CBR", label: "CB",  row: 4 },
    { posicao: "WL",  label: "LDM", row: 3 }, { posicao: "CM",  label: "DM",  row: 3 }, { posicao: "WR",  label: "RDM", row: 3 },
    { posicao: "WL",  label: "LAM", row: 2 }, { posicao: "OM",  label: "AM",  row: 2 }, { posicao: "WR",  label: "RAM", row: 2 },
    { posicao: "ST",  label: "ST",  row: 1 },
  ],
  // ── 4 DEF ──
  "1-4-2-4": [
    { posicao: "GK",  label: "GK",  row: 5 },
    { posicao: "LB",  label: "LB",  row: 4 }, { posicao: "CBL", label: "CB",  row: 4 }, { posicao: "CBR", label: "CB",  row: 4 }, { posicao: "RB",  label: "RB",  row: 4 },
    { posicao: "CML", label: "DM",  row: 3 }, { posicao: "CMR", label: "DM",  row: 3 },
    { posicao: "WL",  label: "LW",  row: 2 }, { posicao: "OM",  label: "SS",  row: 2 }, { posicao: "WR",  label: "RW",  row: 2 },
    { posicao: "ST",  label: "ST",  row: 1 },
  ],
  "1-4-3-3": [
    { posicao: "GK",  label: "GK",  row: 5 },
    { posicao: "LB",  label: "LB",  row: 4 }, { posicao: "CBL", label: "CB",  row: 4 }, { posicao: "CBR", label: "CB",  row: 4 }, { posicao: "RB",  label: "RB",  row: 4 },
    { posicao: "CML", label: "CM",  row: 3 }, { posicao: "CM",  label: "CM",  row: 3 }, { posicao: "CMR", label: "CM",  row: 3 },
    { posicao: "WL",  label: "LW",  row: 1 }, { posicao: "ST",  label: "ST",  row: 1 }, { posicao: "WR",  label: "RW",  row: 1 },
  ],
  "1-4-4-2": [
    { posicao: "GK",  label: "GK",  row: 5 },
    { posicao: "LB",  label: "LB",  row: 4 }, { posicao: "CBL", label: "CB",  row: 4 }, { posicao: "CBR", label: "CB",  row: 4 }, { posicao: "RB",  label: "RB",  row: 4 },
    { posicao: "WL",  label: "LM",  row: 3 }, { posicao: "CML", label: "CM",  row: 3 }, { posicao: "CMR", label: "CM",  row: 3 }, { posicao: "WR",  label: "RM",  row: 3 },
    { posicao: "ST",  label: "ST",  row: 1 }, { posicao: "ST",  label: "ST",  row: 1 },
  ],
  "1-4-5-1": [
    { posicao: "GK",  label: "GK",  row: 5 },
    { posicao: "LB",  label: "LB",  row: 4 }, { posicao: "CBL", label: "CB",  row: 4 }, { posicao: "CBR", label: "CB",  row: 4 }, { posicao: "RB",  label: "RB",  row: 4 },
    { posicao: "WL",  label: "LM",  row: 3 }, { posicao: "CML", label: "CM",  row: 3 }, { posicao: "CM",  label: "CM",  row: 3 }, { posicao: "CMR", label: "CM",  row: 3 }, { posicao: "WR",  label: "RM",  row: 3 },
    { posicao: "ST",  label: "ST",  row: 1 },
  ],
  "1-4-1-4-1": [
    { posicao: "GK",  label: "GK",  row: 5 },
    { posicao: "LB",  label: "LB",  row: 4 }, { posicao: "CBL", label: "CB",  row: 4 }, { posicao: "CBR", label: "CB",  row: 4 }, { posicao: "RB",  label: "RB",  row: 4 },
    { posicao: "CM",  label: "DM",  row: 3 },
    { posicao: "WL",  label: "LM",  row: 2 }, { posicao: "CML", label: "AM",  row: 2 }, { posicao: "CMR", label: "AM",  row: 2 }, { posicao: "WR",  label: "RM",  row: 2 },
    { posicao: "ST",  label: "ST",  row: 1 },
  ],
  "1-4-2-3-1": [
    { posicao: "GK",  label: "GK",  row: 5 },
    { posicao: "LB",  label: "LB",  row: 4 }, { posicao: "CBL", label: "CB",  row: 4 }, { posicao: "CBR", label: "CB",  row: 4 }, { posicao: "RB",  label: "RB",  row: 4 },
    { posicao: "CML", label: "DM",  row: 3 }, { posicao: "CMR", label: "DM",  row: 3 },
    { posicao: "WL",  label: "LAM", row: 2 }, { posicao: "OM",  label: "AM",  row: 2 }, { posicao: "WR",  label: "RAM", row: 2 },
    { posicao: "ST",  label: "ST",  row: 1 },
  ],
  "1-4-3-2-1": [
    { posicao: "GK",  label: "GK",  row: 5 },
    { posicao: "LB",  label: "LB",  row: 4 }, { posicao: "CBL", label: "CB",  row: 4 }, { posicao: "CBR", label: "CB",  row: 4 }, { posicao: "RB",  label: "RB",  row: 4 },
    { posicao: "CML", label: "CM",  row: 3 }, { posicao: "CM",  label: "CM",  row: 3 }, { posicao: "CMR", label: "CM",  row: 3 },
    { posicao: "WL",  label: "SS",  row: 2 }, { posicao: "WR",  label: "SS",  row: 2 },
    { posicao: "ST",  label: "ST",  row: 1 },
  ],
  "1-4-1-3-2": [
    { posicao: "GK",  label: "GK",  row: 5 },
    { posicao: "LB",  label: "LB",  row: 4 }, { posicao: "CBL", label: "CB",  row: 4 }, { posicao: "CBR", label: "CB",  row: 4 }, { posicao: "RB",  label: "RB",  row: 4 },
    { posicao: "CM",  label: "DM",  row: 3 },
    { posicao: "WL",  label: "LAM", row: 2 }, { posicao: "OM",  label: "AM",  row: 2 }, { posicao: "WR",  label: "RAM", row: 2 },
    { posicao: "ST",  label: "ST",  row: 1 }, { posicao: "ST",  label: "ST",  row: 1 },
  ],
  // ── 5 DEF ──
  "1-5-2-3": [
    { posicao: "GK",  label: "GK",  row: 5 },
    { posicao: "LB",  label: "LB",  row: 4 }, { posicao: "CBL", label: "CB",  row: 4 }, { posicao: "CB",  label: "CB",  row: 4 }, { posicao: "CBR", label: "CB",  row: 4 }, { posicao: "RB",  label: "RB",  row: 4 },
    { posicao: "CML", label: "CM",  row: 3 }, { posicao: "CMR", label: "CM",  row: 3 },
    { posicao: "WL",  label: "LW",  row: 1 }, { posicao: "ST",  label: "ST",  row: 1 }, { posicao: "WR",  label: "RW",  row: 1 },
  ],
  "1-5-3-2": [
    { posicao: "GK",  label: "GK",  row: 5 },
    { posicao: "LB",  label: "LB",  row: 4 }, { posicao: "CBL", label: "CB",  row: 4 }, { posicao: "CB",  label: "CB",  row: 4 }, { posicao: "CBR", label: "CB",  row: 4 }, { posicao: "RB",  label: "RB",  row: 4 },
    { posicao: "WL",  label: "LM",  row: 3 }, { posicao: "CM",  label: "CM",  row: 3 }, { posicao: "WR",  label: "RM",  row: 3 },
    { posicao: "ST",  label: "ST",  row: 1 }, { posicao: "ST",  label: "ST",  row: 1 },
  ],
  "1-5-4-1": [
    { posicao: "GK",  label: "GK",  row: 5 },
    { posicao: "LB",  label: "LB",  row: 4 }, { posicao: "CBL", label: "CB",  row: 4 }, { posicao: "CB",  label: "CB",  row: 4 }, { posicao: "CBR", label: "CB",  row: 4 }, { posicao: "RB",  label: "RB",  row: 4 },
    { posicao: "WL",  label: "LM",  row: 3 }, { posicao: "CML", label: "CM",  row: 3 }, { posicao: "CMR", label: "CM",  row: 3 }, { posicao: "WR",  label: "RM",  row: 3 },
    { posicao: "ST",  label: "ST",  row: 1 },
  ],
  "1-5-2-2-1": [
    { posicao: "GK",  label: "GK",  row: 5 },
    { posicao: "LB",  label: "LB",  row: 4 }, { posicao: "CBL", label: "CB",  row: 4 }, { posicao: "CB",  label: "CB",  row: 4 }, { posicao: "CBR", label: "CB",  row: 4 }, { posicao: "RB",  label: "RB",  row: 4 },
    { posicao: "CML", label: "DM",  row: 3 }, { posicao: "CMR", label: "DM",  row: 3 },
    { posicao: "WL",  label: "LAM", row: 2 }, { posicao: "WR",  label: "RAM", row: 2 },
    { posicao: "ST",  label: "ST",  row: 1 },
  ],
  "1-5-3-1-1": [
    { posicao: "GK",  label: "GK",  row: 5 },
    { posicao: "LB",  label: "LB",  row: 4 }, { posicao: "CBL", label: "CB",  row: 4 }, { posicao: "CB",  label: "CB",  row: 4 }, { posicao: "CBR", label: "CB",  row: 4 }, { posicao: "RB",  label: "RB",  row: 4 },
    { posicao: "WL",  label: "LM",  row: 3 }, { posicao: "CM",  label: "CM",  row: 3 }, { posicao: "WR",  label: "RM",  row: 3 },
    { posicao: "OM",  label: "AM",  row: 2 },
    { posicao: "ST",  label: "ST",  row: 1 },
  ],
  // ── 6 DEF ──
  "1-6-2-2": [
    { posicao: "GK",  label: "GK",  row: 5 },
    { posicao: "LB",  label: "LB",  row: 4 }, { posicao: "CBL", label: "CB",  row: 4 }, { posicao: "CB",  label: "CB",  row: 4 }, { posicao: "CBR", label: "CB",  row: 4 }, { posicao: "RB",  label: "RB",  row: 4 }, { posicao: "CM",  label: "SW",  row: 4 },
    { posicao: "CML", label: "CM",  row: 3 }, { posicao: "CMR", label: "CM",  row: 3 },
    { posicao: "ST",  label: "ST",  row: 1 }, { posicao: "ST",  label: "ST",  row: 1 },
  ],
  "1-6-3-1": [
    { posicao: "GK",  label: "GK",  row: 5 },
    { posicao: "LB",  label: "LB",  row: 4 }, { posicao: "CBL", label: "CB",  row: 4 }, { posicao: "CB",  label: "CB",  row: 4 }, { posicao: "CBR", label: "CB",  row: 4 }, { posicao: "RB",  label: "RB",  row: 4 }, { posicao: "CM",  label: "SW",  row: 4 },
    { posicao: "WL",  label: "LM",  row: 3 }, { posicao: "CM",  label: "CM",  row: 3 }, { posicao: "WR",  label: "RM",  row: 3 },
    { posicao: "ST",  label: "ST",  row: 1 },
  ],
}

const FORMATIONS = Object.keys(FORMATION_POSITIONS)

function getPositions(formacao: string) {
  return FORMATION_POSITIONS[formacao] ?? FORMATION_POSITIONS["1-4-3-3"]
}

// ─── Cores por setor ──────────────────────────────────────────────────────────

function sectorColor(posicoes: string[]): string {
  const setor = getPrimarySetor(posicoes as Parameters<typeof getPrimarySetor>[0])
  if (setor === "GR")  return "#111111"
  if (setor === "DEF") return "#00D66C"
  if (setor === "MED") return "#0066FF"
  return "#FF2222"
}

function sectorColorByRow(row: number): string {
  if (row === 5) return "#111111"  // GK
  if (row === 4) return "#00D66C"  // DEF
  if (row === 3) return "#0066FF"  // MID
  return "#FF2222"                 // FWD (rows 1 e 2)
}

// ─── Mentalidade → Zonas Y absolutas por linha ────────────────────────────────
// SVG field: 780x510, jogável y=20–490; halfway y=255
// Offensive half = y < 255 (topo), Defensive half = y > 255 (fundo)
// rows: 5=GK, 4=DEF, 3=MID, 2=FWD, 1=ST (mais ofensivo)

// Vertical field: viewBox 510x780, GK at bottom (high y), FWD at top (low y), halfway y=390
const MENTALITY_ROW_Y: Record<TacticaConfig["mentalidade"], Record<number, number>> = {
  //                    5=GK   4=DEF  3=MID  2=FWD  1=ST
  very_offensive: { 5: 700, 4: 340, 3: 260, 2: 175, 1: 105 },
  offensive:      { 5: 700, 4: 420, 3: 305, 2: 205, 1: 128 },
  balanced:       { 5: 700, 4: 560, 3: 390, 2: 255, 1: 158 },
  defensive:      { 5: 715, 4: 640, 3: 528, 2: 425, 1: 365 },
  very_defensive: { 5: 725, 4: 672, 3: 588, 2: 488, 1: 438 },
}

// ─── Calcular posições absolutas (SVG) ───────────────────────────────────────

interface SlotPos { x: number; y: number; slotKey: string; label: string; posicao: string; row: number }

const WIDE_POSITIONS = ["LB", "RB", "LWB", "RWB", "WL", "WR", "LW", "RW", "LM", "RM"]

function computeSlotPositions(
  formacao: string,
  mentalidade: TacticaConfig["mentalidade"],
  atacarPorCorredor: "wide" | "center",
  overrides: Record<string, { x: number; y: number }> = {},
): SlotPos[] {
  const positions = getPositions(formacao)
  const rowY = MENTALITY_ROW_Y[mentalidade]
  // Vertical field x range: 40–470 (field width ~480, centered at 255)
  const xSpread = atacarPorCorredor === "wide" ? 18 : -15

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
    const xStep = 430 / (count + 1)
    let baseX = 40 + xStep * (idxInRow + 1)

    // Apply xSpread to wide positions
    if (WIDE_POSITIONS.includes(p.label) || WIDE_POSITIONS.includes(p.posicao)) {
      if (idxInRow === 0) baseX -= xSpread
      if (idxInRow === count - 1 && count > 1) baseX += xSpread
    }

    const baseY = rowY[p.row] ?? 390
    const slotKey = `slot_${i}`
    const override = overrides[slotKey]

    return {
      x: override ? override.x : Math.max(30, Math.min(480, baseX)),
      y: override ? override.y : Math.max(30, Math.min(750, baseY)),
      slotKey,
      label: p.label,
      posicao: p.posicao,
      row: p.row,
    }
  })
}

// ─── Position Variants ────────────────────────────────────────────────────────

const POSITION_VARIANTS: Record<string, string[]> = {
  GK:  ["GK"],
  LB:  ["LB", "LWB"],
  RB:  ["RB", "RWB"],
  CB:  ["CB", "LCB", "RCB", "SW"],
  CBL: ["CB", "LCB", "RCB"],
  CBR: ["CB", "LCB", "RCB"],
  SW:  ["SW", "CB"],
  LWB: ["LWB", "LB"],
  RWB: ["RWB", "RB"],
  DM:  ["DM", "CDM", "CM"],
  CM:  ["CM", "DM", "CAM", "LCM", "RCM"],
  LM:  ["LM", "LAM"],
  RM:  ["RM", "RAM"],
  AM:  ["AM", "CAM", "LAM", "RAM"],
  CAM: ["CAM", "AM"],
  LW:  ["LW", "WL", "IF"],
  RW:  ["RW", "WR", "IF"],
  WL:  ["WL", "LW", "IF"],
  WR:  ["WR", "RW", "IF"],
  CF:  ["CF", "F9", "SS", "ST"],
  ST:  ["ST", "CF", "F9"],
  SS:  ["SS", "CF", "ST"],
  OM:  ["OM", "AM", "CAM"],
}

// ─── SVG Pitch ────────────────────────────────────────────────────────────────


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

  const color = arrow.type === "run" ? "#FF4444" : "#60A5FA"
  const dash  = arrow.type === "run_no_ball" ? "8,5" : "none"

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
  posicao: string
  row: number
  jogador: Jogador | null
  isDrawingFrom: boolean
  onStartArrow: (slotKey: string) => void
  onRemoveArrow: (id: string) => void
  onSlotClick: () => void
  isOver: boolean
  isDragging: boolean
  scale?: number
}

function PlayerPin({
  slotKey, x, y, label, posicao: _posicao, row, jogador,
  isDrawingFrom, onStartArrow, onRemoveArrow,
  onSlotClick, isOver, isDragging, scale = 1,
}: PlayerPinProps) {
  const [hovered, setHovered] = useState(false)
  const R = 26 * scale

  // Color: row-based (slot colour) — ignores player's own position
  const posColor = sectorColorByRow(row)
  const occupiedColor = sectorColorByRow(row)
  const isEmpty = !jogador
  const isGK = row === 5

  // "White shirt on dark board" — outfield=white fill, GK=black fill
  const pinFill = isEmpty ? `${posColor}44` : (isGK ? "#111111" : "#FFFFFF")
  const numberFill = isEmpty ? (isGK ? "#FFFFFF" : posColor) : (isGK ? "#FFFFFF" : occupiedColor)

  const strokeColor = isDrawingFrom ? "#FFD700"
    : isOver ? "#00D66C"
    : hovered ? (isEmpty ? posColor : occupiedColor)
    : isEmpty ? posColor : occupiedColor

  const glowColor = isEmpty ? posColor : occupiedColor

  return (
    <g
      transform={`translate(${x},${y})`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ cursor: isDragging ? "grabbing" : "grab" }}
    >
      {/* Pin circle */}
      <circle
        r={R}
        fill={pinFill}
        stroke={strokeColor}
        strokeWidth={isEmpty ? 1.8 : isDrawingFrom ? 3 : 2.5}
        strokeDasharray={isEmpty ? "5,3" : "none"}
        style={{
          filter: hovered
            ? `drop-shadow(0 0 10px ${glowColor}) drop-shadow(0 0 22px ${glowColor}55)`
            : `drop-shadow(0 2px 6px rgba(0,0,0,0.9)) drop-shadow(0 0 3px rgba(0,0,0,0.6))`,
          transition: "filter 0.15s",
        }}
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
            style={{ pointerEvents: "none" }}
          />
        </>
      ) : (
        <text textAnchor="middle" dominantBaseline="central"
          fill={numberFill}
          fontSize={isEmpty ? R * 0.52 : R * 0.65}
          fontWeight="bold"
          opacity={isEmpty ? 0.85 : 1}
          style={{ pointerEvents: "none", userSelect: "none" }}>
          {jogador ? jogador.numero : label}
        </text>
      )}

      {/* Position label (below pin) */}
      <text textAnchor="middle" y={R + 12 * scale} fill="rgba(255,255,255,0.9)"
        fontSize={10 * scale} fontWeight="700"
        style={{ pointerEvents: "none", userSelect: "none", letterSpacing: "0.06em" }}>
        {label}
      </text>

      {/* Player name */}
      {jogador && (
        <text textAnchor="middle" y={R + 23 * scale} fill="rgba(255,255,255,0.75)"
          fontSize={9 * scale} fontWeight="500"
          style={{ pointerEvents: "none", userSelect: "none" }}>
          {displayName(jogador).split(" ").slice(-1)[0].substring(0, 9)}
        </text>
      )}

      {/* Arrow handle (shown on hover) — drag to draw arrow */}
      {(hovered || isDrawingFrom) && (
        <g>
          <circle r={R + 9} fill="transparent" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" strokeDasharray="3,2" />
          <circle r={6} cx={0} cy={-(R + 9)}
            fill={isDrawingFrom ? "#FFD700" : "#00D66C"}
            stroke="white" strokeWidth="1"
            style={{ cursor: "crosshair" }}
            onPointerDown={e => { e.stopPropagation(); onStartArrow(slotKey) }}
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
  selectedArrowType: TacticArrowType
  slotOverridesForMode: Record<string, { x: number; y: number }>
  onUpdateOverrides: (overrides: Record<string, { x: number; y: number }>) => void
  slotLabelOverridesForMode: Record<string, string>
  onUpdateLabelOverrides: (overrides: Record<string, string>) => void
}

function PitchSVG({ tatica, jogadores, onUpdate, mode, compact = false, selectedArrowType, slotOverridesForMode, onUpdateOverrides, slotLabelOverridesForMode, onUpdateLabelOverrides }: PitchSVGProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [drawingFrom, setDrawingFrom] = useState<string | null>(null)
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null)
  const [dragOver, setDragOver] = useState<string | null>(null)
  // Use ref for dragging pin to avoid async state lag
  const draggingPinRef = useRef<string | null>(null)
  const [draggingPinState, setDraggingPinState] = useState<string | null>(null)
  const [popoverSlot, setPopoverSlot] = useState<string | null>(null)

  const arrows = mode === "ip" ? tatica.ipArrows : tatica.oopArrows
  const setArrows = (fn: (prev: TacticArrow[]) => TacticArrow[]) => {
    const updated = fn(arrows)
    onUpdate(mode === "ip" ? { ipArrows: updated } : { oopArrows: updated })
  }

  const mentalidadeEfetiva = mode === "oop"
    ? (tatica.mentalidade_oop ?? "balanced")
    : tatica.mentalidade

  const formacaoEfetiva = mode === "oop"
    ? (tatica.formacao_oop ?? tatica.formacao)
    : tatica.formacao

  const slotPositions = computeSlotPositions(
    formacaoEfetiva, mentalidadeEfetiva, tatica.atacarPorCorredor, slotOverridesForMode
  )

  // Convert SVG coordinates from mouse/pointer event
  function svgCoords(e: React.MouseEvent | React.PointerEvent): { x: number; y: number } {
    const svg = svgRef.current
    if (!svg) return { x: 0, y: 0 }
    const rect = svg.getBoundingClientRect()
    const scaleX = 510 / rect.width
    const scaleY = 780 / rect.height
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
    setPopoverSlot(slotKey)
  }

  function handleStartArrow(slotKey: string) {
    setDrawingFrom(slotKey)
  }

  function handleSvgPointerDown(e: React.PointerEvent<SVGSVGElement>) {
    if (drawingFrom) return
    const pos = svgCoords(e)
    const pinR = (26 * scale) + 8
    const hit = slotPositions.find(s =>
      Math.sqrt((pos.x - s.x) ** 2 + (pos.y - s.y) ** 2) < pinR
    )
    if (hit) {
      e.preventDefault()
      draggingPinRef.current = hit.slotKey
      setDraggingPinState(hit.slotKey)
      e.currentTarget.setPointerCapture(e.pointerId)
    }
  }

  function handleSvgPointerMove(e: React.PointerEvent) {
    if (draggingPinRef.current) {
      const pos = svgCoords(e)
      const clamped = { x: Math.max(30, Math.min(480, pos.x)), y: Math.max(30, Math.min(750, pos.y)) }
      onUpdateOverrides({ ...slotOverridesForMode, [draggingPinRef.current]: clamped })
      return
    }
    if (!drawingFrom) return
    setMousePos(svgCoords(e))
  }

  function handleSvgPointerUp(e: React.PointerEvent) {
    if (draggingPinRef.current) {
      draggingPinRef.current = null
      setDraggingPinState(null)
      return
    }
    if (!drawingFrom) return
    const pos = svgCoords(e)
    const fromSlot = slotPositions.find(s => s.slotKey === drawingFrom)
    if (!fromSlot) { setDrawingFrom(null); setMousePos(null); return }

    const dist = Math.sqrt((pos.x - fromSlot.x) ** 2 + (pos.y - fromSlot.y) ** 2)
    if (dist > 25) {
      setArrows(prev => [...prev, {
        id: crypto.randomUUID(),
        slotKey: drawingFrom,
        toX: pos.x,
        toY: pos.y,
        type: selectedArrowType,
      }])
    }
    setDrawingFrom(null)
    setMousePos(null)
  }

  function handleSvgDragOver(e: React.DragEvent<SVGSVGElement>) {
    e.preventDefault()
    const pos = svgCoords(e)
    let nearest = { slotKey: "", dist: Infinity }
    slotPositions.forEach(s => {
      const d = Math.sqrt((pos.x - s.x) ** 2 + (pos.y - s.y) ** 2)
      if (d < nearest.dist) nearest = { slotKey: s.slotKey, dist: d }
    })
    setDragOver(nearest.dist < 80 ? nearest.slotKey : null)
  }

  function handleSvgDrop(e: React.DragEvent<SVGSVGElement>) {
    e.preventDefault()
    const jogadorId = e.dataTransfer.getData("jogadorId")
    if (!jogadorId) { setDragOver(null); return }
    const pos = svgCoords(e)
    let nearest = { slotKey: "", dist: Infinity }
    slotPositions.forEach(s => {
      const d = Math.sqrt((pos.x - s.x) ** 2 + (pos.y - s.y) ** 2)
      if (d < nearest.dist) nearest = { slotKey: s.slotKey, dist: d }
    })
    if (nearest.dist < 80) {
      assignToSlot(nearest.slotKey, jogadorId)
      setPopoverSlot(nearest.slotKey)
    }
    setDragOver(null)
  }

  const scale = compact ? 0.85 : 1

  return (
    <div className="relative h-full flex items-center justify-center">
      <div className="relative" style={{ height: "100%", aspectRatio: "510/780" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/23.png"
          className="absolute inset-0 w-full h-full rounded-xl pointer-events-none select-none"
          style={{ objectFit: "fill" }}
          alt=""
          crossOrigin="anonymous"
        />
        <svg
          ref={svgRef}
          viewBox="0 0 510 780"
          className="absolute inset-0 w-full h-full rounded-xl"
          style={{
            cursor: draggingPinState ? "grabbing" : drawingFrom ? "crosshair" : "default",
            userSelect: "none",
          }}
          onPointerDown={handleSvgPointerDown}
          onPointerMove={handleSvgPointerMove}
          onPointerUp={handleSvgPointerUp}
          onPointerLeave={() => {
            if (draggingPinRef.current) { draggingPinRef.current = null; setDraggingPinState(null) }
            if (drawingFrom) { setDrawingFrom(null); setMousePos(null) }
          }}
          onDragOver={handleSvgDragOver}
          onDrop={handleSvgDrop}
        >
          <rect x="0" y="0" width="510" height="780" fill="rgba(0,0,0,0.08)" />

          {/* Preview arrow while drawing */}
          {drawingFrom && mousePos && (() => {
            const from = slotPositions.find(s => s.slotKey === drawingFrom)
            if (!from) return null
            const color = selectedArrowType === "run" ? "#FF4444" : "#60A5FA"
            const dash  = selectedArrowType === "run_no_ball" ? "8,5" : "none"
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
          {slotPositions.map(slot => {
            const effectiveLabel = slotLabelOverridesForMode[slot.slotKey] ?? slot.label
            return (
              <PlayerPin
                key={slot.slotKey}
                slotKey={slot.slotKey}
                x={slot.x}
                y={slot.y}
                label={effectiveLabel}
                posicao={slot.posicao}
                row={slot.row}
                jogador={getSlotJogador(slot.slotKey)}
                isDrawingFrom={drawingFrom === slot.slotKey}
                onStartArrow={handleStartArrow}
                onRemoveArrow={() => {}}
                onSlotClick={() => handleSlotClick(slot.slotKey)}
                isOver={dragOver === slot.slotKey}
                isDragging={draggingPinState === slot.slotKey}
                scale={scale}
              />
            )
          })}

        </svg>

        {popoverSlot && (() => {
          const slot = slotPositions.find(s => s.slotKey === popoverSlot)
          if (!slot) return null
          const jogador = getSlotJogador(popoverSlot)
          const baseLabel = slot.label
          const currentLabel = slotLabelOverridesForMode[popoverSlot] ?? baseLabel
          const variants = POSITION_VARIANTS[baseLabel] ?? [baseLabel]
          const pctX = (slot.x / 510) * 100
          const pctY = (slot.y / 780) * 100

          return (
            <div
              className="absolute z-50 bg-background/95 border border-border/60 rounded-lg shadow-xl p-2"
              style={{ left: `${pctX}%`, top: `${pctY}%`, transform: "translate(-50%, -115%)", minWidth: "100px" }}
            >
              <div className="flex flex-wrap gap-1 mb-2">
                {variants.map(v => (
                  <button key={v}
                    onClick={() => {
                      onUpdateLabelOverrides({ ...slotLabelOverridesForMode, [popoverSlot]: v })
                      setPopoverSlot(null)
                    }}
                    className={`px-2 py-0.5 rounded text-xs font-bold border transition-all ${
                      v === currentLabel
                        ? "bg-[#0066FF]/20 border-[#0066FF] text-[#0066FF]"
                        : "border-border/40 text-muted-foreground hover:text-foreground hover:border-border"
                    }`}>
                    {v}
                  </button>
                ))}
              </div>
              <div className="flex gap-1">
                {jogador && (
                  <button
                    onClick={() => { assignToSlot(popoverSlot, undefined); setPopoverSlot(null) }}
                    className="flex-1 text-[10px] text-red-400 border border-red-500/30 rounded px-1 py-0.5 hover:bg-red-500/10">
                    Remover
                  </button>
                )}
                <button
                  onClick={() => setPopoverSlot(null)}
                  className="text-[10px] text-muted-foreground border border-border/30 rounded px-1 py-0.5 hover:bg-muted/20">
                  ✕
                </button>
              </div>
            </div>
          )
        })()}

      </div>
    </div>
  )
}

// ─── Bench Panel ──────────────────────────────────────────────────────────────

function BenchPanel({ jogadores, tatica, onUnassign, onExport, onReset }: {
  jogadores: Jogador[]
  tatica: TacticaConfig
  onUnassign: (jogadorId: string) => void
  onExport: () => void
  onReset: () => void
}) {
  const assignedIds = new Set(tatica.titulares.map(s => s.jogadorId).filter(Boolean))
  const SETOR_ORDER: Record<string, number> = { GR: 0, DEF: 1, MED: 2, AV: 3 }
  const bench = jogadores
    .filter(j => !assignedIds.has(j.id))
    .sort((a, b) => {
      const sa = SETOR_ORDER[getPrimarySetor(a.posicoes as Parameters<typeof getPrimarySetor>[0])] ?? 3
      const sb = SETOR_ORDER[getPrimarySetor(b.posicoes as Parameters<typeof getPrimarySetor>[0])] ?? 3
      return sa - sb
    })
  const starters = tatica.titulares.filter(s => s.jogadorId).map(slot => ({
    slot,
    jogador: jogadores.find(p => p.id === slot.jogadorId) ?? null,
  })).filter(s => s.jogador !== null) as { slot: typeof tatica.titulares[0]; jogador: Jogador }[]

  return (
    <div className="flex flex-col h-full overflow-hidden gap-0">

      {/* ── PNG + Reset ── */}
      <div className="flex gap-1 mb-2 shrink-0">
        <button onClick={onExport}
          className="flex-1 flex items-center justify-center gap-1 px-2 py-1 rounded border border-[#8B5CF6]/40 text-[#8B5CF6] hover:bg-[#8B5CF6]/10 transition-all text-[10px] font-semibold">
          <Camera className="w-3 h-3" />PNG
        </button>
        <button onClick={onReset}
          className="flex-1 flex items-center justify-center gap-1 px-2 py-1 rounded border border-red-500/40 text-red-400 hover:bg-red-500/10 transition-all text-[10px] font-semibold">
          <RotateCcw className="w-3 h-3" />Reset
        </button>
      </div>

      {/* ── TITULARES (maiores, em cima) ── */}
      <div className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60 shrink-0 mb-1">
        Em Campo <span className="text-[#00D66C]">{starters.length}</span>
      </div>
      <div className="flex flex-col gap-1 overflow-y-auto shrink-0 pr-0.5" style={{ maxHeight: "52%" }}>
        {starters.map(({ slot, jogador: j }) => {
          const color = sectorColor(j.posicoes)
          return (
            <div
              key={slot.posicao}
              draggable
              onDragStart={e => {
                e.dataTransfer.setData("jogadorId", j.id)
                onUnassign(j.id)
              }}
              className="flex items-center gap-2 p-1.5 rounded-lg border border-border/30 bg-background/40
                hover:bg-background/70 cursor-grab active:cursor-grabbing transition-all"
              style={{ borderLeftColor: color, borderLeftWidth: 2 }}
            >
              {j.foto ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={j.foto} alt={displayName(j)} className="w-11 h-11 rounded-full object-cover shrink-0 border border-border/40" />
              ) : (
                <div className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                  style={{ background: color + "33", color, border: `1px solid ${color}55` }}>
                  {j.numero}
                </div>
              )}
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-[11px] font-semibold truncate leading-tight">
                  {displayName(j).split(" ").slice(-1)[0]}
                </span>
                <span className="text-[9px]" style={{ color }}>{j.posicoes[0]}</span>
              </div>
            </div>
          )
        })}
        {starters.length === 0 && (
          <div className="text-[9px] text-muted-foreground/40 py-2 text-center">Arrastra jogadores para o campo</div>
        )}
      </div>

      {/* ── BENCH (menores, em baixo) ── */}
      <div className="border-t border-border/20 pt-1 mt-1 flex flex-col flex-1 min-h-0 overflow-hidden">
        <div className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60 shrink-0 mb-1">
          Bench <span className="text-[#00D66C]">{bench.length}</span>
        </div>
        <div className="flex flex-col gap-1 overflow-y-auto flex-1 min-h-0 pr-0.5">
          {bench.map(j => {
            const color = sectorColor(j.posicoes)
            return (
              <div
                key={j.id}
                draggable
                onDragStart={e => e.dataTransfer.setData("jogadorId", j.id)}
                className="flex items-center gap-2 p-1 rounded-lg border border-border/30 bg-background/40
                  hover:bg-background/70 cursor-grab active:cursor-grabbing transition-all"
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
            <div className="text-[9px] text-muted-foreground/40 py-2 text-center">Todos em campo</div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Mentality Selector ───────────────────────────────────────────────────────

const MENTALITY_OPTIONS: { value: TacticaConfig["mentalidade"]; label: string; color: string; short: string }[] = [
  { value: "very_offensive",  label: "Very Offensive",  color: "#FF2222", short: "V.OFF" },
  { value: "offensive",       label: "Offensive",        color: "#FF8C00", short: "OFF"   },
  { value: "balanced",        label: "Balanced",         color: "#00D66C", short: "BAL"   },
  { value: "defensive",       label: "Defensive",        color: "#0066FF", short: "DEF"   },
  { value: "very_defensive",  label: "Very Defensive",   color: "#CC00FF", short: "V.DEF" },
]

function MentalitySelector({ value, onChange, compact = false }: {
  value: TacticaConfig["mentalidade"]
  onChange: (v: TacticaConfig["mentalidade"]) => void
  compact?: boolean
}) {
  return (
    <div className="flex flex-col gap-1">
      <div className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60 mb-1">
        {compact ? "Ment." : "Mentality"}
      </div>
      {MENTALITY_OPTIONS.map(opt => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className="flex items-center gap-1.5 px-1.5 py-1.5 rounded-lg border transition-all text-left"
          style={value === opt.value
            ? { background: opt.color + "22", borderColor: opt.color, boxShadow: `0 0 8px ${opt.color}44` }
            : { borderColor: "rgba(255,255,255,0.08)", background: "transparent" }}
        >
          <div className="w-2 h-2 rounded-full shrink-0 transition-all"
            style={{ background: value === opt.value ? opt.color : "rgba(255,255,255,0.15)" }} />
          <span className="text-[9px] font-semibold"
            style={{ color: value === opt.value ? opt.color : "rgba(255,255,255,0.5)" }}>
            {compact ? opt.short : opt.label}
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
  const W = 80, H = 122
  const lc = "rgba(232,112,42,0.9)"
  const lw = 0.6
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      {/* Dark tactical board background */}
      <rect width={W} height={H} rx="4" fill="#1e1e26" />
      {/* Field border */}
      <rect x="4" y="4" width={W - 8} height={H - 8} rx="1" fill="none" stroke={lc} strokeWidth={lw} />
      {/* Center line */}
      <line x1="4" y1={H / 2} x2={W - 4} y2={H / 2} stroke={lc} strokeWidth={lw} />
      {/* Center circle */}
      <circle cx={W / 2} cy={H / 2} r="12" fill="none" stroke={lc} strokeWidth={lw} />
      <circle cx={W / 2} cy={H / 2} r="1" fill={lc} />
      {/* Top penalty area */}
      <rect x="20" y="4" width={W - 40} height="20" fill="none" stroke={lc} strokeWidth={lw} />
      {/* Bottom penalty area */}
      <rect x="20" y={H - 24} width={W - 40} height="20" fill="none" stroke={lc} strokeWidth={lw} />
      {/* Top 6-yard box */}
      <rect x="29" y="4" width={W - 58} height="9" fill="none" stroke={lc} strokeWidth={lw} />
      {/* Bottom 6-yard box */}
      <rect x="29" y={H - 13} width={W - 58} height="9" fill="none" stroke={lc} strokeWidth={lw} />
      {/* Players */}
      {slots.map((s, i) => {
        const cx = 4 + (s.x - 15) / 480 * (W - 8)
        const cy = 4 + (s.y - 15) / 750 * (H - 8)
        const isGK = s.posicao === "GK"
        return (
          <circle key={i} cx={cx} cy={cy}
            r={isGK ? 5 : 4.5}
            fill={isGK ? "#111111" : "#FFFFFF"}
            stroke={isGK ? "rgba(255,255,255,0.6)" : "none"}
            strokeWidth="0.8"
          />
        )
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
          <div className="grid grid-cols-3 gap-3 py-2">
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

// ─── Mentality Dropdown (top bar compacto) ────────────────────────────────────

function MentalityDropdown({ label, value, onChange }: {
  label?: string
  value: TacticaConfig["mentalidade"]
  onChange: (v: TacticaConfig["mentalidade"]) => void
}) {
  const opt = MENTALITY_OPTIONS.find(o => o.value === value) ?? MENTALITY_OPTIONS[2]
  return (
    <div className="relative flex items-center gap-1.5">
      {label && <span className="text-[9px] text-muted-foreground uppercase font-bold shrink-0">{label}:</span>}
      <div className="relative">
        <select
          value={value}
          onChange={e => onChange(e.target.value as TacticaConfig["mentalidade"])}
          className="h-7 pl-2 pr-6 rounded-lg border border-border/40 bg-background/60 hover:bg-background/90 transition-all text-[11px] font-bold appearance-none cursor-pointer"
          style={{ color: opt.color }}
        >
          {MENTALITY_OPTIONS.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <ChevronDown className="w-3 h-3 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: opt.color }} />
      </div>
    </div>
  )
}

// ─── Main TacticsTab ──────────────────────────────────────────────────────────

type TabMode = "ip" | "oop" | "both"

export function TacticsTab() {
  const [jogadores, setJogadores] = useState<Jogador[]>([])
  const [tatica, setTatica] = useState<TacticaConfig>(getTatica())
  const [tab, setTab] = useState<TabMode>("ip")
  const [arrowType] = useState<TacticArrowType>("run")
  const [settingsOpen, setSettingsOpen] = useState(false)
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

  function handleUnassign(jogadorId: string) {
    update({ titulares: tatica.titulares.filter(s => s.jogadorId !== jogadorId) })
  }

  async function handleExport() {
    const el = pitchRef.current
    if (!el) return
    try {
      const { default: html2canvas } = await import("html2canvas")
      const canvas = await html2canvas(el, { backgroundColor: null, scale: 2, useCORS: true, allowTaint: true, logging: false })
      const link = document.createElement("a")
      link.download = `tatica-${tatica.formacao}-${tab}.png`
      link.href = canvas.toDataURL("image/png")
      link.click()
    } catch {
      console.warn("html2canvas not available")
    }
  }

  function handleReset() {
    if (!confirm("Retirar os jogadores das tactics?")) return
    update({ titulares: [], ipSlotOverrides: {}, oopSlotOverrides: {} })
  }

  // Non-narrowed tab reference for tabBtnClass comparisons inside conditional blocks
  const activeTab = tab as string

  const tabBtnClass = (active: boolean) =>
    `px-3 py-1.5 text-[11px] font-bold rounded-lg border transition-all ${
      active
        ? "bg-[#00D66C]/20 border-[#00D66C] text-[#00D66C]"
        : "border-border/30 text-muted-foreground hover:text-foreground hover:border-border/60"
    }`

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* ── TOP BAR ── */}
      <div className="flex items-center gap-2 px-2 h-[46px] border-b border-border/20 shrink-0 overflow-hidden">
        {/* Formation — conditional por tab */}
        {tab !== "both" && (
          <div className="flex items-center gap-1.5 shrink-0">
            <div className="text-[9px] text-muted-foreground uppercase tracking-wider hidden sm:block">
              {tab === "oop" ? "OOP" : "Formation"}
            </div>
            {tab === "ip" && (
              <FormationPickerDialog value={tatica.formacao}
                onChange={f => update({ formacao: f, ipSlotOverrides: {} })} />
            )}
            {tab === "oop" && (
              <FormationPickerDialog value={tatica.formacao_oop ?? tatica.formacao}
                onChange={f => update({ formacao_oop: f, oopSlotOverrides: {} })} />
            )}
          </div>
        )}

        {/* Mentality */}
        {tab === "ip" && (
          <MentalityDropdown value={tatica.mentalidade} onChange={v => update({ mentalidade: v, ipSlotOverrides: {} })} />
        )}
        {tab === "oop" && (
          <MentalityDropdown value={tatica.mentalidade_oop ?? "balanced"} onChange={v => update({ mentalidade_oop: v, oopSlotOverrides: {} })} />
        )}
        {tab === "both" && (
          <>
            <MentalityDropdown label="IP" value={tatica.mentalidade} onChange={v => update({ mentalidade: v, ipSlotOverrides: {} })} />
            <MentalityDropdown label="OOP" value={tatica.mentalidade_oop ?? "balanced"} onChange={v => update({ mentalidade_oop: v, oopSlotOverrides: {} })} />
          </>
        )}

        {/* Settings */}
        <div className="flex items-center gap-1.5 shrink-0 ml-auto">
          <button onClick={() => setSettingsOpen(true)}
            className="flex items-center gap-1 px-2 py-1 rounded border border-border/30 text-muted-foreground hover:bg-muted/20 transition-all"
            title="Settings">
            <Settings2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ── MAIN AREA ── */}
      <div className="flex flex-1 min-h-0 overflow-hidden">

        {/* CENTER — Tabs + Pitch(es) */}
        <div ref={pitchRef} className="flex-1 min-w-0 min-h-0 h-full flex flex-col">

          {/* Tab buttons centralizados — apenas IP e OOP (Both usa divider central) */}
          {tab !== "both" && (
            <div className="flex justify-center items-center gap-1 py-1.5 shrink-0 border-b border-border/10">
              <button className={tabBtnClass(activeTab === "ip")}   onClick={() => setTab("ip")}>In Possession</button>
              <button className={tabBtnClass(activeTab === "oop")}  onClick={() => setTab("oop")}>Out of Possession</button>
              <button className={tabBtnClass(activeTab === "both")} onClick={() => setTab("both")}>Both</button>
            </div>
          )}

          {/* Pitch(es) */}
          <div className="flex-1 min-h-0">
            {tab === "ip" && (
              <PitchSVG tatica={tatica} jogadores={jogadores} onUpdate={update} mode="ip"
                selectedArrowType={arrowType}
                slotOverridesForMode={tatica.ipSlotOverrides ?? {}}
                onUpdateOverrides={overrides => update({ ipSlotOverrides: overrides })}
                slotLabelOverridesForMode={tatica.ipSlotLabelOverrides ?? {}}
                onUpdateLabelOverrides={o => update({ ipSlotLabelOverrides: o })} />
            )}
            {tab === "oop" && (
              <PitchSVG tatica={tatica} jogadores={jogadores} onUpdate={update} mode="oop"
                selectedArrowType={arrowType}
                slotOverridesForMode={tatica.oopSlotOverrides ?? {}}
                onUpdateOverrides={overrides => update({ oopSlotOverrides: overrides })}
                slotLabelOverridesForMode={tatica.oopSlotLabelOverrides ?? {}}
                onUpdateLabelOverrides={o => update({ oopSlotLabelOverrides: o })} />
            )}
            {tab === "both" && (
              <div className="flex h-full">

                {/* Campo IP com picker de formação acima */}
                <div className="flex-1 min-w-0 h-full flex flex-col">
                  <div className="flex justify-center py-1 shrink-0 border-b border-border/10">
                    <FormationPickerDialog value={tatica.formacao}
                      onChange={f => update({ formacao: f, ipSlotOverrides: {} })} />
                  </div>
                  <div className="flex-1 min-h-0">
                    <PitchSVG tatica={tatica} jogadores={jogadores} onUpdate={update} mode="ip" compact
                      selectedArrowType={arrowType}
                      slotOverridesForMode={tatica.ipSlotOverrides ?? {}}
                      onUpdateOverrides={overrides => update({ ipSlotOverrides: overrides })}
                      slotLabelOverridesForMode={tatica.ipSlotLabelOverrides ?? {}}
                      onUpdateLabelOverrides={o => update({ ipSlotLabelOverrides: o })} />
                  </div>
                </div>

                {/* Divider central com tabs verticais */}
                <div className="flex flex-col items-center justify-center gap-2 px-1.5 shrink-0 border-x border-border/20">
                  <button className={tabBtnClass(activeTab === "ip")} onClick={() => setTab("ip")}
                    style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}>
                    IP
                  </button>
                  <button className={tabBtnClass(activeTab === "both")} onClick={() => setTab("both")}
                    style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}>
                    ●
                  </button>
                  <button className={tabBtnClass(activeTab === "oop")} onClick={() => setTab("oop")}
                    style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}>
                    OOP
                  </button>
                </div>

                {/* Campo OOP com picker de formação acima */}
                <div className="flex-1 min-w-0 h-full flex flex-col">
                  <div className="flex justify-center py-1 shrink-0 border-b border-border/10">
                    <FormationPickerDialog value={tatica.formacao_oop ?? tatica.formacao}
                      onChange={f => update({ formacao_oop: f, oopSlotOverrides: {} })} />
                  </div>
                  <div className="flex-1 min-h-0">
                    <PitchSVG tatica={tatica} jogadores={jogadores} onUpdate={update} mode="oop" compact
                      selectedArrowType={arrowType}
                      slotOverridesForMode={tatica.oopSlotOverrides ?? {}}
                      onUpdateOverrides={overrides => update({ oopSlotOverrides: overrides })}
                      slotLabelOverridesForMode={tatica.oopSlotLabelOverrides ?? {}}
                      onUpdateLabelOverrides={o => update({ oopSlotLabelOverrides: o })} />
                  </div>
                </div>

              </div>
            )}
          </div>
        </div>

        {/* RIGHT — Bench */}
        <div className="w-44 shrink-0 border-l border-border/20 pl-2 pt-2 flex flex-col overflow-hidden">
          <BenchPanel jogadores={jogadores} tatica={tatica} onUnassign={handleUnassign}
            onExport={handleExport} onReset={handleReset} />
        </div>
      </div>

      {/* Settings Dialog */}
      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">Tactics Settings</DialogTitle>
          </DialogHeader>
          <TacticsSettingsPanel tatica={tatica} onUpdate={update} />
        </DialogContent>
      </Dialog>

      {/* Hidden uid usage to suppress lint warning */}
      <span className="hidden" aria-hidden>{uid}</span>
    </div>
  )
}
