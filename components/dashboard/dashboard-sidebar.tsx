"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  Users, Calendar, BarChart3, Search,
  Heart, Zap, Target, MessageSquare,
  Palette, Home, X, LayoutDashboard
} from "lucide-react"

const navItems = [
  {
    href: "/board",
    icon: Palette,
    label: "Tabuleiro Tático",
    color: "#0066FF",
    badge: "FREE",
  },
]

const proItems = [
  { href: "/dashboard/plantel",    icon: Users,          label: "Gestão do Plantel",      color: "#00D66C", gradient: "from-[#00D66C]/20 to-[#00D66C]/5" },
  { href: "/dashboard/treinos",    icon: Calendar,       label: "Planeamento de Treino",  color: "#0066FF", gradient: "from-[#0066FF]/20 to-[#0066FF]/5" },
  { href: "/dashboard/analise",    icon: BarChart3,      label: "Análise de Jogo",        color: "#8B5CF6", gradient: "from-[#8B5CF6]/20 to-[#8B5CF6]/5" },
  { href: "/dashboard/scouting",   icon: Search,         label: "Scouting",               color: "#FF6B35", gradient: "from-[#FF6B35]/20 to-[#FF6B35]/5" },
  { href: "/dashboard/medico",     icon: Heart,          label: "Dep. Médico",            color: "#00D66C", gradient: "from-[#00D66C]/20 to-[#00D66C]/5" },
  { href: "/dashboard/fisico",     icon: Zap,            label: "Monitorização Física",   color: "#0066FF", gradient: "from-[#0066FF]/20 to-[#0066FF]/5" },
  { href: "/dashboard/adversario", icon: Target,         label: "Prep. Adversário",       color: "#8B5CF6", gradient: "from-[#8B5CF6]/20 to-[#8B5CF6]/5" },
  { href: "/dashboard/comunicacao",icon: MessageSquare,  label: "Comunicação",            color: "#FF6B35", gradient: "from-[#FF6B35]/20 to-[#FF6B35]/5" },
]

interface DashboardSidebarProps {
  mobileOpen?: boolean
  onMobileClose?: () => void
}

export function DashboardSidebar({ mobileOpen, onMobileClose }: DashboardSidebarProps) {
  const pathname = usePathname()

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/70 z-30 md:hidden backdrop-blur-sm"
          onClick={onMobileClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 h-full w-60 flex flex-col z-40 transition-transform duration-300",
          "md:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
        style={{
          background: "linear-gradient(180deg, #060f1e 0%, #0a1628 60%, #0d1f35 100%)",
          borderRight: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        {/* Logo header */}
        <div
          className="h-16 flex items-center justify-between px-4 shrink-0"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
        >
          <Link href="/" className="flex items-center gap-2.5 group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.png"
              alt="CoachLab"
              width={36}
              height={36}
              className="rounded-full transition-transform group-hover:scale-105"
              style={{ boxShadow: "0 0 12px rgba(0,214,108,0.35)" }}
            />
            <span
              className="font-bold text-base text-white"
              style={{ fontFamily: "var(--font-barlow-condensed)" }}
            >
              CoachLab
            </span>
          </Link>
          {mobileOpen && (
            <button
              onClick={onMobileClose}
              className="md:hidden p-1 text-white/40 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">

          {/* Home */}
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-white/40 hover:text-white/80 hover:bg-white/5 transition-all mb-1"
          >
            <Home className="w-4 h-4 shrink-0" />
            <span>Início</span>
          </Link>

          {/* Tabuleiro (FREE) */}
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all mb-2",
                  isActive
                    ? "text-white"
                    : "text-white/50 hover:text-white/80 hover:bg-white/5"
                )}
                style={isActive ? {
                  background: `${item.color}20`,
                  borderLeft: `3px solid ${item.color}`,
                } : undefined}
              >
                <Icon className="w-4 h-4 shrink-0" style={{ color: item.color }} />
                <span className="flex-1">{item.label}</span>
                <span
                  className="text-[9px] px-1.5 py-0.5 rounded font-bold tracking-wide"
                  style={{
                    background: `${item.color}25`,
                    color: item.color,
                    border: `1px solid ${item.color}40`,
                  }}
                >
                  FREE
                </span>
              </Link>
            )
          })}

          {/* Separator */}
          <div className="mx-3 my-2.5" style={{ height: "1px", background: "rgba(255,255,255,0.06)" }} />

          {/* PRO label */}
          <div className="flex items-center gap-2 px-3 mb-2">
            <LayoutDashboard className="w-3 h-3 text-white/25" />
            <span className="text-[9px] font-bold uppercase tracking-widest text-white/25">
              Módulos PRO
            </span>
          </div>

          {/* PRO items */}
          {proItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all group relative overflow-hidden"
                style={{
                  background: isActive
                    ? `${item.color}18`
                    : `${item.color}07`,
                  borderLeft: isActive
                    ? `3px solid ${item.color}`
                    : `2px solid ${item.color}35`,
                  color: isActive ? "#ffffff" : `${item.color}CC`,
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = `${item.color}12`
                    e.currentTarget.style.borderLeftColor = `${item.color}70`
                    e.currentTarget.style.color = "#ffffff"
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = `${item.color}07`
                    e.currentTarget.style.borderLeftColor = `${item.color}35`
                    e.currentTarget.style.color = `${item.color}CC`
                  }
                }}
              >
                {/* Icon container with glow */}
                <div
                  className="w-7 h-7 rounded-md flex items-center justify-center shrink-0"
                  style={{
                    background: `${item.color}${isActive ? "25" : "15"}`,
                    boxShadow: isActive ? `0 0 8px ${item.color}40` : "none",
                  }}
                >
                  <Icon
                    className="w-3.5 h-3.5"
                    style={{ color: item.color }}
                  />
                </div>
                <span className="text-sm font-medium leading-tight">{item.label}</span>

                {/* Active glow pulse */}
                {isActive && (
                  <div
                    className="absolute right-2 w-1.5 h-1.5 rounded-full"
                    style={{
                      background: item.color,
                      boxShadow: `0 0 6px ${item.color}`,
                    }}
                  />
                )}
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div
          className="p-4 shrink-0"
          style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
        >
          <a
            href="https://danieldesousa-portfolio.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2.5 group"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo-dds.png"
              alt="Daniel de Sousa"
              width={28}
              height={28}
              className="rounded-full shrink-0 opacity-70 group-hover:opacity-100 transition-opacity"
              style={{ border: "1px solid rgba(0,214,108,0.2)" }}
            />
            <div>
              <div className="text-xs font-semibold text-white/60 group-hover:text-white/90 transition-colors leading-none">
                Daniel de Sousa
              </div>
              <div className="text-[10px] text-white/30 leading-none mt-0.5">Fundador</div>
            </div>
          </a>
        </div>
      </aside>
    </>
  )
}
