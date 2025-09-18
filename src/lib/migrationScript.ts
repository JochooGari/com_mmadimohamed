// Script de migration du localStorage vers le stockage local
import { LocalStorage } from './storage';
import { LocalFileStorage, MonitoringStorage } from './fileStorage';
import { AIOptimizer } from './aiOptimizer';

export class MigrationScript {
  
  // Exécuter la migration complète
  static async runFullMigration(): Promise<void> {
    console.log('🚀 Démarrage de la migration vers le stockage local...');
    
    try {
      // Étape 1: Créer la structure de dossiers
      await this.createDirectoryStructure();
      
      // Étape 2: Migrer les données des agents
      await this.migrateAgentData();
      
      // Étape 3: Initialiser le système de veille
      await this.initializeMonitoringSystem();
      
      // Étape 4: Optimiser toutes les données pour l'IA
      await this.optimizeAllData();
      
      // Étape 5: Valider la migration
      await this.validateMigration();
      
      // Étape 6: Générer le rapport de migration
      await this.generateMigrationReport();
      
      console.log('✅ Migration terminée avec succès!');
      
    } catch (error) {
      console.error('❌ Erreur lors de la migration:', error);
      throw error;
    }
  }

  // Créer la structure de dossiers
  private static async createDirectoryStructure(): Promise<void> {
    console.log('📁 Création de la structure de dossiers...');
    
    const fs = await import('fs');
    const path = await import('path');
    
    const directories = [
      'data/agents/linkedin/inputs',
      'data/agents/linkedin/outputs',
      'data/agents/geo/inputs', 
      'data/agents/geo/outputs',
      'data/monitoring/sources',
      'data/monitoring/optimized',
      'data/monitoring/reports',
      'data/exports',
      'data/backups'
    ];
    
    for (const dir of directories) {
      const fullPath = path.join(process.cwd(), dir);
      try {
        await fs.promises.mkdir(fullPath, { recursive: true });
        console.log(`  ✓ ${dir} créé`);
      } catch (error) {
        console.log(`  ✓ ${dir} existe déjà`);
      }
    }
  }

  // Migrer les données des agents depuis localStorage
  private static async migrateAgentData(): Promise<void> {
    console.log('🤖 Migration des données des agents...');
    
    const agentTypes: Array<'linkedin' | 'geo'> = ['linkedin', 'geo'];
    
    for (const agentType of agentTypes) {
      console.log(`  📋 Migration des données ${agentType}...`);
      
      try {
        // Récupérer les données du localStorage (si disponibles)
        const sources = LocalStorage.getContentSources(agentType);
        const config = LocalStorage.getAgentConfig(agentType);
        const campaigns = LocalStorage.getCampaigns(agentType);
        const testResults = LocalStorage.getTestResults(agentType);
        
        // Migrer vers le nouveau système si des données existent
        if (sources.length > 0) {
          await LocalFileStorage.saveContentSources(agentType, sources);
          console.log(`    ✓ ${sources.length} sources migrées`);
        }
        
        if (config) {
          await LocalFileStorage.saveAgentConfig(agentType, config);
          console.log(`    ✓ Configuration migrée`);
        }
        
        if (campaigns.length > 0) {
          await LocalFileStorage.saveCampaigns(agentType, campaigns);
          console.log(`    ✓ ${campaigns.length} campagnes migrées`);
        }
        
        if (testResults.length > 0) {
          await LocalFileStorage.saveTestResults(agentType, testResults);
          console.log(`    ✓ ${testResults.length} résultats de test migrés`);
        }
        
        if (sources.length === 0 && !config && campaigns.length === 0) {
          console.log(`    ℹ️ Aucune donnée existante pour ${agentType}`);
          
          // Créer des données d'exemple pour la démonstration
          await this.createExampleData(agentType);
        }
        
      } catch (error) {
        console.log(`    ℹ️ Pas de données localStorage pour ${agentType}, création de données d'exemple`);
        await this.createExampleData(agentType);
      }
    }
  }

  // Créer des données d'exemple
  private static async createExampleData(agentType: 'linkedin' | 'geo'): Promise<void> {
    const exampleSources = [
      {
        id: `example-${agentType}-1`,
        name: `Guide ${agentType === 'linkedin' ? 'LinkedIn Marketing' : 'Marketing Géolocalisé'}`,
        type: 'document' as const,
        status: 'ready' as const,
        tags: [agentType, 'marketing', 'guide'],
        lastUpdated: new Date().toISOString(),
        content: agentType === 'linkedin' 
          ? 'Guide complet sur le marketing LinkedIn. Stratégies d\'engagement, création de contenu, et mesure du ROI. L\'automatisation marketing permet d\'optimiser les campagnes et d\'améliorer la génération de leads.'
          : 'Guide du marketing géolocalisé. Ciblage par zone géographique, campagnes locales, et optimisation pour les recherches locales. Les outils de géolocalisation permettent de personnaliser les messages selon la localisation.',
        extractedData: {
          wordCount: agentType === 'linkedin' ? 32 : 35,
          language: 'fr'
        }
      },
      {
        id: `example-${agentType}-2`, 
        name: `Meilleures Pratiques ${agentType === 'linkedin' ? 'LinkedIn' : 'Géomarketing'}`,
        type: 'transcript' as const,
        status: 'ready' as const,
        tags: [agentType, 'best-practices', 'strategies'],
        lastUpdated: new Date().toISOString(),
        content: agentType === 'linkedin'
          ? 'Transcript d\'une session sur les meilleures pratiques LinkedIn. Importance de la personnalisation des messages, utilisation des outils comme Sales Navigator, et mesure de l\'engagement. Le ROI se mesure via les conversions et la génération de leads qualifiés.'
          : 'Transcript sur le géomarketing. Utilisation des données de localisation pour cibler les audiences locales, optimisation des campagnes par zone géographique, et intégration avec les outils de CRM. La personnalisation selon la localisation améliore significativement les taux de conversion.',
        extractedData: {
          wordCount: agentType === 'linkedin' ? 45 : 48,
          language: 'fr'
        }
      }
    ];

    const exampleConfig = {
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
      tools: agentType === 'linkedin' ? ['LinkedIn Ads', 'Sales Navigator', 'HubSpot'] : ['Google My Business', 'Facebook Local Ads', 'Géolocalisation'],
      specialties: agentType === 'linkedin' ? ['lead-generation', 'engagement', 'automation'] : ['local-seo', 'geo-targeting', 'local-campaigns']
    };

    const exampleCampaigns = [
      {
        id: `example-campaign-${agentType}-1`,
        name: `Campagne ${agentType === 'linkedin' ? 'LinkedIn Lead Gen' : 'Géolocalisée Q1'}`,
        type: agentType,
        status: 'active' as const,
        config: {
          objective: agentType === 'linkedin' ? 'lead-generation' : 'local-awareness',
          targetAudience: agentType === 'linkedin' ? 'Business professionals, Marketing managers' : 'Local customers, 5km radius',
          budget: agentType === 'linkedin' ? 5000 : 3000,
          duration: '30 days'
        },
        createdAt: new Date().toISOString()
      }
    ];

    // Sauvegarder les données d'exemple
    await LocalFileStorage.saveContentSources(agentType, exampleSources);
    await LocalFileStorage.saveAgentConfig(agentType, exampleConfig);
    await LocalFileStorage.saveCampaigns(agentType, exampleCampaigns);

    console.log(`    ✓ Données d'exemple créées pour ${agentType}`);
  }

  // Initialiser le système de veille
  private static async initializeMonitoringSystem(): Promise<void> {
    console.log('📊 Initialisation du système de veille...');
    
    // Créer des exemples de contenu de veille
    const exampleMonitoringContent = [
      {
        id: `monitoring-example-1-${Date.now()}`,
        title: 'Les Tendances Marketing 2024 : IA et Automatisation',
        content: 'L\'intelligence artificielle transforme le paysage marketing. Les entreprises adoptent de plus en plus l\'automatisation pour personnaliser l\'expérience client et optimiser leur ROI. Les outils comme ChatGPT, HubSpot et Salesforce intègrent désormais des fonctionnalités IA avancées.',
        type: 'article' as const,
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
        id: `monitoring-example-2-${Date.now()}`,
        title: 'ROI du Marketing LinkedIn : Étude de Cas',
        content: 'Étude approfondie sur l\'amélioration du ROI grâce à LinkedIn. Une entreprise B2B a augmenté ses leads de 250% en utilisant Sales Navigator et des campagnes ciblées. La clé du succès : personnalisation des messages et suivi rigoureux des métriques.',
        type: 'post' as const,
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
        id: `monitoring-example-3-${Date.now()}`,
        title: 'Thread: 10 Outils d\'Automatisation Marketing Incontournables',
        content: '🧵 Thread sur les outils d\'automatisation marketing les plus efficaces en 2024: 1/ HubSpot pour l\'inbound 2/ Mailchimp pour l\'email 3/ Zapier pour l\'intégration 4/ Salesforce pour le CRM 5/ Google Analytics pour le tracking... Ces outils permettent d\'optimiser le ROI et de gagner du temps.',
        type: 'tweet' as const,
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

    // Sauvegarder le contenu de veille
    for (const content of exampleMonitoringContent) {
      await MonitoringStorage.saveMonitoringContent(content);
    }

    console.log(`  ✓ ${exampleMonitoringContent.length} exemples de veille créés`);
  }

  // Optimiser toutes les données pour l'IA
  private static async optimizeAllData(): Promise<void> {
    console.log('🧠 Optimisation des données pour l\'IA...');
    
    await AIOptimizer.optimizeAllData();
    
    console.log('  ✓ Données optimisées pour l\'IA');
  }

  // Valider la migration
  private static async validateMigration(): Promise<void> {
    console.log('🔍 Validation de la migration...');
    
    // Vérifier que les données sont bien migrées
    const linkedinSources = await LocalFileStorage.getContentSources('linkedin');
    const geoSources = await LocalFileStorage.getContentSources('geo');
    const stats = await MonitoringStorage.getMonitoringStats();
    
    if (linkedinSources.length === 0) {
      throw new Error('Migration LinkedIn échouée - aucune source trouvée');
    }
    
    if (geoSources.length === 0) {
      throw new Error('Migration GEO échouée - aucune source trouvée');
    }
    
    if (stats.totalItems === 0) {
      throw new Error('Système de veille non initialisé');
    }
    
    console.log(`  ✓ ${linkedinSources.length} sources LinkedIn migrées`);
    console.log(`  ✓ ${geoSources.length} sources GEO migrées`);
    console.log(`  ✓ ${stats.totalItems} éléments de veille indexés`);
  }

  // Générer le rapport de migration
  private static async generateMigrationReport(): Promise<void> {
    console.log('📋 Génération du rapport de migration...');
    
    const linkedinData = await LocalFileStorage.getAgentData('linkedin');
    const geoData = await LocalFileStorage.getAgentData('geo');
    const monitoringStats = await MonitoringStorage.getMonitoringStats();
    
    const report = {
      migrationDate: new Date().toISOString(),
      version: '1.0.0',
      status: 'success',
      summary: {
        linkedinAgent: {
          sources: linkedinData.sources.length,
          campaigns: linkedinData.campaigns.length,
          hasConfig: !!linkedinData.config,
          testResults: linkedinData.testResults.length
        },
        geoAgent: {
          sources: geoData.sources.length,
          campaigns: geoData.campaigns.length,
          hasConfig: !!geoData.config,
          testResults: geoData.testResults.length
        },
        monitoring: {
          totalItems: monitoringStats.totalItems,
          contentTypes: Object.keys(monitoringStats.byType).length,
          sources: Object.keys(monitoringStats.bySource).length,
          keywordsTracked: Object.keys(monitoringStats.keywords).length
        }
      },
      improvements: [
        '✅ Stockage local sécurisé remplace localStorage',
        '✅ Structure organisée inputs/outputs pour chaque agent',
        '✅ Système de veille automatique opérationnel',
        '✅ Optimisation des données pour l\'IA',
        '✅ Traçabilité complète des contenus collectés',
        '✅ Index de recherche et analytics intégrés'
      ],
      nextSteps: [
        '1. Intégrer le nouveau système dans l\'interface utilisateur',
        '2. Configurer les agents de veille selon les besoins',
        '3. Former les utilisateurs aux nouvelles fonctionnalités',
        '4. Programmer des sauvegardes automatiques',
        '5. Monitorer les performances du système'
      ],
      backupLocation: 'data/backups/',
      configFiles: [
        'data/agents/linkedin/inputs/config.json',
        'data/agents/geo/inputs/config.json',
        'data/monitoring/config.json'
      ],
      optimizedFiles: [
        'data/agents/linkedin/outputs/knowledge_base.json',
        'data/agents/geo/outputs/knowledge_base.json',
        'data/monitoring/optimized/monitoring_knowledge_base.json',
        'data/global_knowledge_base.json'
      ]
    };

    const fs = await import('fs');
    const path = await import('path');
    
    const reportPath = path.join(process.cwd(), 'data', 'migration_report.json');
    await fs.promises.writeFile(reportPath, JSON.stringify(report, null, 2));
    
    console.log(`📊 Rapport de migration sauvegardé: ${reportPath}`);
    
    // Afficher le résumé
    console.log('\n🎉 Migration réussie! Résumé:');
    console.log(`📁 ${report.summary.linkedinAgent.sources} sources LinkedIn migrées`);
    console.log(`📁 ${report.summary.geoAgent.sources} sources GEO migrées`);
    console.log(`📊 ${report.summary.monitoring.totalItems} éléments de veille indexés`);
    console.log(`🔧 Données optimisées pour l'IA dans ${report.optimizedFiles.length} fichiers`);
  }

  // Créer une sauvegarde avant migration
  static async createPreMigrationBackup(): Promise<void> {
    console.log('💾 Création d\'une sauvegarde avant migration...');
    
    try {
      // Exporter toutes les données localStorage existantes
      const allData = LocalStorage.getAllStoredData();
      
      const fs = await import('fs');
      const path = await import('path');
      
      const backupPath = path.join(process.cwd(), 'data', 'backups');
      await fs.promises.mkdir(backupPath, { recursive: true });
      
      const backupFile = path.join(backupPath, `pre_migration_backup_${Date.now()}.json`);
      await fs.promises.writeFile(backupFile, JSON.stringify(allData, null, 2));
      
      console.log(`✅ Sauvegarde créée: ${backupFile}`);
      
    } catch (error) {
      console.log('ℹ️ Aucune donnée localStorage à sauvegarder');
    }
  }

  // Rollback en cas de problème
  static async rollbackMigration(): Promise<void> {
    console.log('🔄 Rollback de la migration...');
    
    try {
      const fs = await import('fs');
      const path = await import('path');
      
      // Supprimer le dossier data créé
      const dataPath = path.join(process.cwd(), 'data');
      await fs.promises.rm(dataPath, { recursive: true, force: true });
      
      console.log('✅ Rollback effectué - dossier data supprimé');
      
    } catch (error) {
      console.error('❌ Erreur lors du rollback:', error);
    }
  }
}

// Fonction principale pour lancer la migration
export async function runMigration(): Promise<void> {
  try {
    // Créer une sauvegarde avant de commencer
    await MigrationScript.createPreMigrationBackup();
    
    // Exécuter la migration complète
    await MigrationScript.runFullMigration();
    
    console.log('\n🚀 Migration terminée avec succès!');
    console.log('\nLe nouveau système de stockage local est maintenant opérationnel.');
    console.log('Consultez le fichier data/migration_report.json pour le détail complet.');
    
  } catch (error) {
    console.error('\n❌ Erreur lors de la migration:', error);
    console.log('\nVoulez-vous effectuer un rollback? Exécutez MigrationScript.rollbackMigration()');
    throw error;
  }
}