// Mosaïque 2x2 des 4 filières, affichée dans la carte 3D de ContainerScroll (bandeau "Vous
// souhaitez découvrir nos projets") — remplace un premier essai avec un aperçu de la carte de
// France, jugé redondant avec ScrollProjectMap juste en dessous. Montre plutôt la diversité des
// métiers (une photo par filière), contenu qui n'apparaît nulle part ailleurs sous cette forme.

export interface FilieresMosaicItem {
  key: string;
  label: string;
  image: string;
  color: string;
  href: string;
}

export interface FilieresMosaicProps {
  items: FilieresMosaicItem[];
}

export default function FilieresMosaic({ items }: FilieresMosaicProps) {
  return (
    <div className="grid h-full w-full grid-cols-2 grid-rows-2 gap-1 md:gap-2">
      {items.map((item) => (
        <a key={item.key} href={item.href} className="group relative overflow-hidden">
          <img
            src={item.image}
            alt=""
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div
            className="absolute inset-0 transition-opacity duration-300"
            style={{ background: `linear-gradient(to top, ${item.color}e6 0%, ${item.color}33 55%, transparent 100%)` }}
          />
          <span className="absolute bottom-2 left-2 text-xs font-bold text-white drop-shadow-sm md:bottom-3 md:left-3 md:text-base">
            {item.label}
          </span>
        </a>
      ))}
    </div>
  );
}
