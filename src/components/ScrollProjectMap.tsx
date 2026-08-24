// Section "scrollytelling" façon featured.undp.org/digital-goals : carte de France en SVG figée
// à gauche (sticky), projets qui défilent en texte à droite. Le point du projet actuellement
// affiché à droite s'allume en couleur pleine sur la carte, les autres restent en gris translucide
// — un seul actif à la fois. Contour et points partagent la même projection Web Mercator
// (mercatorProject ci-dessous), donc restent alignés géographiquement quelle que soit l'échelle.
//
// Couleurs par filière : dérivées de src/data/themes.ts (passées en props par le composant
// appelant), pas de palette dupliquée ici — la carte reste alignée sur l'identité de marque
// utilisée partout ailleurs (logos, ServiceRail, pages filières) plutôt que d'introduire une
// deuxième palette "carte" qui divergerait avec le temps.

import { useEffect, useMemo, useRef, useState } from "react";
import { FRANCE_OUTLINE } from "../data/franceOutline";

export interface ScrollProjectMapItem {
  id: string;
  name: string;
  commune: string;
  lat: number;
  lng: number;
  type: string;
  power: string;
  description: string;
  color: string;
  energyKey: string;
  energyLabel: string;
  /** Lien vers la fiche projet détaillée — optionnel : les données actuelles n'ont pas encore de
   * fiche par projet, sera renseigné une fois ces pages disponibles. Sans href, le titre reste du
   * texte simple (pas de lien mort). */
  href?: string;
}

export interface ScrollProjectMapProps {
  items: ScrollProjectMapItem[];
}

// Web Mercator (même formule que les tuiles Leaflet/Google Maps) : x proportionnel à la
// longitude, y proportionnel au logarithme de tan(latitude) — pas une simple interpolation
// linéaire lat/lng, pour rester géométriquement correct même sur l'étendue Nord-Sud de la France.
function mercatorProject(lat: number, lng: number): { x: number; y: number } {
  const x = lng;
  const y = (180 / Math.PI) * Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 180 / 2));
  return { x, y };
}

// Bornes de projection (contour complet) fixées une fois pour établir le repère commun à la
// carte et aux points — recalculer per-render déformerait l'échelle si la liste de points change.
const PROJECTED_OUTLINE = FRANCE_OUTLINE.map(([lat, lng]) => mercatorProject(lat, lng));
const BOUNDS = PROJECTED_OUTLINE.reduce(
  (b, p) => ({
    minX: Math.min(b.minX, p.x),
    maxX: Math.max(b.maxX, p.x),
    minY: Math.min(b.minY, p.y),
    maxY: Math.max(b.maxY, p.y),
  }),
  { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity }
);
// Marge autour du contour pour que les points côtiers/frontaliers ne collent pas au bord du SVG.
const PAD = 0.06;
const SPAN_X = BOUNDS.maxX - BOUNDS.minX;
const SPAN_Y = BOUNDS.maxY - BOUNDS.minY;

// Convertit une coordonnée projetée en position [0, 100] dans le viewBox SVG (y inversé : le
// Nord/latitude croissante doit monter vers le haut de l'écran, alors que Mercator y croît vers
// le nord aussi — mais le repère SVG a l'axe y qui pointe vers le bas, d'où l'inversion ici).
function toViewBox({ x, y }: { x: number; y: number }) {
  const px = ((x - BOUNDS.minX) / SPAN_X) * (100 - 2 * PAD * 100) + PAD * 100;
  const py = (1 - (y - BOUNDS.minY) / SPAN_Y) * (100 - 2 * PAD * 100) + PAD * 100;
  return { x: px, y: py };
}

const OUTLINE_POINTS = PROJECTED_OUTLINE.map(toViewBox);
const OUTLINE_PATH = `M ${OUTLINE_POINTS.map((p) => `${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(" L ")} Z`;

// Contenu de la carte (en-tête, tracé SVG, légende, nom de commune) — partagé entre la version
// desktop (position:fixed, voir plus bas) et mobile (flux normal, pas de fixed) pour ne pas
// dupliquer ce bloc deux fois dans le JSX.
function MapCardContent({
  active,
  visibleItems,
  energyFilters,
  energyFilter,
  setEnergyFilter,
}: {
  active: ScrollProjectMapItem | undefined;
  visibleItems: ScrollProjectMapItem[];
  energyFilters: { key: string; label: string; color: string }[];
  energyFilter: string | null;
  setEnergyFilter: (updater: (current: string | null) => string | null) => void;
}) {
  return (
    <>
      {/* En-tête épuré : titre + compteur dynamique, cohérent avec le nombre d'items réellement
          affichés (filtre appliqué ou non). */}
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-bold text-white">Nos réalisations</h3>
        <span className="rounded-full bg-white/15 px-2.5 py-1 text-xs font-semibold text-white">
          {visibleItems.length} projet{visibleItems.length > 1 ? "s" : ""}
        </span>
      </div>

      {/* Tracé de la France : blanc semi-transparent sur le fond de couleur pleine, avec un
          contour plus opaque — plus de dégradé beige/gris (perdrait tout contraste ici). */}
      <div className="relative aspect-[4/5] w-full overflow-visible">
        <svg viewBox="0 0 100 100" className="h-full w-full overflow-visible" aria-hidden="true">
          <path d={OUTLINE_PATH} fill="rgb(255 255 255 / 0.12)" stroke="rgb(255 255 255 / 0.45)" strokeWidth="0.5" />
          {visibleItems.map((item) => {
            const isActive = item.id === active?.id;
            const { x, y } = toViewBox(mercatorProject(item.lat, item.lng));
            return (
              <g key={item.id}>
                {isActive && (
                  <>
                    {/* Effet radar : deux ondes déphasées pour un ping continu plutôt qu'un
                        unique pulse qui laisse un "trou" visuel entre deux cycles. */}
                    <circle cx={x} cy={y} r="2.4" fill="white" opacity="0.5">
                      <animate attributeName="r" values="2.4;7" dur="1.8s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.5;0" dur="1.8s" repeatCount="indefinite" />
                    </circle>
                    <circle cx={x} cy={y} r="2.4" fill="white" opacity="0.5">
                      <animate attributeName="r" values="2.4;7" dur="1.8s" begin="0.9s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.5;0" dur="1.8s" begin="0.9s" repeatCount="indefinite" />
                    </circle>
                    {/* Halo fixe sous le point plein, pour un effet lumineux même entre deux ondes radar. */}
                    <circle cx={x} cy={y} r="4.5" fill="white" opacity="0.25" />
                  </>
                )}
                <circle
                  cx={x}
                  cy={y}
                  r={isActive ? 2.2 : 1.3}
                  fill="white"
                  opacity={isActive ? 1 : 0.55}
                  stroke={active?.color}
                  strokeWidth={isActive ? 0.8 : 0}
                  className="transition-all duration-300"
                />
                {/* Tooltip flottant : uniquement sur le point actif, positionné juste au-dessus via
                    une <foreignObject> (texte HTML normal, plus simple à styler/tronquer qu'un
                    <text> SVG pur). y décalé au-delà du halo (r=4.5) et de la vague radar maximale
                    (r=7) pour ne jamais chevaucher le point actif. */}
                {isActive && (
                  <foreignObject x={x - 26} y={y - 22} width="52" height="12" style={{ overflow: "visible" }}>
                    <div
                      className="mx-auto w-fit max-w-[9rem] rounded-md bg-white px-1.5 py-0.5 text-center shadow-md"
                      style={{ fontSize: "2.6px", lineHeight: 1.3 }}
                    >
                      <span className="font-bold text-slate-900">{item.name}</span>
                      <span className="text-slate-500"> — {item.power}</span>
                    </div>
                  </foreignObject>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Légende horizontale épurée : une puce par filière représentée, cliquable pour filtrer
          (voir energyFilter) — remplace les anciens boutons circulaires isolés à droite de la page
          par une barre de filtres directement rattachée à la carte. */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 border-t border-white/15 pt-4">
        {energyFilters.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setEnergyFilter((current) => (current === f.key ? null : f.key))}
            className="flex items-center gap-1.5 text-xs font-medium text-white transition-opacity"
            style={{ opacity: energyFilter && energyFilter !== f.key ? 0.5 : 1 }}
            aria-pressed={energyFilter === f.key}
          >
            <span className="h-2 w-2 shrink-0 rounded-full bg-white" />
            {f.label}
          </button>
        ))}
      </div>

      {active && <p className="mt-4 text-center text-sm font-semibold text-white">{active.commune}</p>}
    </>
  );
}

function StepText({
  item,
  index,
  active,
  onActivate,
}: {
  item: ScrollProjectMapItem;
  index: number;
  active: boolean;
  onActivate: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => entry.isIntersecting && onActivate(), {
      rootMargin: "-45% 0px -45% 0px",
      threshold: 0,
    });
    observer.observe(el);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={ref}
      className="border-l-2 py-10 pl-6 transition-colors duration-300 md:py-16"
      style={{ borderColor: active ? item.color : "#e2e8f0" }}
    >
      <span
        className="mb-3 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold"
        style={{ backgroundColor: `${item.color}1a`, color: item.color }}
      >
        {item.energyLabel} · Projet {index + 1} — {item.commune}
      </span>
      <h3 className="text-xl font-extrabold text-neutral-900 md:text-2xl">
        {item.href ? (
          <a href={item.href} className="transition-colors hover:text-[var(--hover-color)]" style={{ "--hover-color": item.color } as React.CSSProperties}>
            {item.name}
          </a>
        ) : (
          item.name
        )}
      </h3>
      <p className="mt-1 text-sm font-medium text-neutral-500">
        {item.type} — {item.power}
      </p>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-neutral-600">{item.description}</p>
    </div>
  );
}

export default function ScrollProjectMap({ items }: ScrollProjectMapProps) {
  const [activeId, setActiveId] = useState(items[0]?.id);
  const [energyFilter, setEnergyFilter] = useState<string | null>(null);
  const active = items.find((p) => p.id === activeId) ?? items[0];

  // Légende/filtres dérivés des items eux-mêmes (couleur + libellé), pas d'une liste séparée à
  // maintenir en double — une filière qui disparaîtrait des projets disparaît aussi de la légende.
  const energyFilters = useMemo(() => {
    const seen = new Map<string, { key: string; label: string; color: string }>();
    items.forEach((item) => {
      if (!seen.has(item.energyKey)) {
        seen.set(item.energyKey, { key: item.energyKey, label: item.energyLabel, color: item.color });
      }
    });
    return Array.from(seen.values());
  }, [items]);

  const visibleItems = energyFilter ? items.filter((item) => item.energyKey === energyFilter) : items;

  return (
    <div className="relative grid grid-cols-1 gap-10 md:grid-cols-2 md:gap-16">
      {/* Fond couleur pleine, étiré jusqu'au bord gauche de l'écran (pas juste autour de la carte) :
          bloc séparé, purement décoratif (aria-hidden), en absolute par rapport au conteneur
          racine (celui-ci passe donc en position:relative). left: calc(-50vw + 50%) ramène le bord
          gauche de ce bloc au bord gauche du viewport quelle que soit la largeur du conteneur
          mx-auto max-w-6xl parent de la page. Important : ce fond ne fait QUE de la couleur — le
          positionnement réel de la carte (juste en dessous) reste 100% dans le flux normal de la
          grid, donc jamais désynchronisé du texte à droite comme lors des tentatives précédentes
          (calc(-50vw) appliqué aussi à la carte elle-même, ce qui cassait le layout). */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 hidden transition-colors duration-500 md:block"
        style={{ left: "calc(-50vw + 50%)", width: "50vw", backgroundColor: active?.color ?? "#0f172a" }}
      />

      {/* Carte sticky : reste épinglée à l'écran pendant tout le défilement des projets à droite.
          Reste un enfant normal de la grid (largeur = colonne de gauche, pas 50vw) : c'est ce qui
          la garde alignée avec la colonne de texte à droite. Sur mobile (fond ci-dessus caché),
          garde son propre fond coloré contenu classique. */}
      <div
        className="relative rounded-3xl transition-colors duration-500 md:sticky md:top-24 md:h-fit md:rounded-none md:bg-transparent"
        style={{ backgroundColor: active?.color ?? "#0f172a" }}
      >
        {/* Décalage vers la gauche sur desktop : la colonne de grid est centrée dans la moitié
            gauche du conteneur max-w-6xl (pas dans les 50vw réels du fond ci-dessus), donc son
            centre naturel tombe à droite du centre visuel de la zone colorée. Formule exacte
            (pas un offset fixe approximatif) : à écran < 1152px (max-w-6xl encore égal à 100vw),
            l'écart vaut 16px (24px de padding — 8px de demi-gap) ; au-delà, le conteneur se fige à
            1152px alors que le fond continue de suivre le viewport, donc l'écart croît avec la
            largeur d'écran — min() choisit automatiquement la bonne branche à toute taille. */}
        <div className="scroll-map-card-offset mx-auto w-full max-w-md px-6 py-10 md:mx-0 md:px-8">
          <MapCardContent
            active={active}
            visibleItems={visibleItems}
            energyFilters={energyFilters}
            energyFilter={energyFilter}
            setEnergyFilter={setEnergyFilter}
          />
        </div>
      </div>

      {/* Texte : défile normalement, chaque projet active son point sur la carte en entrant au
          centre du viewport (IntersectionObserver par bloc, voir StepText). Le filtre de légende
          n'agit que sur la carte (quels points sont dessinés) — la liste de droite reste complète,
          pour ne pas faire disparaître du contenu texte au clic sur une puce. */}
      <div className="relative">
        {items.map((item, i) => (
          <StepText key={item.id} item={item} index={i} active={item.id === activeId} onActivate={() => setActiveId(item.id)} />
        ))}
      </div>
    </div>
  );
}
