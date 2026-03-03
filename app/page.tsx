import { CoachLabApp } from "@/components/coach-lab/coach-lab-app";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header mínimo — h-14 (3.5rem) para coincidir com o offset interno do CoachLabApp */}
      <header className="fixed top-0 left-0 right-0 h-14 bg-card border-b border-border flex items-center justify-between px-4 sm:px-6 z-40">
        <div className="flex items-center gap-2.5">
          {/* Football SVG logo */}
          <svg
            width="32"
            height="32"
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="shrink-0 drop-shadow-md"
            aria-hidden="true"
          >
            {/* Shadow */}
            <ellipse cx="16.5" cy="29" rx="8" ry="2" fill="rgba(0,0,0,0.35)" />
            {/* Base sphere with radial gradient */}
            <defs>
              <radialGradient id="ballGrad" cx="38%" cy="32%" r="60%" fx="38%" fy="32%">
                <stop offset="0%"   stopColor="#ffffff" />
                <stop offset="55%"  stopColor="#e0e0e0" />
                <stop offset="100%" stopColor="#909090" />
              </radialGradient>
              <radialGradient id="gloss" cx="38%" cy="30%" r="48%">
                <stop offset="0%"  stopColor="rgba(255,255,255,0.80)" />
                <stop offset="60%" stopColor="rgba(255,255,255,0.10)" />
                <stop offset="100%" stopColor="rgba(255,255,255,0)" />
              </radialGradient>
              <clipPath id="ballClip">
                <circle cx="16" cy="16" r="13.5" />
              </clipPath>
            </defs>
            {/* Base ball */}
            <circle cx="16" cy="16" r="13.5" fill="url(#ballGrad)" />
            {/* Pentagon patches */}
            <g clipPath="url(#ballClip)" fill="#1a1a1a">
              {/* top-center */}
              <polygon points="16,7.2 17.8,8.8 17.1,11.0 14.9,11.0 14.2,8.8" />
              {/* upper-left */}
              <polygon points="9.2,10.5 11.0,9.8 12.4,11.2 11.6,13.2 9.5,13.0" />
              {/* upper-right */}
              <polygon points="22.8,10.5 21.0,9.8 19.6,11.2 20.4,13.2 22.5,13.0" />
              {/* lower-left */}
              <polygon points="8.5,19.2 10.5,18.5 12.0,20.0 11.0,22.0 8.8,21.8" />
              {/* lower-right */}
              <polygon points="23.5,19.2 21.5,18.5 20.0,20.0 21.0,22.0 23.2,21.8" />
              {/* bottom */}
              <polygon points="16,24.5 17.8,22.8 17.0,20.8 15.0,20.8 14.2,22.8" />
            </g>
            {/* Border */}
            <circle cx="16" cy="16" r="13.5" stroke="#333" strokeWidth="0.8" fill="none" />
            {/* Gloss */}
            <circle cx="16" cy="16" r="13.5" fill="url(#gloss)" />
          </svg>
          <span className="font-bold text-sm text-foreground">Coach Lab</span>
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
