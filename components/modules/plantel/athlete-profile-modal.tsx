"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Pencil, User } from "lucide-react"
import { type Jogador, type EstadoJogador, getPresencasByJogador, getOcorrenciasByJogador } from "@/lib/storage/plantel"
import { getRegistosFisicosByJogador, type RegistoFisico } from "@/lib/storage/fisico"
import { getRegistosMedicosByJogador, type RegistoMedico } from "@/lib/storage/medico"

interface Props {
  jogador: Jogador
  open: boolean
  onClose: () => void
  onEdit: (j: Jogador) => void
}

function estadoBadge(estado: EstadoJogador) {
  const map = {
    apto: { className: "bg-[#00D66C]/20 text-[#00D66C] border-[#00D66C]/30", label: "Apto" },
    condicionado: { className: "bg-[#FF6B35]/20 text-[#FF6B35] border-[#FF6B35]/30", label: "Condicionado" },
    lesionado: { className: "bg-destructive/20 text-destructive border-destructive/30", label: "Lesionado" },
  }
  const { className, label } = map[estado]
  return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${className}`}>{label}</span>
}

function calcIdade(dataNascimento?: string): string {
  if (!dataNascimento) return "—"
  const anos = Math.floor((Date.now() - new Date(dataNascimento).getTime()) / (365.25 * 24 * 3600 * 1000))
  return `${anos} anos`
}

export function AthleteProfileModal({ jogador, open, onClose, onEdit }: Props) {
  const [presencas, setPresencas] = useState<ReturnType<typeof getPresencasByJogador>>([])
  const [ocorrencias, setOcorrencias] = useState<ReturnType<typeof getOcorrenciasByJogador>>([])
  const [fisico, setFisico] = useState<RegistoFisico[]>([])
  const [medico, setMedico] = useState<RegistoMedico[]>([])

  useEffect(() => {
    if (!open) return
    setPresencas(getPresencasByJogador(jogador.id))
    setOcorrencias(getOcorrenciasByJogador(jogador.id))
    setFisico(getRegistosFisicosByJogador(jogador.id))
    setMedico(getRegistosMedicosByJogador(jogador.id))
  }, [open, jogador.id])

  const tipoPresencaLabel: Record<string, string> = { treino: "Treino", ginasio: "Ginásio", reuniao: "Reunião", jogo: "Jogo" }
  const estadoPresencaLabel: Record<string, { label: string; color: string }> = {
    presente: { label: "Presente", color: "text-[#00D66C]" },
    falta: { label: "Falta", color: "text-destructive" },
    atraso: { label: "Atraso", color: "text-[#FF6B35]" },
    justificado: { label: "Justificado", color: "text-muted-foreground" },
  }
  const tipoLesaoLabel: Record<string, string> = { muscular: "Muscular", ossea: "Óssea", ligamentar: "Ligamentar", articular: "Articular", outra: "Outra" }
  const estadoLesaoLabel: Record<string, { label: string; color: string }> = {
    ativa: { label: "Ativa", color: "text-destructive" },
    em_recuperacao: { label: "Em recuperação", color: "text-[#FF6B35]" },
    recuperado: { label: "Recuperado", color: "text-[#00D66C]" },
  }

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-4">
            {jogador.foto ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={jogador.foto} alt={jogador.nome} className="w-14 h-14 rounded-full object-cover shrink-0 border-2 border-[#00D66C]/40" />
            ) : (
              <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center text-2xl font-bold shrink-0 border-2 border-border" style={{ fontFamily: "var(--font-barlow-condensed)" }}>
                {jogador.numero}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-xl">{jogador.nome}</DialogTitle>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className="text-sm text-muted-foreground">#{jogador.numero}</span>
                {jogador.posicoes.map((p, i) => (
                  <Badge key={p} variant={i === 0 ? "default" : "outline"} className={i === 0 ? "bg-[#00D66C]/20 text-[#00D66C] border-[#00D66C]/30 hover:bg-[#00D66C]/20" : "text-xs"}>{p}</Badge>
                ))}
                {estadoBadge(jogador.estado)}
              </div>
            </div>
            <Button size="sm" variant="outline" className="shrink-0 gap-1.5" onClick={() => onEdit(jogador)}>
              <Pencil className="w-3.5 h-3.5" /> Editar
            </Button>
          </div>
        </DialogHeader>

        <Tabs defaultValue="info" className="mt-2">
          <TabsList className="w-full">
            <TabsTrigger value="info" className="flex-1">Info</TabsTrigger>
            <TabsTrigger value="fisico" className="flex-1">Físico {fisico.length > 0 && <span className="ml-1 text-xs opacity-60">({fisico.length})</span>}</TabsTrigger>
            <TabsTrigger value="medico" className="flex-1">Médico {medico.length > 0 && <span className="ml-1 text-xs opacity-60">({medico.length})</span>}</TabsTrigger>
            <TabsTrigger value="disciplina" className="flex-1">Disciplina {ocorrencias.length > 0 && <span className="ml-1 text-xs opacity-60">({ocorrencias.length})</span>}</TabsTrigger>
            <TabsTrigger value="presencas" className="flex-1">Presenças {presencas.length > 0 && <span className="ml-1 text-xs opacity-60">({presencas.length})</span>}</TabsTrigger>
          </TabsList>

          {/* INFO */}
          <TabsContent value="info" className="mt-4">
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Idade", value: calcIdade(jogador.dataNascimento) },
                { label: "Nascimento", value: jogador.dataNascimento ?? "—" },
                { label: "Nacionalidade", value: jogador.nacionalidade ?? "—" },
                { label: "Altura", value: jogador.altura ? `${jogador.altura} cm` : "—" },
                { label: "Peso", value: jogador.peso ? `${jogador.peso} kg` : "—" },
                { label: "Pé preferido", value: jogador.pePreferido ? (jogador.pePreferido.charAt(0).toUpperCase() + jogador.pePreferido.slice(1)) : "—" },
              ].map(({ label, value }) => (
                <div key={label} className="bg-muted/30 rounded-lg p-3">
                  <div className="text-xs text-muted-foreground mb-1">{label}</div>
                  <div className="font-medium text-sm">{value}</div>
                </div>
              ))}
            </div>
            {jogador.notas && (
              <div className="mt-4 bg-muted/30 rounded-lg p-3">
                <div className="text-xs text-muted-foreground mb-1">Notas</div>
                <div className="text-sm">{jogador.notas}</div>
              </div>
            )}
          </TabsContent>

          {/* FÍSICO */}
          <TabsContent value="fisico" className="mt-4">
            {fisico.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <User className="w-8 h-8 mb-2 opacity-30" />
                <p className="text-sm">Sem registos físicos</p>
                <p className="text-xs opacity-60">Adiciona registos no módulo de Monitorização Física</p>
              </div>
            ) : (
              <div className="rounded-lg border border-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Duração</TableHead>
                      <TableHead>Distância</TableHead>
                      <TableHead>Sprints</TableHead>
                      <TableHead>RPE</TableHead>
                      <TableHead>FC Máx</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fisico.sort((a, b) => b.data.localeCompare(a.data)).map(r => (
                      <TableRow key={r.id}>
                        <TableCell className="text-sm">{r.data}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{r.duracao ? `${r.duracao} min` : "—"}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{r.distancia ? `${r.distancia} km` : "—"}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{r.sprints ?? "—"}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{r.rpe ?? "—"}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{r.fcMax ? `${r.fcMax} bpm` : "—"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>

          {/* MÉDICO */}
          <TabsContent value="medico" className="mt-4">
            {medico.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <User className="w-8 h-8 mb-2 opacity-30" />
                <p className="text-sm">Sem registos médicos</p>
                <p className="text-xs opacity-60">Adiciona registos no módulo de Dep. Médico</p>
              </div>
            ) : (
              <div className="space-y-3">
                {medico.sort((a, b) => b.dataInicio.localeCompare(a.dataInicio)).map(r => (
                  <div key={r.id} className="bg-muted/30 rounded-lg p-4">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <span className="font-medium text-sm">{tipoLesaoLabel[r.tipo]} — {r.localizacao}</span>
                        <div className="text-xs text-muted-foreground mt-0.5">{r.dataInicio}{r.dataRetorno ? ` → ${r.dataRetorno}` : ""}</div>
                      </div>
                      <span className={`text-xs font-medium ${estadoLesaoLabel[r.estado].color}`}>{estadoLesaoLabel[r.estado].label}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{r.descricao}</p>
                    {r.tratamento && <p className="text-xs text-muted-foreground mt-1"><span className="font-medium">Tratamento:</span> {r.tratamento}</p>}
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* DISCIPLINA */}
          <TabsContent value="disciplina" className="mt-4">
            {ocorrencias.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <User className="w-8 h-8 mb-2 opacity-30 text-[#00D66C]" />
                <p className="text-sm">Sem ocorrências disciplinares</p>
              </div>
            ) : (
              <div className="space-y-3">
                {ocorrencias.sort((a, b) => b.data.localeCompare(a.data)).map(o => (
                  <div key={o.id} className="bg-muted/30 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-muted-foreground">{o.data}</span>
                      <span className={`text-xs font-medium capitalize ${o.gravidade === "grave" ? "text-destructive" : o.gravidade === "moderada" ? "text-[#FF6B35]" : "text-muted-foreground"}`}>{o.gravidade}</span>
                    </div>
                    <div className="font-medium text-sm capitalize">{o.tipo.replace("_", " ")}</div>
                    <p className="text-sm text-muted-foreground mt-1">{o.descricao}</p>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* PRESENÇAS */}
          <TabsContent value="presencas" className="mt-4">
            {presencas.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <User className="w-8 h-8 mb-2 opacity-30" />
                <p className="text-sm">Sem registos de presenças</p>
              </div>
            ) : (
              <div className="rounded-lg border border-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Notas</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {presencas.sort((a, b) => b.data.localeCompare(a.data)).map(p => (
                      <TableRow key={p.id}>
                        <TableCell className="text-sm">{p.data}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{tipoPresencaLabel[p.tipo] ?? p.tipo}</TableCell>
                        <TableCell className={`text-sm font-medium ${estadoPresencaLabel[p.estado]?.color ?? ""}`}>{estadoPresencaLabel[p.estado]?.label ?? p.estado}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{p.notas ?? "—"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
