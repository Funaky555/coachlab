import Link from "next/link"
import { HeroSection } from "@/components/landing/hero-section"
import { Wrench } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Under construction banner */}
      <div className="fixed top-0 left-0 right-0 z-[60] flex items-center justify-center gap-2 py-1.5 text-[11px] font-semibold text-black"
        style={{ background: "linear-gradient(90deg, #FF6B35, #FF9500, #FF6B35)", backgroundSize: "200% 100%", animation: "shimmer 3s linear infinite" }}>
        <Wrench className="w-3 h-3" />
        <span>Constantly evolving — new features on the way!</span>
        <Wrench className="w-3 h-3" />
      </div>

      {/* Header */}
      <header className="fixed top-7 left-0 right-0 z-50 h-16 border-b border-border/50 bg-background/80 backdrop-blur-md flex items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="CoachLab" width={40} height={40} className="rounded-full" />
          <span className="font-bold text-lg" style={{ fontFamily: "var(--font-barlow-condensed)" }}>
            CoachLab
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
          <Link href="/sobre" className="hover:text-foreground transition-colors">About</Link>
          <Link href="/funcionalidades" className="hover:text-foreground transition-colors">Features</Link>
          <Link href="/precos" className="hover:text-foreground transition-colors">Pricing</Link>
          <Link href="/board" className="hover:text-foreground transition-colors">Board</Link>
          <Link
            href="/dashboard/plantel"
            className="px-4 py-1.5 rounded-full bg-[#00D66C] text-black text-sm font-semibold hover:bg-[#00D66C]/90 transition-colors"
          >
            Dashboard
          </Link>
        </nav>

        {/* Mobile nav */}
        <div className="flex md:hidden items-center gap-3">
          <Link href="/board" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
            Board
          </Link>
          <Link
            href="/dashboard/plantel"
            className="px-3 py-1 rounded-full bg-[#00D66C] text-black text-xs font-semibold"
          >
            Dashboard
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="pt-7">
        <HeroSection />
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-6 text-center text-sm text-muted-foreground">
        <p>
          © 2025 CoachLab · Built by{" "}
          <a
            href="https://danieldesousa-portfolio.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#0066FF] hover:underline"
          >
            Daniel de Sousa
          </a>
        </p>
      </footer>
    </div>
  )
}
