export type EstadoJogador = "apto" | "condicionado" | "lesionado"
export type PosicaoJogador = "GR" | "DD" | "DC" | "DE" | "MDC" | "MC" | "MD" | "MDE" | "MEE" | "MEE/MC" | "MDE/MC" | "AV" | "PL"

export interface Jogador {
  id: string
  nome: string
  numero: number
  posicao: PosicaoJogador
  estado: EstadoJogador
  foto?: string
  dataNascimento?: string
  notas?: string
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

const KEYS = {
  jogadores: "coachlab_jogadores",
  presencas: "coachlab_presencas",
  disciplina: "coachlab_disciplina",
}

// --- Jogadores ---
export function getJogadores(): Jogador[] {
  if (typeof window === "undefined") return []
  try { return JSON.parse(localStorage.getItem(KEYS.jogadores) ?? "[]") } catch { return [] }
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

export function getPresencasByData(data: string): RegistoPresenca[] {
  return getPresencas().filter(p => p.data === data)
}

// --- Disciplina ---
export function getOcorrencias(): OcorrenciaDisciplinar[] {
  if (typeof window === "undefined") return []
  try { return JSON.parse(localStorage.getItem(KEYS.disciplina) ?? "[]") } catch { return [] }
}

export function addOcorrencia(o: Omit<OcorrenciaDisciplinar, "id">): OcorrenciaDisciplinar {
  const nova: OcorrenciaDisciplinar = { ...o, id: crypto.randomUUID() }
  localStorage.setItem(KEYS.disciplina, JSON.stringify([...getOcorrencias(), nova]))
  return nova
}

export function deleteOcorrencia(id: string): void {
  localStorage.setItem(KEYS.disciplina, JSON.stringify(getOcorrencias().filter(o => o.id !== id)))
}
