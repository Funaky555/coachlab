"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, Pencil, Trash2, User, AlertTriangle, CheckCircle2, Eye } from "lucide-react"
import {
  type Jogador, type EstadoJogador, type PosicaoJogador, type PePreferido,
  type OcorrenciaDisciplinar, type TipoOcorrencia, type GravidadeOcorrencia,
  getJogadores, addJogador, updateJogador, deleteJogador,
  getOcorrencias, addOcorrencia, deleteOcorrencia,
  getPrimarySetor,
} from "@/lib/storage/plantel"
import { PositionSelector } from "./position-selector"
import { AthleteProfileModal } from "./athlete-profile-modal"

const SETORES = [
  { key: "GR" as const, label: "Goalkeepers", color: "#FFD700" },
  { key: "DEF" as const, label: "Defenders",  color: "#0066FF" },
  { key: "MED" as const, label: "Midfielders", color: "#8B5CF6" },
  { key: "AV" as const, label: "Forwards",    color: "#00D66C" },
]

function estadoBadge(estado: EstadoJogador) {
  const map = {
    apto: { variant: "success" as const, label: "Fit" },
    condicionado: { variant: "warning" as const, label: "Limited" },
    lesionado: { variant: "destructive" as const, label: "Injured" },
  }
  const { variant, label } = map[estado]
  return <Badge variant={variant}>{label}</Badge>
}

function ocorrenciaBadge(tipo: TipoOcorrencia, gravidade: GravidadeOcorrencia) {
  const labels: Record<TipoOcorrencia, string> = {
    amarelo_interno: "Amarelo Int.", vermelho_interno: "Vermelho Int.",
    comportamento: "Comportamento", disciplinar: "Disciplinar",
  }
  const grav: Record<GravidadeOcorrencia, "warning" | "destructive" | "info"> = {
    leve: "info", moderada: "warning", grave: "destructive",
  }
  return (
    <div className="flex gap-1">
      <Badge variant={grav[gravidade]}>{labels[tipo]}</Badge>
      <Badge variant="outline" className="text-xs capitalize">{gravidade}</Badge>
    </div>
  )
}

const emptyForm = {
  nome: "", numero: 1,
  posicoes: ["CBR"] as PosicaoJogador[],
  estado: "apto" as EstadoJogador,
  foto: "", dataNascimento: "", nacionalidade: "",
  altura: "", peso: "",
  pePreferido: "" as PePreferido | "",
  notas: "",
}

export function PlantelModule() {
  const [jogadores, setJogadores] = useState<Jogador[]>([])
  const [ocorrencias, setOcorrencias] = useState<OcorrenciaDisciplinar[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [discDialogOpen, setDiscDialogOpen] = useState(false)
  const [discForm, setDiscForm] = useState({
    jogadorId: "", data: new Date().toISOString().split("T")[0],
    tipo: "comportamento" as TipoOcorrencia, gravidade: "leve" as GravidadeOcorrencia, descricao: ""
  })
  const [profileJogador, setProfileJogador] = useState<Jogador | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setJogadores(getJogadores())
    setOcorrencias(getOcorrencias())
  }, [])

  function refresh() {
    setJogadores(getJogadores())
    setOcorrencias(getOcorrencias())
  }

  function openAdd() {
    setEditingId(null)
    setForm(emptyForm)
    setDialogOpen(true)
  }

  function openEdit(j: Jogador) {
    setEditingId(j.id)
    setForm({
      nome: j.nome, numero: j.numero,
      posicoes: j.posicoes ?? ["DC"],
      estado: j.estado, foto: j.foto ?? "",
      dataNascimento: j.dataNascimento ?? "",
      nacionalidade: j.nacionalidade ?? "",
      altura: j.altura ? String(j.altura) : "",
      peso: j.peso ? String(j.peso) : "",
      pePreferido: j.pePreferido ?? "",
      notas: j.notas ?? "",
    })
    setDialogOpen(true)
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => setForm(f => ({ ...f, foto: ev.target?.result as string }))
    reader.readAsDataURL(file)
  }

  function saveJogador() {
    if (!form.nome.trim() || form.posicoes.length === 0) return
    const data: Omit<Jogador, "id"> = {
      nome: form.nome, numero: form.numero,
      posicoes: form.posicoes, estado: form.estado,
      foto: form.foto || undefined,
      dataNascimento: form.dataNascimento || undefined,
      nacionalidade: form.nacionalidade || undefined,
      altura: form.altura ? Number(form.altura) : undefined,
      peso: form.peso ? Number(form.peso) : undefined,
      pePreferido: (form.pePreferido as PePreferido) || undefined,
      notas: form.notas || undefined,
    }
    if (editingId) { updateJogador(editingId, data) } else { addJogador(data) }
    refresh()
    setDialogOpen(false)
  }

  function removeJogador(id: string, e: React.MouseEvent) {
    e.stopPropagation()
    deleteJogador(id)
    refresh()
  }

  function saveOcorrencia() {
    if (!discForm.jogadorId || !discForm.descricao.trim()) return
    addOcorrencia(discForm)
    refresh()
    setDiscDialogOpen(false)
    setDiscForm({ jogadorId: "", data: new Date().toISOString().split("T")[0], tipo: "comportamento", gravidade: "leve", descricao: "" })
  }

  function removeOcorrencia(id: string) {
    deleteOcorrencia(id)
    refresh()
  }

  const aptosCount = jogadores.filter(j => j.estado === "apto").length
  const condicionadosCount = jogadores.filter(j => j.estado === "condicionado").length
  const lesionadosCount = jogadores.filter(j => j.estado === "lesionado").length

  const jogadoresBySetor = SETORES.map(s => ({
    ...s,
    jogadores: jogadores.filter(j => getPrimarySetor(j.posicoes) === s.key),
  })).filter(s => s.jogadores.length > 0)

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: "var(--font-barlow-condensed)" }}>Squad Management</h1>
        <p className="text-muted-foreground">Full control of players, attendance and discipline</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total", value: jogadores.length, color: "text-foreground" },
            { label: "Fit", value: aptosCount, color: "text-[#00D66C]" },
          { label: "Limited", value: condicionadosCount, color: "text-[#FF6B35]" },
          { label: "Injured", value: lesionadosCount, color: "text-destructive" },
        ].map(s => (
          <Card key={s.label} className="glass-card border-border/50">
            <CardContent className="p-4">
              <div className={`text-3xl font-bold ${s.color}`} style={{ fontFamily: "var(--font-barlow-condensed)" }}>{s.value}</div>
              <div className="text-sm text-muted-foreground">{s.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="plantel">
        <TabsList className="mb-6">
          <TabsTrigger value="plantel">Squad</TabsTrigger>
          <TabsTrigger value="disciplina">Discipline</TabsTrigger>
        </TabsList>

        <TabsContent value="plantel">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-semibold text-lg">Jogadores ({jogadores.length})</h2>
            <Button onClick={openAdd} className="bg-[#00D66C] hover:bg-[#00D66C]/90 text-black gap-2">
              <Plus className="w-4 h-4" /> Add Player
            </Button>
          </div>

          {jogadores.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
              <User className="w-12 h-12 mb-3 opacity-30" />
              <p className="text-lg font-medium">No players added</p>
              <p className="text-sm">Click &quot;Add Player&quot; to get started</p>
            </div>
          ) : (
            <div className="space-y-8">
              {jogadoresBySetor.map(setor => (
                <div key={setor.key}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-0.5 w-4 rounded-full" style={{ background: setor.color }} />
                    <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: setor.color }}>{setor.label}</h3>
                    <span className="text-xs text-muted-foreground">({setor.jogadores.length})</span>
                    <div className="flex-1 h-px bg-border/40" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {setor.jogadores.map(j => (
                      <Card key={j.id} className="glass-card border-border/50 group hover:border-[#00D66C]/40 transition-colors cursor-pointer" onClick={() => setProfileJogador(j)}>
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3 mb-3">
                            {j.foto ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={j.foto} alt={j.nome} className="w-12 h-12 rounded-full object-cover shrink-0 border border-border" />
                            ) : (
                              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-xl font-bold shrink-0" style={{ fontFamily: "var(--font-barlow-condensed)" }}>
                                {j.numero}
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold truncate">{j.nome}</div>
                              <div className="text-xs text-muted-foreground flex gap-1 flex-wrap mt-0.5">
                                {j.posicoes.map((p, i) => (
                                  <span key={p} className={i === 0 ? "font-semibold text-foreground" : "opacity-60"}>{p}</span>
                                ))}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            {estadoBadge(j.estado)}
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button size="icon" variant="ghost" className="w-7 h-7 text-[#00D66C]" onClick={e => { e.stopPropagation(); setProfileJogador(j) }}>
                                <Eye className="w-3.5 h-3.5" />
                              </Button>
                              <Button size="icon" variant="ghost" className="w-7 h-7" onClick={e => { e.stopPropagation(); openEdit(j) }}>
                                <Pencil className="w-3.5 h-3.5" />
                              </Button>
                              <Button size="icon" variant="ghost" className="w-7 h-7 text-destructive hover:text-destructive" onClick={e => removeJogador(j.id, e)}>
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="disciplina">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-lg">Disciplinary Records ({ocorrencias.length})</h2>
            <Button onClick={() => { setDiscForm({ ...discForm, jogadorId: jogadores[0]?.id ?? "" }); setDiscDialogOpen(true) }}
              className="bg-[#FF6B35] hover:bg-[#FF6B35]/90 text-white gap-2" disabled={jogadores.length === 0}>
              <AlertTriangle className="w-4 h-4" /> Add Record
            </Button>
          </div>
          {ocorrencias.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
              <CheckCircle2 className="w-12 h-12 mb-3 opacity-30 text-[#00D66C]" />
              <p className="text-lg font-medium">No records</p>
              <p className="text-sm">Great behaviour!</p>
            </div>
          ) : (
            <div className="rounded-lg border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Player</TableHead><TableHead>Date</TableHead>
                    <TableHead>Type / Severity</TableHead><TableHead>Description</TableHead>
                    <TableHead className="w-10"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ocorrencias.sort((a, b) => b.data.localeCompare(a.data)).map(o => {
                    const jogador = jogadores.find(j => j.id === o.jogadorId)
                    return (
                      <TableRow key={o.id}>
                        <TableCell className="font-medium">{jogador?.nome ?? "—"}</TableCell>
                        <TableCell className="text-muted-foreground text-sm">{o.data}</TableCell>
                        <TableCell>{ocorrenciaBadge(o.tipo, o.gravidade)}</TableCell>
                        <TableCell className="text-sm text-muted-foreground max-w-xs truncate">{o.descricao}</TableCell>
                        <TableCell>
                          <Button size="icon" variant="ghost" className="w-7 h-7 text-destructive hover:text-destructive" onClick={() => removeOcorrencia(o.id)}>
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Dialog: Adicionar/Editar */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Player" : "Add Player"}</DialogTitle>
          </DialogHeader>
          <div className="grid md:grid-cols-2 gap-6 py-2">
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <Label>Name *</Label>
                  <Input placeholder="Full name" value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} className="mt-1" />
                </div>
                <div>
                  <Label>No.</Label>
                  <Input type="number" min={1} max={99} value={form.numero} onChange={e => setForm({ ...form, numero: parseInt(e.target.value) || 1 })} className="mt-1" />
                </div>
              </div>
              <div>
                <Label>Status</Label>
                <Select value={form.estado} onValueChange={v => setForm({ ...form, estado: v as EstadoJogador })}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="apto">Fit</SelectItem>
                    <SelectItem value="condicionado">Limited</SelectItem>
                    <SelectItem value="lesionado">Injured</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Date of Birth</Label>
                  <Input type="date" value={form.dataNascimento} onChange={e => setForm({ ...form, dataNascimento: e.target.value })} className="mt-1" />
                </div>
                <div>
                  <Label>Country</Label>
                  <Input placeholder="Portugal" value={form.nacionalidade} onChange={e => setForm({ ...form, nacionalidade: e.target.value })} className="mt-1" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label>Height (cm)</Label>
                  <Input type="number" placeholder="180" value={form.altura} onChange={e => setForm({ ...form, altura: e.target.value })} className="mt-1" />
                </div>
                <div>
                  <Label>Weight (kg)</Label>
                  <Input type="number" placeholder="75" value={form.peso} onChange={e => setForm({ ...form, peso: e.target.value })} className="mt-1" />
                </div>
                <div>
                  <Label>Foot</Label>
                  <Select value={form.pePreferido} onValueChange={v => setForm({ ...form, pePreferido: v as PePreferido })}>
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
                    <Button type="button" variant="ghost" size="sm" className="text-destructive" onClick={() => setForm({ ...form, foto: "" })}>
                      Remove
                    </Button>
                  )}
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                </div>
              </div>
              <div>
                <Label>Notes</Label>
                <Textarea placeholder="Notes about the player..." value={form.notas} onChange={e => setForm({ ...form, notas: e.target.value })} className="mt-1 h-20" />
              </div>
            </div>
            <div className="flex flex-col items-center">
              <Label className="mb-2 self-start">Field Positions *</Label>
              <PositionSelector selected={form.posicoes} onChange={posicoes => setForm({ ...form, posicoes })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={saveJogador} disabled={!form.nome.trim() || form.posicoes.length === 0} className="bg-[#00D66C] hover:bg-[#00D66C]/90 text-black">
              {editingId ? "Save" : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: Ocorrência Disciplinar */}
      <Dialog open={discDialogOpen} onOpenChange={setDiscDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Add Disciplinary Record</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-2">
            <div>
              <Label>Player *</Label>
              <Select value={discForm.jogadorId} onValueChange={v => setDiscForm({ ...discForm, jogadorId: v })}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Select player" /></SelectTrigger>
                <SelectContent>{jogadores.map(j => <SelectItem key={j.id} value={j.id}>{j.nome}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Date</Label>
                <Input type="date" value={discForm.data} onChange={e => setDiscForm({ ...discForm, data: e.target.value })} className="mt-1" />
              </div>
              <div>
                <Label>Severity</Label>
                <Select value={discForm.gravidade} onValueChange={v => setDiscForm({ ...discForm, gravidade: v as GravidadeOcorrencia })}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="leve">Minor</SelectItem>
                    <SelectItem value="moderada">Moderate</SelectItem>
                    <SelectItem value="grave">Serious</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Type</Label>
              <Select value={discForm.tipo} onValueChange={v => setDiscForm({ ...discForm, tipo: v as TipoOcorrencia })}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="amarelo_interno">Internal Yellow</SelectItem>
                  <SelectItem value="vermelho_interno">Internal Red</SelectItem>
                  <SelectItem value="comportamento">Behaviour</SelectItem>
                  <SelectItem value="disciplinar">Disciplinary</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Description *</Label>
              <Textarea placeholder="Describe the incident..." value={discForm.descricao} onChange={e => setDiscForm({ ...discForm, descricao: e.target.value })} className="mt-1 h-20" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDiscDialogOpen(false)}>Cancel</Button>
            <Button onClick={saveOcorrencia} className="bg-[#FF6B35] hover:bg-[#FF6B35]/90 text-white">Add</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {profileJogador && (
        <AthleteProfileModal
          jogador={profileJogador}
          open={!!profileJogador}
          onClose={() => setProfileJogador(null)}
          onEdit={j => { setProfileJogador(null); openEdit(j) }}
        />
      )}
    </div>
  )
}
