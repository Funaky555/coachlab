import { PlaceholderModule } from "@/components/modules/placeholder-module"

export default function ComunicacaoPage() {
  return (
    <PlaceholderModule
      title="Comunicação Interna"
      description="Calendário, distribuição de tarefas e notas da equipa técnica"
      color="#FF6B35"
      features={[
        { icon: "📅", text: "Calendário de eventos e reuniões" },
        { icon: "✅", text: "Gestão de tarefas por responsável" },
        { icon: "📝", text: "Notas partilhadas da equipa técnica" },
        { icon: "🔔", text: "Notificações e lembretes" },
        { icon: "👥", text: "Distribuição de funções no staff" },
        { icon: "📢", text: "Comunicados internos" },
      ]}
    />
  )
}
