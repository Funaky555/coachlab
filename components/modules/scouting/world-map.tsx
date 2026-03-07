"use client"

import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Star, User } from "lucide-react"
import { type JogadorObservado } from "@/lib/storage/scouting"
import { COUNTRY_PATHS, NATIONALITY_TO_CODE } from "./world-map-data"

interface Props {
  jogadores: JogadorObservado[]
  onEdit: (j: JogadorObservado) => void
}

function getCountryColor(count: number): string {
  if (count === 0) return "#1e293b"
  if (count === 1) return "#00D66C33"
  if (count <= 3) return "#00D66C66"
  if (count <= 6) return "#00D66C99"
  return "#00D66C"
}

function getCountryStroke(count: number): string {
  if (count === 0) return "rgba(255,255,255,0.08)"
  return "#00D66C"
}

const ESTADOS_CONFIG: Record<string, { label: string; color: string }> = {
  em_observacao: { label: "Em Observação", color: "#0066FF" },
  contactado:    { label: "Contactado",    color: "#8B5CF6" },
  contratado:    { label: "Contratado",    color: "#00D66C" },
  descartado:    { label: "Descartado",    color: "#6B7280" },
}

const COUNTRY_FLAGS: Record<string, string> = {
  PRT: "🇵🇹", ESP: "🇪🇸", FRA: "🇫🇷", DEU: "🇩🇪", ITA: "🇮🇹",
  ENG: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", NLD: "🇳🇱", BEL: "🇧🇪", BRA: "🇧🇷", ARG: "🇦🇷",
  URY: "🇺🇾", COL: "🇨🇴", CHL: "🇨🇱", PER: "🇵🇪", VEN: "🇻🇪",
  ECU: "🇪🇨", MEX: "🇲🇽", USA: "🇺🇸", CAN: "🇨🇦", SEN: "🇸🇳",
  CIV: "🇨🇮", GHA: "🇬🇭", NGA: "🇳🇬", CMR: "🇨🇲", MAR: "🇲🇦",
  DZA: "🇩🇿", TUN: "🇹🇳", EGY: "🇪🇬", ZAF: "🇿🇦", MOZ: "🇲🇿",
  AGO: "🇦🇴", ETH: "🇪🇹", MLI: "🇲🇱", GIN: "🇬🇳", JPN: "🇯🇵",
  KOR: "🇰🇷", CHN: "🇨🇳", AUS: "🇦🇺", RUS: "🇷🇺", UKR: "🇺🇦",
  POL: "🇵🇱", HRV: "🇭🇷", SRB: "🇷🇸", DNK: "🇩🇰", SWE: "🇸🇪",
  NOR: "🇳🇴", IRL: "🇮🇪", TUR: "🇹🇷", GRC: "🇬🇷", ROU: "🇷🇴",
  HUN: "🇭🇺", CZE: "🇨🇿", AUT: "🇦🇹", CHE: "🇨🇭", SVN: "🇸🇮",
  SVK: "🇸🇰", BIH: "🇧🇦", MNE: "🇲🇪",
}

export function WorldMap({ jogadores, onEdit }: Props) {
  const [tooltip, setTooltip] = useState<{ x: number; y: number; name: string; count: number } | null>(null)
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null)

  // Agrupar jogadores por código de país
  const playersByCountry = useMemo(() => {
    const map: Record<string, JogadorObservado[]> = {}
    for (const j of jogadores) {
      if (!j.nacionalidade) continue
      const key = j.nacionalidade.toLowerCase().trim()
      const code = NATIONALITY_TO_CODE[key]
      if (code) {
        if (!map[code]) map[code] = []
        map[code].push(j)
      }
    }
    return map
  }, [jogadores])

  const selectedPlayers = selectedCountry ? (playersByCountry[selectedCountry] ?? []) : []
  const selectedCountryData = COUNTRY_PATHS.find(c => c.code === selectedCountry)

  // Estatísticas para a legenda
  const totalComPais = Object.values(playersByCountry).reduce((sum, arr) => sum + arr.length, 0)
  const semPais = jogadores.length - totalComPais

  return (
    <div className="relative">
      {/* Header info */}
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm text-muted-foreground">
          {jogadores.length} jogadores • {Object.keys(playersByCountry).length} países • {semPais > 0 && <span>{semPais} sem país definido</span>}
        </div>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm" style={{ background: "#00D66C33", border: "1px solid #00D66C" }} /> 1 jogador
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm" style={{ background: "#00D66C66", border: "1px solid #00D66C" }} /> 2–3
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm" style={{ background: "#00D66C99", border: "1px solid #00D66C" }} /> 4–6
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm" style={{ background: "#00D66C", border: "1px solid #00D66C" }} /> 7+
          </div>
        </div>
      </div>

      {/* SVG Map */}
      <div className="relative rounded-xl overflow-hidden border border-border" style={{ background: "#0f172a" }}>
        <svg
          viewBox="0 0 600 340"
          className="w-full"
          style={{ display: "block" }}
          onMouseLeave={() => setTooltip(null)}
        >
          {/* Oceano */}
          <rect width={600} height={340} fill="#0f172a" />

          {COUNTRY_PATHS.map(country => {
            const count = playersByCountry[country.code]?.length ?? 0
            const isSelected = selectedCountry === country.code
            // Escalar as coordenadas de 1000x500 para 600x340
            const scaledPath = country.path
              .replace(/(\d+\.?\d*),(\d+\.?\d*)/g, (_, x, y) =>
                `${(parseFloat(x) * 0.6).toFixed(1)},${(parseFloat(y) * 0.68).toFixed(1)}`
              )
            const scaledCx = country.cx * 0.6
            const scaledCy = country.cy * 0.68

            return (
              <g
                key={country.code}
                style={{ cursor: count > 0 ? "pointer" : "default" }}
                onClick={() => count > 0 && setSelectedCountry(country.code)}
                onMouseEnter={e => {
                  const svg = (e.target as SVGElement).closest("svg")!
                  const rect = svg.getBoundingClientRect()
                  setTooltip({
                    x: (e.clientX - rect.left) / rect.width * 600,
                    y: (e.clientY - rect.top) / rect.height * 340,
                    name: country.name,
                    count,
                  })
                }}
                onMouseLeave={() => setTooltip(null)}
              >
                <path
                  d={scaledPath}
                  fill={isSelected ? "#00D66C" : getCountryColor(count)}
                  stroke={isSelected ? "#fff" : getCountryStroke(count)}
                  strokeWidth={isSelected ? 1.5 : 0.5}
                  opacity={isSelected ? 1 : 0.95}
                />
                {/* Badge com contagem */}
                {count > 0 && (
                  <>
                    <circle
                      cx={scaledCx} cy={scaledCy - 8} r={7}
                      fill={isSelected ? "#fff" : "#00D66C"}
                      stroke={isSelected ? "#00D66C" : "#000"}
                      strokeWidth={0.5}
                    />
                    <text
                      x={scaledCx} y={scaledCy - 5}
                      textAnchor="middle"
                      fontSize={6.5}
                      fontWeight="800"
                      fill={isSelected ? "#00D66C" : "#000"}
                      style={{ pointerEvents: "none", userSelect: "none" }}
                    >
                      {count}
                    </text>
                  </>
                )}
              </g>
            )
          })}

          {/* Tooltip */}
          {tooltip && (
            <g style={{ pointerEvents: "none" }}>
              <rect
                x={Math.min(tooltip.x + 8, 520)} y={Math.max(tooltip.y - 28, 4)}
                width={tooltip.count > 0 ? 140 : 100} height={24}
                rx={4} fill="rgba(0,0,0,0.85)" stroke="rgba(255,255,255,0.1)" strokeWidth={0.5}
              />
              <text
                x={Math.min(tooltip.x + 16, 528)} y={Math.max(tooltip.y - 12, 18)}
                fontSize={9} fill="#fff" fontWeight="600"
              >
                {tooltip.name}{tooltip.count > 0 ? ` — ${tooltip.count} jogador${tooltip.count !== 1 ? "es" : ""}` : ""}
              </text>
            </g>
          )}
        </svg>
      </div>

      {/* Painel lateral — jogadores do país */}
      <AnimatePresence>
        {selectedCountry && selectedCountryData && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-40"
              onClick={() => setSelectedCountry(null)}
            />
            {/* Painel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="fixed right-0 top-0 h-full w-80 bg-background border-l border-border z-50 flex flex-col shadow-2xl"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-4 border-b border-border">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{COUNTRY_FLAGS[selectedCountry] ?? "🌍"}</span>
                    <div>
                      <div className="font-bold">{selectedCountryData.name}</div>
                      <div className="text-xs text-muted-foreground">{selectedPlayers.length} jogador{selectedPlayers.length !== 1 ? "es" : ""}</div>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedCountry(null)}
                  className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-muted transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Lista de jogadores */}
              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {selectedPlayers.map(j => {
                  const ec = ESTADOS_CONFIG[j.estado]
                  return (
                    <div
                      key={j.id}
                      className="flex items-center gap-3 p-3 rounded-lg border border-border hover:border-[#00D66C]/40 hover:bg-muted/20 cursor-pointer transition-colors"
                      onClick={() => { setSelectedCountry(null); onEdit(j) }}
                    >
                      {j.fotoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={j.fotoUrl} alt={j.nome} className="w-10 h-10 rounded-full object-cover shrink-0 border border-border" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                          <User className="w-4 h-4 text-muted-foreground" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">{j.nome}</div>
                        <div className="text-xs text-muted-foreground">{j.posicao} · {j.clube || "—"}</div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <div className="flex gap-0.5">
                            {[1,2,3,4,5].map(i => (
                              <Star key={i} className={`w-2.5 h-2.5 ${i <= j.avaliacao ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground"}`} />
                            ))}
                          </div>
                          <span className="text-xs font-medium" style={{ color: ec?.color }}>{ec?.label}</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
