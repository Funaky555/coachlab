"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Search, Star, User, Pencil, Trash2, Filter } from "lucide-react"
import {
  type JogadorObservado, type EstadoScouting, type PePreferido,
  getJogadoresObservados, addJogadorObservado, updateJogadorObservado, deleteJogadorObservado
} from "@/lib/storage/scouting"

const ESTADOS: { value: EstadoScouting; label: string; color: string }[] = [
  { value: "em_observacao", label: "Em Observação", color: "#0066FF" },
  { value: "contactado", label: "Contactado", color: "#8B5CF6" },
  { value: "contratado", label: "Contratado", color: "#00D66C" },
  { value: "descartado", label: "Descartado", color: "#6B7280" },
]

const POSICOES = ["GR","DD","DC","DE","MDC","MC","MD","MDE","MEE","AV","PL"]

function estadoBadge(estado: EstadoScouting) {
  const e = ESTADOS.find(s => s.value === estado) ?? ESTADOS[0]
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
      style={{ background: `${e.color}20`, color: e.color, border: `1px solid ${e.color}40` }}
    >
      {e.label}
    </span>
  )
}

function StarRating({ value, onChange }: { value: number; onChange?: (v: number) => void }) {
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(i => (
        <Star
          key={i}
          className={`w-4 h-4 ${onChange ? "cursor-pointer" : ""} ${i <= value ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground"}`}
          onClick={() => onChange?.(i)}
        />
      ))}
    </div>
  )
}

const emptyForm: Omit<JogadorObservado, "id"> = {
  nome: "", dataNascimento: "", clube: "", posicao: "DC", pePreferido: "direito",
  nacionalidade: "", fotoUrl: "", avaliacao: 3, estado: "em_observacao",
  caracteristicasTecnicas: "", caracteristicasTaticas: "",
  caracteristicasFisicas: "", caracteristicasMentais: "",
  pontosFortess: "", pontosFracos: "", notas: "",
  dataObservacao: new Date().toISOString().split("T")[0], jogosObservados: []
}

export function ScoutingModule() {
  const [jogadores, setJogadores] = useState<JogadorObservado[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<Omit<JogadorObservado, "id">>(emptyForm)
  const [filtroEstado, setFiltroEstado] = useState<EstadoScouting | "todos">("todos")
  const [filtroPosicao, setFiltroPosicao] = useState<string>("todos")
  const [searchText, setSearchText] = useState("")

  useEffect(() => {
    setJogadores(getJogadoresObservados())
  }, [])

  const filtered = jogadores.filter(j => {
    if (filtroEstado !== "todos" && j.estado !== filtroEstado) return false
    if (filtroPosicao !== "todos" && j.posicao !== filtroPosicao) return false
    if (searchText && !j.nome.toLowerCase().includes(searchText.toLowerCase()) && !j.clube.toLowerCase().includes(searchText.toLowerCase())) return false
    return true
  })

  function openAdd() {
    setEditingId(null)
    setForm(emptyForm)
    setDialogOpen(true)
  }

  function openEdit(j: JogadorObservado) {
    setEditingId(j.id)
    const { id, ...rest } = j
    setForm(rest)
    setDialogOpen(true)
  }

  function save() {
    if (!form.nome.trim()) return
    if (editingId) {
      updateJogadorObservado(editingId, form)
    } else {
      addJogadorObservado(form)
    }
    setJogadores(getJogadoresObservados())
    setDialogOpen(false)
  }

  function remove(id: string) {
    deleteJogadorObservado(id)
    setJogadores(getJogadoresObservados())
  }

  const countByEstado = (estado: EstadoScouting) => jogadores.filter(j => j.estado === estado).length

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: "var(--font-barlow-condensed)" }}>
          Scouting
        </h1>
        <p className="text-muted-foreground">Base de dados de jogadores observados e fichas de scouting</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {ESTADOS.map(e => (
          <Card key={e.value} className="glass-card border-border/50 cursor-pointer" onClick={() => setFiltroEstado(filtroEstado === e.value ? "todos" : e.value)}>
            <CardContent className="p-4">
              <div className="text-2xl font-bold" style={{ color: e.color, fontFamily: "var(--font-barlow-condensed)" }}>
                {countByEstado(e.value)}
              </div>
              <div className="text-sm text-muted-foreground">{e.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filtros e search */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Pesquisar por nome ou clube..." value={searchText} onChange={e => setSearchText(e.target.value)} className="pl-9" />
        </div>
        <Select value={filtroEstado} onValueChange={v => setFiltroEstado(v as EstadoScouting | "todos")}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Estado" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os estados</SelectItem>
            {ESTADOS.map(e => <SelectItem key={e.value} value={e.value}>{e.label}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filtroPosicao} onValueChange={setFiltroPosicao}>
          <SelectTrigger className="w-32"><SelectValue placeholder="Posição" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todas</SelectItem>
            {POSICOES.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
          </SelectContent>
        </Select>
        <Button onClick={openAdd} className="bg-[#FF6B35] hover:bg-[#FF6B35]/90 text-white gap-2">
          <Plus className="w-4 h-4" />
          Adicionar Jogador
        </Button>
      </div>

      {/* Grid de jogadores */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <Search className="w-12 h-12 mb-3 opacity-30" />
          <p className="text-lg font-medium">Nenhum jogador encontrado</p>
          <p className="text-sm">Adiciona o primeiro jogador observado</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(j => (
            <Card key={j.id} className="glass-card border-border/50 group hover:border-[#FF6B35]/30 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-start gap-3 mb-3">
                  {j.fotoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={j.fotoUrl} alt={j.nome} className="w-12 h-12 rounded-full object-cover shrink-0" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center shrink-0">
                      <User className="w-5 h-5 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold truncate">{j.nome}</div>
                    <div className="text-xs text-muted-foreground">{j.posicao} · {j.clube}</div>
                    <div className="mt-1">
                      <StarRating value={j.avaliacao} />
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  {estadoBadge(j.estado)}
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button size="icon" variant="ghost" className="w-7 h-7" onClick={() => openEdit(j)}>
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button size="icon" variant="ghost" className="w-7 h-7 text-destructive hover:text-destructive" onClick={() => remove(j.id)}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
                <div className="mt-2 text-xs text-muted-foreground">Obs: {j.dataObservacao}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Editar Ficha de Scouting" : "Nova Ficha de Scouting"}</DialogTitle>
          </DialogHeader>
          <Tabs defaultValue="info" className="py-2">
            <TabsList className="mb-4">
              <TabsTrigger value="info">Informação</TabsTrigger>
              <TabsTrigger value="caracteristicas">Características</TabsTrigger>
              <TabsTrigger value="avaliacao">Avaliação</TabsTrigger>
            </TabsList>

            <TabsContent value="info" className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Nome *</Label>
                  <Input value={form.nome} onChange={e => setForm({...form, nome: e.target.value})} className="mt-1" />
                </div>
                <div>
                  <Label>Data de Nascimento</Label>
                  <Input type="date" value={form.dataNascimento} onChange={e => setForm({...form, dataNascimento: e.target.value})} className="mt-1" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Clube Atual</Label>
                  <Input value={form.clube} onChange={e => setForm({...form, clube: e.target.value})} className="mt-1" />
                </div>
                <div>
                  <Label>Nacionalidade</Label>
                  <Input value={form.nacionalidade} onChange={e => setForm({...form, nacionalidade: e.target.value})} className="mt-1" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label>Posição</Label>
                  <Select value={form.posicao} onValueChange={v => setForm({...form, posicao: v})}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>{POSICOES.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Pé Preferido</Label>
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
                  <Label>Estado</Label>
                  <Select value={form.estado} onValueChange={v => setForm({...form, estado: v as EstadoScouting})}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {ESTADOS.map(e => <SelectItem key={e.value} value={e.value}>{e.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>URL da Foto</Label>
                  <Input placeholder="https://..." value={form.fotoUrl} onChange={e => setForm({...form, fotoUrl: e.target.value})} className="mt-1" />
                </div>
                <div>
                  <Label>Data de Observação</Label>
                  <Input type="date" value={form.dataObservacao} onChange={e => setForm({...form, dataObservacao: e.target.value})} className="mt-1" />
                </div>
              </div>
              <div>
                <Label>Avaliação Geral</Label>
                <div className="mt-2">
                  <StarRating value={form.avaliacao} onChange={v => setForm({...form, avaliacao: v})} />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="caracteristicas" className="space-y-4">
              {[
                { key: "caracteristicasTecnicas" as const, label: "Características Técnicas" },
                { key: "caracteristicasTaticas" as const, label: "Características Táticas" },
                { key: "caracteristicasFisicas" as const, label: "Características Físicas" },
                { key: "caracteristicasMentais" as const, label: "Características Mentais" },
              ].map(f => (
                <div key={f.key}>
                  <Label>{f.label}</Label>
                  <Textarea placeholder="Descreve..." value={form[f.key]} onChange={e => setForm({...form, [f.key]: e.target.value})} className="mt-1 h-20" />
                </div>
              ))}
            </TabsContent>

            <TabsContent value="avaliacao" className="space-y-4">
              <div>
                <Label>Pontos Fortes</Label>
                <Textarea placeholder="Lista os pontos fortes do jogador..." value={form.pontosFortess} onChange={e => setForm({...form, pontosFortess: e.target.value})} className="mt-1 h-24" />
              </div>
              <div>
                <Label>Pontos Fracos</Label>
                <Textarea placeholder="Lista os pontos a melhorar..." value={form.pontosFracos} onChange={e => setForm({...form, pontosFracos: e.target.value})} className="mt-1 h-24" />
              </div>
              <div>
                <Label>Notas Adicionais</Label>
                <Textarea placeholder="Notas livres sobre o jogador..." value={form.notas} onChange={e => setForm({...form, notas: e.target.value})} className="mt-1 h-20" />
              </div>
            </TabsContent>
          </Tabs>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={save} className="bg-[#FF6B35] hover:bg-[#FF6B35]/90 text-white">
              {editingId ? "Guardar" : "Adicionar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
