# Contenu provisoire à valider avec le client

Ce prototype utilise du texte plausible là où le cadrage PDF ne donnait que des titres de
section, complété depuis 2026-07-20 par du **contenu réel** repris du site actuel
cayrolenergie.com (voir section dédiée ci-dessous). Tout ce qui reste marqué `TODO-CONTENT`
doit être relu/remplacé avant mise en production. Recherchez `TODO-CONTENT` dans le code pour
retrouver chaque emplacement exact.

## Contenu repris du site actuel cayrolenergie.com (source réelle, pas un placeholder)

Le site en ligne (Drupal 8) a été passé en revue pour en extraire du contenu réel plutôt que
d'inventer du texte. Repris dans le prototype :
- **Accroche du hero d'accueil** : "Des territoires et des Hommes au cœur de la transition
  énergétique." (texte exact du site actuel).
- **Page Société** : "Qui sommes-nous" (reformulé à partir du texte réel, sans le chiffre
  d'ancienneté — voir note chiffres ci-dessous), les 5 "Nos valeurs" (Accompagnement
  personnalisé / Professionnalisme / Suivi rigoureux / Transparence / Expertise), "Nos
  partenaires" (Banque Populaire, Crédit Agricole, collectivités de Savoie et de l'Hérault,
  exploitants agricoles partenaires).
- **Page Contact** : adresse (170 route de la Combe, 73220 Argentine), téléphone
  (+33 (0)4 67 49 45 70), email (contact@cayrolenergie.com). Horaires non précisés sur le site
  actuel → reste en TODO.
- **Bandeau "Ils nous font confiance"** : 3 vraies certifications trouvées sur le site
  (QualiPV, La French Tech Green, La French Lab) + 2 banques réelles, en plus des références
  déjà données par le client dans le PDF de cadrage.
- **Descriptions des catégories Photovoltaïque** (Toiture/Ombrières/Au sol/Agrivoltaïsme) :
  réécrites à partir des vraies accroches de chaque page solution du site actuel.
- **Projet manquant ajouté** : "Cabestany" (72 kVA, toiture intégrée) référencé sur le site
  actuel mais absent de `cayrol_projects.json` — ajouté dans `src/data/projects.json` avec des
  coordonnées approximatives (centre de la commune de Cabestany, 66330) puisque l'adresse exacte
  du site n'était pas précisée ; **à vérifier/affiner avec le client**.

**⚠️ Chiffres NON repris du site actuel, sur demande explicite du client** : le site affiche
"20 MWc déjà installés / 50 MWc en développement / plus de 50 ans d'expérience", qui contredit
les chiffres du PDF de cadrage (64 centrales photovoltaïques, 11 centrales hydroélectriques,
19,15 MW). Le client a tranché le 2026-07-20 : garder les chiffres du PDF de cadrage, qui sont
"à jour" — c'est ce qui est affiché partout sur le prototype (aucun changement nécessaire, ces
chiffres étaient déjà les bons). Ne pas réintroduire les chiffres du site actuel sans
confirmation explicite.

**Catégorie "Hangar photovoltaïque"** : le site actuel la distingue de "Toiture" (5 catégories
au total pour le photovoltaïque, contre 4 chez nous). Fondue dans "Toiture" ici pour garder une
grille 2×2 propre — à séparer en 5ᵉ catégorie si le client préfère coller à la structure
d'origine (voir note en bas de `src/pages/photovoltaique.astro`).

## Données

- `src/data/projects.json` (à l'origine copie de `cayrol_projects.json`, + le projet Cabestany
  ajouté depuis le site actuel, voir ci-dessus) ne contient que des projets
  **photovoltaïques** (+ un site hybride hydro/PV). Aucun projet Hydroélectricité pur, BESS
  ou Biogaz n'est disponible → les cartes/listes de projets sur ces onglets sont vides ou
  incomplètes.
- Logos partenaires (page BESS : CA des Savoie, Territoire d'énergie, Groupe Lauzière...) non
  fournis → affichés en texte simple pour l'instant.

## Photos (banque Unsplash — provisoire, licence Unsplash)

Toutes les photos utilisées (`src/data/photos.ts`) proviennent d'Unsplash (licence Unsplash :
usage commercial libre, attribution non obligatoire). Elles servent à démontrer le rendu visuel
du format demandé (photo + logo en overlay, catégories illustrées) mais **doivent être
remplacées par les vraies photos des projets Cayrol Energie** avant mise en production —
crédibilité et différenciation obligent pour un site vitrine.

Fidélité par photo :
- `heroAccueil`, `pvToiture`, `pvOmbrieres`, `pvAuSol`, `hydroHauteChute` : bonne correspondance
  thématique (vraies photos de centrales PV / barrage en montagne).
- `hydroBasseChute` : photo de vallée/eau calme générique, pas un vrai bâtiment de centrale basse
  chute — à remplacer en priorité si une photo client existe.
- `pvAgrivoltaisme` : photo de vigne aérienne **sans panneaux solaires** — stand-in en attendant
  une vraie photo de projet agrivoltaïque.
- `bessTerrain` : conteneurs industriels génériques, pas un vrai site BESS Cayrol Energie.
- `biogaz` : silos agricoles génériques, pas des digesteurs biogaz (aucune photo Unsplash libre
  de digesteur biogaz de qualité trouvée) — à remplacer en priorité.
- `autoconsommation` : réemploi de la photo toiture PV, pas une photo de quartier/habitat
  spécifique à l'autoconsommation collective.

## Bandeau "Ils nous font confiance" (accueil, bas de page)

Défilement infini de wordmarks texte (pas d'images de logo — voir choix ci-dessous) :
`src/pages/index.astro`, tableau `trustedBy`.

- Contenu = 3 certifications réelles confirmées sur le site actuel (QualiPV, La French Tech
  Green, La French Lab) + Banque Populaire et Crédit Agricole (partenaires réels cités sur le
  site) + références du cadrage PDF (CA des Savoie, Territoire d'énergie Savoie Mont-Blanc,
  Groupe Lauzière). La question de l'appartenance French Tech est donc résolue : c'est réel
  (précisément "French Tech Green", pas French Tech générique).
- **Choix volontaire de ne pas ajouter de logos de grandes marques sans lien réel avec Cayrol
  Energie** (type Google, enseignes connues...) : un bandeau "ils nous font confiance" affirme une
  relation commerciale réelle avec chaque entité affichée ; en inventer aurait été trompeur, même
  pour un prototype de démo.
- Rendu en texte stylé (pas d'images) car aucun fichier logo n'a été fourni pour ces entités. À
  remplacer par les vrais logos dès qu'ils seront disponibles — le composant `LogoMarquee.astro`
  accepte une liste, il suffira d'y passer des `<img>` à la place du texte.

## Page par page

- **Hydroélectricité** : Historique et Expérience sont des textes provisoires. Un seul projet
  disponible (site hybride "La Combe"). Les descriptions courtes de "Centrale haute chute" /
  "Centrale basse chute" (révélées au survol de la grille "Nos types d'installations") sont
  rédigées à titre d'exemple, à valider. La frise chronologique ("Étude hydraulique / Autorisations
  / Construction / Mise en service") est un déroulé type générique par analogie avec le
  photovoltaïque — un vrai projet hydroélectrique a probablement un calendrier plus long
  (autorisations environnementales notamment), à faire valider ou remplacer par le client.
- **Photovoltaïque** : catégories "Au sol" et "Agrivoltaïsme" sans exemple de projet réel (les
  données ne contiennent que du Toiture/Ombrières). Les descriptions courtes des 4 catégories
  (révélées au survol) sont provisoires. La frise chronologique est un déroulé type générique, à
  faire valider.
- **Flexibilité / BESS** : chronologie du projet, atouts et description du terrain ont été
  **transcrits du PDF fourni** (contenu réel du client) — la chronologie provient d'un schéma
  dont les colonnes se chevauchaient à l'extraction, donc à revérifier mot pour mot. Logos
  partenaires à récupérer.
- **Biogaz** : le PDF ne donnait que les titres de bloc (Explications / Déroulement / Stats /
  Atouts) sans détail — tout le texte de cette page est rédigé à titre d'exemple.
- **Autoconsommation collective (Court Circuit)** : explications, statistiques d'économies et
  transparence contractuelle sont des textes/chiffres placeholders (`TODO` visibles dans les
  StatBadge). Formulaire "Estimez votre éligibilité" ajouté (nom/email/consommation annuelle
  kWh) — maquette non fonctionnelle comme le formulaire de `/contact`, aucun envoi réel ni calcul
  d'estimation ne sont branchés ; à connecter à un vrai traitement (email/CRM) avant mise en
  production.
- **Société** : les 6 blocs (Qui sommes-nous, Nos valeurs, Nos engagements, Nos partenaires,
  Nos solutions, Nous contacter) sont provisoires, sauf "Nos solutions" qui pointe déjà vers les
  vraies pages thématiques.
- **Contact** : formulaire visuel non fonctionnel (aucun back-end sur ce prototype) ; coordonnées
  et intégration d'envoi réel à définir avec le client.

## Stats reprises telles quelles du PDF (fiables, pas des placeholders)

- 64 centrales photovoltaïques
- 11 centrales hydroélectriques, 19,15 MW
- BESS : 2 conteneurs 20 pieds, 2 postes de refroidissement, 2 postes de transformation
- Les 4 "atouts du BESS" (Optimisation de l'énergie / Flexibilité et régulation des réseaux /
  Contribution à la transition énergétique / Valorisation du foncier)
