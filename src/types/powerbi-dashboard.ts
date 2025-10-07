// Types pour la bibliothèque Power BI

export type DashboardTopic = 'finance' | 'comptabilite' | 'sales' | 'marketing' | 'supply-chain';
export type DashboardComplexity = 'debutant' | 'intermediaire' | 'avance';

export interface PowerBIDashboard {
  id: string;
  slug: string;
  title: string;
  description: string;
  long_description?: string;

  // Taxonomie
  topic: DashboardTopic;
  sub_topics: string[];
  personas: string[];

  // Métadonnées
  complexity: DashboardComplexity;
  visualization_types: string[];
  powerbi_version?: string;
  data_sources: string[];

  // Médias
  thumbnail_url?: string;
  screenshots: string[];
  preview_url?: string;

  // Fichiers
  pbix_file_url?: string;
  pbit_file_url?: string;
  documentation_url?: string;

  // Stats
  views: number;
  downloads: number;
  rating: number;
  rating_count: number;

  // SEO & Publication
  published: boolean;
  featured: boolean;
  published_at?: string;
  created_at: string;
  updated_at: string;

  // Contenu technique
  dax_measures: DaxMeasure[];
  use_cases: string[];
  installation_guide?: string;

  // Auteur
  author_id: string;

  // Relations (optionnelles)
  kpis?: DashboardKPI[];
}

export interface DaxMeasure {
  name: string;
  formula: string;
  description?: string;
}

export interface DashboardKPI {
  id: string;
  dashboard_id: string;
  name: string;
  description?: string;
  formula?: string;
  display_order: number;
  created_at: string;
}

export interface DashboardRating {
  id: string;
  dashboard_id: string;
  user_id: string;
  rating: number;
  comment?: string;
  created_at: string;
  updated_at: string;
}

export interface DashboardDownload {
  id: string;
  dashboard_id: string;
  user_email?: string;
  ip_address?: string;
  user_agent?: string;
  downloaded_at: string;
}

// Filtres
export interface DashboardFilters {
  search?: string;
  topics?: DashboardTopic[];
  personas?: string[];
  sub_topics?: string[];
  complexity?: DashboardComplexity[];
  visualization_types?: string[];
  date_added?: 'week' | 'month' | 'quarter';
  sort_by?: 'recent' | 'popular' | 'downloads' | 'rating';
}

// Topics avec métadonnées
export interface TopicMetadata {
  id: DashboardTopic;
  label: string;
  icon: string;
  color: string;
  personas: string[];
  sub_topics: SubTopic[];
}

export interface SubTopic {
  id: string;
  label: string;
  description?: string;
}

// Configuration des topics
export const TOPICS: TopicMetadata[] = [
  {
    id: 'finance',
    label: 'Finance',
    icon: '📊',
    color: '#8B5CF6', // Violet
    personas: ['CFO', 'Directeur Financier', 'Contrôleur de Gestion', 'Analyste Financier'],
    sub_topics: [
      { id: 'valorisation', label: 'Valorisation d\'entreprise', description: 'DCF, Multiples, Comparable' },
      { id: 'rentabilite', label: 'Analyse de rentabilité', description: 'EBITDA, ROI, ROE' },
      { id: 'budget', label: 'Budget vs Réalisé', description: 'Écarts, Forecast, Trending' },
      { id: 'cashflow', label: 'Cash Flow Management', description: 'Trésorerie, Working Capital' },
      { id: 'couts', label: 'Analyse des coûts', description: 'ABC Costing, Centres de coûts' },
    ],
  },
  {
    id: 'comptabilite',
    label: 'Comptabilité',
    icon: '💼',
    color: '#3B82F6', // Blue
    personas: ['Expert-Comptable', 'Comptable', 'DAF'],
    sub_topics: [
      { id: 'stocks', label: 'Analyse des stocks', description: 'Rotation, Obsolescence, Valorisation' },
      { id: 'balance-agee', label: 'Balance âgée', description: 'Clients, Fournisseurs, Recouvrement' },
      { id: 'grand-livre', label: 'Grand livre & Balance générale' },
      { id: 'rapprochement', label: 'Rapprochement bancaire' },
      { id: 'immobilisations', label: 'Immobilisations', description: 'Amortissements, Acquisitions' },
    ],
  },
  {
    id: 'sales',
    label: 'Sales',
    icon: '📈',
    color: '#10B981', // Green
    personas: ['Directeur Commercial', 'Sales Manager', 'Business Developer'],
    sub_topics: [
      { id: 'pipeline', label: 'Pipeline commercial', description: 'Opportunités, Conversion, Forecast' },
      { id: 'performance', label: 'Performance par vendeur', description: 'Quota, Achievement, KPIs' },
      { id: 'geo', label: 'Analyse géographique des ventes' },
      { id: 'clv', label: 'Customer Lifetime Value', description: 'CLV, Churn, Retention' },
      { id: 'winloss', label: 'Win/Loss Analysis' },
    ],
  },
  {
    id: 'marketing',
    label: 'Marketing',
    icon: '🎯',
    color: '#F59E0B', // Orange
    personas: ['CMO', 'Marketing Manager', 'Growth Hacker'],
    sub_topics: [
      { id: 'campagnes', label: 'Performance des campagnes', description: 'ROI, CAC, ROAS' },
      { id: 'funnel', label: 'Analyse du funnel', description: 'Acquisition, Conversion, Rétention' },
      { id: 'seo', label: 'SEO & Analytics', description: 'Traffic, Engagement, Bounce Rate' },
      { id: 'social', label: 'Social Media Performance' },
      { id: 'email', label: 'Email Marketing', description: 'Open Rate, CTR, Conversions' },
    ],
  },
  {
    id: 'supply-chain',
    label: 'Supply Chain',
    icon: '📦',
    color: '#EF4444', // Red
    personas: ['Supply Chain Manager', 'Logisticien', 'Acheteur'],
    sub_topics: [
      { id: 'gestion-stocks', label: 'Gestion des stocks', description: 'Stock Rotation, Safety Stock' },
      { id: 'fournisseurs', label: 'Performance fournisseurs', description: 'Délais, Qualité, Coûts' },
      { id: 'achats', label: 'Analyse des achats' },
      { id: 'previsions', label: 'Prévisions de demande' },
      { id: 'logistique', label: 'Logistique & Transport' },
    ],
  },
];

// Types de visualisation disponibles
export const VISUALIZATION_TYPES = [
  { id: 'kpi-cards', label: 'KPI Cards' },
  { id: 'line-charts', label: 'Line Charts' },
  { id: 'bar-charts', label: 'Bar Charts' },
  { id: 'maps', label: 'Maps' },
  { id: 'tables', label: 'Tables' },
  { id: 'waterfall', label: 'Waterfall' },
  { id: 'funnel', label: 'Funnel' },
  { id: 'treemap', label: 'Treemap' },
  { id: 'scatter', label: 'Scatter Plot' },
  { id: 'gauge', label: 'Gauge' },
  { id: 'sankey', label: 'Sankey' },
  { id: 'donut', label: 'Donut' },
];

// Helper functions
export function getTopicColor(topic: DashboardTopic): string {
  return TOPICS.find(t => t.id === topic)?.color || '#00A99D';
}

export function getTopicLabel(topic: DashboardTopic): string {
  return TOPICS.find(t => t.id === topic)?.label || topic;
}

export function getTopicIcon(topic: DashboardTopic): string {
  return TOPICS.find(t => t.id === topic)?.icon || '📊';
}

export function getComplexityLabel(complexity: DashboardComplexity): string {
  const labels: Record<DashboardComplexity, string> = {
    debutant: 'Débutant',
    intermediaire: 'Intermédiaire',
    avance: 'Avancé',
  };
  return labels[complexity];
}

export function getComplexityColor(complexity: DashboardComplexity): string {
  const colors: Record<DashboardComplexity, string> = {
    debutant: '#10B981', // Green
    intermediaire: '#F59E0B', // Orange
    avance: '#EF4444', // Red
  };
  return colors[complexity];
}
