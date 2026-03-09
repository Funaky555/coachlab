"use client"

import { motion } from "framer-motion"
import {
  Users, Calendar, BarChart3, Search,
  Heart, Zap, Target, MessageSquare,
  Palette, CheckCircle, Lock
} from "lucide-react"

const freeFeatures = [
  { icon: Palette, title: "Player Names", desc: "Edit each player's name directly on the board" },
  { icon: Palette, title: "Match Score", desc: "Editable scoreboard with real-time result" },
  { icon: Palette, title: "Pins and Tactical Formations", desc: "Drag & drop players with multiple formations available" },
  { icon: Palette, title: "Export as PNG", desc: "Save the board as a high-quality image" },
  { icon: Palette, title: "Player Photos", desc: "Upload a custom photo for each player" },
  { icon: Palette, title: "Team Colours", desc: "Change pin colours to distinguish home and away teams" },
  { icon: Palette, title: "Clear Board", desc: "Quick reset to start the analysis over" },
]

const proModules = [
  { icon: Users, title: "Squad Management", desc: "Attendance, discipline, status and minute loads", color: "#00D66C" },
  { icon: Calendar, title: "Training Planning", desc: "Weekly microcycle, tactical objectives and training load", color: "#0066FF" },
  { icon: BarChart3, title: "Match Analysis", desc: "Post-match reports, statistics and xG", color: "#8B5CF6" },
  { icon: Search, title: "Scouting", desc: "Database of scouted players and observation profiles", color: "#FF6B35" },
  { icon: Heart, title: "Medical Dept.", desc: "Injury records, recovery and physical assessments", color: "#00D66C" },
  { icon: Zap, title: "Physical Monitoring", desc: "GPS metrics, distance, sprints and RPE", color: "#0066FF" },
  { icon: Target, title: "Opposition Prep.", desc: "Tactical analysis, patterns and pre-match report", color: "#8B5CF6" },
  { icon: MessageSquare, title: "Internal Communication", desc: "Calendar, tasks and coaching staff notes", color: "#FF6B35" },
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
            Features
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ fontFamily: "var(--font-barlow-condensed)" }}>
            Everything a{" "}
            <span className="text-gradient-brand">modern coach needs</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            From the tactical board to scouting — professional tools accessible to everyone.
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
              <h3 className="text-xl font-bold">Tactical Board</h3>
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
                Open board →
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
              <h3 className="text-xl font-bold">Full Dashboard</h3>
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
                Explore dashboard →
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
