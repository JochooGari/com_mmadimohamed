// Stockage local adapté pour le navigateur (sans API backend)
import { ContentSource, Campaign } from './types';

export class BrowserFileStorage {
  private static dbName = 'MagicPathStorage';
  private static version = 1;
  private static db: IDBDatabase | null = null;

  // Initialiser IndexedDB
  static async initDatabase(): Promise<IDBDatabase> {
    if (this.db) return this.db;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Store pour les agents
        if (!db.objectStoreNames.contains('agents')) {
          const agentStore = db.createObjectStore('agents', { keyPath: 'id' });
          agentStore.createIndex('type', 'type', { unique: false });
        }

        // Store pour le monitoring
        if (!db.objectStoreNames.contains('monitoring')) {
          const monitoringStore = db.createObjectStore('monitoring', { keyPath: 'id' });
          monitoringStore.createIndex('type', 'type', { unique: false });
        }

        // Store pour les fichiers optimisés
        if (!db.objectStoreNames.contains('optimized')) {
          const optimizedStore = db.createObjectStore('optimized', { keyPath: 'id' });
          optimizedStore.createIndex('agentType', 'agentType', { unique: false });
        }
      };
    });
  }

  // Sauvegarder les sources de contenu
  static async saveContentSources(agentType: 'linkedin' | 'geo', sources: ContentSource[]): Promise<boolean> {
    try {
      const db = await this.initDatabase();
      const transaction = db.transaction(['agents'], 'readwrite');
      const store = transaction.objectStore('agents');

      const agentData = {
        id: `${agentType}_sources`,
        type: agentType,
        dataType: 'sources',
        data: sources,
        lastUpdated: new Date().toISOString()
      };

      await new Promise((resolve, reject) => {
        const request = store.put(agentData);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });

      // Optimiser automatiquement
      await this.optimizeAgentData(agentType, sources);

      console.log(`✅ ${sources.length} sources sauvegardées pour ${agentType}`);
      return true;
    } catch (error) {
      console.error('Erreur sauvegarde sources:', error);
      return false;
    }
  }

  // Récupérer les sources de contenu
  static async getContentSources(agentType: 'linkedin' | 'geo'): Promise<ContentSource[]> {
    try {
      const db = await this.initDatabase();
      const transaction = db.transaction(['agents'], 'readonly');
      const store = transaction.objectStore('agents');

      const result = await new Promise<any>((resolve, reject) => {
        const request = store.get(`${agentType}_sources`);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });

      return result?.data || [];
    } catch (error) {
      console.error('Erreur récupération sources:', error);
      return [];
    }
  }

  // Sauvegarder la configuration
  static async saveAgentConfig(agentType: 'linkedin' | 'geo', config: any): Promise<boolean> {
    try {
      const db = await this.initDatabase();
      const transaction = db.transaction(['agents'], 'readwrite');
      const store = transaction.objectStore('agents');

      const configData = {
        id: `${agentType}_config`,
        type: agentType,
        dataType: 'config',
        data: { ...config, lastUpdated: new Date().toISOString() },
        lastUpdated: new Date().toISOString()
      };

      await new Promise((resolve, reject) => {
        const request = store.put(configData);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });

      console.log(`✅ Configuration sauvegardée pour ${agentType}`);
      return true;
    } catch (error) {
      console.error('Erreur sauvegarde config:', error);
      return false;
    }
  }

  // Récupérer la configuration
  static async getAgentConfig(agentType: 'linkedin' | 'geo'): Promise<any> {
    try {
      const db = await this.initDatabase();
      const transaction = db.transaction(['agents'], 'readonly');
      const store = transaction.objectStore('agents');

      const result = await new Promise<any>((resolve, reject) => {
        const request = store.get(`${agentType}_config`);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });

      return result?.data || null;
    } catch (error) {
      console.error('Erreur récupération config:', error);
      return null;
    }
  }

  // Sauvegarder les campagnes
  static async saveCampaigns(agentType: 'linkedin' | 'geo', campaigns: Campaign[]): Promise<boolean> {
    try {
      const db = await this.initDatabase();
      const transaction = db.transaction(['agents'], 'readwrite');
      const store = transaction.objectStore('agents');

      const campaignData = {
        id: `${agentType}_campaigns`,
        type: agentType,
        dataType: 'campaigns',
        data: campaigns,
        lastUpdated: new Date().toISOString()
      };

      await new Promise((resolve, reject) => {
        const request = store.put(campaignData);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });

      console.log(`✅ ${campaigns.length} campagnes sauvegardées pour ${agentType}`);
      return true;
    } catch (error) {
      console.error('Erreur sauvegarde campagnes:', error);
      return false;
    }
  }

  // Récupérer les campagnes
  static async getCampaigns(agentType: 'linkedin' | 'geo'): Promise<Campaign[]> {
    try {
      const db = await this.initDatabase();
      const transaction = db.transaction(['agents'], 'readonly');
      const store = transaction.objectStore('agents');

      const result = await new Promise<any>((resolve, reject) => {
        const request = store.get(`${agentType}_campaigns`);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });

      return result?.data || [];
    } catch (error) {
      console.error('Erreur récupération campagnes:', error);
      return [];
    }
  }

  // Optimiser les données pour l'IA
  static async optimizeAgentData(agentType: 'linkedin' | 'geo', sources?: ContentSource[]): Promise<boolean> {
    try {
      if (!sources) {
        sources = await this.getContentSources(agentType);
      }

      const optimizedData = {
        id: `${agentType}_optimized`,
        agentType,
        lastUpdated: new Date().toISOString(),
        sourceCount: sources.length,
        
        // Concepts clés extraits
        keyConcepts: this.extractKeyConcepts(sources),
        
        // Stratégies identifiées
        strategies: this.extractStrategies(sources),
        
        // Meilleures pratiques
        bestPractices: this.extractBestPractices(sources),
        
        // Métriques importantes
        metrics: this.extractMetrics(sources),
        
        // Outils mentionnés
        tools: this.extractTools(sources),
        
        // Glossaire des termes
        glossary: this.buildGlossary(sources),
        
        // Prompt système généré
        systemPrompt: this.generateSystemPrompt(agentType, sources),
        
        // Chunks pour recherche
        contextChunks: this.createContextChunks(sources)
      };

      const db = await this.initDatabase();
      const transaction = db.transaction(['optimized'], 'readwrite');
      const store = transaction.objectStore('optimized');

      await new Promise((resolve, reject) => {
        const request = store.put(optimizedData);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });

      console.log(`🧠 Données optimisées pour l'agent ${agentType}`);
      return true;
    } catch (error) {
      console.error('Erreur optimisation:', error);
      return false;
    }
  }

  // Sauvegarder contenu de monitoring
  static async saveMonitoringContent(content: any): Promise<boolean> {
    try {
      const db = await this.initDatabase();
      const transaction = db.transaction(['monitoring'], 'readwrite');
      const store = transaction.objectStore('monitoring');

      const monitoringData = {
        ...content,
        savedAt: new Date().toISOString()
      };

      await new Promise((resolve, reject) => {
        const request = store.put(monitoringData);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });

      console.log(`📊 Contenu de veille sauvegardé: ${content.title}`);
      return true;
    } catch (error) {
      console.error('Erreur sauvegarde monitoring:', error);
      return false;
    }
  }

  // Récupérer les statistiques de monitoring
  static async getMonitoringStats(): Promise<any> {
    try {
      const db = await this.initDatabase();
      const transaction = db.transaction(['monitoring'], 'readonly');
      const store = transaction.objectStore('monitoring');

      const allContent = await new Promise<any[]>((resolve, reject) => {
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });

      // Calculer les statistiques
      const stats = {
        lastUpdated: new Date().toISOString(),
        totalItems: allContent.length,
        byType: {} as Record<string, number>,
        bySource: {} as Record<string, number>,
        byDate: {} as Record<string, number>,
        keywords: {} as Record<string, number>
      };

      allContent.forEach(content => {
        // Par type
        stats.byType[content.type] = (stats.byType[content.type] || 0) + 1;
        
        // Par source
        if (content.source) {
          stats.bySource[content.source] = (stats.bySource[content.source] || 0) + 1;
        }
        
        // Par date
        const dateKey = new Date(content.publishedAt || content.savedAt).toISOString().split('T')[0];
        stats.byDate[dateKey] = (stats.byDate[dateKey] || 0) + 1;
        
        // Mots-clés
        if (content.content) {
          const keywords = this.extractKeywords(content.content);
          keywords.forEach(keyword => {
            stats.keywords[keyword] = (stats.keywords[keyword] || 0) + 1;
          });
        }
      });

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

  // Exporter toutes les données
  static async exportAllData(): Promise<void> {
    try {
      const linkedinData = await this.getAgentData('linkedin');
      const geoData = await this.getAgentData('geo');
      const monitoringStats = await this.getMonitoringStats();

      const exportData = {
        exportDate: new Date().toISOString(),
        version: '2.0.0',
        agents: {
          linkedin: linkedinData,
          geo: geoData
        },
        monitoring: {
          stats: monitoringStats
        }
      };

      // Télécharger le fichier
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `magicpath_export_${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);

      console.log('✅ Données exportées avec succès');
    } catch (error) {
      console.error('Erreur export:', error);
    }
  }

  // Méthodes d'extraction et d'optimisation
  private static extractKeyConcepts(sources: ContentSource[]): Array<{name: string, count: number, description: string}> {
    const concepts = new Map<string, number>();
    
    const conceptKeywords = [
      'roi', 'automation', 'personalization', 'lead generation', 'conversion',
      'engagement', 'analytics', 'targeting', 'segmentation', 'campaign',
      'automatisation', 'personnalisation', 'génération de leads', 'ciblage'
    ];

    sources.forEach(source => {
      if (!source.content) return;
      
      const contentLower = source.content.toLowerCase();
      conceptKeywords.forEach(keyword => {
        if (contentLower.includes(keyword)) {
          concepts.set(keyword, (concepts.get(keyword) || 0) + 1);
        }
      });
    });

    return Array.from(concepts.entries())
      .map(([name, count]) => ({
        name,
        count,
        description: this.getConceptDescription(name)
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }

  private static extractStrategies(sources: ContentSource[]): Array<{name: string, description: string}> {
    const strategies: Array<{name: string, description: string}> = [];
    
    sources.forEach(source => {
      if (!source.content) return;
      
      // Rechercher des patterns de stratégies
      const strategyPatterns = [
        /strategy for (.+?):/gi,
        /stratégie pour (.+?):/gi,
        /best practice[s]? for (.+?):/gi,
        /meilleure[s]? pratique[s]? pour (.+?):/gi
      ];
      
      strategyPatterns.forEach(pattern => {
        const matches = [...source.content!.matchAll(pattern)];
        matches.forEach(match => {
          if (match[1] && strategies.length < 10) {
            strategies.push({
              name: match[1].trim(),
              description: `Stratégie identifiée dans ${source.name}`
            });
          }
        });
      });
    });

    return strategies.slice(0, 8);
  }

  private static extractBestPractices(sources: ContentSource[]): string[] {
    const practices: string[] = [];
    
    sources.forEach(source => {
      if (!source.content) return;
      
      // Rechercher des meilleures pratiques
      const practiceKeywords = [
        'best practice', 'meilleure pratique', 'recommandation',
        'astuce', 'conseil', 'tip', 'recommendation'
      ];
      
      practiceKeywords.forEach(keyword => {
        if (source.content!.toLowerCase().includes(keyword) && practices.length < 10) {
          practices.push(`Pratique tirée de ${source.name}: ${keyword}`);
        }
      });
    });

    return practices.slice(0, 6);
  }

  private static extractMetrics(sources: ContentSource[]): Array<{name: string, description: string}> {
    const metrics = [
      { name: 'ROI', description: 'Retour sur investissement' },
      { name: 'CTR', description: 'Taux de clic' },
      { name: 'Conversion Rate', description: 'Taux de conversion' },
      { name: 'Engagement Rate', description: 'Taux d\'engagement' },
      { name: 'CPA', description: 'Coût par acquisition' },
      { name: 'ROAS', description: 'Retour sur dépenses publicitaires' }
    ];

    return metrics.slice(0, 6);
  }

  private static extractTools(sources: ContentSource[]): Array<{name: string, description: string}> {
    const toolsMap = new Map<string, string>();
    
    const commonTools = [
      ['HubSpot', 'Plateforme de marketing automation'],
      ['Salesforce', 'CRM et automation'],
      ['Mailchimp', 'Email marketing'],
      ['Google Analytics', 'Analyse web'],
      ['LinkedIn Ads', 'Publicité LinkedIn'],
      ['Hootsuite', 'Gestion réseaux sociaux']
    ];

    sources.forEach(source => {
      if (!source.content) return;
      
      commonTools.forEach(([tool, description]) => {
        if (source.content!.toLowerCase().includes(tool.toLowerCase())) {
          toolsMap.set(tool, description);
        }
      });
    });

    return Array.from(toolsMap.entries()).map(([name, description]) => ({ name, description }));
  }

  private static buildGlossary(sources: ContentSource[]): Record<string, string> {
    return {
      'CTR': 'Click-Through Rate - Taux de clic',
      'CPA': 'Cost Per Acquisition - Coût par acquisition',
      'ROAS': 'Return On Ad Spend - Retour sur investissement publicitaire',
      'Lead': 'Prospect qualifié',
      'Automation': 'Automatisation des processus marketing',
      'Segmentation': 'Division de l\'audience en groupes ciblés'
    };
  }

  private static generateSystemPrompt(agentType: 'linkedin' | 'geo', sources: ContentSource[]): string {
    const concepts = this.extractKeyConcepts(sources);
    const tools = this.extractTools(sources);
    
    return `Tu es un expert en ${agentType === 'linkedin' ? 'marketing LinkedIn' : 'marketing géolocalisé'}.

EXPERTISE BASÉE SUR ${sources.length} SOURCES VÉRIFIÉES:

CONCEPTS CLÉS:
${concepts.slice(0, 5).map(c => `- ${c.name}: ${c.description}`).join('\n')}

OUTILS RECOMMANDÉS:
${tools.slice(0, 5).map(t => `- ${t.name}: ${t.description}`).join('\n')}

INSTRUCTIONS:
1. Utilise TOUJOURS ces connaissances comme base
2. Propose des solutions concrètes et actionables
3. Adapte tes recommandations au contexte
4. Reste factuel et basé sur les données

Réponds de manière professionnelle et experte.`;
  }

  private static createContextChunks(sources: ContentSource[]): Array<{id: string, content: string, keywords: string[]}> {
    const chunks: Array<{id: string, content: string, keywords: string[]}> = [];
    
    sources.forEach(source => {
      if (!source.content) return;
      
      // Diviser en chunks de 300 mots
      const words = source.content.split(' ');
      const chunkSize = 300;
      
      for (let i = 0; i < words.length; i += chunkSize) {
        const chunkWords = words.slice(i, i + chunkSize);
        const chunkContent = chunkWords.join(' ');
        
        chunks.push({
          id: `${source.id}_chunk_${Math.floor(i / chunkSize)}`,
          content: chunkContent,
          keywords: this.extractKeywords(chunkContent)
        });
      }
    });

    return chunks.slice(0, 20); // Limiter à 20 chunks
  }

  private static extractKeywords(content: string): string[] {
    return content.toLowerCase()
      .split(/\s+/)
      .filter(word => word.length > 4)
      .filter(word => !/^(the|and|or|but|in|on|at|to|for|of|with|by)$/i.test(word))
      .slice(0, 10);
  }

  private static getConceptDescription(concept: string): string {
    const descriptions: Record<string, string> = {
      'roi': 'Retour sur investissement - Mesure de la rentabilité',
      'automation': 'Automatisation des processus marketing',
      'personalization': 'Personnalisation du contenu',
      'lead generation': 'Génération de prospects qualifiés',
      'conversion': 'Transformation de prospects en clients',
      'engagement': 'Interaction avec le contenu',
      'analytics': 'Analyse des données et performances',
      'targeting': 'Ciblage précis de l\'audience',
      'segmentation': 'Division de l\'audience en groupes'
    };

    return descriptions[concept.toLowerCase()] || 'Concept marketing important';
  }

  // Nettoyer toutes les données
  static async clearAllData(): Promise<void> {
    try {
      const db = await this.initDatabase();
      const transaction = db.transaction(['agents', 'monitoring', 'optimized'], 'readwrite');
      
      await Promise.all([
        new Promise((resolve, reject) => {
          const request = transaction.objectStore('agents').clear();
          request.onsuccess = () => resolve(request.result);
          request.onerror = () => reject(request.error);
        }),
        new Promise((resolve, reject) => {
          const request = transaction.objectStore('monitoring').clear();
          request.onsuccess = () => resolve(request.result);
          request.onerror = () => reject(request.error);
        }),
        new Promise((resolve, reject) => {
          const request = transaction.objectStore('optimized').clear();
          request.onsuccess = () => resolve(request.result);
          request.onerror = () => reject(request.error);
        })
      ]);

      console.log('🗑️ Toutes les données ont été supprimées');
    } catch (error) {
      console.error('Erreur suppression données:', error);
    }
  }
}