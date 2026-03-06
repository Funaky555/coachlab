export type ResultadoJogo = "vitoria" | "empate" | "derrota"

export interface EstatisticasJogo {
  posseBola: number
  rematesTotal: number
  rematesGolo: number
  rematesFora: number
  rematesBloqueados: number
  xGProprio: number
  xGAdversario: number
  recuperacoes: number
  perdasBola: number
  passesTotal: number
  passesCompletos: number
  faltas: number
  cartaoAmarelo: number
  cartaoVermelho: number
}

export interface ZonaAcao {
  zona: string
  percentagem: number
}

export interface RelatorioJogo {
  id: string
  data: string
  adversario: string
  local: "casa" | "fora" | "neutro"
  competicao: string
  resultado: ResultadoJogo
  golosMarcados: number
  golosSofridos: number
  stats: EstatisticasJogo
  zonasAcao: ZonaAcao[]
  analiseNarrativa: string
  clipLinks: string[]
  conclusoes: string
}

const KEY = "coachlab_jogos"

export function getRelatorios(): RelatorioJogo[] {
  if (typeof window === "undefined") return []
  try { return JSON.parse(localStorage.getItem(KEY) ?? "[]") } catch { return [] }
}

export function saveRelatorios(data: RelatorioJogo[]): void {
  localStorage.setItem(KEY, JSON.stringify(data))
}

export function addRelatorio(r: Omit<RelatorioJogo, "id">): RelatorioJogo {
  const novo: RelatorioJogo = { ...r, id: crypto.randomUUID() }
  saveRelatorios([...getRelatorios(), novo])
  return novo
}

export function updateRelatorio(id: string, data: Partial<Omit<RelatorioJogo, "id">>): void {
  saveRelatorios(getRelatorios().map(r => r.id === id ? { ...r, ...data } : r))
}

export function deleteRelatorio(id: string): void {
  saveRelatorios(getRelatorios().filter(r => r.id !== id))
}

export function getEstatisticasGlobais() {
  const relatorios = getRelatorios()
  if (relatorios.length === 0) return null
  return {
    totalJogos: relatorios.length,
    vitorias: relatorios.filter(r => r.resultado === "vitoria").length,
    empates: relatorios.filter(r => r.resultado === "empate").length,
    derrotas: relatorios.filter(r => r.resultado === "derrota").length,
    mediaPosse: relatorios.reduce((acc, r) => acc + r.stats.posseBola, 0) / relatorios.length,
    totalGolMarcados: relatorios.reduce((acc, r) => acc + r.golosMarcados, 0),
    totalGolSofridos: relatorios.reduce((acc, r) => acc + r.golosSofridos, 0),
  }
}
