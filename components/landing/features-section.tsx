"use client"

import { motion } from "framer-motion"
import {
  Users, Calendar, BarChart3, Search,
  Heart, Zap, Target, MessageSquare,
  Palette, CheckCircle, Lock
} from "lucide-react"

const freeFeatures = [
  { icon: Palette, title: "Nomes de Jogadores", desc: "Alteração do nome de cada jogador diretamente no tabuleiro" },
  { icon: Palette, title: "Score do Jogo", desc: "Marcador editável com o resultado em tempo real" },
  { icon: Palette, title: "Pinos e Formações Táticas", desc: "Drag & drop dos jogadores com múltiplas formações disponíveis" },
  { icon: Palette, title: "Exportar como PNG", desc: "Guarda o tabuleiro em imagem de alta qualidade" },
  { icon: Palette, title: "Fotos de Jogadores", desc: "Upload de foto personalizada para cada jogador" },
  { icon: Palette, title: "Cores das Equipas", desc: "Altera a cor dos pinos para distinguir equipa da casa e visitante" },
  { icon: Palette, title: "Limpar Tabuleiro", desc: "Reset rápido para recomeçar a análise" },
]

const proModules = [
  { icon: Users, title: "Gestão do Plantel", desc: "Presenças, disciplina, estado e carga de minutos", color: "#00D66C" },
  { icon: Calendar, title: "Planeamento de Treino", desc: "Microciclo semanal, objetivos táticos e carga de treino", color: "#0066FF" },
  { icon: BarChart3, title: "Análise de Jogo", desc: "Relatórios pós-jogo, estatísticas e xG", color: "#8B5CF6" },
  { icon: Search, title: "Scouting", desc: "Base de dados de jogadores observados e fichas de observação", color: "#FF6B35" },
  { icon: Heart, title: "Dep. Médico", desc: "Registo de lesões, recuperação e avaliações físicas", color: "#00D66C" },
  { icon: Zap, title: "Monitorização Física", desc: "Métricas GPS, distância, sprints e RPE", color: "#0066FF" },
  { icon: Target, title: "Preparação do Adversário", desc: "Análise tática, padrões e relatório pré-jogo", color: "#8B5CF6" },
  { icon: MessageSquare, title: "Comunicação Interna", desc: "Calendário, tarefas e notas da equipa técnica", color: "#FF6B35" },
]

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 px-4 bg-card/30">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="text-[#00D66C] text-sm font-semibold uppercase tracking-wider mb-3">
            Funcionalidades
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ fontFamily: "var(--font-barlow-condensed)" }}>
            Tudo o que um treinador{" "}
            <span className="text-gradient-brand">moderno precisa</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Do tabuleiro tático ao scouting — ferramentas profissionais acessíveis a todos.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* FREE */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="glass-card rounded-2xl p-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <span className="px-3 py-1 rounded-full bg-secondary text-sm font-semibold">Free</span>
              <h3 className="text-xl font-bold">Tabuleiro Tático</h3>
            </div>
            <div className="space-y-4">
              {freeFeatures.map((f) => (
                <div key={f.title} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-[#00D66C] shrink-0 mt-0.5" />
                  <div>
                    <div className="font-medium text-sm">{f.title}</div>
                    <div className="text-xs text-muted-foreground">{f.desc}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-6 border-t border-border">
              <a
                href="/board"
                className="inline-flex items-center gap-2 text-sm font-medium text-[#00D66C] hover:opacity-80 transition-opacity"
              >
                Aceder ao tabuleiro →
              </a>
            </div>
          </motion.div>

          {/* PRO */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="rounded-2xl p-8 relative overflow-hidden"
            style={{
              background: "linear-gradient(135deg, hsl(var(--card) / 0.8), hsl(var(--card) / 0.4))",
              border: "1px solid rgba(0, 214, 108, 0.3)",
              backdropFilter: "blur(12px)",
            }}
          >
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#00D66C] via-[#0066FF] to-[#8B5CF6]" />

            <div className="flex items-center gap-3 mb-6">
              <span className="px-3 py-1 rounded-full bg-[#00D66C]/20 text-[#00D66C] border border-[#00D66C]/30 text-sm font-semibold">PRO</span>
              <h3 className="text-xl font-bold">Dashboard Completo</h3>
              <Lock className="w-4 h-4 text-muted-foreground ml-auto" />
            </div>
            <div className="grid grid-cols-1 gap-3">
              {proModules.map((m) => {
                const Icon = m.icon
                return (
                  <div key={m.title} className="flex items-start gap-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: `${m.color}15` }}
                    >
                      <Icon className="w-4 h-4" style={{ color: m.color }} />
                    </div>
                    <div>
                      <div className="font-medium text-sm">{m.title}</div>
                      <div className="text-xs text-muted-foreground">{m.desc}</div>
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="mt-6 pt-6 border-t border-[#00D66C]/20">
              <a
                href="/dashboard/plantel"
                className="inline-flex items-center gap-2 text-sm font-medium text-[#00D66C] hover:opacity-80 transition-opacity"
              >
                Explorar dashboard →
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
