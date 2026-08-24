// Présentation des 4 filières façon tuta.com/fr (section "features") : timeline verticale à
// jalons à gauche, pile de cartes photo décalées en cascade à droite. Le jalon survolé (ou celui
// le plus proche du centre de l'écran au scroll sur mobile, où il n'y a pas de hover) fait
// remonter sa carte au sommet de la pile et applique sa couleur de thème à la ligne/pastille.
// Alternative à ThemeSelector (grille "expanding cards") : posée juste au-dessus le temps de
// comparer les deux en contexte, aucune des deux n'est retirée pour l'instant.
//
// Pas de défilement automatique : uniquement piloté par l'utilisateur (survol/focus de la
// timeline sur desktop, scroll sur mobile via l'IntersectionObserver ci-dessous).

import { useEffect, useRef, useState } from "react";

export interface EnergyShowcaseItem {
  key: string;
  label: string;
  tagline: string;
  image: string;
  color: string;
  logo: string;
  href: string;
}

export interface EnergyShowcaseProps {
  items: EnergyShowcaseItem[];
}

export default function EnergyShowcase({ items }: EnergyShowcaseProps) {
  const [active, setActive] = useState(0);
  const railRef = useRef<HTMLOListElement>(null);

  // Sur mobile (pas de hover fiable), on suit plutôt quel jalon est le plus proche du centre du
  // viewport pendant le scroll de la timeline elle-même. Limité à mobile (<768px, breakpoint
  // Tailwind md) : au-delà, toute la timeline tient à l'écran en même temps, donc "le plus proche
  // du centre" reste figé sur un seul jalon en permanence.
  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;
    if (!window.matchMedia("(max-width: 767px)").matches) return;
    const stepEls = Array.from(rail.querySelectorAll<HTMLElement>("[data-step-index]"));
    if (stepEls.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length === 0) return;
        const closest = visible.reduce((best, e) =>
          Math.abs(e.boundingClientRect.top - window.innerHeight / 2) <
          Math.abs(best.boundingClientRect.top - window.innerHeight / 2)
            ? e
            : best
        );
        const index = Number((closest.target as HTMLElement).dataset.stepIndex);
        if (!Number.isNaN(index)) {
          setActive(index);
        }
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 }
    );

    stepEls.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [items.length]);

  return (
    <div className="grid gap-10 md:grid-cols-2 md:items-center md:gap-16">
      <ol ref={railRef} className="relative border-l-2 border-slate-200 pl-12">
        {items.map((item, i) => {
          const isActive = active === i;
          return (
            <li
              key={item.key}
              data-step-index={i}
              className="relative pb-16 last:pb-0"
              onMouseEnter={() => setActive(i)}
              onFocus={() => setActive(i)}
            >
              <a href={item.href} className="group block">
                <span
                  className="absolute -left-[69px] top-0 flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-sm ring-4 ring-white transition-transform duration-300"
                  style={{
                    outline: `2px solid ${isActive ? item.color : "#e2e8f0"}`,
                    transform: isActive ? "scale(1.1)" : "scale(1)",
                  }}
                >
                  <img src={item.logo} alt="" className="h-8 w-8 object-contain" />
                </span>
                <h3
                  className="text-xl font-bold transition-colors duration-300 md:text-2xl"
                  style={{ color: isActive ? item.color : "#0f172a" }}
                >
                  {item.label}
                </h3>
                <p className="mt-2 text-base leading-relaxed text-neutral-600">{item.tagline}</p>
              </a>
            </li>
          );
        })}
      </ol>

      {/* Pile de cartes décalées : chaque carte occupe le même emplacement (absolute inset-0),
          translatée/mise à l'échelle selon sa distance à la carte active — celle-ci passe devant
          et à sa taille pleine, les autres reculent en cascade derrière, comme un jeu de cartes
          éventail. Pas de librairie : juste transform + z-index pilotés par l'état `active`. */}
      <div className="relative mx-auto h-80 w-full max-w-sm md:h-[28rem] md:max-w-md">
        {items.map((item, i) => {
          const offset = i - active;
          const isActive = offset === 0;
          return (
            <a
              key={item.key}
              href={item.href}
              aria-hidden={!isActive}
              tabIndex={isActive ? undefined : -1}
              className="absolute inset-0 overflow-hidden rounded-2xl border border-slate-200 shadow-lg transition-all duration-500 ease-out"
              style={{
                transform: isActive
                  ? "translate(0, 0) scale(1) rotate(0deg)"
                  : `translate(${offset * 16}px, ${Math.abs(offset) * 14}px) scale(${1 - Math.min(Math.abs(offset), 3) * 0.05}) rotate(${offset * 3}deg)`,
                zIndex: items.length - Math.abs(offset),
                opacity: Math.abs(offset) > 2 ? 0 : 1,
              }}
            >
              <img src={item.image} alt="" className="h-full w-full object-cover" />
              <div
                className="absolute inset-0"
                style={{
                  background: `linear-gradient(to top, ${item.color}cc 0%, ${item.color}22 55%, transparent 100%)`,
                }}
              />
              <span className="absolute bottom-5 left-5 text-xl font-bold text-white drop-shadow-sm md:text-2xl">
                {item.label}
              </span>
            </a>
          );
        })}
      </div>
    </div>
  );
}
