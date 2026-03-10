export type EstadoScouting = "em_observacao" | "contactado" | "descartado" | "contratado"
export type PePreferido = "direito" | "esquerdo" | "ambidestro"

export interface VideoClip {
  id: string
  categoria: string
  subcategoria: string
  url: string
  titulo?: string
  dataAdicionado: string
}

export interface JogadorObservado {
  id: string
  nome: string
  dataNascimento?: string
  clube: string
  posicao: string
  pePreferido: PePreferido
  nacionalidade?: string
  fotoUrl?: string
  avaliacao: number
  estado: EstadoScouting
  caracteristicasTecnicas: string
  caracteristicasTaticas: string
  caracteristicasFisicas: string
  caracteristicasMentais: string
  pontosFortess: string
  pontosFracos: string
  notas: string
  dataObservacao: string
  jogosObservados: string[]

  // Pessoal
  altura?: number           // cm
  peso?: number             // kg

  // Clube
  liga?: string
  paisClube?: string
  fimContrato?: string      // "YYYY-MM-DD"
  valorMercado?: number     // euros

  // Estatísticas de jogo
  golos?: number
  assistencias?: number
  cartoesAmarelos?: number
  cartoesVermelhos?: number
  jogosDisputados?: number
  minutosJogados?: number

  // Performance metrics
  xg?: number
  xa?: number
  xgot?: number
  keyPassesPorJogo?: number
  chutesPorJogo?: number
  precisaoPasses?: number       // %
  driblesCompletados?: number
  duelosAereos?: number         // %
  duelosTerrestres?: number     // %
  intercecoes?: number

  // Technique — Offensive (1-10)
  aOBallControl?: number; aOFirstTouch?: number; aOShortPass?: number
  aOLongPass?: number; aOCrossing?: number; aOHeading?: number
  aOFinishing?: number; aODribbling?: number; aOFeint?: number

  // Technique — Defensive (1-10)
  aDPositioning?: number; aDDefensiveAwareness?: number; aDMarcation?: number
  aDInterceptions?: number; aDTackling?: number; aDAerialDuels?: number
  aDAggression?: number

  // Technique — Attacking Impact (1-10)
  aIPenetration?: number; aIOffBall?: number; aIVision?: number
  aIChanceCreation?: number; aICreativity?: number; aIDesmarcation?: number

  // Set Pieces (1-10)
  aSPPenalty?: number; aSPCorners?: number; aSPFreeKicks?: number; aSPLongThrows?: number

  // Physical (1-10)
  aPAcceleration?: number; aPSprint?: number; aPAgility?: number
  aPBalance?: number; aPJumping?: number; aPStrength?: number; aPEndurance?: number

  // Mental (1-10)
  aMentality?: number; aCompetitive?: number; aConcentration?: number
  aComposure?: number; aCourage?: number; aLeadership?: number
  aWorkEthic?: number; aTeamWork?: number

  // Game Intelligence (1-10)
  aGIGameReading?: number; aGIDecisionMaking?: number; aGISpatialAwareness?: number
  aGITacticalDiscipline?: number; aGIOffBallMovement?: number

  // Biometric Data
  secondaryFoot?: string    // "Right" | "Left" | "Both" | "None"
  bodyType?: string         // "Slim" | "Athletic" | "Stocky" | "Robust"
  injuryRisk?: number       // 1-10
  bioNaturalFitness?: number // 1-10

  // Contrato
  salario?: number          // €/mês
  contactoAgente?: string
  nomeAgente?: string
  agencia?: string

  // Avaliação de potencial
  potencial?: number        // estrelas 1-5

  // Clips de vídeo
  clips?: VideoClip[]
}

export interface FiltroScouting {
  texto?: string
  posicoes?: string[]
  estados?: EstadoScouting[]
  pePreferido?: PePreferido[]
  nacionalidades?: string[]
  alturaMin?: number; alturaMax?: number
  pesoMin?: number; pesoMax?: number
  idadeMin?: number; idadeMax?: number
  avaliacaoMin?: number
  potencialMin?: number
  clubeTexto?: string
  velocidadeMin?: number
  aceleracaoMin?: number
  resistenciaMin?: number
  forcaMin?: number
  golosMin?: number
  assistenciasMin?: number
  jogosMin?: number
  sprintsMin?: number
  distanciaMin?: number
  velMaxMin?: number
  valorMercadoMax?: number
  fimContratoAte?: string
}

const KEY = "coachlab_scouting"

export function getJogadoresObservados(): JogadorObservado[] {
  if (typeof window === "undefined") return []
  try { return JSON.parse(localStorage.getItem(KEY) ?? "[]") } catch { return [] }
}

export function saveJogadoresObservados(data: JogadorObservado[]): void {
  localStorage.setItem(KEY, JSON.stringify(data))
}

export function addJogadorObservado(j: Omit<JogadorObservado, "id">): JogadorObservado {
  const novo: JogadorObservado = { ...j, id: crypto.randomUUID() }
  saveJogadoresObservados([...getJogadoresObservados(), novo])
  return novo
}

export function updateJogadorObservado(id: string, data: Partial<Omit<JogadorObservado, "id">>): void {
  saveJogadoresObservados(getJogadoresObservados().map(j => j.id === id ? { ...j, ...data } : j))
}

export function deleteJogadorObservado(id: string): void {
  saveJogadoresObservados(getJogadoresObservados().filter(j => j.id !== id))
}

function calcIdade(dataNascimento?: string): number | undefined {
  if (!dataNascimento) return undefined
  return Math.floor((Date.now() - new Date(dataNascimento).getTime()) / (365.25 * 24 * 3600 * 1000))
}

export function filtrarJogadoresAvancado(filtro: FiltroScouting): JogadorObservado[] {
  return getJogadoresObservados().filter(j => {
    if (filtro.texto) {
      const t = filtro.texto.toLowerCase()
      if (!j.nome.toLowerCase().includes(t) && !j.clube.toLowerCase().includes(t) && !(j.nacionalidade?.toLowerCase().includes(t))) return false
    }
    if (filtro.posicoes?.length && !filtro.posicoes.includes(j.posicao)) return false
    if (filtro.estados?.length && !filtro.estados.includes(j.estado)) return false
    if (filtro.pePreferido?.length && !filtro.pePreferido.includes(j.pePreferido)) return false
    if (filtro.nacionalidades?.length && !filtro.nacionalidades.some(n => j.nacionalidade?.toLowerCase().includes(n.toLowerCase()))) return false
    if (filtro.alturaMin !== undefined && (j.altura ?? 0) < filtro.alturaMin) return false
    if (filtro.alturaMax !== undefined && (j.altura ?? 999) > filtro.alturaMax) return false
    if (filtro.pesoMin !== undefined && (j.peso ?? 0) < filtro.pesoMin) return false
    if (filtro.pesoMax !== undefined && (j.peso ?? 999) > filtro.pesoMax) return false
    if (filtro.idadeMin !== undefined || filtro.idadeMax !== undefined) {
      const idade = calcIdade(j.dataNascimento)
      if (filtro.idadeMin !== undefined && (idade ?? 0) < filtro.idadeMin) return false
      if (filtro.idadeMax !== undefined && (idade ?? 999) > filtro.idadeMax) return false
    }
    if (filtro.avaliacaoMin !== undefined && j.avaliacao < filtro.avaliacaoMin) return false
    if (filtro.potencialMin !== undefined && (j.potencial ?? 0) < filtro.potencialMin) return false
    if (filtro.clubeTexto && !j.clube?.toLowerCase().includes(filtro.clubeTexto.toLowerCase())) return false
    if (filtro.golosMin !== undefined && (j.golos ?? 0) < filtro.golosMin) return false
    if (filtro.assistenciasMin !== undefined && (j.assistencias ?? 0) < filtro.assistenciasMin) return false
    if (filtro.jogosMin !== undefined && (j.jogosDisputados ?? 0) < filtro.jogosMin) return false
    if (filtro.valorMercadoMax !== undefined && (j.valorMercado ?? Infinity) > filtro.valorMercadoMax) return false
    if (filtro.fimContratoAte && j.fimContrato && j.fimContrato > filtro.fimContratoAte) return false
    return true
  })
}

export function filtrarPorPosicao(posicao: string): JogadorObservado[] {
  return getJogadoresObservados().filter(j => j.posicao === posicao)
}

export function filtrarPorEstado(estado: EstadoScouting): JogadorObservado[] {
  return getJogadoresObservados().filter(j => j.estado === estado)
}
