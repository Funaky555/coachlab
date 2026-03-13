"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Pencil, RotateCcw, ChevronRight, User } from "lucide-react"
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

function getRatingInfo(v: number | undefined): { color: string } {
  if (v === undefined) return { color: "rgba(255,255,255,0.12)" }
  if (v <= 5)  return { color: "#EF4444" }
  if (v <= 10) return { color: "#FF6B35" }
  if (v <= 14) return { color: "#facc15" }
  if (v <= 18) return { color: "#00D66C" }
  return               { color: "#0066FF" }
}

/* ── Barra de atributo (leitura) ── */
function AttrRow({ label, keyName, values }: { label: string; keyName: string; values: Record<string, unknown> }) {
  const val = values[keyName] as number | undefined
  const { color } = getRatingInfo(val)
  return (
    <div className="flex items-center gap-2 py-[3px]">
      <span className="text-[10px] font-medium shrink-0 w-[74px] truncate" style={{ color: "rgba(255,255,255,0.78)" }}>
        {label}
      </span>
      {/* Barra sólida */}
      <div className="relative flex-1 h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
        <div className="absolute inset-y-0 left-0 rounded-full"
          style={{
            width: val ? `${(val / 20) * 100}%` : "0%",
            background: color,
            boxShadow: val ? `0 0 6px ${color}80` : undefined,
            transition: "width 0.35s ease",
          }}
        />
      </div>
      {/* Badge valor */}
      <div className="shrink-0 w-7 h-[18px] rounded text-[9px] font-black flex items-center justify-center tabular-nums"
        style={{
          background: val ? `${color}20` : "rgba(255,255,255,0.04)",
          color: val ? color : "rgba(255,255,255,0.18)",
          border: `1px solid ${val ? color + "40" : "rgba(255,255,255,0.07)"}`,
        }}>
        {val ?? "—"}
      </div>
    </div>
  )
}

/* ── Secção de atributos ── */
function AttrSection({ title, icon, color, attrs, values }: {
  title: string; icon: string; color: string
  attrs: [string, string][]
  values: Record<string, unknown>
}) {
  return (
    <div className="rounded-2xl overflow-hidden"
      style={{ border: `1.5px solid ${color}30`, background: `linear-gradient(160deg, ${color}0C 0%, rgba(0,0,0,0.5) 100%)` }}>
      <div className="flex items-center gap-2 px-3 py-2"
        style={{ background: `linear-gradient(90deg, ${color}25 0%, ${color}06 100%)`, borderBottom: `1px solid ${color}18` }}>
        <span className="text-sm leading-none">{icon}</span>
        <span className="text-[11px] font-black uppercase tracking-wider" style={{ color }}>{title}</span>
      </div>
      <div className="px-3 py-2">
        {attrs.map(([label, key]) => <AttrRow key={key} label={label} keyName={key} values={values} />)}
      </div>
    </div>
  )
}

/* ── Info row sidebar ── */
function InfoRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2 py-1.5 border-b border-white/5 last:border-0">
      <span className="text-sm shrink-0 leading-tight mt-0.5">{icon}</span>
      <div>
        <div className="text-[8px] uppercase tracking-widest font-bold text-white/30">{label}</div>
        <div className="text-[11px] font-semibold text-white/85 leading-snug mt-0.5">{value}</div>
      </div>
    </div>
  )
}

/* ── Accordion sidebar ── */
function AccordionSection({ icon, title, count, open, onToggle, children }: {
  icon: string; title: string; count: number
  open: boolean; onToggle: () => void; children: React.ReactNode
}) {
  return (
    <div className="border-t border-white/6">
      <button
        onClick={onToggle}
        className="flex items-center justify-between w-full px-3 py-2.5 hover:bg-white/4 transition-colors text-left">
        <div className="flex items-center gap-2">
          <span className="text-sm">{icon}</span>
          <span className="text-[11px] font-bold text-white/75">{title}</span>
          {count > 0 && (
            <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full"
              style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.45)" }}>
              {count}
            </span>
          )}
        </div>
        <ChevronRight className="w-3.5 h-3.5 text-white/30 transition-transform duration-200"
          style={{ transform: open ? "rotate(90deg)" : "rotate(0deg)" }} />
      </button>
      {open && (
        <div className="px-3 pb-3">
          {children}
        </div>
      )}
    </div>
  )
}

/* ══════════════════════════════════════════ */
export function AthleteProfileModal({ jogador, open, onClose, onEdit, onReset }: Props) {
  const [presencas, setPresencas] = useState<ReturnType<typeof getPresencasByJogador>>([])
  const [ocorrencias, setOcorrencias] = useState<ReturnType<typeof getOcorrenciasByJogador>>([])
  const [fisico, setFisico] = useState<RegistoFisico[]>([])
  const [medico, setMedico] = useState<RegistoMedico[]>([])
  const [accordionOpen, setAccordionOpen] = useState<string | null>(null)

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
    ativa: { label: "Active", color: "text-[#EF4444]" },
    em_recuperacao: { label: "Recovering", color: "text-[#FF6B35]" },
    recuperado: { label: "Recovered", color: "text-[#00D66C]" },
  }

  const jv = jogador as unknown as Record<string, unknown>
  const estadoBorderColor = ESTADO_BORDER[jogador.estado] ?? "#00D66C"
  const idade = calcIdade(jogador.dataNascimento)

  const toggle = (id: string) => setAccordionOpen(prev => prev === id ? null : id)

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-5xl h-[92vh] flex flex-col overflow-hidden p-0 gap-0"
        style={{ background: "linear-gradient(160deg, #080d18 0%, #040609 100%)", border: "1.5px solid rgba(255,255,255,0.09)" }}>

        {/* Linha decorativa topo */}
        <div className="h-[3px] flex-shrink-0"
          style={{ background: "linear-gradient(90deg, #00D66C, #0066FF, #8B5CF6, #FF6B35, #00D66C)" }} />

        {/* ── HEADER ── */}
        <div className="flex items-center gap-4 px-5 py-3.5 border-b flex-shrink-0 relative overflow-hidden"
          style={{ borderColor: "rgba(255,255,255,0.06)" }}>
          {/* Número decorativo */}
          <div className="absolute right-5 top-0 text-[64px] font-black leading-none select-none pointer-events-none"
            style={{ color: `${estadoBorderColor}10`, fontFamily: "var(--font-barlow-condensed)" }}>
            {jogador.numero}
          </div>

          {/* Foto */}
          <div className="relative shrink-0">
            {jogador.foto ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={jogador.foto} alt={jogador.nome}
                className="w-14 h-14 rounded-full object-cover border-2"
                style={{ borderColor: estadoBorderColor }} />
            ) : (
              <div className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-black border-2"
                style={{ background: `${estadoBorderColor}15`, borderColor: estadoBorderColor, color: estadoBorderColor, fontFamily: "var(--font-barlow-condensed)" }}>
                {jogador.numero}
              </div>
            )}
            {idade !== "—" && (
              <div className="absolute -bottom-1 -right-1 text-[8px] font-black px-1 py-0.5 rounded-full"
                style={{ background: "#0066FF", color: "#fff" }}>
                {idade}
              </div>
            )}
          </div>

          {/* Nome */}
          <div className="flex-1 min-w-0 relative z-10">
            <div className="text-xl font-black tracking-tight text-white leading-tight">{jogador.nome}</div>
            {jogador.alcunha?.trim() && (
              <div className="text-xs font-medium mt-0.5" style={{ color: "rgba(255,255,255,0.38)" }}>
                &quot;{jogador.alcunha}&quot;
              </div>
            )}
            <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.30)" }}>
                #{jogador.numero}
              </span>
              {jogador.posicoes.map((p, i) => (
                <Badge key={p} variant={i === 0 ? "default" : "outline"}
                  className={i === 0 ? "text-[10px] py-0 px-1.5 hover:bg-[#00D66C]/15" : "text-[10px] py-0 px-1.5"}
                  style={i === 0 ? { background: "rgba(0,214,108,0.15)", color: "#00D66C", borderColor: "rgba(0,214,108,0.30)" } : {}}>
                  {p}
                </Badge>
              ))}
              {estadoBadge(jogador.estado)}
            </div>
          </div>

          {/* Botões */}
          <div className="flex items-center gap-2 shrink-0 relative z-10">
            <Button size="sm" variant="outline" className="gap-1.5 text-xs h-7 px-2.5"
              style={{ borderColor: "rgba(239,68,68,0.35)", color: "#f87171" }}
              onClick={handleReset}>
              <RotateCcw className="w-3 h-3" /> Reset
            </Button>
            <Button size="sm" variant="outline" className="gap-1.5 text-xs h-7 px-2.5"
              style={{ borderColor: "rgba(0,102,255,0.35)", color: "#60a5fa" }}
              onClick={() => onEdit(jogador)}>
              <Pencil className="w-3 h-3" /> Edit
            </Button>
          </div>
        </div>

        {/* ── CORPO ── */}
        <div className="flex flex-1 min-h-0 overflow-hidden">

          {/* ── SIDEBAR ESQUERDA ── */}
          <div className="w-56 flex-shrink-0 border-r overflow-y-auto"
            style={{ borderColor: "rgba(255,255,255,0.06)", background: "rgba(0,0,0,0.2)" }}>

            {/* PLAYER INFO */}
            <div className="px-3 py-3">
              <div className="text-[8px] font-black uppercase tracking-widest mb-2 flex items-center gap-1.5"
                style={{ color: "#00D66C" }}>
                <div className="w-3 h-0.5 rounded" style={{ background: "#00D66C" }} />
                Player Info
              </div>
              {idade !== "—" && <InfoRow icon="🎂" label="Age" value={`${idade} years old`} />}
              {jogador.dataNascimento && <InfoRow icon="📅" label="Born" value={jogador.dataNascimento} />}
              {jogador.nacionalidade && <InfoRow icon="🌍" label="Country" value={jogador.nacionalidade} />}
              {jogador.altura && <InfoRow icon="📏" label="Height" value={`${jogador.altura} cm`} />}
              {jogador.peso && <InfoRow icon="⚖️" label="Weight" value={`${jogador.peso} kg`} />}
              {jogador.pePreferido && (
                <InfoRow icon="👟" label="Preferred Foot"
                  value={jogador.pePreferido.charAt(0).toUpperCase() + jogador.pePreferido.slice(1)} />
              )}
              {!jogador.dataNascimento && !jogador.nacionalidade && !jogador.altura && !jogador.peso && !jogador.pePreferido && (
                <p className="text-[10px] italic mt-1" style={{ color: "rgba(255,255,255,0.18)" }}>No info added yet</p>
              )}
              {jogador.notas && (
                <div className="mt-2.5 pt-2 border-t border-white/5">
                  <div className="text-[8px] uppercase tracking-widest font-bold text-white/25 mb-1">📝 Notes</div>
                  <p className="text-[10px] leading-relaxed" style={{ color: "rgba(255,255,255,0.50)" }}>{jogador.notas}</p>
                </div>
              )}
            </div>

            {/* ACCORDION: Physical */}
            <AccordionSection icon="💪" title="Physical" count={fisico.length}
              open={accordionOpen === "fisico"} onToggle={() => toggle("fisico")}>
              {fisico.length === 0 ? (
                <div className="flex items-center gap-1.5 py-2" style={{ color: "rgba(255,255,255,0.20)" }}>
                  <User className="w-3 h-3" /><span className="text-[10px]">No records</span>
                </div>
              ) : (
                <div className="space-y-1.5">
                  {fisico.sort((a, b) => b.data.localeCompare(a.data)).slice(0, 5).map(r => (
                    <div key={r.id} className="rounded-lg p-2 text-[10px]"
                      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                      <div className="font-bold text-white/70 mb-1">{r.data}</div>
                      <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-white/45">
                        {r.duracao && <span>⏱ {r.duracao} min</span>}
                        {r.distancia && <span>📍 {r.distancia} km</span>}
                        {r.sprints && <span>⚡ {r.sprints} sprints</span>}
                        {r.rpe && <span>💥 RPE {r.rpe}</span>}
                        {r.fcMax && <span>❤️ {r.fcMax} bpm</span>}
                      </div>
                    </div>
                  ))}
                  {fisico.length > 5 && (
                    <p className="text-[9px] text-center" style={{ color: "rgba(255,255,255,0.25)" }}>+{fisico.length - 5} more records</p>
                  )}
                </div>
              )}
            </AccordionSection>

            {/* ACCORDION: Medical */}
            <AccordionSection icon="🏥" title="Medical" count={medico.length}
              open={accordionOpen === "medico"} onToggle={() => toggle("medico")}>
              {medico.length === 0 ? (
                <div className="flex items-center gap-1.5 py-2" style={{ color: "rgba(255,255,255,0.20)" }}>
                  <User className="w-3 h-3" /><span className="text-[10px]">No records</span>
                </div>
              ) : (
                <div className="space-y-1.5">
                  {medico.sort((a, b) => b.dataInicio.localeCompare(a.dataInicio)).map(r => (
                    <div key={r.id} className="rounded-lg p-2 text-[10px]"
                      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                      <div className="flex justify-between items-start mb-0.5">
                        <span className="font-bold text-white/75">{tipoLesaoLabel[r.tipo]}</span>
                        <span className={`text-[9px] font-medium ${estadoLesaoLabel[r.estado].color}`}>{estadoLesaoLabel[r.estado].label}</span>
                      </div>
                      <div className="text-white/40">{r.localizacao} · {r.dataInicio}</div>
                      <div className="text-white/50 mt-0.5 leading-snug">{r.descricao}</div>
                    </div>
                  ))}
                </div>
              )}
            </AccordionSection>

            {/* ACCORDION: Discipline */}
            <AccordionSection icon="🟡" title="Discipline" count={ocorrencias.length}
              open={accordionOpen === "disciplina"} onToggle={() => toggle("disciplina")}>
              {ocorrencias.length === 0 ? (
                <div className="flex items-center gap-1.5 py-2" style={{ color: "rgba(255,255,255,0.20)" }}>
                  <User className="w-3 h-3" /><span className="text-[10px]">No records</span>
                </div>
              ) : (
                <div className="space-y-1.5">
                  {ocorrencias.sort((a, b) => b.data.localeCompare(a.data)).map(o => (
                    <div key={o.id} className="rounded-lg p-2 text-[10px]"
                      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                      <div className="flex justify-between items-start mb-0.5">
                        <span className="font-bold text-white/75 capitalize">{o.tipo.replace("_", " ")}</span>
                        <span className={`text-[9px] font-bold capitalize ${o.gravidade === "grave" ? "text-red-400" : o.gravidade === "moderada" ? "text-orange-400" : "text-white/35"}`}>{o.gravidade}</span>
                      </div>
                      <div className="text-white/40">{o.data}</div>
                      <div className="text-white/50 mt-0.5 leading-snug">{o.descricao}</div>
                    </div>
                  ))}
                </div>
              )}
            </AccordionSection>

            {/* ACCORDION: Attendance */}
            <AccordionSection icon="📋" title="Attendance" count={presencas.length}
              open={accordionOpen === "presencas"} onToggle={() => toggle("presencas")}>
              {presencas.length === 0 ? (
                <div className="flex items-center gap-1.5 py-2" style={{ color: "rgba(255,255,255,0.20)" }}>
                  <User className="w-3 h-3" /><span className="text-[10px]">No records</span>
                </div>
              ) : (
                <div className="rounded-lg overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.06)" }}>
                  <Table>
                    <TableHeader>
                      <TableRow className="border-white/5 hover:bg-transparent">
                        <TableHead className="text-[9px] py-1 px-2 text-white/35">Date</TableHead>
                        <TableHead className="text-[9px] py-1 px-2 text-white/35">Type</TableHead>
                        <TableHead className="text-[9px] py-1 px-2 text-white/35">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {presencas.sort((a, b) => b.data.localeCompare(a.data)).slice(0, 10).map(p => (
                        <TableRow key={p.id} className="border-white/5">
                          <TableCell className="text-[10px] py-1 px-2 text-white/65">{p.data}</TableCell>
                          <TableCell className="text-[10px] py-1 px-2 text-white/40">{tipoPresencaLabel[p.tipo] ?? p.tipo}</TableCell>
                          <TableCell className={`text-[10px] py-1 px-2 font-medium ${estadoPresencaLabel[p.estado]?.color ?? ""}`}>{estadoPresencaLabel[p.estado]?.label ?? p.estado}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {presencas.length > 10 && (
                    <p className="text-[9px] text-center py-1" style={{ color: "rgba(255,255,255,0.25)" }}>+{presencas.length - 10} more</p>
                  )}
                </div>
              )}
            </AccordionSection>
          </div>

          {/* ── ÁREA DE ATRIBUTOS ── */}
          <div className="flex-1 overflow-y-auto px-4 py-3">
            <div className="text-[8px] font-black uppercase tracking-widest mb-3 flex items-center gap-1.5"
              style={{ color: "#0066FF" }}>
              <div className="w-3 h-0.5 rounded" style={{ background: "#0066FF" }} />
              Attributes
            </div>

            {/* Linha 1: 3 colunas */}
            <div className="grid grid-cols-3 gap-2.5 mb-2.5">
              <AttrSection title="Offensive" icon="⚡" color="#00D66C"
                attrs={[["Ball Control","aOBallControl"],["First Touch","aOFirstTouch"],["Short Pass","aOShortPass"],["Long Pass","aOLongPass"],["Crossing","aOCrossing"],["Heading","aOHeading"],["Finishing","aOFinishing"],["Dribbling","aODribbling"],["Feint","aOFeint"]]}
                values={jv}
              />
              <AttrSection title="Defensive" icon="🛡️" color="#EF4444"
                attrs={[["Positioning","aDPositioning"],["Def. Awareness","aDDefensiveAwareness"],["Marcation","aDMarcation"],["Interceptions","aDInterceptions"],["Tackling","aDTackling"],["Aerial Duels","aDAerialDuels"],["Aggression","aDAggression"]]}
                values={jv}
              />
              <AttrSection title="Physical" icon="💪" color="#0066FF"
                attrs={[["Acceleration","aPAcceleration"],["Sprint","aPSprint"],["Agility","aPAgility"],["Balance","aPBalance"],["Jumping","aPJumping"],["Strength","aPStrength"],["Endurance","aPEndurance"]]}
                values={jv}
              />
            </div>

            {/* Linha 2: 4 colunas */}
            <div className="grid grid-cols-4 gap-2.5">
              <AttrSection title="Atk. Impact" icon="🎯" color="#FF6B35"
                attrs={[["Penetration","aIPenetration"],["Off Ball","aIOffBall"],["Vision","aIVision"],["Chance Creation","aIChanceCreation"],["Creativity","aICreativity"],["Desmarcation","aIDesmarcation"]]}
                values={jv}
              />
              <AttrSection title="Intelligence" icon="🧠" color="#06B6D4"
                attrs={[["Game Reading","aGIGameReading"],["Decision Making","aGIDecisionMaking"],["Spatial Aware.","aGISpatialAwareness"],["Tactical Disc.","aGITacticalDiscipline"],["Off-Ball Move.","aGIOffBallMovement"]]}
                values={jv}
              />
              <AttrSection title="Mental" icon="🔥" color="#facc15"
                attrs={[["Mentality","aMentality"],["Competitive","aCompetitive"],["Concentration","aConcentration"],["Composure","aComposure"],["Courage","aCourage"],["Leadership","aLeadership"],["Work Ethic","aWorkEthic"],["Team Work","aTeamWork"]]}
                values={jv}
              />
              <AttrSection title="Set Pieces" icon="⚽" color="#8B5CF6"
                attrs={[["Penalty","aSPPenalty"],["Corners","aSPCorners"],["Free Kicks","aSPFreeKicks"],["Long Throws","aSPLongThrows"]]}
                values={jv}
              />
            </div>
          </div>
        </div>

      </DialogContent>
    </Dialog>
  )
}
