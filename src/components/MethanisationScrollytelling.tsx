// Scrollytelling du cycle de méthanisation (9 étapes : intrants → digesteur → épandage /
// épuration → injection → usages), porté depuis le prototype Claude Design "Cycle Methanisation
// v2" (retours client : boues d'épuration retirées, tracteurs corrigés, pictogramme dans chaque
// nœud avec le numéro en pastille). La logique (mesure de scroll lissée, dasharray/dashoffset des
// tracés, apparition des cartes, pause finale, tracteurs, fumée, flammes) reproduit le script du
// prototype ; seule l'intégration (React + refs + RAF) est adaptée au site.
//
// Tracteurs : horloge indépendante du scroll (vitesse constante avec accélération/freinage, jamais
// de marche arrière), roues qui tournent, orientés selon le tracé. Ils roulent en boucle tant que
// leur étape est active, et reviennent pendant la pause finale.

import { useEffect, useMemo, useRef, useState } from "react";

const N = 9;
// Pause en fin de parcours (en nombre d'étapes) : schéma complet, toutes les cartes fermées, avant
// que la section ne libère le scroll.
const PAUSE = 0.8;
// Segment de tracé dessiné à chaque étape (-1 = aucun) : 01, 02, Digesteur, Épandage, Épuration,
// Injection, Résidentiel, Industriels, Mobilité.
const SEG_OF_STEP = [0, 1, -1, 2, 3, 4, 5, 6, 7];
// Hauteur de scroll par étape (en vh) : 42 plutôt que les 85 du prototype, parcours plus rapide.
const STEP_VH = 42;
const SMOOTHING = 0.22;
const DIM_LEVEL = 0.22;
const TRACTOR_SPEED = 38; // unités SVG par seconde
const TRACTORS = [{ step: 0 }, { step: 3 }];

const GREEN = "#16a34a";
const GREEN_DARK = "#14532d";

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

// Profil de vitesse trapézoïdal : accélère, roule à vitesse constante, freine.
function trap(u: number) {
  const a = 0.18;
  const v = 1 / (1 - a);
  if (u <= 0) return 0;
  if (u >= 1) return 1;
  if (u < a) return (0.5 * v * u * u) / a;
  if (u < 1 - a) return 0.5 * v * a + v * (u - a);
  return 1 - (0.5 * v * (1 - u) * (1 - u)) / a;
}

// Tracés entre les nœuds (repère 1100×620).
const SEG_PATHS = [
  "M166,140 H480",
  "M166,330 H316 Q330,330 330,316 V154 Q330,140 344,140 H480",
  "M600,140 H854",
  "M540,201 V284",
  "M586,330 H854",
  "M900,376 V484",
  "M900,410 H594 Q580,410 580,424 V484",
  "M580,410 H274 Q260,410 260,424 V484",
];

// Routes (invisibles) suivies par les tracteurs : apport des intrants, puis épandage du digestat.
const TRACTOR_ROUTES = ["M236,140 H452", "M668,140 H826"];

interface NodeDef {
  key: string;
  label: string;
  left: number;
  top: number;
  icon: string;
  primary?: boolean;
}

// Pictogrammes au trait (repère 24×24) dessinés pour ce schéma.
const NODES: NodeDef[] = [
  {
    key: "n1", label: "Résidus agricoles", left: 10.91, top: 22.58,
    icon: "M12 22V3.5M12 8c-2.6 0-4-1.8-4-4 2.6 0 4 1.8 4 4zM12 8c2.6 0 4-1.8 4-4-2.6 0-4 1.8-4 4zM12 13c-2.6 0-4-1.8-4-4 2.6 0 4 1.8 4 4zM12 13c2.6 0 4-1.8 4-4-2.6 0-4 1.8-4 4zM12 18c-2.6 0-4-1.8-4-4 2.6 0 4 1.8 4 4zM12 18c2.6 0 4-1.8 4-4-2.6 0-4 1.8-4 4z",
  },
  { key: "n2", label: "Déchets ménagers", left: 10.91, top: 53.23, icon: "M4 6h16M9 6V3.5h6V6M6 6l1 14.5h10L18 6M10 10v7M14 10v7" },
  { key: "n3", label: "Digesteur", left: 49.09, top: 22.58, primary: true, icon: "M3 20.5h18M5 20.5V12h14v8.5M5 12a7 7 0 0 1 14 0M12 5V2.5h3M8.5 15.5h7" },
  { key: "n4", label: "Épandage du digestat", left: 81.82, top: 22.58, icon: "M3 20h18M6 23h12M12 20v-7M12 13c0-3-2.4-5.5-6.5-5.5 0 3 2.4 5.5 6.5 5.5zM12 11c0-3 2.4-5.5 6.5-5.5 0 3-2.4 5.5-6.5 5.5z" },
  { key: "n5", label: "Épuration du biogaz", left: 49.09, top: 53.23, icon: "M3.5 4h17l-6.5 7.5v6l-4 2.5v-8.5z" },
  { key: "n6", label: "Injection réseau", left: 81.82, top: 53.23, icon: "M2 14h20M2 19.5h20M12 14V9M8 9h8M5 14v5.5M19 14v5.5" },
  { key: "n7", label: "Résidentiel & tertiaire", left: 81.82, top: 85.48, icon: "M3 11l9-7 9 7M5 9.5V20.5h14V9.5M10 20.5v-5.5h4v5.5" },
  { key: "n8", label: "Industriels", left: 52.73, top: 85.48, icon: "M2.5 20.5h19M4 20.5V11l5 3v-3l5 3v-3l4 2.4V4h2.5v16.5M8 17.5h1.5M12.5 17.5H14" },
  { key: "n9", label: "Mobilité", left: 23.64, top: 85.48, icon: "M6 3h12a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zM4 11h16M7.5 21v-3M16.5 21v-3M7.5 14.5h1M15.5 14.5h1" },
];

interface CardDef {
  key: string;
  left: number;
  top: number;
  eyebrow: string;
  title: string;
  body: string;
  image: string;
}

const CARDS: CardDef[] = [
  {
    key: "c1", left: 17, top: 33, eyebrow: "Les intrants · 01", title: "Résidus agricoles",
    body: "Les intrants proviennent essentiellement d'effluents d'élevage (fumier, lisier, résidus de récoltes...), de cultures intermédiaires ou autres déchets agricoles (déchets verts, lactosérum etc.).",
    image: "/illus/intrants.svg",
  },
  {
    key: "c2", left: 36, top: 40, eyebrow: "Les intrants · 02", title: "Déchets des collectivités et des ménages",
    body: "Biodéchets triés à la source, déchets verts et restes de la restauration collective rejoignent la filière plutôt que l'enfouissement.",
    image: "/illus/dechets.svg",
  },
  {
    key: "c3", left: 57, top: 33, eyebrow: "La méthanisation · 03", title: "Le digesteur",
    body: "En l'absence d'oxygène, des bactéries dégradent la partie fermentescible des intrants pendant 30 à 60 jours. La réaction libère du biogaz et laisse un digestat.",
    image: "/illus/digesteur.svg",
  },
  {
    key: "c4", left: 57, top: 37, eyebrow: "Retour au sol · 04", title: "Épandage du digestat",
    body: "Le résidu de la digestion devient un fertilisant organique restitué aux sols agricoles : moins d'engrais de synthèse, un carbone qui reste sur le territoire.",
    image: "/illus/epandage.svg",
  },
  {
    key: "c5", left: 60, top: 37, eyebrow: "La méthanisation · 05", title: "Épuration du biogaz",
    body: "Le biogaz brut est débarrassé du CO₂, de l'eau et du soufre jusqu'à atteindre la qualité du gaz naturel : c'est le biométhane.",
    image: "/illus/epuration.svg",
  },
  {
    key: "c6", left: 16, top: 34, eyebrow: "La méthanisation · 06", title: "Injection dans le réseau gaz",
    body: "Odorisé, contrôlé et compté, le biométhane est injecté dans le réseau de distribution existant et acheminé comme n'importe quel gaz.",
    image: "/illus/injection.svg",
  },
  {
    key: "c7", left: 16, top: 30, eyebrow: "Les usages · 07", title: "Résidentiels et tertiaires",
    body: "Chauffage, eau chaude et cuisson : une énergie renouvelable livrée par le réseau existant, sans changer les équipements des bâtiments.",
    image: "/illus/residentiel.svg",
  },
  {
    key: "c8", left: 14, top: 10, eyebrow: "Les usages · 08", title: "Industriels",
    body: "Chaleur de process et vapeur haute température : le biométhane décarbone des usages difficiles à électrifier, sans rupture d'outil industriel.",
    image: "/illus/industriels.svg",
  },
  {
    key: "c9", left: 58, top: 4, eyebrow: "Les usages · 09", title: "Mobilité",
    body: "En bioGNV, il alimente bus, bennes à ordures et poids lourds, avec une empreinte carbone très inférieure à celle d'un carburant fossile.",
    image: "/illus/mobilite.svg",
  },
];

// Tracé de flamme asymétrique (repère 24×24), posé au-dessus des 3 nœuds d'usage.
const FLAME_PATH =
  "M12 23c-4.4 0-8-3.1-8-7.6 0-3 1.6-5.6 3.4-7.9C9.3 5.2 11 3 11 0c3.5 2.3 5.6 5.6 5.6 8.4 0 1.4-.3 2.6-1 3.6 1.2-.4 2.1-1.3 2.7-2.5 1.2 1.8 1.7 3.9 1.7 5.9 0 4.6-3.6 7.6-8 7.6z";

function FlameGlyph({ cx, opacity, delay }: { cx: number; opacity: number; delay: number }) {
  return (
    <g opacity={opacity}>
      <g transform={`translate(${cx - 17},442) scale(1.417)`}>
        <path className="metha-flame" d={FLAME_PATH} fill={GREEN} style={{ animationDelay: `${delay}s` }} />
      </g>
      <g transform={`translate(${cx - 8.5},459) scale(.708)`}>
        <path className="metha-flame" d={FLAME_PATH} fill="#bbf7d0" style={{ animationDelay: `${delay + 0.1}s` }} />
      </g>
    </g>
  );
}

// Roue de tracteur : data-wheel = rayon, data-cx/cy = centre de rotation (tourne avec la distance).
function Wheel({ r, cx, cy, hub, spoke }: { r: number; cx: number; cy: number; hub: number; spoke: string }) {
  return (
    <g data-wheel={r} data-cx={cx} data-cy={cy}>
      <circle cx={cx} cy={cy} r={r} fill="#1e293b" />
      <circle cx={cx} cy={cy} r={hub} fill="#e2e8f0" />
      <path d={spoke} stroke="#1e293b" strokeWidth={1.1} />
    </g>
  );
}

// Tracteur, avec une remorque (apport des intrants) ou une tonne à lisier (épandage).
function TractorGlyph({ index, trailer }: { index: number; trailer: "benne" | "tonne" }) {
  return (
    <g data-tractor={index} opacity={0}>
      <path d="M-18 -7H-28" stroke={GREEN_DARK} strokeWidth={2} />
      {trailer === "benne" ? (
        <>
          <path d="M-60 -22h32v13h-32z" fill="#bbf7d0" stroke={GREEN_DARK} strokeWidth={1.6} strokeLinejoin="round" />
          <path d="M-58 -22c4-7 24-7 28 0z" fill={GREEN_DARK} />
        </>
      ) : (
        <>
          <rect x={-62} y={-25} width={36} height={16} rx={8} fill="#bbf7d0" stroke={GREEN_DARK} strokeWidth={1.6} />
          <path d="M-62 -9h-4v-7" stroke={GREEN_DARK} strokeWidth={1.6} strokeLinecap="round" />
        </>
      )}
      <Wheel r={6} cx={-44} cy={-6} hub={2.6} spoke="M-46.6 -6h5.2" />
      <path d="M-18 -12h36v4h-36z" fill={GREEN_DARK} />
      <path d="M-2 -18h19a2 2 0 0 1 2 2v6H-2z" fill={GREEN} />
      <path d="M-18 -32h15v22h-15z" fill={GREEN} />
      <path d="M-15.5 -29h10v9h-10z" fill="#FFFFFF" />
      <path d="M-20 -34.5h19v2.5h-19z" fill={GREEN_DARK} />
      <path d="M9 -25h2v7h-2z" fill={GREEN_DARK} />
      <Wheel r={9} cx={-9} cy={-9} hub={4} spoke="M-13 -9h8M-9 -13v8" />
      <Wheel r={5.5} cx={13} cy={-5.5} hub={2.4} spoke="M10.6 -5.5h4.8" />
    </g>
  );
}

interface TractorState {
  step: number;
  g: SVGGElement;
  path: SVGPathElement;
  wheels: { el: Element; r: number; cx: string; cy: string }[];
  L: number;
  s: number;
  t: number;
  running: boolean;
  wait: number;
  alpha: number;
  ang: number | null;
}

export default function MethanisationScrollytelling() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const [prog, setProg] = useState(0);
  const [lens, setLens] = useState<number[]>([]);
  const curRef = useRef(0);
  const targetRef = useRef(0);

  useEffect(() => {
    const wrap = wrapRef.current;
    const svg = svgRef.current;
    if (!wrap || !svg) return;

    wrap.style.height = `${(N + PAUSE) * STEP_VH + 100}vh`;

    function measure() {
      if (!wrap) return;
      const r = wrap.getBoundingClientRect();
      const total = r.height - window.innerHeight;
      targetRef.current = total > 0 ? clamp(-r.top / total, 0, 1) : 0;
    }
    measure();
    curRef.current = targetRef.current;

    const tractors: TractorState[] = TRACTORS.map((cfg, k) => {
      const g = svg.querySelector<SVGGElement>(`[data-tractor="${k}"]`)!;
      const path = svg.querySelector<SVGPathElement>(`[data-route="${k}"]`)!;
      const wheels = Array.from(g.querySelectorAll("[data-wheel]")).map((w) => ({
        el: w,
        r: Number(w.getAttribute("data-wheel")),
        cx: w.getAttribute("data-cx")!,
        cy: w.getAttribute("data-cy")!,
      }));
      let L = 0;
      try {
        L = path.getTotalLength();
      } catch {
        // getTotalLength peut échouer avant le premier layout : tracteur ignoré.
      }
      return { step: cfg.step, g, path, wheels, L, s: 0, t: 0, running: false, wait: 0, alpha: 0, ang: null };
    });

    // Un trajet démarre quand le tracé de l'étape est dessiné, va jusqu'au bout, puis recommence
    // tant que l'étape est active (et pendant la pause finale).
    function drive(dt: number) {
      const T = curRef.current * (N + PAUSE);
      for (const t of tractors) {
        if (!t.L) continue;
        const r = T - t.step;
        const present = r >= 0.4;
        const eligible = r >= 0.55 && (r < 1.15 || T >= N);
        if (!t.running) {
          t.wait -= dt;
          if (eligible && t.wait <= 0) {
            t.running = true;
            t.t = 0;
            t.s = 0;
            t.ang = null;
          }
        }
        if (t.running) {
          t.t += dt;
          let u = t.t / (t.L / TRACTOR_SPEED);
          if (u >= 1) {
            u = 1;
            t.running = false;
            t.wait = 1.2;
          }
          t.s = t.L * trap(u);
        }
        t.alpha += ((present ? 1 : 0) - t.alpha) * Math.min(1, dt * 8);
        if (!present && t.alpha < 0.02) {
          t.running = false;
          t.s = 0;
          t.wait = 0;
        }
        const edge = clamp(Math.min(t.s / 22, (t.L - t.s) / 22), 0, 1);
        const op = (t.running ? edge : 0) * t.alpha;
        const p = t.path.getPointAtLength(t.s);
        const a = t.path.getPointAtLength(Math.max(0, t.s - 6));
        const b = t.path.getPointAtLength(Math.min(t.L, t.s + 6));
        const ang = (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI;
        t.ang = t.ang === null ? ang : t.ang + (ang - t.ang) * Math.min(1, dt * 10);
        t.g.setAttribute("transform", `translate(${p.x.toFixed(2)},${p.y.toFixed(2)}) rotate(${t.ang.toFixed(2)})`);
        t.g.setAttribute("opacity", op.toFixed(3));
        for (const w of t.wheels) {
          w.el.setAttribute("transform", `rotate(${((t.s / w.r) * 57.2958).toFixed(1)} ${w.cx} ${w.cy})`);
        }
      }
    }

    let raf = 0;
    let last = 0;
    function tick(now: number) {
      raf = requestAnimationFrame(tick);
      const d = targetRef.current - curRef.current;
      if (Math.abs(d) < 0.0003) curRef.current = targetRef.current;
      else curRef.current += d * SMOOTHING;
      setProg(curRef.current);
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 0;
      last = now;
      drive(dt);
    }
    raf = requestAnimationFrame(tick);

    window.addEventListener("scroll", measure, { passive: true });
    window.addEventListener("resize", measure);

    const lensTimer = setTimeout(() => {
      const nextLens = Array.from(svg.querySelectorAll<SVGPathElement>("path[data-seg]")).map((p) => {
        try {
          return p.getTotalLength() || 900;
        } catch {
          return 900;
        }
      });
      setLens(nextLens);
    }, 60);

    return () => {
      window.removeEventListener("scroll", measure);
      window.removeEventListener("resize", measure);
      cancelAnimationFrame(raf);
      clearTimeout(lensTimer);
    };
  }, []);

  const vals = useMemo(() => {
    const T = prog * (N + PAUSE);
    const fin = clamp((T - N) / 0.3, 0, 1);
    const raw = (i: number) => clamp(T - i, 0, 1);

    const no: Record<string, number> = {};
    const cp: Record<string, number> = {};
    const cy: Record<string, number> = {};
    for (let i = 0; i < N; i++) {
      const r = raw(i);
      const up = clamp(r / 0.3, 0, 1);
      const settle = clamp((r - 0.82) / 0.18, 0, 1);
      const o = DIM_LEVEL + (1 - DIM_LEVEL) * up - 0.22 * settle * up;
      no["n" + (i + 1)] = o + (1 - o) * fin;
      const cin = clamp((r - 0.08) / 0.16, 0, 1);
      const cout = clamp((1 - r) / 0.13, 0, 1);
      const c = Math.min(cin, cout);
      cp["c" + (i + 1)] = c;
      cy["c" + (i + 1)] = Math.round((1 - c) * 14);
    }

    const da: Record<string, number> = {};
    const dof: Record<string, number> = {};
    for (let k = 0; k < SEG_PATHS.length; k++) {
      const step = SEG_OF_STEP.indexOf(k);
      const p = easeOut(clamp(raw(step) / 0.55, 0, 1));
      const L = lens[k] || 900;
      da["s" + k] = L;
      dof["s" + k] = L * (1 - p);
    }

    // Fumée en sortie de l'épuration (étape 05), flammes aux usages (07, 08, 09).
    const rS = T - 4;
    const smOp = Math.max(Math.min(clamp(rS / 0.3, 0, 1), clamp((1.5 - rS) / 0.35, 0, 1)), fin);
    const fl = (i: number) => clamp((T - i - 0.45) / 0.35, 0, 1);

    const idx = clamp(Math.floor(T) + 1, 1, N);
    return {
      no, cp, cy, da, dof, smOp,
      fl7: fl(6), fl8: fl(7), fl9: fl(8),
      pct: Math.round(clamp(T / N, 0, 1) * 1000) / 10,
      stepLabel: `0${idx} / 0${N}`,
      ph: {
        p1: T < 2.2 || fin > 0 ? 1 : 0.35,
        p2: (T >= 2.2 && T < 6.2) || fin > 0 ? 1 : 0.35,
        p3: T >= 6.2 ? 1 : 0.35,
      },
    };
  }, [prog, lens]);

  return (
    <div style={{ background: "#FFFFFF", color: "#0f172a" }}>
      <style>{`
        @keyframes methaPuff { 0% { transform:translate(0,0) scale(.55); opacity:0 } 22% { opacity:.5 } 100% { transform:translate(-16px,-52px) scale(1.6); opacity:0 } }
        @keyframes methaFlick { 0%,100% { transform:scale(1,1) } 45% { transform:scale(.88,1.2) } 70% { transform:scale(1.06,.94) } }
        .metha-puff { animation: methaPuff 3.4s linear infinite; transform-box: fill-box; transform-origin: 50% 50%; }
        .metha-flame { animation: methaFlick .55s ease-in-out infinite; transform-box: fill-box; transform-origin: 50% 100%; }
      `}</style>

      <div ref={wrapRef} style={{ position: "relative", height: `${(N + PAUSE) * STEP_VH + 100}vh` }}>
        <div style={{ position: "sticky", top: 0, height: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", padding: "36px 4vw", boxSizing: "border-box" }}>
          <div
            style={{
              width: "100%",
              // Le diagramme (ratio 1100/620) doit toujours tenir dans la hauteur d'écran : on
              // réserve le padding du sticky (36px × 2) et le rail de progression (~70px) avant de
              // calculer la largeur max. Tout le contenu est en unités cqw et suit le conteneur.
              maxWidth: "min(1180px, calc((100vh - 142px) * (1100 / 620)))",
              margin: "0 auto",
              position: "relative",
              aspectRatio: "1100/620",
              containerType: "inline-size",
            } as React.CSSProperties}
          >
            <svg ref={svgRef} viewBox="0 0 1100 620" fill="none" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", overflow: "visible" }}>
              <g stroke="rgba(15,23,42,.12)" strokeWidth={2} strokeLinecap="round">
                {SEG_PATHS.map((d, i) => <path key={i} d={d} />)}
              </g>
              <g stroke={GREEN} strokeWidth={3} strokeLinecap="round">
                {SEG_PATHS.map((d, i) => (
                  <path key={i} data-seg={i} d={d} style={{ strokeDasharray: vals.da["s" + i], strokeDashoffset: vals.dof["s" + i] }} />
                ))}
              </g>

              {TRACTOR_ROUTES.map((d, i) => <path key={i} data-route={i} d={d} stroke="none" />)}
              <TractorGlyph index={0} trailer="benne" />
              <TractorGlyph index={1} trailer="tonne" />

              <g opacity={vals.smOp} fill="#94a3b8">
                <circle className="metha-puff" cx={604} cy={316} r={7} style={{ animationDelay: "0s" }} />
                <circle className="metha-puff" cx={612} cy={316} r={5} style={{ animationDelay: ".85s" }} />
                <circle className="metha-puff" cx={600} cy={316} r={9} style={{ animationDelay: "1.7s" }} />
                <circle className="metha-puff" cx={610} cy={316} r={6} style={{ animationDelay: "2.55s" }} />
              </g>

              <FlameGlyph cx={900} opacity={vals.fl7} delay={0} />
              <FlameGlyph cx={580} opacity={vals.fl8} delay={0.2} />
              <FlameGlyph cx={260} opacity={vals.fl9} delay={0.35} />
            </svg>

            {NODES.map((node, i) => {
              const size = node.primary ? 11 : 8.4;
              const badge = node.primary ? 3.6 : 3;
              return (
                <div
                  key={node.key}
                  style={{
                    position: "absolute",
                    left: `${node.left}%`,
                    top: `${node.top}%`,
                    width: node.primary ? "22%" : "18%",
                    transform: `translate(-50%,-${size / 2}cqw)`,
                    textAlign: "center",
                    opacity: vals.no[node.key],
                  }}
                >
                  <div
                    style={{
                      position: "relative",
                      width: `${size}cqw`,
                      height: `${size}cqw`,
                      margin: "0 auto",
                      boxSizing: "border-box",
                      borderRadius: "50%",
                      border: `2px solid ${GREEN}`,
                      background: node.primary ? "#f0fdf4" : "#FFFFFF",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke={GREEN}
                      strokeWidth={node.primary ? 1.5 : 1.6}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{ width: node.primary ? "6cqw" : "4.4cqw", height: node.primary ? "6cqw" : "4.4cqw" }}
                      aria-hidden="true"
                    >
                      <path d={node.icon} />
                    </svg>
                    <div
                      style={{
                        position: "absolute",
                        top: node.primary ? "-.3cqw" : "-.5cqw",
                        right: node.primary ? "-.3cqw" : "-.5cqw",
                        width: `${badge}cqw`,
                        height: `${badge}cqw`,
                        boxSizing: "border-box",
                        borderRadius: "50%",
                        background: GREEN,
                        border: `${node.primary ? 0.3 : 0.25}cqw solid #FFFFFF`,
                        color: "#FFFFFF",
                        fontSize: node.primary ? "1.5cqw" : "1.25cqw",
                        fontWeight: 700,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontVariantNumeric: "tabular-nums",
                      }}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </div>
                  </div>
                  <div
                    style={{
                      marginTop: "1cqw",
                      fontSize: node.primary ? "1.45cqw" : "1.2cqw",
                      lineHeight: 1.3,
                      color: GREEN_DARK,
                      fontWeight: node.primary ? 700 : 600,
                    }}
                  >
                    {node.label}
                  </div>
                </div>
              );
            })}

            {CARDS.map((card) => (
              <div
                key={card.key}
                style={{
                  position: "absolute",
                  left: `${card.left}%`,
                  top: `${card.top}%`,
                  width: "29%",
                  minWidth: 230,
                  boxSizing: "border-box",
                  pointerEvents: "none",
                  opacity: vals.cp[card.key],
                  transform: `translate(0,${vals.cy[card.key]}px)`,
                  background: "#FFFFFF",
                  border: "1px solid rgba(15,23,42,.12)",
                  borderRadius: 12,
                  padding: "1.8cqw",
                }}
              >
                <div style={{ background: "#f0fdf4", borderRadius: 8, padding: ".9cqw", marginBottom: "1.1cqw" }}>
                  <img src={card.image} alt="" style={{ display: "block", width: "100%", height: "7cqw", objectFit: "contain" }} />
                </div>
                <div style={{ fontSize: ".95cqw", letterSpacing: ".14em", textTransform: "uppercase", color: GREEN, fontWeight: 700, marginBottom: ".8cqw" }}>
                  {card.eyebrow}
                </div>
                <h3 style={{ margin: "0 0 .7cqw", fontWeight: 700, fontSize: "1.7cqw", lineHeight: 1.2, color: "#0f172a" }}>{card.title}</h3>
                <p style={{ margin: 0, fontSize: "1.15cqw", lineHeight: 1.55, color: "#475569", fontWeight: 400, textWrap: "pretty" } as React.CSSProperties}>
                  {card.body}
                </p>
              </div>
            ))}
          </div>

          <div style={{ width: "100%", maxWidth: 1180, margin: "28px auto 0", display: "flex", alignItems: "center", gap: 24 }}>
            <div style={{ fontSize: 13, letterSpacing: ".1em", color: "#475569", minWidth: 56, fontVariantNumeric: "tabular-nums", fontWeight: 600 }}>
              {vals.stepLabel}
            </div>
            <div style={{ flex: 1, height: 2, background: "rgba(15,23,42,.10)", borderRadius: 2, position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, background: GREEN, borderRadius: 2, width: `${vals.pct}%` }} />
            </div>
            <div style={{ display: "flex", gap: 22, fontSize: 12, letterSpacing: ".14em", textTransform: "uppercase", fontWeight: 700, color: GREEN }}>
              <span style={{ opacity: vals.ph.p1 }}>Intrants</span>
              <span style={{ opacity: vals.ph.p2 }}>Méthanisation</span>
              <span style={{ opacity: vals.ph.p3 }}>Usages</span>
            </div>
          </div>
        </div>
      </div>

      <p style={{ margin: "24px auto 0", maxWidth: "80ch", fontSize: 14, lineHeight: 1.7, color: "#64748b", fontWeight: 400 }}>
        * La méthanisation est la dégradation de la partie fermentescible des intrants, en l'absence d'oxygène, pour produire du biogaz.
      </p>
    </div>
  );
}
