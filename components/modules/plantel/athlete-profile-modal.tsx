"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Pencil, User, RotateCcw } from "lucide-react"
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

function calcIdade(dataNascimento?: string): string {
  if (!dataNascimento) return "—"
  const anos = Math.floor((Date.now() - new Date(dataNascimento).getTime()) / (365.25 * 24 * 3600 * 1000))
  return `${anos} yrs`
}

function getRatingInfo(v: number | undefined): { label: string; color: string } {
  if (v === undefined) return { label: "", color: "rgba(255,255,255,0.25)" }
  if (v <= 2) return { label: "Poor",      color: "#EF4444" }
  if (v <= 5) return { label: "Average",   color: "#FF6B35" }
  if (v <= 8) return { label: "Good",      color: "#facc15" }
  return             { label: "Excellent", color: "#00D66C" }
}

function AttrSectionReadOnly({ title, color, attrs, values }: {
  title: string; color: string;
  attrs: [string, string][];
  values: Record<string, unknown>;
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
                    <div
                      key={i}
                      className="h-2.5 flex-1 rounded-[2px]"
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

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-4">
            {jogador.foto ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={jogador.foto} alt={jogador.nome} className="w-14 h-14 rounded-full object-cover shrink-0 border-2 border-[#00D66C]/40" />
            ) : (
              <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center text-2xl font-bold shrink-0 border-2 border-border" style={{ fontFamily: "var(--font-barlow-condensed)" }}>
                {jogador.numero}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-xl">{jogador.nome}</DialogTitle>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className="text-sm text-muted-foreground">#{jogador.numero}</span>
                {jogador.posicoes.map((p, i) => (
                  <Badge key={p} variant={i === 0 ? "default" : "outline"} className={i === 0 ? "bg-[#00D66C]/20 text-[#00D66C] border-[#00D66C]/30 hover:bg-[#00D66C]/20" : "text-xs"}>{p}</Badge>
                ))}
                {estadoBadge(jogador.estado)}
              </div>
            </div>
            <Button size="sm" variant="outline" className="shrink-0 gap-1.5 border-red-500/40 text-red-400 hover:bg-red-500/10" onClick={handleReset}>
              <RotateCcw className="w-3.5 h-3.5" /> Reset
            </Button>
            <Button size="sm" variant="outline" className="shrink-0 gap-1.5" onClick={() => onEdit(jogador)}>
              <Pencil className="w-3.5 h-3.5" /> Edit
            </Button>
          </div>
        </DialogHeader>

        <Tabs defaultValue="info" className="mt-2">
          <TabsList className="w-full">
            <TabsTrigger value="info" className="flex-1">Info</TabsTrigger>
            <TabsTrigger value="attributes" className="flex-1">Attributes</TabsTrigger>
            <TabsTrigger value="fisico" className="flex-1">Physical {fisico.length > 0 && <span className="ml-1 text-xs opacity-60">({fisico.length})</span>}</TabsTrigger>
            <TabsTrigger value="medico" className="flex-1">Medical {medico.length > 0 && <span className="ml-1 text-xs opacity-60">({medico.length})</span>}</TabsTrigger>
            <TabsTrigger value="disciplina" className="flex-1">Discipline {ocorrencias.length > 0 && <span className="ml-1 text-xs opacity-60">({ocorrencias.length})</span>}</TabsTrigger>
            <TabsTrigger value="presencas" className="flex-1">Attendance {presencas.length > 0 && <span className="ml-1 text-xs opacity-60">({presencas.length})</span>}</TabsTrigger>
          </TabsList>

          {/* INFO */}
          <TabsContent value="info" className="mt-4">
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Age", value: calcIdade(jogador.dataNascimento) },
                { label: "Birth", value: jogador.dataNascimento ?? "—" },
                { label: "Country", value: jogador.nacionalidade ?? "—" },
                { label: "Height", value: jogador.altura ? `${jogador.altura} cm` : "—" },
                { label: "Weight", value: jogador.peso ? `${jogador.peso} kg` : "—" },
                { label: "Preferred foot", value: jogador.pePreferido ? (jogador.pePreferido.charAt(0).toUpperCase() + jogador.pePreferido.slice(1)) : "—" },
              ].map(({ label, value }) => (
                <div key={label} className="bg-muted/30 rounded-lg p-3">
                  <div className="text-xs text-muted-foreground mb-1">{label}</div>
                  <div className="font-medium text-sm">{value}</div>
                </div>
              ))}
            </div>
            {jogador.notas && (
              <div className="mt-4 bg-muted/30 rounded-lg p-3">
                <div className="text-xs text-muted-foreground mb-1">Notes</div>
                <div className="text-sm">{jogador.notas}</div>
              </div>
            )}
          </TabsContent>

          {/* ATTRIBUTES */}
          <TabsContent value="attributes" className="mt-4 space-y-2">
            {/* Linha 1: Offensive | Defensive | Physical */}
            <div className="grid grid-cols-3 gap-2">
              <AttrSectionReadOnly title="Offensive" color="#00D66C"
                attrs={[["Ball Control","aOBallControl"],["First Touch","aOFirstTouch"],["Short Pass","aOShortPass"],["Long Pass","aOLongPass"],["Crossing","aOCrossing"],["Heading","aOHeading"],["Finishing","aOFinishing"],["Dribbling","aODribbling"],["Feint","aOFeint"]]}
                values={jogador as unknown as Record<string, unknown>}
              />
              <AttrSectionReadOnly title="Defensive" color="#EF4444"
                attrs={[["Positioning","aDPositioning"],["Def. Awareness","aDDefensiveAwareness"],["Marcation","aDMarcation"],["Interceptions","aDInterceptions"],["Tackling","aDTackling"],["Aerial Duels","aDAerialDuels"],["Aggression","aDAggression"]]}
                values={jogador as unknown as Record<string, unknown>}
              />
              <AttrSectionReadOnly title="Physical" color="#0066FF"
                attrs={[["Acceleration","aPAcceleration"],["Sprint","aPSprint"],["Agility","aPAgility"],["Balance","aPBalance"],["Jumping","aPJumping"],["Strength","aPStrength"],["Endurance","aPEndurance"]]}
                values={jogador as unknown as Record<string, unknown>}
              />
            </div>
            {/* Linha 2: Attacking Impact | Game Intelligence | Mental | Set Pieces */}
            <div className="grid grid-cols-4 gap-2">
              <AttrSectionReadOnly title="Attacking Impact" color="#FF6B35"
                attrs={[["Penetration","aIPenetration"],["Off Ball","aIOffBall"],["Vision","aIVision"],["Chance Creation","aIChanceCreation"],["Creativity","aICreativity"],["Desmarcation","aIDesmarcation"]]}
                values={jogador as unknown as Record<string, unknown>}
              />
              <AttrSectionReadOnly title="Game Intelligence" color="#06B6D4"
                attrs={[["Game Reading","aGIGameReading"],["Decision Making","aGIDecisionMaking"],["Spatial Awareness","aGISpatialAwareness"],["Tactical Discipline","aGITacticalDiscipline"],["Off-Ball Movement","aGIOffBallMovement"]]}
                values={jogador as unknown as Record<string, unknown>}
              />
              <AttrSectionReadOnly title="Mental" color="#facc15"
                attrs={[["Mentality","aMentality"],["Competitive","aCompetitive"],["Concentration","aConcentration"],["Composure","aComposure"],["Courage","aCourage"],["Leadership","aLeadership"],["Work Ethic","aWorkEthic"],["Team Work","aTeamWork"]]}
                values={jogador as unknown as Record<string, unknown>}
              />
              <AttrSectionReadOnly title="Set Pieces" color="#8B5CF6"
                attrs={[["Penalty","aSPPenalty"],["Corners","aSPCorners"],["Free Kicks","aSPFreeKicks"],["Long Throws","aSPLongThrows"]]}
                values={jogador as unknown as Record<string, unknown>}
              />
            </div>
          </TabsContent>

          {/* FÍSICO */}
          <TabsContent value="fisico" className="mt-4">
            {fisico.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <User className="w-8 h-8 mb-2 opacity-30" />
                <p className="text-sm">No physical records</p>
                <p className="text-xs opacity-60">Add records in the Physical Monitoring module</p>
              </div>
            ) : (
              <div className="rounded-lg border border-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Distance</TableHead>
                      <TableHead>Sprints</TableHead>
                      <TableHead>RPE</TableHead>
                      <TableHead>Max HR</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fisico.sort((a, b) => b.data.localeCompare(a.data)).map(r => (
                      <TableRow key={r.id}>
                        <TableCell className="text-sm">{r.data}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{r.duracao ? `${r.duracao} min` : "—"}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{r.distancia ? `${r.distancia} km` : "—"}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{r.sprints ?? "—"}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{r.rpe ?? "—"}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{r.fcMax ? `${r.fcMax} bpm` : "—"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>

          {/* MÉDICO */}
          <TabsContent value="medico" className="mt-4">
            {medico.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <User className="w-8 h-8 mb-2 opacity-30" />
                <p className="text-sm">No medical records</p>
                <p className="text-xs opacity-60">Add records in the Medical Department module</p>
              </div>
            ) : (
              <div className="space-y-3">
                {medico.sort((a, b) => b.dataInicio.localeCompare(a.dataInicio)).map(r => (
                  <div key={r.id} className="bg-muted/30 rounded-lg p-4">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <span className="font-medium text-sm">{tipoLesaoLabel[r.tipo]} — {r.localizacao}</span>
                        <div className="text-xs text-muted-foreground mt-0.5">{r.dataInicio}{r.dataRetorno ? ` → ${r.dataRetorno}` : ""}</div>
                      </div>
                      <span className={`text-xs font-medium ${estadoLesaoLabel[r.estado].color}`}>{estadoLesaoLabel[r.estado].label}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{r.descricao}</p>
                    {r.tratamento && <p className="text-xs text-muted-foreground mt-1"><span className="font-medium">Treatment:</span> {r.tratamento}</p>}
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* DISCIPLINA */}
          <TabsContent value="disciplina" className="mt-4">
            {ocorrencias.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <User className="w-8 h-8 mb-2 opacity-30 text-[#00D66C]" />
                <p className="text-sm">No disciplinary records</p>
              </div>
            ) : (
              <div className="space-y-3">
                {ocorrencias.sort((a, b) => b.data.localeCompare(a.data)).map(o => (
                  <div key={o.id} className="bg-muted/30 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-muted-foreground">{o.data}</span>
                      <span className={`text-xs font-medium capitalize ${o.gravidade === "grave" ? "text-destructive" : o.gravidade === "moderada" ? "text-[#FF6B35]" : "text-muted-foreground"}`}>{o.gravidade}</span>
                    </div>
                    <div className="font-medium text-sm capitalize">{o.tipo.replace("_", " ")}</div>
                    <p className="text-sm text-muted-foreground mt-1">{o.descricao}</p>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* PRESENÇAS */}
          <TabsContent value="presencas" className="mt-4">
            {presencas.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <User className="w-8 h-8 mb-2 opacity-30" />
                <p className="text-sm">No attendance records</p>
              </div>
            ) : (
              <div className="rounded-lg border border-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {presencas.sort((a, b) => b.data.localeCompare(a.data)).map(p => (
                      <TableRow key={p.id}>
                        <TableCell className="text-sm">{p.data}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{tipoPresencaLabel[p.tipo] ?? p.tipo}</TableCell>
                        <TableCell className={`text-sm font-medium ${estadoPresencaLabel[p.estado]?.color ?? ""}`}>{estadoPresencaLabel[p.estado]?.label ?? p.estado}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{p.notas ?? "—"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
