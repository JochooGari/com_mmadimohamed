export interface HeroContent {
  title: string;
  highlight: string;
  subtitle: string;
  description: string;
  cta: string;
  image: string;
}

export interface ExpertiseContent {
  strategy: string[];
  dashboards: string[];
}

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  image: string;
  date: string;
  tags: string[];
  published: boolean;
  readTime?: string;
}

export interface Resource {
  id: string;
  title: string;
  description: string;
  type: 'guide' | 'template' | 'tool';
  fileUrl: string;
  downloadCount: number;
  featured: boolean;
  category: string;
}

export interface ContactInfo {
  email: string;
  phone: string;
  address: string;
  message: string;
}

export interface SiteSettings {
  darkMode: boolean;
  theme: string;
}

export interface PortfolioContent {
  hero: HeroContent;
  expertise: ExpertiseContent;
  blog: BlogPost[];
  resources: Resource[];
  contact: ContactInfo;
  settings: SiteSettings;
  expertiseTitle?: string;
  expertiseSubtitle?: string;
  blogTitle?: string;
  blogSubtitle?: string;
  resourcesTitle?: string;
  resourcesSubtitle?: string;
  contactTitle?: string;
  contactSubtitle?: string;
} 