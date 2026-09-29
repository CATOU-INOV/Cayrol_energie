// Contenu réel des 5 types de pose photovoltaïque, transcrit tel quel du document client
// "Page_photovoltaïque_site_web.docx" (retour_site_internet/) — texte déjà validé par Cayrol
// Energie, pas un placeholder. Chaque entrée alimente une page dédiée /photovoltaique/[slug],
// demandée par le client ("faire une page dédiée pour chaque type de pose").
//
// Le site distinguait jusqu'ici 4 catégories (Hangar fondu dans Toiture, voir TODO-CONTENT.md) ;
// le docx client les traite comme 5 solutions distinctes, donc c'est ce qui est repris ici. La
// grille "Nos types d'installations" (ExpandingCardGrid, photovoltaique.astro) reste à 4 cases
// pour l'instant — à ajuster séparément si le client confirme vouloir 5 entrées visibles.

import type { PhotoKey } from "./photos";

export interface SolutionBlock {
  /** Titre du bloc de bénéfices (ex: "Valorisez votre patrimoine immobilier :") */
  title: string;
  /** Paragraphe d'intro du bloc, avant la liste — optionnel, tous les blocs n'en ont pas. */
  intro?: string;
  items: string[];
}

export interface PhotovoltaiqueSolution {
  slug: string;
  label: string;
  /** Accroche courte type "Grâce aux toitures solaires, valorisez une surface inexploitée." */
  tagline: string;
  intro: string;
  /** Étiquette courte affichée sur la photo (maquette client cayrol-photovoltaique.html). */
  badge?: string;
  /** Paragraphe "Ce qu'il faut savoir" (maquette client cayrol-photovoltaique.html). */
  knowMore?: string;
  image: PhotoKey;
  blocks: SolutionBlock[];
}

export const photovoltaiqueSolutions: PhotovoltaiqueSolution[] = [
  {
    slug: "toiture",
    label: "Toitures solaires",
    tagline: "Grâce aux toitures solaires, valorisez une surface inexploitée.",
    intro:
      "L'installation de panneaux photovoltaïques par Cayrol Energie sur des toitures existantes permet de mettre en valeur ces zones inexploitées et de maximiser le rendement des bâtiments.",
    badge: "Toiture & hangar agricole",
    knowMore:
      "Sans emprise au sol supplémentaire : bâtiments agricoles, industriels ou tertiaires peuvent accueillir une centrale sur une surface déjà existante, tout en bénéficiant d'une rénovation de la couverture.",
    image: "pvToiture",
    blocks: [
      {
        title: "Valorisez votre patrimoine immobilier",
        items: [
          "Optimisez le rendement de votre bâtiment",
          "Réduisez votre facture d'électricité",
          "Rénovez la toiture de votre bâtiment",
          "Disposez de revenus complémentaires sur le long terme",
          "Bénéficiez de l'autoconsommation",
        ],
      },
      {
        title: "Améliorez votre communication",
        items: [
          "Valorisez l'image éco-responsable de votre entreprise",
          "Participez à la sensibilisation locale pour le développement des énergies renouvelables",
          "Associez votre activité à une dynamique moderne sensible au réchauffement climatique",
        ],
      },
      {
        title: "Participez à la Transition Énergétique",
        items: [
          "Participez à l'échelle locale au développement des énergies renouvelables",
          "Développez de manière raisonnée et durable votre territoire",
          "Soyez acteur de la transition énergétique en contribuant au « Territoire à Energie Positive » (TEPos)",
        ],
      },
      {
        title: "Bénéficiez d'une prise en charge totale",
        intro:
          "La société Cayrol Energie assure le développement du projet photovoltaïque depuis le premier contact jusqu'à la mise en service. Elle prend en charge :",
        items: [
          "Le dimensionnement de l'installation",
          "Les démarches administratives",
          "Le raccordement au réseau",
          "Le contrat de vente de l'électricité",
          "L'étude technique",
          "Les marchés et assurances",
          "Le financement",
          "Le suivi de construction",
          "La mise en service",
          "Les contrôles et vérifications techniques ponctuelles",
          "La gestion administrative et technique",
          "La maintenance préventive et curative",
        ],
      },
    ],
  },
  {
    slug: "hangar",
    label: "Hangars photovoltaïques",
    tagline: "Grâce aux hangars photovoltaïques, disposez d'un espace de stockage.",
    intro:
      "Cette offre, essentiellement dédiée aux agriculteurs, permet de disposer gratuitement d'un lieu de stockage pour le matériel agricole et de valoriser l'exploitation grâce au bâtiment couvert de panneaux solaires. Le projet consiste à édifier sur une parcelle du propriétaire un bâtiment agricole standard en charpente métallique. Généralement construit en zone agricole, le hangar photovoltaïque peut avoir une destination de stockage agricole ou d'élevage à laquelle vient s'associer la production d'énergie renouvelable.",
    image: "pvToiture",
    blocks: [
      {
        title: "Valorisez votre exploitation",
        items: [
          "Bénéficiez d'un espace de stockage conséquent de 1500 m²",
          "Devenez propriétaire du bâtiment au terme du bail",
          "Valorisez un terrain en développant votre outil de travail",
          "Réduisez votre facture d'électricité",
        ],
      },
      {
        title: "Améliorez l'image de votre exploitation",
        items: [
          "Valorisez l'image éco-responsable de votre activité",
          "Participez à la sensibilisation locale pour une agriculture durable",
        ],
      },
      {
        title: "Participez à la Transition Énergétique",
        items: [
          "Participez à l'échelle locale au développement des énergies renouvelables",
          "Développez votre activité dans le respect de l'environnement",
        ],
      },
      {
        title: "Bénéficiez de notre offre clé en main",
        intro:
          "Du permis de construire à la mise en service, les équipes de Cayrol Energie se chargent de toutes les démarches pour mener à bien le projet en collaboration avec le propriétaire et sans surprise.",
        items: [
          "Dimensionnement de l'installation en fonction de vos besoins",
          "Prise en charge du permis de construire",
          "Démarches administratives",
          "Raccordement au réseau",
          "Contrat de vente de l'électricité",
          "Étude technique",
          "Marchés et assurances",
          "Financement",
          "Chantier",
          "Mise en service",
          "Contrôles et vérifications techniques ponctuels",
          "Gestion administrative et technique",
          "Maintenance préventive et curative",
        ],
      },
    ],
  },
  {
    slug: "ombrieres",
    label: "Ombrières photovoltaïques",
    tagline: "Grâce aux ombrières photovoltaïques, couvrez votre parking.",
    intro:
      "L'installation d'ombrières de parking, par Cayrol Energie, est le meilleur moyen de mettre en valeur ces espaces délaissés par la production d'énergie verte, tout en apportant du confort aux usagers.",
    badge: "Parkings & espaces extérieurs",
    knowMore:
      "Une double fonction : produire de l'électricité renouvelable et protéger visiteurs et véhicules des intempéries et de la chaleur — avec, si besoin, des bornes de recharge électrique.",
    image: "pvOmbrieres",
    blocks: [
      {
        title: "Valorisez votre propriété foncière",
        items: [
          "Optimisez vos revenus en valorisant au maximum votre espace",
          "Réduisez votre facture d'électricité",
        ],
      },
      {
        title: "Améliorez votre service",
        items: [
          "Protégez vos clients et visiteurs face aux intempéries et à la chaleur",
          "Apportez un service pour vous démarquer de la concurrence en protégeant leurs véhicules",
          "Proposez une solution de recharge de véhicules électriques",
          "Valorisez l'image éco-responsable de votre activité",
        ],
      },
      {
        title: "Participez à la Transition Énergétique",
        items: [
          "Participez à l'échelle locale au développement des énergies renouvelables",
          "Développez votre démarche RSE en participant à la transition écologique",
          "Soyez acteur de la transition énergétique en contribuant au « Territoire à Energie Positive » (TEPos)",
        ],
      },
      {
        title: "Bénéficiez de notre expérience",
        intro:
          "Notre société s'appuie sur une équipe d'ingénieurs spécialisés dans le domaine photovoltaïque. La société Cayrol Energie prend en charge l'ensemble des démarches techniques et administratives pour mener à bien le projet et faciliter son déroulement :",
        items: [
          "Le dimensionnement de l'installation",
          "La prise en charge du permis de construire",
          "Les démarches administratives et environnementales",
          "Le raccordement au réseau",
          "Le contrat de vente de l'électricité",
          "L'étude technique",
          "Les marchés et assurances",
          "Le financement",
          "Le chantier",
          "La mise en service",
          "Les contrôles et vérifications techniques ponctuels",
          "La gestion administrative et technique",
          "La maintenance préventive et curative",
        ],
      },
    ],
  },
  {
    slug: "agrivoltaisme",
    label: "Agrivoltaïsme",
    tagline: "Grâce à l'agrivoltaïsme, améliorez vos rendements.",
    intro:
      "L'agrivoltaïsme consiste en l'installation de panneaux solaires sur des cultures agricoles. Cette pratique, qui permet de protéger les cultures tout en produisant de l'énergie renouvelable, se décline sous plusieurs formes. Le principal objectif est d'apporter des solutions de protection des cultures pour lutter contre les événements climatiques et ainsi améliorer les rendements agricoles. Les solutions proposées par Cayrol Energie sont les serres photovoltaïques et les persiennes photovoltaïques.",
    badge: "Serres & persiennes photovoltaïques",
    knowMore:
      "L'objectif : lutter contre les aléas climatiques et améliorer les rendements agricoles, en conciliant enjeux agricoles, énergétiques et climatiques.",
    image: "pvAgrivoltaisme",
    blocks: [
      {
        title: "Les serres photovoltaïques",
        intro:
          "En rapprochant le secteur agricole et celui des énergies renouvelables, la construction de serres photovoltaïques par Cayrol Energie présente de nombreux atouts.",
        items: [
          "La structure rigide de la serre permet une protection des cultures contre les aléas climatiques et les nuisibles",
          "Les ouvrants automatiques et le système de pilotage de l'hygrométrie permettent de réguler une atmosphère favorable à la culture",
          "La maîtrise des différents paramètres climatiques (ensoleillement, apport hydrique, chaleur, etc.) permet une augmentation des rendements",
        ],
      },
      {
        title: "Les persiennes photovoltaïques",
        intro:
          "L'installation de persiennes photovoltaïques pour la culture de fruits est une solution récente et novatrice. Le projet consiste à installer des structures photovoltaïques destinées à protéger les vergers de la canicule et du gel. Un algorithme complexe, basé sur des études R&D, permet de piloter l'orientation des panneaux solaires en fonction des besoins hydriques, des besoins d'ensoleillement et de température de la plante ainsi que de son système racinaire. Ce système est adapté à différentes cultures : la vigne, le kiwi, la pomme, la poire.",
        items: [
          "L'orientation des panneaux solaires autour d'un axe permet d'optimiser la croissance de la plante",
          "Le système permet de protéger la culture contre le gel, la grêle, les nuisibles et le vent",
          "Il permet la régulation de la température du sol et de réduire les besoins hydriques",
          "Les structures sont prévues pour être équipées d'un système d'irrigation et adaptées au travail des machines agricoles",
          "La structure support est un réel atout pour l'agriculteur, qui bénéficie des poteaux pour la mise en place de palissage",
          "Les rendements sont augmentés et les pertes de cultures par aléa climatique sont au contraire largement réduites",
        ],
      },
      {
        title: "Améliorez vos revenus agricoles et l'image de votre exploitation",
        items: [
          "Développez un projet agricole qui ne serait pas économiquement viable sans être associé à un projet énergétique",
          "Exploitez des terres délaissées à cause de contraintes climatiques",
          "Valorisez l'image éco-responsable de votre activité",
          "Participez à la sensibilisation locale pour une agriculture durable",
          "Devenez pionnier de l'agrivoltaïsme",
        ],
      },
      {
        title: "Participez à la Transition Énergétique",
        items: [
          "Participez à l'échelle locale au développement des énergies renouvelables",
          "Montrez la compatibilité entre agriculture et développement durable",
        ],
      },
      {
        title: "Laissez-vous guider par nos experts",
        intro:
          "Les projets agrivoltaïques sont des projets novateurs dont la priorité est de répondre à des objectifs de production agricole. Notre société accompagne l'exploitant agricole dans son projet depuis la phase d'étude jusqu'à la réalisation suivant les différentes étapes ci-dessous :",
        items: [
          "Le dimensionnement de l'installation en fonction du projet et du type de culture",
          "La prise en charge du permis de construire",
          "Les démarches administratives",
          "Le raccordement au réseau",
          "Le contrat de vente de l'électricité",
          "L'étude technique",
          "Les marchés et assurances",
          "Le financement",
          "Le chantier",
          "La mise en service",
          "Les contrôles et vérifications techniques ponctuels",
          "La gestion administrative et technique",
          "La maintenance préventive et curative",
        ],
      },
    ],
  },
  {
    slug: "sol",
    label: "Centrales au sol",
    tagline: "Grâce aux centrales photovoltaïques au sol, valorisez vos terrains inexploités.",
    intro:
      "Les centrales photovoltaïques au sol permettent la mise en valeur de terrains inexploités par la production d'énergie renouvelable locale. Ce type de projet réalisé par Cayrol Energie permet la réhabilitation de sites très souvent dégradés (friche industrielle, décharge, carrière) et contribue à l'indépendance énergétique des territoires. Il existe sur chaque commune des zones polluées ou délaissées et bien souvent inexploitables pour diverses raisons. Ces zones inertes ont un fort potentiel de développement énergétique qu'il convient d'étudier en cohérence avec les enjeux locaux.",
    badge: "Friches, carrières, terrains dégradés",
    knowMore:
      "Chaque commune compte des zones polluées ou délaissées, inexploitables pour diverses raisons. Ces zones ont un fort potentiel énergétique, étudié en cohérence avec les enjeux locaux.",
    image: "pvAuSol",
    blocks: [
      {
        title: "Valorisez vos espaces fonciers",
        items: [
          "Utilisez des terrains dégradés ou pollués pour produire de l'énergie renouvelable",
          "Bénéficiez de revenus fonciers complémentaires",
          "Diversifiez vos activités",
          "Valorisez le sol tout en préservant la biodiversité grâce à la mise en place d'éco-pâturage d'ovins et caprins, de ruches…",
        ],
      },
      {
        title: "Participez à la Transition Énergétique",
        items: [
          "Valorisez l'image éco-responsable de la commune",
          "Contribuez à l'intérêt collectif de développement des énergies renouvelables",
        ],
      },
      {
        title: "Bénéficiez de notre accompagnement",
        intro:
          "Du permis de construire à la mise en service, les équipes de Cayrol Energie se chargent de toutes les démarches pour mener à bien le projet en collaboration avec les collectivités, l'administration et le propriétaire.",
        items: [
          "Dimensionnement de l'installation suivant le potentiel du site",
          "Recherche d'optimisation",
          "Prise en charge du permis de construire",
          "Démarches administratives DDT, DREAL",
          "Raccordement au réseau ENEDIS",
          "Contrat de vente de l'électricité",
          "Étude technique",
          "Marchés et assurances",
          "Financement",
          "Chantier",
          "Mise en service",
          "Contrôles et vérifications techniques ponctuels",
          "Gestion administrative et technique",
          "Maintenance préventive et curative",
        ],
      },
    ],
  },
];

export function getSolutionBySlug(slug: string): PhotovoltaiqueSolution | undefined {
  return photovoltaiqueSolutions.find((s) => s.slug === slug);
}
