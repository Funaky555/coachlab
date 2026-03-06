import { PlaceholderModule } from "@/components/modules/placeholder-module"

export default function AdversarioPage() {
  return (
    <PlaceholderModule
      title="Preparação do Adversário"
      description="Análise tática do adversário, padrões de jogo e relatório pré-jogo"
      color="#8B5CF6"
      features={[
        { icon: "🎯", text: "Análise tática detalhada" },
        { icon: "⚽", text: "Padrões ofensivos e defensivos" },
        { icon: "🅿️", text: "Bolas paradas (ataque e defesa)" },
        { icon: "⭐", text: "Jogadores-chave a vigiar" },
        { icon: "📋", text: "Relatório pré-jogo completo" },
        { icon: "📹", text: "Análise de vídeo do adversário" },
      ]}
    />
  )
}
