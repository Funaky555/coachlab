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
import { Progress } from "@/components/ui/progress"
import { Plus, Calendar, ChevronLeft, ChevronRight, Clock, Flame, CheckCircle2 } from "lucide-react"
import {
  type SessaoTreino, type TipoSessao,
  getSessoes, addSessao, updateSessao, deleteSessao, getCargaSemanal
} from "@/lib/storage/treinos"

const DIAS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"]
const TIPOS_SESSAO: { value: TipoSessao; label: string; color: string }[] = [
  { value: "tatico", label: "Tático", color: "#0066FF" },
  { value: "tecnico", label: "Técnico", color: "#8B5CF6" },
  { value: "fisico", label: "Físico", color: "#FF6B35" },
  { value: "misto", label: "Misto", color: "#00D66C" },
  { value: "recuperacao", label: "Recuperação", color: "#6B7280" },
  { value: "jogo", label: "Jogo", color: "#EF4444" },
]

function getMondayOfWeek(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff)
  d.setHours(0, 0, 0, 0)
  return d
}

function formatWeek(monday: Date): string {
  const friday = new Date(monday)
  friday.setDate(friday.getDate() + 6)
  return `${monday.toLocaleDateString("pt-PT", { day: "2-digit", month: "short" })} — ${friday.toLocaleDateString("pt-PT", { day: "2-digit", month: "short", year: "numeric" })}`
}

function getWeekDates(monday: Date): string[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(d.getDate() + i)
    return d.toISOString().split("T")[0]
  })
}

const emptyForm = {
  data: new Date().toISOString().split("T")[0],
  duracao: 90,
  tipo: "misto" as TipoSessao,
  objetivosTaticos: "",
  objetivosTecnicos: "",
  conteudos: "",
  rpePrevisto: 6,
  rpeReal: undefined as number | undefined,
  avaliacao: undefined as number | undefined,
  notas: "",
  concluida: false,
}

export function TreinosModule() {
  const [sessoes, setSessoes] = useState<SessaoTreino[]>([])
  const [currentMonday, setCurrentMonday] = useState(() => getMondayOfWeek(new Date()))
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [selectedDay, setSelectedDay] = useState<string | null>(null)

  useEffect(() => {
    setSessoes(getSessoes())
  }, [])

  const weekDates = getWeekDates(currentMonday)
  const weekSessoes = sessoes.filter(s => weekDates.includes(s.data))
  const carga = weekSessoes.reduce((acc, s) => acc + (s.rpeReal ?? s.rpePrevisto), 0)
  const maxCarga = 7 * 10
  const cargaPct = Math.min((carga / maxCarga) * 100, 100)

  function prevWeek() {
    const d = new Date(currentMonday)
    d.setDate(d.getDate() - 7)
    setCurrentMonday(d)
  }
  function nextWeek() {
    const d = new Date(currentMonday)
    d.setDate(d.getDate() + 7)
    setCurrentMonday(d)
  }

  function openAddForDay(date: string) {
    setEditingId(null)
    setForm({ ...emptyForm, data: date })
    setSelectedDay(date)
    setDialogOpen(true)
  }

  function openEdit(s: SessaoTreino) {
    setEditingId(s.id)
    setForm({
      data: s.data, duracao: s.duracao, tipo: s.tipo,
      objetivosTaticos: s.objetivosTaticos, objetivosTecnicos: s.objetivosTecnicos,
      conteudos: s.conteudos, rpePrevisto: s.rpePrevisto,
      rpeReal: s.rpeReal, avaliacao: s.avaliacao, notas: s.notas ?? "",
      concluida: s.concluida
    })
    setDialogOpen(true)
  }

  function saveSessao() {
    const dayOfWeek = new Date(form.data).getDay()
    const payload = { ...form, diaSemana: dayOfWeek === 0 ? 6 : dayOfWeek - 1 }
    if (editingId) {
      updateSessao(editingId, payload)
    } else {
      addSessao(payload)
    }
    setSessoes(getSessoes())
    setDialogOpen(false)
  }

  function toggleConcluida(id: string, current: boolean) {
    updateSessao(id, { concluida: !current })
    setSessoes(getSessoes())
  }

  const tipoInfo = (tipo: TipoSessao) => TIPOS_SESSAO.find(t => t.value === tipo) ?? TIPOS_SESSAO[3]

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: "var(--font-barlow-condensed)" }}>
          Planeamento de Treino
        </h1>
        <p className="text-muted-foreground">Microciclo semanal, objetivos e controlo de carga</p>
      </div>

      {/* Carga Semanal */}
      <Card className="glass-card border-border/50 mb-6">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-[#FF6B35]" />
              <span className="text-sm font-medium">Carga Semanal (RPE acumulado)</span>
            </div>
            <span className="text-2xl font-bold" style={{ fontFamily: "var(--font-barlow-condensed)" }}>
              {carga}
            </span>
          </div>
          <Progress value={cargaPct} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>Baixa carga</span>
            <span>Alta carga (70)</span>
          </div>
        </CardContent>
      </Card>

      {/* Semana nav */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" onClick={prevWeek}><ChevronLeft className="w-4 h-4" /></Button>
          <div className="flex items-center gap-2 text-sm font-medium">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            {formatWeek(currentMonday)}
          </div>
          <Button variant="outline" size="icon" onClick={nextWeek}><ChevronRight className="w-4 h-4" /></Button>
        </div>
        <span className="text-sm text-muted-foreground">{weekSessoes.length} sessões</span>
      </div>

      {/* Microciclo Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3 mb-8">
        {weekDates.map((date, i) => {
          const daySessoes = weekSessoes.filter(s => s.data === date)
          const isToday = date === new Date().toISOString().split("T")[0]

          return (
            <div key={date} className={`rounded-xl border p-3 min-h-[160px] flex flex-col gap-2 ${isToday ? "border-[#00D66C]/50 bg-[#00D66C]/5" : "border-border bg-card/40"}`}>
              <div className="flex items-center justify-between mb-1">
                <span className={`text-xs font-bold uppercase ${isToday ? "text-[#00D66C]" : "text-muted-foreground"}`}>
                  {DIAS[i]}
                </span>
                <span className="text-xs text-muted-foreground">
                  {new Date(date).getDate()}
                </span>
              </div>
              {daySessoes.map(s => {
                const ti = tipoInfo(s.tipo)
                return (
                  <div
                    key={s.id}
                    onClick={() => openEdit(s)}
                    className="cursor-pointer rounded-lg p-2 text-xs relative"
                    style={{ background: `${ti.color}15`, border: `1px solid ${ti.color}30` }}
                  >
                    {s.concluida && (
                      <CheckCircle2 className="w-3 h-3 absolute top-1.5 right-1.5" style={{ color: ti.color }} />
                    )}
                    <div className="font-semibold" style={{ color: ti.color }}>{ti.label}</div>
                    <div className="flex items-center gap-1 text-muted-foreground mt-0.5">
                      <Clock className="w-2.5 h-2.5" />
                      {s.duracao}min · RPE {s.rpeReal ?? s.rpePrevisto}
                    </div>
                  </div>
                )
              })}
              <button
                onClick={() => openAddForDay(date)}
                className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors mt-auto"
              >
                <Plus className="w-3 h-3" /> Sessão
              </button>
            </div>
          )
        })}
      </div>

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Editar Sessão" : "Nova Sessão de Treino"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Data</Label>
                <Input type="date" value={form.data} onChange={e => setForm({...form, data: e.target.value})} className="mt-1" />
              </div>
              <div>
                <Label>Duração (min)</Label>
                <Input type="number" min={15} max={180} value={form.duracao} onChange={e => setForm({...form, duracao: parseInt(e.target.value)})} className="mt-1" />
              </div>
            </div>
            <div>
              <Label>Tipo de Sessão</Label>
              <Select value={form.tipo} onValueChange={v => setForm({...form, tipo: v as TipoSessao})}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TIPOS_SESSAO.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Objetivos Táticos</Label>
              <Textarea placeholder="Ex: Organização defensiva, pressing..." value={form.objetivosTaticos} onChange={e => setForm({...form, objetivosTaticos: e.target.value})} className="mt-1 h-20" />
            </div>
            <div>
              <Label>Objetivos Técnicos</Label>
              <Textarea placeholder="Ex: Receção orientada, finalização..." value={form.objetivosTecnicos} onChange={e => setForm({...form, objetivosTecnicos: e.target.value})} className="mt-1 h-20" />
            </div>
            <div>
              <Label>Conteúdos / Exercícios</Label>
              <Textarea placeholder="Descreve os exercícios e conteúdos..." value={form.conteudos} onChange={e => setForm({...form, conteudos: e.target.value})} className="mt-1 h-20" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>RPE Previsto (1-10)</Label>
                <Input type="number" min={1} max={10} value={form.rpePrevisto} onChange={e => setForm({...form, rpePrevisto: parseInt(e.target.value)})} className="mt-1" />
              </div>
              <div>
                <Label>RPE Real (após treino)</Label>
                <Input type="number" min={1} max={10} placeholder="—" value={form.rpeReal ?? ""} onChange={e => setForm({...form, rpeReal: e.target.value ? parseInt(e.target.value) : undefined})} className="mt-1" />
              </div>
            </div>
            {editingId && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Avaliação do Treino (1-10)</Label>
                  <Input type="number" min={1} max={10} value={form.avaliacao ?? ""} onChange={e => setForm({...form, avaliacao: e.target.value ? parseInt(e.target.value) : undefined})} className="mt-1" />
                </div>
                <div className="flex items-end pb-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.concluida} onChange={e => setForm({...form, concluida: e.target.checked})} className="w-4 h-4" />
                    <span className="text-sm">Sessão concluída</span>
                  </label>
                </div>
              </div>
            )}
            <div>
              <Label>Notas</Label>
              <Textarea placeholder="Notas livres..." value={form.notas} onChange={e => setForm({...form, notas: e.target.value})} className="mt-1 h-16" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={saveSessao} className="bg-[#0066FF] hover:bg-[#0066FF]/90 text-white">
              {editingId ? "Guardar" : "Criar Sessão"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
