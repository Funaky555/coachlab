"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Camera, ChevronDown, ChevronLeft, ChevronRight,
  ClipboardList, Eraser, Eye, EyeOff, ImagePlus, MousePointer2,
  Play, StopCircle, Trash2, Undo2, Waypoints,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type {
  Ball, BoardSnapshot, Drawing, FieldView, FormationName,
  Movement, Player, Point, RenderOptions, Tool,
} from "./types";
import {
  PITCH_W, PITCH_H, BORDEAUX, OCEAN,
  canvasToLogical, logicalToCanvas, renderBoard,
  findPlayerAtPoint, findDrawingAtPoint, findHandleAtPoint,
  getHandlePoints, getPlayerRadius, findWaypointAtPoint,
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
  { label: "4 Defenders", formations: ["1-4-3-3","1-4-4-2","1-4-2-3-1","1-4-5-1","1-4-1-4-1","1-4-3-2-1","1-4-1-2-3","1-4-4-1-1","1-4-2-2-2","1-4-6-0","1-4-3-1-2","1-4-1-3-2"] as FormationName[] },
  { label: "3 Defenders", formations: ["1-3-5-2","1-3-6-1","1-3-4-3","1-3-4-2-1","1-3-3-4","1-3-4-1-2","1-3-1-4-2","1-3-2-4-1"] as FormationName[] },
  { label: "5 Defenders", formations: ["1-5-4-1","1-5-3-2","1-5-2-3"] as FormationName[] },
  { label: "Historical", formations: ["1-2-3-5"] as FormationName[] },
];

const FIELD_FORMATS: Array<{ value: FieldView; label: string; desc: string; group: string }> = [
  { value: "full",         label: "Full Pitch",   desc: "Campo inteiro 11v11",          group: "Full Field"  },
  { value: "half-left",    label: "Left Half",    desc: "Meio campo esquerdo + baliza", group: "Half Field"  },
  { value: "half-right",   label: "Right Half",   desc: "Meio campo direito + baliza",  group: "Half Field"  },
  { value: "corner-left",  label: "Corner Left",  desc: "Canto esq. — baliza esquerda", group: "Set Pieces"  },
  { value: "corner-right", label: "Corner Right", desc: "Canto dir. — baliza direita",  group: "Set Pieces"  },
  { value: "penalty",      label: "Penalty",      desc: "Área + zona de penálti",       group: "Set Pieces"  },
  { value: "seven-aside",  label: "7-a-side",     desc: "Campo de 7 com balizas",       group: "Small Sided" },
  { value: "five-aside",   label: "5-a-side",     desc: "Campo de 5 com balizas",       group: "Small Sided" },
];

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
  const isPlayingRef   = useRef(false);
  const dropdownRef    = useRef<HTMLDivElement>(null);
  const textInputRef   = useRef<HTMLInputElement>(null);

  const draggingRef      = useRef<{ id: string; type: "player" | "ball"; offsetX: number; offsetY: number } | null>(null);
  const draggingHandleRef = useRef<{ drawingId: string; handleIdx: number } | null>(null);
  const isDrawingRef     = useRef(false);
  const drawStartRef     = useRef<Point | null>(null);
  const pendingHistoryRef = useRef<BoardSnapshot | null>(null);
  const historyRef       = useRef<BoardSnapshot[]>([]);
  const hasMovedRef      = useRef(false);

  const activeToolRef  = useRef<Tool>("select");
  const fieldViewRef   = useRef<FieldView>("full");
  const drawColorRef   = useRef("#ffffff");
  const drawFilledRef  = useRef(false);
  const showNamesRef   = useRef(true);
  const showZonesRef   = useRef(false);
  const lightFieldRef  = useRef(false);
  const playersRef     = useRef<Player[]>([]);
  const ballRef        = useRef<Ball>({ x: PITCH_W / 2, y: PITCH_H / 2 });
  const drawingsRef    = useRef<Drawing[]>([]);
  const movementsRef   = useRef<Movement[]>([]);
  const animModeRef    = useRef(false);
  const activeMovePieceRef = useRef<string | null>(null);
  const setPieceModeRef = useRef(false);

  // Image cache for player photos
  const imageCache = useRef<Map<string, HTMLImageElement>>(new Map());

  // ─── State ──────────────────────────────────────────────────────────────────
  const [players, setPlayers]             = useState<Player[]>(getInitialPlayers);
  const [ball, setBall]                   = useState<Ball>({ x: PITCH_W / 2, y: PITCH_H / 2 });
  const [drawings, setDrawings]           = useState<Drawing[]>([]);
  const [movements, setMovements]         = useState<Movement[]>([]);
  const [currentDraw, setCurrentDraw]     = useState<RenderOptions["currentDraw"]>(null);
  const [history, setHistory]             = useState<BoardSnapshot[]>([]);
  const [activeTool, setActiveTool]       = useState<Tool>("select");
  const [drawColor, setDrawColor]         = useState("#ffffff");
  const [drawFilled, setDrawFilled]       = useState(false);
  const [fieldView, setFieldView]         = useState<FieldView>("full");
  const [showNames, setShowNames]         = useState(true);
  const [showZones, setShowZones]         = useState(false);
  const [lightField, setLightField]       = useState(false);
  const [instructions, setInstructions]   = useState("");
  const [selectedPlayerId, setSelectedPlayerId]   = useState<string | null>(null);
  const [selectedDrawingId, setSelectedDrawingId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying]         = useState(false);
  const [isRecording, setIsRecording]     = useState(false);
  const [playProgress, setPlayProgress]   = useState(0);
  const [canvasSize, setCanvasSize]       = useState({ w: 0, h: 0 });
  const [leftOpen, setLeftOpen]           = useState(true);
  const [rightOpen, setRightOpen]         = useState(true);
  const [openDropdown, setOpenDropdown]   = useState<"field" | null>(null);
  const [animMode, setAnimMode]           = useState(false);
  const [activeMovePiece, setActiveMovePiece] = useState<string | null>(null);
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
  const [downloadUrl, setDownloadUrl]     = useState<string | null>(null);
  const [setPieceMode, setPieceModeState] = useState(false);
  const [editingInstrId, setEditingInstrId] = useState<string | null>(null);
  const [editingInstrValue, setEditingInstrValue] = useState("");

  // Sync refs
  useEffect(() => { playersRef.current = players; }, [players]);
  useEffect(() => { ballRef.current = ball; }, [ball]);
  useEffect(() => { drawingsRef.current = drawings; }, [drawings]);
  useEffect(() => { historyRef.current = history; }, [history]);
  useEffect(() => { movementsRef.current = movements; }, [movements]);
  useEffect(() => { animModeRef.current = animMode; }, [animMode]);
  useEffect(() => { activeMovePieceRef.current = activeMovePiece; }, [activeMovePiece]);
  useEffect(() => { setPieceModeRef.current = setPieceMode; }, [setPieceMode]);

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
      view: fieldView, showNames, showZones, lightField,
      currentDraw, selectedPlayerId, selectedDrawingId,
      imageCache: imageCache.current, movements, activeMovePiece, animMode,
      setPieceMode,
    };
    renderBoard(ctx, canvas, players, ball, drawings, options);
  }, [players, ball, drawings, fieldView, showNames, showZones, lightField,
      currentDraw, selectedPlayerId, selectedDrawingId, movements, activeMovePiece, animMode, canvasSize, setPieceMode]);

  // ─── Close dropdowns on outside click ───────────────────────────────────────
  useEffect(() => {
    if (!openDropdown) return;
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [openDropdown]);

  // ─── Keyboard shortcuts ──────────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (editingNameId || pendingText || editingInstrId) return;
      if ((e.ctrlKey || e.metaKey) && e.key === "z") { e.preventDefault(); undo(); }
      if (e.key === "Escape") {
        setSelectedPlayerId(null);
        setSelectedDrawingId(null);
        setActiveMovePiece(null);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingNameId, pendingText, editingInstrId]);

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
    return canvasToLogical(clientX, clientY, canvas, fieldViewRef.current);
  }, []);

  const getR = useCallback((): number => {
    const canvas = canvasRef.current;
    if (!canvas) return 14;
    return getPlayerRadius(canvas, fieldViewRef.current);
  }, []);

  // ─── Pointer handlers ────────────────────────────────────────────────────────
  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    if (editingNameId || pendingText || editingInstrId) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    const { x, y } = toLogical(e.clientX, e.clientY);
    const tool = activeToolRef.current;
    captureHistory();

    // ── Set Piece mode: click player to edit instruction ──
    if (setPieceModeRef.current && tool === "select") {
      const hit = findPlayerAtPoint(playersRef.current, ballRef.current, x, y, getR());
      if (hit?.type === "player") {
        const player = playersRef.current.find(p => p.id === hit.id);
        setEditingInstrId(hit.id);
        setEditingInstrValue(player?.instruction ?? "");
        return;
      }
    }

    // ── Animation mode: add waypoint ──
    if (animModeRef.current && activeMovePieceRef.current) {
      const piece = activeMovePieceRef.current;
      setMovements(prev => {
        const idx = prev.findIndex(m => m.playerId === piece);
        if (idx >= 0) {
          return prev.map(m => m.playerId === piece ? { ...m, waypoints: [...m.waypoints, { x, y }] } : m);
        }
        return [...prev, { playerId: piece, waypoints: [{ x, y }] }];
      });
      return;
    }

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
  }, [toLogical, captureHistory, commitHistory, selectedDrawingId, editingNameId, pendingText, editingInstrId, getR]);

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

  // ─── Set Piece instruction commit ────────────────────────────────────────────
  const confirmInstruction = useCallback(() => {
    if (!editingInstrId) return;
    const val = editingInstrValue.trim();
    setPlayers(prev => prev.map(p => p.id === editingInstrId ? { ...p, instruction: val || undefined } : p));
    setEditingInstrId(null);
    setEditingInstrValue("");
  }, [editingInstrId, editingInstrValue]);

  // ─── Text commit ─────────────────────────────────────────────────────────────
  const commitText = useCallback(() => {
    if (!pendingText || !pendingTextValue.trim()) { setPendingText(null); return; }
    commitHistory();
    setDrawings(prev => [...prev, { id: genId(), tool: "text", start: pendingText, end: pendingText, color: drawColorRef.current, text: pendingTextValue, strokeWidth: 2.5 }]);
    setPendingText(null);
    setPendingTextValue("");
  }, [pendingText, pendingTextValue, commitHistory]);

  // ─── Tool / setting setters ───────────────────────────────────────────────────
  const changeTool = (t: Tool) => { activeToolRef.current = t; setActiveTool(t); setOpenDropdown(null); };
  const changeView = (v: FieldView) => { fieldViewRef.current = v; setFieldView(v); setOpenDropdown(null); };
  const changeColor = (c: string) => { drawColorRef.current = c; setDrawColor(c); };
  const toggleFilled = () => { drawFilledRef.current = !drawFilled; setDrawFilled(v => !v); };
  const toggleNames  = () => { showNamesRef.current = !showNames; setShowNames(v => !v); };
  const toggleZones  = () => { showZonesRef.current = !showZones; setShowZones(v => !v); };
  const toggleLight  = () => { lightFieldRef.current = !lightField; setLightField(v => !v); };

  // ─── Board actions ────────────────────────────────────────────────────────────
  const clearDrawings = () => { setHistory(prev => [...prev.slice(-49), { players, ball, drawings }]); setDrawings([]); };
  const clearAll = () => {
    setHistory(prev => [...prev.slice(-49), { players, ball, drawings }]);
    setDrawings([]);
    setPlayers(getInitialPlayers());
    setBall({ x: PITCH_W / 2, y: PITCH_H / 2 });
    setMovements([]);
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

  // ─── Animation ───────────────────────────────────────────────────────────────
  const stopAnimation = useCallback(() => {
    isPlayingRef.current = false;
    cancelAnimationFrame(animFrameRef.current);
    setIsPlaying(false);
    setIsRecording(false);
    setPlayProgress(0);
  }, []);

  const playAnimation = useCallback(async (shouldRecord: boolean) => {
    const mvs = movementsRef.current;
    if (mvs.every(m => m.waypoints.length === 0) || isPlayingRef.current) return;

    isPlayingRef.current = true;
    setIsPlaying(true);
    setDownloadUrl(null);

    const canvas = canvasRef.current;
    if (!canvas) { stopAnimation(); return; }
    const ctx = canvas.getContext("2d");
    if (!ctx) { stopAnimation(); return; }

    let recorder: MediaRecorder | null = null;
    const chunks: Blob[] = [];

    if (shouldRecord) {
      try {
        const stream = canvas.captureStream(30);
        const mimeType = ["video/webm;codecs=vp9","video/webm;codecs=vp8","video/webm"].find(t => MediaRecorder.isTypeSupported(t)) ?? "video/webm";
        recorder = new MediaRecorder(stream, { mimeType });
        recorder.ondataavailable = (ev) => { if (ev.data.size > 0) chunks.push(ev.data); };
        recorder.start();
        setIsRecording(true);
      } catch { /* not supported */ }
    }

    const maxWps = Math.max(...mvs.map(m => m.waypoints.length), 1);
    const STEP_MS = 1200;
    const totalDuration = maxWps * STEP_MS;

    const startPositions: Record<string, Point> = {};
    for (const mv of mvs) {
      const p = playersRef.current.find(pl => pl.id === mv.playerId);
      startPositions[mv.playerId] = p ? { x: p.x, y: p.y } : { ...ballRef.current };
    }

    await new Promise<void>(resolve => {
      const t0 = performance.now();
      const tick = (now: number) => {
        if (!isPlayingRef.current) { resolve(); return; }
        const elapsed = now - t0;
        const globalT = Math.min(elapsed / totalDuration, 1);
        const eased = globalT < 0.5 ? 2 * globalT * globalT : -1 + (4 - 2 * globalT) * globalT;

        const animPlayers = playersRef.current.map(p => {
          const mv = mvs.find(m => m.playerId === p.id);
          if (!mv || mv.waypoints.length === 0) return p;
          const segCount = mv.waypoints.length;
          const segT = eased * segCount;
          const segIdx = Math.min(Math.floor(segT), segCount - 1);
          const localT = segT - segIdx;
          const fromPos = segIdx === 0 ? (startPositions[p.id] ?? p) : mv.waypoints[segIdx - 1];
          const toPos   = mv.waypoints[segIdx];
          return { ...p, x: fromPos.x + (toPos.x - fromPos.x) * localT, y: fromPos.y + (toPos.y - fromPos.y) * localT };
        });

        const ballMv = mvs.find(m => m.playerId === "__ball__");
        let animBall = { ...ballRef.current };
        if (ballMv && ballMv.waypoints.length > 0) {
          const segCount = ballMv.waypoints.length;
          const segT = eased * segCount;
          const segIdx = Math.min(Math.floor(segT), segCount - 1);
          const localT = segT - segIdx;
          const fromPos = segIdx === 0 ? (startPositions["__ball__"] ?? animBall) : ballMv.waypoints[segIdx - 1];
          const toPos   = ballMv.waypoints[segIdx];
          animBall = { x: fromPos.x + (toPos.x - fromPos.x) * localT, y: fromPos.y + (toPos.y - fromPos.y) * localT };
        }

        const opts: RenderOptions = {
          view: fieldViewRef.current, showNames: showNamesRef.current, showZones: showZonesRef.current,
          lightField: lightFieldRef.current, currentDraw: null, selectedPlayerId: null, selectedDrawingId: null,
          imageCache: imageCache.current, movements: movementsRef.current, activeMovePiece: null, animMode: true,
          setPieceMode: false,
        };
        renderBoard(ctx, canvas, animPlayers, animBall, drawingsRef.current, opts);
        setPlayProgress(globalT);

        if (globalT < 1) { animFrameRef.current = requestAnimationFrame(tick); }
        else { resolve(); }
      };
      animFrameRef.current = requestAnimationFrame(tick);
    });

    if (recorder && recorder.state !== "inactive") {
      recorder.stop();
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: "video/webm" });
        setDownloadUrl(URL.createObjectURL(blob));
      };
    }

    isPlayingRef.current = false;
    setIsPlaying(false);
    setIsRecording(false);
    setPlayProgress(0);
  }, [stopAnimation]);

  // ─── Animation: clear paths ───────────────────────────────────────────────
  const clearPath = (pieceId: string) => setMovements(prev => prev.filter(m => m.playerId !== pieceId));
  const clearAllPaths = () => setMovements([]);

  // ─── Cursor ──────────────────────────────────────────────────────────────────
  const getCursor = () => {
    if (animMode && activeMovePiece) return "crosshair";
    if (activeTool === "eraser") return "cell";
    if (activeTool === "select") return "default";
    return "crosshair";
  };

  // ─── Text overlay position ────────────────────────────────────────────────────
  const getTextOverlayPos = () => {
    const canvas = canvasRef.current;
    if (!canvas || !pendingText) return null;
    return logicalToCanvas(pendingText.x, pendingText.y, canvas, fieldView);
  };

  const textPos = getTextOverlayPos();

  // ─── Instruction overlay position ─────────────────────────────────────────────
  const instrOverlayPos = (() => {
    const canvas = canvasRef.current;
    if (!canvas || !editingInstrId) return null;
    const player = players.find(p => p.id === editingInstrId);
    if (!player) return null;
    return logicalToCanvas(player.x, player.y, canvas, fieldView);
  })();

  // ─── UI helpers ──────────────────────────────────────────────────────────────
  const teamA = players.filter(p => p.team === "A").sort((a, b) => a.number - b.number);
  const teamB = players.filter(p => p.team === "B").sort((a, b) => a.number - b.number);

  const activeFieldInfo = FIELD_FORMATS.find(f => f.value === fieldView)!;

  const getMovementCount = (id: string) => movements.find(m => m.playerId === id)?.waypoints.length ?? 0;

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

        {/* Tactical Systems accordion */}
        <button
          onClick={() => setOpenTacticTeam(isOpenTactic ? null : team)}
          className="w-full flex items-center justify-between text-[10px] px-2 py-1 rounded bg-secondary/50 border border-border/30 mb-1 hover:bg-secondary/80 transition-colors"
        >
          <span className="font-semibold">Tactical Systems</span>
          <ChevronDown className={`h-3 w-3 transition-transform ${isOpenTactic ? "rotate-180" : ""}`} />
        </button>

        {isOpenTactic && (
          <div className="mb-1 rounded border border-border/30 bg-secondary/20 overflow-hidden">
            {FORMATION_GROUPS.map(grp => (
              <div key={grp.label}>
                <button
                  onClick={() => setOpenTacticGroup(v => v === grp.label ? null : grp.label)}
                  className="w-full flex items-center justify-between text-[10px] px-2 py-1 text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors"
                >
                  <span>{grp.label}</span>
                  <ChevronRight className={`h-2.5 w-2.5 transition-transform ${openTacticGroup === grp.label ? "rotate-90" : ""}`} />
                </button>
                {openTacticGroup === grp.label && (
                  <div className="px-1 pb-1 flex flex-wrap gap-0.5">
                    {grp.formations.map(f => (
                      <button
                        key={f}
                        onClick={() => applyFormation(team, f)}
                        className="text-[9px] px-1.5 py-0.5 rounded border border-border hover:border-muted-foreground/50 bg-card/50 font-mono transition-colors hover:bg-secondary"
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

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
              {/* Set Piece instruction field */}
              {setPieceMode && (
                <input
                  value={p.instruction ?? ""}
                  onChange={e => setPlayers(prev => prev.map(pl => pl.id === p.id ? { ...pl, instruction: e.target.value || undefined } : pl))}
                  placeholder="Instrução..."
                  className="w-full ml-6 mt-0.5 text-[9px] px-1.5 py-0.5 rounded bg-secondary/40 border border-border/30 text-muted-foreground outline-none focus:border-primary/60 focus:text-foreground transition-colors"
                  style={{ maxWidth: "calc(100% - 1.5rem)" }}
                />
              )}
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
      <div className="flex-none bg-card border-b border-border flex flex-wrap items-center gap-0.5 px-2 py-1 shrink-0" ref={dropdownRef}>

        {/* Select */}
        <Button
          size="sm" variant={activeTool === "select" ? "default" : "ghost"}
          className="h-8 w-8 p-0 shrink-0" title="Select / Move"
          onClick={() => changeTool("select")}
        >
          <MousePointer2 className="h-4 w-4" />
        </Button>

        <div className="w-px h-5 bg-border mx-1 shrink-0" />

        {/* ── Grupo Pitch Size (azul) ────────────────────────── */}
        <div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-blue-500/10 border border-blue-500/25 shrink-0">
          <div className="relative">
            <button
              onClick={() => setOpenDropdown(v => v === "field" ? null : "field")}
              className="flex items-center gap-1 h-7 px-2 rounded text-xs font-medium text-blue-400 hover:bg-blue-500/15 transition-colors"
            >
              <span className="hidden sm:inline">⬛ {activeFieldInfo?.label}</span>
              <span className="sm:hidden">Pitch</span>
              <ChevronDown className="h-3 w-3" />
            </button>
            {openDropdown === "field" && (
              <div className="absolute top-full left-0 mt-1 z-50 bg-card border border-border rounded-lg shadow-xl p-1 min-w-[200px] max-h-[400px] overflow-y-auto">
                {(() => {
                  let lastGroup = "";
                  return FIELD_FORMATS.map(f => {
                    const groupHeader = f.group !== lastGroup ? (lastGroup = f.group, (
                      <p key={`g-${f.group}`} className="px-2 pt-2 pb-0.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{f.group}</p>
                    )) : null;
                    return [groupHeader, (
                      <button key={f.value} onClick={() => changeView(f.value)}
                        className={`w-full flex flex-col items-start px-3 py-1.5 rounded text-xs transition-colors hover:bg-secondary ${fieldView === f.value ? "bg-secondary font-semibold" : ""}`}>
                        <span>{f.label}</span>
                        <span className="text-[10px] text-muted-foreground">{f.desc}</span>
                      </button>
                    )];
                  });
                })()}
              </div>
            )}
          </div>
        </div>

        <div className="w-px h-5 bg-border mx-1 shrink-0" />

        {/* ── Grupo Actions (laranja) ────────────────────────── */}
        <div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-orange-500/10 border border-orange-500/25 shrink-0">
          <Button size="sm" variant="ghost" className="h-7 px-2 gap-1 text-xs text-orange-400 hover:bg-orange-500/15 hover:text-orange-300 shrink-0" title="Undo (Ctrl+Z)"
            onClick={undo} disabled={history.length === 0}>
            <Undo2 className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Undo</span>
          </Button>
          <Button size="sm" variant="ghost" className="h-7 px-2 gap-1 text-xs text-orange-400 hover:bg-orange-500/15 hover:text-orange-300 shrink-0" title="Clear all drawings"
            onClick={clearDrawings}>
            <Eraser className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Clear</span>
          </Button>
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

        <div className="w-px h-5 bg-border mx-1 shrink-0" />

        {/* ── Grupo View (roxo) ──────────────────────────────── */}
        <div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-purple-500/10 border border-purple-500/25 shrink-0">
          <Button size="sm" variant={showNames ? "default" : "ghost"} className="h-7 px-2 text-xs text-purple-400 hover:bg-purple-500/15 hover:text-purple-300 data-[state=active]:bg-purple-500/30 shrink-0 gap-1" onClick={toggleNames}
            style={showNames ? { background: 'rgba(168,85,247,0.25)', color: '#c084fc' } : {}}>
            {showNames ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
            <span className="hidden sm:inline">Names</span>
          </Button>
          <Button size="sm" variant={showZones ? "default" : "ghost"} className="h-7 px-2 text-xs text-purple-400 hover:bg-purple-500/15 hover:text-purple-300 shrink-0"
            style={showZones ? { background: 'rgba(168,85,247,0.25)', color: '#c084fc' } : {}}
            onClick={toggleZones}>
            Zone
          </Button>
          <Button size="sm" variant={lightField ? "default" : "ghost"} className="h-7 px-2 text-xs text-purple-400 hover:bg-purple-500/15 hover:text-purple-300 shrink-0"
            style={lightField ? { background: 'rgba(168,85,247,0.25)', color: '#c084fc' } : {}}
            onClick={toggleLight}>
            Light
          </Button>
        </div>

        <div className="w-px h-5 bg-border mx-1 shrink-0" />

        {/* ── Grupo Individual Instruction (teal) ───────────── */}
        <div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-teal-500/10 border border-teal-500/25 shrink-0">
          <Button
            size="sm"
            variant="ghost"
            className="h-7 px-2 text-xs shrink-0 gap-1.5 text-teal-400 hover:bg-teal-500/15 hover:text-teal-300"
            style={setPieceMode ? { background: 'rgba(20,184,166,0.25)', color: '#2dd4bf' } : {}}
            title="Individual Instruction — click player to add instruction"
            onClick={() => { setPieceModeState(v => !v); setEditingInstrId(null); changeTool("select"); }}
          >
            <ClipboardList className="h-3 w-3 shrink-0" />
            <span className="hidden sm:flex flex-col items-start leading-none gap-0">
              <span className="text-[10px] leading-none">Individual</span>
              <span className="text-[10px] leading-none">Instruction</span>
            </span>
          </Button>
        </div>

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

          {/* Set Piece instruction overlay */}
          {editingInstrId && instrOverlayPos && (() => {
            const player = players.find(p => p.id === editingInstrId);
            if (!player) return null;
            return (
              <div
                style={{ left: instrOverlayPos.x + 16, top: instrOverlayPos.y - 14, zIndex: 60 }}
                className="absolute bg-card border border-border rounded-lg shadow-2xl p-2 flex flex-col gap-1.5 min-w-[200px]"
              >
                <p className="text-[10px] font-bold text-muted-foreground">
                  #{player.number} {player.name || "Player"}
                </p>
                <input
                  autoFocus
                  value={editingInstrValue}
                  onChange={e => setEditingInstrValue(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === "Enter") confirmInstruction();
                    if (e.key === "Escape") setEditingInstrId(null);
                  }}
                  onBlur={confirmInstruction}
                  className="text-xs bg-background border border-border rounded px-2 py-1 outline-none focus:border-primary"
                  placeholder="Ex: defende poste..."
                />
                <div className="flex gap-1">
                  <button onClick={confirmInstruction}
                    className="flex-1 text-[10px] px-2 py-0.5 rounded bg-primary text-primary-foreground hover:bg-primary/80 transition-colors">
                    OK
                  </button>
                  <button onClick={() => { setPlayers(prev => prev.map(p => p.id === editingInstrId ? { ...p, instruction: undefined } : p)); setEditingInstrId(null); }}
                    className="flex-1 text-[10px] px-2 py-0.5 rounded bg-secondary text-muted-foreground hover:text-foreground transition-colors">
                    Clear
                  </button>
                </div>
              </div>
            );
          })()}

          {/* Playing progress overlay */}
          {isPlaying && (
            <div className="absolute top-2 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/70 rounded-full px-3 py-1.5">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <div className="w-32 h-1.5 bg-border rounded-full overflow-hidden">
                <div className="h-full bg-[#00D66C] transition-all" style={{ width: `${playProgress * 100}%` }} />
              </div>
              <button onClick={stopAnimation} className="text-white/80 hover:text-white">
                <StopCircle className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        {/* ── Right panel ────────────────────────────────────────────────────── */}
        <div className={`flex-none bg-card border-l border-border overflow-y-auto transition-all duration-200 ${rightOpen ? "w-52" : "w-0 overflow-hidden"}`}>
          <div className="p-2 min-w-[13rem]">

            {/* Animation Mode Toggle */}
            <button
              onClick={() => { setAnimMode(v => !v); setActiveMovePiece(null); }}
              className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all mb-2 ${animMode ? "bg-[#00D66C]/20 border-[#00D66C]/50 text-[#00D66C]" : "border-border/40 bg-secondary/30 text-muted-foreground hover:text-foreground"}`}
            >
              <Waypoints className="h-3.5 w-3.5" />
              {animMode ? "Animation Mode ON" : "Animation Mode"}
            </button>

            {animMode ? (
              <>
                <p className="text-[10px] text-muted-foreground mb-1.5">
                  Click a piece → then click on the field to add waypoints
                </p>

                {/* Piece list */}
                <div className="space-y-0.5 mb-2">
                  {/* Ball */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setActiveMovePiece(v => v === "__ball__" ? null : "__ball__")}
                      className={`flex-1 flex items-center gap-1.5 text-[10px] px-2 py-1 rounded border transition-colors ${activeMovePiece === "__ball__" ? "border-yellow-400/60 bg-yellow-400/10 text-yellow-400" : "border-border/30 bg-secondary/20 text-muted-foreground hover:text-foreground"}`}
                    >
                      <span>⚽</span>
                      <span>Ball</span>
                      {getMovementCount("__ball__") > 0 && (
                        <span className="ml-auto text-[9px] bg-yellow-400/20 text-yellow-400 rounded px-1">{getMovementCount("__ball__")}</span>
                      )}
                    </button>
                    {getMovementCount("__ball__") > 0 && (
                      <button onClick={() => clearPath("__ball__")} className="text-muted-foreground/50 hover:text-red-400 transition-colors">
                        <Trash2 className="h-3 w-3" />
                      </button>
                    )}
                  </div>

                  {/* Team A */}
                  <p className="text-[9px] text-muted-foreground/60 mt-1">{teamAName}</p>
                  {teamA.map(p => (
                    <div key={p.id} className="flex items-center gap-1">
                      <button
                        onClick={() => setActiveMovePiece(v => v === p.id ? null : p.id)}
                        className={`flex-1 flex items-center gap-1.5 text-[10px] px-2 py-1 rounded border transition-colors ${activeMovePiece === p.id ? "border-[#7B1E3C]/60 bg-[#7B1E3C]/20 text-[#c45f7a]" : "border-border/30 bg-secondary/20 text-muted-foreground hover:text-foreground"}`}
                      >
                        <span className="w-4 h-4 rounded-full text-[9px] text-white flex items-center justify-center flex-shrink-0"
                          style={{ background: BORDEAUX }}>
                          {p.number}
                        </span>
                        <span className="truncate">{p.name || `#${p.number}`}</span>
                        {getMovementCount(p.id) > 0 && (
                          <span className="ml-auto text-[9px] bg-[#7B1E3C]/20 text-[#c45f7a] rounded px-1">{getMovementCount(p.id)}</span>
                        )}
                      </button>
                      {getMovementCount(p.id) > 0 && (
                        <button onClick={() => clearPath(p.id)} className="text-muted-foreground/50 hover:text-red-400 transition-colors">
                          <Trash2 className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  ))}

                  {/* Team B */}
                  <p className="text-[9px] text-muted-foreground/60 mt-1">{teamBName}</p>
                  {teamB.map(p => (
                    <div key={p.id} className="flex items-center gap-1">
                      <button
                        onClick={() => setActiveMovePiece(v => v === p.id ? null : p.id)}
                        className={`flex-1 flex items-center gap-1.5 text-[10px] px-2 py-1 rounded border transition-colors ${activeMovePiece === p.id ? "border-[#0A3060]/60 bg-[#0A3060]/30 text-[#5b9bd5]" : "border-border/30 bg-secondary/20 text-muted-foreground hover:text-foreground"}`}
                      >
                        <span className="w-4 h-4 rounded-full text-[9px] text-white flex items-center justify-center flex-shrink-0"
                          style={{ background: OCEAN }}>
                          {p.number}
                        </span>
                        <span className="truncate">{p.name || `#${p.number}`}</span>
                        {getMovementCount(p.id) > 0 && (
                          <span className="ml-auto text-[9px] bg-[#0A3060]/20 text-[#5b9bd5] rounded px-1">{getMovementCount(p.id)}</span>
                        )}
                      </button>
                      {getMovementCount(p.id) > 0 && (
                        <button onClick={() => clearPath(p.id)} className="text-muted-foreground/50 hover:text-red-400 transition-colors">
                          <Trash2 className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Clear all paths */}
                {movements.length > 0 && (
                  <button onClick={clearAllPaths}
                    className="w-full text-[10px] px-2 py-1 rounded border border-red-500/30 text-red-400 hover:bg-red-500/10 mb-2 transition-colors">
                    ✕ Clear All Paths
                  </button>
                )}

                {/* Playback */}
                <div className="space-y-1 mb-2">
                  <Button size="sm" className="w-full h-7 text-xs bg-[#00D66C]/80 hover:bg-[#00D66C] text-white border-0 gap-1"
                    onClick={() => playAnimation(false)} disabled={movements.every(m => m.waypoints.length === 0) || isPlaying}>
                    <Play className="h-3 w-3" /> Play
                  </Button>
                  <Button size="sm"
                    className={`w-full h-7 text-xs text-white border-0 gap-1 ${isRecording ? "bg-red-600 hover:bg-red-700" : "bg-red-500/80 hover:bg-red-500"}`}
                    onClick={isRecording ? stopAnimation : () => playAnimation(true)}
                    disabled={movements.every(m => m.waypoints.length === 0) || (isPlaying && !isRecording)}>
                    {isRecording
                      ? <><StopCircle className="h-3 w-3" /> Stop & Save</>
                      : <><span>⏺</span> Record + Download</>
                    }
                  </Button>
                  {isPlaying && (
                    <div className="w-full h-1.5 bg-border rounded-full overflow-hidden">
                      <div className="h-full bg-[#00D66C] transition-all" style={{ width: `${playProgress * 100}%` }} />
                    </div>
                  )}
                </div>

                {/* Download link */}
                {downloadUrl && (
                  <a href={downloadUrl} download={`coach-lab-${Date.now()}.webm`}
                    className="block w-full text-center text-[10px] px-2 py-1.5 rounded bg-[#00D66C]/20 border border-[#00D66C]/40 text-[#00D66C] hover:bg-[#00D66C]/30 transition-colors">
                    ⬇ Download Video (.webm)
                  </a>
                )}
              </>
            ) : (
              <>
                {/* Non-animation mode: Instructions */}
                <p className="text-xs font-semibold text-foreground mb-1">Notes</p>
                <textarea
                  value={instructions}
                  onChange={e => setInstructions(e.target.value)}
                  placeholder="Tactical notes…"
                  className="w-full h-40 text-xs bg-secondary/30 border border-border rounded p-1.5 resize-none text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
