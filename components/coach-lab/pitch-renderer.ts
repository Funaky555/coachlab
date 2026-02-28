import type { Player, Ball, Drawing, Point, FieldView, ViewBounds, Movement, RenderOptions } from './types';

// ─── Pitch dimensions (logical units) ────────────────────────────────────────
export const PITCH_W = 1050;
export const PITCH_H = 680;

const PL = 15;
const PR = 1035;
const PT = 15;
const PB = 665;
const CENTER_X = 525;
const CENTER_Y = 340;
const CENTER_CIRCLE_R = 88;
const PENALTY_DEPTH = 160;
const PENALTY_HEIGHT = 386;
const GOAL_AREA_DEPTH = 53;
const GOAL_AREA_HEIGHT = 174;
const PENALTY_SPOT_OFFSET = 107;
const CORNER_R = 10;
const BALL_R = 12;
const PENALTY_ARC_ANGLE = Math.acos(53 / 88);
const GOAL_HALF = 35;
const GOAL_DEPTH = 15;

// ─── Team colors ─────────────────────────────────────────────────────────────
export const BORDEAUX      = '#7B1E3C';
export const BORDEAUX_GK   = '#4A0F22';
export const OCEAN         = '#0A3060';
export const OCEAN_GK      = '#051E3E';
export const SELECTED_GLOW = '#FFD700';

// ─── View bounds ─────────────────────────────────────────────────────────────
export function getViewBounds(view: FieldView): ViewBounds {
  switch (view) {
    case 'full':         return { viewX: 0,   viewY: 0, viewW: PITCH_W,     viewH: PITCH_H };
    case 'half-left':    return { viewX: 0,   viewY: 0, viewW: PITCH_W / 2, viewH: PITCH_H };
    case 'half-right':   return { viewX: PITCH_W / 2, viewY: 0, viewW: PITCH_W / 2, viewH: PITCH_H };
    // Cantos — visão completa em altura, profundidade da baliza
    case 'corner-left':  return { viewX: 0,   viewY: 0, viewW: 350, viewH: PITCH_H };
    case 'corner-right': return { viewX: 700, viewY: 0, viewW: 350, viewH: PITCH_H };
    // Penálti — do meio-campo até à baliza, linhas laterais visíveis
    case 'penalty':      return { viewX: 450, viewY: 0, viewW: 600, viewH: PITCH_H };
    case 'five-aside':   return { viewX: 260, viewY: 140, viewW: 530, viewH: 400 };
    case 'seven-aside':  return { viewX: 130, viewY: 60,  viewW: 790, viewH: 560 };
    // Cantos — cada canto da bandeirola com área penalti
    case 'canto-esq-sup': return { viewX: 0,   viewY: 0,   viewW: 310, viewH: 370 };
    case 'canto-esq-inf': return { viewX: 0,   viewY: 310, viewW: 310, viewH: 370 };
    case 'canto-dir-sup': return { viewX: 740, viewY: 0,   viewW: 310, viewH: 370 };
    case 'canto-dir-inf': return { viewX: 740, viewY: 310, viewW: 310, viewH: 370 };
    // Lançamentos — linha lateral superior e inferior, zona central
    case 'lancamento-sup': return { viewX: 175, viewY: 0,   viewW: 700, viewH: 360 };
    case 'lancamento-inf': return { viewX: 175, viewY: 320, viewW: 700, viewH: 360 };
    // Livres / Bola parada — zona de ataque esquerda e direita
    case 'livre-esq': return { viewX: 0,   viewY: 80, viewW: 490, viewH: 520 };
    case 'livre-dir': return { viewX: 560, viewY: 80, viewW: 490, viewH: 520 };
  }
}

export function setupTransform(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, view: FieldView) {
  const { viewX, viewY, viewW, viewH } = getViewBounds(view);
  const w = canvas.width;
  const h = canvas.height;
  ctx.setTransform(w / viewW, 0, 0, h / viewH, -viewX * (w / viewW), -viewY * (h / viewH));
}

// ─── Coordinate conversion ────────────────────────────────────────────────────
export function canvasToLogical(clientX: number, clientY: number, canvas: HTMLCanvasElement, view: FieldView): Point {
  const rect = canvas.getBoundingClientRect();
  const { viewX, viewY, viewW, viewH } = getViewBounds(view);
  return {
    x: viewX + ((clientX - rect.left) / rect.width) * viewW,
    y: viewY + ((clientY - rect.top) / rect.height) * viewH,
  };
}

export function logicalToCanvas(lx: number, ly: number, canvas: HTMLCanvasElement, view: FieldView): Point {
  const { viewX, viewY, viewW, viewH } = getViewBounds(view);
  const rect = canvas.getBoundingClientRect();
  return {
    x: ((lx - viewX) / viewW) * rect.width,
    y: ((ly - viewY) / viewH) * rect.height,
  };
}

// ─── Player radius — scales with view so pins stay proportional to field ─────
export function getPlayerRadius(_canvas: HTMLCanvasElement, view: FieldView): number {
  const { viewH } = getViewBounds(view);
  return Math.max(6, viewH * 0.026);
}

// ─── Pitch drawing ────────────────────────────────────────────────────────────
export function drawPitch(ctx: CanvasRenderingContext2D, lightMode: boolean, showZones: boolean, bgImage?: HTMLImageElement | null) {
  if (bgImage) {
    // Foto real — só a imagem, sem linhas programáticas duplicadas
    ctx.drawImage(bgImage, 0, 0, PITCH_W, PITCH_H);
    if (showZones) {
      ctx.fillStyle = 'rgba(255,255,255,0.20)';
      ctx.font = 'bold 28px Inter, system-ui, sans-serif';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('DEF', CENTER_X * 0.4, CENTER_Y);
      ctx.fillText('MID', CENTER_X, CENTER_Y);
      ctx.fillText('ATK', CENTER_X * 1.6, CENTER_Y);
      ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'left';
    }
    return;
  }

  const lineColor = 'rgba(255,255,255,0.95)';
  const lw = 2.5;

  // Faixas horizontais — aspeto moderno de estádio
  const green1 = lightMode ? '#4db35a' : '#1a7a40';
  const green2 = lightMode ? '#3da04a' : '#166535';
  for (let i = 0; i < 10; i++) {
    ctx.fillStyle = i % 2 === 0 ? green1 : green2;
    ctx.fillRect(0, i * (PITCH_H / 10), PITCH_W, PITCH_H / 10);
  }

  // Linhas com leve glow
  ctx.save();
  ctx.shadowColor = 'rgba(255,255,255,0.3)';
  ctx.shadowBlur = 3;
  ctx.strokeStyle = lineColor;
  ctx.lineWidth = lw;
  ctx.strokeRect(PL, PT, PR - PL, PB - PT);
  ctx.beginPath(); ctx.moveTo(CENTER_X, PT); ctx.lineTo(CENTER_X, PB); ctx.stroke();
  ctx.beginPath(); ctx.arc(CENTER_X, CENTER_Y, CENTER_CIRCLE_R, 0, Math.PI * 2); ctx.stroke();
  ctx.fillStyle = lineColor;
  ctx.beginPath(); ctx.arc(CENTER_X, CENTER_Y, 3, 0, Math.PI * 2); ctx.fill();

  // Left side
  const leftSpotX = PL + PENALTY_SPOT_OFFSET;
  ctx.strokeRect(PL, CENTER_Y - PENALTY_HEIGHT / 2, PENALTY_DEPTH, PENALTY_HEIGHT);
  ctx.strokeRect(PL, CENTER_Y - GOAL_AREA_HEIGHT / 2, GOAL_AREA_DEPTH, GOAL_AREA_HEIGHT);
  ctx.fillStyle = lineColor;
  ctx.beginPath(); ctx.arc(leftSpotX, CENTER_Y, 3, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(leftSpotX, CENTER_Y, CENTER_CIRCLE_R, -PENALTY_ARC_ANGLE, PENALTY_ARC_ANGLE); ctx.stroke();

  // Right side
  const rightSpotX = PR - PENALTY_SPOT_OFFSET;
  ctx.strokeRect(PR - PENALTY_DEPTH, CENTER_Y - PENALTY_HEIGHT / 2, PENALTY_DEPTH, PENALTY_HEIGHT);
  ctx.strokeRect(PR - GOAL_AREA_DEPTH, CENTER_Y - GOAL_AREA_HEIGHT / 2, GOAL_AREA_DEPTH, GOAL_AREA_HEIGHT);
  ctx.fillStyle = lineColor;
  ctx.beginPath(); ctx.arc(rightSpotX, CENTER_Y, 3, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(rightSpotX, CENTER_Y, CENTER_CIRCLE_R, Math.PI - PENALTY_ARC_ANGLE, Math.PI + PENALTY_ARC_ANGLE); ctx.stroke();

  // Corner arcs
  ctx.beginPath(); ctx.arc(PL, PT, CORNER_R, 0, Math.PI / 2); ctx.stroke();
  ctx.beginPath(); ctx.arc(PR, PT, CORNER_R, Math.PI / 2, Math.PI); ctx.stroke();
  ctx.beginPath(); ctx.arc(PL, PB, CORNER_R, -Math.PI / 2, 0); ctx.stroke();
  ctx.beginPath(); ctx.arc(PR, PB, CORNER_R, -Math.PI, -Math.PI / 2); ctx.stroke();
  ctx.restore();

  // Balizas mais sólidas
  ctx.save();
  ctx.shadowColor = 'rgba(255,255,255,0.4)';
  ctx.shadowBlur = 4;
  ctx.fillStyle = 'rgba(255,255,255,0.25)';
  ctx.fillRect(0, CENTER_Y - GOAL_HALF, GOAL_DEPTH, GOAL_HALF * 2);
  ctx.fillRect(PR, CENTER_Y - GOAL_HALF, GOAL_DEPTH, GOAL_HALF * 2);
  ctx.strokeStyle = 'rgba(255,255,255,1.0)';
  ctx.lineWidth = 2;
  ctx.strokeRect(0, CENTER_Y - GOAL_HALF, GOAL_DEPTH, GOAL_HALF * 2);
  ctx.strokeRect(PR, CENTER_Y - GOAL_HALF, GOAL_DEPTH, GOAL_HALF * 2);
  ctx.restore();

  if (showZones) {
    ctx.fillStyle = 'rgba(255,255,255,0.20)';
    ctx.font = 'bold 28px Inter, system-ui, sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('DEF', CENTER_X * 0.4, CENTER_Y);
    ctx.fillText('MID', CENTER_X, CENTER_Y);
    ctx.fillText('ATK', CENTER_X * 1.6, CENTER_Y);
    ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'left';
  }
}

// ─── Players drawing ──────────────────────────────────────────────────────────
export function drawPlayers(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  view: FieldView,
  players: Player[],
  selectedId: string | null,
  showNames: boolean,
  imageCache: Map<string, HTMLImageElement>,
  setPieceMode = false,
) {
  // R in canvas pixels — always a perfect circle regardless of view aspect ratio
  const R = Math.max(8, canvas.height * 0.026);
  const fontSize = Math.max(9, R * 0.82);
  const { viewX, viewY, viewW, viewH } = getViewBounds(view);

  for (const player of players) {
    if (!player.visible) continue;
    const { x, y, team, type, number, name, id, photo } = player;
    const isSelected = id === selectedId;

    // Convert logical position → canvas internal pixels
    const cx = ((x - viewX) / viewW) * canvas.width;
    const cy = ((y - viewY) / viewH) * canvas.height;

    const fillColor = type === 'goalkeeper'
      ? (team === 'A' ? BORDEAUX_GK : OCEAN_GK)
      : (team === 'A' ? BORDEAUX : OCEAN);

    // Draw in canvas-pixel space so circles never distort under non-uniform transforms
    ctx.save();
    ctx.resetTransform();

    // Selection glow ring
    if (isSelected) {
      ctx.save();
      ctx.shadowColor = SELECTED_GLOW;
      ctx.shadowBlur = R * 2.2;
      ctx.beginPath();
      ctx.arc(cx, cy, R + 2, 0, Math.PI * 2);
      ctx.fillStyle = SELECTED_GLOW;
      ctx.globalAlpha = 0.5;
      ctx.fill();
      ctx.restore();
    }

    // Drop shadow + fill
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.55)';
    ctx.shadowBlur = R * 0.5;
    ctx.shadowOffsetX = R * 0.15;
    ctx.shadowOffsetY = R * 0.18;
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.fillStyle = fillColor;
    ctx.fill();
    ctx.restore();

    // Crisp border
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255,255,255,0.70)';
    ctx.lineWidth = Math.max(1.5, R * 0.12);
    ctx.stroke();
    ctx.restore();

    // Photo or number
    const img = photo ? imageCache.get(id) : null;
    if (img && img.complete && img.naturalWidth > 0) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(img, cx - R, cy - R, R * 2, R * 2);
      ctx.restore();
    } else {
      if (type === 'goalkeeper') {
        ctx.fillStyle = 'rgba(255,255,255,0.45)';
        ctx.beginPath();
        ctx.arc(cx, cy - R * 0.52, R * 0.22, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = 'rgba(255,255,255,0.92)';
      ctx.font = `bold ${fontSize}px Inter, system-ui, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(number), cx, type === 'goalkeeper' ? cy + R * 0.18 : cy);
    }

    // Name below pin
    if (showNames && name) {
      const nameFontSize = Math.max(8, fontSize * 0.88);
      ctx.font = `700 ${nameFontSize}px 'Barlow Condensed', 'Inter', system-ui, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.shadowColor = 'rgba(0,0,0,0.85)';
      ctx.shadowBlur = 4;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 1;
      ctx.fillStyle = '#ffffff';
      ctx.fillText(name, cx, cy + R + 3);
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.textBaseline = 'alphabetic';
    }

    // [FUTURE PREMIUM] Set piece instruction label
    if (setPieceMode && player.instruction) {
      const label = player.instruction.slice(0, 24);
      const instrFontSize = Math.max(6, R * 0.52);
      ctx.font = `bold ${instrFontSize}px Inter, system-ui, sans-serif`;
      ctx.textAlign = 'center';
      const tw = ctx.measureText(label).width;
      const labelY = cy + R + (showNames && name ? instrFontSize * 1.6 + 4 : 4);
      ctx.save();
      ctx.fillStyle = 'rgba(0,0,0,0.75)';
      const padX = 4, padY = 2;
      ctx.beginPath();
      const bx = cx - tw / 2 - padX;
      const by = labelY - padY;
      const bw = tw + padX * 2;
      const bh = instrFontSize + padY * 2;
      const br2 = 3;
      ctx.moveTo(bx + br2, by);
      ctx.lineTo(bx + bw - br2, by);
      ctx.quadraticCurveTo(bx + bw, by, bx + bw, by + br2);
      ctx.lineTo(bx + bw, by + bh - br2);
      ctx.quadraticCurveTo(bx + bw, by + bh, bx + bw - br2, by + bh);
      ctx.lineTo(bx + br2, by + bh);
      ctx.quadraticCurveTo(bx, by + bh, bx, by + bh - br2);
      ctx.lineTo(bx, by + br2);
      ctx.quadraticCurveTo(bx, by, bx + br2, by);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
      ctx.fillStyle = '#fff';
      ctx.textBaseline = 'top';
      ctx.fillText(label, cx, labelY);
      ctx.textBaseline = 'alphabetic';
    }

    ctx.restore(); // restore view transform
  }
  ctx.textBaseline = 'alphabetic';
  ctx.textAlign = 'left';
}

// ─── Ball ─────────────────────────────────────────────────────────────────────
export function drawBall(ctx: CanvasRenderingContext2D, ball: Ball) {
  const { x, y } = ball;
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.7)';
  ctx.shadowBlur = 6;
  ctx.shadowOffsetX = 2;
  ctx.shadowOffsetY = 2;
  ctx.beginPath();
  ctx.arc(x, y, BALL_R, 0, Math.PI * 2);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  ctx.strokeStyle = '#111111';
  ctx.lineWidth = 1.2;
  ctx.stroke();
  ctx.restore();

  ctx.fillStyle = '#111111';
  const patches: [number, number, number][] = [
    [x,       y - 4.5, 3.2],
    [x + 6,   y + 3,   2.4],
    [x - 6,   y + 3,   2.4],
    [x + 3.8, y - 6.5, 1.8],
    [x - 3.8, y - 6.5, 1.8],
  ];
  for (const [px, py, pr] of patches) {
    ctx.beginPath();
    ctx.arc(px, py, pr, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ─── Shape helpers ────────────────────────────────────────────────────────────
function computeCurvedCP(start: Point, end: Point): Point {
  const mx = (start.x + end.x) / 2;
  const my = (start.y + end.y) / 2;
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const len = Math.hypot(dx, dy) || 1;
  return { x: mx - (dy / len) * 70, y: my + (dx / len) * 70 };
}

function computeTrianglePts(start: Point, end: Point): [Point, Point, Point] {
  return [
    { x: (start.x + end.x) / 2, y: start.y },
    { x: start.x, y: end.y },
    { x: end.x,   y: end.y },
  ];
}

function drawArrowHead(ctx: CanvasRenderingContext2D, from: Point, to: Point, size = 13) {
  const angle = Math.atan2(to.y - from.y, to.x - from.x);
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(to.x, to.y);
  ctx.lineTo(to.x - size * Math.cos(angle - Math.PI / 6), to.y - size * Math.sin(angle - Math.PI / 6));
  ctx.lineTo(to.x - size * Math.cos(angle + Math.PI / 6), to.y - size * Math.sin(angle + Math.PI / 6));
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

// ─── Shape drawing ────────────────────────────────────────────────────────────
export function drawShape(
  ctx: CanvasRenderingContext2D,
  tool: Drawing['tool'],
  start: Point,
  end: Point,
  color: string,
  filled = false,
  strokeWidth = 2.5,
  text = '',
  points?: Point[],
  isPreview = false,
) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = strokeWidth;
  ctx.setLineDash([]);
  if (isPreview) ctx.globalAlpha = 0.55;

  switch (tool) {
    case 'line': {
      ctx.beginPath();
      ctx.moveTo(start.x, start.y);
      ctx.lineTo(end.x, end.y);
      ctx.stroke();
      break;
    }
    case 'arrow': {
      ctx.beginPath();
      ctx.moveTo(start.x, start.y);
      ctx.lineTo(end.x, end.y);
      ctx.stroke();
      drawArrowHead(ctx, start, end);
      break;
    }
    case 'run': {
      ctx.setLineDash([10, 6]);
      ctx.beginPath();
      ctx.moveTo(start.x, start.y);
      ctx.lineTo(end.x, end.y);
      ctx.stroke();
      ctx.setLineDash([]);
      drawArrowHead(ctx, start, end, 11);
      break;
    }
    case 'curved-arrow': {
      const cp = points?.[0] ?? computeCurvedCP(start, end);
      ctx.beginPath();
      ctx.moveTo(start.x, start.y);
      ctx.quadraticCurveTo(cp.x, cp.y, end.x, end.y);
      ctx.stroke();
      drawArrowHead(ctx, cp, end, 12);
      break;
    }
    case 'double-arrow': {
      ctx.beginPath();
      ctx.moveTo(start.x, start.y);
      ctx.lineTo(end.x, end.y);
      ctx.stroke();
      drawArrowHead(ctx, start, end, 12);
      drawArrowHead(ctx, end, start, 12);
      break;
    }
    case 'wavy-arrow': {
      const dx = end.x - start.x;
      const dy = end.y - start.y;
      const len = Math.hypot(dx, dy) || 1;
      const ux = dx / len;
      const uy = dy / len;
      const AMP = 7;
      const STEPS = Math.ceil(len);
      ctx.beginPath();
      ctx.moveTo(start.x, start.y);
      for (let i = 1; i <= STEPS; i++) {
        const t = i / STEPS;
        const wave = Math.sin(t * len * 0.09 * Math.PI * 2) * AMP;
        ctx.lineTo(start.x + t * dx + wave * (-uy), start.y + t * dy + wave * ux);
      }
      ctx.stroke();
      drawArrowHead(ctx, { x: end.x - 20 * ux, y: end.y - 20 * uy }, end, 13);
      break;
    }
    case 'triangle': {
      const [p0, p1, p2] = (points?.length === 3 ? points : computeTrianglePts(start, end)) as [Point, Point, Point];
      ctx.beginPath();
      ctx.moveTo(p0.x, p0.y);
      ctx.lineTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.closePath();
      if (filled) {
        ctx.save(); ctx.globalAlpha = (ctx.globalAlpha ?? 1) * 0.45; ctx.fill(); ctx.restore();
      }
      ctx.stroke();
      break;
    }
    case 'rect': {
      const w = end.x - start.x;
      const h = end.y - start.y;
      if (filled) {
        ctx.save(); ctx.globalAlpha = (ctx.globalAlpha ?? 1) * 0.3; ctx.fillRect(start.x, start.y, w, h); ctx.restore();
      }
      ctx.strokeRect(start.x, start.y, w, h);
      break;
    }
    case 'circle': {
      const cx = (start.x + end.x) / 2;
      const cy = (start.y + end.y) / 2;
      const rx = Math.abs(end.x - start.x) / 2;
      const ry = Math.abs(end.y - start.y) / 2;
      ctx.beginPath();
      ctx.ellipse(cx, cy, rx || 1, ry || 1, 0, 0, Math.PI * 2);
      if (filled) {
        ctx.save(); ctx.globalAlpha = (ctx.globalAlpha ?? 1) * 0.3; ctx.fill(); ctx.restore();
      }
      ctx.stroke();
      break;
    }
    case 'zone': {
      const w = end.x - start.x;
      const h = end.y - start.y;
      ctx.save();
      ctx.globalAlpha = isPreview ? 0.2 : 0.28;
      ctx.fillRect(start.x, start.y, w, h);
      ctx.restore();
      ctx.save();
      ctx.setLineDash([6, 4]);
      ctx.strokeRect(start.x, start.y, w, h);
      ctx.restore();
      break;
    }
    case 'text': {
      if (text) {
        const sz = Math.max(12, 14 * ((strokeWidth ?? 2.5) / 2.5));
        ctx.fillStyle = color;
        ctx.font = `bold ${sz}px Inter, system-ui, sans-serif`;
        ctx.textBaseline = 'middle';
        ctx.fillText(text, start.x, start.y);
        ctx.textBaseline = 'alphabetic';
      }
      break;
    }
  }
  ctx.restore();
}

// ─── Handle points for selected shapes ───────────────────────────────────────
export function getHandlePoints(drawing: Drawing): Point[] {
  const { start, end, tool, points } = drawing;
  switch (tool) {
    case 'triangle': {
      if (points?.length === 3) return points;
      return computeTrianglePts(start, end);
    }
    case 'rect':
    case 'zone': {
      return [
        { x: start.x, y: start.y },
        { x: end.x,   y: start.y },
        { x: end.x,   y: end.y   },
        { x: start.x, y: end.y   },
      ];
    }
    case 'circle': {
      const cx = (start.x + end.x) / 2;
      const cy = (start.y + end.y) / 2;
      const rx = Math.abs(end.x - start.x) / 2;
      const ry = Math.abs(end.y - start.y) / 2;
      return [
        { x: cx + rx, y: cy },
        { x: cx,      y: cy + ry },
        { x: cx - rx, y: cy },
        { x: cx,      y: cy - ry },
      ];
    }
    case 'curved-arrow': {
      return [start, points?.[0] ?? computeCurvedCP(start, end), end];
    }
    default:
      return [start, end];
  }
}

function drawHandles(ctx: CanvasRenderingContext2D, handles: Point[], R: number) {
  const hs = Math.max(5, R * 0.55);
  ctx.save();
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#333333';
  ctx.lineWidth = 1;
  for (const h of handles) {
    ctx.fillRect(h.x - hs / 2, h.y - hs / 2, hs, hs);
    ctx.strokeRect(h.x - hs / 2, h.y - hs / 2, hs, hs);
  }
  ctx.restore();
}

// ─── Animation paths ──────────────────────────────────────────────────────────
export function drawAnimPaths(
  ctx: CanvasRenderingContext2D,
  players: Player[],
  ball: Ball,
  movements: Movement[],
  activeMovePiece: string | null,
  R: number,
) {
  for (const mv of movements) {
    if (mv.waypoints.length === 0) continue;
    const isActive = mv.playerId === activeMovePiece;
    const isBall = mv.playerId === '__ball__';
    const player = players.find(p => p.id === mv.playerId);
    const pathColor = isBall ? '#FFD700' : (player?.team === 'A' ? BORDEAUX : OCEAN);
    const startPos: Point = isBall ? { ...ball } : player ? { x: player.x, y: player.y } : { x: 0, y: 0 };
    if (!player && !isBall) continue;

    ctx.save();
    ctx.globalAlpha = isActive ? 0.85 : 0.45;
    ctx.strokeStyle = pathColor;
    ctx.fillStyle = pathColor;
    ctx.lineWidth = Math.max(1.5, R * 0.28);
    ctx.setLineDash([8, 5]);

    ctx.beginPath();
    ctx.moveTo(startPos.x, startPos.y);
    for (const wp of mv.waypoints) ctx.lineTo(wp.x, wp.y);
    ctx.stroke();
    ctx.setLineDash([]);

    const lastWp = mv.waypoints[mv.waypoints.length - 1];
    const fromPt = mv.waypoints.length >= 2 ? mv.waypoints[mv.waypoints.length - 2] : startPos;
    const dx = lastWp.x - fromPt.x;
    const dy = lastWp.y - fromPt.y;
    const angle = Math.atan2(dy, dx);
    const as = R * 0.9;
    ctx.beginPath();
    ctx.moveTo(lastWp.x, lastWp.y);
    ctx.lineTo(lastWp.x - as * Math.cos(angle - Math.PI / 6), lastWp.y - as * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(lastWp.x - as * Math.cos(angle + Math.PI / 6), lastWp.y - as * Math.sin(angle + Math.PI / 6));
    ctx.closePath();
    ctx.fill();

    for (const wp of mv.waypoints) {
      ctx.beginPath();
      ctx.arc(wp.x, wp.y, R * 0.38, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
}

// ─── Main render ──────────────────────────────────────────────────────────────
export function renderBoard(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  players: Player[],
  ball: Ball,
  drawings: Drawing[],
  options: RenderOptions,
) {
  const {
    view, showNames, showZones, lightField,
    currentDraw, selectedPlayerId, selectedDrawingId,
    imageCache, movements, activeMovePiece, animMode, setPieceMode,
  } = options;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  setupTransform(ctx, canvas, view);

  const R = getPlayerRadius(canvas, view);

  drawPitch(ctx, lightField, showZones, options.pitchBgImage);

  for (const d of drawings) {
    drawShape(ctx, d.tool, d.start, d.end, d.color, d.filled, d.strokeWidth, d.text, d.points);
    if (d.id === selectedDrawingId) drawHandles(ctx, getHandlePoints(d), R);
  }

  if (currentDraw) {
    drawShape(ctx, currentDraw.tool, currentDraw.start, currentDraw.end, currentDraw.color, currentDraw.filled, 2.5, '', undefined, true);
  }

  if (animMode) {
    drawAnimPaths(ctx, players, ball, movements, activeMovePiece, R);
  }

  drawPlayers(ctx, canvas, view, players, selectedPlayerId, showNames, imageCache, setPieceMode);
  drawBall(ctx, ball);

  ctx.resetTransform();
}

// ─── Hit detection ────────────────────────────────────────────────────────────
export function findPlayerAtPoint(
  players: Player[],
  ball: Ball,
  x: number,
  y: number,
  playerRadius: number,
): { type: 'player'; id: string } | { type: 'ball' } | null {
  if (Math.hypot(x - ball.x, y - ball.y) <= BALL_R + 8) return { type: 'ball' };
  for (let i = players.length - 1; i >= 0; i--) {
    const p = players[i];
    if (!p.visible) continue;
    if (Math.hypot(x - p.x, y - p.y) <= playerRadius + 6) return { type: 'player', id: p.id };
  }
  return null;
}

function distToSegment(p: Point, a: Point, b: Point): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  if (dx === 0 && dy === 0) return Math.hypot(p.x - a.x, p.y - a.y);
  const t = Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / (dx * dx + dy * dy)));
  return Math.hypot(p.x - a.x - t * dx, p.y - a.y - t * dy);
}

export function findDrawingAtPoint(drawings: Drawing[], x: number, y: number): string | null {
  for (let i = drawings.length - 1; i >= 0; i--) {
    if (distToSegment({ x, y }, drawings[i].start, drawings[i].end) < 12) return drawings[i].id;
  }
  return null;
}

export function findHandleAtPoint(drawing: Drawing, x: number, y: number, R: number): number {
  const handles = getHandlePoints(drawing);
  const hs = Math.max(5, R * 0.55) + 5;
  for (let i = 0; i < handles.length; i++) {
    if (Math.abs(x - handles[i].x) <= hs && Math.abs(y - handles[i].y) <= hs) return i;
  }
  return -1;
}

export function findWaypointAtPoint(
  movements: Movement[],
  x: number,
  y: number,
  R: number,
): { playerId: string; index: number } | null {
  const hitR = Math.max(6, R * 0.5);
  for (const mv of movements) {
    for (let i = 0; i < mv.waypoints.length; i++) {
      if (Math.hypot(x - mv.waypoints[i].x, y - mv.waypoints[i].y) <= hitR) {
        return { playerId: mv.playerId, index: i };
      }
    }
  }
  return null;
}
