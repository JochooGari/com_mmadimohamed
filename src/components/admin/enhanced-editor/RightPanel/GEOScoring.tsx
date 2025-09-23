import { useState, useEffect } from 'react';
import { Sparkles, MessageSquare, List, Table, Award, HelpCircle, Zap, CheckSquare } from 'lucide-react';

interface GEOAnalysis {
  score: number;
  directAnswers: number;
  structuredData: number;
  questionFormat: number;
  listFormat: number;
  tableFormat: number;
  eatScore: number; // Expertise, Authoritativeness, Trustworthiness
  citationsCount: number;
  faqSections: number;
  featuredSnippetPotential: number;
  issues: {
    type: 'error' | 'warning' | 'success';
    message: string;
    fix?: string;
  }[];
  recommendations: string[];
  geoOptimizations: {
    type: 'definition' | 'list' | 'table' | 'faq' | 'stepbystep';
    content: string;
    confidence: number;
  }[];
}

interface GEOScoringProps {
  content: {
    title: string;
    slug: string;
    excerpt: string;
    content_md: string;
    keywords: string[];
  };
  onScoreUpdate: (score: number) => void;
}

export default function GEOScoring({ content, onScoreUpdate }: GEOScoringProps) {
  const [analysis, setAnalysis] = useState<GEOAnalysis>({
    score: 0,
    directAnswers: 0,
    structuredData: 0,
    questionFormat: 0,
    listFormat: 0,
    tableFormat: 0,
    eatScore: 0,
    citationsCount: 0,
    faqSections: 0,
    featuredSnippetPotential: 0,
    issues: [],
    recommendations: [],
    geoOptimizations: []
  });

  const [selectedOptimization, setSelectedOptimization] = useState<string>('');

  // Analyse GEO automatique
  useEffect(() => {
    const analyzeGEO = () => {
      const text = content.content_md;
      const title = content.title;

      // Analyse des formats optimisés pour l'IA générative

      // 1. Réponses directes (définitions claires)
      const definitionPatterns = [
        /^(.+) est (.+)/gm,
        /^(.+) désigne (.+)/gm,
        /^(.+) représente (.+)/gm,
        /^(.+) signifie (.+)/gm
      ];
      const directAnswers = definitionPatterns.reduce((acc, pattern) =>
        acc + (text.match(pattern) || []).length, 0);

      // 2. Format questions-réponses
      const questionPatterns = [
        /^## .+\?/gm,
        /^### .+\?/gm,
        /Qu'est-ce que/gi,
        /Comment/gi,
        /Pourquoi/gi,
        /Quand/gi,
        /Où/gi
      ];
      const questionFormat = questionPatterns.reduce((acc, pattern) =>
        acc + (text.match(pattern) || []).length, 0);

      // 3. Listes (optimales pour featured snippets)
      const listMatches = text.match(/^[-*+] .+/gm) || [];
      const numberedListMatches = text.match(/^\d+\. .+/gm) || [];
      const listFormat = listMatches.length + numberedListMatches.length;

      // 4. Tableaux
      const tableMatches = text.match(/^\|.+\|/gm) || [];
      const tableFormat = tableMatches.length;

      // 5. Citations et sources
      const citationPatterns = [
        /\[.*\]\(http.*\)/g,
        /selon/gi,
        /d'après/gi,
        /source:/gi,
        /étude/gi
      ];
      const citationsCount = citationPatterns.reduce((acc, pattern) =>
        acc + (text.match(pattern) || []).length, 0);

      // 6. Sections FAQ
      const faqPatterns = [
        /^## FAQ/gmi,
        /^### FAQ/gmi,
        /^## Questions fréquentes/gmi,
        /^## Questions courantes/gmi
      ];
      const faqSections = faqPatterns.reduce((acc, pattern) =>
        acc + (text.match(pattern) || []).length, 0);

      // 7. Données structurées (simulé)
      const structuredDataElements = [
        tableFormat > 0 ? 1 : 0,
        listFormat > 5 ? 1 : 0,
        faqSections > 0 ? 1 : 0,
        directAnswers > 0 ? 1 : 0
      ].reduce((a, b) => a + b, 0);

      // 8. Score E-A-T (Expertise, Authoritativeness, Trustworthiness)
      const expertiseIndicators = [
        /expert/gi,
        /spécialisé/gi,
        /professionnel/gi,
        /certifié/gi,
        /expérience/gi,
        /années/gi
      ];
      const trustIndicators = [
        /source/gi,
        /référence/gi,
        /étude/gi,
        /recherche/gi,
        /données/gi,
        /statistiques/gi
      ];

      const expertiseScore = expertiseIndicators.reduce((acc, pattern) =>
        acc + Math.min((text.match(pattern) || []).length, 3), 0);
      const trustScore = trustIndicators.reduce((acc, pattern) =>
        acc + Math.min((text.match(pattern) || []).length, 3), 0);
      const eatScore = Math.min(expertiseScore + trustScore, 20);

      // Potentiel Featured Snippet
      let featuredSnippetPotential = 0;
      if (directAnswers > 0) featuredSnippetPotential += 25;
      if (listFormat >= 3 && listFormat <= 8) featuredSnippetPotential += 25;
      if (tableFormat > 0) featuredSnippetPotential += 20;
      if (questionFormat > 0) featuredSnippetPotential += 15;
      if (text.split(/\s+/).length >= 40 && text.split(/\s+/).length <= 60) featuredSnippetPotential += 15;

      // Détection des problèmes
      const issues: GEOAnalysis['issues'] = [];

      if (directAnswers === 0) {
        issues.push({
          type: 'warning',
          message: 'Aucune définition directe détectée',
          fix: 'Commencez par une définition claire en 1-2 phrases'
        });
      }

      if (questionFormat === 0) {
        issues.push({
          type: 'warning',
          message: 'Pas de format question-réponse',
          fix: 'Utilisez des sous-titres sous forme de questions'
        });
      }

      if (listFormat < 3) {
        issues.push({
          type: 'warning',
          message: 'Manque de listes structurées',
          fix: 'Ajoutez des listes à puces ou numérotées'
        });
      }

      if (citationsCount < 2) {
        issues.push({
          type: 'warning',
          message: 'Peu de sources citées',
          fix: 'Ajoutez des références et sources fiables'
        });
      }

      if (faqSections === 0) {
        issues.push({
          type: 'warning',
          message: 'Aucune section FAQ',
          fix: 'Créez une section FAQ avec questions populaires'
        });
      }

      // Calcul du score GEO global
      let score = 0;

      // Réponses directes (20 points)
      score += Math.min(directAnswers * 10, 20);

      // Format questions (15 points)
      score += Math.min(questionFormat * 3, 15);

      // Listes structurées (15 points)
      if (listFormat >= 3 && listFormat <= 8) {
        score += 15;
      } else if (listFormat > 0) {
        score += 10;
      }

      // Tableaux (10 points)
      if (tableFormat > 0) score += 10;

      // Citations et sources (15 points)
      score += Math.min(citationsCount * 3, 15);

      // FAQ (10 points)
      if (faqSections > 0) score += 10;

      // E-A-T (15 points)
      score += Math.min(eatScore, 15);

      // Recommandations
      const recommendations: string[] = [];

      if (score < 50) {
        recommendations.push('Commencez par une définition claire et directe');
        recommendations.push('Structurez le contenu avec des listes et tableaux');
      }

      if (directAnswers === 0) {
        recommendations.push('Rédigez une introduction avec définition concise');
      }

      if (listFormat < 5) {
        recommendations.push('Ajoutez plus de listes (étapes, avantages, conseils)');
      }

      if (questionFormat < 3) {
        recommendations.push('Transformez vos titres en questions directes');
      }

      if (citationsCount < 3) {
        recommendations.push('Citez des sources d\'autorité et études récentes');
      }

      // Optimisations suggérées
      const geoOptimizations: GEOAnalysis['geoOptimizations'] = [];

      if (directAnswers === 0) {
        geoOptimizations.push({
          type: 'definition',
          content: `## Qu'est-ce que ${content.keywords[0] || '[SUJET]'} ?

[SUJET] est [définition claire et concise en 1-2 phrases maximum].

Cette approche permet de [bénéfice principal] et représente [contexte/importance].`,
          confidence: 90
        });
      }

      if (listFormat < 3) {
        geoOptimizations.push({
          type: 'list',
          content: `## Les principales caractéristiques de ${content.keywords[0] || '[SUJET]'}

1. **[Caractéristique 1]** - [Description courte]
2. **[Caractéristique 2]** - [Description courte]
3. **[Caractéristique 3]** - [Description courte]
4. **[Caractéristique 4]** - [Description courte]
5. **[Caractéristique 5]** - [Description courte]`,
          confidence: 85
        });
      }

      if (faqSections === 0) {
        geoOptimizations.push({
          type: 'faq',
          content: `## FAQ - Questions fréquentes

### Qu'est-ce que ${content.keywords[0] || '[SUJET]'} exactement ?
[Réponse directe et concise]

### Comment fonctionne ${content.keywords[0] || '[SUJET]'} ?
[Explication étape par étape]

### Quels sont les avantages de ${content.keywords[0] || '[SUJET]'} ?
[Liste des bénéfices principaux]

### Combien coûte ${content.keywords[0] || '[SUJET]'} ?
[Information sur les coûts ou facteurs de prix]`,
          confidence: 80
        });
      }

      if (tableFormat === 0) {
        geoOptimizations.push({
          type: 'table',
          content: `## Comparaison des solutions

| Critère | Solution A | Solution B | Solution C |
|---------|------------|------------|------------|
| **Prix** | [Prix A] | [Prix B] | [Prix C] |
| **Facilité** | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐ |
| **Fonctionnalités** | [Détail A] | [Détail B] | [Détail C] |
| **Support** | [Support A] | [Support B] | [Support C] |`,
          confidence: 75
        });
      }

      const newAnalysis: GEOAnalysis = {
        score,
        directAnswers,
        structuredData: structuredDataElements,
        questionFormat,
        listFormat,
        tableFormat,
        eatScore,
        citationsCount,
        faqSections,
        featuredSnippetPotential,
        issues,
        recommendations,
        geoOptimizations
      };

      setAnalysis(newAnalysis);
      onScoreUpdate(score);
    };

    analyzeGEO();
  }, [content, onScoreUpdate]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  const getOptimizationIcon = (type: string) => {
    switch (type) {
      case 'definition': return MessageSquare;
      case 'list': return List;
      case 'table': return Table;
      case 'faq': return HelpCircle;
      case 'stepbystep': return CheckSquare;
      default: return Zap;
    }
  };

  return (
    <div className="p-4 space-y-6">
      {/* Score Principal */}
      <div className="text-center">
        <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full text-2xl font-bold ${getScoreColor(analysis.score)}`}>
          {Math.round(analysis.score)}
        </div>
        <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">Score GEO</div>
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Generative Engine Optimization</div>

        {/* Barre de progression */}
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-3">
          <div
            className={`h-2 rounded-full transition-all duration-500 ${
              analysis.score >= 80 ? 'bg-green-500' :
              analysis.score >= 60 ? 'bg-orange-500' : 'bg-red-500'
            }`}
            style={{ width: `${analysis.score}%` }}
          />
        </div>
      </div>

      {/* Métriques Clés */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <MessageSquare className="w-4 h-4 text-blue-500" />
            <span className="text-xs text-gray-600 dark:text-gray-400">Réponses directes</span>
          </div>
          <div className="font-semibold text-gray-900 dark:text-white">
            {analysis.directAnswers}
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <List className="w-4 h-4 text-green-500" />
            <span className="text-xs text-gray-600 dark:text-gray-400">Listes</span>
          </div>
          <div className="font-semibold text-gray-900 dark:text-white">
            {analysis.listFormat}
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <Table className="w-4 h-4 text-purple-500" />
            <span className="text-xs text-gray-600 dark:text-gray-400">Tableaux</span>
          </div>
          <div className="font-semibold text-gray-900 dark:text-white">
            {analysis.tableFormat}
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <Award className="w-4 h-4 text-orange-500" />
            <span className="text-xs text-gray-600 dark:text-gray-400">E-A-T</span>
          </div>
          <div className="font-semibold text-gray-900 dark:text-white">
            {analysis.eatScore}/20
          </div>
        </div>
      </div>

      {/* Potentiel Featured Snippet */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 dark:text-white mb-2 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-500" />
          Featured Snippet Potentiel
        </h4>
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {analysis.featuredSnippetPotential}%
          </div>
          <div className={`px-2 py-1 rounded-full text-xs font-medium ${
            analysis.featuredSnippetPotential >= 80 ? 'bg-green-100 text-green-800' :
            analysis.featuredSnippetPotential >= 60 ? 'bg-orange-100 text-orange-800' :
            'bg-red-100 text-red-800'
          }`}>
            {analysis.featuredSnippetPotential >= 80 ? 'Excellent' :
             analysis.featuredSnippetPotential >= 60 ? 'Bon' : 'À améliorer'}
          </div>
        </div>
      </div>

      {/* Optimisations Suggérées */}
      {analysis.geoOptimizations.length > 0 && (
        <div>
          <h4 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <Zap className="w-4 h-4 text-yellow-500" />
            Optimisations automatiques ({analysis.geoOptimizations.length})
          </h4>
          <div className="space-y-2">
            {analysis.geoOptimizations.slice(0, 3).map((opt, index) => {
              const Icon = getOptimizationIcon(opt.type);
              return (
                <div
                  key={index}
                  className="border border-gray-200 dark:border-gray-600 rounded-lg p-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                  onClick={() => setSelectedOptimization(selectedOptimization === opt.content ? '' : opt.content)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4 text-blue-500" />
                      <span className="font-medium text-sm text-gray-900 dark:text-white">
                        {opt.type === 'definition' ? 'Définition directe' :
                         opt.type === 'list' ? 'Liste structurée' :
                         opt.type === 'table' ? 'Tableau comparatif' :
                         opt.type === 'faq' ? 'Section FAQ' : 'Guide étape par étape'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-green-600 dark:text-green-400">
                        {opt.confidence}% confiance
                      </span>
                      <button className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
                        Appliquer
                      </button>
                    </div>
                  </div>

                  {selectedOptimization === opt.content && (
                    <div className="mt-3 p-3 bg-gray-100 dark:bg-gray-600 rounded text-sm">
                      <pre className="whitespace-pre-wrap font-mono text-xs text-gray-800 dark:text-gray-200">
                        {opt.content}
                      </pre>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Problèmes Détectés */}
      {analysis.issues.length > 0 && (
        <div>
          <h4 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-orange-500" />
            Points d'amélioration ({analysis.issues.length})
          </h4>
          <div className="space-y-2">
            {analysis.issues.slice(0, 3).map((issue, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg border-l-4 text-sm ${
                  issue.type === 'error'
                    ? 'bg-red-50 border-red-400 text-red-800 dark:bg-red-900/20 dark:text-red-200'
                    : issue.type === 'warning'
                    ? 'bg-orange-50 border-orange-400 text-orange-800 dark:bg-orange-900/20 dark:text-orange-200'
                    : 'bg-green-50 border-green-400 text-green-800 dark:bg-green-900/20 dark:text-green-200'
                }`}
              >
                <div className="font-medium mb-1">{issue.message}</div>
                {issue.fix && (
                  <div className="text-xs opacity-75">{issue.fix}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions Rapides GEO */}
      <div className="pt-4 border-t border-gray-200 dark:border-gray-600">
        <div className="grid grid-cols-1 gap-2">
          <button className="w-full text-left px-3 py-2 text-sm bg-purple-50 text-purple-700 hover:bg-purple-100 dark:bg-purple-900/20 dark:text-purple-300 rounded-md transition-colors">
            ✨ Générer une définition optimisée
          </button>
          <button className="w-full text-left px-3 py-2 text-sm bg-green-50 text-green-700 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-300 rounded-md transition-colors">
            📝 Créer une section FAQ
          </button>
          <button className="w-full text-left px-3 py-2 text-sm bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-300 rounded-md transition-colors">
            📊 Ajouter des données structurées
          </button>
        </div>
      </div>
    </div>
  );
}