// Nouveau système de stockage local pour les agents IA avec fichiers locaux
import { ContentSource, Agent, Campaign } from './types';
import * as fs from 'fs';
import * as path from 'path';

export class LocalFileStorage {
  private static basePath = path.join(process.cwd(), 'data');
  private static prefix = 'magicpath_';

  // Stockage des sources de contenu dans inputs/
  static async saveContentSources(agentType: 'linkedin' | 'geo', sources: ContentSource[]) {
    const inputsPath = path.join(this.basePath, 'agents', agentType, 'inputs');
    const sourcesFile = path.join(inputsPath, 'sources.json');
    
    await this.ensureDirectoryExists(inputsPath);
    await fs.promises.writeFile(sourcesFile, JSON.stringify(sources, null, 2));
    console.log(`✅ Sources sauvegardées pour ${agentType}:`, sources.length);
    
    // Sauvegarder chaque source individuellement
    for (const source of sources) {
      if (source.content) {
        const sourceFile = path.join(inputsPath, `source_${source.id}.txt`);
        await fs.promises.writeFile(sourceFile, source.content);
      }
    }
    
    // Optimiser pour l'IA
    await this.optimizeForAI(agentType, sources);
  }

  static async getContentSources(agentType: 'linkedin' | 'geo'): Promise<ContentSource[]> {
    const sourcesFile = path.join(this.basePath, 'agents', agentType, 'inputs', 'sources.json');
    
    try {
      const data = await fs.promises.readFile(sourcesFile, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.log(`Aucune source trouvée pour ${agentType}`);
      return [];
    }
  }

  // Stockage des configurations d'agents
  static async saveAgentConfig(agentType: 'linkedin' | 'geo', config: any) {
    const configPath = path.join(this.basePath, 'agents', agentType, 'inputs');
    const configFile = path.join(configPath, 'config.json');
    
    const configWithTimestamp = {
      ...config,
      lastUpdated: new Date().toISOString()
    };
    
    await this.ensureDirectoryExists(configPath);
    await fs.promises.writeFile(configFile, JSON.stringify(configWithTimestamp, null, 2));
    console.log(`✅ Configuration sauvegardée pour ${agentType}`);
  }

  static async getAgentConfig(agentType: 'linkedin' | 'geo'): Promise<any> {
    const configFile = path.join(this.basePath, 'agents', agentType, 'inputs', 'config.json');
    
    try {
      const data = await fs.promises.readFile(configFile, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.log(`Aucune configuration trouvée pour ${agentType}`);
      return null;
    }
  }

  // Stockage des campagnes
  static async saveCampaigns(agentType: 'linkedin' | 'geo', campaigns: Campaign[]) {
    const campaignPath = path.join(this.basePath, 'agents', agentType, 'inputs');
    const campaignFile = path.join(campaignPath, 'campaigns.json');
    
    await this.ensureDirectoryExists(campaignPath);
    await fs.promises.writeFile(campaignFile, JSON.stringify(campaigns, null, 2));
    console.log(`✅ Campagnes sauvegardées pour ${agentType}:`, campaigns.length);
  }

  static async getCampaigns(agentType: 'linkedin' | 'geo'): Promise<Campaign[]> {
    const campaignFile = path.join(this.basePath, 'agents', agentType, 'inputs', 'campaigns.json');
    
    try {
      const data = await fs.promises.readFile(campaignFile, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.log(`Aucune campagne trouvée pour ${agentType}`);
      return [];
    }
  }

  // Stockage des résultats de tests
  static async saveTestResults(agentType: 'linkedin' | 'geo', results: any[]) {
    const resultsPath = path.join(this.basePath, 'agents', agentType, 'outputs');
    const resultsFile = path.join(resultsPath, 'test_results.json');
    
    await this.ensureDirectoryExists(resultsPath);
    await fs.promises.writeFile(resultsFile, JSON.stringify(results, null, 2));
    console.log(`✅ Résultats de test sauvegardés pour ${agentType}:`, results.length);
  }

  static async getTestResults(agentType: 'linkedin' | 'geo'): Promise<any[]> {
    const resultsFile = path.join(this.basePath, 'agents', agentType, 'outputs', 'test_results.json');
    
    try {
      const data = await fs.promises.readFile(resultsFile, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.log(`Aucun résultat de test trouvé pour ${agentType}`);
      return [];
    }
  }

  // Utilitaires
  static async getAllStoredData() {
    const allData: Record<string, any> = {};
    
    const agentTypes = ['linkedin', 'geo'];
    for (const agentType of agentTypes) {
      allData[agentType] = {
        sources: await this.getContentSources(agentType as 'linkedin' | 'geo'),
        config: await this.getAgentConfig(agentType as 'linkedin' | 'geo'),
        campaigns: await this.getCampaigns(agentType as 'linkedin' | 'geo'),
        testResults: await this.getTestResults(agentType as 'linkedin' | 'geo')
      };
    }
    
    return allData;
  }

  static async exportData(agentType?: 'linkedin' | 'geo') {
    const data = agentType 
      ? await this.getAgentData(agentType)
      : await this.getAllStoredData();
    
    const exportPath = path.join(this.basePath, 'exports');
    await this.ensureDirectoryExists(exportPath);
    
    const filename = `magicpath_${agentType || 'all'}_data_${Date.now()}.json`;
    const exportFile = path.join(exportPath, filename);
    
    await fs.promises.writeFile(exportFile, JSON.stringify(data, null, 2));
    console.log(`✅ Données exportées vers: ${exportFile}`);
    
    return exportFile;
  }

  static async getAgentData(agentType: 'linkedin' | 'geo') {
    return {
      type: agentType,
      sources: await this.getContentSources(agentType),
      config: await this.getAgentConfig(agentType),
      campaigns: await this.getCampaigns(agentType),
      testResults: await this.getTestResults(agentType),
      exported: new Date().toISOString()
    };
  }

  static async clearAgentData(agentType: 'linkedin' | 'geo') {
    const agentPath = path.join(this.basePath, 'agents', agentType);
    
    try {
      await this.removeDirectory(agentPath);
      await this.ensureDirectoryExists(path.join(agentPath, 'inputs'));
      await this.ensureDirectoryExists(path.join(agentPath, 'outputs'));
      console.log(`🗑️ Données effacées pour ${agentType}`);
    } catch (error) {
      console.error(`Erreur lors de l'effacement des données pour ${agentType}:`, error);
    }
  }
  
  // Utilitaires de fichiers
  private static async ensureDirectoryExists(dirPath: string) {
    try {
      await fs.promises.access(dirPath);
    } catch {
      await fs.promises.mkdir(dirPath, { recursive: true });
    }
  }
  
  private static async removeDirectory(dirPath: string) {
    try {
      await fs.promises.rm(dirPath, { recursive: true, force: true });
    } catch (error) {
      console.warn(`Impossible de supprimer le dossier ${dirPath}:`, error);
    }
  }
  
  // Optimisation des données pour l'IA
  private static async optimizeForAI(agentType: 'linkedin' | 'geo', sources: ContentSource[]) {
    const outputPath = path.join(this.basePath, 'agents', agentType, 'outputs');
    await this.ensureDirectoryExists(outputPath);
    
    const optimizedData = {
      lastUpdated: new Date().toISOString(),
      agentType,
      sourceCount: sources.length,
      sources: sources.map(source => ({
        id: source.id,
        name: source.name,
        type: source.type,
        tags: source.tags,
        summary: this.generateSummary(source.content),
        keywords: this.extractKeywords(source.content),
        lastUpdated: source.lastUpdated,
        wordCount: source.content?.split(' ').length || 0,
        language: this.detectLanguage(source.content || ''),
        relevanceScore: this.calculateRelevance(source, agentType)
      }))
    };
    
    const optimizedFile = path.join(outputPath, 'ai_optimized.json');
    await fs.promises.writeFile(optimizedFile, JSON.stringify(optimizedData, null, 2));
    
    // Créer un index de recherche
    const searchIndex = this.createSearchIndex(sources);
    const indexFile = path.join(outputPath, 'search_index.json');
    await fs.promises.writeFile(indexFile, JSON.stringify(searchIndex, null, 2));
  }
  
  private static generateSummary(content?: string): string {
    if (!content) return '';
    const sentences = content.split('.');
    return sentences.slice(0, 3).join('.') + '.';
  }
  
  private static extractKeywords(content?: string): string[] {
    if (!content) return [];
    const words = content.toLowerCase()
      .split(/\s+/)
      .filter(word => word.length > 4)
      .filter(word => !/^(the|and|or|but|in|on|at|to|for|of|with|by)$/i.test(word));
    
    const wordCounts = words.reduce((acc, word) => {
      acc[word] = (acc[word] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(wordCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([word]) => word);
  }
  
  private static calculateRelevance(source: ContentSource, agentType: string): number {
    let score = 0.5; // Score de base
    
    // Bonus pour les tags correspondants
    if (source.tags.includes(agentType)) score += 0.3;
    if (source.tags.includes('ai') || source.tags.includes('ia')) score += 0.2;
    
    // Bonus pour le contenu récent
    const daysSinceUpdate = (Date.now() - new Date(source.lastUpdated).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceUpdate < 7) score += 0.2;
    else if (daysSinceUpdate < 30) score += 0.1;
    
    return Math.min(1, Math.max(0, score));
  }
  
  private static createSearchIndex(sources: ContentSource[]) {
    return sources.reduce((index, source) => {
      const keywords = this.extractKeywords(source.content);
      keywords.forEach(keyword => {
        if (!index[keyword]) index[keyword] = [];
        index[keyword].push({
          sourceId: source.id,
          name: source.name,
          relevance: this.calculateRelevance(source, 'general')
        });
      });
      return index;
    }, {} as Record<string, Array<{sourceId: string, name: string, relevance: number}>>);
  }

  private static detectLanguage(content: string): 'fr' | 'en' {
    const frWords = ['le', 'la', 'les', 'de', 'du', 'des', 'et', 'ou', 'avec', 'pour'];
    const enWords = ['the', 'and', 'or', 'with', 'for', 'to', 'of', 'in', 'on', 'at'];
    
    const words = content.toLowerCase().split(' ');
    const frCount = words.filter(word => frWords.includes(word)).length;
    const enCount = words.filter(word => enWords.includes(word)).length;
    
    return frCount > enCount ? 'fr' : 'en';
  }
}

// Classe pour la gestion de la veille automatique
export class MonitoringStorage {
  private static basePath = path.join(process.cwd(), 'data', 'monitoring');

  // Types de contenu supportés
  static supportedContentTypes = {
    article: 'Articles web',
    post: 'Posts LinkedIn/Twitter', 
    tweet: 'Tweets',
    video: 'Vidéos YouTube/Vimeo',
    document: 'Documents PDF/Word',
    transcript: 'Transcripts audio/vidéo'
  };

  // Sauvegarder un nouveau contenu de veille
  static async saveMonitoringContent(content: MonitoringContent) {
    const sourcesPath = path.join(this.basePath, 'sources');
    const optimizedPath = path.join(this.basePath, 'optimized');
    
    await this.ensureDirectoryExists(sourcesPath);
    await this.ensureDirectoryExists(optimizedPath);
    
    // Sauvegarder le contenu brut
    const sourceFile = path.join(sourcesPath, `${content.type}_${content.id}.json`);
    await fs.promises.writeFile(sourceFile, JSON.stringify(content, null, 2));
    
    // Créer la version optimisée pour l'IA
    const optimizedContent = await this.optimizeContentForAI(content);
    const optimizedFile = path.join(optimizedPath, `optimized_${content.id}.json`);
    await fs.promises.writeFile(optimizedFile, JSON.stringify(optimizedContent, null, 2));
    
    // Mettre à jour l'index
    await this.updateMonitoringIndex(content);
    
    console.log(`✅ Contenu de veille sauvegardé: ${content.title}`);
  }

  // Optimiser le contenu pour l'IA
  private static async optimizeContentForAI(content: MonitoringContent) {
    return {
      id: content.id,
      title: content.title,
      type: content.type,
      source: content.source,
      url: content.url,
      publishedAt: content.publishedAt,
      collectedAt: content.collectedAt,
      
      // Données optimisées pour l'IA
      summary: this.generateSummary(content.content),
      keywords: this.extractKeywords(content.content),
      topics: this.extractTopics(content.content),
      sentiment: this.analyzeSentiment(content.content),
      language: this.detectLanguage(content.content),
      relevanceScore: this.calculateContentRelevance(content),
      
      // Métadonnées enrichies
      metadata: {
        wordCount: content.content?.split(' ').length || 0,
        readingTime: Math.ceil((content.content?.split(' ').length || 0) / 200),
        complexity: this.assessComplexity(content.content),
        actionable: this.isActionable(content.content),
        trends: this.extractTrends(content.content)
      },
      
      // Tags automatiques
      autoTags: this.generateAutoTags(content),
      
      // Relations avec d'autres contenus
      relatedContent: await this.findRelatedContent(content),
      
      optimizedAt: new Date().toISOString()
    };
  }

  // Extraire les sujets principaux
  private static extractTopics(content?: string): string[] {
    if (!content) return [];
    
    const topicKeywords = {
      'ai': ['artificial intelligence', 'machine learning', 'deep learning', 'neural network', 'ai', 'ia', 'intelligence artificielle'],
      'marketing': ['marketing', 'publicité', 'brand', 'marque', 'campaign', 'campagne'],
      'linkedin': ['linkedin', 'networking', 'professionnel', 'career', 'carrière'],
      'data': ['data', 'données', 'analytics', 'business intelligence', 'dashboard'],
      'strategy': ['stratégie', 'strategy', 'planning', 'roadmap', 'vision'],
      'roi': ['roi', 'return on investment', 'retour sur investissement', 'performance'],
      'automation': ['automation', 'automatisation', 'workflow', 'process', 'efficiency']
    };
    
    const topics: string[] = [];
    const contentLower = content.toLowerCase();
    
    Object.entries(topicKeywords).forEach(([topic, keywords]) => {
      if (keywords.some(keyword => contentLower.includes(keyword))) {
        topics.push(topic);
      }
    });
    
    return topics;
  }

  // Analyser le sentiment
  private static analyzeSentiment(content?: string): 'positive' | 'negative' | 'neutral' {
    if (!content) return 'neutral';
    
    const positiveWords = ['good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'bon', 'excellent', 'génial', 'fantastique'];
    const negativeWords = ['bad', 'terrible', 'awful', 'horrible', 'worst', 'mauvais', 'terrible', 'horrible', 'pire'];
    
    const contentLower = content.toLowerCase();
    const positiveCount = positiveWords.filter(word => contentLower.includes(word)).length;
    const negativeCount = negativeWords.filter(word => contentLower.includes(word)).length;
    
    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
  }

  // Évaluer la complexité du contenu
  private static assessComplexity(content?: string): 'low' | 'medium' | 'high' {
    if (!content) return 'low';
    
    const sentences = content.split('.').length;
    const words = content.split(' ').length;
    const avgWordsPerSentence = words / sentences;
    
    if (avgWordsPerSentence < 15) return 'low';
    if (avgWordsPerSentence < 25) return 'medium';
    return 'high';
  }

  // Vérifier si le contenu est actionnable
  private static isActionable(content?: string): boolean {
    if (!content) return false;
    
    const actionWords = ['how to', 'comment', 'guide', 'tutorial', 'step', 'étape', 'method', 'méthode', 'tip', 'astuce'];
    const contentLower = content.toLowerCase();
    
    return actionWords.some(word => contentLower.includes(word));
  }

  // Extraire les tendances
  private static extractTrends(content?: string): string[] {
    if (!content) return [];
    
    const trendPatterns = [
      /\d{4}/g, // Années
      /#\w+/g,  // Hashtags
      /trending|tendance|popular|populaire/gi,
      /new|nouveau|latest|dernier/gi
    ];
    
    const trends: string[] = [];
    trendPatterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) trends.push(...matches.slice(0, 5));
    });
    
    return [...new Set(trends)];
  }

  // Générer des tags automatiques
  private static generateAutoTags(content: MonitoringContent): string[] {
    const tags: string[] = [];
    
    // Tags basés sur le type
    tags.push(content.type);
    
    // Tags basés sur la source
    if (content.source) tags.push(content.source.toLowerCase());
    
    // Tags basés sur le contenu
    const topics = this.extractTopics(content.content);
    tags.push(...topics);
    
    // Tags temporels
    const publishedDate = new Date(content.publishedAt);
    const now = new Date();
    const daysDiff = Math.floor((now.getTime() - publishedDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff < 1) tags.push('recent');
    else if (daysDiff < 7) tags.push('this-week');
    else if (daysDiff < 30) tags.push('this-month');
    
    return [...new Set(tags)];
  }

  // Calculer la pertinence du contenu
  private static calculateContentRelevance(content: MonitoringContent): number {
    let score = 0.5; // Score de base
    
    // Bonus pour contenu récent
    const daysSincePublished = (Date.now() - new Date(content.publishedAt).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSincePublished < 1) score += 0.3;
    else if (daysSincePublished < 7) score += 0.2;
    else if (daysSincePublished < 30) score += 0.1;
    
    // Bonus pour sources fiables
    const trustedSources = ['linkedin', 'medium', 'harvard business review', 'forbes', 'mckinsey'];
    if (trustedSources.some(source => content.source?.toLowerCase().includes(source))) {
      score += 0.2;
    }
    
    // Bonus pour contenu actionnable
    if (this.isActionable(content.content)) score += 0.15;
    
    // Bonus pour sujets pertinents
    const topics = this.extractTopics(content.content);
    if (topics.includes('ai') || topics.includes('marketing')) score += 0.1;
    
    return Math.min(1, Math.max(0, score));
  }

  // Trouver du contenu similaire
  private static async findRelatedContent(content: MonitoringContent): Promise<string[]> {
    const sourcesPath = path.join(this.basePath, 'sources');
    const related: string[] = [];
    
    try {
      const files = await fs.promises.readdir(sourcesPath);
      const keywords = this.extractKeywords(content.content);
      
      for (const file of files.slice(0, 10)) { // Limiter à 10 fichiers pour les performances
        if (file.endsWith('.json') && !file.includes(content.id)) {
          const otherContent = JSON.parse(await fs.promises.readFile(path.join(sourcesPath, file), 'utf8'));
          const otherKeywords = this.extractKeywords(otherContent.content);
          
          // Calculer la similarité basée sur les mots-clés communs
          const commonKeywords = keywords.filter(k => otherKeywords.includes(k));
          if (commonKeywords.length > 2) {
            related.push(otherContent.id);
          }
        }
      }
    } catch (error) {
      console.warn('Erreur lors de la recherche de contenu similaire:', error);
    }
    
    return related.slice(0, 5); // Limiter à 5 contenus similaires
  }

  // Mettre à jour l'index de veille
  private static async updateMonitoringIndex(content: MonitoringContent) {
    const indexFile = path.join(this.basePath, 'monitoring_index.json');
    
    let index: MonitoringIndex;
    try {
      const data = await fs.promises.readFile(indexFile, 'utf8');
      index = JSON.parse(data);
    } catch {
      index = {
        lastUpdated: '',
        totalItems: 0,
        byType: {},
        bySource: {},
        byDate: {},
        keywords: {}
      };
    }
    
    // Mettre à jour les statistiques
    index.lastUpdated = new Date().toISOString();
    index.totalItems++;
    
    // Par type
    index.byType[content.type] = (index.byType[content.type] || 0) + 1;
    
    // Par source
    if (content.source) {
      index.bySource[content.source] = (index.bySource[content.source] || 0) + 1;
    }
    
    // Par date
    const dateKey = new Date(content.publishedAt).toISOString().split('T')[0];
    index.byDate[dateKey] = (index.byDate[dateKey] || 0) + 1;
    
    // Mots-clés
    const keywords = this.extractKeywords(content.content);
    keywords.forEach(keyword => {
      index.keywords[keyword] = (index.keywords[keyword] || 0) + 1;
    });
    
    await fs.promises.writeFile(indexFile, JSON.stringify(index, null, 2));
  }

  // Récupérer les statistiques de veille
  static async getMonitoringStats(): Promise<MonitoringIndex> {
    const indexFile = path.join(this.basePath, 'monitoring_index.json');
    
    try {
      const data = await fs.promises.readFile(indexFile, 'utf8');
      return JSON.parse(data);
    } catch {
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

  // Rechercher dans le contenu de veille
  static async searchMonitoringContent(query: string, filters?: MonitoringFilters): Promise<MonitoringContent[]> {
    const sourcesPath = path.join(this.basePath, 'sources');
    const results: MonitoringContent[] = [];
    
    try {
      const files = await fs.promises.readdir(sourcesPath);
      
      for (const file of files) {
        if (file.endsWith('.json')) {
          const content: MonitoringContent = JSON.parse(
            await fs.promises.readFile(path.join(sourcesPath, file), 'utf8')
          );
          
          // Filtrer par requête
          if (query && !content.title.toLowerCase().includes(query.toLowerCase()) && 
              !content.content?.toLowerCase().includes(query.toLowerCase())) {
            continue;
          }
          
          // Appliquer les filtres
          if (filters?.type && content.type !== filters.type) continue;
          if (filters?.source && content.source !== filters.source) continue;
          if (filters?.dateFrom && new Date(content.publishedAt) < new Date(filters.dateFrom)) continue;
          if (filters?.dateTo && new Date(content.publishedAt) > new Date(filters.dateTo)) continue;
          
          results.push(content);
        }
      }
    } catch (error) {
      console.error('Erreur lors de la recherche:', error);
    }
    
    return results.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  }

  // Utilitaires partagés
  private static generateSummary = LocalFileStorage['generateSummary'];
  private static extractKeywords = LocalFileStorage['extractKeywords'];
  private static detectLanguage = LocalFileStorage['detectLanguage'];
  private static ensureDirectoryExists = LocalFileStorage['ensureDirectoryExists'];
}

// Interfaces pour la veille
export interface MonitoringContent {
  id: string;
  title: string;
  content?: string;
  type: 'article' | 'post' | 'tweet' | 'video' | 'document' | 'transcript';
  source?: string;
  url?: string;
  author?: string;
  publishedAt: string;
  collectedAt: string;
  tags?: string[];
  metadata?: Record<string, any>;
}

export interface MonitoringIndex {
  lastUpdated: string;
  totalItems: number;
  byType: Record<string, number>;
  bySource: Record<string, number>;
  byDate: Record<string, number>;
  keywords: Record<string, number>;
}

export interface MonitoringFilters {
  type?: string;
  source?: string;
  dateFrom?: string;
  dateTo?: string;
  tags?: string[];
}