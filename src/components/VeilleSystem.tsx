import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { 
  Search, 
  Globe, 
  TrendingUp, 
  Eye, 
  Plus,
  Filter,
  Calendar,
  BarChart3,
  ExternalLink,
  Bot,
  RefreshCw,
  AlertCircle,
  Target,
  MessageSquare,
  Heart,
  Repeat,
  CheckCircle
} from 'lucide-react';

// Types pour la veille
interface VeilleInsight {
  id: string;
  source_url: string;
  auteur: string;
  date: string;
  format: 'texte' | 'carousel' | 'document' | 'video';
  hook: string;
  structure: string;
  persona: string[];
  probleme: string;
  resultat: string;
  preuve: string;
  cta: string;
  metrics: {
    reactions: number;
    comments: number;
    reshares: number;
  };
  scores: {
    engagement: number;
    business_intent: number;
    novelty: number;
    priority: number;
  };
  extraits: string[];
  mots_cles: string[];
  licence_ok: boolean;
  notes: string;
}

interface VeilleQuery {
  id: string;
  nom: string;
  query: string;
  domaines: string[];
  persona_cible: string[];
  cadence: 'quotidienne' | 'hebdomadaire';
  actif: boolean;
  derniere_execution: string;
  resultats_count: number;
}

const DOMAINES_AUTORISES = [
  'linkedin.com/pulse',
  'buffer.com',
  'hootsuite.com',
  'later.com/blog', 
  'semrush.com/blog',
  'ahrefs.com/blog',
  'hbr.org',
  'mckinsey.com',
  'lesechos.fr',
  'journaldunet.com'
];

const QUERIES_PRESET: VeilleQuery[] = [
  {
    id: 'linkedin_algorithm',
    nom: 'LinkedIn Algorithm Updates',
    query: '"LinkedIn algorithm update" OR "LinkedIn reach" site:buffer.com OR site:hootsuite.com',
    domaines: ['buffer.com', 'hootsuite.com', 'later.com'],
    persona_cible: ['Marketing', 'Growth'],
    cadence: 'quotidienne',
    actif: true,
    derniere_execution: new Date().toISOString(),
    resultats_count: 0
  },
  {
    id: 'b2b_lead_generation',
    nom: 'LinkedIn B2B Lead Generation',
    query: '("case study" OR "how we closed" OR "pipeline from LinkedIn") AND B2B',
    domaines: ['semrush.com', 'ahrefs.com', 'hbr.org'],
    persona_cible: ['Sales', 'B2B', 'SaaS'],
    cadence: 'hebdomadaire',
    actif: true,
    derniere_execution: new Date().toISOString(),
    resultats_count: 0
  },
  {
    id: 'daf_esn_france',
    nom: 'DAF/ESN France Tendances',
    query: 'DAF "rolling forecast" "close" "cash" étude 2024..2025 France',
    domaines: ['lesechos.fr', 'journaldunet.com'],
    persona_cible: ['DAF', 'ESN', 'Finance'],
    cadence: 'hebdomadaire',
    actif: true,
    derniere_execution: new Date().toISOString(),
    resultats_count: 0
  }
];

// Données de simulation pour les insights
const SAMPLE_INSIGHTS: VeilleInsight[] = [
  {
    id: 'vw_2025_02_12_0931',
    source_url: 'https://buffer.com/resources/linkedin-algorithm-2025/',
    auteur: 'Sarah Chen',
    date: '2025-02-12',
    format: 'texte',
    hook: 'The LinkedIn algorithm now prioritizes comments over reactions 3:1',
    structure: 'WhatHowWhy',
    persona: ['Marketing', 'Content Creator'],
    probleme: 'Posts getting low engagement despite high reach',
    resultat: 'Comments-driven strategy increased engagement 340%',
    preuve: '340% increase in engagement rate, 120% more profile views',
    cta: 'Download the LinkedIn Engagement Playbook →',
    metrics: {
      reactions: 420,
      comments: 116,
      reshares: 18
    },
    scores: {
      engagement: 0.78,
      business_intent: 0.85,
      novelty: 0.92,
      priority: 0.85
    },
    extraits: [
      "Comments generate 3x more visibility than reactions",
      "Questions in posts increase comment rate by 67%",
      "CTA with resource offer converts 23% to DMs"
    ],
    mots_cles: ['LinkedIn algorithm', 'engagement', 'comments', 'reach'],
    licence_ok: true,
    notes: 'Excellent insight on comment priority - applicable to all B2B posts'
  },
  {
    id: 'vw_2025_02_11_1456',
    source_url: 'https://semrush.com/blog/b2b-linkedin-leads-2025/',
    auteur: 'Marcus Rodriguez',
    date: '2025-02-11',
    format: 'carousel',
    hook: 'How we generated 847 B2B leads in 90 days using LinkedIn only',
    structure: 'CasClient',
    persona: ['B2B', 'Sales', 'SaaS'],
    probleme: 'B2B lead generation cost increasing, quality decreasing',
    resultat: '847 qualified leads, $2.3M pipeline in 90 days',
    preuve: '$2.3M pipeline, 34% meeting show rate, $4.2K average deal',
    cta: 'Book 15-min strategy call → link in bio',
    metrics: {
      reactions: 1250,
      comments: 234,
      reshares: 89
    },
    scores: {
      engagement: 0.89,
      business_intent: 0.95,
      novelty: 0.67,
      priority: 0.89
    },
    extraits: [
      "Comment 'STRATEGY' for our 90-day LinkedIn B2B playbook",
      "Personal stories convert 4x better than case studies",
      "DM strategy: qualify budget/timeline in first message"
    ],
    mots_cles: ['B2B leads', 'LinkedIn strategy', 'pipeline', 'case study'],
    licence_ok: true,
    notes: 'Excellent CTA strategy + proven results. Applicable for ESN/consulting'
  }
];

export default function VeilleSystem({ className = '' }: { className?: string }) {
  const [insights, setInsights] = useState<VeilleInsight[]>(() => {
    try {
      const saved = localStorage.getItem('linkedin:veille-insights');
      return saved ? JSON.parse(saved) : SAMPLE_INSIGHTS;
    } catch {
      return SAMPLE_INSIGHTS;
    }
  });

  const [queries, setQueries] = useState<VeilleQuery[]>(() => {
    try {
      const saved = localStorage.getItem('linkedin:veille-queries');
      return saved ? JSON.parse(saved) : QUERIES_PRESET;
    } catch {
      return QUERIES_PRESET;
    }
  });

  const [activeTab, setActiveTab] = useState<'insights' | 'queries' | 'stats'>('insights');
  const [searchTerm, setSearchTerm] = useState('');
  const [scoreFilter, setScoreFilter] = useState<string>('all');
  const [isRunningVeille, setIsRunningVeille] = useState(false);

  // Sauvegarder automatiquement
  useEffect(() => {
    try {
      localStorage.setItem('linkedin:veille-insights', JSON.stringify(insights));
    } catch (error) {
      console.error('Erreur sauvegarde insights:', error);
    }
  }, [insights]);

  useEffect(() => {
    try {
      localStorage.setItem('linkedin:veille-queries', JSON.stringify(queries));
    } catch (error) {
      console.error('Erreur sauvegarde queries:', error);
    }
  }, [queries]);

  const filteredInsights = insights.filter(insight => {
    const matchesSearch = insight.hook.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         insight.auteur.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         insight.mots_cles.some(kw => kw.toLowerCase().includes(searchTerm.toLowerCase()));
    
    let matchesScore = true;
    if (scoreFilter === 'high_priority') matchesScore = insight.scores.priority >= 0.8;
    else if (scoreFilter === 'high_business') matchesScore = insight.scores.business_intent >= 0.8;
    else if (scoreFilter === 'high_engagement') matchesScore = insight.scores.engagement >= 0.8;
    
    return matchesSearch && matchesScore;
  });

  const runVeille = async () => {
    try {
      setIsRunningVeille(true);
      // Déclenche un cycle backend (api/monitoring)
      const response = await fetch('/api/monitoring', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'run_now' })
      });
      if (!response.ok) {
        const text = await response.text().catch(() => '');
        alert(`Erreur veille (${response.status}). ${text}`);
        return;
      }
      const result = await response.json();
      console.log('Veille run result:', result);
      alert('Veille lancée. Vérifie data/monitoring (sources, optimized).');
      // Pas d’injection d’insights mock: les résultats sont persistés dans data/monitoring
    } catch (e) {
      console.error('Erreur exécution veille:', e);
      alert('Impossible d\'appeler /api/monitoring. Lance les fonctions serveur (ex: vercel dev).');
    } finally {
      setIsRunningVeille(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600 bg-green-100';
    if (score >= 0.6) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  const generateSkillFromInsight = (insight: VeilleInsight) => {
    // Convertir un insight en skill
    const newSkill = {
      skill_id: `INSIGHT_${insight.id}`,
      type: 'framework' as const,
      principe: insight.hook,
      pourquoi: `Basé sur un post qui a généré ${insight.metrics.reactions} réactions et ${insight.metrics.comments} commentaires`,
      exemple: insight.hook,
      anti_patterns: [],
      poids: insight.scores.priority,
      derniere_maj: new Date().toISOString(),
      preuves: [insight.id],
      utilisation_count: 0,
      performance_avg: 0
    };
    
    // Sauvegarder dans Skills KB
    const existingSkills = JSON.parse(localStorage.getItem('linkedin:skills-kb') || '[]');
    localStorage.setItem('linkedin:skills-kb', JSON.stringify([...existingSkills, newSkill]));
    
    alert('Skill créée avec succès dans la Knowledge Base !');
  };

  const totalInsights = insights.length;
  const highPriorityInsights = insights.filter(i => i.scores.priority >= 0.8).length;
  const avgEngagement = insights.reduce((sum, i) => sum + i.scores.engagement, 0) / totalInsights;
  const avgBusinessIntent = insights.reduce((sum, i) => sum + i.scores.business_intent, 0) / totalInsights;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Système de Veille LinkedIn</h2>
          <p className="text-gray-600">
            {totalInsights} insights · {highPriorityInsights} haute priorité · {queries.filter(q => q.actif).length} requêtes actives
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={runVeille} 
            disabled={isRunningVeille}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isRunningVeille ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Veille en cours...
              </>
            ) : (
              <>
                <Search className="w-4 h-4 mr-2" />
                Lancer Veille
              </>
            )}
          </Button>
          <Button
            variant="outline"
            title="Planifié chaque jour à 06:00 UTC via Vercel Cron"
            onClick={() => window.open('https://vercel.com', '_blank')}
          >
            <Calendar className="w-4 h-4 mr-2" />
            Cron: 06:00 UTC
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Insights</p>
                <p className="text-2xl font-bold">{totalInsights}</p>
              </div>
              <Eye className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Haute Priorité</p>
                <p className="text-2xl font-bold text-green-600">{highPriorityInsights}</p>
              </div>
              <Target className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Engagement Moyen</p>
                <p className="text-2xl font-bold text-orange-600">{(avgEngagement * 100).toFixed(0)}%</p>
              </div>
              <Heart className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Intent Business</p>
                <p className="text-2xl font-bold text-purple-600">{(avgBusinessIntent * 100).toFixed(0)}%</p>
              </div>
              <BarChart3 className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 border-b">
        <button
          className={`px-4 py-2 font-medium text-sm ${
            activeTab === 'insights' 
              ? 'border-b-2 border-blue-500 text-blue-600' 
              : 'text-gray-600 hover:text-gray-900'
          }`}
          onClick={() => setActiveTab('insights')}
        >
          📊 Insights ({totalInsights})
        </button>
        <button
          className={`px-4 py-2 font-medium text-sm ${
            activeTab === 'queries' 
              ? 'border-b-2 border-blue-500 text-blue-600' 
              : 'text-gray-600 hover:text-gray-900'
          }`}
          onClick={() => setActiveTab('queries')}
        >
          🔍 Requêtes ({queries.length})
        </button>
        <button
          className={`px-4 py-2 font-medium text-sm ${
            activeTab === 'stats' 
              ? 'border-b-2 border-blue-500 text-blue-600' 
              : 'text-gray-600 hover:text-gray-900'
          }`}
          onClick={() => setActiveTab('stats')}
        >
          📈 Analytics
        </button>
      </div>

      {/* Contenu selon l'onglet */}
      {activeTab === 'insights' && (
        <div className="space-y-4">
          {/* Filtres */}
          <div className="flex gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Rechercher dans les insights..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button 
                variant={scoreFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setScoreFilter('all')}
              >
                Tous
              </Button>
              <Button 
                variant={scoreFilter === 'high_priority' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setScoreFilter('high_priority')}
              >
                Haute priorité
              </Button>
              <Button 
                variant={scoreFilter === 'high_business' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setScoreFilter('high_business')}
              >
                Business
              </Button>
            </div>
          </div>

          {/* Liste des insights */}
          <div className="grid grid-cols-1 gap-4">
            {filteredInsights.map((insight) => (
              <Card key={insight.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-base font-semibold mb-2">
                        {insight.hook}
                      </CardTitle>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className="bg-blue-100 text-blue-800">{insight.format}</Badge>
                        <Badge className="bg-purple-100 text-purple-800">{insight.structure}</Badge>
                        {insight.persona.map(p => (
                          <Badge key={p} className="bg-gray-100 text-gray-800">{p}</Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => generateSkillFromInsight(insight)}
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        → Skill
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(insight.source_url, '_blank')}
                      >
                        <ExternalLink className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-700">Problème:</p>
                      <p className="text-sm text-gray-600">{insight.probleme}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Résultat:</p>
                      <p className="text-sm text-gray-600">{insight.resultat}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-700">Preuve:</p>
                    <p className="text-sm text-gray-600 italic">{insight.preuve}</p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-700">CTA:</p>
                    <p className="text-sm text-blue-600 font-medium">{insight.cta}</p>
                  </div>

                  {/* Métriques */}
                  <div className="flex items-center gap-4 pt-2 border-t">
                    <div className="flex items-center gap-1">
                      <Heart className="w-4 h-4 text-red-500" />
                      <span className="text-sm">{insight.metrics.reactions}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageSquare className="w-4 h-4 text-blue-500" />
                      <span className="text-sm">{insight.metrics.comments}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Repeat className="w-4 h-4 text-green-500" />
                      <span className="text-sm">{insight.metrics.reshares}</span>
                    </div>
                  </div>

                  {/* Scores */}
                  <div className="grid grid-cols-4 gap-2 pt-2">
                    <div className="text-center">
                      <p className="text-xs text-gray-500">Engagement</p>
                      <p className={`text-sm font-bold px-2 py-1 rounded ${getScoreColor(insight.scores.engagement)}`}>
                        {(insight.scores.engagement * 100).toFixed(0)}%
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500">Business</p>
                      <p className={`text-sm font-bold px-2 py-1 rounded ${getScoreColor(insight.scores.business_intent)}`}>
                        {(insight.scores.business_intent * 100).toFixed(0)}%
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500">Nouveauté</p>
                      <p className={`text-sm font-bold px-2 py-1 rounded ${getScoreColor(insight.scores.novelty)}`}>
                        {(insight.scores.novelty * 100).toFixed(0)}%
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500">Priorité</p>
                      <p className={`text-sm font-bold px-2 py-1 rounded ${getScoreColor(insight.scores.priority)}`}>
                        {(insight.scores.priority * 100).toFixed(0)}%
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-xs text-gray-500 pt-2">
                    <span>{insight.auteur} · {new Date(insight.date).toLocaleDateString('fr-FR')}</span>
                    <span>Mots-clés: {insight.mots_cles.join(', ')}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'queries' && (
        <div className="space-y-4">
          <div className="flex justify-between">
            <h3 className="text-lg font-medium">Requêtes de veille configurées</h3>
            <Button className="bg-green-600 hover:bg-green-700">
              <Plus className="w-4 h-4 mr-2" />
              Nouvelle requête
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {queries.map((query) => (
              <Card key={query.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base font-semibold">{query.nom}</CardTitle>
                      <p className="text-sm text-gray-600 mt-1">{query.query}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={query.actif ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                        {query.actif ? 'Actif' : 'Inactif'}
                      </Badge>
                      <Badge className="bg-blue-100 text-blue-800">{query.cadence}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm font-medium text-gray-700">Domaines:</p>
                      <p className="text-sm text-gray-600">{query.domaines.join(', ')}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Personas cibles:</p>
                      <div className="flex gap-1">
                        {query.persona_cible.map(p => (
                          <Badge key={p} className="bg-purple-100 text-purple-800">{p}</Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex justify-between items-center text-sm text-gray-500 pt-2 border-t">
                      <span>Dernière exécution: {new Date(query.derniere_execution).toLocaleDateString('fr-FR')}</span>
                      <span>{query.resultats_count} résultats</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'stats' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Évolution des insights par semaine</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center text-gray-500">
                📈 Graphique d'évolution des insights (à implémenter avec Chart.js)
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Top Sources</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">buffer.com</span>
                    <span className="text-sm font-bold">24 insights</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">semrush.com</span>
                    <span className="text-sm font-bold">18 insights</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">hootsuite.com</span>
                    <span className="text-sm font-bold">12 insights</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tendances Mots-clés</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">LinkedIn algorithm</span>
                    <Badge className="bg-green-100 text-green-800">+34%</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">B2B leads</span>
                    <Badge className="bg-green-100 text-green-800">+28%</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">content strategy</span>
                    <Badge className="bg-orange-100 text-orange-800">+12%</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}