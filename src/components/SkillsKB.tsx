import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { 
  Brain, 
  Plus, 
  Edit3, 
  Trash2, 
  Search,
  BookOpen,
  Target,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Filter
} from 'lucide-react';

// Types pour la Skills KB
interface Skill {
  skill_id: string;
  type: 'hook' | 'template' | 'checklist' | 'anti_pattern' | 'framework';
  principe: string;
  pourquoi: string;
  exemple: string;
  anti_patterns: string[];
  checklist?: string[];
  template?: string;
  poids: number; // 0-1, importance/performance
  derniere_maj: string;
  preuves: string[]; // IDs des insights de veille qui ont validé cette skill
  utilisation_count: number;
  performance_avg: number; // moyenne des scores des posts qui ont utilisé cette skill
}

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
  mots_cles: string[];
}

const SKILL_PACK_V1: Skill[] = [
  {
    skill_id: "CLARITY_ONE_IDEA",
    type: "framework",
    principe: "1 post = 1 idée claire. Résumer le post en 1 phrase avant d'écrire.",
    pourquoi: "Évite la dilution du message et améliore la rétention.",
    exemple: "Post sur 'budget vs rolling forecast' → Une seule idée : le rolling forecast réduit l'écart vs réel.",
    anti_patterns: ["Mélanger plusieurs concepts", "Posts fourre-tout", "Idées imbriquées"],
    checklist: ["Idée résumable en 1 phrase", "Pas de digression", "Focus unique maintenu"],
    poids: 0.95,
    derniere_maj: new Date().toISOString(),
    preuves: [],
    utilisation_count: 0,
    performance_avg: 0
  },
  {
    skill_id: "HOOK_LISTE_3",
    type: "hook",
    principe: "Hook avec liste courte (3-5 points max). Structure claire et scannnable.",
    pourquoi: "Lisibilité mobile + rétention cognitive optimale.",
    exemple: "3 erreurs de DAF qui coûtent du cash en fin de mois :",
    anti_patterns: ["Plus de 5 points", "Pas de numérotation", "Points trop longs"],
    template: "Hook ⚡️\n• Point 1 (problème + micro-solution)\n• Point 2\n• Point 3\n\nCTA 👉 ...",
    poids: 0.88,
    derniere_maj: new Date().toISOString(),
    preuves: [],
    utilisation_count: 0,
    performance_avg: 0
  },
  {
    skill_id: "CTA_COMMENT_KEYWORD",
    type: "framework",
    principe: "CTA avec mot-clé à commenter pour recevoir une ressource.",
    pourquoi: "Maximise les commentaires → reach + pipeline de prospects chauds.",
    exemple: "Tu veux le modèle de budget rolling ? Commente « BUDGET ».",
    anti_patterns: ["CTA flou", "Demande de likes", "Pas d'échange de valeur"],
    checklist: ["Ressource valorisante", "Mot-clé simple", "Échange clair"],
    poids: 0.85,
    derniere_maj: new Date().toISOString(),
    preuves: [],
    utilisation_count: 0,
    performance_avg: 0
  },
  {
    skill_id: "PREUVE_CONCRETE",
    type: "framework",
    principe: "Toujours inclure une preuve concrète : chiffre, cas client, processus testé.",
    pourquoi: "Crédibilité + différenciation vs posts inspirationnels.",
    exemple: "Chez X, le rolling forecast a réduit l'écart prév/réel de 35% à 12% en 6 mois.",
    anti_patterns: ["Affirmations vagues", "Pas de chiffres", "Théorie pure"],
    checklist: ["Chiffre ou % d'amélioration", "Cas concret", "Résultat mesurable"],
    poids: 0.92,
    derniere_maj: new Date().toISOString(),
    preuves: [],
    utilisation_count: 0,
    performance_avg: 0
  },
  {
    skill_id: "TEMPLATE_PPP",
    type: "template",
    principe: "Structure Perspective/Preuve/Process pour posts éducatifs.",
    pourquoi: "Flow logique qui convainc et engage vers l'action.",
    exemple: "Opinion → Cas/chiffre → 3 étapes → CTA",
    template: "💡 PERSPECTIVE (1-2 phrases)\n\n📊 PREUVE (cas/chiffre concret)\n\n🔧 PROCESS :\n1. Étape 1\n2. Étape 2  \n3. Étape 3\n\n🎯 CTA",
    anti_patterns: ["Pas de structure", "Process trop théorique", "CTA faible"],
    checklist: ["Opinion claire", "Preuve quantifiée", "Process actionnable", "CTA business"],
    poids: 0.80,
    derniere_maj: new Date().toISOString(),
    preuves: [],
    utilisation_count: 0,
    performance_avg: 0
  }
];

export default function SkillsKB({ className = '' }: { className?: string }) {
  const [skills, setSkills] = useState<Skill[]>(() => {
    try {
      const saved = localStorage.getItem('linkedin:skills-kb');
      return saved ? JSON.parse(saved) : SKILL_PACK_V1;
    } catch {
      return SKILL_PACK_V1;
    }
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Sauvegarder automatiquement
  useEffect(() => {
    try {
      localStorage.setItem('linkedin:skills-kb', JSON.stringify(skills));
    } catch (error) {
      console.error('Erreur sauvegarde Skills KB:', error);
    }
  }, [skills]);

  const filteredSkills = skills.filter(skill => {
    const matchesSearch = skill.principe.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         skill.skill_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         skill.exemple.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || skill.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'hook': return <Target className="w-4 h-4 text-orange-600" />;
      case 'template': return <BookOpen className="w-4 h-4 text-blue-600" />;
      case 'framework': return <Brain className="w-4 h-4 text-purple-600" />;
      case 'checklist': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'anti_pattern': return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default: return <Brain className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'hook': return 'bg-orange-100 text-orange-800';
      case 'template': return 'bg-blue-100 text-blue-800';
      case 'framework': return 'bg-purple-100 text-purple-800';
      case 'checklist': return 'bg-green-100 text-green-800';
      case 'anti_pattern': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const createNewSkill = () => {
    const newSkill: Skill = {
      skill_id: `SKILL_${Date.now()}`,
      type: 'framework',
      principe: '',
      pourquoi: '',
      exemple: '',
      anti_patterns: [],
      poids: 0.5,
      derniere_maj: new Date().toISOString(),
      preuves: [],
      utilisation_count: 0,
      performance_avg: 0
    };
    setEditingSkill(newSkill);
    setIsCreating(true);
  };

  const saveSkill = () => {
    if (!editingSkill) return;

    if (isCreating) {
      setSkills(prev => [...prev, editingSkill]);
    } else {
      setSkills(prev => prev.map(s => 
        s.skill_id === editingSkill.skill_id ? editingSkill : s
      ));
    }
    
    setEditingSkill(null);
    setIsCreating(false);
  };

  const deleteSkill = (skillId: string) => {
    setSkills(prev => prev.filter(s => s.skill_id !== skillId));
  };

  const topSkills = [...skills]
    .sort((a, b) => (b.poids * (1 + b.utilisation_count/10)) - (a.poids * (1 + a.utilisation_count/10)))
    .slice(0, 3);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header avec stats */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Skills Knowledge Base</h2>
          <p className="text-gray-600">
            {skills.length} compétences · {skills.filter(s => s.poids > 0.8).length} expertes
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={createNewSkill} className="bg-purple-600 hover:bg-purple-700">
            <Plus className="w-4 h-4 mr-2" />
            Nouvelle Skill
          </Button>
        </div>
      </div>

      {/* Top Skills */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            Top Skills Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {topSkills.map((skill, index) => (
              <div key={skill.skill_id} className="p-3 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl font-bold text-green-600">#{index + 1}</span>
                  {getTypeIcon(skill.type)}
                  <Badge className={getTypeColor(skill.type)}>{skill.type}</Badge>
                </div>
                <p className="font-medium text-sm mb-1">{skill.skill_id.replace(/_/g, ' ')}</p>
                <p className="text-xs text-gray-600 mb-2">{skill.principe.substring(0, 80)}...</p>
                <div className="flex justify-between text-xs">
                  <span>Poids: {(skill.poids * 100).toFixed(0)}%</span>
                  <span>Utilisé: {skill.utilisation_count}×</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Filtres */}
      <div className="flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Rechercher dans les skills..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button 
            variant={typeFilter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTypeFilter('all')}
          >
            Toutes
          </Button>
          {['hook', 'template', 'framework', 'checklist', 'anti_pattern'].map(type => (
            <Button
              key={type}
              variant={typeFilter === type ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTypeFilter(type)}
              className="capitalize"
            >
              {type.replace('_', ' ')}
            </Button>
          ))}
        </div>
      </div>

      {/* Liste des Skills */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredSkills.map((skill) => (
          <Card key={skill.skill_id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  {getTypeIcon(skill.type)}
                  <div>
                    <CardTitle className="text-base font-semibold">
                      {skill.skill_id.replace(/_/g, ' ')}
                    </CardTitle>
                    <Badge className={`${getTypeColor(skill.type)} mt-1`}>
                      {skill.type.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setEditingSkill(skill);
                      setIsCreating(false);
                    }}
                  >
                    <Edit3 className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteSkill(skill.skill_id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-3">
              <div>
                <h4 className="font-medium text-sm mb-1">Principe:</h4>
                <p className="text-sm text-gray-700">{skill.principe}</p>
              </div>

              <div>
                <h4 className="font-medium text-sm mb-1">Pourquoi:</h4>
                <p className="text-sm text-gray-600">{skill.pourquoi}</p>
              </div>

              <div>
                <h4 className="font-medium text-sm mb-1">Exemple:</h4>
                <p className="text-sm text-gray-700 italic">"{skill.exemple}"</p>
              </div>

              {skill.template && (
                <div>
                  <h4 className="font-medium text-sm mb-1">Template:</h4>
                  <pre className="text-xs bg-gray-50 p-2 rounded whitespace-pre-wrap">
                    {skill.template}
                  </pre>
                </div>
              )}

              {skill.anti_patterns.length > 0 && (
                <div>
                  <h4 className="font-medium text-sm mb-1 text-red-600">Anti-patterns:</h4>
                  <ul className="text-xs text-red-700 space-y-1">
                    {skill.anti_patterns.map((pattern, index) => (
                      <li key={index}>❌ {pattern}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex justify-between items-center pt-2 border-t">
                <div className="text-xs text-gray-500">
                  Poids: <span className="font-bold">{(skill.poids * 100).toFixed(0)}%</span> · 
                  Utilisé: <span className="font-bold">{skill.utilisation_count}</span>× · 
                  Perf: <span className="font-bold">{skill.performance_avg.toFixed(1)}</span>/5
                </div>
                <div className="text-xs text-gray-400">
                  {new Date(skill.derniere_maj).toLocaleDateString('fr-FR')}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Modal d'édition */}
      {editingSkill && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">
                  {isCreating ? 'Créer une nouvelle skill' : 'Modifier la skill'}
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditingSkill(null);
                    setIsCreating(false);
                  }}
                >
                  Annuler
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">ID de la skill:</label>
                  <Input
                    value={editingSkill.skill_id}
                    onChange={(e) => setEditingSkill({...editingSkill, skill_id: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Type:</label>
                  <select
                    value={editingSkill.type}
                    onChange={(e) => setEditingSkill({...editingSkill, type: e.target.value as any})}
                    className="w-full p-2 border rounded"
                  >
                    <option value="hook">Hook</option>
                    <option value="template">Template</option>
                    <option value="framework">Framework</option>
                    <option value="checklist">Checklist</option>
                    <option value="anti_pattern">Anti-pattern</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Principe:</label>
                  <Textarea
                    value={editingSkill.principe}
                    onChange={(e) => setEditingSkill({...editingSkill, principe: e.target.value})}
                    rows={2}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Pourquoi:</label>
                  <Textarea
                    value={editingSkill.pourquoi}
                    onChange={(e) => setEditingSkill({...editingSkill, pourquoi: e.target.value})}
                    rows={2}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Exemple:</label>
                  <Textarea
                    value={editingSkill.exemple}
                    onChange={(e) => setEditingSkill({...editingSkill, exemple: e.target.value})}
                    rows={2}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Template (optionnel):</label>
                  <Textarea
                    value={editingSkill.template || ''}
                    onChange={(e) => setEditingSkill({...editingSkill, template: e.target.value})}
                    rows={4}
                    placeholder="Structure du template..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Poids ({(editingSkill.poids * 100).toFixed(0)}%):
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={editingSkill.poids}
                    onChange={(e) => setEditingSkill({...editingSkill, poids: parseFloat(e.target.value)})}
                    className="w-full"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEditingSkill(null);
                      setIsCreating(false);
                    }}
                  >
                    Annuler
                  </Button>
                  <Button onClick={saveSkill} className="bg-purple-600 hover:bg-purple-700">
                    {isCreating ? 'Créer' : 'Sauvegarder'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}