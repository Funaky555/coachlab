"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Camera, ChevronDown, ChevronLeft, ChevronRight,
  Eye, EyeOff, ImagePlus, MousePointer2, Trash2, Undo2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type {
  Ball, BoardSnapshot, Drawing, FieldView, FormationName,
  Player, Point, RenderOptions, Tool,
} from "./types";
import {
  PITCH_W, PITCH_H, BORDEAUX, OCEAN,
  canvasToLogical, logicalToCanvas, renderBoard,
  findPlayerAtPoint, findDrawingAtPoint, findHandleAtPoint,
  getHandlePoints, getPlayerRadius,
} from "./pitch-renderer";

// ─── Constants ────────────────────────────────────────────────────────────────
const PL = 15, PR = PITCH_W - 15, PT = 15, PB = PITCH_H - 15;

const FORMATIONS: Record<FormationName, Array<{ x: number; y: number }>> = {
  "1-4-3-3":   [{ x:0.04,y:.50 },{ x:.20,y:.15 },{ x:.20,y:.38 },{ x:.20,y:.62 },{ x:.20,y:.85 },{ x:.41,y:.27 },{ x:.42,y:.50 },{ x:.41,y:.73 },{ x:.65,y:.15 },{ x:.68,y:.50 },{ x:.65,y:.85 }],
  "1-4-4-2":   [{ x:0.04,y:.50 },{ x:.20,y:.10 },{ x:.20,y:.37 },{ x:.20,y:.63 },{ x:.20,y:.90 },{ x:.42,y:.10 },{ x:.42,y:.37 },{ x:.42,y:.63 },{ x:.42,y:.90 },{ x:.64,y:.33 },{ x:.64,y:.67 }],
  "1-4-2-3-1": [{ x:0.04,y:.50 },{ x:.20,y:.10 },{ x:.20,y:.37 },{ x:.20,y:.63 },{ x:.20,y:.90 },{ x:.37,y:.37 },{ x:.37,y:.63 },{ x:.53,y:.15 },{ x:.54,y:.50 },{ x:.53,y:.85 },{ x:.69,y:.50 }],
  "1-3-5-2":   [{ x:0.04,y:.50 },{ x:.20,y:.23 },{ x:.20,y:.50 },{ x:.20,y:.77 },{ x:.39,y:.08 },{ x:.41,y:.30 },{ x:.42,y:.50 },{ x:.41,y:.70 },{ x:.39,y:.92 },{ x:.63,y:.35 },{ x:.63,y:.65 }],
  "1-3-6-1":   [{ x:0.04,y:.50 },{ x:.20,y:.22 },{ x:.20,y:.50 },{ x:.20,y:.78 },{ x:.37,y:.10 },{ x:.40,y:.28 },{ x:.41,y:.44 },{ x:.41,y:.56 },{ x:.40,y:.72 },{ x:.37,y:.90 },{ x:.68,y:.50 }],
  "1-3-4-3":   [{ x:0.04,y:.50 },{ x:.19,y:.22 },{ x:.20,y:.50 },{ x:.19,y:.78 },{ x:.40,y:.15 },{ x:.40,y:.40 },{ x:.40,y:.60 },{ x:.40,y:.85 },{ x:.63,y:.15 },{ x:.66,y:.50 },{ x:.63,y:.85 }],
  "1-4-5-1":   [{ x:0.04,y:.50 },{ x:.20,y:.10 },{ x:.20,y:.35 },{ x:.20,y:.65 },{ x:.20,y:.90 },{ x:.42,y:.10 },{ x:.42,y:.30 },{ x:.43,y:.50 },{ x:.42,y:.70 },{ x:.42,y:.90 },{ x:.68,y:.50 }],
  "1-4-1-4-1": [{ x:0.04,y:.50 },{ x:.20,y:.10 },{ x:.20,y:.35 },{ x:.20,y:.65 },{ x:.20,y:.90 },{ x:.34,y:.50 },{ x:.50,y:.10 },{ x:.50,y:.35 },{ x:.50,y:.65 },{ x:.50,y:.90 },{ x:.68,y:.50 }],
  "1-5-4-1":   [{ x:0.04,y:.50 },{ x:.18,y:.08 },{ x:.20,y:.27 },{ x:.20,y:.50 },{ x:.20,y:.73 },{ x:.18,y:.92 },{ x:.42,y:.15 },{ x:.42,y:.38 },{ x:.42,y:.62 },{ x:.42,y:.85 },{ x:.68,y:.50 }],
  "1-5-3-2":   [{ x:0.04,y:.50 },{ x:.18,y:.08 },{ x:.20,y:.27 },{ x:.20,y:.50 },{ x:.20,y:.73 },{ x:.18,y:.92 },{ x:.42,y:.27 },{ x:.43,y:.50 },{ x:.42,y:.73 },{ x:.65,y:.33 },{ x:.65,y:.67 }],
  "1-5-2-3":   [{ x:0.04,y:.50 },{ x:.18,y:.08 },{ x:.20,y:.27 },{ x:.20,y:.50 },{ x:.20,y:.73 },{ x:.18,y:.92 },{ x:.40,y:.38 },{ x:.40,y:.62 },{ x:.63,y:.15 },{ x:.66,y:.50 },{ x:.63,y:.85 }],
  "1-4-3-2-1": [{ x:0.04,y:.50 },{ x:.20,y:.10 },{ x:.20,y:.37 },{ x:.20,y:.63 },{ x:.20,y:.90 },{ x:.38,y:.25 },{ x:.39,y:.50 },{ x:.38,y:.75 },{ x:.53,y:.38 },{ x:.53,y:.62 },{ x:.68,y:.50 }],
  "1-4-1-2-3": [{ x:0.04,y:.50 },{ x:.20,y:.10 },{ x:.20,y:.37 },{ x:.20,y:.63 },{ x:.20,y:.90 },{ x:.34,y:.50 },{ x:.48,y:.38 },{ x:.48,y:.62 },{ x:.63,y:.15 },{ x:.66,y:.50 },{ x:.63,y:.85 }],
  "1-3-4-2-1": [{ x:0.04,y:.50 },{ x:.19,y:.22 },{ x:.20,y:.50 },{ x:.19,y:.78 },{ x:.37,y:.15 },{ x:.38,y:.38 },{ x:.38,y:.62 },{ x:.37,y:.85 },{ x:.53,y:.38 },{ x:.53,y:.62 },{ x:.68,y:.50 }],
  "1-4-4-1-1": [{ x:0.04,y:.50 },{ x:.20,y:.10 },{ x:.20,y:.37 },{ x:.20,y:.63 },{ x:.20,y:.90 },{ x:.40,y:.10 },{ x:.40,y:.37 },{ x:.40,y:.63 },{ x:.40,y:.90 },{ x:.55,y:.50 },{ x:.68,y:.50 }],
  "1-3-3-4":   [{ x:0.04,y:.50 },{ x:.19,y:.22 },{ x:.20,y:.50 },{ x:.19,y:.78 },{ x:.39,y:.25 },{ x:.40,y:.50 },{ x:.39,y:.75 },{ x:.60,y:.10 },{ x:.62,y:.38 },{ x:.62,y:.62 },{ x:.60,y:.90 }],
  "1-4-2-2-2": [{ x:0.04,y:.50 },{ x:.20,y:.10 },{ x:.20,y:.37 },{ x:.20,y:.63 },{ x:.20,y:.90 },{ x:.37,y:.38 },{ x:.37,y:.62 },{ x:.52,y:.38 },{ x:.52,y:.62 },{ x:.65,y:.33 },{ x:.65,y:.67 }],
  "1-3-4-1-2": [{ x:0.04,y:.50 },{ x:.19,y:.22 },{ x:.20,y:.50 },{ x:.19,y:.78 },{ x:.37,y:.15 },{ x:.38,y:.38 },{ x:.38,y:.62 },{ x:.37,y:.85 },{ x:.53,y:.50 },{ x:.65,y:.33 },{ x:.65,y:.67 }],
  "1-4-6-0":   [{ x:0.04,y:.50 },{ x:.20,y:.10 },{ x:.20,y:.35 },{ x:.20,y:.65 },{ x:.20,y:.90 },{ x:.40,y:.10 },{ x:.41,y:.28 },{ x:.42,y:.46 },{ x:.42,y:.54 },{ x:.41,y:.72 },{ x:.40,y:.90 }],
  "1-2-3-5":   [{ x:0.04,y:.50 },{ x:.19,y:.33 },{ x:.19,y:.67 },{ x:.39,y:.22 },{ x:.40,y:.50 },{ x:.39,y:.78 },{ x:.60,y:.08 },{ x:.62,y:.27 },{ x:.64,y:.50 },{ x:.62,y:.73 },{ x:.60,y:.92 }],
  "1-4-3-1-2": [{ x:0.04,y:.50 },{ x:.20,y:.10 },{ x:.20,y:.37 },{ x:.20,y:.63 },{ x:.20,y:.90 },{ x:.38,y:.25 },{ x:.39,y:.50 },{ x:.38,y:.75 },{ x:.53,y:.50 },{ x:.65,y:.33 },{ x:.65,y:.67 }],
  "1-3-1-4-2": [{ x:0.04,y:.50 },{ x:.19,y:.22 },{ x:.20,y:.50 },{ x:.19,y:.78 },{ x:.33,y:.50 },{ x:.48,y:.15 },{ x:.49,y:.38 },{ x:.49,y:.62 },{ x:.48,y:.85 },{ x:.65,y:.33 },{ x:.65,y:.67 }],
  "1-4-1-3-2": [{ x:0.04,y:.50 },{ x:.20,y:.10 },{ x:.20,y:.37 },{ x:.20,y:.63 },{ x:.20,y:.90 },{ x:.34,y:.50 },{ x:.49,y:.27 },{ x:.50,y:.50 },{ x:.49,y:.73 },{ x:.65,y:.33 },{ x:.65,y:.67 }],
  "1-3-2-4-1": [{ x:0.04,y:.50 },{ x:.19,y:.22 },{ x:.20,y:.50 },{ x:.19,y:.78 },{ x:.36,y:.38 },{ x:.36,y:.62 },{ x:.52,y:.15 },{ x:.53,y:.38 },{ x:.53,y:.62 },{ x:.52,y:.85 },{ x:.68,y:.50 }],
};

const FORMATION_GROUPS = [
  { label: "4 Def", formations: ["1-4-3-3","1-4-4-2","1-4-2-3-1","1-4-5-1","1-4-1-4-1","1-4-3-2-1","1-4-1-2-3","1-4-4-1-1","1-4-2-2-2","1-4-6-0","1-4-3-1-2","1-4-1-3-2"] as FormationName[] },
  { label: "3 Def", formations: ["1-3-5-2","1-3-6-1","1-3-4-3","1-3-4-2-1","1-3-3-4","1-3-4-1-2","1-3-1-4-2","1-3-2-4-1"] as FormationName[] },
  { label: "5 Def", formations: ["1-5-4-1","1-5-3-2","1-5-2-3"] as FormationName[] },
  { label: "2 Def", formations: ["1-2-3-5"] as FormationName[] },
];

// [PREMIUM] FIELD_FORMATS — different field views for pro subscribers
// const FIELD_FORMATS = [full, half-left, half-right, corner-left, corner-right, penalty, seven-aside, five-aside]

function genId() { return Math.random().toString(36).slice(2, 9) + Date.now().toString(36); }

function makeTeamOnBorder(team: "A" | "B"): Player[] {
  const x = team === "A" ? PL + 22 : PR - 22;
  return Array.from({ length: 11 }, (_, i) => ({
    id: `${team}${i + 1}`,
    team,
    type: i === 0 ? "goalkeeper" : "player",
    number: i + 1,
    name: "",
    x,
    y: PT + i * ((PB - PT) / 10),
    visible: true,
    photo: null,
  } as Player));
}

function getInitialPlayers(): Player[] {
  return [...makeTeamOnBorder("A"), ...makeTeamOnBorder("B")];
}

// ─── Component ────────────────────────────────────────────────────────────────
export function CoachLabApp() {
  const canvasRef      = useRef<HTMLCanvasElement>(null);
  const containerRef   = useRef<HTMLDivElement>(null);
  const animFrameRef   = useRef<number>(0);
  // [PREMIUM] isPlayingRef — animation
  const textInputRef   = useRef<HTMLInputElement>(null);

  const draggingRef      = useRef<{ id: string; type: "player" | "ball"; offsetX: number; offsetY: number } | null>(null);
  const draggingHandleRef = useRef<{ drawingId: string; handleIdx: number } | null>(null);
  const isDrawingRef     = useRef(false);
  const drawStartRef     = useRef<Point | null>(null);
  const pendingHistoryRef = useRef<BoardSnapshot | null>(null);
  const historyRef       = useRef<BoardSnapshot[]>([]);
  const hasMovedRef      = useRef(false);

  const activeToolRef  = useRef<Tool>("select");
  const drawColorRef   = useRef("#ffffff");
  const drawFilledRef  = useRef(false);
  const playersRef     = useRef<Player[]>([]);
  const ballRef        = useRef<Ball>({ x: PITCH_W / 2, y: PITCH_H / 2 });
  const drawingsRef    = useRef<Drawing[]>([]);
  // [PREMIUM] fieldViewRef, showNamesRef, showZonesRef, lightFieldRef, movementsRef, animModeRef, activeMovePieceRef, setPieceModeRef

  // Image cache for player photos
  const imageCache = useRef<Map<string, HTMLImageElement>>(new Map());

  // ─── State ──────────────────────────────────────────────────────────────────
  const [players, setPlayers]             = useState<Player[]>(getInitialPlayers);
  const [ball, setBall]                   = useState<Ball>({ x: PITCH_W / 2, y: PITCH_H / 2 });
  const [drawings, setDrawings]           = useState<Drawing[]>([]);
  const [currentDraw, setCurrentDraw]     = useState<RenderOptions["currentDraw"]>(null);
  const [history, setHistory]             = useState<BoardSnapshot[]>([]);
  const [activeTool, setActiveTool]       = useState<Tool>("select");
  const [drawColor, setDrawColor]         = useState("#ffffff");
  const [drawFilled, setDrawFilled]       = useState(false);
  const [instructions, setInstructions]   = useState("");
  const [selectedPlayerId, setSelectedPlayerId]   = useState<string | null>(null);
  const [selectedDrawingId, setSelectedDrawingId] = useState<string | null>(null);
  const [canvasSize, setCanvasSize]       = useState({ w: 0, h: 0 });
  const [leftOpen, setLeftOpen]           = useState(true);
  const [rightOpen, setRightOpen]         = useState(true);
  const [openTacticTeam, setOpenTacticTeam] = useState<"A" | "B" | null>(null);
  const [openTacticGroup, setOpenTacticGroup] = useState<string | null>(null);
  const [pendingText, setPendingText]     = useState<Point | null>(null);
  const [pendingTextValue, setPendingTextValue] = useState("");
  const [editingNameId, setEditingNameId] = useState<string | null>(null);
  const [editingNameValue, setEditingNameValue] = useState("");
  const [teamAName, setTeamAName]         = useState("Team A");
  const [teamBName, setTeamBName]         = useState("Team B");
  const [editingTeamId, setEditingTeamId] = useState<"A" | "B" | null>(null);
  const [editingTeamValue, setEditingTeamValue] = useState("");
  // [PREMIUM] movements, fieldView, showNames, showZones, lightField, isPlaying, isRecording, playProgress
  // [PREMIUM] openDropdown, animMode, activeMovePiece, downloadUrl, setPieceMode, editingInstrId, editingInstrValue

  // Sync refs
  useEffect(() => { playersRef.current = players; }, [players]);
  useEffect(() => { ballRef.current = ball; }, [ball]);
  useEffect(() => { drawingsRef.current = drawings; }, [drawings]);
  useEffect(() => { historyRef.current = history; }, [history]);
  // [PREMIUM] movements, animMode, activeMovePiece, setPieceMode syncs removed

  // ─── Canvas resize ──────────────────────────────────────────────────────────
  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width  = container.clientWidth  * dpr;
      canvas.height = container.clientHeight * dpr;
      setCanvasSize({ w: canvas.width, h: canvas.height });
    };
    resize();
    const obs = new ResizeObserver(resize);
    obs.observe(container);
    return () => obs.disconnect();
  }, []);

  // ─── Canvas render ──────────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || canvas.width === 0) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const options: RenderOptions = {
      view: "full", showNames: true, showZones: false, lightField: false,
      currentDraw, selectedPlayerId, selectedDrawingId,
      imageCache: imageCache.current,
      movements: [], activeMovePiece: null, animMode: false, setPieceMode: false,
    };
    renderBoard(ctx, canvas, players, ball, drawings, options);
  }, [players, ball, drawings, currentDraw, selectedPlayerId, selectedDrawingId, canvasSize]);

  // [PREMIUM] Close dropdowns on outside click — removed (no dropdowns in free version)

  // ─── Keyboard shortcuts ──────────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (editingNameId || pendingText) return;
      if ((e.ctrlKey || e.metaKey) && e.key === "z") { e.preventDefault(); undo(); }
      if (e.key === "Escape") {
        setSelectedPlayerId(null);
        setSelectedDrawingId(null);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingNameId, pendingText]);

  // ─── History ─────────────────────────────────────────────────────────────────
  const captureHistory = useCallback(() => {
    pendingHistoryRef.current = {
      players: playersRef.current,
      ball: ballRef.current,
      drawings: drawingsRef.current,
    };
  }, []);

  const commitHistory = useCallback(() => {
    if (pendingHistoryRef.current) {
      setHistory(prev => [...prev.slice(-49), pendingHistoryRef.current!]);
      pendingHistoryRef.current = null;
    }
  }, []);

  const undo = useCallback(() => {
    const h = historyRef.current;
    if (h.length === 0) return;
    const last = h[h.length - 1];
    setPlayers(last.players);
    setBall(last.ball);
    setDrawings(last.drawings);
    setHistory(prev => prev.slice(0, -1));
  }, []);

  // ─── Coord helper ────────────────────────────────────────────────────────────
  const toLogical = useCallback((clientX: number, clientY: number): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    return canvasToLogical(clientX, clientY, canvas, "full");
  }, []);

  const getR = useCallback((): number => {
    const canvas = canvasRef.current;
    if (!canvas) return 14;
    return getPlayerRadius(canvas, "full");
  }, []);

  // ─── Pointer handlers ────────────────────────────────────────────────────────
  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    if (editingNameId || pendingText) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    const { x, y } = toLogical(e.clientX, e.clientY);
    const tool = activeToolRef.current;
    captureHistory();

    // [PREMIUM] Set Piece mode — reserved for pro subscribers
    // [PREMIUM] Animation mode — reserved for pro subscribers

    // ── Eraser ──
    if (tool === "eraser") {
      const drawId = findDrawingAtPoint(drawingsRef.current, x, y);
      if (drawId) { commitHistory(); setDrawings(prev => prev.filter(d => d.id !== drawId)); }
      return;
    }

    // ── Select ──
    if (tool === "select") {
      // Check drawing vertex handle first
      if (selectedDrawingId) {
        const selDrawing = drawingsRef.current.find(d => d.id === selectedDrawingId);
        if (selDrawing) {
          const hi = findHandleAtPoint(selDrawing, x, y, getR());
          if (hi >= 0) {
            draggingHandleRef.current = { drawingId: selectedDrawingId, handleIdx: hi };
            return;
          }
        }
      }
      // Check drawing click
      const drawId = findDrawingAtPoint(drawingsRef.current, x, y);
      if (drawId) { setSelectedDrawingId(drawId); setSelectedPlayerId(null); return; }

      // Check player/ball
      const hit = findPlayerAtPoint(playersRef.current, ballRef.current, x, y, getR());
      if (hit) {
        setSelectedDrawingId(null);
        setSelectedPlayerId(hit.type === "player" ? hit.id : null);
        const px = hit.type === "player" ? playersRef.current.find(p => p.id === hit.id)!.x : ballRef.current.x;
        const py = hit.type === "player" ? playersRef.current.find(p => p.id === hit.id)!.y : ballRef.current.y;
        draggingRef.current = { id: hit.type === "player" ? hit.id : "__ball__", type: hit.type, offsetX: x - px, offsetY: y - py };
      } else {
        setSelectedPlayerId(null);
        setSelectedDrawingId(null);
      }
      return;
    }

    // ── Text tool ──
    if (tool === "text") {
      setPendingText({ x, y });
      setPendingTextValue("");
      setTimeout(() => textInputRef.current?.focus(), 30);
      return;
    }

    // ── Drawing tool ──
    isDrawingRef.current = true;
    drawStartRef.current = { x, y };
    setCurrentDraw({ start: { x, y }, end: { x, y }, tool: tool as Drawing["tool"], color: drawColorRef.current, filled: drawFilledRef.current });
  }, [toLogical, captureHistory, commitHistory, selectedDrawingId, editingNameId, pendingText, getR]);

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    const { x, y } = toLogical(e.clientX, e.clientY);

    if (draggingRef.current) {
      hasMovedRef.current = true;
      const clamped = { x: Math.max(0, Math.min(PITCH_W, x - draggingRef.current.offsetX)), y: Math.max(0, Math.min(PITCH_H, y - draggingRef.current.offsetY)) };
      if (draggingRef.current.type === "player") {
        const id = draggingRef.current.id;
        setPlayers(prev => prev.map(p => p.id === id ? { ...p, ...clamped } : p));
      } else {
        setBall(clamped);
      }
    }

    if (draggingHandleRef.current) {
      hasMovedRef.current = true;
      const { drawingId, handleIdx } = draggingHandleRef.current;
      setDrawings(prev => prev.map(d => {
        if (d.id !== drawingId) return d;
        const handles = getHandlePoints(d);
        handles[handleIdx] = { x, y };
        // Apply handle updates back to drawing
        if (d.tool === "triangle") return { ...d, points: handles };
        if (d.tool === "curved-arrow") return { ...d, points: [handles[1]] };
        if (d.tool === "rect" || d.tool === "zone") {
          const tl = handles[0], tr = handles[1], br = handles[2];
          if (handleIdx === 0) return { ...d, start: { x, y } };
          if (handleIdx === 1) return { ...d, end: { x: x, y: d.end.y }, start: { x: d.start.x, y: y } };
          if (handleIdx === 2) return { ...d, end: { x, y } };
          if (handleIdx === 3) return { ...d, start: { x: x, y: d.start.y }, end: { x: d.end.x, y: y } };
          return { ...d, start: tl, end: br };
        }
        if (d.tool === "circle") {
          const cx = (d.start.x + d.end.x) / 2;
          const cy = (d.start.y + d.end.y) / 2;
          const rx = Math.abs(x - cx);
          const ry = Math.abs(y - cy);
          return { ...d, start: { x: cx - rx, y: cy - ry }, end: { x: cx + rx, y: cy + ry } };
        }
        if (handleIdx === 0) return { ...d, start: { x, y } };
        return { ...d, end: { x, y } };
      }));
    }

    if (isDrawingRef.current && drawStartRef.current) {
      setCurrentDraw(prev => prev ? { ...prev, end: { x, y } } : null);
    }
  }, [toLogical]);

  const handlePointerUp = useCallback(() => {
    const wasDragging = !!draggingRef.current;
    const wasHandle   = !!draggingHandleRef.current;
    const wasDrawing  = isDrawingRef.current;

    draggingRef.current = null;
    draggingHandleRef.current = null;

    if (wasDrawing && currentDraw) {
      const dx = currentDraw.end.x - currentDraw.start.x;
      const dy = currentDraw.end.y - currentDraw.start.y;
      if (Math.hypot(dx, dy) > 6) {
        commitHistory();
        const newDrawing: Drawing = {
          id: genId(),
          tool: currentDraw.tool,
          start: currentDraw.start,
          end: currentDraw.end,
          color: currentDraw.color,
          filled: currentDraw.filled,
          strokeWidth: 2.5,
        };
        // For triangle: initialize points
        if (currentDraw.tool === "triangle") {
          const mx = (currentDraw.start.x + currentDraw.end.x) / 2;
          newDrawing.points = [
            { x: mx, y: currentDraw.start.y },
            { x: currentDraw.start.x, y: currentDraw.end.y },
            { x: currentDraw.end.x,   y: currentDraw.end.y },
          ];
        }
        setDrawings(prev => [...prev, newDrawing]);
      }
      setCurrentDraw(null);
      isDrawingRef.current = false;
      drawStartRef.current = null;
    }

    if ((wasDragging || wasHandle) && hasMovedRef.current) commitHistory();
    hasMovedRef.current = false;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentDraw, commitHistory]);

  // [PREMIUM] confirmInstruction (set piece instructions)

  // ─── Text commit ─────────────────────────────────────────────────────────────
  const commitText = useCallback(() => {
    if (!pendingText || !pendingTextValue.trim()) { setPendingText(null); return; }
    commitHistory();
    setDrawings(prev => [...prev, { id: genId(), tool: "text", start: pendingText, end: pendingText, color: drawColorRef.current, text: pendingTextValue, strokeWidth: 2.5 }]);
    setPendingText(null);
    setPendingTextValue("");
  }, [pendingText, pendingTextValue, commitHistory]);

  // ─── Tool / setting setters ───────────────────────────────────────────────────
  const changeTool = (t: Tool) => { activeToolRef.current = t; setActiveTool(t); };
  const changeColor = (c: string) => { drawColorRef.current = c; setDrawColor(c); };
  const toggleFilled = () => { drawFilledRef.current = !drawFilled; setDrawFilled(v => !v); };
  // [PREMIUM] changeView, toggleNames, toggleZones, toggleLight

  // ─── Board actions ────────────────────────────────────────────────────────────
  const clearDrawings = () => { setHistory(prev => [...prev.slice(-49), { players, ball, drawings }]); setDrawings([]); };
  const clearAll = () => {
    setHistory(prev => [...prev.slice(-49), { players, ball, drawings }]);
    setDrawings([]);
    setPlayers(getInitialPlayers());
    setBall({ x: PITCH_W / 2, y: PITCH_H / 2 });
  };
  const ballToCenter = () => { setHistory(prev => [...prev.slice(-49), { players, ball, drawings }]); setBall({ x: PITCH_W / 2, y: PITCH_H / 2 }); };

  const applyFormation = (team: "A" | "B", formation: FormationName) => {
    setHistory(prev => [...prev.slice(-49), { players, ball, drawings }]);
    const positions = FORMATIONS[formation];
    setPlayers(prev => prev.map(p => {
      if (p.team !== team) return p;
      const pos = positions[p.number - 1];
      if (!pos) return p;
      const rawX = PL + pos.x * (PR - PL);
      const rawY = PT + pos.y * (PB - PT);
      return { ...p, x: team === "A" ? rawX : PITCH_W - rawX, y: rawY };
    }));
    setOpenTacticTeam(null);
    setOpenTacticGroup(null);
  };

  const resetToBorder = (team: "A" | "B") => {
    setHistory(prev => [...prev.slice(-49), { players, ball, drawings }]);
    setPlayers(prev => prev.map(p => {
      if (p.team !== team) return p;
      const idx = p.number - 1;
      return { ...p, x: team === "A" ? PL + 22 : PR - 22, y: PT + idx * ((PB - PT) / 10) };
    }));
  };

  const resetAllNames = () => {
    setPlayers(prev => prev.map(p => ({ ...p, name: "" })));
  };

  const togglePlayerVisibility = (id: string) => {
    setPlayers(prev => prev.map(p => p.id === id ? { ...p, visible: !p.visible } : p));
  };

  const updatePlayerName = (id: string, name: string) => {
    setPlayers(prev => prev.map(p => p.id === id ? { ...p, name } : p));
  };

  const handlePhotoUpload = (id: string, file: File) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      const data = ev.target?.result as string;
      setPlayers(prev => prev.map(p => p.id === id ? { ...p, photo: data } : p));
      const img = new Image();
      img.src = data;
      img.onload = () => imageCache.current.set(id, img);
    };
    reader.readAsDataURL(file);
  };

  // ─── Screenshot ──────────────────────────────────────────────────────────────
  const takeScreenshot = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `coach-lab-${Date.now()}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }, []);

  // [PREMIUM] playAnimation, stopAnimation, clearPath, clearAllPaths — reserved for pro subscribers

  // ─── Cursor ──────────────────────────────────────────────────────────────────
  const getCursor = () => {
    if (activeTool === "eraser") return "cell";
    if (activeTool === "select") return "default";
    return "crosshair";
  };

  // ─── Text overlay position ────────────────────────────────────────────────────
  const getTextOverlayPos = () => {
    const canvas = canvasRef.current;
    if (!canvas || !pendingText) return null;
    return logicalToCanvas(pendingText.x, pendingText.y, canvas, "full");
  };

  const textPos = getTextOverlayPos();

  // [PREMIUM] instrOverlayPos — set piece instruction overlay

  // ─── UI helpers ──────────────────────────────────────────────────────────────
  const teamA = players.filter(p => p.team === "A").sort((a, b) => a.number - b.number);
  const teamB = players.filter(p => p.team === "B").sort((a, b) => a.number - b.number);

  // [PREMIUM] activeFieldInfo, getMovementCount

  // ─── Team panel ────────────────────────────────────────────────────────────
  function TeamPanel({ team }: { team: "A" | "B" }) {
    const list = team === "A" ? teamA : teamB;
    const color = team === "A" ? BORDEAUX : OCEAN;
    const label = team === "A" ? teamAName : teamBName;
    const isOpenTactic = openTacticTeam === team;
    const isEditingTeam = editingTeamId === team;

    return (
      <div className="mb-3">
        {/* Team header */}
        <div className="flex items-center gap-1 mb-1 px-1">
          {isEditingTeam ? (
            <input
              autoFocus
              value={editingTeamValue}
              onChange={e => setEditingTeamValue(e.target.value)}
              onBlur={() => {
                const v = editingTeamValue.trim() || (team === "A" ? "Team A" : "Team B");
                team === "A" ? setTeamAName(v) : setTeamBName(v);
                setEditingTeamId(null);
              }}
              onKeyDown={e => {
                if (e.key === "Enter") {
                  const v = editingTeamValue.trim() || (team === "A" ? "Team A" : "Team B");
                  team === "A" ? setTeamAName(v) : setTeamBName(v);
                  setEditingTeamId(null);
                }
                if (e.key === "Escape") setEditingTeamId(null);
              }}
              className="flex-1 min-w-0 text-xs font-bold px-1 py-0 rounded bg-card border border-primary outline-none"
              style={{ color }}
              placeholder={team === "A" ? "Team A" : "Team B"}
            />
          ) : (
            <button
              className="text-xs font-bold hover:opacity-70 transition-opacity text-left"
              style={{ color }}
              title="Click to rename"
              onClick={() => { setEditingTeamId(team); setEditingTeamValue(label); }}
            >
              {label} ✎
            </button>
          )}
          <button
            onClick={() => resetToBorder(team)}
            className="ml-auto text-[9px] px-1 py-0.5 rounded bg-secondary/40 text-muted-foreground hover:text-foreground border border-border/30 transition-colors"
            title="Reset to border"
          >
            ← Border
          </button>
        </div>

        {/* Tactical Systems */}
        <div className="mb-2">
          <button
            onClick={() => { setOpenTacticTeam(isOpenTactic ? null : team); setOpenTacticGroup(null); }}
            className="w-full flex items-center justify-between px-2 py-1.5 rounded-md bg-secondary/60 border border-border/40 hover:bg-secondary transition-colors mb-1"
          >
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-black" style={{ color }}>⬡</span>
              <span className="text-[9px] font-bold text-foreground tracking-widest uppercase">Formations</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] font-mono text-muted-foreground/60">
                {FORMATION_GROUPS.reduce((n, g) => n + g.formations.length, 0)}
              </span>
              <ChevronDown className={`h-3 w-3 text-muted-foreground transition-transform duration-200 ${isOpenTactic ? "rotate-180" : ""}`} />
            </div>
          </button>

          {isOpenTactic && (
            <div className="rounded-md border border-border/40 overflow-hidden" style={{ background: "rgba(0,0,0,0.25)" }}>
              {/* Group tabs */}
              <div className="flex gap-0.5 p-1" style={{ background: "rgba(0,0,0,0.15)" }}>
                {FORMATION_GROUPS.map(grp => {
                  const isActive = openTacticGroup === grp.label;
                  return (
                    <button
                      key={grp.label}
                      onClick={() => setOpenTacticGroup(isActive ? null : grp.label)}
                      className="flex-1 text-[9px] py-1 rounded font-bold transition-all duration-150"
                      style={isActive
                        ? { background: `${color}28`, border: `1px solid ${color}55`, color }
                        : { color: "var(--muted-foreground)", border: "1px solid transparent" }
                      }
                    >
                      {grp.label}
                    </button>
                  );
                })}
              </div>

              {/* Formation grid */}
              {openTacticGroup && (() => {
                const grp = FORMATION_GROUPS.find(g => g.label === openTacticGroup);
                if (!grp) return null;
                return (
                  <div className="p-1.5 grid grid-cols-2 gap-0.5">
                    {grp.formations.map(f => (
                      <button
                        key={f}
                        onClick={() => applyFormation(team, f)}
                        className="text-[9px] py-1 px-0.5 rounded font-mono text-center text-muted-foreground border border-border/40 bg-card/20 transition-all duration-150 hover:text-white"
                        style={{ lineHeight: 1.2 }}
                        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = `${color}1a`; (e.currentTarget as HTMLButtonElement).style.borderColor = `${color}55`; (e.currentTarget as HTMLButtonElement).style.color = color; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = ""; (e.currentTarget as HTMLButtonElement).style.borderColor = ""; (e.currentTarget as HTMLButtonElement).style.color = ""; }}
                      >
                        {f.replace(/^1-/, "")}
                      </button>
                    ))}
                  </div>
                );
              })()}
            </div>
          )}
        </div>

        {/* Player list */}
        <div className="space-y-0.5">
          {list.map(p => (
            <div key={p.id}>
              <div className="flex items-center gap-1 group">
                {/* Visibility */}
                <button onClick={() => togglePlayerVisibility(p.id)} className="flex-none opacity-50 hover:opacity-100 transition-opacity">
                  {p.visible ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3 opacity-30" />}
                </button>
                {/* Number badge */}
                <span
                  className="flex-none w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0"
                  style={{ background: p.type === "goalkeeper" ? (team === "A" ? "#4A0F22" : "#051E3E") : color }}
                >
                  {p.number}
                </span>
                {/* Name input */}
                {editingNameId === p.id ? (
                  <input
                    autoFocus
                    value={editingNameValue}
                    onChange={e => setEditingNameValue(e.target.value)}
                    onBlur={() => { updatePlayerName(p.id, editingNameValue); setEditingNameId(null); }}
                    onKeyDown={e => { if (e.key === "Enter") { updatePlayerName(p.id, editingNameValue); setEditingNameId(null); } if (e.key === "Escape") setEditingNameId(null); }}
                    className="flex-1 min-w-0 text-[10px] px-1 py-0.5 rounded bg-card border border-primary text-foreground outline-none"
                    placeholder="Player name"
                  />
                ) : (
                  <button
                    onClick={() => { setEditingNameId(p.id); setEditingNameValue(p.name); }}
                    className="flex-1 min-w-0 text-left text-[10px] text-muted-foreground hover:text-foreground truncate transition-colors"
                    title="Click to edit name"
                  >
                    {p.name || <span className="italic opacity-40">Name...</span>}
                  </button>
                )}
                {/* Photo upload */}
                <label className="flex-none cursor-pointer opacity-0 group-hover:opacity-60 hover:!opacity-100 transition-opacity">
                  <ImagePlus className="h-3 w-3" />
                  <input
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={e => { const f = e.target.files?.[0]; if (f) handlePhotoUpload(p.id, f); }}
                  />
                </label>
              </div>
              {/* [PREMIUM] Set Piece instruction field */}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ─── JSX ──────────────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 flex flex-col" style={{ top: "3.5rem" }}>

      {/* ── Toolbar ─────────────────────────────────────────────────────────── */}
      <div className="flex-none bg-card border-b border-border flex flex-wrap items-center gap-0.5 px-2 py-1 shrink-0">

        {/* Select */}
        <Button
          size="sm" variant={activeTool === "select" ? "default" : "ghost"}
          className="h-8 w-8 p-0 shrink-0" title="Select / Move"
          onClick={() => changeTool("select")}
        >
          <MousePointer2 className="h-4 w-4" />
        </Button>

        {/* [PREMIUM] Pitch Size dropdown — hardcoded to Full Pitch in free version */}

        <div className="w-px h-5 bg-border mx-1 shrink-0" />

        {/* ── Grupo Actions (laranja) ────────────────────────── */}
        <div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-orange-500/10 border border-orange-500/25 shrink-0">
          <Button size="sm" variant="ghost" className="h-7 px-2 gap-1 text-xs text-orange-400 hover:bg-orange-500/15 hover:text-orange-300 shrink-0" title="Undo (Ctrl+Z)"
            onClick={undo} disabled={history.length === 0}>
            <Undo2 className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Undo</span>
          </Button>
          {/* [PREMIUM] Clear drawings button */}
          <Button size="sm" variant="ghost" className="h-7 px-2 gap-1 text-xs text-orange-400 hover:bg-orange-500/15 hover:text-orange-300 shrink-0" title="Reset everything"
            onClick={clearAll}>
            <Trash2 className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Reset</span>
          </Button>
        </div>

        <div className="w-px h-5 bg-border mx-1 shrink-0" />

        {/* ── Grupo Camera (verde) ───────────────────────────── */}
        <div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-green-500/10 border border-green-500/25 shrink-0">
          <Button size="sm" variant="ghost" className="h-7 px-2 gap-1 text-xs text-green-400 hover:bg-green-500/15 hover:text-green-300 shrink-0" title="Screenshot (PNG)"
            onClick={takeScreenshot}>
            <Camera className="h-3.5 w-3.5" />
          </Button>
          <Button size="sm" variant="ghost" className="h-7 px-2 text-xs text-green-400 hover:bg-green-500/15 hover:text-green-300 shrink-0" title="Ball to center" onClick={ballToCenter}>
            ⚽
          </Button>
        </div>

        {/* [PREMIUM] Names/Zone/Light toggles — pro only */}
        {/* [PREMIUM] Individual Instruction (set piece mode) — pro only */}

        {/* Sidebar toggles */}
        <div className="ml-auto flex items-center gap-0.5 shrink-0">
          <Button size="sm" variant="ghost" className="h-8 w-8 p-0 lg:hidden" onClick={() => setLeftOpen(v => !v)}>
            {leftOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>
          <Button size="sm" variant="ghost" className="h-8 w-8 p-0 lg:hidden" onClick={() => setRightOpen(v => !v)}>
            {rightOpen ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* ── Main area ──────────────────────────────────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden min-h-0">

        {/* ── Left panel ─────────────────────────────────────────────────────── */}
        <div className={`flex-none bg-card border-r border-border overflow-y-auto transition-all duration-200 ${leftOpen ? "w-48" : "w-0 overflow-hidden"}`}>
          <div className="p-2 min-w-[12rem]">
            {/* Reset names */}
            <button
              onClick={resetAllNames}
              className="w-full text-[10px] px-2 py-1 rounded bg-secondary/40 border border-border/30 hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors mb-2"
            >
              ↺ Reset All Names
            </button>

            <TeamPanel team="A" />
            <div className="w-full h-px bg-border/50 my-2" />
            <TeamPanel team="B" />
          </div>
        </div>

        {/* ── Canvas ─────────────────────────────────────────────────────────── */}
        <div ref={containerRef} className="flex-1 relative overflow-hidden min-w-0">
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full"
            style={{ cursor: getCursor(), touchAction: "none" }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
          />

          {/* Text input overlay */}
          {pendingText && textPos && (
            <input
              ref={textInputRef}
              value={pendingTextValue}
              onChange={e => setPendingTextValue(e.target.value)}
              onBlur={commitText}
              onKeyDown={e => { if (e.key === "Enter") commitText(); if (e.key === "Escape") setPendingText(null); }}
              placeholder="Type text…"
              style={{ left: textPos.x, top: textPos.y - 12 }}
              className="absolute z-10 text-xs px-1.5 py-0.5 rounded bg-card border border-primary text-foreground shadow-lg outline-none min-w-[120px]"
            />
          )}

          {/* [PREMIUM] Set piece instruction overlay */}
          {/* [PREMIUM] Playing progress overlay */}
        </div>

        {/* ── Right panel ────────────────────────────────────────────────────── */}
        <div className={`flex-none bg-card border-l border-border overflow-y-auto transition-all duration-200 ${rightOpen ? "w-52" : "w-0 overflow-hidden"}`}>
          <div className="p-2 min-w-[13rem]">

              {/* [PREMIUM] Animation Mode — play, record, download — pro only */}

            {/* Tactical Notes */}
            <p className="text-xs font-semibold text-foreground mb-1">Notes</p>
            <textarea
              value={instructions}
              onChange={e => setInstructions(e.target.value)}
              placeholder="Tactical notes…"
              className="w-full h-40 text-xs bg-secondary/30 border border-border rounded p-1.5 resize-none text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
