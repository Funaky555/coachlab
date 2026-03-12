"use client"

import { useState, useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { type Jogador, type TacticaConfig, getJogadores, getTatica, saveTatica } from "@/lib/storage/plantel"

// All formations with proper position definitions — ordered by defenders count ASC, then midfielders ASC
const FORMATION_POSITIONS: Record<string, { posicao: string; label: string; row: number }[]> = {
  // ── 2 defenders ──────────────────────────────────────────────────────────
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
  // ── 3 defenders ──────────────────────────────────────────────────────────
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
  // ── 4 defenders ──────────────────────────────────────────────────────────
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
  // ── 5 defenders ──────────────────────────────────────────────────────────
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

// Explicit ordered array (2-def → 3-def → 4-def → 5-def, then by mid count ASC)
const FORMATIONS = Object.keys(FORMATION_POSITIONS)

function getPositions(formacao: string) {
  return FORMATION_POSITIONS[formacao] ?? FORMATION_POSITIONS["1-4-3-3"]
}

function ToggleGroup({ value, options, onChange, color }: {
  value: string; options: { value: string; label: string }[]; onChange: (v: string) => void; color?: string
}) {
  return (
    <div className="flex gap-1 flex-wrap">
      {options.map(o => (
        <button key={o.value} onClick={() => onChange(o.value)}
          className={`px-2 py-0.5 rounded text-[10px] font-semibold border transition-all ${
            value === o.value ? "border-transparent text-black" : "border-border/40 text-muted-foreground hover:text-foreground"
          }`}
          style={value === o.value ? { background: color ?? "#00D66C" } : {}}>
          {o.label}
        </button>
      ))}
    </div>
  )
}

function SectionHeader({ icon, label, color }: { icon: string; label: string; color: string }) {
  return (
    <div className="flex items-center gap-1.5 mb-2">
      <span>{icon}</span>
      <span className="text-[9px] font-black uppercase tracking-widest" style={{ color }}>{label}</span>
      <div className="flex-1 h-px" style={{ background: color + "33" }} />
    </div>
  )
}

export function TacticsTab() {
  const [jogadores, setJogadores] = useState<Jogador[]>([])
  const [tatica, setTatica] = useState<TacticaConfig>(getTatica())
  const [dragOver, setDragOver] = useState<number | null>(null)

  useEffect(() => {
    setJogadores(getJogadores())
    setTatica(getTatica())
  }, [])

  function update(partial: Partial<TacticaConfig>) {
    const updated = { ...tatica, ...partial }
    setTatica(updated)
    saveTatica(updated)
  }

  function changeFormation(formacao: string) {
    const updated = { ...tatica, formacao, titulares: [] }
    setTatica(updated)
    saveTatica(updated)
  }

  function getSlotKey(index: number) { return `slot_${index}` }

  function getSlotJogador(index: number) {
    const slot = tatica.titulares.find(s => s.posicao === getSlotKey(index))
    return slot?.jogadorId ? jogadores.find(j => j.id === slot.jogadorId) ?? null : null
  }

  function assignToSlot(index: number, jogadorId: string | undefined) {
    const key = getSlotKey(index)
    const filtered = tatica.titulares.filter(s => s.posicao !== key)
    const updated = jogadorId ? [...filtered, { posicao: key, jogadorId }] : filtered
    update({ titulares: updated })
  }

  function handleDrop(index: number, e: React.DragEvent) {
    e.preventDefault()
    const jogadorId = e.dataTransfer.getData("jogadorId")
    if (jogadorId) assignToSlot(index, jogadorId)
    setDragOver(null)
  }

  function handleSlotClick(index: number) {
    // Toggle: if assigned, unassign
    const current = getSlotJogador(index)
    if (current) {
      assignToSlot(index, undefined)
    }
  }

  const positions = getPositions(tatica.formacao)
  const assignedIds = new Set(tatica.titulares.map(s => s.jogadorId).filter(Boolean))
  const benchPlayers = jogadores.filter(j => !assignedIds.has(j.id))

  // Group positions by row
  const rowGroups: Record<number, { pos: typeof positions[0]; index: number }[]> = {}
  positions.forEach((p, i) => {
    if (!rowGroups[p.row]) rowGroups[p.row] = []
    rowGroups[p.row].push({ pos: p, index: i })
  })
  const rows = Object.entries(rowGroups).sort((a, b) => Number(a[0]) - Number(b[0]))

  return (
    <div className="flex gap-3 min-h-[600px]">
      {/* ── LEFT SIDEBAR ── */}
      <div className="w-52 shrink-0 overflow-y-auto pr-1 border-r border-border/20 space-y-3">

        {/* Formation selector */}
        <div>
          <Label className="text-[10px] text-muted-foreground uppercase tracking-wider">Formation</Label>
          <Select value={tatica.formacao} onValueChange={changeFormation}>
            <SelectTrigger className="mt-1 h-8 text-xs font-bold font-mono"><SelectValue /></SelectTrigger>
            <SelectContent className="max-h-72">
              {FORMATIONS.map(f => <SelectItem key={f} value={f} className="text-xs font-mono">{f}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {/* ⚡ Offensive Organisation */}
        <div className="border-t border-border/20 pt-2">
          <SectionHeader icon="⚡" label="Offensive Org" color="#00D66C" />
          <div className="space-y-2">
            <div>
              <Label className="text-[10px] text-muted-foreground">Pressure</Label>
              <ToggleGroup value={tatica.pressao} onChange={v => update({ pressao: v as TacticaConfig["pressao"] })}
                options={[{ value: "high", label: "High" }, { value: "medium", label: "Med" }, { value: "low", label: "Low" }]}
                color="#FF6B35" />
            </div>
            <div>
              <Label className="text-[10px] text-muted-foreground">Press Zone</Label>
              <ToggleGroup value={tatica.zonaPressao} onChange={v => update({ zonaPressao: v as TacticaConfig["zonaPressao"] })}
                options={[{ value: "wide", label: "Wide" }, { value: "central", label: "Cent" }, { value: "both", label: "Both" }]}
                color="#8B5CF6" />
            </div>
            <div>
              <Label className="text-[10px] text-muted-foreground">Attack via</Label>
              <ToggleGroup value={tatica.explorarCorredores ? "wide" : "central"} onChange={v => update({ explorarCorredores: v === "wide" })}
                options={[{ value: "wide", label: "Wide" }, { value: "central", label: "Cent" }]}
                color="#00D66C" />
            </div>
            <div>
              <Label className="text-[10px] text-muted-foreground">Crosses</Label>
              <ToggleGroup value={tatica.cruzamentos} onChange={v => update({ cruzamentos: v as TacticaConfig["cruzamentos"] })}
                options={[{ value: "cutback", label: "Cut" }, { value: "into_box", label: "Box" }, { value: "both", label: "Both" }]}
                color="#00D66C" />
            </div>
            <div>
              <Label className="text-[10px] text-muted-foreground">Notes</Label>
              <Textarea value={tatica.notasOfensivas} onChange={e => update({ notasOfensivas: e.target.value })}
                className="mt-1 h-12 text-[10px] resize-none" placeholder="Offensive instructions..." />
            </div>
          </div>
        </div>

        {/* 🛡 Defensive Organisation */}
        <div className="border-t border-border/20 pt-2">
          <SectionHeader icon="🛡" label="Defensive Org" color="#EF4444" />
          <div className="space-y-2">
            <div>
              <Label className="text-[10px] text-muted-foreground">Pitch Type</Label>
              <ToggleGroup value={tatica.tipoRelvado} onChange={v => update({ tipoRelvado: v as TacticaConfig["tipoRelvado"] })}
                options={[{ value: "grass", label: "Grass" }, { value: "artificial", label: "Art" }, { value: "hybrid", label: "Hyb" }]}
                color="#8B5CF6" />
            </div>
            <div>
              <Label className="text-[10px] text-muted-foreground">Pitch Condition</Label>
              <ToggleGroup value={tatica.estadoRelvado} onChange={v => update({ estadoRelvado: v as TacticaConfig["estadoRelvado"] })}
                options={[{ value: "excellent", label: "Top" }, { value: "good", label: "Good" }, { value: "poor", label: "Poor" }]}
                color="#00D66C" />
            </div>
            <div>
              <Label className="text-[10px] text-muted-foreground">Opponent Style</Label>
              <ToggleGroup value={tatica.adversarioAgressivo ? "aggressive" : "passive"} onChange={v => update({ adversarioAgressivo: v === "aggressive" })}
                options={[{ value: "aggressive", label: "Aggr" }, { value: "passive", label: "Pass" }]}
                color="#FF6B35" />
            </div>
            <div>
              <Label className="text-[10px] text-muted-foreground">Notes</Label>
              <Textarea value={tatica.notasDefensivas} onChange={e => update({ notasDefensivas: e.target.value })}
                className="mt-1 h-12 text-[10px] resize-none" placeholder="Defensive instructions..." />
            </div>
          </div>
        </div>

        {/* 🎯 Game Strategy */}
        <div className="border-t border-border/20 pt-2">
          <SectionHeader icon="🎯" label="Game Strategy" color="#0066FF" />
          <div className="space-y-2">
            <div>
              <Label className="text-[10px] text-muted-foreground">Mentality</Label>
              <ToggleGroup value={tatica.mentalidade} onChange={v => update({ mentalidade: v as TacticaConfig["mentalidade"] })}
                options={[{ value: "offensive", label: "Att" }, { value: "balanced", label: "Bal" }, { value: "defensive", label: "Def" }]}
                color="#0066FF" />
            </div>
          </div>
        </div>
      </div>

      {/* ── CENTER — Pitch + Bench ── */}
      <div className="flex-1 flex flex-col gap-3 min-w-0">
        {/* Formation badge */}
        <div className="flex items-center justify-center gap-2">
          <span className="px-3 py-1 rounded-full bg-[#00D66C]/10 border border-[#00D66C]/30 text-xs font-bold text-[#00D66C] font-mono">
            {tatica.formacao}
          </span>
          <span className="text-[10px] text-muted-foreground">Click slot to unassign • Drag from bench to assign</span>
        </div>

        {/* Pitch */}
        <div
          className="relative rounded-xl overflow-hidden flex-1"
          style={{
            backgroundImage: "url('/pitch-grass.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            minHeight: 340,
            maxHeight: 420,
          }}
        >
          <div className="absolute inset-0 bg-black/50" />

          <div className="relative z-10 h-full flex flex-col justify-around py-3 px-2 gap-1">
            {rows.map(([rowKey, rowSlots]) => (
              <div key={rowKey} className="flex justify-center gap-1.5 flex-wrap">
                {rowSlots.map(({ pos, index }) => {
                  const jogador = getSlotJogador(index)
                  const isOver = dragOver === index
                  return (
                    <div
                      key={`slot_${index}`}
                      className={`flex flex-col items-center gap-0.5 p-1.5 rounded-lg border transition-all cursor-pointer
                        ${jogador
                          ? "bg-black/70 border-white/30 hover:border-red-400/60 shadow-md"
                          : isOver
                            ? "bg-[#00D66C]/20 border-[#00D66C] border-dashed"
                            : "bg-black/30 border-white/10 hover:border-white/30 border-dashed"
                        }`}
                      style={{ width: 68 }}
                      onClick={() => handleSlotClick(index)}
                      onDragOver={e => { e.preventDefault(); setDragOver(index) }}
                      onDragLeave={() => setDragOver(null)}
                      onDrop={e => handleDrop(index, e)}
                    >
                      <div className="text-[9px] text-white/60 font-bold uppercase tracking-wide">{pos.label}</div>
                      {jogador ? (
                        <>
                          {jogador.foto ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={jogador.foto} alt={jogador.nome} className="w-8 h-8 rounded-full object-cover border-2 border-[#00D66C]/50" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-muted/80 flex items-center justify-center text-xs font-bold border-2 border-white/20">
                              {jogador.numero}
                            </div>
                          )}
                          <div className="text-[9px] text-white font-semibold truncate w-full text-center px-0.5 leading-tight">
                            {jogador.nome.split(" ").slice(-1)[0]}
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="w-8 h-8 rounded-full border-2 border-dashed border-white/15 flex items-center justify-center">
                            <span className="text-white/20 text-base">+</span>
                          </div>
                          <div className="text-[9px] text-white/20">Drop</div>
                        </>
                      )}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>

        {/* ── BENCH (below pitch) ── */}
        <div className="rounded-xl border border-border/30 bg-muted/10 p-2">
          <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
            Bench ({benchPlayers.length} available)
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {benchPlayers.map(j => (
              <div
                key={j.id}
                draggable
                onDragStart={e => e.dataTransfer.setData("jogadorId", j.id)}
                className="flex flex-col items-center gap-0.5 p-1.5 rounded-lg border border-border/40 bg-background/60
                  hover:border-[#00D66C]/40 hover:bg-[#00D66C]/5 cursor-grab active:cursor-grabbing transition-all shrink-0"
                style={{ width: 64 }}
                title={`${j.nome} — drag to field`}
              >
                {j.foto ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={j.foto} alt={j.nome} className="w-9 h-9 rounded-full object-cover border border-border" />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-xs font-bold border border-border">
                    {j.numero}
                  </div>
                )}
                <div className="text-[9px] font-medium text-center truncate w-full leading-tight">
                  {j.nome.split(" ").slice(-1)[0]}
                </div>
                <div className="text-[8px] text-muted-foreground">{j.posicoes[0]}</div>
              </div>
            ))}
            {benchPlayers.length === 0 && (
              <div className="text-[10px] text-muted-foreground/40 py-4 px-2">All players assigned to starting XI</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
