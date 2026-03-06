"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Pencil, Trash2, User, AlertTriangle, CheckCircle2 } from "lucide-react"
import {
  type Jogador, type EstadoJogador, type PosicaoJogador,
  type OcorrenciaDisciplinar, type TipoOcorrencia, type GravidadeOcorrencia,
  getJogadores, addJogador, updateJogador, deleteJogador,
  getOcorrencias, addOcorrencia, deleteOcorrencia,
  getPresencas, addPresenca
} from "@/lib/storage/plantel"

const POSICOES: PosicaoJogador[] = ["GR","DD","DC","DE","MDC","MC","MD","MDE","MEE","AV","PL"]
const ESTADOS: EstadoJogador[] = ["apto","condicionado","lesionado"]

function estadoBadge(estado: EstadoJogador) {
  const map = {
    apto: { variant: "success" as const, label: "Apto" },
    condicionado: { variant: "warning" as const, label: "Condicionado" },
    lesionado: { variant: "destructive" as const, label: "Lesionado" },
  }
  const { variant, label } = map[estado]
  return <Badge variant={variant}>{label}</Badge>
}

function ocorrenciaBadge(tipo: TipoOcorrencia, gravidade: GravidadeOcorrencia) {
  const labels: Record<TipoOcorrencia, string> = {
    amarelo_interno: "Amarelo Int.",
    vermelho_interno: "Vermelho Int.",
    comportamento: "Comportamento",
    disciplinar: "Disciplinar",
  }
  const grav: Record<GravidadeOcorrencia, "warning" | "destructive" | "info"> = {
    leve: "info",
    moderada: "warning",
    grave: "destructive",
  }
  return (
    <div className="flex gap-1">
      <Badge variant={grav[gravidade]}>{labels[tipo]}</Badge>
      <Badge variant="outline" className="text-xs capitalize">{gravidade}</Badge>
    </div>
  )
}

const emptyJogador = {
  nome: "", numero: 1, posicao: "DC" as PosicaoJogador,
  estado: "apto" as EstadoJogador, foto: "", dataNascimento: "", notas: ""
}

export function PlantelModule() {
  const [jogadores, setJogadores] = useState<Jogador[]>([])
  const [ocorrencias, setOcorrencias] = useState<OcorrenciaDisciplinar[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyJogador)
  const [discDialogOpen, setDiscDialogOpen] = useState(false)
  const [discForm, setDiscForm] = useState({
    jogadorId: "", data: new Date().toISOString().split("T")[0],
    tipo: "comportamento" as TipoOcorrencia, gravidade: "leve" as GravidadeOcorrencia, descricao: ""
  })

  useEffect(() => {
    setJogadores(getJogadores())
    setOcorrencias(getOcorrencias())
  }, [])

  function openAdd() {
    setEditingId(null)
    setForm(emptyJogador)
    setDialogOpen(true)
  }

  function openEdit(j: Jogador) {
    setEditingId(j.id)
    setForm({ nome: j.nome, numero: j.numero, posicao: j.posicao, estado: j.estado, foto: j.foto ?? "", dataNascimento: j.dataNascimento ?? "", notas: j.notas ?? "" })
    setDialogOpen(true)
  }

  function saveJogador() {
    if (!form.nome.trim()) return
    if (editingId) {
      updateJogador(editingId, form)
    } else {
      addJogador(form)
    }
    setJogadores(getJogadores())
    setDialogOpen(false)
  }

  function removeJogador(id: string) {
    deleteJogador(id)
    setJogadores(getJogadores())
  }

  function saveOcorrencia() {
    if (!discForm.jogadorId || !discForm.descricao.trim()) return
    addOcorrencia(discForm)
    setOcorrencias(getOcorrencias())
    setDiscDialogOpen(false)
    setDiscForm({ jogadorId: "", data: new Date().toISOString().split("T")[0], tipo: "comportamento", gravidade: "leve", descricao: "" })
  }

  function removeOcorrencia(id: string) {
    deleteOcorrencia(id)
    setOcorrencias(getOcorrencias())
  }

  const aptosCount = jogadores.filter(j => j.estado === "apto").length
  const condicionadosCount = jogadores.filter(j => j.estado === "condicionado").length
  const lesionadosCount = jogadores.filter(j => j.estado === "lesionado").length

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: "var(--font-barlow-condensed)" }}>
          Gestão do Plantel
        </h1>
        <p className="text-muted-foreground">Controlo completo dos jogadores, presenças e disciplina</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total", value: jogadores.length, color: "text-foreground" },
          { label: "Aptos", value: aptosCount, color: "text-[#00D66C]" },
          { label: "Condicionados", value: condicionadosCount, color: "text-[#FF6B35]" },
          { label: "Lesionados", value: lesionadosCount, color: "text-destructive" },
        ].map(s => (
          <Card key={s.label} className="glass-card border-border/50">
            <CardContent className="p-4">
              <div className={`text-3xl font-bold ${s.color}`} style={{ fontFamily: "var(--font-barlow-condensed)" }}>
                {s.value}
              </div>
              <div className="text-sm text-muted-foreground">{s.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="plantel">
        <TabsList className="mb-6">
          <TabsTrigger value="plantel">Plantel</TabsTrigger>
          <TabsTrigger value="disciplina">Disciplina</TabsTrigger>
        </TabsList>

        {/* TAB: PLANTEL */}
        <TabsContent value="plantel">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-lg">Jogadores ({jogadores.length})</h2>
            <Button onClick={openAdd} className="bg-[#00D66C] hover:bg-[#00D66C]/90 text-black gap-2">
              <Plus className="w-4 h-4" />
              Adicionar Jogador
            </Button>
          </div>

          {jogadores.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
              <User className="w-12 h-12 mb-3 opacity-30" />
              <p className="text-lg font-medium">Nenhum jogador adicionado</p>
              <p className="text-sm">Clica em "Adicionar Jogador" para começar</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {jogadores.map(j => (
                <Card key={j.id} className="glass-card border-border/50 group hover:border-[#00D66C]/30 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3 mb-3">
                      {j.foto ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={j.foto} alt={j.nome} className="w-12 h-12 rounded-full object-cover shrink-0" />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-xl font-bold shrink-0"
                          style={{ fontFamily: "var(--font-barlow-condensed)" }}>
                          {j.numero}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold truncate">{j.nome}</div>
                        <div className="text-sm text-muted-foreground">{j.posicao}</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      {estadoBadge(j.estado)}
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button size="icon" variant="ghost" className="w-7 h-7" onClick={() => openEdit(j)}>
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button size="icon" variant="ghost" className="w-7 h-7 text-destructive hover:text-destructive" onClick={() => removeJogador(j.id)}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* TAB: DISCIPLINA */}
        <TabsContent value="disciplina">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-lg">Ocorrências Disciplinares ({ocorrencias.length})</h2>
            <Button
              onClick={() => { setDiscForm({ ...discForm, jogadorId: jogadores[0]?.id ?? "" }); setDiscDialogOpen(true) }}
              className="bg-[#FF6B35] hover:bg-[#FF6B35]/90 text-white gap-2"
              disabled={jogadores.length === 0}
            >
              <AlertTriangle className="w-4 h-4" />
              Registar Ocorrência
            </Button>
          </div>

          {ocorrencias.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
              <CheckCircle2 className="w-12 h-12 mb-3 opacity-30 text-[#00D66C]" />
              <p className="text-lg font-medium">Sem ocorrências registadas</p>
              <p className="text-sm">Excelente comportamento!</p>
            </div>
          ) : (
            <div className="rounded-lg border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Jogador</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Tipo / Gravidade</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead className="w-10"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ocorrencias.sort((a,b) => b.data.localeCompare(a.data)).map(o => {
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

      {/* Dialog: Adicionar/Editar Jogador */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingId ? "Editar Jogador" : "Adicionar Jogador"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <Label>Nome *</Label>
                <Input placeholder="Nome completo" value={form.nome} onChange={e => setForm({...form, nome: e.target.value})} className="mt-1" />
              </div>
              <div>
                <Label>Nº</Label>
                <Input type="number" min={1} max={99} value={form.numero} onChange={e => setForm({...form, numero: parseInt(e.target.value)})} className="mt-1" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Posição</Label>
                <Select value={form.posicao} onValueChange={v => setForm({...form, posicao: v as PosicaoJogador})}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>{POSICOES.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Estado</Label>
                <Select value={form.estado} onValueChange={v => setForm({...form, estado: v as EstadoJogador})}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="apto">Apto</SelectItem>
                    <SelectItem value="condicionado">Condicionado</SelectItem>
                    <SelectItem value="lesionado">Lesionado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Data de Nascimento</Label>
              <Input type="date" value={form.dataNascimento} onChange={e => setForm({...form, dataNascimento: e.target.value})} className="mt-1" />
            </div>
            <div>
              <Label>URL da Foto (opcional)</Label>
              <Input placeholder="https://..." value={form.foto} onChange={e => setForm({...form, foto: e.target.value})} className="mt-1" />
            </div>
            <div>
              <Label>Notas</Label>
              <Textarea placeholder="Notas sobre o jogador..." value={form.notas} onChange={e => setForm({...form, notas: e.target.value})} className="mt-1 h-20" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={saveJogador} className="bg-[#00D66C] hover:bg-[#00D66C]/90 text-black">
              {editingId ? "Guardar" : "Adicionar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: Ocorrência Disciplinar */}
      <Dialog open={discDialogOpen} onOpenChange={setDiscDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Registar Ocorrência Disciplinar</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div>
              <Label>Jogador *</Label>
              <Select value={discForm.jogadorId} onValueChange={v => setDiscForm({...discForm, jogadorId: v})}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Selecionar jogador" /></SelectTrigger>
                <SelectContent>{jogadores.map(j => <SelectItem key={j.id} value={j.id}>{j.nome}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Data</Label>
                <Input type="date" value={discForm.data} onChange={e => setDiscForm({...discForm, data: e.target.value})} className="mt-1" />
              </div>
              <div>
                <Label>Gravidade</Label>
                <Select value={discForm.gravidade} onValueChange={v => setDiscForm({...discForm, gravidade: v as GravidadeOcorrencia})}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="leve">Leve</SelectItem>
                    <SelectItem value="moderada">Moderada</SelectItem>
                    <SelectItem value="grave">Grave</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Tipo</Label>
              <Select value={discForm.tipo} onValueChange={v => setDiscForm({...discForm, tipo: v as TipoOcorrencia})}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="amarelo_interno">Amarelo Interno</SelectItem>
                  <SelectItem value="vermelho_interno">Vermelho Interno</SelectItem>
                  <SelectItem value="comportamento">Comportamento</SelectItem>
                  <SelectItem value="disciplinar">Disciplinar</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Descrição *</Label>
              <Textarea placeholder="Descreve a ocorrência..." value={discForm.descricao} onChange={e => setDiscForm({...discForm, descricao: e.target.value})} className="mt-1 h-20" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDiscDialogOpen(false)}>Cancelar</Button>
            <Button onClick={saveOcorrencia} className="bg-[#FF6B35] hover:bg-[#FF6B35]/90 text-white">
              Registar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
