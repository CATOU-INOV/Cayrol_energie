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
import OrbitGallery from "./OrbitGallery";
import ProjectShowcase from "./ProjectShowcase";
import { ThematicIconTile } from "./ThematicIcons";

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
  image?: string;
  tags?: string[];
}

export interface ThematicTabProps {
  color: string;
  /** Optionnel : certaines pages fusionnent déjà l'accroche dans leur propre hero au-dessus, pas
   * besoin de la répéter ici. */
  tagline?: string;
  explanations: { title: string; body: string }[];
  stats?: ThematicStat[];
  categories?: ThematicCategory[];
  /** "orbit" affiche une photo centrale (categoriesCenterImage) entourée des catégories en
   * satellites reliés par des anneaux elliptiques, plutôt que la grille "expanding cards". */
  categoriesLayout?: "grid" | "orbit";
  categoriesCenterImage?: string;
  categoriesCenterAlt?: string;
  timelineSteps?: TimelineStep[];
  timelineVariant?: TimelineVariant;
  projects?: ThematicProject[];
  /** "showcase" affiche de grandes cartes photo (ProjectShowcase) plutôt que les petites cartes
   * texte — nécessite que chaque projet fournisse une image. */
  projectsLayout?: "list" | "showcase" | "showcase-carousel";
  atouts?: { title: string; body: string }[];
  extras?: ReactNode;
}

export default function ThematicTab({
  color,
  tagline,
  explanations,
  stats,
  categories,
  categoriesLayout = "grid",
  categoriesCenterImage,
  categoriesCenterAlt,
  timelineSteps,
  timelineVariant = "dots",
  projects,
  projectsLayout = "list",
  atouts,
  extras,
}: ThematicTabProps) {
  return (
    <div className="flex flex-col gap-16">
      {/* Phrase d'accroche */}
      {tagline && <p className="max-w-3xl text-lg text-neutral-700 md:text-xl">{tagline}</p>}

      {/* Stats clés */}
      {stats && stats.length > 0 && (
        <div className="flex flex-wrap gap-4">
          {stats.map((s, i) => (
            <StatBadge key={i} value={s.value} label={s.label} color={color} />
          ))}
        </div>
      )}

      {/* Explications (Historique/Expérience ou Explications/Déroulement) */}
      <div className="grid gap-6 md:grid-cols-2">
        {explanations.map((e, i) => (
          <div
            key={i}
            className="group rounded-xl border border-slate-300 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
          >
            <ThematicIconTile icon="idea" color={color} />
            <h3 className="mb-2 text-lg font-bold" style={{ color }}>
              {e.title}
            </h3>
            <p className="text-sm leading-relaxed text-neutral-700">{e.body}</p>
          </div>
        ))}
      </div>

      {/* Catégories (Centrale haute/basse chute, ou Toiture/Ombrières/Au sol/Agrivoltaïsme) —
          même grille "expanding cards" que la sélection d'univers de l'accueil, pour un rendu
          cohérent partout où ThematicTab est réutilisé. */}
      {categories && categories.length > 0 && (
        <div>
          <h2 className="mb-4 text-xl font-bold" style={{ color }}>
            Nos types d'installations
          </h2>
          {categoriesLayout === "orbit" && categoriesCenterImage ? (
            <OrbitGallery
              color={color}
              centerImage={categoriesCenterImage}
              centerAlt={categoriesCenterAlt ?? ""}
              items={categories.map((c) => ({ image: c.image, alt: c.label, label: c.label }))}
            />
          ) : (
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
          )}
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
              <div
                key={i}
                className="group rounded-xl border border-slate-300 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
              >
                <ThematicIconTile icon="shield" color={color} />
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
          {projectsLayout !== "list" && projects.every((p) => p.image) ? (
            <ProjectShowcase
              color={color}
              projects={projects.map((p) => ({ ...p, image: p.image!, tags: p.tags ?? [p.power] }))}
              layout={projectsLayout === "showcase-carousel" ? "carousel" : "grid"}
            />
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {projects.map((p, i) => (
                <div
                  key={i}
                  className="group rounded-xl border border-slate-300 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
                >
                  <ThematicIconTile icon="building" color={color} />
                  <p className="font-semibold" style={{ color }}>
                    {p.name} <span className="font-normal text-neutral-500">— {p.commune}</span>
                  </p>
                  <p className="text-xs font-medium text-neutral-500">{p.power}</p>
                  <p className="mt-2 text-sm text-neutral-700">{p.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {extras}
    </div>
  );
}
