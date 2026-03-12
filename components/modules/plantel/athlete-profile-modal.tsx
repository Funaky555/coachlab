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
  return `${anos} yrs`
}

function estadoBadge(estado: EstadoJogador) {
  const map = {
    apto: { className: "bg-[#00D66C]/20 text-[#00D66C] border-[#00D66C]/30", label: "Fit" },
    condicionado: { className: "bg-[#FF6B35]/20 text-[#FF6B35] border-[#FF6B35]/30", label: "Limited" },
    lesionado: { className: "bg-destructive/20 text-destructive border-destructive/30", label: "Injured" },
    indisponivel: { className: "bg-muted/40 text-muted-foreground border-border", label: "Unavailable" },
  }
  const { className, label } = map[estado] ?? map.apto
  return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${className}`}>{label}</span>
}

function getRatingInfo(v: number | undefined): { label: string; color: string } {
  if (v === undefined) return { label: "", color: "rgba(255,255,255,0.25)" }
  if (v <= 5)  return { label: "Poor",      color: "#EF4444" }
  if (v <= 10) return { label: "Average",   color: "#FF6B35" }
  if (v <= 14) return { label: "Good",      color: "#facc15" }
  if (v <= 18) return { label: "Excellent", color: "#00D66C" }
  return               { label: "Elite",    color: "#0066FF" }
}

function AttrSectionReadOnly({ title, color, attrs, values }: {
  title: string; color: string
  attrs: [string, string][]
  values: Record<string, unknown>
}) {
  return (
    <div className="rounded-xl overflow-hidden border" style={{ borderColor: `${color}22`, background: `linear-gradient(135deg, ${color}08 0%, transparent 70%)` }}>
      <div className="flex items-center gap-1.5 px-3 py-1.5 border-b" style={{ borderColor: `${color}15`, background: `${color}12` }}>
        <div className="w-1 h-3 rounded-full shrink-0" style={{ background: color }} />
        <span className="text-[9px] font-black uppercase tracking-widest" style={{ color }}>{title}</span>
      </div>
      <div className="px-2 py-1.5 space-y-1">
        {attrs.map(([label, key]) => {
          const val = values[key] as number | undefined
          const { color: rColor } = getRatingInfo(val)
          return (
            <div key={key} className="flex items-center gap-1.5">
              <span className="text-[8px] text-white/40 shrink-0 w-[62px] truncate leading-none">{label}</span>
              <div className="flex gap-[1.5px] flex-1">
                {Array.from({ length: 20 }, (_, i) => {
                  const filled = val !== undefined && i < val
                  const isLast = val !== undefined && i === val - 1
                  return (
                    <div
                      key={i}
                      className="h-2 flex-1 rounded-[1.5px]"
                      style={{
                        background: filled ? rColor : 'rgba(255,255,255,0.06)',
                        boxShadow: isLast ? `0 0 4px ${rColor}88` : undefined,
                      }}
                    />
                  )
                })}
              </div>
              <span className="text-[9px] font-bold w-5 text-right shrink-0 tabular-nums"
                style={{ color: val ? rColor : 'rgba(255,255,255,0.15)' }}>
                {val ?? '—'}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 py-1.5 border-b border-white/5 last:border-0">
      <span className="text-[8px] uppercase tracking-widest text-white/35 font-semibold">{label}</span>
      <span className="text-[11px] font-semibold text-white/90 leading-tight">{value}</span>
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

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-5xl h-[92vh] flex flex-col overflow-hidden p-0 gap-0 border-white/10"
        style={{ background: "linear-gradient(160deg, #0a0f1a 0%, #050810 100%)" }}>

        {/* ── HEADER ── */}
        <div className="flex items-center gap-4 px-5 py-4 border-b border-white/8 flex-shrink-0"
          style={{ background: "linear-gradient(135deg, rgba(0,214,108,0.06) 0%, rgba(0,102,255,0.06) 100%)" }}>

          {/* Foto */}
          {jogador.foto ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={jogador.foto} alt={jogador.nome}
              className="w-16 h-16 rounded-full object-cover shrink-0 border-2"
              style={{ borderColor: "#00D66C55" }} />
          ) : (
            <div className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-black shrink-0 border-2"
              style={{ background: "rgba(0,214,108,0.1)", borderColor: "#00D66C44", color: "#00D66C", fontFamily: "var(--font-barlow-condensed)" }}>
              {jogador.numero}
            </div>
          )}

          {/* Nome + info */}
          <div className="flex-1 min-w-0">
            <div className="text-xl font-black tracking-tight text-white leading-tight">
              {jogador.nome}
            </div>
            {jogador.alcunha?.trim() && (
              <div className="text-xs text-white/45 font-medium mt-0.5">&quot;{jogador.alcunha}&quot;</div>
            )}
            <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
              <span className="text-[10px] font-bold text-white/30 bg-white/5 px-1.5 py-0.5 rounded">#{jogador.numero}</span>
              {jogador.posicoes.map((p, i) => (
                <Badge key={p} variant={i === 0 ? "default" : "outline"}
                  className={i === 0 ? "text-[10px] py-0 px-1.5 bg-[#00D66C]/15 text-[#00D66C] border-[#00D66C]/30 hover:bg-[#00D66C]/15" : "text-[10px] py-0 px-1.5"}>
                  {p}
                </Badge>
              ))}
              {estadoBadge(jogador.estado)}
            </div>
          </div>

          {/* Botões */}
          <div className="flex items-center gap-2 shrink-0">
            <Button size="sm" variant="outline"
              className="gap-1.5 border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs h-7 px-2.5"
              onClick={handleReset}>
              <RotateCcw className="w-3 h-3" /> Reset
            </Button>
            <Button size="sm" variant="outline"
              className="gap-1.5 border-[#0066FF]/30 text-[#0066FF] hover:bg-[#0066FF]/10 text-xs h-7 px-2.5"
              onClick={() => onEdit(jogador)}>
              <Pencil className="w-3 h-3" /> Edit
            </Button>
          </div>
        </div>

        {/* ── CORPO: Info + Atributos ── */}
        <div className="flex flex-1 min-h-0 overflow-hidden">

          {/* Coluna esquerda — INFO */}
          <div className="w-44 flex-shrink-0 border-r border-white/6 overflow-y-auto px-3 py-3"
            style={{ background: "rgba(0,0,0,0.25)" }}>
            <div className="text-[8px] font-black uppercase tracking-widest text-[#00D66C] mb-2 flex items-center gap-1">
              <div className="w-3 h-0.5 rounded bg-[#00D66C]" />
              Player Info
            </div>
            <InfoRow label="Age" value={calcIdade(jogador.dataNascimento)} />
            <InfoRow label="Born" value={jogador.dataNascimento ?? "—"} />
            <InfoRow label="Country" value={jogador.nacionalidade ?? "—"} />
            <InfoRow label="Height" value={jogador.altura ? `${jogador.altura} cm` : "—"} />
            <InfoRow label="Weight" value={jogador.peso ? `${jogador.peso} kg` : "—"} />
            <InfoRow label="Foot" value={jogador.pePreferido ? (jogador.pePreferido.charAt(0).toUpperCase() + jogador.pePreferido.slice(1)) : "—"} />
            {jogador.notas && (
              <div className="mt-2 pt-2 border-t border-white/5">
                <div className="text-[8px] uppercase tracking-widest text-white/30 font-semibold mb-1">Notes</div>
                <p className="text-[10px] text-white/60 leading-relaxed">{jogador.notas}</p>
              </div>
            )}
          </div>

          {/* Coluna direita — ATTRIBUTES */}
          <div className="flex-1 overflow-y-auto px-4 py-3">
            <div className="text-[8px] font-black uppercase tracking-widest text-[#0066FF] mb-2 flex items-center gap-1">
              <div className="w-3 h-0.5 rounded bg-[#0066FF]" />
              Attributes
            </div>

            {/* Linha 1: Offensive | Defensive | Physical */}
            <div className="grid grid-cols-3 gap-2 mb-2">
              <AttrSectionReadOnly title="Offensive" color="#00D66C"
                attrs={[["Ball Control","aOBallControl"],["First Touch","aOFirstTouch"],["Short Pass","aOShortPass"],["Long Pass","aOLongPass"],["Crossing","aOCrossing"],["Heading","aOHeading"],["Finishing","aOFinishing"],["Dribbling","aODribbling"],["Feint","aOFeint"]]}
                values={jv}
              />
              <AttrSectionReadOnly title="Defensive" color="#EF4444"
                attrs={[["Positioning","aDPositioning"],["Def. Awareness","aDDefensiveAwareness"],["Marcation","aDMarcation"],["Interceptions","aDInterceptions"],["Tackling","aDTackling"],["Aerial Duels","aDAerialDuels"],["Aggression","aDAggression"]]}
                values={jv}
              />
              <AttrSectionReadOnly title="Physical" color="#0066FF"
                attrs={[["Acceleration","aPAcceleration"],["Sprint","aPSprint"],["Agility","aPAgility"],["Balance","aPBalance"],["Jumping","aPJumping"],["Strength","aPStrength"],["Endurance","aPEndurance"]]}
                values={jv}
              />
            </div>

            {/* Linha 2: Attacking Impact | Game Intelligence | Mental | Set Pieces */}
            <div className="grid grid-cols-4 gap-2">
              <AttrSectionReadOnly title="Attacking Impact" color="#FF6B35"
                attrs={[["Penetration","aIPenetration"],["Off Ball","aIOffBall"],["Vision","aIVision"],["Chance Creation","aIChanceCreation"],["Creativity","aICreativity"],["Desmarcation","aIDesmarcation"]]}
                values={jv}
              />
              <AttrSectionReadOnly title="Game Intelligence" color="#06B6D4"
                attrs={[["Game Reading","aGIGameReading"],["Decision Making","aGIDecisionMaking"],["Spatial Awareness","aGISpatialAwareness"],["Tactical Discipline","aGITacticalDiscipline"],["Off-Ball Movement","aGIOffBallMovement"]]}
                values={jv}
              />
              <AttrSectionReadOnly title="Mental" color="#facc15"
                attrs={[["Mentality","aMentality"],["Competitive","aCompetitive"],["Concentration","aConcentration"],["Composure","aComposure"],["Courage","aCourage"],["Leadership","aLeadership"],["Work Ethic","aWorkEthic"],["Team Work","aTeamWork"]]}
                values={jv}
              />
              <AttrSectionReadOnly title="Set Pieces" color="#8B5CF6"
                attrs={[["Penalty","aSPPenalty"],["Corners","aSPCorners"],["Free Kicks","aSPFreeKicks"],["Long Throws","aSPLongThrows"]]}
                values={jv}
              />
            </div>
          </div>
        </div>

        {/* ── TABS INFERIORES ── */}
        <div className="flex-shrink-0 border-t border-white/8"
          style={{ background: "rgba(0,0,0,0.35)" }}>
          <Tabs defaultValue="fisico">
            <TabsList className="w-full rounded-none border-b border-white/6 bg-transparent h-9 px-4 gap-1">
              <TabsTrigger value="fisico" className="text-[11px] h-7 data-[state=active]:bg-[#0066FF]/15 data-[state=active]:text-[#0066FF]">
                Physical {fisico.length > 0 && <span className="ml-1 text-[9px] opacity-50">({fisico.length})</span>}
              </TabsTrigger>
              <TabsTrigger value="medico" className="text-[11px] h-7 data-[state=active]:bg-[#EF4444]/15 data-[state=active]:text-[#EF4444]">
                Medical {medico.length > 0 && <span className="ml-1 text-[9px] opacity-50">({medico.length})</span>}
              </TabsTrigger>
              <TabsTrigger value="disciplina" className="text-[11px] h-7 data-[state=active]:bg-[#FF6B35]/15 data-[state=active]:text-[#FF6B35]">
                Discipline {ocorrencias.length > 0 && <span className="ml-1 text-[9px] opacity-50">({ocorrencias.length})</span>}
              </TabsTrigger>
              <TabsTrigger value="presencas" className="text-[11px] h-7 data-[state=active]:bg-[#00D66C]/15 data-[state=active]:text-[#00D66C]">
                Attendance {presencas.length > 0 && <span className="ml-1 text-[9px] opacity-50">({presencas.length})</span>}
              </TabsTrigger>
            </TabsList>

            {/* FÍSICO */}
            <TabsContent value="fisico" className="px-4 py-2 max-h-44 overflow-y-auto mt-0">
              {fisico.length === 0 ? (
                <div className="flex items-center justify-center gap-2 py-6 text-white/25">
                  <User className="w-4 h-4" />
                  <span className="text-xs">No physical records</span>
                </div>
              ) : (
                <div className="rounded-lg border border-white/8 overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-white/8 hover:bg-transparent">
                        <TableHead className="text-[10px] py-1.5">Date</TableHead>
                        <TableHead className="text-[10px] py-1.5">Duration</TableHead>
                        <TableHead className="text-[10px] py-1.5">Distance</TableHead>
                        <TableHead className="text-[10px] py-1.5">Sprints</TableHead>
                        <TableHead className="text-[10px] py-1.5">RPE</TableHead>
                        <TableHead className="text-[10px] py-1.5">Max HR</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {fisico.sort((a, b) => b.data.localeCompare(a.data)).map(r => (
                        <TableRow key={r.id} className="border-white/5">
                          <TableCell className="text-xs py-1">{r.data}</TableCell>
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
                <div className="flex items-center justify-center gap-2 py-6 text-white/25">
                  <User className="w-4 h-4" />
                  <span className="text-xs">No medical records</span>
                </div>
              ) : (
                <div className="space-y-2">
                  {medico.sort((a, b) => b.dataInicio.localeCompare(a.dataInicio)).map(r => (
                    <div key={r.id} className="bg-white/4 rounded-lg p-3 border border-white/6">
                      <div className="flex items-start justify-between gap-3 mb-1">
                        <div>
                          <span className="font-medium text-xs">{tipoLesaoLabel[r.tipo]} — {r.localizacao}</span>
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
                <div className="flex items-center justify-center gap-2 py-6 text-white/25">
                  <User className="w-4 h-4" />
                  <span className="text-xs">No disciplinary records</span>
                </div>
              ) : (
                <div className="space-y-2">
                  {ocorrencias.sort((a, b) => b.data.localeCompare(a.data)).map(o => (
                    <div key={o.id} className="bg-white/4 rounded-lg p-3 border border-white/6">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] text-white/40">{o.data}</span>
                        <span className={`text-[10px] font-medium capitalize ${o.gravidade === "grave" ? "text-destructive" : o.gravidade === "moderada" ? "text-[#FF6B35]" : "text-white/50"}`}>{o.gravidade}</span>
                      </div>
                      <div className="font-medium text-xs capitalize">{o.tipo.replace("_", " ")}</div>
                      <p className="text-[10px] text-white/50 mt-0.5">{o.descricao}</p>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* PRESENÇAS */}
            <TabsContent value="presencas" className="px-4 py-2 max-h-44 overflow-y-auto mt-0">
              {presencas.length === 0 ? (
                <div className="flex items-center justify-center gap-2 py-6 text-white/25">
                  <User className="w-4 h-4" />
                  <span className="text-xs">No attendance records</span>
                </div>
              ) : (
                <div className="rounded-lg border border-white/8 overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-white/8 hover:bg-transparent">
                        <TableHead className="text-[10px] py-1.5">Date</TableHead>
                        <TableHead className="text-[10px] py-1.5">Type</TableHead>
                        <TableHead className="text-[10px] py-1.5">Status</TableHead>
                        <TableHead className="text-[10px] py-1.5">Notes</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {presencas.sort((a, b) => b.data.localeCompare(a.data)).map(p => (
                        <TableRow key={p.id} className="border-white/5">
                          <TableCell className="text-xs py-1">{p.data}</TableCell>
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
