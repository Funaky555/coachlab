export type TipoLesao = "muscular" | "ossea" | "ligamentar" | "articular" | "outra"
export type EstadoLesao = "ativa" | "em_recuperacao" | "recuperado"

export interface RegistoMedico {
  id: string
  jogadorId: string
  dataInicio: string
  dataRetorno?: string
  tipo: TipoLesao
  localizacao: string
  descricao: string
  tratamento?: string
  estado: EstadoLesao
}

const KEY = "coachlab_medico"

export function getRegistosMedicos(): RegistoMedico[] {
  if (typeof window === "undefined") return []
  try { return JSON.parse(localStorage.getItem(KEY) ?? "[]") } catch { return [] }
}

export function getRegistosMedicosByJogador(jogadorId: string): RegistoMedico[] {
  return getRegistosMedicos().filter(r => r.jogadorId === jogadorId)
}

export function addRegistoMedico(r: Omit<RegistoMedico, "id">): RegistoMedico {
  const novo: RegistoMedico = { ...r, id: crypto.randomUUID() }
  localStorage.setItem(KEY, JSON.stringify([...getRegistosMedicos(), novo]))
  return novo
}

export function updateRegistoMedico(id: string, data: Partial<Omit<RegistoMedico, "id">>): void {
  localStorage.setItem(KEY, JSON.stringify(getRegistosMedicos().map(r => r.id === id ? { ...r, ...data } : r)))
}

export function deleteRegistoMedico(id: string): void {
  localStorage.setItem(KEY, JSON.stringify(getRegistosMedicos().filter(r => r.id !== id)))
}
