// Bloc "sélection d'univers" de la page d'accueil : grille 2×2 des 4 filières énergétiques.
// Fine enveloppe autour du composant générique ExpandingCardGrid (voir ce fichier pour le détail
// de l'animation) — ne fait que mapper les données de thème vers sa forme générique.

import { energyThemeList } from "../data/themes";
import { photoUrl, type PhotoKey } from "../data/photos";
import ExpandingCardGrid from "./ExpandingCardGrid";

const THEME_PHOTOS: Record<string, PhotoKey> = {
  hydroelectricite: "hydroHauteChute",
  photovoltaique: "pvAuSol",
  "flexibilite-bess": "bessTerrain",
  biogaz: "biogaz",
};

export default function ThemeSelector() {
  const items = energyThemeList.map((theme) => ({
    key: theme.key,
    label: theme.name,
    image: photoUrl(THEME_PHOTOS[theme.key], { w: 1400 }),
    color: theme.colorDark,
    icon: theme.logo,
    description: theme.tagline,
    href: theme.href,
  }));

  return <ExpandingCardGrid items={items} perRow={2} height="h-[520px] md:h-[600px]" />;
}
