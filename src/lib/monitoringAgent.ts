// Agent de veille automatique pour collecter et tracer le contenu
import { MonitoringStorage, MonitoringContent } from './fileStorage';

export class MonitoringAgent {
  private static instance: MonitoringAgent;
  private isRunning: boolean = false;
  private intervalId?: NodeJS.Timeout;
  
  // Sources de veille configurables
  private sources = {
    linkedin: {
      enabled: true,
      searchTerms: ['ai', 'marketing automation', 'business intelligence', 'data analytics'],
      frequency: 60 // minutes
    },
    twitter: {
      enabled: true,
      searchTerms: ['#AI', '#MarketingAutomation', '#DataAnalytics', '#BusinessIntelligence'],
      frequency: 30
    },
    youtube: {
      enabled: true,
      channels: ['@hubspot', '@salesforce', '@microsoft'],
      searchTerms: ['marketing automation', 'AI business'],
      frequency: 180
    },
    rss: {
      enabled: true,
      feeds: [
        'https://feeds.feedburner.com/oreilly/radar',
        'https://hbr.org/feed',
        'https://blog.hubspot.com/feed.xml'
      ],
      frequency: 120
    },
    websites: {
      enabled: true,
      urls: [
        'https://www.mckinsey.com/capabilities/quantumblack/our-insights',
        'https://blog.google/technology/ai/',
        'https://openai.com/blog/'
      ],
      frequency: 360
    }
  };

  static getInstance(): MonitoringAgent {
    if (!MonitoringAgent.instance) {
      MonitoringAgent.instance = new MonitoringAgent();
    }
    return MonitoringAgent.instance;
  }

  // Démarrer la veille automatique
  async startMonitoring() {
    if (this.isRunning) {
      console.log('⚠️ La veille est déjà en cours');
      return;
    }

    this.isRunning = true;
    console.log('🚀 Démarrage de la veille automatique');

    // Surveillance continue
    this.intervalId = setInterval(async () => {
      await this.runMonitoringCycle();
    }, 30 * 60 * 1000); // Toutes les 30 minutes

    // Premier cycle immédiat
    await this.runMonitoringCycle();
  }

  // Arrêter la veille
  stopMonitoring() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }
    this.isRunning = false;
    console.log('⏹️ Veille automatique arrêtée');
  }

  // Cycle de surveillance
  public async runNow() {
    return this.runMonitoringCycle();
  }

  private async runMonitoringCycle() {
    console.log('🔍 Cycle de veille en cours...');
    
    try {
      // Collecter depuis chaque source activée
      const promises: Array<Promise<void>> = [];
      
      if (this.sources.linkedin.enabled) {
        promises.push(this.collectLinkedInContent());
      }
      
      if (this.sources.twitter.enabled) {
        promises.push(this.collectTwitterContent());
      }
      
      if (this.sources.youtube.enabled) {
        promises.push(this.collectYouTubeContent());
      }
      
      if (this.sources.rss.enabled) {
        promises.push(this.collectRSSContent());
      }
      
      if (this.sources.websites.enabled) {
        promises.push(this.collectWebsiteContent());
      }

      await Promise.all(promises);
      
      console.log('✅ Cycle de veille terminé');
      
      // Générer un rapport de veille
      await this.generateMonitoringReport();
      
    } catch (error) {
      console.error('❌ Erreur lors du cycle de veille:', error);
    }
  }

  // Collecter le contenu LinkedIn
  private async collectLinkedInContent(): Promise<void> {
    console.log('📱 Collecte LinkedIn en cours...');
    
    // Collecte basique à partir d'URLs de posts publiques (config)
    const configFile = 'data/monitoring/config.json';
    let config: any = {};
    try {
      const fs = await import('fs');
      const text = await fs.promises.readFile(configFile, 'utf8');
      config = JSON.parse(text);
    } catch {}

    const postUrls: string[] = config?.linkedin?.postUrls || [];
    if (!Array.isArray(postUrls) || postUrls.length === 0) {
      console.log('ℹ️ Aucune URL de post LinkedIn configurée (config.linkedin.postUrls)');
      return;
    }

    const seen = new Set<string>();
    try {
      const fs = await import('fs');
      const base = 'data/monitoring/sources';
      const files = await fs.promises.readdir(base).catch(() => [] as string[]);
      for (const f of files) {
        if (f.endsWith('.json')) {
          try {
            const item = JSON.parse(await fs.promises.readFile(`${base}/${f}`, 'utf8'));
            if (item?.url) seen.add(item.url as string);
          } catch {}
        }
      }
    } catch {}

    for (const url of postUrls.slice(0, 20)) {
      if (seen.has(url)) continue; // déduplication par URL
      try {
        const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
        const html = await res.text();
        const title = (html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)/i)?.[1])
          || (html.match(/<title>([^<]+)/i)?.[1]) || 'Post LinkedIn';
        const description = (html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)/i)?.[1]) || '';
        const author = (html.match(/<meta[^>]*name=["']author["'][^>]*content=["']([^"']+)/i)?.[1]) || 'LinkedIn';
        const published = new Date().toISOString();
        const likes = parseInt(html.match(/(\d+[\s,]?)+(?:\s*likes|j’aime)/i)?.[0]?.replace(/\D/g, '') || '0', 10);
        const comments = parseInt(html.match(/(\d+[\s,]?)+(?:\s*comments|commentaires)/i)?.[0]?.replace(/\D/g, '') || '0', 10);
        const shares = parseInt(html.match(/(\d+[\s,]?)+(?:\s*shares|partages)/i)?.[0]?.replace(/\D/g, '') || '0', 10);

        const content: MonitoringContent = {
          id: `linkedin_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          title,
          content: description,
          type: 'post',
          source: 'LinkedIn',
          url,
          author,
          publishedAt: published,
          collectedAt: new Date().toISOString(),
          metadata: { engagement: { likes, comments, shares }, platform: 'linkedin' }
        };
        await MonitoringStorage.saveMonitoringContent(content);
      } catch (e) {
        console.warn('LinkedIn fetch error for', url, e);
      }
    }
  }

  // Collecter le contenu Twitter
  private async collectTwitterContent(): Promise<void> {
    console.log('🐦 Collecte Twitter en cours...');
    
    // Simulation de collecte Twitter
    const mockTweets = [
      {
        title: 'Thread: 10 AI Tools Every Marketer Should Know',
        content: '🧵 Thread about AI tools that are changing the marketing game. 1/ ChatGPT for content creation 2/ Midjourney for visual content 3/ Jasper for copywriting...',
        author: '@MarketingAI',
        url: 'https://twitter.com/example/status/123',
        publishedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        metrics: { retweets: 45, likes: 120, replies: 15 }
      }
    ];

    for (const tweet of mockTweets) {
      const content: MonitoringContent = {
        id: `twitter_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        title: tweet.title,
        content: tweet.content,
        type: 'tweet',
        source: 'Twitter',
        url: tweet.url,
        author: tweet.author,
        publishedAt: tweet.publishedAt,
        collectedAt: new Date().toISOString(),
        metadata: {
          metrics: tweet.metrics,
          platform: 'twitter'
        }
      };

      await MonitoringStorage.saveMonitoringContent(content);
    }
  }

  // Collecter le contenu YouTube
  private async collectYouTubeContent(): Promise<void> {
    console.log('📺 Collecte YouTube en cours...');
    
    // Simulation de collecte YouTube
    const mockVideos = [
      {
        title: 'Marketing Automation Masterclass 2024',
        content: 'In this comprehensive masterclass, we cover everything you need to know about marketing automation in 2024. Topics include: Lead scoring, Email sequences, Customer journey mapping...',
        author: 'Marketing Academy',
        url: 'https://youtube.com/watch?v=example123',
        publishedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        duration: '45:30',
        views: 15420
      }
    ];

    for (const video of mockVideos) {
      const content: MonitoringContent = {
        id: `youtube_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        title: video.title,
        content: video.content,
        type: 'video',
        source: 'YouTube',
        url: video.url,
        author: video.author,
        publishedAt: video.publishedAt,
        collectedAt: new Date().toISOString(),
        metadata: {
          duration: video.duration,
          views: video.views,
          platform: 'youtube'
        }
      };

      await MonitoringStorage.saveMonitoringContent(content);
    }
  }

  // Collecter le contenu RSS
  private async collectRSSContent(): Promise<void> {
    console.log('📰 Collecte RSS en cours...');
    const feeds = this.sources.rss.feeds || [];
    for (const feedUrl of feeds.slice(0, 10)) {
      try {
        const res = await fetch(feedUrl);
        const xml = await res.text();
        const items = Array.from(xml.matchAll(/<item>[\s\S]*?<\/item>/gi)).slice(0, 5);
        for (const m of items) {
          const block = m[0];
          const title = block.match(/<title>([\s\S]*?)<\/title>/i)?.[1]?.replace(/<[^>]+>/g, '').trim() || 'Article';
          const link = block.match(/<link>([\s\S]*?)<\/link>/i)?.[1]?.trim();
          const desc = block.match(/<description>([\s\S]*?)<\/description>/i)?.[1]?.replace(/<[^>]+>/g, '').trim() || '';
          const pubDate = block.match(/<pubDate>([\s\S]*?)<\/pubDate>/i)?.[1] || new Date().toUTCString();
          if (!link) continue;
          const content: MonitoringContent = {
            id: `rss_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            title,
            content: desc,
            type: 'article',
            source: 'RSS',
            url: link,
            author: undefined,
            publishedAt: new Date(pubDate).toISOString(),
            collectedAt: new Date().toISOString(),
            metadata: { platform: 'rss' }
          };
          await MonitoringStorage.saveMonitoringContent(content);
        }
      } catch (e) {
        console.warn('RSS fetch error for', feedUrl, e);
      }
    }
  }

  // Collecter le contenu des sites web
  private async collectWebsiteContent(): Promise<void> {
    console.log('🌐 Collecte sites web en cours...');
    const site = process.env.SITE_URL || '';
    const urls = [...(this.sources.websites.urls || [])];
    if (site) urls.unshift(site);

    const unique = Array.from(new Set(urls));
    for (const base of unique.slice(0, 10)) {
      try {
        // Essayer de récupérer un sitemap
        const sitemapUrl = base.endsWith('/') ? `${base}sitemap.xml` : `${base}/sitemap.xml`;
        let targets: string[] = [];
        try {
          const res = await fetch(sitemapUrl);
          if (res.ok) {
            const xml = await res.text();
            targets = Array.from(xml.matchAll(/<loc>([^<]+)<\/loc>/gi)).map(m => m[1]).slice(0, 20);
          }
        } catch {}

        if (targets.length === 0) targets = [base];

        for (const url of targets) {
          try {
            const res = await fetch(url);
            if (!res.ok) continue;
            const html = await res.text();
            const title = (html.match(/<title>([^<]+)<\/title>/i)?.[1] || '').trim();
            const description = (html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)/i)?.[1] || '').trim();
            const text = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
              .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
              .replace(/<[^>]+>/g, ' ')
              .replace(/\s+/g, ' ')
              .trim();
            const contentText = description || text.slice(0, 1200);
            const published = new Date().toISOString();
            const host = (() => { try { return new URL(url).host; } catch { return 'website'; } })();

            const content: MonitoringContent = {
              id: `web_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              title: title || host,
              content: contentText,
              type: 'article',
              source: host,
              url,
              publishedAt: published,
              collectedAt: new Date().toISOString(),
              metadata: { platform: 'website' }
            };
            await MonitoringStorage.saveMonitoringContent(content);
          } catch (e) {
            console.warn('Website fetch error for', url, e);
          }
        }
      } catch (e) {
        console.warn('Website base error for', base, e);
      }
    }
  }

  // Générer un rapport de veille
  private async generateMonitoringReport(): Promise<void> {
    const stats = await MonitoringStorage.getMonitoringStats();
    const reportPath = 'data/monitoring/daily_report.json';
    
    const report = {
      date: new Date().toISOString().split('T')[0],
      summary: {
        totalItems: stats.totalItems,
        newItemsToday: Object.values(stats.byDate).reduce((sum, count) => sum + count, 0),
        topSources: Object.entries(stats.bySource)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 5),
        topKeywords: Object.entries(stats.keywords)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 10),
        contentTypes: stats.byType
      },
      trends: {
        growingTopics: this.identifyGrowingTopics(stats),
        emergingKeywords: this.identifyEmergingKeywords(stats),
        sourcePerformance: this.analyzeSourcePerformance(stats)
      },
      recommendations: this.generateRecommendations(stats),
      generatedAt: new Date().toISOString()
    };

    // Sauvegarder le rapport
    const reportFile = `data/monitoring/reports/report_${report.date}.json`;
    await MonitoringStorage['ensureDirectoryExists']('data/monitoring/reports');
    
    const fs = await import('fs');
    await fs.promises.writeFile(reportFile, JSON.stringify(report, null, 2));
    
    console.log(`📊 Rapport de veille généré: ${reportFile}`);
  }

  // Identifier les sujets en croissance
  private identifyGrowingTopics(stats: any): string[] {
    // Logique pour identifier les tendances émergentes
    return Object.entries(stats.keywords)
      .filter(([, count]) => (count as number) > 3)
      .map(([keyword]) => keyword)
      .slice(0, 5);
  }

  // Identifier les nouveaux mots-clés
  private identifyEmergingKeywords(stats: any): string[] {
    // Logique pour identifier les nouveaux termes
    return Object.keys(stats.keywords).slice(-10);
  }

  // Analyser les performances des sources
  private analyzeSourcePerformance(stats: any): Record<string, any> {
    return Object.entries(stats.bySource).reduce((acc, [source, count]) => {
      acc[source] = {
        itemCount: count,
        performance: (count as number) > 5 ? 'high' : (count as number) > 2 ? 'medium' : 'low'
      };
      return acc;
    }, {} as Record<string, any>);
  }

  // Générer des recommandations
  private generateRecommendations(stats: any): string[] {
    const recommendations: string[] = [];
    
    if (stats.totalItems < 10) {
      recommendations.push('Considérer l\'ajout de nouvelles sources de veille');
    }
    
    if (Object.keys(stats.bySource).length < 3) {
      recommendations.push('Diversifier les sources de contenu');
    }
    
    const topKeywords = Object.entries(stats.keywords)
      .sort(([,a], [,b]) => (b as number) - (a as number))
      .slice(0, 3)
      .map(([keyword]) => keyword);
    
    if (topKeywords.length > 0) {
      recommendations.push(`Créer du contenu autour des sujets populaires: ${topKeywords.join(', ')}`);
    }
    
    return recommendations;
  }

  // Configuration de la veille
  async updateSourceConfig(sourceType: keyof typeof this.sources, config: any) {
    this.sources[sourceType] = { ...this.sources[sourceType], ...config };
    console.log(`✅ Configuration mise à jour pour ${sourceType}`);
    
    // Sauvegarder la configuration
    const configFile = 'data/monitoring/config.json';
    const fs = await import('fs');
    await fs.promises.writeFile(configFile, JSON.stringify(this.sources, null, 2));
  }

  // Obtenir le statut de la veille
  getStatus() {
    return {
      isRunning: this.isRunning,
      sources: this.sources,
      lastCycle: new Date().toISOString()
    };
  }

  // Recherche manuelle de contenu
  async manualSearch(query: string, sources?: string[]): Promise<MonitoringContent[]> {
    console.log(`🔍 Recherche manuelle: ${query}`);
    
    // Simuler une recherche manuelle
    const results: MonitoringContent[] = [];
    
    // Cette méthode pourrait être étendue pour faire de vraies recherches API
    if (!sources || sources.includes('linkedin')) {
      // Recherche LinkedIn simulée
    }
    
    if (!sources || sources.includes('google')) {
      // Recherche Google simulée
    }
    
    return results;
  }
}

// Interface pour les filtres de monitoring
export interface MonitoringFilters {
  type?: string;
  source?: string;
  dateFrom?: string;
  dateTo?: string;
  tags?: string[];
  keywords?: string[];
}

// Classe utilitaire pour l'analyse de contenu
export class ContentAnalyzer {
  // Extraire les entités nommées (personnes, organisations, lieux)
  static extractNamedEntities(content: string): Record<string, string[]> {
    // Patterns simples pour la démonstration
    const patterns = {
      companies: /\b([A-Z][a-z]+ (?:Inc|Corp|LLC|Ltd|Company|Group|Systems|Technologies|Solutions))\b/g,
      people: /\b([A-Z][a-z]+ [A-Z][a-z]+)\b/g,
      technologies: /\b(AI|Machine Learning|ChatGPT|GPT-4|TensorFlow|PyTorch|React|Vue|Angular)\b/g
    };
    
    const entities: Record<string, string[]> = {};
    
    Object.entries(patterns).forEach(([type, pattern]) => {
      const matches = content.match(pattern) || [];
      entities[type] = [...new Set(matches)];
    });
    
    return entities;
  }

  // Calculer la lisibilité du contenu
  static calculateReadability(content: string): number {
    const sentences = content.split(/[.!?]+/).length - 1;
    const words = content.split(/\s+/).length;
    const syllables = content.split(/[aeiouAEIOU]/).length - 1;
    
    // Score Flesch simplifié
    if (sentences === 0 || words === 0) return 0;
    
    const avgWordsPerSentence = words / sentences;
    const avgSyllablesPerWord = syllables / words;
    
    return 206.835 - (1.015 * avgWordsPerSentence) - (84.6 * avgSyllablesPerWord);
  }

  // Détecter les call-to-actions
  static detectCallToActions(content: string): string[] {
    const ctaPatterns = [
      /\b(learn more|read more|download|subscribe|sign up|register|get started|try now|contact us|book a demo)\b/gi,
      /\b(découvrez|téléchargez|inscrivez-vous|commencez|essayez|contactez-nous)\b/gi
    ];
    
    const ctas: string[] = [];
    ctaPatterns.forEach(pattern => {
      const matches = content.match(pattern) || [];
      ctas.push(...matches);
    });
    
    return [...new Set(ctas)];
  }
}