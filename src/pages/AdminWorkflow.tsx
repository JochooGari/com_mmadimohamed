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
import { AI_PROVIDERS } from '../lib/aiProviders';
import { Editor } from '@tinymce/tinymce-react';
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
import { Alert, AlertDescription } from '../components/ui/alert';
import { Trash2 } from 'lucide-react';

interface WorkflowAgent {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'inactive' | 'running';
  systemPrompt: string;
  userPrompt: string;
  contextPrompt: string;
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

// Utilisation des providers et modèles existants du projet
// Les AI_PROVIDERS sont importés de lib/aiProviders.ts

export default function AdminWorkflow() {
  const [agents, setAgents] = useState<WorkflowAgent[]>([
    {
      id: 'search-content',
      name: 'Agent Search Content',
      description: 'Scanne votre site et propose des sujets d\'articles',
      status: 'active',
      provider: 'perplexity',
      model: 'sonar-pro',
      systemPrompt: `Tu es un agent spécialisé dans l'analyse de contenu web et la recherche de sujets d'articles pertinents.

Ton expertise :
- Analyse approfondie de sites web
- Identification des gaps de contenu
- Recherche de tendances et opportunités
- Compréhension des besoins audience

Objectif : Proposer des sujets d'articles hautement pertinents et engageants.`,
      userPrompt: `Analyse le site web {siteUrl} et propose 5 sujets d'articles pertinents.

Pour chaque sujet, fournis :
1. Titre accrocheur
2. Mots-clés SEO principaux
3. Angle d'approche unique
4. Structure H1/H2/H3 suggérée
5. Points clés à aborder

Format : JSON structuré avec tous les détails.`,
      contextPrompt: `Site web à analyser : {siteUrl}
Secteur d'activité : {industry}
Audience cible : {audience}
Objectifs marketing : {goals}`,
      successRate: 92
    },
    {
      id: 'ghostwriter',
      name: 'Agent Ghostwriter',
      description: 'Rédige des articles optimisés SEO basés sur les briefs',
      status: 'active',
      provider: 'openai',
      model: 'gpt-4o',
      systemPrompt: `Tu es un ghostwriter expert en création de contenu web de haute qualité.

Tes spécialités :
- Rédaction SEO optimisée
- Storytelling engageant
- Adaptation du ton et style
- Structure claire et logique
- Appels à l'action efficaces

Objectif : Créer des articles qui captent l'attention et convertissent.`,
      userPrompt: `Rédige un article complet basé sur ce brief :
{contentBrief}

Exigences :
- 1500-2000 mots minimum
- Structure H1/H2/H3 optimisée
- Intégration naturelle des mots-clés
- Ton professionnel mais accessible
- CTA pertinent en fin d'article
- Format Markdown

Livre un article prêt à publier.`,
      contextPrompt: `Brief de l'article : {contentBrief}
Audience cible : {audience}
Mots-clés principaux : {keywords}
Objectif de conversion : {conversionGoal}`,
      successRate: 88
    },
    {
      id: 'reviewer',
      name: 'Agent Reviewer',
      description: 'Révise et améliore la qualité des articles',
      status: 'active',
      provider: 'anthropic',
      model: 'claude-3-opus',
      systemPrompt: `Tu es un éditeur expert spécialisé dans l'amélioration et la révision de contenu.

Tes compétences :
- Analyse qualitative approfondie
- Optimisation SEO avancée
- Correction linguistique
- Amélioration de la lisibilité
- Évaluation de l'engagement

Objectif : Transformer chaque article en contenu d'excellence.`,
      userPrompt: `Révise et améliore cet article :
{article}

Tâches de révision :
1. Corriger orthographe/grammaire
2. Optimiser la structure H1/H2/H3
3. Améliorer la lisibilité
4. Renforcer les mots-clés SEO
5. Polir le style et le ton
6. Évaluer la qualité globale (/100)

Retourne l'article révisé avec ton analyse détaillée.`,
      contextPrompt: `Article à réviser : {article}
Critères qualité : clarté, SEO, engagement, structure
Score cible : minimum 90/100
Mots-clés à optimiser : {keywords}`,
      successRate: 95
    }
  ]);

  const [currentExecution, setCurrentExecution] = useState<WorkflowExecution | null>(null);
  const [siteUrl, setSiteUrl] = useState('https://magicpath.ai');
  const [activeTab, setActiveTab] = useState('workflow');
  const [editingAgent, setEditingAgent] = useState<string | null>(null);
  const [finalArticle, setFinalArticle] = useState<{title: string; content: string} | null>(null);
  // Load persisted prompts for admin workflow too
  useEffect(() => { (async () => {
    try {
      const r = await fetch('/api/storage?agent=workflow&type=prompts');
      if (r.ok) {
        const data = await r.json();
        setAgents(prev => prev.map(a => ({ ...a, userPrompt: data?.[a.id]?.prompt ?? a.userPrompt })));
      }
    } catch {}
  })(); }, []);
  // Sujets personnalisés
  const [customTopics, setCustomTopics] = useState<{ title:string; keywords:string[]; angle:string; audience:string }[]>([]);
  const [newTopic, setNewTopic] = useState<{ title:string; keywords:string[]; angle:string; audience:string }>({ title:'', keywords:[], angle:'', audience:'' });

  // Lancer le workflow complet avec API réelle
  const handleLaunchWorkflow = async () => {
    if (!siteUrl.trim()) {
      alert('Veuillez saisir une URL de site web à analyser');
      return;
    }

    const execution: WorkflowExecution = {
      id: `exec-${Date.now()}`,
      status: 'running',
      startTime: new Date(),
      results: []
    };

    setCurrentExecution(execution);

    try {
      // Préparer la configuration des agents
      const searchA = agents.find(a=> a.id==='search-content');
      const ghostA = agents.find(a=> a.id==='ghostwriter');
      const reviewA = agents.find(a=> a.id==='reviewer');
      const workflowConfig = {
        searchAgent: { provider: searchA?.provider, model: searchA?.model },
        ghostwriterAgent: { provider: ghostA?.provider, model: ghostA?.model },
        reviewerAgent: { provider: reviewA?.provider, model: reviewA?.model }
      };

      // Appel à l'API réelle
      setAgents(prev => prev.map(a => ({...a, status: 'running'})));

      const response = await fetch('/api/n8n/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          workflowId: 'content-agents-workflow',
          data: {
            siteUrl,
            customTopics: customTopics.length ? customTopics : undefined
          },
          config: workflowConfig
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Erreur réseau inconnue' }));
        throw new Error(`Erreur API (${response.status}): ${errorData.error || response.statusText}`);
      }

      const result = await response.json();

      // Traiter les résultats réels
      if (result.steps && result.steps.length > 0) {
        result.steps.forEach((step: any) => {
          execution.results.push({
            agentId: step.nodeId,
            output: step.output,
            error: step.error,
            duration: step.duration || 0,
            debug: step.debug || null,
            completedAt: step.completedAt || null
          });
        });

        execution.status = result.status === 'completed' ? 'completed' : 'failed';
        execution.endTime = new Date();

        // Extraire l'article final du dernier agent (reviewer)
        const finalStep = result.steps[result.steps.length - 1];
        if (finalStep && finalStep.output && execution.status === 'completed') {
          // Tenter d'extraire le titre et le contenu
          const content = finalStep.output;
          let title = 'Article généré';

          // Extraire le titre du markdown (première ligne # ou H1)
          const titleMatch = content.match(/^#\s+(.+)$/m);
          if (titleMatch) {
            title = titleMatch[1];
          }

          setFinalArticle({ title, content });
        }
      } else {
        throw new Error('Aucun résultat retourné par le workflow');
      }

      setCurrentExecution({...execution});
      setAgents(prev => prev.map(a => ({...a, status: 'active', lastRun: new Date()})));

    } catch (error: any) {
      console.error('Erreur workflow:', error);

      execution.status = 'failed';
      execution.endTime = new Date();
      execution.results.push({
        agentId: 'error',
        error: error.message || 'Erreur inconnue lors de l\'exécution du workflow',
        duration: 0
      });

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

  const saveAllPrompts = async () => {
    const mapping: Record<string, { prompt: string }> = {};
    agents.forEach(a => { mapping[a.id] = { prompt: a.userPrompt || '' }; });
    await fetch('/api/storage', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ action:'save_workflow_prompts', data: mapping }) }).catch(()=>{});
  };

  const loadAllPrompts = async () => {
    try {
      const r = await fetch('/api/storage?agent=workflow&type=prompts');
      if (!r.ok) return;
      const data = await r.json();
      setAgents(prev => prev.map(a => ({ ...a, userPrompt: data?.[a.id]?.prompt ?? a.userPrompt })));
    } catch {}
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
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="workflow">Workflow</TabsTrigger>
          <TabsTrigger value="topics">Idées de textes</TabsTrigger>
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
                      <div key={index} className={`border-l-4 pl-4 py-2 rounded-r ${
                        result.error
                          ? 'border-red-400 bg-red-50'
                          : 'border-green-400 bg-green-50'
                      }`}>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className={`font-medium ${
                            result.error ? 'text-red-800' : 'text-green-800'
                          }`}>
                            {result.agentId === 'error' ? 'Erreur Workflow' :
                             agents.find(a => a.id === result.agentId)?.name || result.agentId}
                          </h4>
                          <div className="flex items-center space-x-2">
                            {result.error ? (
                              <AlertCircle className="w-4 h-4 text-red-500" />
                            ) : (
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            )}
                            <span className={`text-xs ${
                              result.error ? 'text-red-600' : 'text-green-600'
                            }`}>
                              {result.duration || 0}ms
                            </span>
                          </div>
                        </div>
                        {result.error ? (
                          <div className="text-xs text-red-700 bg-red-100 p-2 rounded">
                            <strong>Erreur:</strong> {result.error}
                          </div>
                        ) : (
                          <ScrollArea className="h-24">
                            <pre className="text-xs text-green-700 whitespace-pre-wrap">
                              {result.output}
                            </pre>
                          </ScrollArea>
                        )}
                        {result.debug && (
                          <div className="mt-2">
                            <div className="text-[11px] text-gray-500 mb-1">{result.debug.provider}/{result.debug.model}</div>
                            <ScrollArea className="h-24">
                              <pre className="text-[11px] whitespace-pre-wrap bg-white p-2 rounded border">
                                {Array.isArray(result.debug.raw) ? result.debug.raw.join('\n\n---\n\n') : String(result.debug.raw)}
                              </pre>
                            </ScrollArea>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Onglet Idées de textes */}
        <TabsContent value="topics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Vos sujets personnalisés</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {customTopics.length === 0 && (
                <Alert>
                  <AlertDescription>
                    Ajoutez ici vos idées (titre, mots-clés, angle, audience). Si vide, l'agent analysera votre site pour proposer des sujets.
                  </AlertDescription>
                </Alert>
              )}
              {customTopics.length > 0 && (
                <div className="space-y-2">
                  {customTopics.map((t, i)=> (
                    <div key={i} className="flex items-center justify-between border rounded p-3">
                      <div>
                        <div className="font-medium">{t.title}</div>
                        <div className="text-xs text-gray-600">{t.keywords.join(', ')} • {t.audience}</div>
                      </div>
                      <Button variant="ghost" size="sm" onClick={()=> setCustomTopics(prev=> prev.filter((_,idx)=> idx!==i))}><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  ))}
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <Label>Titre</Label>
                  <Input value={newTopic.title} onChange={e=> setNewTopic({...newTopic, title:e.target.value})} placeholder="Ex: Étude de cas CFO" />
                </div>
                <div>
                  <Label>Mots-clés (séparés par des virgules)</Label>
                  <Input value={newTopic.keywords.join(', ')} onChange={e=> setNewTopic({...newTopic, keywords: e.target.value.split(',').map(x=> x.trim()).filter(Boolean)})} placeholder="cfo, power bi, automatisation" />
                </div>
                <div>
                  <Label>Angle</Label>
                  <Input value={newTopic.angle} onChange={e=> setNewTopic({...newTopic, angle:e.target.value})} placeholder="Guide pratique / ROI / Benchmark" />
                </div>
                <div>
                  <Label>Audience</Label>
                  <Input value={newTopic.audience} onChange={e=> setNewTopic({...newTopic, audience:e.target.value})} placeholder="DAF, CFO, PME" />
                </div>
              </div>
              <div>
                <Button onClick={()=> {
                  if (!newTopic.title.trim()) return;
                  setCustomTopics(prev=> [...prev, { ...newTopic }]);
                  setNewTopic({ title:'', keywords:[], angle:'', audience:'' });
                }}>Ajouter</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onglet Agents */}
        <TabsContent value="agents" className="space-y-6">
          <div className="flex items-center justify-end gap-2">
            <Button variant="outline" size="sm" onClick={loadAllPrompts}>Charger prompts sauvegardés</Button>
            <Button variant="outline" size="sm" onClick={saveAllPrompts}>Sauvegarder tous les prompts</Button>
          </div>
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
                        onValueChange={(value) => {
                          // Quand on change de provider, on met le premier modèle disponible
                          const newProvider = AI_PROVIDERS.find(p => p.id === value);
                          const firstModel = newProvider?.models[0] || '';
                          updateAgent(agent.id, { provider: value, model: firstModel });
                        }}
                        disabled={editingAgent !== agent.id}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {AI_PROVIDERS.map(provider => (
                            <SelectItem key={provider.id} value={provider.id}>
                              {provider.name}
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
                          {AI_PROVIDERS.find(p => p.id === agent.provider)?.models.map(model => (
                            <SelectItem key={model} value={model}>
                              {model}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {editingAgent === agent.id && (
                    <div className="space-y-6">
                      <Tabs defaultValue="system" className="w-full">
                        <TabsList className="grid w-full grid-cols-3">
                          <TabsTrigger value="system">Prompt Système</TabsTrigger>
                          <TabsTrigger value="user">Prompt Utilisateur</TabsTrigger>
                          <TabsTrigger value="context">Prompt Contexte</TabsTrigger>
                        </TabsList>

                        <TabsContent value="system" className="space-y-4">
                          <div>
                            <Label className="text-sm font-medium">
                              Prompt Système - Personnalité et Expertise de l'Agent
                            </Label>
                            <p className="text-xs text-gray-500 mb-2">
                              Définit qui est l'agent, son expertise et ses objectifs généraux
                            </p>
                            <Textarea
                              value={agent.systemPrompt}
                              onChange={(e) => updateAgent(agent.id, { systemPrompt: e.target.value })}
                              rows={6}
                              className="mt-1"
                              placeholder="Tu es un expert en..."
                            />
                          </div>
                        </TabsContent>

                        <TabsContent value="user" className="space-y-4">
                          <div>
                            <Label className="text-sm font-medium">
                              Prompt Utilisateur - Instructions et Tâches Spécifiques
                            </Label>
                            <p className="text-xs text-gray-500 mb-2">
                              Instructions précises sur ce que l'agent doit faire, format de sortie attendu
                            </p>
                            <Textarea
                              value={agent.userPrompt}
                              onChange={(e) => updateAgent(agent.id, { userPrompt: e.target.value })}
                              rows={6}
                              className="mt-1"
                              placeholder="Analyse {input} et produis..."
                            />
                          </div>
                        </TabsContent>

                        <TabsContent value="context" className="space-y-4">
                          <div>
                            <Label className="text-sm font-medium">
                              Prompt Contexte - Variables et Contexte Dynamique
                            </Label>
                            <p className="text-xs text-gray-500 mb-2">
                              Variables qui seront injectées dynamiquement dans les prompts
                            </p>
                            <Textarea
                              value={agent.contextPrompt}
                              onChange={(e) => updateAgent(agent.id, { contextPrompt: e.target.value })}
                              rows={4}
                              className="mt-1"
                              placeholder="Variable 1: {value1}
Variable 2: {value2}
Paramètre: {param}"
                            />
                          </div>
                        </TabsContent>
                      </Tabs>

                      <div className="flex justify-end space-x-2 pt-4">
                        <Button
                          variant="outline"
                          onClick={() => setEditingAgent(null)}
                        >
                          Annuler
                        </Button>
                        <Button
                          onClick={() => { setEditingAgent(null); saveAllPrompts(); }}
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
          {finalArticle ? (
            <div className="space-y-6">
              {/* Titre de l'article */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="w-5 h-5 mr-2 text-green-600" />
                    Article Généré : {finalArticle.title}
                  </CardTitle>
                </CardHeader>
              </Card>

              {/* Preview TinyMCE */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Preview de l'Article</CardTitle>
                    <div className="flex items-center space-x-2">
                      <Badge className="bg-green-100 text-green-800">
                        Prêt à publier
                      </Badge>
                      <Button
                        size="sm"
                        className="bg-teal-500 hover:bg-teal-600"
                        onClick={() => {
                          // TODO: Intégrer avec le système de publication
                          alert('Fonctionnalité de publication à intégrer');
                        }}
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        Publier
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-lg overflow-hidden">
                    <Editor
                      apiKey="your-tinymce-api-key" // Remplacez par votre clé TinyMCE
                      value={finalArticle.content}
                      onEditorChange={(content) => setFinalArticle(prev =>
                        prev ? {...prev, content} : null
                      )}
                      init={{
                        height: 500,
                        menubar: false,
                        plugins: [
                          'advlist', 'autolink', 'lists', 'link', 'image', 'charmap',
                          'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                          'insertdatetime', 'media', 'table', 'preview', 'help', 'wordcount'
                        ],
                        toolbar: 'undo redo | blocks | ' +
                          'bold italic forecolor | alignleft aligncenter ' +
                          'alignright alignjustify | bullist numlist outdent indent | ' +
                          'removeformat | help',
                        content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
                        paste_as_text: false,
                        paste_auto_cleanup_on_paste: true,
                        convert_urls: false,
                        relative_urls: false,
                      }}
                    />
                  </div>

                  {/* Statistiques de l'article */}
                  <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center space-x-4">
                      <span>
                        Mots: {finalArticle.content.split(/\s+/).filter(w => w.length > 0).length}
                      </span>
                      <span>
                        Caractères: {finalArticle.content.length}
                      </span>
                      <span>
                        Temps de lecture: ~{Math.ceil(finalArticle.content.split(/\s+/).length / 200)} min
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">Article SEO</Badge>
                      <Badge variant="outline">IA Optimisé</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Détails de l'exécution */}
              {currentExecution && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Détails de Génération</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <Label className="text-gray-500">Durée totale</Label>
                        <p className="font-medium">
                          {currentExecution.endTime && currentExecution.startTime
                            ? `${Math.round((currentExecution.endTime.getTime() - currentExecution.startTime.getTime()) / 1000)}s`
                            : 'En cours...'}
                        </p>
                      </div>
                      <div>
                        <Label className="text-gray-500">Agents utilisés</Label>
                        <p className="font-medium">{currentExecution.results.length} agents</p>
                      </div>
                      <div>
                        <Label className="text-gray-500">Statut</Label>
                        <Badge className={`${getStatusBadgeColor(currentExecution.status)}`}>
                          {currentExecution.status === 'completed' ? 'Terminé' :
                           currentExecution.status === 'running' ? 'En cours' : 'Échec'}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : currentExecution?.status === 'failed' ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-red-600">
                  <AlertCircle className="w-5 h-5 mr-2" />
                  Erreur de Génération d'Article
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="font-medium text-red-800 mb-2">Le workflow a échoué</h4>
                  {currentExecution.results.map((result, index) => (
                    result.error && (
                      <div key={index} className="text-sm text-red-700 mb-2">
                        <strong>{result.agentId === 'error' ? 'Erreur générale' :
                                agents.find(a => a.id === result.agentId)?.name}:</strong> {result.error}
                      </div>
                    )
                  ))}
                  <div className="mt-4">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setCurrentExecution(null);
                        setFinalArticle(null);
                      }}
                      className="text-red-600 border-red-300 hover:bg-red-50"
                    >
                      Réessayer
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-gray-400" />
                  Aucun Article Généré
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium mb-2">Aucun article généré récemment</p>
                  <p className="text-sm mb-6">Lancez le workflow pour générer un article avec vos agents IA</p>
                  <Button
                    onClick={() => setActiveTab('workflow')}
                    className="bg-teal-500 hover:bg-teal-600"
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    Lancer le Workflow
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}