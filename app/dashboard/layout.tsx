"use client"

import { useState } from "react"
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { usePathname } from "next/navigation"

const routeTitles: Record<string, string> = {
  "/dashboard/plantel": "Gestão do Plantel",
  "/dashboard/treinos": "Planeamento de Treino",
  "/dashboard/analise": "Análise de Jogo",
  "/dashboard/scouting": "Scouting",
  "/dashboard/medico": "Dep. Médico",
  "/dashboard/fisico": "Monitorização Física",
  "/dashboard/adversario": "Prep. Adversário",
  "/dashboard/comunicacao": "Comunicação Interna",
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()
  const title = routeTitles[pathname] ?? "Dashboard"

  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar
        mobileOpen={sidebarOpen}
        onMobileClose={() => setSidebarOpen(false)}
      />
      <DashboardHeader
        title={title}
        onMenuClick={() => setSidebarOpen(true)}
      />
      {/* Main content — offset for sidebar on desktop, header on mobile */}
      <main className="md:ml-60 pt-14 md:pt-0 min-h-screen">
        {children}
      </main>
    </div>
  )
}
