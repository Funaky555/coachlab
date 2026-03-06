import { PlaceholderModule } from "@/components/modules/placeholder-module"

export default function FisicoPage() {
  return (
    <PlaceholderModule
      title="Monitorização Física"
      description="Métricas GPS, carga de treino e dados de performance física dos atletas"
      color="#0066FF"
      features={[
        { icon: "📍", text: "Distância percorrida por sessão" },
        { icon: "⚡", text: "Sprints e acelerações" },
        { icon: "❤️", text: "Frequência cardíaca média" },
        { icon: "📉", text: "Carga interna (RPE)" },
        { icon: "📈", text: "Gráficos de evolução semanal" },
        { icon: "🛰️", text: "Integração com GPS (Catapult, STATSports)" },
      ]}
    />
  )
}
