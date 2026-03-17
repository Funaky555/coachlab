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
  tatica: Pick<TacticaConfig,
    "attackingWidth" | "centralBacksOpen" | "fullbacksPosition" | "wingersPosition" | "strikerMovement" |
    "rbPosition" | "lbPosition" | "rcbPosition" | "lcbPosition" |
    "cmPosition" | "rcmPosition" | "lcmPosition" | "wrPosition" | "wlPosition"
  >,
  overrides: Record<string, { x: number; y: number }> = {},
): SlotPos[] {
  const positions = getPositions(formacao)
  const rowY = MENTALITY_ROW_Y[mentalidade]
  // Vertical field x range: 40–470 (field width ~480, centered at 255)
  const xSpreadMap: Record<string, number> = { maximum: 38, medium: 12, low: -8 }
  const xSpread = xSpreadMap[tatica.attackingWidth ?? "medium"] ?? 12

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

    // Position Instructions adjustments
    const lbl = p.label
    const posKey = p.posicao
    const isCBL = lbl === "CB" && idxInRow === 0
    const isCBR = lbl === "CB" && idxInRow === count - 1 && count > 1
    const isLB  = lbl === "LB" || lbl === "LWB"
    const isRB  = lbl === "RB" || lbl === "RWB"
    const isRightWinger = ["WR","RW","RM"].includes(lbl) && idxInRow === count - 1 && count > 1
    const isLeftWinger  = ["WL","LW","LM"].includes(lbl) && idxInRow === 0
    const isRCM = posKey === "CMR" || posKey === "RCM" || (lbl === "CM" && idxInRow === count - 1 && count >= 3)
    const isLCM = posKey === "CML" || posKey === "LCM" || (lbl === "CM" && idxInRow === 0 && count >= 3)
    const isCM_center = lbl === "CM" && count >= 3 && idxInRow === Math.floor((count - 1) / 2)
    const isST  = lbl === "ST" || lbl === "CF"

    // X adjustments
    if (isCBR) baseX += (tatica.rcbPosition === "wide" || (tatica.rcbPosition === undefined && tatica.centralBacksOpen)) ? 28 : 0
    if (isCBL) baseX -= (tatica.lcbPosition === "wide" || (tatica.lcbPosition === undefined && tatica.centralBacksOpen)) ? 28 : 0
    const wrEffective = tatica.wrPosition ?? tatica.wingersPosition
    const wlEffective = tatica.wlPosition ?? tatica.wingersPosition
    if (isRightWinger && wrEffective === "inside") baseX -= 45
    if (isLeftWinger  && wlEffective === "inside") baseX += 45
    if (isRightWinger && wrEffective === "open")   baseX += 10
    if (isLeftWinger  && wlEffective === "open")   baseX -= 10

    // Y adjustments
    const baseY = rowY[p.row] ?? 390
    let adjustedY = baseY
    const rbEff = tatica.rbPosition ?? tatica.fullbacksPosition
    const lbEff = tatica.lbPosition ?? tatica.fullbacksPosition
    if (isRB && rbEff === "high") adjustedY -= 55
    if (isLB && lbEff === "high") adjustedY -= 55
    const cmPos = tatica.cmPosition ?? "center"
    if (isCM_center) {
      if (cmPos === "inside_cbs") adjustedY += 80
      if (cmPos === "rotations")  adjustedY -= 25
    }
    const rcmPos = tatica.rcmPosition ?? "center"
    if (isRCM) {
      if (rcmPos === "high") adjustedY -= 70
      if (rcmPos === "low")  adjustedY += 70
    }
    const lcmPos = tatica.lcmPosition ?? "center"
    if (isLCM) {
      if (lcmPos === "high") adjustedY -= 70
      if (lcmPos === "low")  adjustedY += 70
    }
    if (isST) {
      const stMov = tatica.strikerMovement ?? "center"
      if (stMov === "offside") adjustedY -= 50
      if (stMov === "low")     adjustedY += 55
      if (stMov === "side")    baseX += (idxInRow % 2 === 0) ? 60 : -60
    }

    const slotKey = `slot_${i}`
    const override = overrides[slotKey]

    return {
      x: override ? override.x : Math.max(30, Math.min(480, baseX)),
      y: override ? override.y : Math.max(30, Math.min(750, adjustedY)),
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
  LDM: ["LDM", "DM", "CDM"],
  RDM: ["RDM", "DM", "CDM"],
  CM:  ["CM", "DM", "CAM", "LCM", "RCM"],
  LM:  ["LM", "LAM"],
  RM:  ["RM", "RAM"],
  AM:  ["AM", "CAM", "LAM", "RAM"],
  CAM: ["CAM", "AM"],
  LAM: ["LAM", "CAM", "LM", "LW"],
  RAM: ["RAM", "CAM", "RM", "RW"],
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

  const color = "#FFD700"
  const dash  = "12,7"

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
  const R = 32 * scale

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
    : isEmpty ? posColor
    : isGK ? "rgba(255,255,255,0.4)"
    : occupiedColor

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
          fontSize={isEmpty ? R * 0.52 : jogador?.alcunha ? R * 0.42 : R * 0.65}
          fontWeight="bold"
          opacity={isEmpty ? 0.85 : 1}
          style={{ pointerEvents: "none", userSelect: "none" }}>
          {jogador ? (jogador.alcunha?.substring(0, 7) ?? String(jogador.numero)) : label}
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
    formacaoEfetiva, mentalidadeEfetiva, tatica, slotOverridesForMode
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
            const color = "#FFD700"
            const dash = "12,7"
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

function BenchPanel({ jogadores, tatica, onUnassign, onExclude, onInclude }: {
  jogadores: Jogador[]
  tatica: TacticaConfig
  onUnassign: (jogadorId: string) => void
  onExclude: (jogadorId: string) => void
  onInclude: (jogadorId: string) => void
}) {
  const SETOR_ORDER: Record<string, number> = { GR: 0, DEF: 1, MED: 2, AV: 3 }

  const assignedIds = new Set(tatica.titulares.map(s => s.jogadorId).filter(Boolean))
  const notSelectedIds = new Set(tatica.notSelected ?? [])

  const starters = tatica.titulares
    .filter(s => s.jogadorId)
    .map(slot => ({ slot, jogador: jogadores.find(p => p.id === slot.jogadorId) ?? null }))
    .filter((s): s is { slot: typeof tatica.titulares[0]; jogador: Jogador } => s.jogador !== null)
    .sort((a, b) =>
      (SETOR_ORDER[getPrimarySetor(a.jogador.posicoes as Parameters<typeof getPrimarySetor>[0])] ?? 3) -
      (SETOR_ORDER[getPrimarySetor(b.jogador.posicoes as Parameters<typeof getPrimarySetor>[0])] ?? 3)
    )

  const bench = jogadores
    .filter(j => !assignedIds.has(j.id) && !notSelectedIds.has(j.id))
    .sort((a, b) =>
      (SETOR_ORDER[getPrimarySetor(a.posicoes as Parameters<typeof getPrimarySetor>[0])] ?? 3) -
      (SETOR_ORDER[getPrimarySetor(b.posicoes as Parameters<typeof getPrimarySetor>[0])] ?? 3)
    )

  const notSelected = jogadores
    .filter(j => notSelectedIds.has(j.id))
    .sort((a, b) =>
      (SETOR_ORDER[getPrimarySetor(a.posicoes as Parameters<typeof getPrimarySetor>[0])] ?? 3) -
      (SETOR_ORDER[getPrimarySetor(b.posicoes as Parameters<typeof getPrimarySetor>[0])] ?? 3)
    )

  const nickOf = (j: Jogador) => j.alcunha?.trim() || displayName(j)

  // Visual tokens per player — GK gets white treatment on dark bg
  function pinTokens(j: Jogador) {
    const raw = sectorColor(j.posicoes)
    const isGK = raw === "#111111"
    const accent = isGK ? "#ffffff" : raw
    const circleBg = isGK
      ? "radial-gradient(circle at 35% 30%, #444, #1a1a1a)"
      : `radial-gradient(circle at 35% 30%, ${raw}50, ${raw}18)`
    const circleBorder = isGK ? "2px solid rgba(255,255,255,0.85)" : `2px solid ${raw}99`
    const circleGlow = isGK
      ? "0 0 8px rgba(255,255,255,0.55), 0 0 20px rgba(255,255,255,0.18)"
      : `0 0 8px ${raw}70, 0 0 20px ${raw}28`
    const numColor = isGK ? "#ffffff" : raw
    const badgeBg = isGK ? "#ffffff" : raw
    const badgeText = "#000"
    const nameColor = isGK ? "rgba(255,255,255,0.88)" : raw + "cc"
    return { accent, circleBg, circleBorder, circleGlow, numColor, badgeBg, badgeText, nameColor }
  }

  // ── Starter row: horizontal (circle | name+pos) ──
  const StarterRow = ({ slot, j }: { slot: typeof tatica.titulares[0]; j: Jogador }) => {
    const tk = pinTokens(j)
    const nick = nickOf(j).split(" ").slice(0, 2).join(" ")
    return (
      <div
        draggable
        onDragStart={e => { e.dataTransfer.setData("jogadorId", j.id); onUnassign(j.id) }}
        className="flex items-center gap-2 px-1 py-0.5 rounded cursor-grab active:cursor-grabbing select-none transition-all hover:bg-white/5"
        title={`${nickOf(j)} · ${j.posicoes[0]}`}
      >
        <div className="relative shrink-0" style={{ width: 32, height: 32 }}>
          {j.foto ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={j.foto} alt={nick} className="rounded-full object-cover w-full h-full"
              style={{ border: tk.circleBorder, boxShadow: tk.circleGlow }} />
          ) : (
            <div className="rounded-full w-full h-full flex items-center justify-center font-black"
              style={{ background: tk.circleBg, border: tk.circleBorder, boxShadow: tk.circleGlow, color: tk.numColor, fontSize: 11 }}>
              {j.numero}
            </div>
          )}
          <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 font-black rounded-sm px-0.5"
            style={{ background: tk.badgeBg, color: tk.badgeText, fontSize: 5, lineHeight: "9px", minWidth: 12, textAlign: "center" }}>
            {j.posicoes[0]}
          </div>
        </div>
        <div className="flex flex-col min-w-0 flex-1">
          <span className="text-[10px] font-bold truncate leading-tight" style={{ color: tk.nameColor }}>{nick}</span>
          <span className="text-[8px] font-medium opacity-60" style={{ color: tk.accent }}>{j.posicoes[0]}</span>
        </div>
      </div>
    )
  }

  // ── Row reutilizável para Bench e Not Selected ──
  const PlayerRow = ({
    j, source, onRowExclude, onRowInclude,
  }: {
    j: Jogador
    source: "bench" | "notSelected"
    onRowExclude?: () => void
    onRowInclude?: () => void
  }) => {
    const tk = pinTokens(j)
    const nick = nickOf(j).split(" ").slice(0, 2).join(" ")
    const dimmed = source === "notSelected"
    return (
      <div
        draggable
        onDragStart={e => {
          e.dataTransfer.setData("jogadorId", j.id)
          e.dataTransfer.setData("source", source)
        }}
        className="flex items-center gap-2 px-1 py-0.5 rounded cursor-grab active:cursor-grabbing select-none transition-all hover:bg-white/5 group"
        style={{ opacity: dimmed ? 0.5 : 1 }}
        title={`${nickOf(j)} · ${j.posicoes[0]}`}
      >
        <div className="relative shrink-0" style={{ width: 32, height: 32 }}>
          {j.foto ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={j.foto} alt={nick} className="rounded-full object-cover w-full h-full"
              style={{ border: tk.circleBorder, boxShadow: tk.circleGlow }} />
          ) : (
            <div className="rounded-full w-full h-full flex items-center justify-center font-black"
              style={{ background: tk.circleBg, border: tk.circleBorder, boxShadow: tk.circleGlow, color: tk.numColor, fontSize: 11 }}>
              {j.numero}
            </div>
          )}
          <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 font-black rounded-sm px-0.5"
            style={{ background: tk.badgeBg, color: tk.badgeText, fontSize: 5, lineHeight: "9px", minWidth: 12, textAlign: "center" }}>
            {j.posicoes[0]}
          </div>
        </div>
        <div className="flex flex-col min-w-0 flex-1">
          <span className="text-[10px] font-bold truncate leading-tight" style={{ color: tk.nameColor }}>{nick}</span>
          <span className="text-[8px] font-medium opacity-60" style={{ color: tk.accent }}>{j.posicoes[0]}</span>
        </div>
        {/* Botão de ação ao hover */}
        {onRowExclude && (
          <button onClick={e => { e.stopPropagation(); onRowExclude() }}
            className="shrink-0 w-4 h-4 rounded-full items-center justify-center hidden group-hover:flex"
            style={{ background: "#FF2222", color: "#fff", fontSize: 8 }} title="Não convocado">✕</button>
        )}
        {onRowInclude && (
          <button onClick={e => { e.stopPropagation(); onRowInclude() }}
            className="shrink-0 w-4 h-4 rounded-full items-center justify-center hidden group-hover:flex"
            style={{ background: "#00D66C", color: "#000", fontSize: 9 }} title="Convocar">↩</button>
        )}
      </div>
    )
  }

  function handleColDrop(e: React.DragEvent, target: "bench" | "notSelected") {
    e.preventDefault()
    const id = e.dataTransfer.getData("jogadorId")
    const src = e.dataTransfer.getData("source")
    if (!id) return
    if (target === "notSelected" && src !== "notSelected") onExclude(id)
    if (target === "bench" && src === "notSelected") onInclude(id)
  }

  return (
    <div className="flex h-full overflow-hidden" style={{ background: "linear-gradient(180deg,rgba(0,0,0,0.18) 0%,rgba(0,0,0,0.04) 100%)" }}>

      {/* ── XI INICIAL — coluna única, preenche altura ── */}
      <div className="w-[145px] shrink-0 overflow-hidden p-2 flex flex-col">
        <div className="flex items-center gap-1.5 mb-1.5 pb-1 shrink-0" style={{ borderBottom: "1px solid rgba(0,214,108,0.22)" }}>
          <div className="w-1 h-3 rounded-full bg-[#00D66C]" style={{ boxShadow: "0 0 6px #00D66C" }} />
          <span className="text-[7px] font-black uppercase tracking-[0.22em] text-[#00D66C]/80">XI Inicial</span>
          <span className="ml-auto text-[7px] font-mono text-[#00D66C]/50">{starters.length}/11</span>
        </div>
        <div className="flex flex-col flex-1 justify-between">
          {starters.map(({ slot, jogador: j }) => (
            <StarterRow key={slot.posicao} slot={slot} j={j} />
          ))}
          {starters.length === 0 && (
            <div className="text-[8px] text-muted-foreground/30 text-center py-6 px-2">
              Arrasta jogadores para o campo
            </div>
          )}
        </div>
      </div>

      {/* Divider */}
      <div className="w-px shrink-0" style={{ background: "linear-gradient(to bottom,transparent,rgba(255,255,255,0.09),transparent)" }} />

      {/* ── BANCO — 1 coluna, drop zone ── */}
      <div
        className="w-[145px] shrink-0 overflow-hidden p-1.5 flex flex-col"
        onDrop={e => handleColDrop(e, "bench")}
        onDragOver={e => e.preventDefault()}
      >
        <div className="flex items-center gap-1 mb-1.5 pb-1 shrink-0" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <div className="w-1 h-2.5 rounded-full" style={{ background: "rgba(255,255,255,0.3)" }} />
          <span className="text-[7px] font-black uppercase tracking-[0.15em] text-white/40">Banco</span>
          <span className="ml-auto text-[7px] font-mono text-white/25">{bench.length}</span>
        </div>
        <div className="flex flex-col flex-1 justify-between">
          {bench.map(j => (
            <PlayerRow key={j.id} j={j} source="bench" onRowExclude={() => onExclude(j.id)} />
          ))}
          {bench.length === 0 && (
            <div className="text-[7px] text-muted-foreground/30 text-center py-3">—</div>
          )}
        </div>
      </div>

      {/* Divider */}
      <div className="w-px shrink-0" style={{ background: "linear-gradient(to bottom,transparent,rgba(255,80,80,0.2),transparent)" }} />

      {/* ── NOT SELECTED — 1 coluna, drop zone ── */}
      <div
        className="w-[145px] shrink-0 overflow-hidden p-1.5 flex flex-col"
        onDrop={e => handleColDrop(e, "notSelected")}
        onDragOver={e => e.preventDefault()}
      >
        <div className="flex items-center gap-1 mb-1.5 pb-1 shrink-0" style={{ borderBottom: "1px solid rgba(255,50,50,0.2)" }}>
          <div className="w-1 h-2.5 rounded-full" style={{ background: "rgba(255,80,80,0.5)" }} />
          <span className="text-[7px] font-black uppercase tracking-[0.15em]" style={{ color: "rgba(255,80,80,0.7)" }}>Not Selected</span>
          <span className="ml-auto text-[7px] font-mono" style={{ color: "rgba(255,80,80,0.4)" }}>{notSelected.length}</span>
        </div>
        <div className="flex flex-col flex-1 justify-between">
          {notSelected.map(j => (
            <PlayerRow key={j.id} j={j} source="notSelected" onRowInclude={() => onInclude(j.id)} />
          ))}
          {notSelected.length === 0 && (
            <div className="text-[7px] text-center py-3" style={{ color: "rgba(255,80,80,0.3)" }}>—</div>
          )}
        </div>
      </div>

    </div>
  )
}

// ─── Horizontal Bench Panel ───────────────────────────────────────────────────

function HorizontalBenchPanel({ jogadores, tatica, onUnassign }: {
  jogadores: Jogador[]
  tatica: TacticaConfig
  onUnassign: (jogadorId: string) => void
}) {
  const assignedIds = new Set(tatica.titulares.map(s => s.jogadorId).filter(Boolean))
  const SETOR_ORDER: Record<string, number> = { GR: 0, DEF: 1, MED: 2, AV: 3 }
  const starters = tatica.titulares.filter(s => s.jogadorId).map(slot => ({
    slot,
    jogador: jogadores.find(p => p.id === slot.jogadorId) ?? null,
  })).filter(s => s.jogador !== null) as { slot: typeof tatica.titulares[0]; jogador: Jogador }[]
  const bench = jogadores
    .filter(j => !assignedIds.has(j.id))
    .sort((a, b) => {
      const sa = SETOR_ORDER[getPrimarySetor(a.posicoes as Parameters<typeof getPrimarySetor>[0])] ?? 3
      const sb = SETOR_ORDER[getPrimarySetor(b.posicoes as Parameters<typeof getPrimarySetor>[0])] ?? 3
      return sa - sb
    })

  return (
    <div className="flex gap-3 px-3 py-2">
      {/* Em Campo */}
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-[8px] font-black uppercase tracking-wider shrink-0" style={{ color: "#00D66C" }}>
          Em Campo <span className="opacity-60">{starters.length}</span>
        </span>
        <div className="flex flex-wrap gap-1">
          {starters.map(({ slot, jogador: j }) => {
            const color = sectorColor(j.posicoes)
            return (
              <div key={slot.posicao} draggable
                onDragStart={e => { e.dataTransfer.setData("jogadorId", j.id); onUnassign(j.id) }}
                className="w-8 h-8 rounded-full cursor-grab shrink-0 overflow-hidden border"
                style={{ borderColor: color + "66" }}
                title={`${displayName(j)} (${j.posicoes[0]})`}>
                {j.foto
                  // eslint-disable-next-line @next/next/no-img-element
                  ? <img src={j.foto} alt={displayName(j)} className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center text-[9px] font-bold"
                      style={{ background: color + "33", color }}>{j.numero}</div>}
              </div>
            )
          })}
          {starters.length === 0 && <span className="text-[8px] text-muted-foreground/30 italic">—</span>}
        </div>
      </div>
      <div className="w-px bg-border/20 self-stretch shrink-0" />
      {/* Bench */}
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-[8px] font-black uppercase tracking-wider text-muted-foreground/50 shrink-0">
          Bench <span className="text-muted-foreground/30">{bench.length}</span>
        </span>
        <div className="flex flex-wrap gap-1">
          {bench.map(j => {
            const color = sectorColor(j.posicoes)
            return (
              <div key={j.id} draggable
                onDragStart={e => e.dataTransfer.setData("jogadorId", j.id)}
                className="w-7 h-7 rounded-full cursor-grab shrink-0 overflow-hidden border"
                style={{ borderColor: color + "44" }}
                title={`${displayName(j)} (${j.posicoes[0]})`}>
                {j.foto
                  // eslint-disable-next-line @next/next/no-img-element
                  ? <img src={j.foto} alt={displayName(j)} className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center text-[8px] font-bold"
                      style={{ background: color + "22", color }}>{j.numero}</div>}
              </div>
            )
          })}
          {bench.length === 0 && <span className="text-[8px] text-muted-foreground/30 italic">—</span>}
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

// ─── TBtn ─────────────────────────────────────────────────────────────────────

function TBtn({ active, color, onClick, children }: {
  active: boolean; color: string; onClick: () => void; children: React.ReactNode
}) {
  return (
    <button onClick={onClick}
      className="px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all"
      style={active
        ? { background: color + "25", borderColor: color, color, boxShadow: `0 0 10px ${color}55` }
        : { borderColor: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.4)", background: "rgba(255,255,255,0.03)" }}>
      {children}
    </button>
  )
}

// ─── Formation Shape Mini SVG ─────────────────────────────────────────────────

function FormationShape({ formation }: { formation: string }) {
  const slots = computeSlotPositions(formation, "balanced", { attackingWidth: "medium", centralBacksOpen: false, fullbacksPosition: "low", wingersPosition: "open", strikerMovement: "center" })
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
        className="flex items-center gap-1.5 h-7 px-3 rounded-lg border border-border/40 bg-background/60 hover:bg-background/90 transition-all"
      >
        <span className="text-[10px] font-black uppercase tracking-wider">Formation</span>
        <span className="text-[10px] font-mono text-muted-foreground">{value}</span>
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

// ─── Mini Pitch SVG (Construction Phases) ─────────────────────────────────────

function MiniPitchSVG({ tatica, jogadores, overrides, onUpdateOverrides }: {
  tatica: TacticaConfig
  jogadores: Jogador[]
  overrides: Record<string, { x: number; y: number }>
  onUpdateOverrides: (o: Record<string, { x: number; y: number }>) => void
}) {
  const svgRef = useRef<SVGSVGElement>(null)
  const draggingRef = useRef<string | null>(null)
  const slotPositions = computeSlotPositions(tatica.formacao, tatica.mentalidade, tatica, overrides)
  const scale = 1.0

  function svgCoords(e: React.PointerEvent): { x: number; y: number } {
    const svg = svgRef.current
    if (!svg) return { x: 0, y: 0 }
    const rect = svg.getBoundingClientRect()
    return {
      x: (e.clientX - rect.left) * (510 / rect.width),
      y: (e.clientY - rect.top) * (780 / rect.height),
    }
  }

  return (
    <div className="relative w-full h-full">
      <svg ref={svgRef} viewBox="0 0 510 780" className="w-full h-full"
        style={{ touchAction: "none", display: "block" }}
        onPointerDown={e => {
          const pos = svgCoords(e)
          const pinR = (20 * scale) + 8
          const hit = slotPositions.find(s => Math.sqrt((pos.x - s.x) ** 2 + (pos.y - s.y) ** 2) < pinR)
          if (hit) {
            e.preventDefault()
            draggingRef.current = hit.slotKey
            e.currentTarget.setPointerCapture(e.pointerId)
          }
        }}
        onPointerMove={e => {
          if (!draggingRef.current) return
          const pos = svgCoords(e)
          const clamped = { x: Math.max(30, Math.min(480, pos.x)), y: Math.max(30, Math.min(750, pos.y)) }
          onUpdateOverrides({ ...overrides, [draggingRef.current]: clamped })
        }}
        onPointerUp={() => { draggingRef.current = null }}>
        {/* Imagem dentro do SVG — campo completo */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <image href="/23.png" x="0" y="0" width="510" height="780" preserveAspectRatio="xMidYMid meet" />
        <rect x="0" y="0" width="510" height="780" fill="rgba(0,0,0,0.06)" />
        {slotPositions.map(slot => {
          const color = sectorColorByRow(slot.row)
          const isGK = slot.row === 5
          const titular = tatica.titulares.find(s => s.posicao === slot.slotKey)
          const jogador = titular?.jogadorId ? jogadores.find(j => j.id === titular.jogadorId) ?? null : null
          const R = 20 * scale
          return (
            <g key={slot.slotKey} transform={`translate(${slot.x},${slot.y})`} style={{ cursor: "grab" }}>
              <circle r={R} fill={isGK ? "#111111" : color + "99"} stroke={color} strokeWidth={2} />
              <text textAnchor="middle" dominantBaseline="central"
                fill={isGK ? "white" : color} fontSize={jogador?.alcunha ? 7 * scale : 9 * scale} fontWeight="800"
                style={{ pointerEvents: "none", userSelect: "none" }}>
                {jogador ? (jogador.alcunha?.substring(0, 6) ?? String(jogador.numero)) : slot.label}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}

// ─── Construction Phases Column ───────────────────────────────────────────────

function ConstructionPhasesColumn({ tatica, jogadores, onUpdate }: {
  tatica: TacticaConfig
  jogadores: Jogador[]
  onUpdate: (p: Partial<TacticaConfig>) => void
}) {
  const phases: { label: string; key: "phase1Overrides" | "phase2Overrides" | "phase3Overrides" }[] = [
    { label: "1st Phase of Construction", key: "phase1Overrides" },
    { label: "2nd Phase of Construction", key: "phase2Overrides" },
    { label: "3rd Phase of Construction", key: "phase3Overrides" },
  ]
  return (
    <div className="w-[200px] shrink-0 border-r border-border/20 flex flex-col overflow-hidden">
      {phases.map(({ label, key }) => (
        <div key={key} className="flex-1 min-h-0 flex flex-col border-b border-border/10 last:border-b-0">
          <div className="shrink-0 px-2 py-1 text-center">
            <span className="text-[8px] font-black uppercase tracking-widest text-[#00D66C]/70">{label}</span>
          </div>
          <div className="flex-1 min-h-0 flex items-center justify-center p-1">
            <div style={{ height: "100%", aspectRatio: "510/390" }} className="relative overflow-hidden rounded-sm">
              <MiniPitchSVG
                tatica={tatica}
                jogadores={jogadores}
                overrides={tatica[key] ?? {}}
                onUpdateOverrides={o => onUpdate({ [key]: o })}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Left Tactics Panel ───────────────────────────────────────────────────────

function AttackingWidthSlider({ value, onChange }: {
  value: TacticaConfig["attackingWidth"]
  onChange: (v: TacticaConfig["attackingWidth"]) => void
}) {
  const steps: TacticaConfig["attackingWidth"][] = ["low", "medium", "maximum"]
  const colors = { maximum: "#FF2222", medium: "#00D66C", low: "#0066FF" }
  const labels = { maximum: "Maximum", medium: "Medium", low: "Low" }
  const idx = steps.indexOf(value)
  const color = colors[value]
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex justify-between items-center">
        <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground/60">Attacking Width</span>
        <span className="text-[11px] font-bold" style={{ color }}>{labels[value]}</span>
      </div>
      {/* Track */}
      <div className="relative h-5 flex items-center px-2">
        <div className="w-full h-0.5 bg-border/30 rounded-full relative">
          <div className="absolute inset-y-0 left-0 rounded-full transition-all"
            style={{ width: `${(idx / 2) * 100}%`, background: color }} />
        </div>
        {/* Stops */}
        {steps.map((s, i) => (
          <button key={s}
            onClick={() => onChange(s)}
            className="absolute w-3.5 h-3.5 rounded-full border-2 transition-all -translate-x-1/2"
            style={{
              left: `${i * 50}%`,
              borderColor: s === value ? color : "rgba(255,255,255,0.2)",
              background: s === value ? color : "rgba(15,15,20,0.9)",
              boxShadow: s === value ? `0 0 8px ${color}88` : "none",
            }}
          />
        ))}
      </div>
      <div className="flex justify-between px-1">
        {steps.map(s => (
          <span key={s} className="text-[7px] text-muted-foreground/40">{labels[s]}</span>
        ))}
      </div>
    </div>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground/50 mb-1">
      {children}
    </div>
  )
}

function TRow({ children }: { children: React.ReactNode }) {
  return <div className="flex gap-1 flex-wrap">{children}</div>
}

function MentalityDropdown({ value, onChange }: {
  value: TacticaConfig["mentalidade"]
  onChange: (v: TacticaConfig["mentalidade"]) => void
}) {
  const [open, setOpen] = useState(false)
  const opt = MENTALITY_OPTIONS.find(o => o.value === value) ?? MENTALITY_OPTIONS[2]
  return (
    <div className="relative">
      <button
        onClick={() => setOpen(p => !p)}
        className="flex items-center gap-1.5 h-8 px-3 rounded-lg border transition-all text-xs font-bold"
        style={{ borderColor: opt.color + "66", background: opt.color + "18", color: opt.color }}
      >
        <div className="w-2 h-2 rounded-full shrink-0" style={{ background: opt.color }} />
        <span>{opt.label}</span>
        <ChevronDown className="w-3 h-3 opacity-60" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full mt-1 z-50 rounded-xl p-1.5 min-w-[170px]"
            style={{ background: "#0d0f14", border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 8px 32px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04)" }}>
            {MENTALITY_OPTIONS.map(o => (
              <button key={o.value}
                onClick={() => { onChange(o.value); setOpen(false) }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all text-left"
                style={o.value === value
                  ? { background: o.color + "22", color: o.color }
                  : { color: "rgba(255,255,255,0.5)" }}
              >
                <div className="w-2 h-2 rounded-full shrink-0"
                  style={{ background: o.value === value ? o.color : "rgba(255,255,255,0.2)" }} />
                {o.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

function LeftTacticsPanel({ tatica, onUpdate, tab }: {
  tatica: TacticaConfig
  onUpdate: (p: Partial<TacticaConfig>) => void
  tab: TabMode
}) {
  return (
    <div className="w-[380px] shrink-0 border-r border-border/20 flex flex-col overflow-hidden">
      <div className="flex-1 min-h-0 px-2 py-2 flex flex-col gap-2 overflow-hidden">

        {/* ── Formation + Mentality ── */}
        <div className="flex flex-col gap-1.5">
          <SectionLabel>{tab === "ip" ? "In Possession" : "Out of Possession"}</SectionLabel>
          <div className="flex gap-2 flex-wrap">
            <FormationPickerDialog
              value={tab === "ip" ? tatica.formacao : (tatica.formacao_oop ?? tatica.formacao)}
              onChange={f => tab === "ip"
                ? onUpdate({ formacao: f, ipSlotOverrides: {} })
                : onUpdate({ formacao_oop: f, oopSlotOverrides: {} })}
            />
            <MentalityDropdown
              value={tab === "ip" ? tatica.mentalidade : (tatica.mentalidade_oop ?? "balanced")}
              onChange={v => tab === "ip"
                ? onUpdate({ mentalidade: v, ipSlotOverrides: {} })
                : onUpdate({ mentalidade_oop: v, oopSlotOverrides: {} })}
            />
          </div>
        </div>



      </div>
    </div>
  )
}

// ─── Main TacticsTab ──────────────────────────────────────────────────────────

type TabMode = "ip" | "oop"

export function TacticsTab() {
  const [jogadores, setJogadores] = useState<Jogador[]>([])
  const [tatica, setTatica] = useState<TacticaConfig>(getTatica())
  const [tab, setTab] = useState<TabMode>("ip")
  const [arrowType] = useState<TacticArrowType>("run")
  const fieldRef = useRef<HTMLDivElement>(null)
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

  function handleExclude(jogadorId: string) {
    update({ notSelected: [...(tatica.notSelected ?? []), jogadorId] })
  }

  function handleInclude(jogadorId: string) {
    update({ notSelected: (tatica.notSelected ?? []).filter(id => id !== jogadorId) })
  }

  async function handleExport() {
    const el = fieldRef.current
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
      <div className="flex items-center h-[42px] border-b border-border/20 shrink-0 px-3">
        {/* Tabs centralizados */}
        <div className="flex-1 flex justify-center gap-1">
          <button className={tabBtnClass(activeTab === "ip")}   onClick={() => setTab("ip")}>In Possession</button>
          <button className={tabBtnClass(activeTab === "oop")}  onClick={() => setTab("oop")}>Out of Possession</button>
        </div>
        {/* PNG + Reset à direita */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button onClick={handleExport}
            className="flex items-center gap-1 px-2 py-1 rounded border border-[#8B5CF6]/40 text-[#8B5CF6] hover:bg-[#8B5CF6]/10 transition-all"
            title="Exportar PNG">
            <Camera className="w-3.5 h-3.5" />
            <span className="text-[10px] font-semibold">PNG</span>
          </button>
          <button onClick={handleReset}
            className="flex items-center gap-1 px-2 py-1 rounded border border-red-500/40 text-red-400 hover:bg-red-500/10 transition-all"
            title="Reset">
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="text-[10px] font-semibold">Reset</span>
          </button>
        </div>
      </div>

      {/* ── MAIN AREA ── */}
      <div className="flex flex-1 min-h-0 overflow-hidden">

        {/* ── ESQUERDA: 3 fases juntas à esquerda ── */}
        <div className="shrink-0 flex flex-col border-r border-border/15">
          {/* Section label */}
          <div className="shrink-0 py-1 border-b border-border/10 text-center"
            style={{ background: "linear-gradient(to right, rgba(0,214,108,0.04), transparent)" }}>
            <span className="text-[7px] font-black uppercase tracking-widest text-[#00D66C]/60">
              {activeTab === "ip" ? "Offensive Organization | Construction Phases" : "Defensive Organization | Construction Phases"}
            </span>
          </div>
          {/* 3 mini campos lado a lado — com pequeno gap */}
          <div className="flex gap-[10px] p-2 items-start">

            {/* Phase 1 */}
            <div className="shrink-0 w-[175px] flex flex-col">
              <div className="shrink-0 py-1 text-center">
                <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: "#00D66C" }}>
                  1<sup>st</sup> Phase
                </span>
              </div>
              <div style={{ width: "100%", aspectRatio: "510/780" }} className="relative overflow-hidden rounded">
                <MiniPitchSVG tatica={tatica} jogadores={jogadores}
                  overrides={tatica.phase1Overrides ?? {}}
                  onUpdateOverrides={o => update({ phase1Overrides: o })} />
              </div>
            </div>

            {/* Phase 2 */}
            <div className="shrink-0 w-[175px] flex flex-col">
              <div className="shrink-0 py-1 text-center">
                <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: "#00D66C" }}>
                  2<sup>nd</sup> Phase
                </span>
              </div>
              <div style={{ width: "100%", aspectRatio: "510/780" }} className="relative overflow-hidden rounded">
                <MiniPitchSVG tatica={tatica} jogadores={jogadores}
                  overrides={tatica.phase2Overrides ?? {}}
                  onUpdateOverrides={o => update({ phase2Overrides: o })} />
              </div>
            </div>

            {/* Phase 3 */}
            <div className="shrink-0 w-[175px] flex flex-col">
              <div className="shrink-0 py-1 text-center">
                <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: "#00D66C" }}>
                  3<sup>rd</sup> Phase
                </span>
              </div>
              <div style={{ width: "100%", aspectRatio: "510/780" }} className="relative overflow-hidden rounded">
                <MiniPitchSVG tatica={tatica} jogadores={jogadores}
                  overrides={tatica.phase3Overrides ?? {}}
                  onUpdateOverrides={o => update({ phase3Overrides: o })} />
              </div>
            </div>

          </div>
        </div>

        {/* Gap entre phases e formation (~2.5cm) */}
        <div className="w-24 shrink-0" />

        {/* ── CENTRO-DIREITA: Formation field ── */}
        <div className="w-[260px] shrink-0 flex flex-col">
          {/* Controlos acima do campo */}
          <div className="shrink-0 flex flex-row items-center gap-2 px-2 pt-2 pb-1.5 border-b border-border/15 flex-wrap">
            <FormationPickerDialog
              value={tab === "ip" ? tatica.formacao : (tatica.formacao_oop ?? tatica.formacao)}
              onChange={f => tab === "ip"
                ? update({ formacao: f, ipSlotOverrides: {} })
                : update({ formacao_oop: f, oopSlotOverrides: {} })}
            />
            <MentalityDropdown
              value={tab === "ip" ? tatica.mentalidade : (tatica.mentalidade_oop ?? "balanced")}
              onChange={v => tab === "ip"
                ? update({ mentalidade: v, ipSlotOverrides: {} })
                : update({ mentalidade_oop: v, oopSlotOverrides: {} })}
            />
          </div>
          {/* Campo principal */}
          <div ref={fieldRef} className="flex-1 min-h-0">
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
          </div>
        </div>

        {/* ── DIREITA: XI + Bench + Not Selected ── */}
        <div className="shrink-0 flex flex-col overflow-hidden ml-12">
          <BenchPanel jogadores={jogadores} tatica={tatica} onUnassign={handleUnassign} onExclude={handleExclude} onInclude={handleInclude} />
        </div>

      </div>

      {/* Hidden uid usage to suppress lint warning */}
      <span className="hidden" aria-hidden>{uid}</span>
    </div>
  )
}
