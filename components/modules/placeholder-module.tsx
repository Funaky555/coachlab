import { type LucideIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface Feature {
  icon: string
  text: string
}

interface PlaceholderModuleProps {
  title: string
  description: string
  color: string
  features: Feature[]
  comingSoon?: boolean
}

export function PlaceholderModule({ title, description, color, features, comingSoon = true }: PlaceholderModuleProps) {
  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: "var(--font-barlow-condensed)" }}>
            {title}
          </h1>
          <p className="text-muted-foreground">{description}</p>
        </div>
        {comingSoon && (
          <Badge variant="warning" className="shrink-0">In development</Badge>
        )}
      </div>

      <div
        className="rounded-2xl p-12 text-center relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${color}08 0%, transparent 100%)`,
          border: `1px solid ${color}20`,
        }}
      >
        <div
          className="absolute top-0 left-0 right-0 h-0.5"
          style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }}
        />

        <div
          className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl mx-auto mb-6"
          style={{ background: `${color}15`, border: `1px solid ${color}30` }}
        >
          🚧
        </div>

        <h2 className="text-2xl font-bold mb-3" style={{ fontFamily: "var(--font-barlow-condensed)" }}>
          In development
        </h2>
        <p className="text-muted-foreground mb-8 max-w-md mx-auto">
          This module is being developed and will be available soon.
          We are working to bring the best tools to your team.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl mx-auto text-left">
          {features.map((f, i) => (
            <div
              key={i}
              className="flex items-center gap-3 rounded-xl p-3 text-sm"
              style={{ background: `${color}08`, border: `1px solid ${color}15` }}
            >
              <span className="text-lg">{f.icon}</span>
              <span className="text-muted-foreground">{f.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
