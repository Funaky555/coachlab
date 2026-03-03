import { CoachLabApp } from "@/components/coach-lab/coach-lab-app";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header mínimo — h-14 (3.5rem) para coincidir com o offset interno do CoachLabApp */}
      <header className="fixed top-0 left-0 right-0 h-14 bg-card border-b border-border flex items-center justify-between px-4 sm:px-6 z-40">
        <div className="flex items-center gap-2.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" width={44} height={44} alt="Coach Lab" className="shrink-0 rounded-full" />
        </div>
        <a
          href="https://danieldesousa.pt"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          by Daniel de Sousa
        </a>
      </header>

      {/* Tactical board — CoachLabApp posiciona-se com fixed top-[3.5rem] internamente */}
      <CoachLabApp />
    </div>
  );
}
