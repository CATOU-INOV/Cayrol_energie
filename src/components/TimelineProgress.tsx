// Frise chronologique — variante "barre de progression segmentée". Même forme de données que
// Timeline.tsx (steps + color), rendu radicalement différent : utilisée sur la page Biogaz.

import type { TimelineStep } from "./Timeline";

export interface TimelineProgressProps {
  steps: TimelineStep[];
  color?: string;
}

export default function TimelineProgress({ steps, color = "#f97316" }: TimelineProgressProps) {
  return (
    <div>
      <div className="flex gap-1.5">
        {steps.map((_, i) => (
          <div key={i} className="h-2 flex-1 rounded-full" style={{ backgroundColor: `${color}${i === 0 ? "" : "cc"}` }} />
        ))}
      </div>
      <div className="mt-6 grid grid-cols-2 gap-x-6 gap-y-6 md:flex md:gap-4">
        {steps.map((step, i) => (
          <div key={i} className="md:flex-1">
            <span className="text-xs font-bold uppercase tracking-wide" style={{ color }}>
              {step.date}
            </span>
            <p className="mt-1 text-sm font-semibold text-neutral-800">{step.label}</p>
            {step.description && <p className="mt-1 text-xs text-neutral-500">{step.description}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
