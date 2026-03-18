"use client"

import React, { useState, useEffect, useRef, useCallback, useId } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Camera, RotateCcw, ChevronDown } from "lucide-react"
import {
  type Jogador, type TacticaConfig, type TacticArrow, type TacticArrowType,
  getJogadores, getTatica, saveTatica, getPrimarySetor, displayName,
} from "@/lib/storage/plantel"

// ─── Formações ────────────────────────────────────────────────────────────────

const FORMATION_POSITIONS: Record<string, { posicao: string; label: string; row: number; yOffset?: number }[]> = {
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
    { posicao: "WL",  label: "LW",  row: 2 }, { posicao: "WR",  label: "RW",  row: 2 },
    { posicao: "CF",  label: "CF",  row: 1 }, { posicao: "ST",  label: "ST",  row: 1 },
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
    { posicao: "WL",  label: "LW",  row: 2 }, { posicao: "WR",  label: "RW",  row: 2 },
    { posicao: "CF",  label: "CF",  row: 1 }, { posicao: "ST",  label: "ST",  row: 1 },
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
    { posicao: "WL",  label: "LW",  row: 2 }, { posicao: "WR",  label: "RW",  row: 2 },
    { posicao: "CF",  label: "CF",  row: 1 }, { posicao: "ST",  label: "ST",  row: 1 },
  ],
  "1-4-3-3": [
    { posicao: "GK",  label: "GK",  row: 5 },
    { posicao: "LB",  label: "LB",  row: 4 }, { posicao: "CBL", label: "CB",  row: 4 }, { posicao: "CBR", label: "CB",  row: 4 }, { posicao: "RB",  label: "RB",  row: 4 },
    { posicao: "CML", label: "LCM", row: 3 }, { posicao: "CDM", label: "CDM", row: 3, yOffset: 40 }, { posicao: "CMR", label: "RCM", row: 3 },
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

    // Wingers encostados à linha lateral
    const isPureLeftWinger  = ["WL","LW"].includes(lbl) || ["WL","LW"].includes(posKey)
    const isPureRightWinger = ["WR","RW"].includes(lbl) || ["WR","RW"].includes(posKey)
    if (isPureLeftWinger)  baseX = 52
    if (isPureRightWinger) baseX = 458

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

    // Per-slot static Y offset (used to stagger positions within the same row)
    adjustedY += (p as { yOffset?: number }).yOffset ?? 0

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
    // Remove from notSelected when assigned to the XI
    const notSelected = jogadorId
      ? (tatica.notSelected ?? []).filter(id => id !== jogadorId)
      : tatica.notSelected
    onUpdate({ titulares: updated, notSelected })
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
    const nameColor = "rgba(255,255,255,0.88)"
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
        className="flex flex-col items-center gap-1 py-0.5 px-1 rounded cursor-grab active:cursor-grabbing select-none transition-all hover:bg-white/5"
        title={`${nickOf(j)} · ${j.posicoes[0]}`}
      >
        <div className="relative shrink-0" style={{ width: 30, height: 30 }}>
          {j.foto ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={j.foto} alt={nick} className="rounded-full object-cover w-full h-full"
              style={{ border: tk.circleBorder, boxShadow: tk.circleGlow }} />
          ) : (
            <div className="rounded-full w-full h-full flex items-center justify-center font-black"
              style={{ background: tk.circleBg, border: tk.circleBorder, boxShadow: tk.circleGlow, color: tk.numColor, fontSize: 10 }}>
              {j.numero}
            </div>
          )}
          <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 font-black rounded-sm px-0.5"
            style={{ background: tk.badgeBg, color: tk.badgeText, fontSize: 6, lineHeight: "10px", minWidth: 13, textAlign: "center" }}>
            {j.posicoes[0]}
          </div>
        </div>
        <span className="text-[8px] font-semibold text-center leading-tight truncate w-full"
          style={{ color: tk.nameColor }}>{nick}</span>
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
    return (
      <div
        draggable
        onDragStart={e => {
          e.dataTransfer.setData("jogadorId", j.id)
          e.dataTransfer.setData("source", source)
        }}
        className="flex flex-col items-center gap-1 py-0.5 px-1 rounded cursor-grab active:cursor-grabbing select-none transition-all hover:bg-white/5 group"
        title={`${nickOf(j)} · ${j.posicoes[0]}`}
      >
        <div className="relative shrink-0" style={{ width: 30, height: 30 }}>
          {j.foto ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={j.foto} alt={nick} className="rounded-full object-cover w-full h-full"
              style={{ border: tk.circleBorder, boxShadow: tk.circleGlow }} />
          ) : (
            <div className="rounded-full w-full h-full flex items-center justify-center font-black"
              style={{ background: tk.circleBg, border: tk.circleBorder, boxShadow: tk.circleGlow, color: tk.numColor, fontSize: 10 }}>
              {j.numero}
            </div>
          )}
          <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 font-black rounded-sm px-0.5"
            style={{ background: tk.badgeBg, color: tk.badgeText, fontSize: 6, lineHeight: "10px", minWidth: 13, textAlign: "center" }}>
            {j.posicoes[0]}
          </div>
        </div>
        <span className="text-[8px] font-semibold text-center leading-tight truncate w-full"
          style={{ color: tk.nameColor }}>{nick}</span>
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
      <div className="w-[128px] shrink-0 overflow-hidden p-2 flex flex-col">
        <div className="flex items-center gap-1.5 mb-1.5 pb-1 shrink-0" style={{ borderBottom: "1px solid rgba(0,214,108,0.22)" }}>
          <div className="w-1 h-3 rounded-full bg-[#00D66C]" style={{ boxShadow: "0 0 6px #00D66C" }} />
          <span className="text-[7px] font-black uppercase tracking-[0.22em] text-[#00D66C]/80">Starting XI</span>
          <span className="ml-auto text-[7px] font-mono text-[#00D66C]/50">{starters.length}/11</span>
        </div>
        <div className="flex flex-col gap-1 overflow-y-auto">
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
        className="w-[128px] shrink-0 overflow-hidden p-1.5 flex flex-col"
        onDrop={e => handleColDrop(e, "bench")}
        onDragOver={e => e.preventDefault()}
      >
        <div className="flex items-center gap-1 mb-1.5 pb-1 shrink-0" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <div className="w-1 h-2.5 rounded-full" style={{ background: "rgba(255,255,255,0.3)" }} />
          <span className="text-[7px] font-black uppercase tracking-[0.15em] text-white/40">Bench</span>
          <span className="ml-auto text-[7px] font-mono text-white/25">{bench.length}</span>
        </div>
        <div className="flex flex-col gap-1 overflow-y-auto">
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

      {/* ── NOT SELECTED — 3 colunas, drop zone ── */}
      <div
        className="w-[255px] shrink-0 overflow-hidden p-1.5 flex flex-col"
        onDrop={e => handleColDrop(e, "notSelected")}
        onDragOver={e => e.preventDefault()}
      >
        <div className="flex items-center gap-1 mb-1.5 pb-1 shrink-0" style={{ borderBottom: "1px solid rgba(255,50,50,0.2)" }}>
          <div className="w-1 h-2.5 rounded-full" style={{ background: "rgba(255,80,80,0.5)" }} />
          <span className="text-[7px] font-black uppercase tracking-[0.15em]" style={{ color: "rgba(255,80,80,0.7)" }}>Not Selected</span>
          <span className="ml-auto text-[7px] font-mono" style={{ color: "rgba(255,80,80,0.4)" }}>{notSelected.length}</span>
        </div>
        <div className="grid grid-cols-3 gap-0.5 content-start overflow-y-auto">
          {notSelected.map(j => (
            <PlayerRow key={j.id} j={j} source="notSelected" onRowInclude={() => onInclude(j.id)} />
          ))}
          {notSelected.length === 0 && (
            <div className="col-span-3 text-[7px] text-center py-3" style={{ color: "rgba(255,80,80,0.3)" }}>—</div>
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
  { value: "balanced",        label: "Balanced",         color: "#00BFFF", short: "BAL"   },
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

function FormationPickerDialog({ value, onChange, sidebar = false }: {
  value: string
  onChange: (f: string) => void
  sidebar?: boolean
}) {
  const [open, setOpen] = useState(false)
  return (
    <>
      {sidebar ? (
        <button onClick={() => setOpen(true)}
          className="flex flex-col items-center gap-1.5 py-4 px-1 w-full transition-all hover:bg-white/[0.06] group">
          <span className="text-[7px] font-black uppercase tracking-[0.18em]" style={{ color: "rgba(255,255,255,0.5)" }}>Formation</span>
          <div className="flex flex-col items-center gap-[3px] my-1">
            {value.split("-").map((seg, i) => (
              <span key={i} className="text-[13px] font-black font-mono leading-none"
                style={{ color: i === 0 ? "rgba(255,255,255,0.4)" : "#ffffff" }}>
                {seg}
              </span>
            ))}
          </div>
          <ChevronDown className="w-3 h-3" style={{ color: "rgba(255,255,255,0.4)" }} />
        </button>
      ) : (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all hover:bg-white/[0.12] active:scale-95"
        style={{ background: "rgba(255,255,255,0.08)", border: "1.5px dashed rgba(255,255,255,0.22)" }}
      >
        <span className="text-[13px] font-black font-mono" style={{ color: "#fff" }}>{value}</span>
        <ChevronDown className="w-3 h-3" style={{ color: "rgba(255,255,255,0.4)" }} />
      </button>
      )}
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

function MiniPitchSVG({ tatica, jogadores, overrides, onUpdateOverrides, formacaoOverride, mentalidadeOverride }: {
  tatica: TacticaConfig
  jogadores: Jogador[]
  overrides: Record<string, { x: number; y: number }>
  onUpdateOverrides: (o: Record<string, { x: number; y: number }>) => void
  formacaoOverride?: string
  mentalidadeOverride?: TacticaConfig["mentalidade"]
}) {
  const svgRef = useRef<SVGSVGElement>(null)
  const draggingRef = useRef<string | null>(null)
  const slotPositions = computeSlotPositions(
    formacaoOverride ?? tatica.formacao,
    mentalidadeOverride ?? tatica.mentalidade,
    tatica,
    overrides
  )
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
          const R = 24 * scale
          return (
            <g key={slot.slotKey} transform={`translate(${slot.x},${slot.y})`} style={{ cursor: "grab" }}>
              <circle r={R} fill={isGK ? "#111111" : color + "99"} stroke={color} strokeWidth={2} />
              <text textAnchor="middle" dominantBaseline="central"
                fill="white" fontSize={jogador?.alcunha ? 17 * scale : 18 * scale} fontWeight="900"
                fontFamily="Inter, system-ui, sans-serif"
                style={{ pointerEvents: "none", userSelect: "none" }}
                stroke="rgba(0,0,0,0.5)" strokeWidth={2 * scale} paintOrder="stroke">
                {jogador ? (jogador.alcunha?.substring(0, 6) ?? String(jogador.numero)) : slot.label}
              </text>
              {jogador && (
                <text textAnchor="middle" dominantBaseline="hanging"
                  y={28 * scale} fill="white" fontSize={13 * scale} fontWeight="700"
                  fontFamily="Inter, system-ui, sans-serif"
                  style={{ pointerEvents: "none", userSelect: "none" }}
                  stroke="rgba(0,0,0,0.8)" strokeWidth={4 * scale} paintOrder="stroke">
                  {(jogador.alcunha || jogador.nome?.split(" ").pop() || "").substring(0, 10)}
                </text>
              )}
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

function MentalityDropdown({ value, onChange, sidebar = false }: {
  value: TacticaConfig["mentalidade"]
  onChange: (v: TacticaConfig["mentalidade"]) => void
  sidebar?: boolean
}) {
  const [open, setOpen] = useState(false)
  const opt = MENTALITY_OPTIONS.find(o => o.value === value) ?? MENTALITY_OPTIONS[2]
  return (
    <div className="relative">
      {sidebar ? (
        <button onClick={() => setOpen(p => !p)}
          className="flex flex-col items-center gap-1.5 py-4 px-1 w-full transition-all hover:bg-white/[0.06]">
          <span className="text-[7px] font-black uppercase tracking-[0.18em]" style={{ color: "rgba(255,255,255,0.5)" }}>Mentality</span>
          <div className="w-2.5 h-2.5 rounded-full my-1" style={{ background: opt.color, boxShadow: `0 0 8px ${opt.color}99` }} />
          <span className="text-[9px] font-bold text-center leading-tight" style={{ color: opt.color }}>{opt.label}</span>
          <ChevronDown className="w-3 h-3 mt-1" style={{ color: opt.color + "88" }} />
        </button>
      ) : (
        <button
          onClick={() => setOpen(p => !p)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all hover:bg-white/[0.12] active:scale-95"
          style={{ background: "rgba(255,255,255,0.08)", border: "1.5px dashed rgba(255,255,255,0.22)" }}
        >
          <span className="text-[13px] font-bold" style={{ color: "#fff" }}>{opt.label}</span>
          <ChevronDown className="w-3 h-3" style={{ color: "rgba(255,255,255,0.4)" }} />
        </button>
      )}
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className={`absolute z-50 rounded-xl p-1.5 min-w-[170px] ${sidebar ? "left-full top-0 ml-1" : "left-0 top-full mt-1"}`}
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

// ─── Strategy helpers ─────────────────────────────────────────────────────────

type StrategyData = NonNullable<TacticaConfig["strategy"]>

function getDefaultStrategy(): StrategyData {
  return {
    playingStyle: [],
    pressingIntensity: "mid",
    pressingTriggers: "",
    buildUpGK: "",
    buildUpCB: "",
    buildUpMF: "",
    attackingPrinciples: [],
    attackingTriggers: "",
    defensiveLine: "medium",
    offsideTrap: false,
    markingType: "zonal",
    defensiveInstructions: "",
    setpieceAttackCorners: "",
    setpieceAttackFreeKicks: "",
    setpieceDefenseCorners: "",
    setpieceDefenseFreeKicks: "",
    transitionToDefenseType: [],
    transitionToDefenseNotes: "",
    transitionToAttackType: [],
    transitionToAttackNotes: "",
    opponentKeyPlayers: "",
    matchNotes: "",
  }
}

// ─── StrategyPanel ────────────────────────────────────────────────────────────

function StrategyPanel({ strat, onUpdate }: {
  strat: StrategyData
  onUpdate: (partial: Partial<StrategyData>) => void
}) {
  const s = { ...getDefaultStrategy(), ...strat }

  function toggleArr<K extends keyof StrategyData>(key: K, val: string) {
    const arr = (s[key] as string[]) ?? []
    onUpdate({ [key]: arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val] } as Partial<StrategyData>)
  }

  // Chip toggle button
  function Chip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
    return (
      <button onClick={onClick}
        className="px-2 py-0.5 rounded-full text-[9px] font-bold border transition-all"
        style={active
          ? { background: "#FF6B35", borderColor: "#FF6B35", color: "#000" }
          : { background: "transparent", borderColor: "rgba(255,107,53,0.35)", color: "rgba(255,107,53,0.7)" }}>
        {label}
      </button>
    )
  }

  // 3-option toggle
  function Toggle3<T extends string>({ value, options, onChange, color }: {
    value: T; options: { value: T; label: string }[]; onChange: (v: T) => void; color: string
  }) {
    return (
      <div className="flex gap-1">
        {options.map(o => (
          <button key={o.value} onClick={() => onChange(o.value)}
            className="px-2 py-0.5 rounded text-[9px] font-bold border transition-all"
            style={value === o.value
              ? { background: color + "30", borderColor: color, color }
              : { background: "transparent", borderColor: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.4)" }}>
            {o.label}
          </button>
        ))}
      </div>
    )
  }

  function Card({ title, color, children }: { title: string; color: string; children: React.ReactNode }) {
    return (
      <div className="rounded-xl border border-border/20 bg-background/40 backdrop-blur p-3 flex flex-col gap-2"
        style={{ borderColor: color + "25" }}>
        <div className="text-[8px] font-black uppercase tracking-widest" style={{ color }}>{title}</div>
        {children}
      </div>
    )
  }

  function Area({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
    return (
      <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="w-full rounded-lg border border-border/20 bg-background/60 px-2 py-1.5 text-[10px] text-foreground/80
          placeholder:text-muted-foreground/40 resize-none focus:outline-none focus:border-[#FF6B35]/40 transition-all"
        rows={3} />
    )
  }

  return (
    <div className="flex-1 min-h-0 overflow-y-auto p-4">
      <div className="grid grid-cols-3 gap-3 max-w-[1200px]">

        {/* ── Match Setup ── */}
        <div className="col-span-3">
          <Card title="Match Setup" color="#FF6B35">
            <div className="flex flex-wrap gap-1.5 items-center">
              <span className="text-[8px] text-muted-foreground/60 mr-1">Playing Style:</span>
              {["Possession", "Counter-attack", "High Press", "Direct Play", "Low Block", "Build-up", "Set Pieces"].map(v => (
                <Chip key={v} label={v} active={s.playingStyle.includes(v)} onClick={() => toggleArr("playingStyle", v)} />
              ))}
            </div>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-[8px] text-muted-foreground/60">Pressing Block:</span>
              <Toggle3
                value={s.pressingIntensity}
                options={[{ value: "high", label: "High Press" }, { value: "mid", label: "Mid Block" }, { value: "low", label: "Low Block" }]}
                onChange={v => onUpdate({ pressingIntensity: v })}
                color="#FF6B35"
              />
            </div>
          </Card>
        </div>

        {/* ── Build-up & Structure ── */}
        <Card title="Build-up & Structure" color="#00D66C">
          <label className="text-[8px] text-muted-foreground/50">GK Distribution</label>
          <Area value={s.buildUpGK} onChange={v => onUpdate({ buildUpGK: v })} placeholder="Short passes to CBs, play out from back..." />
          <label className="text-[8px] text-muted-foreground/50">CB / Defender Build-up</label>
          <Area value={s.buildUpCB} onChange={v => onUpdate({ buildUpCB: v })} placeholder="CBs split wide, carry ball if space..." />
          <label className="text-[8px] text-muted-foreground/50">Midfield Connections</label>
          <Area value={s.buildUpMF} onChange={v => onUpdate({ buildUpMF: v })} placeholder="6 drops deep, 8+10 rotate..." />
        </Card>

        {/* ── Attacking Principles ── */}
        <Card title="Attacking Principles" color="#FF2222">
          <div className="flex flex-wrap gap-1.5">
            {["Wide overloads", "Central combinations", "Direct forward runs", "Late arrivals in box", "Crosses", "1v1 duels", "Set piece variations"].map(v => (
              <Chip key={v} label={v} active={s.attackingPrinciples.includes(v)} onClick={() => toggleArr("attackingPrinciples", v)} />
            ))}
          </div>
          <label className="text-[8px] text-muted-foreground/50 mt-1">Key Attacking Triggers</label>
          <Area value={s.attackingTriggers} onChange={v => onUpdate({ attackingTriggers: v })} placeholder="Enter box with at least 3 players, switch play when..." />
        </Card>

        {/* ── Defensive Organization ── */}
        <Card title="Defensive Organization" color="#0066FF">
          <div className="flex items-center gap-3">
            <span className="text-[8px] text-muted-foreground/60">Defensive Line:</span>
            <Toggle3
              value={s.defensiveLine}
              options={[{ value: "low", label: "Deep" }, { value: "medium", label: "Mid" }, { value: "high", label: "High" }]}
              onChange={v => onUpdate({ defensiveLine: v })}
              color="#0066FF"
            />
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[8px] text-muted-foreground/60">Offside Trap:</span>
            <button onClick={() => onUpdate({ offsideTrap: !s.offsideTrap })}
              className="px-2 py-0.5 rounded text-[9px] font-bold border transition-all"
              style={s.offsideTrap
                ? { background: "#0066FF30", borderColor: "#0066FF", color: "#0066FF" }
                : { background: "transparent", borderColor: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.4)" }}>
              {s.offsideTrap ? "ON" : "OFF"}
            </button>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[8px] text-muted-foreground/60">Marking:</span>
            <Toggle3
              value={s.markingType}
              options={[{ value: "zonal", label: "Zonal" }, { value: "man-to-man", label: "Man-to-Man" }, { value: "mixed", label: "Mixed" }]}
              onChange={v => onUpdate({ markingType: v })}
              color="#0066FF"
            />
          </div>
          <Area value={s.defensiveInstructions} onChange={v => onUpdate({ defensiveInstructions: v })} placeholder="Press triggers: back pass to GK, lateral pass to CB..." />
        </Card>

        {/* ── Set Pieces Attack ── */}
        <Card title="Set Pieces · Attack" color="#8B5CF6">
          <label className="text-[8px] text-muted-foreground/50">Corners</label>
          <Area value={s.setpieceAttackCorners} onChange={v => onUpdate({ setpieceAttackCorners: v })} placeholder="Near-post run, far-post runner, short corner option..." />
          <label className="text-[8px] text-muted-foreground/50">Free Kicks</label>
          <Area value={s.setpieceAttackFreeKicks} onChange={v => onUpdate({ setpieceAttackFreeKicks: v })} placeholder="Direct shot if <25m, layoff option, wall pass..." />
        </Card>

        {/* ── Set Pieces Defense ── */}
        <Card title="Set Pieces · Defense" color="#8B5CF6">
          <label className="text-[8px] text-muted-foreground/50">Corners</label>
          <Area value={s.setpieceDefenseCorners} onChange={v => onUpdate({ setpieceDefenseCorners: v })} placeholder="Zonal marking, 2 on posts, 1 at edge..." />
          <label className="text-[8px] text-muted-foreground/50">Free Kicks</label>
          <Area value={s.setpieceDefenseFreeKicks} onChange={v => onUpdate({ setpieceDefenseFreeKicks: v })} placeholder="Wall of 4+1, GK commands crosses..." />
        </Card>

        {/* ── Transition to Defense ── */}
        <Card title="Transition · Attack → Defense" color="#FF8C00">
          <div className="flex flex-wrap gap-1.5">
            {["Immediate Press", "Delay & Reorganize", "Drop to Shape", "Counter-press 5s"].map(v => (
              <Chip key={v} label={v} active={s.transitionToDefenseType.includes(v)} onClick={() => toggleArr("transitionToDefenseType", v)} />
            ))}
          </div>
          <Area value={s.transitionToDefenseNotes} onChange={v => onUpdate({ transitionToDefenseNotes: v })} placeholder="When losing ball in final third, 2 players press immediately..." />
        </Card>

        {/* ── Transition to Attack ── */}
        <Card title="Transition · Defense → Attack" color="#FF8C00">
          <div className="flex flex-wrap gap-1.5">
            {["Direct / Fast", "Controlled Build-up", "Switch Play", "Long Ball Forward"].map(v => (
              <Chip key={v} label={v} active={s.transitionToAttackType.includes(v)} onClick={() => toggleArr("transitionToAttackType", v)} />
            ))}
          </div>
          <Area value={s.transitionToAttackNotes} onChange={v => onUpdate({ transitionToAttackNotes: v })} placeholder="Win ball → look forward immediately, if not available recycle..." />
        </Card>

        {/* ── Opponent Key Players ── */}
        <Card title="Opponent Key Threats" color="#CC00FF">
          <textarea value={s.opponentKeyPlayers} onChange={e => onUpdate({ opponentKeyPlayers: e.target.value })}
            placeholder="#10 — creative, man-mark with DM&#10;#9 — physical, don't give space behind CBs&#10;#7 — pace on right flank, double up..."
            className="w-full rounded-lg border border-border/20 bg-background/60 px-2 py-1.5 text-[10px] text-foreground/80
              placeholder:text-muted-foreground/40 resize-none focus:outline-none focus:border-[#CC00FF]/40 transition-all"
            rows={6} />
        </Card>

        {/* ── Pressing Triggers ── */}
        <Card title="Pressing Triggers" color="#00D66C">
          <Area value={s.pressingTriggers} onChange={v => onUpdate({ pressingTriggers: v })} placeholder="Back pass to GK, CB receives under pressure, long ball clearance, throw-in in our half..." />
        </Card>

        {/* ── Match Notes ── */}
        <div className="col-span-3">
          <Card title="Match Notes" color="#FF6B35">
            <textarea value={s.matchNotes} onChange={e => onUpdate({ matchNotes: e.target.value })}
              placeholder="Pre-match briefing notes, weather conditions, key messages to the team..."
              className="w-full rounded-lg border border-border/20 bg-background/60 px-2 py-1.5 text-[10px] text-foreground/80
                placeholder:text-muted-foreground/40 resize-none focus:outline-none focus:border-[#FF6B35]/40 transition-all"
              rows={4} />
          </Card>
        </div>

      </div>
    </div>
  )
}

// ─── Main TacticsTab ──────────────────────────────────────────────────────────

type TabMode = "overview" | "ip" | "oop" | "strategy"

export function TacticsTab() {
  const [jogadores, setJogadores] = useState<Jogador[]>([])
  const [tatica, setTatica] = useState<TacticaConfig>(getTatica())
  const [tab, setTab] = useState<TabMode>("overview")
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
    const svg = el.querySelector("svg")
    if (!svg) return
    try {
      const OUT_W = 510, OUT_H = 780
      const out = document.createElement("canvas")
      out.width = OUT_W
      out.height = OUT_H
      const ctx = out.getContext("2d")!

      // 1. Draw field image directly (reliable, no base64 needed)
      await new Promise<void>((resolve, reject) => {
        const fieldImg = new window.Image()
        fieldImg.onload = () => { ctx.drawImage(fieldImg, 0, 0, OUT_W, OUT_H); resolve() }
        fieldImg.onerror = reject
        fieldImg.src = "/23.png"
      })

      // 2. Draw SVG pins on top (remove <image> bg to avoid double render)
      const clone = svg.cloneNode(true) as SVGElement
      clone.setAttribute("width", String(OUT_W))
      clone.setAttribute("height", String(OUT_H))
      clone.querySelector("image")?.remove()
      const svgBlobUrl = URL.createObjectURL(
        new Blob([new XMLSerializer().serializeToString(clone)], { type: "image/svg+xml" })
      )
      await new Promise<void>((resolve, reject) => {
        const svgImg = new window.Image()
        svgImg.onload = () => { ctx.drawImage(svgImg, 0, 0, OUT_W, OUT_H); URL.revokeObjectURL(svgBlobUrl); resolve() }
        svgImg.onerror = reject
        svgImg.src = svgBlobUrl
      })

      const link = document.createElement("a")
      link.download = `tatica-${tatica.formacao}-${tab}.png`
      link.href = out.toDataURL("image/png")
      link.click()
    } catch (e) {
      console.warn("Export failed", e)
    }
  }

  function handleReset() {
    if (!confirm("Mover todos os jogadores para Not Selected?")) return
    update({
      titulares: [],
      ipSlotOverrides: {},
      oopSlotOverrides: {},
      notSelected: jogadores.map(j => j.id),
    })
  }

  // Non-narrowed tab reference
  const activeTab = tab as string

  // Tab button helper with per-tab accent colors
  const TAB_COLORS: Record<string, string> = {
    overview: "#8B5CF6",
    ip: "#00D66C",
    oop: "#0066FF",
    strategy: "#FF6B35",
  }
  function tabBtn(label: string, tabName: TabMode) {
    const active = activeTab === tabName
    const color = TAB_COLORS[tabName]
    return (
      <button key={tabName} onClick={() => setTab(tabName)}
        className="px-3 py-1.5 text-[11px] font-bold rounded-lg border transition-all"
        style={active
          ? { color, borderColor: color, backgroundColor: color + "20" }
          : { borderColor: "rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.45)" }}>
        {label}
      </button>
    )
  }

  // Strategy state helper
  const strat = tatica.strategy ?? {}
  function updateStrategy(partial: Partial<NonNullable<TacticaConfig["strategy"]>>) {
    update({ strategy: { ...getDefaultStrategy(), ...strat, ...partial } })
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* ── TOP BAR ── */}
      <div className="flex items-center h-[42px] border-b border-border/20 shrink-0 px-3">
        <div className="flex-1 flex justify-center gap-1">
          {tabBtn("Overview", "overview")}
          {tabBtn("Offensive Organization", "ip")}
          {tabBtn("Defensive Organization", "oop")}
          {tabBtn("Strategy", "strategy")}
        </div>
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

      {/* ── OVERVIEW ── Formation + Players ── */}
      {activeTab === "overview" && (
        <div className="flex flex-1 min-h-0 overflow-x-auto">
          <div className="flex m-auto min-w-fit items-stretch">
          {/* Campo + controlos acima */}
          <div className="shrink-0 flex flex-col">
            {/* Barra de controlos */}
            <div className="h-9 shrink-0 flex items-center gap-2 px-2"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
              <MentalityDropdown
                value={tatica.mentalidade}
                onChange={v => update({ mentalidade: v, ipSlotOverrides: {} })}
              />
              <FormationPickerDialog
                value={tatica.formacao}
                onChange={f => update({ formacao: f, ipSlotOverrides: {} })}
              />
            </div>
            {/* Campo */}
            <div ref={fieldRef} className="w-[280px] flex-1">
              <PitchSVG tatica={tatica} jogadores={jogadores} onUpdate={update} mode="ip"
                selectedArrowType={arrowType}
                slotOverridesForMode={tatica.ipSlotOverrides ?? {}}
                onUpdateOverrides={overrides => update({ ipSlotOverrides: overrides })}
                slotLabelOverridesForMode={tatica.ipSlotLabelOverrides ?? {}}
                onUpdateLabelOverrides={o => update({ ipSlotLabelOverrides: o })} />
            </div>
          </div>
          {/* Painéis XI / Bench / Not Selected — pt-9 alinha com topo do campo */}
          <div className="shrink-0 flex flex-col overflow-hidden ml-20 pt-9">
            <BenchPanel jogadores={jogadores} tatica={tatica}
              onUnassign={handleUnassign} onExclude={handleExclude} onInclude={handleInclude} />
          </div>
          </div>
        </div>
      )}

      {/* ── OFFENSIVE ORGANIZATION ── 3 Offensive Construction Phases ── */}
      {activeTab === "ip" && (
        <div className="flex flex-1 min-h-0 overflow-hidden">
          <div className="flex flex-col p-4">
            <div className="shrink-0 mb-2 text-center">
              <span className="text-[8px] font-black uppercase tracking-widest" style={{ color: "#00D66C" }}>
                Offensive Organization · Construction Phases
              </span>
            </div>
            <div className="flex gap-4 items-start">
              {(["phase1Overrides", "phase2Overrides", "phase3Overrides"] as const).map((key, i) => (
                <div key={key} className="shrink-0 w-[175px] flex flex-col">
                  <div className="shrink-0 py-1 text-center">
                    <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: "#00D66C" }}>
                      {i === 0 ? <>1<sup>st</sup></> : i === 1 ? <>2<sup>nd</sup></> : <>3<sup>rd</sup></>} Phase
                    </span>
                  </div>
                  <div style={{ width: "100%", aspectRatio: "510/780" }} className="relative overflow-hidden rounded">
                    <MiniPitchSVG tatica={tatica} jogadores={jogadores}
                      overrides={tatica[key] ?? {}}
                      onUpdateOverrides={o => update({ [key]: o })} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── DEFENSIVE ORGANIZATION ── 3 Defensive Construction Phases ── */}
      {activeTab === "oop" && (
        <div className="flex flex-1 min-h-0 overflow-hidden">
          <div className="flex flex-col p-4">
            <div className="shrink-0 mb-2 text-center">
              <span className="text-[8px] font-black uppercase tracking-widest" style={{ color: "#0066FF" }}>
                Defensive Organization · Construction Phases
              </span>
            </div>
            <div className="flex gap-4 items-start">
              {(["oop_phase1Overrides", "oop_phase2Overrides", "oop_phase3Overrides"] as const).map((key, i) => (
                <div key={key} className="shrink-0 w-[175px] flex flex-col">
                  <div className="shrink-0 py-1 text-center">
                    <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: "#0066FF" }}>
                      {i === 0 ? <>1<sup>st</sup></> : i === 1 ? <>2<sup>nd</sup></> : <>3<sup>rd</sup></>} Phase
                    </span>
                  </div>
                  <div style={{ width: "100%", aspectRatio: "510/780" }} className="relative overflow-hidden rounded">
                    <MiniPitchSVG tatica={tatica} jogadores={jogadores}
                      overrides={tatica[key] ?? {}}
                      onUpdateOverrides={o => update({ [key]: o })}
                      formacaoOverride={tatica.formacao_oop ?? tatica.formacao}
                      mentalidadeOverride={tatica.mentalidade_oop ?? tatica.mentalidade} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── STRATEGY ── */}
      {activeTab === "strategy" && (
        <StrategyPanel strat={strat as NonNullable<TacticaConfig["strategy"]>} onUpdate={updateStrategy} />
      )}

      {/* Hidden uid usage to suppress lint warning */}
      <span className="hidden" aria-hidden>{uid}</span>
    </div>
  )
}
