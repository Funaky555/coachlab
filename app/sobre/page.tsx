import { PageHeader } from "@/components/landing/page-header"
import { Award, Globe, Trophy } from "lucide-react"

export default function SobrePage() {
  return (
    <div className="min-h-screen bg-background">
      <PageHeader />

      <main className="pt-24 pb-16 px-4">
        <div className="max-w-5xl mx-auto">

          {/* Page title */}
          <div className="text-center mb-16">
            <div className="text-[#00D66C] text-sm font-semibold uppercase tracking-wider mb-3">
              Sobre o CoachLab
            </div>
            <h1 className="text-5xl md:text-6xl font-bold" style={{ fontFamily: "var(--font-barlow-condensed)" }}>
              Construído por um{" "}
              <span className="text-gradient-brand">treinador real</span>
            </h1>
          </div>

          {/* Founder card — centrado */}
          <div className="flex justify-center">
            <div className="relative w-full max-w-md">
              <div className="glass-card rounded-2xl p-8 relative overflow-hidden">
                {/* Top gradient bar */}
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#00D66C] via-[#0066FF] to-[#8B5CF6]" />

                <div className="flex items-center gap-4 mb-6">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/logo-dds.png"
                    alt="Daniel de Sousa"
                    width={60}
                    height={60}
                    className="rounded-full object-cover shrink-0 border-2 border-[#00D66C]/30"
                  />
                  <div>
                    <h3 className="font-bold text-xl">Daniel de Sousa</h3>
                    <p className="text-[#00D66C] text-sm font-medium">Fundador & Treinador</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {[
                    { icon: Award, text: "Licença UEFA B de Futebol" },
                    { icon: Globe, text: "Experiência em Portugal e China" },
                    { icon: Trophy, text: "+10 anos de experiência no futebol" },
                  ].map(({ icon: Icon, text }) => (
                    <div key={text} className="flex items-center gap-3 text-sm text-muted-foreground">
                      <div className="w-8 h-8 rounded-lg bg-[#00D66C]/10 flex items-center justify-center shrink-0">
                        <Icon className="w-4 h-4 text-[#00D66C]" />
                      </div>
                      {text}
                    </div>
                  ))}
                </div>
              </div>

              {/* Floating card */}
              <div className="absolute -bottom-4 -right-4 glass rounded-xl p-4 shadow-xl border border-[#0066FF]/20">
                <div className="text-xs text-muted-foreground mb-1">Criado com paixão pelo futebol</div>
                <div className="text-sm font-semibold text-[#0066FF]">coachlab-six.vercel.app</div>
              </div>
            </div>
          </div>
        </div>
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
