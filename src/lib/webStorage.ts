// Système de stockage adapté pour l'environnement web
import { ContentSource, Agent, Campaign } from './types';

export class WebFileStorage {
  private static apiUrl = '/api/storage';

  // Créer la structure des dossiers
  static async createDirectoryStructure(): Promise<boolean> {
    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create_structure' })
      });
      
      const result = await response.json();
      return result.success;
    } catch (error) {
      console.error('Erreur création structure:', error);
      return false;
    }
  }

  // Sauvegarder les sources de contenu
  static async saveContentSources(agentType: 'linkedin' | 'geo', sources: ContentSource[]): Promise<boolean> {
    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'save_sources',
          agentType,
          data: sources
        })
      });
      
      const result = await response.json();
      if (result.success) {
        console.log(`✅ ${result.count} sources sauvegardées pour ${agentType}`);
      }
      return result.success;
    } catch (error) {
      console.error('Erreur sauvegarde sources:', error);
      return false;
    }
  }

  // Récupérer les sources de contenu
  static async getContentSources(agentType: 'linkedin' | 'geo'): Promise<ContentSource[]> {
    try {
      const response = await fetch(`${this.apiUrl}?agent=${agentType}&type=sources`);
      const sources = await response.json();
      return Array.isArray(sources) ? sources : [];
    } catch (error) {
      console.error('Erreur récupération sources:', error);
      return [];
    }
  }

  // Sauvegarder la configuration d'un agent
  static async saveAgentConfig(agentType: 'linkedin' | 'geo', config: any): Promise<boolean> {
    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'save_config',
          agentType,
          data: config
        })
      });
      
      const result = await response.json();
      if (result.success) {
        console.log(`✅ Configuration sauvegardée pour ${agentType}`);
      }
      return result.success;
    } catch (error) {
      console.error('Erreur sauvegarde config:', error);
      return false;
    }
  }

  // Récupérer la configuration d'un agent
  static async getAgentConfig(agentType: 'linkedin' | 'geo'): Promise<any> {
    try {
      const response = await fetch(`${this.apiUrl}?agent=${agentType}&type=config`);
      const config = await response.json();
      return Array.isArray(config) ? null : config;
    } catch (error) {
      console.error('Erreur récupération config:', error);
      return null;
    }
  }

  // Sauvegarder les campagnes
  static async saveCampaigns(agentType: 'linkedin' | 'geo', campaigns: Campaign[]): Promise<boolean> {
    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'save_campaigns',
          agentType,
          data: campaigns
        })
      });
      
      const result = await response.json();
      if (result.success) {
        console.log(`✅ ${result.count} campagnes sauvegardées pour ${agentType}`);
      }
      return result.success;
    } catch (error) {
      console.error('Erreur sauvegarde campagnes:', error);
      return false;
    }
  }

  // Récupérer les campagnes
  static async getCampaigns(agentType: 'linkedin' | 'geo'): Promise<Campaign[]> {
    try {
      const response = await fetch(`${this.apiUrl}?agent=${agentType}&type=campaigns`);
      const campaigns = await response.json();
      return Array.isArray(campaigns) ? campaigns : [];
    } catch (error) {
      console.error('Erreur récupération campagnes:', error);
      return [];
    }
  }

  // Optimiser les données pour l'IA
  static async optimizeAgentData(agentType: 'linkedin' | 'geo'): Promise<boolean> {
    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'optimize_data',
          agentType
        })
      });
      
      const result = await response.json();
      if (result.success) {
        console.log(`🧠 Données optimisées pour l'agent ${agentType}`);
      }
      return result.success;
    } catch (error) {
      console.error('Erreur optimisation:', error);
      return false;
    }
  }

  // Sauvegarder contenu de monitoring
  static async saveMonitoringContent(content: any): Promise<boolean> {
    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'save_monitoring',
          data: content
        })
      });
      
      const result = await response.json();
      if (result.success) {
        console.log(`📊 Contenu de veille sauvegardé: ${content.title}`);
      }
      return result.success;
    } catch (error) {
      console.error('Erreur sauvegarde monitoring:', error);
      return false;
    }
  }

  // Récupérer les statistiques de monitoring
  static async getMonitoringStats(): Promise<any> {
    try {
      const response = await fetch(`${this.apiUrl}?agent=monitoring&type=stats`);
      const stats = await response.json();
      return stats;
    } catch (error) {
      console.error('Erreur récupération stats monitoring:', error);
      return {
        lastUpdated: '',
        totalItems: 0,
        byType: {},
        bySource: {},
        byDate: {},
        keywords: {}
      };
    }
  }

  // Récupérer toutes les données d'un agent
  static async getAgentData(agentType: 'linkedin' | 'geo') {
    const [sources, config, campaigns] = await Promise.all([
      this.getContentSources(agentType),
      this.getAgentConfig(agentType),
      this.getCampaigns(agentType)
    ]);

    return {
      type: agentType,
      sources,
      config,
      campaigns,
      exported: new Date().toISOString()
    };
  }
}

// Classe pour la migration depuis localStorage
export class LocalStorageMigrator {
  
  // Migrer toutes les données depuis localStorage
  static async migrateFromLocalStorage(): Promise<boolean> {
    console.log('🚀 Migration depuis localStorage vers fichiers locaux...');
    
    try {
      // Créer la structure de dossiers
      const structureCreated = await WebFileStorage.createDirectoryStructure();
      if (!structureCreated) {
        throw new Error('Impossible de créer la structure de dossiers');
      }
      console.log('✅ Structure de dossiers créée');

      // Migrer les agents
      await this.migrateAgentData('linkedin');
      await this.migrateAgentData('geo');

      // Créer du contenu de veille d'exemple
      await this.createExampleMonitoringData();

      // Optimiser les données
      await WebFileStorage.optimizeAgentData('linkedin');
      await WebFileStorage.optimizeAgentData('geo');

      console.log('🎉 Migration terminée avec succès!');
      return true;

    } catch (error) {
      console.error('❌ Erreur lors de la migration:', error);
      return false;
    }
  }

  // Migrer les données d'un agent
  private static async migrateAgentData(agentType: 'linkedin' | 'geo'): Promise<void> {
    console.log(`📋 Migration des données ${agentType}...`);
    
    try {
      // Tenter de récupérer depuis localStorage (si la classe existe)
      let sources: ContentSource[] = [];
      let config: any = null;
      let campaigns: Campaign[] = [];

      // Vérifier si localStorage contient des données
      const localStoragePrefix = 'magicpath_';
      const sourcesKey = `${localStoragePrefix}${agentType}_sources`;
      const configKey = `${localStoragePrefix}${agentType}_config`;
      const campaignsKey = `${localStoragePrefix}${agentType}_campaigns`;

      // Récupérer depuis localStorage
      const sourcesData = localStorage.getItem(sourcesKey);
      const configData = localStorage.getItem(configKey);
      const campaignsData = localStorage.getItem(campaignsKey);

      if (sourcesData) {
        sources = JSON.parse(sourcesData);
        console.log(`  📄 ${sources.length} sources trouvées dans localStorage`);
      }

      if (configData) {
        config = JSON.parse(configData);
        console.log(`  ⚙️ Configuration trouvée dans localStorage`);
      }

      if (campaignsData) {
        campaigns = JSON.parse(campaignsData);
        console.log(`  🎯 ${campaigns.length} campagnes trouvées dans localStorage`);
      }

      // Si aucune donnée localStorage, créer des exemples
      if (sources.length === 0 && !config && campaigns.length === 0) {
        console.log(`  ℹ️ Aucune donnée localStorage pour ${agentType}, création d'exemples`);
        ({ sources, config, campaigns } = this.createExampleAgentData(agentType));
      }

      // Migrer vers le nouveau système
      await WebFileStorage.saveContentSources(agentType, sources);
      if (config) {
        await WebFileStorage.saveAgentConfig(agentType, config);
      }
      if (campaigns.length > 0) {
        await WebFileStorage.saveCampaigns(agentType, campaigns);
      }

      console.log(`  ✅ Migration ${agentType} terminée`);

    } catch (error) {
      console.log(`  ⚠️ Erreur migration ${agentType}:`, error);
      // Créer des données d'exemple en cas d'erreur
      const { sources, config, campaigns } = this.createExampleAgentData(agentType);
      await WebFileStorage.saveContentSources(agentType, sources);
      await WebFileStorage.saveAgentConfig(agentType, config);
      await WebFileStorage.saveCampaigns(agentType, campaigns);
    }
  }

  // Créer des données d'exemple pour un agent
  private static createExampleAgentData(agentType: 'linkedin' | 'geo') {
    const sources: ContentSource[] = [
      {
        id: `example-${agentType}-${Date.now()}-1`,
        name: `Guide ${agentType === 'linkedin' ? 'LinkedIn Marketing' : 'Marketing Géolocalisé'}`,
        type: 'document',
        status: 'ready',
        tags: [agentType, 'marketing', 'guide'],
        lastUpdated: new Date().toISOString(),
        content: agentType === 'linkedin' 
          ? 'Guide complet sur le marketing LinkedIn. Stratégies d\'engagement, création de contenu, et mesure du ROI. L\'automatisation marketing permet d\'optimiser les campagnes et d\'améliorer la génération de leads. Les outils comme Sales Navigator et LinkedIn Ads sont essentiels pour cibler efficacement les prospects.'
          : 'Guide du marketing géolocalisé. Ciblage par zone géographique, campagnes locales, et optimisation pour les recherches locales. Les outils de géolocalisation permettent de personnaliser les messages selon la localisation. Google My Business et Facebook Local Ads sont des plateformes clés.',
        extractedData: {
          wordCount: 50,
          language: 'fr'
        }
      },
      {
        id: `example-${agentType}-${Date.now()}-2`,
        name: `Meilleures Pratiques ${agentType === 'linkedin' ? 'LinkedIn' : 'Géomarketing'}`,
        type: 'transcript',
        status: 'ready',
        tags: [agentType, 'best-practices', 'strategies'],
        lastUpdated: new Date().toISOString(),
        content: agentType === 'linkedin'
          ? 'Transcript d\'une session sur les meilleures pratiques LinkedIn. Importance de la personnalisation des messages, utilisation des outils comme Sales Navigator, et mesure de l\'engagement. Le ROI se mesure via les conversions et la génération de leads qualifiés. L\'automatisation doit rester humaine et personnalisée.'
          : 'Transcript sur le géomarketing. Utilisation des données de localisation pour cibler les audiences locales, optimisation des campagnes par zone géographique, et intégration avec les outils de CRM. La personnalisation selon la localisation améliore significativement les taux de conversion et l\'engagement local.',
        extractedData: {
          wordCount: 60,
          language: 'fr'
        }
      }
    ];

    const config = {
      name: `Agent ${agentType === 'linkedin' ? 'LinkedIn' : 'GEO'} Expert`,
      description: agentType === 'linkedin' 
        ? 'Agent spécialisé dans le marketing et l\'automatisation LinkedIn'
        : 'Agent spécialisé dans le marketing géolocalisé et les campagnes locales',
      prompt: agentType === 'linkedin'
        ? 'Tu es un expert en marketing LinkedIn avec une expertise approfondie en automatisation, génération de leads, et optimisation des campagnes. Tu utilises tes connaissances pour aider les utilisateurs à améliorer leur stratégie LinkedIn et leur ROI.'
        : 'Tu es un expert en marketing géolocalisé avec une expertise en ciblage géographique, campagnes locales, et optimisation pour les recherches locales. Tu aides les utilisateurs à développer des stratégies marketing adaptées à leur zone géographique.',
      model: 'gpt-4',
      temperature: 0.7,
      maxTokens: 2000,
      tools: agentType === 'linkedin' 
        ? ['LinkedIn Ads', 'Sales Navigator', 'HubSpot', 'Hootsuite'] 
        : ['Google My Business', 'Facebook Local Ads', 'Géolocalisation', 'Local SEO'],
      specialties: agentType === 'linkedin' 
        ? ['lead-generation', 'engagement', 'automation', 'b2b-marketing'] 
        : ['local-seo', 'geo-targeting', 'local-campaigns', 'proximity-marketing']
    };

    const campaigns: Campaign[] = [
      {
        id: `example-campaign-${agentType}-${Date.now()}`,
        name: `Campagne ${agentType === 'linkedin' ? 'LinkedIn Lead Gen' : 'Géolocalisée Q1'}`,
        type: agentType,
        status: 'active',
        config: {
          objective: agentType === 'linkedin' ? 'lead-generation' : 'local-awareness',
          targetAudience: agentType === 'linkedin' 
            ? 'Business professionals, Marketing managers, C-level executives' 
            : 'Local customers within 5km radius, age 25-55',
          budget: agentType === 'linkedin' ? 5000 : 3000,
          duration: '30 days',
          kpis: agentType === 'linkedin' 
            ? ['leads generated', 'cost per lead', 'conversion rate'] 
            : ['local reach', 'store visits', 'local engagement']
        },
        createdAt: new Date().toISOString()
      }
    ];

    return { sources, config, campaigns };
  }

  // Créer du contenu de veille d'exemple
  private static async createExampleMonitoringData(): Promise<void> {
    console.log('📊 Création du contenu de veille d\'exemple...');
    
    const exampleContent = [
      {
        id: `monitor-${Date.now()}-1`,
        title: 'Les Tendances Marketing 2024 : IA et Automatisation',
        content: 'L\'intelligence artificielle transforme le paysage marketing. Les entreprises adoptent de plus en plus l\'automatisation pour personnaliser l\'expérience client et optimiser leur ROI. Les outils comme ChatGPT, HubSpot et Salesforce intègrent désormais des fonctionnalités IA avancées pour améliorer la génération de leads et l\'engagement client.',
        type: 'article',
        source: 'Marketing Weekly',
        url: 'https://example.com/marketing-trends-2024',
        author: 'Marie Dupont',
        publishedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        collectedAt: new Date().toISOString(),
        tags: ['ai', 'automation', 'trends', '2024'],
        metadata: {
          platform: 'web',
          category: 'industry-trends',
          readingTime: 5
        }
      },
      {
        id: `monitor-${Date.now()}-2`,
        title: 'ROI du Marketing LinkedIn : Étude de Cas Complète',
        content: 'Étude approfondie sur l\'amélioration du ROI grâce à LinkedIn. Une entreprise B2B a augmenté ses leads de 250% en utilisant Sales Navigator et des campagnes ciblées. La clé du succès : personnalisation des messages, suivi rigoureux des métriques, et automatisation intelligente des workflows de prospection.',
        type: 'post',
        source: 'LinkedIn',
        url: 'https://linkedin.com/posts/example-roi-study',
        author: 'Jean Marketing Expert',
        publishedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        collectedAt: new Date().toISOString(),
        tags: ['linkedin', 'roi', 'case-study', 'b2b'],
        metadata: {
          platform: 'linkedin',
          engagement: { likes: 150, comments: 25, shares: 30 }
        }
      },
      {
        id: `monitor-${Date.now()}-3`,
        title: 'Thread: 10 Outils d\'Automatisation Marketing Incontournables',
        content: '🧵 Thread sur les outils d\'automatisation marketing les plus efficaces en 2024: 1/ HubSpot pour l\'inbound marketing 2/ Mailchimp pour l\'email automation 3/ Zapier pour l\'intégration 4/ Salesforce pour le CRM 5/ Google Analytics pour le tracking 6/ Hootsuite pour les réseaux sociaux... Ces outils permettent d\'optimiser le ROI et de gagner du temps précieux.',
        type: 'tweet',
        source: 'Twitter',
        url: 'https://twitter.com/marketingpro/status/example',
        author: '@MarketingPro',
        publishedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        collectedAt: new Date().toISOString(),
        tags: ['tools', 'automation', 'thread', 'twitter'],
        metadata: {
          platform: 'twitter',
          metrics: { retweets: 45, likes: 120, replies: 15 }
        }
      }
    ];

    // Sauvegarder chaque contenu
    for (const content of exampleContent) {
      await WebFileStorage.saveMonitoringContent(content);
    }

    console.log(`✅ ${exampleContent.length} exemples de veille créés`);
  }

  // Vérifier l'état de la migration
  static async checkMigrationStatus(): Promise<any> {
    const linkedinData = await WebFileStorage.getAgentData('linkedin');
    const geoData = await WebFileStorage.getAgentData('geo');
    const monitoringStats = await WebFileStorage.getMonitoringStats();

    return {
      linkedin: {
        sources: linkedinData.sources.length,
        hasConfig: !!linkedinData.config,
        campaigns: linkedinData.campaigns.length
      },
      geo: {
        sources: geoData.sources.length,
        hasConfig: !!geoData.config,
        campaigns: geoData.campaigns.length
      },
      monitoring: {
        totalItems: monitoringStats.totalItems,
        sources: Object.keys(monitoringStats.bySource).length
      }
    };
  }
}

// Fonction principale pour lancer la migration
export async function migrateTolocalStorage(): Promise<boolean> {
  console.log('🚀 Démarrage de la migration vers le stockage local...');
  
  try {
    const success = await LocalStorageMigrator.migrateFromLocalStorage();
    
    if (success) {
      const status = await LocalStorageMigrator.checkMigrationStatus();
      
      console.log('\n🎉 Migration terminée avec succès!');
      console.log('\n📊 Résumé de la migration:');
      console.log(`✅ LinkedIn: ${status.linkedin.sources} sources, ${status.linkedin.campaigns} campagnes`);
      console.log(`✅ GEO: ${status.geo.sources} sources, ${status.geo.campaigns} campagnes`);
      console.log(`✅ Veille: ${status.monitoring.totalItems} éléments, ${status.monitoring.sources} sources`);
      console.log('\n📁 Tes données sont maintenant sauvegardées localement dans le dossier data/');
      console.log('🧠 Les données ont été optimisées pour une meilleure utilisation par l\'IA');
      
      return true;
    } else {
      console.log('❌ La migration a échoué');
      return false;
    }
    
  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
    return false;
  }
}

// Exposer la fonction globalement pour utilisation depuis la console
(window as any).migrateTolocalStorage = migrateTolocalStorage;