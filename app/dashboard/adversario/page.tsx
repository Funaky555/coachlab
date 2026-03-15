import { PlaceholderModule } from "@/components/modules/placeholder-module"

export default function AdversarioPage() {
  return (
    <PlaceholderModule
      title="Opposition Preparation"
      description="Tactical analysis of the opponent, game patterns and pre-match report"
      color="#8B5CF6"
      features={[
        { icon: "🎯", text: "Detailed tactical analysis" },
        { icon: "⚽", text: "Offensive and defensive patterns" },
        { icon: "🅿️", text: "Set pieces (attack and defence)" },
        { icon: "⭐", text: "Key players to watch" },
        { icon: "📋", text: "Full pre-match report" },
        { icon: "📹", text: "Opponent video analysis" },
      ]}
    />
  )
}
