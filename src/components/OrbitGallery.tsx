// Galerie en orbite : une photo centrale entourée de photos satellites reliées par des anneaux
// elliptiques décoratifs — inspiré du hero "constellation" du thème Techlo (visages en orbite
// autour d'un profil central). Ici les satellites illustrent les variantes d'une même activité
// (ex: types d'installations photovoltaïques) plutôt que des personnes.
// 100% SVG (viewBox carré, pas de mélange % CSS / coordonnées comme rencontré sur
// BoucleLocaleInteractive) : le conteneur est forcé en aspect-square, donc pas de distorsion.

export interface OrbitItem {
  image: string;
  alt: string;
  label: string;
}

export interface OrbitGalleryProps {
  color: string;
  centerImage: string;
  centerAlt: string;
  items: OrbitItem[];
}

// Positions organiques (pas une croix symétrique) : angle en degrés (0 = droite, sens horaire),
// rayon et taille variables par satellite pour un rendu plus naturel, à la manière de la
// référence visuelle.
const LAYOUT = [
  { angle: -55, radius: 33, r: 10 },
  { angle: 25, radius: 37, r: 8.5 },
  { angle: 138, radius: 35, r: 11 },
  { angle: -155, radius: 29, r: 7.5 },
];

export default function OrbitGallery({ color, centerImage, centerAlt, items }: OrbitGalleryProps) {
  const CX = 50;
  const CY = 50;
  const positions = items.slice(0, LAYOUT.length).map((item, i) => {
    const { angle, radius, r } = LAYOUT[i];
    const rad = (angle * Math.PI) / 180;
    return { ...item, x: CX + radius * Math.cos(rad), y: CY + radius * Math.sin(rad) * 0.82, r };
  });

  return (
    <div className="orbit-gallery relative mx-auto aspect-square w-full max-w-lg">
      <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" role="img" aria-hidden="true">
        <defs>
          <clipPath id="orbit-center-clip">
            <circle cx={CX} cy={CY} r={17} />
          </clipPath>
          {positions.map((p, i) => (
            <clipPath id={`orbit-sat-clip-${i}`} key={i}>
              <circle cx={p.x} cy={p.y} r={p.r} />
            </clipPath>
          ))}
        </defs>

        {/* Anneaux elliptiques décoratifs, à plusieurs rotations pour un effet "constellation" */}
        <g stroke="#cbd5e1" fill="none" strokeWidth="0.4" opacity="0.8">
          <ellipse cx={CX} cy={CY} rx="42" ry="26" transform={`rotate(-18 ${CX} ${CY})`} />
          <ellipse cx={CX} cy={CY} rx="42" ry="26" transform={`rotate(48 ${CX} ${CY})`} />
          <ellipse cx={CX} cy={CY} rx="42" ry="26" transform={`rotate(112 ${CX} ${CY})`} />
        </g>

        {/* Photo centrale */}
        <circle cx={CX} cy={CY} r={18.5} fill="#fff" />
        <image
          href={centerImage}
          x={CX - 17}
          y={CY - 17}
          width={34}
          height={34}
          preserveAspectRatio="xMidYMid slice"
          clipPath="url(#orbit-center-clip)"
        />
        <circle cx={CX} cy={CY} r={17} fill="none" stroke="#fff" strokeWidth="1.6" />
        <circle cx={CX} cy={CY} r={17} fill="none" stroke={color} strokeWidth="0.6" />

        {/* Photos satellites */}
        {positions.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r={p.r + 1.5} fill="#fff" />
            <image
              href={p.image}
              x={p.x - p.r}
              y={p.y - p.r}
              width={p.r * 2}
              height={p.r * 2}
              preserveAspectRatio="xMidYMid slice"
              clipPath={`url(#orbit-sat-clip-${i})`}
            />
            <circle cx={p.x} cy={p.y} r={p.r} fill="none" stroke="#fff" strokeWidth="1.2" />
            <circle cx={p.x} cy={p.y} r={p.r} fill="none" stroke={color} strokeWidth="0.5" />
          </g>
        ))}
      </svg>

      {/* Légendes : positionnées en HTML, alignées sur les mêmes coordonnées en % (viewBox
          carré non déformé, donc % CSS et coordonnées SVG coïncident exactement). Le SVG est
          purement décoratif (aria-hidden) : ces légendes portent le texte alternatif réel. */}
      <span className="sr-only">{centerAlt}</span>
      {positions.map((p, i) => (
        <span
          key={i}
          className="absolute -translate-x-1/2 rounded-md border border-slate-300 bg-white px-2 py-0.5 text-[11px] font-semibold whitespace-nowrap text-slate-700 shadow-sm"
          style={{ left: `${p.x}%`, top: `${p.y + p.r + 4}%` }}
        >
          {p.label}
        </span>
      ))}
    </div>
  );
}
