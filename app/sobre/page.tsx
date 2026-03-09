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
              About CoachLab
            </div>
            <h1 className="text-5xl md:text-6xl font-bold" style={{ fontFamily: "var(--font-barlow-condensed)" }}>
              Built by a{" "}
              <span className="text-gradient-brand">Football Coach</span>
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
                    <p className="text-[#00D66C] text-sm font-medium">Founder & Coach</p>
                  </div>
                </div>
              </div>

              {/* Floating card */}
              <div className="absolute -bottom-4 -right-4 glass rounded-xl p-4 shadow-xl border border-[#0066FF]/20">
                <div className="text-xs text-muted-foreground mb-1">Built with passion for football</div>
                <div className="text-sm font-semibold text-[#0066FF]">coachlab-six.vercel.app</div>
              </div>
            </div>

            {/* Text content */}
            <div className="space-y-6 text-muted-foreground leading-relaxed">
              <p className="text-base">
                CoachLab was born out of the frustration of not having a single tool that combined
                everything a modern coach needs: planning, analysis, squad management,
                and scouting — all in one platform.
              </p>
              <p className="text-base">
                With experience working in Portugal and China, Daniel de Sousa created
                CoachLab to democratise access to professional coaching tools,
                making them accessible to both amateur and professional coaches.
              </p>
              <p className="text-base">
                The tactical board is free forever. Advanced modules are available
                through their respective subscription plans.
              </p>

              <a
                href="https://danieldesousa-portfolio.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-[#0066FF] hover:text-[#0066FF]/80 transition-colors text-sm font-medium"
              >
                View founder's portfolio →
              </a>
            </div>
          </div>
        </div>
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
