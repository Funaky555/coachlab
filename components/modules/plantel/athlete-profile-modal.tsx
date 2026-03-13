"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Pencil, RotateCcw, User } from "lucide-react"
import { type Jogador, type EstadoJogador, getPresencasByJogador, getOcorrenciasByJogador, updateJogador } from "@/lib/storage/plantel"
import { getRegistosFisicosByJogador, type RegistoFisico } from "@/lib/storage/fisico"
import { getRegistosMedicosByJogador, type RegistoMedico } from "@/lib/storage/medico"

interface Props {
  jogador: Jogador
  open: boolean
  onClose: () => void
  onEdit: (j: Jogador) => void
  onReset: () => void
}

function calcIdade(dataNascimento?: string): string {
  if (!dataNascimento) return "—"
  const anos = Math.floor((Date.now() - new Date(dataNascimento).getTime()) / (365.25 * 24 * 3600 * 1000))
  return `${anos}`
}

const ESTADO_BORDER: Record<EstadoJogador, string> = {
  apto: "#00D66C",
  condicionado: "#FF6B35",
  lesionado: "#EF4444",
  indisponivel: "#6b7280",
}

function estadoBadge(estado: EstadoJogador) {
  const map = {
    apto: { bg: "rgba(0,214,108,0.15)", color: "#00D66C", label: "Fit" },
    condicionado: { bg: "rgba(255,107,53,0.15)", color: "#FF6B35", label: "Limited" },
    lesionado: { bg: "rgba(239,68,68,0.15)", color: "#EF4444", label: "Injured" },
    indisponivel: { bg: "rgba(107,114,128,0.15)", color: "#9ca3af", label: "Unavailable" },
  }
  const { bg, color, label } = map[estado] ?? map.apto
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border"
      style={{ background: bg, color, borderColor: `${color}40` }}>
      {label}
    </span>
  )
}

function getRatingInfo(v: number | undefined): { label: string; color: string } {
  if (v === undefined) return { label: "", color: "rgba(255,255,255,0.25)" }
  if (v <= 5)  return { label: "Poor",      color: "#EF4444" }
  if (v <= 10) return { label: "Average",   color: "#FF6B35" }
  if (v <= 14) return { label: "Good",      color: "#facc15" }
  if (v <= 18) return { label: "Excellent", color: "#00D66C" }
  return               { label: "Elite",    color: "#0066FF" }
}

function AttrSectionReadOnly({ title, icon, color, attrs, values }: {
  title: string
  icon: string
  color: string
  attrs: [string, string][]
  values: Record<string, unknown>
}) {
  return (
    <div className="rounded-2xl overflow-hidden"
      style={{
        border: `1.5px solid ${color}35`,
        background: `linear-gradient(160deg, ${color}10 0%, rgba(0,0,0,0.5) 100%)`,
        boxShadow: `0 0 20px ${color}10`,
      }}>
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2"
        style={{ background: `linear-gradient(90deg, ${color}28 0%, ${color}08 100%)`, borderBottom: `1px solid ${color}20` }}>
        <span className="text-base leading-none">{icon}</span>
        <span className="text-[11px] font-black uppercase tracking-wider" style={{ color }}>{title}</span>
      </div>

      {/* Atributos */}
      <div className="px-3 py-2 space-y-1.5">
        {attrs.map(([label, key]) => {
          const val = values[key] as number | undefined
          const { color: rColor } = getRatingInfo(val)
          return (
            <div key={key} className="flex items-center gap-2">
              {/* Label visível */}
              <span className="text-[10px] font-semibold shrink-0 w-[70px] truncate leading-none"
                style={{ color: "rgba(255,255,255,0.80)" }}>
                {label}
              </span>

              {/* Barras em 4 grupos de 5 */}
              <div className="flex gap-[3px] flex-1 items-center">
                {[0, 1, 2, 3].map(group => (
                  <div key={group} className="flex gap-[1.5px] flex-1">
                    {[0, 1, 2, 3, 4].map(seg => {
                      const i = group * 5 + seg
                      const filled = val !== undefined && i < val
                      const isLast = val !== undefined && i === val - 1
                      return (
                        <div
                          key={i}
                          className="h-[10px] flex-1 rounded-[2px]"
                          style={{
                            background: filled ? rColor : "rgba(255,255,255,0.07)",
                            boxShadow: isLast ? `0 0 6px ${rColor}CC` : undefined,
                          }}
                        />
                      )
                    })}
                  </div>
                ))}
              </div>

              {/* Badge valor */}
              <div className="shrink-0 w-7 h-5 rounded flex items-center justify-center text-[10px] font-black tabular-nums"
                style={{
                  background: val ? `${rColor}22` : "rgba(255,255,255,0.05)",
                  color: val ? rColor : "rgba(255,255,255,0.2)",
                  border: `1px solid ${val ? rColor + "45" : "rgba(255,255,255,0.08)"}`,
                }}>
                {val ?? "—"}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function InfoStat({ icon, label, value, color }: { icon: string; label: string; value: string; color?: string }) {
  return (
    <div className="flex items-start gap-2 py-1.5 border-b border-white/5 last:border-0">
      <span className="text-sm shrink-0 mt-0.5 leading-none">{icon}</span>
      <div>
        <div className="text-[8px] uppercase tracking-widest font-semibold text-white/35">{label}</div>
        <div className="text-[11px] font-bold leading-tight mt-0.5" style={{ color: color ?? "rgba(255,255,255,0.90)" }}>{value}</div>
      </div>
    </div>
  )
}

export function AthleteProfileModal({ jogador, open, onClose, onEdit, onReset }: Props) {
  const [presencas, setPresencas] = useState<ReturnType<typeof getPresencasByJogador>>([])
  const [ocorrencias, setOcorrencias] = useState<ReturnType<typeof getOcorrenciasByJogador>>([])
  const [fisico, setFisico] = useState<RegistoFisico[]>([])
  const [medico, setMedico] = useState<RegistoMedico[]>([])

  function handleReset() {
    updateJogador(jogador.id, {
      nome: "", alcunha: "", foto: "", dataNascimento: "", nacionalidade: "",
      altura: undefined, peso: undefined, pePreferido: undefined, notas: "",
      aOBallControl: undefined, aOFirstTouch: undefined, aOShortPass: undefined,
      aOLongPass: undefined, aOCrossing: undefined, aOHeading: undefined,
      aOFinishing: undefined, aODribbling: undefined, aOFeint: undefined,
      aDPositioning: undefined, aDDefensiveAwareness: undefined, aDMarcation: undefined,
      aDInterceptions: undefined, aDTackling: undefined, aDAerialDuels: undefined, aDAggression: undefined,
      aIPenetration: undefined, aIOffBall: undefined, aIVision: undefined,
      aIChanceCreation: undefined, aICreativity: undefined, aIDesmarcation: undefined,
      aSPPenalty: undefined, aSPCorners: undefined, aSPFreeKicks: undefined, aSPLongThrows: undefined,
      aPAcceleration: undefined, aPSprint: undefined, aPAgility: undefined,
      aPBalance: undefined, aPJumping: undefined, aPStrength: undefined, aPEndurance: undefined,
      aMentality: undefined, aCompetitive: undefined, aConcentration: undefined,
      aComposure: undefined, aCourage: undefined, aLeadership: undefined,
      aWorkEthic: undefined, aTeamWork: undefined,
      aGIGameReading: undefined, aGIDecisionMaking: undefined, aGISpatialAwareness: undefined,
      aGITacticalDiscipline: undefined, aGIOffBallMovement: undefined,
    })
    onReset()
  }

  useEffect(() => {
    if (!open) return
    setPresencas(getPresencasByJogador(jogador.id))
    setOcorrencias(getOcorrenciasByJogador(jogador.id))
    setFisico(getRegistosFisicosByJogador(jogador.id))
    setMedico(getRegistosMedicosByJogador(jogador.id))
  }, [open, jogador.id])

  const tipoPresencaLabel: Record<string, string> = { treino: "Training", ginasio: "Gym", reuniao: "Meeting", jogo: "Match" }
  const estadoPresencaLabel: Record<string, { label: string; color: string }> = {
    presente: { label: "Present", color: "text-[#00D66C]" },
    falta: { label: "Absent", color: "text-destructive" },
    atraso: { label: "Late", color: "text-[#FF6B35]" },
    justificado: { label: "Excused", color: "text-muted-foreground" },
  }
  const tipoLesaoLabel: Record<string, string> = { muscular: "Muscular", ossea: "Bone", ligamentar: "Ligament", articular: "Joint", outra: "Other" }
  const estadoLesaoLabel: Record<string, { label: string; color: string }> = {
    ativa: { label: "Active", color: "text-destructive" },
    em_recuperacao: { label: "Recovering", color: "text-[#FF6B35]" },
    recuperado: { label: "Recovered", color: "text-[#00D66C]" },
  }

  const jv = jogador as unknown as Record<string, unknown>
  const estadoBorderColor = ESTADO_BORDER[jogador.estado] ?? "#00D66C"
  const idade = calcIdade(jogador.dataNascimento)

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-5xl h-[92vh] flex flex-col overflow-hidden p-0 gap-0"
        style={{ background: "linear-gradient(160deg, #080d18 0%, #040609 100%)", border: "1.5px solid rgba(255,255,255,0.09)" }}>

        {/* Linha decorativa topo */}
        <div className="h-[3px] w-full flex-shrink-0"
          style={{ background: "linear-gradient(90deg, #00D66C, #0066FF, #8B5CF6, #00D66C)" }} />

        {/* ── HEADER ── */}
        <div className="flex items-center gap-4 px-5 py-4 border-b border-white/6 flex-shrink-0 relative overflow-hidden">
          {/* Número decorativo */}
          <div className="absolute right-4 top-0 text-[72px] font-black leading-none select-none pointer-events-none"
            style={{ color: `${estadoBorderColor}12`, fontFamily: "var(--font-barlow-condensed)" }}>
            {jogador.numero}
          </div>

          {/* Foto */}
          <div className="relative shrink-0">
            {jogador.foto ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={jogador.foto} alt={jogador.nome}
                className="w-16 h-16 rounded-full object-cover border-2"
                style={{ borderColor: estadoBorderColor }} />
            ) : (
              <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-black border-2"
                style={{ background: `${estadoBorderColor}15`, borderColor: estadoBorderColor, color: estadoBorderColor, fontFamily: "var(--font-barlow-condensed)" }}>
                {jogador.numero}
              </div>
            )}
            {/* Badge idade */}
            {idade !== "—" && (
              <div className="absolute -bottom-1 -right-1 text-[8px] font-black px-1 py-0.5 rounded-full"
                style={{ background: "#0066FF", color: "#fff" }}>
                {idade}
              </div>
            )}
          </div>

          {/* Nome + badges */}
          <div className="flex-1 min-w-0 relative z-10">
            <div className="text-2xl font-black tracking-tight text-white leading-tight">
              {jogador.nome}
            </div>
            {jogador.alcunha?.trim() && (
              <div className="text-xs font-medium mt-0.5" style={{ color: "rgba(255,255,255,0.40)" }}>
                &quot;{jogador.alcunha}&quot;
              </div>
            )}
            <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.35)" }}>
                #{jogador.numero}
              </span>
              {jogador.posicoes.map((p, i) => (
                <Badge key={p} variant={i === 0 ? "default" : "outline"}
                  className={i === 0
                    ? "text-[10px] py-0 px-1.5 hover:bg-[#00D66C]/15"
                    : "text-[10px] py-0 px-1.5"}
                  style={i === 0 ? { background: "rgba(0,214,108,0.15)", color: "#00D66C", borderColor: "rgba(0,214,108,0.30)" } : {}}>
                  {p}
                </Badge>
              ))}
              {estadoBadge(jogador.estado)}
            </div>
          </div>

          {/* Botões */}
          <div className="flex items-center gap-2 shrink-0 relative z-10">
            <Button size="sm" variant="outline"
              className="gap-1.5 text-xs h-7 px-2.5"
              style={{ borderColor: "rgba(239,68,68,0.35)", color: "#f87171" }}
              onClick={handleReset}>
              <RotateCcw className="w-3 h-3" /> Reset
            </Button>
            <Button size="sm" variant="outline"
              className="gap-1.5 text-xs h-7 px-2.5"
              style={{ borderColor: "rgba(0,102,255,0.35)", color: "#60a5fa" }}
              onClick={() => onEdit(jogador)}>
              <Pencil className="w-3 h-3" /> Edit
            </Button>
          </div>
        </div>

        {/* ── CORPO: Info + Atributos ── */}
        <div className="flex flex-1 min-h-0 overflow-hidden">

          {/* Coluna esquerda — INFO */}
          <div className="w-44 flex-shrink-0 border-r overflow-y-auto px-3 py-3"
            style={{ borderColor: "rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)" }}>
            <div className="text-[8px] font-black uppercase tracking-widest mb-2 flex items-center gap-1.5"
              style={{ color: "#00D66C" }}>
              <div className="w-3 h-0.5 rounded" style={{ background: "#00D66C" }} />
              Player Info
            </div>
            {idade !== "—" && <InfoStat icon="🎂" label="Age" value={`${idade} years`} />}
            {jogador.dataNascimento && <InfoStat icon="📅" label="Born" value={jogador.dataNascimento} />}
            {jogador.nacionalidade && <InfoStat icon="🌍" label="Country" value={jogador.nacionalidade} />}
            {jogador.altura && <InfoStat icon="📏" label="Height" value={`${jogador.altura} cm`} />}
            {jogador.peso && <InfoStat icon="⚖️" label="Weight" value={`${jogador.peso} kg`} />}
            {jogador.pePreferido && (
              <InfoStat icon="👟" label="Preferred Foot"
                value={jogador.pePreferido.charAt(0).toUpperCase() + jogador.pePreferido.slice(1)} />
            )}
            {!jogador.dataNascimento && !jogador.nacionalidade && !jogador.altura && !jogador.peso && !jogador.pePreferido && (
              <p className="text-[10px] text-white/20 italic mt-2">No info yet</p>
            )}
            {jogador.notas && (
              <div className="mt-3 pt-2 border-t border-white/5">
                <div className="text-[8px] uppercase tracking-widest font-semibold mb-1.5 text-white/30">📝 Notes</div>
                <p className="text-[10px] leading-relaxed text-white/55">{jogador.notas}</p>
              </div>
            )}
          </div>

          {/* Coluna direita — ATTRIBUTES */}
          <div className="flex-1 overflow-y-auto px-4 py-3">
            <div className="text-[8px] font-black uppercase tracking-widest mb-2.5 flex items-center gap-1.5"
              style={{ color: "#0066FF" }}>
              <div className="w-3 h-0.5 rounded" style={{ background: "#0066FF" }} />
              Attributes
            </div>

            {/* Linha 1: 3 colunas */}
            <div className="grid grid-cols-3 gap-2.5 mb-2.5">
              <AttrSectionReadOnly title="Offensive" icon="⚡" color="#00D66C"
                attrs={[["Ball Control","aOBallControl"],["First Touch","aOFirstTouch"],["Short Pass","aOShortPass"],["Long Pass","aOLongPass"],["Crossing","aOCrossing"],["Heading","aOHeading"],["Finishing","aOFinishing"],["Dribbling","aODribbling"],["Feint","aOFeint"]]}
                values={jv}
              />
              <AttrSectionReadOnly title="Defensive" icon="🛡️" color="#EF4444"
                attrs={[["Positioning","aDPositioning"],["Def. Awareness","aDDefensiveAwareness"],["Marcation","aDMarcation"],["Interceptions","aDInterceptions"],["Tackling","aDTackling"],["Aerial Duels","aDAerialDuels"],["Aggression","aDAggression"]]}
                values={jv}
              />
              <AttrSectionReadOnly title="Physical" icon="💪" color="#0066FF"
                attrs={[["Acceleration","aPAcceleration"],["Sprint","aPSprint"],["Agility","aPAgility"],["Balance","aPBalance"],["Jumping","aPJumping"],["Strength","aPStrength"],["Endurance","aPEndurance"]]}
                values={jv}
              />
            </div>

            {/* Linha 2: 4 colunas */}
            <div className="grid grid-cols-4 gap-2.5">
              <AttrSectionReadOnly title="Atk. Impact" icon="🎯" color="#FF6B35"
                attrs={[["Penetration","aIPenetration"],["Off Ball","aIOffBall"],["Vision","aIVision"],["Chance Creation","aIChanceCreation"],["Creativity","aICreativity"],["Desmarcation","aIDesmarcation"]]}
                values={jv}
              />
              <AttrSectionReadOnly title="Intelligence" icon="🧠" color="#06B6D4"
                attrs={[["Game Reading","aGIGameReading"],["Decision Making","aGIDecisionMaking"],["Spatial Aware.","aGISpatialAwareness"],["Tactical Disc.","aGITacticalDiscipline"],["Off-Ball Move.","aGIOffBallMovement"]]}
                values={jv}
              />
              <AttrSectionReadOnly title="Mental" icon="🔥" color="#facc15"
                attrs={[["Mentality","aMentality"],["Competitive","aCompetitive"],["Concentration","aConcentration"],["Composure","aComposure"],["Courage","aCourage"],["Leadership","aLeadership"],["Work Ethic","aWorkEthic"],["Team Work","aTeamWork"]]}
                values={jv}
              />
              <AttrSectionReadOnly title="Set Pieces" icon="⚽" color="#8B5CF6"
                attrs={[["Penalty","aSPPenalty"],["Corners","aSPCorners"],["Free Kicks","aSPFreeKicks"],["Long Throws","aSPLongThrows"]]}
                values={jv}
              />
            </div>
          </div>
        </div>

        {/* ── TABS INFERIORES ── */}
        <div className="flex-shrink-0 border-t"
          style={{ borderColor: "rgba(255,255,255,0.07)", background: "rgba(0,0,0,0.4)" }}>
          <Tabs defaultValue="fisico">
            <TabsList className="w-full rounded-none border-b bg-transparent h-9 px-4 gap-1"
              style={{ borderColor: "rgba(255,255,255,0.06)" }}>
              <TabsTrigger value="fisico"
                className="text-[11px] h-7 data-[state=active]:bg-[#0066FF]/15 data-[state=active]:text-[#60a5fa] data-[state=active]:border-[#0066FF]/30 data-[state=active]:border">
                💪 Physical {fisico.length > 0 && <span className="ml-1 text-[9px] opacity-50">({fisico.length})</span>}
              </TabsTrigger>
              <TabsTrigger value="medico"
                className="text-[11px] h-7 data-[state=active]:bg-[#EF4444]/15 data-[state=active]:text-[#f87171] data-[state=active]:border-[#EF4444]/30 data-[state=active]:border">
                🏥 Medical {medico.length > 0 && <span className="ml-1 text-[9px] opacity-50">({medico.length})</span>}
              </TabsTrigger>
              <TabsTrigger value="disciplina"
                className="text-[11px] h-7 data-[state=active]:bg-[#FF6B35]/15 data-[state=active]:text-[#fb923c] data-[state=active]:border-[#FF6B35]/30 data-[state=active]:border">
                🟡 Discipline {ocorrencias.length > 0 && <span className="ml-1 text-[9px] opacity-50">({ocorrencias.length})</span>}
              </TabsTrigger>
              <TabsTrigger value="presencas"
                className="text-[11px] h-7 data-[state=active]:bg-[#00D66C]/15 data-[state=active]:text-[#4ade80] data-[state=active]:border-[#00D66C]/30 data-[state=active]:border">
                📋 Attendance {presencas.length > 0 && <span className="ml-1 text-[9px] opacity-50">({presencas.length})</span>}
              </TabsTrigger>
            </TabsList>

            {/* FÍSICO */}
            <TabsContent value="fisico" className="px-4 py-2 max-h-44 overflow-y-auto mt-0">
              {fisico.length === 0 ? (
                <div className="flex items-center justify-center gap-2 py-6" style={{ color: "rgba(255,255,255,0.2)" }}>
                  <User className="w-4 h-4" />
                  <span className="text-xs">No physical records</span>
                </div>
              ) : (
                <div className="rounded-lg overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
                  <Table>
                    <TableHeader>
                      <TableRow className="border-white/6 hover:bg-transparent">
                        {["Date","Duration","Distance","Sprints","RPE","Max HR"].map(h => (
                          <TableHead key={h} className="text-[10px] py-1.5 text-white/40">{h}</TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {fisico.sort((a, b) => b.data.localeCompare(a.data)).map(r => (
                        <TableRow key={r.id} className="border-white/5">
                          <TableCell className="text-xs py-1 text-white/80">{r.data}</TableCell>
                          <TableCell className="text-xs py-1 text-white/50">{r.duracao ? `${r.duracao} min` : "—"}</TableCell>
                          <TableCell className="text-xs py-1 text-white/50">{r.distancia ? `${r.distancia} km` : "—"}</TableCell>
                          <TableCell className="text-xs py-1 text-white/50">{r.sprints ?? "—"}</TableCell>
                          <TableCell className="text-xs py-1 text-white/50">{r.rpe ?? "—"}</TableCell>
                          <TableCell className="text-xs py-1 text-white/50">{r.fcMax ? `${r.fcMax} bpm` : "—"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>

            {/* MÉDICO */}
            <TabsContent value="medico" className="px-4 py-2 max-h-44 overflow-y-auto mt-0">
              {medico.length === 0 ? (
                <div className="flex items-center justify-center gap-2 py-6" style={{ color: "rgba(255,255,255,0.2)" }}>
                  <User className="w-4 h-4" />
                  <span className="text-xs">No medical records</span>
                </div>
              ) : (
                <div className="space-y-2">
                  {medico.sort((a, b) => b.dataInicio.localeCompare(a.dataInicio)).map(r => (
                    <div key={r.id} className="rounded-lg p-3" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                      <div className="flex items-start justify-between gap-3 mb-1">
                        <div>
                          <span className="font-medium text-xs text-white/90">{tipoLesaoLabel[r.tipo]} — {r.localizacao}</span>
                          <div className="text-[10px] text-white/40 mt-0.5">{r.dataInicio}{r.dataRetorno ? ` → ${r.dataRetorno}` : ""}</div>
                        </div>
                        <span className={`text-[10px] font-medium ${estadoLesaoLabel[r.estado].color}`}>{estadoLesaoLabel[r.estado].label}</span>
                      </div>
                      <p className="text-[10px] text-white/55">{r.descricao}</p>
                      {r.tratamento && <p className="text-[9px] text-white/40 mt-1"><span className="font-medium">Treatment:</span> {r.tratamento}</p>}
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* DISCIPLINA */}
            <TabsContent value="disciplina" className="px-4 py-2 max-h-44 overflow-y-auto mt-0">
              {ocorrencias.length === 0 ? (
                <div className="flex items-center justify-center gap-2 py-6" style={{ color: "rgba(255,255,255,0.2)" }}>
                  <User className="w-4 h-4" />
                  <span className="text-xs">No disciplinary records</span>
                </div>
              ) : (
                <div className="space-y-2">
                  {ocorrencias.sort((a, b) => b.data.localeCompare(a.data)).map(o => (
                    <div key={o.id} className="rounded-lg p-3" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] text-white/40">{o.data}</span>
                        <span className={`text-[10px] font-medium capitalize ${o.gravidade === "grave" ? "text-red-400" : o.gravidade === "moderada" ? "text-orange-400" : "text-white/45"}`}>{o.gravidade}</span>
                      </div>
                      <div className="font-medium text-xs text-white/85 capitalize">{o.tipo.replace("_", " ")}</div>
                      <p className="text-[10px] text-white/50 mt-0.5">{o.descricao}</p>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* PRESENÇAS */}
            <TabsContent value="presencas" className="px-4 py-2 max-h-44 overflow-y-auto mt-0">
              {presencas.length === 0 ? (
                <div className="flex items-center justify-center gap-2 py-6" style={{ color: "rgba(255,255,255,0.2)" }}>
                  <User className="w-4 h-4" />
                  <span className="text-xs">No attendance records</span>
                </div>
              ) : (
                <div className="rounded-lg overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
                  <Table>
                    <TableHeader>
                      <TableRow className="border-white/6 hover:bg-transparent">
                        {["Date","Type","Status","Notes"].map(h => (
                          <TableHead key={h} className="text-[10px] py-1.5 text-white/40">{h}</TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {presencas.sort((a, b) => b.data.localeCompare(a.data)).map(p => (
                        <TableRow key={p.id} className="border-white/5">
                          <TableCell className="text-xs py-1 text-white/80">{p.data}</TableCell>
                          <TableCell className="text-xs py-1 text-white/50">{tipoPresencaLabel[p.tipo] ?? p.tipo}</TableCell>
                          <TableCell className={`text-xs py-1 font-medium ${estadoPresencaLabel[p.estado]?.color ?? ""}`}>{estadoPresencaLabel[p.estado]?.label ?? p.estado}</TableCell>
                          <TableCell className="text-xs py-1 text-white/40">{p.notas ?? "—"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

      </DialogContent>
    </Dialog>
  )
}
