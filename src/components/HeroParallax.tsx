// "Hero Parallax" (pattern Aceternity UI, repris fidèlement de la démo officielle) : 3 rangées de
// cartes projet qui défilent horizontalement en sens opposés pendant que toute la scène pivote en
// 3D (rotateX/rotateZ) et remonte (translateY) au fil du scroll. Remplace le précédent essai
// ContainerScroll (mosaïque de filières, jugée redondante avec EnergyShowcase juste au-dessus) :
// ici les cartes montrent de vrais projets, contenu qui n'apparaît nulle part ailleurs sous cette
// forme.
//
// title/description sont des props string (pas un ReactNode construit côté .astro) : un fragment
// JSX/Astro passé en prop à un composant client:visible ne se sérialise pas en HTML — le
// compilateur Astro le garde comme objet interne, que React ne sait pas rendre côté SSR (déjà
// rencontré sur ContainerScroll). Header reste donc un sous-composant interne, comme dans la démo
// d'origine, mais son texte est injecté via props plutôt que codé en dur.

import { useRef } from "react";
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

export function HeroParallax({ products, title, description }: HeroParallaxProps) {
  const firstRow = products.slice(0, 5);
  const secondRow = products.slice(5, 10);
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });

  const springConfig = { stiffness: 300, damping: 30, bounce: 100 };

  const translateX = useSpring(useTransform(scrollYProgress, [0, 1], [0, 1000]), springConfig);
  const translateXReverse = useSpring(useTransform(scrollYProgress, [0, 1], [0, -1000]), springConfig);
  const rotateX = useSpring(useTransform(scrollYProgress, [0, 0.2], [15, 0]), springConfig);
  const opacity = useSpring(useTransform(scrollYProgress, [0, 0.2], [0.2, 1]), springConfig);
  const rotateZ = useSpring(useTransform(scrollYProgress, [0, 0.2], [20, 0]), springConfig);
  // Plus de translateY : avec seulement 2 rangées (au lieu des 3 du calibrage d'origine), la scène
  // est plus compacte et ce déplacement vertical de plusieurs centaines de px suffisait à faire
  // sortir une rangée du cadre avant que le scroll de la section ne soit terminé, ou à laisser un
  // grand vide en bas une fois la translation achevée — l'amplitude n'avait plus aucune valeur
  // stable une fois le nombre de rangées changé. Les rangées restent maintenant à une position
  // verticale fixe ; seuls le défilement horizontal croisé et la légère rotation 3D d'entrée
  // suffisent à l'effet.

  return (
    <div
      ref={ref}
      className="relative flex min-h-[140vh] flex-col self-auto overflow-hidden py-20 antialiased [perspective:1000px] [transform-style:preserve-3d]"
    >
      <Header title={title} description={description} />
      <motion.div style={{ rotateX, rotateZ, opacity }}>
        <motion.div className="mb-20 flex flex-row-reverse space-x-20 space-x-reverse">
          {firstRow.map((product) => (
            <ProductCard product={product} translate={translateX} key={product.title} />
          ))}
        </motion.div>
        <motion.div className="flex flex-row space-x-20">
          {secondRow.map((product) => (
            <ProductCard product={product} translate={translateXReverse} key={product.title} />
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}

function Header({ title, description }: { title: string; description: string }) {
  return (
    <div className="relative left-0 top-0 mx-auto w-full max-w-7xl px-4 py-10 md:py-16">
      <h1 className="text-2xl font-bold text-neutral-900 md:text-7xl">{title}</h1>
      <p className="mt-8 max-w-2xl text-base text-neutral-600 md:text-xl">{description}</p>
    </div>
  );
}

function ProductCard({ product, translate }: { product: HeroParallaxProduct; translate: MotionValue<number> }) {
  return (
    <motion.div
      style={{ x: translate }}
      whileHover={{ y: -20 }}
      key={product.title}
      className="group/product relative h-96 w-[30rem] shrink-0"
    >
      <a href={product.link} className="block group-hover/product:shadow-2xl">
        <img
          src={product.thumbnail}
          height={600}
          width={600}
          className="absolute inset-0 h-full w-full object-cover object-left-top"
          alt={product.title}
        />
      </a>
      <div className="pointer-events-none absolute inset-0 h-full w-full bg-black opacity-0 group-hover/product:opacity-80" />
      <h2 className="absolute bottom-4 left-4 text-white opacity-0 group-hover/product:opacity-100">
        {product.title}
      </h2>
    </motion.div>
  );
}
