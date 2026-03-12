"use client"

import { useState, useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronUp, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  type Jogador, type HierarquiaJogador, type NivelHierarquia, type PersonalidadeJogador,
  getJogadores, getHierarquia, saveHierarquia,
} from "@/lib/storage/plantel"

const NIVEIS: { key: NivelHierarquia; label: string; color: string; gradient: string; max: number }[] = [
  { key: "team_leader", label: "TEAM LEADERS", color: "#FFD700", gradient: "from-yellow-500/20 to-yellow-600/10", max: 3 },
  { key: "highly_influential", label: "HIGHLY INFLUENTIAL PLAYERS", color: "#00D66C", gradient: "from-green-500/20 to-green-600/10", max: 5 },
  { key: "influential", label: "INFLUENTIAL PLAYERS", color: "#0066FF", gradient: "from-blue-500/20 to-blue-600/10", max: 8 },
  { key: "other", label: "OTHER PLAYERS", color: "#8B5CF6", gradient: "from-purple-500/20 to-purple-600/10", max: 99 },
]

const PERSONALIDADES: PersonalidadeJogador[] = [
  "Professional", "Balanced", "Determined", "Model Citizen",
  "Spirited", "Ambitious", "Laid Back", "Temperamental",
]

function PlayerCard({
  jogador,
  hierarquia,
  onNivelChange,
  onPersonalidadeChange,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
}: {
  jogador: Jogador
  hierarquia: HierarquiaJogador
  onNivelChange: (nivel: NivelHierarquia) => void
  onPersonalidadeChange: (p: PersonalidadeJogador) => void
  onMoveUp: () => void
  onMoveDown: () => void
  canMoveUp: boolean
  canMoveDown: boolean
}) {
  return (
    <div className="flex items-center gap-2 bg-black/40 border border-white/10 rounded-lg px-3 py-2 min-w-[160px]">
      {jogador.foto ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={jogador.foto} alt={jogador.nome} className="w-9 h-9 rounded-full object-cover border-2 border-white/20 shrink-0" />
      ) : (
        <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-sm font-bold shrink-0">
          {jogador.numero}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="text-xs font-semibold truncate">{jogador.nome}</div>
        <Select
          value={hierarquia.personalidade ?? "Balanced"}
          onValueChange={v => onPersonalidadeChange(v as PersonalidadeJogador)}
        >
          <SelectTrigger className="h-5 text-[10px] border-0 p-0 bg-transparent text-muted-foreground focus:ring-0 w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PERSONALIDADES.map(p => <SelectItem key={p} value={p} className="text-xs">{p}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-0.5 shrink-0">
        <Button size="icon" variant="ghost" className="w-5 h-5" disabled={!canMoveUp} onClick={onMoveUp}>
          <ChevronUp className="w-3 h-3" />
        </Button>
        <Button size="icon" variant="ghost" className="w-5 h-5" disabled={!canMoveDown} onClick={onMoveDown}>
          <ChevronDown className="w-3 h-3" />
        </Button>
      </div>
    </div>
  )
}

export function HierarchyTab() {
  const [jogadores, setJogadores] = useState<Jogador[]>([])
  const [hierarquia, setHierarquia] = useState<HierarquiaJogador[]>([])

  useEffect(() => {
    const jogs = getJogadores()
    setJogadores(jogs)
    const hier = getHierarquia()
    // Ensure all players have a hierarchy entry
    const updated = [...hier]
    jogs.forEach(j => {
      if (!updated.find(h => h.jogadorId === j.id)) {
        updated.push({ jogadorId: j.id, nivel: "other", ordem: 999, personalidade: "Balanced" })
      }
    })
    setHierarquia(updated)
    saveHierarquia(updated)
  }, [])

  function persist(updated: HierarquiaJogador[]) {
    setHierarquia(updated)
    saveHierarquia(updated)
  }

  function changeNivel(jogadorId: string, nivel: NivelHierarquia) {
    const updated = hierarquia.map(h => h.jogadorId === jogadorId ? { ...h, nivel, ordem: 999 } : h)
    // Reorder within each level
    const reordered = reorderNivel(updated)
    persist(reordered)
  }

  function changePersonalidade(jogadorId: string, personalidade: PersonalidadeJogador) {
    persist(hierarquia.map(h => h.jogadorId === jogadorId ? { ...h, personalidade } : h))
  }

  function movePlayer(jogadorId: string, direction: "up" | "down") {
    const player = hierarquia.find(h => h.jogadorId === jogadorId)
    if (!player) return
    const sameLevel = [...hierarquia.filter(h => h.nivel === player.nivel)].sort((a, b) => a.ordem - b.ordem)
    const idx = sameLevel.findIndex(h => h.jogadorId === jogadorId)
    const newIdx = direction === "up" ? idx - 1 : idx + 1
    if (newIdx < 0 || newIdx >= sameLevel.length) return
    // Swap orders
    const swapWith = sameLevel[newIdx]
    const updated = hierarquia.map(h => {
      if (h.jogadorId === jogadorId) return { ...h, ordem: swapWith.ordem }
      if (h.jogadorId === swapWith.jogadorId) return { ...h, ordem: player.ordem }
      return h
    })
    persist(updated)
  }

  function reorderNivel(hier: HierarquiaJogador[]): HierarquiaJogador[] {
    const result: HierarquiaJogador[] = []
    NIVEIS.forEach(n => {
      const players = hier.filter(h => h.nivel === n.key).sort((a, b) => a.ordem - b.ordem)
      players.forEach((p, i) => result.push({ ...p, ordem: i }))
    })
    return result
  }

  function getPlayersForNivel(nivel: NivelHierarquia) {
    return hierarquia
      .filter(h => h.nivel === nivel)
      .sort((a, b) => a.ordem - b.ordem)
      .map(h => ({ hier: h, jogador: jogadores.find(j => j.id === h.jogadorId) }))
      .filter(x => x.jogador !== undefined) as { hier: HierarquiaJogador; jogador: Jogador }[]
  }

  // Pyramid widths per level
  const pyramidWidths = ["w-1/3", "w-1/2", "w-2/3", "w-full"]

  return (
    <div>
      <div className="mb-6">
        <h2 className="font-semibold text-lg mb-1">Hierarchy</h2>
        <p className="text-xs text-muted-foreground">
          Drag players between levels or use arrows. Click a player&apos;s personality to change it.
        </p>
      </div>

      {/* Manager at top */}
      <div className="flex flex-col items-center mb-2">
        <div className="flex flex-col items-center gap-1 bg-gradient-to-b from-slate-700/60 to-slate-800/40 border border-white/10 rounded-xl px-6 py-3">
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-lg font-bold border-2 border-[#00D66C]/40">
            DS
          </div>
          <div className="text-sm font-bold">Daniel de Sousa</div>
          <div className="text-[10px] text-[#00D66C] uppercase tracking-widest font-bold">MANAGER</div>
        </div>
        <div className="w-0.5 h-4 bg-border" />
      </div>

      {/* Pyramid levels */}
      <div className="flex flex-col items-center gap-0">
        {NIVEIS.map((nivel, levelIdx) => {
          const players = getPlayersForNivel(nivel.key)
          return (
            <div key={nivel.key} className="w-full flex flex-col items-center">
              {/* Level header */}
              <div
                className={`w-full max-w-[${pyramidWidths[levelIdx]}] ${pyramidWidths[levelIdx]} bg-gradient-to-r ${nivel.gradient} border-t border-l border-r rounded-t-lg px-4 py-1.5 text-center`}
                style={{ borderColor: `${nivel.color}30` }}
              >
                <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: nivel.color }}>
                  {nivel.label}
                </span>
              </div>

              {/* Players row */}
              <div
                className={`w-full max-w-[${pyramidWidths[levelIdx]}] ${pyramidWidths[levelIdx]} bg-gradient-to-b ${nivel.gradient} border rounded-b-lg px-3 py-3 mb-0.5 min-h-[70px]`}
                style={{ borderColor: `${nivel.color}20` }}
              >
                {players.length === 0 ? (
                  <div className="text-center text-[10px] text-muted-foreground/40 py-2">No players</div>
                ) : (
                  <div className="flex flex-wrap justify-center gap-2">
                    {players.map(({ hier, jogador }, idx) => (
                      <PlayerCard
                        key={hier.jogadorId}
                        jogador={jogador}
                        hierarquia={hier}
                        onNivelChange={n => changeNivel(hier.jogadorId, n)}
                        onPersonalidadeChange={p => changePersonalidade(hier.jogadorId, p)}
                        onMoveUp={() => movePlayer(hier.jogadorId, "up")}
                        onMoveDown={() => movePlayer(hier.jogadorId, "down")}
                        canMoveUp={idx > 0}
                        canMoveDown={idx < players.length - 1}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Connector */}
              {levelIdx < NIVEIS.length - 1 && <div className="w-0.5 h-2 bg-border" />}
            </div>
          )
        })}
      </div>

      {/* Assign level controls */}
      <div className="mt-6 rounded-lg border border-border p-4 bg-muted/10">
        <h3 className="text-sm font-semibold mb-3">Assign Player to Level</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
          {jogadores.map(j => {
            const hier = hierarquia.find(h => h.jogadorId === j.id)
            return (
              <div key={j.id} className="flex items-center gap-2">
                <div className="text-xs font-medium truncate flex-1">{j.nome}</div>
                <Select
                  value={hier?.nivel ?? "other"}
                  onValueChange={v => changeNivel(j.id, v as NivelHierarquia)}
                >
                  <SelectTrigger className="h-7 text-xs w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {NIVEIS.map(n => <SelectItem key={n.key} value={n.key} className="text-xs">{n.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
