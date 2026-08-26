// Scrollytelling du cycle de méthanisation (10 étapes : intrants → digesteur → épandage /
// épuration → usages), porté depuis un prototype Claude Design (fichier .dc.html fourni par le
// client). La logique de progression (mesure de scroll, easing, dasharray/dashoffset des tracés,
// apparition des cartes, tracteurs qui suivent les chemins SVG, fumée, flammes) reproduit fidèlement
// le script du prototype ; seule l'intégration (React + refs + RAF) a été adaptée au site.
//
// N = 10 étapes, réparties sur 9 segments de tracé (le digesteur, étape 3, n'a pas de segment
// entrant propre : SEG_OF_STEP mappe chaque segment de tracé à l'étape qui le déclenche).

import { useEffect, useMemo, useRef, useState } from "react";

const N = 10;
const SEG_OF_STEP = [0, 1, 2, -1, 3, 4, 5, 6, 7, 8];
const STEP_VH = 85;
const SMOOTHING = 0.16;
const DIM_LEVEL = 0.22;
// Pause en fin de parcours (en vh de scroll supplémentaire) pendant laquelle le diagramme reste
// figé, complet et sans aucune popup à l'écran, avant que la section ne libère le scroll normal —
// sans ça, dès que la dernière carte a fini de s'effacer (prog=1) le sticky se libère
// immédiatement, sans laisser le temps de voir le schéma dans son ensemble.
const END_PAUSE_VH = 60;

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

interface NodeDef {
  key: string;
  label: string;
  left: number;
  top: number;
  width: number;
  size: number;
  fontSize: number;
  primary?: boolean;
}

const NODES: NodeDef[] = [
  { key: "n1", label: "Résidus agricoles", left: 10.91, top: 17.74, width: 18, size: 8.4, fontSize: 3.4 },
  { key: "n2", label: "Déchets ménagers", left: 10.91, top: 50, width: 18, size: 8.4, fontSize: 3.4 },
  { key: "n3", label: "Boues d'épuration", left: 10.91, top: 82.26, width: 18, size: 8.4, fontSize: 3.4 },
  { key: "n4", label: "Digesteur", left: 49.09, top: 22.58, width: 22, size: 11, fontSize: 4.4, primary: true },
  { key: "n5", label: "Épandage du digestat", left: 84.55, top: 22.58, width: 18, size: 8.4, fontSize: 3.4 },
  { key: "n6", label: "Épuration du biogaz", left: 49.09, top: 53.23, width: 18, size: 8.4, fontSize: 3.4 },
  { key: "n7", label: "Injection réseau", left: 81.82, top: 53.23, width: 18, size: 8.4, fontSize: 3.4 },
  { key: "n8", label: "Résidentiel & tertiaire", left: 78.18, top: 85.48, width: 18, size: 8.4, fontSize: 3.4 },
  { key: "n9", label: "Industriels", left: 56.36, top: 85.48, width: 18, size: 8.4, fontSize: 3.4 },
  { key: "n10", label: "Mobilité", left: 34.55, top: 85.48, width: 18, size: 8.4, fontSize: 3.4 },
];

interface CardDef {
  key: string;
  left: number;
  top: number;
  accent: string;
  eyebrow: string;
  eyebrowColor: string;
  title: string;
  body: string;
  image: string;
}

const CARDS: CardDef[] = [
  {
    key: "c1", left: 20, top: 20, accent: "#65a30d", eyebrowColor: "#4d7c0f",
    eyebrow: "Les intrants · 01", title: "Résidus de l'agriculture et de l'agro-alimentaire",
    body: "Effluents d'élevage, résidus de cultures et coproduits industriels sont collectés dans un rayon court autour de l'unité de méthanisation.",
    image: "/illus/intrants.svg",
  },
  {
    key: "c2", left: 20, top: 36, accent: "#65a30d", eyebrowColor: "#4d7c0f",
    eyebrow: "Les intrants · 02", title: "Déchets des collectivités et des ménages",
    body: "Biodéchets triés à la source, déchets verts et restes de la restauration collective rejoignent la filière plutôt que l'enfouissement.",
    image: "/illus/dechets.svg",
  },
  {
    key: "c3", left: 20, top: 52, accent: "#65a30d", eyebrowColor: "#4d7c0f",
    eyebrow: "Les intrants · 03", title: "Boues de stations d'épuration",
    body: "Les boues issues du traitement des eaux usées apportent une matière fermentescible disponible toute l'année, au plus près des villes.",
    image: "/illus/boues.svg",
  },
  {
    key: "c4", left: 54, top: 30, accent: "#16a34a", eyebrowColor: "#16a34a",
    eyebrow: "La méthanisation · 04", title: "Le digesteur",
    body: "En l'absence d'oxygène, des bactéries dégradent la partie fermentescible des intrants pendant 30 à 60 jours. La réaction libère du biogaz et laisse un digestat.",
    image: "/illus/digesteur.svg",
  },
  {
    key: "c5", left: 57, top: 20, accent: "#16a34a", eyebrowColor: "#16a34a",
    eyebrow: "Retour au sol · 05", title: "Épandage du digestat",
    body: "Le résidu de la digestion devient un fertilisant organique restitué aux sols agricoles : moins d'engrais de synthèse, un carbone qui reste sur le territoire.",
    image: "/illus/epandage.svg",
  },
  {
    key: "c6", left: 16, top: 24, accent: "#16a34a", eyebrowColor: "#16a34a",
    eyebrow: "La méthanisation · 06", title: "Épuration du biogaz",
    body: "Le biogaz brut est débarrassé du CO₂, de l'eau et du soufre jusqu'à atteindre la qualité du gaz naturel : c'est le biométhane.",
    image: "/illus/epuration.svg",
  },
  {
    key: "c7", left: 48, top: 62, accent: "#16a34a", eyebrowColor: "#16a34a",
    eyebrow: "La méthanisation · 07", title: "Injection dans le réseau gaz",
    body: "Odorisé, contrôlé et compté, le biométhane est injecté dans le réseau de distribution existant et acheminé comme n'importe quel gaz.",
    image: "/illus/injection.svg",
  },
  {
    key: "c8", left: 68, top: 34, accent: "#16a34a", eyebrowColor: "#16a34a",
    eyebrow: "Les usages · 08", title: "Résidentiels et tertiaires",
    body: "Chauffage, eau chaude et cuisson : une énergie renouvelable livrée par le réseau existant, sans changer les équipements des bâtiments.",
    image: "/illus/residentiel.svg",
  },
  {
    key: "c9", left: 38, top: 34, accent: "#16a34a", eyebrowColor: "#16a34a",
    eyebrow: "Les usages · 09", title: "Industriels",
    body: "Chaleur de process et vapeur haute température : le biométhane décarbone des usages difficiles à électrifier, sans rupture d'outil industriel.",
    image: "/illus/industriels.svg",
  },
  {
    key: "c10", left: 14, top: 36, accent: "#16a34a", eyebrowColor: "#16a34a",
    eyebrow: "Les usages · 10", title: "Mobilité",
    body: "En bioGNV, il alimente bus, bennes à ordures et poids lourds, avec une empreinte carbone très inférieure à celle d'un carburant fossile.",
    image: "/illus/mobilite.svg",
  },
];

const BG_PATHS = [
  "M170,110 H236 Q250,110 250,124 V126 Q250,140 264,140 H484",
  "M170,310 H206 Q220,310 220,296 V154 Q220,140 234,140 H484",
  "M170,510 H176 Q190,510 190,496 V154 Q190,140 204,140 H484",
  "M596,140 H884",
  "M540,196 V284",
  "M586,330 H854",
  "M900,376 V450 Q900,464 886,464 H394 Q380,464 380,478 V484",
  "M620,464 V484",
  "M860,464 V484",
];

const SEG_COLORS = ["#65a30d", "#65a30d", "#65a30d", "#16a34a", "#16a34a", "#16a34a", "#16a34a", "#16a34a", "#16a34a"];

// Tracé de flamme asymétrique (repère 24×24) — un disque + pointe symétrique se lit comme une
// goutte d'eau, celui-ci a une silhouette dissymétrique qui se lit comme une flamme.
const FLAME_PATH =
  "M12 23c-4.4 0-8-3.1-8-7.6 0-3 1.6-5.6 3.4-7.9C9.3 5.2 11 3 11 0c3.5 2.3 5.6 5.6 5.6 8.4 0 1.4-.3 2.6-1 3.6 1.2-.4 2.1-1.3 2.7-2.5 1.2 1.8 1.7 3.9 1.7 5.9 0 4.6-3.6 7.6-8 7.6z";

// Flamme aux points d'usage (08/09/10) : silhouette + cœur clair, positionnés pour que la base
// (y≈460) reste sous le bord des cercles de nœud (y≈468) plutôt que d'être rognée par eux.
function FlameGlyph({ cx, opacity, delay }: { cx: number; opacity: number; delay: number }) {
  return (
    <g opacity={opacity}>
      <g transform={`translate(${cx - 17},426) scale(1.417)`}>
        <path className="metha-flame" d={FLAME_PATH} fill="#16a34a" style={{ animationDelay: `${delay}s` }} />
      </g>
      <g transform={`translate(${cx - 8.5},443) scale(.708)`}>
        <path className="metha-flame" d={FLAME_PATH} fill="#bbf7d0" style={{ animationDelay: `${delay + 0.1}s` }} />
      </g>
    </g>
  );
}

// Silhouette du tracteur (mêmes chemins que le prototype), réutilisée pour les deux tracteurs animés.
function TractorGlyph() {
  return (
    <>
      <path d="M-17 -3h14v11h-14z" fill="#65a30d" />
      <path d="M-4 2h17v6H-4z" fill="#65a30d" />
      <path d="M-15 -13h10v10h-10z" fill="#FFFFFF" stroke="#0f172a" strokeWidth={1.6} />
      <path d="M13 0h3v8h-3z" fill="#4d7c0f" />
      <circle cx={-10} cy={9} r={8.5} fill="#1e293b" />
      <circle cx={-10} cy={9} r={3.4} fill="#e2e8f0" />
      <circle cx={13} cy={11} r={5.6} fill="#1e293b" />
      <circle cx={13} cy={11} r={2.2} fill="#e2e8f0" />
    </>
  );
}

export default function MethanisationScrollytelling() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const seg2Ref = useRef<SVGPathElement | null>(null);
  const seg3Ref = useRef<SVGPathElement | null>(null);

  const [prog, setProg] = useState(0);
  const [lens, setLens] = useState<number[]>([]);
  const curRef = useRef(0);
  const targetRef = useRef(0);
  const rafRef = useRef<number>();

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;

    wrap.style.height = `${N * STEP_VH + 100 + END_PAUSE_VH}vh`;

    function measure() {
      if (!wrap) return;
      const r = wrap.getBoundingClientRect();
      const vh = window.innerHeight;
      // La pause finale (END_PAUSE_VH) est retirée du dénominateur : prog atteint 1 avant que le
      // scroll disponible ne soit épuisé, et reste bloqué à 1 (clamp) pendant les vh restants —
      // le diagramme reste donc figé, complet, sans popup, tant que le sticky ne s'est pas libéré.
      const total = r.height - vh - (END_PAUSE_VH / 100) * vh;
      targetRef.current = total > 0 ? clamp(-r.top / total, 0, 1) : 0;
    }

    measure();
    curRef.current = targetRef.current;

    function tick() {
      rafRef.current = requestAnimationFrame(tick);
      const d = targetRef.current - curRef.current;
      if (Math.abs(d) < 0.0003) curRef.current = targetRef.current;
      else curRef.current += d * SMOOTHING;
      setProg(curRef.current);
    }
    rafRef.current = requestAnimationFrame(tick);

    window.addEventListener("scroll", measure, { passive: true });
    window.addEventListener("resize", measure);

    const t = setTimeout(() => {
      const svg = svgRef.current;
      if (!svg) return;
      seg2Ref.current = svg.querySelector('path[data-seg="2"]');
      seg3Ref.current = svg.querySelector('path[data-seg="3"]');
      const nextLens = Array.prototype.map.call(svg.querySelectorAll("path[data-seg]"), (p: SVGPathElement) => {
        try {
          return p.getTotalLength() || 900;
        } catch {
          return 900;
        }
      }) as number[];
      setLens(nextLens);
    }, 60);

    return () => {
      window.removeEventListener("scroll", measure);
      window.removeEventListener("resize", measure);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      clearTimeout(t);
    };
  }, []);

  const vals = useMemo(() => {
    const raw = (i: number) => clamp(prog * N - i, 0, 1);

    const no: Record<string, number> = {};
    const cp: Record<string, number> = {};
    const cy: Record<string, number> = {};
    for (let i = 0; i < N; i++) {
      const r = raw(i);
      const up = clamp(r / 0.3, 0, 1);
      const settle = i === N - 1 ? 0 : clamp((r - 0.82) / 0.18, 0, 1);
      no["n" + (i + 1)] = DIM_LEVEL + (1 - DIM_LEVEL) * up - 0.22 * settle * up;
      const cin = clamp((r - 0.08) / 0.16, 0, 1);
      const cout = clamp((1 - r) / 0.13, 0, 1);
      const c = Math.min(cin, cout);
      cp["c" + (i + 1)] = c;
      cy["c" + (i + 1)] = Math.round((1 - c) * 14);
    }

    const da: Record<string, number> = {};
    const dof: Record<string, number> = {};
    for (let k = 0; k < 9; k++) {
      const step = SEG_OF_STEP.indexOf(k);
      const p = easeOut(clamp(raw(step) / 0.55, 0, 1));
      const L = lens[k] || 900;
      da["s" + k] = L;
      dof["s" + k] = L * (1 - p);
    }

    // Tracteur 1 : résidus agricoles -> digesteur (segment 2, ligne d'arrivée horizontale seulement).
    const rT = prog * N - 2;
    const pT = easeOut(clamp(rT / 0.55, 0, 1));
    let trTx = "translate(204,128)";
    let trOp = 0;
    const seg2 = seg2Ref.current;
    if (seg2) {
      try {
        const L = seg2.getTotalLength();
        const pt = seg2.getPointAtLength(L * pT);
        const tx = pt.y < 150 ? Math.min(pt.x, 386) : pt.x;
        trTx = `translate(${Math.round(tx * 10) / 10},${Math.round((pt.y - 12) * 10) / 10})`;
        if (pt.y < 150) trOp = Math.min(clamp((pt.x - 206) / 24, 0, 1), clamp((1.25 - rT) / 0.25, 0, 1));
      } catch {
        // getTotalLength peut échouer avant le premier layout ; on garde la position par défaut.
      }
    }

    // Tracteur 2 : digesteur -> épandage (segment 3).
    const rT2 = prog * N - 4;
    const pT2 = easeOut(clamp(rT2 / 0.55, 0, 1));
    let tr2Tx = "translate(600,128)";
    let tr2Op = 0;
    const seg3 = seg3Ref.current;
    if (seg3) {
      try {
        const L3 = seg3.getTotalLength();
        const p3 = seg3.getPointAtLength(L3 * pT2);
        tr2Tx = `translate(${Math.round(Math.min(p3.x, 798) * 10) / 10},${Math.round((p3.y - 12) * 10) / 10})`;
        tr2Op = Math.min(clamp((p3.x - 604) / 24, 0, 1), clamp((1.25 - rT2) / 0.25, 0, 1));
      } catch {
        // idem
      }
    }

    // Fumée en sortie de l'épuration (étape 06).
    const rS = prog * N - 5;
    const smOp = Math.min(clamp(rS / 0.3, 0, 1), clamp((1.5 - rS) / 0.35, 0, 1));

    // Flammes aux usages (08, 09, 10).
    const fl = (i: number) => clamp((prog * N - i - 0.45) / 0.35, 0, 1);

    const idx = Math.min(N, Math.floor(prog * N) + (prog >= 1 ? 0 : 1));
    const t = prog * N;

    return {
      no, cp, cy, da, dof, trTx, trOp, tr2Tx, tr2Op, smOp,
      fl8: fl(7), fl9: fl(8), fl10: fl(9),
      pct: Math.round(prog * 1000) / 10,
      stepLabel: ("0" + Math.max(1, idx)).slice(-2) + " / 10",
      ph: {
        p1: t < 3.2 ? 1 : 0.35,
        p2: t >= 3.2 && t < 7.2 ? 1 : 0.35,
        p3: t >= 7.2 ? 1 : 0.35,
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

      <div ref={wrapRef} style={{ position: "relative", height: "950vh" }}>
        <div style={{ position: "sticky", top: 0, height: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", padding: "36px 4vw", boxSizing: "border-box" }}>
          <div
            style={{
              width: "100%",
              // Le diagramme (ratio 1100/620) doit toujours tenir entièrement dans la hauteur de
              // viewport disponible pour le sticky, sinon il déborde et est rogné sur un écran bas
              // (laptop 16:9 ~700-800px de haut) — une largeur calée uniquement sur max-width ne
              // garantit pas ça puisque hauteur = largeur / ratio peut dépasser le viewport. On
              // réserve donc explicitement l'espace du padding sticky (36px * 2 — le nœud 05, très
              // proche du haut du diagramme à top:14.52%, a besoin de cette marge pour ne pas être
              // rogné par le bord du conteneur) et du rail de progression sous le diagramme (~70px,
              // marge + texte) avant de calculer la largeur max à partir de la hauteur restante ;
              // tout le contenu (cercles, texte, cartes) est en unités cqw et rétrécit avec le
              // conteneur.
              maxWidth: "min(1180px, calc((100vh - 142px) * (1100 / 620)))",
              margin: "0 auto",
              position: "relative",
              aspectRatio: "1100/620",
              containerType: "inline-size",
            } as React.CSSProperties}
          >

            <svg ref={svgRef} viewBox="0 0 1100 620" fill="none" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", overflow: "visible" }}>
              <g stroke="rgba(15,23,42,.13)" strokeWidth={2} strokeLinecap="round">
                {BG_PATHS.map((d, i) => <path key={i} d={d} />)}
              </g>
              <g strokeWidth={3} strokeLinecap="round">
                {BG_PATHS.map((d, i) => (
                  <path
                    key={i}
                    data-seg={i}
                    stroke={SEG_COLORS[i]}
                    d={d}
                    style={{ strokeDasharray: vals.da["s" + i], strokeDashoffset: vals.dof["s" + i] }}
                  />
                ))}
              </g>

              <g transform={vals.trTx} opacity={vals.trOp}>
                <TractorGlyph />
              </g>
              <g transform={vals.tr2Tx} opacity={vals.tr2Op}>
                <TractorGlyph />
                <path d="M-24 4h6v6h-6z" fill="#4d7c0f" />
              </g>

              <g opacity={vals.smOp} fill="#94a3b8">
                <circle className="metha-puff" cx={604} cy={316} r={7} style={{ animationDelay: "0s" }} />
                <circle className="metha-puff" cx={612} cy={316} r={5} style={{ animationDelay: ".85s" }} />
                <circle className="metha-puff" cx={600} cy={316} r={9} style={{ animationDelay: "1.7s" }} />
                <circle className="metha-puff" cx={610} cy={316} r={6} style={{ animationDelay: "2.55s" }} />
              </g>

              <FlameGlyph cx={860} opacity={vals.fl8} delay={0} />
              <FlameGlyph cx={620} opacity={vals.fl9} delay={0.2} />
              <FlameGlyph cx={380} opacity={vals.fl10} delay={0.35} />
            </svg>

            {NODES.map((node) => (
              <div
                key={node.key}
                style={{
                  position: "absolute",
                  left: `${node.left}%`,
                  top: `${node.top}%`,
                  width: `${node.width}%`,
                  transform: "translate(-50%,-50%)",
                  textAlign: "center",
                  opacity: vals.no[node.key],
                }}
              >
                <div
                  style={{
                    position: "relative",
                    width: `${node.size}cqw`,
                    height: `${node.size}cqw`,
                    margin: "0 auto",
                    borderRadius: "50%",
                    border: `1.5px solid ${node.primary ? "rgba(22,163,74,.55)" : "rgba(101,163,13,.45)"}`,
                    background: node.primary ? "#f0fdf4" : "#FFFFFF",
                    boxShadow: node.primary ? "0 10px 30px rgba(15,23,42,.10)" : "0 6px 18px rgba(15,23,42,.07)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <div
                    style={{
                      fontSize: `${node.fontSize}cqw`,
                      fontWeight: 600,
                      lineHeight: 1,
                      color: node.primary ? "#16a34a" : "#4d7c0f",
                      fontVariantNumeric: "tabular-nums",
                      letterSpacing: "-.02em",
                    }}
                  >
                    {node.key.slice(1).padStart(2, "0")}
                  </div>
                </div>
                <div
                  style={{
                    marginTop: "1cqw",
                    fontSize: node.primary ? "1.4cqw" : "1.15cqw",
                    lineHeight: node.primary ? 1.3 : 1.35,
                    color: node.primary ? "#0f172a" : "#334155",
                    fontWeight: node.primary ? 600 : 500,
                  }}
                >
                  {node.label}
                </div>
              </div>
            ))}

            {CARDS.map((card) => (
              <div
                key={card.key}
                style={{
                  position: "absolute",
                  left: `${card.left}%`,
                  top: `${card.top}%`,
                  width: "29%",
                  minWidth: 190,
                  maxWidth: 300,
                  pointerEvents: "none",
                  opacity: vals.cp[card.key],
                  transform: `translate(0,${vals.cy[card.key]}px)`,
                  background: "#FFFFFF",
                  border: "1px solid rgba(15,23,42,.10)",
                  borderLeft: `3px solid ${card.accent}`,
                  borderRadius: 14,
                  padding: "1.8cqw",
                  boxShadow: "0 20px 44px rgba(15,23,42,.13)",
                } as React.CSSProperties}
              >
                <div style={{ background: "#f0fdf4", borderRadius: 10, padding: ".9cqw", marginBottom: "1.1cqw" }}>
                  <img src={card.image} alt="" style={{ display: "block", width: "100%", height: "8cqw", objectFit: "contain" }} />
                </div>
                <div style={{ fontSize: ".95cqw", letterSpacing: ".16em", textTransform: "uppercase", color: card.eyebrowColor, fontWeight: 600, marginBottom: ".9cqw" }}>
                  {card.eyebrow}
                </div>
                <h3 style={{ margin: "0 0 .7cqw", fontWeight: 600, fontSize: "1.7cqw", lineHeight: 1.2, color: "#0f172a" }}>
                  {card.title}
                </h3>
                <p style={{ margin: 0, fontSize: "1.15cqw", lineHeight: 1.55, color: "#475569", fontWeight: 400, textWrap: "pretty" } as React.CSSProperties}>
                  {card.body}
                </p>
              </div>
            ))}
          </div>

          <div style={{ width: "100%", maxWidth: 1180, margin: "28px auto 0", display: "flex", alignItems: "center", gap: 24 }}>
            <div style={{ fontSize: 13, letterSpacing: ".1em", color: "#475569", minWidth: 56, fontVariantNumeric: "tabular-nums" }}>
              {vals.stepLabel}
            </div>
            <div style={{ flex: 1, height: 2, background: "rgba(15,23,42,.10)", borderRadius: 2, position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, background: "linear-gradient(90deg,#65a30d,#16a34a)", borderRadius: 2, width: `${vals.pct}%` }} />
            </div>
            <div style={{ display: "flex", gap: 22, fontSize: 12, letterSpacing: ".14em", textTransform: "uppercase", fontWeight: 600 }}>
              <span style={{ color: "#4d7c0f", opacity: vals.ph.p1 }}>Intrants</span>
              <span style={{ color: "#16a34a", opacity: vals.ph.p2 }}>Méthanisation</span>
              <span style={{ color: "#16a34a", opacity: vals.ph.p3 }}>Usages</span>
            </div>
          </div>
        </div>
      </div>

      <p style={{ margin: "24px auto 0", maxWidth: "80ch", fontSize: 14, lineHeight: 1.7, color: "#64748b" }}>
        * La méthanisation est la dégradation de la partie fermentescible des intrants, en l'absence d'oxygène, pour produire du biogaz.
      </p>
    </div>
  );
}
