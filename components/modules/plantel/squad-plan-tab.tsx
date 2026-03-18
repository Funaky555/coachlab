"use client"

import { useState, useEffect, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Minus, Plus, Camera, UserX, Zap, RotateCcw } from "lucide-react"
import { type Jogador, getJogadores, getSquadPlan, saveSquadPlan, type SquadPlanSlot, displayName } from "@/lib/storage/plantel"

const DEFAULT_COUNTS = { gk: 3, def: 8, mid: 6, fwd: 6 }

// ── Position labels by sector + count ──────────────────────────────────────
function buildPositionLabels(sector: string, count: number): string[] {
  if (sector === "gk") return Array(count).fill("GK")
  if (sector === "def") {
    if (count === 1) return ["CB"]
    if (count === 2) return ["LB", "RB"]
    if (count === 3) return ["LB", "CB", "RB"]
    if (count === 4) return ["LB", "CBL", "CBR", "RB"]
    if (count === 5) return ["LB", "CBL", "CB", "CBR", "RB"]
    if (count === 6) return ["LB", "LB", "CBL", "CBR", "RB", "RB"]
    if (count === 7) return ["LB", "LB", "CBL", "CB", "CBR", "RB", "RB"]
    if (count === 8) return ["LB", "LB", "CBL", "CBL", "CBR", "CBR", "RB", "RB"]
    return ["LB", "LB", "CBL", "CBL", "CB", "CBR", "CBR", "RB", "RB", ...Array(count - 9).fill("CB")]
  }
  if (sector === "mid") {
    if (count === 1) return ["CM"]
    if (count === 2) return ["CM", "CM"]
    if (count === 3) return ["CML", "CM", "CMR"]
    if (count === 4) return ["CML", "CM", "CM", "CMR"]
    if (count === 5) return ["CML", "CML", "CM", "CMR", "CMR"]
    if (count === 6) return ["CML", "CML", "CM", "CM", "CMR", "CMR"]
    if (count === 7) return ["CML", "CML", "CM", "CM", "CM", "CMR", "CMR"]
    return ["CML", "CML", ...Array(count - 4).fill("CM"), "CMR", "CMR"]
  }
  if (sector === "fwd") {
    if (count === 1) return ["ST"]
    if (count === 2) return ["ST", "ST"]
    if (count === 3) return ["WL", "ST", "WR"]
    if (count === 4) return ["WL", "ST", "ST", "WR"]
    if (count === 5) return ["WL", "WL", "ST", "WR", "WR"]
    if (count === 6) return ["WL", "WL", "ST", "ST", "WR", "WR"]
    return ["WL", "WL", ...Array(count - 4).fill("ST"), "WR", "WR"]
  }
  return []
}

type SlotMeta = { sector: string; label: string; sectorIndex: number }

function buildSlotMeta(counts: typeof DEFAULT_COUNTS): SlotMeta[] {
  const result: SlotMeta[] = []
  const sectors: [string, string][] = [["gk", "GK"], ["def", "DEF"], ["mid", "MID"], ["fwd", "FWD"]]
  for (const [key, sectorLabel] of sectors) {
    const count = counts[key as keyof typeof counts]
    buildPositionLabels(key, count).forEach((label, i) =>
      result.push({ sector: sectorLabel, label, sectorIndex: i })
    )
  }
  return result
}

function getSlotKey(sector: string, sectorIndex: number) {
  return `${sector}_${sectorIndex}`
}

// ── Compact counter control (for overlay) ──────────────────────────────────
function CountRow({ label, value, min, max, color, onChange }: {
  label: string; value: number; min: number; max: number; color: string; onChange: (v: number) => void
}) {
  return (
    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg backdrop-blur-sm"
      style={{ background: "rgba(0,0,0,0.55)", border: `1px solid ${color}33` }}>
      <span className="text-xs font-bold uppercase tracking-wide" style={{ color }}>{label}</span>
      <button onClick={() => onChange(Math.max(min, value - 1))}
        className="w-5 h-5 rounded-full border border-white/20 flex items-center justify-center hover:border-white/50 transition-all text-white/70 hover:text-white">
        <Minus className="w-2.5 h-2.5" />
      </button>
      <span className="text-sm font-bold tabular-nums text-white w-4 text-center">{value}</span>
      <button onClick={() => onChange(Math.min(max, value + 1))}
        className="w-5 h-5 rounded-full border border-white/20 flex items-center justify-center hover:border-white/50 transition-all text-white/70 hover:text-white">
        <Plus className="w-2.5 h-2.5" />
      </button>
    </div>
  )
}

const SECTOR_COLORS: Record<string, string> = {
  FWD: "#FF2222", MID: "#0066FF", DEF: "#00D66C", GK: "#000000"
}

const SECTOR_POSITIONS: Record<string, string[]> = {
  GK:  ["GK"],
  DEF: ["LB", "CB", "LCB", "RCB", "CBL", "CBR", "SW", "RB", "LWB", "RWB"],
  MID: ["DM", "CDM", "LDM", "RDM", "CM", "LCM", "RCM", "CML", "CMR", "AM", "CAM", "LAM", "RAM", "LM", "RM"],
  FWD: ["LW", "RW", "WL", "WR", "WF", "IF", "F9", "CF", "ST", "SS"],
}

export function SquadPlanTab() {
  const [jogadores, setJogadores] = useState<Jogador[]>([])
  const [counts, setCounts] = useState(DEFAULT_COUNTS)
  const [assignments, setAssignments] = useState<Record<string, string | undefined>>({})
  const [slotPositions, setSlotPositions] = useState<Record<string, string>>({})
  const [selectOpen, setSelectOpen] = useState(false)
  const [selectingKey, setSelectingKey] = useState<string | null>(null)
  const fieldRef = useRef<HTMLDivElement>(null)
  const bgCanvasRef = useRef<HTMLCanvasElement>(null)
  const [fieldSize, setFieldSize] = useState({ w: 0, h: 0 })

  // Medir dimensões reais do container
  useEffect(() => {
    const el = fieldRef.current
    if (!el) return
    const ro = new ResizeObserver(() => setFieldSize({ w: el.clientWidth, h: el.clientHeight }))
    ro.observe(el)
    setFieldSize({ w: el.clientWidth, h: el.clientHeight })
    return () => ro.disconnect()
  }, [])

  // Desenhar /23.png rodada -90deg no canvas — landscape completo sem corte
  useEffect(() => {
    const canvas = bgCanvasRef.current
    if (!canvas || fieldSize.w <= 0 || fieldSize.h <= 0) return
    const CW = fieldSize.w
    const CH = fieldSize.h
    canvas.width = CW
    canvas.height = CH
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    const img = new Image()
    img.onload = () => {
      ctx.clearRect(0, 0, CW, CH)
      ctx.save()
      ctx.translate(CW / 2, CH / 2)
      ctx.rotate(-Math.PI / 2)
      // Após -90deg: draw (img natural portrait) escalada para preencher canvas landscape
      ctx.drawImage(img, -CH / 2, -CW / 2, CH, CW)
      ctx.restore()
    }
    img.src = "/23.png"
  }, [fieldSize])

  useEffect(() => {
    setJogadores(getJogadores())
    const plan = getSquadPlan()
    setCounts(plan.counts ?? DEFAULT_COUNTS)
    setSlotPositions(plan.slotPositions ?? {})
    const map: Record<string, string | undefined> = {}
    plan.slots.forEach(s => { map[`${s.posicao}_${s.slot}`] = s.jogadorId })
    setAssignments(map)
  }, [])

  function persist(
    newAssignments: Record<string, string | undefined>,
    newCounts: typeof counts,
    newSlotPositions: Record<string, string>
  ) {
    const slots: SquadPlanSlot[] = Object.entries(newAssignments)
      .filter(([, v]) => !!v)
      .map(([key, jogadorId]) => {
        const [posicao, slotStr] = key.split("_")
        return { posicao, slot: Number(slotStr), jogadorId }
      })
    saveSquadPlan({ formacao: "custom", slots, counts: newCounts, slotPositions: newSlotPositions })
  }

  function updateCounts(field: keyof typeof counts, value: number) {
    const nc = { ...counts, [field]: value }
    setCounts(nc)
    // Clear cached slot positions for this sector so new defaults show correctly
    const sectorKey = field === "gk" ? "GK" : field === "def" ? "DEF" : field === "mid" ? "MID" : "FWD"
    const newSlotPositions = Object.fromEntries(
      Object.entries(slotPositions).filter(([k]) => !k.startsWith(sectorKey + "_"))
    )
    setSlotPositions(newSlotPositions)
    persist(assignments, nc, newSlotPositions)
  }

  function openSlotSelect(key: string) { setSelectingKey(key); setSelectOpen(true) }

  function assignPlayer(jogadorId: string | undefined) {
    if (!selectingKey) return
    const updated = { ...assignments, [selectingKey]: jogadorId }
    setAssignments(updated)

    // Auto-fill position from player's natural position in Squad; clear when slot emptied
    let newSlotPositions = slotPositions
    if (jogadorId) {
      const jogador = jogadores.find(j => j.id === jogadorId)
      if (jogador?.posicoes[0]) {
        newSlotPositions = { ...slotPositions, [selectingKey]: jogador.posicoes[0] }
        setSlotPositions(newSlotPositions)
      }
    } else {
      // Remove position override so the slot reverts to default label
      const { [selectingKey]: _, ...rest } = slotPositions
      newSlotPositions = rest
      setSlotPositions(newSlotPositions)
    }

    persist(updated, counts, newSlotPositions)
    setSelectOpen(false)
    setSelectingKey(null)
  }

  function updateSlotPosition(key: string, pos: string) {
    const newSlotPositions = { ...slotPositions, [key]: pos }
    setSlotPositions(newSlotPositions)
    persist(assignments, counts, newSlotPositions)
  }

  function getSlotPosition(key: string, slot: SlotMeta, jogador: Jogador | null | undefined): string {
    if (slotPositions[key]) return slotPositions[key]
    if (jogador?.posicoes[0]) return jogador.posicoes[0]
    return slot.label
  }

  // ── Action buttons ───────────────────────────────────────────────────────
  function resetJogadores() {
    setAssignments({})
    persist({}, counts, slotPositions)
  }

  function autoPreencherPlantel() {
    const slots = buildSlotMeta(counts)
    const newAssignments = { ...assignments }
    const usedIds = new Set(Object.values(newAssignments).filter(Boolean) as string[])
    for (const slot of slots) {
      const key = getSlotKey(slot.sector, slot.sectorIndex)
      if (newAssignments[key]) continue
      const expectedPos = slotPositions[key] ?? slot.label
      const match = jogadores.find(j => !usedIds.has(j.id) && (j.posicoes as string[]).includes(expectedPos))
      if (match) {
        newAssignments[key] = match.id
        usedIds.add(match.id)
      }
    }
    setAssignments(newAssignments)
    persist(newAssignments, counts, slotPositions)
  }

  function limparTudo() {
    setAssignments({})
    setCounts(DEFAULT_COUNTS)
    setSlotPositions({})
    persist({}, DEFAULT_COUNTS, {})
  }

  // ── Export PNG ───────────────────────────────────────────────────────────
  function exportPNG() {
    // Canvas portrait — proporção natural do /23.png (510:780)
    const W = 2040
    const H = Math.round(W * 780 / 510)  // = 3107
    const canvas = document.createElement("canvas")
    canvas.width = W
    canvas.height = H
    const ctxOrNull = canvas.getContext("2d")
    if (!ctxOrNull) return
    const ctx = ctxOrNull
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = "high"

    const bgImg = new Image()
    bgImg.crossOrigin = "anonymous"
    bgImg.onload = () => {
      // Desenhar /23.png directamente (portrait, sem rotação)
      ctx.drawImage(bgImg, 0, 0, W, H)
      ctx.fillStyle = "rgba(5,18,10,0.22)"
      ctx.fillRect(0, 0, W, H)

      const allSlots = buildSlotMeta(counts)
      const DISPLAY_ORDER = ["FWD", "MID", "DEF", "GK"]
      const sectorSlots: Record<string, SlotMeta[]> = { FWD: [], MID: [], DEF: [], GK: [] }
      allSlots.forEach(s => sectorSlots[s.sector]?.push(s))

      // Setores em linhas: Y percentages (FWD topo → GK fundo)
      const ROW_PERCENTS = [22, 43, 63, 84]
      const CIRCLE_R = 36, GAP = 12, CARD_W = CIRCLE_R * 2 + 20

      function drawText(text: string, x: number, y: number, font: string, color: string, shadowColor = "rgba(0,0,0,0.9)") {
        ctx.font = font
        ctx.fillStyle = shadowColor
        ctx.textAlign = "center"
        ctx.fillText(text, x + 2, y + 2)
        ctx.fillStyle = color
        ctx.fillText(text, x, y)
      }

      const pending: Promise<void>[] = []

      DISPLAY_ORDER.forEach((sector, rowIdx) => {
        const slots = sectorSlots[sector]
        const y = ROW_PERCENTS[rowIdx] / 100 * H
        const totalW = slots.length * (CARD_W + GAP)
        const startX = (W - totalW) / 2 + CARD_W / 2
        const color = SECTOR_COLORS[sector] ?? "#fff"

        slots.forEach((slot, colIdx) => {
          const x = startX + colIdx * (CARD_W + GAP)
          const key = getSlotKey(slot.sector, slot.sectorIndex)
          const jogadorId = assignments[key]
          const jogador = jogadorId ? jogadores.find(j => j.id === jogadorId) : null

          const posLabel = slotPositions[key] ?? (jogador?.posicoes[0] ?? slot.label)
          const pillY = y - CIRCLE_R - 18
          const pillW = 80
          ctx.beginPath()
          ctx.roundRect(x - pillW / 2, pillY - 20, pillW, 26, 13)
          ctx.fillStyle = color + "dd"
          ctx.fill()
          ctx.font = "bold 14px Arial"
          ctx.fillStyle = "#fff"
          ctx.textAlign = "center"
          ctx.textBaseline = "middle"
          ctx.fillText(posLabel, x, pillY - 7)
          ctx.textBaseline = "alphabetic"

          if (jogador) {
            ctx.beginPath()
            ctx.arc(x, y, CIRCLE_R, 0, Math.PI * 2)
            ctx.fillStyle = "rgba(0,0,0,0.75)"
            ctx.fill()
            ctx.strokeStyle = color
            ctx.lineWidth = 4
            ctx.stroke()

            if (jogador.foto) {
              const p = new Promise<void>(resolve => {
                const photoImg = new Image()
                photoImg.onload = () => {
                  ctx.save()
                  ctx.beginPath()
                  ctx.arc(x, y, CIRCLE_R - 3, 0, Math.PI * 2)
                  ctx.clip()
                  const r = CIRCLE_R - 3
                  ctx.drawImage(photoImg, x - r, y - r, r * 2, r * 2)
                  ctx.restore()
                  resolve()
                }
                photoImg.onerror = () => resolve()
                photoImg.src = jogador.foto!
              })
              pending.push(p)
            } else {
              drawText(String(jogador.numero), x, y + 14, "bold 40px Arial", "#fff")
            }

            const lastName = displayName(jogador)
            ctx.font = "bold 18px Arial"
            const nameW = ctx.measureText(lastName).width + 24
            ctx.beginPath()
            ctx.roundRect(x - nameW / 2, y + CIRCLE_R + 4, nameW, 28, 14)
            ctx.fillStyle = "rgba(0,0,0,0.65)"
            ctx.fill()
            drawText(lastName, x, y + CIRCLE_R + 23, "bold 18px Arial", "#fff")
          }
        })
      })

      Promise.all(pending).then(() => {
        DISPLAY_ORDER.forEach((sector, rowIdx) => {
          const slots = sectorSlots[sector]
          const y = ROW_PERCENTS[rowIdx] / 100 * H
          const totalW = slots.length * (CARD_W + GAP)
          const startX = (W - totalW) / 2 + CARD_W / 2

          slots.forEach((slot, colIdx) => {
            const x = startX + colIdx * (CARD_W + GAP)
            const key = getSlotKey(slot.sector, slot.sectorIndex)
            const jogadorId = assignments[key]
            const jogador = jogadorId ? jogadores.find(j => j.id === jogadorId) : null
            if (!jogador) return
            const lastName = displayName(jogador)
            ctx.font = "bold 18px Arial"
            const nameW = ctx.measureText(lastName).width + 24
            ctx.beginPath()
            ctx.roundRect(x - nameW / 2, y + CIRCLE_R + 4, nameW, 28, 14)
            ctx.fillStyle = "rgba(0,0,0,0.65)"
            ctx.fill()
            ctx.fillStyle = "#ffffff"
            ctx.textAlign = "center"
            ctx.fillText(lastName, x, y + CIRCLE_R + 23)
          })
        })

        const link = document.createElement("a")
        link.download = "team-plan.png"
        link.href = canvas.toDataURL("image/png", 1.0)
        link.click()
      })
    }
    bgImg.src = "/23.png"
  }

  // ── Slot layout ──────────────────────────────────────────────────────────
  const allSlots = buildSlotMeta(counts)
  const sectors = ["FWD", "MID", "DEF", "GK"].map(key => ({
    key, color: SECTOR_COLORS[key],
    slots: allSlots.filter(s => s.sector === key),
  }))

  return (
    <div className="space-y-3">
      {/* ── Action toolbar ── */}
      <div className="flex items-center gap-2 flex-wrap px-1">
        <button
          onClick={autoPreencherPlantel}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all hover:opacity-90 active:scale-95"
          style={{ background: "#00D66C", color: "#000", boxShadow: "0 0 12px rgba(0,214,108,0.4)" }}
        >
          <Zap className="w-3.5 h-3.5" /> Auto Preencher
        </button>
        <button
          onClick={resetJogadores}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all hover:opacity-90 active:scale-95"
          style={{ background: "#FF4444", color: "#fff", boxShadow: "0 0 12px rgba(255,68,68,0.35)" }}
        >
          <UserX className="w-3.5 h-3.5" /> Reset Jogadores
        </button>
        <button
          onClick={limparTudo}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all hover:opacity-90 active:scale-95"
          style={{ background: "#FF6B35", color: "#fff", boxShadow: "0 0 12px rgba(255,107,53,0.35)" }}
        >
          <RotateCcw className="w-3.5 h-3.5" /> Limpar Tudo
        </button>
        {/* Counters inline */}
        <div className="flex-1 flex items-center justify-center gap-1">
          <CountRow label="GK"  value={counts.gk}  min={1} max={5}  color="#8B5CF6" onChange={v => updateCounts("gk",  v)} />
          <CountRow label="DEF" value={counts.def} min={1} max={10} color="#00D66C" onChange={v => updateCounts("def", v)} />
          <CountRow label="MID" value={counts.mid} min={1} max={10} color="#0066FF" onChange={v => updateCounts("mid", v)} />
          <CountRow label="FWD" value={counts.fwd} min={1} max={10} color="#FF6B35" onChange={v => updateCounts("fwd", v)} />
        </div>
        <button
          onClick={exportPNG}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all hover:opacity-90 active:scale-95"
          style={{ background: "rgba(255,255,255,0.08)", color: "#fff", border: "1px solid rgba(255,255,255,0.15)" }}
        >
          <Camera className="w-3.5 h-3.5" /> Exportar PNG
        </button>
      </div>

      {/* Campo — /23.png rodada via canvas (landscape, sem corte) */}
      <div className="px-1 mt-2">
      <div
        ref={fieldRef}
        className="relative rounded-2xl overflow-hidden w-full"
        style={{ aspectRatio: "780 / 510" }}
      >
        <canvas ref={bgCanvasRef} className="absolute inset-0 w-full h-full" style={{ pointerEvents: "none" }} />
        <div className="absolute inset-0" style={{ background: "rgba(5,18,10,0.18)" }} />

        {/* Setores em colunas: FWD esq → GK dir */}
        <div className="absolute inset-0 z-10">
          {sectors.map((sector, i) => (
            <div key={sector.key}
              className="absolute top-0 bottom-0 flex flex-col items-center justify-center gap-0.5"
              style={{ left: `${[15, 38, 62, 84][i]}%`, transform: "translateX(-50%)" }}>
              {sector.slots.map(slot => {
                const key = getSlotKey(slot.sector, slot.sectorIndex)
                const jogador = assignments[key] ? jogadores.find(j => j.id === assignments[key]) : null
                const currentPos = getSlotPosition(key, slot, jogador)
                return (
                  <div key={key} className="flex flex-col items-center gap-0.5" style={{ width: 44 }}>
                    <div onClick={e => e.stopPropagation()}>
                      <select
                        value={currentPos}
                        onChange={e => updateSlotPosition(key, e.target.value)}
                        className="text-[10px] font-bold uppercase px-1 py-0 rounded-full cursor-pointer appearance-none text-center"
                        style={{ color: "#fff", background: sector.color + "cc", textShadow: "0 1px 2px rgba(0,0,0,0.8)", border: "none", outline: "none", maxWidth: 44 }}
                      >
                        {SECTOR_POSITIONS[sector.key]?.map(p => (
                          <option key={p} value={p} style={{ background: "#111", color: "#fff" }}>{p}</option>
                        ))}
                      </select>
                    </div>
                    <button
                      onClick={() => openSlotSelect(key)}
                      style={{ width: 40, height: 40, ...(jogador ? { borderColor: sector.color } : {}) }}
                      className={`rounded-full overflow-hidden flex-shrink-0 border-2 transition-all hover:opacity-80 ${jogador ? "" : "border-dashed border-white/20"}`}
                    >
                      {jogador ? (
                        jogador.foto
                          // eslint-disable-next-line @next/next/no-img-element
                          ? <img src={jogador.foto} alt={jogador.nome} className="w-full h-full object-cover" />
                          : <div className="w-full h-full bg-black/75 flex items-center justify-center text-sm font-bold text-white">{jogador.numero}</div>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center"><span className="text-white/20 text-sm">+</span></div>
                      )}
                    </button>
                    <div className="text-[10px] font-bold text-white truncate w-full text-center leading-tight"
                      style={{ textShadow: "0 1px 3px rgba(0,0,0,0.9)" }}>
                      {jogador ? displayName(jogador) : <span className="text-white/20">—</span>}
                    </div>
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>
      </div>

      {/* Player selection dialog */}
      <Dialog open={selectOpen} onOpenChange={open => { if (!open) { setSelectOpen(false); setSelectingKey(null) } }}>
        <DialogContent className="max-w-sm max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Select Player</DialogTitle>
          </DialogHeader>
          <div className="space-y-1 py-2">
            <button className="w-full flex items-center gap-3 px-3 py-2 rounded hover:bg-muted/60 text-sm text-muted-foreground"
              onClick={() => assignPlayer(undefined)}>
              Clear slot
            </button>
            {jogadores.map(j => (
              <button key={j.id}
                className="w-full flex items-center gap-3 px-3 py-2 rounded hover:bg-muted/60 transition-colors"
                onClick={() => assignPlayer(j.id)}>
                {j.foto ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={j.foto} alt={j.nome} className="w-8 h-8 rounded-full object-cover border border-border" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold">{j.numero}</div>
                )}
                <div className="text-left flex-1">
                  <div className="text-sm font-medium">{displayName(j)}</div>
                  <div className="text-xs text-muted-foreground">{j.posicoes.join(", ")}</div>
                </div>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
