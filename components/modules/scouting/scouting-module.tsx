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
  Upload, Camera, FileText, BarChart3, Award, Eye, Phone, Handshake, XCircle, X, ChevronDown
} from "lucide-react"
import {
  type JogadorObservado, type EstadoScouting, type PePreferido,
  getJogadoresObservados, addJogadorObservado, updateJogadorObservado, deleteJogadorObservado
} from "@/lib/storage/scouting"
import { NATIONALITY_TO_CODE, COUNTRY_FLAGS, COUNTRY_NAMES } from "./world-map-data"
import { ScoutSearch } from "./scout-search"
import { WorldMap } from "./world-map"

const ESTADOS: { value: EstadoScouting; label: string; color: string; icon: React.ElementType }[] = [
  { value: "em_observacao", label: "Referenciados", color: "#0066FF", icon: Eye },
  { value: "contactado",    label: "Contactado",    color: "#8B5CF6", icon: Phone },
  { value: "contratado",    label: "Contratado",    color: "#00D66C", icon: Handshake },
  { value: "descartado",    label: "Descartado",    color: "#EF4444", icon: XCircle },
]

const ESTADOS_ACAO: { value: EstadoScouting; label: string; color: string }[] = [
  { value: "contactado", label: "Contactado", color: "#8B5CF6" },
  { value: "contratado", label: "Contratado", color: "#00D66C" },
  { value: "descartado", label: "Descartado", color: "#EF4444" },
]

const POSICOES = ["GK","RB","CBR","CBL","LB","CM","CMR","CML","WR","OM","WL","ST"]

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
  dataObservacao: new Date().toISOString().split("T")[0], jogosObservados: [],
}


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
          <Button onClick={openAdd} className="gap-2 shrink-0 text-white hover:opacity-90 shadow-lg" style={{ background: "linear-gradient(135deg, #FF6B35, #FF8C5A)", boxShadow: "0 4px 20px #FF6B3540" }}>
            <Plus className="w-4 h-4" /> Adicionar Atleta
          </Button>
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
              <Users className="w-4 h-4" /> Atletas <span className="font-bold text-white">{jogadores.length}</span>
            </TabsTrigger>
            <TabsTrigger
              value="pesquisa"
              className="flex-1 gap-2.5 px-5 py-3 font-black uppercase tracking-wide rounded-xl transition-all duration-200
                data-[state=inactive]:text-white/70 data-[state=inactive]:hover:text-white
                data-[state=active]:text-white data-[state=active]:shadow-lg"
              style={{ fontFamily: "var(--font-barlow-condensed)", fontSize: "16px", letterSpacing: "0.05em" }}
            >
              <Filter className="w-4 h-4" /> Super Pesquisa <span className="font-bold text-white">{jogadores.length}</span>
            </TabsTrigger>
            <TabsTrigger
              value="mapa"
              className="flex-1 gap-2.5 px-5 py-3 font-black uppercase tracking-wide rounded-xl transition-all duration-200
                data-[state=inactive]:text-white/70 data-[state=inactive]:hover:text-white
                data-[state=active]:text-white data-[state=active]:shadow-lg"
              style={{ fontFamily: "var(--font-barlow-condensed)", fontSize: "16px", letterSpacing: "0.05em" }}
            >
              <Globe2 className="w-4 h-4" /> Mapa Mundial <span className="font-bold text-white">{jogadores.length}</span>
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
                      <span className="text-xs text-muted-foreground">({jogadoresNestadoEstado.length} atletas)</span>
                    </div>
                    <button onClick={() => setExpandedEstado(null)} className="text-muted-foreground hover:text-foreground transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  {jogadoresNestadoEstado.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-4">Nenhum atleta neste estado</p>
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
                              title="Voltar a Referenciados"
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
                  placeholder="Pesquisar por nome ou clube..."
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
                  <SelectItem value="todos">Posições</SelectItem>
                  {POSICOES.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                <Search className="w-12 h-12 mb-3 opacity-30" />
                <p className="text-lg font-medium">Nenhum atleta encontrado</p>
                <p className="text-sm">Adiciona o primeiro jogador observado</p>
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
                                title={isAtivo ? `Voltar a Referenciados` : `Marcar como ${e.label}`}
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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
          {/* Header gradient */}
          <div className="relative px-6 pt-6 pb-4" style={{ background: "linear-gradient(135deg, #00D66C15 0%, #0066FF15 50%, #8B5CF615 100%)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
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
                  {editingId ? "Editar Ficha de Scouting" : "Nova Ficha de Scouting"}
                </DialogTitle>
                <p className="text-xs text-muted-foreground">
                  {form.nome || "Novo atleta"} {form.posicao ? `· ${form.posicao}` : ""}
                </p>
              </div>
            </div>
          </div>

          <div className="px-6 pt-4 pb-2">
            <Tabs defaultValue="info" className="w-full">
              <TabsList className="w-full mb-5 grid grid-cols-4 h-auto p-1" style={{ background: "hsl(var(--muted)/0.4)" }}>
                <TabsTrigger value="info" className="flex flex-col items-center gap-1 py-2 text-xs data-[state=active]:text-[#00D66C]">
                  <User className="w-4 h-4" /><span>Info</span>
                </TabsTrigger>
                <TabsTrigger value="contrato" className="flex flex-col items-center gap-1 py-2 text-xs data-[state=active]:text-[#0066FF]">
                  <FileText className="w-4 h-4" /><span>Contrato</span>
                </TabsTrigger>
                <TabsTrigger value="caracteristicas" className="flex flex-col items-center gap-1 py-2 text-xs data-[state=active]:text-[#8B5CF6]">
                  <Award className="w-4 h-4" /><span>Características</span>
                </TabsTrigger>
                <TabsTrigger value="stats" className="flex flex-col items-center gap-1 py-2 text-xs data-[state=active]:text-[#FF6B35]">
                  <BarChart3 className="w-4 h-4" /><span>Stats</span>
                </TabsTrigger>
              </TabsList>

              {/* INFO */}
              <TabsContent value="info" className="space-y-4">
                <div className="p-3 rounded-lg border border-[#00D66C]/20" style={{ background: "#00D66C08" }}>
                  <div className="text-xs font-bold uppercase tracking-wider text-[#00D66C] mb-3">Identificação</div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs">Nome *</Label>
                      <Input value={form.nome} onChange={e => setForm({...form, nome: e.target.value})} className="mt-1" />
                    </div>
                    <div>
                      <Label className="text-xs">Data de Nascimento</Label>
                      <Input type="date" value={form.dataNascimento} onChange={e => setForm({...form, dataNascimento: e.target.value})} className="mt-1" />
                    </div>
                    <div>
                      <Label className="text-xs">Clube Atual</Label>
                      <Input value={form.clube} onChange={e => setForm({...form, clube: e.target.value})} className="mt-1" />
                    </div>
                    <div>
                      <Label className="text-xs">Nacionalidade</Label>
                      <div className="relative mt-1">
                        <Input value={form.nacionalidade} onChange={e => setForm({...form, nacionalidade: e.target.value})} placeholder="ex: Portugal" />
                        {form.nacionalidade && getCountryInfo(form.nacionalidade).flag && (
                          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-lg">{getCountryInfo(form.nacionalidade).flag}</span>
                        )}
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs">Liga</Label>
                      <Input placeholder="ex: Premier League" value={form.liga ?? ""} onChange={e => setForm({...form, liga: e.target.value})} className="mt-1" />
                    </div>
                    <div>
                      <Label className="text-xs">País do Clube</Label>
                      <Input placeholder="ex: Inglaterra" value={form.paisClube ?? ""} onChange={e => setForm({...form, paisClube: e.target.value})} className="mt-1" />
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-lg border border-border/40" style={{ background: "hsl(var(--muted)/0.2)" }}>
                  <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Perfil</div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <Label className="text-xs">Posição</Label>
                      <Select value={form.posicao} onValueChange={v => setForm({...form, posicao: v})}>
                        <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                        <SelectContent>{POSICOES.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs">Pé Preferido</Label>
                      <Select value={form.pePreferido} onValueChange={v => setForm({...form, pePreferido: v as PePreferido})}>
                        <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="direito">Direito</SelectItem>
                          <SelectItem value="esquerdo">Esquerdo</SelectItem>
                          <SelectItem value="ambidestro">Ambidestro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs">Estado</Label>
                      <Select value={form.estado} onValueChange={v => setForm({...form, estado: v as EstadoScouting})}>
                        <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                        <SelectContent>{ESTADOS.map(e => <SelectItem key={e.value} value={e.value}>{e.label}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3 mt-3">
                    <NumInput label="Altura (cm)" value={form.altura} onChange={v => setForm({...form, altura: v})} placeholder="180" min={140} max={220} />
                    <NumInput label="Peso (kg)" value={form.peso} onChange={v => setForm({...form, peso: v})} placeholder="75" min={40} max={130} />
                    <div>
                      <Label className="text-xs">Data de Observação</Label>
                      <Input type="date" value={form.dataObservacao} onChange={e => setForm({...form, dataObservacao: e.target.value})} className="mt-1 h-8" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg border border-yellow-400/20" style={{ background: "rgba(250,204,21,0.05)" }}>
                    <div className="text-xs font-bold uppercase tracking-wider text-yellow-400/80 mb-2">Avaliação Geral</div>
                    <StarRating value={form.avaliacao} onChange={v => setForm({...form, avaliacao: v})} size="md" />
                  </div>
                  <div className="p-3 rounded-lg border border-[#8B5CF6]/20" style={{ background: "rgba(139,92,246,0.05)" }}>
                    <div className="text-xs font-bold uppercase tracking-wider text-[#8B5CF6] mb-2">Potencial</div>
                    <StarRating value={form.potencial ?? 3} onChange={v => setForm({...form, potencial: v})} size="md" />
                  </div>
                </div>
              </TabsContent>

              {/* CONTRATO */}
              <TabsContent value="contrato" className="space-y-4">
                <div className="p-3 rounded-lg border border-[#0066FF]/20" style={{ background: "#0066FF08" }}>
                  <div className="text-xs font-bold uppercase tracking-wider text-[#0066FF] mb-3">Dados Contratuais</div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs">Fim de Contrato</Label>
                      <Input type="date" value={form.fimContrato ?? ""} onChange={e => setForm({...form, fimContrato: e.target.value})} className="mt-1" />
                    </div>
                    <NumInput label="Valor de Mercado (€)" value={form.valorMercado} onChange={v => setForm({...form, valorMercado: v})} placeholder="1000000" />
                    <NumInput label="Salário (€/mês)" value={form.salario} onChange={v => setForm({...form, salario: v})} placeholder="50000" />
                  </div>
                </div>
                <div className="p-3 rounded-lg border border-[#0066FF]/10" style={{ background: "#0066FF05" }}>
                  <div className="text-xs font-bold uppercase tracking-wider text-[#0066FF]/70 mb-3">Representação</div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <Label className="text-xs">Nome do Agente</Label>
                      <Input placeholder="ex: Jorge Mendes" value={form.nomeAgente ?? ""} onChange={e => setForm({...form, nomeAgente: e.target.value})} className="mt-1" />
                    </div>
                    <div>
                      <Label className="text-xs">Agência</Label>
                      <Input placeholder="ex: Gestifute" value={form.agencia ?? ""} onChange={e => setForm({...form, agencia: e.target.value})} className="mt-1" />
                    </div>
                    <div>
                      <Label className="text-xs">Contacto do Agente</Label>
                      <Input placeholder="email ou telefone" value={form.contactoAgente ?? ""} onChange={e => setForm({...form, contactoAgente: e.target.value})} className="mt-1" />
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* CARACTERÍSTICAS */}
              <TabsContent value="caracteristicas" className="space-y-4">
                <div className="p-3 rounded-lg border border-[#8B5CF6]/20" style={{ background: "#8B5CF608" }}>
                  <div className="text-xs font-bold uppercase tracking-wider text-[#8B5CF6] mb-3">Análise Técnica</div>
                  {[
                    { key: "caracteristicasTecnicas" as const, label: "Características Técnicas" },
                    { key: "caracteristicasTaticas" as const, label: "Características Táticas" },
                    { key: "caracteristicasFisicas" as const, label: "Características Físicas" },
                    { key: "caracteristicasMentais" as const, label: "Características Mentais" },
                  ].map(f => (
                    <div key={f.key} className="mb-3 last:mb-0">
                      <Label className="text-xs">{f.label}</Label>
                      <Textarea placeholder="Descreve..." value={form[f.key]} onChange={e => setForm({...form, [f.key]: e.target.value})} className="mt-1 h-16" />
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs text-[#00D66C]">Pontos Fortes</Label>
                    <Textarea placeholder="Lista os pontos fortes..." value={form.pontosFortess} onChange={e => setForm({...form, pontosFortess: e.target.value})} className="mt-1 h-20 border-[#00D66C]/20" />
                  </div>
                  <div>
                    <Label className="text-xs text-destructive">Pontos Fracos</Label>
                    <Textarea placeholder="Pontos a melhorar..." value={form.pontosFracos} onChange={e => setForm({...form, pontosFracos: e.target.value})} className="mt-1 h-20 border-destructive/20" />
                  </div>
                </div>
                <div>
                  <Label className="text-xs">Notas</Label>
                  <Textarea placeholder="Notas livres..." value={form.notas} onChange={e => setForm({...form, notas: e.target.value})} className="mt-1 h-16" />
                </div>
              </TabsContent>

              {/* STATS */}
              <TabsContent value="stats" className="space-y-5">
                <div className="p-3 rounded-lg border border-[#FF6B35]/20" style={{ background: "#FF6B3508" }}>
                  <div className="text-xs font-bold uppercase tracking-wider text-[#FF6B35] mb-3">Atributos Físicos (0–20)</div>
                  <div className="grid grid-cols-2 gap-3">
                    <NumInput label="Velocidade" value={form.velocidade} onChange={v => setForm({...form, velocidade: v})} placeholder="15" min={0} max={20} />
                    <NumInput label="Aceleração" value={form.aceleracao} onChange={v => setForm({...form, aceleracao: v})} placeholder="16" min={0} max={20} />
                    <NumInput label="Resistência" value={form.resistencia} onChange={v => setForm({...form, resistencia: v})} placeholder="14" min={0} max={20} />
                    <NumInput label="Força" value={form.forca} onChange={v => setForm({...form, forca: v})} placeholder="13" min={0} max={20} />
                  </div>
                </div>
                <div className="p-3 rounded-lg border border-border/40" style={{ background: "hsl(var(--muted)/0.2)" }}>
                  <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Estatísticas de Jogo</div>
                  <div className="grid grid-cols-3 gap-3">
                    <NumInput label="Golos" value={form.golos} onChange={v => setForm({...form, golos: v})} placeholder="12" min={0} />
                    <NumInput label="Assistências" value={form.assistencias} onChange={v => setForm({...form, assistencias: v})} placeholder="8" min={0} />
                    <NumInput label="Jogos" value={form.jogosDisputados} onChange={v => setForm({...form, jogosDisputados: v})} placeholder="30" min={0} />
                    <NumInput label="Minutos" value={form.minutosJogados} onChange={v => setForm({...form, minutosJogados: v})} placeholder="2400" min={0} />
                    <NumInput label="Amarelos" value={form.cartoesAmarelos} onChange={v => setForm({...form, cartoesAmarelos: v})} placeholder="3" min={0} />
                    <NumInput label="Vermelhos" value={form.cartoesVermelhos} onChange={v => setForm({...form, cartoesVermelhos: v})} placeholder="0" min={0} />
                  </div>
                </div>
                <div className="p-3 rounded-lg border border-border/40" style={{ background: "hsl(var(--muted)/0.2)" }}>
                  <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Métricas GPS</div>
                  <div className="grid grid-cols-2 gap-3">
                    <NumInput label="Sprints / jogo" value={form.sprintsPorJogo} onChange={v => setForm({...form, sprintsPorJogo: v})} placeholder="18" min={0} />
                    <NumInput label="Distância / jogo (km)" value={form.distanciaPorJogo} onChange={v => setForm({...form, distanciaPorJogo: v})} placeholder="10.5" min={0} />
                    <NumInput label="Vel. Máxima (km/h)" value={form.velocidadeMaxima} onChange={v => setForm({...form, velocidadeMaxima: v})} placeholder="32" min={0} />
                    <NumInput label="FC Média (bpm)" value={form.fcMedia} onChange={v => setForm({...form, fcMedia: v})} placeholder="155" min={0} />
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <DialogFooter className="px-6 pb-6">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={save} disabled={!form.nome.trim()} className="text-white hover:opacity-90" style={{ background: "#FF6B35" }}>
              {editingId ? "Guardar" : "Adicionar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
