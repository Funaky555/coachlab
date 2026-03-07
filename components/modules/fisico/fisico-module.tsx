"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, Trash2, Activity, ChevronDown, ChevronRight } from "lucide-react"
import { getJogadores, type Jogador } from "@/lib/storage/plantel"
import {
  getRegistosFisicosByJogador, addRegistoFisico, deleteRegistoFisico,
  type RegistoFisico
} from "@/lib/storage/fisico"

interface JogadorComRegistos extends Jogador {
  registos: RegistoFisico[]
}

const emptyForm = {
  jogadorId: "",
  data: new Date().toISOString().split("T")[0],
  duracao: "", distancia: "", sprints: "", rpe: "", fcMax: "", peso: "", notas: "",
}

export function FisicoModule() {
  const [jogadores, setJogadores] = useState<Jogador[]>([])
  const [data, setData] = useState<JogadorComRegistos[]>([])
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())
  const [dialogOpen, setDialogOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)

  function refresh() {
    const jogs = getJogadores()
    setJogadores(jogs)
    setData(jogs.map(j => ({ ...j, registos: getRegistosFisicosByJogador(j.id) })))
  }

  useEffect(() => { refresh() }, [])

  function toggleExpand(id: string) {
    setExpandedIds(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function openAdd(jogadorId?: string) {
    setForm({ ...emptyForm, data: new Date().toISOString().split("T")[0], jogadorId: jogadorId ?? jogadores[0]?.id ?? "" })
    setDialogOpen(true)
  }

  function save() {
    if (!form.jogadorId || !form.data) return
    addRegistoFisico({
      jogadorId: form.jogadorId,
      data: form.data,
      duracao: form.duracao ? Number(form.duracao) : undefined,
      distancia: form.distancia ? Number(form.distancia) : undefined,
      sprints: form.sprints ? Number(form.sprints) : undefined,
      rpe: form.rpe ? Number(form.rpe) : undefined,
      fcMax: form.fcMax ? Number(form.fcMax) : undefined,
      peso: form.peso ? Number(form.peso) : undefined,
      notas: form.notas || undefined,
    })
    refresh()
    setDialogOpen(false)
  }

  function remove(id: string) {
    deleteRegistoFisico(id)
    refresh()
  }

  const totalRegistos = data.reduce((acc, j) => acc + j.registos.length, 0)
  const comRegistos = data.filter(j => j.registos.length > 0).length

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: "var(--font-barlow-condensed)" }}>Monitorização Física</h1>
        <p className="text-muted-foreground">Métricas GPS, carga de treino e dados de performance física</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {[
          { label: "Atletas", value: jogadores.length, color: "text-foreground" },
          { label: "Com registos", value: comRegistos, color: "text-[#0066FF]" },
          { label: "Total registos", value: totalRegistos, color: "text-[#8B5CF6]" },
        ].map(s => (
          <Card key={s.label} className="glass-card border-border/50">
            <CardContent className="p-4">
              <div className={`text-3xl font-bold ${s.color}`} style={{ fontFamily: "var(--font-barlow-condensed)" }}>{s.value}</div>
              <div className="text-sm text-muted-foreground">{s.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-between items-center mb-6">
        <h2 className="font-semibold text-lg">Registos por Atleta</h2>
        <Button onClick={() => openAdd()} disabled={jogadores.length === 0} className="gap-2" style={{ background: "#0066FF" }}>
          <Plus className="w-4 h-4" /> Adicionar Registo
        </Button>
      </div>

      {jogadores.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <Activity className="w-12 h-12 mb-3 opacity-30" />
          <p className="text-lg font-medium">Sem atletas no plantel</p>
          <p className="text-sm">Adiciona atletas no módulo Gestão do Plantel</p>
        </div>
      ) : (
        <div className="space-y-2">
          {data.map(j => (
            <div key={j.id} className="rounded-lg border border-border overflow-hidden">
              <button
                className="w-full flex items-center gap-3 p-4 text-left hover:bg-muted/30 transition-colors"
                onClick={() => toggleExpand(j.id)}
              >
                {j.foto ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={j.foto} alt={j.nome} className="w-9 h-9 rounded-full object-cover shrink-0 border border-border" />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-sm font-bold shrink-0" style={{ fontFamily: "var(--font-barlow-condensed)" }}>
                    {j.numero}
                  </div>
                )}
                <div className="flex-1">
                  <span className="font-medium">{j.nome}</span>
                  <span className="text-xs text-muted-foreground ml-2">{j.posicoes[0]}</span>
                </div>
                <Badge variant="outline" className="text-xs mr-2">
                  {j.registos.length} {j.registos.length === 1 ? "registo" : "registos"}
                </Badge>
                <Button
                  size="sm"
                  variant="outline"
                  className="mr-2 h-7 text-xs gap-1 border-[#0066FF]/40 text-[#0066FF] hover:bg-[#0066FF]/10"
                  onClick={e => { e.stopPropagation(); openAdd(j.id) }}
                >
                  <Plus className="w-3 h-3" /> Adicionar
                </Button>
                {expandedIds.has(j.id) ? <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" /> : <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />}
              </button>

              {expandedIds.has(j.id) && (
                <div className="border-t border-border">
                  {j.registos.length === 0 ? (
                    <div className="py-6 text-center text-sm text-muted-foreground">Sem registos para este atleta</div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Data</TableHead>
                          <TableHead>Duração</TableHead>
                          <TableHead>Distância</TableHead>
                          <TableHead>Sprints</TableHead>
                          <TableHead>RPE</TableHead>
                          <TableHead>FC Máx</TableHead>
                          <TableHead>Peso</TableHead>
                          <TableHead className="w-10"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {j.registos.sort((a, b) => b.data.localeCompare(a.data)).map(r => (
                          <TableRow key={r.id}>
                            <TableCell className="text-sm">{r.data}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">{r.duracao ? `${r.duracao} min` : "—"}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">{r.distancia ? `${r.distancia} km` : "—"}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">{r.sprints ?? "—"}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">{r.rpe ?? "—"}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">{r.fcMax ? `${r.fcMax} bpm` : "—"}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">{r.peso ? `${r.peso} kg` : "—"}</TableCell>
                            <TableCell>
                              <Button size="icon" variant="ghost" className="w-7 h-7 text-destructive hover:text-destructive" onClick={() => remove(r.id)}>
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Adicionar Registo Físico</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-2">
            <div>
              <Label>Atleta *</Label>
              <Select value={form.jogadorId} onValueChange={v => setForm({ ...form, jogadorId: v })}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Selecionar atleta" /></SelectTrigger>
                <SelectContent>{jogadores.map(j => <SelectItem key={j.id} value={j.id}>{j.nome}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Data *</Label>
              <Input type="date" value={form.data} onChange={e => setForm({ ...form, data: e.target.value })} className="mt-1" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Duração (min)</Label>
                <Input type="number" placeholder="90" value={form.duracao} onChange={e => setForm({ ...form, duracao: e.target.value })} className="mt-1" />
              </div>
              <div>
                <Label>Distância (km)</Label>
                <Input type="number" step="0.1" placeholder="10.5" value={form.distancia} onChange={e => setForm({ ...form, distancia: e.target.value })} className="mt-1" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label>Sprints</Label>
                <Input type="number" placeholder="15" value={form.sprints} onChange={e => setForm({ ...form, sprints: e.target.value })} className="mt-1" />
              </div>
              <div>
                <Label>RPE (1-10)</Label>
                <Input type="number" min={1} max={10} placeholder="7" value={form.rpe} onChange={e => setForm({ ...form, rpe: e.target.value })} className="mt-1" />
              </div>
              <div>
                <Label>FC Máx</Label>
                <Input type="number" placeholder="185" value={form.fcMax} onChange={e => setForm({ ...form, fcMax: e.target.value })} className="mt-1" />
              </div>
            </div>
            <div>
              <Label>Peso atual (kg)</Label>
              <Input type="number" step="0.1" placeholder="75.5" value={form.peso} onChange={e => setForm({ ...form, peso: e.target.value })} className="mt-1" />
            </div>
            <div>
              <Label>Notas</Label>
              <Textarea placeholder="Observações da sessão..." value={form.notas} onChange={e => setForm({ ...form, notas: e.target.value })} className="mt-1 h-16" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={save} disabled={!form.jogadorId || !form.data} style={{ background: "#0066FF" }}>Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
