import { PageHeader } from "@/components/landing/page-header"
import { PricingSection } from "@/components/landing/pricing-section"

export default function PrecosPage() {
  return (
    <div className="min-h-screen bg-background">
      <PageHeader />
      <main className="pt-16">
        <PricingSection />
      </main>
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
