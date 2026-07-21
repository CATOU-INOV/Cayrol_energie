# PROGRESS — Prototype site Cayrol Energie

> Contexte : réponse à l'appel d'offres refonte du site vitrine Cayrol Energie (vs. 2 concurrents
> sur CMS classique). Prototype fonctionnel à présenter en réunion jeudi. Stack : Astro + React
> (îlots) + Tailwind CSS + Leaflet. Cadrage source : `ARCHITECHTURE SITE CAYROL ENERGIE.pdf`.

Dernière mise à jour : 2026-07-20 (session 15 — pilules qui s'ouvrent sur le rail)

## Fait

- Scaffold Astro (template minimal) + intégrations `@astrojs/react`, Tailwind v4
  (`@tailwindcss/vite`), Leaflet + `@types/leaflet`.
- Données réelles copiées : `cayrol_projects.json` → `src/data/projects.json` (14 projets),
  logos client → `public/logos/*.png`.
- Système de thème couleur : `src/styles/themes.css` (variables CSS par univers) +
  `src/data/themes.ts` (config couleur/logo/libellé, source de vérité unique).
- Composants réutilisables créés :
  - `ProjectMap.tsx` — carte Leaflet, marqueurs colorés par filière, popups, filtres. **Priorité 1, fait.**
  - `ThematicTab.tsx` — composant générique pour les 4 onglets thématiques (paramétré couleur + contenu). **Priorité 2, fait**, décliné sur Photovoltaïque + Flexibilité/BESS.
  - `Timeline.tsx` — frise chronologique générique. **Priorité 3, fait**, utilisée sur BESS (contenu réel du PDF) et Photovoltaïque (contenu provisoire).
  - `StatBadge.tsx`, `ThemeSelector.tsx` — faits, utilisés sur l'accueil.
- `BaseLayout.astro` (nav + footer) + 8 pages : index, hydroelectricite, photovoltaique,
  flexibilite-bess, biogaz, autoconsommation-collective, societe, contact.
- `TODO-CONTENT.md` créé : recense tout le contenu provisoire à faire valider par le client.
- Vérifications : `npx astro check` → 0 erreur. `npm run build` → 8 pages générées sans erreur.
- Test visuel : dev server lancé (`npm run dev`, port 4321), captures d'écran via Playwright
  headless (accueil, BESS, photovoltaïque) — 0 erreur console, rendu conforme.

**Session 2 — habillage photo (demande : « respecter le format demandé avec de belles photos
Unsplash sur lesquelles on vient ajouter le logo de l'entreprise »)**

- `src/data/photos.ts` : registre centralisé des photos Unsplash utilisées (URL nue + helper
  `photoUrl()` pour le resize à la volée), une entrée par usage (hero, catégories PV, hydro,
  BESS, biogaz, autoconsommation).
- `PhotoBanner.astro` (nouveau composant) : photo pleine largeur + logo en overlay avec dégradé
  de lisibilité — reproduit le format exact de la page d'accueil du PDF (photo + logo CAYROL
  ENERGIE superposé). Prop `wordmark` pour les cas où le logo porte déjà son propre texte (ex.
  Court Circuit).
- Intégré sur : hero accueil, et en bandeau d'en-tête sur les 4 onglets thématiques +
  autoconsommation collective.
- `ThemeSelector.tsx` : chaque carte univers affiche maintenant une photo représentative
  au-dessus du logo (reprend la rangée de photos de la page d'accueil 2 du PDF).
- `ThematicTab.tsx` : les tuiles de catégories (`ThematicCategory`) acceptent désormais une
  vraie image (`image`) en plus du fallback couleur — utilisé pour Toiture/Ombrières/Au
  sol/Agrivoltaïsme (PV) et Haute/Basse chute (hydro).
- Recherche des photos via WebSearch/WebFetch sur unsplash.com (licence Unsplash, usage
  commercial libre sans attribution obligatoire), toutes vérifiées avec un `curl` HEAD (200 OK)
  avant intégration.
- `TODO-CONTENT.md` mis à jour avec une section dédiée listant, photo par photo, la fidélité
  réelle au sujet (bonnes correspondances vs. stand-ins génériques à remplacer en priorité).
- Nouvelles captures d'écran de vérification (accueil, hydro, PV, BESS, autoconsommation) — 0
  erreur console, rendu conforme au format demandé.

**Session 3 — hero plein écran (demande : « image en plein écran, texte superposé, stats toutes
de la même couleur, avec le logo, rendu moderne et abouti »)**

- Hero accueil entièrement refondu (`src/pages/index.astro`) : photo edge-to-edge en
  `min-h-screen` (plus de cadre/coins arrondis/container), dégradé sombre haut→bas pour la
  lisibilité, logo en overlay coin supérieur gauche, titre + accroche en blanc ancrés en bas de
  la photo, repère de scroll animé (chevron) en bas d'écran.
- Les 4 stats sont sorties du hero et forment un **bandeau plein largeur fond sombre
  (`bg-neutral-900`)** juste en dessous — toutes en blanc (plus de couleur par filière comme
  avant), prolongeant visuellement le dégradé de la photo. Choix fait après avoir constaté que
  stats + titre + tagline + header ne tenaient pas ensemble dans un seul écran (voir Décisions).
- Vérifié en desktop (1440×900) et mobile (390×844, où le nav du header passe sur 2 lignes) :
  plus aucun contenu coupé par le fold, 0 erreur console, build + `astro check` toujours au vert.

**Session 4 — header transparent + navigation fluide (demande : « centrer le texte, header
transparent qui se fond dans la photo, site et navigation smooth — mon plus gros avantage vs
CMS »)**

- Texte du hero recentré : `items-center justify-center text-center` au lieu de l'ancrage
  bas-gauche, logo dupliqué dans le hero supprimé (le header transparent porte déjà le logo).
- `BaseLayout.astro` : header passé en `fixed` (au lieu de `sticky`) + nouvelle prop
  `transparentHeader`. Sur la home, le header est transparent et se fond dans la photo au
  chargement, puis devient blanc/opaque dès que `window.scrollY > 40` (classe `.is-scrolled`,
  transition CSS 300ms). Sur les autres pages, header opaque en permanence comme avant.
- Hauteur réelle du header exposée en variable CSS (`--header-h`, mesurée en JS au chargement et
  au resize) pour que le `padding-top` des pages à header opaque reste juste même quand le nav
  passe sur 2 lignes en mobile — plus de valeur en dur fragile.
- **`<ClientRouter />` (astro:transitions) ajouté globalement** : navigation entre pages en
  transition douce façon SPA, sans rechargement complet — l'argument différenciant face à des
  concurrents sous CMS classique (WordPress/Drupal rechargent la page à chaque clic). Script du
  header réécrit pour s'exécuter à chaque navigation via l'événement `astro:page-load` (et pas
  seulement au premier chargement), avec nettoyage du listener de scroll pour éviter les fuites
  entre navigations.
- `scroll-behavior: smooth` ajouté globalement (`global.css`).
- Vérifié : `ProjectMap` (îlot Leaflet `client:only="react"`) se réhydrate correctement après une
  navigation SPA (testé PV → Accueil → scroll jusqu'à la carte) ; header repasse bien transparent
  au retour sur l'accueil ; testé desktop 1440×900 et mobile 390×844 ; 0 erreur console partout ;
  `astro check` et `npm run build` toujours au vert.

**Session 5 — ajustements hero + nav simplifiée (retour utilisateur : « ça fait compact, texte à
gauche, raccourcir l'accroche, retirer les 4 filières du header »)**

- Hero : texte repassé aligné à gauche (`justify-start` implicite via suppression de
  `items-center`/`text-center`), avec plus de respiration (`px-6 md:px-16 lg:px-24`, `gap-8`,
  `mt-8` entre titre et accroche au lieu de `mt-5`).
- Accroche raccourcie : l'ancienne phrase listait les 4 énergies ("Hydroélectricité,
  photovoltaïque, flexibilité électrique et biogaz : ...") — redondant avec la section
  `ThemeSelector` juste en dessous qui les présente déjà avec photos. Nouvelle version : "Nous
  développons, construisons et exploitons des installations à taille humaine, en lien étroit
  avec nos territoires."
- Header (`BaseLayout.astro`) : retrait des 4 liens Hydro/Photovoltaïque/BESS/Biogaz — ils
  restent accessibles via la section imagée de l'accueil (`ThemeSelector`), pas besoin de les
  dupliquer dans un nav déjà chargé. Nav réduite à Accueil / Court Circuit / Société / Contact.
  Effet de bord positif : le nav mobile tient maintenant sur une seule ligne (ne wrappe plus sur
  2 lignes comme avant), rendant même la mesure `--header-h` moins critique.
- Vérifié : build + `astro check` au vert, captures desktop et mobile conformes, 0 erreur console.

**Session 6 — grille 2×2 "expand on hover" (demande : « 4 cartes en carré, 2 en haut/2 en bas,
au survol l'image+description s'étend et recouvre les autres »)**

- `ThemeSelector.tsx` entièrement réécrit : grille 2 lignes × 2 colonnes en flexbox imbriqué
  (une rangée flex contenant 2 cartes flex), chaque niveau (ligne, puis carte dans la ligne)
  pilote son `flexGrow` via un état React `hovered: number | null`. Au survol/focus d'une carte,
  sa ligne passe à `flexGrow: 3` (vs 1 pour l'autre ligne) ET la carte elle-même passe à
  `flexGrow: 3` dans sa ligne (vs 1 pour sa voisine) — la carte grossit donc en largeur ET en
  hauteur simultanément, réduisant les 3 autres à des bandes fines, avec une transition
  `flex-grow` 500ms. Chaque carte affiche une photo pleine carte + dégradé teinté couleur du
  thème + logo/titre toujours visibles ; la description (tagline de `themes.ts`) et le lien
  "Découvrir →" sont animés en opacité/translate et ne deviennent lisibles qu'une fois la carte
  suffisamment large (au survol).
- Choix technique : `flex-grow` animé plutôt que `position:absolute` + `z-index` pour le
  recouvrement — évite le flicker de survol (le mouseleave ne se déclenche jamais sur un élément
  caché sous une carte agrandie, puisque tout reste dans le flux normal) et donne un fallback
  naturel sur mobile (pas de hover → la grille reste simplement en 2×2 égal, chaque carte cliquable
  normalement).
- Chaque carte reste un `<a href>` plein cadre vers la page thématique correspondante (clic
  fonctionnel à tout moment, y compris avant hydratation puisque c'est un lien natif).
- Accessibilité : `onFocus`/`onBlur` déclenchent le même effet que `onMouseEnter`/`onMouseLeave`,
  donc la navigation clavier (Tab) révèle aussi la description.
- Vérifié à la souris sur les 4 cartes (coins haut-gauche et bas-droite testés explicitement) :
  expansion fluide, contenu révélé progressivement, retour à l'état par défaut propre, 0 erreur
  console. Build + `astro check` au vert.

**Session 7 — compteurs animés (demande : « les chiffres sous la landing augmentent au moment où
ils apparaissent »)**

- `src/pages/index.astro` : `heroStats` restructuré en `{ target: number, suffix: string, label }`
  (au lieu d'une simple chaîne `value`) pour séparer la partie numérique animable du texte fixe
  ("+", "+ kVA").
- Chaque nombre du bandeau de stats porte `data-target`/`data-suffix` et affiche la valeur finale
  en dur côté serveur (fallback correct sans JS / avant hydratation).
- Script vanilla (pas de React — animation DOM simple, pas besoin d'un îlot) : `IntersectionObserver`
  sur `.stat-number` (seuil 0.4), qui déclenche un compteur `requestAnimationFrame` de 0 → valeur
  cible en ~1,4s avec easing `easeOutCubic`, une seule fois par élément (`unobserve` après
  déclenchement). Réinitialisé à chaque navigation via `astro:page-load`, avec `disconnect()` de
  l'ancien observer pour éviter les doublons — même pattern que le script du header transparent.
- Vérifié via Playwright : valeur statique correcte avant scroll, comptage progressif visible
  pendant l'animation (4+ → 9+ → 14+), valeur finale exacte après ~1,4s, 0 erreur console. Build
  + `astro check` au vert.

**Session 8 — bandeau "Ils nous font confiance" (demande : « logos qui défilent, French Tech +
entreprises connues comme exemple »)**

- Nouveau composant `LogoMarquee.astro` : défilement infini en **pure CSS** (pas de React/JS) —
  la liste d'items est dupliquée une fois et le conteneur translaté de -50% en boucle
  (`@keyframes marquee`, 28s linear infinite), donc aucun calcul de largeur en dur et une boucle
  parfaitement continue quel que soit le nombre d'items. Fondu sur les bords via `mask-image`,
  pause au survol (`animation-play-state: paused`), et désactivation via
  `prefers-reduced-motion` pour l'accessibilité.
- **Écart volontaire par rapport à la demande littérale** : plutôt que d'ajouter des logos de
  grandes marques sans lien réel avec Cayrol Energie (ce qu'un bandeau "ils nous font confiance"
  affirmerait comme une vraie relation commerciale), j'ai réutilisé les références déjà citées
  par le client dans son propre PDF de cadrage (section BESS "Ils nous font confiance" : CA des
  Savoie, Territoire d'énergie Savoie Mont-Blanc, Groupe Lauzière, etc.) + La French Tech comme
  demandé. Détail et justification dans `TODO-CONTENT.md`. Contenu rendu en texte stylé (pas
  d'images, aucun fichier logo fourni pour ces entités) — même limitation que la page BESS.
- Section insérée en bas de la page d'accueil, juste avant le footer.
- Vérifié via Playwright : animation active (translation confirmée entre deux captures), pause
  effective au survol (`animationPlayState` passe de `running` à `paused` puis revient), 0 erreur
  console. Build + `astro check` au vert.

**Session 9 — carte plus petite/jolie + réordonnancement (retour : « la carte est trop grosse, le
zoom n'est pas bien optimisé, remonter les filières au-dessus de la carte »)**

- `src/pages/index.astro` : sections "Nos filières d'expertise" et "Nos implantations en France"
  interverties — la grille 2×2 apparaît maintenant juste après le bandeau de stats, la carte
  ensuite.
- `ProjectMap.tsx` :
  - Hauteur réduite (`h-[420px] md:h-[520px]` → `h-[320px] md:h-[400px]`), bordure plus fine et
    ombre légèrement accentuée pour un rendu plus soigné à cette taille.
  - Fond de carte remplacé par **CartoDB Positron** (clair, épuré, sans clé API) au lieu des
    tuiles OSM par défaut — plus élégant, et les points colorés par filière ressortent beaucoup
    mieux dessus.
  - **Zoom recalibré** : le vrai bug était `fitBounds` appliqué même sur un seul point restant
    après filtrage (ex. filtre "Hydroélectricité + Photovoltaïque" qui ne matche qu'un seul
    projet) — Leaflet zoomait alors très près sur un cadre quasi vide. Ajout d'un cas dédié :
    1 point → `setView` à un zoom fixe "régional" (9) qui garde du contexte géographique ; 2+
    points → `fitBounds` avec un plafond de zoom plus bas (9 au lieu de 10) et un padding réduit,
    cohérent avec le format plus compact du composant.
  - `scrollWheelZoom: false` + `zoomSnap: 0.5` : évite que la molette de la souris se fasse
    capturer par la carte pendant qu'on scrolle la page, et affine la précision du cadrage.
  - Popups Leaflet restylés (coins arrondis, ombre douce) via `global.css` pour matcher
    l'esthétique du reste du site plutôt que le rendu anguleux par défaut.
- Vérifié via Playwright : nouvel ordre des sections confirmé, rendu des tuiles CartoDB, zoom
  "régional" correct sur un filtre à un seul point (recentré sur la Savoie avec villes
  environnantes visibles au lieu d'un cadre vide), popup stylé au clic sur un marqueur, 0 erreur
  console. Build + `astro check` au vert.

**Session 10 — grille expand-on-hover généralisée (demande : « Centrale haute chute / basse
chute côte à côte avec l'agrandissement comme les 4 autres catégories »)**

- Extraction du pattern "expanding cards" de `ThemeSelector.tsx` vers un nouveau composant
  générique **`ExpandingCardGrid.tsx`** (`items`, `perRow`, `height` en props) — c'est exactement
  l'argument de réutilisabilité central du projet : un seul composant plutôt que du code dupliqué
  par page. `ThemeSelector.tsx` devient une simple enveloppe qui mappe `energyThemeList` vers la
  forme générique.
- `ThematicTab.tsx` : le bloc "Nos types d'installations" (catégories) utilise maintenant
  `ExpandingCardGrid` au lieu de petites tuiles statiques. Avec seulement 2 items (Hydro :
  Centrale haute/basse chute), l'algorithme se généralise naturellement à "2 cartes côte à côte,
  celle survolée s'élargit" (la dimension "ligne" n'a simplement aucun effet avec une seule
  ligne) — aucun code spécial à écrire pour ce cas. Avec 4 items (Photovoltaïque), le même
  composant retombe sur une grille 2×2 identique à celle de l'accueil.
  - `ThematicCategory` (`image` désormais requis, ajout de `description?`) — le fallback "bloc
    couleur + Photo à intégrer" disparaît puisque toutes les catégories ont maintenant une vraie
    photo Unsplash.
  - Composant rendu non-cliquable pour les catégories (pas de `href`, contrairement aux cartes
    univers de l'accueil qui pointent vers une page) : `ExpandingCardGrid` gère les deux cas via
    un `href` optionnel par item (overlay `<a>` en z-index seulement si fourni), plutôt qu'un
    élément racine `<a>`/`<div>` conditionnel qui aurait posé des soucis de typage TS avec un tag
    dynamique.
  - Ajout d'un champ `icon?` optionnel pour ne pas perdre le petit logo affiché sur les cartes
    univers de l'accueil (les catégories, elles, n'en fournissent pas).
- Descriptions courtes ajoutées pour les 2 catégories Hydro et les 4 catégories Photovoltaïque
  (texte provisoire, flag `TODO-CONTENT` — voir `TODO-CONTENT.md`).
- Vérifié via Playwright sur Hydroélectricité (2 cartes) et Photovoltaïque (4 cartes) : expansion
  fluide, description révélée au survol, comportement identique à la grille de l'accueil, 0
  erreur console. Build + `astro check` au vert.

**Session 11 — correctif : cartes de l'accueil plus cliquables après navigation SPA (retour :
« hydro/PV/BESS/biogaz cliquables au premier chargement, plus cliquables après être revenu à
l'accueil »)**

- **Bug confirmé et reproduit** via Playwright : au premier chargement de "/", les 4 cartes
  univers sont cliquables. Après une navigation vers une autre page puis un retour à l'accueil
  via un lien du header (donc via `ClientRouter`, sans rechargement complet), les mêmes cartes ne
  répondent plus au clic.
- **Cause identifiée** : dans `ExpandingCardGrid.tsx`, le lien `<a>` cliquable de chaque carte était
  positionné en `absolute inset-0 z-20` par-dessus les autres calques (image, dégradé, texte).
  Diagnostic DOM avant/après navigation : le même élément, avec la même classe `z-20` toujours
  présente dans le HTML, a un `z-index` calculé de `20` au premier chargement mais de `auto`
  après un retour en navigation SPA — la règle CSS `.z-20 { z-index: 20 }` cesse de s'appliquer
  (cascade Tailwind v4 qui se comporte différemment après un swap de page par `ClientRouter`,
  cause exacte non élucidée côté Tailwind/Astro, mais le symptôme est net et reproductible). Le
  `<div>` de contenu (texte), lui, redevient alors le calque du dessus et intercepte les clics.
- **Correctif** : suppression de toute dépendance à un `z-index` explicite. Le calque de contenu
  passe en `pointer-events-none` (il ne doit de toute façon pas intercepter de clic) et le lien
  `<a>` est déplacé en **dernier enfant du DOM** — il se retrouve naturellement au-dessus des
  autres calques par simple ordre d'empilement (tous en `z-index:auto`, le dernier peint dans le
  DOM gagne), sans dépendre d'une classe CSS qui peut disparaître de la cascade. Plus robuste par
  construction, quel que soit le comportement de Tailwind/Astro sur ce point.
- Vérifié via Playwright : les 4 cartes restent cliquables après 1, 2 et 3 allers-retours de
  navigation SPA (testé individuellement sur Hydro/PV/BESS/Biogaz), effet de survol/agrandissement
  toujours fonctionnel visuellement, 0 erreur console. Build + `astro check` au vert.
- Ce correctif bénéficie aussi aux catégories de `ThematicTab` (Hydro/PV) qui utilisent le même
  composant générique, même si elles n'ont pas de lien actuellement.

**Session 12 — bannières photo pleine largeur (demande : « l'image en haut des pages Hydro/PV/
etc. doit prendre toute la largeur »)**

- `PhotoBanner.astro` : nouvelle prop `rounded?: boolean` (défaut `true`) pour permettre un mode
  edge-to-edge sans coins arrondis, en plus du mode encadré déjà utilisé ailleurs.
- Les 5 pages qui utilisent `PhotoBanner` (Hydroélectricité, Photovoltaïque, Flexibilité/BESS,
  Biogaz, Autoconsommation collective) : la bannière est sortie du conteneur `mx-auto max-w-6xl`
  et placée en tout premier enfant de `BaseLayout`, avec `rounded={false}` — elle occupe donc
  toute la largeur de l'écran, comme le hero de l'accueil. Hauteur légèrement augmentée
  (`h-[280px] md:h-[360px]` → `h-[320px] md:h-[420px]`) pour rester proportionnée à ce nouveau
  format plus large. Le reste du contenu (titre, `ThematicTab`...) reste dans le conteneur
  centré comme avant.
- Vérifié sur les 5 pages via Playwright : bannière bord à bord confirmée visuellement, 0 erreur
  console. Build + `astro check` au vert.

**Session 13 — 4 styles de frise chronologique, un par filière (demande : « montrer qu'on est
vraiment flexible, une frise différente par partie, c'est une démo »)**

- 3 nouveaux composants, même contrat de données que `Timeline.tsx` existant (`steps: TimelineStep[]`,
  `color?: string`) mais rendu radicalement différent — l'objectif explicite est de montrer en
  démo qu'un même contenu peut être présenté de plusieurs façons sans toucher à la structure :
  - `TimelineVertical.tsx` : ligne verticale à jalons numérotés, contenu à droite.
  - `TimelineProgress.tsx` : barre segmentée pleine largeur (une barre par étape) + légendes en
    grille en dessous (2 colonnes mobile, 1 ligne desktop).
  - `TimelineCards.tsx` : cartes bordées reliées par des flèches "→" entre elles.
  - `Timeline.tsx` (existant, inchangé) : cercles numérotés reliés par une ligne.
- `ThematicTab.tsx` : nouvelle prop `timelineVariant?: "dots" | "vertical" | "progress" | "cards"`
  (défaut `"dots"`, rétrocompatible) qui sélectionne le composant à rendre via une table de
  correspondance `TIMELINE_COMPONENTS` — un seul point de bascule, pas de duplication de logique.
- Un variant assigné par page : Photovoltaïque = `dots`, Flexibilité/BESS = `vertical`, Biogaz =
  `progress`, Hydroélectricité = `cards` (nouveau : cette page n'avait pas de frise avant, données
  ajoutées — voir `TODO-CONTENT.md`, calendrier générique par analogie avec le PV, probablement
  trop court pour un vrai projet hydroélectrique).
- Vérifié visuellement sur les 4 pages : les 4 rendus sont bien distincts, aucune régression sur
  le contenu existant (atouts, projets, catégories), 0 erreur console. Build + `astro check` au vert.

**Session 14 — rail de logos filières sur le côté (demande : « compenser l'absence des 4
services dans le header, petits logos sur le côté, seulement les 3 autres sur une page filière »)**

- Nouveau composant `ServiceRail.astro` : colonne de 4 petits logos (les icônes cercle pointillé
  déjà utilisées ailleurs), fixée sur le bord droit de l'écran, centrée verticalement. Tooltip
  coloré (couleur du thème) au survol pour nommer la filière sans encombrer visuellement l'icône
  au repos.
- Intégré dans `BaseLayout.astro` (donc présent sur toutes les pages) : la page courante est
  déduite de `Astro.url.pathname` côté serveur, et son propre logo est retiré de la liste — sur
  `/hydroelectricite` on ne voit que PV/BESS/Biogaz, sur les autres pages (accueil, société,
  contact...) les 4 s'affichent. Aucune logique client requise, tout est calculé au rendu de la
  page (compatible ClientRouter sans script supplémentaire).
- Masqué sur mobile (`hidden md:flex`) : un rail fixe sur le côté n'a pas sa place sur un petit
  écran, la navigation vers les filières y passe par le `ThemeSelector` de l'accueil.
- Vérifié via Playwright : 4 logos sur `/societe`, exactement 3 (sans hydro) sur
  `/hydroelectricite` avec les bons `href`, tooltip visible au survol, rail bien absent en
  viewport mobile (390px), 0 erreur console. Build + `astro check` au vert.

**Session 15 — effet "pilule qui s'ouvre" + logo qui tourne sur le rail (retour : « un genre
d'ouvert, le nom apparaît de façon fluide, faire tourner le logo »)**

- `ServiceRail.astro` remplacé : le tooltip flottant (span positionné à côté du rond) laisse
  place à un vrai effet d'ouverture — chaque item est un rond `max-w-[48px]` qui passe à
  `max-w-[220px]` au survol (`transition-all duration-500`), révélant le nom de la filière en
  couleur juste à côté du logo. Le texte est toujours dans le DOM (pas de tooltip séparé qui
  apparaît/disparaît), il se découvre simplement quand le conteneur s'élargit —d'où l'effet
  "ouvert" demandé plutôt qu'un popup.
- Rail passé en `items-end` : les pilules s'ouvrent vers la gauche (vers le contenu de la page),
  bord droit resté fixe — plus naturel pour un rail ancré à droite qu'une ouverture vers le bord
  de l'écran.
- Logo animé en rotation complète (`group-hover:rotate-[360deg]`, transition 700ms) pendant
  l'ouverture — cohérent avec la forme déjà circulaire du logo (cercle pointillé), effet "vivant"
  demandé.
- Vérifié via Playwright : `max-width` calculé passe bien de 48px à 220px au survol, le libellé
  le plus long ("Flexibilité / BESS") tient sans déborder ni être coupé, 0 erreur console. Build
  + `astro check` au vert. (La rotation elle-même ne se voit qu'en vrai navigateur — un
  screenshot statique ne capture pas l'animation en cours.)

## En cours

- Rien en cours activement — prototype dans un état stable et démontrable.

## Décisions prises

- **Astro + React (îlots) + Tailwind + Leaflet**, conformément à la stack imposée par
  l'utilisateur (pas d'alternative proposée, jugée pertinente telle quelle).
- `ProjectMap` en `client:only="react"` (Leaflet a besoin de `window`, pas de rendu SSR possible).
- `ThematicTab` et les autres composants React rendus **statiques** par défaut (`client:visible`
  seulement) — pas d'hydratation inutile, page plus légère.
- Marqueurs de carte en `L.divIcon` (cercles colorés custom) plutôt que l'icône par défaut
  Leaflet, pour éviter le problème classique d'icônes cassées avec les bundlers et coller à la
  charte couleur du site.
- Contenu du PDF **transcrit tel quel** quand disponible (chronologie BESS, atouts BESS, stats
  64 centrales PV / 11 centrales hydro 19,15 MW) plutôt qu'inventé — voir `TODO-CONTENT.md` pour
  le détail des passages encore provisoires.
- Catégories Photovoltaïque "Au sol" et "Agrivoltaïsme" laissées sans exemple de **projet** réel
  (absent des données fournies) plutôt que de fabriquer des projets fictifs — les stats/textes
  associés restent honnêtes même si l'illustration photo, elle, est désormais une photo de banque.
- **Revirement session 2** : la décision initiale « pas de photos stock » a été explicitement
  levée par l'utilisateur, qui a demandé de « belles photos Unsplash » avec logo en overlay pour
  coller au format de la maquette. Les photos restent des stand-ins (voir `TODO-CONTENT.md`) mais
  ne sont plus de simples blocs de couleur — nécessaire pour juger le rendu visuel réel en
  réunion.
- Registre `photos.ts` séparé de `themes.ts` : une seule URL par usage, faciles à repérer et à
  remplacer une par une par les vraies photos client sans toucher aux composants.
- **Stats hors du hero plutôt que calc(100vh - header)** : première tentative avec les stats
  ancrées dans le hero (`min-h-screen` + header sticky) faisait déborder la dernière rangée sous
  le fold, surtout sur mobile où le nav du header passe sur 2 lignes (hauteur de header
  variable, non fiable à soustraire en dur). Solution retenue : bandeau de stats séparé, plein
  largeur, fond sombre uni — robuste à toute hauteur de header/viewport sans JS de mesure.
- Stats du hero rendues en Astro pur (pas de `StatBadge`/React) : simple liste statique mappée
  côté serveur, aucune hydratation nécessaire pour du texte qui ne change jamais côté client.
  `StatBadge` reste utilisé tel quel ailleurs (fond blanc, couleur par filière), ce n'est pas le
  bon composant pour un bandeau sombre unicolore.
- **Header `fixed` + `--header-h` mesuré en JS plutôt qu'un padding en dur** : nécessaire pour
  que le header puisse flotter par-dessus la photo du hero (transparent) sans pousser le contenu,
  tout en gardant un espacement correct sur les autres pages malgré une hauteur de header
  variable (le nav passe sur 2 lignes en mobile). Une valeur `pt-*` fixe aurait cassé soit le
  desktop soit le mobile.
- **`ClientRouter` (astro:transitions) plutôt qu'un router custom** : c'est la fonctionnalité
  native d'Astro pour des transitions de page fluides sans reload complet — exactement l'argument
  "navigation smooth" demandé, sans dépendance ni framework JS supplémentaire. Composant renommé
  `ClientRouter` depuis Astro 5 (anciennement `ViewTransitions`) ; confirmé présent et fonctionnel
  en Astro 7.1.2 (version installée sur ce projet).
- Script du header basé sur l'événement `astro:page-load` (pas `DOMContentLoaded`) : requis pour
  que la logique transparent/scroll se réexécute correctement à chaque navigation SPA induite par
  `ClientRouter`, tout en fonctionnant aussi au tout premier chargement (l'événement se déclenche
  dans les deux cas).

## À faire

- Rien de bloquant pour la démo de jeudi. Pistes d'amélioration si le temps le permet avant la
  réunion :
  - Étoffer les pages Biogaz et Société avec du contenu moins générique si le client fournit des
    éléments avant jeudi.
  - Ajouter un léger effet de survol/sélection sur les marqueurs de la carte liés aux filtres.
  - Éventuellement un mode mobile plus travaillé (le responsive de base fonctionne mais n'a pas
    été testé sur device réel).
- Après la réunion (hors scope démo) : vraies photos (remplacer les stand-ins listés dans
  `TODO-CONTENT.md`, en particulier `hydroBasseChute`, `bessTerrain`, `biogaz`,
  `pvAgrivoltaisme`, `autoconsommation`), logos partenaires BESS, contenu définitif de toutes
  les sections listées dans `TODO-CONTENT.md`, formulaire de contact fonctionnel, infra de
  déploiement.
- Vérifier avec le client la licence Unsplash pour un usage prolongé en prod (les photos actuelles
  sont un stand-in de démo, pas destinées à rester) — normalement libre de droits commerciaux
  sans attribution, mais à reconfirmer si le site passe en production avec ces visuels.

## Blocages

- Aucun blocage actif.
- Point de vigilance (non bloquant) : les données `projects.json` ne couvrent que le
  Photovoltaïque (+ 1 site hybride hydro/PV) — aucun projet Hydroélectricité pur, BESS ou Biogaz
  disponible. Les pages correspondantes s'appuient sur du contenu provisoire faute de données
  réelles ; à combler avec le client dès que possible.
- Point de vigilance (non bloquant) : plusieurs photos Unsplash sont des stand-ins thématiquement
  imparfaits faute de mieux en banque libre (basse chute, BESS, biogaz, agrivoltaïsme,
  autoconsommation) — voir détail dans `TODO-CONTENT.md`. À remplacer en priorité par de vraies
  photos de projets Cayrol Energie dès qu'elles seront disponibles.
