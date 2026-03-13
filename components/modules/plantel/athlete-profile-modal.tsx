"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Pencil, RotateCcw } from "lucide-react"
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
  if (v <= 15) return { color: "#facc15" }
  return               { color: "#00D66C" }
}

/* ── Barra de atributo compacta ── */
function AttrRow({ label, keyName, values }: { label: string; keyName: string; values: Record<string, unknown> }) {
  const val = values[keyName] as number | undefined
  const { color } = getRatingInfo(val)
  return (
    <div className="flex items-center gap-1.5 py-1">
      <span className="text-[11px] font-semibold shrink-0 w-[90px]" style={{ color: "rgba(255,255,255,0.68)" }}>
        {label}
      </span>
      <div className="relative w-28 h-[5px] rounded-full overflow-hidden shrink-0" style={{ background: "rgba(255,255,255,0.08)" }}>
        <div className="absolute inset-y-0 left-0 rounded-full"
          style={{
            width: val ? `${(val / 20) * 100}%` : "0%",
            background: color,
            boxShadow: val ? `0 0 2px ${color}40` : undefined,
          }} />
      </div>
      <div className="shrink-0 w-8 h-[18px] rounded text-[10px] font-black flex items-center justify-center tabular-nums"
        style={{
          background: val ? `${color}20` : "rgba(255,255,255,0.04)",
          color: val ? color : "rgba(255,255,255,0.18)",
          border: `1px solid ${val ? color + "35" : "rgba(255,255,255,0.06)"}`,
        }}>
        {val ?? "—"}
      </div>
    </div>
  )
}

/* ── Secção de atributos compacta ── */
function AttrSection({ title, icon, color, attrs, values }: {
  title: string; icon: string; color: string
  attrs: [string, string][]
  values: Record<string, unknown>
}) {
  return (
    <div className="rounded-xl overflow-hidden h-full flex flex-col"
      style={{ border: `1px solid ${color}28`, background: `linear-gradient(160deg, ${color}0A 0%, rgba(0,0,0,0.4) 100%)` }}>
      <div className="flex items-center gap-1.5 px-2.5 py-1.5"
        style={{ background: `linear-gradient(90deg, ${color}22 0%, ${color}05 100%)`, borderBottom: `1px solid ${color}15` }}>
        <span className="text-xs leading-none">{icon}</span>
        <span className="text-[9px] font-black uppercase tracking-wider" style={{ color }}>{title}</span>
      </div>
      <div className="px-2.5 py-1.5 flex-1 flex flex-col justify-evenly">
        {attrs.map(([label, key]) => <AttrRow key={key} label={label} keyName={key} values={values} />)}
      </div>
    </div>
  )
}


const FLAG_MAP: Record<string, string> = {
  "portugal": "🇵🇹", "espanha": "🇪🇸", "spain": "🇪🇸",
  "france": "🇫🇷", "franca": "🇫🇷", "frança": "🇫🇷", "germany": "🇩🇪", "alemanha": "🇩🇪",
  "brasil": "🇧🇷", "brazil": "🇧🇷", "england": "🏴󠁧󠁢󠁥󠁮󠁧󠁿", "inglaterra": "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
  "china": "🇨🇳", "argentina": "🇦🇷", "italy": "🇮🇹", "italia": "🇮🇹", "itália": "🇮🇹",
  "netherlands": "🇳🇱", "holanda": "🇳🇱", "belgium": "🇧🇪", "belgica": "🇧🇪", "bélgica": "🇧🇪",
  "usa": "🇺🇸", "estados unidos": "🇺🇸", "morocco": "🇲🇦", "marrocos": "🇲🇦",
  "senegal": "🇸🇳", "ghana": "🇬🇭", "nigeria": "🇳🇬", "nigéria": "🇳🇬",
  "egypt": "🇪🇬", "egito": "🇪🇬", "japan": "🇯🇵", "japao": "🇯🇵", "japão": "🇯🇵",
  "south korea": "🇰🇷", "coreia": "🇰🇷", "angola": "🇦🇴",
  "cabo verde": "🇨🇻", "guinea-bissau": "🇬🇼", "guine-bissau": "🇬🇼",
  "mocambique": "🇲🇿", "moçambique": "🇲🇿", "sweden": "🇸🇪", "suecia": "🇸🇪", "suécia": "🇸🇪",
  "denmark": "🇩🇰", "dinamarca": "🇩🇰", "turkey": "🇹🇷", "turquia": "🇹🇷",
  "croatia": "🇭🇷", "croacia": "🇭🇷", "croácia": "🇭🇷",
  "poland": "🇵🇱", "polonia": "🇵🇱", "polónia": "🇵🇱",
  "ukraine": "🇺🇦", "ucrania": "🇺🇦", "ucrânia": "🇺🇦", "russia": "🇷🇺", "rússia": "🇷🇺",
  "scotland": "🏴󠁧󠁢󠁳󠁣󠁴󠁿", "escocia": "🏴󠁧󠁢󠁳󠁣󠁴󠁿", "escócia": "🏴󠁧󠁢󠁳󠁣󠁴󠁿",
  "switzerland": "🇨🇭", "suica": "🇨🇭", "suíça": "🇨🇭",
  "austria": "🇦🇹", "áustria": "🇦🇹", "greece": "🇬🇷", "grecia": "🇬🇷", "grécia": "🇬🇷",
  "mexico": "🇲🇽", "méxico": "🇲🇽", "colombia": "🇨🇴", "chile": "🇨🇱", "peru": "🇵🇪",
  "uruguay": "🇺🇾", "uruguai": "🇺🇾", "costa rica": "🇨🇷", "ecuador": "🇪🇨",
}

function getFlag(country?: string): string {
  if (!country?.trim()) return ""
  return (FLAG_MAP[country.toLowerCase().trim()] ?? "") + " "
}

/* ══════════════════════════════════════════ */
export function AthleteProfileModal({ jogador, open, onClose, onEdit, onReset }: Props) {
  const [presencas, setPresencas] = useState<ReturnType<typeof getPresencasByJogador>>([])
  const [ocorrencias, setOcorrencias] = useState<ReturnType<typeof getOcorrenciasByJogador>>([])
  const [fisico, setFisico] = useState<RegistoFisico[]>([])
  const [medico, setMedico] = useState<RegistoMedico[]>([])
  const [activeSection, setActiveSection] = useState("info")

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

  const SECTIONS = [
    { id: "info",       icon: "👤", label: "Player Info", color: "#00D66C", count: 0 },
    { id: "fisico",     icon: "💪", label: "Physical",    color: "#0066FF", count: fisico.length },
    { id: "medico",     icon: "🏥", label: "Medical",     color: "#EF4444", count: medico.length },
    { id: "disciplina", icon: "🟡", label: "Discipline",  color: "#FF6B35", count: ocorrencias.length },
    { id: "presencas",  icon: "📋", label: "Attendance",  color: "#8B5CF6", count: presencas.length },
  ]

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-[72vw] h-[85vh] flex flex-col overflow-hidden p-0 gap-0 [&>button]:top-3 [&>button]:right-3 [&>button]:w-10 [&>button]:h-10 [&>button]:rounded-full [&>button]:flex [&>button]:items-center [&>button]:justify-center [&>button]:bg-white/10 [&>button]:border [&>button]:border-white/20 [&>button]:text-red-400 [&>button:hover]:bg-red-500/15 [&>button:hover]:text-red-300 [&>button:hover]:border-red-500/30 [&>button_svg]:w-5 [&>button_svg]:h-5"
        style={{ background: "linear-gradient(160deg, #080d18 0%, #040609 100%)", border: "1.5px solid rgba(255,255,255,0.09)" }}>

        {/* Linha gradiente */}
        <div className="h-[3px] flex-shrink-0"
          style={{ background: "linear-gradient(90deg, #00D66C, #0066FF, #8B5CF6, #FF6B35, #00D66C)" }} />

        {/* ── HEADER ── */}
        <div className="flex items-center gap-3 px-4 py-2.5 border-b flex-shrink-0 relative overflow-hidden"
          style={{ borderColor: "rgba(255,255,255,0.06)" }}>
          {/* Número decorativo */}
          <div className="absolute right-4 top-0 text-[56px] font-black leading-none select-none pointer-events-none"
            style={{ color: `${estadoBorderColor}0E`, fontFamily: "var(--font-barlow-condensed)" }}>
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
              <div className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-black border-2"
                style={{ background: `${estadoBorderColor}15`, borderColor: estadoBorderColor, color: estadoBorderColor, fontFamily: "var(--font-barlow-condensed)" }}>
                {jogador.numero}
              </div>
            )}
          </div>

          {/* Nome + badges */}
          <div className="flex-1 min-w-0 relative z-10">
            <div className="text-xl font-black tracking-tight text-white leading-tight">{jogador.nome}</div>
            <div className="flex items-center gap-1 mt-0.5 flex-wrap">
              <span className="text-[9px] font-bold px-1 py-0.5 rounded"
                style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.85)" }}>
                #{jogador.numero}
              </span>
              {jogador.posicoes.map((p, i) => (
                <Badge key={p} variant={i === 0 ? "default" : "outline"}
                  className={i === 0 ? "text-[11px] py-0 px-2 h-6 hover:bg-[#00D66C]/15" : "text-[11px] py-0 px-2 h-6"}
                  style={i === 0 ? { background: "rgba(0,214,108,0.15)", color: "#00D66C", borderColor: "rgba(0,214,108,0.30)" } : {}}>
                  {p}
                </Badge>
              ))}
              {estadoBadge(jogador.estado)}
            </div>
          </div>

          {/* Stats inline — centrados absolutamente */}
          <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-0 z-10">
            {[
              { icon: "🎂", label: "Age",     color: "#00D66C", value: idade !== "—" ? `${idade} yrs` : "—",     empty: idade === "—" },
              { icon: "📅", label: "Born",    color: "#0066FF", value: jogador.dataNascimento || "—",              empty: !jogador.dataNascimento },
              { icon: getFlag(jogador.nacionalidade) || "🌍", label: "Country", color: "#8B5CF6", value: jogador.nacionalidade || "—", empty: !jogador.nacionalidade },
              { icon: "📏", label: "Height",  color: "#FF6B35", value: jogador.altura ? `${jogador.altura} cm` : "—", empty: !jogador.altura },
              { icon: "⚖️", label: "Weight",  color: "#facc15", value: jogador.peso ? `${jogador.peso} kg` : "—",    empty: !jogador.peso },
              { icon: "👟", label: "Foot",    color: "#06B6D4", value: jogador.pePreferido ? (jogador.pePreferido.charAt(0).toUpperCase() + jogador.pePreferido.slice(1)) : "—", empty: !jogador.pePreferido },
            ].map((s, i) => (
              <div key={s.label} className="flex items-center">
                {i > 0 && <div className="w-px h-9 mx-3" style={{ background: "rgba(255,255,255,0.07)" }} />}
                <div className="flex flex-col items-center gap-1.5">
                  <span className="text-[11px] uppercase tracking-wide font-bold leading-none" style={{ color: s.empty ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.55)" }}>
                    {s.icon} {s.label}
                  </span>
                  <span className="text-[10px] font-semibold leading-none tabular-nums" style={{ color: s.empty ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.85)" }}>
                    {s.value}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Botões */}
          <div className="ml-auto flex items-center gap-1.5 shrink-0 relative z-10 mr-14">
            <Button size="sm" variant="outline" className="gap-1 text-[10px] h-6 px-2"
              style={{ borderColor: "rgba(239,68,68,0.35)", color: "#f87171" }}
              onClick={handleReset}>
              <RotateCcw className="w-2.5 h-2.5" /> Reset
            </Button>
            <Button size="sm" variant="outline" className="gap-1 text-[10px] h-6 px-2"
              style={{ borderColor: "rgba(0,102,255,0.35)", color: "#60a5fa" }}
              onClick={() => onEdit(jogador)}>
              <Pencil className="w-2.5 h-2.5" /> Edit
            </Button>
          </div>
        </div>

        {/* ── 5 PILLS NAV ── */}
        <div className="flex gap-2 px-4 py-2 flex-shrink-0 border-b"
          style={{ borderColor: "rgba(255,255,255,0.06)", background: "rgba(0,0,0,0.20)" }}>
          {SECTIONS.map(s => {
            const isActive = activeSection === s.id
            return (
              <button key={s.id} onClick={() => setActiveSection(s.id)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg transition-all duration-150 cursor-pointer"
                style={{
                  background: isActive ? `${s.color}18` : "rgba(255,255,255,0.04)",
                  border: `1.5px solid ${isActive ? s.color + "55" : "rgba(255,255,255,0.10)"}`,
                  boxShadow: isActive ? `0 0 10px ${s.color}25` : undefined,
                }}>
                <span className="text-base leading-none">{s.icon}</span>
                <span className="text-[10px] font-black uppercase tracking-wide leading-none"
                  style={{ color: isActive ? s.color : "rgba(255,255,255,0.38)" }}>
                  {s.label}
                </span>
                {s.count > 0 && (
                  <span className="text-[7px] font-black min-w-[14px] h-3.5 px-0.5 rounded-full flex items-center justify-center"
                    style={{ background: s.color, color: "#000" }}>
                    {s.count}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* ── ÁREA PRINCIPAL ── */}
        <div className="flex-1 min-h-0 overflow-hidden">

          {/* ── PLAYER INFO (atributos) ── */}
          {activeSection === "info" && (
            <div className="h-full px-3 py-2 flex flex-col gap-2 overflow-hidden">
              {/* Linha 1: 3 secções */}
              <div className="grid grid-cols-3 gap-2 flex-1 min-h-0 w-3/4 mx-auto">
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
              {/* Linha 2: 4 secções */}
              <div className="grid grid-cols-4 gap-2 flex-1 min-h-0">
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
          )}

          {/* ── PHYSICAL ── */}
          {activeSection === "fisico" && (
            <div className="h-full overflow-y-auto px-4 py-3">
              <div className="text-[8px] font-black uppercase tracking-widest mb-3 flex items-center gap-1.5" style={{ color: "#0066FF" }}>
                <div className="w-3 h-0.5 rounded" style={{ background: "#0066FF" }} />
                Physical Monitoring — {fisico.length} record{fisico.length !== 1 ? "s" : ""}
              </div>
              {fisico.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 gap-2" style={{ color: "rgba(255,255,255,0.18)" }}>
                  <span className="text-3xl">💪</span>
                  <p className="text-sm">No physical records yet</p>
                </div>
              ) : (
                <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(0,102,255,0.15)" }}>
                  <Table>
                    <TableHeader>
                      <TableRow className="border-white/8 hover:bg-transparent" style={{ background: "rgba(0,102,255,0.08)" }}>
                        {["Date","Duration","Distance","Sprints","RPE","Max HR"].map(h => (
                          <TableHead key={h} className="text-xs font-bold py-2.5 text-white/55">{h}</TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {fisico.sort((a, b) => b.data.localeCompare(a.data)).map((r, idx) => (
                        <TableRow key={r.id} className="border-white/5"
                          style={{ background: idx % 2 === 0 ? "rgba(255,255,255,0.02)" : "transparent" }}>
                          <TableCell className="text-sm py-2.5 font-semibold text-white/85">{r.data}</TableCell>
                          <TableCell className="text-sm py-2.5 text-white/55">{r.duracao ? `${r.duracao} min` : "—"}</TableCell>
                          <TableCell className="text-sm py-2.5 text-white/55">{r.distancia ? `${r.distancia} km` : "—"}</TableCell>
                          <TableCell className="text-sm py-2.5 text-white/55">{r.sprints ?? "—"}</TableCell>
                          <TableCell className="text-sm py-2.5 text-white/55">{r.rpe ?? "—"}</TableCell>
                          <TableCell className="text-sm py-2.5 text-white/55">{r.fcMax ? `${r.fcMax} bpm` : "—"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          )}

          {/* ── MEDICAL ── */}
          {activeSection === "medico" && (
            <div className="h-full overflow-y-auto px-4 py-3">
              <div className="text-[8px] font-black uppercase tracking-widest mb-3 flex items-center gap-1.5" style={{ color: "#EF4444" }}>
                <div className="w-3 h-0.5 rounded" style={{ background: "#EF4444" }} />
                Medical Records — {medico.length} record{medico.length !== 1 ? "s" : ""}
              </div>
              {medico.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 gap-2" style={{ color: "rgba(255,255,255,0.18)" }}>
                  <span className="text-3xl">🏥</span>
                  <p className="text-sm">No medical records</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {medico.sort((a, b) => b.dataInicio.localeCompare(a.dataInicio)).map(r => (
                    <div key={r.id} className="rounded-2xl p-4"
                      style={{ background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.15)" }}>
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div>
                          <div className="text-base font-black text-white/90">{tipoLesaoLabel[r.tipo]} — <span className="text-white/55">{r.localizacao}</span></div>
                          <div className="text-xs text-white/40 mt-0.5">{r.dataInicio}{r.dataRetorno ? ` → ${r.dataRetorno}` : ""}</div>
                        </div>
                        <span className={`text-sm font-black px-2.5 py-0.5 rounded-full ${estadoLesaoLabel[r.estado].color}`}
                          style={{ background: "rgba(255,255,255,0.06)" }}>
                          {estadoLesaoLabel[r.estado].label}
                        </span>
                      </div>
                      <p className="text-sm text-white/60 leading-relaxed">{r.descricao}</p>
                      {r.tratamento && <p className="text-xs text-white/40 mt-1.5"><span className="font-bold">Treatment:</span> {r.tratamento}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── DISCIPLINE ── */}
          {activeSection === "disciplina" && (
            <div className="h-full overflow-y-auto px-4 py-3">
              <div className="text-[8px] font-black uppercase tracking-widest mb-3 flex items-center gap-1.5" style={{ color: "#FF6B35" }}>
                <div className="w-3 h-0.5 rounded" style={{ background: "#FF6B35" }} />
                Discipline — {ocorrencias.length} record{ocorrencias.length !== 1 ? "s" : ""}
              </div>
              {ocorrencias.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 gap-2" style={{ color: "rgba(255,255,255,0.18)" }}>
                  <span className="text-3xl">🟡</span>
                  <p className="text-sm">Clean record — no incidents</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {ocorrencias.sort((a, b) => b.data.localeCompare(a.data)).map(o => (
                    <div key={o.id} className="rounded-2xl p-4"
                      style={{ background: "rgba(255,107,53,0.05)", border: "1px solid rgba(255,107,53,0.15)" }}>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="text-base font-black text-white/90 capitalize">{o.tipo.replace("_", " ")}</div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-white/35">{o.data}</span>
                          <span className={`text-xs font-black px-2 py-0.5 rounded-full capitalize ${o.gravidade === "grave" ? "bg-red-500/15 text-red-400" : o.gravidade === "moderada" ? "bg-orange-500/15 text-orange-400" : "bg-white/5 text-white/30"}`}>
                            {o.gravidade}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-white/55 leading-relaxed">{o.descricao}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── ATTENDANCE ── */}
          {activeSection === "presencas" && (
            <div className="h-full overflow-y-auto px-4 py-3">
              <div className="text-[8px] font-black uppercase tracking-widest mb-3 flex items-center gap-1.5" style={{ color: "#8B5CF6" }}>
                <div className="w-3 h-0.5 rounded" style={{ background: "#8B5CF6" }} />
                Attendance — {presencas.length} record{presencas.length !== 1 ? "s" : ""}
              </div>
              {presencas.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 gap-2" style={{ color: "rgba(255,255,255,0.18)" }}>
                  <span className="text-3xl">📋</span>
                  <p className="text-sm">No attendance records</p>
                </div>
              ) : (
                <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(139,92,246,0.15)" }}>
                  <Table>
                    <TableHeader>
                      <TableRow className="border-white/8 hover:bg-transparent" style={{ background: "rgba(139,92,246,0.08)" }}>
                        {["Date","Type","Status","Notes"].map(h => (
                          <TableHead key={h} className="text-xs font-bold py-2.5 text-white/55">{h}</TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {presencas.sort((a, b) => b.data.localeCompare(a.data)).map((p, idx) => (
                        <TableRow key={p.id} className="border-white/5"
                          style={{ background: idx % 2 === 0 ? "rgba(255,255,255,0.02)" : "transparent" }}>
                          <TableCell className="text-sm py-2.5 font-semibold text-white/85">{p.data}</TableCell>
                          <TableCell className="text-sm py-2.5 text-white/55">{tipoPresencaLabel[p.tipo] ?? p.tipo}</TableCell>
                          <TableCell className={`text-sm py-2.5 font-bold ${estadoPresencaLabel[p.estado]?.color ?? ""}`}>
                            {estadoPresencaLabel[p.estado]?.label ?? p.estado}
                          </TableCell>
                          <TableCell className="text-sm py-2.5 text-white/35">{p.notas ?? "—"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          )}
        </div>

      </DialogContent>
    </Dialog>
  )
}

