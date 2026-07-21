// Petit composant "chiffre-clé" réutilisable (ex: "20 MWc déjà installés").
// Rendu statique par Astro (pas besoin d'hydratation), la couleur suit le thème de la page.

export interface StatBadgeProps {
  value: string;
  label: string;
  color?: string;
}

export default function StatBadge({ value, label, color = "#f97316" }: StatBadgeProps) {
  return (
    <div className="flex min-w-[130px] flex-col items-center justify-center rounded-2xl border border-black/5 bg-white/80 px-6 py-5 text-center shadow-sm backdrop-blur-sm">
      <span className="text-3xl font-extrabold md:text-4xl" style={{ color }}>
        {value}
      </span>
      <span className="mt-1 text-sm text-neutral-600">{label}</span>
    </div>
  );
}
