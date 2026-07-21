// Frise chronologique — variante "cartes reliées par des flèches". Même forme de données que
// Timeline.tsx (steps + color), rendu radicalement différent : utilisée sur la page
// Hydroélectricité.

import type { TimelineStep } from "./Timeline";

export interface TimelineCardsProps {
  steps: TimelineStep[];
  color?: string;
}

export default function TimelineCards({ steps, color = "#f97316" }: TimelineCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:flex md:gap-4">
      {steps.map((step, i) => (
        <div key={i} className="relative md:flex-1">
          <div className="h-full rounded-2xl border p-5" style={{ borderColor: `${color}33` }}>
            <div
              className="mb-3 flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white"
              style={{ backgroundColor: color }}
            >
              {i + 1}
            </div>
            <span className="text-xs font-bold uppercase tracking-wide" style={{ color }}>
              {step.date}
            </span>
            <p className="mt-1 text-sm font-semibold text-neutral-800">{step.label}</p>
            {step.description && <p className="mt-1 text-xs text-neutral-500">{step.description}</p>}
          </div>
          {i < steps.length - 1 && (
            <span
              aria-hidden
              className="absolute top-1/2 -right-5 z-10 hidden -translate-y-1/2 text-xl font-bold md:block"
              style={{ color: `${color}66` }}
            >
              →
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
