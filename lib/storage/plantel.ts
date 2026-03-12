export type EstadoJogador = "apto" | "condicionado" | "lesionado" | "indisponivel"
export type PosicaoJogador =
  "GK" |
  "RB" | "CB" | "CBR" | "CBL" | "LB" | "SW" | "LWB" | "RWB" |
  "DM" | "CM" | "CMR" | "CML" | "CAM" | "LM" | "RM" |
  "WR" | "OM" | "WL" | "CF" | "ST"
export type PePreferido = "direito" | "esquerdo" | "ambidestro"
export type Setor = "GR" | "DEF" | "MED" | "AV"

// Mapeamento de posições antigas → novas (migração automática)
const POSICAO_MIGRATION: Record<string, PosicaoJogador> = {
  GR: "GK", DD: "RB", DC: "CBR", DE: "LB",
  MDC: "CM", MC: "CM", MD: "CMR", MDE: "WR", MEE: "WL",
  "MEE/MC": "CML", "MDE/MC": "CMR", AV: "ST", PL: "ST",
}

export interface Jogador {
  id: string
  nome: string
  alcunha?: string          // nome exibido em toda a UI (sobrepõe-se a nome)
  numero: number
  posicoes: PosicaoJogador[]
  estado: EstadoJogador
  foto?: string
  dataNascimento?: string
  nacionalidade?: string
  altura?: number
  peso?: number
  pePreferido?: PePreferido
  notas?: string
  avaliacao?: number // 1-5 stars

  // Atributos técnicos — ofensivos (1-20)
  aOBallControl?: number; aOFirstTouch?: number; aOShortPass?: number
  aOLongPass?: number; aOCrossing?: number; aOHeading?: number
  aOFinishing?: number; aODribbling?: number; aOFeint?: number

  // Atributos técnicos — defensivos (1-20)
  aDPositioning?: number; aDDefensiveAwareness?: number; aDMarcation?: number
  aDInterceptions?: number; aDTackling?: number; aDAerialDuels?: number; aDAggression?: number

  // Impacto ofensivo (1-20)
  aIPenetration?: number; aIOffBall?: number; aIVision?: number
  aIChanceCreation?: number; aICreativity?: number; aIDesmarcation?: number

  // Bolas paradas (1-20)
  aSPPenalty?: number; aSPCorners?: number; aSPFreeKicks?: number; aSPLongThrows?: number

  // Físico (1-20)
  aPAcceleration?: number; aPSprint?: number; aPAgility?: number
  aPBalance?: number; aPJumping?: number; aPStrength?: number; aPEndurance?: number

  // Mental (1-20)
  aMentality?: number; aCompetitive?: number; aConcentration?: number
  aComposure?: number; aCourage?: number; aLeadership?: number
  aWorkEthic?: number; aTeamWork?: number

  // Inteligência de jogo (1-20)
  aGIGameReading?: number; aGIDecisionMaking?: number; aGISpatialAwareness?: number
  aGITacticalDiscipline?: number; aGIOffBallMovement?: number
}

/** Nome a exibir em toda a UI: alcunha se existir, senão nome completo */
export function displayName(j: Pick<Jogador, "nome" | "alcunha">): string {
  return j.alcunha?.trim() || j.nome
}

export function getPrimarySetor(posicoes: PosicaoJogador[]): Setor {
  const p = posicoes[0]
  if (!p || p === "GK") return "GR"
  if (["RB", "CB", "CBR", "CBL", "LB", "SW", "LWB", "RWB"].includes(p)) return "DEF"
  if (["DM", "CM", "CMR", "CML", "CAM", "LM", "RM"].includes(p)) return "MED"
  return "AV" // WR, OM, WL, ST
}

export type TipoPresenca = "treino" | "ginasio" | "reuniao" | "jogo"
export type EstadoPresenca = "presente" | "falta" | "atraso" | "justificado"

export interface RegistoPresenca {
  id: string
  jogadorId: string
  data: string
  tipo: TipoPresenca
  estado: EstadoPresenca
  notas?: string
}

export type TipoOcorrencia = "amarelo_interno" | "vermelho_interno" | "comportamento" | "disciplinar"
export type GravidadeOcorrencia = "leve" | "moderada" | "grave"

export interface OcorrenciaDisciplinar {
  id: string
  jogadorId: string
  data: string
  tipo: TipoOcorrencia
  gravidade: GravidadeOcorrencia
  descricao: string
}

// --- Competition Stats ---
export interface EstatisticasCompeticao {
  jogadorId: string
  epoca: string
  jogos: number
  minutos: number
  golos: number
  assistencias: number
  autGolos: number
  titular: number
  suplente: number
  bancoSemJogar: number
  naoConvocado: number
  faltasSofridas: number
  faltasCometidas: number
  amarelos: number
  vermelhoDireto: number
  segundoAmarelo: number
  jogosSuspensao: number
  jogosCapitao: number
}

// --- Morale ---
export type EstadoMoral = "happy" | "comfortable" | "sad" | "unsatisfied"

export interface MoralJogador {
  jogadorId: string
  promessas: EstadoMoral
  moral: EstadoMoral
  treino: EstadoMoral
  tratamento: EstadoMoral
  clube: EstadoMoral
  staff: EstadoMoral
  tempoJogo: EstadoMoral
  felicidadeGeral: EstadoMoral
}

// --- Hierarchy ---
export type NivelHierarquia = "team_leader" | "highly_influential" | "influential" | "other"
export type PersonalidadeJogador = "Professional" | "Balanced" | "Determined" | "Model Citizen" | "Spirited" | "Ambitious" | "Laid Back" | "Temperamental"

export interface HierarquiaJogador {
  jogadorId: string
  nivel: NivelHierarquia
  ordem: number
  personalidade?: PersonalidadeJogador
}

// --- Config ---
export interface ConfigPlantel {
  amarelosParaSuspensao: number
  epocaAtual: string
}

// --- Squad Plan ---
export interface SquadPlanSlot {
  posicao: string
  slot: number // 0 or 1 (two players per position)
  jogadorId?: string
}

export interface SquadPlanFormacao {
  formacao: string
  slots: SquadPlanSlot[]
  counts?: { gk: number; def: number; mid: number; fwd: number }
  slotPositions?: Record<string, string>  // e.g. "FWD_0" → "LW", "DEF_2" → "CB"
}

// --- Tactics ---
export interface TacticaSlot {
  posicao: string
  jogadorId?: string
}

export interface TacticaConfig {
  formacao: string
  mentalidade: "offensive" | "balanced" | "defensive"
  pressao: "high" | "medium" | "low"
  zonaPressao: "wide" | "central" | "both"
  explorarCorredores: boolean
  cruzamentos: "cutback" | "into_box" | "both"
  tipoRelvado: "grass" | "artificial" | "hybrid"
  estadoRelvado: "excellent" | "good" | "poor"
  adversarioAgressivo: boolean
  notasOfensivas: string
  notasDefensivas: string
  titulares: TacticaSlot[]
}

// --- Set Pieces ---
export interface SetPiecePin {
  id: string
  x: number
  y: number
  label: string
  cor: string
}

export interface SetPieceArrow {
  id: string
  fromX: number
  fromY: number
  toX: number
  toY: number
  dashed: boolean
}

export type TipoSetPiece =
  | "corner_right" | "corner_left"
  | "freekick_center" | "freekick_right" | "freekick_left"
  | "lateral_freekick_right" | "lateral_freekick_left"
  | "penalty"
  | "throwin_def" | "throwin_off"

export interface SetPieceEsquema {
  id: string
  tipo: TipoSetPiece
  nome: string
  pinos: SetPiecePin[]
  setas: SetPieceArrow[]
}

const KEYS = {
  jogadores: "coachlab_jogadores",
  presencas: "coachlab_presencas",
  disciplina: "coachlab_disciplina",
  estatisticas: "coachlab_estatisticas",
  moral: "coachlab_moral",
  hierarquia: "coachlab_hierarquia",
  config: "coachlab_config_plantel",
  squadPlan: "coachlab_squad_plan",
  tatica: "coachlab_tatica",
  setPieces: "coachlab_set_pieces",
}

function migratePosicoes(posicoes: string[]): PosicaoJogador[] {
  return posicoes.map(p => POSICAO_MIGRATION[p] ?? (p as PosicaoJogador))
}

// --- Jogadores ---
export function getJogadores(): Jogador[] {
  if (typeof window === "undefined") return []
  try {
    const raw = JSON.parse(localStorage.getItem(KEYS.jogadores) ?? "[]") as (Jogador & { posicao?: string })[]
    return raw.map(j => {
      const posicoes = j.posicoes ? migratePosicoes(j.posicoes as string[]) : j.posicao ? migratePosicoes([j.posicao]) : ["CBR" as PosicaoJogador]
      return { ...j, posicoes }
    })
  } catch { return [] }
}

export function saveJogadores(data: Jogador[]): void {
  localStorage.setItem(KEYS.jogadores, JSON.stringify(data))
}

export function addJogador(jogador: Omit<Jogador, "id">): Jogador {
  const novo: Jogador = { ...jogador, id: crypto.randomUUID() }
  saveJogadores([...getJogadores(), novo])
  return novo
}

export function updateJogador(id: string, data: Partial<Omit<Jogador, "id">>): void {
  saveJogadores(getJogadores().map(j => j.id === id ? { ...j, ...data } : j))
}

export function deleteJogador(id: string): void {
  saveJogadores(getJogadores().filter(j => j.id !== id))
}

// --- Presenças ---
export function getPresencas(): RegistoPresenca[] {
  if (typeof window === "undefined") return []
  try { return JSON.parse(localStorage.getItem(KEYS.presencas) ?? "[]") } catch { return [] }
}

export function addPresenca(p: Omit<RegistoPresenca, "id">): RegistoPresenca {
  const novo: RegistoPresenca = { ...p, id: crypto.randomUUID() }
  const existing = getPresencas()
  const filtered = existing.filter(e => !(e.jogadorId === p.jogadorId && e.data === p.data && e.tipo === p.tipo))
  localStorage.setItem(KEYS.presencas, JSON.stringify([...filtered, novo]))
  return novo
}

export function getPresencasByJogador(jogadorId: string): RegistoPresenca[] {
  return getPresencas().filter(p => p.jogadorId === jogadorId)
}

export function getPresencasByData(data: string): RegistoPresenca[] {
  return getPresencas().filter(p => p.data === data)
}

// --- Disciplina ---
export function getOcorrencias(): OcorrenciaDisciplinar[] {
  if (typeof window === "undefined") return []
  try { return JSON.parse(localStorage.getItem(KEYS.disciplina) ?? "[]") } catch { return [] }
}

export function getOcorrenciasByJogador(jogadorId: string): OcorrenciaDisciplinar[] {
  return getOcorrencias().filter(o => o.jogadorId === jogadorId)
}

export function addOcorrencia(o: Omit<OcorrenciaDisciplinar, "id">): OcorrenciaDisciplinar {
  const nova: OcorrenciaDisciplinar = { ...o, id: crypto.randomUUID() }
  localStorage.setItem(KEYS.disciplina, JSON.stringify([...getOcorrencias(), nova]))
  return nova
}

export function deleteOcorrencia(id: string): void {
  localStorage.setItem(KEYS.disciplina, JSON.stringify(getOcorrencias().filter(o => o.id !== id)))
}

// --- Estatísticas de Competição ---
export function getEstatisticas(): EstatisticasCompeticao[] {
  if (typeof window === "undefined") return []
  try { return JSON.parse(localStorage.getItem(KEYS.estatisticas) ?? "[]") } catch { return [] }
}

export function saveEstatisticas(data: EstatisticasCompeticao[]): void {
  localStorage.setItem(KEYS.estatisticas, JSON.stringify(data))
}

export function getEstatisticasJogador(jogadorId: string, epoca: string): EstatisticasCompeticao {
  const all = getEstatisticas()
  return all.find(e => e.jogadorId === jogadorId && e.epoca === epoca) ?? {
    jogadorId, epoca, jogos: 0, minutos: 0, golos: 0, assistencias: 0, autGolos: 0,
    titular: 0, suplente: 0, bancoSemJogar: 0, naoConvocado: 0,
    faltasSofridas: 0, faltasCometidas: 0, amarelos: 0, vermelhoDireto: 0,
    segundoAmarelo: 0, jogosSuspensao: 0, jogosCapitao: 0,
  }
}

export function updateEstatisticasJogador(data: EstatisticasCompeticao): void {
  const all = getEstatisticas().filter(e => !(e.jogadorId === data.jogadorId && e.epoca === data.epoca))
  saveEstatisticas([...all, data])
}

// --- Moral ---
export function getMoralJogadores(): MoralJogador[] {
  if (typeof window === "undefined") return []
  try { return JSON.parse(localStorage.getItem(KEYS.moral) ?? "[]") } catch { return [] }
}

export function saveMoralJogadores(data: MoralJogador[]): void {
  localStorage.setItem(KEYS.moral, JSON.stringify(data))
}

export function getMoralJogador(jogadorId: string): MoralJogador {
  return getMoralJogadores().find(m => m.jogadorId === jogadorId) ?? {
    jogadorId, promessas: "comfortable", moral: "comfortable", treino: "comfortable",
    tratamento: "comfortable", clube: "comfortable", staff: "comfortable",
    tempoJogo: "comfortable", felicidadeGeral: "comfortable",
  }
}

export function updateMoralJogador(data: MoralJogador): void {
  const all = getMoralJogadores().filter(m => m.jogadorId !== data.jogadorId)
  saveMoralJogadores([...all, data])
}

// --- Hierarquia ---
export function getHierarquia(): HierarquiaJogador[] {
  if (typeof window === "undefined") return []
  try { return JSON.parse(localStorage.getItem(KEYS.hierarquia) ?? "[]") } catch { return [] }
}

export function saveHierarquia(data: HierarquiaJogador[]): void {
  localStorage.setItem(KEYS.hierarquia, JSON.stringify(data))
}

export function updateHierarquiaJogador(data: HierarquiaJogador): void {
  const all = getHierarquia().filter(h => h.jogadorId !== data.jogadorId)
  saveHierarquia([...all, data])
}

// --- Config ---
export function getConfigPlantel(): ConfigPlantel {
  if (typeof window === "undefined") return { amarelosParaSuspensao: 5, epocaAtual: "2024/25" }
  try {
    const raw = localStorage.getItem(KEYS.config)
    return raw ? JSON.parse(raw) : { amarelosParaSuspensao: 5, epocaAtual: "2024/25" }
  } catch { return { amarelosParaSuspensao: 5, epocaAtual: "2024/25" } }
}

export function saveConfigPlantel(data: ConfigPlantel): void {
  localStorage.setItem(KEYS.config, JSON.stringify(data))
}

// --- Squad Plan ---
export function getSquadPlan(): SquadPlanFormacao {
  if (typeof window === "undefined") return { formacao: "1-4-3-3", slots: [] }
  try {
    const raw = localStorage.getItem(KEYS.squadPlan)
    return raw ? JSON.parse(raw) : { formacao: "1-4-3-3", slots: [] }
  } catch { return { formacao: "1-4-3-3", slots: [] } }
}

export function saveSquadPlan(data: SquadPlanFormacao): void {
  localStorage.setItem(KEYS.squadPlan, JSON.stringify(data))
}

// --- Tática ---
export function getTatica(): TacticaConfig {
  if (typeof window === "undefined") return getDefaultTatica()
  try {
    const raw = localStorage.getItem(KEYS.tatica)
    return raw ? JSON.parse(raw) : getDefaultTatica()
  } catch { return getDefaultTatica() }
}

function getDefaultTatica(): TacticaConfig {
  return {
    formacao: "1-4-3-3",
    mentalidade: "balanced",
    pressao: "medium",
    zonaPressao: "both",
    explorarCorredores: false,
    cruzamentos: "both",
    tipoRelvado: "grass",
    estadoRelvado: "good",
    adversarioAgressivo: false,
    notasOfensivas: "",
    notasDefensivas: "",
    titulares: [],
  }
}

export function saveTatica(data: TacticaConfig): void {
  localStorage.setItem(KEYS.tatica, JSON.stringify(data))
}

// --- Set Pieces ---
export function getSetPieces(): SetPieceEsquema[] {
  if (typeof window === "undefined") return []
  try { return JSON.parse(localStorage.getItem(KEYS.setPieces) ?? "[]") } catch { return [] }
}

export function saveSetPieces(data: SetPieceEsquema[]): void {
  localStorage.setItem(KEYS.setPieces, JSON.stringify(data))
}

export function getSetPiecesByTipo(tipo: TipoSetPiece): SetPieceEsquema[] {
  return getSetPieces().filter(s => s.tipo === tipo)
}

export function upsertSetPiece(esquema: SetPieceEsquema): void {
  const all = getSetPieces().filter(s => s.id !== esquema.id)
  saveSetPieces([...all, esquema])
}

export function deleteSetPiece(id: string): void {
  saveSetPieces(getSetPieces().filter(s => s.id !== id))
}
