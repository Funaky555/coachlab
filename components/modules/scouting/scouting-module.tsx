"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Plus, Search, Star, User, Pencil, Trash2, Users, Globe2, Filter,
  Upload, Camera, FileText, BarChart3, Award, Eye, Phone, Handshake, XCircle, X, ChevronDown,
  Video, Link2, ExternalLink
} from "lucide-react"
import {
  type JogadorObservado, type EstadoScouting, type PePreferido, type VideoClip,
  getJogadoresObservados, addJogadorObservado, updateJogadorObservado, deleteJogadorObservado
} from "@/lib/storage/scouting"
import { NATIONALITY_TO_CODE, COUNTRY_FLAGS, COUNTRY_NAMES } from "./world-map-data"
import { ScoutSearch } from "./scout-search"
import { WorldMap } from "./world-map"
import { ImportDataDialog, type ImportField } from "@/components/ui/import-data-dialog"

const ESTADOS: { value: EstadoScouting; label: string; color: string; icon: React.ElementType }[] = [
  { value: "em_observacao", label: "Scouted",    color: "#0066FF", icon: Eye },
  { value: "contactado",    label: "Contacted",  color: "#8B5CF6", icon: Phone },
  { value: "contratado",    label: "Signed",     color: "#00D66C", icon: Handshake },
  { value: "descartado",    label: "Dismissed",  color: "#EF4444", icon: XCircle },
]

const ESTADOS_ACAO: { value: EstadoScouting; label: string; color: string }[] = [
  { value: "contactado", label: "Contacted", color: "#8B5CF6" },
  { value: "contratado", label: "Signed",    color: "#00D66C" },
  { value: "descartado", label: "Dismissed", color: "#EF4444" },
]

const POSICOES = ["GK","RB","CBR","CBL","LB","Libero","CM","CMR","CML","Defensive Midfielder","WR","OM","WL","Left Winger","Right Winger","ST","Target Forward","Forward"]

const CLIP_CATEGORIES = [
  { id: "ofensivo", label: "Offensive Actions", color: "#00D66C", subcategorias: [
    { id: "finalizacao", label: "Finishing" }, { id: "golos", label: "Goals" },
    { id: "remates_fora", label: "Long-range shots" }, { id: "remates_area", label: "Shots in the box" },
    { id: "movimentos_rutura", label: "Runs in behind" }, { id: "ataque_prof", label: "Depth attacks" },
    { id: "1v1_of", label: "1v1 attack" }, { id: "drible", label: "Dribbling" },
    { id: "conducao", label: "Progressive carrying" }, { id: "assistencias_clip", label: "Assists" },
    { id: "ultimo_passe", label: "Final pass" }, { id: "cruzamentos", label: "Crosses" },
  ]},
  { id: "decisao", label: "Decision Making", color: "#0066FF", subcategorias: [
    { id: "jogo_linhas", label: "Plays between lines" }, { id: "criatividade", label: "Creativity" },
    { id: "escolha_passe", label: "Pass choice" },
  ]},
  { id: "passe", label: "Passing", color: "#8B5CF6", subcategorias: [
    { id: "passe_curto", label: "Short pass" }, { id: "passe_longo", label: "Long pass" },
    { id: "mudanca_flanco", label: "Switch of play" }, { id: "passe_vertical", label: "Vertical pass" },
  ]},
  { id: "defensivo", label: "Defensive Actions", color: "#EF4444", subcategorias: [
    { id: "desarmes", label: "Tackles" }, { id: "intercecoes", label: "Interceptions" },
    { id: "pressao", label: "Pressing" }, { id: "recuperacoes", label: "Recoveries" },
    { id: "1v1_def", label: "1v1 defense" }, { id: "coberturas", label: "Defensive cover" },
    { id: "aereo", label: "Aerial duels" },
  ]},
  { id: "fisico", label: "Physical / Intensity", color: "#FF6B35", subcategorias: [
    { id: "velocidade_clip", label: "Speed" }, { id: "aceleracao_clip", label: "Acceleration" },
    { id: "sprint_clip", label: "Sprint" }, { id: "repeticao_esforcos", label: "Repeated efforts" },
    { id: "duelos_fisicos", label: "Physical duels" },
  ]},
  { id: "posicionamento", label: "Positioning", color: "#06B6D4", subcategorias: [
    { id: "apoios", label: "Support play" }, { id: "ocupacao_espacos", label: "Space occupation" },
    { id: "pos_defensivo", label: "Defensive positioning" }, { id: "pos_ofensivo", label: "Offensive positioning" },
  ]},
  { id: "mentalidade", label: "Mentality / Leadership", color: "#F59E0B", subcategorias: [
    { id: "lideranca", label: "Leadership" }, { id: "comunicacao", label: "Communication" },
    { id: "reacao_erro", label: "Reaction to mistakes" }, { id: "competitividade", label: "Competitiveness" },
  ]},
  { id: "highlights", label: "Highlights", color: "#EC4899", subcategorias: [
    { id: "melhores_momentos", label: "Best moments (1-3 min)" },
  ]},
]

function getYoutubeThumbnail(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s?]+)/)
  if (match) return `https://img.youtube.com/vi/${match[1]}/mqdefault.jpg`
  return null
}

function getCountryInfo(nacionalidade?: string): { flag: string; name: string } {
  if (!nacionalidade) return { flag: "", name: "" }
  const code = NATIONALITY_TO_CODE[nacionalidade.toLowerCase().trim()]
  if (!code) return { flag: "", name: nacionalidade }
  return { flag: COUNTRY_FLAGS[code] ?? "", name: COUNTRY_NAMES[code] ?? nacionalidade }
}

function StarRating({ value, onChange, size = "sm" }: { value: number; onChange?: (v: number) => void; size?: "sm" | "md" }) {
  const sz = size === "md" ? "w-5 h-5" : "w-3 h-3"
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(i => (
        <Star
          key={i}
          className={`${sz} ${onChange ? "cursor-pointer hover:scale-110 transition-transform" : ""} ${i <= value ? "text-yellow-400 fill-yellow-400 drop-shadow-[0_0_3px_rgba(250,204,21,0.6)]" : "text-muted-foreground/40"}`}
          onClick={() => onChange?.(i)}
        />
      ))}
    </div>
  )
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
    <div className="rounded-lg border p-2" style={{ borderColor: `${color}40`, background: `${color}08` }}>
      <div className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color }}>{title}</div>
      <table className="w-full">
        <tbody>
          {attrs.map(([label, key]) => {
            const val = values[key] as number | undefined
            const { label: rLabel, color: rColor } = getRatingInfo(val)
            return (
              <tr key={key} className="border-b border-white/5 last:border-0">
                <td className="text-[10px] text-white/60 py-0.5 pr-1 w-full">{label}</td>
                <td className="py-0.5 px-1">
                  <input
                    type="number" min={1} max={10}
                    value={val ?? ""}
                    placeholder="—"
                    onChange={e => onChange(key, e.target.value === "" ? undefined : Math.min(10, Math.max(1, Number(e.target.value))))}
                    className="w-7 h-5 text-[11px] font-bold text-center bg-transparent border-0 outline-none p-0"
                    style={{ color: rColor, caretColor: "#fff" }}
                  />
                </td>
                <td className="py-0.5 pl-1 text-right whitespace-nowrap">
                  <span className="text-[9px] font-semibold" style={{ color: rColor }}>{rLabel}</span>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function NumInput({ label, value, onChange, placeholder, min, max }: {
  label: string; value: number | undefined; onChange: (v: number | undefined) => void;
  placeholder?: string; min?: number; max?: number
}) {
  return (
    <div>
      <Label className="text-xs">{label}</Label>
      <Input
        type="number" min={min} max={max}
        value={value ?? ""}
        placeholder={placeholder ?? "—"}
        onChange={e => onChange(e.target.value === "" ? undefined : Number(e.target.value))}
        className="mt-1 h-8 text-sm"
      />
    </div>
  )
}

const emptyForm: Omit<JogadorObservado, "id"> = {
  nome: "", dataNascimento: "", clube: "", posicao: "CM", pePreferido: "direito",
  nacionalidade: "", fotoUrl: "", avaliacao: 3, potencial: 3, estado: "em_observacao",
  caracteristicasTecnicas: "", caracteristicasTaticas: "",
  caracteristicasFisicas: "", caracteristicasMentais: "",
  pontosFortess: "", pontosFracos: "", notas: "",
  dataObservacao: new Date().toISOString().split("T")[0], jogosObservados: [], clips: [],
}


function ClipsTab({ clips, onChange }: { clips: VideoClip[]; onChange: (clips: VideoClip[]) => void }) {
  const [expanded, setExpanded] = useState<string | null>(null)
  const [adding, setAdding] = useState<{ cat: string; sub: string } | null>(null)
  const [urlInput, setUrlInput] = useState("")
  const [titleInput, setTitleInput] = useState("")

  function addClip(catId: string, subId: string) {
    if (!urlInput.trim()) return
    const novo: VideoClip = {
      id: crypto.randomUUID(),
      categoria: catId,
      subcategoria: subId,
      url: urlInput.trim(),
      titulo: titleInput.trim() || undefined,
      dataAdicionado: new Date().toISOString().split("T")[0],
    }
    onChange([...clips, novo])
    setUrlInput("")
    setTitleInput("")
    setAdding(null)
  }

  function removeClip(id: string) {
    onChange(clips.filter(c => c.id !== id))
  }

  return (
    <div className="space-y-2">
      {CLIP_CATEGORIES.map(cat => {
        const catClips = clips.filter(c => c.categoria === cat.id)
        const isOpen = expanded === cat.id
        return (
          <div key={cat.id} className="rounded-lg border overflow-hidden" style={{ borderColor: `${cat.color}40`, background: "rgba(4,10,22,0.50)" }}>
            {/* Header da categoria */}
            <button
              type="button"
              className="w-full flex items-center justify-between px-3 py-2 text-left transition-colors hover:bg-white/5"
              onClick={() => setExpanded(isOpen ? null : cat.id)}
            >
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ background: cat.color }} />
                <span className="text-sm font-bold" style={{ color: cat.color }}>{cat.label}</span>
                {catClips.length > 0 && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold" style={{ background: `${cat.color}25`, color: cat.color }}>
                    {catClips.length}
                  </span>
                )}
              </div>
              <ChevronDown className="w-4 h-4 transition-transform" style={{ color: cat.color, transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }} />
            </button>

            {/* Conteúdo expandido */}
            {isOpen && (
              <div className="border-t px-3 py-3 space-y-3" style={{ borderColor: `${cat.color}20` }}>
                {cat.subcategorias.map(sub => {
                  const subClips = catClips.filter(c => c.subcategoria === sub.id)
                  const isAdding = adding?.cat === cat.id && adding?.sub === sub.id
                  return (
                    <div key={sub.id}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-semibold text-white/70">{sub.label}</span>
                        <button
                          type="button"
                          className="w-5 h-5 rounded flex items-center justify-center transition-colors hover:bg-white/10"
                          style={{ color: cat.color, border: `1px solid ${cat.color}50` }}
                          onClick={() => {
                            if (isAdding) { setAdding(null); setUrlInput(""); setTitleInput("") }
                            else { setAdding({ cat: cat.id, sub: sub.id }); setUrlInput(""); setTitleInput("") }
                          }}
                          title="Add clip"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Form de adicionar */}
                      {isAdding && (
                        <div className="mb-2 p-2 rounded-lg space-y-1.5" style={{ background: `${cat.color}10`, border: `1px solid ${cat.color}30` }}>
                          <Input
                            placeholder="Video URL (YouTube, Vimeo...)"
                            value={urlInput}
                            onChange={e => setUrlInput(e.target.value)}
                            className="h-7 text-xs"
                            style={{ background: "rgba(4,10,22,0.60)" }}
                            autoFocus
                          />
                          <Input
                            placeholder="Title (optional)"
                            value={titleInput}
                            onChange={e => setTitleInput(e.target.value)}
                            className="h-7 text-xs"
                            style={{ background: "rgba(4,10,22,0.60)" }}
                            onKeyDown={e => { if (e.key === "Enter") addClip(cat.id, sub.id) }}
                          />
                          <div className="flex gap-1.5">
                            <Button
                              type="button"
                              size="sm"
                              className="h-6 text-[11px] px-2 text-white"
                              style={{ background: cat.color }}
                              onClick={() => addClip(cat.id, sub.id)}
                              disabled={!urlInput.trim()}
                            >
                              Add
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              className="h-6 text-[11px] px-2"
                              onClick={() => { setAdding(null); setUrlInput(""); setTitleInput("") }}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* Lista de clips existentes */}
                      {subClips.length > 0 && (
                        <div className="space-y-1">
                          {subClips.map(clip => {
                            const thumb = getYoutubeThumbnail(clip.url)
                            return (
                              <div
                                key={clip.id}
                                className="flex items-center gap-2 p-1.5 rounded-lg group/clip"
                                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
                              >
                                {/* Thumbnail ou ícone */}
                                <a href={clip.url} target="_blank" rel="noopener noreferrer" className="shrink-0">
                                  {thumb ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={thumb} alt={clip.titulo ?? sub.label} className="w-16 h-9 object-cover rounded" />
                                  ) : (
                                    <div className="w-16 h-9 rounded flex items-center justify-center" style={{ background: `${cat.color}15`, border: `1px solid ${cat.color}30` }}>
                                      <Link2 className="w-4 h-4" style={{ color: cat.color }} />
                                    </div>
                                  )}
                                </a>
                                <div className="flex-1 min-w-0">
                                  <a href={clip.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:opacity-80 transition-opacity">
                                    <span className="text-xs font-medium text-white/80 truncate">{clip.titulo || sub.label}</span>
                                    <ExternalLink className="w-3 h-3 shrink-0 text-white/30" />
                                  </a>
                                  <span className="text-[10px] text-white/30">{clip.dataAdicionado}</span>
                                </div>
                                <button
                                  type="button"
                                  className="w-5 h-5 rounded flex items-center justify-center opacity-0 group-hover/clip:opacity-100 transition-opacity hover:bg-red-500/20 text-red-400 shrink-0"
                                  onClick={() => removeClip(clip.id)}
                                  title="Remove clip"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            )
                          })}
                        </div>
                      )}

                      {subClips.length === 0 && !isAdding && (
                        <p className="text-[11px] text-white/25 italic">No clips — click + to add</p>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

const SCOUTING_IMPORT_SCHEMA: ImportField[] = [
  { key: "nome",           label: "Nome",            required: true,  type: "text" },
  { key: "clube",          label: "Clube",           required: true,  type: "text" },
  { key: "posicao",        label: "Posição",         required: true,  type: "text" },
  { key: "avaliacao",      label: "Avaliação (1-5)",                  type: "number" },
  { key: "estado",         label: "Estado",                           type: "text" },
  { key: "dataNascimento", label: "Data Nascimento",                  type: "date" },
  { key: "liga",           label: "Liga",                             type: "text" },
  { key: "valorMercado",   label: "Valor Mercado (€)",                type: "number" },
  { key: "nacionalidade",  label: "Nacionalidade",                    type: "text" },
  { key: "notas",          label: "Notas",                            type: "text" },
]

export function ScoutingModule() {
  const [jogadores, setJogadores] = useState<JogadorObservado[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<Omit<JogadorObservado, "id">>(emptyForm)
  const [filtroEstado, setFiltroEstado] = useState<EstadoScouting | "todos">("todos")
  const [filtroPosicao, setFiltroPosicao] = useState<string>("todos")
  const [searchText, setSearchText] = useState("")
  const [expandedEstado, setExpandedEstado] = useState<EstadoScouting | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { setJogadores(getJogadoresObservados()) }, [])

  function refresh() { setJogadores(getJogadoresObservados()) }

  function handleImportScouting(rows: Record<string, string>[]) {
    const estadoMap: Record<string, EstadoScouting> = {
      em_observacao: "em_observacao", observing: "em_observacao",
      contactado: "contactado", contacted: "contactado",
      descartado: "descartado", discarded: "descartado",
      contratado: "contratado", signed: "contratado",
    }
    rows.forEach(row => {
      addJogadorObservado({
        nome: row.nome?.trim() ?? "",
        clube: row.clube?.trim() ?? "",
        posicao: row.posicao?.trim() ?? "",
        avaliacao: row.avaliacao ? parseFloat(row.avaliacao) || 0 : 0,
        estado: estadoMap[(row.estado ?? "").toLowerCase().trim()] ?? "em_observacao",
        dataNascimento: row.dataNascimento?.trim() || undefined,
        liga: row.liga?.trim() || undefined,
        valorMercado: row.valorMercado ? parseFloat(row.valorMercado) || undefined : undefined,
        nacionalidade: row.nacionalidade?.trim() || undefined,
        notas: row.notas?.trim() ?? "",
        dataObservacao: new Date().toISOString().split("T")[0],
        pePreferido: "direito",
        caracteristicasTecnicas: "", caracteristicasTaticas: "",
        caracteristicasFisicas: "", caracteristicasMentais: "",
        pontosFortess: "", pontosFracos: "",
        jogosObservados: [],
      })
    })
    refresh()
  }

  const filtered = jogadores.filter(j => {
    if (filtroEstado !== "todos" && j.estado !== filtroEstado) return false
    if (filtroPosicao !== "todos" && j.posicao !== filtroPosicao) return false
    if (searchText && !j.nome.toLowerCase().includes(searchText.toLowerCase()) && !j.clube.toLowerCase().includes(searchText.toLowerCase())) return false
    return true
  })

  function openAdd() {
    setEditingId(null)
    setForm({ ...emptyForm, dataObservacao: new Date().toISOString().split("T")[0] })
    setDialogOpen(true)
  }

  function openEdit(j: JogadorObservado) {
    setEditingId(j.id)
    const { id, ...rest } = j
    setForm({ ...emptyForm, ...rest })
    setDialogOpen(true)
  }

  function save() {
    if (!form.nome.trim()) return
    const clean = {
      ...form,
      liga: form.liga || undefined,
      paisClube: form.paisClube || undefined,
      fimContrato: form.fimContrato || undefined,
      contactoAgente: form.contactoAgente || undefined,
      nomeAgente: form.nomeAgente || undefined,
      agencia: form.agencia || undefined,
    }
    if (editingId) { updateJogadorObservado(editingId, clean) } else { addJogadorObservado(clean) }
    refresh()
    setDialogOpen(false)
  }

  function remove(id: string) { deleteJogadorObservado(id); refresh() }

  function changeEstado(id: string, novoEstado: EstadoScouting) {
    updateJogadorObservado(id, { estado: novoEstado })
    refresh()
  }

  function removeFromEstado(id: string) {
    updateJogadorObservado(id, { estado: "em_observacao" })
    refresh()
  }

  function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => setForm(f => ({ ...f, fotoUrl: ev.target?.result as string }))
    reader.readAsDataURL(file)
  }

  const countByEstado = (e: EstadoScouting) => jogadores.filter(j => j.estado === e).length
  const paises = new Set(jogadores.map(j => j.nacionalidade).filter(Boolean)).size
  const contratados = countByEstado("contratado")

  return (
    <div className="relative min-h-screen" style={{ background: "#050e1a" }}>
      {/* Fundo imagem */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0" style={{ backgroundImage: "url('/FundoS.png')", backgroundSize: "cover", backgroundPosition: "center", backgroundRepeat: "no-repeat", opacity: 0.3 }} />
        <div className="absolute inset-0" style={{ background: "rgba(5,14,26,0.45)" }} />
      </div>

      <div className="relative p-4 md:p-8 max-w-7xl mx-auto">
        {/* Header desportivo */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-1 h-10 rounded-full" style={{ background: "linear-gradient(180deg, #00D66C, #0066FF)" }} />
              <h1
                className="text-5xl font-black tracking-tight uppercase"
                style={{
                  fontFamily: "var(--font-barlow-condensed)",
                  background: "linear-gradient(135deg, #00D66C 0%, #0066FF 60%, #8B5CF6 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Scouting
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <ImportDataDialog
              title="Importar Scouting"
              description="Importa jogadores observados de um ficheiro Excel ou CSV."
              schema={SCOUTING_IMPORT_SCHEMA}
              onImport={handleImportScouting}
              trigger={
                <Button variant="outline" className="gap-2 border-[#FF6B35]/40 text-[#FF6B35] hover:bg-[#FF6B35]/10">
                  <Upload className="w-4 h-4" /> Import
                </Button>
              }
            />
            <Button onClick={openAdd} className="gap-2 text-white hover:opacity-90 shadow-lg" style={{ background: "linear-gradient(135deg, #FF6B35, #FF8C5A)", boxShadow: "0 4px 20px #FF6B3540" }}>
              <Plus className="w-4 h-4" /> Add Athlete
            </Button>
          </div>
        </div>

        {/* Tabs principais */}
        <Tabs defaultValue="jogadores">
          <TabsList
            className="mb-6 h-auto p-1.5 gap-1 w-full"
            style={{
              background: "rgba(4,10,22,0.85)",
              border: "1px solid rgba(255,255,255,0.15)",
              backdropFilter: "blur(20px)",
              borderRadius: "16px",
              boxShadow: "0 4px 24px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05) inset",
            }}
          >
            <TabsTrigger
              value="jogadores"
              className="flex-1 gap-2.5 px-5 py-3 font-black uppercase tracking-wide rounded-xl transition-all duration-200
                data-[state=inactive]:text-white/70 data-[state=inactive]:hover:text-white
                data-[state=active]:text-white data-[state=active]:shadow-lg"
              style={{ fontFamily: "var(--font-barlow-condensed)", fontSize: "16px", letterSpacing: "0.05em" }}
            >
              <Users className="w-4 h-4" /> Athletes <span className="font-bold text-white">{jogadores.length}</span>
            </TabsTrigger>
            <TabsTrigger
              value="pesquisa"
              className="flex-1 gap-2.5 px-5 py-3 font-black uppercase tracking-wide rounded-xl transition-all duration-200
                data-[state=inactive]:text-white/70 data-[state=inactive]:hover:text-white
                data-[state=active]:text-white data-[state=active]:shadow-lg"
              style={{ fontFamily: "var(--font-barlow-condensed)", fontSize: "16px", letterSpacing: "0.05em" }}
            >
              <Filter className="w-4 h-4" /> Super Search <span className="font-bold text-white">{jogadores.length}</span>
            </TabsTrigger>
            <TabsTrigger
              value="mapa"
              className="flex-1 gap-2.5 px-5 py-3 font-black uppercase tracking-wide rounded-xl transition-all duration-200
                data-[state=inactive]:text-white/70 data-[state=inactive]:hover:text-white
                data-[state=active]:text-white data-[state=active]:shadow-lg"
              style={{ fontFamily: "var(--font-barlow-condensed)", fontSize: "16px", letterSpacing: "0.05em" }}
            >
              <Globe2 className="w-4 h-4" /> World Map <span className="font-bold text-white">{jogadores.length}</span>
            </TabsTrigger>
          </TabsList>

          {/* TAB: Jogadores */}
          <TabsContent value="jogadores">
            {/* Stats cards — Referenciados + zonas de seleção */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
              {ESTADOS.map(e => {
                const count = countByEstado(e.value)
                const Icon = e.icon
                const isReferenciados = e.value === "em_observacao"
                const isExpanded = expandedEstado === e.value
                const isActive = isReferenciados
                  ? filtroEstado === e.value
                  : isExpanded

                return (
                  <div
                    key={e.value}
                    className="relative rounded-xl border cursor-pointer transition-all duration-200 overflow-hidden"
                    style={{
                      borderColor: isActive ? e.color : `${e.color}80`,
                      background: "rgba(4,10,22,0.72)",
                      boxShadow: isActive
                        ? `0 0 24px ${e.color}50, 0 4px 20px rgba(0,0,0,0.5)`
                        : `0 2px 12px rgba(0,0,0,0.4)`,
                      backdropFilter: "blur(12px)",
                    }}
                    onClick={() => {
                      if (isReferenciados) {
                        setFiltroEstado(filtroEstado === e.value ? "todos" : e.value)
                        setExpandedEstado(null)
                      } else {
                        setExpandedEstado(isExpanded ? null : e.value)
                        setFiltroEstado("todos")
                      }
                    }}
                  >
                    {/* Barra lateral colorida */}
                    <div className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-xl" style={{ background: e.color }} />
                    <div className="p-3 pl-4 flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                        style={{ background: `${e.color}25`, border: `1px solid ${e.color}50` }}
                      >
                        <Icon className="w-4 h-4" style={{ color: e.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-2xl font-black leading-none" style={{ color: e.color, fontFamily: "var(--font-barlow-condensed)" }}>
                          {count}
                        </div>
                        <div className="text-[11px] font-bold mt-0.5 truncate" style={{ color: "rgba(255,255,255,0.70)" }}>{e.label}</div>
                      </div>
                      {!isReferenciados && count > 0 && (
                        <ChevronDown
                          className="w-4 h-4 shrink-0 transition-transform"
                          style={{ color: e.color, transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)" }}
                        />
                      )}
                    </div>
                    {/* Barra inferior decorativa */}
                    <div className="absolute bottom-0 left-0 right-0 h-0.5" style={{ background: `linear-gradient(90deg, ${e.color}, transparent)`, opacity: isActive ? 1 : 0.4 }} />
                  </div>
                )
              })}
            </div>

            {/* Painel expansível das zonas de seleção */}
            {expandedEstado && (() => {
              const estado = ESTADOS.find(e => e.value === expandedEstado)!
              const jogadoresNestadoEstado = jogadores.filter(j => j.estado === expandedEstado)
              return (
                <div
                  className="mb-4 rounded-xl border p-4"
                  style={{
                    borderColor: estado.color,
                    background: "rgba(4,10,22,0.70)",
                    boxShadow: `0 0 20px ${estado.color}30`,
                    backdropFilter: "blur(12px)",
                  }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <estado.icon className="w-4 h-4" style={{ color: estado.color }} />
                      <span className="text-sm font-bold" style={{ color: estado.color }}>{estado.label}</span>
                      <span className="text-xs text-muted-foreground">({jogadoresNestadoEstado.length} athletes)</span>
                    </div>
                    <button onClick={() => setExpandedEstado(null)} className="text-muted-foreground hover:text-foreground transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  {jogadoresNestadoEstado.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-4">No athletes in this status</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {jogadoresNestadoEstado.map(j => {
                        const { flag, name } = getCountryInfo(j.nacionalidade)
                        return (
                          <div
                            key={j.id}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium transition-colors"
                            style={{ borderColor: `${estado.color}40`, background: `${estado.color}15` }}
                          >
                            {j.fotoUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={j.fotoUrl} alt={j.nome} className="w-5 h-5 rounded-full object-cover shrink-0" />
                            ) : (
                              <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center shrink-0 text-[9px] font-bold">{j.nome[0]}</div>
                            )}
                            <span style={{ color: estado.color }}>{j.nome}</span>
                            {j.clube && <span className="text-muted-foreground">· {j.clube}</span>}
                            {name && <span className="text-muted-foreground">{flag} {name}</span>}
                            <button
                              onClick={e => { e.stopPropagation(); removeFromEstado(j.id) }}
                              className="ml-1 hover:text-destructive transition-colors text-muted-foreground"
                              title="Back to Scouted"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })()}

            <div className="flex flex-wrap gap-3 mb-6">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or club..."
                  value={searchText}
                  onChange={e => setSearchText(e.target.value)}
                  className="pl-9"
                  style={{ background: "rgba(4,10,22,0.65)", border: "1px solid rgba(255,255,255,0.25)" }}
                />
              </div>
              <Select value={filtroEstado} onValueChange={v => { setFiltroEstado(v as EstadoScouting | "todos"); setExpandedEstado(null) }}>
                <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Status</SelectItem>
                  {ESTADOS.map(e => <SelectItem key={e.value} value={e.value}>{e.label}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={filtroPosicao} onValueChange={setFiltroPosicao}>
                <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Positions</SelectItem>
                  {POSICOES.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                <Search className="w-12 h-12 mb-3 opacity-30" />
                <p className="text-lg font-medium">No athletes found</p>
                <p className="text-sm">Add your first scouted player</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filtered.map(j => {
                  const { flag, name } = getCountryInfo(j.nacionalidade)
                  const estadoAtual = ESTADOS.find(e => e.value === j.estado)!
                  return (
                    <div
                      key={j.id}
                      className="group rounded-xl border transition-all duration-200 overflow-hidden"
                      style={{
                        borderColor: `${estadoAtual.color}70`,
                        background: "rgba(4,10,22,0.70)",
                        boxShadow: "0 2px 16px rgba(0,0,0,0.5)",
                        backdropFilter: "blur(12px)",
                      }}
                      onMouseEnter={e => (e.currentTarget.style.borderColor = estadoAtual.color)}
                      onMouseLeave={e => (e.currentTarget.style.borderColor = `${estadoAtual.color}70`)}
                    >
                      {/* Linha colorida no topo */}
                      <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, ${estadoAtual.color}CC, ${estadoAtual.color}40)` }} />
                      <div className="p-4">
                        {/* Avatar + info */}
                        <div className="flex items-start gap-3 mb-3">
                          {j.fotoUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={j.fotoUrl} alt={j.nome} className="w-12 h-12 rounded-full object-cover shrink-0 border-2" style={{ borderColor: `${estadoAtual.color}60` }} />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-muted/30 flex items-center justify-center shrink-0 border-2 border-white/10 text-lg font-black text-white/40">
                              {j.nome[0]}
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1 mb-0.5">
                              <div className="font-bold truncate" style={{ color: j.estado === "descartado" ? "#EF4444" : "white" }}>{j.nome}</div>
                              <span className="text-[10px] font-black px-1.5 py-0.5 rounded shrink-0" style={{ background: `${estadoAtual.color}25`, color: estadoAtual.color, border: `1px solid ${estadoAtual.color}50` }}>{j.posicao}</span>
                            </div>
                            {j.nacionalidade && (
                              <div className="text-xs flex items-center gap-1" style={{ color: "rgba(255,255,255,0.55)" }}>
                                {flag && <span className="text-sm leading-none">{flag}</span>}
                                <span>{name}</span>
                              </div>
                            )}
                            <div className="mt-1.5 flex items-center gap-2">
                              <StarRating value={j.avaliacao} />
                              {j.potencial !== undefined && (
                                <>
                                  <span className="text-muted-foreground/30 text-xs">|</span>
                                  <StarRating value={j.potencial} />
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Botões de estado rápido */}
                        <div className="flex gap-1 mb-3">
                          {ESTADOS_ACAO.map(e => {
                            const isAtivo = j.estado === e.value
                            return (
                              <button
                                key={e.value}
                                onClick={() => changeEstado(j.id, isAtivo ? "em_observacao" : e.value)}
                                className="flex-1 py-1 px-1.5 rounded text-[10px] font-semibold transition-all"
                                style={{
                                  background: isAtivo ? e.color : `${e.color}18`,
                                  color: isAtivo ? "#fff" : e.color,
                                  border: `1px solid ${e.color}${isAtivo ? "ff" : "40"}`,
                                }}
                                title={isAtivo ? `Back to Scouted` : `Mark as ${e.label}`}
                              >
                                {e.label}
                              </button>
                            )
                          })}
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-between">
                          <div className="flex flex-col gap-0.5 min-w-0">
                            {(j.liga || j.clube) && (
                              <div className="text-xs truncate" style={{ color: "rgba(255,255,255,0.50)" }}>
                                {[j.liga, j.clube].filter(Boolean).join(" · ")}
                              </div>
                            )}
                            {j.valorMercado && (
                              <Badge variant="outline" className="text-xs border-[#00D66C]/30 text-[#00D66C] w-fit">
                                {j.valorMercado >= 1_000_000 ? `€${(j.valorMercado/1_000_000).toFixed(1)}M` : `€${(j.valorMercado/1000).toFixed(0)}K`}
                              </Badge>
                            )}
                          </div>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button size="icon" variant="ghost" className="w-7 h-7 text-muted-foreground hover:text-white" onClick={() => openEdit(j)}>
                              <Pencil className="w-3.5 h-3.5" />
                            </Button>
                            <Button size="icon" variant="ghost" className="w-7 h-7 text-destructive hover:text-destructive" onClick={() => remove(j.id)}>
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </TabsContent>

          {/* TAB: Super Pesquisa */}
          <TabsContent value="pesquisa">
            <ScoutSearch jogadores={jogadores} onEdit={openEdit} onRefresh={refresh} />
          </TabsContent>

          {/* TAB: Mapa Mundial */}
          <TabsContent value="mapa">
            <WorldMap jogadores={jogadores} onEdit={openEdit} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialog add/edit */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl h-[92vh] flex flex-col overflow-hidden p-0 gap-0">
          {/* Header gradient */}
          <div className="relative px-6 pt-6 pb-4 flex-shrink-0" style={{ background: "linear-gradient(135deg, #00D66C15 0%, #0066FF15 50%, #8B5CF615 100%)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="flex items-center gap-4">
              {/* Avatar com upload */}
              <div className="relative shrink-0">
                <div
                  className="w-16 h-16 rounded-full overflow-hidden border-2 cursor-pointer group/avatar"
                  style={{ borderColor: "#00D66C", boxShadow: "0 0 12px #00D66C44" }}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {form.fotoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={form.fotoUrl} alt="foto" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                      <User className="w-7 h-7 text-muted-foreground" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity rounded-full">
                    <Camera className="w-5 h-5 text-white" />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-white"
                  style={{ background: "#00D66C" }}
                >
                  <Upload className="w-3 h-3" />
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
              </div>
              <div className="flex-1 min-w-0">
                <DialogTitle className="text-lg font-bold mb-0.5">
                  {editingId ? "Edit Scouting Profile" : "New Scouting Profile"}
                </DialogTitle>
                <p className="text-xs text-muted-foreground">
                  {form.nome || "New athlete"} {form.posicao ? `· ${form.posicao}` : ""}
                </p>
              </div>
            </div>
          </div>

          <div className="px-6 pt-4 flex-1 min-h-0 overflow-hidden flex flex-col">
            <Tabs defaultValue="info" className="w-full flex flex-col flex-1 min-h-0">
              <TabsList className="w-full mb-4 grid grid-cols-5 h-auto p-1 flex-shrink-0" style={{ background: "hsl(var(--muted)/0.4)" }}>
                <TabsTrigger value="info" className="flex flex-col items-center gap-1 py-2 text-xs data-[state=active]:text-[#00D66C]">
                  <User className="w-4 h-4" /><span>Info</span>
                </TabsTrigger>
                <TabsTrigger value="contrato" className="flex flex-col items-center gap-1 py-2 text-xs data-[state=active]:text-[#0066FF]">
                  <FileText className="w-4 h-4" /><span>Contract</span>
                </TabsTrigger>
                <TabsTrigger value="caracteristicas" className="flex flex-col items-center gap-1 py-2 text-xs data-[state=active]:text-[#8B5CF6]">
                  <Award className="w-4 h-4" /><span>Atributos</span>
                </TabsTrigger>
                <TabsTrigger value="stats" className="flex flex-col items-center gap-1 py-2 text-xs data-[state=active]:text-[#FF6B35]">
                  <BarChart3 className="w-4 h-4" /><span>Stats</span>
                </TabsTrigger>
                <TabsTrigger value="clips" className="flex flex-col items-center gap-1 py-2 text-xs data-[state=active]:text-[#EC4899]">
                  <Video className="w-4 h-4" /><span>Videos</span>
                </TabsTrigger>
              </TabsList>

              {/* INFO */}
              <TabsContent value="info" className="space-y-4 flex-1 min-h-0 overflow-y-auto pb-2 mt-0">
                <div className="p-3 rounded-lg border border-[#00D66C]/20" style={{ background: "#00D66C08" }}>
                  <div className="text-xs font-bold uppercase tracking-wider text-[#00D66C] mb-3">Identification</div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs">Name *</Label>
                      <Input value={form.nome} onChange={e => setForm({...form, nome: e.target.value})} className="mt-1" />
                    </div>
                    <div>
                      <Label className="text-xs">Date of Birth</Label>
                      <Input type="date" value={form.dataNascimento} onChange={e => setForm({...form, dataNascimento: e.target.value})} className="mt-1" />
                    </div>
                    <div>
                      <Label className="text-xs">Current Club</Label>
                      <Input value={form.clube} onChange={e => setForm({...form, clube: e.target.value})} className="mt-1" />
                    </div>
                    <div>
                      <Label className="text-xs">Country</Label>
                      <div className="relative mt-1">
                        <Input value={form.nacionalidade} onChange={e => setForm({...form, nacionalidade: e.target.value})} placeholder="e.g.: Portugal" />
                        {form.nacionalidade && getCountryInfo(form.nacionalidade).flag && (
                          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-lg">{getCountryInfo(form.nacionalidade).flag}</span>
                        )}
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs">League</Label>
                      <Input placeholder="e.g.: Premier League" value={form.liga ?? ""} onChange={e => setForm({...form, liga: e.target.value})} className="mt-1" />
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-lg border border-border/40" style={{ background: "hsl(var(--muted)/0.2)" }}>
                  <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Profile</div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <Label className="text-xs">Position</Label>
                      <Select value={form.posicao} onValueChange={v => setForm({...form, posicao: v})}>
                        <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                        <SelectContent>{POSICOES.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs">Preferred Foot</Label>
                      <Select value={form.pePreferido} onValueChange={v => setForm({...form, pePreferido: v as PePreferido})}>
                        <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="direito">Right</SelectItem>
                          <SelectItem value="esquerdo">Left</SelectItem>
                          <SelectItem value="ambidestro">Both</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs">Status</Label>
                      <Select value={form.estado} onValueChange={v => setForm({...form, estado: v as EstadoScouting})}>
                        <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                        <SelectContent>{ESTADOS.map(e => <SelectItem key={e.value} value={e.value}>{e.label}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3 mt-3">
                    <NumInput label="Height (cm)" value={form.altura} onChange={v => setForm({...form, altura: v})} placeholder="180" min={140} max={220} />
                    <NumInput label="Weight (kg)" value={form.peso} onChange={v => setForm({...form, peso: v})} placeholder="75" min={40} max={130} />
                    <div>
                      <Label className="text-xs">Observation Date</Label>
                      <Input type="date" value={form.dataObservacao} onChange={e => setForm({...form, dataObservacao: e.target.value})} className="mt-1 h-8" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg border border-yellow-400/20" style={{ background: "rgba(250,204,21,0.05)" }}>
                    <div className="text-xs font-bold uppercase tracking-wider text-yellow-400/80 mb-2">Overall Rating</div>
                    <StarRating value={form.avaliacao} onChange={v => setForm({...form, avaliacao: v})} size="md" />
                  </div>
                  <div className="p-3 rounded-lg border border-[#8B5CF6]/20" style={{ background: "rgba(139,92,246,0.05)" }}>
                    <div className="text-xs font-bold uppercase tracking-wider text-[#8B5CF6] mb-2">Potential</div>
                    <StarRating value={form.potencial ?? 3} onChange={v => setForm({...form, potencial: v})} size="md" />
                  </div>
                </div>
              </TabsContent>

              {/* CONTRATO */}
              <TabsContent value="contrato" className="space-y-4 flex-1 min-h-0 overflow-y-auto pb-2 mt-0">
                <div className="p-3 rounded-lg border border-[#0066FF]/20" style={{ background: "#0066FF08" }}>
                  <div className="text-xs font-bold uppercase tracking-wider text-[#0066FF] mb-3">Contract Data</div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs">Contract End</Label>
                      <Input type="date" value={form.fimContrato ?? ""} onChange={e => setForm({...form, fimContrato: e.target.value})} className="mt-1" />
                    </div>
                    <NumInput label="Market Value (€)" value={form.valorMercado} onChange={v => setForm({...form, valorMercado: v})} placeholder="1000000" />
                    <NumInput label="Salary (€/month)" value={form.salario} onChange={v => setForm({...form, salario: v})} placeholder="50000" />
                  </div>
                </div>
                <div className="p-3 rounded-lg border border-[#0066FF]/10" style={{ background: "#0066FF05" }}>
                  <div className="text-xs font-bold uppercase tracking-wider text-[#0066FF]/70 mb-3">Representation</div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <Label className="text-xs">Agent Name</Label>
                      <Input placeholder="e.g.: Jorge Mendes" value={form.nomeAgente ?? ""} onChange={e => setForm({...form, nomeAgente: e.target.value})} className="mt-1" />
                    </div>
                    <div>
                      <Label className="text-xs">Agency</Label>
                      <Input placeholder="e.g.: Gestifute" value={form.agencia ?? ""} onChange={e => setForm({...form, agencia: e.target.value})} className="mt-1" />
                    </div>
                    <div>
                      <Label className="text-xs">Agent Contact</Label>
                      <Input placeholder="email or phone" value={form.contactoAgente ?? ""} onChange={e => setForm({...form, contactoAgente: e.target.value})} className="mt-1" />
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* ATRIBUTOS */}
              <TabsContent value="caracteristicas" className="space-y-2 flex-1 min-h-0 overflow-y-auto pb-2 mt-0">
                {/* Rating legend */}
                <div className="flex flex-wrap gap-x-3 gap-y-1 text-[9px] px-1 pb-1">
                  {[["1–2","Very Weak","#EF4444"],["3–4","Weak","#FF6B35"],["5","Medium","rgba(255,255,255,0.5)"],["6","Good","rgba(255,255,255,0.75)"],["7","Very Good","#facc15"],["8","Excellent","#00D66C"],["9","Elite","#00D66C"],["10","World Class","#00D66C"]].map(([n,l,c]) => (
                    <span key={n} className="font-semibold" style={{ color: c as string }}>{n} {l}</span>
                  ))}
                </div>

                {/* Row 1: Offensive + Defensive */}
                <div className="grid grid-cols-2 gap-2">
                  <AttrSection title="Offensive" color="#00D66C"
                    attrs={[["Ball Control","aOBallControl"],["First Touch","aOFirstTouch"],["Short Pass","aOShortPass"],["Long Pass","aOLongPass"],["Crossing","aOCrossing"],["Heading","aOHeading"],["Finishing","aOFinishing"],["Dribbling","aODribbling"],["Feint","aOFeint"]]}
                    values={form as unknown as Record<string, unknown>}
                    onChange={(k,v) => setForm({...form, [k]: v})}
                  />
                  <AttrSection title="Defensive" color="#EF4444"
                    attrs={[["Positioning","aDPositioning"],["Defensive Awareness","aDDefensiveAwareness"],["Marcation","aDMarcation"],["Interceptions","aDInterceptions"],["Tackling","aDTackling"],["Aerial Duels","aDAerialDuels"],["Aggression","aDAggression"]]}
                    values={form as unknown as Record<string, unknown>}
                    onChange={(k,v) => setForm({...form, [k]: v})}
                  />
                </div>

                {/* Row 2: Attacking Impact + Set Pieces */}
                <div className="grid grid-cols-2 gap-2">
                  <AttrSection title="Attacking Impact" color="#FF6B35"
                    attrs={[["Penetration","aIPenetration"],["Off Ball","aIOffBall"],["Vision","aIVision"],["Chance Creation","aIChanceCreation"],["Creativity","aICreativity"],["Desmarcation","aIDesmarcation"]]}
                    values={form as unknown as Record<string, unknown>}
                    onChange={(k,v) => setForm({...form, [k]: v})}
                  />
                  <AttrSection title="Set Pieces" color="#8B5CF6"
                    attrs={[["Penalty","aSPPenalty"],["Corners","aSPCorners"],["Free Kicks","aSPFreeKicks"],["Long Throws","aSPLongThrows"]]}
                    values={form as unknown as Record<string, unknown>}
                    onChange={(k,v) => setForm({...form, [k]: v})}
                  />
                </div>

                {/* Row 3: Physical + Mental */}
                <div className="grid grid-cols-2 gap-2">
                  <AttrSection title="Physical" color="#0066FF"
                    attrs={[["Acceleration","aPAcceleration"],["Sprint","aPSprint"],["Agility","aPAgility"],["Balance","aPBalance"],["Jumping","aPJumping"],["Strength","aPStrength"],["Endurance","aPEndurance"]]}
                    values={form as unknown as Record<string, unknown>}
                    onChange={(k,v) => setForm({...form, [k]: v})}
                  />
                  <AttrSection title="Mental" color="#facc15"
                    attrs={[["Mentality","aMentality"],["Competitive","aCompetitive"],["Concentration","aConcentration"],["Composure","aComposure"],["Courage","aCourage"],["Leadership","aLeadership"],["Work Ethic","aWorkEthic"],["Team Work","aTeamWork"]]}
                    values={form as unknown as Record<string, unknown>}
                    onChange={(k,v) => setForm({...form, [k]: v})}
                  />
                </div>

                {/* Row 4: Game Intelligence + Biometric Data */}
                <div className="grid grid-cols-2 gap-2">
                  <AttrSection title="Game Intelligence" color="#06B6D4"
                    attrs={[["Game Reading","aGIGameReading"],["Decision Making","aGIDecisionMaking"],["Spatial Awareness","aGISpatialAwareness"],["Tactical Discipline","aGITacticalDiscipline"],["Off-Ball Movement","aGIOffBallMovement"]]}
                    values={form as unknown as Record<string, unknown>}
                    onChange={(k,v) => setForm({...form, [k]: v})}
                  />
                  {/* Biometric Data */}
                  <div className="rounded-lg border p-2" style={{ borderColor: "rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.03)" }}>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-white/40 mb-2">Biometric Data</div>
                    <table className="w-full">
                      <tbody>
                        <tr className="border-b border-white/5">
                          <td className="text-[10px] text-white/60 py-0.5 pr-1">Height</td>
                          <td className="text-[10px] font-bold text-white/80 py-0.5 text-right" colSpan={2}>{form.altura ? `${form.altura} cm` : "—"}</td>
                        </tr>
                        <tr className="border-b border-white/5">
                          <td className="text-[10px] text-white/60 py-0.5 pr-1">Weight</td>
                          <td className="text-[10px] font-bold text-white/80 py-0.5 text-right" colSpan={2}>{form.peso ? `${form.peso} kg` : "—"}</td>
                        </tr>
                        <tr className="border-b border-white/5">
                          <td className="text-[10px] text-white/60 py-0.5 pr-1">Pref. Foot</td>
                          <td className="text-[10px] font-bold text-white/80 py-0.5 text-right capitalize" colSpan={2}>{form.pePreferido === "direito" ? "Right" : form.pePreferido === "esquerdo" ? "Left" : "Both"}</td>
                        </tr>
                        <tr className="border-b border-white/5">
                          <td className="text-[10px] text-white/60 py-0.5 pr-1">2nd Foot</td>
                          <td colSpan={2} className="py-0.5">
                            <Select value={form.secondaryFoot ?? ""} onValueChange={v => setForm({...form, secondaryFoot: v})}>
                              <SelectTrigger className="h-5 text-[10px] border-0 bg-transparent p-0 pr-1 shadow-none"><SelectValue placeholder="—" /></SelectTrigger>
                              <SelectContent><SelectItem value="Right">Right</SelectItem><SelectItem value="Left">Left</SelectItem><SelectItem value="Both">Both</SelectItem><SelectItem value="None">None</SelectItem></SelectContent>
                            </Select>
                          </td>
                        </tr>
                        <tr className="border-b border-white/5">
                          <td className="text-[10px] text-white/60 py-0.5 pr-1">Body Type</td>
                          <td colSpan={2} className="py-0.5">
                            <Select value={form.bodyType ?? ""} onValueChange={v => setForm({...form, bodyType: v})}>
                              <SelectTrigger className="h-5 text-[10px] border-0 bg-transparent p-0 pr-1 shadow-none"><SelectValue placeholder="—" /></SelectTrigger>
                              <SelectContent><SelectItem value="Slim">Slim</SelectItem><SelectItem value="Athletic">Athletic</SelectItem><SelectItem value="Stocky">Stocky</SelectItem><SelectItem value="Robust">Robust</SelectItem></SelectContent>
                            </Select>
                          </td>
                        </tr>
                        {[["Injury Risk","injuryRisk"],["Natural Fitness","bioNaturalFitness"]].map(([label, key]) => {
                          const val = (form as unknown as Record<string, number | undefined>)[key]
                          const { label: rLabel, color: rColor } = getRatingInfo(val)
                          return (
                            <tr key={key} className="border-b border-white/5 last:border-0">
                              <td className="text-[10px] text-white/60 py-0.5 pr-1">{label}</td>
                              <td className="py-0.5 px-1">
                                <input type="number" min={1} max={10} value={val ?? ""} placeholder="—"
                                  onChange={e => setForm({...form, [key]: e.target.value === "" ? undefined : Math.min(10, Math.max(1, Number(e.target.value)))})}
                                  className="w-7 h-5 text-[11px] font-bold text-center bg-transparent border-0 outline-none p-0"
                                  style={{ color: rColor, caretColor: "#fff" }}
                                />
                              </td>
                              <td className="py-0.5 pl-1 text-right"><span className="text-[9px] font-semibold" style={{ color: rColor }}>{rLabel}</span></td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Strengths + Weaknesses + Notes */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs text-[#00D66C]">Strengths</Label>
                    <Textarea placeholder="List strengths..." value={form.pontosFortess} onChange={e => setForm({...form, pontosFortess: e.target.value})} className="mt-1 h-20 border-[#00D66C]/20" />
                  </div>
                  <div>
                    <Label className="text-xs text-destructive">Weaknesses</Label>
                    <Textarea placeholder="Areas to improve..." value={form.pontosFracos} onChange={e => setForm({...form, pontosFracos: e.target.value})} className="mt-1 h-20 border-destructive/20" />
                  </div>
                </div>
                <div>
                  <Label className="text-xs">Notes</Label>
                  <Textarea placeholder="Free notes..." value={form.notas} onChange={e => setForm({...form, notas: e.target.value})} className="mt-1 h-16" />
                </div>
              </TabsContent>

              {/* STATS */}
              <TabsContent value="stats" className="space-y-5 flex-1 min-h-0 overflow-y-auto pb-2 mt-0">
                <div className="p-3 rounded-lg border border-border/40" style={{ background: "hsl(var(--muted)/0.2)" }}>
                  <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Match Statistics</div>
                  <div className="grid grid-cols-3 gap-3">
                    <NumInput label="Goals" value={form.golos} onChange={v => setForm({...form, golos: v})} placeholder="12" min={0} />
                    <NumInput label="Assists" value={form.assistencias} onChange={v => setForm({...form, assistencias: v})} placeholder="8" min={0} />
                    <NumInput label="Games" value={form.jogosDisputados} onChange={v => setForm({...form, jogosDisputados: v})} placeholder="30" min={0} />
                    <NumInput label="Minutes" value={form.minutosJogados} onChange={v => setForm({...form, minutosJogados: v})} placeholder="2400" min={0} />
                    <NumInput label="Yellow Cards" value={form.cartoesAmarelos} onChange={v => setForm({...form, cartoesAmarelos: v})} placeholder="3" min={0} />
                    <NumInput label="Red Cards" value={form.cartoesVermelhos} onChange={v => setForm({...form, cartoesVermelhos: v})} placeholder="0" min={0} />
                  </div>
                </div>
                <div className="p-3 rounded-lg border border-[#0066FF]/20" style={{ background: "#0066FF08" }}>
                  <div className="text-xs font-bold uppercase tracking-wider text-[#0066FF] mb-3">Performance Metrics</div>
                  <div className="grid grid-cols-2 gap-3">
                    <NumInput label="xG (Exp. Goals)" value={form.xg} onChange={v => setForm({...form, xg: v})} placeholder="0.45" min={0} />
                    <NumInput label="xA (Exp. Assists)" value={form.xa} onChange={v => setForm({...form, xa: v})} placeholder="0.30" min={0} />
                    <NumInput label="xGOT (on Target)" value={form.xgot} onChange={v => setForm({...form, xgot: v})} placeholder="0.60" min={0} />
                    <NumInput label="Key Passes / game" value={form.keyPassesPorJogo} onChange={v => setForm({...form, keyPassesPorJogo: v})} placeholder="2.1" min={0} />
                    <NumInput label="Shots / game" value={form.chutesPorJogo} onChange={v => setForm({...form, chutesPorJogo: v})} placeholder="3.5" min={0} />
                    <NumInput label="Pass Accuracy (%)" value={form.precisaoPasses} onChange={v => setForm({...form, precisaoPasses: v})} placeholder="84" min={0} max={100} />
                    <NumInput label="Dribbles Comp. / game" value={form.driblesCompletados} onChange={v => setForm({...form, driblesCompletados: v})} placeholder="1.8" min={0} />
                    <NumInput label="Aerial Duels Won (%)" value={form.duelosAereos} onChange={v => setForm({...form, duelosAereos: v})} placeholder="55" min={0} max={100} />
                    <NumInput label="Ground Duels Won (%)" value={form.duelosTerrestres} onChange={v => setForm({...form, duelosTerrestres: v})} placeholder="60" min={0} max={100} />
                    <NumInput label="Interceptions / game" value={form.intercecoes} onChange={v => setForm({...form, intercecoes: v})} placeholder="1.2" min={0} />
                  </div>
                </div>
              </TabsContent>

              {/* VÍDEOS / CLIPS */}
              <TabsContent value="clips" className="space-y-2 flex-1 min-h-0 overflow-y-auto pb-2 mt-0">
                <ClipsTab
                  clips={form.clips ?? []}
                  onChange={clips => setForm({ ...form, clips })}
                />
              </TabsContent>
            </Tabs>
          </div>

          <DialogFooter className="px-6 pb-4 pt-3 flex-shrink-0 border-t border-white/5">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={save} disabled={!form.nome.trim()} className="text-white hover:opacity-90" style={{ background: "#FF6B35" }}>
              {editingId ? "Save" : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
