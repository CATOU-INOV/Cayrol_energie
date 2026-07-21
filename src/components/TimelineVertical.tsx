// Frise chronologique — variante "ligne verticale à jalons". Même forme de données que
// Timeline.tsx (steps + color), rendu radicalement différent : utilisée sur la page Flexibilité/
// BESS pour montrer, dans une démo, qu'un même contenu peut être présenté de plusieurs façons
// sans rien changer au composant qui consomme les données (ThematicTab).

import type { TimelineStep } from "./Timeline";

export interface TimelineVerticalProps {
  steps: TimelineStep[];
  color?: string;
}

export default function TimelineVertical({ steps, color = "#f97316" }: TimelineVerticalProps) {
  return (
    <ol className="relative border-l-2 pl-8" style={{ borderColor: `${color}33` }}>
      {steps.map((step, i) => (
        <li key={i} className="relative pb-10 last:pb-0">
          <span
            className="absolute -left-[41px] top-0 flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white ring-4 ring-white"
            style={{ backgroundColor: color }}
          >
            {i + 1}
          </span>
          <span className="text-xs font-bold uppercase tracking-wide" style={{ color }}>
            {step.date}
          </span>
          <p className="mt-1 text-sm font-semibold text-neutral-800">{step.label}</p>
          {step.description && <p className="mt-1 text-sm text-neutral-500">{step.description}</p>}
        </li>
      ))}
    </ol>
  );
}
