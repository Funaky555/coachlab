"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, Trash2, Heart, ChevronDown, ChevronRight, Upload } from "lucide-react"
import { getJogadores, type Jogador } from "@/lib/storage/plantel"
import {
  getRegistosMedicosByJogador, addRegistoMedico, updateRegistoMedico, deleteRegistoMedico,
  type RegistoMedico, type TipoLesao, type EstadoLesao
} from "@/lib/storage/medico"
import { ImportDataDialog, type ImportField } from "@/components/ui/import-data-dialog"

const MEDICO_IMPORT_SCHEMA: ImportField[] = [
  { key: "nomeJogador",  label: "Nome do Jogador", required: true, type: "text" },
  { key: "dataInicio",   label: "Data Início",      required: true, type: "date" },
  { key: "tipo",         label: "Tipo Lesão",       required: true, type: "text" },
  { key: "localizacao",  label: "Localização",      required: true, type: "text" },
  { key: "descricao",    label: "Descrição",                        type: "text" },
  { key: "estado",       label: "Estado",                           type: "text" },
  { key: "dataRetorno",  label: "Data Retorno",                     type: "date" },
  { key: "tratamento",   label: "Tratamento",                       type: "text" },
]

interface JogadorComLesoes extends Jogador {
  lesoes: RegistoMedico[]
}

const emptyForm = {
  jogadorId: "",
  dataInicio: new Date().toISOString().split("T")[0],
  dataRetorno: "",
  tipo: "muscular" as TipoLesao,
  localizacao: "",
  descricao: "",
  tratamento: "",
  estado: "ativa" as EstadoLesao,
}

const tipoLesaoLabel: Record<TipoLesao, string> = {
  muscular: "Muscular", ossea: "Bone", ligamentar: "Ligament", articular: "Joint", outra: "Other",
}

const estadoLesaoConfig: Record<EstadoLesao, { label: string; color: string; badgeClass: string }> = {
  ativa: { label: "Active", color: "text-destructive", badgeClass: "bg-destructive/20 text-destructive border-destructive/30" },
  em_recuperacao: { label: "Recovering", color: "text-[#FF6B35]", badgeClass: "bg-[#FF6B35]/20 text-[#FF6B35] border-[#FF6B35]/30" },
  recuperado: { label: "Recovered", color: "text-[#00D66C]", badgeClass: "bg-[#00D66C]/20 text-[#00D66C] border-[#00D66C]/30" },
}

export function MedicoModule() {
  const [jogadores, setJogadores] = useState<Jogador[]>([])
  const [data, setData] = useState<JogadorComLesoes[]>([])
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())
  const [dialogOpen, setDialogOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState<string | null>(null)

  function refresh() {
    const jogs = getJogadores()
    setJogadores(jogs)
    setData(jogs.map(j => ({ ...j, lesoes: getRegistosMedicosByJogador(j.id) })))
  }

  useEffect(() => { refresh() }, [])

  function handleImportMedico(rows: Record<string, string>[]) {
    const tipoMap: Record<string, TipoLesao> = {
      muscular: "muscular", ossea: "ossea", óssea: "ossea",
      ligamentar: "ligamentar", articular: "articular", outra: "outra", other: "outra",
    }
    const estadoMap: Record<string, EstadoLesao> = {
      ativa: "ativa", active: "ativa",
      em_recuperacao: "em_recuperacao", recovering: "em_recuperacao",
      recuperado: "recuperado", recovered: "recuperado",
    }
    const allJogs = getJogadores()
    rows.forEach(row => {
      const nomeJog = (row.nomeJogador ?? "").toLowerCase().trim()
      const jog = allJogs.find(j => j.nome.toLowerCase().trim() === nomeJog)
      if (!jog) return
      addRegistoMedico({
        jogadorId: jog.id,
        dataInicio: row.dataInicio?.trim() ?? new Date().toISOString().split("T")[0],
        tipo: tipoMap[(row.tipo ?? "").toLowerCase().trim()] ?? "outra",
        localizacao: row.localizacao?.trim() ?? "",
        descricao: row.descricao?.trim() ?? "",
        estado: estadoMap[(row.estado ?? "").toLowerCase().trim()] ?? "ativa",
        dataRetorno: row.dataRetorno?.trim() || undefined,
        tratamento: row.tratamento?.trim() || undefined,
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
    setEditingId(null)
    setForm({ ...emptyForm, dataInicio: new Date().toISOString().split("T")[0], jogadorId: jogadorId ?? jogadores[0]?.id ?? "" })
    setDialogOpen(true)
  }

  function openEditLesao(r: RegistoMedico) {
    setEditingId(r.id)
    setForm({
      jogadorId: r.jogadorId,
      dataInicio: r.dataInicio,
      dataRetorno: r.dataRetorno ?? "",
      tipo: r.tipo,
      localizacao: r.localizacao,
      descricao: r.descricao,
      tratamento: r.tratamento ?? "",
      estado: r.estado,
    })
    setDialogOpen(true)
  }

  function save() {
    if (!form.jogadorId || !form.localizacao.trim() || !form.descricao.trim()) return
    const payload = {
      jogadorId: form.jogadorId,
      dataInicio: form.dataInicio,
      dataRetorno: form.dataRetorno || undefined,
      tipo: form.tipo,
      localizacao: form.localizacao,
      descricao: form.descricao,
      tratamento: form.tratamento || undefined,
      estado: form.estado,
    }
    if (editingId) {
      updateRegistoMedico(editingId, payload)
    } else {
      addRegistoMedico(payload)
    }
    refresh()
    setDialogOpen(false)
  }

  function remove(id: string) {
    deleteRegistoMedico(id)
    refresh()
  }

  const totalLesoes = data.reduce((acc, j) => acc + j.lesoes.length, 0)
  const ativas = data.reduce((acc, j) => acc + j.lesoes.filter(l => l.estado === "ativa").length, 0)
  const emRecuperacao = data.reduce((acc, j) => acc + j.lesoes.filter(l => l.estado === "em_recuperacao").length, 0)

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: "var(--font-barlow-condensed)" }}>Medical Department</h1>
        <p className="text-muted-foreground">Injury records, recovery and medical history of athletes</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Athletes", value: jogadores.length, color: "text-foreground" },
          { label: "Total injuries", value: totalLesoes, color: "text-muted-foreground" },
          { label: "Active injuries", value: ativas, color: "text-destructive" },
          { label: "Recovering", value: emRecuperacao, color: "text-[#FF6B35]" },
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
        <h2 className="font-semibold text-lg">History by Athlete</h2>
        <div className="flex items-center gap-2">
          <ImportDataDialog
            title="Import Medical Records"
            description="Import injuries by athlete name. The athlete must already exist in the squad."
            schema={MEDICO_IMPORT_SCHEMA}
            onImport={handleImportMedico}
            trigger={
              <Button variant="outline" className="gap-2 border-[#00D66C]/40 text-[#00D66C] hover:bg-[#00D66C]/10">
                <Upload className="w-4 h-4" /> Import
              </Button>
            }
          />
          <Button onClick={() => openAdd()} disabled={jogadores.length === 0} className="gap-2 bg-[#00D66C] hover:bg-[#00D66C]/90 text-black">
            <Plus className="w-4 h-4" /> Add Injury
          </Button>
        </div>
      </div>

      {jogadores.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <Heart className="w-12 h-12 mb-3 opacity-30" />
          <p className="text-lg font-medium">No athletes in squad</p>
          <p className="text-sm">Add athletes in the Squad Management module</p>
        </div>
      ) : (
        <div className="space-y-2">
          {data.map(j => {
            const lesaoAtiva = j.lesoes.find(l => l.estado === "ativa")
            const emRecup = j.lesoes.find(l => l.estado === "em_recuperacao")
            return (
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
                  <div className="flex items-center gap-2 mr-2">
                    {lesaoAtiva && <Badge className="text-xs bg-destructive/20 text-destructive border border-destructive/30 hover:bg-destructive/20">Injured</Badge>}
                    {!lesaoAtiva && emRecup && <Badge className="text-xs bg-[#FF6B35]/20 text-[#FF6B35] border border-[#FF6B35]/30 hover:bg-[#FF6B35]/20">Recovering</Badge>}
                    {!lesaoAtiva && !emRecup && j.lesoes.length > 0 && <Badge variant="outline" className="text-xs">No active injury</Badge>}
                    <Badge variant="outline" className="text-xs">{j.lesoes.length} {j.lesoes.length === 1 ? "record" : "records"}</Badge>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="mr-2 h-7 text-xs gap-1 border-[#00D66C]/40 text-[#00D66C] hover:bg-[#00D66C]/10"
                    onClick={e => { e.stopPropagation(); openAdd(j.id) }}
                  >
                    <Plus className="w-3 h-3" /> Add
                  </Button>
                  {expandedIds.has(j.id) ? <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" /> : <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />}
                </button>

                {expandedIds.has(j.id) && (
                  <div className="border-t border-border p-4">
                    {j.lesoes.length === 0 ? (
                      <div className="py-4 text-center text-sm text-muted-foreground">No medical records for this athlete</div>
                    ) : (
                      <div className="space-y-3">
                        {j.lesoes.sort((a, b) => b.dataInicio.localeCompare(a.dataInicio)).map(r => (
                          <div key={r.id} className="bg-muted/30 rounded-lg p-4 flex gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <span className="font-medium text-sm">{tipoLesaoLabel[r.tipo]} — {r.localizacao}</span>
                                <span className={`text-xs px-2 py-0.5 rounded-full border ${estadoLesaoConfig[r.estado].badgeClass}`}>{estadoLesaoConfig[r.estado].label}</span>
                              </div>
                              <div className="text-xs text-muted-foreground mb-1">{r.dataInicio}{r.dataRetorno ? ` → ${r.dataRetorno}` : ""}</div>
                              <p className="text-sm text-muted-foreground">{r.descricao}</p>
                              {r.tratamento && <p className="text-xs text-muted-foreground mt-1"><span className="font-medium">Treatment:</span> {r.tratamento}</p>}
                            </div>
                            <div className="flex flex-col gap-1 shrink-0">
                              <Button size="icon" variant="ghost" className="w-7 h-7" onClick={() => openEditLesao(r)}>
                                <span className="text-xs">✏️</span>
                              </Button>
                              <Button size="icon" variant="ghost" className="w-7 h-7 text-destructive hover:text-destructive" onClick={() => remove(r.id)}>
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editingId ? "Edit Injury" : "Add Injury"}</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-2">
            <div>
              <Label>Athlete *</Label>
              <Select value={form.jogadorId} onValueChange={v => setForm({ ...form, jogadorId: v })} disabled={!!editingId}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Select athlete" /></SelectTrigger>
                <SelectContent>{jogadores.map(j => <SelectItem key={j.id} value={j.id}>{j.nome}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Injury type</Label>
                <Select value={form.tipo} onValueChange={v => setForm({ ...form, tipo: v as TipoLesao })}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(tipoLesaoLabel).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Status</Label>
                <Select value={form.estado} onValueChange={v => setForm({ ...form, estado: v as EstadoLesao })}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(estadoLesaoConfig).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Location *</Label>
              <Input placeholder="e.g.: Right hamstring" value={form.localizacao} onChange={e => setForm({ ...form, localizacao: e.target.value })} className="mt-1" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Start date</Label>
                <Input type="date" value={form.dataInicio} onChange={e => setForm({ ...form, dataInicio: e.target.value })} className="mt-1" />
              </div>
              <div>
                <Label>Return date</Label>
                <Input type="date" value={form.dataRetorno} onChange={e => setForm({ ...form, dataRetorno: e.target.value })} className="mt-1" />
              </div>
            </div>
            <div>
              <Label>Description *</Label>
              <Textarea placeholder="Describe the injury..." value={form.descricao} onChange={e => setForm({ ...form, descricao: e.target.value })} className="mt-1 h-16" />
            </div>
            <div>
              <Label>Treatment</Label>
              <Textarea placeholder="Treatment protocol..." value={form.tratamento} onChange={e => setForm({ ...form, tratamento: e.target.value })} className="mt-1 h-16" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={save} disabled={!form.jogadorId || !form.localizacao.trim() || !form.descricao.trim()} className="bg-[#00D66C] hover:bg-[#00D66C]/90 text-black">
              {editingId ? "Save" : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
