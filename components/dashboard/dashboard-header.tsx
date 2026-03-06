"use client"

import { Menu } from "lucide-react"
import Link from "next/link"

interface DashboardHeaderProps {
  title: string
  onMenuClick: () => void
}

export function DashboardHeader({ title, onMenuClick }: DashboardHeaderProps) {
  return (
    <header className="md:hidden fixed top-0 left-0 right-0 h-14 bg-card border-b border-border flex items-center gap-3 px-4 z-20">
      <button
        onClick={onMenuClick}
        className="p-2 rounded-lg hover:bg-muted/50 transition-colors text-muted-foreground"
        aria-label="Abrir menu"
      >
        <Menu className="w-5 h-5" />
      </button>
      <Link href="/" className="flex items-center gap-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="CoachLab" width={28} height={28} className="rounded-full" />
      </Link>
      <span className="font-semibold text-sm truncate">{title}</span>
    </header>
  )
}
