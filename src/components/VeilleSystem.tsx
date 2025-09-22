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
// Tag input léger pour gérer des listes d'URLs modernes
function TagInput({ label, values, onChange, placeholder }: { label: string; values: string[]; onChange: (vals: string[]) => void; placeholder?: string }) {
  const [draft, setDraft] = React.useState('');
  const add = (raw: string) => {
    const parts = raw.split(/[\n,;\s]+/).map(s => s.trim()).filter(Boolean);
    if (parts.length === 0) return;
    const set = new Set([...(values || []), ...parts]);
    onChange(Array.from(set));
    setDraft('');
  };
  return (
    <div>
      <p className="text-sm font-medium text-gray-700 mb-1">{label}</p>
      <div className="flex flex-wrap gap-2 p-2 border rounded-md bg-white">
        {(values || []).map((v) => (
          <span key={v} className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">
            {v}
            <button className="ml-1 text-gray-500 hover:text-gray-700" onClick={() => onChange(values.filter(x => x !== v))}>×</button>
          </span>
        ))}
        <input
          className="flex-1 min-w-[160px] outline-none text-sm"
          placeholder={placeholder || 'Ajouter et appuyer sur Entrée'}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); add(draft); }
          }}
          onBlur={() => draft && add(draft)}
          onPaste={(e) => {
            const text = e.clipboardData.getData('text');
            if (text) { e.preventDefault(); add(text); }
          }}
        />
      </div>
    </div>
  );
}

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
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [queries, setQueries] = useState<VeilleQuery[]>(() => {
    try {
      const saved = localStorage.getItem('linkedin:veille-queries');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [activeTab, setActiveTab] = useState<'insights' | 'queries' | 'stats'>('insights');
  const [searchTerm, setSearchTerm] = useState('');
  const [scoreFilter, setScoreFilter] = useState<string>('all');
  const [isRunningVeille, setIsRunningVeille] = useState(false);
  const [config, setConfig] = useState<any>({
    weights: { engagement: 0.4, business: 0.3, novelty: 0.2, priority: 0.1 },
    rss: [], websites: [], youtube: [], objective: '', autoDiscovery: true,
    businessCriteria: {
      topicKeywords: ['roi','revenue','pipeline','market','benchmark','classement','pricing','case study','B2B','SaaS'],
      conversionKeywords: ['download','inscription','subscribe','contact','demo','webinar','trial','lead','conversion'],
      leadMagnetKeywords: ['guide','template','checklist','whitepaper','ebook','rapport','étude','liste','classement','ranking'],
      weights: { topic: 0.5, conversion: 0.3, leadMagnet: 0.2 }
    }
  });
  const [rows, setRows] = useState<any[]>([]);
  const [listError, setListError] = useState<string>('');
  const [status, setStatus] = useState<any>({});
  const [sortBy, setSortBy] = useState<string>('global_desc');
  const [topicFilterUI, setTopicFilterUI] = useState<string>('');

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

  useEffect(() => {
    // Charger configuration et liste serveur
    (async () => {
      try {
        const cfgRes = await fetch('/api/monitoring?config=1');
        if (cfgRes.ok) setConfig(await cfgRes.json());
      } catch {}
      try {
        setListError('');
        const listRes = await fetch(`/api/monitoring?list=1&limit=50&sort=${encodeURIComponent(sortBy)}${topicFilterUI ? `&topic=${encodeURIComponent(topicFilterUI)}`:''}`);
        if (listRes.ok) {
          const data = await listRes.json();
          setRows(data.items || []);
        } else {
          const text = await listRes.text().catch(()=> 'Erreur de liste');
          setRows([]);
          setListError(text);
        }
      } catch (e:any) {
        setRows([]);
        setListError('Erreur de chargement de la liste');
      }
      try {
        const st = await fetch('/api/monitoring?status=1');
        if (st.ok) setStatus(await st.json());
      } catch {}
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        setListError('');
        const listRes = await fetch(`/api/monitoring?list=1&limit=50&sort=${encodeURIComponent(sortBy)}${topicFilterUI ? `&topic=${encodeURIComponent(topicFilterUI)}`:''}`);
        if (listRes.ok) {
          const data = await listRes.json();
          setRows(data.items || []);
        } else {
          const text = await listRes.text().catch(()=> 'Erreur de liste');
          setRows([]);
          setListError(text);
        }
      } catch (e:any) {
        setRows([]);
        setListError('Erreur de chargement de la liste');
      }
    })();
  }, [sortBy, topicFilterUI]);

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
      const st = await fetch('/api/monitoring?status=1').then(r=> r.ok ? r.json() : null).catch(()=>null);
      if (st) setStatus(st);
      try {
        setListError('');
        const listRes = await fetch('/api/monitoring?list=1');
        if (listRes.ok) {
          const data = await listRes.json();
          setRows(data.items || []);
        } else {
          const text = await listRes.text().catch(()=> 'Erreur de liste');
          setRows([]);
          setListError(text);
        }
      } catch {
        setRows([]);
        setListError('Erreur de chargement de la liste');
      }
      const insightsCount = (result.optimizedOk ?? st?.itemsProcessed ?? 0);
      const exploredCount = (result.targetsProcessed ?? st?.sourcesProcessed ?? 0);
      alert(`Veille terminée: ${insightsCount} insights, ${exploredCount} sources explorées.`);
      // Pas d’injection d’insights mock: les résultats sont persistés dans data/monitoring
    } catch (e) {
      console.error('Erreur exécution veille:', e);
      alert('Impossible d\'appeler /api/monitoring. Lance les fonctions serveur (ex: vercel dev).');
    } finally {
      setIsRunningVeille(false);
    }
  };

  const saveConfig = async () => {
    try {
      const r = await fetch('/api/monitoring', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'save_config', config })
      });
      if (!r.ok) { alert('Erreur sauvegarde config'); return; }
      alert('Paramètres de veille enregistrés');
    } catch { alert('Impossible de sauvegarder la config'); }
  };

  const globalScore = (s: any) => (s.engagement*config.weights.engagement + s.business*config.weights.business + s.novelty*config.weights.novelty + s.priority*config.weights.priority);

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

  const totalInsights = rows.length;
  const highPriorityInsights = rows.filter(i => i.scores.priority >= 0.8).length;
  const avgEngagement = totalInsights ? (rows.reduce((sum, i) => sum + i.scores.engagement, 0) / totalInsights) : 0;
  const avgBusinessIntent = totalInsights ? (rows.reduce((sum, i) => sum + i.scores.business, 0) / totalInsights) : 0;

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
      {(listError || status?.lastRunAt || status?.message) && (
        <div className="mt-2 space-y-1">
          {listError && (
            <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded px-3 py-2">
              {listError}
            </div>
          )}
          <div className="text-xs text-gray-700 flex flex-wrap items-center gap-3">
            <span>État: {status?.success === true ? 'OK' : (status?.success === false ? 'Erreur' : '—')}</span>
            <span>Dernier lancement: {status?.lastRunAt ? new Date(status.lastRunAt).toLocaleString('fr-FR') : '—'}</span>
            <span>Cron quotidien: 06:00 UTC</span>
            {status?.message && <span className="text-gray-500">{status.message}</span>}
          </div>
        </div>
      )}

      {/* Paramètres de veille */}
      <Card>
        <CardHeader className="pb-3"><CardTitle>Paramètres de veille</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <TagInput label="Flux RSS" values={config.rss || []} onChange={(vals)=> setConfig({ ...config, rss: vals })} placeholder="Colle plusieurs URLs, Entrée pour ajouter" />
            <TagInput label="Sites web" values={config.websites || []} onChange={(vals)=> setConfig({ ...config, websites: vals })} placeholder="Domaines/URLs" />
            <TagInput label="YouTube" values={config.youtube || []} onChange={(vals)=> setConfig({ ...config, youtube: vals })} placeholder="Chaînes/Playlists" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700">Contexte / Objectif de veille</p>
            <Textarea placeholder={"Décris l’objectif business pour guider l’IA (ex: Leads CFO France, sujets Finance + Data)."} value={config.objective} onChange={e=> setConfig({ ...config, objective: e.target.value })} />
            <div className="mt-2 text-sm text-gray-600 flex items-center gap-2">
              <input id="autoD" type="checkbox" checked={!!config.autoDiscovery} onChange={e=> setConfig({ ...config, autoDiscovery: e.target.checked })} />
              <label htmlFor="autoD">Activer la découverte automatique quotidienne (RSS/YouTube depuis les sites)</label>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="text-sm text-gray-600">Pondération Engagement</label>
              <Input type="number" step="0.05" min="0" max="1" value={config.weights.engagement} onChange={e=> setConfig({ ...config, weights: { ...config.weights, engagement: Number(e.target.value) } })} />
            </div>
            <div>
              <label className="text-sm text-gray-600">Pondération Business</label>
              <Input type="number" step="0.05" min="0" max="1" value={config.weights.business} onChange={e=> setConfig({ ...config, weights: { ...config.weights, business: Number(e.target.value) } })} />
            </div>
            <div>
              <label className="text-sm text-gray-600">Pondération Nouveauté</label>
              <Input type="number" step="0.05" min="0" max="1" value={config.weights.novelty} onChange={e=> setConfig({ ...config, weights: { ...config.weights, novelty: Number(e.target.value) } })} />
            </div>
            <div>
              <label className="text-sm text-gray-600">Pondération Priorité</label>
              <Input type="number" step="0.05" min="0" max="1" value={config.weights.priority} onChange={e=> setConfig({ ...config, weights: { ...config.weights, priority: Number(e.target.value) } })} />
            </div>
            <div>
              <label className="text-sm text-gray-600">Max nouveaux / flux</label>
              <Input type="number" min="1" max="50" value={config.maxNewPerFeed ?? 5} onChange={e=> setConfig({ ...config, maxNewPerFeed: Number(e.target.value) })} />
            </div>
            <div>
              <label className="text-sm text-gray-600">Max nouveaux / run</label>
              <Input type="number" min="10" max="200" value={config.maxNewPerRun ?? 50} onChange={e=> setConfig({ ...config, maxNewPerRun: Number(e.target.value) })} />
            </div>
          </div>
          <div className="flex justify-end">
            <Button onClick={saveConfig} className="bg-green-600 hover:bg-green-700">Enregistrer</Button>
          </div>
        </CardContent>
      </Card>


      {/* Recherche AI (Perplexity) + Prompt configurable */}
      <Card>
        <CardHeader className="pb-3"><CardTitle>Scoring & Recherche (IA)</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <input id="aiResearch" type="checkbox" checked={!!config.aiResearch} onChange={e=> setConfig({ ...config, aiResearch: e.target.checked })} />
            <label htmlFor="aiResearch">Activer la découverte de sources via IA (Perplexity)</label>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="text-sm text-gray-600">Fournisseur</label>
              <Input value={config.aiProvider || 'perplexity'} onChange={e=> setConfig({ ...config, aiProvider: e.target.value })} />
            </div>
            <div>
              <label className="text-sm text-gray-600">Modèle</label>
              <Input value={config.aiModel || 'sonar-pro'} onChange={e=> setConfig({ ...config, aiModel: e.target.value })} />
            </div>
          </div>
          <div>
              <label className="text-sm text-gray-600">Prompt Scoring & Recherche (utilisé par l'IA)</label>
            <Textarea
              className="min-h-[120px]"
              placeholder={`Calcule des sous-scores (0..1) Engagement/Business/Nouveauté/Priorité et un score global = 0.4*Engagement + 0.3*Business + 0.2*Nouveauté + 0.1*Priorité. Filtre contenus trop génériques; priorise CFO/CMO (SaaS/BI/FinTech). Pour la découverte, propose jusqu'à 10 URLs (web/RSS/YouTube) pertinentes pour ${config.objective || 'la veille business/IA B2B'}. Réponds uniquement en JSON.`}
              value={config.scoringPrompt || ''}
              onChange={e=> setConfig({ ...config, scoringPrompt: e.target.value })}
            />
          </div>
          <div className="flex justify-end">
            <Button onClick={saveConfig} className="bg-green-600 hover:bg-green-700">Enregistrer</Button>
          </div>
        </CardContent>
      </Card>

      {/* Bandeau statut */}
      <div className="flex items-center gap-3 text-sm text-gray-700">
        <Badge className={status?.success ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
          {status?.success ? 'OK' : '—'}
        </Badge>
        <span>Dernière exécution: {status?.lastRunAt ? new Date(status.lastRunAt).toLocaleString('fr-FR') : '—'}</span>
        <span>Docs: {status?.itemsProcessed ?? 0}</span>
        <span>Sources: {status?.sourcesProcessed ?? 0}</span>
        <span className="text-gray-500">{status?.message || ''}</span>
      </div>
      {listError && (
        <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded px-3 py-2">
          {listError}
        </div>
      )}

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
          <div className="flex gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input placeholder="Rechercher..." value={searchTerm} onChange={e=> setSearchTerm(e.target.value)} className="pl-10" />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">Trier</label>
              <select className="border rounded px-2 py-1 text-sm" value={sortBy} onChange={e=> setSortBy(e.target.value)}>
                <option value="global_desc">Score global ↓</option>
                <option value="score_asc">Score global ↑</option>
                <option value="date_desc">Date d'ajout ↓</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">Topic</label>
              <select className="border rounded px-2 py-1 text-sm" value={topicFilterUI} onChange={e=> setTopicFilterUI(e.target.value)}>
                <option value="">Tous</option>
                <option value="linkedin">LinkedIn</option>
                <option value="seo">SEO</option>
                <option value="finance">Finance</option>
                <option value="growth">Growth</option>
                <option value="ai">AI</option>
                <option value="general">Général</option>
              </select>
            </div>
            <div className="text-xs text-gray-500">Max 50 entrées</div>
          </div>
          <div className="overflow-auto border rounded-lg">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left">Source (titre/résumé)</th>
                  <th className="px-3 py-2 text-left">Secteur</th>
                  <th className="px-3 py-2 text-right">Engagement</th>
                  <th className="px-3 py-2 text-right">Business</th>
                  <th className="px-3 py-2 text-right">Nouveauté</th>
                  <th className="px-3 py-2 text-right">Priorité</th>
                  <th className="px-3 py-2 text-right">Score global</th>
                  <th className="px-3 py-2 text-left">Signaux métiers</th>
                  <th className="px-3 py-2 text-left">Justification principale</th>
                  <th className="px-3 py-2 text-left">Ajouté</th>
                  <th className="px-3 py-2" />
                </tr>
              </thead>
              <tbody>
                {rows.filter(r => (r.title||'').toLowerCase().includes(searchTerm.toLowerCase())).map((r:any) => (
                  <tr key={r.id} className="border-t">
                    <td className="px-3 py-2 max-w-[360px] truncate"><a className="text-blue-600 hover:underline" href={r.url} target="_blank" rel="noreferrer">{r.title}</a></td>
                    <td className="px-3 py-2">{r.sector || ''}</td>
                    <td className="px-3 py-2 text-right">{Math.round(r.scores.engagement*100)}%</td>
                    <td className="px-3 py-2 text-right">{Math.round(r.scores.business*100)}%</td>
                    <td className="px-3 py-2 text-right">{Math.round(r.scores.novelty*100)}%</td>
                    <td className="px-3 py-2 text-right">{Math.round(r.scores.priority*100)}%</td>
                    <td className="px-3 py-2 text-right font-semibold">{Math.round(globalScore(r.scores)*100)}%</td>
                    <td className="px-3 py-2">{Array.isArray(r.signals) ? r.signals.join(', ') : ''}</td>
                    <td className="px-3 py-2 max-w-[360px] truncate">{r.justification || ''}</td>
                    <td className="px-3 py-2">{r.addedAt ? new Date(r.addedAt).toLocaleDateString('fr-FR') : (r.date ? new Date(r.date).toLocaleDateString('fr-FR') : '')}</td>
                    <td className="px-3 py-2 text-right">
                      <Button variant="outline" size="sm" onClick={()=> r.url && window.open(r.url,'_blank')}>Ouvrir</Button>
                      <Button variant="ghost" size="sm" onClick={()=> generateSkillFromInsight({ id:r.id, hook:r.title, format:'texte', structure:'', persona:[], auteur:'', date:r.date||'', source_url:r.url||'', probleme:'', resultat:'', preuve:'', cta:'', metrics:{ reactions:0, comments:0, reshares:0}, scores:{ engagement:r.scores.engagement, business_intent:r.scores.business, novelty:r.scores.novelty, priority:r.scores.priority }, extraits:[], mots_cles:[], licence_ok:true, notes:'' } as any)}>→ Skill</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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