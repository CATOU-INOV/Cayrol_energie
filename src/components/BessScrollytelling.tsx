// Schéma de fonctionnement d'un BESS animé au scroll (retour client : "schéma de fonctionnement
// animé au scroll", même DA que le schéma de méthanisation) : 5 étapes — production, stockage,
// conversion, restitution au pic de consommation, régulation du réseau. Le schéma reste épinglé à
// l'écran ; chaque étape trace ses liaisons, allume ses nœuds et affiche une carte. La jauge de la
// batterie se remplit puis se vide, des particules d'énergie circulent sur les liaisons actives.
// Mêmes principes que MethanisationScrollytelling (progression lissée, pause finale, rail).
//
// TODO-CONTENT : textes des cartes rédigés à partir des atouts transmis par le client (stockage aux
// pics de production, restitution aux pics de consommation, soutien/délestage du réseau), à faire
// valider.

import { useEffect, useMemo, useRef, useState } from "react";

const N = 5;
const PAUSE = 0.8;
const STEP_VH = 42;
const SMOOTHING = 0.22;
const DIM_LEVEL = 0.22;

const RED = "#dc2626";
const RED_DARK = "#991b1b";

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

// Liaisons (repère 1100×560) et étape qui les trace.
const SEGMENTS = [
  { d: "M196,280 H400", step: 0 }, // production → batteries
  { d: "M550,280 H714", step: 2 }, // batteries → conversion
  { d: "M806,280 H880 Q900,280 900,260 V180 Q900,160 920,160 H954", step: 2 }, // conversion → réseau
  { d: "M1000,248 V354", step: 3 }, // réseau → consommateurs (sous le libellé du réseau)
];

interface NodeDef {
  key: string;
  label: string;
  cx: number;
  cy: number;
  step: number;
  icon: string;
}

// Pictogrammes au trait (repère 24×24).
const NODES: NodeDef[] = [
  {
    key: "prod", label: "Production renouvelable", cx: 150, cy: 280, step: 0,
    icon: "M12 2v2M4.9 4.9l1.4 1.4M2 12h2M19.1 4.9l-1.4 1.4M22 12h-2M8 12a4 4 0 0 1 8 0M3 22l3-7h12l3 7zM9.5 15l-1 7M14.5 15l1 7M4.5 18.5h15",
  },
  { key: "conv", label: "Conversion", cx: 760, cy: 280, step: 2, icon: "M3 4h18v16H3zM6.5 9.5h4M13.5 13c1-1.2 2-1.2 3 0s2 1.2 3 0" },
  { key: "grid", label: "Réseau électrique", cx: 1000, cy: 160, step: 3, icon: "M12 2 7 22M12 2l5 20M8.5 15h7M9.8 9.5h4.4M5 6h14M7 6l5 4 5-4" },
  { key: "conso", label: "Consommateurs", cx: 1000, cy: 400, step: 3, icon: "M3 11l9-7 9 7M5 9.5V20.5h14V9.5M10 20.5v-5.5h4v5.5" },
];

const CARDS = [
  {
    eyebrow: "Production · 01",
    title: "La production renouvelable",
    body: "En milieu de journée, les centrales solaires et hydroélectriques produisent souvent plus que ce que le territoire consomme.",
  },
  {
    eyebrow: "Stockage · 02",
    title: "Les batteries se chargent",
    body: "Plutôt que d'être perdue, l'électricité excédentaire est stockée dans les batteries du BESS, installées dans des conteneurs aménagés.",
  },
  {
    eyebrow: "Conversion · 03",
    title: "Conversion et transformation",
    body: "Des onduleurs convertissent le courant continu des batteries en courant alternatif, et les postes de transformation l'élèvent à la tension du réseau.",
  },
  {
    eyebrow: "Restitution · 04",
    title: "Restitution au pic de consommation",
    body: "En fin de journée, quand la demande est la plus forte, les batteries restituent l'énergie stockée au réseau et aux consommateurs.",
  },
  {
    eyebrow: "Régulation · 05",
    title: "Un réseau plus stable",
    body: "Le BESS soutient le réseau lors des fortes demandes et le déleste lors des fortes productions, pour une fréquence stable.",
  },
];

// Batterie : corps, borne et zone de remplissage (repère 1100×560).
const BATT = { x: 400, y: 235, w: 140, h: 90, pad: 8 };

// Onde de fréquence au-dessus du réseau (étape 05) : amplitude qui se stabilise.
function wavePath(amplitude: number) {
  const x0 = 820;
  const x1 = 1080;
  let d = "";
  for (let x = x0; x <= x1; x += 5) {
    const y = 70 + amplitude * Math.sin(((x - x0) / (x1 - x0)) * Math.PI * 6);
    d += `${x === x0 ? "M" : "L"}${x},${y.toFixed(1)} `;
  }
  return d;
}

// Particules d'énergie qui parcourent une liaison en boucle (SVG animateMotion, sans JS).
function Particles({ d, dur, count = 3 }: { d: string; dur: number; count?: number }) {
  return (
    <>
      {Array.from({ length: count }, (_, k) => (
        <circle key={k} r={4.5} fill={RED}>
          <animateMotion dur={`${dur}s`} begin={`${(k * dur) / count}s`} repeatCount="indefinite" path={d} />
        </circle>
      ))}
    </>
  );
}

export default function BessScrollytelling() {
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

    function measure() {
      if (!wrap) return;
      const r = wrap.getBoundingClientRect();
      const total = r.height - window.innerHeight;
      targetRef.current = total > 0 ? clamp(-r.top / total, 0, 1) : 0;
    }
    measure();
    curRef.current = targetRef.current;

    let raf = 0;
    function tick() {
      raf = requestAnimationFrame(tick);
      const d = targetRef.current - curRef.current;
      if (Math.abs(d) < 0.0003) curRef.current = targetRef.current;
      else curRef.current += d * SMOOTHING;
      setProg(curRef.current);
    }
    raf = requestAnimationFrame(tick);

    window.addEventListener("scroll", measure, { passive: true });
    window.addEventListener("resize", measure);
    setLens(
      Array.from(svg.querySelectorAll<SVGPathElement>("path[data-seg]")).map((p) => {
        try {
          return p.getTotalLength() || 600;
        } catch {
          return 600;
        }
      }),
    );

    return () => {
      window.removeEventListener("scroll", measure);
      window.removeEventListener("resize", measure);
      cancelAnimationFrame(raf);
    };
  }, []);

  const vals = useMemo(() => {
    const T = prog * (N + PAUSE);
    const fin = clamp((T - N) / 0.3, 0, 1);
    const raw = (i: number) => clamp(T - i, 0, 1);
    const lit = (step: number) => {
      const up = clamp(raw(step) / 0.3, 0, 1);
      const o = DIM_LEVEL + (1 - DIM_LEVEL) * up;
      return o + (1 - o) * fin;
    };

    const seg = SEGMENTS.map((s, k) => {
      const L = lens[k] || 600;
      const p = Math.max(easeOut(clamp(raw(s.step) / 0.55, 0, 1)), fin);
      return { L, offset: L * (1 - p) };
    });

    // Niveau de charge : se remplit à l'étape 02, se vide à l'étape 04.
    let level = 0.12;
    if (T >= 1) level = lerp(0.12, 1, easeOut(clamp(T - 1, 0, 1)));
    if (T >= 3) level = lerp(1, 0.3, easeOut(clamp(T - 3, 0, 1)));
    if (fin > 0) level = lerp(level, 0.6, fin);

    const chargeOp = Math.min(clamp((T - 0.4) / 0.3, 0, 1), clamp((2.3 - T) / 0.3, 0, 1));
    const dischargeOp = Math.min(clamp((T - 3.2) / 0.3, 0, 1), clamp((4.3 - T) / 0.3, 0, 1));
    const regP = clamp(T - 4, 0, 1);
    const regOp = Math.max(clamp(regP / 0.3, 0, 1), fin);

    const cards = CARDS.map((_, i) => {
      const r = raw(i);
      const c = Math.min(clamp((r - 0.08) / 0.16, 0, 1), clamp((1 - r) / 0.13, 0, 1));
      return { op: c, y: Math.round((1 - c) * 14) };
    });

    const idx = clamp(Math.floor(T) + 1, 1, N);
    return {
      fin,
      lit,
      seg,
      level,
      chargeOp,
      dischargeOp,
      regOp,
      wave: wavePath(lerp(20, 3, easeOut(regP))),
      cards,
      pct: Math.round(clamp(T / N, 0, 1) * 1000) / 10,
      stepLabel: `0${idx} / 0${N}`,
      ph: {
        p1: T < 2 || fin > 0 ? 1 : 0.35,
        p2: (T >= 2 && T < 4) || fin > 0 ? 1 : 0.35,
        p3: T >= 4 ? 1 : 0.35,
      },
    };
  }, [prog, lens]);

  const battFillW = (BATT.w - BATT.pad * 2) * vals.level;

  return (
    <div style={{ background: "#FFFFFF", color: "#0f172a" }}>
      <style>{`
        @keyframes bessPulse { 0% { transform: scale(1); opacity: .55 } 100% { transform: scale(1.7); opacity: 0 } }
        .bess-pulse { animation: bessPulse 1.6s ease-out infinite; transform-box: fill-box; transform-origin: 50% 50%; }
      `}</style>

      <div ref={wrapRef} style={{ position: "relative", height: `${(N + PAUSE) * STEP_VH + 100}vh` }}>
        <div style={{ position: "sticky", top: 0, height: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", padding: "36px 4vw", boxSizing: "border-box" }}>
          <div
            style={{
              width: "100%",
              // Le schéma (ratio 1100/560) doit tenir dans la hauteur d'écran, rail compris.
              maxWidth: "min(1180px, calc((100vh - 142px) * (1100 / 560)))",
              margin: "0 auto",
              position: "relative",
              aspectRatio: "1100/560",
              containerType: "inline-size",
            } as React.CSSProperties}
          >
            <svg ref={svgRef} viewBox="0 0 1100 560" fill="none" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", overflow: "visible" }}>
              <g stroke="rgba(15,23,42,.12)" strokeWidth={2} strokeLinecap="round">
                {SEGMENTS.map((s, k) => <path key={k} d={s.d} />)}
              </g>
              <g stroke={RED} strokeWidth={3} strokeLinecap="round">
                {SEGMENTS.map((s, k) => (
                  <path key={k} data-seg={k} d={s.d} style={{ strokeDasharray: vals.seg[k].L, strokeDashoffset: vals.seg[k].offset }} />
                ))}
              </g>

              {/* Onde de fréquence (étape 05) */}
              <g opacity={vals.regOp}>
                <path d={vals.wave} stroke={RED} strokeWidth={2} strokeLinecap="round" />
                <text x={820} y={34} fontSize={14} fontWeight={700} fill={RED_DARK} letterSpacing="0.1em">50 HZ</text>
              </g>

              {/* Particules : charge (production → batteries), puis décharge vers le réseau. */}
              <g opacity={vals.chargeOp}>
                <Particles d={SEGMENTS[0].d} dur={1.4} />
              </g>
              <g opacity={vals.dischargeOp}>
                <Particles d={SEGMENTS[1].d} dur={1.2} />
                <Particles d={SEGMENTS[2].d} dur={1.5} />
                <Particles d={SEGMENTS[3].d} dur={1.1} />
              </g>

              {/* Batteries (nœud principal) : jauge de charge */}
              <g opacity={vals.lit(1)}>
                <rect x={BATT.x} y={BATT.y} width={BATT.w} height={BATT.h} rx={14} fill="#FFFFFF" stroke={RED} strokeWidth={2.5} />
                <rect x={BATT.x + BATT.w} y={BATT.y + 30} width={10} height={30} rx={3} fill={RED} />
                <rect x={BATT.x + BATT.pad} y={BATT.y + BATT.pad} width={battFillW} height={BATT.h - BATT.pad * 2} rx={8} fill={RED} opacity={0.85} />
                <text x={BATT.x + BATT.w / 2} y={BATT.y + BATT.h + 30} textAnchor="middle" fontSize={17} fontWeight={700} fill={RED_DARK}>
                  Batteries · {Math.round(vals.level * 100)} %
                </text>
              </g>

              {/* Pulsation du réseau (étape 05) */}
              <g opacity={vals.regOp}>
                <circle className="bess-pulse" cx={1000} cy={160} r={46} stroke={RED} strokeWidth={2} />
              </g>

              {NODES.map((n) => (
                <g key={n.key} opacity={vals.lit(n.step)}>
                  <circle cx={n.cx} cy={n.cy} r={46} fill="#FFFFFF" stroke={RED} strokeWidth={2} />
                  <g transform={`translate(${n.cx - 16},${n.cy - 16}) scale(1.333)`}>
                    <path d={n.icon} stroke={RED} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
                  </g>
                  <text x={n.cx} y={n.cy + 74} textAnchor="middle" fontSize={16} fontWeight={600} fill={RED_DARK}>
                    {n.label}
                  </text>
                </g>
              ))}
            </svg>

            {CARDS.map((card, i) => (
              <div
                key={card.eyebrow}
                style={{
                  position: "absolute",
                  left: "2%",
                  top: "68%",
                  width: "42%",
                  minWidth: 230,
                  boxSizing: "border-box",
                  pointerEvents: "none",
                  opacity: vals.cards[i].op,
                  transform: `translate(0,${vals.cards[i].y}px)`,
                  background: "#FFFFFF",
                  border: "1px solid rgba(15,23,42,.12)",
                  borderRadius: 12,
                  padding: "1.6cqw 1.8cqw",
                }}
              >
                <div style={{ fontSize: ".95cqw", letterSpacing: ".14em", textTransform: "uppercase", color: RED, fontWeight: 700, marginBottom: ".7cqw" }}>
                  {card.eyebrow}
                </div>
                <h3 style={{ margin: "0 0 .6cqw", fontWeight: 700, fontSize: "1.7cqw", lineHeight: 1.2, color: "#0f172a" }}>{card.title}</h3>
                <p style={{ margin: 0, fontSize: "1.2cqw", lineHeight: 1.55, color: "#475569", fontWeight: 400 }}>{card.body}</p>
              </div>
            ))}
          </div>

          <div style={{ width: "100%", maxWidth: 1180, margin: "28px auto 0", display: "flex", alignItems: "center", gap: 24 }}>
            <div style={{ fontSize: 13, letterSpacing: ".1em", color: "#475569", minWidth: 56, fontVariantNumeric: "tabular-nums", fontWeight: 600 }}>
              {vals.stepLabel}
            </div>
            <div style={{ flex: 1, height: 2, background: "rgba(15,23,42,.10)", borderRadius: 2, position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, background: RED, borderRadius: 2, width: `${vals.pct}%` }} />
            </div>
            <div style={{ display: "flex", gap: 22, fontSize: 12, letterSpacing: ".14em", textTransform: "uppercase", fontWeight: 700, color: RED }}>
              <span style={{ opacity: vals.ph.p1 }}>Stocker</span>
              <span style={{ opacity: vals.ph.p2 }}>Restituer</span>
              <span style={{ opacity: vals.ph.p3 }}>Réguler</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
