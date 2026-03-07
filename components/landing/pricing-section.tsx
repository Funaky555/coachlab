"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { CheckCircle } from "lucide-react"
import Link from "next/link"

const plans = [
  {
    name: "Free",
    price: "€0",
    period: "/mês",
    description: "Para treinadores que querem começar",
    color: "border-border",
    cta: "Começar grátis",
    href: "/board",
    features: [
      "Nomes de Jogadores",
      "Score do Jogo",
      "Pinos e Formações Táticas",
      "Exportar como PNG",
      "Fotos de Jogadores",
      "Cores das Equipas",
      "Limpar Tabuleiro",
    ],
    highlight: false,
  },
  {
    name: "Pro",
    price: "€9",
    period: "/mês",
    description: "Para treinadores profissionais",
    color: "border-[#00D66C]",
    cta: "Começar Pro",
    href: "/dashboard/plantel",
    features: [
      "Tudo do plano Free",
      "Gestão completa do plantel",
      "Planeamento de treinos (microciclo)",
      "Análise de jogo e estatísticas",
      "Scouting e base de dados",
      "Dep. médico e monitorização",
      "Preparação do adversário",
      "Comunicação interna",
    ],
    highlight: true,
    badge: "Mais Popular",
  },
  {
    name: "Elite",
    price: "€19",
    period: "/mês",
    description: "Para clubes e equipas técnicas",
    color: "border-[#8B5CF6]/50",
    cta: "Em breve",
    href: "#",
    features: [
      "Tudo do plano Pro",
      "Multi-equipa e multi-utilizador",
      "Exportação PDF de relatórios",
      "Partilha com jogadores",
      "Integração com GPS (em breve)",
      "Suporte prioritário",
    ],
    highlight: false,
    comingSoon: true,
  },
]

export function PricingSection() {
  return (
    <section id="pricing" className="py-24 px-4">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-6"
        >
          <div className="text-[#00D66C] text-sm font-semibold uppercase tracking-wider mb-3">
            Preços
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ fontFamily: "var(--font-barlow-condensed)" }}>
            Simples e{" "}
            <span className="text-gradient-brand">transparente</span>
          </h2>
        </motion.div>


        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`relative rounded-2xl border p-6 flex flex-col ${plan.color} ${
                plan.highlight
                  ? "shadow-[0_0_40px_rgba(0,214,108,0.15)]"
                  : ""
              }`}
              style={{
                background: plan.highlight
                  ? "linear-gradient(135deg, hsl(var(--card) / 0.9), hsl(var(--card) / 0.7))"
                  : "hsl(var(--card) / 0.5)",
              }}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="px-3 py-1 rounded-full bg-[#00D66C] text-black text-xs font-bold">
                    {plan.badge}
                  </span>
                </div>
              )}

              {plan.highlight && (
                <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl bg-gradient-to-r from-[#00D66C] to-[#0066FF]" />
              )}

              <div className="mb-4">
                <h3 className="text-lg font-bold mb-1">{plan.name}</h3>
                <p className="text-sm text-muted-foreground">{plan.description}</p>
              </div>

              <div className="mb-6 flex items-end gap-1">
                <span className="text-4xl font-bold" style={{ fontFamily: "var(--font-barlow-condensed)" }}>
                  {plan.price}
                </span>
                <span className="text-muted-foreground text-sm mb-1">{plan.period}</span>
              </div>

              <div className="space-y-2 mb-8 flex-1">
                {plan.features.map((f) => (
                  <div key={f} className="flex items-start gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-[#00D66C] shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{f}</span>
                  </div>
                ))}
              </div>

              <Link href={plan.href}>
                <Button
                  className={`w-full ${
                    plan.highlight
                      ? "bg-[#00D66C] hover:bg-[#00D66C]/90 text-black font-semibold"
                      : plan.comingSoon
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                  variant={plan.highlight ? "default" : "outline"}
                  disabled={plan.comingSoon}
                >
                  {plan.cta}
                </Button>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
