"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, BarChart3, Trophy, ShieldOff, Minus, ExternalLink, Trash2 } from "lucide-react"
import {
  type RelatorioJogo, type ResultadoJogo, type EstatisticasJogo,
  getRelatorios, addRelatorio, deleteRelatorio, getEstatisticasGlobais
} from "@/lib/storage/analise"

const emptyStats: EstatisticasJogo = {
  posseBola: 50, rematesTotal: 0, rematesGolo: 0, rematesFora: 0, rematesBloqueados: 0,
  xGProprio: 0, xGAdversario: 0, recuperacoes: 0, perdasBola: 0,
  passesTotal: 0, passesCompletos: 0, faltas: 0, cartaoAmarelo: 0, cartaoVermelho: 0
}

type LocalJogo = "casa" | "fora" | "neutro"

const emptyForm: {
  data: string; adversario: string; local: LocalJogo; competicao: string;
  resultado: ResultadoJogo; golosMarcados: number; golosSofridos: number;
  stats: EstatisticasJogo; zonasAcao: never[]; analiseNarrativa: string; clipLinks: string[]; conclusoes: string;
} = {
  data: new Date().toISOString().split("T")[0],
  adversario: "", local: "casa", competicao: "",
  resultado: "vitoria", golosMarcados: 0, golosSofridos: 0,
  stats: emptyStats, zonasAcao: [],
  analiseNarrativa: "", clipLinks: [""], conclusoes: ""
}

function resultadoBadge(r: ResultadoJogo) {
  const map = {
    vitoria: { variant: "success" as const, label: "Win",  icon: Trophy },
    empate: { variant: "info" as const, label: "Draw",  icon: Minus },
    derrota: { variant: "destructive" as const, label: "Loss", icon: ShieldOff },
  }
  const { variant, label } = map[r]
  return <Badge variant={variant}>{label}</Badge>
}

export function AnaliseModule() {
  const [relatorios, setRelatorios] = useState<RelatorioJogo[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)

  useEffect(() => {
    setRelatorios(getRelatorios())
  }, [])

  const stats = getEstatisticasGlobais()
  const selected = selectedId ? relatorios.find(r => r.id === selectedId) : null

  function saveRelatorio() {
    if (!form.adversario.trim()) return
    addRelatorio({ ...form, clipLinks: form.clipLinks.filter(l => l.trim()) })
    setRelatorios(getRelatorios())
    setDialogOpen(false)
    setForm(emptyForm)
  }

  function removeRelatorio(id: string) {
    deleteRelatorio(id)
    setRelatorios(getRelatorios())
    if (selectedId === id) setSelectedId(null)
  }

  function updateStat(key: keyof EstatisticasJogo, value: number) {
    setForm(f => ({ ...f, stats: { ...f.stats, [key]: value } }))
  }

  const sortedRelatorios = [...relatorios].sort((a, b) => b.data.localeCompare(a.data))

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: "var(--font-barlow-condensed)" }}>
          Match Analysis
        </h1>
        <p className="text-muted-foreground">Post-match reports, statistics and tactical analysis</p>
      </div>

      {/* Stats globais */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Matches", value: stats.totalJogos, color: "text-foreground" },
            { label: "Wins", value: stats.vitorias, color: "text-[#00D66C]" },
            { label: "Draws", value: stats.empates, color: "text-[#0066FF]" },
            { label: "Losses", value: stats.derrotas, color: "text-destructive" },
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
      )}

      <div className="grid md:grid-cols-3 gap-6">
        {/* Lista de relatórios */}
        <div className="md:col-span-1">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Reports ({relatorios.length})</h2>
            <Button onClick={() => { setForm(emptyForm); setDialogOpen(true) }} size="sm" className="bg-[#8B5CF6] hover:bg-[#8B5CF6]/90 text-white gap-1">
              <Plus className="w-3.5 h-3.5" />
              New
            </Button>
          </div>

          {sortedRelatorios.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <BarChart3 className="w-10 h-10 mb-2 opacity-30" />
              <p className="text-sm">No reports yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {sortedRelatorios.map(r => (
                <div
                  key={r.id}
                  onClick={() => setSelectedId(r.id)}
                  className={`cursor-pointer rounded-lg border p-3 transition-all ${
                    selectedId === r.id
                      ? "border-[#8B5CF6]/50 bg-[#8B5CF6]/5"
                      : "border-border hover:border-border/80 bg-card/40"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="font-semibold text-sm truncate">{r.adversario}</div>
                    {resultadoBadge(r.resultado)}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{r.data} · {r.competicao || "—"}</span>
                    <span className="text-sm font-bold" style={{ fontFamily: "var(--font-barlow-condensed)" }}>
                      {r.golosMarcados}–{r.golosSofridos}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Detalhe do relatório */}
        <div className="md:col-span-2">
          {!selected ? (
            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground rounded-xl border border-dashed border-border">
              <BarChart3 className="w-12 h-12 mb-3 opacity-20" />
              <p>Select a report to view details</p>
            </div>
          ) : (
            <Card className="glass-card border-border/50">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl">{selected.adversario}</CardTitle>
                    <p className="text-sm text-muted-foreground">{selected.data} · {selected.local === "casa" ? "Home" : selected.local === "fora" ? "Away" : "Neutral"} · {selected.competicao}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-3xl font-bold" style={{ fontFamily: "var(--font-barlow-condensed)" }}>
                      {selected.golosMarcados}–{selected.golosSofridos}
                    </span>
                    {resultadoBadge(selected.resultado)}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="stats">
                  <TabsList className="mb-4">
                    <TabsTrigger value="stats">Statistics</TabsTrigger>
                    <TabsTrigger value="analise">Analysis</TabsTrigger>
                    <TabsTrigger value="clips">Clips</TabsTrigger>
                  </TabsList>
                  <TabsContent value="stats">
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { label: "Ball Possession", value: `${selected.stats.posseBola}%` },
                        { label: "Shots (Total)", value: selected.stats.rematesTotal },
                        { label: "Shots on Target", value: selected.stats.rematesGolo },
                        { label: "Own xG", value: selected.stats.xGProprio.toFixed(2) },
                        { label: "Opponent xG", value: selected.stats.xGAdversario.toFixed(2) },
                        { label: "Recoveries", value: selected.stats.recuperacoes },
                        { label: "Ball Losses", value: selected.stats.perdasBola },
                        { label: "Pass Accuracy", value: selected.stats.passesTotal ? `${Math.round((selected.stats.passesCompletos/selected.stats.passesTotal)*100)}%` : "—" },
                      ].map(stat => (
                        <div key={stat.label} className="bg-muted/30 rounded-lg p-3">
                          <div className="text-xs text-muted-foreground mb-1">{stat.label}</div>
                          <div className="text-xl font-bold" style={{ fontFamily: "var(--font-barlow-condensed)" }}>{stat.value}</div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                  <TabsContent value="analise">
                    <div className="space-y-4">
                      {selected.analiseNarrativa && (
                        <div>
                          <h4 className="text-sm font-semibold mb-2">Narrative Analysis</h4>
                          <p className="text-sm text-muted-foreground whitespace-pre-wrap">{selected.analiseNarrativa}</p>
                        </div>
                      )}
                      {selected.conclusoes && (
                        <div>
                          <h4 className="text-sm font-semibold mb-2">Conclusions</h4>
                          <p className="text-sm text-muted-foreground whitespace-pre-wrap">{selected.conclusoes}</p>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                  <TabsContent value="clips">
                    {selected.clipLinks.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No clips added.</p>
                    ) : (
                      <div className="space-y-2">
                        {selected.clipLinks.map((link, i) => (
                          <a key={i} href={link} target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-2 p-3 rounded-lg border border-border hover:border-[#8B5CF6]/50 transition-colors text-sm">
                            <ExternalLink className="w-4 h-4 text-[#8B5CF6]" />
                            <span className="truncate text-[#8B5CF6]">{link}</span>
                          </a>
                        ))}
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
                <div className="flex justify-end mt-4">
                  <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive gap-1" onClick={() => removeRelatorio(selected.id)}>
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Dialog: Novo Relatório */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>New Post-Match Report</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            {/* Info base */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Opponent *</Label>
                <Input placeholder="Opponent team name" value={form.adversario} onChange={e => setForm({...form, adversario: e.target.value})} className="mt-1" />
              </div>
              <div>
                <Label>Date</Label>
                <Input type="date" value={form.data} onChange={e => setForm({...form, data: e.target.value})} className="mt-1" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label>Venue</Label>
                <Select value={form.local} onValueChange={v => setForm({...form, local: v as "casa"|"fora"|"neutro"})}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="casa">Home</SelectItem>
                    <SelectItem value="fora">Away</SelectItem>
                    <SelectItem value="neutro">Neutral</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Result</Label>
                <Select value={form.resultado} onValueChange={v => setForm({...form, resultado: v as ResultadoJogo})}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vitoria">Win</SelectItem>
                    <SelectItem value="empate">Draw</SelectItem>
                    <SelectItem value="derrota">Loss</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Competition</Label>
                <Input placeholder="League, Cup..." value={form.competicao} onChange={e => setForm({...form, competicao: e.target.value})} className="mt-1" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Goals Scored</Label>
                <Input type="number" min={0} value={form.golosMarcados} onChange={e => setForm({...form, golosMarcados: parseInt(e.target.value)})} className="mt-1" />
              </div>
              <div>
                <Label>Goals Conceded</Label>
                <Input type="number" min={0} value={form.golosSofridos} onChange={e => setForm({...form, golosSofridos: parseInt(e.target.value)})} className="mt-1" />
              </div>
            </div>

            {/* Stats */}
            <div className="border-t border-border pt-4">
              <h4 className="text-sm font-semibold mb-3">Statistics</h4>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { key: "posseBola" as const, label: "Possession (%)", min: 0, max: 100 },
                  { key: "rematesTotal" as const, label: "Total Shots", min: 0, max: 50 },
                  { key: "rematesGolo" as const, label: "On Target", min: 0, max: 30 },
                  { key: "recuperacoes" as const, label: "Recoveries", min: 0, max: 100 },
                  { key: "perdasBola" as const, label: "Ball Losses", min: 0, max: 100 },
                  { key: "passesTotal" as const, label: "Total Passes", min: 0, max: 1000 },
                ].map(f => (
                  <div key={f.key}>
                    <Label className="text-xs">{f.label}</Label>
                    <Input type="number" min={f.min} max={f.max} value={form.stats[f.key]} onChange={e => updateStat(f.key, parseFloat(e.target.value) || 0)} className="mt-1 h-8 text-sm" />
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-3 mt-3">
                <div>
                  <Label className="text-xs">Own xG</Label>
                  <Input type="number" min={0} max={10} step={0.01} value={form.stats.xGProprio} onChange={e => updateStat("xGProprio", parseFloat(e.target.value) || 0)} className="mt-1 h-8 text-sm" />
                </div>
                <div>
                  <Label className="text-xs">Opponent xG</Label>
                  <Input type="number" min={0} max={10} step={0.01} value={form.stats.xGAdversario} onChange={e => updateStat("xGAdversario", parseFloat(e.target.value) || 0)} className="mt-1 h-8 text-sm" />
                </div>
              </div>
            </div>

            {/* Análise */}
            <div className="border-t border-border pt-4">
              <h4 className="text-sm font-semibold mb-3">Analysis</h4>
              <div>
                <Label>Narrative Analysis</Label>
                <Textarea placeholder="Describe the match, phases, decisive moments..." value={form.analiseNarrativa} onChange={e => setForm({...form, analiseNarrativa: e.target.value})} className="mt-1 h-24" />
              </div>
              <div className="mt-3">
                <Label>Conclusions and Areas to Work On</Label>
                <Textarea placeholder="Positives, negatives, focus for upcoming training..." value={form.conclusoes} onChange={e => setForm({...form, conclusoes: e.target.value})} className="mt-1 h-20" />
              </div>
            </div>

            {/* Clips */}
            <div className="border-t border-border pt-4">
              <h4 className="text-sm font-semibold mb-3">Clip Links (YouTube/Vimeo)</h4>
              {form.clipLinks.map((link, i) => (
                <div key={i} className="flex gap-2 mb-2">
                  <Input placeholder="https://..." value={link} onChange={e => {
                    const newLinks = [...form.clipLinks]
                    newLinks[i] = e.target.value
                    setForm({...form, clipLinks: newLinks})
                  }} />
                  {i === form.clipLinks.length - 1 && (
                    <Button variant="outline" size="icon" onClick={() => setForm({...form, clipLinks: [...form.clipLinks, ""]})}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={saveRelatorio} className="bg-[#8B5CF6] hover:bg-[#8B5CF6]/90 text-white">
              Save Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
