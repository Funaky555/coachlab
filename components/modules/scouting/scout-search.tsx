"use client"

import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ChevronDown, ChevronRight, Search, X, Star, Pencil, Trash2, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react"
import { type JogadorObservado, type EstadoScouting, type FiltroScouting, deleteJogadorObservado, getJogadoresObservados } from "@/lib/storage/scouting"
import { NATIONALITY_TO_CODE, COUNTRY_FLAGS } from "./world-map-data"

function getFlag(nacionalidade?: string): string {
  if (!nacionalidade) return ""
  const code = NATIONALITY_TO_CODE[nacionalidade.toLowerCase().trim()]
  return code ? (COUNTRY_FLAGS[code] ?? "") : ""
}

const POSICOES_SCOUTING = ["GK","RB","CBR","CBL","LB","CM","CMR","CML","WR","OM","WL","ST"]
const ESTADOS_SCOUTING: { value: EstadoScouting; label: string; color: string }[] = [
  { value: "em_observacao", label: "Em Observação", color: "#0066FF" },
  { value: "contactado", label: "Contactado", color: "#8B5CF6" },
  { value: "contratado", label: "Contratado", color: "#00D66C" },
  { value: "descartado", label: "Descartado", color: "#6B7280" },
]

interface Props {
  jogadores: JogadorObservado[]
  onEdit: (j: JogadorObservado) => void
  onRefresh: () => void
}

type SortKey = keyof JogadorObservado
type SortDir = "asc" | "desc"

function calcIdade(dataNascimento?: string): number | undefined {
  if (!dataNascimento) return undefined
  return Math.floor((Date.now() - new Date(dataNascimento).getTime()) / (365.25 * 24 * 3600 * 1000))
}

function formatValor(v?: number): string {
  if (!v) return "—"
  if (v >= 1_000_000) return `€${(v / 1_000_000).toFixed(1)}M`
  if (v >= 1_000) return `€${(v / 1_000).toFixed(0)}K`
  return `€${v}`
}

function FilterSection({ title, id, open, onToggle, children }: {
  title: string; id: string; open: boolean; onToggle: () => void; children: React.ReactNode
}) {
  return (
    <div className="border-b border-border/40 last:border-0">
      <button
        className="w-full flex items-center justify-between px-3 py-2.5 text-sm font-semibold hover:bg-muted/30 transition-colors text-left"
        onClick={onToggle}
      >
        {title}
        {open ? <ChevronDown className="w-3.5 h-3.5 opacity-60" /> : <ChevronRight className="w-3.5 h-3.5 opacity-60" />}
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key={id}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 space-y-3">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function RangeSlider({ label, min, max, value, onChange, unit = "" }: {
  label: string; min: number; max: number; value: [number, number]; onChange: (v: [number, number]) => void; unit?: string
}) {
  return (
    <div>
      <div className="flex justify-between text-xs text-muted-foreground mb-2">
        <span>{label}</span>
        <span className="font-medium">{value[0]}{unit} – {value[1]}{unit}</span>
      </div>
      <Slider
        min={min} max={max} step={1}
        value={value}
        onValueChange={v => onChange(v as [number, number])}
        thumbCount={2}
      />
    </div>
  )
}

function MinSlider({ label, min, max, value, onChange, unit = "" }: {
  label: string; min: number; max: number; value: number; onChange: (v: number) => void; unit?: string
}) {
  return (
    <div>
      <div className="flex justify-between text-xs text-muted-foreground mb-2">
        <span>{label}</span>
        <span className="font-medium">mín {value}{unit}</span>
      </div>
      <Slider
        min={min} max={max} step={1}
        value={[value]}
        onValueChange={v => onChange(v[0])}
        thumbCount={1}
      />
    </div>
  )
}

export function ScoutSearch({ jogadores, onEdit, onRefresh }: Props) {
  const [openSections, setOpenSections] = useState<string[]>(["pessoal"])
  const [sortBy, setSortBy] = useState<SortKey>("avaliacao")
  const [sortDir, setSortDir] = useState<SortDir>("desc")

  // Filtros
  const [texto, setTexto] = useState("")
  const [posicoes, setPosicoes] = useState<string[]>([])
  const [estados, setEstados] = useState<EstadoScouting[]>([])
  const [pePreferido, setPePreferido] = useState<string[]>([])
  const [altura, setAltura] = useState<[number, number]>([155, 210])
  const [peso, setPeso] = useState<[number, number]>([50, 110])
  const [idade, setIdade] = useState<[number, number]>([14, 45])
  const [avaliacaoMin, setAvaliacaoMin] = useState(1)
  const [potencialMin, setPotencialMin] = useState(1)
  const [clubeTexto, setClubeTexto] = useState("")
  const [velocidadeMin, setVelocidadeMin] = useState(0)
  const [aceleracaoMin, setAceleracaoMin] = useState(0)
  const [resistenciaMin, setResistenciaMin] = useState(0)
  const [forcaMin, setForcaMin] = useState(0)
  const [golosMin, setGolosMin] = useState(0)
  const [assistenciasMin, setAssistenciasMin] = useState(0)
  const [jogosMin, setJogosMin] = useState(0)
  const [sprintsMin, setSprintsMin] = useState(0)
  const [distanciaMin, setDistanciaMin] = useState(0)
  const [velMaxMin, setVelMaxMin] = useState(0)
  const [ligaTexto, setLigaTexto] = useState("")
  // ligaTexto mantido para pesquisa rápida mas removido do painel lateral

  function toggleSection(id: string) {
    setOpenSections(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id])
  }

  function toggleArr<T>(arr: T[], item: T, set: (v: T[]) => void) {
    set(arr.includes(item) ? arr.filter(x => x !== item) : [...arr, item])
  }

  function clearAll() {
    setTexto(""); setPosicoes([]); setEstados([]); setPePreferido([])
    setAltura([155, 210]); setPeso([50, 110]); setIdade([14, 45])
    setAvaliacaoMin(1); setPotencialMin(1); setClubeTexto("")
    setVelocidadeMin(0); setAceleracaoMin(0)
    setResistenciaMin(0); setForcaMin(0); setGolosMin(0)
    setAssistenciasMin(0); setJogosMin(0); setSprintsMin(0)
    setDistanciaMin(0); setVelMaxMin(0); setLigaTexto("")
  }

  const filtro: FiltroScouting = {
    texto: texto || undefined,
    posicoes: posicoes.length ? posicoes : undefined,
    estados: estados.length ? estados : undefined,
    pePreferido: pePreferido.length ? pePreferido as FiltroScouting["pePreferido"] : undefined,
    alturaMin: altura[0] > 155 ? altura[0] : undefined,
    alturaMax: altura[1] < 210 ? altura[1] : undefined,
    pesoMin: peso[0] > 50 ? peso[0] : undefined,
    pesoMax: peso[1] < 110 ? peso[1] : undefined,
    idadeMin: idade[0] > 14 ? idade[0] : undefined,
    idadeMax: idade[1] < 45 ? idade[1] : undefined,
    avaliacaoMin: avaliacaoMin > 1 ? avaliacaoMin : undefined,
    potencialMin: potencialMin > 1 ? potencialMin : undefined,
    clubeTexto: clubeTexto || undefined,
    velocidadeMin: velocidadeMin > 0 ? velocidadeMin : undefined,
    aceleracaoMin: aceleracaoMin > 0 ? aceleracaoMin : undefined,
    resistenciaMin: resistenciaMin > 0 ? resistenciaMin : undefined,
    forcaMin: forcaMin > 0 ? forcaMin : undefined,
    golosMin: golosMin > 0 ? golosMin : undefined,
    assistenciasMin: assistenciasMin > 0 ? assistenciasMin : undefined,
    jogosMin: jogosMin > 0 ? jogosMin : undefined,
    sprintsMin: sprintsMin > 0 ? sprintsMin : undefined,
    distanciaMin: distanciaMin > 0 ? distanciaMin : undefined,
    velMaxMin: velMaxMin > 0 ? velMaxMin : undefined,
  }

  const filtered = useMemo(() => {
    let result = jogadores.filter(j => {
      if (filtro.texto) {
        const t = filtro.texto.toLowerCase()
        if (!j.nome.toLowerCase().includes(t) && !j.clube.toLowerCase().includes(t) && !(j.nacionalidade?.toLowerCase().includes(t))) return false
      }
      if (filtro.posicoes?.length && !filtro.posicoes.includes(j.posicao)) return false
      if (filtro.estados?.length && !filtro.estados.includes(j.estado)) return false
      if (filtro.pePreferido?.length && !filtro.pePreferido.includes(j.pePreferido)) return false
      if (filtro.alturaMin !== undefined && (j.altura ?? 0) < filtro.alturaMin) return false
      if (filtro.alturaMax !== undefined && (j.altura ?? 999) > filtro.alturaMax) return false
      if (filtro.pesoMin !== undefined && (j.peso ?? 0) < filtro.pesoMin) return false
      if (filtro.pesoMax !== undefined && (j.peso ?? 999) > filtro.pesoMax) return false
      if (filtro.idadeMin !== undefined || filtro.idadeMax !== undefined) {
        const id = calcIdade(j.dataNascimento)
        if (filtro.idadeMin !== undefined && (id ?? 0) < filtro.idadeMin) return false
        if (filtro.idadeMax !== undefined && (id ?? 999) > filtro.idadeMax) return false
      }
      if (filtro.avaliacaoMin !== undefined && j.avaliacao < filtro.avaliacaoMin) return false
      if (filtro.potencialMin !== undefined && (j.potencial ?? 0) < filtro.potencialMin) return false
      if (filtro.clubeTexto && !j.clube?.toLowerCase().includes(filtro.clubeTexto.toLowerCase())) return false
      if (filtro.velocidadeMin !== undefined && (j.velocidade ?? 0) < filtro.velocidadeMin) return false
      if (filtro.aceleracaoMin !== undefined && (j.aceleracao ?? 0) < filtro.aceleracaoMin) return false
      if (filtro.resistenciaMin !== undefined && (j.resistencia ?? 0) < filtro.resistenciaMin) return false
      if (filtro.forcaMin !== undefined && (j.forca ?? 0) < filtro.forcaMin) return false
      if (filtro.golosMin !== undefined && (j.golos ?? 0) < filtro.golosMin) return false
      if (filtro.assistenciasMin !== undefined && (j.assistencias ?? 0) < filtro.assistenciasMin) return false
      if (filtro.jogosMin !== undefined && (j.jogosDisputados ?? 0) < filtro.jogosMin) return false
      if (filtro.sprintsMin !== undefined && (j.sprintsPorJogo ?? 0) < filtro.sprintsMin) return false
      if (filtro.distanciaMin !== undefined && (j.distanciaPorJogo ?? 0) < filtro.distanciaMin) return false
      if (filtro.velMaxMin !== undefined && (j.velocidadeMaxima ?? 0) < filtro.velMaxMin) return false
      if (ligaTexto && !j.liga?.toLowerCase().includes(ligaTexto.toLowerCase())) return false
      return true
    })

    result = [...result].sort((a, b) => {
      const va = a[sortBy] ?? ""
      const vb = b[sortBy] ?? ""
      const cmp = String(va).localeCompare(String(vb), undefined, { numeric: true })
      return sortDir === "asc" ? cmp : -cmp
    })
    return result
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jogadores, texto, posicoes, estados, pePreferido, altura, peso, idade, avaliacaoMin, potencialMin,
    velocidadeMin, aceleracaoMin, resistenciaMin, forcaMin, golosMin, assistenciasMin,
    jogosMin, sprintsMin, distanciaMin, velMaxMin, ligaTexto, clubeTexto, sortBy, sortDir])

  function handleSort(col: SortKey) {
    if (sortBy === col) setSortDir(d => d === "asc" ? "desc" : "asc")
    else { setSortBy(col); setSortDir("desc") }
  }

  function SortIcon({ col }: { col: SortKey }) {
    if (sortBy !== col) return <ArrowUpDown className="w-3 h-3 opacity-40" />
    return sortDir === "asc" ? <ArrowUp className="w-3 h-3 text-[#00D66C]" /> : <ArrowDown className="w-3 h-3 text-[#00D66C]" />
  }

  function remove(id: string) {
    deleteJogadorObservado(id)
    onRefresh()
  }

  const estadoCfg = Object.fromEntries(ESTADOS_SCOUTING.map(e => [e.value, e]))

  const hasFilters = texto || posicoes.length || estados.length || pePreferido.length ||
    altura[0] > 155 || altura[1] < 210 || peso[0] > 50 || peso[1] < 110 ||
    idade[0] > 14 || idade[1] < 45 || avaliacaoMin > 1 || potencialMin > 1 || clubeTexto ||
    velocidadeMin > 0 || aceleracaoMin > 0 || resistenciaMin > 0 || forcaMin > 0 ||
    golosMin > 0 || assistenciasMin > 0 || jogosMin > 0 ||
    sprintsMin > 0 || distanciaMin > 0 || velMaxMin > 0 || ligaTexto

  return (
    <div className="flex gap-0 rounded-xl border border-border overflow-hidden" style={{ minHeight: 500 }}>
      {/* PAINEL DE FILTROS */}
      <div className="w-60 shrink-0 border-r border-border bg-card/50 overflow-y-auto">
        <div className="flex items-center justify-between px-3 py-2.5 border-b border-border">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Filtros</span>
          {hasFilters && (
            <button onClick={clearAll} className="text-xs text-[#FF6B35] hover:opacity-80 flex items-center gap-1">
              <X className="w-3 h-3" /> Limpar
            </button>
          )}
        </div>

        {/* Pesquisa rápida */}
        <div className="px-3 py-2.5 border-b border-border/40">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              placeholder="Nome, clube, país..."
              value={texto}
              onChange={e => setTexto(e.target.value)}
              className="pl-8 h-8 text-xs"
            />
          </div>
        </div>

        {/* Secção: Pessoal */}
        <FilterSection title="Pessoal" id="pessoal" open={openSections.includes("pessoal")} onToggle={() => toggleSection("pessoal")}>
          <div>
            <div className="text-xs text-muted-foreground mb-1.5">Posição</div>
            <div className="grid grid-cols-3 gap-1">
              {POSICOES_SCOUTING.map(p => (
                <button
                  key={p}
                  onClick={() => toggleArr(posicoes, p, setPosicoes)}
                  className="text-xs py-1 rounded font-semibold transition-colors"
                  style={{
                    background: posicoes.includes(p) ? "#00D66C" : "hsl(var(--muted))",
                    color: posicoes.includes(p) ? "#000" : "hsl(var(--muted-foreground))",
                  }}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground mb-1.5">Pé Preferido</div>
            <div className="flex gap-1">
              {(["direito","esquerdo","ambidestro"] as const).map(p => (
                <button key={p} onClick={() => toggleArr(pePreferido, p, setPePreferido)}
                  className="flex-1 text-xs py-1 rounded font-medium transition-colors capitalize"
                  style={{
                    background: pePreferido.includes(p) ? "#0066FF" : "hsl(var(--muted))",
                    color: pePreferido.includes(p) ? "#fff" : "hsl(var(--muted-foreground))",
                  }}
                >
                  {p === "ambidestro" ? "Amb." : p === "direito" ? "Dir." : "Esq."}
                </button>
              ))}
            </div>
          </div>
          <RangeSlider label="Idade" min={14} max={45} value={idade} onChange={setIdade} unit=" anos" />
          <RangeSlider label="Altura" min={155} max={210} value={altura} onChange={setAltura} unit="cm" />
          <RangeSlider label="Peso" min={50} max={110} value={peso} onChange={setPeso} unit="kg" />
        </FilterSection>

        {/* Secção: Estado */}
        <FilterSection title="Estado" id="estado" open={openSections.includes("estado")} onToggle={() => toggleSection("estado")}>
          <div className="space-y-1">
            {ESTADOS_SCOUTING.map(e => (
              <button key={e.value} onClick={() => toggleArr(estados, e.value, setEstados)}
                className="w-full text-left text-xs py-1.5 px-2 rounded transition-colors flex items-center gap-2"
                style={{ background: estados.includes(e.value) ? `${e.color}22` : "transparent" }}
              >
                <div className="w-2 h-2 rounded-full shrink-0" style={{ background: e.color }} />
                <span style={{ color: estados.includes(e.value) ? e.color : "hsl(var(--muted-foreground))" }}>{e.label}</span>
              </button>
            ))}
          </div>
        </FilterSection>

        {/* Secção: Clube */}
        <FilterSection title="Clube" id="clube" open={openSections.includes("clube")} onToggle={() => toggleSection("clube")}>
          <div>
            <div className="text-xs text-muted-foreground mb-1">Nome do Clube</div>
            <Input placeholder="ex: Benfica" value={clubeTexto} onChange={e => setClubeTexto(e.target.value)} className="h-7 text-xs" />
          </div>
        </FilterSection>

        {/* Secção: Avaliação */}
        <FilterSection title="Avaliação" id="avaliacao" open={openSections.includes("avaliacao")} onToggle={() => toggleSection("avaliacao")}>
          <div className="space-y-3">
            <div>
              <div className="text-xs text-muted-foreground mb-2">A. Geral mín.</div>
              <div className="flex gap-1">
                {[1,2,3,4,5].map(v => (
                  <button key={v} onClick={() => setAvaliacaoMin(v)}
                    className="flex-1 py-1 rounded text-xs transition-colors"
                    style={{ background: v <= avaliacaoMin ? "#FFD700" : "hsl(var(--muted))", color: v <= avaliacaoMin ? "#000" : undefined }}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>
            <div>
              <div className="text-xs mb-2" style={{ color: "#8B5CF6" }}>Potencial mín.</div>
              <div className="flex gap-1">
                {[1,2,3,4,5].map(v => (
                  <button key={v} onClick={() => setPotencialMin(v)}
                    className="flex-1 py-1 rounded text-xs transition-colors"
                    style={{ background: v <= potencialMin ? "#8B5CF6" : "hsl(var(--muted))", color: v <= potencialMin ? "#fff" : undefined }}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>
          </div>
        </FilterSection>

        {/* Secção: Atributos */}
        <FilterSection title="Atributos (0–20)" id="atributos" open={openSections.includes("atributos")} onToggle={() => toggleSection("atributos")}>
          <MinSlider label="Velocidade mín" min={0} max={20} value={velocidadeMin} onChange={setVelocidadeMin} />
          <MinSlider label="Aceleração mín" min={0} max={20} value={aceleracaoMin} onChange={setAceleracaoMin} />
          <MinSlider label="Resistência mín" min={0} max={20} value={resistenciaMin} onChange={setResistenciaMin} />
          <MinSlider label="Força mín" min={0} max={20} value={forcaMin} onChange={setForcaMin} />
        </FilterSection>

        {/* Secção: Estatísticas */}
        <FilterSection title="Estatísticas" id="stats" open={openSections.includes("stats")} onToggle={() => toggleSection("stats")}>
          <div className="space-y-2">
            {[
              { label: "Golos mín", value: golosMin, set: setGolosMin },
              { label: "Assistências mín", value: assistenciasMin, set: setAssistenciasMin },
              { label: "Jogos mín", value: jogosMin, set: setJogosMin },
            ].map(f => (
              <div key={f.label}>
                <div className="text-xs text-muted-foreground mb-1">{f.label}</div>
                <Input type="number" min={0} value={f.value || ""} onChange={e => f.set(Number(e.target.value) || 0)} className="h-7 text-xs" placeholder="0" />
              </div>
            ))}
          </div>
        </FilterSection>

        {/* Secção: Métricas GPS */}
        <FilterSection title="Métricas GPS" id="gps" open={openSections.includes("gps")} onToggle={() => toggleSection("gps")}>
          <div className="space-y-2">
            {[
              { label: "Sprints/jogo mín", value: sprintsMin, set: setSprintsMin },
              { label: "Distância/jogo mín (km)", value: distanciaMin, set: setDistanciaMin },
              { label: "Vel. máxima mín (km/h)", value: velMaxMin, set: setVelMaxMin },
            ].map(f => (
              <div key={f.label}>
                <div className="text-xs text-muted-foreground mb-1">{f.label}</div>
                <Input type="number" min={0} value={f.value || ""} onChange={e => f.set(Number(e.target.value) || 0)} className="h-7 text-xs" placeholder="0" />
              </div>
            ))}
          </div>
        </FilterSection>
      </div>

      {/* PAINEL DE RESULTADOS */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-card/30">
          <span className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">{filtered.length}</span> resultado{filtered.length !== 1 ? "s" : ""}
            {jogadores.length !== filtered.length && <span> de {jogadores.length}</span>}
          </span>
        </div>

        <div className="flex-1 overflow-auto">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <Search className="w-10 h-10 mb-2 opacity-30" />
              <p className="text-sm">Nenhum resultado encontrado</p>
              <button onClick={clearAll} className="text-xs text-[#00D66C] mt-1 hover:opacity-80">Limpar filtros</button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="text-xs">
                  {[
                    { col: "nome" as SortKey, label: "Nome" },
                    { col: "posicao" as SortKey, label: "Pos" },
                    { col: "clube" as SortKey, label: "Clube" },
                    { col: "nacionalidade" as SortKey, label: "País" },
                    { col: "liga" as SortKey, label: "Liga" },
                    { col: "avaliacao" as SortKey, label: "Aval" },
                    { col: "potencial" as SortKey, label: "Pot" },
                    { col: "velocidade" as SortKey, label: "Vel" },
                    { col: "golos" as SortKey, label: "G" },
                    { col: "assistencias" as SortKey, label: "A" },
                    { col: "jogosDisputados" as SortKey, label: "J" },
                    { col: "valorMercado" as SortKey, label: "Valor" },
                    { col: "estado" as SortKey, label: "Estado" },
                  ].map(({ col, label }) => (
                    <TableHead key={col} className="cursor-pointer select-none whitespace-nowrap" onClick={() => handleSort(col)}>
                      <div className="flex items-center gap-1">
                        {label} <SortIcon col={col} />
                      </div>
                    </TableHead>
                  ))}
                  <TableHead className="w-16"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(j => {
                  const ec = estadoCfg[j.estado]
                  return (
                    <TableRow key={j.id} className="cursor-pointer hover:bg-muted/20" onClick={() => onEdit(j)}>
                      <TableCell className="font-medium text-sm whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {j.fotoUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={j.fotoUrl} alt={j.nome} className="w-7 h-7 rounded-full object-cover shrink-0" />
                          ) : (
                            <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center shrink-0 text-xs font-bold">{j.nome[0]}</div>
                          )}
                          {j.nome}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs font-bold">{j.posicao}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground whitespace-nowrap">{j.clube || "—"}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {j.nacionalidade ? (
                          <span title={j.nacionalidade} className="text-base">{getFlag(j.nacionalidade) || j.nacionalidade}</span>
                        ) : "—"}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{j.liga || "—"}</TableCell>
                      <TableCell>
                        <div className="flex gap-0.5">
                          {[1,2,3,4,5].map(i => (
                            <Star key={i} className={`w-3 h-3 ${i <= j.avaliacao ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground"}`} />
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        {j.potencial !== undefined ? (
                          <div className="flex gap-0.5">
                            {[1,2,3,4,5].map(i => (
                              <Star key={i} className={`w-3 h-3 ${i <= j.potencial! ? "text-[#8B5CF6] fill-[#8B5CF6]" : "text-muted-foreground"}`} />
                            ))}
                          </div>
                        ) : <span className="text-muted-foreground">—</span>}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground text-center">{j.velocidade ?? "—"}</TableCell>
                      <TableCell className="text-sm text-muted-foreground text-center">{j.golos ?? "—"}</TableCell>
                      <TableCell className="text-sm text-muted-foreground text-center">{j.assistencias ?? "—"}</TableCell>
                      <TableCell className="text-sm text-muted-foreground text-center">{j.jogosDisputados ?? "—"}</TableCell>
                      <TableCell className="text-sm text-muted-foreground whitespace-nowrap">{formatValor(j.valorMercado)}</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap"
                          style={{ background: `${ec?.color}20`, color: ec?.color, border: `1px solid ${ec?.color}40` }}>
                          {ec?.label}
                        </span>
                      </TableCell>
                      <TableCell onClick={e => e.stopPropagation()}>
                        <div className="flex gap-1">
                          <Button size="icon" variant="ghost" className="w-7 h-7" onClick={() => onEdit(j)}>
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                          <Button size="icon" variant="ghost" className="w-7 h-7 text-destructive" onClick={() => remove(j.id)}>
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </div>
  )
}
