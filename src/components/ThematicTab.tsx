// Composant générique pour les 4 onglets thématiques (Hydroélectricité, Photovoltaïque,
// Flexibilité/BESS, Biogaz). Un seul composant, paramétré par couleur + contenu, plutôt que
// 4 pages copiées-collées : c'est l'argument central face à un site construit sous CMS classique.
//
// Structure reprise du cadrage client (cf. PDF) : Explications / Déroulement-Catégories / Stats,
// puis un bloc "Schéma explicatif, frise chronologique, aperçus, atouts".

import type { ReactNode } from "react";
import StatBadge from "./StatBadge";
import Timeline, { type TimelineStep } from "./Timeline";
import TimelineVertical from "./TimelineVertical";
import TimelineProgress from "./TimelineProgress";
import TimelineCards from "./TimelineCards";
import ExpandingCardGrid from "./ExpandingCardGrid";

// 4 rendus différents pour une même forme de données (steps + color) — volontaire pour la démo,
// afin de montrer qu'on peut varier librement la présentation d'un onglet à l'autre sans rien
// changer à la structure de contenu ni au composant qui la consomme.
const TIMELINE_COMPONENTS = {
  dots: Timeline,
  vertical: TimelineVertical,
  progress: TimelineProgress,
  cards: TimelineCards,
} as const;

export type TimelineVariant = keyof typeof TIMELINE_COMPONENTS;

export interface ThematicCategory {
  label: string;
  image: string;
  description?: string;
}

export interface ThematicStat {
  value: string;
  label: string;
}

export interface ThematicProject {
  name: string;
  commune: string;
  power: string;
  description: string;
  /** Si fourni, la carte devient un lien vers la fiche projet détaillée (ex. démo Star Soleil). */
  href?: string;
}

export interface ThematicTabProps {
  color: string;
  tagline: string;
  explanations: { title: string; body: string }[];
  stats?: ThematicStat[];
  categories?: ThematicCategory[];
  timelineSteps?: TimelineStep[];
  timelineVariant?: TimelineVariant;
  projects?: ThematicProject[];
  atouts?: { title: string; body: string }[];
  extras?: ReactNode;
}

export default function ThematicTab({
  color,
  tagline,
  explanations,
  stats,
  categories,
  timelineSteps,
  timelineVariant = "dots",
  projects,
  atouts,
  extras,
}: ThematicTabProps) {
  // 2 ou 4 encarts se rangent naturellement en grille 2 colonnes (2×1 ou 2×2) sans espace vide.
  // 1 seul encart en grid-cols-2 laisserait une cellule vide à droite : pleine largeur à la place.
  const explanationsGrid = (
    <div className={explanations.length === 1 ? "grid gap-6" : "grid gap-6 sm:grid-cols-2"}>
      {explanations.map((e, i) => (
        <div key={i} className="rounded-2xl border p-6" style={{ borderColor: `${color}33` }}>
          <h3 className="mb-2 text-lg font-bold" style={{ color }}>
            {e.title}
          </h3>
          <p className="text-sm leading-relaxed text-neutral-700">{e.body}</p>
        </div>
      ))}
    </div>
  );

  const statsRow = stats && stats.length > 0 && (
    <div className="flex flex-wrap content-start gap-4">
      {stats.map((s, i) => (
        <StatBadge key={i} value={s.value} label={s.label} color={color} />
      ))}
    </div>
  );

  return (
    <div className="flex flex-col gap-16">
      {/* Phrase d'accroche : pleine largeur pour limiter les retours à la ligne inutiles */}
      <p className="text-lg text-neutral-700 md:text-xl">{tagline}</p>

      {/* Stats + explications côte à côte UNIQUEMENT quand il n'y a qu'un seul encart
          d'explication (ex. Photovoltaïque) : les stats, plus courtes, comblent alors l'espace
          qu'un encart isolé aurait laissé vide à droite. Dès qu'il y a 2+ encarts (Hydro, BESS),
          la grille d'explications est déjà pleine (2×1 ou 2×2) : forcer les stats dans une colonne
          étroite à côté créerait un vide sous elles à la place. Dans ce cas on repasse à
          l'empilement d'origine (stats en ligne, puis explications en dessous, pleine largeur). */}
      {statsRow && explanations.length === 1 ? (
        <div className="grid gap-8 md:grid-cols-3 md:items-start">
          <div className="md:col-span-1">{statsRow}</div>
          <div className="md:col-span-2">{explanationsGrid}</div>
        </div>
      ) : (
        <>
          {statsRow}
          {explanationsGrid}
        </>
      )}

      {/* Catégories (Centrale haute/basse chute, ou Toiture/Ombrières/Au sol/Agrivoltaïsme) —
          même grille "expanding cards" que la sélection d'univers de l'accueil, pour un rendu
          cohérent partout où ThematicTab est réutilisé. */}
      {categories && categories.length > 0 && (
        <div>
          <h2 className="mb-4 text-xl font-bold" style={{ color }}>
            Nos types d'installations
          </h2>
          <ExpandingCardGrid
            items={categories.map((c, i) => ({
              key: `${c.label}-${i}`,
              label: c.label,
              image: c.image,
              description: c.description,
              color,
            }))}
            perRow={2}
            height="h-[360px] md:h-[420px]"
          />
        </div>
      )}

      {/* Frise chronologique projet type — le rendu (variant) varie d'une page à l'autre, voir
          TIMELINE_COMPONENTS plus haut. */}
      {timelineSteps && timelineSteps.length > 0 && (() => {
        const TimelineComponent = TIMELINE_COMPONENTS[timelineVariant];
        return (
          <div>
            <h2 className="mb-6 text-xl font-bold" style={{ color }}>
              Déroulement d'un projet type
            </h2>
            <TimelineComponent steps={timelineSteps} color={color} />
          </div>
        );
      })()}

      {/* Atouts */}
      {atouts && atouts.length > 0 && (
        <div>
          <h2 className="mb-4 text-xl font-bold" style={{ color }}>
            Les atouts
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {atouts.map((a, i) => (
              <div key={i} className="rounded-xl p-4" style={{ backgroundColor: `${color}0d` }}>
                <p className="text-sm font-bold" style={{ color }}>
                  {a.title}
                </p>
                <p className="mt-1 text-sm text-neutral-700">{a.body}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Présentation des projets */}
      {projects && projects.length > 0 && (
        <div>
          <h2 className="mb-4 text-xl font-bold" style={{ color }}>
            Présentation de projets
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {projects.map((p, i) => {
              const Card = p.href ? "a" : "div";
              return (
                <Card
                  key={i}
                  {...(p.href ? { href: p.href } : {})}
                  className="rounded-xl border p-4 transition-colors hover:bg-black/[0.02]"
                  style={{ borderColor: `${color}33` }}
                >
                  <p className="font-semibold" style={{ color }}>
                    {p.name} <span className="font-normal text-neutral-500">— {p.commune}</span>
                  </p>
                  <p className="text-xs font-medium text-neutral-500">{p.power}</p>
                  <p className="mt-2 text-sm text-neutral-700">{p.description}</p>
                  {p.href && (
                    <p className="mt-2 text-xs font-semibold" style={{ color }}>
                      Voir la fiche projet →
                    </p>
                  )}
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {extras}
    </div>
  );
}
