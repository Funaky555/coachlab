import { PlaceholderModule } from "@/components/modules/placeholder-module"

export default function MedicoPage() {
  return (
    <PlaceholderModule
      title="Departamento Médico"
      description="Controlo de lesões, recuperação e avaliações físicas dos atletas"
      color="#00D66C"
      features={[
        { icon: "🤕", text: "Registo de lesões por jogador" },
        { icon: "📅", text: "Cronograma de recuperação" },
        { icon: "💊", text: "Histórico de tratamentos" },
        { icon: "📊", text: "Avaliações físicas periódicas" },
        { icon: "⚕️", text: "Retorno à competição" },
        { icon: "🏃", text: "Progressão de recuperação" },
      ]}
    />
  )
}
