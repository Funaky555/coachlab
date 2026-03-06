export type EstadoScouting = "em_observacao" | "contactado" | "descartado" | "contratado"
export type PePreferido = "direito" | "esquerdo" | "ambidestro"

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

export function filtrarPorPosicao(posicao: string): JogadorObservado[] {
  return getJogadoresObservados().filter(j => j.posicao === posicao)
}

export function filtrarPorEstado(estado: EstadoScouting): JogadorObservado[] {
  return getJogadoresObservados().filter(j => j.estado === estado)
}
