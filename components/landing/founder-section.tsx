"use client"

import { motion } from "framer-motion"
import { Award, Globe, Trophy } from "lucide-react"

export function FounderSection() {
  return (
    <section className="py-24 px-4">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="grid md:grid-cols-2 gap-12 items-center"
        >
          {/* Card do fundador */}
          <div className="relative">
            <div className="glass-card rounded-2xl p-8 relative overflow-hidden">
              {/* Glow effect */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#00D66C] via-[#0066FF] to-[#8B5CF6]" />

              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#00D66C] to-[#0066FF] flex items-center justify-center text-2xl font-bold text-white" style={{ fontFamily: "var(--font-barlow-condensed)" }}>
                  DS
                </div>
                <div>
                  <h3 className="font-bold text-xl">Daniel de Sousa</h3>
                  <p className="text-[#00D66C] text-sm font-medium">Fundador & Treinador UEFA B</p>
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

            {/* Decorative card floating */}
            <div className="absolute -bottom-4 -right-4 glass rounded-xl p-4 shadow-xl border border-[#0066FF]/20">
              <div className="text-xs text-muted-foreground mb-1">Criado com paixão pelo futebol</div>
              <div className="text-sm font-semibold text-[#0066FF]">coachlab-six.vercel.app</div>
            </div>
          </div>

          {/* Texto */}
          <div>
            <div className="text-[#00D66C] text-sm font-semibold uppercase tracking-wider mb-3">
              Sobre o CoachLab
            </div>
            <h2 className="text-4xl font-bold mb-6" style={{ fontFamily: "var(--font-barlow-condensed)" }}>
              Construído por um{" "}
              <span className="text-gradient-brand">treinador real</span>
            </h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                O CoachLab nasceu da frustração de não existir uma ferramenta que combinasse
                tudo o que um treinador moderno precisa: planeamento, análise, gestão de plantel
                e scouting — numa só plataforma.
              </p>
              <p>
                Com experiência a trabalhar em Portugal e na China, Daniel de Sousa criou o
                CoachLab para democratizar o acesso a ferramentas profissionais de coaching,
                tornando-as acessíveis a treinadores amadores e profissionais.
              </p>
              <p>
                O tabuleiro tático é gratuito para sempre. Os módulos avançados estão disponíveis
                durante o período beta sem qualquer custo.
              </p>
            </div>

            <a
              href="https://danieldesousa-portfolio.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-6 text-[#0066FF] hover:text-[#0066FF]/80 transition-colors text-sm font-medium"
            >
              Ver portfolio do fundador →
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
