// Schéma "flux de l'autoconsommation collective" — reproduit en composant natif (pas une image
// statique) pour rester net à toute résolution et suivre la couleur du thème de la page, plutôt
// qu'une image fixe : démontre le sur-mesure plutôt que d'incruster un visuel figé.
// Structure reprise d'un schéma de référence fourni par le client (5 étapes : production locale,
// distribution, partage/consommation, gestion du réseau, bénéfices).

export interface FlowStep {
  number: number;
  title: string;
  description: string;
  icon: "sun" | "network" | "buildings" | "chart" | "coins";
}

const ICONS: Record<FlowStep["icon"], React.ReactNode> = {
  sun: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  ),
  network: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="2.5" />
      <circle cx="4" cy="6" r="2" />
      <circle cx="20" cy="6" r="2" />
      <circle cx="4" cy="18" r="2" />
      <circle cx="20" cy="18" r="2" />
      <path d="M6 7l4.5 3.5M18 7l-4.5 3.5M6 17l4.5-3.5M18 17l-4.5-3.5" />
    </svg>
  ),
  buildings: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 21h18M6 21V8l5-3 5 3v13M11 21V12h4v9" />
      <path d="M6 12h1M6 15h1M6 18h1" />
    </svg>
  ),
  chart: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
    </svg>
  ),
  coins: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <ellipse cx="12" cy="6" rx="7" ry="3" />
      <path d="M5 6v6c0 1.66 3.13 3 7 3s7-1.34 7-3V6M5 12v6c0 1.66 3.13 3 7 3s7-1.34 7-3v-6" />
    </svg>
  ),
};

const DEFAULT_STEPS: FlowStep[] = [
  {
    number: 1,
    title: "Production locale",
    description: "Une centrale photovoltaïque (ex. Cayrol Energie) génère de l'électricité propre.",
    icon: "sun",
  },
  {
    number: 2,
    title: "Distribution",
    description: "Réseau public et gestion PMO : l'électricité produite transite vers les participants.",
    icon: "network",
  },
  {
    number: 3,
    title: "Partage et consommation",
    description: "Habitants, commerces et bâtiments publics se partagent la production en temps réel.",
    icon: "buildings",
  },
  {
    number: 4,
    title: "Gestion du réseau",
    description: "Compteurs intelligents et suivi de la consommation de chaque utilisateur final.",
    icon: "chart",
  },
  {
    number: 5,
    title: "Bénéfices",
    description: "Clé de répartition calculée : facture d'électricité réduite pour chaque participant.",
    icon: "coins",
  },
];

export interface AutoconsoFlowDiagramProps {
  color?: string;
  colorDark?: string;
  steps?: FlowStep[];
}

export default function AutoconsoFlowDiagram({
  color = "#0ea5e9",
  colorDark = "#1e3a8a",
  steps = DEFAULT_STEPS,
}: AutoconsoFlowDiagramProps) {
  return (
    <div className="rounded-2xl border p-6 md:p-10" style={{ borderColor: `${color}33`, backgroundColor: `${color}08` }}>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5 lg:gap-4">
        {steps.map((step, i) => (
          <div key={step.number} className="relative flex flex-col items-start gap-3">
            <div className="flex items-center gap-3">
              <div
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-white"
                style={{ backgroundColor: color }}
              >
                <span className="h-6 w-6">{ICONS[step.icon]}</span>
              </div>
              <div
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                style={{ backgroundColor: colorDark }}
              >
                {step.number}
              </div>
            </div>
            <div>
              <p className="text-sm font-bold uppercase tracking-wide" style={{ color: colorDark }}>
                {step.title}
              </p>
              <p className="mt-1 text-sm leading-relaxed text-neutral-700">{step.description}</p>
            </div>
            {i < steps.length - 1 && (
              <span
                aria-hidden
                className="absolute top-6 -right-3 hidden text-lg font-bold lg:block"
                style={{ color: `${color}66` }}
              >
                →
              </span>
            )}
          </div>
        ))}
      </div>
      <p className="mt-8 text-center text-xs text-neutral-400">
        Conception sur-mesure, adaptée au thème de chaque page — aucune image statique.
      </p>
    </div>
  );
}
