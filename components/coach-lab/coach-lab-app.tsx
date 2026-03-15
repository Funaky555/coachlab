"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  Camera, ChevronDown, ChevronLeft, ChevronRight,
  Eye, EyeOff, ImagePlus, MousePointer2, Trash2,
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
  "1-4-3-3":   [{ x:0.04,y:.50 },{ x:.20,y:.10 },{ x:.20,y:.37 },{ x:.20,y:.63 },{ x:.20,y:.90 },{ x:.41,y:.27 },{ x:.42,y:.50 },{ x:.41,y:.73 },{ x:.65,y:.15 },{ x:.68,y:.50 },{ x:.65,y:.85 }],
  "1-4-4-2":   [{ x:0.04,y:.50 },{ x:.20,y:.10 },{ x:.20,y:.37 },{ x:.20,y:.63 },{ x:.20,y:.90 },{ x:.42,y:.10 },{ x:.42,y:.37 },{ x:.42,y:.63 },{ x:.42,y:.90 },{ x:.64,y:.33 },{ x:.64,y:.67 }],
  "1-4-2-3-1": [{ x:0.04,y:.50 },{ x:.20,y:.10 },{ x:.20,y:.37 },{ x:.20,y:.63 },{ x:.20,y:.90 },{ x:.37,y:.37 },{ x:.37,y:.63 },{ x:.53,y:.15 },{ x:.54,y:.50 },{ x:.53,y:.85 },{ x:.69,y:.50 }],
  "1-3-5-2":   [{ x:0.04,y:.50 },{ x:.20,y:.22 },{ x:.20,y:.50 },{ x:.20,y:.78 },{ x:.39,y:.08 },{ x:.41,y:.30 },{ x:.42,y:.50 },{ x:.41,y:.70 },{ x:.39,y:.92 },{ x:.63,y:.35 },{ x:.63,y:.65 }],
  "1-3-6-1":   [{ x:0.04,y:.50 },{ x:.20,y:.22 },{ x:.20,y:.50 },{ x:.20,y:.78 },{ x:.37,y:.10 },{ x:.40,y:.28 },{ x:.41,y:.44 },{ x:.41,y:.56 },{ x:.40,y:.72 },{ x:.37,y:.90 },{ x:.68,y:.50 }],
  "1-3-4-3":   [{ x:0.04,y:.50 },{ x:.20,y:.22 },{ x:.20,y:.50 },{ x:.20,y:.78 },{ x:.40,y:.15 },{ x:.40,y:.40 },{ x:.40,y:.60 },{ x:.40,y:.85 },{ x:.63,y:.15 },{ x:.66,y:.50 },{ x:.63,y:.85 }],
  "1-4-5-1":   [{ x:0.04,y:.50 },{ x:.20,y:.10 },{ x:.20,y:.37 },{ x:.20,y:.63 },{ x:.20,y:.90 },{ x:.42,y:.10 },{ x:.42,y:.30 },{ x:.43,y:.50 },{ x:.42,y:.70 },{ x:.42,y:.90 },{ x:.68,y:.50 }],
  "1-4-1-4-1": [{ x:0.04,y:.50 },{ x:.20,y:.10 },{ x:.20,y:.37 },{ x:.20,y:.63 },{ x:.20,y:.90 },{ x:.34,y:.50 },{ x:.50,y:.10 },{ x:.50,y:.35 },{ x:.50,y:.65 },{ x:.50,y:.90 },{ x:.68,y:.50 }],
  "1-5-4-1":   [{ x:0.04,y:.50 },{ x:.20,y:.08 },{ x:.20,y:.27 },{ x:.20,y:.50 },{ x:.20,y:.73 },{ x:.20,y:.92 },{ x:.42,y:.15 },{ x:.42,y:.38 },{ x:.42,y:.62 },{ x:.42,y:.85 },{ x:.68,y:.50 }],
  "1-5-3-2":   [{ x:0.04,y:.50 },{ x:.20,y:.08 },{ x:.20,y:.27 },{ x:.20,y:.50 },{ x:.20,y:.73 },{ x:.20,y:.92 },{ x:.42,y:.27 },{ x:.43,y:.50 },{ x:.42,y:.73 },{ x:.65,y:.33 },{ x:.65,y:.67 }],
  "1-5-2-3":   [{ x:0.04,y:.50 },{ x:.20,y:.08 },{ x:.20,y:.27 },{ x:.20,y:.50 },{ x:.20,y:.73 },{ x:.20,y:.92 },{ x:.40,y:.38 },{ x:.40,y:.62 },{ x:.63,y:.15 },{ x:.66,y:.50 },{ x:.63,y:.85 }],
  "1-4-3-2-1": [{ x:0.04,y:.50 },{ x:.20,y:.10 },{ x:.20,y:.37 },{ x:.20,y:.63 },{ x:.20,y:.90 },{ x:.38,y:.25 },{ x:.39,y:.50 },{ x:.38,y:.75 },{ x:.53,y:.38 },{ x:.53,y:.62 },{ x:.68,y:.50 }],
  "1-4-1-2-3": [{ x:0.04,y:.50 },{ x:.20,y:.10 },{ x:.20,y:.37 },{ x:.20,y:.63 },{ x:.20,y:.90 },{ x:.34,y:.50 },{ x:.48,y:.38 },{ x:.48,y:.62 },{ x:.63,y:.15 },{ x:.66,y:.50 },{ x:.63,y:.85 }],
  "1-3-4-2-1": [{ x:0.04,y:.50 },{ x:.20,y:.22 },{ x:.20,y:.50 },{ x:.20,y:.78 },{ x:.37,y:.15 },{ x:.38,y:.38 },{ x:.38,y:.62 },{ x:.37,y:.85 },{ x:.53,y:.38 },{ x:.53,y:.62 },{ x:.68,y:.50 }],
  "1-4-4-1-1": [{ x:0.04,y:.50 },{ x:.20,y:.10 },{ x:.20,y:.37 },{ x:.20,y:.63 },{ x:.20,y:.90 },{ x:.40,y:.10 },{ x:.40,y:.37 },{ x:.40,y:.63 },{ x:.40,y:.90 },{ x:.55,y:.50 },{ x:.68,y:.50 }],
  "1-3-3-4":   [{ x:0.04,y:.50 },{ x:.20,y:.22 },{ x:.20,y:.50 },{ x:.20,y:.78 },{ x:.39,y:.25 },{ x:.40,y:.50 },{ x:.39,y:.75 },{ x:.60,y:.10 },{ x:.62,y:.38 },{ x:.62,y:.62 },{ x:.60,y:.90 }],
  "1-4-2-2-2": [{ x:0.04,y:.50 },{ x:.20,y:.10 },{ x:.20,y:.37 },{ x:.20,y:.63 },{ x:.20,y:.90 },{ x:.37,y:.38 },{ x:.37,y:.62 },{ x:.52,y:.38 },{ x:.52,y:.62 },{ x:.65,y:.33 },{ x:.65,y:.67 }],
  "1-3-4-1-2": [{ x:0.04,y:.50 },{ x:.20,y:.22 },{ x:.20,y:.50 },{ x:.20,y:.78 },{ x:.37,y:.15 },{ x:.38,y:.38 },{ x:.38,y:.62 },{ x:.37,y:.85 },{ x:.53,y:.50 },{ x:.65,y:.33 },{ x:.65,y:.67 }],
  "1-4-6-0":   [{ x:0.04,y:.50 },{ x:.20,y:.10 },{ x:.20,y:.37 },{ x:.20,y:.63 },{ x:.20,y:.90 },{ x:.40,y:.10 },{ x:.41,y:.28 },{ x:.42,y:.46 },{ x:.42,y:.54 },{ x:.41,y:.72 },{ x:.40,y:.90 }],
  "1-2-3-5":   [{ x:0.04,y:.50 },{ x:.20,y:.33 },{ x:.20,y:.67 },{ x:.39,y:.22 },{ x:.40,y:.50 },{ x:.39,y:.78 },{ x:.60,y:.08 },{ x:.62,y:.27 },{ x:.64,y:.50 },{ x:.62,y:.73 },{ x:.60,y:.92 }],
  "1-4-3-1-2": [{ x:0.04,y:.50 },{ x:.20,y:.10 },{ x:.20,y:.37 },{ x:.20,y:.63 },{ x:.20,y:.90 },{ x:.38,y:.25 },{ x:.39,y:.50 },{ x:.38,y:.75 },{ x:.53,y:.50 },{ x:.65,y:.33 },{ x:.65,y:.67 }],
  "1-3-1-4-2": [{ x:0.04,y:.50 },{ x:.20,y:.22 },{ x:.20,y:.50 },{ x:.20,y:.78 },{ x:.33,y:.50 },{ x:.48,y:.15 },{ x:.49,y:.38 },{ x:.49,y:.62 },{ x:.48,y:.85 },{ x:.65,y:.33 },{ x:.65,y:.67 }],
  "1-4-1-3-2": [{ x:0.04,y:.50 },{ x:.20,y:.10 },{ x:.20,y:.37 },{ x:.20,y:.63 },{ x:.20,y:.90 },{ x:.34,y:.50 },{ x:.49,y:.27 },{ x:.50,y:.50 },{ x:.49,y:.73 },{ x:.65,y:.33 },{ x:.65,y:.67 }],
  "1-3-2-4-1": [{ x:0.04,y:.50 },{ x:.20,y:.22 },{ x:.20,y:.50 },{ x:.20,y:.78 },{ x:.36,y:.38 },{ x:.36,y:.62 },{ x:.52,y:.15 },{ x:.53,y:.38 },{ x:.53,y:.62 },{ x:.52,y:.85 },{ x:.68,y:.50 }],
};

// Position labels per formation (player numbers 1–11 in order)
const POSITION_LABELS: Record<FormationName, string[]> = {
  // 5 defenders
  "1-5-4-1":   ["GK","RWB","CB","CB","CB","LWB","RM","CM","CM","LM","ST"],
  "1-5-3-2":   ["GK","RWB","CB","CB","CB","LWB","CM","CM","CM","ST","ST"],
  "1-5-2-3":   ["GK","RWB","CB","CB","CB","LWB","CM","CM","RW","ST","LW"],
  // 4 defenders
  "1-4-3-3":   ["GK","RB","CB","CB","LB","CM","CM","CM","RW","ST","LW"],
  "1-4-4-2":   ["GK","RB","CB","CB","LB","RM","CM","CM","LM","ST","ST"],
  "1-4-2-3-1": ["GK","RB","CB","CB","LB","CDM","CDM","RW","CAM","LW","ST"],
  "1-4-5-1":   ["GK","RB","CB","CB","LB","RM","CM","CM","CM","LM","ST"],
  "1-4-1-4-1": ["GK","RB","CB","CB","LB","CDM","RM","CM","CM","LM","ST"],
  "1-4-3-2-1": ["GK","RB","CB","CB","LB","CM","CM","CM","SS","SS","ST"],
  "1-4-1-2-3": ["GK","RB","CB","CB","LB","CDM","CM","CM","RW","ST","LW"],
  "1-4-4-1-1": ["GK","RB","CB","CB","LB","RM","CM","CM","LM","SS","ST"],
  "1-4-2-2-2": ["GK","RB","CB","CB","LB","CDM","CDM","CM","CM","ST","ST"],
  "1-4-6-0":   ["GK","RB","CB","CB","LB","RM","CM","CM","CM","CM","LM"],
  "1-4-3-1-2": ["GK","RB","CB","CB","LB","CM","CM","CM","CAM","ST","ST"],
  "1-4-1-3-2": ["GK","RB","CB","CB","LB","CDM","CM","CAM","CM","ST","ST"],
  // 3 defenders
  "1-3-5-2":   ["GK","CB","CB","CB","RWB","CM","CM","CM","LWB","ST","ST"],
  "1-3-6-1":   ["GK","CB","CB","CB","RWB","CM","CM","CM","CM","LWB","ST"],
  "1-3-4-3":   ["GK","CB","CB","CB","RM","CM","CM","LM","RW","ST","LW"],
  "1-3-4-2-1": ["GK","CB","CB","CB","RM","CM","CM","LM","SS","SS","ST"],
  "1-3-3-4":   ["GK","CB","CB","CB","CM","CM","CM","RW","SS","ST","LW"],
  "1-3-4-1-2": ["GK","CB","CB","CB","RM","CM","CM","LM","CAM","ST","ST"],
  "1-3-1-4-2": ["GK","CB","CB","CB","CDM","RM","CM","CM","LM","ST","ST"],
  "1-3-2-4-1": ["GK","CB","CB","CB","CDM","CDM","RM","CM","LM","CAM","ST"],
  // 2 defenders
  "1-2-3-5":   ["GK","CB","CB","CM","CM","CM","RW","SS","ST","SS","LW"],
};

const FORMATION_GROUPS = [
  { label: "5 Def", formations: ["1-5-4-1","1-5-3-2","1-5-2-3"] as FormationName[] },
  { label: "4 Def", formations: ["1-4-3-3","1-4-4-2","1-4-2-3-1","1-4-5-1","1-4-1-4-1","1-4-3-2-1","1-4-1-2-3","1-4-4-1-1","1-4-2-2-2","1-4-6-0","1-4-3-1-2","1-4-1-3-2"] as FormationName[] },
  { label: "3 Def", formations: ["1-3-5-2","1-3-6-1","1-3-4-3","1-3-4-2-1","1-3-3-4","1-3-4-1-2","1-3-1-4-2","1-3-2-4-1"] as FormationName[] },
  { label: "2 Def", formations: ["1-2-3-5"] as FormationName[] },
];

const VIEW_LABELS: Record<FieldView, string> = {
  'full':           'Full Pitch',
  'half-left':      'Left Half',
  'half-right':     'Right Half',
  'corner-left':    'Left Corner',
  'corner-right':   'Right Corner',
  'penalty':        'Penalty',
  'seven-aside':    '7-a-side',
  'five-aside':     '5-a-side / Futsal',
  'canto-esq-sup':  '↖ Top-Left Corner',
  'canto-esq-inf':  '↙ Bottom-Left Corner',
  'canto-dir-sup':  '↗ Top-Right Corner',
  'canto-dir-inf':  '↘ Bottom-Right Corner',
  'lancamento-sup': '↑ Top Throw-in',
  'lancamento-inf': '↓ Bottom Throw-in',
  'livre-esq':      '◀ Left Free Kick',
  'livre-dir':      '▶ Right Free Kick',
};

const VIEW_GROUPS: { label: string; views: FieldView[] }[] = [
  { label: 'Pitch', views: ['full'] },
  { label: 'Half Pitches', views: ['half-left', 'half-right', 'penalty'] },
  { label: 'Small-Sided', views: ['seven-aside', 'five-aside'] },
  { label: 'Corners', views: ['canto-esq-sup', 'canto-esq-inf', 'canto-dir-sup', 'canto-dir-inf'] },
  { label: 'Throw-ins', views: ['lancamento-sup', 'lancamento-inf'] },
  { label: 'Free Kicks', views: ['livre-esq', 'livre-dir'] },
];

function genId() { return Math.random().toString(36).slice(2, 9) + Date.now().toString(36); }

function makeTeamOnBorder(team: "A" | "B"): Player[] {
  const x = team === "A" ? PL + 20 : PR - 20;
  return Array.from({ length: 11 }, (_, i) => ({
    id: `${team}${i + 1}`,
    team,
    type: i === 0 ? "goalkeeper" : "player",
    number: i + 1,
    name: "",
    x,
    y: (PT + 20) + i * ((PB - PT - 40) / 10),
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
  const ballRef        = useRef<Ball>({ x: -500, y: -500 });
  const drawingsRef    = useRef<Drawing[]>([]);
  const renderOptsRef      = useRef<RenderOptions | null>(null);
  const isDraggingBallRef  = useRef(false);
  // [PREMIUM] showNamesRef, showZonesRef, lightFieldRef, movementsRef, animModeRef, activeMovePieceRef, setPieceModeRef

  // Image cache for player photos
  const imageCache = useRef<Map<string, HTMLImageElement>>(new Map());

  // Pitch background image
  const pitchBgRef = useRef<HTMLImageElement | null>(null);
  const [pitchBgLoaded, setPitchBgLoaded] = useState(false);
  useEffect(() => {
    const img = new Image();
    img.src = '/pitch-grass.jpg';
    img.onload = () => { pitchBgRef.current = img; setPitchBgLoaded(true); };
  }, []);

  // Ball image
  const ballImgRef = useRef<HTMLImageElement | null>(null);
  const [ballImgLoaded, setBallImgLoaded] = useState(false);
  useEffect(() => {
    const img = new Image();
    img.src = '/ball.png';
    img.onload = () => { ballImgRef.current = img; setBallImgLoaded(true); };
  }, []);

  // ─── State ──────────────────────────────────────────────────────────────────
  const [players, setPlayers]             = useState<Player[]>(getInitialPlayers);
  const [ball, setBall]                   = useState<Ball>({ x: -500, y: -500 });
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
  const [fieldView, setFieldView]         = useState<FieldView>("full");
  const [leftOpen, setLeftOpen]           = useState(true);
  const [rightOpen, setRightOpen]         = useState(true);
  const [openTacticTeam, setOpenTacticTeam] = useState<"A" | "B" | null>(null);
  const [openTacticGroup, setOpenTacticGroup] = useState<string | null>(FORMATION_GROUPS[1].label);
  const [showPositions, setShowPositions]   = useState(false);
  const [teamAFormation, setTeamAFormation] = useState<FormationName | null>(null);
  const [teamBFormation, setTeamBFormation] = useState<FormationName | null>(null);
  const [pendingText, setPendingText]     = useState<Point | null>(null);
  const [pendingTextValue, setPendingTextValue] = useState("");
  const [editingNameId, setEditingNameId] = useState<string | null>(null);
  const [editingNameValue, setEditingNameValue] = useState("");
  const [teamAName, setTeamAName]         = useState("Team A");
  const [teamBName, setTeamBName]         = useState("Team B");
  const [scoreA, setScoreA]               = useState(0);
  const [scoreB, setScoreB]               = useState(0);
  const [teamABadge, setTeamABadge]       = useState<string | null>(null);
  const [teamBBadge, setTeamBBadge]       = useState<string | null>(null);
  const [editingTeamId, setEditingTeamId] = useState<"A" | "B" | null>(null);
  const [editingTeamValue, setEditingTeamValue] = useState("");
  // [PREMIUM] movements, showNames, showZones, lightField, isPlaying, isRecording, playProgress
  // [PREMIUM] openDropdown, animMode, activeMovePiece, downloadUrl, setPieceMode, editingInstrId, editingInstrValue

  // Sync refs — useLayoutEffect garante que os refs estão atualizados
  // antes do paint e do próximo evento de input (evita captureHistory stale)
  useLayoutEffect(() => { playersRef.current = players; }, [players]);
  useLayoutEffect(() => { ballRef.current = ball; }, [ball]);
  useLayoutEffect(() => { drawingsRef.current = drawings; }, [drawings]);
  useLayoutEffect(() => { historyRef.current = history; }, [history]);
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
    if (isDraggingBallRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas || canvas.width === 0) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    // Build playerLabels map from current formations
    const playerLabels = new Map<string, string>();
    for (const p of players) {
      const formation = p.team === "A" ? teamAFormation : teamBFormation;
      if (formation && POSITION_LABELS[formation]) {
        const label = POSITION_LABELS[formation][p.number - 1];
        if (label) playerLabels.set(p.id, label);
      }
    }
    const options: RenderOptions = {
      view: fieldView, showNames: true, showZones: false, lightField: false,
      currentDraw, selectedPlayerId, selectedDrawingId,
      imageCache: imageCache.current,
      movements: [], activeMovePiece: null, animMode: false, setPieceMode: false,
      pitchBgImage: pitchBgRef.current,
      ballImage: ballImgRef.current,
      showPositions,
      playerLabels,
    };
    renderOptsRef.current = options;
    renderBoard(ctx, canvas, players, ball, drawings, options);
  }, [players, ball, drawings, currentDraw, selectedPlayerId, selectedDrawingId, canvasSize, pitchBgLoaded, ballImgLoaded, fieldView, showPositions, teamAFormation, teamBFormation]);

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
    const next = h.slice(0, -1);
    // Atualizar refs imediatamente para evitar estado stale em captureHistory
    // e para suportar múltiplos undos rápidos sem esperar pelo render
    historyRef.current = next;
    playersRef.current = last.players;
    ballRef.current = last.ball;
    drawingsRef.current = last.drawings;
    setPlayers(last.players);
    setBall(last.ball);
    setDrawings(last.drawings);
    setHistory(next);
  }, []);

  // ─── Coord helper ────────────────────────────────────────────────────────────
  const toLogical = useCallback((clientX: number, clientY: number): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    return canvasToLogical(clientX, clientY, canvas, fieldView);
  }, [fieldView]);

  const getR = useCallback((): number => {
    const canvas = canvasRef.current;
    if (!canvas) return 14;
    return getPlayerRadius(canvas, fieldView);
  }, [fieldView]);

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
        if (hit.type === "ball") {
          isDraggingBallRef.current = true;
        }
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
      const M = 20; // margin so pins stay inside field lines
      const clamped = { x: Math.max(PL + M, Math.min(PR - M, x - draggingRef.current.offsetX)), y: Math.max(PT + M, Math.min(PB - M, y - draggingRef.current.offsetY)) };
      if (draggingRef.current.type === "player") {
        const id = draggingRef.current.id;
        // Update ref directly — same fast path as ball drag (no React re-render cycle)
        playersRef.current = playersRef.current.map(p => p.id === id ? { ...p, ...clamped } : p);
        const cvs = canvasRef.current;
        const opts = renderOptsRef.current;
        if (cvs && opts) {
          const ctx = cvs.getContext("2d");
          if (ctx) renderBoard(ctx, cvs, playersRef.current, ballRef.current, drawingsRef.current, opts);
        }
      } else {
        ballRef.current = clamped;
        const cvs = canvasRef.current;
        const opts = renderOptsRef.current;
        if (cvs && opts) {
          const ctx = cvs.getContext("2d");
          if (ctx) renderBoard(ctx, cvs, playersRef.current, clamped, drawingsRef.current, opts);
        }
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

    if (wasDragging) {
      if (canvasRef.current) canvasRef.current.style.cursor = getCursor();
      if (draggingRef.current?.type === "ball") {
        isDraggingBallRef.current = false;
        setBall({ ...ballRef.current });
      } else if (draggingRef.current?.type === "player") {
        // Sync ref → React state now that drag ended (for history/undo)
        setPlayers([...playersRef.current]);
      }
    }

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
    setBall({ x: -500, y: -500 });
  };
  const ballToCenter = () => { setHistory(prev => [...prev.slice(-49), { players, ball, drawings }]); setBall(ball.x === -500 ? { x: PITCH_W / 2, y: PITCH_H / 2 } : { x: -500, y: -500 }); };

  const applyFormation = (team: "A" | "B", formation: FormationName) => {
    setHistory(prev => [...prev.slice(-49), { players, ball, drawings }]);
    if (team === "A") setTeamAFormation(formation);
    else setTeamBFormation(formation);
    const positions = FORMATIONS[formation];
    setPlayers(prev => {
      const others = prev.filter(p => p.team !== team);
      const base = prev.some(p => p.team === team) ? prev.filter(p => p.team === team) : makeTeamOnBorder(team);
      const updated = base.map(p => {
        const pos = positions[p.number - 1];
        if (!pos) return p;
        const rawX = PL + pos.x * (PR - PL);
        const rawY = PT + pos.y * (PB - PT);
        return { ...p, x: team === "A" ? rawX : PITCH_W - rawX, y: rawY };
      });
      return [...others, ...updated];
    });
  };

  const resetToBorder = (team: "A" | "B") => {
    setHistory(prev => [...prev.slice(-49), { players, ball, drawings }]);
    setPlayers(prev => {
      const others = prev.filter(p => p.team !== team);
      const teamPlayers = prev.some(p => p.team === team)
        ? prev.filter(p => p.team === team).map(p => ({
            ...p,
            x: team === "A" ? PL + 20 : PR - 20,
            y: (PT + 20) + (p.number - 1) * ((PB - PT - 40) / 10),
          }))
        : makeTeamOnBorder(team);
      return [...others, ...teamPlayers];
    });
  };

  const resetAllNames = () => {
    setHistory(prev => [...prev.slice(-49), { players, ball, drawings }]);
    setPlayers(prev => prev.map(p => ({ ...p, name: "" })));
  };

  const togglePlayerVisibility = (id: string) => {
    setHistory(prev => [...prev.slice(-49), { players, ball, drawings }]);
    setPlayers(prev => prev.map(p => p.id === id ? { ...p, visible: !p.visible } : p));
  };

  const updatePlayerName = (id: string, name: string) => {
    captureHistory();
    setPlayers(prev => prev.map(p => p.id === id ? { ...p, name } : p));
    commitHistory();
  };

  const handlePhotoUpload = (id: string, file: File) => {
    captureHistory();
    const reader = new FileReader();
    reader.onload = (ev) => {
      const data = ev.target?.result as string;
      setPlayers(prev => prev.map(p => p.id === id ? { ...p, photo: data } : p));
      commitHistory();
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

  const takeScreenshotWithScore = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const scoreBarH = 54;
    const combined = document.createElement("canvas");
    combined.width = canvas.width;
    combined.height = canvas.height + scoreBarH;
    const ctx = combined.getContext("2d")!;

    // Score bar background
    const grad = ctx.createLinearGradient(0, 0, combined.width, 0);
    grad.addColorStop(0, "#0d1117");
    grad.addColorStop(0.5, "#0f172a");
    grad.addColorStop(1, "#0d1117");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, combined.width, scoreBarH);

    // Separator line
    ctx.strokeStyle = "rgba(255,255,255,0.07)";
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, scoreBarH); ctx.lineTo(combined.width, scoreBarH); ctx.stroke();

    const midY = scoreBarH / 2;

    // Draw field canvas
    ctx.drawImage(canvas, 0, scoreBarH);

    const doRender = () => {
      // Team A name
      ctx.fillStyle = "#CC0000";
      ctx.font = "bold 16px Inter, system-ui, sans-serif";
      ctx.textBaseline = "middle";
      ctx.textAlign = "left";
      const badgePadA = teamABadge ? 32 : 0;
      ctx.fillText(teamAName, 24 + badgePadA, midY);

      // Score A
      ctx.fillStyle = "#ffffff";
      ctx.font = "900 28px Inter, system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(String(scoreA), combined.width / 2 - 30, midY);

      // VS
      ctx.fillStyle = "rgba(255,255,255,0.22)";
      ctx.font = "10px monospace";
      ctx.fillText("vs", combined.width / 2, midY);

      // Score B
      ctx.fillStyle = "#ffffff";
      ctx.font = "900 28px Inter, system-ui, sans-serif";
      ctx.fillText(String(scoreB), combined.width / 2 + 30, midY);

      // Team B name
      ctx.fillStyle = "#0277BD";
      ctx.font = "bold 16px Inter, system-ui, sans-serif";
      ctx.textAlign = "right";
      const badgePadB = teamBBadge ? 32 : 0;
      ctx.fillText(teamBName, combined.width - 24 - badgePadB, midY);

      const link = document.createElement("a");
      link.download = `coach-lab-score-${Date.now()}.png`;
      link.href = combined.toDataURL("image/png");
      link.click();
    };

    // Draw badges then render text
    const promises: Promise<void>[] = [];
    if (teamABadge) {
      promises.push(new Promise(resolve => {
        const img = new Image();
        img.onload = () => { ctx.drawImage(img, 24, midY - 12, 24, 24); resolve(); };
        img.src = teamABadge;
      }));
    }
    if (teamBBadge) {
      const badgePadB = teamBBadge ? 32 : 0;
      promises.push(new Promise(resolve => {
        const img = new Image();
        img.onload = () => { ctx.drawImage(img, combined.width - 48 - badgePadB, midY - 12, 24, 24); resolve(); };
        img.src = teamBBadge;
      }));
    }
    Promise.all(promises).then(doRender);
  }, [teamAName, teamBName, scoreA, scoreB, teamABadge, teamBBadge]);

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
    const uiAccent = team === "A" ? "#FF4D88" : "#4D9BFF";
    const label = team === "A" ? teamAName : teamBName;
    const badge = team === "A" ? teamABadge : teamBBadge;
    const isOpenTactic = openTacticTeam === team;
    const isEditingTeam = editingTeamId === team;

    const uploadBadge = () => {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";
      input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = ev => {
          const result = ev.target?.result as string;
          if (team === "A") setTeamABadge(result);
          else setTeamBBadge(result);
        };
        reader.readAsDataURL(file);
      };
      input.click();
    };

    return (
      <div className="mb-0.5">
        {/* Team header card */}
        <div className="rounded-md mb-1 px-2 py-1" style={{
          background: `linear-gradient(135deg, ${uiAccent}18, ${uiAccent}06)`,
          border: `1px solid ${uiAccent}35`,
        }}>
          <div className="flex items-center justify-between gap-1">
            {/* Badge upload */}
            <button
              onClick={uploadBadge}
              className="flex-none w-6 h-6 rounded overflow-hidden flex items-center justify-center transition-all shrink-0"
              style={{ border: `1px dashed ${uiAccent}50`, background: "rgba(0,0,0,0.3)" }}
              title="Upload escudo do clube"
            >
              {badge ? (
                <img src={badge} className="w-full h-full object-contain" alt="" />
              ) : (
                <span className="text-[9px]" style={{ color: `${uiAccent}80` }}>⬆</span>
              )}
            </button>
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
                className="flex-1 min-w-0 text-xs font-bold px-1 py-0 rounded outline-none"
                style={{ color: uiAccent, background: "transparent", borderBottom: `1px solid ${uiAccent}60` }}
                placeholder={team === "A" ? "Team A" : "Team B"}
              />
            ) : (
              <button
                className="text-xs font-bold text-left transition-opacity hover:opacity-80 truncate"
                style={{ color: uiAccent, textShadow: `0 0 12px ${uiAccent}60` }}
                title="Click to rename"
                onClick={() => { setEditingTeamId(team); setEditingTeamValue(label); }}
              >
                {label} <span className="opacity-50 text-[9px]">✎</span>
              </button>
            )}
            <button
              onClick={() => resetToBorder(team)}
              className="flex-none text-[8px] px-1.5 py-0.5 rounded-md transition-all duration-150 font-medium tracking-wide"
              style={{ color: uiAccent, opacity: 0.5, border: `1px solid ${uiAccent}30` }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.opacity = "1"; (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 0 8px ${uiAccent}40`; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.opacity = "0.5"; (e.currentTarget as HTMLButtonElement).style.boxShadow = "none"; }}
              title="Reset to border"
            >
              ↩ Reset
            </button>
          </div>
        </div>

        {/* Formations — always visible */}
        <div className="mb-1 rounded-md overflow-hidden" style={{ background: "rgba(0,0,0,0.35)", border: `1px solid ${uiAccent}20` }}>
          <div className="flex gap-0.5 p-1" style={{ background: "rgba(0,0,0,0.2)" }}>
            {FORMATION_GROUPS.map(grp => {
              const isActive = openTacticGroup === grp.label;
              return (
                <button
                  key={grp.label}
                  onClick={() => setOpenTacticGroup(isActive ? null : grp.label)}
                  className="flex-1 text-[9px] py-0.5 rounded font-bold transition-all duration-150"
                  style={isActive
                    ? { background: `${uiAccent}28`, border: `1px solid ${uiAccent}65`, color: uiAccent, boxShadow: `0 0 8px ${uiAccent}35` }
                    : { color: "rgba(255,255,255,0.3)", border: "1px solid rgba(255,255,255,0.06)" }
                  }
                >
                  {grp.label}
                </button>
              );
            })}
          </div>
          {openTacticGroup && (() => {
            const grp = FORMATION_GROUPS.find(g => g.label === openTacticGroup);
            if (!grp) return null;
            return (
              <div className="p-1 grid grid-cols-2 gap-0.5">
                {grp.formations.map(f => (
                  <button
                    key={f}
                    onClick={() => applyFormation(team, f)}
                    className="text-[9px] py-0.5 px-0.5 rounded font-mono text-center transition-all duration-150"
                    style={{ lineHeight: 1.2, color: "rgba(255,255,255,0.35)", border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.02)" }}
                    onMouseEnter={e => {
                      const el = e.currentTarget as HTMLButtonElement;
                      el.style.background = `${uiAccent}22`;
                      el.style.borderColor = `${uiAccent}60`;
                      el.style.color = uiAccent;
                      el.style.boxShadow = `0 0 6px ${uiAccent}30`;
                    }}
                    onMouseLeave={e => {
                      const el = e.currentTarget as HTMLButtonElement;
                      el.style.background = "rgba(255,255,255,0.02)";
                      el.style.borderColor = "rgba(255,255,255,0.08)";
                      el.style.color = "rgba(255,255,255,0.35)";
                      el.style.boxShadow = "none";
                    }}
                  >
                    {f}
                  </button>
                ))}
              </div>
            );
          })()}
        </div>

        {/* Player list */}
        <div className="space-y-px">
          {list.map(p => (
            <div key={p.id}>
              <div
                className="flex items-center gap-1 group px-1 py-0.5 rounded transition-all duration-100"
                style={{ background: "transparent" }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = `${uiAccent}0a`; }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = "transparent"; }}
              >
                {/* Visibility */}
                <button onClick={() => togglePlayerVisibility(p.id)} className="flex-none transition-opacity" style={{ opacity: p.visible ? 0.4 : 0.2 }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.opacity = "1"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.opacity = p.visible ? "0.4" : "0.2"; }}>
                  {p.visible ? <Eye className="h-3 w-3" style={{ color: uiAccent }} /> : <EyeOff className="h-3 w-3" />}
                </button>
                {/* Number / position badge */}
                {(() => {
                  const formation = team === "A" ? teamAFormation : teamBFormation;
                  const posLabel = showPositions && formation ? POSITION_LABELS[formation]?.[p.number - 1] : null;
                  return (
                    <span
                      className={`flex-none rounded-full flex items-center justify-center font-bold text-white flex-shrink-0 ${posLabel ? "text-[7px] px-1 h-4" : "w-4 h-4 text-[8px]"}`}
                      style={{
                        background: p.type === "goalkeeper"
                          ? (team === "A" ? "#4A0F22" : "#051E3E")
                          : color,
                        boxShadow: `0 0 6px ${uiAccent}55`,
                      }}
                    >
                      {posLabel ?? p.number}
                    </span>
                  );
                })()}
                {/* Name */}
                {editingNameId === p.id ? (
                  <input
                    autoFocus
                    value={editingNameValue}
                    onChange={e => setEditingNameValue(e.target.value)}
                    onBlur={() => { updatePlayerName(p.id, editingNameValue); setEditingNameId(null); }}
                    onKeyDown={e => { if (e.key === "Enter") { updatePlayerName(p.id, editingNameValue); setEditingNameId(null); } if (e.key === "Escape") setEditingNameId(null); }}
                    className="flex-1 min-w-0 text-[10px] px-1 py-0.5 rounded outline-none"
                    style={{ background: `${uiAccent}15`, border: `1px solid ${uiAccent}50`, color: "white" }}
                    placeholder="Player name"
                  />
                ) : (
                  <button
                    onClick={() => { setEditingNameId(p.id); setEditingNameValue(p.name); }}
                    className="flex-1 min-w-0 text-left text-[10px] truncate transition-colors"
                    style={{ color: p.name ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.5)" }}
                    title="Click to edit name"
                  >
                    {p.name || <span className="italic">Name…</span>}
                  </button>
                )}
                {/* Photo upload */}
                <label className="flex-none cursor-pointer opacity-0 group-hover:opacity-50 hover:!opacity-100 transition-opacity">
                  <ImagePlus className="h-3 w-3" style={{ color: uiAccent }} />
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
        <div className={`flex-none border-r overflow-hidden transition-all duration-200 ${leftOpen ? "w-52" : "w-0"}`}
          style={{ background: "linear-gradient(180deg, #0d1117 0%, #0a0e0c 100%)", borderColor: "rgba(255,255,255,0.06)" }}>
          <div className="p-1 min-w-[13rem]">
            <TeamPanel team="A" />
            <div className="w-full h-px my-0.5" style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)" }} />
            <TeamPanel team="B" />
          </div>
        </div>

        {/* ── Canvas ─────────────────────────────────────────────────────────── */}
        <div ref={containerRef} className="flex-1 flex flex-col overflow-hidden min-w-0">

          {/* ── Action bar above field ───────────────────────────────────────── */}
          <div className="flex-none flex justify-center items-center gap-1 py-1 border-b" style={{ background: "#000", borderColor: "rgba(255,255,255,0.08)" }}>
            <Button size="sm" variant="ghost"
              className="h-7 px-2 gap-1 text-xs text-orange-400 hover:bg-orange-500/15 hover:text-orange-300"
              title="Reset everything" onClick={clearAll}>
              <Trash2 className="h-3.5 w-3.5" /><span>Reset</span>
            </Button>
            <div className="w-px h-4 bg-border/50" />
            <Button size="sm" variant="ghost"
              className={`h-7 px-2 gap-1 text-xs transition-all ${ball.x !== -500 ? "text-green-300 bg-green-500/20 ring-1 ring-green-500/40" : "text-green-400 hover:bg-green-500/15 hover:text-green-300"}`}
              title="Toggle ball" onClick={ballToCenter}>
              ⚽<span>Bola</span>
            </Button>
            <div className="w-px h-4 bg-border/50" />
            <Button size="sm" variant="ghost"
              className={`h-7 px-2 gap-1 text-xs transition-all ${showPositions ? "text-yellow-300 bg-yellow-500/20 ring-1 ring-yellow-500/40" : "text-yellow-500/70 hover:bg-yellow-500/15 hover:text-yellow-300"}`}
              title="Alternar números / posições" onClick={() => setShowPositions(v => !v)}>
              <span className="font-semibold">{showPositions ? "Positions" : "Numbers"}</span>
            </Button>
            <div className="w-px h-4 bg-border/50" />
            <Button size="sm" variant="ghost"
              className="h-7 px-2 gap-1 text-xs text-green-400 hover:bg-green-500/15 hover:text-green-300"
              title="Screenshot do campo (PNG)" onClick={takeScreenshot}>
              <Camera className="h-3.5 w-3.5" /><span>Field Photo</span>
            </Button>
            <div className="w-px h-4 bg-border/50" />
            <Button size="sm" variant="ghost"
              className="h-7 px-2 gap-1 text-xs text-blue-400 hover:bg-blue-500/15 hover:text-blue-300"
              title="Screenshot com score (PNG)" onClick={takeScreenshotWithScore}>
              <Camera className="h-3.5 w-3.5" /><span>Field Photo + Score</span>
            </Button>
          </div>

          {/* ── Score Overlay ──────────────────────────────────────────────────── */}
          <div className="flex-none flex items-center justify-center gap-4 py-2 px-4"
            style={{ background: "linear-gradient(90deg, #0d1117 0%, #0f172a 50%, #0d1117 100%)", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>

            {/* Team A */}
            <div className="flex items-center gap-2">
              {teamABadge && <img src={teamABadge} className="h-7 w-7 object-contain rounded" alt="" />}
              <span className="text-sm font-bold tracking-wide" style={{ color: "#CC0000", textShadow: "0 0 14px #CC000077" }}>
                {teamAName}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setScoreA(s => Math.max(0, s - 1))}
                  className="w-5 h-5 rounded text-xs flex items-center justify-center transition-all hover:bg-white/10"
                  style={{ color: "rgba(255,255,255,0.35)", border: "1px solid rgba(255,255,255,0.1)" }}>−</button>
                <span className="w-8 text-center text-2xl font-black tabular-nums" style={{ color: "#fff", textShadow: "0 0 20px rgba(255,255,255,0.35)", fontVariantNumeric: "tabular-nums" }}>
                  {scoreA}
                </span>
                <button
                  onClick={() => setScoreA(s => s + 1)}
                  className="w-5 h-5 rounded text-xs flex items-center justify-center transition-all hover:bg-white/10"
                  style={{ color: "rgba(255,255,255,0.35)", border: "1px solid rgba(255,255,255,0.1)" }}>+</button>
              </div>
            </div>

            {/* VS */}
            <span className="text-[10px] font-mono tracking-[0.4em] uppercase" style={{ color: "rgba(255,255,255,0.18)" }}>vs</span>

            {/* Team B */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setScoreB(s => Math.max(0, s - 1))}
                  className="w-5 h-5 rounded text-xs flex items-center justify-center transition-all hover:bg-white/10"
                  style={{ color: "rgba(255,255,255,0.35)", border: "1px solid rgba(255,255,255,0.1)" }}>−</button>
                <span className="w-8 text-center text-2xl font-black tabular-nums" style={{ color: "#fff", textShadow: "0 0 20px rgba(255,255,255,0.35)", fontVariantNumeric: "tabular-nums" }}>
                  {scoreB}
                </span>
                <button
                  onClick={() => setScoreB(s => s + 1)}
                  className="w-5 h-5 rounded text-xs flex items-center justify-center transition-all hover:bg-white/10"
                  style={{ color: "rgba(255,255,255,0.35)", border: "1px solid rgba(255,255,255,0.1)" }}>+</button>
              </div>
              <span className="text-sm font-bold tracking-wide" style={{ color: "#0277BD", textShadow: "0 0 14px #0277BD77" }}>
                {teamBName}
              </span>
              {teamBBadge && <img src={teamBBadge} className="h-7 w-7 object-contain rounded" alt="" />}
            </div>
          </div>

          {/* ── Field ─────────────────────────────────────────────────────────── */}
          <div className="flex-1 relative overflow-hidden">
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
          </div>{/* end field */}
        </div>{/* end containerRef */}

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
