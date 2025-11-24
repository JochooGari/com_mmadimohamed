/**
 * Panneau de scoring SEO/GEO (Section 5.2-5.3 du PRD)
 * Affiche les résultats de scoring en temps réel
 */

import { useEffect } from 'react';
import { Editor } from '@tiptap/react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import {
  AlertCircle,
  CheckCircle,
  Clock,
  Loader2,
  TrendingUp,
  Zap,
  Target
} from 'lucide-react';
import { useScoringStore, type ArticleConfig } from '../../stores/scoring-store';

interface ScorePanelProps {
  editor: Editor | null;
  articleConfig: ArticleConfig;
  articleId?: string;
}

export function ScorePanel({ editor, articleConfig, articleId }: ScorePanelProps) {
  const {
    status,
    lastResult,
    lastAnalyzedAt,
    error,
    runAlgorithmicScoring,
    runQuickReview,
    runFullReview
  } = useScoringStore();

  // Récupération du contenu
  const getContent = () => {
    if (!editor) return '';
    return editor.getHTML();
  };

  // Handlers
  const handleAlgorithmicScore = () => {
    if (!editor) return;
    runAlgorithmicScoring(editor, articleConfig);
  };

  const handleQuickReview = () => {
    const content = getContent();
    if (!content || !articleId) return;
    runQuickReview(articleId, content, articleConfig, {
      industry: 'Finance & BI',
      market: 'france',
      userMode: 'standard'
    });
  };

  const handleFullReview = () => {
    const content = getContent();
    if (!content || !articleId) return;
    runFullReview(articleId, content, articleConfig, {
      industry: 'Finance & BI',
      market: 'france',
      userMode: 'standard'
    });
  };

  // Couleurs de badge selon statut
  const getScoreColor = (score: number): string => {
    if (score >= 85) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 70) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    if (score >= 50) return 'text-orange-600 bg-orange-50 border-orange-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getSeverityColor = (severity: 'ok' | 'warning' | 'critical'): string => {
    if (severity === 'ok') return 'text-green-600 bg-green-50';
    if (severity === 'warning') return 'text-orange-600 bg-orange-50';
    return 'text-red-600 bg-red-50';
  };

  return (
    <div className="h-full flex flex-col p-4 space-y-4">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Score SEO/GEO</h3>
        <p className="text-sm text-gray-600">
          {lastResult?.isPartial
            ? 'Score partiel - Lancez une analyse IA complète'
            : 'Analysez votre article selon 21 critères'}
        </p>
      </div>

      {/* Actions */}
      <div className="space-y-2">
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start"
          onClick={handleAlgorithmicScore}
          disabled={status === 'running_algo' || !editor}
        >
          {status === 'running_algo' ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Zap className="h-4 w-4 mr-2" />
          )}
          Analyser (gratuit)
        </Button>

        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start"
          onClick={handleQuickReview}
          disabled={status === 'running_quick' || !editor || !articleId}
        >
          {status === 'running_quick' ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Clock className="h-4 w-4 mr-2" />
          )}
          Analyse rapide (3-5s)
        </Button>

        <Button
          variant="default"
          size="sm"
          className="w-full justify-start"
          onClick={handleFullReview}
          disabled={status === 'running_full' || !editor || !articleId}
        >
          {status === 'running_full' ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Target className="h-4 w-4 mr-2" />
          )}
          Review complète (10-15s)
        </Button>
      </div>

      {/* Status d'erreur */}
      {error && (
        <Card className="p-3 bg-red-50 border-red-200">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-900">Erreur</p>
              <p className="text-xs text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Résultats */}
      {lastResult && (
        <>
          {/* Score global */}
          <Card className={`p-4 border-2 ${getScoreColor(lastResult.scores.global)}`}>
            <div className="text-center">
              <div className="text-3xl font-bold mb-1">
                {lastResult.scores.global}/100
              </div>
              <Badge variant="outline" className="mb-2">
                {lastResult.statusBadge}
              </Badge>
              {lastResult.isPartial && (
                <div className="flex items-center justify-center gap-1 text-xs text-gray-600">
                  <Clock className="h-3 w-3" />
                  Score partiel
                </div>
              )}
            </div>
          </Card>

          {/* Scores détaillés */}
          <Card className="p-4">
            <h4 className="text-sm font-semibold mb-3">Détails</h4>
            <div className="space-y-3">
              {/* SEO */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium">SEO</span>
                  <span className="text-xs font-bold">{lastResult.scores.seo}/76</span>
                </div>
                <Progress value={(lastResult.scores.seo / 76) * 100} className="h-2" />
              </div>

              {/* GEO */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium">GEO</span>
                  <span className="text-xs font-bold">{lastResult.scores.geo}/19</span>
                </div>
                <Progress value={(lastResult.scores.geo / 19) * 100} className="h-2" />
              </div>

              {/* Fraîcheur */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium">Fraîcheur</span>
                  <span className="text-xs font-bold">{lastResult.scores.freshness}/5</span>
                </div>
                <Progress value={(lastResult.scores.freshness / 5) * 100} className="h-2" />
              </div>
            </div>
          </Card>

          {/* Compteurs de critères */}
          <Card className="p-4">
            <h4 className="text-sm font-semibold mb-3">Critères (21)</h4>
            <div className="grid grid-cols-3 gap-2">
              <div className="text-center p-2 rounded bg-green-50">
                <div className="text-lg font-bold text-green-600">
                  {lastResult.criteriaCounts.ok}
                </div>
                <div className="text-xs text-green-700">OK</div>
              </div>
              <div className="text-center p-2 rounded bg-orange-50">
                <div className="text-lg font-bold text-orange-600">
                  {lastResult.criteriaCounts.warning}
                </div>
                <div className="text-xs text-orange-700">À améliorer</div>
              </div>
              <div className="text-center p-2 rounded bg-red-50">
                <div className="text-lg font-bold text-red-600">
                  {lastResult.criteriaCounts.critical}
                </div>
                <div className="text-xs text-red-700">Critique</div>
              </div>
            </div>
          </Card>

          {/* Priorités */}
          {lastResult.priorities && lastResult.priorities.length > 0 && (
            <Card className="p-4">
              <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Priorités
              </h4>
              <div className="space-y-2">
                {lastResult.priorities.slice(0, 3).map((priority, idx) => (
                  <div
                    key={idx}
                    className={`p-2 rounded text-xs ${getSeverityColor(priority.severity)}`}
                  >
                    <div className="font-medium mb-1">{priority.criterion}</div>
                    <div className="text-xs opacity-90">{priority.action}</div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Recommandations */}
          {lastResult.recommendations && (
            <Card className="p-4">
              <h4 className="text-sm font-semibold mb-3">Recommandations</h4>
              <div className="space-y-3">
                {/* Critiques */}
                {lastResult.recommendations.critical?.length > 0 && (
                  <div>
                    <div className="flex items-center gap-1 mb-1">
                      <AlertCircle className="h-3 w-3 text-red-600" />
                      <span className="text-xs font-medium text-red-900">Critique</span>
                    </div>
                    <ul className="space-y-1">
                      {lastResult.recommendations.critical.map((item, idx) => (
                        <li key={idx} className="text-xs text-gray-700 pl-4">
                          • {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Améliorations */}
                {lastResult.recommendations.improvements?.length > 0 && (
                  <div>
                    <div className="flex items-center gap-1 mb-1">
                      <TrendingUp className="h-3 w-3 text-orange-600" />
                      <span className="text-xs font-medium text-orange-900">Améliorations</span>
                    </div>
                    <ul className="space-y-1">
                      {lastResult.recommendations.improvements.slice(0, 3).map((item, idx) => (
                        <li key={idx} className="text-xs text-gray-700 pl-4">
                          • {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Points forts */}
                {lastResult.recommendations.strengths?.length > 0 && (
                  <div>
                    <div className="flex items-center gap-1 mb-1">
                      <CheckCircle className="h-3 w-3 text-green-600" />
                      <span className="text-xs font-medium text-green-900">Points forts</span>
                    </div>
                    <ul className="space-y-1">
                      {lastResult.recommendations.strengths.slice(0, 2).map((item, idx) => (
                        <li key={idx} className="text-xs text-gray-700 pl-4">
                          • {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Métadonnées */}
          {lastAnalyzedAt && (
            <div className="text-xs text-gray-500 text-center">
              Analysé le {new Date(lastAnalyzedAt).toLocaleString('fr-FR')}
            </div>
          )}
        </>
      )}

      {/* État initial */}
      {!lastResult && status === 'idle' && (
        <Card className="p-4 text-center text-gray-500">
          <Target className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Aucune analyse disponible</p>
          <p className="text-xs mt-1">Cliquez sur "Analyser" pour commencer</p>
        </Card>
      )}
    </div>
  );
}
