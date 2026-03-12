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
import { Plus, Trash2, Activity, ChevronDown, ChevronRight, Upload } from "lucide-react"
import { getJogadores, type Jogador } from "@/lib/storage/plantel"
import {
  getRegistosFisicosByJogador, addRegistoFisico, deleteRegistoFisico,
  type RegistoFisico
} from "@/lib/storage/fisico"
import { ImportDataDialog, type ImportField } from "@/components/ui/import-data-dialog"

const FISICO_IMPORT_SCHEMA: ImportField[] = [
  { key: "nomeJogador", label: "Nome do Jogador", required: true,  type: "text" },
  { key: "data",        label: "Data",            required: true,  type: "date" },
  { key: "duracao",     label: "Duração (min)",                     type: "number" },
  { key: "distancia",   label: "Distância (km)",                    type: "number" },
  { key: "sprints",     label: "Sprints",                           type: "number" },
  { key: "rpe",         label: "RPE (1-10)",                        type: "number" },
  { key: "fcMax",       label: "FC Máx (bpm)",                      type: "number" },
  { key: "peso",        label: "Peso (kg)",                         type: "number" },
  { key: "notas",       label: "Notas",                             type: "text" },
]

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

  function handleImportFisico(rows: Record<string, string>[]) {
    const allJogs = getJogadores()
    rows.forEach(row => {
      const nomeJog = (row.nomeJogador ?? "").toLowerCase().trim()
      const jog = allJogs.find(j => j.nome.toLowerCase().trim() === nomeJog)
      if (!jog) return
      addRegistoFisico({
        jogadorId: jog.id,
        data: row.data?.trim() ?? new Date().toISOString().split("T")[0],
        duracao: row.duracao ? parseFloat(row.duracao) || undefined : undefined,
        distancia: row.distancia ? parseFloat(row.distancia) || undefined : undefined,
        sprints: row.sprints ? parseInt(row.sprints) || undefined : undefined,
        rpe: row.rpe ? parseFloat(row.rpe) || undefined : undefined,
        fcMax: row.fcMax ? parseInt(row.fcMax) || undefined : undefined,
        peso: row.peso ? parseFloat(row.peso) || undefined : undefined,
        notas: row.notas?.trim() || undefined,
      })
    })
    refresh()
  }

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
        <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: "var(--font-barlow-condensed)" }}>Physical Monitoring</h1>
        <p className="text-muted-foreground">GPS metrics, training load and physical performance data</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {[
          { label: "Athletes", value: jogadores.length, color: "text-foreground" },
          { label: "With records", value: comRegistos, color: "text-[#0066FF]" },
          { label: "Total records", value: totalRegistos, color: "text-[#8B5CF6]" },
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
        <h2 className="font-semibold text-lg">Records by Athlete</h2>
        <div className="flex items-center gap-2">
          <ImportDataDialog
            title="Importar Dados Físicos"
            description="Importa registos físicos por nome do atleta. O atleta já deve existir no plantel."
            schema={FISICO_IMPORT_SCHEMA}
            onImport={handleImportFisico}
            trigger={
              <Button variant="outline" className="gap-2 border-[#0066FF]/40 text-[#0066FF] hover:bg-[#0066FF]/10">
                <Upload className="w-4 h-4" /> Import
              </Button>
            }
          />
          <Button onClick={() => openAdd()} disabled={jogadores.length === 0} className="gap-2" style={{ background: "#0066FF" }}>
            <Plus className="w-4 h-4" /> Add Record
          </Button>
        </div>
      </div>

      {jogadores.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <Activity className="w-12 h-12 mb-3 opacity-30" />
          <p className="text-lg font-medium">No athletes in squad</p>
          <p className="text-sm">Add athletes in the Squad Management module</p>
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
                  {j.registos.length} {j.registos.length === 1 ? "record" : "records"}
                </Badge>
                <Button
                  size="sm"
                  variant="outline"
                  className="mr-2 h-7 text-xs gap-1 border-[#0066FF]/40 text-[#0066FF] hover:bg-[#0066FF]/10"
                  onClick={e => { e.stopPropagation(); openAdd(j.id) }}
                >
                  <Plus className="w-3 h-3" /> Add
                </Button>
                {expandedIds.has(j.id) ? <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" /> : <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />}
              </button>

              {expandedIds.has(j.id) && (
                <div className="border-t border-border">
                  {j.registos.length === 0 ? (
                    <div className="py-6 text-center text-sm text-muted-foreground">No records for this athlete</div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Duration</TableHead>
                          <TableHead>Distance</TableHead>
                          <TableHead>Sprints</TableHead>
                          <TableHead>RPE</TableHead>
                          <TableHead>Max HR</TableHead>
                          <TableHead>Weight</TableHead>
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
          <DialogHeader><DialogTitle>Add Physical Record</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-2">
            <div>
              <Label>Athlete *</Label>
              <Select value={form.jogadorId} onValueChange={v => setForm({ ...form, jogadorId: v })}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Select athlete" /></SelectTrigger>
                <SelectContent>{jogadores.map(j => <SelectItem key={j.id} value={j.id}>{j.nome}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Date *</Label>
              <Input type="date" value={form.data} onChange={e => setForm({ ...form, data: e.target.value })} className="mt-1" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Duration (min)</Label>
                <Input type="number" placeholder="90" value={form.duracao} onChange={e => setForm({ ...form, duracao: e.target.value })} className="mt-1" />
              </div>
              <div>
                <Label>Distance (km)</Label>
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
                <Label>Max HR</Label>
                <Input type="number" placeholder="185" value={form.fcMax} onChange={e => setForm({ ...form, fcMax: e.target.value })} className="mt-1" />
              </div>
            </div>
            <div>
              <Label>Current weight (kg)</Label>
              <Input type="number" step="0.1" placeholder="75.5" value={form.peso} onChange={e => setForm({ ...form, peso: e.target.value })} className="mt-1" />
            </div>
            <div>
              <Label>Notes</Label>
              <Textarea placeholder="Session notes..." value={form.notas} onChange={e => setForm({ ...form, notas: e.target.value })} className="mt-1 h-16" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={save} disabled={!form.jogadorId || !form.data} style={{ background: "#0066FF" }}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
