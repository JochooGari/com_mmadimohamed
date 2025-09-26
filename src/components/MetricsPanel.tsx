 

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  ChevronLeft,
  ChevronRight,
  Activity,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Zap,
  Target,
  Timer
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MetricData {
  id: string;
  name: string;
  value: number | string;
  previousValue?: number | string;
  unit?: string;
  target?: number;
  status: 'good' | 'warning' | 'critical' | 'neutral';
  trend?: 'up' | 'down' | 'stable';
  description?: string;
}

interface PerformanceMetrics {
  executionTime: number;
  tokensUsed: number;
  requestsCount: number;
  successRate: number;
  errorRate: number;
  averageLatency: number;
}

interface AgentMetrics {
  agentId: string;
  agentName: string;
  requestsCount: number;
  successRate: number;
  averageResponseTime: number;
  tokensUsed: number;
  status: 'active' | 'idle' | 'error';
  lastActivity?: Date;
}

interface MetricsPanelProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  performance: PerformanceMetrics;
  agents: AgentMetrics[];
  customMetrics?: MetricData[];
  realTimeUpdates?: boolean;
  className?: string;
}

const statusColors = {
  good: 'text-green-600 bg-green-50 border-green-200',
  warning: 'text-yellow-600 bg-yellow-50 border-yellow-200',
  critical: 'text-red-600 bg-red-50 border-red-200',
  neutral: 'text-gray-600 bg-gray-50 border-gray-200'
};

const statusIcons = {
  good: <CheckCircle className="w-4 h-4 text-green-500" />,
  warning: <AlertCircle className="w-4 h-4 text-yellow-500" />,
  critical: <AlertCircle className="w-4 h-4 text-red-500" />,
  neutral: <Activity className="w-4 h-4 text-gray-500" />
};

const trendIcons = {
  up: <TrendingUp className="w-3 h-3 text-green-500" />,
  down: <TrendingDown className="w-3 h-3 text-red-500" />,
  stable: <div className="w-3 h-3 rounded-full bg-gray-400" />
};

const agentStatusColors = {
  active: 'bg-green-100 text-green-800',
  idle: 'bg-gray-100 text-gray-800',
  error: 'bg-red-100 text-red-800'
};

export function MetricsPanel({
  isCollapsed,
  onToggleCollapse,
  performance,
  agents,
  customMetrics = [],
  realTimeUpdates = false,
  className
}: MetricsPanelProps) {
  const [refreshRate, setRefreshRate] = useState(5000);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    if (!realTimeUpdates) return;

    const interval = setInterval(() => {
      setLastUpdate(new Date());
    }, refreshRate);

    return () => clearInterval(interval);
  }, [realTimeUpdates, refreshRate]);

  const formatValue = (value: number | string, unit?: string) => {
    if (typeof value === 'string') return value;

    if (unit === 'ms' && value >= 1000) {
      return `${(value / 1000).toFixed(1)}s`;
    }

    if (unit === 'bytes' && value >= 1024) {
      const kb = value / 1024;
      if (kb >= 1024) {
        return `${(kb / 1024).toFixed(1)} MB`;
      }
      return `${kb.toFixed(1)} KB`;
    }

    if (typeof value === 'number' && value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    }

    if (typeof value === 'number' && value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }

    return `${value}${unit || ''}`;
  };

  const calculateStatus = (value: number, target?: number): 'good' | 'warning' | 'critical' | 'neutral' => {
    if (!target) return 'neutral';

    const percentage = (value / target) * 100;
    if (percentage >= 90) return 'good';
    if (percentage >= 70) return 'warning';
    return 'critical';
  };

  const mainMetrics: MetricData[] = [
    {
      id: 'execution-time',
      name: 'Temps d\'exécution',
      value: performance.executionTime,
      unit: 'ms',
      status: performance.executionTime < 30000 ? 'good' : performance.executionTime < 60000 ? 'warning' : 'critical',
      description: 'Durée totale du workflow'
    },
    {
      id: 'success-rate',
      name: 'Taux de succès',
      value: performance.successRate,
      unit: '%',
      target: 95,
      status: calculateStatus(performance.successRate, 95),
      description: 'Pourcentage de requêtes réussies'
    },
    {
      id: 'tokens-used',
      name: 'Tokens utilisés',
      value: performance.tokensUsed,
      status: 'neutral',
      description: 'Total de tokens consommés'
    },
    {
      id: 'error-rate',
      name: 'Taux d\'erreur',
      value: performance.errorRate,
      unit: '%',
      status: performance.errorRate < 5 ? 'good' : performance.errorRate < 10 ? 'warning' : 'critical',
      description: 'Pourcentage d\'erreurs'
    },
    {
      id: 'avg-latency',
      name: 'Latence moyenne',
      value: performance.averageLatency,
      unit: 'ms',
      status: performance.averageLatency < 2000 ? 'good' : performance.averageLatency < 5000 ? 'warning' : 'critical',
      description: 'Temps de réponse moyen'
    }
  ];

  return (
    <div
      className={cn(
        "metrics-panel h-full border-r bg-background transition-all duration-300 ease-in-out",
        isCollapsed ? "w-12" : "w-80",
        className
      )}
    >
      {/* Toggle Button */}
      <div className="absolute -right-3 top-6 z-10">
        <Button
          variant="outline"
          size="sm"
          onClick={onToggleCollapse}
          className="h-6 w-6 p-0 rounded-full shadow-md bg-white"
        >
          {isCollapsed ? (
            <ChevronRight className="w-3 h-3" />
          ) : (
            <ChevronLeft className="w-3 h-3" />
          )}
        </Button>
      </div>

      {/* Content */}
      <div className={cn("h-full", isCollapsed && "overflow-hidden")}>
        {isCollapsed ? (
          // Collapsed View - Icons only
          <div className="p-2 space-y-4">
            <div className="text-center">
              <BarChart3 className="w-6 h-6 mx-auto text-muted-foreground" />
            </div>

            {/* Status indicators */}
            <div className="space-y-2">
              {mainMetrics.slice(0, 4).map((metric) => (
                <div
                  key={metric.id}
                  className="w-8 h-8 rounded flex items-center justify-center mx-auto"
                  title={`${metric.name}: ${formatValue(metric.value, metric.unit)}`}
                >
                  {statusIcons[metric.status]}
                </div>
              ))}
            </div>

            {/* Agent status indicators */}
            <div className="space-y-1">
              {agents.slice(0, 3).map((agent) => (
                <div
                  key={agent.agentId}
                  className={cn(
                    "w-8 h-2 rounded mx-auto",
                    agent.status === 'active' ? 'bg-green-500' :
                    agent.status === 'error' ? 'bg-red-500' : 'bg-gray-300'
                  )}
                  title={`${agent.agentName}: ${agent.status}`}
                />
              ))}
            </div>
          </div>
        ) : (
          // Expanded View
          <div className="h-full flex flex-col">
            <div className="p-4 border-b">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Métriques
                </h3>
                {realTimeUpdates && (
                  <Badge variant="outline" className="text-xs">
                    🟢 Live
                  </Badge>
                )}
              </div>
              {realTimeUpdates && (
                <p className="text-xs text-muted-foreground">
                  Dernière mise à jour: {lastUpdate.toLocaleTimeString()}
                </p>
              )}
            </div>

            <ScrollArea className="flex-1">
              <div className="p-4 space-y-6">
                {/* Main Performance Metrics */}
                <div>
                  <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                    <Activity className="w-4 h-4" />
                    Performance Globale
                  </h4>
                  <div className="space-y-3">
                    {mainMetrics.map((metric) => (
                      <Card key={metric.id} className={cn("p-3", statusColors[metric.status])}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">{metric.name}</span>
                          {statusIcons[metric.status]}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold">
                            {formatValue(metric.value, metric.unit)}
                          </span>
                          {metric.trend && trendIcons[metric.trend]}
                        </div>
                        {metric.target && (
                          <Progress
                            value={Math.min(100, (Number(metric.value) / metric.target) * 100)}
                            className="mt-2 h-1"
                          />
                        )}
                        {metric.description && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {metric.description}
                          </p>
                        )}
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Agents Status */}
                <div>
                  <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    Agents ({agents.length})
                  </h4>
                  <div className="space-y-2">
                    {agents.map((agent) => (
                      <Card key={agent.agentId} className="p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium truncate">
                            {agent.agentName}
                          </span>
                          <Badge
                            variant="outline"
                            className={cn("text-xs", agentStatusColors[agent.status])}
                          >
                            {agent.status}
                          </Badge>
                        </div>
                        <div className="space-y-1 text-xs text-muted-foreground">
                          <div className="flex justify-between">
                            <span>Succès:</span>
                            <span>{agent.successRate}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Temps moy:</span>
                            <span>{formatValue(agent.averageResponseTime, 'ms')}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Tokens:</span>
                            <span>{formatValue(agent.tokensUsed)}</span>
                          </div>
                          {agent.lastActivity && (
                            <div className="flex justify-between">
                              <span>Dernière activité:</span>
                              <span>{agent.lastActivity.toLocaleTimeString()}</span>
                            </div>
                          )}
                        </div>

                        <Progress
                          value={agent.successRate}
                          className="mt-2 h-1"
                        />
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Custom Metrics */}
                {customMetrics.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                      <Target className="w-4 h-4" />
                      Métriques Personnalisées
                    </h4>
                    <div className="space-y-2">
                      {customMetrics.map((metric) => (
                        <Card key={metric.id} className={cn("p-3", statusColors[metric.status])}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium">{metric.name}</span>
                            {statusIcons[metric.status]}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-bold">
                              {formatValue(metric.value, metric.unit)}
                            </span>
                            {metric.trend && trendIcons[metric.trend]}
                          </div>
                          {metric.description && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {metric.description}
                            </p>
                          )}
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Footer */}
            <div className="p-4 border-t">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Actualisation: {refreshRate / 1000}s</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setLastUpdate(new Date())}
                  className="h-6 px-2"
                >
                  <Timer className="w-3 h-3 mr-1" />
                  Actualiser
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default MetricsPanel;