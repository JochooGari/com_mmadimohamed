import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Users, Search, Globe, Clock, Eye, ThumbsUp, Share2, MessageSquare } from 'lucide-react';

interface CompetitorData {
  title: string;
  url: string;
  position: number;
  wordCount: number;
  seoScore: number;
  features: string[];
}

interface KeywordInsight {
  keyword: string;
  searchVolume: number;
  difficulty: number;
  trend: 'up' | 'down' | 'stable';
  suggestions: string[];
}

interface InsightsData {
  topCompetitors: CompetitorData[];
  keywordInsights: KeywordInsight[];
  contentGaps: string[];
  popularQuestions: string[];
  trendingTopics: string[];
  searchTrends: {
    month: string;
    volume: number;
  }[];
  performanceMetrics: {
    estimatedViews: number;
    engagementRate: number;
    sharesPotential: number;
    readingTime: number;
  };
}

interface InsightsProps {
  content: {
    title: string;
    slug: string;
    excerpt: string;
    content_md: string;
    keywords: string[];
  };
}

export default function Insights({ content }: InsightsProps) {
  const [insights, setInsights] = useState<InsightsData>({
    topCompetitors: [],
    keywordInsights: [],
    contentGaps: [],
    popularQuestions: [],
    trendingTopics: [],
    searchTrends: [],
    performanceMetrics: {
      estimatedViews: 0,
      engagementRate: 0,
      sharesPotential: 0,
      readingTime: 0
    }
  });

  const [activeTab, setActiveTab] = useState<'competitors' | 'keywords' | 'trends' | 'performance'>('competitors');
  const [isLoading, setIsLoading] = useState(false);

  // Simulation des données d'insights
  useEffect(() => {
    const generateInsights = () => {
      const wordCount = content.content_md.split(/\s+/).filter(word => word.length > 0).length;
      const readingTime = Math.ceil(wordCount / 200);

      const mockInsights: InsightsData = {
        topCompetitors: [
          {
            title: "Guide complet du marketing digital en 2024",
            url: "https://example1.com",
            position: 1,
            wordCount: 2500,
            seoScore: 92,
            features: ["FAQ", "Tableaux", "Infographies"]
          },
          {
            title: "Marketing digital : stratégies gagnantes",
            url: "https://example2.com",
            position: 2,
            wordCount: 1800,
            seoScore: 88,
            features: ["Listes", "Citations", "Exemples"]
          },
          {
            title: "Tendances marketing digital 2024",
            url: "https://example3.com",
            position: 3,
            wordCount: 2200,
            seoScore: 85,
            features: ["Statistiques", "Cas d'usage", "Outils"]
          }
        ],
        keywordInsights: [
          {
            keyword: content.keywords[0] || "marketing digital",
            searchVolume: 18100,
            difficulty: 75,
            trend: 'up',
            suggestions: ["marketing digital 2024", "stratégie marketing digital", "outils marketing digital"]
          },
          {
            keyword: "SEO",
            searchVolume: 49500,
            difficulty: 82,
            trend: 'stable',
            suggestions: ["SEO technique", "audit SEO", "optimisation SEO"]
          },
          {
            keyword: "contenu web",
            searchVolume: 3600,
            difficulty: 45,
            trend: 'up',
            suggestions: ["rédaction web", "content marketing", "stratégie contenu"]
          }
        ],
        contentGaps: [
          "Manque d'exemples concrets et de cas d'usage",
          "Peu de données statistiques récentes",
          "Absence de section outils recommandés",
          "FAQ inexistante sur les questions populaires",
          "Pas de comparaison avec la concurrence"
        ],
        popularQuestions: [
          "Qu'est-ce que le marketing digital exactement ?",
          "Comment commencer en marketing digital ?",
          "Quels sont les meilleurs outils de marketing digital ?",
          "Combien coûte une stratégie marketing digital ?",
          "Comment mesurer le ROI du marketing digital ?"
        ],
        trendingTopics: [
          "IA générative en marketing (+125%)",
          "Marketing automation (+89%)",
          "Privacy-first marketing (+67%)",
          "Video marketing (+54%)",
          "Micro-influenceurs (+43%)"
        ],
        searchTrends: [
          { month: "Jan", volume: 15200 },
          { month: "Fév", volume: 16800 },
          { month: "Mar", volume: 18100 },
          { month: "Avr", volume: 19400 },
          { month: "Mai", volume: 21200 },
          { month: "Jun", volume: 18900 }
        ],
        performanceMetrics: {
          estimatedViews: Math.max(150, wordCount * 0.8 + Math.random() * 500),
          engagementRate: Math.min(8.5, Math.max(2.1, wordCount / 200 + Math.random() * 3)),
          sharesPotential: Math.max(5, Math.min(45, wordCount / 50 + Math.random() * 20)),
          readingTime
        }
      };

      setInsights(mockInsights);
    };

    generateInsights();
  }, [content]);

  const refreshInsights = async () => {
    setIsLoading(true);
    // Simuler appel API
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsLoading(false);
    // Dans la vraie app, récupérer de nouvelles données
  };

  const getDifficultyColor = (difficulty: number) => {
    if (difficulty >= 80) return 'text-red-600 bg-red-100';
    if (difficulty >= 60) return 'text-orange-600 bg-orange-100';
    if (difficulty >= 40) return 'text-yellow-600 bg-yellow-100';
    return 'text-green-600 bg-green-100';
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down': return <TrendingUp className="w-4 h-4 text-red-500 rotate-180" />;
      case 'stable': return <div className="w-4 h-1 bg-gray-400 rounded" />;
    }
  };

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <BarChart3 className="w-4 h-4" />
          Insights & Analytics
        </h3>
        <button
          onClick={refreshInsights}
          disabled={isLoading}
          className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {isLoading ? 'Actualisation...' : 'Actualiser'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
        <button
          onClick={() => setActiveTab('competitors')}
          className={`flex-1 px-2 py-2 text-xs font-medium rounded transition-colors ${
            activeTab === 'competitors'
              ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
          }`}
        >
          Concurrence
        </button>
        <button
          onClick={() => setActiveTab('keywords')}
          className={`flex-1 px-2 py-2 text-xs font-medium rounded transition-colors ${
            activeTab === 'keywords'
              ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
          }`}
        >
          Mots-clés
        </button>
        <button
          onClick={() => setActiveTab('trends')}
          className={`flex-1 px-2 py-2 text-xs font-medium rounded transition-colors ${
            activeTab === 'trends'
              ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
          }`}
        >
          Tendances
        </button>
        <button
          onClick={() => setActiveTab('performance')}
          className={`flex-1 px-2 py-2 text-xs font-medium rounded transition-colors ${
            activeTab === 'performance'
              ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
          }`}
        >
          Perf.
        </button>
      </div>

      {/* Tab Content */}
      <div className="space-y-4">
        {activeTab === 'competitors' && (
          <>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                Top 3 Concurrents SERP
              </h4>
              <div className="space-y-3">
                {insights.topCompetitors.map((competitor, index) => (
                  <div key={index} className="border border-gray-200 dark:border-gray-600 rounded-lg p-3">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                            index === 0 ? 'bg-yellow-100 text-yellow-800' :
                            index === 1 ? 'bg-gray-100 text-gray-800' :
                            'bg-orange-100 text-orange-800'
                          }`}>
                            #{competitor.position}
                          </span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {competitor.title}
                          </span>
                        </div>
                        <div className="text-xs text-blue-600 dark:text-blue-400 mb-2">
                          {competitor.url}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-4">
                        <span className="text-gray-600 dark:text-gray-400">
                          {competitor.wordCount} mots
                        </span>
                        <span className={`px-2 py-1 rounded ${getDifficultyColor(competitor.seoScore)}`}>
                          SEO: {competitor.seoScore}
                        </span>
                      </div>
                    </div>

                    <div className="mt-2 flex flex-wrap gap-1">
                      {competitor.features.map((feature, idx) => (
                        <span
                          key={idx}
                          className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full dark:bg-blue-900/30 dark:text-blue-300"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                Gaps de contenu détectés
              </h4>
              <div className="space-y-2">
                {insights.contentGaps.slice(0, 3).map((gap, index) => (
                  <div key={index} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 flex-shrink-0" />
                    <span>{gap}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {activeTab === 'keywords' && (
          <>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                Analyse des mots-clés
              </h4>
              <div className="space-y-3">
                {insights.keywordInsights.map((keyword, index) => (
                  <div key={index} className="border border-gray-200 dark:border-gray-600 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm text-gray-900 dark:text-white">
                          {keyword.keyword}
                        </span>
                        {getTrendIcon(keyword.trend)}
                      </div>
                      <span className={`px-2 py-1 rounded text-xs ${getDifficultyColor(keyword.difficulty)}`}>
                        Difficulté: {keyword.difficulty}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400 mb-2">
                      <div className="flex items-center gap-1">
                        <Search className="w-3 h-3" />
                        {keyword.searchVolume.toLocaleString()}/mois
                      </div>
                    </div>

                    <div className="text-xs">
                      <div className="text-gray-600 dark:text-gray-400 mb-1">Suggestions LSI:</div>
                      <div className="flex flex-wrap gap-1">
                        {keyword.suggestions.slice(0, 3).map((suggestion, idx) => (
                          <span
                            key={idx}
                            className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full dark:bg-gray-600 dark:text-gray-300"
                          >
                            {suggestion}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                Questions populaires (PAA)
              </h4>
              <div className="space-y-2">
                {insights.popularQuestions.slice(0, 4).map((question, index) => (
                  <div key={index} className="flex items-start gap-2 text-sm">
                    <div className="text-blue-600 dark:text-blue-400 mt-1">?</div>
                    <span className="text-gray-700 dark:text-gray-300">{question}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {activeTab === 'trends' && (
          <>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                Sujets tendance
              </h4>
              <div className="space-y-2">
                {insights.trendingTopics.map((topic, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-green-50 dark:bg-green-900/20 rounded">
                    <span className="text-sm text-gray-900 dark:text-white">{topic.split(' (')[0]}</span>
                    <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                      {topic.split(' (')[1]?.replace(')', '')}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                Évolution des recherches
              </h4>
              <div className="space-y-1">
                {insights.searchTrends.map((trend, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <span className="text-xs text-gray-600 dark:text-gray-400 w-8">{trend.month}</span>
                    <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(trend.volume / 25000) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-600 dark:text-gray-400 w-12">
                      {(trend.volume / 1000).toFixed(1)}k
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {activeTab === 'performance' && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Eye className="w-4 h-4 text-blue-600" />
                  <span className="text-xs text-gray-600 dark:text-gray-400">Vues estimées</span>
                </div>
                <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                  {Math.round(insights.performanceMetrics.estimatedViews)}
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <ThumbsUp className="w-4 h-4 text-green-600" />
                  <span className="text-xs text-gray-600 dark:text-gray-400">Engagement</span>
                </div>
                <div className="text-lg font-bold text-green-600 dark:text-green-400">
                  {insights.performanceMetrics.engagementRate.toFixed(1)}%
                </div>
              </div>

              <div className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Share2 className="w-4 h-4 text-purple-600" />
                  <span className="text-xs text-gray-600 dark:text-gray-400">Partages</span>
                </div>
                <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
                  {Math.round(insights.performanceMetrics.sharesPotential)}
                </div>
              </div>

              <div className="bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="w-4 h-4 text-orange-600" />
                  <span className="text-xs text-gray-600 dark:text-gray-400">Lecture</span>
                </div>
                <div className="text-lg font-bold text-orange-600 dark:text-orange-400">
                  {insights.performanceMetrics.readingTime} min
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-700/50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Recommandations performance
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2" />
                  <span className="text-gray-700 dark:text-gray-300">
                    Optimiser pour mobile (60% du trafic)
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2" />
                  <span className="text-gray-700 dark:text-gray-300">
                    Ajouter des CTA pour améliorer l'engagement
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2" />
                  <span className="text-gray-700 dark:text-gray-300">
                    Intégrer plus de visuels (images/vidéos)
                  </span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}