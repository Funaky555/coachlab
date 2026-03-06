import Link from "next/link"
import { HeroSection } from "@/components/landing/hero-section"
import { FounderSection } from "@/components/landing/founder-section"
import { FeaturesSection } from "@/components/landing/features-section"
import { PricingSection } from "@/components/landing/pricing-section"
import { CtaSection } from "@/components/landing/cta-section"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 h-16 border-b border-border/50 bg-background/80 backdrop-blur-md flex items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="CoachLab" width={40} height={40} className="rounded-full" />
          <span className="font-bold text-lg" style={{ fontFamily: "var(--font-barlow-condensed)" }}>
            CoachLab
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
          <a href="#features" className="hover:text-foreground transition-colors">Funcionalidades</a>
          <a href="#pricing" className="hover:text-foreground transition-colors">Preços</a>
          <Link href="/board" className="hover:text-foreground transition-colors">Tabuleiro</Link>
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
            Tabuleiro
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
      <main>
        <HeroSection />
        <FounderSection />
        <FeaturesSection />
        <PricingSection />
        <CtaSection />
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-6 text-center text-sm text-muted-foreground">
        <p>
          © 2025 CoachLab · Criado por{" "}
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
