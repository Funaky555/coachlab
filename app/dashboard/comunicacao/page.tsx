import { PlaceholderModule } from "@/components/modules/placeholder-module"

export default function ComunicacaoPage() {
  return (
    <PlaceholderModule
      title="Internal Communication"
      description="Calendar, task distribution and coaching staff notes"
      color="#FF6B35"
      features={[
        { icon: "📅", text: "Events and meetings calendar" },
        { icon: "✅", text: "Task management by responsible" },
        { icon: "📝", text: "Shared coaching staff notes" },
        { icon: "🔔", text: "Notifications and reminders" },
        { icon: "👥", text: "Staff role distribution" },
        { icon: "📢", text: "Internal announcements" },
      ]}
    />
  )
}
