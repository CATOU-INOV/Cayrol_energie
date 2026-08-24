// Déroulé d'étapes façon business.nrg.com/campaigns/build-your-data-center (onglet
// "Site Development") : chaque étape est un bloc complet (icône + titre + texte à gauche, photo
// à coins arrondis à droite) empilé dans le flux normal de la page. Chaque cadre image fait
// volontairement moins qu'une pleine hauteur d'écran : sur une hauteur de viewport donnée, on voit
// donc le bas de l'image précédente, l'image active en entier, et le haut de la suivante — comme
// sur la référence. Le texte reste statique dans le flux (pas de sticky) : il défile normalement
// avec la page. Au scroll, l'image qui sort par le haut s'éclaircit progressivement (opacity → 0)
// et glisse dans son cadre (parallax). Alternative à Timeline/TimelineVertical/TimelineProgress/
// TimelineCards pour la frise "Déroulement d'un projet type" : posée en plus, aucune des frises
// existantes n'est retirée.

import { useEffect, useRef, useState } from "react";
import type { TimelineStep } from "./Timeline";
import { THEMATIC_ICONS, type ThematicIconName } from "./ThematicIcons";

export interface ScrollStepGalleryStep extends TimelineStep {
  image: string;
  icon?: ThematicIconName;
}

export interface ScrollStepGalleryProps {
  steps: ScrollStepGalleryStep[];
  color?: string;
}

// L'image déborde de IMAGE_OVERSIZE_RATIO (ex. 0.4 = 140% de la hauteur du cadre) pour avoir de la
// marge où glisser verticalement. Le déplacement va de +marge (bas) à -marge (haut) au fil du
// scroll, en fraction de la hauteur du cadre plutôt qu'en px fixes — sur un grand cadre desktop
// (62vh) l'image parcourt donc une distance visible proportionnelle à sa taille, au lieu d'un
// déplacement fixe qui paraissait quasi statique une fois le cadre agrandi.
const IMAGE_OVERSIZE_RATIO = 0.7;

function StepBlock({ step, color, index }: { step: ScrollStepGalleryStep; color: string; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const [imageFade, setImageFade] = useState(0); // 0 = pleine opacité, 1 = totalement blanchi
  const [parallax, setParallax] = useState(0);

  useEffect(() => {
    const el = ref.current;
    const frame = frameRef.current;
    if (!el || !frame) return;

    function onScroll() {
      if (!el || !frame) return;
      const rect = el.getBoundingClientRect();

      // Fondu de l'image : démarre quand le haut du bloc franchit le haut du viewport, se termine
      // une fois le bloc entièrement sorti par le haut — proportionnel à sa propre hauteur.
      const imageFadeProgress = -rect.top / rect.height;
      setImageFade(Math.min(Math.max(imageFadeProgress, 0), 1));

      // Parallax : progression du bloc à travers tout le viewport, du moment où il y entre par
      // le bas (rect.top = viewport height) à celui où il en sort par le haut (rect.bottom = 0).
      // Marge de glissement dérivée de la hauteur réelle du cadre (pas du bloc entier) : la moitié
      // du débordement de l'image, seule portion réellement disponible sans laisser de bord vide.
      const frameHeight = frame.getBoundingClientRect().height;
      const maxOffset = (frameHeight * IMAGE_OVERSIZE_RATIO) / 2;
      const travel = rect.height + window.innerHeight;
      const parallaxProgress = (window.innerHeight - rect.top) / travel;
      const clamped = Math.min(Math.max(parallaxProgress, 0), 1);
      setParallax(maxOffset - clamped * maxOffset * 2);
    }

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  // Alterne le côté de l'image une étape sur deux (paire = image à droite comme avant, impaire =
  // image à gauche) via order-* Tailwind plutôt qu'en changeant l'ordre du JSX, pour garder le
  // texte toujours en premier dans le DOM (lecture/accessibilité) quel que soit l'affichage visuel.
  const imageFirst = index % 2 === 1;

  return (
    <div ref={ref} className="relative grid grid-cols-1 gap-6 py-8 md:grid-cols-2 md:items-center md:gap-16 md:py-4">
      <div className={imageFirst ? "md:order-2" : undefined}>
        <span
          className="mb-4 inline-flex w-fit items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold"
          style={{ backgroundColor: `${color}1a`, color }}
        >
          Étape {index + 1} — {step.date}
        </span>
        <div className="flex items-start gap-4">
          {step.icon && (
            <span
              className="flex size-11 shrink-0 items-center justify-center rounded-xl"
              style={{ backgroundColor: `${color}1a`, color }}
            >
              <span className="size-5">{THEMATIC_ICONS[step.icon]}</span>
            </span>
          )}
          <div>
            <h3 className="text-xl font-extrabold text-neutral-900 md:text-2xl">{step.label}</h3>
            {step.description && (
              <p className="mt-2 max-w-md text-sm leading-relaxed text-neutral-600">{step.description}</p>
            )}
          </div>
        </div>
      </div>

      {/* Cadre image à coins arrondis, hauteur volontairement < 100vh (62vh) : sur une hauteur
          d'écran donnée, on voit donc le bas de l'image précédente et le haut de la suivante
          dépasser au-dessus/en-dessous du cadre actif, comme sur la référence. L'image elle-même
          est surdimensionnée (IMAGE_OVERSIZE_RATIO) pour avoir assez de marge où glisser
          verticalement (parallax, ± la moitié du débordement) sans jamais laisser de bord vide. */}
      <div
        ref={frameRef}
        className={`relative h-72 w-full overflow-hidden rounded-2xl md:h-[62vh] ${imageFirst ? "md:order-1" : ""}`}
      >
        <img
          src={step.image}
          alt=""
          className="absolute inset-x-0 w-full object-cover"
          style={{
            height: `${(1 + IMAGE_OVERSIZE_RATIO) * 100}%`,
            top: `${-(IMAGE_OVERSIZE_RATIO / 2) * 100}%`,
            transform: `translateY(${parallax}px)`,
            opacity: 1 - imageFade,
          }}
        />
      </div>
    </div>
  );
}

export default function ScrollStepGallery({ steps, color = "#f97316" }: ScrollStepGalleryProps) {
  return (
    <div className="relative">
      {steps.map((step, i) => (
        <StepBlock key={step.label} step={step} color={color} index={i} />
      ))}
    </div>
  );
}
