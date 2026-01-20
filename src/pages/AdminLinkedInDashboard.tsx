import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Target,
  Clock,
  TrendingUp,
  Flame,
  Play,
  RefreshCw,
  BarChart3,
  Settings,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { linkedinService } from '@/services/linkedinService';
import { useNavigate } from 'react-router-dom';

interface DashboardStats {
  postsToProcess: number;
  commentsToday: number;
  leadsThisMonth: number;
  scrapingProgress: {
    current: number;
    total: number;
    percentage: number;
  };
  aiAnalysisProgress: {
    claude: 'idle' | 'processing' | 'done' | 'error';
    gpt4o: 'idle' | 'processing' | 'done' | 'error';
    gemini: 'idle' | 'processing' | 'done' | 'error';
  };
  hotOpportunities: Array<{
    id: string;
    authorName: string;
    authorTitle: string;
    score: number;
    leadPriority: 'high' | 'medium' | 'low';
  }>;
  agentPerformance: {
    claude: { selectedRate: number; avgResponseTime: number };
    gpt4o: { selectedRate: number; avgResponseTime: number };
    gemini: { selectedRate: number; avgResponseTime: number };
  };
  costs: {
    total: number;
    uptime: number;
  };
}

export default function AdminLinkedInDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isScrapingLive, setIsScrapingLive] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardStats();

    // Refresh every 30 seconds when scraping is live
    const interval = setInterval(() => {
      if (isScrapingLive) {
        loadDashboardStats();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [isScrapingLive]);

  const loadDashboardStats = async () => {
    try {
      setLoading(true);
      const data = await linkedinService.getDashboardStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to load dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartScraping = async () => {
    setIsScrapingLive(true);
    try {
      await linkedinService.triggerScraping();
    } catch (error) {
      console.error('Failed to start scraping:', error);
      setIsScrapingLive(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'done':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'processing':
        return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">LinkedIn Agent - Command Center</h1>
          <p className="text-gray-500 mt-1">Vue d'ensemble stratégique et actions rapides</p>
        </div>
        <Badge variant={isScrapingLive ? "default" : "secondary"} className="text-sm px-3 py-1">
          {isScrapingLive ? (
            <>
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2" />
              Live
            </>
          ) : (
            'Idle'
          )}
        </Badge>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 bg-white border-l-4 border-l-red-500">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">🎯 À traiter</p>
              <p className="text-4xl font-bold text-gray-900">{stats.postsToProcess}</p>
              <p className="text-xs text-gray-500 mt-1">posts</p>
            </div>
            <div className="p-3 bg-red-50 rounded-lg">
              <Target className="w-6 h-6 text-red-500" />
            </div>
          </div>
          <Button
            className="w-full mt-4"
            onClick={() => navigate('/admin/linkedin/posts')}
          >
            Traiter maintenant
          </Button>
        </Card>

        <Card className="p-6 bg-white border-l-4 border-l-blue-500">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">⏱️ Aujourd'hui</p>
              <p className="text-4xl font-bold text-gray-900">{stats.commentsToday}</p>
              <p className="text-xs text-gray-500 mt-1">commentaires</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <Clock className="w-6 h-6 text-blue-500" />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-white border-l-4 border-l-green-500">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">📈 Ce mois</p>
              <p className="text-4xl font-bold text-gray-900">{stats.leadsThisMonth}</p>
              <p className="text-xs text-gray-500 mt-1">leads</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-500" />
            </div>
          </div>
        </Card>
      </div>

      {/* Pipeline temps réel */}
      {isScrapingLive && (
        <Card className="p-6 bg-white">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
            Pipeline temps réel
          </h2>

          <div className="space-y-4">
            {/* Scraping progress */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Scraping LinkedIn...</span>
                <span className="text-sm text-gray-500">
                  {stats.scrapingProgress.current}/{stats.scrapingProgress.total} posts
                </span>
              </div>
              <Progress value={stats.scrapingProgress.percentage} className="h-2" />
            </div>

            {/* AI Analysis */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Analyse IA</span>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  {getStatusIcon(stats.aiAnalysisProgress.claude)}
                  <span>Claude</span>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(stats.aiAnalysisProgress.gpt4o)}
                  <span>GPT-4o</span>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(stats.aiAnalysisProgress.gemini)}
                  <span>Gemini</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Hot Opportunities */}
      <Card className="p-6 bg-white">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Flame className="w-5 h-5 text-orange-500" />
          Opportunités Hot 🔥
        </h2>

        {stats.hotOpportunities.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-8">
            Aucune opportunité haute priorité pour le moment
          </p>
        ) : (
          <div className="space-y-3">
            {stats.hotOpportunities.map((opp) => (
              <div
                key={opp.id}
                className="flex items-center justify-between p-3 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 transition-colors cursor-pointer"
                onClick={() => navigate(`/admin/linkedin/posts?focus=${opp.id}`)}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-red-500 text-lg">⚠️</span>
                    <div>
                      <p className="font-medium text-gray-900">{opp.authorName}</p>
                      <p className="text-sm text-gray-500">{opp.authorTitle}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="default">Score {opp.score}/10</Badge>
                  <Badge variant={opp.leadPriority === 'high' ? 'destructive' : 'secondary'}>
                    {opp.leadPriority.toUpperCase()}
                  </Badge>
                </div>
              </div>
            ))}

            <Button
              variant="outline"
              className="w-full mt-4"
              onClick={() => navigate('/admin/linkedin/posts?filter=high_priority')}
            >
              → Traiter maintenant
            </Button>
          </div>
        )}
      </Card>

      {/* Agent Performance */}
      <Card className="p-6 bg-white">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-primary" />
          Performance Agents (7 derniers jours)
        </h2>

        <div className="space-y-4">
          {/* Claude */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium flex items-center gap-2">
                🧠 Claude Sonnet 4.5
              </span>
              <span className="text-sm text-gray-500">
                {stats.agentPerformance.claude.selectedRate}% sélectionné
              </span>
            </div>
            <Progress value={stats.agentPerformance.claude.selectedRate} className="h-2" />
            <p className="text-xs text-gray-500 mt-1">
              Temps moyen: {stats.agentPerformance.claude.avgResponseTime}s
            </p>
          </div>

          {/* GPT-4o */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium flex items-center gap-2">
                🤖 GPT-4o
                {stats.agentPerformance.gpt4o.selectedRate >= 80 && (
                  <Badge variant="default" className="text-xs">🏆 Top</Badge>
                )}
              </span>
              <span className="text-sm text-gray-500">
                {stats.agentPerformance.gpt4o.selectedRate}% sélectionné
              </span>
            </div>
            <Progress value={stats.agentPerformance.gpt4o.selectedRate} className="h-2" />
            <p className="text-xs text-gray-500 mt-1">
              Temps moyen: {stats.agentPerformance.gpt4o.avgResponseTime}s
            </p>
          </div>

          {/* Gemini */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium flex items-center gap-2">
                🌟 Gemini 2.0 Flash
              </span>
              <span className="text-sm text-gray-500">
                {stats.agentPerformance.gemini.selectedRate}% sélectionné
              </span>
            </div>
            <Progress value={stats.agentPerformance.gemini.selectedRate} className="h-2" />
            <p className="text-xs text-gray-500 mt-1">
              Temps moyen: {stats.agentPerformance.gemini.avgResponseTime}s
            </p>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between text-sm">
          <span className="text-gray-500">
            Coût ce mois: <span className="font-semibold text-gray-900">${stats.costs.total}</span>
          </span>
          <span className="text-gray-500">
            Uptime: <span className="font-semibold text-green-600">{stats.costs.uptime}%</span>
          </span>
        </div>
      </Card>

      {/* Quick Actions */}
      <Card className="p-6 bg-white">
        <h2 className="text-lg font-semibold mb-4">Actions rapides</h2>
        <div className="grid grid-cols-2 gap-4">
          <Button
            onClick={handleStartScraping}
            disabled={isScrapingLive}
            className="h-auto py-4"
          >
            <Play className="w-5 h-5 mr-2" />
            Lancer scraping
          </Button>
          <Button
            variant="outline"
            onClick={() => window.location.reload()}
            className="h-auto py-4"
          >
            <RefreshCw className="w-5 h-5 mr-2" />
            Re-analyser
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate('/admin/linkedin/analytics')}
            className="h-auto py-4"
          >
            <BarChart3 className="w-5 h-5 mr-2" />
            Voir analytics
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate('/admin/linkedin/settings')}
            className="h-auto py-4"
          >
            <Settings className="w-5 h-5 mr-2" />
            Paramètres
          </Button>
        </div>
      </Card>
    </div>
  );
}
