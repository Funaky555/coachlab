import { PageHeader } from "@/components/landing/page-header"

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
              <span className="text-gradient-brand">Treinador de Futebol</span>
            </h1>
          </div>

          {/* Content grid */}
          <div className="grid md:grid-cols-2 gap-12 items-start">

            {/* Founder card */}
            <div className="relative">
              <div className="glass-card rounded-2xl p-8 relative overflow-hidden">
                {/* Top gradient bar */}
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#00D66C] via-[#0066FF] to-[#8B5CF6]" />

                <div className="flex items-center gap-4">
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
              </div>

              {/* Floating card */}
              <div className="absolute -bottom-4 -right-4 glass rounded-xl p-4 shadow-xl border border-[#0066FF]/20">
                <div className="text-xs text-muted-foreground mb-1">Criado com paixão pelo futebol</div>
                <div className="text-sm font-semibold text-[#0066FF]">coachlab-six.vercel.app</div>
              </div>
            </div>

            {/* Text content */}
            <div className="space-y-6 text-muted-foreground leading-relaxed">
              <p className="text-base">
                O CoachLab nasceu da frustração de não existir uma ferramenta que combinasse
                tudo o que um treinador moderno precisa: planeamento, análise, gestão de plantel
                e scouting — numa só plataforma.
              </p>
              <p className="text-base">
                Com experiência a trabalhar em Portugal e na China, Daniel de Sousa criou o
                CoachLab para democratizar o acesso a ferramentas profissionais de coaching,
                tornando-as acessíveis a treinadores amadores e profissionais.
              </p>
              <p className="text-base">
                O tabuleiro tático é gratuito para sempre. Os módulos avançados estão disponíveis
                através do pagamento das respetivas subscrições.
              </p>

              <a
                href="https://danieldesousa-portfolio.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-[#0066FF] hover:text-[#0066FF]/80 transition-colors text-sm font-medium"
              >
                Ver portfólio do fundador →
              </a>
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
