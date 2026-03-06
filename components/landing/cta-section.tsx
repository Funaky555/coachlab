"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import Link from "next/link"

export function CtaSection() {
  return (
    <section className="py-24 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative rounded-3xl overflow-hidden p-12 text-center"
          style={{
            background: "linear-gradient(135deg, rgba(0,214,108,0.1) 0%, rgba(0,102,255,0.1) 50%, rgba(139,92,246,0.1) 100%)",
            border: "1px solid rgba(0,214,108,0.2)",
          }}
        >
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#00D66C]/50 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#8B5CF6]/50 to-transparent" />
          </div>

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.png"
            alt="CoachLab"
            width={64}
            height={64}
            className="rounded-full mx-auto mb-6 glow-green"
          />

          <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ fontFamily: "var(--font-barlow-condensed)" }}>
            Começa hoje —{" "}
            <span className="text-gradient-brand">é gratuito</span>
          </h2>

          <p className="text-muted-foreground text-lg mb-8 max-w-xl mx-auto">
            Junta-te a treinadores que já usam o CoachLab para elevar o nível do seu trabalho.
            Sem cartão de crédito. Sem compromissos.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/dashboard/plantel">
              <Button
                size="lg"
                className="h-12 px-8 text-base font-semibold bg-[#00D66C] hover:bg-[#00D66C]/90 text-black gap-2"
              >
                Aceder ao Dashboard
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Link href="/board">
              <Button
                size="lg"
                variant="outline"
                className="h-12 px-8 text-base font-semibold"
              >
                Ir ao Tabuleiro Tático
              </Button>
            </Link>
          </div>

          <p className="mt-6 text-sm text-muted-foreground">
            Criado por{" "}
            <a
              href="https://danieldesousa-portfolio.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#0066FF] hover:underline"
            >
              Daniel de Sousa
            </a>
            {" "}· UEFA B Football Coach
          </p>
        </motion.div>
      </div>
    </section>
  )
}
