"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Plus, User, Users, Target, BookOpen, BarChart2, Heart, Crown, Layers, Upload, Shield, ShieldCheck, Crosshair, Zap } from "lucide-react"
import {
  type Jogador, type EstadoJogador, type PosicaoJogador, type PePreferido,
  getJogadores, addJogador, updateJogador,
  getPrimarySetor, displayName,
} from "@/lib/storage/plantel"
import { ImportDataDialog, type ImportField } from "@/components/ui/import-data-dialog"
import { PositionSelector } from "./position-selector"
import { AthleteProfileModal } from "./athlete-profile-modal"
import { CompetitionStatsTab } from "./competition-stats-tab"
import { SquadPlanTab } from "./squad-plan-tab"
import { HierarchyTab } from "./hierarchy-tab"
import { MoraleTab } from "./morale-tab"
import { TacticsTab } from "./tactics-tab"
import { SetPiecesTab } from "./set-pieces-tab"

const PLANTEL_IMPORT_SCHEMA: ImportField[] = [
  { key: "nome",           label: "Nome",            required: true,  type: "text" },
  { key: "numero",         label: "Número",          required: true,  type: "number" },
  { key: "posicao",        label: "Posição",         required: true,  type: "text" },
  { key: "estado",         label: "Estado",                           type: "text" },
  { key: "dataNascimento", label: "Data Nascimento",                  type: "date" },
  { key: "nacionalidade",  label: "Nacionalidade",                    type: "text" },
  { key: "altura",         label: "Altura (cm)",                      type: "number" },
  { key: "peso",           label: "Peso (kg)",                        type: "number" },
  { key: "pePreferido",    label: "Pé Preferido",                     type: "text" },
  { key: "notas",          label: "Notas",                            type: "text" },
]

const POSICAO_MAP: Record<string, PosicaoJogador> = {
  gk: "GK", gr: "GK", goalkeeper: "GK", guarda: "GK",
  rb: "RB", dd: "RB", "right back": "RB",
  cbr: "CBR", dc: "CBR", "center back": "CBR", cb: "CBR",
  cbl: "CBL",
  lb: "LB", de: "LB", "left back": "LB",
  cm: "CM", mc: "CM", midfielder: "CM", médio: "CM",
  cmr: "CMR", cmd: "CMR",
  cml: "CML", cme: "CML",
  wr: "WR", md: "WR", "right wing": "WR",
  om: "OM", meia: "OM", "attacking mid": "OM",
  wl: "WL", me: "WL", "left wing": "WL",
  st: "ST", av: "ST", striker: "ST", avançado: "ST",
}

const ESTADO_MAP: Record<string, EstadoJogador> = {
  apto: "apto", fit: "apto",
  condicionado: "condicionado", limited: "condicionado",
  lesionado: "lesionado", injured: "lesionado",
  indisponivel: "indisponivel", unavailable: "indisponivel",
}

const SETORES = [
  { key: "GR" as const,  label: "Goalkeepers", color: "#E5E5E5", icon: <Shield className="w-3.5 h-3.5" /> },
  { key: "DEF" as const, label: "Defenders",   color: "#00D66C", icon: <ShieldCheck className="w-3.5 h-3.5" /> },
  { key: "MED" as const, label: "Midfielders", color: "#0066FF", icon: <Crosshair className="w-3.5 h-3.5" /> },
  { key: "AV" as const,  label: "Forwards",    color: "#FF2222", icon: <Zap className="w-3.5 h-3.5" /> },
]

function estadoCor(estado: EstadoJogador): string {
  if (estado === "apto") return "#00D66C"
  if (estado === "condicionado") return "#FF6B35"
  if (estado === "lesionado") return "#EF4444"
  return "#6B7280"
}

const emptyForm = {
  nome: "", alcunha: "", numero: 1,
  posicoes: ["CBR"] as PosicaoJogador[],
  estado: "apto" as EstadoJogador,
  foto: "", dataNascimento: "", nacionalidade: "",
  altura: "", peso: "",
  pePreferido: "" as PePreferido | "",
  notas: "",
  // Atributos — todos undefined por defeito
  aOBallControl: undefined as number | undefined,
  aOFirstTouch: undefined as number | undefined,
  aOShortPass: undefined as number | undefined,
  aOLongPass: undefined as number | undefined,
  aOCrossing: undefined as number | undefined,
  aOHeading: undefined as number | undefined,
  aOFinishing: undefined as number | undefined,
  aODribbling: undefined as number | undefined,
  aOFeint: undefined as number | undefined,
  aDPositioning: undefined as number | undefined,
  aDDefensiveAwareness: undefined as number | undefined,
  aDMarcation: undefined as number | undefined,
  aDInterceptions: undefined as number | undefined,
  aDTackling: undefined as number | undefined,
  aDAerialDuels: undefined as number | undefined,
  aDAggression: undefined as number | undefined,
  aIPenetration: undefined as number | undefined,
  aIOffBall: undefined as number | undefined,
  aIVision: undefined as number | undefined,
  aIChanceCreation: undefined as number | undefined,
  aICreativity: undefined as number | undefined,
  aIDesmarcation: undefined as number | undefined,
  aSPPenalty: undefined as number | undefined,
  aSPCorners: undefined as number | undefined,
  aSPFreeKicks: undefined as number | undefined,
  aSPLongThrows: undefined as number | undefined,
  aPAcceleration: undefined as number | undefined,
  aPSprint: undefined as number | undefined,
  aPAgility: undefined as number | undefined,
  aPBalance: undefined as number | undefined,
  aPJumping: undefined as number | undefined,
  aPStrength: undefined as number | undefined,
  aPEndurance: undefined as number | undefined,
  aMentality: undefined as number | undefined,
  aCompetitive: undefined as number | undefined,
  aConcentration: undefined as number | undefined,
  aComposure: undefined as number | undefined,
  aCourage: undefined as number | undefined,
  aLeadership: undefined as number | undefined,
  aWorkEthic: undefined as number | undefined,
  aTeamWork: undefined as number | undefined,
  aGIGameReading: undefined as number | undefined,
  aGIDecisionMaking: undefined as number | undefined,
  aGISpatialAwareness: undefined as number | undefined,
  aGITacticalDiscipline: undefined as number | undefined,
  aGIOffBallMovement: undefined as number | undefined,
}

function getRatingInfo(v: number | undefined): { label: string; color: string } {
  if (v === undefined) return { label: "", color: "rgba(255,255,255,0.25)" }
  if (v <= 2) return { label: "Very Weak", color: "#EF4444" }
  if (v <= 4) return { label: "Weak", color: "#FF6B35" }
  if (v === 5) return { label: "Medium", color: "rgba(255,255,255,0.55)" }
  if (v === 6) return { label: "Good", color: "rgba(255,255,255,0.75)" }
  if (v === 7) return { label: "Very Good", color: "#facc15" }
  if (v === 8) return { label: "Excellent", color: "#00D66C" }
  if (v === 9) return { label: "Elite", color: "#00D66C" }
  return { label: "World Class", color: "#00D66C" }
}

function AttrSection({ title, color, attrs, values, onChange }: {
  title: string; color: string;
  attrs: [string, string][];
  values: Record<string, unknown>;
  onChange: (key: string, val: number | undefined) => void
}) {
  return (
    <div className="rounded-xl overflow-hidden border" style={{ borderColor: `${color}25`, background: `linear-gradient(135deg, ${color}06 0%, transparent 60%)` }}>
      <div className="flex items-center gap-2 px-3 py-2 border-b" style={{ borderColor: `${color}15`, background: `${color}10` }}>
        <div className="w-1 h-3.5 rounded-full shrink-0" style={{ background: color }} />
        <span className="text-[10px] font-black uppercase tracking-widest" style={{ color }}>{title}</span>
      </div>
      <div className="px-2.5 py-2 space-y-1.5">
        {attrs.map(([label, key]) => {
          const val = values[key] as number | undefined
          const { color: rColor } = getRatingInfo(val)
          return (
            <div key={key} className="flex items-center gap-2">
              <span className="text-[9px] text-white/45 shrink-0 w-[72px] truncate">{label}</span>
              <div className="flex gap-[2px] flex-1">
                {Array.from({ length: 10 }, (_, i) => {
                  const filled = val !== undefined && i < val
                  const isLast = val !== undefined && i === val - 1
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => onChange(key, val === i + 1 ? undefined : i + 1)}
                      className="h-2.5 flex-1 rounded-[2px] transition-all duration-75 hover:opacity-60"
                      style={{
                        background: filled ? rColor : 'rgba(255,255,255,0.07)',
                        boxShadow: isLast ? `0 0 5px ${rColor}99` : undefined,
                      }}
                    />
                  )
                })}
              </div>
              <span className="text-[10px] font-bold w-3.5 text-right shrink-0 tabular-nums"
                style={{ color: val ? rColor : 'rgba(255,255,255,0.18)' }}>
                {val ?? '—'}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function PlantelModule() {
  const [jogadores, setJogadores] = useState<Jogador[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [profileJogador, setProfileJogador] = useState<Jogador | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  useEffect(() => {
    setJogadores(getJogadores())
  }, [])

  function refresh() {
    setJogadores(getJogadores())
  }

  function handleImportJogadores(rows: Record<string, string>[]) {
    rows.forEach(row => {
      const posKey = (row.posicao ?? "").toLowerCase().trim()
      const posicao: PosicaoJogador = POSICAO_MAP[posKey] ?? "CBR"
      const estadoKey = (row.estado ?? "").toLowerCase().trim()
      const estado: EstadoJogador = ESTADO_MAP[estadoKey] ?? "apto"
      addJogador({
        nome: row.nome?.trim() ?? "",
        numero: parseInt(row.numero) || 0,
        posicoes: [posicao],
        estado,
        dataNascimento: row.dataNascimento?.trim() || undefined,
        nacionalidade: row.nacionalidade?.trim() || undefined,
        altura: row.altura ? parseFloat(row.altura) || undefined : undefined,
        peso: row.peso ? parseFloat(row.peso) || undefined : undefined,
        pePreferido: (row.pePreferido?.toLowerCase().trim() as PePreferido) || undefined,
        notas: row.notas?.trim() || undefined,
      })
    })
    refresh()
  }

  function openAdd() {
    setEditingId(null)
    setForm(emptyForm)
    setSaveError(null)
    setDialogOpen(true)
  }

  function openEdit(j: Jogador) {
    setEditingId(j.id)
    setForm({
      nome: j.nome, alcunha: j.alcunha ?? "", numero: j.numero,
      posicoes: j.posicoes ?? ["CBR"],
      estado: j.estado, foto: j.foto ?? "",
      dataNascimento: j.dataNascimento ?? "",
      nacionalidade: j.nacionalidade ?? "",
      altura: j.altura ? String(j.altura) : "",
      peso: j.peso ? String(j.peso) : "",
      pePreferido: j.pePreferido ?? "",
      notas: j.notas ?? "",
      aOBallControl: j.aOBallControl,
      aOFirstTouch: j.aOFirstTouch,
      aOShortPass: j.aOShortPass,
      aOLongPass: j.aOLongPass,
      aOCrossing: j.aOCrossing,
      aOHeading: j.aOHeading,
      aOFinishing: j.aOFinishing,
      aODribbling: j.aODribbling,
      aOFeint: j.aOFeint,
      aDPositioning: j.aDPositioning,
      aDDefensiveAwareness: j.aDDefensiveAwareness,
      aDMarcation: j.aDMarcation,
      aDInterceptions: j.aDInterceptions,
      aDTackling: j.aDTackling,
      aDAerialDuels: j.aDAerialDuels,
      aDAggression: j.aDAggression,
      aIPenetration: j.aIPenetration,
      aIOffBall: j.aIOffBall,
      aIVision: j.aIVision,
      aIChanceCreation: j.aIChanceCreation,
      aICreativity: j.aICreativity,
      aIDesmarcation: j.aIDesmarcation,
      aSPPenalty: j.aSPPenalty,
      aSPCorners: j.aSPCorners,
      aSPFreeKicks: j.aSPFreeKicks,
      aSPLongThrows: j.aSPLongThrows,
      aPAcceleration: j.aPAcceleration,
      aPSprint: j.aPSprint,
      aPAgility: j.aPAgility,
      aPBalance: j.aPBalance,
      aPJumping: j.aPJumping,
      aPStrength: j.aPStrength,
      aPEndurance: j.aPEndurance,
      aMentality: j.aMentality,
      aCompetitive: j.aCompetitive,
      aConcentration: j.aConcentration,
      aComposure: j.aComposure,
      aCourage: j.aCourage,
      aLeadership: j.aLeadership,
      aWorkEthic: j.aWorkEthic,
      aTeamWork: j.aTeamWork,
      aGIGameReading: j.aGIGameReading,
      aGIDecisionMaking: j.aGIDecisionMaking,
      aGISpatialAwareness: j.aGISpatialAwareness,
      aGITacticalDiscipline: j.aGITacticalDiscipline,
      aGIOffBallMovement: j.aGIOffBallMovement,
    })
    setDialogOpen(true)
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    // Compress to max 300×300 JPEG to avoid localStorage quota issues
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement("canvas")
      const size = 300
      canvas.width = size
      canvas.height = size
      canvas.getContext("2d")?.drawImage(img, 0, 0, size, size)
      setForm(prev => ({ ...prev, foto: canvas.toDataURL("image/jpeg", 0.8) }))
      URL.revokeObjectURL(img.src)
    }
    img.src = URL.createObjectURL(file)
  }

  function saveJogadorForm() {
    if (!form.nome.trim() || form.posicoes.length === 0) return
    setSaveError(null)
    try {
      const data: Omit<Jogador, "id"> = {
        nome: form.nome, alcunha: form.alcunha || undefined,
        numero: form.numero,
        posicoes: form.posicoes, estado: form.estado,
        foto: form.foto || undefined,
        dataNascimento: form.dataNascimento || undefined,
        nacionalidade: form.nacionalidade || undefined,
        altura: form.altura ? Number(form.altura) : undefined,
        peso: form.peso ? Number(form.peso) : undefined,
        pePreferido: (form.pePreferido as PePreferido) || undefined,
        notas: form.notas || undefined,
        aOBallControl: form.aOBallControl,
        aOFirstTouch: form.aOFirstTouch,
        aOShortPass: form.aOShortPass,
        aOLongPass: form.aOLongPass,
        aOCrossing: form.aOCrossing,
        aOHeading: form.aOHeading,
        aOFinishing: form.aOFinishing,
        aODribbling: form.aODribbling,
        aOFeint: form.aOFeint,
        aDPositioning: form.aDPositioning,
        aDDefensiveAwareness: form.aDDefensiveAwareness,
        aDMarcation: form.aDMarcation,
        aDInterceptions: form.aDInterceptions,
        aDTackling: form.aDTackling,
        aDAerialDuels: form.aDAerialDuels,
        aDAggression: form.aDAggression,
        aIPenetration: form.aIPenetration,
        aIOffBall: form.aIOffBall,
        aIVision: form.aIVision,
        aIChanceCreation: form.aIChanceCreation,
        aICreativity: form.aICreativity,
        aIDesmarcation: form.aIDesmarcation,
        aSPPenalty: form.aSPPenalty,
        aSPCorners: form.aSPCorners,
        aSPFreeKicks: form.aSPFreeKicks,
        aSPLongThrows: form.aSPLongThrows,
        aPAcceleration: form.aPAcceleration,
        aPSprint: form.aPSprint,
        aPAgility: form.aPAgility,
        aPBalance: form.aPBalance,
        aPJumping: form.aPJumping,
        aPStrength: form.aPStrength,
        aPEndurance: form.aPEndurance,
        aMentality: form.aMentality,
        aCompetitive: form.aCompetitive,
        aConcentration: form.aConcentration,
        aComposure: form.aComposure,
        aCourage: form.aCourage,
        aLeadership: form.aLeadership,
        aWorkEthic: form.aWorkEthic,
        aTeamWork: form.aTeamWork,
        aGIGameReading: form.aGIGameReading,
        aGIDecisionMaking: form.aGIDecisionMaking,
        aGISpatialAwareness: form.aGISpatialAwareness,
        aGITacticalDiscipline: form.aGITacticalDiscipline,
        aGIOffBallMovement: form.aGIOffBallMovement,
      }
      if (editingId) { updateJogador(editingId, data) } else { addJogador(data) }
      refresh()
      setDialogOpen(false)
    } catch (err) {
      console.error("Save player failed:", err)
      setSaveError("Failed to save. Try removing the photo or reducing its size.")
    }
  }

  const aptosCount = jogadores.filter(j => j.estado === "apto").length
  const condicionadosCount = jogadores.filter(j => j.estado === "condicionado").length
  const lesionadosCount = jogadores.filter(j => j.estado === "lesionado").length
  const indisponiveisCount = jogadores.filter(j => j.estado === "indisponivel").length

  const jogadoresBySetor = SETORES.map(s => ({
    ...s,
    jogadores: jogadores.filter(j => getPrimarySetor(j.posicoes) === s.key),
  })).filter(s => s.jogadores.length > 0)

  const statusItems = [
    { label: "Total", value: jogadores.length, color: "#E5E7EB" },
    { label: "Fit", value: aptosCount, color: "#00D66C" },
    { label: "Limited", value: condicionadosCount, color: "#FF6B35" },
    { label: "Injured", value: lesionadosCount, color: "#EF4444" },
    { label: "Unavailable", value: indisponiveisCount, color: "#6B7280" },
  ]

  return (
    <div className="p-4 md:p-6 max-w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-barlow-condensed)" }}>
          Squad Management
        </h1>
        {/* Compact status counters — top right */}
        <div className="flex items-center gap-2 flex-wrap justify-end">
          {statusItems.map(s => (
            <div key={s.label} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted/30 border border-border/40">
              <span className="text-sm font-bold tabular-nums" style={{ color: s.color }}>{s.value}</span>
              <span className="text-xs text-muted-foreground">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      <Tabs defaultValue="squad">
        <TabsList className="mb-6 h-auto p-2 gap-2 flex flex-wrap rounded-2xl"
          style={{ background: "rgba(5,18,10,0.75)", border: "1px solid rgba(255,255,255,0.08)", backdropFilter: "blur(12px)" }}>
          {[
            { value: "squad",      label: "Squad",      icon: <Users className="w-4 h-4" />,     color: "#00D66C" },
            { value: "team-plan",  label: "Team Plan",  icon: <Layers className="w-4 h-4" />,    color: "#0066FF" },
            { value: "tactics",    label: "Tactics",    icon: <Target className="w-4 h-4" />,    color: "#FF6B35" },
            { value: "set-pieces", label: "Set Pieces", icon: <BookOpen className="w-4 h-4" />,  color: "#8B5CF6" },
            { value: "match-stats",label: "Match Stats",icon: <BarChart2 className="w-4 h-4" />, color: "#FFD700" },
            { value: "morale",     label: "Morale",     icon: <Heart className="w-4 h-4" />,     color: "#EC4899" },
            { value: "hierarchy",  label: "Hierarchy",  icon: <Crown className="w-4 h-4" />,     color: "#F59E0B" },
          ].map(tab => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="flex flex-col items-center gap-1 h-auto py-2 px-4 rounded-xl font-bold transition-all duration-200
                data-[state=active]:scale-105 data-[state=active]:shadow-lg
                data-[state=active]:bg-[var(--tab-bg)] data-[state=active]:text-[var(--tab-color)]
                data-[state=active]:border data-[state=active]:border-[var(--tab-border)]
                data-[state=inactive]:opacity-50 data-[state=inactive]:hover:opacity-75"
              style={{
                ["--tab-color" as string]: tab.color,
                ["--tab-bg" as string]: tab.color + "20",
                ["--tab-border" as string]: tab.color + "55",
              }}
            >
              <span style={{ color: tab.color }}>{tab.icon}</span>
              <span className="text-[11px] leading-none">{tab.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {/* ── TEAM PLAN TAB ── */}
        <TabsContent value="team-plan">
          <SquadPlanTab />
        </TabsContent>

        {/* ── SQUAD TAB ── */}
        <TabsContent value="squad">
          <div className="flex justify-end items-center mb-4">
            <div className="flex items-center gap-2">
              <ImportDataDialog
                title="Importar Jogadores"
                description="Importa jogadores de um ficheiro Excel ou CSV."
                schema={PLANTEL_IMPORT_SCHEMA}
                onImport={handleImportJogadores}
                trigger={
                  <Button variant="outline" size="sm" className="gap-1.5 h-8 text-xs border-[#00D66C]/40 text-[#00D66C] hover:bg-[#00D66C]/10">
                    <Upload className="w-3.5 h-3.5" /> Import
                  </Button>
                }
              />
              <Button onClick={openAdd} size="sm" className="bg-[#00D66C] hover:bg-[#00D66C]/90 text-black gap-1.5 h-8 text-xs">
                <Plus className="w-3.5 h-3.5" /> Add Player
              </Button>
            </div>
          </div>

          {jogadores.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
              <User className="w-12 h-12 mb-3 opacity-30" />
              <p className="text-lg font-medium">No players added</p>
              <p className="text-sm">Click &quot;Add Player&quot; to get started</p>
            </div>
          ) : (
            <div className="space-y-4">
              {jogadoresBySetor.map(setor => (
                <div key={setor.key}>
                  {/* Sector header — glassmorphism colorido */}
                  <div className="flex items-center gap-2 mb-2 px-2 py-1.5 rounded-lg"
                    style={{
                      background: `linear-gradient(135deg, ${setor.color}18, ${setor.color}08)`,
                      border: `1px solid ${setor.color}30`,
                      boxShadow: `0 0 16px ${setor.color}10`,
                    }}>
                    <div className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0"
                      style={{ background: setor.color + "25", border: `1px solid ${setor.color}50`, color: setor.color }}>
                      {setor.icon}
                    </div>
                    <span className="text-xs font-black uppercase tracking-wider" style={{ color: setor.color }}>
                      {setor.label}
                    </span>
                    <div className="flex-1" />
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                      style={{ background: setor.color + "22", color: setor.color, border: `1px solid ${setor.color}44` }}>
                      {setor.jogadores.length}
                    </span>
                  </div>

                  {/* Players — círculos com foto */}
                  <div className="flex flex-wrap gap-3 justify-center">
                    {setor.jogadores.map(j => (
                      <div
                        key={j.id}
                        className="flex flex-col items-center gap-1 cursor-pointer"
                        style={{ width: 76 }}
                        onClick={() => setProfileJogador(j)}
                      >
                        {/* Círculo de foto */}
                        <div className="relative flex-shrink-0" style={{ width: 72, height: 72 }}>
                          {j.foto ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={j.foto} alt={j.nome}
                              className="w-full h-full rounded-full object-cover border-2"
                              style={{ borderColor: setor.color }} />
                          ) : (
                            <div className="w-full h-full rounded-full border-2 flex items-center justify-center text-xl font-black bg-black/50"
                              style={{ borderColor: setor.color, color: setor.color }}>
                              {j.numero}
                            </div>
                          )}
                          {/* Dot de estado */}
                          <div className="absolute bottom-0.5 right-0.5 w-3 h-3 rounded-full border-2 border-black"
                            style={{ background: estadoCor(j.estado) }} />
                        </div>
                        {/* Nome */}
                        <span className="text-[11px] font-bold text-white text-center leading-tight w-full truncate"
                          style={{ textShadow: "0 1px 3px rgba(0,0,0,0.9)" }}>
                          {displayName(j)}
                        </span>
                        {/* Posição */}
                        <span className="text-[9px] font-black uppercase leading-none"
                          style={{ color: setor.color }}>
                          {j.posicoes[0]}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ── TACTICS TAB ── */}
        <TabsContent value="tactics">
          <TacticsTab />
        </TabsContent>

        {/* ── SET PIECES TAB ── */}
        <TabsContent value="set-pieces">
          <SetPiecesTab />
        </TabsContent>

        {/* ── MATCH STATS TAB ── */}
        <TabsContent value="match-stats">
          <CompetitionStatsTab />
        </TabsContent>

        {/* ── MORALE TAB ── */}
        <TabsContent value="morale">
          <MoraleTab />
        </TabsContent>

        {/* ── HIERARCHY TAB ── */}
        <TabsContent value="hierarchy">
          <HierarchyTab />
        </TabsContent>
      </Tabs>

      {/* Dialog: Add/Edit Player */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-4xl h-[92vh] flex flex-col overflow-hidden p-0 gap-0">
          <DialogHeader className="px-6 pt-5 pb-3 flex-shrink-0 border-b border-white/5">
            <DialogTitle>{editingId ? "Edit Player" : "Add Player"}</DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="info" className="flex flex-col flex-1 min-h-0 overflow-hidden">
            <TabsList className="flex-shrink-0 w-full justify-start rounded-none border-b border-white/5 px-4 bg-transparent h-10 gap-1">
              <TabsTrigger value="info" className="text-xs">Info</TabsTrigger>
              <TabsTrigger value="attributes" className="text-xs">Attributes</TabsTrigger>
            </TabsList>

            {/* ── INFO TAB ── */}
            <TabsContent value="info" className="flex-1 min-h-0 overflow-y-auto px-6 py-4 mt-0">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-2">
                      <Label>Name *</Label>
                      <Input placeholder="Full name" value={form.nome} onChange={e => setForm(prev => ({ ...prev, nome: e.target.value }))} className="mt-1" />
                    </div>
                    <div>
                      <Label>No.</Label>
                      <Input type="number" min={1} max={99} value={form.numero} onChange={e => setForm(prev => ({ ...prev, numero: parseInt(e.target.value) || 1 }))} className="mt-1" />
                    </div>
                  </div>
                  <div>
                    <Label>Alcunha</Label>
                    <Input placeholder="Nome exibido em toda a app (ex: Ronaldo)" value={form.alcunha} onChange={e => setForm(prev => ({ ...prev, alcunha: e.target.value }))} className="mt-1" />
                  </div>
                  <div>
                    <Label>Status</Label>
                    <Select value={form.estado} onValueChange={v => setForm(prev => ({ ...prev, estado: v as EstadoJogador }))}>
                      <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="apto">Fit</SelectItem>
                        <SelectItem value="condicionado">Limited</SelectItem>
                        <SelectItem value="lesionado">Injured</SelectItem>
                        <SelectItem value="indisponivel">Unavailable</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Date of Birth</Label>
                    <div className="grid grid-cols-3 gap-2 mt-1">
                      <Select
                        value={form.dataNascimento ? String(parseInt(form.dataNascimento.split("-")[2] || "0")) : ""}
                        onValueChange={v => {
                          const parts = form.dataNascimento ? form.dataNascimento.split("-") : ["", "", ""]
                          const y = parts[0] || new Date().getFullYear().toString()
                          const m = parts[1] || "01"
                          setForm(prev => ({ ...prev, dataNascimento: `${y}-${m}-${v.padStart(2,"0")}` }))
                        }}
                      >
                        <SelectTrigger><SelectValue placeholder="Day" /></SelectTrigger>
                        <SelectContent>
                          {Array.from({length:31},(_,i)=>i+1).map(d=>(
                            <SelectItem key={d} value={String(d)}>{d}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select
                        value={form.dataNascimento ? String(parseInt(form.dataNascimento.split("-")[1] || "0")) : ""}
                        onValueChange={v => {
                          const parts = form.dataNascimento ? form.dataNascimento.split("-") : ["", "", ""]
                          const y = parts[0] || new Date().getFullYear().toString()
                          const d = parts[2] || "01"
                          setForm(prev => ({ ...prev, dataNascimento: `${y}-${v.padStart(2,"0")}-${d}` }))
                        }}
                      >
                        <SelectTrigger><SelectValue placeholder="Month" /></SelectTrigger>
                        <SelectContent>
                          {["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"].map((m,i)=>(
                            <SelectItem key={i+1} value={String(i+1)}>{m}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select
                        value={form.dataNascimento ? form.dataNascimento.split("-")[0] : ""}
                        onValueChange={v => {
                          const parts = form.dataNascimento ? form.dataNascimento.split("-") : ["", "01", "01"]
                          const m = parts[1] || "01"
                          const d = parts[2] || "01"
                          setForm(prev => ({ ...prev, dataNascimento: `${v}-${m}-${d}` }))
                        }}
                      >
                        <SelectTrigger><SelectValue placeholder="Year" /></SelectTrigger>
                        <SelectContent>
                          {Array.from({length:56},(_,i)=>2015-i).map(y=>(
                            <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <Label>Height (cm)</Label>
                      <Input type="number" placeholder="180" value={form.altura} onChange={e => setForm(prev => ({ ...prev, altura: e.target.value }))} className="mt-1" />
                    </div>
                    <div>
                      <Label>Weight (kg)</Label>
                      <Input type="number" placeholder="75" value={form.peso} onChange={e => setForm(prev => ({ ...prev, peso: e.target.value }))} className="mt-1" />
                    </div>
                    <div>
                      <Label>Foot</Label>
                      <Select value={form.pePreferido} onValueChange={v => setForm(prev => ({ ...prev, pePreferido: v as PePreferido }))}>
                        <SelectTrigger className="mt-1"><SelectValue placeholder="—" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="direito">Right</SelectItem>
                          <SelectItem value="esquerdo">Left</SelectItem>
                          <SelectItem value="ambidestro">Both</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label>Country</Label>
                    <Input placeholder="Portugal" value={form.nacionalidade} onChange={e => setForm(prev => ({ ...prev, nacionalidade: e.target.value }))} className="mt-1" />
                  </div>
                  <div>
                    <Label>Player Photo</Label>
                    <div className="mt-1 flex items-center gap-3">
                      {form.foto && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={form.foto} alt="preview" className="w-12 h-12 rounded-full object-cover border border-border" />
                      )}
                      <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                        Choose file
                      </Button>
                      {form.foto && (
                        <Button type="button" variant="ghost" size="sm" className="text-destructive" onClick={() => setForm(prev => ({ ...prev, foto: "" }))}>
                          Remove
                        </Button>
                      )}
                      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                    </div>
                  </div>
                  <div>
                    <Label>Notes</Label>
                    <Textarea placeholder="Notes about the player..." value={form.notas} onChange={e => setForm(prev => ({ ...prev, notas: e.target.value }))} className="mt-1 h-16" />
                  </div>
                </div>
                <div className="flex flex-col items-center">
                  <Label className="mb-2 self-start">Field Positions *</Label>
                  <PositionSelector selected={form.posicoes} onChange={posicoes => setForm(prev => ({ ...prev, posicoes }))} />
                </div>
              </div>
            </TabsContent>

            {/* ── ATTRIBUTES TAB ── */}
            <TabsContent value="attributes" className="flex-1 min-h-0 overflow-y-auto px-6 py-4 mt-0">
              <div className="space-y-2">
                {/* Linha 1: 3 colunas */}
                <div className="grid grid-cols-3 gap-2">
                  <AttrSection title="Offensive" color="#00D66C"
                    attrs={[["Ball Control","aOBallControl"],["First Touch","aOFirstTouch"],["Short Pass","aOShortPass"],["Long Pass","aOLongPass"],["Crossing","aOCrossing"],["Heading","aOHeading"],["Finishing","aOFinishing"],["Dribbling","aODribbling"],["Feint","aOFeint"]]}
                    values={form as unknown as Record<string, unknown>}
                    onChange={(k,v) => setForm(prev => ({ ...prev, [k]: v }))}
                  />
                  <AttrSection title="Defensive" color="#EF4444"
                    attrs={[["Positioning","aDPositioning"],["Def. Awareness","aDDefensiveAwareness"],["Marcation","aDMarcation"],["Interceptions","aDInterceptions"],["Tackling","aDTackling"],["Aerial Duels","aDAerialDuels"],["Aggression","aDAggression"]]}
                    values={form as unknown as Record<string, unknown>}
                    onChange={(k,v) => setForm(prev => ({ ...prev, [k]: v }))}
                  />
                  <AttrSection title="Physical" color="#0066FF"
                    attrs={[["Acceleration","aPAcceleration"],["Sprint","aPSprint"],["Agility","aPAgility"],["Balance","aPBalance"],["Jumping","aPJumping"],["Strength","aPStrength"],["Endurance","aPEndurance"]]}
                    values={form as unknown as Record<string, unknown>}
                    onChange={(k,v) => setForm(prev => ({ ...prev, [k]: v }))}
                  />
                </div>
                {/* Linha 2: 4 colunas */}
                <div className="grid grid-cols-4 gap-2">
                  <AttrSection title="Attacking Impact" color="#FF6B35"
                    attrs={[["Penetration","aIPenetration"],["Off Ball","aIOffBall"],["Vision","aIVision"],["Chance Creation","aIChanceCreation"],["Creativity","aICreativity"],["Desmarcation","aIDesmarcation"]]}
                    values={form as unknown as Record<string, unknown>}
                    onChange={(k,v) => setForm(prev => ({ ...prev, [k]: v }))}
                  />
                  <AttrSection title="Game Intelligence" color="#06B6D4"
                    attrs={[["Game Reading","aGIGameReading"],["Decision Making","aGIDecisionMaking"],["Spatial Awareness","aGISpatialAwareness"],["Tactical Discipline","aGITacticalDiscipline"],["Off-Ball Movement","aGIOffBallMovement"]]}
                    values={form as unknown as Record<string, unknown>}
                    onChange={(k,v) => setForm(prev => ({ ...prev, [k]: v }))}
                  />
                  <AttrSection title="Mental" color="#facc15"
                    attrs={[["Mentality","aMentality"],["Competitive","aCompetitive"],["Concentration","aConcentration"],["Composure","aComposure"],["Courage","aCourage"],["Leadership","aLeadership"],["Work Ethic","aWorkEthic"],["Team Work","aTeamWork"]]}
                    values={form as unknown as Record<string, unknown>}
                    onChange={(k,v) => setForm(prev => ({ ...prev, [k]: v }))}
                  />
                  <AttrSection title="Set Pieces" color="#8B5CF6"
                    attrs={[["Penalty","aSPPenalty"],["Corners","aSPCorners"],["Free Kicks","aSPFreeKicks"],["Long Throws","aSPLongThrows"]]}
                    values={form as unknown as Record<string, unknown>}
                    onChange={(k,v) => setForm(prev => ({ ...prev, [k]: v }))}
                  />
                </div>
              </div>
            </TabsContent>

          </Tabs>

          <DialogFooter className="px-6 py-3 flex-shrink-0 border-t border-white/5">
            {saveError && <p className="text-xs text-destructive w-full text-left">{saveError}</p>}
            <div className="flex gap-2 justify-end w-full">
              <Button variant="outline" onClick={() => { setDialogOpen(false); setSaveError(null) }}>Cancel</Button>
              <Button onClick={saveJogadorForm} disabled={!form.nome.trim() || form.posicoes.length === 0} className="bg-[#00D66C] hover:bg-[#00D66C]/90 text-black">
                {editingId ? "Save" : "Add"}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {profileJogador && (
        <AthleteProfileModal
          jogador={profileJogador}
          open={!!profileJogador}
          onClose={() => setProfileJogador(null)}
          onEdit={j => { setProfileJogador(null); openEdit(j) }}
          onReset={() => { setProfileJogador(null); setJogadores(getJogadores()) }}
        />
      )}
    </div>
  )
}
