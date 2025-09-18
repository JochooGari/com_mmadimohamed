import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Bot, Plus, Settings, Edit3, Trash2, Play, Pause, Zap, TestTube, Copy, Eye } from 'lucide-react';

type AIModel = {
  id: string;
  name: string;
  provider: 'openai' | 'anthropic' | 'google' | 'mistral' | 'local';
  maxTokens: number;
  costPer1kTokens: number;
  capabilities: string[];
};

type Agent = { 
  id: string; 
  name: string; 
  role: string; 
  prompt: string; 
  systemPrompt?: string;
  status?: 'active' | 'inactive';
  description?: string;
  category?: string;
  model: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  stopSequences?: string[];
  tools?: string[];
  memoryEnabled?: boolean;
  contextWindow?: number;
  responseFormat?: 'text' | 'json' | 'markdown';
  instructions?: string;
  examples?: Array<{input: string; output: string}>;
  variables?: Array<{name: string; type: string; description: string; required: boolean}>;
};

const AI_MODELS: AIModel[] = [
  {
    id: 'gpt-4-turbo',
    name: 'GPT-4 Turbo',
    provider: 'openai',
    maxTokens: 128000,
    costPer1kTokens: 0.01,
    capabilities: ['text-generation', 'code-generation', 'analysis', 'reasoning']
  },
  {
    id: 'gpt-3.5-turbo',
    name: 'GPT-3.5 Turbo',
    provider: 'openai',
    maxTokens: 16385,
    costPer1kTokens: 0.002,
    capabilities: ['text-generation', 'conversations', 'summarization']
  },
  {
    id: 'claude-3-opus',
    name: 'Claude 3 Opus',
    provider: 'anthropic',
    maxTokens: 200000,
    costPer1kTokens: 0.015,
    capabilities: ['text-generation', 'analysis', 'reasoning', 'code-generation']
  },
  {
    id: 'claude-3-sonnet',
    name: 'Claude 3 Sonnet',
    provider: 'anthropic',
    maxTokens: 200000,
    costPer1kTokens: 0.003,
    capabilities: ['text-generation', 'analysis', 'conversations']
  },
  {
    id: 'gemini-pro',
    name: 'Gemini Pro',
    provider: 'google',
    maxTokens: 32768,
    costPer1kTokens: 0.0005,
    capabilities: ['text-generation', 'multimodal', 'reasoning']
  },
  {
    id: 'mistral-large',
    name: 'Mistral Large',
    provider: 'mistral',
    maxTokens: 32768,
    costPer1kTokens: 0.008,
    capabilities: ['text-generation', 'multilingual', 'reasoning']
  }
];

const AGENT_CATEGORIES = [
  'Content Creation',
  'Data Analysis', 
  'Marketing',
  'SEO',
  'Customer Support',
  'Research',
  'Productivity',
  'Development'
];

const AVAILABLE_TOOLS = [
  { id: 'web_search', name: 'Recherche Web', description: 'Permet de rechercher des informations sur internet' },
  { id: 'calculator', name: 'Calculatrice', description: 'Effectue des calculs mathématiques' },
  { id: 'file_reader', name: 'Lecteur de fichiers', description: 'Lit et analyse des fichiers' },
  { id: 'data_analysis', name: 'Analyse de données', description: 'Analyse des datasets et génère des insights' },
  { id: 'image_generator', name: 'Générateur d\'images', description: 'Crée des images avec DALL-E ou Midjourney' },
  { id: 'code_interpreter', name: 'Interpréteur de code', description: 'Exécute et debug du code' },
  { id: 'email_sender', name: 'Envoi d\'emails', description: 'Envoie des emails automatiquement' },
  { id: 'calendar', name: 'Gestion du calendrier', description: 'Gère les rendez-vous et événements' }
];

const DEFAULT: Agent[] = [
  { 
    id: 'content-strategist', 
    name: 'Content Strategist', 
    role: 'Strategy & Planning', 
    prompt: 'Tu es un expert en stratégie de contenu qui crée des plans éditoriaux détaillés.',
    systemPrompt: 'Tu es un stratège de contenu expérimenté. Analyse les tendances du marché et propose des stratégies de contenu cohérentes.',
    status: 'active',
    description: 'Développe des stratégies de contenu basées sur les données et les tendances',
    category: 'Content Creation',
    model: 'gpt-4-turbo',
    temperature: 0.7,
    maxTokens: 2000,
    topP: 0.9,
    tools: ['web_search', 'data_analysis'],
    memoryEnabled: true,
    contextWindow: 8000,
    responseFormat: 'markdown',
    variables: [
      { name: 'target_audience', type: 'string', description: 'Public cible', required: true },
      { name: 'industry', type: 'string', description: 'Secteur d\'activité', required: true },
      { name: 'content_goals', type: 'array', description: 'Objectifs du contenu', required: false }
    ]
  },
  { 
    id: 'ghostwriter', 
    name: 'AI Ghostwriter', 
    role: 'Content Writing', 
    prompt: 'Tu es un rédacteur expert qui produit du contenu de haute qualité, engageant et optimisé SEO.',
    systemPrompt: 'Tu écris dans un style professionnel mais accessible. Utilise des données et exemples concrets.',
    status: 'active',
    description: 'Rédacteur IA spécialisé dans le contenu long-form et les articles de blog',
    category: 'Content Creation',
    model: 'claude-3-opus',
    temperature: 0.8,
    maxTokens: 4000,
    tools: ['web_search', 'data_analysis'],
    memoryEnabled: true,
    responseFormat: 'markdown',
    variables: [
      { name: 'topic', type: 'string', description: 'Sujet principal', required: true },
      { name: 'target_length', type: 'number', description: 'Longueur cible en mots', required: false },
      { name: 'tone', type: 'string', description: 'Ton du contenu', required: false },
      { name: 'keywords', type: 'array', description: 'Mots-clés SEO', required: false }
    ]
  },
  { 
    id: 'seo-optimizer', 
    name: 'SEO Optimizer', 
    role: 'SEO Expert', 
    prompt: 'Tu es un expert SEO qui optimise le contenu pour les moteurs de recherche.',
    systemPrompt: 'Analyse le contenu et propose des améliorations SEO spécifiques et actionnables.',
    status: 'active',
    description: 'Optimise le contenu pour le référencement naturel',
    category: 'SEO',
    model: 'gpt-3.5-turbo',
    temperature: 0.3,
    maxTokens: 1500,
    tools: ['web_search', 'data_analysis'],
    responseFormat: 'json',
    variables: [
      { name: 'content', type: 'string', description: 'Contenu à optimiser', required: true },
      { name: 'primary_keyword', type: 'string', description: 'Mot-clé principal', required: true },
      { name: 'secondary_keywords', type: 'array', description: 'Mots-clés secondaires', required: false }
    ]
  },
  { 
    id: 'data-analyst', 
    name: 'Data Analyst', 
    role: 'Data Analysis', 
    prompt: 'Tu es un analyste de données qui transforme les données en insights actionnables.',
    systemPrompt: 'Analyse les données de manière rigoureuse et présente des conclusions claires avec des recommandations.',
    status: 'inactive',
    description: 'Analyse les performances et génère des rapports détaillés',
    category: 'Data Analysis',
    model: 'claude-3-sonnet',
    temperature: 0.2,
    maxTokens: 3000,
    tools: ['calculator', 'data_analysis'],
    responseFormat: 'json',
    variables: [
      { name: 'dataset', type: 'object', description: 'Données à analyser', required: true },
      { name: 'metrics', type: 'array', description: 'Métriques à calculer', required: false },
      { name: 'time_period', type: 'string', description: 'Période d\'analyse', required: false }
    ]
  }
];

export default function AdminAgents() {
  const [agents, setAgents] = useState<Agent[]>(() => {
    try { 
      const raw = window.localStorage.getItem('admin:agents'); 
      return raw ? JSON.parse(raw) as Agent[] : DEFAULT; 
    } catch { 
      return DEFAULT; 
    }
  });
  
  const [draft, setDraft] = useState<Agent>({
    id: '', 
    name: '', 
    role: '', 
    prompt: '', 
    systemPrompt: '',
    status: 'active',
    description: '',
    category: 'Content Creation',
    model: 'gpt-3.5-turbo',
    temperature: 0.7,
    maxTokens: 2000,
    topP: 0.9,
    frequencyPenalty: 0,
    presencePenalty: 0,
    stopSequences: [],
    tools: [],
    memoryEnabled: false,
    contextWindow: 4000,
    responseFormat: 'text',
    instructions: '',
    examples: [],
    variables: []
  });
  
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [testMode, setTestMode] = useState(false);
  const [testInput, setTestInput] = useState('');
  const [testOutput, setTestOutput] = useState('');

  useEffect(() => {
    try { 
      window.localStorage.setItem('admin:agents', JSON.stringify(agents)); 
    } catch {}
  }, [agents]);

  function handleSaveAgent() {
    if (!draft.name.trim()) return;
    const id = draft.id || draft.name.toLowerCase().replace(/\s+/g, '-');
    const item = { ...draft, id, status: draft.status || 'active' };
    setAgents(prev => {
      const exists = prev.some(a => a.id === id);
      return exists ? prev.map(a => a.id === id ? item : a) : [item, ...prev];
    });
    setDraft({
      id: '', 
      name: '', 
      role: '', 
      prompt: '', 
      systemPrompt: '',
      status: 'active',
      description: '',
      category: 'Content Creation',
      model: 'gpt-3.5-turbo',
      temperature: 0.7,
      maxTokens: 2000,
      topP: 0.9,
      frequencyPenalty: 0,
      presencePenalty: 0,
      stopSequences: [],
      tools: [],
      memoryEnabled: false,
      contextWindow: 4000,
      responseFormat: 'text',
      instructions: '',
      examples: [],
      variables: []
    });
    setShowCreateForm(false);
  }

  function edit(a: Agent) { 
    setDraft(a); 
    setShowCreateForm(true);
  }
  
  function remove(id: string) { 
    setAgents(prev => prev.filter(a => a.id !== id)); 
  }
  
  function toggleStatus(id: string) {
    setAgents(prev => prev.map(a => 
      a.id === id ? { ...a, status: a.status === 'active' ? 'inactive' : 'active' } : a
    ));
  }
  
  function cancelEdit() {
    setDraft({
      id: '', 
      name: '', 
      role: '', 
      prompt: '', 
      systemPrompt: '',
      status: 'active',
      description: '',
      category: 'Content Creation',
      model: 'gpt-3.5-turbo',
      temperature: 0.7,
      maxTokens: 2000,
      topP: 0.9,
      frequencyPenalty: 0,
      presencePenalty: 0,
      stopSequences: [],
      tools: [],
      memoryEnabled: false,
      contextWindow: 4000,
      responseFormat: 'text',
      instructions: '',
      examples: [],
      variables: []
    });
    setShowCreateForm(false);
  }
  
  const getModelInfo = (modelId: string) => {
    return AI_MODELS.find(m => m.id === modelId) || AI_MODELS[0];
  };
  
  const addVariable = () => {
    setDraft(d => ({
      ...d,
      variables: [...(d.variables || []), { name: '', type: 'string', description: '', required: false }]
    }));
  };
  
  const removeVariable = (index: number) => {
    setDraft(d => ({
      ...d,
      variables: (d.variables || []).filter((_, i) => i !== index)
    }));
  };
  
  const updateVariable = (index: number, field: string, value: any) => {
    setDraft(d => ({
      ...d,
      variables: (d.variables || []).map((v, i) => 
        i === index ? { ...v, [field]: value } : v
      )
    }));
  };
  
  const addExample = () => {
    setDraft(d => ({
      ...d,
      examples: [...(d.examples || []), { input: '', output: '' }]
    }));
  };
  
  const removeExample = (index: number) => {
    setDraft(d => ({
      ...d,
      examples: (d.examples || []).filter((_, i) => i !== index)
    }));
  };
  
  const updateExample = (index: number, field: string, value: string) => {
    setDraft(d => ({
      ...d,
      examples: (d.examples || []).map((e, i) => 
        i === index ? { ...e, [field]: value } : e
      )
    }));
  };

  const testAgent = async () => {
    if (!testInput.trim()) return;
    
    setTestOutput('🤖 Test en cours...');
    
    // Simulation d'un appel API
    setTimeout(() => {
      setTestOutput(`**Agent:** ${draft.name}\n**Modèle:** ${getModelInfo(draft.model).name}\n**Température:** ${draft.temperature}\n\n**Réponse simulée:**\n\nCeci est une réponse simulée basée sur votre prompt. En production, l'agent utiliserait le modèle ${getModelInfo(draft.model).name} pour générer une vraie réponse.\n\n**Variables détectées:**\n${(draft.variables || []).map(v => `- ${v.name}: ${v.type}`).join('\n')}\n\n**Outils disponibles:**\n${(draft.tools || []).map(t => `- ${AVAILABLE_TOOLS.find(tool => tool.id === t)?.name}`).join('\n')}`);
    }, 2000);
  };

  const duplicateAgent = (agent: Agent) => {
    const duplicate = {
      ...agent,
      id: '',
      name: agent.name + ' (Copie)',
      status: 'inactive' as const
    };
    setDraft(duplicate);
    setShowCreateForm(true);
  };
  
  const getStatusColor = (status: string) => {
    return status === 'active' 
      ? 'bg-green-100 text-green-800 hover:bg-green-200' 
      : 'bg-gray-100 text-gray-800 hover:bg-gray-200';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Agents IA Avancés</h1>
          <p className="text-gray-600 mt-1">Configurez vos agents d'intelligence artificielle avec des modèles et paramètres personnalisés</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" onClick={() => setTestMode(!testMode)}>
            <TestTube className="w-4 h-4 mr-2" />
            {testMode ? 'Fermer test' : 'Mode test'}
          </Button>
          <Button 
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="bg-teal-500 hover:bg-teal-600"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nouvel Agent
          </Button>
        </div>
      </div>

      {/* Test Panel */}
      {testMode && (
        <Card className="border-blue-200 bg-blue-50/50">
          <CardHeader>
            <CardTitle className="text-lg">Test d'Agent IA</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">
                  Message de test
                </label>
                <Textarea
                  rows={4}
                  placeholder="Entrez votre message de test..."
                  value={testInput}
                  onChange={(e) => setTestInput(e.target.value)}
                />
                <Button onClick={testAgent} className="mt-2 bg-blue-500 hover:bg-blue-600">
                  <Zap className="w-4 h-4 mr-2" />
                  Tester l'agent
                </Button>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">
                  Réponse de l'agent
                </label>
                <div className="bg-white border rounded-lg p-3 min-h-[120px] whitespace-pre-wrap text-sm">
                  {testOutput || 'La réponse apparaîtra ici...'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create/Edit Form */}
      {showCreateForm && (
        <Card className="border-teal-200 bg-teal-50/50">
          <CardHeader>
            <CardTitle className="text-lg">
              {draft.id ? 'Modifier l\'agent' : 'Nouvel agent IA'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="basic" className="space-y-4">
              <TabsList>
                <TabsTrigger value="basic">Configuration de base</TabsTrigger>
                <TabsTrigger value="advanced">Paramètres avancés</TabsTrigger>
                <TabsTrigger value="tools">Outils & Variables</TabsTrigger>
                <TabsTrigger value="examples">Exemples</TabsTrigger>
              </TabsList>

              {/* Basic Configuration */}
              <TabsContent value="basic" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">
                      Nom de l'agent
                    </label>
                    <Input
                      placeholder="Ex: Content Marketer"
                      value={draft.name}
                      onChange={(e) => setDraft(d => ({ ...d, name: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">
                      Rôle
                    </label>
                    <Input
                      placeholder="Ex: Marketing Content Specialist"
                      value={draft.role}
                      onChange={(e) => setDraft(d => ({ ...d, role: e.target.value }))}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">
                      Catégorie
                    </label>
                    <select
                      value={draft.category || 'Content Creation'}
                      onChange={(e) => setDraft(d => ({ ...d, category: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                      {AGENT_CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">
                      Modèle IA
                    </label>
                    <select
                      value={draft.model || 'gpt-3.5-turbo'}
                      onChange={(e) => setDraft(d => ({ ...d, model: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                      {AI_MODELS.map(model => (
                        <option key={model.id} value={model.id}>
                          {model.name} ({model.provider})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">
                      Statut
                    </label>
                    <select 
                      value={draft.status}
                      onChange={(e) => setDraft(d => ({ ...d, status: e.target.value as 'active' | 'inactive' }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                      <option value="active">Actif</option>
                      <option value="inactive">Inactif</option>
                    </select>
                  </div>
                </div>
                
                {/* Model Info */}
                {draft.model && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-4">
                        <span><strong>Fournisseur:</strong> {getModelInfo(draft.model).provider}</span>
                        <span><strong>Tokens max:</strong> {getModelInfo(draft.model).maxTokens.toLocaleString()}</span>
                        <span><strong>Coût:</strong> ${getModelInfo(draft.model).costPer1kTokens}/1k tokens</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {getModelInfo(draft.model).capabilities.map((cap, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">{cap}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">
                    Description
                  </label>
                  <Input
                    placeholder="Brève description de l'agent"
                    value={draft.description || ''}
                    onChange={(e) => setDraft(d => ({ ...d, description: e.target.value }))}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">
                      Prompt principal
                    </label>
                    <Textarea
                      rows={4}
                      placeholder="Instructions principales pour l'agent..."
                      value={draft.prompt}
                      onChange={(e) => setDraft(d => ({ ...d, prompt: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">
                      Prompt système (optionnel)
                    </label>
                    <Textarea
                      rows={4}
                      placeholder="Instructions système pour définir le comportement..."
                      value={draft.systemPrompt || ''}
                      onChange={(e) => setDraft(d => ({ ...d, systemPrompt: e.target.value }))}
                    />
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">
                    Instructions supplémentaires
                  </label>
                  <Textarea
                    rows={2}
                    placeholder="Consignes spécifiques, ton, style, contraintes..."
                    value={draft.instructions || ''}
                    onChange={(e) => setDraft(d => ({ ...d, instructions: e.target.value }))}
                  />
                </div>
              </TabsContent>

              {/* Advanced Parameters */}
              <TabsContent value="advanced" className="space-y-4">
                <h4 className="text-sm font-semibold text-gray-900">Paramètres du modèle</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">
                      Température ({draft.temperature || 0.7})
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="2"
                      step="0.1"
                      value={draft.temperature || 0.7}
                      onChange={(e) => setDraft(d => ({ ...d, temperature: parseFloat(e.target.value) }))}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Précis</span>
                      <span>Créatif</span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">
                      Tokens max
                    </label>
                    <Input
                      type="number"
                      min="100"
                      max={getModelInfo(draft.model || 'gpt-3.5-turbo').maxTokens}
                      value={draft.maxTokens || 2000}
                      onChange={(e) => setDraft(d => ({ ...d, maxTokens: parseInt(e.target.value) }))}
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">
                      Format de réponse
                    </label>
                    <select
                      value={draft.responseFormat || 'text'}
                      onChange={(e) => setDraft(d => ({ ...d, responseFormat: e.target.value as 'text' | 'json' | 'markdown' }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                      <option value="text">Texte</option>
                      <option value="markdown">Markdown</option>
                      <option value="json">JSON</option>
                    </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">
                      Top P ({draft.topP || 0.9})
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={draft.topP || 0.9}
                      onChange={(e) => setDraft(d => ({ ...d, topP: parseFloat(e.target.value) }))}
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">
                      Fenêtre de contexte
                    </label>
                    <Input
                      type="number"
                      min="1000"
                      max="32000"
                      value={draft.contextWindow || 4000}
                      onChange={(e) => setDraft(d => ({ ...d, contextWindow: parseInt(e.target.value) }))}
                    />
                  </div>
                </div>
                
                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="memoryEnabled"
                      checked={draft.memoryEnabled || false}
                      onChange={(e) => setDraft(d => ({ ...d, memoryEnabled: e.target.checked }))}
                      className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                    />
                    <label htmlFor="memoryEnabled" className="text-sm text-gray-700">
                      Activer la mémoire conversationnelle
                    </label>
                  </div>
                </div>
              </TabsContent>

              {/* Tools & Variables */}
              <TabsContent value="tools" className="space-y-6">
                {/* Tools */}
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-gray-900">Outils disponibles</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {AVAILABLE_TOOLS.map(tool => (
                      <div key={tool.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                        <input
                          type="checkbox"
                          id={tool.id}
                          checked={(draft.tools || []).includes(tool.id)}
                          onChange={(e) => {
                            const tools = draft.tools || [];
                            if (e.target.checked) {
                              setDraft(d => ({ ...d, tools: [...tools, tool.id] }));
                            } else {
                              setDraft(d => ({ ...d, tools: tools.filter(t => t !== tool.id) }));
                            }
                          }}
                          className="mt-1 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                        />
                        <div>
                          <label htmlFor={tool.id} className="text-sm font-medium text-gray-900 cursor-pointer">
                            {tool.name}
                          </label>
                          <p className="text-xs text-gray-500">{tool.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Variables */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-gray-900">Variables d'entrée</h4>
                    <Button type="button" variant="outline" size="sm" onClick={addVariable}>
                      <Plus className="w-4 h-4 mr-1" /> Ajouter
                    </Button>
                  </div>
                  
                  {(draft.variables || []).map((variable, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-3 p-3 border rounded-lg">
                      <Input
                        placeholder="Nom de la variable"
                        value={variable.name}
                        onChange={(e) => updateVariable(index, 'name', e.target.value)}
                      />
                      <select
                        value={variable.type}
                        onChange={(e) => updateVariable(index, 'type', e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                      >
                        <option value="string">String</option>
                        <option value="number">Number</option>
                        <option value="boolean">Boolean</option>
                        <option value="array">Array</option>
                        <option value="object">Object</option>
                      </select>
                      <Input
                        placeholder="Description"
                        value={variable.description}
                        onChange={(e) => updateVariable(index, 'description', e.target.value)}
                      />
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={variable.required}
                          onChange={(e) => updateVariable(index, 'required', e.target.checked)}
                          className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                        />
                        <label className="text-sm text-gray-700">Requis</label>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => removeVariable(index)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              {/* Examples */}
              <TabsContent value="examples" className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-gray-900">Exemples (few-shot learning)</h4>
                  <Button type="button" variant="outline" size="sm" onClick={addExample}>
                    <Plus className="w-4 h-4 mr-1" /> Ajouter exemple
                  </Button>
                </div>
                
                {(draft.examples || []).map((example, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3 border rounded-lg">
                    <div>
                      <label className="text-xs font-medium text-gray-700 block mb-1">Entrée</label>
                      <Textarea
                        rows={2}
                        placeholder="Exemple d'entrée..."
                        value={example.input}
                        onChange={(e) => updateExample(index, 'input', e.target.value)}
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-medium text-gray-700">Sortie attendue</label>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => removeExample(index)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                      <Textarea
                        rows={2}
                        placeholder="Réponse attendue..."
                        value={example.output}
                        onChange={(e) => updateExample(index, 'output', e.target.value)}
                      />
                    </div>
                  </div>
                ))}
              </TabsContent>
            </Tabs>
            
            <div className="flex gap-3 pt-4">
              <Button onClick={handleSaveAgent} className="bg-teal-500 hover:bg-teal-600">
                {draft.id ? 'Mettre à jour' : 'Créer l\'agent'}
              </Button>
              <Button variant="outline" onClick={cancelEdit}>
                Annuler
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Agents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {agents.map((agent) => (
          <Card key={agent.id} className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                    <Bot className="w-5 h-5 text-teal-600" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-semibold">{agent.name}</CardTitle>
                    <p className="text-sm text-gray-500">{agent.role}</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => edit(agent)}>
                  <Settings className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="flex items-center space-x-2 mt-2">
                <Badge className={getStatusColor(agent.status || 'active')}>
                  {agent.status === 'active' ? 'Actif' : 'Inactif'}
                </Badge>
                {agent.category && (
                  <Badge variant="outline" className="text-xs">
                    {agent.category}
                  </Badge>
                )}
                <Badge variant="outline" className="text-xs">
                  {getModelInfo(agent.model).name}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-3">
                {agent.description && (
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {agent.description}
                  </p>
                )}
                
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Configuration:</p>
                  <div className="text-xs text-gray-700 space-y-1">
                    <div>Température: {agent.temperature || 0.7}</div>
                    <div>Max tokens: {agent.maxTokens || 2000}</div>
                    <div>Format: {agent.responseFormat || 'text'}</div>
                    {agent.tools && agent.tools.length > 0 && (
                      <div>Outils: {agent.tools.length}</div>
                    )}
                  </div>
                </div>
                
                <div className="flex space-x-2 pt-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => edit(agent)}
                  >
                    <Edit3 className="w-3 h-3 mr-1" />
                    Éditer
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => duplicateAgent(agent)}
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                  <Button
                    size="sm"
                    className={agent.status === 'active' 
                      ? 'bg-red-500 hover:bg-red-600' 
                      : 'bg-teal-500 hover:bg-teal-600'
                    }
                    onClick={() => toggleStatus(agent.id)}
                  >
                    {agent.status === 'active' ? (
                      <Pause className="w-3 h-3 mr-1" />
                    ) : (
                      <Play className="w-3 h-3 mr-1" />
                    )}
                    {agent.status === 'active' ? 'Arrêter' : 'Activer'}
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => remove(agent.id)}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Empty State */}
      {agents.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Bot className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun agent configuré</h3>
            <p className="text-gray-500 mb-6">Créez votre premier agent IA pour automatiser vos tâches de contenu.</p>
            <Button 
              onClick={() => setShowCreateForm(true)}
              className="bg-teal-500 hover:bg-teal-600"
            >
              <Plus className="w-4 h-4 mr-2" />
              Créer un agent
            </Button>
          </CardContent>
        </Card>
      )}
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <Bot className="w-5 h-5 text-blue-500 mt-0.5" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">Agents IA Avancés</h3>
            <div className="text-sm text-blue-700 mt-1 space-y-1">
              <p>• Choisissez parmi {AI_MODELS.length} modèles IA (OpenAI, Anthropic, Google, Mistral)</p>
              <p>• Configurez la température, tokens max, format de réponse et outils</p>
              <p>• Définissez des variables d'entrée et exemples pour un meilleur apprentissage</p>
              <p>• Testez vos agents avant de les déployer en production</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}



