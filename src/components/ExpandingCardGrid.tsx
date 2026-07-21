// Grille "expanding cards" générique : au survol (ou focus clavier), une case agrandit et réduit
// les autres à de fines bandes, en révélant description + lien. Pattern extrait de ThemeSelector
// (4 univers énergétiques de l'accueil) pour être réutilisé partout où on affiche un petit jeu de
// cartes illustrées — ex. les catégories d'installations (Haute/Basse chute, Toiture/Ombrières/...).
//
// Implémenté en flex-grow animé (pas de position:absolute/z-index) : les cases non survolées se
// réduisent dans le flux normal plutôt que d'être recouvertes, donc pas de flicker de survol, et
// un fallback naturel sur mobile où le hover n'existe pas (la grille reste simplement équilibrée).
// Se généralise à n'importe quel nombre d'items/de colonnes : avec 2 items sur 1 seule ligne,
// seule la dimension horizontale s'anime (pas de ligne voisine à réduire), ce qui donne un
// classique "deux cartes côte à côte, celle survolée s'élargit".

import { useState } from "react";

export interface ExpandingCardItem {
  key: string;
  label: string;
  image: string;
  color: string;
  icon?: string;
  description?: string;
  href?: string;
}

export interface ExpandingCardGridProps {
  items: ExpandingCardItem[];
  perRow?: number;
  height?: string;
}

export default function ExpandingCardGrid({
  items,
  perRow = 2,
  height = "h-[420px] md:h-[480px]",
}: ExpandingCardGridProps) {
  const [hovered, setHovered] = useState<number | null>(null);

  const rows: ExpandingCardItem[][] = [];
  for (let i = 0; i < items.length; i += perRow) {
    rows.push(items.slice(i, i + perRow));
  }

  return (
    <div className={`flex ${height} flex-col gap-2`}>
      {rows.map((rowItems, rowIndex) => {
        const rowIsExpanded = hovered !== null && Math.floor(hovered / perRow) === rowIndex;
        return (
          <div
            key={rowIndex}
            className="flex min-h-0 gap-2 transition-[flex-grow] duration-500 ease-out"
            style={{ flexGrow: rowIsExpanded ? 3 : 1, flexBasis: 0 }}
          >
            {rowItems.map((item, colIndex) => {
              const index = rowIndex * perRow + colIndex;
              const isHovered = hovered === index;

              return (
                <div
                  key={item.key}
                  onMouseEnter={() => setHovered(index)}
                  onMouseLeave={() => setHovered(null)}
                  onFocus={() => setHovered(index)}
                  onBlur={() => setHovered(null)}
                  tabIndex={item.href ? undefined : 0}
                  className="group relative min-w-0 overflow-hidden rounded-2xl transition-[flex-grow] duration-500 ease-out"
                  style={{ flexGrow: isHovered ? 3 : 1, flexBasis: 0 }}
                >
                  <img
                    src={item.image}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out"
                    style={{ transform: isHovered ? "scale(1.06)" : "scale(1)" }}
                  />
                  <div
                    className="absolute inset-0 transition-opacity duration-500"
                    style={{
                      background: `linear-gradient(to top, ${item.color}f2 0%, ${item.color}66 45%, ${item.color}22 100%)`,
                    }}
                  />

                  <div className="pointer-events-none absolute inset-0 flex flex-col justify-end p-4 md:p-6">
                    {item.icon && (
                      <img
                        src={item.icon}
                        alt=""
                        className="mb-2 h-8 w-8 shrink-0 object-contain transition-transform duration-500 md:h-10 md:w-10"
                        style={{ transform: isHovered ? "scale(1.15)" : "scale(1)" }}
                      />
                    )}
                    <h3 className="text-base font-bold leading-tight text-white transition-all duration-300 md:text-xl lg:text-2xl">
                      {item.label}
                    </h3>
                    {item.description && (
                      <p
                        className="mt-2 max-w-sm text-sm text-white/85 transition-all duration-300"
                        style={{
                          opacity: isHovered ? 1 : 0,
                          transform: isHovered ? "translateY(0)" : "translateY(6px)",
                        }}
                      >
                        {item.description}
                      </p>
                    )}
                    {item.href && (
                      <span
                        className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-white transition-all duration-300"
                        style={{
                          opacity: isHovered ? 1 : 0,
                          transform: isHovered ? "translateX(0)" : "translateX(-6px)",
                        }}
                      >
                        Découvrir <span aria-hidden="true">→</span>
                      </span>
                    )}
                  </div>

                  {/* Cible de clic en dernier enfant : passe au-dessus des autres calques par
                      simple ordre du DOM (z-index:auto), sans dépendre d'une classe z-* — plus
                      robuste face aux soucis de cascade CSS observés après une navigation SPA
                      (ClientRouter) où un z-index explicite cessait parfois de s'appliquer. */}
                  {item.href && (
                    <a href={item.href} className="absolute inset-0" aria-label={item.label} />
                  )}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
