// Section "scrollytelling" façon featured.undp.org/digital-goals : carte de France en SVG figée
// à gauche (sticky), projets qui défilent en texte à droite. Le point du projet actuellement
// affiché à droite s'allume et s'agrandit sur la carte, les autres restent de la couleur de leur
// filière, plus petits — un seul actif à la fois. Contour et points partagent la même projection Web Mercator
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
  /** Marque les projets phares affichés dans la liste texte scrollytelling (retour client :
   * 5 projets maximum) — tous les projets restent affichés comme points sur la carte quel que
   * soit ce champ, seule la liste de droite est filtrée. */
  featured?: boolean;
  /** Photo de fond de la carte projet dans la liste de droite. */
  photo?: string;
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
  // Arrondi au millième : sans lui, le dernier chiffre du calcul flottant peut différer entre le
  // rendu serveur et le navigateur (avertissement d'hydratation React sur les points de la carte).
  return { x: Math.round(px * 1000) / 1000, y: Math.round(py * 1000) / 1000 };
}

const OUTLINE_POINTS = PROJECTED_OUTLINE.map(toViewBox);
const OUTLINE_PATH = `M ${OUTLINE_POINTS.map((p) => `${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(" L ")} Z`;

// Contenu de la carte (en-tête, tracé SVG, légende, nom de commune) — partagé entre la version
// desktop (position:fixed, voir plus bas) et mobile (flux normal, pas de fixed) pour ne pas
// dupliquer ce bloc deux fois dans le JSX.
function MapCardContent({
  active,
  visibleItems,
  totalCount,
  energyFilters,
  energyFilter,
  setEnergyFilter,
}: {
  active: ScrollProjectMapItem | undefined;
  visibleItems: ScrollProjectMapItem[];
  totalCount: number;
  energyFilters: { key: string; label: string; color: string }[];
  energyFilter: string | null;
  setEnergyFilter: (key: string | null) => void;
}) {
  return (
    <>
      {/* En-tête agrandi (retour client) : "En réalisation" à gauche, "Nombre de projets" à
          droite — le compteur reste sur le total réel (totalCount), pas sur visibleItems, pour ne
          pas donner l'impression que des projets disparaissent quand on filtre par filière. */}
      <div className="mb-5 flex items-center justify-between gap-3">
        <h3 className="text-lg font-extrabold text-white md:text-xl">En réalisation</h3>
        {/* Chiffre à gauche du libellé, sur la même ligne (retour client) plutôt qu'empilé au-dessus. */}
        <div className="flex items-center gap-2">
          <p className="text-2xl font-extrabold text-white md:text-3xl">{totalCount}</p>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-white/70">Nombre de projets</p>
        </div>
      </div>

      {/* TODO retour client : logo Cayrol en filigrane derrière la carte demandé, mais premier
          essai (image centrée pleine carte, opacité 0.08) jugé mal placé/pas propre — retiré en
          attendant de clarifier avec le client le placement et le traitement graphique attendus. */}

      {/* Tracé de la France : blanc semi-transparent sur le fond de couleur pleine, avec un
          contour plus opaque — plus de dégradé beige/gris (perdrait tout contraste ici). Carte
          agrandie (retour client) : aspect-[4/5] → aspect-square, plus de hauteur disponible pour
          le tracé et les points. */}
      <div className="relative aspect-square w-full overflow-visible">
        <svg viewBox="0 0 100 100" className="h-full w-full overflow-visible" aria-hidden="true">
          <path d={OUTLINE_PATH} fill="rgb(255 255 255 / 0.12)" stroke="rgb(255 255 255 / 0.45)" strokeWidth="0.5" />
          {/* Point actif (halo, radar, fiche) dessiné en dernier : en SVG l'ordre du document fait
              le z-index, sinon les points suivants recouvraient la fiche (retour client). */}
          {[...visibleItems.filter((item) => item.id !== active?.id), ...visibleItems.filter((item) => item.id === active?.id)].map((item) => {
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
                {/* Point de la couleur de sa filière, cerclé de blanc pour rester visible sur le
                    fond de la carte (lui-même teinté de la filière active) — fait le lien avec les
                    couleurs du filtre sous la carte. */}
                <circle
                  cx={x}
                  cy={y}
                  r={isActive ? 2.2 : 1.4}
                  fill={item.color}
                  opacity={isActive ? 1 : 0.85}
                  stroke="white"
                  strokeWidth={isActive ? 0.8 : 0.45}
                  className="transition-all duration-300"
                />
                {/* Tooltip flottant amélioré (retour client) : plus grand, mieux contrasté
                    (liseré de la couleur de la filière, nom + type + puissance sur 2 lignes) —
                    uniquement sur le point actif, positionné juste au-dessus via une
                    <foreignObject> (texte HTML normal, plus simple à styler/tronquer qu'un <text>
                    SVG pur). y décalé au-delà du halo (r=4.5) et de la vague radar maximale (r=7)
                    pour ne jamais chevaucher le point actif. */}
                {/* Bas de la bulle ancré à y - 8 (au-delà de la vague radar max, r=7) : la bulle
                    grandit vers le haut (flex justify-end) au lieu de déborder vers le bas sur le
                    point et son onde (retour client : "barre" qui pulsait sous la bulle). Marges,
                    bordure et arrondi en unités du viewBox (le contenu du foreignObject est mis à
                    l'échelle avec le SVG, ×5 environ) : en classes Tailwind px, elles devenaient
                    énormes. */}
                {isActive && (
                  <foreignObject x={x - 34} y={y - 38} width="68" height="30" style={{ overflow: "visible" }}>
                    <div className="flex h-full flex-col items-center justify-end">
                    <div
                      className="w-fit bg-white text-center shadow-lg"
                      style={{
                        fontSize: "3.4px",
                        lineHeight: 1.35,
                        padding: "1.2px 2.4px",
                        border: `0.5px solid ${item.color}`,
                        borderRadius: "1.5px",
                        maxWidth: "60px",
                      }}
                    >
                      <p className="font-bold text-slate-900">{item.name}</p>
                      <p className="text-slate-500">{item.type} — {item.power}</p>
                    </div>
                    </div>
                  </foreignObject>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Filtre par filière (retour client : l'ancienne "légende" aux puces blanches ne disait
          rien). Assumé comme filtre : libellé explicite, bouton "Tous", pastille toujours de la
          couleur de la filière (même couleur que les points de la carte). Le choix filtre aussi
          la liste de projets à droite, qui défile jusqu'au premier projet de la filière. Masqué
          tant qu'il y a moins de 2 filières (un filtre à une seule option ne sert à rien). */}
      {energyFilters.length > 1 && (
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2 border-t border-white/15 pt-4">
          <span className="mr-1 text-xs font-semibold text-white/80">Filtrer par filière :</span>
          {[{ key: null, label: "Tous", color: "#0f172a" }, ...energyFilters].map((f) => {
            const isFilterActive = energyFilter === f.key;
            return (
              <button
                key={f.key ?? "tous"}
                type="button"
                onClick={() => setEnergyFilter(f.key)}
                className="flex items-center gap-1.5 rounded-full border-2 px-3 py-1.5 text-xs font-semibold text-slate-900 transition-colors"
                style={{
                  backgroundColor: isFilterActive ? "#fff" : "rgb(255 255 255 / 0.85)",
                  borderColor: isFilterActive ? f.color : "transparent",
                }}
                aria-pressed={isFilterActive}
              >
                {f.key && <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: f.color }} />}
                {f.label}
              </button>
            );
          })}
        </div>
      )}

      {active && <p className="mt-4 text-center text-sm font-semibold text-white">{active.commune}</p>}
    </>
  );
}

function StepText({
  item,
  active,
  onActivate,
}: {
  item: ScrollProjectMapItem;
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

  // Carte photo (retour client : "photo projet en fond avec par-dessus type d'énergie, puissance
  // et ville"). Dégradé teinté de la couleur de la filière, comme le fond de la carte à gauche.
  // Les projets non actifs sont atténués : le regard suit celui dont le point est allumé.
  // Toute la carte est cliquable quand une fiche projet existe (seul Star Soleil aujourd'hui).
  const Wrapper = item.href ? "a" : "div";
  const place = item.commune !== item.name ? item.commune : null;
  return (
    <div ref={ref} className="py-4 md:py-6">
      <Wrapper
        {...(item.href ? { href: item.href } : {})}
        className={`group relative block h-[22rem] overflow-hidden rounded-3xl transition-all duration-500 ease-out md:h-[30rem] ${
          active ? "opacity-100 shadow-xl" : "scale-[0.97] opacity-50"
        }`}
      >
        <img
          src={item.photo}
          alt=""
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(to top, color-mix(in srgb, ${item.color}, black 55%) 0%, color-mix(in srgb, ${item.color}, transparent 60%) 45%, transparent 75%)`,
          }}
        />
        {/* Voile sombre en haut : garde l'énergie et le type lisibles sur un ciel clair. */}
        <div className="absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-black/45 to-transparent" />
        <div className="absolute inset-x-0 top-0 p-6 text-white md:p-8">
          <p className="text-sm font-semibold tracking-[0.14em] uppercase drop-shadow">{item.energyLabel}</p>
          <p className="mt-0.5 text-sm text-white/80 drop-shadow">{item.type}</p>
        </div>
        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-6 text-white md:p-8">
          <div>
            <h3 className="text-3xl font-extrabold tracking-tight md:text-4xl">{item.name}</h3>
            {place && <p className="mt-1 text-base text-white/85">{place}</p>}
          </div>
          <p className="shrink-0 text-right text-2xl font-bold tabular-nums md:text-3xl">{item.power}</p>
        </div>
        {item.href && (
          <span className="absolute top-6 right-6 text-sm font-semibold text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100 md:top-8 md:right-8">
            Voir le détail →
          </span>
        )}
      </Wrapper>
    </div>
  );
}

export default function ScrollProjectMap({ items }: ScrollProjectMapProps) {
  // Retour client : la liste scrollytelling (texte à droite) ne présente plus que 5 projets
  // phares, avec un bouton vers "Nos réalisations" pour le reste — mais TOUS les projets restent
  // affichés comme points sur la carte (mapItems, non tronqué). featuredItems piloté par le champ
  // `featured` posé par l'appelant (voir index.astro) ; si aucun n'est marqué, on retombe sur les
  // 5 premiers plutôt que de casser l'affichage.
  const featuredItems = useMemo(() => {
    const marked = items.filter((item) => item.featured);
    return (marked.length > 0 ? marked : items.slice(0, 5)).slice(0, 5);
  }, [items]);

  const [activeId, setActiveId] = useState(featuredItems[0]?.id);
  const [energyFilter, setEnergyFilter] = useState<string | null>(null);
  const active = items.find((p) => p.id === activeId) ?? featuredItems[0];

  // Légende/filtres dérivés de TOUS les items (pas seulement les 5 vedettes) — la carte affiche
  // l'ensemble des projets, la légende doit donc couvrir toutes les filières réellement présentes.
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

  // Liste de droite : les 5 projets phares sans filtre ; avec un filtre, les projets de cette
  // filière (phares en tête, 5 maximum) — même plafond que la liste par défaut.
  const listItems = useMemo(() => {
    if (!energyFilter) return featuredItems;
    const ofEnergy = items.filter((item) => item.energyKey === energyFilter);
    return [...ofEnergy.filter((item) => item.featured), ...ofEnergy.filter((item) => !item.featured)].slice(0, 5);
  }, [items, featuredItems, energyFilter]);

  // Au changement de filtre : active le premier projet de la liste et y fait défiler la page, pour
  // que carte (fond, point allumé) et liste montrent tout de suite la filière choisie.
  const listRef = useRef<HTMLDivElement>(null);
  const selectFilter = (key: string | null) => {
    const next = key ? items.filter((item) => item.energyKey === key) : featuredItems;
    const first = key ? (next.find((item) => item.featured) ?? next[0]) : next[0];
    setEnergyFilter(key);
    if (first) setActiveId(first.id);
    // Haut de la liste aligné sur la carte sticky (md:top-24 = 96px) plutôt que 1er projet centré :
    // avec une filière à 1 ou 2 projets, la section est courte et le centrage sortait la carte de
    // l'écran.
    requestAnimationFrame(() => {
      const list = listRef.current;
      if (!list) return;
      window.scrollTo({ top: list.getBoundingClientRect().top + window.scrollY - 96, behavior: "smooth" });
    });
  };

  // Fond de la carte : couleur de la filière assombrie en OKLCH, qui garde la teinte au lieu de virer
  // au marron comme un mélange RVB (la couleur pure, orange
  // ou bleu vif sur une demi-page, était trop criarde), avec une transition lente entre projets.
  const mapBg = active ? `color-mix(in oklch, ${active.color}, black 15%)` : "#0f172a";

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
        className="pointer-events-none absolute inset-y-0 hidden transition-colors duration-[1200ms] ease-in-out md:block"
        style={{ left: "calc(-50vw + 50%)", width: "50vw", backgroundColor: mapBg }}
      />

      {/* Carte sticky : reste épinglée à l'écran pendant tout le défilement des projets à droite.
          Reste un enfant normal de la grid (largeur = colonne de gauche, pas 50vw) : c'est ce qui
          la garde alignée avec la colonne de texte à droite. Sur mobile (fond ci-dessus caché),
          garde son propre fond coloré contenu classique. */}
      <div
        className="relative rounded-3xl transition-colors duration-[1200ms] ease-in-out md:sticky md:top-24 md:h-fit md:rounded-none md:bg-transparent"
        style={{ backgroundColor: mapBg }}
      >
        {/* Décalage vers la gauche sur desktop : la colonne de grid est centrée dans la moitié
            gauche du conteneur max-w-6xl (pas dans les 50vw réels du fond ci-dessus), donc son
            centre naturel tombe à droite du centre visuel de la zone colorée. Formule exacte
            (pas un offset fixe approximatif) : à écran < 1152px (max-w-6xl encore égal à 100vw),
            l'écart vaut 16px (24px de padding — 8px de demi-gap) ; au-delà, le conteneur se fige à
            1152px alors que le fond continue de suivre le viewport, donc l'écart croît avec la
            largeur d'écran — min() choisit automatiquement la bonne branche à toute taille. */}
        {/* Carte agrandie (retour client) : max-w-md → max-w-lg, plus de place pour le tracé et
            les en-têtes qui ont aussi grandi ci-dessus (MapCardContent). */}
        <div className="scroll-map-card-offset mx-auto w-full max-w-lg px-6 py-10 md:mx-0 md:px-8">
          <MapCardContent
            active={active}
            visibleItems={visibleItems}
            totalCount={items.length}
            energyFilters={energyFilters}
            energyFilter={energyFilter}
            setEnergyFilter={selectFilter}
          />
        </div>
      </div>

      {/* Texte : défile normalement sur les 5 projets phares uniquement (retour client), chaque
          projet active son point sur la carte en entrant au centre du viewport (IntersectionObserver
          par bloc, voir StepText). La carte, elle, continue d'afficher tous les projets (visibleItems
          dérive de `items`, pas de featuredItems) — seule cette liste de texte est raccourcie. */}
      <div ref={listRef} className="relative">
        {listItems.map((item) => (
          <StepText key={item.id} item={item} active={item.id === activeId} onActivate={() => setActiveId(item.id)} />
        ))}

        {/* Bouton "voir tous nos projets" (retour client) — vers la page /projets qui liste
            l'ensemble du parc, puisque la liste ci-dessus se limite désormais à 5 projets phares. */}
        <div className="py-8 md:py-10">
          <a
            href="/projets"
            className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white shadow-sm transition-transform hover:-translate-y-0.5"
            style={{ backgroundColor: active?.color ?? "#0f172a" }}
          >
            Voir tous nos projets
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
}
