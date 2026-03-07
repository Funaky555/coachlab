export interface RegistoFisico {
  id: string
  jogadorId: string
  data: string
  duracao?: number   // minutos
  distancia?: number // km
  sprints?: number
  rpe?: number       // 1-10
  fcMax?: number     // bpm
  peso?: number      // kg
  notas?: string
}

const KEY = "coachlab_fisico"

export function getRegistosFisicos(): RegistoFisico[] {
  if (typeof window === "undefined") return []
  try { return JSON.parse(localStorage.getItem(KEY) ?? "[]") } catch { return [] }
}

export function getRegistosFisicosByJogador(jogadorId: string): RegistoFisico[] {
  return getRegistosFisicos().filter(r => r.jogadorId === jogadorId)
}

export function addRegistoFisico(r: Omit<RegistoFisico, "id">): RegistoFisico {
  const novo: RegistoFisico = { ...r, id: crypto.randomUUID() }
  localStorage.setItem(KEY, JSON.stringify([...getRegistosFisicos(), novo]))
  return novo
}

export function deleteRegistoFisico(id: string): void {
  localStorage.setItem(KEY, JSON.stringify(getRegistosFisicos().filter(r => r.id !== id)))
}
