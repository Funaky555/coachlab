"use client"

import { useState, useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  type Jogador, type MoralJogador, type EstadoMoral, type HierarquiaJogador,
  getJogadores, getMoralJogadores, saveMoralJogadores, getMoralJogador,
  updateMoralJogador, getHierarquia,
} from "@/lib/storage/plantel"

const MORAL_STATES: { value: EstadoMoral; label: string; color: string; bg: string }[] = [
  { value: "happy", label: "Happy", color: "#FFFFFF", bg: "#00D66C" },
  { value: "comfortable", label: "Satisfied", color: "#FFFFFF", bg: "#84CC16" },
  { value: "sad", label: "Unsatisfied", color: "#FFFFFF", bg: "#FF6B35" },
  { value: "unsatisfied", label: "Unhappy", color: "#FFFFFF", bg: "#EF4444" },
]

const MORAL_FIELDS: { key: keyof Omit<MoralJogador, "jogadorId">; label: string }[] = [
  { key: "promessas", label: "Promises" },
  { key: "moral", label: "Morale" },
  { key: "treino", label: "Training" },
  { key: "tratamento", label: "Treatment" },
  { key: "clube", label: "Club" },
  { key: "staff", label: "Management" },
  { key: "tempoJogo", label: "Playing Time" },
  { key: "felicidadeGeral", label: "Overall" },
]

function getMoralStyle(estado: EstadoMoral) {
  return MORAL_STATES.find(m => m.value === estado) ?? MORAL_STATES[1]
}

function MoralCell({
  value,
  onChange,
  readOnly,
}: {
  value: EstadoMoral
  onChange?: (v: EstadoMoral) => void
  readOnly?: boolean
}) {
  const style = getMoralStyle(value)
  if (readOnly) {
    return (
      <td className="px-1 py-1 text-center">
        <div
          className="rounded px-2 py-1 text-[10px] font-bold text-center mx-auto"
          style={{ background: style.bg, color: style.color, minWidth: 64 }}
        >
          {style.label}
        </div>
      </td>
    )
  }
  return (
    <td className="px-1 py-1 text-center">
      <Select value={value} onValueChange={v => onChange?.(v as EstadoMoral)}>
        <SelectTrigger
          className="h-7 border-0 text-[10px] font-bold px-2 rounded focus:ring-0"
          style={{ background: style.bg, color: style.color, minWidth: 72 }}
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {MORAL_STATES.map(m => (
            <SelectItem key={m.value} value={m.value}>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ background: m.bg }} />
                <span className="text-xs">{m.label}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </td>
  )
}

function calcOverall(m: MoralJogador): EstadoMoral {
  const scoreMap: Record<EstadoMoral, number> = { happy: 3, comfortable: 2, sad: 1, unsatisfied: 0 }
  const fields: (keyof Omit<MoralJogador, "jogadorId">)[] = ["promessas", "moral", "treino", "tratamento", "clube", "staff", "tempoJogo"]
  const avg = fields.reduce((sum, f) => sum + scoreMap[m[f]], 0) / fields.length
  if (avg >= 2.5) return "happy"
  if (avg >= 1.5) return "comfortable"
  if (avg >= 0.75) return "sad"
  return "unsatisfied"
}

export function MoraleTab() {
  const [jogadores, setJogadores] = useState<Jogador[]>([])
  const [morals, setMorals] = useState<Record<string, MoralJogador>>({})
  const [hierarquia, setHierarquia] = useState<HierarquiaJogador[]>([])

  useEffect(() => {
    const jogs = getJogadores()
    setJogadores(jogs)
    setHierarquia(getHierarquia())
    const all = getMoralJogadores()
    const map: Record<string, MoralJogador> = {}
    jogs.forEach(j => {
      map[j.id] = all.find(m => m.jogadorId === j.id) ?? getMoralJogador(j.id)
    })
    setMorals(map)
  }, [])

  function updateField(jogadorId: string, field: keyof Omit<MoralJogador, "jogadorId">, value: EstadoMoral) {
    if (field === "felicidadeGeral") return // read-only, computed
    const current = morals[jogadorId]
    if (!current) return
    const updated = { ...current, [field]: value }
    updated.felicidadeGeral = calcOverall(updated)
    setMorals(prev => ({ ...prev, [jogadorId]: updated }))
    updateMoralJogador(updated)
  }

  // Sort players by hierarchy level
  const levelOrder: Record<string, number> = { team_leader: 0, highly_influential: 1, influential: 2, other: 3 }
  const sortedJogadores = [...jogadores].sort((a, b) => {
    const ha = hierarquia.find(h => h.jogadorId === a.id)
    const hb = hierarquia.find(h => h.jogadorId === b.id)
    const levelA = levelOrder[ha?.nivel ?? "other"] ?? 3
    const levelB = levelOrder[hb?.nivel ?? "other"] ?? 3
    if (levelA !== levelB) return levelA - levelB
    return (ha?.ordem ?? 999) - (hb?.ordem ?? 999)
  })

  const levelLabels: Record<string, string> = {
    team_leader: "TEAM LEADERS",
    highly_influential: "HIGHLY INFLUENTIAL",
    influential: "INFLUENTIAL PLAYERS",
    other: "OTHER PLAYERS",
  }
  const levelColors: Record<string, string> = {
    team_leader: "#FFD700",
    highly_influential: "#00D66C",
    influential: "#0066FF",
    other: "#8B5CF6",
  }

  let lastLevel = ""

  return (
    <div>
      <div className="mb-4">
        <h2 className="font-semibold text-lg mb-1">Player Morale</h2>
        <p className="text-xs text-muted-foreground">Track each player&apos;s happiness across key areas. Overall is calculated automatically.</p>
      </div>

      {jogadores.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <p>No players added yet</p>
        </div>
      ) : (
        <div className="rounded-lg border border-border overflow-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider min-w-[160px]">Player</th>
                {MORAL_FIELDS.map(f => (
                  <th key={f.key} className={`px-1 py-2 text-center text-xs font-semibold uppercase tracking-wider min-w-[80px] ${f.key === "felicidadeGeral" ? "border-l border-border" : ""}`}>
                    {f.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sortedJogadores.map(j => {
                const hier = hierarquia.find(h => h.jogadorId === j.id)
                const nivel = hier?.nivel ?? "other"
                const showHeader = nivel !== lastLevel
                lastLevel = nivel

                const m = morals[j.id]
                if (!m) return null

                return (
                  <>
                    {showHeader && (
                      <tr key={`header-${nivel}`} className="bg-muted/10">
                        <td colSpan={MORAL_FIELDS.length + 1} className="px-3 py-1">
                          <span
                            className="text-[10px] font-bold uppercase tracking-widest"
                            style={{ color: levelColors[nivel] }}
                          >
                            {levelLabels[nivel]}
                          </span>
                        </td>
                      </tr>
                    )}
                    <tr key={j.id} className="border-b border-border/30 hover:bg-muted/10 transition-colors">
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-2">
                          {j.foto ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={j.foto} alt={j.nome} className="w-8 h-8 rounded-full object-cover border border-border shrink-0" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold shrink-0">{j.numero}</div>
                          )}
                          <div>
                            <div className="text-xs font-semibold truncate max-w-[100px]">{j.nome}</div>
                            <div className="text-[10px] text-muted-foreground">{hier?.personalidade ?? "Balanced"}</div>
                          </div>
                        </div>
                      </td>
                      {MORAL_FIELDS.map(f => (
                        f.key === "felicidadeGeral" ? (
                          <MoralCell key={f.key} value={m.felicidadeGeral} readOnly />
                        ) : (
                          <MoralCell
                            key={f.key}
                            value={m[f.key]}
                            onChange={v => updateField(j.id, f.key, v)}
                          />
                        )
                      ))}
                    </tr>
                  </>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
