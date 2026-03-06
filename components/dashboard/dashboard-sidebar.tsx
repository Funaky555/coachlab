"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"
import {
  Users, Calendar, BarChart3, Search,
  Heart, Zap, Target, MessageSquare,
  Palette, Home, X
} from "lucide-react"

const navItems = [
  {
    href: "/board",
    icon: Palette,
    label: "Tabuleiro Tático",
    color: "#0066FF",
    badge: "FREE",
    external: true,
  },
]

const proItems = [
  { href: "/dashboard/plantel", icon: Users, label: "Gestão do Plantel", color: "#00D66C" },
  { href: "/dashboard/treinos", icon: Calendar, label: "Planeamento de Treino", color: "#0066FF" },
  { href: "/dashboard/analise", icon: BarChart3, label: "Análise de Jogo", color: "#8B5CF6" },
  { href: "/dashboard/scouting", icon: Search, label: "Scouting", color: "#FF6B35" },
  { href: "/dashboard/medico", icon: Heart, label: "Dep. Médico", color: "#00D66C" },
  { href: "/dashboard/fisico", icon: Zap, label: "Monitorização Física", color: "#0066FF" },
  { href: "/dashboard/adversario", icon: Target, label: "Prep. Adversário", color: "#8B5CF6" },
  { href: "/dashboard/comunicacao", icon: MessageSquare, label: "Comunicação", color: "#FF6B35" },
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
          className="fixed inset-0 bg-black/60 z-30 md:hidden"
          onClick={onMobileClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 h-full w-60 bg-card border-r border-border flex flex-col z-40 transition-transform duration-300",
          "md:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-border">
          <Link href="/" className="flex items-center gap-2.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="CoachLab" width={36} height={36} className="rounded-full" />
            <span className="font-bold text-base" style={{ fontFamily: "var(--font-barlow-condensed)" }}>
              CoachLab
            </span>
          </Link>
          {mobileOpen && (
            <button onClick={onMobileClose} className="md:hidden p-1 text-muted-foreground hover:text-foreground">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-2">
          {/* Home */}
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors mb-1"
          >
            <Home className="w-4 h-4" />
            <span>Início</span>
          </Link>

          {/* Free tools */}
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors mb-1",
                  isActive
                    ? "bg-[#0066FF]/10 text-[#0066FF]"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                <Icon className="w-4 h-4 shrink-0" style={{ color: isActive ? item.color : undefined }} />
                <span className="flex-1">{item.label}</span>
                {item.badge && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground font-medium">
                    {item.badge}
                  </span>
                )}
              </Link>
            )
          })}

          <div className="px-3 my-3">
            <Separator />
          </div>

          {/* PRO label */}
          <div className="px-3 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
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
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors mb-1",
                  isActive
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
                style={isActive ? { background: `${item.color}15` } : undefined}
              >
                <Icon
                  className="w-4 h-4 shrink-0"
                  style={{ color: isActive ? item.color : undefined }}
                />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-border">
          <a
            href="https://danieldesousa-portfolio.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            by Daniel de Sousa
          </a>
        </div>
      </aside>
    </>
  )
}
