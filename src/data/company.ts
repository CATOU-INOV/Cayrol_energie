// Coordonnées réelles de Cayrol Energie, reprises du site actuel cayrolenergie.com — centralisées
// ici pour être partagées entre la page Contact et le footer global, plutôt que dupliquées.

export const company = {
  adresse: "170 route de la Combe, 73220 Argentine",
  telephone: "+33 (0)4 67 49 45 70",
  email: "contact@cayrolenergie.com",
};

// Partenaires "Ils nous font confiance", affichés en bandeau défilant (footer global + accueil).
// Liste reprise du site actuel cayrolenergie.com (page Société) et du cadrage PDF (onglet BESS).
// `logo` : chemin d'un fichier dans public/partenaires/ (SVG de préférence, sinon PNG à fond
// transparent) — tant qu'il est absent, le bandeau affiche le nom du partenaire.
// TODO-CONTENT : liste et autorisation d'affichage à valider avec le client, logos à récupérer.
export interface Partner {
  name: string;
  logo?: string;
}

export const partners: Partner[] = [
  { name: "QualiPV" },
  { name: "La French Tech Green" },
  { name: "La French Lab" },
  { name: "Banque Populaire du Sud", logo: "/partenaires/banque-populaire-sud.png" },
  { name: "Crédit Agricole des Savoie", logo: "/partenaires/credit-agricole-savoie.png" },
  { name: "Territoire d'énergie Savoie Mont-Blanc" },
  { name: "Groupe Lauzière", logo: "/partenaires/groupe-lauziere.png" },
  { name: "Communauté Val Cenis Savoie" },
  { name: "CODEV Savoie" },
  { name: "Savoiexpo" },
  { name: "Terre de Maurienne" },
  { name: "Porte de Maurienne" },
];
