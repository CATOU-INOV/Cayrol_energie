// Roue complète du logo Cayrol Energie (12 pétales en cercle) — même construction géométrique
// que PetalArc (disque plein moins disque mordant via <mask> SVG), mais en cercle fermé plutôt
// qu'un arc partiel cliquable. Purement visuel : le composant ne s'anime pas lui-même, son
// rotation/translation est pilotée depuis l'extérieur (voir usage dans index.astro, section
// bandeau CTA) via la prop `rotation` — pour rester synchronisable avec le scroll de la page.

export interface PetalWheelProps {
  color?: string;
  /** Rotation actuelle en degrés — piloté en externe (ex. scroll listener) pour l'effet "roue qui roule". */
  rotation?: number;
  className?: string;
}

const PETAL_RADIUS = 15;
const BITE_RADIUS = 14;
const BITE_OFFSET = 5;
const RING_RADIUS = 62;
const PETAL_COUNT = 12;

export default function PetalWheel({ color = "white", rotation = 0, className = "" }: PetalWheelProps) {
  return (
    <svg viewBox="-90 -90 180 180" className={className} style={{ transform: `rotate(${rotation}deg)` }}>
      {Array.from({ length: PETAL_COUNT }, (_, i) => {
        const angleDeg = (360 / PETAL_COUNT) * i - 90;
        const angleRad = (angleDeg * Math.PI) / 180;
        const cx = RING_RADIUS * Math.cos(angleRad);
        const cy = RING_RADIUS * Math.sin(angleRad);

        const biteAngleRad = angleRad + Math.PI / 2 + 0.5;
        const biteCx = cx + BITE_OFFSET * Math.cos(biteAngleRad);
        const biteCy = cy + BITE_OFFSET * Math.sin(biteAngleRad);

        const maskId = `wheel-petal-mask-${i}`;

        return (
          <g key={i}>
            <defs>
              <mask
                id={maskId}
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
            <circle cx={cx} cy={cy} r={PETAL_RADIUS} fill={color} mask={`url(#${maskId})`} />
          </g>
        );
      })}
    </svg>
  );
}
