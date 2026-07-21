// Frise chronologique générique, réutilisée sur les onglets Photovoltaïque et Flexibilité/BESS
// (et potentiellement Biogaz/Hydro). Horizontale sur desktop, verticale sur mobile.
// Rendu statique — aucune interaction ne nécessite d'hydratation côté client.

export interface TimelineStep {
  label: string;
  date: string;
  description?: string;
}

export interface TimelineProps {
  steps: TimelineStep[];
  color?: string;
}

export default function Timeline({ steps, color = "#f97316" }: TimelineProps) {
  return (
    <ol className="relative flex flex-col gap-8 md:flex-row md:gap-0">
      {steps.map((step, i) => (
        <li key={i} className="relative flex flex-1 flex-col items-start md:items-center md:text-center">
          {/* Ligne de connexion */}
          {i < steps.length - 1 && (
            <span
              aria-hidden
              className="absolute left-[11px] top-6 h-[calc(100%+2rem)] w-0.5 md:left-1/2 md:top-[11px] md:h-0.5 md:w-full"
              style={{ backgroundColor: `${color}33` }}
            />
          )}
          <div className="relative z-10 flex items-center gap-3 md:flex-col md:gap-2">
            <span
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
              style={{ backgroundColor: color }}
            >
              {i + 1}
            </span>
            <span className="text-xs font-semibold uppercase tracking-wide" style={{ color }}>
              {step.date}
            </span>
          </div>
          <div className="ml-9 mt-1 md:ml-0 md:mt-2 md:px-3">
            <p className="text-sm font-semibold text-neutral-800">{step.label}</p>
            {step.description && (
              <p className="mt-1 text-xs text-neutral-500">{step.description}</p>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}
