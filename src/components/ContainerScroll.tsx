// Bandeau d'accroche "Vous souhaitez découvrir nos projets" : remplace ScrollDrawnPath (trait SVG
// qui se dessine au scroll) par le pattern "Container Scroll Animation" d'Aceternity UI — le titre
// remonte légèrement pendant que la carte photo, partie inclinée en perspective, se redresse et
// s'agrandit au fil du scroll. Effet piloté par motion/react (useScroll + useTransform) plutôt
// qu'un scroll listener vanilla comme le reste du site : le composant d'origine collé par
// l'utilisateur en dépend nativement (interpolation fluide, spring implicite), le réécrire en
// vanilla aurait perdu l'essentiel du rendu recherché.

// titleComponent est volontairement une prop string (pas un ReactNode construit côté .astro) :
// un fragment JSX/Astro passé en prop à un composant client:visible ne se sérialise pas en HTML
// (le compilateur Astro le garde comme objet interne {htmlParts, expressions}, que React ne sait
// pas rendre — erreur "Objects are not valid as a React child" en SSR). Le titre est donc composé
// entièrement ici, en JSX natif ; seul le texte et le lien varient depuis l'appelant.

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useScroll, useTransform, motion, type MotionValue } from "motion/react";

export interface ContainerScrollProps {
  title: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
  ctaColor: string;
  children: ReactNode;
}

export function ContainerScroll({ title, description, ctaLabel, ctaHref, ctaColor, children }: ContainerScrollProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef });
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const scaleDimensions = (): [number, number] => (isMobile ? [0.7, 0.9] : [1.05, 1]);

  const rotate = useTransform(scrollYProgress, [0, 1], [20, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], scaleDimensions());
  // Amplitude réduite (-40 au lieu de -100) : le titre ne doit que légèrement se rapprocher de la
  // carte au scroll, pas remonter au point de chevaucher le bouton CTA en dessous de lui — c'est
  // ce chevauchement, combiné à Card qui remonte elle-même via -mt-12, qui mordait sur le CTA.
  const translate = useTransform(scrollYProgress, [0, 1], [0, -40]);

  return (
    // Hauteur volontairement bien supérieure à un écran (h-[90rem] ≈ 1440px desktop, contre un
    // viewport typique de ~800-900px) : donne à l'animation (rotate/scale/translate, toutes basées
    // sur scrollYProgress sur toute la traversée du conteneur) assez de distance de scroll pour
    // rester progressive — avec une hauteur trop proche du viewport, la carte apparaissait déjà
    // quasi à plat dès son entrée à l'écran, l'essentiel de la transition étant "consommé" avant
    // même que la section ne soit visible.
    <div className="relative flex h-[70rem] items-center justify-center p-2 md:h-[90rem] md:p-20" ref={containerRef}>
      <div className="relative w-full py-10 md:py-24" style={{ perspective: "1000px" }}>
        <Header translate={translate}>
          <h2 className="text-4xl font-extrabold leading-tight text-neutral-900 md:text-6xl">{title}</h2>
          <p className="mt-6 text-lg text-neutral-600">{description}</p>
          <a
            href={ctaHref}
            className="mt-8 inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white shadow-sm transition-transform hover:-translate-y-0.5"
            style={{ backgroundColor: ctaColor }}
          >
            {ctaLabel}
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
              <path d="M12 5v14M19 12l-7 7-7-7" />
            </svg>
          </a>
        </Header>
        <Card rotate={rotate} scale={scale}>
          {children}
        </Card>
      </div>
    </div>
  );
}

function Header({ translate, children }: { translate: MotionValue<number>; children: ReactNode }) {
  return (
    <motion.div style={{ translateY: translate }} className="mx-auto max-w-3xl px-4 text-center">
      {children}
    </motion.div>
  );
}

function Card({
  rotate,
  scale,
  children,
}: {
  rotate: MotionValue<number>;
  scale: MotionValue<number>;
  children: ReactNode;
}) {
  return (
    <motion.div
      style={{
        rotateX: rotate,
        scale,
        boxShadow:
          "0 0 #0000004d, 0 9px 20px #0000004a, 0 37px 37px #00000042, 0 84px 50px #00000026, 0 149px 60px #0000000a, 0 233px 65px #00000003",
      }}
      className="mx-auto mt-8 h-[24rem] w-full max-w-5xl rounded-[30px] border-4 border-slate-200 bg-white p-2 shadow-2xl md:h-[36rem] md:p-6"
    >
      <div className="h-full w-full overflow-hidden rounded-2xl bg-slate-100 md:rounded-2xl">{children}</div>
    </motion.div>
  );
}
