"use client"

import { useState, useEffect, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Minus, Plus, Camera, UserX, Zap } from "lucide-react"
import { type Jogador, getJogadores, getSquadPlan, saveSquadPlan, type SquadPlanSlot, displayName } from "@/lib/storage/plantel"

// ── Fixed position coordinates on landscape field (% x, % y) ───────────────
// Left = attack (FWD), Right = defense (GK)
const POSITION_COORDS: Record<string, { x: number; y: number }> = {
  GK:  { x: 97, y: 50 },
  SW:  { x: 87, y: 50 },
  CB:  { x: 78, y: 50 },
  CBR: { x: 78, y: 28 },
  CBL: { x: 78, y: 72 },
  RB:  { x: 68, y: 13 },
  RWB: { x: 60, y: 13 },
  LB:  { x: 68, y: 87 },
  LWB: { x: 60, y: 87 },
  DM:  { x: 66, y: 50 },
  CM:  { x: 50, y: 50 },
  CMR: { x: 40, y: 28 },
  CML: { x: 40, y: 72 },
  CAM: { x: 30, y: 50 },
  RM:  { x: 31, y: 17 },
  LM:  { x: 31, y: 83 },
  ST:  { x:  3, y: 50 },
  CF:  { x: 10, y: 50 },
  SS:  { x: 17, y: 50 },
  WR:  { x: 20, y: 16 },
  WL:  { x: 20, y: 84 },
}

const SECTOR_OF: Record<string, string> = {
  GK: "GK",
  SW: "DEF", RB: "DEF", RWB: "DEF", CBR: "DEF", CB: "DEF", CBL: "DEF", LB: "DEF", LWB: "DEF",
  DM: "MID", CM: "MID", CMR: "MID", CML: "MID", CAM: "MID", RM: "MID", LM: "MID",
  ST: "FWD", CF: "FWD", SS: "FWD", WR: "FWD", WL: "FWD",
}

const SECTOR_COLORS: Record<string, string> = {
  GK: "#ffffff", DEF: "#00D66C", MID: "#0066FF", FWD: "#FF2222",
}

const MENU_GROUPS = [
  { sector: "GK",  color: "#ffffff", positions: ["GK"] },
  { sector: "DEF", color: "#00D66C", positions: ["RB", "RWB", "CBR", "CB", "CBL", "LB", "LWB", "SW"] },
  { sector: "MID", color: "#0066FF", positions: ["DM", "CM", "CMR", "CML", "CAM", "RM", "LM"] },
  { sector: "FWD", color: "#FF2222", positions: ["ST", "CF", "SS", "WR", "WL"] },
]

const DEFAULT_POSITION_COUNTS: Record<string, number> = {
  GK: 1, CB: 2, RB: 1, LB: 1, CM: 2, CAM: 1, ST: 1,
}

const FIELD_H = "calc(100vh - 230px)"

export function SquadPlanTab() {
  const [jogadores, setJogadores] = useState<Jogador[]>([])
  const [positionCounts, setPositionCounts] = useState<Record<string, number>>(DEFAULT_POSITION_COUNTS)
  const [assignments, setAssignments] = useState<Record<string, string | undefined>>({})
  const [selectOpen, setSelectOpen] = useState(false)
  const [selectingKey, setSelectingKey] = useState<string | null>(null)
  const fieldRef = useRef<HTMLDivElement>(null)
  const bgCanvasRef = useRef<HTMLCanvasElement>(null)
  const [fieldSize, setFieldSize] = useState({ w: 0, h: 0 })

  useEffect(() => {
    const el = fieldRef.current
    if (!el) return
    const ro = new ResizeObserver(() => setFieldSize({ w: el.clientWidth, h: el.clientHeight }))
    ro.observe(el)
    setFieldSize({ w: el.clientWidth, h: el.clientHeight })
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    const canvas = bgCanvasRef.current
    if (!canvas || fieldSize.w <= 0 || fieldSize.h <= 0) return
    const CW = fieldSize.w, CH = fieldSize.h
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
      ctx.drawImage(img, -CH / 2, -CW / 2, CH, CW)
      ctx.restore()
    }
    img.src = "/23.png"
  }, [fieldSize])

  useEffect(() => {
    setJogadores(getJogadores())
    const plan = getSquadPlan()
    try {
      const stored = localStorage.getItem("coachlab_position_counts")
      if (stored) setPositionCounts(JSON.parse(stored) as Record<string, number>)
    } catch { /* ignore */ }
    const map: Record<string, string | undefined> = {}
    plan.slots.forEach(s => { map[`${s.posicao}_${s.slot}`] = s.jogadorId })
    setAssignments(map)
  }, [])

  function persist(newAssignments: Record<string, string | undefined>, newCounts: Record<string, number>) {
    const slots: SquadPlanSlot[] = Object.entries(newAssignments)
      .filter(([, v]) => !!v)
      .map(([key, jogadorId]) => {
        const parts = key.split("_")
        const slot = Number(parts.pop())
        const posicao = parts.join("_")
        return { posicao, slot, jogadorId }
      })
    saveSquadPlan({ formacao: "custom", slots })
    localStorage.setItem("coachlab_position_counts", JSON.stringify(newCounts))
  }

  function updatePositionCount(pos: string, delta: number) {
    const current = positionCounts[pos] ?? 0
    const next = Math.max(0, Math.min(5, current + delta))
    const newCounts = { ...positionCounts, [pos]: next }
    const newAssignments = { ...assignments }
    if (next < current) {
      for (let i = next; i < current; i++) delete newAssignments[`${pos}_${i}`]
    }
    setPositionCounts(newCounts)
    setAssignments(newAssignments)
    persist(newAssignments, newCounts)
  }

  function openSlotSelect(key: string) { setSelectingKey(key); setSelectOpen(true) }

  function assignPlayer(jogadorId: string | undefined) {
    if (!selectingKey) return
    const updated = { ...assignments, [selectingKey]: jogadorId }
    setAssignments(updated)
    persist(updated, positionCounts)
    setSelectOpen(false)
    setSelectingKey(null)
  }

  function resetJogadores() {
    const empty: Record<string, string | undefined> = {}
    setAssignments(empty)
    persist(empty, positionCounts)
  }

  function autoPreencherPlantel() {
    const newAssignments = { ...assignments }
    const usedIds = new Set(Object.values(newAssignments).filter(Boolean) as string[])
    for (const [pos, count] of Object.entries(positionCounts)) {
      for (let i = 0; i < count; i++) {
        const key = `${pos}_${i}`
        if (newAssignments[key]) continue
        const match = jogadores.find(j => !usedIds.has(j.id) && (j.posicoes as string[]).includes(pos))
        if (match) { newAssignments[key] = match.id; usedIds.add(match.id) }
      }
    }
    setAssignments(newAssignments)
    persist(newAssignments, positionCounts)
  }

  // ── Export PNG ────────────────────────────────────────────────────────────
  function exportPNG() {
    const W = 3120, H = 2040  // landscape 780×510 × 4
    const canvas = document.createElement("canvas")
    canvas.width = W; canvas.height = H
    const ctxOrNull = canvas.getContext("2d")
    if (!ctxOrNull) return
    const ctx = ctxOrNull
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = "high"
    const bgImg = new Image()
    bgImg.crossOrigin = "anonymous"
    bgImg.onload = () => {
      ctx.save()
      ctx.translate(W / 2, H / 2)
      ctx.rotate(-Math.PI / 2)
      ctx.drawImage(bgImg, -H / 2, -W / 2, H, W)
      ctx.restore()
      ctx.fillStyle = "rgba(5,18,10,0.22)"
      ctx.fillRect(0, 0, W, H)

      const CIRCLE_R = 44
      const pending: Promise<void>[] = []

      for (const [pos, count] of Object.entries(positionCounts)) {
        const coords = POSITION_COORDS[pos]
        if (!coords || count === 0) continue
        const color = SECTOR_COLORS[SECTOR_OF[pos] ?? "GK"] ?? "#fff"

        for (let i = 0; i < count; i++) {
          let px = coords.x, py: number
          if (pos === "WR") {
            py = 16 - (count - 1 - i) * 5
          } else if (pos === "WL") {
            py = 84 + (count - 1 - i) * 5
          } else if (["CB","CBR","CBL"].includes(pos)) {
            px = coords.x + (i - (count - 1) / 2) * 5
            py = getBaseY(pos)
          } else {
            py = getBaseY(pos) + (i - (count - 1) / 2) * 9
          }
          const cx = px / 100 * W
          const cy = py / 100 * H
          const key = `${pos}_${i}`
          const jogador = assignments[key] ? jogadores.find(j => j.id === assignments[key]) : null

          // Position pill
          const pillW = 90
          ctx.beginPath()
          ctx.roundRect(cx - pillW / 2, cy - CIRCLE_R - 28, pillW, 26, 13)
          ctx.fillStyle = color + "dd"
          ctx.fill()
          ctx.font = "bold 18px Arial"
          ctx.fillStyle = "#fff"
          ctx.textAlign = "center"
          ctx.textBaseline = "middle"
          ctx.fillText(pos, cx, cy - CIRCLE_R - 15)
          ctx.textBaseline = "alphabetic"

          // Circle
          ctx.beginPath()
          ctx.arc(cx, cy, CIRCLE_R, 0, Math.PI * 2)
          ctx.fillStyle = "rgba(0,0,0,0.75)"
          ctx.fill()
          ctx.strokeStyle = color
          ctx.lineWidth = 5
          ctx.stroke()

          if (jogador?.foto) {
            const p = new Promise<void>(resolve => {
              const photoImg = new Image()
              photoImg.onload = () => {
                ctx.save()
                ctx.beginPath()
                ctx.arc(cx, cy, CIRCLE_R - 3, 0, Math.PI * 2)
                ctx.clip()
                const r = CIRCLE_R - 3
                ctx.drawImage(photoImg, cx - r, cy - r, r * 2, r * 2)
                ctx.restore()
                resolve()
              }
              photoImg.onerror = () => resolve()
              photoImg.src = jogador.foto!
            })
            pending.push(p)
          } else if (jogador) {
            ctx.font = "bold 48px Arial"
            ctx.fillStyle = "#fff"
            ctx.textAlign = "center"
            ctx.fillText(String(jogador.numero), cx, cy + 17)
          }

          if (jogador) {
            const name = displayName(jogador)
            ctx.font = "bold 18px Arial"
            const nw = ctx.measureText(name).width + 24
            ctx.beginPath()
            ctx.roundRect(cx - nw / 2, cy + CIRCLE_R + 4, nw, 28, 14)
            ctx.fillStyle = "rgba(0,0,0,0.65)"
            ctx.fill()
            ctx.fillStyle = "#fff"
            ctx.textAlign = "center"
            ctx.fillText(name, cx, cy + CIRCLE_R + 22)
          }
        }
      }

      Promise.all(pending).then(() => {
        // Re-draw names on top of photos
        for (const [pos, count] of Object.entries(positionCounts)) {
          const coords = POSITION_COORDS[pos]
          if (!coords || count === 0) continue
          for (let i = 0; i < count; i++) {
            let px2 = coords.x, py2: number
            if (pos === "WR") {
              py2 = 16 - (count - 1 - i) * 5
            } else if (pos === "WL") {
              py2 = 84 + (count - 1 - i) * 5
            } else if (["CB","CBR","CBL"].includes(pos)) {
              px2 = coords.x + (i - (count - 1) / 2) * 5
              py2 = getBaseY(pos)
            } else {
              py2 = getBaseY(pos) + (i - (count - 1) / 2) * 9
            }
            const cx = px2 / 100 * W
            const cy = py2 / 100 * H
            const key = `${pos}_${i}`
            const jogador = assignments[key] ? jogadores.find(j => j.id === assignments[key]) : null
            if (!jogador) continue
            const name = displayName(jogador)
            ctx.font = "bold 18px Arial"
            const nw = ctx.measureText(name).width + 24
            ctx.beginPath()
            ctx.roundRect(cx - nw / 2, cy + CIRCLE_R + 4, nw, 28, 14)
            ctx.fillStyle = "rgba(0,0,0,0.65)"
            ctx.fill()
            ctx.fillStyle = "#fff"
            ctx.textAlign = "center"
            ctx.fillText(name, cx, cy + CIRCLE_R + 22)
          }
        }
        const link = document.createElement("a")
        link.download = "team-plan.png"
        link.href = canvas.toDataURL("image/png", 1.0)
        link.click()
      })
    }
    bgImg.src = "/23.png"
  }

  // CBR/CBL deslocam para o centro quando não há CB
  function getBaseY(pos: string): number {
    if (pos === "CBR" && (positionCounts["CB"] ?? 0) === 0) return 38
    if (pos === "CBL" && (positionCounts["CB"] ?? 0) === 0) return 62
    return POSITION_COORDS[pos]?.y ?? 50
  }

  // ── Active pins ───────────────────────────────────────────────────────────
  const CB_LINE = ["CB", "CBR", "CBL"]
  const activePins = Object.entries(positionCounts).flatMap(([pos, count]) => {
    const coords = POSITION_COORDS[pos]
    if (!coords || count === 0) return []
    if (pos === "WR") {
      return Array.from({ length: count }, (_, i) => ({
        key: `WR_${i}`, pos, x: coords.x,
        y: 16 - (count - 1 - i) * 5,
      }))
    }
    if (pos === "WL") {
      return Array.from({ length: count }, (_, i) => ({
        key: `WL_${i}`, pos, x: coords.x,
        y: 84 + (count - 1 - i) * 5,
      }))
    }
    if (CB_LINE.includes(pos)) {
      const baseY = getBaseY(pos)
      return Array.from({ length: count }, (_, i) => ({
        key: `${pos}_${i}`, pos,
        x: coords.x + (i - (count - 1) / 2) * 5,
        y: baseY,
      }))
    }
    return Array.from({ length: count }, (_, i) => ({
      key: `${pos}_${i}`,
      pos,
      x: coords.x,
      y: getBaseY(pos) + (i - (count - 1) / 2) * 9,
    }))
  })

  return (
    <div className="flex flex-col gap-2">
      {/* ── Toolbar ── */}
      <div className="relative flex items-center justify-center gap-2 px-1 shrink-0">
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
          onClick={exportPNG}
          className="absolute right-1 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all hover:opacity-90 active:scale-95"
          style={{ background: "rgba(255,255,255,0.08)", color: "#fff", border: "1px solid rgba(255,255,255,0.15)" }}
        >
          <Camera className="w-3.5 h-3.5" /> Exportar PNG
        </button>
      </div>

      {/* ── Field + Sidebar ── */}
      <div className="flex gap-2 px-2 items-start">

        {/* ── Position Sidebar ── */}
        <div
          className="w-40 shrink-0 rounded-2xl overflow-hidden"
          style={{
            height: FIELD_H,
            background: "linear-gradient(180deg, rgba(5,18,10,0.95) 0%, rgba(3,12,7,0.98) 100%)",
            border: "1px solid rgba(0,214,108,0.18)",
            backdropFilter: "blur(16px)",
            boxShadow: "0 0 24px rgba(0,214,108,0.06), inset 0 1px 0 rgba(255,255,255,0.04)",
          }}
        >
          {MENU_GROUPS.map(group => (
            <div key={group.sector}>
              {/* Group header */}
              <div
                className="flex items-center gap-2 px-3 py-1.5 sticky top-0 z-10"
                style={{
                  background: `linear-gradient(90deg, ${group.color}18 0%, transparent 100%)`,
                  borderBottom: `1px solid ${group.color}25`,
                  borderTop: "1px solid rgba(255,255,255,0.03)",
                }}
              >
                <div
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ background: group.color, boxShadow: `0 0 8px ${group.color}cc` }}
                />
                <span
                  className="text-[11px] font-black uppercase tracking-[0.15em]"
                  style={{ color: group.color, textShadow: `0 0 12px ${group.color}66` }}
                >
                  {group.sector}
                </span>
              </div>

              {/* Position rows */}
              {group.positions.map(pos => {
                const count = positionCounts[pos] ?? 0
                const active = count > 0
                return (
                  <div
                    key={pos}
                    className="flex items-center gap-1 px-2.5 py-[3px] transition-all duration-150"
                    style={{
                      opacity: active ? 1 : 0.4,
                      background: active ? `${group.color}08` : "transparent",
                    }}
                  >
                    <div
                      className="w-1.5 h-1.5 rounded-full shrink-0 transition-all"
                      style={{
                        background: active ? group.color : "transparent",
                        border: `1px solid ${active ? group.color : group.color + "44"}`,
                        boxShadow: active ? `0 0 5px ${group.color}88` : "none",
                      }}
                    />
                    <span
                      className="text-[11px] font-bold uppercase flex-1 tracking-wide leading-none"
                      style={{ color: active ? "#fff" : "#777" }}
                    >
                      {pos}
                    </span>
                    <button
                      onClick={() => updatePositionCount(pos, -1)}
                      className="w-[18px] h-[18px] rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95"
                      style={{
                        background: "rgba(255,255,255,0.06)",
                        border: "1px solid rgba(255,255,255,0.12)",
                      }}
                    >
                      <Minus className="w-2 h-2 text-white/60" />
                    </button>
                    <span
                      className="text-[11px] font-black tabular-nums w-4 text-center"
                      style={{ color: active ? group.color : "#444" }}
                    >
                      {count}
                    </span>
                    <button
                      onClick={() => updatePositionCount(pos, 1)}
                      className="w-[18px] h-[18px] rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95"
                      style={{
                        background: active ? `${group.color}22` : "rgba(255,255,255,0.06)",
                        border: `1px solid ${active ? group.color + "55" : "rgba(255,255,255,0.12)"}`,
                        boxShadow: active ? `0 0 6px ${group.color}44` : "none",
                      }}
                    >
                      <Plus className="w-2 h-2" style={{ color: active ? group.color : "#555" }} />
                    </button>
                  </div>
                )
              })}
            </div>
          ))}
        </div>

        {/* ── Field canvas ── */}
        <div
          ref={fieldRef}
          className="relative rounded-2xl overflow-hidden shrink-0"
          style={{ height: FIELD_H, width: "auto", aspectRatio: "780 / 510", maxWidth: "calc(100% - 168px)" }}
        >
          <canvas ref={bgCanvasRef} className="absolute inset-0 w-full h-full" style={{ pointerEvents: "none" }} />
          <div className="absolute inset-0" style={{ background: "rgba(5,18,10,0.18)" }} />

          {/* Player pins */}
          {activePins.map(pin => {
            const jogador = assignments[pin.key] ? jogadores.find(j => j.id === assignments[pin.key]) : null
            const color = SECTOR_COLORS[SECTOR_OF[pin.pos] ?? "GK"] ?? "#fff"
            const borderColor = pin.pos === "GK" ? "#000000" : color
            return (
              <div
                key={pin.key}
                className="absolute z-10 flex flex-col items-center cursor-pointer group select-none"
                style={{ left: `${pin.x}%`, top: `${pin.y}%`, transform: "translate(-50%, -50%)" }}
                onClick={() => openSlotSelect(pin.key)}
              >
                {/* Position badge */}
                <div
                  className="text-[8px] font-black uppercase px-1.5 py-[2px] rounded-full mb-0.5 leading-none"
                  style={{
                    background: color + "ee",
                    color: pin.pos === "GK" ? "#000" : "#fff",
                    textShadow: pin.pos === "GK" ? "none" : "0 1px 2px rgba(0,0,0,0.9)",
                    boxShadow: `0 0 6px ${color}55`,
                  }}
                >
                  {pin.pos}
                </div>
                {/* Avatar circle */}
                <div
                  className="rounded-full border-2 overflow-hidden transition-all duration-150 group-hover:scale-110"
                  style={{
                    width: 34, height: 34,
                    borderColor: borderColor,
                    boxShadow: `0 0 10px ${borderColor}55, 0 2px 8px rgba(0,0,0,0.6)`,
                    background: "rgba(0,0,0,0.8)",
                  }}
                >
                  {jogador ? (
                    jogador.foto
                      // eslint-disable-next-line @next/next/no-img-element
                      ? <img src={jogador.foto} alt={jogador.nome} className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center text-[11px] font-black text-white">{jogador.numero}</div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-white/25 text-lg leading-none">+</span>
                    </div>
                  )}
                </div>
                {/* Name */}
                {jogador && (
                  <div
                    className="text-[8px] font-bold text-white mt-0.5 max-w-[50px] truncate text-center leading-tight"
                    style={{ textShadow: "0 1px 4px rgba(0,0,0,1), 0 0 8px rgba(0,0,0,0.8)" }}
                  >
                    {displayName(jogador)}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Player selection dialog ── */}
      <Dialog open={selectOpen} onOpenChange={open => { if (!open) { setSelectOpen(false); setSelectingKey(null) } }}>
        <DialogContent className="max-w-sm max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Selecionar Jogador</DialogTitle>
          </DialogHeader>
          <div className="space-y-1 py-2">
            <button
              className="w-full flex items-center gap-3 px-3 py-2 rounded hover:bg-muted/60 text-sm text-muted-foreground"
              onClick={() => assignPlayer(undefined)}
            >
              Limpar slot
            </button>
            {jogadores.map(j => (
              <button
                key={j.id}
                className="w-full flex items-center gap-3 px-3 py-2 rounded hover:bg-muted/60 transition-colors"
                onClick={() => assignPlayer(j.id)}
              >
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
