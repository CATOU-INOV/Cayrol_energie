// Mise en avant des projets : grandes cartes photo plein cadre avec une carte titre flottante
// en bas (titre + tags + bouton flèche), plutôt que les petites cartes texte identiques
// d'origine — chaque carte a une vraie identité visuelle via sa photo.
// layout="carousel" réutilise le défilement infini pure CSS déjà utilisé par LogoMarquee
// (classes globales .marquee-mask / .marquee-track, gérant déjà pause au survol et
// prefers-reduced-motion) plutôt que d'introduire une librairie de carrousel.

export interface ShowcaseProject {
  name: string;
  commune: string;
  power: string;
  description: string;
  image: string;
  tags: string[];
  /** Si fourni, la carte devient un lien vers la fiche projet détaillée (ex. démo Star Soleil). */
  href?: string;
}

export interface ProjectShowcaseProps {
  color: string;
  projects: ShowcaseProject[];
  layout?: "grid" | "carousel";
}

function ShowcaseCard({ p, color, className = "" }: { p: ShowcaseProject; color: string; className?: string }) {
  const Tag = p.href ? "a" : "article";
  return (
    <Tag
      {...(p.href ? { href: p.href } : {})}
      className={`group relative flex h-72 flex-col justify-end overflow-hidden rounded-2xl border border-slate-300 shadow-sm transition-shadow hover:shadow-lg ${className}`}
    >
      <img
        src={p.image}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />

      <div className="relative m-3 rounded-xl border border-slate-200 bg-white p-4 shadow-md">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate font-bold text-slate-900">
              {p.name} <span className="font-normal text-neutral-500">— {p.commune}</span>
            </p>
            <p className="mt-1 text-xs font-medium text-neutral-500">{p.tags.join(" · ")}</p>
          </div>
          <span
            className="flex size-8 shrink-0 items-center justify-center rounded-full text-white transition-transform duration-300 group-hover:rotate-45"
            style={{ backgroundColor: color }}
            aria-hidden="true"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4">
              <path d="M7 17 17 7M8 7h9v9" />
            </svg>
          </span>
        </div>
      </div>
    </Tag>
  );
}

export default function ProjectShowcase({ color, projects, layout = "grid" }: ProjectShowcaseProps) {
  if (layout === "carousel") {
    // Duplication + translation -50% : boucle continue quel que soit le nombre de projets,
    // même technique que LogoMarquee plutôt qu'un calcul de largeur en dur.
    const looped = [...projects, ...projects];
    return (
      <div className="marquee-mask relative overflow-hidden">
        <div className="marquee-track flex w-max gap-6 py-2">
          {looped.map((p, i) => (
            <ShowcaseCard key={i} p={p} color={color} className="w-80 shrink-0 md:w-96" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {projects.map((p, i) => (
        <ShowcaseCard key={i} p={p} color={color} />
      ))}
    </div>
  );
}
