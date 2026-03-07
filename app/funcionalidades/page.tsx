import { PageHeader } from "@/components/landing/page-header"
import { FeaturesSection } from "@/components/landing/features-section"

export default function FuncionalidadesPage() {
  return (
    <div className="min-h-screen bg-background">
      <PageHeader />
      <main className="pt-16">
        <FeaturesSection />
      </main>
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
