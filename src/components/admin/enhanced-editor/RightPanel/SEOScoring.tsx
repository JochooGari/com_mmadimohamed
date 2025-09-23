import { useState, useEffect } from 'react';
import { Target, TrendingUp, AlertTriangle, CheckCircle, ExternalLink, Hash, Eye, Clock, Type } from 'lucide-react';

interface SEOAnalysis {
  score: number;
  keywordDensity: number;
  wordCount: number;
  readabilityScore: number;
  titleLength: number;
  metaLength: number;
  headingStructure: {
    h1: number;
    h2: number;
    h3: number;
  };
  internalLinks: number;
  externalLinks: number;
  imageOptimization: number;
  issues: {
    type: 'error' | 'warning' | 'success';
    message: string;
    fix?: string;
  }[];
  recommendations: string[];
}

interface SEOScoringProps {
  content: {
    title: string;
    slug: string;
    excerpt: string;
    content_md: string;
    keywords: string[];
  };
  onScoreUpdate: (score: number) => void;
}

export default function SEOScoring({ content, onScoreUpdate }: SEOScoringProps) {
  const [analysis, setAnalysis] = useState<SEOAnalysis>({
    score: 0,
    keywordDensity: 0,
    wordCount: 0,
    readabilityScore: 0,
    titleLength: 0,
    metaLength: 0,
    headingStructure: { h1: 0, h2: 0, h3: 0 },
    internalLinks: 0,
    externalLinks: 0,
    imageOptimization: 0,
    issues: [],
    recommendations: []
  });

  const [selectedKeyword, setSelectedKeyword] = useState<string>('');
  const [competitorAnalysis, setCompetitorAnalysis] = useState<{
    topCompetitors: { title: string; url: string; score: number }[];
    gapAnalysis: string[];
  }>({
    topCompetitors: [],
    gapAnalysis: []
  });

  // Analyse SEO automatique
  useEffect(() => {
    const analyzeContent = () => {
      const text = content.content_md;
      const title = content.title;
      const meta = content.excerpt;
      const primaryKeyword = content.keywords[0] || '';

      // Calculs de base
      const words = text.split(/\s+/).filter(word => word.length > 0);
      const wordCount = words.length;
      const titleLength = title.length;
      const metaLength = meta.length;

      // Structure des titres
      const h1Count = (text.match(/^# /gm) || []).length;
      const h2Count = (text.match(/^## /gm) || []).length;
      const h3Count = (text.match(/^### /gm) || []).length;

      // Densité de mots-clés
      let keywordDensity = 0;
      if (primaryKeyword) {
        const keywordMatches = text.toLowerCase().split(primaryKeyword.toLowerCase()).length - 1;
        keywordDensity = (keywordMatches / wordCount) * 100;
      }

      // Liens
      const internalLinks = (text.match(/\[.*?\]\((?!http)/g) || []).length;
      const externalLinks = (text.match(/\[.*?\]\(http/g) || []).length;

      // Score de lisibilité (Flesch simplifié)
      const sentences = text.split(/[.!?]+/).length;
      const syllables = words.reduce((acc, word) => acc + countSyllables(word), 0);
      const readabilityScore = Math.max(0, 206.835 - (1.015 * (wordCount / sentences)) - (84.6 * (syllables / wordCount)));

      // Détection des problèmes
      const issues: SEOAnalysis['issues'] = [];

      if (!primaryKeyword) {
        issues.push({
          type: 'error',
          message: 'Aucun mot-clé principal défini',
          fix: 'Ajoutez un mot-clé principal dans les paramètres'
        });
      }

      if (titleLength === 0) {
        issues.push({
          type: 'error',
          message: 'Titre manquant',
          fix: 'Ajoutez un titre accrocheur de 50-60 caractères'
        });
      } else if (titleLength < 30) {
        issues.push({
          type: 'warning',
          message: 'Titre trop court',
          fix: 'Étendez le titre à 50-60 caractères pour un meilleur SEO'
        });
      } else if (titleLength > 60) {
        issues.push({
          type: 'warning',
          message: 'Titre trop long',
          fix: 'Raccourcissez le titre à maximum 60 caractères'
        });
      }

      if (metaLength === 0) {
        issues.push({
          type: 'error',
          message: 'Meta description manquante',
          fix: 'Ajoutez une description de 150-160 caractères'
        });
      } else if (metaLength < 120) {
        issues.push({
          type: 'warning',
          message: 'Meta description trop courte'
        });
      } else if (metaLength > 160) {
        issues.push({
          type: 'warning',
          message: 'Meta description trop longue'
        });
      }

      if (h1Count === 0) {
        issues.push({ type: 'warning', message: 'Aucun titre H1 détecté' });
      } else if (h1Count > 1) {
        issues.push({ type: 'warning', message: 'Plusieurs titres H1 détectés' });
      }

      if (h2Count < 2 && wordCount > 300) {
        issues.push({ type: 'warning', message: 'Structure manque de sous-titres H2' });
      }

      if (wordCount < 300) {
        issues.push({ type: 'warning', message: 'Contenu trop court (minimum 300 mots)' });
      }

      if (keywordDensity < 0.5) {
        issues.push({ type: 'warning', message: 'Densité de mots-clés trop faible' });
      } else if (keywordDensity > 3) {
        issues.push({ type: 'warning', message: 'Densité de mots-clés trop élevée (sur-optimisation)' });
      }

      // Calcul du score global
      let score = 0;
      if (titleLength >= 30 && titleLength <= 60 && title.toLowerCase().includes(primaryKeyword.toLowerCase())) score += 20;
      else if (titleLength >= 30 && titleLength <= 60) score += 15;
      else if (titleLength > 0) score += 10;
      if (metaLength >= 120 && metaLength <= 160) score += 15; else if (metaLength > 0) score += 10;
      if (wordCount >= 500) score += 20; else if (wordCount >= 300) score += 15; else if (wordCount >= 100) score += 10;
      if (h1Count === 1 && h2Count >= 2) score += 15; else if (h1Count === 1) score += 10; else if (h2Count > 0) score += 8;
      if (keywordDensity >= 1 && keywordDensity <= 2.5) score += 15; else if (keywordDensity >= 0.5 && keywordDensity <= 3) score += 10;
      if (readabilityScore >= 60) score += 10; else if (readabilityScore >= 40) score += 7;

      const recommendations: string[] = [];
      if (score < 60) {
        recommendations.push("Améliorez d'abord le titre et la meta description");
        recommendations.push('Augmentez la longueur du contenu (500+ mots)');
      }
      if (h2Count < 3) recommendations.push('Ajoutez plus de sous-titres H2 pour structurer');
      if (internalLinks < 2) recommendations.push('Ajoutez 2-3 liens internes vers du contenu connexe');

      const newAnalysis: SEOAnalysis = {
        score, keywordDensity, wordCount, readabilityScore, titleLength, metaLength,
        headingStructure: { h1: h1Count, h2: h2Count, h3: h3Count }, internalLinks, externalLinks,
        imageOptimization: 0, issues, recommendations
      };
      setAnalysis(newAnalysis);
      onScoreUpdate(score);
    };
    analyzeContent();
  }, [content, onScoreUpdate]);

  const countSyllables = (word: string): number => Math.max(1, word.toLowerCase().replace(/[^aeiou]/g, '').length);
  const getScoreColor = (score: number) => (score >= 80 ? 'text-green-600 bg-green-100' : score >= 60 ? 'text-orange-600 bg-orange-100' : 'text-red-600 bg-red-100');
  const getScoreIcon = (score: number) => (score >= 80 ? CheckCircle : AlertTriangle);
  const ScoreIcon = getScoreIcon(analysis.score);

  return (
    <div className="p-4 space-y-6">
      {/* Score Principal */}
      <div className="text-center">
        <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full text-2xl font-bold ${getScoreColor(analysis.score)}`}>{Math.round(analysis.score)}</div>
        <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">Score SEO Global</div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-3">
          <div className={`${analysis.score >= 80 ? 'bg-green-500' : analysis.score >= 60 ? 'bg-orange-500' : 'bg-red-500'} h-2 rounded-full transition-all duration-500`} style={{ width: `${analysis.score}%` }} />
        </div>
      </div>

      {/* Métriques Clés */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1"><Hash className="w-4 h-4 text-blue-500" /><span className="text-xs text-gray-600 dark:text-gray-400">Mots-clés</span></div>
          <div className="font-semibold text-gray-900 dark:text-white">{analysis.keywordDensity.toFixed(1)}%</div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1"><Type className="w-4 h-4 text-green-500" /><span className="text-xs text-gray-600 dark:text-gray-400">Mots</span></div>
          <div className="font-semibold text-gray-900 dark:text-white">{analysis.wordCount}</div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1"><Eye className="w-4 h-4 text-purple-500" /><span className="text-xs text-gray-600 dark:text-gray-400">Lisibilité</span></div>
          <div className="font-semibold text-gray-900 dark:text-white">{Math.round(analysis.readabilityScore)}</div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1"><Clock className="w-4 h-4 text-orange-500" /><span className="text-xs text-gray-600 dark:text-gray-400">Lecture</span></div>
          <div className="font-semibold text-gray-900 dark:text-white">{Math.ceil(analysis.wordCount / 200)} min</div>
        </div>
      </div>

      {/* Structure des Titres */}
      <div>
        <h4 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2"><Hash className="w-4 h-4" />Structure des titres</h4>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm"><span className="text-gray-600 dark:text-gray-400">H1 (Titre principal)</span><span className={`${analysis.headingStructure.h1 === 1 ? 'text-green-600' : 'text-red-600'} font-medium`}>{analysis.headingStructure.h1}</span></div>
          <div className="flex items-center justify-between text-sm"><span className="text-gray-600 dark:text-gray-400">H2 (Sections)</span><span className={`${analysis.headingStructure.h2 >= 2 ? 'text-green-600' : 'text-orange-600'} font-medium`}>{analysis.headingStructure.h2}</span></div>
          <div className="flex items-center justify-between text-sm"><span className="text-gray-600 dark:text-gray-400">H3 (Sous-sections)</span><span className="font-medium text-gray-900 dark:text-white">{analysis.headingStructure.h3}</span></div>
        </div>
      </div>

      {/* Problèmes Détectés */}
      {analysis.issues.length > 0 && (
        <div>
          <h4 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-orange-500" />Problèmes détectés ({analysis.issues.length})</h4>
          <div className="space-y-2">
            {analysis.issues.slice(0, 5).map((issue, index) => (
              <div key={index} className={`${issue.type === 'error' ? 'bg-red-50 border-red-400 text-red-800 dark:bg-red-900/20 dark:text-red-200' : issue.type === 'warning' ? 'bg-orange-50 border-orange-400 text-orange-800 dark:bg-orange-900/20 dark:text-orange-200' : 'bg-green-50 border-green-400 text-green-800 dark:bg-green-900/20 dark:text-green-200'} p-3 rounded-lg border-l-4 text-sm`}>
                <div className="font-medium mb-1">{issue.message}</div>
                {issue.fix && <div className="text-xs opacity-75">{issue.fix}</div>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommandations */}
      {analysis.recommendations.length > 0 && (
        <div>
          <h4 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-blue-500" />Recommandations</h4>
          <div className="space-y-2">
            {analysis.recommendations.map((rec, index) => (
              <div key={index} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300"><div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" /><span>{rec}</span></div>
            ))}
          </div>
        </div>
      )}

      {/* Actions Rapides */}
      <div className="pt-4 border-t border-gray-200 dark:border-gray-600">
        <div className="grid grid-cols-1 gap-2">
          <button className="w-full text-left px-3 py-2 text-sm bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-300 rounded-md transition-colors">🎯 Optimiser le titre automatiquement</button>
          <button className="w-full text-left px-3 py-2 text-sm bg-green-50 text-green-700 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-300 rounded-md transition-colors">✨ Générer une meta description</button>
          <button className="w-full text-left px-3 py-2 text-sm bg-purple-50 text-purple-700 hover:bg-purple-100 dark:bg-purple-900/20 dark:text-purple-300 rounded-md transition-colors">📊 Analyser la concurrence</button>
        </div>
      </div>
    </div>
  );
}