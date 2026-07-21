// Configuration centralisée des 4 univers énergétiques + autoconsommation collective.
// Utilisée par ThemeSelector, ProjectMap, ThematicTab et BaseLayout pour rester cohérents
// (une seule source de vérité couleur/libellé/logo par thème).

export type ThemeKey =
  | "hydroelectricite"
  | "photovoltaique"
  | "flexibilite-bess"
  | "biogaz"
  | "autoconsommation";

export interface ThemeConfig {
  key: ThemeKey;
  name: string;
  shortName: string;
  color: string;
  colorDark: string;
  colorLight: string;
  href: string;
  logo: string;
  tagline: string;
}

export const themes: Record<ThemeKey, ThemeConfig> = {
  hydroelectricite: {
    key: "hydroelectricite",
    name: "Hydroélectricité",
    shortName: "Hydro",
    color: "#1d4ed8",
    colorDark: "#1e3a8a",
    colorLight: "#93c5fd",
    href: "/hydroelectricite",
    logo: "/logos/logo-bleu.png",
    tagline: "Un savoir-faire historique au fil de l'eau",
  },
  photovoltaique: {
    key: "photovoltaique",
    name: "Photovoltaïque",
    shortName: "Photovoltaïque",
    color: "#f97316",
    colorDark: "#c2410c",
    colorLight: "#fdba74",
    href: "/photovoltaique",
    logo: "/logos/logo-orange.png",
    tagline: "Toiture, ombrières, sol et agrivoltaïsme",
  },
  "flexibilite-bess": {
    key: "flexibilite-bess",
    name: "Flexibilité / BESS",
    shortName: "BESS",
    color: "#dc2626",
    colorDark: "#991b1b",
    colorLight: "#fca5a5",
    href: "/flexibilite-bess",
    logo: "/logos/logo-rouge.png",
    tagline: "Stocker l'énergie pour mieux la restituer",
  },
  biogaz: {
    key: "biogaz",
    name: "Biogaz",
    shortName: "Biogaz",
    color: "#16a34a",
    colorDark: "#14532d",
    colorLight: "#86efac",
    href: "/biogaz",
    logo: "/logos/logo-vert.png",
    tagline: "Valoriser la matière organique locale",
  },
  autoconsommation: {
    key: "autoconsommation",
    name: "Autoconsommation collective",
    shortName: "Court Circuit",
    color: "#0ea5e9",
    colorDark: "#1e3a8a",
    colorLight: "#7dd3fc",
    href: "/autoconsommation-collective",
    logo: "/logos/logo-assoc.png",
    tagline: "L'association Court Circuit, l'énergie en circuit court",
  },
};

export const themeList: ThemeConfig[] = Object.values(themes);

// Les 4 univers "production" affichés sur l'accueil (hors autoconsommation, mise en avant à part).
export const energyThemeList: ThemeConfig[] = [
  themes.hydroelectricite,
  themes.photovoltaique,
  themes["flexibilite-bess"],
  themes.biogaz,
];
