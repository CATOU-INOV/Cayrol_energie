// Arc de pétales repris du logo Cayrol Energie (roue de croissants autour du nom) : plutôt qu'un
// motif générique, réutilise directement la forme de marque comme sélecteur des 4 filières.
// Chaque pétale est un disque plein duquel un second disque (le "mordant") est soustrait via un
// <mask> SVG — la même construction géométrique que les pétales du vrai logo, pas un dessin
// approximatif. Posé en bas de l'accueil comme premier essai : à ajuster/déplacer selon retour.

import { useState } from "react";

export interface PetalArcItem {
  key: string;
  label: string;
  color: string;
  href: string;
}

export interface PetalArcProps {
  items: PetalArcItem[];
  /** Angle total balayé par l'arc, en degrés — 360 donnerait la roue complète du logo. */
  arcDegrees?: number;
}

const PETAL_RADIUS = 15;
const BITE_RADIUS = 14;
const BITE_OFFSET = 5;
const RING_RADIUS = 62;

function petalMaskId(key: string) {
  return `petal-mask-${key}`;
}

export default function PetalArc({ items, arcDegrees = 150 }: PetalArcProps) {
  const [active, setActive] = useState<string | null>(null);
  const [navigatingTo, setNavigatingTo] = useState<string | null>(null);

  const count = items.length;
  const startAngle = -arcDegrees / 2;
  const step = count > 1 ? arcDegrees / (count - 1) : 0;

  function handleActivate(item: PetalArcItem) {
    setActive(item.key);
    setNavigatingTo(item.href);
    // Laisse le temps à l'animation d'expansion de se voir avant de quitter la page — un clic
    // qui navigue instantanément couperait le mouvement à mi-course.
    window.setTimeout(() => {
      window.location.href = item.href;
    }, 380);
  }

  return (
    <div className="mx-auto w-full max-w-2xl">
      {/* Arc centré vers le haut (-90° = plein nord) : startAngle/step balayent l'angle autour de
          ce cap, pas un décalage supplémentaire — les pétales restent dans la moitié haute du
          viewBox, cohérent avec les labels texte affichés en dessous. */}
      <svg viewBox="-100 -90 200 110" className="w-full overflow-visible">
        {items.map((item, i) => {
          const angleDeg = -90 + startAngle + i * step;
          const angleRad = (angleDeg * Math.PI) / 180;
          const cx = RING_RADIUS * Math.cos(angleRad);
          const cy = RING_RADIUS * Math.sin(angleRad);

          // Le mordant est décalé vers le centre de l'arc, tangentiellement orienté — même
          // logique que le prototype validé : chaque pétale "pointe" dans le sens de la roue.
          const biteAngleRad = angleRad + Math.PI / 2 + 0.5;
          const biteCx = cx + BITE_OFFSET * Math.cos(biteAngleRad);
          const biteCy = cy + BITE_OFFSET * Math.sin(biteAngleRad);

          const isActive = active === item.key;
          const isNavigating = navigatingTo === item.href;

          return (
            <g key={item.key}>
              <defs>
                {/* x/y/width/height explicites sur <mask> : sans ça, la région par défaut
                    (-10% -10% 120% 120%) se comprend en userSpaceOnUse comme -10%..120% du
                    viewport SVG entier (pas de l'objet masqué), donc une zone minuscule proche
                    de l'origine — les pétales excentrés par rapport au centre du viewBox
                    disparaissaient entièrement, masqués par une région qui ne les couvrait pas. */}
                <mask
                  id={petalMaskId(item.key)}
                  maskUnits="userSpaceOnUse"
                  x={cx - PETAL_RADIUS - 4}
                  y={cy - PETAL_RADIUS - 4}
                  width={PETAL_RADIUS * 2 + 8}
                  height={PETAL_RADIUS * 2 + 8}
                >
                  <rect
                    x={cx - PETAL_RADIUS - 4}
                    y={cy - PETAL_RADIUS - 4}
                    width={PETAL_RADIUS * 2 + 8}
                    height={PETAL_RADIUS * 2 + 8}
                    fill="white"
                  />
                  <circle cx={biteCx} cy={biteCy} r={BITE_RADIUS} fill="black" />
                </mask>
              </defs>
              <a href={item.href} aria-label={item.label} className="cursor-pointer">
                <circle
                  cx={cx}
                  cy={cy}
                  r={PETAL_RADIUS}
                  fill={item.color}
                  mask={`url(#${petalMaskId(item.key)})`}
                  opacity={active === null || isActive ? 1 : 0.35}
                  className="transition-[opacity,transform] duration-300 ease-out"
                  style={{
                    transformOrigin: `${cx}px ${cy}px`,
                    transform: isNavigating ? "scale(1.7) rotate(25deg)" : isActive ? "scale(1.25)" : "scale(1)",
                    transitionDuration: isNavigating ? "380ms" : "300ms",
                  }}
                  onMouseEnter={() => !navigatingTo && setActive(item.key)}
                  onMouseLeave={() => !navigatingTo && setActive(null)}
                  onClick={(e) => {
                    e.preventDefault();
                    if (!navigatingTo) handleActivate(item);
                  }}
                />
              </a>
              <text
                x={cx}
                y={cy + PETAL_RADIUS + 12}
                textAnchor="middle"
                className="pointer-events-none select-none text-[7px] font-semibold uppercase tracking-wide transition-opacity duration-300"
                fill={item.color}
                opacity={active === null || isActive ? 1 : 0.35}
              >
                {item.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
