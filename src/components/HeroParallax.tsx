// "Hero Parallax" (inspiré du pattern Aceternity UI) : 2 rangées de cartes projet qui défilent
// horizontalement en sens opposés. La scène est épinglée (sticky) le temps que TOUS les projets
// aient traversé l'écran : la hauteur de la section est calculée à partir de la largeur réelle des
// rangées (1 px de scroll = 1 px de défilement horizontal), puis la page reprend son cours normal.
// Légère bascule 3D (rotateX/rotateZ) à l'entrée de la section, avant l'épinglage.
//
// title/description sont des props string (pas un ReactNode construit côté .astro) : un fragment
// JSX/Astro passé en prop à un composant client:visible ne se sérialise pas en HTML — le
// compilateur Astro le garde comme objet interne, que React ne sait pas rendre côté SSR (déjà
// rencontré sur ContainerScroll).

import { useLayoutEffect, useRef, useState } from "react";
import { motion, useScroll, useSpring, useTransform, type MotionValue } from "motion/react";

export interface HeroParallaxProduct {
  title: string;
  link: string;
  thumbnail: string;
}

export interface HeroParallaxProps {
  products: HeroParallaxProduct[];
  title: string;
  description: string;
}

// Scroll "à vide" ajouté en plus du défilement horizontal, pour que la scène reste un instant
// immobile au début (lecture du titre) et à la fin (dernières cartes) avant de relâcher la page.
const PAUSE_PX = 240;

export function HeroParallax({ products, title, description }: HeroParallaxProps) {
  const half = Math.ceil(products.length / 2);
  const firstRow = products.slice(0, half);
  const secondRow = products.slice(half);

  const ref = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const row1Ref = useRef<HTMLDivElement>(null);
  const row2Ref = useRef<HTMLDivElement>(null);
  // Course horizontale de chaque rangée (largeur de la rangée - largeur visible), mesurée.
  const [travel, setTravel] = useState({ row1: 0, row2: 0 });

  useLayoutEffect(() => {
    const measure = () => {
      const vw = viewportRef.current?.clientWidth ?? 0;
      setTravel({
        row1: Math.max(0, (row1Ref.current?.scrollWidth ?? 0) - vw),
        row2: Math.max(0, (row2Ref.current?.scrollWidth ?? 0) - vw),
      });
    };
    measure();
    const ro = new ResizeObserver(measure);
    for (const el of [viewportRef.current, row1Ref.current, row2Ref.current]) if (el) ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const maxTravel = Math.max(travel.row1, travel.row2);

  // Progression pendant l'épinglage (0 = scène calée en haut, 1 = fin de la section).
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  // Progression de l'entrée à l'écran, pour la bascule 3D.
  const { scrollYProgress: enterProgress } = useScroll({ target: ref, offset: ["start end", "start start"] });

  const pause = maxTravel > 0 ? PAUSE_PX / (maxTravel + 2 * PAUSE_PX) : 0;
  const range = [pause, 1 - pause];
  // Rangée 1 part calée à gauche et file vers la gauche ; rangée 2 part décalée et file vers la droite.
  const x1 = useTransform(scrollYProgress, range, [0, -travel.row1]);
  const x2 = useTransform(scrollYProgress, range, [-travel.row2, 0]);

  const springConfig = { stiffness: 300, damping: 30, bounce: 100 };
  const rotateX = useSpring(useTransform(enterProgress, [0.3, 1], [15, 0]), springConfig);
  const rotateZ = useSpring(useTransform(enterProgress, [0.3, 1], [12, 0]), springConfig);
  const opacity = useSpring(useTransform(enterProgress, [0.2, 0.9], [0.2, 1]), springConfig);

  return (
    <div
      ref={ref}
      className="relative [overflow-x:clip]"
      // Avant la première mesure (SSR), une hauteur raisonnable évite un saut trop visible.
      style={{ height: maxTravel > 0 ? `calc(100vh + ${maxTravel + 2 * PAUSE_PX}px)` : "250vh" }}
    >
      <div
        ref={viewportRef}
        className="sticky top-[var(--header-h,72px)] flex h-[calc(100vh-var(--header-h,72px))] flex-col justify-center overflow-hidden antialiased [perspective:1000px] [transform-style:preserve-3d]"
      >
        <Header title={title} description={description} />
        <motion.div style={{ rotateX, rotateZ, opacity }} className="flex flex-col gap-6 md:gap-8">
          <motion.div ref={row1Ref} style={{ x: x1 }} className="flex w-max gap-6 px-4 md:gap-8 md:px-8">
            {firstRow.map((product) => (
              <ProductCard product={product} key={product.title} />
            ))}
          </motion.div>
          <motion.div ref={row2Ref} style={{ x: x2 }} className="flex w-max gap-6 px-4 md:gap-8 md:px-8">
            {secondRow.map((product) => (
              <ProductCard product={product} key={product.title} />
            ))}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

function Header({ title, description }: { title: string; description: string }) {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 pb-8 md:pb-10">
      <h2 className="text-3xl font-bold tracking-tight text-neutral-900 md:text-6xl">{title}</h2>
      <p className="mt-4 max-w-2xl text-base text-neutral-600 md:text-lg">{description}</p>
    </div>
  );
}

// Nom du projet toujours visible (y compris au tactile) : texte blanc sur dégradé sombre en bas de
// la photo. Le titre "Nom — Commune" est éclaté sur deux lignes.
function ProductCard({ product }: { product: HeroParallaxProduct }) {
  const [name, place] = product.title.split(" — ");
  return (
    <motion.a
      href={product.link}
      whileHover={{ y: -10 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className="group relative block aspect-[4/3] h-[clamp(9rem,26vh,17rem)] shrink-0 overflow-hidden rounded-xl shadow-sm hover:shadow-2xl"
    >
      <img
        src={product.thumbnail}
        alt=""
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-4 text-white md:p-5">
        <p className="text-base font-bold leading-tight md:text-lg">{name}</p>
        {/* Commune masquée quand le projet porte déjà son nom (ex. "Aiton — Aiton"). */}
        {place && place !== name && <p className="mt-0.5 text-sm text-white/75">{place}</p>}
      </div>
    </motion.a>
  );
}
