"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Plus, Trash2, Download, ArrowRight } from "lucide-react"
import {
  type Jogador, type SetPieceEsquema, type SetPiecePin, type SetPieceArrow, type TipoSetPiece,
  getJogadores, getSetPieces, upsertSetPiece, deleteSetPiece,
} from "@/lib/storage/plantel"

const PIN_COLORS = ["#00D66C", "#0066FF", "#EF4444", "#FF6B35", "#8B5CF6", "#FFD700", "#FFFFFF"]
const PIN_RADIUS = 16

type DrawMode = "select" | "pin" | "arrow"

function drawField(ctx: CanvasRenderingContext2D, w: number, h: number) {
  // Grass
  ctx.fillStyle = "#2d7a3a"
  ctx.fillRect(0, 0, w, h)

  // Field lines
  ctx.strokeStyle = "rgba(255,255,255,0.7)"
  ctx.lineWidth = 2

  // Outer boundary
  const pad = 20
  ctx.strokeRect(pad, pad, w - pad * 2, h - pad * 2)

  // Half-field: we show only top half (attacking view)
  // Goal area at top
  const gw = (w - pad * 2) * 0.4
  const gx = pad + (w - pad * 2 - gw) / 2
  ctx.strokeRect(gx, pad, gw, h * 0.12)

  // Penalty area
  const pw = (w - pad * 2) * 0.65
  const px = pad + (w - pad * 2 - pw) / 2
  ctx.strokeRect(px, pad, pw, h * 0.22)

  // Penalty spot
  const psX = w / 2
  const psY = pad + h * 0.14
  ctx.beginPath()
  ctx.arc(psX, psY, 3, 0, Math.PI * 2)
  ctx.fillStyle = "rgba(255,255,255,0.7)"
  ctx.fill()

  // Center circle (partial at bottom)
  ctx.beginPath()
  ctx.arc(w / 2, h - pad, (h - pad * 2) * 0.22, Math.PI, 0)
  ctx.stroke()

  // Center line at bottom
  ctx.beginPath()
  ctx.moveTo(pad, h - pad)
  ctx.lineTo(w - pad, h - pad)
  ctx.stroke()

  // Corner arcs
  const ca = 12
  ;[
    [pad, pad, 0, Math.PI / 2],
    [w - pad, pad, Math.PI / 2, Math.PI],
  ].forEach(([cx, cy, sa, ea]) => {
    ctx.beginPath()
    ctx.arc(cx as number, cy as number, ca, sa as number, ea as number)
    ctx.stroke()
  })
}

function drawPins(ctx: CanvasRenderingContext2D, pins: SetPiecePin[], selected: string | null) {
  pins.forEach(pin => {
    ctx.beginPath()
    ctx.arc(pin.x, pin.y, PIN_RADIUS, 0, Math.PI * 2)
    ctx.fillStyle = pin.cor
    ctx.fill()
    if (selected === pin.id) {
      ctx.strokeStyle = "#FFFFFF"
      ctx.lineWidth = 2.5
      ctx.stroke()
    }
    ctx.fillStyle = "#000"
    ctx.font = "bold 11px sans-serif"
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.fillText(pin.label.slice(0, 2), pin.x, pin.y)
  })
}

function drawArrows(ctx: CanvasRenderingContext2D, arrows: SetPieceArrow[], selected: string | null, drawing?: { fromX: number; fromY: number; toX: number; toY: number } | null) {
  const allArrows = drawing ? [...arrows, { id: "__preview", fromX: drawing.fromX, fromY: drawing.fromY, toX: drawing.toX, toY: drawing.toY, dashed: true }] : arrows

  allArrows.forEach(arr => {
    const isSelected = selected === arr.id
    ctx.beginPath()
    if (arr.dashed) {
      ctx.setLineDash([6, 4])
    } else {
      ctx.setLineDash([])
    }
    ctx.strokeStyle = isSelected ? "#FFD700" : "rgba(255,80,80,0.9)"
    ctx.lineWidth = isSelected ? 3 : 2.5
    ctx.moveTo(arr.fromX, arr.fromY)
    ctx.lineTo(arr.toX, arr.toY)
    ctx.stroke()
    ctx.setLineDash([])

    // Arrowhead
    const angle = Math.atan2(arr.toY - arr.fromY, arr.toX - arr.fromX)
    const len = 10
    ctx.beginPath()
    ctx.moveTo(arr.toX, arr.toY)
    ctx.lineTo(arr.toX - len * Math.cos(angle - 0.4), arr.toY - len * Math.sin(angle - 0.4))
    ctx.moveTo(arr.toX, arr.toY)
    ctx.lineTo(arr.toX - len * Math.cos(angle + 0.4), arr.toY - len * Math.sin(angle + 0.4))
    ctx.strokeStyle = isSelected ? "#FFD700" : "rgba(255,80,80,0.9)"
    ctx.lineWidth = 2
    ctx.stroke()
  })
}

const CANVAS_W = 500
const CANVAS_H = 400

function SetPieceCanvas({ esquema, onUpdate, jogadores }: {
  esquema: SetPieceEsquema
  onUpdate: (e: SetPieceEsquema) => void
  jogadores: Jogador[]
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [mode, setMode] = useState<DrawMode>("select")
  const [selected, setSelected] = useState<string | null>(null)
  const [newPinColor, setNewPinColor] = useState(PIN_COLORS[0])
  const [newPinLabel, setNewPinLabel] = useState("")
  const [arrowStart, setArrowStart] = useState<{ x: number; y: number } | null>(null)
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null)
  const [dragPin, setDragPin] = useState<string | null>(null)
  const [addPinOpen, setAddPinOpen] = useState(false)
  const [pendingPos, setPendingPos] = useState<{ x: number; y: number } | null>(null)

  const render = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H)
    drawField(ctx, CANVAS_W, CANVAS_H)
    drawArrows(ctx, esquema.setas, selected, arrowStart && mousePos ? { fromX: arrowStart.x, fromY: arrowStart.y, toX: mousePos.x, toY: mousePos.y } : null)
    drawPins(ctx, esquema.pinos, selected)
  }, [esquema, selected, arrowStart, mousePos])

  useEffect(() => { render() }, [render])

  function getPos(e: React.MouseEvent<HTMLCanvasElement>) {
    const rect = canvasRef.current!.getBoundingClientRect()
    const scaleX = CANVAS_W / rect.width
    const scaleY = CANVAS_H / rect.height
    return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY }
  }

  function findPin(x: number, y: number): SetPiecePin | null {
    return esquema.pinos.find(p => Math.hypot(p.x - x, p.y - y) <= PIN_RADIUS) ?? null
  }

  function findArrow(x: number, y: number): SetPieceArrow | null {
    return esquema.setas.find(arr => {
      const dx = arr.toX - arr.fromX
      const dy = arr.toY - arr.fromY
      const len = Math.hypot(dx, dy)
      if (len === 0) return false
      const t = Math.max(0, Math.min(1, ((x - arr.fromX) * dx + (y - arr.fromY) * dy) / (len * len)))
      const projX = arr.fromX + t * dx
      const projY = arr.fromY + t * dy
      return Math.hypot(x - projX, y - projY) < 10
    }) ?? null
  }

  function handleMouseDown(e: React.MouseEvent<HTMLCanvasElement>) {
    const pos = getPos(e)
    if (mode === "select") {
      const pin = findPin(pos.x, pos.y)
      if (pin) { setSelected(pin.id); setDragPin(pin.id); return }
      const arrow = findArrow(pos.x, pos.y)
      if (arrow) { setSelected(arrow.id); return }
      setSelected(null)
    } else if (mode === "pin") {
      setPendingPos(pos)
      setNewPinLabel("")
      setAddPinOpen(true)
    } else if (mode === "arrow") {
      if (!arrowStart) {
        setArrowStart(pos)
      } else {
        const newArrow: SetPieceArrow = {
          id: crypto.randomUUID(),
          fromX: arrowStart.x, fromY: arrowStart.y,
          toX: pos.x, toY: pos.y,
          dashed: true,
        }
        onUpdate({ ...esquema, setas: [...esquema.setas, newArrow] })
        setArrowStart(null)
      }
    }
  }

  function handleMouseMove(e: React.MouseEvent<HTMLCanvasElement>) {
    const pos = getPos(e)
    setMousePos(pos)
    if (dragPin) {
      const updated = esquema.pinos.map(p => p.id === dragPin ? { ...p, x: pos.x, y: pos.y } : p)
      onUpdate({ ...esquema, pinos: updated })
    }
  }

  function handleMouseUp() {
    setDragPin(null)
  }

  function addPin() {
    if (!pendingPos || !newPinLabel.trim()) return
    const pin: SetPiecePin = {
      id: crypto.randomUUID(),
      x: pendingPos.x, y: pendingPos.y,
      label: newPinLabel.trim().toUpperCase(),
      cor: newPinColor,
    }
    onUpdate({ ...esquema, pinos: [...esquema.pinos, pin] })
    setAddPinOpen(false)
    setMode("select")
  }

  function deleteSelected() {
    if (!selected) return
    const newPinos = esquema.pinos.filter(p => p.id !== selected)
    const newSetas = esquema.setas.filter(s => s.id !== selected)
    onUpdate({ ...esquema, pinos: newPinos, setas: newSetas })
    setSelected(null)
  }

  function exportPng() {
    const canvas = canvasRef.current
    if (!canvas) return
    const link = document.createElement("a")
    link.download = `${esquema.nome || "set-piece"}.png`
    link.href = canvas.toDataURL("image/png")
    link.click()
  }

  return (
    <div className="flex gap-4">
      {/* Canvas */}
      <div className="flex-1">
        <canvas
          ref={canvasRef}
          width={CANVAS_W}
          height={CANVAS_H}
          className="w-full rounded-lg border border-border cursor-crosshair"
          style={{ aspectRatio: `${CANVAS_W}/${CANVAS_H}` }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={() => { setDragPin(null); setMousePos(null) }}
        />

        {/* Toolbar */}
        <div className="flex items-center gap-2 mt-2 flex-wrap">
          {(["select", "pin", "arrow"] as DrawMode[]).map(m => (
            <Button
              key={m}
              size="sm"
              variant={mode === m ? "default" : "outline"}
              className={`capitalize text-xs h-7 ${mode === m ? "bg-[#00D66C] text-black hover:bg-[#00D66C]/90" : ""}`}
              onClick={() => { setMode(m); setArrowStart(null) }}
            >
              {m === "pin" ? <><Plus className="w-3 h-3 mr-1" />Pin</> : m === "arrow" ? <><ArrowRight className="w-3 h-3 mr-1" />Arrow</> : "Select"}
            </Button>
          ))}
          {selected && (
            <Button size="sm" variant="outline" className="text-destructive border-destructive/30 h-7 text-xs gap-1" onClick={deleteSelected}>
              <Trash2 className="w-3 h-3" /> Delete
            </Button>
          )}
          <Button size="sm" variant="outline" className="h-7 text-xs gap-1 ml-auto" onClick={exportPng}>
            <Download className="w-3 h-3" /> Export PNG
          </Button>
        </div>
      </div>

      {/* Player panel */}
      <div className="w-40 shrink-0">
        <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Players</div>
        <div className="space-y-1 overflow-y-auto max-h-[360px]">
          {jogadores.map(j => (
            <div
              key={j.id}
              draggable
              className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-muted/30 border border-border/30 cursor-grab text-xs"
              title="Drag to field or click to add pin"
              onClick={() => {
                // Clicking a player adds a pin with their shirt number as label
                const pin: SetPiecePin = {
                  id: crypto.randomUUID(),
                  x: CANVAS_W / 2 + (Math.random() - 0.5) * 100,
                  y: CANVAS_H * 0.7 + (Math.random() - 0.5) * 60,
                  label: String(j.numero),
                  cor: newPinColor,
                }
                onUpdate({ ...esquema, pinos: [...esquema.pinos, pin] })
              }}
            >
              {j.foto ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={j.foto} alt={j.nome} className="w-6 h-6 rounded-full object-cover border border-border shrink-0" />
              ) : (
                <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold shrink-0">{j.numero}</div>
              )}
              <div className="truncate">{j.nome.split(" ").slice(-1)[0]}</div>
            </div>
          ))}
        </div>

        <div className="mt-3">
          <div className="text-xs text-muted-foreground mb-1">Pin colour</div>
          <div className="flex flex-wrap gap-1">
            {PIN_COLORS.map(c => (
              <button
                key={c}
                className={`w-5 h-5 rounded-full border-2 transition-all ${newPinColor === c ? "border-white scale-125" : "border-transparent"}`}
                style={{ background: c }}
                onClick={() => setNewPinColor(c)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Add pin dialog */}
      <Dialog open={addPinOpen} onOpenChange={setAddPinOpen}>
        <DialogContent className="max-w-xs">
          <DialogHeader><DialogTitle>Add Pin</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <div>
              <Label className="text-xs">Label (1-3 chars)</Label>
              <Input
                maxLength={3}
                value={newPinLabel}
                onChange={e => setNewPinLabel(e.target.value.toUpperCase())}
                placeholder="A, 1, GK..."
                className="mt-1 h-8 text-sm uppercase"
                autoFocus
                onKeyDown={e => { if (e.key === "Enter") addPin() }}
              />
            </div>
            <div>
              <Label className="text-xs">Colour</Label>
              <div className="flex gap-1.5 mt-1">
                {PIN_COLORS.map(c => (
                  <button
                    key={c}
                    className={`w-6 h-6 rounded-full border-2 transition-all ${newPinColor === c ? "border-white scale-125" : "border-transparent"}`}
                    style={{ background: c }}
                    onClick={() => setNewPinColor(c)}
                  />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setAddPinOpen(false)}>Cancel</Button>
            <Button size="sm" onClick={addPin} className="bg-[#00D66C] text-black hover:bg-[#00D66C]/90" disabled={!newPinLabel.trim()}>Add</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

type SetPieceGroup = {
  key: string
  label: string
  tipos: { tipo: TipoSetPiece; label: string }[]
}

const GROUPS: SetPieceGroup[] = [
  {
    key: "corners",
    label: "Corners",
    tipos: [
      { tipo: "corner_right", label: "Right Corner" },
      { tipo: "corner_left", label: "Left Corner" },
    ],
  },
  {
    key: "freekicks",
    label: "Direct FK",
    tipos: [
      { tipo: "freekick_center", label: "Center" },
      { tipo: "freekick_right", label: "Right" },
      { tipo: "freekick_left", label: "Left" },
    ],
  },
  {
    key: "lateral",
    label: "Lateral FK",
    tipos: [
      { tipo: "lateral_freekick_right", label: "Right" },
      { tipo: "lateral_freekick_left", label: "Left" },
    ],
  },
  {
    key: "penalty",
    label: "Penalty",
    tipos: [
      { tipo: "penalty", label: "Penalty" },
    ],
  },
  {
    key: "throwins",
    label: "Throw-ins",
    tipos: [
      { tipo: "throwin_def", label: "Defensive Zone" },
      { tipo: "throwin_off", label: "Offensive Zone" },
    ],
  },
]

export function SetPiecesTab() {
  const [jogadores, setJogadores] = useState<Jogador[]>([])
  const [esquemas, setEsquemas] = useState<SetPieceEsquema[]>([])
  const [activeGroup, setActiveGroup] = useState("corners")
  const [activeTipo, setActiveTipo] = useState<TipoSetPiece>("corner_right")

  useEffect(() => {
    setJogadores(getJogadores())
    setEsquemas(getSetPieces())
  }, [])

  function getOrCreateEsquema(tipo: TipoSetPiece): SetPieceEsquema {
    const existing = esquemas.find(e => e.tipo === tipo)
    if (existing) return existing
    return { id: crypto.randomUUID(), tipo, nome: tipo.replace(/_/g, " "), pinos: [], setas: [] }
  }

  function handleUpdate(updated: SetPieceEsquema) {
    upsertSetPiece(updated)
    setEsquemas(getSetPieces())
  }

  const activeGroup_ = GROUPS.find(g => g.key === activeGroup)!

  return (
    <div>
      <div className="mb-4">
        <h2 className="font-semibold text-lg mb-1">Set Pieces</h2>
        <p className="text-xs text-muted-foreground">Draw set piece routines. Click players on the right to add pins. Use Arrow mode to draw movement lines.</p>
      </div>

      {/* Group tabs */}
      <Tabs value={activeGroup} onValueChange={setActiveGroup}>
        <TabsList className="mb-4 bg-muted/30 flex-wrap h-auto gap-1">
          {GROUPS.map(g => (
            <TabsTrigger key={g.key} value={g.key} className="text-xs h-7">
              {g.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {GROUPS.map(g => (
          <TabsContent key={g.key} value={g.key}>
            {/* Sub-tabs for L/R variations */}
            {g.tipos.length > 1 && (
              <div className="flex gap-2 mb-4">
                {g.tipos.map(t => (
                  <Button
                    key={t.tipo}
                    size="sm"
                    variant={activeTipo === t.tipo ? "default" : "outline"}
                    className={`text-xs h-7 ${activeTipo === t.tipo ? "bg-[#00D66C] text-black hover:bg-[#00D66C]/90" : ""}`}
                    onClick={() => setActiveTipo(t.tipo)}
                  >
                    {t.label}
                  </Button>
                ))}
              </div>
            )}

            {(() => {
              const tipo = g.tipos.length === 1 ? g.tipos[0].tipo : activeTipo
              // Make sure active tipo belongs to this group
              const tipoToShow = g.tipos.find(t => t.tipo === tipo) ? tipo : g.tipos[0].tipo
              const esquema = getOrCreateEsquema(tipoToShow)
              return (
                <SetPieceCanvas
                  key={tipoToShow}
                  esquema={esquema}
                  onUpdate={handleUpdate}
                  jogadores={jogadores}
                />
              )
            })()}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
