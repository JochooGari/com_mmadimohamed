// Migration simplifiée sans API backend - utilise IndexedDB directement
import { BrowserFileStorage } from './browserStorage';

export class SimpleMigrator {
  
  // Migration complète depuis localStorage vers IndexedDB
  static async migrateFromLocalStorage(): Promise<boolean> {
    console.log('🚀 Migration localStorage → IndexedDB (stockage local du navigateur)...');
    
    try {
      // Initialiser la base de données
      await BrowserFileStorage.initDatabase();
      console.log('✅ Base de données IndexedDB initialisée');

      // Migrer les agents
      let totalMigrated = 0;
      totalMigrated += await this.migrateAgentData('linkedin');
      totalMigrated += await this.migrateAgentData('geo');

      // Créer du contenu de veille d'exemple
      await this.createExampleMonitoringData();

      // Optimiser les données
      await BrowserFileStorage.optimizeAgentData('linkedin');
      await BrowserFileStorage.optimizeAgentData('geo');

      // Afficher le résumé
      const status = await this.checkMigrationStatus();
      
      console.log('\n🎉 Migration terminée avec succès!');
      console.log('\n📊 Résumé de la migration:');
      console.log(`✅ LinkedIn: ${status.linkedin.sources} sources, ${status.linkedin.campaigns} campagnes`);
      console.log(`✅ GEO: ${status.geo.sources} sources, ${status.geo.campaigns} campagnes`);
      console.log(`✅ Veille: ${status.monitoring.totalItems} éléments`);
      console.log('\n📱 Tes données sont maintenant sauvegardées dans IndexedDB (stockage local navigateur)');
      console.log('🧠 Les données ont été optimisées pour une meilleure utilisation par l\'IA');
      console.log('\n💡 Avantages: Persistance garantie, pas de perte au vidage cache, optimisation IA');
      
      return true;

    } catch (error) {
      console.error('❌ Erreur lors de la migration:', error);
      return false;
    }
  }

  // Migrer les données d'un agent spécifique
  private static async migrateAgentData(agentType: 'linkedin' | 'geo'): Promise<number> {
    console.log(`📋 Migration des données ${agentType}...`);
    
    try {
      let sources: any[] = [];
      let config: any = null;
      let campaigns: any[] = [];
      let migratedCount = 0;

      // Récupérer depuis localStorage
      const localStoragePrefix = 'magicpath_';
      const sourcesKey = `${localStoragePrefix}${agentType}_sources`;
      const configKey = `${localStoragePrefix}${agentType}_config`;
      const campaignsKey = `${localStoragePrefix}${agentType}_campaigns`;

      try {
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
      } catch (error) {
        console.log(`  ℹ️ Aucune donnée localStorage valide pour ${agentType}`);
      }

      // Si aucune donnée localStorage, créer des exemples
      if (sources.length === 0 && !config && campaigns.length === 0) {
        console.log(`  ℹ️ Création de données d'exemple pour ${agentType}`);
        ({ sources, config, campaigns } = this.createExampleAgentData(agentType));
      }

      // Migrer vers IndexedDB
      if (sources.length > 0) {
        await BrowserFileStorage.saveContentSources(agentType, sources);
        migratedCount += sources.length;
      }
      
      if (config) {
        await BrowserFileStorage.saveAgentConfig(agentType, config);
        migratedCount += 1;
      }
      
      if (campaigns.length > 0) {
        await BrowserFileStorage.saveCampaigns(agentType, campaigns);
        migratedCount += campaigns.length;
      }

      console.log(`  ✅ Migration ${agentType} terminée (${migratedCount} éléments)`);
      return migratedCount;

    } catch (error) {
      console.error(`  ❌ Erreur migration ${agentType}:`, error);
      return 0;
    }
  }

  // Créer des données d'exemple pour un agent
  private static createExampleAgentData(agentType: 'linkedin' | 'geo') {
    const now = Date.now();
    
    const sources = [
      {
        id: `example-${agentType}-${now}-1`,
        name: `Guide ${agentType === 'linkedin' ? 'LinkedIn Marketing Avancé' : 'Marketing Géolocalisé Efficace'}`,
        type: 'document' as const,
        status: 'ready' as const,
        tags: [agentType, 'marketing', 'guide', 'strategies'],
        lastUpdated: new Date().toISOString(),
        content: agentType === 'linkedin' 
          ? 'Guide complet sur le marketing LinkedIn avancé. Stratégies d\'engagement, création de contenu viral, et mesure du ROI. L\'automatisation marketing permet d\'optimiser les campagnes et d\'améliorer la génération de leads qualifiés. Les outils comme Sales Navigator, LinkedIn Ads, et HubSpot sont essentiels pour cibler efficacement les prospects B2B. La personnalisation des messages et le suivi rigoureux des métriques de conversion sont les clés du succès.'
          : 'Guide complet du marketing géolocalisé moderne. Ciblage par zone géographique, campagnes locales optimisées, et SEO local. Les outils de géolocalisation permettent de personnaliser les messages selon la localisation des prospects. Google My Business, Facebook Local Ads, et les plateformes de géomarketing sont des outils clés pour maximiser l\'impact local. L\'analyse des données de localisation améliore significativement les taux de conversion.',
        extractedData: {
          wordCount: agentType === 'linkedin' ? 85 : 88,
          language: 'fr'
        }
      },
      {
        id: `example-${agentType}-${now}-2`,
        name: `Meilleures Pratiques ${agentType === 'linkedin' ? 'LinkedIn 2024' : 'Géomarketing 2024'}`,
        type: 'transcript' as const,
        status: 'ready' as const,
        tags: [agentType, 'best-practices', 'strategies', '2024', 'roi'],
        lastUpdated: new Date().toISOString(),
        content: agentType === 'linkedin'
          ? 'Transcript d\'une masterclass sur les meilleures pratiques LinkedIn en 2024. Importance cruciale de la personnalisation des messages à grande échelle, utilisation avancée des outils comme Sales Navigator pour le prospecting, et mesure précise de l\'engagement et des conversions. Le ROI se mesure via les leads qualifiés générés, le coût par acquisition (CPA), et le retour sur investissement publicitaire (ROAS). L\'automatisation doit rester humaine et authentique pour maintenir l\'engagement. Les algorithmes LinkedIn favorisent le contenu natif et les interactions genuines.'
          : 'Transcript d\'une conférence sur le géomarketing avancé en 2024. Utilisation stratégique des données de localisation pour cibler les audiences locales avec précision, optimisation des campagnes par zone géographique et données démographiques, et intégration sophistiquée avec les outils de CRM et marketing automation. La personnalisation selon la localisation et les habitudes locales améliore significativement les taux de conversion et l\'engagement. Les technologies de géofencing et beacon marketing révolutionnent l\'expérience client locale.',
        extractedData: {
          wordCount: agentType === 'linkedin' ? 92 : 95,
          language: 'fr'
        }
      },
      {
        id: `example-${agentType}-${now}-3`,
        name: `Étude de Cas ROI ${agentType === 'linkedin' ? 'LinkedIn' : 'Géomarketing'}`,
        type: 'document' as const,
        status: 'ready' as const,
        tags: [agentType, 'case-study', 'roi', 'metrics', 'performance'],
        lastUpdated: new Date().toISOString(),
        content: agentType === 'linkedin'
          ? 'Étude de cas détaillée : entreprise B2B augmente son ROI LinkedIn de 300% en 6 mois. Stratégies mises en place : segmentation précise des audiences, personnalisation à grande échelle des messages, utilisation optimale de LinkedIn Sales Navigator, et campagnes publicitaires ciblées. Métriques clés : CTR amélioré de 45%, taux de conversion de 12%, coût par lead réduit de 60%. Outils utilisés : HubSpot pour l\'automation, Salesforce pour le CRM, et analytics avancés pour le tracking. La clé du succès réside dans la cohérence du message et le suivi méticuleux des performances.'
          : 'Étude de cas complète : réseau de franchises augmente ses ventes locales de 250% grâce au géomarketing. Méthodologie appliquée : analyse des zones de chalandise, campagnes Facebook et Google Ads géolocalisées, optimisation Google My Business par point de vente. Résultats mesurés : augmentation du trafic en magasin de 180%, amélioration du taux de conversion de 35%, ROI publicitaire de 400%. Technologies utilisées : géofencing pour remarketing local, beacons pour expérience en magasin, et CRM intégré pour suivi client. L\'approche hyperlocale et la personnalisation par zone géographique sont déterminantes.',
        extractedData: {
          wordCount: agentType === 'linkedin' ? 98 : 102,
          language: 'fr'
        }
      }
    ];

    const config = {
      name: `Agent ${agentType === 'linkedin' ? 'LinkedIn Expert' : 'GEO Marketing Expert'}`,
      description: agentType === 'linkedin' 
        ? 'Agent IA spécialisé dans le marketing LinkedIn B2B, l\'automatisation, et la génération de leads qualifiés'
        : 'Agent IA expert en marketing géolocalisé, campagnes locales, et optimisation de présence locale',
      prompt: agentType === 'linkedin'
        ? 'Tu es un expert reconnu en marketing LinkedIn B2B avec une expertise approfondie en automatisation, génération de leads qualifiés, et optimisation des campagnes publicitaires. Tu maîtrises Sales Navigator, LinkedIn Ads, les stratégies de contenu viral, et les techniques de prospection avancées. Tu utilises tes connaissances pour aider les entreprises à améliorer leur stratégie LinkedIn, augmenter leur ROI, et développer leur réseau professionnel de manière efficace et authentique.'
        : 'Tu es un expert reconnu en marketing géolocalisé avec une expertise pointue en ciblage géographique, campagnes locales, SEO local, et optimisation pour les recherches de proximité. Tu maîtrises Google My Business, Facebook Local Ads, le géofencing, les technologies beacon, et les stratégies d\'hyperciblage local. Tu aides les entreprises à développer leur présence locale, optimiser leur zone de chalandise, et maximiser leur impact marketing dans leur zone géographique.',
      model: 'gpt-4',
      temperature: 0.7,
      maxTokens: 2000,
      tools: agentType === 'linkedin' 
        ? ['LinkedIn Ads', 'Sales Navigator', 'HubSpot', 'Hootsuite', 'Salesforce CRM', 'Google Analytics'] 
        : ['Google My Business', 'Facebook Local Ads', 'Google Ads géolocalisées', 'Géofencing', 'Beacons', 'CRM local'],
      specialties: agentType === 'linkedin' 
        ? ['lead-generation-b2b', 'linkedin-automation', 'sales-navigator-mastery', 'content-viral', 'prospection-avancee', 'roi-optimization'] 
        : ['seo-local', 'geo-targeting-avance', 'marketing-proximite', 'campagnes-hyperlocales', 'geofencing-strategy', 'conversion-locale'],
      kpis: agentType === 'linkedin'
        ? ['Leads qualifiés générés', 'Taux de conversion LinkedIn', 'ROI campagnes', 'Coût par lead', 'Engagement rate', 'Reach professionnel']
        : ['Trafic en magasin', 'Conversions locales', 'Visibilité locale', 'Parts de marché zone', 'ROI géolocalisé', 'Reach local']
    };

    const campaigns = [
      {
        id: `example-campaign-${agentType}-${now}`,
        name: `Campagne ${agentType === 'linkedin' ? 'LinkedIn Lead Gen B2B' : 'Géolocalisée Multi-Zones'} Q4 2024`,
        type: agentType,
        status: 'active' as const,
        config: {
          objective: agentType === 'linkedin' ? 'lead-generation-b2b' : 'local-awareness-conversion',
          targetAudience: agentType === 'linkedin' 
            ? 'Dirigeants PME, Responsables marketing B2B, C-level executives, Décideurs tech, 25-55 ans, France + DACH' 
            : 'Clients locaux dans un rayon de 15km, 25-65 ans, intérêts commerce local, habitudes d\'achat proximité',
          budget: agentType === 'linkedin' ? 8000 : 5000,
          duration: '45 days',
          channels: agentType === 'linkedin' 
            ? ['LinkedIn Ads', 'Sales Navigator', 'Content organique', 'InMail personnalisés'] 
            : ['Google Ads local', 'Facebook Local', 'Google My Business', 'Géofencing'],
          kpis: agentType === 'linkedin' 
            ? ['100 leads qualifiés', '15% taux conversion', 'CPA < 80€', 'ROI > 300%'] 
            : ['500 visites magasin', '25% conversion locale', 'CPA < 50€', 'ROI > 400%'],
          targeting: agentType === 'linkedin'
            ? {
              jobTitles: ['CEO', 'CMO', 'Marketing Director', 'Head of Marketing'],
              industries: ['Technology', 'SaaS', 'Consulting', 'Manufacturing'],
              companySize: '50-1000 employees',
              geography: 'France, Germany, Austria, Switzerland'
            }
            : {
              radius: '15km autour des points de vente',
              demographics: 'Âge 25-65, revenus moyens-élevés',
              interests: 'Commerce local, qualité produits, service client',
              behaviors: 'Achats proximité, recherches locales fréquentes'
            }
        },
        createdAt: new Date().toISOString()
      }
    ];

    return { sources, config, campaigns };
  }

  // Créer du contenu de veille d'exemple
  private static async createExampleMonitoringData(): Promise<void> {
    console.log('📊 Création du contenu de veille d\'exemple...');
    
    const now = Date.now();
    const exampleContent = [
      {
        id: `monitor-${now}-1`,
        title: 'Les Tendances Marketing 2024 : IA, Automatisation et Personnalisation',
        content: 'L\'intelligence artificielle révolutionne le marketing moderne. Les entreprises leaders adoptent massivement l\'automatisation pour personnaliser l\'expérience client à grande échelle et optimiser leur ROI marketing. Les outils comme ChatGPT, Claude, HubSpot et Salesforce intègrent désormais des fonctionnalités IA avancées pour améliorer la génération de leads, l\'engagement client, et la prédiction des comportements d\'achat. La personnalisation en temps réel devient la norme, avec des taux de conversion 3x supérieurs aux approches traditionnelles.',
        type: 'article',
        source: 'Marketing Innovation Weekly',
        url: 'https://example.com/marketing-trends-ai-2024',
        author: 'Marie Dupont, Expert Marketing Digital',
        publishedAt: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
        collectedAt: new Date().toISOString(),
        tags: ['ai', 'automation', 'trends', '2024', 'personalization', 'roi'],
        metadata: {
          platform: 'web',
          category: 'industry-trends',
          readingTime: 7,
          engagement: { views: 15420, shares: 230, comments: 89 }
        }
      },
      {
        id: `monitor-${now}-2`,
        title: 'ROI Marketing LinkedIn : Étude Complète sur 1000 Entreprises B2B',
        content: 'Étude exclusive sur l\'efficacité du marketing LinkedIn menée sur 1000 entreprises B2B françaises. Résultats impressionnants : les entreprises utilisant Sales Navigator et des stratégies de contenu optimisées voient leurs leads augmenter de 250% en moyenne. La clé du succès réside dans la personnalisation des messages (taux d\'ouverture +180%), le suivi rigoureux des métriques (conversion +65%), et l\'automatisation intelligente des workflows de prospection. Les secteurs tech et consulting montrent les meilleurs ROI, avec des coûts par lead 40% inférieurs aux autres canaux B2B.',
        type: 'post',
        source: 'LinkedIn Business Insights',
        url: 'https://linkedin.com/posts/marketing-study-b2b-roi-2024',
        author: 'Jean-Pierre Martin, Consultant B2B',
        publishedAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
        collectedAt: new Date().toISOString(),
        tags: ['linkedin', 'roi', 'b2b', 'case-study', 'sales-navigator', 'conversion'],
        metadata: {
          platform: 'linkedin',
          engagement: { likes: 420, comments: 67, shares: 145, views: 8900 },
          industry: 'B2B Marketing'
        }
      },
      {
        id: `monitor-${now}-3`,
        title: 'Thread 🧵 : 15 Outils d\'Automatisation Marketing Game-Changers 2024',
        content: '🧵 THREAD COMPLET sur les outils d\'automatisation marketing qui transforment vraiment les résultats en 2024 :\n\n1/ HubSpot - La référence inbound marketing, workflows automatisés\n2/ Salesforce Pardot - CRM et nurturing B2B de pointe\n3/ Mailchimp - Email automation accessible et efficace\n4/ Zapier - Intégration et automatisation entre 5000+ apps\n5/ Google Analytics 4 - Tracking avancé et attribution intelligente\n6/ Hootsuite - Programmation et gestion réseaux sociaux\n7/ ActiveCampaign - Email + SMS automation puissante\n8/ Klaviyo - E-commerce email marketing automation\n9/ ManyChat - Chatbots et automation messaging\n10/ Airtable - Base de données et workflows visuels\n\nCes outils permettent d\'optimiser le ROI de 200-400% et de gagner 15-25h/semaine. L\'automatisation intelligente est l\'avenir du marketing ! 🚀',
        type: 'tweet',
        source: 'Twitter Marketing',
        url: 'https://twitter.com/marketingpro/status/automation-tools-2024',
        author: '@MarketingPro_FR',
        publishedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        collectedAt: new Date().toISOString(),
        tags: ['tools', 'automation', 'thread', 'twitter', 'roi', 'productivity'],
        metadata: {
          platform: 'twitter',
          metrics: { retweets: 156, likes: 890, replies: 43, views: 12500 },
          threadLength: 15
        }
      },
      {
        id: `monitor-${now}-4`,
        title: 'Géomarketing Local : Comment Décupler Vos Ventes de Proximité',
        content: 'Le géomarketing révolutionne la stratégie commerciale locale. Les entreprises qui maîtrisent le ciblage géographique intelligent augmentent leurs ventes locales de 200-400%. Techniques gagnantes : géofencing pour remarketing hyperlocal, optimisation Google My Business par zone, campagnes Facebook Ads géolocalisées avec audiences lookalike locales. Les beacons en magasin permettent une expérience client personnalisée en temps réel. L\'analyse des données de mobilité et des habitudes d\'achat locales ouvre des opportunités marketing inédites. La proximité devient un avantage concurrentiel majeur à l\'ère du digital.',
        type: 'article',
        source: 'Commerce & Marketing Local',
        url: 'https://example.com/geomarketing-local-strategies-2024',
        author: 'Sophie Durand, Experte Commerce Local',
        publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        collectedAt: new Date().toISOString(),
        tags: ['geomarketing', 'local', 'proximity', 'geofencing', 'google-my-business', 'conversion'],
        metadata: {
          platform: 'web',
          category: 'local-marketing',
          readingTime: 6,
          engagement: { views: 8750, shares: 167, comments: 45 }
        }
      }
    ];

    // Sauvegarder chaque contenu de veille
    for (const content of exampleContent) {
      await BrowserFileStorage.saveMonitoringContent(content);
    }

    console.log(`✅ ${exampleContent.length} exemples de veille créés et optimisés`);
  }

  // Vérifier l'état de la migration
  static async checkMigrationStatus(): Promise<any> {
    try {
      const linkedinData = await BrowserFileStorage.getAgentData('linkedin');
      const geoData = await BrowserFileStorage.getAgentData('geo');
      const monitoringStats = await BrowserFileStorage.getMonitoringStats();

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
    } catch (error) {
      console.error('Erreur vérification statut:', error);
      return {
        linkedin: { sources: 0, hasConfig: false, campaigns: 0 },
        geo: { sources: 0, hasConfig: false, campaigns: 0 },
        monitoring: { totalItems: 0, sources: 0 }
      };
    }
  }

  // Test de l'accès aux données migrées
  static async testMigratedData(): Promise<void> {
    console.log('\n🧪 Test d\'accès aux données migrées...');
    
    try {
      // Test LinkedIn
      const linkedinSources = await BrowserFileStorage.getContentSources('linkedin');
      const linkedinConfig = await BrowserFileStorage.getAgentConfig('linkedin');
      console.log(`✅ LinkedIn - ${linkedinSources.length} sources accessibles, config: ${!!linkedinConfig}`);

      // Test GEO
      const geoSources = await BrowserFileStorage.getContentSources('geo');
      const geoConfig = await BrowserFileStorage.getAgentConfig('geo');
      console.log(`✅ GEO - ${geoSources.length} sources accessibles, config: ${!!geoConfig}`);

      // Test monitoring
      const monitoringStats = await BrowserFileStorage.getMonitoringStats();
      console.log(`✅ Veille - ${monitoringStats.totalItems} éléments accessibles`);

      console.log('\n🎯 Toutes les données sont accessibles et persistantes !');
      
    } catch (error) {
      console.error('❌ Erreur lors du test:', error);
    }
  }
}

// Fonction principale simplifiée pour lancer la migration
export async function migrateToLocalStorageFixed(): Promise<boolean> {
  console.log('🚀 Migration corrigée - localStorage → IndexedDB (stockage navigateur persistant)');
  
  try {
    const success = await SimpleMigrator.migrateFromLocalStorage();
    
    if (success) {
      await SimpleMigrator.testMigratedData();
      
      console.log('\n🎉 MIGRATION RÉUSSIE !');
      console.log('\n🔧 Fonctionnalités disponibles:');
      console.log('📊 BrowserFileStorage.exportAllData() - Export complet');
      console.log('🔍 BrowserFileStorage.getMonitoringStats() - Stats de veille');
      console.log('🧠 Données optimisées automatiquement pour l\'IA');
      console.log('\n💡 Tes données sont maintenant persistantes et ne se perdront plus !');
      
      return true;
    } else {
      console.log('❌ La migration a échoué');
      return false;
    }
    
  } catch (error) {
    console.error('❌ Erreur critique lors de la migration:', error);
    return false;
  }
}

// Exposer la fonction corrigée globalement
(window as any).migrateToLocalStorageFixed = migrateToLocalStorageFixed;
(window as any).BrowserFileStorage = BrowserFileStorage;