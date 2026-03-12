"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Pencil, AlertTriangle, Settings2 } from "lucide-react"
import {
  type Jogador, type EstatisticasCompeticao, type ConfigPlantel,
  getJogadores, getEstatisticasJogador, updateEstatisticasJogador,
  getConfigPlantel, saveConfigPlantel, getPrimarySetor,
} from "@/lib/storage/plantel"

const SETORES = [
  { key: "GR" as const, label: "Goalkeepers", color: "#FFD700" },
  { key: "DEF" as const, label: "Defenders", color: "#0066FF" },
  { key: "MED" as const, label: "Midfielders", color: "#8B5CF6" },
  { key: "AV" as const, label: "Forwards", color: "#00D66C" },
]

const emptyStats = (jogadorId: string, epoca: string): EstatisticasCompeticao => ({
  jogadorId, epoca, jogos: 0, minutos: 0, golos: 0, assistencias: 0, autGolos: 0,
  titular: 0, suplente: 0, bancoSemJogar: 0, naoConvocado: 0,
  faltasSofridas: 0, faltasCometidas: 0, amarelos: 0, vermelhoDireto: 0,
  segundoAmarelo: 0, jogosSuspensao: 0, jogosCapitao: 0,
})

function StatCell({ value, warn }: { value: number; warn?: boolean }) {
  return (
    <td className={`px-2 py-2 text-center text-xs font-mono tabular-nums ${warn ? "text-[#FF6B35] font-bold" : "text-foreground/80"}`}>
      {value > 0 ? value : <span className="text-muted-foreground/40">—</span>}
    </td>
  )
}

export function CompetitionStatsTab() {
  const [jogadores, setJogadores] = useState<Jogador[]>([])
  const [statsMap, setStatsMap] = useState<Record<string, EstatisticasCompeticao>>({})
  const [config, setConfig] = useState<ConfigPlantel>({ amarelosParaSuspensao: 5, epocaAtual: "2024/25" })
  const [editingJogador, setEditingJogador] = useState<Jogador | null>(null)
  const [editForm, setEditForm] = useState<EstatisticasCompeticao | null>(null)
  const [configOpen, setConfigOpen] = useState(false)
  const [configForm, setConfigForm] = useState<ConfigPlantel>({ amarelosParaSuspensao: 5, epocaAtual: "2024/25" })

  useEffect(() => {
    const cfg = getConfigPlantel()
    setConfig(cfg)
    setConfigForm(cfg)
    const jogs = getJogadores()
    setJogadores(jogs)
    const map: Record<string, EstatisticasCompeticao> = {}
    jogs.forEach(j => { map[j.id] = getEstatisticasJogador(j.id, cfg.epocaAtual) })
    setStatsMap(map)
  }, [])

  function refresh() {
    const jogs = getJogadores()
    setJogadores(jogs)
    const map: Record<string, EstatisticasCompeticao> = {}
    jogs.forEach(j => { map[j.id] = getEstatisticasJogador(j.id, config.epocaAtual) })
    setStatsMap(map)
  }

  function openEdit(j: Jogador) {
    setEditingJogador(j)
    setEditForm({ ...(statsMap[j.id] ?? emptyStats(j.id, config.epocaAtual)) })
  }

  function saveEdit() {
    if (!editForm) return
    updateEstatisticasJogador(editForm)
    refresh()
    setEditingJogador(null)
    setEditForm(null)
  }

  function saveConfig() {
    saveConfigPlantel(configForm)
    setConfig(configForm)
    setConfigOpen(false)
    // reload stats for new season
    const jogs = getJogadores()
    const map: Record<string, EstatisticasCompeticao> = {}
    jogs.forEach(j => { map[j.id] = getEstatisticasJogador(j.id, configForm.epocaAtual) })
    setStatsMap(map)
  }

  function isYellowAlert(s: EstatisticasCompeticao): boolean {
    return s.amarelos === config.amarelosParaSuspensao - 1 && s.jogosSuspensao === 0
  }

  function isAlreadySuspendable(s: EstatisticasCompeticao): boolean {
    return s.amarelos >= config.amarelosParaSuspensao
  }

  const jogadoresBySetor = SETORES.map(s => ({
    ...s,
    jogadores: jogadores.filter(j => getPrimarySetor(j.posicoes) === s.key),
  })).filter(s => s.jogadores.length > 0)

  const headers = ["GP", "MIN", "G", "A", "OG", "GS", "SUB", "DNP", "NC", "FS", "FC", "YC", "RC", "SUSP", "CAP"]
  const headerTitles: Record<string, string> = {
    GP: "Games Played", MIN: "Minutes", G: "Goals", A: "Assists", OG: "Own Goals",
    GS: "Games Started", SUB: "Substitute", DNP: "Did Not Play (Bench)", NC: "Not Called Up",
    FS: "Fouls Suffered", FC: "Fouls Committed", YC: "Yellow Cards", RC: "Red Cards",
    SUSP: "Suspension Games", CAP: "Games as Captain",
  }

  return (
    <div>
      {/* Header row */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h2 className="font-semibold text-lg">Match Stats</h2>
          <Badge variant="outline" className="text-xs">{config.epocaAtual}</Badge>
        </div>
        <Button variant="outline" size="sm" className="gap-2" onClick={() => { setConfigForm(config); setConfigOpen(true) }}>
          <Settings2 className="w-3.5 h-3.5" />
          Season Settings
        </Button>
      </div>

      {/* Yellow card alert legend */}
      <div className="flex items-center gap-4 mb-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-[#FF6B35]" />
          <span>1 yellow from suspension</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-destructive" />
          <span>Suspension threshold reached</span>
        </div>
        <span className="ml-auto">Suspend after <strong>{config.amarelosParaSuspensao}</strong> yellows</span>
      </div>

      {jogadores.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <p className="text-lg font-medium">No players added yet</p>
          <p className="text-sm">Add players in the Squad tab first</p>
        </div>
      ) : (
        <div className="rounded-lg border border-border overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-3 py-2 text-left font-semibold text-xs uppercase tracking-wider min-w-[160px]">Player</th>
                {headers.map(h => (
                  <th key={h} title={headerTitles[h]} className="px-2 py-2 text-center font-semibold text-xs uppercase tracking-wider cursor-help">
                    {h}
                  </th>
                ))}
                <th className="px-2 py-2 w-8" />
              </tr>
            </thead>
            <tbody>
              {jogadoresBySetor.map(setor => (
                <>
                  <tr key={`setor-${setor.key}`} className="bg-muted/10">
                    <td
                      colSpan={headers.length + 2}
                      className="px-3 py-1.5"
                      style={{ color: setor.color }}
                    >
                      <span className="text-xs font-bold uppercase tracking-widest">{setor.label}</span>
                    </td>
                  </tr>
                  {setor.jogadores.map(j => {
                    const s = statsMap[j.id]
                    if (!s) return null
                    const alertWarn = isYellowAlert(s)
                    const alertDanger = isAlreadySuspendable(s)
                    return (
                      <tr key={j.id} className={`border-b border-border/30 hover:bg-muted/20 transition-colors ${alertDanger ? "bg-destructive/5" : alertWarn ? "bg-[#FF6B35]/5" : ""}`}>
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-2">
                            {j.foto ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={j.foto} alt={j.nome} className="w-7 h-7 rounded-full object-cover border border-border shrink-0" />
                            ) : (
                              <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-xs font-bold shrink-0">
                                {j.numero}
                              </div>
                            )}
                            <div className="min-w-0">
                              <div className="font-medium text-xs truncate max-w-[110px]">{j.nome}</div>
                              <div className="text-[10px] text-muted-foreground">{j.posicoes[0]}</div>
                            </div>
                            {(alertWarn || alertDanger) && (
                              <AlertTriangle className={`w-3.5 h-3.5 shrink-0 ${alertDanger ? "text-destructive" : "text-[#FF6B35]"}`} />
                            )}
                          </div>
                        </td>
                        <StatCell value={s.jogos} />
                        <StatCell value={s.minutos} />
                        <StatCell value={s.golos} />
                        <StatCell value={s.assistencias} />
                        <StatCell value={s.autGolos} />
                        <StatCell value={s.titular} />
                        <StatCell value={s.suplente} />
                        <StatCell value={s.bancoSemJogar} />
                        <StatCell value={s.naoConvocado} />
                        <StatCell value={s.faltasSofridas} />
                        <StatCell value={s.faltasCometidas} />
                        <StatCell value={s.amarelos} warn={alertWarn || alertDanger} />
                        <td className="px-2 py-2 text-center text-xs">
                          {(s.vermelhoDireto + s.segundoAmarelo) > 0 ? (
                            <span className="text-destructive font-bold font-mono" title={`Direct: ${s.vermelhoDireto} | 2nd Yellow: ${s.segundoAmarelo}`}>
                              {s.vermelhoDireto + s.segundoAmarelo}
                            </span>
                          ) : <span className="text-muted-foreground/40">—</span>}
                        </td>
                        <StatCell value={s.jogosSuspensao} />
                        <StatCell value={s.jogosCapitao} />
                        <td className="px-2 py-2">
                          <Button size="icon" variant="ghost" className="w-6 h-6 text-muted-foreground hover:text-foreground" onClick={() => openEdit(j)}>
                            <Pencil className="w-3 h-3" />
                          </Button>
                        </td>
                      </tr>
                    )
                  })}
                </>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit stats dialog */}
      <Dialog open={!!editingJogador} onOpenChange={open => { if (!open) { setEditingJogador(null); setEditForm(null) } }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Stats — {editingJogador?.nome}</DialogTitle>
          </DialogHeader>
          {editForm && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 py-2">
              {[
                { field: "jogos", label: "Games Played" },
                { field: "minutos", label: "Minutes" },
                { field: "golos", label: "Goals" },
                { field: "assistencias", label: "Assists" },
                { field: "autGolos", label: "Own Goals" },
                { field: "titular", label: "Games Started" },
                { field: "suplente", label: "Substitute" },
                { field: "bancoSemJogar", label: "Bench (DNP)" },
                { field: "naoConvocado", label: "Not Called Up" },
                { field: "faltasSofridas", label: "Fouls Suffered" },
                { field: "faltasCometidas", label: "Fouls Committed" },
                { field: "amarelos", label: "Yellow Cards" },
                { field: "vermelhoDireto", label: "Direct Red Cards" },
                { field: "segundoAmarelo", label: "2nd Yellow Reds" },
                { field: "jogosSuspensao", label: "Suspension Games" },
                { field: "jogosCapitao", label: "Games as Captain" },
              ].map(({ field, label }) => (
                <div key={field}>
                  <Label className="text-xs">{label}</Label>
                  <Input
                    type="number"
                    min={0}
                    className="mt-1 h-8 text-sm"
                    value={(editForm as unknown as Record<string, number>)[field] ?? 0}
                    onChange={e => setEditForm({ ...editForm, [field]: parseInt(e.target.value) || 0 })}
                  />
                </div>
              ))}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => { setEditingJogador(null); setEditForm(null) }}>Cancel</Button>
            <Button onClick={saveEdit} className="bg-[#00D66C] hover:bg-[#00D66C]/90 text-black">Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Config dialog */}
      <Dialog open={configOpen} onOpenChange={setConfigOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Season Settings</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-2">
            <div>
              <Label>Current Season</Label>
              <Input
                placeholder="2024/25"
                value={configForm.epocaAtual}
                onChange={e => setConfigForm({ ...configForm, epocaAtual: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Yellow cards to suspension</Label>
              <Select
                value={String(configForm.amarelosParaSuspensao)}
                onValueChange={v => setConfigForm({ ...configForm, amarelosParaSuspensao: parseInt(v) })}
              >
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                    <SelectItem key={n} value={String(n)}>{n} yellows</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfigOpen(false)}>Cancel</Button>
            <Button onClick={saveConfig} className="bg-[#00D66C] hover:bg-[#00D66C]/90 text-black">Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
