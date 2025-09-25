import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Textarea } from '../components/ui/textarea';
import { ScrollArea } from '../components/ui/scroll-area';
import { Separator } from '../components/ui/separator';
import {
  Play,
  Pause,
  Settings,
  Eye,
  Edit,
  Loader2,
  FileText,
  Save,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Clock,
  Zap,
  Brain,
  Target
} from 'lucide-react';

interface WorkflowAgent {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'inactive' | 'running';
  prompt: string;
  model: string;
  provider: string;
  lastRun?: Date;
  successRate?: number;
}

interface WorkflowExecution {
  id: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  startTime: Date;
  endTime?: Date;
  results: {
    agentId: string;
    output?: string;
    error?: string;
    duration?: number;
  }[];
}

interface AIModel {
  provider: string;
  models: string[];
}

// Configuration des modèles IA disponibles
const AI_MODELS: AIModel[] = [
  {
    provider: 'OpenAI',
    models: ['gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo']
  },
  {
    provider: 'Anthropic',
    models: ['claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku']
  },
  {
    provider: 'Perplexity',
    models: ['llama-3-sonar-large', 'llama-3-sonar-small', 'llama-3-70b-instruct']
  }
];

export default function AdminWorkflow() {
  const [agents, setAgents] = useState<WorkflowAgent[]>([
    {
      id: 'search-content',
      name: 'Agent Search Content',
      description: 'Scanne votre site et propose des sujets d\'articles',
      status: 'active',
      provider: 'Perplexity',
      model: 'llama-3-sonar-large',
      prompt: `Tu es un agent spécialisé dans l'analyse de contenu web et la proposition de sujets d'articles.

Tâches :
1. Scanner le site web fourni
2. Analyser le contenu existant
3. Identifier les lacunes et opportunités
4. Proposer 3-5 sujets d'articles pertinents
5. Fournir un brief pour chaque sujet avec :
   - Titre suggéré
   - Mots-clés cibles
   - Angle d'approche
   - Structure recommandée

Retourne un JSON structuré avec les suggestions.`,
      successRate: 92
    },
    {
      id: 'ghostwriter',
      name: 'Agent Ghostwriter',
      description: 'Rédige des articles optimisés SEO basés sur les briefs',
      status: 'active',
      provider: 'OpenAI',
      model: 'gpt-4-turbo',
      prompt: `Tu es un ghostwriter expert en rédaction de contenu web optimisé SEO.

Mission :
1. Prendre le brief fourni par l'agent Search
2. Rédiger un article complet et engageant
3. Optimiser pour les mots-clés cibles
4. Structurer avec des H1, H2, H3 appropriés
5. Inclure un appel à l'action pertinent

Style : Professionnel mais accessible, ton engageant, expertise démontrée.
Format : Markdown avec métadonnées SEO.`,
      successRate: 88
    },
    {
      id: 'reviewer',
      name: 'Agent Reviewer',
      description: 'Révise et améliore la qualité des articles',
      status: 'active',
      provider: 'Anthropic',
      model: 'claude-3-opus',
      prompt: `Tu es un relecteur expert spécialisé dans l'amélioration de contenu.

Responsabilités :
1. Analyser la qualité de l'article
2. Vérifier la cohérence et la logique
3. Optimiser le SEO et la lisibilité
4. Suggérer des améliorations
5. Corriger orthographe et grammaire

Critères d'évaluation :
- Clarté et engagement
- Optimisation SEO
- Qualité rédactionnelle
- Pertinence du contenu

Retourne l'article révisé avec un score de qualité.`,
      successRate: 95
    }
  ]);

  const [currentExecution, setCurrentExecution] = useState<WorkflowExecution | null>(null);
  const [siteUrl, setSiteUrl] = useState('https://magicpath.ai');
  const [activeTab, setActiveTab] = useState('workflow');
  const [editingAgent, setEditingAgent] = useState<string | null>(null);

  // Lancer le workflow complet
  const handleLaunchWorkflow = async () => {
    const execution: WorkflowExecution = {
      id: `exec-${Date.now()}`,
      status: 'running',
      startTime: new Date(),
      results: []
    };

    setCurrentExecution(execution);

    try {
      // Étape 1: Search Content
      setAgents(prev => prev.map(a =>
        a.id === 'search-content' ? {...a, status: 'running'} : a
      ));

      await new Promise(resolve => setTimeout(resolve, 2000));

      const searchResult = {
        agentId: 'search-content',
        output: `Sujets suggérés pour ${siteUrl}:
1. "Les 10 tendances IA à surveiller en 2025"
2. "Comment automatiser votre workflow de contenu"
3. "ROI des solutions IA pour PME"`,
        duration: 2000
      };

      execution.results.push(searchResult);
      setCurrentExecution({...execution});

      setAgents(prev => prev.map(a =>
        a.id === 'search-content' ? {...a, status: 'active', lastRun: new Date()} : a
      ));

      // Étape 2: Ghostwriter
      setAgents(prev => prev.map(a =>
        a.id === 'ghostwriter' ? {...a, status: 'running'} : a
      ));

      await new Promise(resolve => setTimeout(resolve, 3000));

      const ghostwriterResult = {
        agentId: 'ghostwriter',
        output: `Article rédigé: "Les 10 tendances IA à surveiller en 2025"

# Les 10 tendances IA à surveiller en 2025

L'intelligence artificielle continue sa révolution...

## 1. L'IA générative devient mainstream
## 2. Automatisation des workflows créatifs
## 3. IA conversationnelle avancée

[Article complet de 2000 mots...]`,
        duration: 3000
      };

      execution.results.push(ghostwriterResult);
      setCurrentExecution({...execution});

      setAgents(prev => prev.map(a =>
        a.id === 'ghostwriter' ? {...a, status: 'active', lastRun: new Date()} : a
      ));

      // Étape 3: Reviewer
      setAgents(prev => prev.map(a =>
        a.id === 'reviewer' ? {...a, status: 'running'} : a
      ));

      await new Promise(resolve => setTimeout(resolve, 2000));

      const reviewResult = {
        agentId: 'reviewer',
        output: `Article révisé avec score qualité: 94/100

Améliorations apportées:
✅ Structure H1/H2/H3 optimisée
✅ Mots-clés mieux intégrés
✅ CTA renforcé
✅ Lisibilité améliorée

Article prêt pour publication!`,
        duration: 2000
      };

      execution.results.push(reviewResult);

      // Finalisation
      execution.status = 'completed';
      execution.endTime = new Date();
      setCurrentExecution({...execution});

      setAgents(prev => prev.map(a =>
        a.id === 'reviewer' ? {...a, status: 'active', lastRun: new Date()} : a
      ));

    } catch (error) {
      execution.status = 'failed';
      execution.endTime = new Date();
      setCurrentExecution({...execution});

      setAgents(prev => prev.map(a => ({...a, status: 'active'})));
    }
  };

  // Mettre à jour la configuration d'un agent
  const updateAgent = (agentId: string, updates: Partial<WorkflowAgent>) => {
    setAgents(prev => prev.map(agent =>
      agent.id === agentId ? {...agent, ...updates} : agent
    ));
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'running': return 'bg-blue-100 text-blue-800';
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getExecutionStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600';
      case 'running': return 'text-blue-600';
      case 'failed': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header avec bouton de lancement */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Workflow de Génération d'Articles</h1>
          <p className="text-gray-600 mt-1">Gérez et exécutez votre pipeline de création de contenu IA</p>
        </div>
        <div className="flex items-center space-x-3">
          <Input
            placeholder="URL du site à analyser"
            value={siteUrl}
            onChange={(e) => setSiteUrl(e.target.value)}
            className="w-80"
          />
          <Button
            onClick={handleLaunchWorkflow}
            disabled={currentExecution?.status === 'running'}
            className="bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 text-white px-6"
          >
            {currentExecution?.status === 'running' ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                En cours...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 mr-2" />
                Lancer le Workflow
              </>
            )}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="workflow">Workflow</TabsTrigger>
          <TabsTrigger value="agents">Agents</TabsTrigger>
          <TabsTrigger value="results">Résultats</TabsTrigger>
        </TabsList>

        {/* Onglet Workflow */}
        <TabsContent value="workflow" className="space-y-6">
          {/* Pipeline visuel */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="w-5 h-5 mr-2 text-teal-600" />
                Pipeline de Création de Contenu
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-6 bg-gradient-to-r from-blue-50 to-teal-50 rounded-lg">
                {agents.map((agent, index) => (
                  <div key={agent.id} className="flex items-center">
                    <div className="text-center">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
                        agent.status === 'running' ? 'bg-blue-500 text-white animate-pulse' :
                        agent.status === 'active' ? 'bg-green-500 text-white' :
                        'bg-gray-300 text-gray-600'
                      }`}>
                        {agent.status === 'running' ? (
                          <Loader2 className="w-6 h-6 animate-spin" />
                        ) : (
                          <Brain className="w-6 h-6" />
                        )}
                      </div>
                      <p className="text-xs font-medium text-gray-800">{agent.name.replace('Agent ', '')}</p>
                      <Badge className={`text-xs mt-1 ${getStatusBadgeColor(agent.status)}`}>
                        {agent.status === 'running' ? 'En cours' :
                         agent.status === 'active' ? 'Actif' : 'Inactif'}
                      </Badge>
                    </div>
                    {index < agents.length - 1 && (
                      <div className="mx-4 h-0.5 w-16 bg-gray-300"></div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Status d'exécution en temps réel */}
          {currentExecution && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="w-5 h-5 mr-2 text-blue-600" />
                  Exécution en Cours
                  <Badge className={`ml-2 ${getStatusBadgeColor(currentExecution.status)}`}>
                    {currentExecution.status === 'running' ? 'En cours' :
                     currentExecution.status === 'completed' ? 'Terminé' : 'Échec'}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Démarré: {currentExecution.startTime.toLocaleTimeString()}</span>
                    {currentExecution.endTime && (
                      <span>Terminé: {currentExecution.endTime.toLocaleTimeString()}</span>
                    )}
                  </div>

                  <div className="space-y-3">
                    {currentExecution.results.map((result, index) => (
                      <div key={index} className="border-l-4 border-green-400 pl-4 py-2 bg-green-50 rounded-r">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-green-800">
                            {agents.find(a => a.id === result.agentId)?.name}
                          </h4>
                          <span className="text-xs text-green-600">
                            {result.duration}ms
                          </span>
                        </div>
                        <pre className="text-xs text-green-700 whitespace-pre-wrap">
                          {result.output}
                        </pre>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Onglet Agents */}
        <TabsContent value="agents" className="space-y-6">
          <div className="grid gap-6">
            {agents.map((agent) => (
              <Card key={agent.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center">
                        <Brain className="w-5 h-5 mr-2 text-purple-600" />
                        {agent.name}
                      </CardTitle>
                      <p className="text-gray-600 mt-1">{agent.description}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusBadgeColor(agent.status)}>
                        {agent.status}
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingAgent(editingAgent === agent.id ? null : agent.id)}
                      >
                        {editingAgent === agent.id ? <Eye className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <Label>Fournisseur IA</Label>
                      <Select
                        value={agent.provider}
                        onValueChange={(value) => updateAgent(agent.id, { provider: value })}
                        disabled={editingAgent !== agent.id}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {AI_MODELS.map(provider => (
                            <SelectItem key={provider.provider} value={provider.provider}>
                              {provider.provider}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Modèle</Label>
                      <Select
                        value={agent.model}
                        onValueChange={(value) => updateAgent(agent.id, { model: value })}
                        disabled={editingAgent !== agent.id}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {AI_MODELS.find(p => p.provider === agent.provider)?.models.map(model => (
                            <SelectItem key={model} value={model}>
                              {model}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {editingAgent === agent.id && (
                    <div className="space-y-4">
                      <div>
                        <Label>Prompt Système</Label>
                        <Textarea
                          value={agent.prompt}
                          onChange={(e) => updateAgent(agent.id, { prompt: e.target.value })}
                          rows={8}
                          className="mt-1"
                        />
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          onClick={() => setEditingAgent(null)}
                        >
                          Annuler
                        </Button>
                        <Button
                          onClick={() => setEditingAgent(null)}
                          className="bg-teal-500 hover:bg-teal-600"
                        >
                          <Save className="w-4 h-4 mr-2" />
                          Sauvegarder
                        </Button>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-sm text-gray-500 mt-4">
                    <span>Taux de succès: {agent.successRate}%</span>
                    {agent.lastRun && (
                      <span>Dernière exécution: {agent.lastRun.toLocaleTimeString()}</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Onglet Résultats */}
        <TabsContent value="results" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="w-5 h-5 mr-2 text-green-600" />
                Derniers Articles Générés
              </CardTitle>
            </CardHeader>
            <CardContent>
              {currentExecution?.status === 'completed' ? (
                <div className="space-y-4">
                  {currentExecution.results.map((result, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">
                          {agents.find(a => a.id === result.agentId)?.name}
                        </h4>
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      </div>
                      <ScrollArea className="h-32">
                        <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                          {result.output}
                        </pre>
                      </ScrollArea>
                    </div>
                  ))}

                  <div className="flex justify-center pt-4">
                    <Button className="bg-teal-500 hover:bg-teal-600">
                      <FileText className="w-4 h-4 mr-2" />
                      Publier l'Article
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>Aucun article généré récemment</p>
                  <p className="text-sm">Lancez le workflow pour voir les résultats ici</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}