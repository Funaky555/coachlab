export type Tool =
  | 'select'
  | 'line'
  | 'arrow'
  | 'run'
  | 'curved-arrow'
  | 'double-arrow'
  | 'wavy-arrow'
  | 'triangle'
  | 'rect'
  | 'circle'
  | 'zone'
  | 'text'
  | 'eraser';

export type TeamType = 'A' | 'B';
export type PlayerType = 'player' | 'goalkeeper';

export type FieldView =
  | 'full'
  | 'half-left'
  | 'half-right'
  | 'corner-left'
  | 'corner-right'
  | 'penalty'
  | 'seven-aside'
  | 'five-aside';

export type FormationName =
  | '1-4-3-3' | '1-4-4-2' | '1-4-2-3-1' | '1-3-5-2' | '1-3-6-1' | '1-3-4-3'
  | '1-4-5-1' | '1-4-1-4-1' | '1-5-4-1' | '1-5-3-2' | '1-5-2-3'
  | '1-4-3-2-1' | '1-4-1-2-3' | '1-3-4-2-1' | '1-4-4-1-1' | '1-3-3-4'
  | '1-4-2-2-2' | '1-3-4-1-2' | '1-4-6-0' | '1-2-3-5'
  | '1-4-3-1-2' | '1-3-1-4-2' | '1-4-1-3-2' | '1-3-2-4-1';

export interface Point {
  x: number;
  y: number;
}

export interface Player {
  id: string;
  team: TeamType;
  type: PlayerType;
  number: number;
  name: string;
  x: number;
  y: number;
  visible: boolean;
  photo?: string | null; // base64 data URL
  instruction?: string;  // set piece instruction text
}

export interface Ball {
  x: number;
  y: number;
}

export interface Drawing {
  id: string;
  tool: Exclude<Tool, 'select' | 'eraser'>;
  start: Point;
  end: Point;
  color: string;
  filled?: boolean;
  strokeWidth?: number;
  text?: string; // for text tool
  points?: Point[]; // triangle: 3 vertices; curved-arrow: 1 control point
}

export interface BoardSnapshot {
  players: Player[];
  ball: Ball;
  drawings: Drawing[];
}

export interface ViewBounds {
  viewX: number;
  viewY: number;
  viewW: number;
  viewH: number;
}

export interface Movement {
  playerId: string; // player id or '__ball__'
  waypoints: Point[];
}

export interface RenderOptions {
  view: FieldView;
  showNames: boolean;
  showZones: boolean;
  lightField: boolean;
  currentDraw: { start: Point; end: Point; tool: Drawing['tool']; color: string; filled?: boolean } | null;
  selectedPlayerId: string | null;
  selectedDrawingId: string | null;
  imageCache: Map<string, HTMLImageElement>;
  movements: Movement[];
  activeMovePiece: string | null;
  animMode: boolean;
  setPieceMode: boolean;
}
