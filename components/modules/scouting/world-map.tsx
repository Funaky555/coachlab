"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Star, User } from "lucide-react"
import { geoNaturalEarth1, geoPath, geoCentroid } from "d3-geo"
import * as topojson from "topojson-client"
import type { Topology, Objects } from "topojson-specification"
import type { Feature, Geometry, GeoJsonProperties } from "geojson"
import { type JogadorObservado } from "@/lib/storage/scouting"
import { NATIONALITY_TO_CODE, UN_TO_ISO3, COUNTRY_NAMES, COUNTRY_FLAGS } from "./world-map-data"

interface Props {
  jogadores: JogadorObservado[]
  onEdit: (j: JogadorObservado) => void
}

const W = 960
const H = 500

const projection = geoNaturalEarth1()
  .scale(153)
  .translate([W / 2, H / 2])

const pathGen = geoPath(projection)

function getCountryColor(count: number): string {
  if (count === 0) return "#334155"
  if (count === 1) return "#00D66C33"
  if (count <= 3) return "#00D66C66"
  if (count <= 6) return "#00D66C99"
  return "#00D66C"
}

const ESTADOS_CONFIG: Record<string, { label: string; color: string }> = {
  em_observacao: { label: "Em Observação", color: "#0066FF" },
  contactado:    { label: "Contactado",    color: "#8B5CF6" },
  contratado:    { label: "Contratado",    color: "#00D66C" },
  descartado:    { label: "Descartado",    color: "#6B7280" },
}

type GeoFeature = Feature<Geometry, GeoJsonProperties>

function MiniCountryMap({ feature }: { feature: GeoFeature }) {
  const MW = 240, MH = 130
  const proj = useMemo(() => {
    return geoNaturalEarth1().fitSize([MW, MH], feature)
  }, [feature])
  const d = useMemo(() => geoPath(proj)(feature) ?? "", [proj, feature])
  if (!d) return null
  return (
    <svg viewBox={`0 0 ${MW} ${MH}`} className="w-full rounded-lg" style={{ display: "block" }}>
      <rect width={MW} height={MH} fill="#0a1628" rx={6} />
      <path d={d} fill="#00D66C22" stroke="#00D66C" strokeWidth={1.5} />
    </svg>
  )
}

export function WorldMap({ jogadores, onEdit }: Props) {
  const [geographies, setGeographies] = useState<GeoFeature[]>([])
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null)
  const [selectedFeature, setSelectedFeature] = useState<GeoFeature | null>(null)
  const [tooltip, setTooltip] = useState<{ x: number; y: number; name: string; count: number } | null>(null)

  useEffect(() => {
    fetch("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json")
      .then(r => r.json())
      .then((topo: Topology<Objects>) => {
        const countries = topojson.feature(topo, topo.objects.countries)
        if (countries.type === "FeatureCollection") {
          setGeographies(countries.features as GeoFeature[])
        }
      })
      .catch(console.error)
  }, [])

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
  const selectedCountryName = selectedCountry ? (COUNTRY_NAMES[selectedCountry] ?? selectedCountry) : ""
  const selectedCountryFlag = selectedCountry ? (COUNTRY_FLAGS[selectedCountry] ?? "🌍") : "🌍"

  const totalComPais = Object.values(playersByCountry).reduce((s, a) => s + a.length, 0)
  const semPais = jogadores.length - totalComPais

  const handleMouseMove = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    const svg = e.currentTarget
    const rect = svg.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width * W
    const y = (e.clientY - rect.top) / rect.height * H
    const el = e.target as SVGElement
    const code = el.getAttribute("data-code")
    const countAttr = el.getAttribute("data-count")
    if (code) {
      setTooltip({ x, y, name: COUNTRY_NAMES[code] ?? code, count: Number(countAttr ?? 0) })
    } else {
      setTooltip(null)
    }
  }, [])

  return (
    <div className="relative">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm text-muted-foreground">
          {jogadores.length} jogadores • {Object.keys(playersByCountry).length} países
          {semPais > 0 && <span> • {semPais} sem país definido</span>}
        </div>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm" style={{ background: "#00D66C33", border: "1px solid #00D66C" }} /> 1
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

      {/* Mapa */}
      <div className="relative rounded-xl overflow-hidden border border-border" style={{ background: "#0f172a" }}>
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full"
          style={{ display: "block" }}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setTooltip(null)}
        >
          <rect width={W} height={H} fill="#0f172a" />

          {geographies.map((geo) => {
            const id = String((geo as GeoFeature & { id?: string | number }).id ?? "").padStart(3, '0')
            const iso3 = UN_TO_ISO3[id]
            const count = iso3 ? (playersByCountry[iso3]?.length ?? 0) : 0
            const isSelected = iso3 === selectedCountry
            const d = pathGen(geo) ?? ""
            if (!d) return null

            return (
              <path
                key={id}
                d={d}
                data-code={iso3 ?? ""}
                data-count={count}
                fill={isSelected ? "#00D66C" : getCountryColor(count)}
                stroke="rgba(255,255,255,0.12)"
                strokeWidth={0.4}
                style={{
                  cursor: count > 0 ? "pointer" : "default",
                  filter: isSelected ? "drop-shadow(0 0 6px #00D66C)" : undefined,
                  transition: "fill 0.15s",
                }}
                onClick={() => {
                  if (iso3 && count > 0) {
                    setSelectedCountry(iso3)
                    setSelectedFeature(geo)
                  }
                }}
              />
            )
          })}

          {/* Badges de contagem */}
          {geographies.map((geo) => {
            const id = String((geo as GeoFeature & { id?: string | number }).id ?? "").padStart(3, '0')
            const iso3 = UN_TO_ISO3[id]
            const count = iso3 ? (playersByCountry[iso3]?.length ?? 0) : 0
            if (!count || !iso3) return null
            const isSelected = iso3 === selectedCountry
            const centroid = geoCentroid(geo)
            const coords = projection(centroid as [number, number])
            if (!coords) return null
            const [cx, cy] = coords
            return (
              <g key={`badge-${id}`} style={{ pointerEvents: "none" }}>
                <circle
                  cx={cx} cy={cy} r={9}
                  fill={isSelected ? "#fff" : "#00D66C"}
                  stroke={isSelected ? "#00D66C" : "#0f172a"}
                  strokeWidth={1}
                />
                <text
                  x={cx} y={cy + 3.5}
                  textAnchor="middle"
                  fontSize={8}
                  fontWeight="800"
                  fill={isSelected ? "#00D66C" : "#0f172a"}
                  style={{ userSelect: "none" }}
                >
                  {count}
                </text>
              </g>
            )
          })}

          {/* Tooltip */}
          {tooltip && tooltip.name && (
            <g style={{ pointerEvents: "none" }}>
              <rect
                x={Math.min(tooltip.x + 10, W - 160)} y={Math.max(tooltip.y - 32, 4)}
                width={tooltip.count > 0 ? 155 : 110} height={24}
                rx={5} fill="rgba(0,0,0,0.88)" stroke="rgba(255,255,255,0.15)" strokeWidth={0.5}
              />
              <text
                x={Math.min(tooltip.x + 18, W - 152)} y={Math.max(tooltip.y - 15, 19)}
                fontSize={10} fill="#fff" fontWeight="600"
              >
                {tooltip.name}{tooltip.count > 0 ? ` — ${tooltip.count} jogador${tooltip.count !== 1 ? "es" : ""}` : ""}
              </text>
            </g>
          )}
        </svg>
      </div>

      {/* Painel lateral */}
      <AnimatePresence>
        {selectedCountry && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-40"
              onClick={() => { setSelectedCountry(null); setSelectedFeature(null) }}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="fixed right-0 top-0 h-full w-80 bg-background border-l border-border z-50 flex flex-col shadow-2xl"
            >
              {/* Header do painel */}
              <div className="px-4 py-4 border-b border-border" style={{ background: "linear-gradient(135deg, #00D66C10, #0066FF10)" }}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-3xl">{selectedCountryFlag}</span>
                    <div>
                      <div className="font-bold text-base">{selectedCountryName}</div>
                      <div className="text-xs text-muted-foreground">
                        {selectedPlayers.length} jogador{selectedPlayers.length !== 1 ? "es" : ""}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => { setSelectedCountry(null); setSelectedFeature(null) }}
                    className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-muted transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                {/* Mini mapa do país */}
                {selectedFeature && (
                  <div className="rounded-lg overflow-hidden border border-[#00D66C]/20">
                    <MiniCountryMap feature={selectedFeature} />
                  </div>
                )}
              </div>

              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {selectedPlayers.map(j => {
                  const ec = ESTADOS_CONFIG[j.estado]
                  return (
                    <div
                      key={j.id}
                      className="flex items-center gap-3 p-3 rounded-lg border border-border hover:border-[#00D66C]/40 hover:bg-muted/20 cursor-pointer transition-colors"
                      onClick={() => { setSelectedCountry(null); setSelectedFeature(null); onEdit(j) }}
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
