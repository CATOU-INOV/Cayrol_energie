// Registre centralisé des photos de démonstration (banque Unsplash, licence Unsplash — libres
// d'usage commercial, sans attribution obligatoire). À REMPLACER par les vraies photos de projets
// Cayrol Energie avant mise en production : voir TODO-CONTENT.md pour le détail par page.
//
// Astuce Unsplash : on part de l'URL "photo-xxxx" nue et on ajoute les paramètres de resize/format
// à l'usage (w, q, fit=crop) plutôt que de figer une taille ici.

export const photos = {
  heroAccueil: "https://images.unsplash.com/photo-1756913454165-246d96a20b67", // vue aérienne centrale PV au sol
  hydroHauteChute: "https://images.unsplash.com/photo-1611036884458-6650ef4ccfdb", // barrage en montagne
  hydroBasseChute: "https://images.unsplash.com/photo-1559206596-11b41d1eebae", // vallée / eau calme en montagne
  pvToiture: "https://images.unsplash.com/photo-1745321633881-d2d2218911bd", // toiture industrielle en panneaux PV
  pvOmbrieres: "https://images.unsplash.com/photo-1726866492047-7f9516558c6e", // vue aérienne parking sous ombrières PV
  pvAuSol: "https://images.unsplash.com/photo-1666519071110-e223b4d7f688", // centrale PV au sol
  pvAgrivoltaisme: "https://images.unsplash.com/photo-1730058518963-55bc7a9eb791", // vigne aérienne (TODO: pas de panneaux, à remplacer par un vrai projet agrivoltaïque)
  bessTerrain: "https://images.unsplash.com/photo-1511578194003-00c80e42dc9b", // conteneurs industriels (TODO: pas un vrai site BESS, stand-in générique)
  biogaz: "https://images.unsplash.com/photo-1623428719334-5d304060e0e3", // silos agricoles (TODO: pas un digesteur biogaz, stand-in générique)
  autoconsommation: "https://images.unsplash.com/photo-1745321633881-d2d2218911bd", // réemploi photo toiture PV
} as const;

export type PhotoKey = keyof typeof photos;

// Ajoute les paramètres de resize Unsplash à une URL nue du registre ci-dessus.
export function photoUrl(key: PhotoKey, opts: { w?: number; q?: number } = {}) {
  const { w = 1600, q = 80 } = opts;
  return `${photos[key]}?w=${w}&q=${q}&auto=format&fit=crop`;
}
