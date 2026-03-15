"use client"

import { useState } from "react"
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { usePathname } from "next/navigation"

const routeTitles: Record<string, string> = {
  "/dashboard/plantel": "Squad Management",
  "/dashboard/treinos": "Training Planning",
  "/dashboard/analise": "Match Analysis",
  "/dashboard/scouting": "Scouting",
  "/dashboard/medico": "Medical Dept.",
  "/dashboard/fisico": "Physical Monitoring",
  "/dashboard/adversario": "Opposition Prep.",
  "/dashboard/comunicacao": "Internal Communication",
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
      <main className="md:ml-60 pt-14 md:pt-0 md:h-screen md:overflow-hidden">
        {children}
      </main>
    </div>
  )
}
