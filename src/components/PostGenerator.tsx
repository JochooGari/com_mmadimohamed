import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { 
  Wand2, 
  Brain, 
  Target, 
  Eye,
  Copy,
  RefreshCw,
  ThumbsUp,
  ThumbsDown,
  Save,
  Share,
  CheckCircle,
  AlertCircle,
  Zap,
  FileText,
  BarChart3
} from 'lucide-react';

interface PostBrief {
  audience: string;
  angle: 'probleme' | 'resultat';
  template: string;
  sujet_principal: string;
  preuve_incluse: boolean;
}

interface GeneratedPost {
  id: string;
  brief: PostBrief;
  variante_120: string;
  variante_180: string;
  variante_300: string;
  scores: {
    hook_utile: number;
    une_idee: number;
    preuve_concrete: number;
    friction_lecture: number;
    cta_clair: number;
    total: number;
  };
  skills_utilises: string[];
  created_at: string;
  performance?: {
    likes: number;
    comments: number;
    reshares: number;
    leads_generated: number;
  };
  approved?: boolean;
  publishedAt?: string;
}

const TEMPLATES = {
  'Liste3-5': {
    nom: 'Liste 3-5 points',
    structure: 'Hook ⚡️\n• Point 1 (problème + micro-solution)\n• Point 2\n• Point 3\n\nCTA 👉 ...',
    utilisation: 'Erreurs, étapes, signaux, quick wins'
  },
  'PPP': {
    nom: 'Perspective/Preuve/Process',
    structure: '💡 PERSPECTIVE (opinion claire)\n\n📊 PREUVE (cas/chiffre concret)\n\n🔧 PROCESS :\n1. Étape 1\n2. Étape 2\n3. Étape 3\n\n🎯 CTA',
    utilisation: 'Posts éducatifs avec processus'
  },
  'WhatHowWhy': {
    nom: 'What/How/Why',
    structure: '❓ WHAT (le constat terrain)\n\n🔧 HOW (3 étapes opérables)\n\n💡 WHY (impact business)\n\nCTA 👉',
    utilisation: 'Explication de concepts'
  },
  'CasClient': {
    nom: 'Cas Client Express',
    structure: '🏢 CONTEXTE (1 phrase)\n\n⚡ PROBLÈME rencontré\n\n🔧 SOLUTION (3 étapes)\n\n📊 RÉSULTAT (chiffre)\n\n🎯 CTA',
    utilisation: 'Social proof et crédibilité'
  },
  'MytheRealite': {
    nom: 'Mythe vs Réalité',
    structure: '❌ MYTHE : "croyance commune"\n\n✅ RÉALITÉ : "vraie situation"\n\n💡 POURQUOI cette différence ?\n\n🔧 SOLUTION concrète\n\nCTA 👉',
    utilisation: 'Déconstruire les idées reçues'
  }
};

const SAMPLE_POSTS: GeneratedPost[] = [
  {
    id: 'post_1',
    brief: {
      audience: 'DAF/Finance',
      angle: 'probleme',
      template: 'Liste3-5',
      sujet_principal: 'Budget vs Rolling Forecast',
      preuve_incluse: true
    },
    variante_120: "3 erreurs qui plombent les DAF avec leur budget annuel :\n\n• Budget figé = pilotage aveugle (impossible d'ajuster)\n• Prévisions à 12 mois = fiction pure (écart réel 35%+)\n• Validation une fois par an = réactivité zéro\n\nChez nos clients, le rolling forecast réduit l'écart prév/réel de 35% à 12%.\n\nTu veux notre modèle Excel rolling forecast ?\nCommente « BUDGET » 👇",
    variante_180: "Budget annuel = pilotage dans le rétroviseur.\n\n3 erreurs classiques qui coûtent cher aux DAF :\n\n• Budget figé toute l'année = impossible de s'adapter aux changements business\n• Prévisions à 12 mois = exercice de fiction (écart réel moyen : 35%)\n• Validation annuelle seulement = zéro réactivité sur les opportunités\n\nLa solution ? Rolling forecast trimestriel.\n\nChez nos clients qui l'ont adopté :\n✅ Écart prév/réel réduit de 35% à 12%\n✅ Réactivité business +300%\n✅ Crédibilité DAF auprès de la direction renforcée\n\nTu veux notre template Excel rolling forecast ?\nCommente « BUDGET » et je t'envoie ça 👇",
    variante_300: "Le budget annuel, c'est comme conduire en regardant uniquement le rétroviseur.\n\n3 erreurs classiques qui plombent les DAF :\n\n• **Budget figé pendant 12 mois** = Impossible de s'adapter aux changements business (nouveau client, crise, opportunité...)\n\n• **Prévisions à 12 mois** = Exercice de pure fiction. L'écart moyen entre prévisions et réel ? 35%. Autant lancer une pièce.\n\n• **Validation une seule fois par an** = Zéro réactivité. Le business évolue chaque trimestre, pas annuellement.\n\n**La solution : le rolling forecast trimestriel**\n\nPrincipe simple :\n✅ Révision tous les 3 mois des 12 prochains mois\n✅ Ajustements basés sur les données réelles\n✅ Pilotage proactif vs. réactif\n\n**Résultats chez nos clients qui l'ont adopté :**\n📊 Écart prév/réel réduit de 35% à 12%\n⚡ Réactivité business multipliée par 3\n🎯 Crédibilité de la fonction finance renforcée\n💰 Détection d'opportunités 6 mois plus tôt\n\nTu veux notre template Excel rolling forecast complet ?\nCommente « BUDGET » et je t'envoie ça en DM 👇",
    scores: {
      hook_utile: 4,
      une_idee: 5,
      preuve_concrete: 5,
      friction_lecture: 4,
      cta_clair: 5,
      total: 4.6
    },
    skills_utilises: ['HOOK_LISTE_3', 'PREUVE_CONCRETE', 'CTA_COMMENT_KEYWORD', 'CLARITY_ONE_IDEA'],
    created_at: '2025-02-12T10:30:00Z'
  }
];

export default function PostGenerator({ className = '' }: { className?: string }) {
  const [posts, setPosts] = useState<GeneratedPost[]>(() => {
    try {
      const saved = localStorage.getItem('linkedin:generated-posts');
      return saved ? JSON.parse(saved) : SAMPLE_POSTS;
    } catch {
      return SAMPLE_POSTS;
    }
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [aiProvider, setAiProvider] = useState<string>('perplexity');
  const [aiModel, setAiModel] = useState<string>('sonar');
  const [currentBrief, setCurrentBrief] = useState<Partial<PostBrief>>({
    audience: 'DAF/Finance',
    angle: 'probleme',
    template: 'Liste3-5',
    sujet_principal: '',
    preuve_incluse: true
  });

  const [selectedPost, setSelectedPost] = useState<GeneratedPost | null>(null);
  const [publishing, setPublishing] = useState<string | null>(null);

  // Sauvegarder automatiquement
  useEffect(() => {
    try {
      localStorage.setItem('linkedin:generated-posts', JSON.stringify(posts));
    } catch (error) {
      console.error('Erreur sauvegarde posts:', error);
    }
  }, [posts]);

  // Charger le provider/modèle depuis la config de veille
  useEffect(() => {
    (async () => {
      try {
        const r = await fetch('/api/monitoring?config=1');
        if (r.ok) {
          const c = await r.json();
          if (c?.aiProvider) setAiProvider(c.aiProvider);
          if (c?.aiModel) setAiModel(c.aiModel);
        }
      } catch {}
    })();
  }, []);

  const generatePost = async () => {
    if (!currentBrief.sujet_principal?.trim()) {
      alert('Veuillez saisir un sujet principal');
      return;
    }

    // Déduplication simple: éviter de générer 2 fois le même sujet+template+audience
    const duplicate = posts.find(p =>
      p.brief.sujet_principal.trim().toLowerCase() === currentBrief.sujet_principal!.trim().toLowerCase() &&
      p.brief.template === currentBrief.template &&
      p.brief.audience === currentBrief.audience
    );
    if (duplicate) {
      alert('Un post avec le même sujet, template et audience existe déjà. Modifie légèrement le sujet ou le template pour éviter un doublon.');
      return;
    }

    setIsGenerating(true);

    // Contexte: sources internes + veille optimisée (top 5)
    let contextBlocks: string[] = [];
    try {
      const [internalRes, veilleRes] = await Promise.all([
        fetch('/api/storage?agent=linkedin&type=sources').then(r => r.ok ? r.json() : [] as any).catch(()=>[]),
        fetch('/api/monitoring?list=1&limit=5&sort=global_desc').then(r => r.ok ? r.json() : { items: [] }).catch(()=>({ items: [] }))
      ]);
      const internals: any[] = Array.isArray(internalRes) ? internalRes : [];
      if (internals.length > 0) {
        const snips = internals.slice(0, 5).map((s:any) => `- ${s.name || s.id || ''}: ${String(s.content || s.summary || '').slice(0,180)}`);
        contextBlocks.push(`Sources internes:\n${snips.join('\n')}`);
      }
      const rows: any[] = Array.isArray((veilleRes as any)?.items) ? (veilleRes as any).items : [];
      if (rows.length > 0) {
        const snips = rows.slice(0, 5).map((r:any) => `- ${r.title || ''} (${r.sector || ''}) ${Math.round((r.scores?.global||0)*100)}% → ${r.url}`);
        contextBlocks.push(`Veille optimisée:\n${snips.join('\n')}`);
      }
    } catch {}

    // Prompt IA: 3 variantes en JSON uniquement
    const sys = 'You output ONLY compact JSON. No prose. Never use markdown.';
    const briefText = `Audience: ${currentBrief.audience}\nAngle: ${currentBrief.angle}\nTemplate: ${currentBrief.template}\nSujet: ${currentBrief.sujet_principal}`;
    const user = `Tu es un expert en ghostwriting LinkedIn B2B. Crée 3 variantes de post (${currentBrief.preuve_incluse ? 'inclure au moins 1 preuve/chiffre' : 'sans contrainte de preuve'}) pour le sujet ci-dessous. Style clair, concret, CTA à la fin. Retourne UNIQUEMENT un JSON:\n{\"variant_120\":\"...\",\"variant_180\":\"...\",\"variant_300\":\"...\"}\n\nBrief:\n${briefText}\n\nContexte (à utiliser seulement si pertinent):\n${contextBlocks.join('\n')}`;

    try {
      const r = await fetch('/api/ai-proxy', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: aiProvider, model: aiModel, messages: [ { role: 'system', content: sys }, { role: 'user', content: user } ], temperature: 0.5, maxTokens: 700 })
      });
      if (!r.ok) {
        const t = await r.text().catch(()=> '');
        throw new Error(`AI error ${r.status}: ${t}`);
      }
      const data = await r.json();
      let text = (data?.content || data?.text || data?.choices?.[0]?.message?.content || '').trim();
      if (/^```/.test(text)) text = text.replace(/^```(?:json)?\n?/i, '').replace(/\n?```$/i, '').trim();
      let json: any;
      try { json = JSON.parse(text); } catch {
        const first = text.indexOf('{'); const last = text.lastIndexOf('}');
        if (first >= 0 && last > first) json = JSON.parse(text.slice(first, last+1));
        else throw new Error('Réponse IA non JSON');
      }

      // Charger Skills pour enrichir les métadonnées
      const skills = JSON.parse(localStorage.getItem('linkedin:skills-kb') || '[]');
      const skillsUtilises = skills.filter((s: any) => s.poids > 0.7).slice(0, 4).map((s: any) => s.skill_id);

      const newPost: GeneratedPost = {
        id: `post_${Date.now()}`,
        brief: currentBrief as PostBrief,
        variante_120: String(json?.variant_120 || ''),
        variante_180: String(json?.variant_180 || ''),
        variante_300: String(json?.variant_300 || ''),
        scores: calculateScores(currentBrief),
        skills_utilises: skillsUtilises,
        created_at: new Date().toISOString()
      };

      setPosts(prev => [newPost, ...prev]);
      setSelectedPost(newPost);
    } catch (e:any) {
      alert(`Erreur génération IA: ${e?.message || 'inconnue'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const generateVariant = (brief: Partial<PostBrief>, length: number, skills: any[], topics: any[]): string => {
    const template = TEMPLATES[brief.template as keyof typeof TEMPLATES];
    const sujet = brief.sujet_principal || 'Sujet par défaut';
    
    // Simulation basée sur le template et les skills
    if (brief.template === 'Liste3-5') {
      if (length === 120) {
        return `3 erreurs qui impactent ${brief.audience} sur ${sujet} :\n\n• Erreur 1 (problème spécifique)\n• Erreur 2 (conséquence business)\n• Erreur 3 (impact mesurable)\n\n${brief.preuve_incluse ? 'Chez nos clients : amélioration de 40% en moyenne.\n\n' : ''}Tu veux notre checklist ${sujet} ?\nCommente « TIPS » 👇`;
      } else if (length === 180) {
        return `${sujet} : 3 erreurs qui coûtent cher aux ${brief.audience}.\n\n• **Erreur 1** = Problème détaillé avec contexte business\n• **Erreur 2** = Impact sur la performance et les résultats\n• **Erreur 3** = Conséquence sur l'équipe et la crédibilité\n\n${brief.preuve_incluse ? 'Résultats chez nos clients :\n✅ Amélioration performance +40%\n✅ Temps gagné : 5h/semaine\n✅ ROI mesuré : +25%\n\n' : ''}Tu veux notre guide complet ${sujet} ?\nCommente « GUIDE » et je t'envoie ça 👇`;
      } else {
        return `Le ${sujet}, c'est critique pour les ${brief.audience}.\n\n3 erreurs classiques qui coûtent cher :\n\n• **Erreur 1 détaillée** : Explication complète du problème avec contexte métier, pourquoi c'est fréquent, et impact immédiat sur le business.\n\n• **Erreur 2 détaillée** : Analyse approfondie avec exemples concrets, chiffres à l'appui, et conséquences sur la performance globale.\n\n• **Erreur 3 détaillée** : Décryptage complet avec cas d'usage réels, impact sur l'équipe et la crédibilité professionnelle.\n\n${brief.preuve_incluse ? '**Résultats mesurés chez nos clients :**\n📊 Performance améliorée de 40% en moyenne\n⏱️ Temps économisé : 5h/semaine/personne\n💰 ROI mesuré : +25% sur 6 mois\n🎯 Satisfaction équipe : +60%\n\n' : ''}**La solution ?**\nNotre framework complet ${sujet} avec :\n✅ Checklist détaillée\n✅ Templates prêts à l'emploi\n✅ Cas d'usage sectoriels\n\nTu veux recevoir le guide complet ?\nCommente « FRAMEWORK » et je t'envoie tout ça en DM 👇`;
      }
    }
    
    return `Post généré sur ${sujet} pour ${brief.audience} (${length} mots)`;
  };

  const calculateScores = (brief: Partial<PostBrief>) => {
    // Simulation du scoring basé sur les critères
    return {
      hook_utile: Math.random() > 0.3 ? 4 + Math.random() : 2 + Math.random() * 2,
      une_idee: brief.sujet_principal ? 5 : 3,
      preuve_concrete: brief.preuve_incluse ? 4 + Math.random() : 2 + Math.random(),
      friction_lecture: 3 + Math.random() * 2,
      cta_clair: 4 + Math.random(),
      total: 0
    };
  };

  const getScoreColor = (score: number) => {
    if (score >= 4) return 'text-green-600 bg-green-100';
    if (score >= 3) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Post copié dans le presse-papiers !');
  };

  const approvePost = (postId: string) => {
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, approved: true } : p));
  };

  const publishToLinkedIn = async (post: GeneratedPost, variant: '120'|'180'|'300') => {
    try {
      setPublishing(post.id);
      const content = variant === '120' ? post.variante_120 : variant === '180' ? post.variante_180 : post.variante_300;
      const r = await fetch('/api/connectors', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'publish_linkedin', content, meta: { subject: post.brief.sujet_principal, template: post.brief.template } })
      });
      const t = await r.text();
      if (!r.ok) throw new Error(t || `HTTP ${r.status}`);
      setPosts(prev => prev.map(p => p.id === post.id ? { ...p, publishedAt: new Date().toISOString() } : p));
      alert('Publication LinkedIn: ' + t);
    } catch (e:any) {
      alert('Publication échouée: ' + (e?.message || 'inconnue'));
    } finally {
      setPublishing(null);
    }
  };

  const ratePost = (postId: string, rating: 'up' | 'down') => {
    // Mise à jour du feedback pour améliorer les skills
    console.log(`Post ${postId} rated: ${rating}`);
    
    // Mettre à jour les poids des skills utilisées
    const post = posts.find(p => p.id === postId);
    if (post) {
      const skills = JSON.parse(localStorage.getItem('linkedin:skills-kb') || '[]');
      const updatedSkills = skills.map((skill: any) => {
        if (post.skills_utilises.includes(skill.skill_id)) {
          return {
            ...skill,
            utilisation_count: skill.utilisation_count + 1,
            performance_avg: rating === 'up' 
              ? Math.min(5, skill.performance_avg + 0.1)
              : Math.max(0, skill.performance_avg - 0.1)
          };
        }
        return skill;
      });
      localStorage.setItem('linkedin:skills-kb', JSON.stringify(updatedSkills));
    }
  };

  // Calcul des scores finaux
  posts.forEach(post => {
    const scores = post.scores;
    scores.total = (scores.hook_utile + scores.une_idee + scores.preuve_concrete + 
                   scores.friction_lecture + scores.cta_clair) / 5;
  });

  const avgScore = posts.length > 0 
    ? posts.reduce((sum, p) => sum + p.scores.total, 0) / posts.length 
    : 0;

  const publishableCount = posts.filter(p => p.scores.total >= 4).length;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Générateur de Posts LinkedIn</h2>
          <p className="text-gray-600">
            {posts.length} posts générés · {publishableCount} publiables (≥4/5) · Score moyen: {avgScore.toFixed(1)}/5
          </p>
        </div>
      </div>

      {/* Stats rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Posts Générés</p>
                <p className="text-2xl font-bold">{posts.length}</p>
              </div>
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Publiables</p>
                <p className="text-2xl font-bold text-green-600">{publishableCount}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Score Moyen</p>
                <p className={`text-2xl font-bold ${avgScore >= 4 ? 'text-green-600' : avgScore >= 3 ? 'text-orange-600' : 'text-red-600'}`}>
                  {avgScore.toFixed(1)}/5
                </p>
              </div>
              <BarChart3 className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Skills Actives</p>
                <p className="text-2xl font-bold">
                  {JSON.parse(localStorage.getItem('linkedin:skills-kb') || '[]').filter((s: any) => s.poids > 0.7).length}
                </p>
              </div>
              <Brain className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Générateur */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5 text-purple-600" />
            Nouveau Post LinkedIn
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Audience:</label>
              <select
                value={currentBrief.audience}
                onChange={(e) => setCurrentBrief({...currentBrief, audience: e.target.value})}
                className="w-full p-2 border rounded"
              >
                <option value="DAF/Finance">DAF/Finance</option>
                <option value="ESN/IT">ESN/IT</option>
                <option value="Executive/Direction">Executive/Direction</option>
                <option value="RH/Recrutement">RH/Recrutement</option>
                <option value="Sales/Business Dev">Sales/Business Dev</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Angle:</label>
              <select
                value={currentBrief.angle}
                onChange={(e) => setCurrentBrief({...currentBrief, angle: e.target.value as 'probleme' | 'resultat'})}
                className="w-full p-2 border rounded"
              >
                <option value="probleme">Problème (Pain points)</option>
                <option value="resultat">Résultat (Success story)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Template:</label>
              <select
                value={currentBrief.template}
                onChange={(e) => setCurrentBrief({...currentBrief, template: e.target.value})}
                className="w-full p-2 border rounded"
              >
                {Object.entries(TEMPLATES).map(([key, template]) => (
                  <option key={key} value={key}>{template.nom}</option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={currentBrief.preuve_incluse}
                  onChange={(e) => setCurrentBrief({...currentBrief, preuve_incluse: e.target.checked})}
                />
                <span className="text-sm font-medium">Inclure preuve</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Sujet principal:</label>
            <Input
              placeholder="Ex: Budget vs Rolling Forecast, Recrutement IT, Transformation digitale..."
              value={currentBrief.sujet_principal}
              onChange={(e) => setCurrentBrief({...currentBrief, sujet_principal: e.target.value})}
            />
          </div>

          {currentBrief.template && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm font-medium mb-2">Structure {TEMPLATES[currentBrief.template as keyof typeof TEMPLATES].nom}:</p>
              <pre className="text-xs text-gray-700 whitespace-pre-wrap">
                {TEMPLATES[currentBrief.template as keyof typeof TEMPLATES].structure}
              </pre>
              <p className="text-xs text-gray-600 mt-2">
                💡 {TEMPLATES[currentBrief.template as keyof typeof TEMPLATES].utilisation}
              </p>
            </div>
          )}

          <Button 
            onClick={generatePost} 
            disabled={isGenerating || !currentBrief.sujet_principal?.trim()}
            className="w-full bg-purple-600 hover:bg-purple-700"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Génération en cours...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 mr-2" />
                Générer les 3 variantes
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Posts générés */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Posts générés récemment</h3>
        
        {posts.map((post) => (
          <Card key={post.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-base font-semibold mb-2">
                    {post.brief.sujet_principal} · {post.brief.audience} · {TEMPLATES[post.brief.template as keyof typeof TEMPLATES].nom}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-blue-100 text-blue-800">{post.brief.angle}</Badge>
                    <Badge className="bg-purple-100 text-purple-800">{post.brief.template}</Badge>
                    <Badge className={`${getScoreColor(post.scores.total)}`}>
                      Score: {post.scores.total.toFixed(1)}/5
                    </Badge>
                    {post.scores.total >= 4 && <Badge className="bg-green-100 text-green-800">✅ Publiable</Badge>}
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => ratePost(post.id, 'up')}
                    className="text-green-600 hover:text-green-700"
                  >
                    <ThumbsUp className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => ratePost(post.id, 'down')}
                    className="text-red-600 hover:text-red-700"
                  >
                    <ThumbsDown className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => approvePost(post.id)}
                    className={post.approved ? 'border-green-600 text-green-700' : ''}
                  >
                    {post.approved ? '✔ Approuvé' : 'Soumettre / Approuver'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedPost(selectedPost?.id === post.id ? null : post)}
                  >
                    <Eye className="w-3 h-3 mr-1" />
                    {selectedPost?.id === post.id ? 'Fermer' : 'Voir'}
                  </Button>
                </div>
              </div>
            </CardHeader>

            {selectedPost?.id === post.id && (
              <CardContent className="space-y-4">
                {/* Scores détaillés */}
                <div className="grid grid-cols-6 gap-2 p-3 bg-gray-50 rounded">
                  <div className="text-center">
                    <p className="text-xs text-gray-600">Hook</p>
                    <p className={`text-sm font-bold px-1 py-1 rounded ${getScoreColor(post.scores.hook_utile)}`}>
                      {post.scores.hook_utile.toFixed(1)}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-600">1 Idée</p>
                    <p className={`text-sm font-bold px-1 py-1 rounded ${getScoreColor(post.scores.une_idee)}`}>
                      {post.scores.une_idee.toFixed(1)}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-600">Preuve</p>
                    <p className={`text-sm font-bold px-1 py-1 rounded ${getScoreColor(post.scores.preuve_concrete)}`}>
                      {post.scores.preuve_concrete.toFixed(1)}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-600">Lecture</p>
                    <p className={`text-sm font-bold px-1 py-1 rounded ${getScoreColor(post.scores.friction_lecture)}`}>
                      {post.scores.friction_lecture.toFixed(1)}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-600">CTA</p>
                    <p className={`text-sm font-bold px-1 py-1 rounded ${getScoreColor(post.scores.cta_clair)}`}>
                      {post.scores.cta_clair.toFixed(1)}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-600">TOTAL</p>
                    <p className={`text-sm font-bold px-1 py-1 rounded ${getScoreColor(post.scores.total)}`}>
                      {post.scores.total.toFixed(1)}
                    </p>
                  </div>
                </div>

                {/* Variantes */}
                <div className="space-y-4">
                  {[
                    { label: '120 mots (Mobile)', content: post.variante_120 },
                    { label: '180 mots (Standard)', content: post.variante_180 },
                    { label: '300 mots (Détaillé)', content: post.variante_300 }
                  ].map((variant, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-sm">{variant.label}</h4>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyToClipboard(variant.content)}
                          >
                            <Copy className="w-3 h-3 mr-1" />
                            Copier
                          </Button>
                          <Button
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700"
                            disabled={!post.approved || !!publishing}
                            onClick={() => publishToLinkedIn(post, index === 0 ? '120' : index === 1 ? '180' : '300')}
                          >
                            {publishing === post.id ? <RefreshCw className="w-3 h-3 mr-1 animate-spin" /> : null}
                            Publier sur LinkedIn
                          </Button>
                        </div>
                      </div>
                      <div className="bg-white border rounded p-3">
                        <pre className="whitespace-pre-wrap text-sm font-sans">
                          {variant.content}
                        </pre>
                      </div>
                      <div className="text-xs text-gray-500 mt-2">
                        {variant.content.length} caractères · {variant.content.split(' ').length} mots {post.publishedAt ? `· Publié: ${new Date(post.publishedAt).toLocaleString('fr-FR')}` : ''}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Skills utilisées */}
                <div>
                  <p className="text-sm font-medium mb-2">Skills utilisées:</p>
                  <div className="flex flex-wrap gap-2">
                    {post.skills_utilises.map(skill => (
                      <Badge key={skill} className="bg-orange-100 text-orange-800">
                        {skill.replace(/_/g, ' ')}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between items-center text-sm text-gray-500 pt-2 border-t">
                  <span>Créé: {new Date(post.created_at).toLocaleDateString('fr-FR')} à {new Date(post.created_at).toLocaleTimeString('fr-FR')}</span>
                  <span>Template: {post.brief.template}</span>
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {posts.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Wand2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucun post généré
            </h3>
            <p className="text-gray-500">
              Saisissez un sujet et générez vos premiers posts LinkedIn optimisés.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}