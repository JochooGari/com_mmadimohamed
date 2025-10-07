import { PowerBIDashboard } from "@/types/powerbi-dashboard";

export const mockDashboards: PowerBIDashboard[] = [
  // Dashboard 1: Analyse des Stocks (Comptabilité)
  {
    id: "1",
    slug: "analyse-stocks-comptabilite",
    title: "Analyse des Stocks - Comptabilité",
    description:
      "Dashboard complet pour analyser la rotation, l'obsolescence et la valorisation des stocks avec alertes automatiques.",
    long_description: `Ce dashboard Power BI offre une vue complète de votre gestion de stock avec des indicateurs clés pour optimiser votre trésorerie et réduire les coûts.

**Fonctionnalités principales:**
- Analyse de rotation des stocks par catégorie et produit
- Détection automatique du stock mort (> 180 jours)
- Calcul de la couverture stock en mois
- Matrice ABC pour prioriser vos actions
- Alertes visuelles pour les stocks minimums

**Parfait pour:**
- Optimiser le working capital
- Réduire les coûts de stockage
- Identifier les produits à écouler
- Améliorer le cash flow`,

    topic: "comptabilite",
    sub_topics: ["stocks", "grand-livre"],
    personas: ["Expert-Comptable", "Contrôleur de Gestion", "DAF"],

    complexity: "intermediaire",
    visualization_types: [
      "kpi-cards",
      "line-charts",
      "bar-charts",
      "tables",
      "waterfall",
      "gauge",
    ],
    powerbi_version: "Power BI Desktop - Version Octobre 2024 ou supérieure",
    data_sources: ["SQL Server", "Excel", "SAP"],

    thumbnail_url: "/images/dashboards/stocks-thumb.jpg",
    screenshots: [
      "/images/dashboards/stocks-1.jpg",
      "/images/dashboards/stocks-2.jpg",
      "/images/dashboards/stocks-3.jpg",
    ],
    preview_url: undefined,

    pbix_file_url: "/files/dashboards/analyse-stocks.pbix",
    pbit_file_url: "/files/dashboards/analyse-stocks.pbit",
    documentation_url: "/files/dashboards/analyse-stocks-doc.pdf",

    views: 2847,
    downloads: 456,
    rating: 4.6,
    rating_count: 89,

    published: true,
    featured: true,
    published_at: "2024-09-15T10:00:00Z",
    created_at: "2024-09-10T08:00:00Z",
    updated_at: "2024-09-20T14:30:00Z",

    dax_measures: [
      {
        name: "Rotation Stock",
        formula: `Rotation Stock =
DIVIDE(
    [Coût des ventes],
    [Stock moyen],
    0
)`,
        description: "Mesure le nombre de fois où le stock est renouvelé par an",
      },
      {
        name: "Jours de Stock",
        formula: "Jours de Stock = 365 / [Rotation Stock]",
        description: "Nombre de jours moyen de détention du stock",
      },
      {
        name: "Stock Mort",
        formula: `Stock Mort =
CALCULATE(
    [Valeur Stock],
    FILTER(
        Stocks,
        Stocks[DernierMouvement] < TODAY() - 180
    )
)`,
        description: "Valeur du stock sans mouvement depuis plus de 180 jours",
      },
      {
        name: "Couverture Stock (mois)",
        formula: `Couverture Stock =
DIVIDE(
    [Valeur Stock],
    [Coût des ventes mensuel moyen],
    0
)`,
        description: "Nombre de mois de ventes couvert par le stock actuel",
      },
    ],

    use_cases: [
      "Réduire le working capital de 15-20%",
      "Identifier les produits en surstock",
      "Optimiser les commandes fournisseurs",
      "Préparer les clôtures comptables",
      "Améliorer la trésorerie",
    ],

    installation_guide: `## Installation

1. **Télécharger** le fichier .pbix ou .pbit
2. **Ouvrir** avec Power BI Desktop
3. **Configurer** la connexion à votre source de données:
   - SQL Server: Modifier la chaîne de connexion
   - Excel: Pointer vers vos fichiers
4. **Actualiser** les données
5. **Publier** sur Power BI Service

## Configuration requise

- Power BI Desktop (dernière version)
- Accès aux données: Stocks, Mouvements, Produits
- Tables requises: Stocks, Produits, Mouvements, DateTable

## Support

Pour toute question: contact@mmadimohamed.fr`,

    author_id: "user-123",
    kpis: [
      {
        id: "kpi-1",
        dashboard_id: "1",
        name: "Valeur totale du stock",
        description: "Valorisation totale du stock au coût d'achat",
        formula: "SUM(Stocks[ValeurStock])",
        display_order: 1,
        created_at: "2024-09-10T08:00:00Z",
      },
      {
        id: "kpi-2",
        dashboard_id: "1",
        name: "Rotation des stocks (jours)",
        description: "Nombre de jours moyen de rotation",
        formula: "365 / [Rotation Stock]",
        display_order: 2,
        created_at: "2024-09-10T08:00:00Z",
      },
      {
        id: "kpi-3",
        dashboard_id: "1",
        name: "Stock mort (> 180j)",
        description: "Valeur du stock obsolète",
        display_order: 3,
        created_at: "2024-09-10T08:00:00Z",
      },
      {
        id: "kpi-4",
        dashboard_id: "1",
        name: "Couverture stock (mois)",
        description: "Nombre de mois de ventes couvert",
        display_order: 4,
        created_at: "2024-09-10T08:00:00Z",
      },
    ],
  },

  // Dashboard 2: Valorisation d'Entreprise (Finance)
  {
    id: "2",
    slug: "valorisation-entreprise-finance",
    title: "Valorisation d'Entreprise DCF & Multiples",
    description:
      "Dashboard avancé pour la valorisation d'entreprise par DCF, multiples comparables et analyse de sensibilité.",
    long_description: `Dashboard professionnel pour les analystes financiers et opérations M&A. Intègre plusieurs méthodes de valorisation avec analyses de sensibilité.

**Méthodes incluses:**
- DCF (Discounted Cash Flow) avec terminal value
- Multiples de marché (EV/EBITDA, P/E, P/B)
- Comparables sectoriels
- Bridge de valorisation (Waterfall)
- Analyse de sensibilité WACC/Croissance

**Idéal pour:**
- Opérations M&A
- Levées de fonds
- Valorisations stratégiques
- Reporting investisseurs`,

    topic: "finance",
    sub_topics: ["valorisation", "rentabilite", "cashflow"],
    personas: ["CFO", "Directeur Financier", "Analyste Financier"],

    complexity: "avance",
    visualization_types: [
      "kpi-cards",
      "waterfall",
      "scatter",
      "tables",
      "gauge",
      "donut",
    ],
    powerbi_version: "Power BI Desktop - Version Octobre 2024 ou supérieure",
    data_sources: ["Excel", "SQL Server", "Azure"],

    thumbnail_url: "/images/dashboards/valorisation-thumb.jpg",
    screenshots: [],
    preview_url: undefined,

    pbix_file_url: "/files/dashboards/valorisation-entreprise.pbix",
    pbit_file_url: "/files/dashboards/valorisation-entreprise.pbit",
    documentation_url: "/files/dashboards/valorisation-doc.pdf",

    views: 1923,
    downloads: 234,
    rating: 4.8,
    rating_count: 45,

    published: true,
    featured: true,
    published_at: "2024-08-20T10:00:00Z",
    created_at: "2024-08-15T08:00:00Z",
    updated_at: "2024-09-01T14:30:00Z",

    dax_measures: [
      {
        name: "EV (Enterprise Value)",
        formula: "EV = [Market Cap] + [Dette nette] - [Trésorerie]",
        description: "Valeur d'entreprise",
      },
      {
        name: "Multiple EBITDA",
        formula: "Multiple EBITDA = DIVIDE([EV], [EBITDA], BLANK())",
        description: "Multiple de valorisation EV/EBITDA",
      },
      {
        name: "DCF",
        formula: `DCF =
SUMX(
    Periodes,
    DIVIDE(
        [Free Cash Flow],
        POWER(1 + [WACC], Periodes[Année])
    )
) + [Terminal Value]`,
        description: "Valorisation par actualisation des flux",
      },
    ],

    use_cases: [
      "Valorisation pre-exit ou M&A",
      "Due diligence financière",
      "Présentation investisseurs",
      "Simulation de scénarios",
    ],

    installation_guide: `## Installation

1. Télécharger le template .pbit
2. Ouvrir avec Power BI Desktop
3. Saisir les paramètres: WACC, Taux de croissance
4. Importer vos données financières
5. Publier et partager

## Prérequis

- Données financières historiques (3-5 ans)
- Prévisions de cash flows
- Données de marché (comparables)`,

    author_id: "user-123",
  },

  // Dashboard 3: Pipeline Commercial (Sales)
  {
    id: "3",
    slug: "pipeline-commercial-sales",
    title: "Pipeline Commercial & Forecast",
    description:
      "Suivi complet du pipeline commercial avec forecast pondéré, analyse des opportunités et performance par vendeur.",
    long_description: `Dashboard essentiel pour piloter votre activité commerciale et anticiper vos revenus futurs.

**Fonctionnalités:**
- Funnel de conversion visuel
- Forecast pondéré par probabilité
- Analyse du cycle de vente
- Win rate par commercial et produit
- Opportunités à risque
- Heatmap géographique

**Bénéfices:**
- Prévisions de CA fiables
- Identification des goulots d'étranglement
- Optimisation de la performance commerciale
- Meilleure allocation des ressources`,

    topic: "sales",
    sub_topics: ["pipeline", "performance", "geo"],
    personas: ["Directeur Commercial", "Sales Manager"],

    complexity: "intermediaire",
    visualization_types: [
      "kpi-cards",
      "funnel",
      "bar-charts",
      "line-charts",
      "tables",
    ],
    powerbi_version: "Power BI Desktop - Version Octobre 2024 ou supérieure",
    data_sources: ["Salesforce", "HubSpot", "SQL Server"],

    thumbnail_url: "/images/dashboards/pipeline-thumb.jpg",
    screenshots: [],

    pbix_file_url: "/files/dashboards/pipeline-commercial.pbix",
    pbit_file_url: "/files/dashboards/pipeline-commercial.pbit",

    views: 3421,
    downloads: 678,
    rating: 4.7,
    rating_count: 142,

    published: true,
    featured: false,
    published_at: "2024-09-01T10:00:00Z",
    created_at: "2024-08-25T08:00:00Z",
    updated_at: "2024-09-15T14:30:00Z",

    dax_measures: [
      {
        name: "Win Rate",
        formula: `Win Rate =
DIVIDE(
    CALCULATE(
        COUNT(Opportunités[ID]),
        Opportunités[Statut] = "Won"
    ),
    COUNT(Opportunités[ID]),
    0
)`,
        description: "Taux de conversion des opportunités",
      },
      {
        name: "Forecast Pondéré",
        formula: `Forecast Pondéré =
SUMX(
    Opportunités,
    Opportunités[Montant] * Opportunités[Probabilité %]
)`,
        description: "Prévision de CA pondérée par probabilité",
      },
    ],

    use_cases: [
      "Prévision de CA mensuel",
      "Coaching des équipes commerciales",
      "Identification des deals à risque",
      "Optimisation du cycle de vente",
    ],

    installation_guide: `## Installation rapide

1. Connecter à votre CRM (Salesforce/HubSpot)
2. Mapper les champs requis
3. Configurer les étapes du pipeline
4. Actualiser les données
5. Personnaliser les objectifs`,

    author_id: "user-123",
  },

  // Dashboard 4: Performance Campagnes Marketing
  {
    id: "4",
    slug: "performance-campagnes-marketing",
    title: "Performance Campagnes Marketing - ROI & CAC",
    description:
      "Analysez le ROI de vos campagnes marketing, le CAC par canal et l'attribution multi-touch.",
    long_description: `Dashboard marketing complet pour mesurer l'efficacité de vos investissements publicitaires et optimiser votre acquisition.

**Métriques clés:**
- ROAS par canal et campagne
- CAC vs LTV par segment
- Funnel d'acquisition
- Attribution multi-touch
- Engagement par canal social

**Optimisez:**
- Vos budgets marketing
- Le mix de canaux d'acquisition
- Les campagnes les plus rentables
- La conversion à chaque étape`,

    topic: "marketing",
    sub_topics: ["campagnes", "funnel", "seo"],
    personas: ["CMO", "Marketing Manager", "Growth Hacker"],

    complexity: "intermediaire",
    visualization_types: [
      "kpi-cards",
      "funnel",
      "treemap",
      "line-charts",
      "sankey",
    ],
    powerbi_version: "Power BI Desktop - Version Octobre 2024 ou supérieure",
    data_sources: ["Google Analytics", "Facebook Ads", "Google Ads", "HubSpot"],

    thumbnail_url: "/images/dashboards/marketing-thumb.jpg",
    screenshots: [],

    pbix_file_url: "/files/dashboards/performance-marketing.pbix",
    pbit_file_url: "/files/dashboards/performance-marketing.pbit",

    views: 2156,
    downloads: 389,
    rating: 4.5,
    rating_count: 78,

    published: true,
    featured: false,
    published_at: "2024-08-10T10:00:00Z",
    created_at: "2024-08-01T08:00:00Z",
    updated_at: "2024-08-25T14:30:00Z",

    dax_measures: [
      {
        name: "ROAS",
        formula: `ROAS =
DIVIDE(
    [Revenus générés],
    [Dépenses publicitaires],
    0
)`,
        description: "Return on Ad Spend",
      },
      {
        name: "CAC",
        formula: `CAC =
DIVIDE(
    [Coûts Marketing totaux],
    [Nouveaux clients],
    0
)`,
        description: "Coût d'acquisition client",
      },
      {
        name: "Conversion Rate",
        formula: `Conversion Rate =
DIVIDE(
    [Nombre de conversions],
    [Nombre de visiteurs],
    0
) * 100`,
        description: "Taux de conversion en %",
      },
    ],

    use_cases: [
      "Optimiser le mix marketing",
      "Réduire le CAC",
      "Identifier les meilleurs canaux",
      "Améliorer le ROI publicitaire",
    ],

    installation_guide: `## Installation

1. Connecter Google Analytics 4
2. Importer données Facebook Ads / Google Ads
3. Mapper les événements de conversion
4. Configurer l'attribution
5. Publier et automatiser`,

    author_id: "user-123",
  },

  // Dashboard 5: Tableau de Bord CFO (Finance)
  {
    id: "5",
    slug: "tableau-bord-cfo-finance",
    title: "Tableau de Bord CFO - P&L & Cash Flow",
    description:
      "Dashboard exécutif pour CFO avec P&L waterfall, cash flow bridge, KPIs financiers et rolling forecast.",
    long_description: `Dashboard financier complet pour la direction générale et le comité exécutif.

**Vue d'ensemble complète:**
- P&L avec waterfall EBITDA
- Cash flow bridge détaillé
- Working capital components
- Rolling forecast 12 mois
- Ratios financiers clés
- Budget vs Réalisé

**Pour:**
- Comités de direction
- Reporting investisseurs
- Pilotage financier
- Prise de décision stratégique`,

    topic: "finance",
    sub_topics: ["rentabilite", "cashflow", "budget"],
    personas: ["CFO", "Directeur Financier", "Contrôleur de Gestion"],

    complexity: "avance",
    visualization_types: [
      "kpi-cards",
      "waterfall",
      "line-charts",
      "bar-charts",
      "gauge",
    ],
    powerbi_version: "Power BI Desktop - Version Octobre 2024 ou supérieure",
    data_sources: ["SAP", "Oracle", "SQL Server", "Excel"],

    thumbnail_url: "/images/dashboards/cfo-thumb.jpg",
    screenshots: [],

    pbix_file_url: "/files/dashboards/tableau-bord-cfo.pbix",
    pbit_file_url: "/files/dashboards/tableau-bord-cfo.pbit",

    views: 4521,
    downloads: 892,
    rating: 4.9,
    rating_count: 187,

    published: true,
    featured: true,
    published_at: "2024-07-15T10:00:00Z",
    created_at: "2024-07-01T08:00:00Z",
    updated_at: "2024-09-01T14:30:00Z",

    dax_measures: [
      {
        name: "EBITDA",
        formula: "EBITDA = [Revenus] - [Coûts opérationnels]",
        description: "Résultat opérationnel avant amortissements",
      },
      {
        name: "Marge EBITDA %",
        formula: "Marge EBITDA % = DIVIDE([EBITDA], [Revenus], 0)",
        description: "Marge opérationnelle en pourcentage",
      },
      {
        name: "Working Capital",
        formula: "Working Capital = [Actif circulant] - [Passif circulant]",
        description: "Besoin en fonds de roulement",
      },
      {
        name: "Free Cash Flow",
        formula: `Free Cash Flow =
[EBITDA]
- [Capex]
- [Variation Working Capital]
- [Impôts]`,
        description: "Flux de trésorerie disponible",
      },
    ],

    use_cases: [
      "Reporting COMEX mensuel",
      "Présentation investisseurs",
      "Pilotage financier global",
      "Anticipation des besoins de trésorerie",
    ],

    installation_guide: `## Installation Enterprise

1. Connexion à l'ERP (SAP/Oracle)
2. Configuration des dimensions financières
3. Import du plan comptable
4. Paramétrage des budgets
5. Publication sur workspace dédié
6. Planification des actualisations

## Support premium disponible`,

    author_id: "user-123",
  },
];
