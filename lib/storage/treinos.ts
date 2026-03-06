export type TipoSessao = "tecnico" | "tatico" | "fisico" | "misto" | "recuperacao" | "jogo"

export interface SessaoTreino {
  id: string
  data: string
  diaSemana: number
  duracao: number
  tipo: TipoSessao
  objetivosTaticos: string
  objetivosTecnicos: string
  conteudos: string
  rpePrevisto: number
  rpeReal?: number
  avaliacao?: number
  notas?: string
  concluida: boolean
}

const KEY = "coachlab_sessoes"

export function getSessoes(): SessaoTreino[] {
  if (typeof window === "undefined") return []
  try { return JSON.parse(localStorage.getItem(KEY) ?? "[]") } catch { return [] }
}

export function saveSessoes(data: SessaoTreino[]): void {
  localStorage.setItem(KEY, JSON.stringify(data))
}

export function addSessao(s: Omit<SessaoTreino, "id">): SessaoTreino {
  const nova: SessaoTreino = { ...s, id: crypto.randomUUID() }
  saveSessoes([...getSessoes(), nova])
  return nova
}

export function updateSessao(id: string, data: Partial<Omit<SessaoTreino, "id">>): void {
  saveSessoes(getSessoes().map(s => s.id === id ? { ...s, ...data } : s))
}

export function deleteSessao(id: string): void {
  saveSessoes(getSessoes().filter(s => s.id !== id))
}

export function getSessoesPorSemana(semanaInicio: string): SessaoTreino[] {
  const inicio = new Date(semanaInicio)
  const fim = new Date(semanaInicio)
  fim.setDate(fim.getDate() + 6)
  return getSessoes().filter(s => {
    const d = new Date(s.data)
    return d >= inicio && d <= fim
  })
}

export function getCargaSemanal(semanaInicio: string): number {
  return getSessoesPorSemana(semanaInicio).reduce((acc, s) => acc + (s.rpeReal ?? s.rpePrevisto), 0)
}
