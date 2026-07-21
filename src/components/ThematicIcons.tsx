// Petit jeu d'icônes partagé pour les tuiles colorées de ThematicTab (Explications / Atouts /
// Projets) — même convention que AutoconsoFlowDiagram (viewBox 24, stroke=currentColor) pour
// rester cohérent avec le reste du site plutôt que d'importer une librairie d'icônes externe.

export type ThematicIconName = "idea" | "shield" | "building" | "chart" | "leaf" | "bolt";

export const THEMATIC_ICONS: Record<ThematicIconName, React.ReactNode> = {
  idea: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.2 1 2.05V17h6v-2.25c0-.85.4-1.55 1-2.05A7 7 0 0 0 12 2Z" />
    </svg>
  ),
  shield: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2 4 5v6c0 5 3.4 8.4 8 11 4.6-2.6 8-6 8-11V5l-8-3Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  ),
  building: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 21h18M6 21V7l6-4 6 4v14M10 21v-6h4v6" />
      <path d="M6 11h1M6 15h1M17 11h1M17 15h1" />
    </svg>
  ),
  chart: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
    </svg>
  ),
  leaf: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 3c0 9-6 14-11 14H5v-4C5 8 12 3 21 3Z" />
      <path d="M5 21c3-4 5-7 5-11" />
    </svg>
  ),
  bolt: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" />
    </svg>
  ),
};

export interface ThematicIconTileProps {
  icon: ThematicIconName;
  color: string;
}

// Tuile d'icône colorée façon carte "service" : fond teinté clair au repos, se remplit de la
// couleur pleine et l'icône passe au blanc au survol — pilotée par deux variables CSS (voir
// tile-hover.css) plutôt que du JS, en s'appuyant sur :hover du conteneur .thematic-tile.
export function ThematicIconTile({ icon, color }: ThematicIconTileProps) {
  return (
    <div
      className="thematic-tile mb-4 flex size-11 shrink-0 items-center justify-center rounded-xl transition-colors duration-300"
      style={
        {
          "--tile-bg": `${color}1a`,
          "--tile-bg-hover": color,
          "--tile-fg": color,
          "--tile-fg-hover": "#fff",
        } as React.CSSProperties
      }
    >
      <span className="size-5">{THEMATIC_ICONS[icon]}</span>
    </div>
  );
}
