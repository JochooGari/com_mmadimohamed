import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Play, Pause, Settings, Eye, Edit, Save, AlertCircle, CheckCircle, Plus, Trash2 } from 'lucide-react';

interface WorkflowAgent {
  id: string;
  name: string;
  description: string;
  provider: 'perplexity' | 'openai' | 'anthropic';
  model: string;
  status: 'active' | 'inactive';
  prompt: string;
  lastRun?: Date;
  successRate?: number;
}

interface WorkflowConfig {
  siteUrl: string;
  targetScores: {
    seoMinimum: number;
    geoMinimum: number;
  };
  maxIterations: number;
  apiKeys: {
    perplexity: string;
    openai: string;
    anthropic: string;
  };
}

interface WorkflowExecution {
  id: string;
  workflowId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  startTime: Date;
  endTime?: Date;
  steps: any[];
  output?: any;
  error?: string;
}

interface CustomTopic {
  title: string;
  keywords: string[];
  angle: string;
  audience: string;
  sources: string[];
}

export default function WorkflowPage() {
  const [config, setConfig] = useState<WorkflowConfig>({
    siteUrl: '',
    targetScores: {
      seoMinimum: 98,
      geoMinimum: 95
    },
    maxIterations: 3,
    apiKeys: {
      perplexity: '',
      openai: '',
      anthropic: ''
    }
  });

  const [agents, setAgents] = useState<WorkflowAgent[]>([
    {
      id: 'search-content',
      name: 'Agent Search Content',
      description: 'Analyse votre site et propose des sujets d\'articles ou utilise vos sujets personnalisés',
      provider: 'perplexity',
      model: 'llama-3.1-sonar-large-128k-online',
      status: 'inactive',
      prompt: `Tu es un agent spécialisé dans l'analyse de contenu web et la proposition de sujets d'articles.

Analyse le site web fourni et propose 3-5 sujets d'articles pertinents.

Retourne UNIQUEMENT un JSON valide avec cette structure :
{
  "topics": [
    {
      "title": "Titre suggéré",
      "keywords": ["mot-clé1", "mot-clé2"],
      "angle": "Description de l'angle",
      "audience": "Description du public cible",
      "sources": ["source1", "source2"]
    }
  ]
}`
    },
    {
      id: 'ghostwriter',
      name: 'Agent Ghostwriter',
      description: 'Rédige des articles complets et optimisés SEO',
      provider: 'openai',
      model: 'gpt-4',
      status: 'inactive',
      prompt: `Tu es un rédacteur expert. Rédige un article complet et optimisé SEO.

Retourne UNIQUEMENT un JSON valide avec cette structure :
{
  "article": {
    "title": "Titre H1",
    "metaDescription": "Meta description SEO (150-160 caractères)",
    "introduction": "Introduction engageante",
    "content": "Corps de l'article en HTML avec balises H2, H3, p, ul, li",
    "conclusion": "Conclusion avec call-to-action",
    "images": ["suggestion1.jpg", "suggestion2.jpg"],
    "wordCount": 1500
  }
}`
    },
    {
      id: 'review-content',
      name: 'Agent Reviewer',
      description: 'Analyse les articles et donne des scores SEO/GEO avec recommandations',
      provider: 'anthropic',
      model: 'claude-3-sonnet-20240229',
      status: 'inactive',
      prompt: `Analyse cet article et donne un score détaillé.

Retourne UNIQUEMENT un JSON valide avec cette structure :
{
  "review": {
    "globalScore": 85,
    "detailedScores": {
      "writing": 22,
      "relevance": 18,
      "seo": 17,
      "geo": 13,
      "structure": 13,
      "engagement": 8,
      "briefCompliance": 9
    },
    "strengths": ["Point fort 1", "Point fort 2"],
    "improvements": ["Amélioration 1", "Amélioration 2"],
    "recommendations": ["Recommandation 1", "Recommandation 2"],
    "actions": ["Action 1", "Action 2"],
    "targetScore": 95
  }
}`
    }
  ]);

  const [executions, setExecutions] = useState<WorkflowExecution[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<WorkflowAgent | null>(null);
  const [editingPrompt, setEditingPrompt] = useState(false);
  const [tempPrompt, setTempPrompt] = useState('');
  const [configErrors, setConfigErrors] = useState<string[]>([]);
  const [customTopics, setCustomTopics] = useState<CustomTopic[]>([]);
  const [newTopic, setNewTopic] = useState<CustomTopic>({
    title: '',
    keywords: [],
    angle: '',
    audience: '',
    sources: []
  });
  const [isAddingTopic, setIsAddingTopic] = useState(false);

  // Validate configuration
  const validateConfig = (): boolean => {
    const errors: string[] = [];

    if (!config.siteUrl.trim()) {
      errors.push('URL du site requis pour Agent Search Content');
    }

    agents.forEach(agent => {
      if (agent.status === 'active') {
        const apiKey = config.apiKeys[agent.provider];
        if (!apiKey.trim()) {
          errors.push(`Clé API ${agent.provider} manquante pour ${agent.name}`);
        }
      }
    });

    setConfigErrors(errors);
    return errors.length === 0;
  };

  // Update agent status based on API key availability
  useEffect(() => {
    const updatedAgents: WorkflowAgent[] = agents.map(agent => ({
      ...agent,
      status: (config.apiKeys[agent.provider]?.trim() ? 'active' : 'inactive') as 'active' | 'inactive'
    }));
    setAgents(updatedAgents);
  }, [config.apiKeys]);

  const handleRunWorkflow = async () => {
    if (!validateConfig()) {
      return;
    }

    const workflowData = {
      siteUrl: config.siteUrl,
      customTopics: customTopics.length > 0 ? customTopics : undefined
    };

    const workflowConfig = {
      searchAgent: {
        provider: agents.find(a => a.id === 'search-content')?.provider || 'perplexity',
        model: agents.find(a => a.id === 'search-content')?.model || 'llama-3.1-sonar-large-128k-online',
        apiKey: config.apiKeys.perplexity
      },
      ghostwriterAgent: {
        provider: agents.find(a => a.id === 'ghostwriter')?.provider || 'openai',
        model: agents.find(a => a.id === 'ghostwriter')?.model || 'gpt-4',
        apiKey: config.apiKeys.openai
      },
      reviewerAgent: {
        provider: agents.find(a => a.id === 'review-content')?.provider || 'anthropic',
        model: agents.find(a => a.id === 'review-content')?.model || 'claude-3-sonnet-20240229',
        apiKey: config.apiKeys.anthropic
      },
      targetScores: config.targetScores,
      maxIterations: config.maxIterations
    };

    const newExecution: WorkflowExecution = {
      id: Date.now().toString(),
      workflowId: 'content-agents-workflow',
      status: 'running',
      startTime: new Date(),
      steps: []
    };

    setExecutions(prev => [newExecution, ...prev]);

    try {
      const response = await fetch('/api/n8n/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          workflowId: 'content-agents-workflow',
          data: workflowData,
          config: workflowConfig
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.details ? error.details.join(', ') : error.error);
      }

      const result = await response.json();

      setExecutions(prev => prev.map(exec =>
        exec.id === newExecution.id
          ? {
              ...exec,
              status: 'completed',
              endTime: new Date(),
              steps: result.steps || [],
              output: result.output
            }
          : exec
      ));

    } catch (error: any) {
      setExecutions(prev => prev.map(exec =>
        exec.id === newExecution.id
          ? {
              ...exec,
              status: 'failed',
              endTime: new Date(),
              error: error.message
            }
          : exec
      ));
    }
  };

  const handleEditPrompt = (agent: WorkflowAgent) => {
    setSelectedAgent(agent);
    setTempPrompt(agent.prompt);
    setEditingPrompt(true);
  };

  const handleSavePrompt = () => {
    if (selectedAgent) {
      setAgents(prev => prev.map(agent =>
        agent.id === selectedAgent.id
          ? { ...agent, prompt: tempPrompt }
          : agent
      ));
      setEditingPrompt(false);
      setSelectedAgent(null);
    }
  };

  const handleUpdateAgent = (agentId: string, updates: Partial<WorkflowAgent>) => {
    setAgents(prev => prev.map(agent =>
      agent.id === agentId
        ? { ...agent, ...updates }
        : agent
    ));
  };

  const handleAddCustomTopic = () => {
    if (newTopic.title.trim()) {
      setCustomTopics(prev => [...prev, { ...newTopic }]);
      setNewTopic({
        title: '',
        keywords: [],
        angle: '',
        audience: '',
        sources: []
      });
      setIsAddingTopic(false);
    }
  };

  const handleRemoveCustomTopic = (index: number) => {
    setCustomTopics(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Workflow Agents de Contenu</h1>
          <p className="text-muted-foreground mt-2">
            Système d'agents IA configurables pour la création automatisée de contenu
          </p>
        </div>
        <div className="flex gap-2">
          {configErrors.length > 0 && (
            <Button variant="outline" disabled className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500" />
              Configuration incomplète
            </Button>
          )}
          <Button
            onClick={handleRunWorkflow}
            disabled={configErrors.length > 0}
            className="flex items-center gap-2"
          >
            <Play className="w-4 h-4" />
            Lancer le Workflow
          </Button>
        </div>
      </div>

      {configErrors.length > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>Configuration requise :</strong>
            <ul className="list-disc ml-4 mt-1">
              {configErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="config" className="space-y-6">
        <TabsList>
          <TabsTrigger value="config">Configuration</TabsTrigger>
          <TabsTrigger value="topics">Sujets Personnalisés</TabsTrigger>
          <TabsTrigger value="agents">Agents</TabsTrigger>
          <TabsTrigger value="executions">Exécutions</TabsTrigger>
        </TabsList>

        <TabsContent value="config" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Configuration du Workflow</CardTitle>
                <CardDescription>Paramètres généraux et objectifs</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="site-url">URL du Site à Analyser</Label>
                  <Input
                    id="site-url"
                    placeholder="https://votre-site.com"
                    value={config.siteUrl}
                    onChange={(e) => setConfig(prev => ({ ...prev, siteUrl: e.target.value }))}
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="seo-target">Score SEO Minimum (%)</Label>
                    <Input
                      id="seo-target"
                      type="number"
                      min="80"
                      max="100"
                      value={config.targetScores.seoMinimum}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        targetScores: {
                          ...prev.targetScores,
                          seoMinimum: parseInt(e.target.value) || 98
                        }
                      }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="geo-target">Score GEO Minimum (%)</Label>
                    <Input
                      id="geo-target"
                      type="number"
                      min="80"
                      max="100"
                      value={config.targetScores.geoMinimum}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        targetScores: {
                          ...prev.targetScores,
                          geoMinimum: parseInt(e.target.value) || 95
                        }
                      }))}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="max-iterations">Nombre Maximum d'Itérations</Label>
                  <Input
                    id="max-iterations"
                    type="number"
                    min="1"
                    max="10"
                    value={config.maxIterations}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      maxIterations: parseInt(e.target.value) || 3
                    }))}
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Nombre de cycles revision-amélioration pour atteindre les scores cibles
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Clés API</CardTitle>
                <CardDescription>
                  Configurez vos clés API pour les différents fournisseurs IA
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="perplexity-key">
                    Clé API Perplexity
                    {config.apiKeys.perplexity && <CheckCircle className="inline w-4 h-4 ml-2 text-green-500" />}
                  </Label>
                  <Input
                    id="perplexity-key"
                    type="password"
                    placeholder="pplx-..."
                    value={config.apiKeys.perplexity}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      apiKeys: { ...prev.apiKeys, perplexity: e.target.value }
                    }))}
                  />
                </div>
                <div>
                  <Label htmlFor="openai-key">
                    Clé API OpenAI
                    {config.apiKeys.openai && <CheckCircle className="inline w-4 h-4 ml-2 text-green-500" />}
                  </Label>
                  <Input
                    id="openai-key"
                    type="password"
                    placeholder="sk-..."
                    value={config.apiKeys.openai}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      apiKeys: { ...prev.apiKeys, openai: e.target.value }
                    }))}
                  />
                </div>
                <div>
                  <Label htmlFor="anthropic-key">
                    Clé API Anthropic
                    {config.apiKeys.anthropic && <CheckCircle className="inline w-4 h-4 ml-2 text-green-500" />}
                  </Label>
                  <Input
                    id="anthropic-key"
                    type="password"
                    placeholder="sk-ant-..."
                    value={config.apiKeys.anthropic}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      apiKeys: { ...prev.apiKeys, anthropic: e.target.value }
                    }))}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="topics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sujets d'Articles Personnalisés</CardTitle>
              <CardDescription>
                Proposez vos propres idées d'articles au lieu de laisser l'IA analyser votre site
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {customTopics.length > 0 && (
                <div className="space-y-2">
                  {customTopics.map((topic, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{topic.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {topic.keywords.join(', ')} • {topic.audience}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveCustomTopic(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {isAddingTopic ? (
                <div className="space-y-4 border rounded-lg p-4">
                  <div>
                    <Label htmlFor="topic-title">Titre de l'Article</Label>
                    <Input
                      id="topic-title"
                      value={newTopic.title}
                      onChange={(e) => setNewTopic(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Ex: Guide complet du SEO local"
                    />
                  </div>
                  <div>
                    <Label htmlFor="topic-keywords">Mots-clés (séparés par des virgules)</Label>
                    <Input
                      id="topic-keywords"
                      value={newTopic.keywords.join(', ')}
                      onChange={(e) => setNewTopic(prev => ({
                        ...prev,
                        keywords: e.target.value.split(',').map(k => k.trim()).filter(k => k)
                      }))}
                      placeholder="SEO, référencement local, Google My Business"
                    />
                  </div>
                  <div>
                    <Label htmlFor="topic-angle">Angle d'Approche</Label>
                    <Input
                      id="topic-angle"
                      value={newTopic.angle}
                      onChange={(e) => setNewTopic(prev => ({ ...prev, angle: e.target.value }))}
                      placeholder="Guide pratique pour débutants"
                    />
                  </div>
                  <div>
                    <Label htmlFor="topic-audience">Public Cible</Label>
                    <Input
                      id="topic-audience"
                      value={newTopic.audience}
                      onChange={(e) => setNewTopic(prev => ({ ...prev, audience: e.target.value }))}
                      placeholder="Petites entreprises locales"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleAddCustomTopic} disabled={!newTopic.title.trim()}>
                      Ajouter
                    </Button>
                    <Button variant="outline" onClick={() => setIsAddingTopic(false)}>
                      Annuler
                    </Button>
                  </div>
                </div>
              ) : (
                <Button variant="outline" onClick={() => setIsAddingTopic(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter un Sujet
                </Button>
              )}

              {customTopics.length === 0 && !isAddingTopic && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Si aucun sujet personnalisé n'est ajouté, l'Agent Search Content analysera automatiquement votre site pour proposer des sujets.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="agents" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {agents.map((agent) => (
              <Card key={agent.id} className="relative">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{agent.name}</CardTitle>
                      <CardDescription>{agent.description}</CardDescription>
                    </div>
                    <Badge
                      variant={agent.status === 'active' ? 'default' : 'secondary'}
                    >
                      {agent.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor={`provider-${agent.id}`}>Fournisseur IA</Label>
                      <Select
                        value={agent.provider}
                        onValueChange={(value: any) => handleUpdateAgent(agent.id, { provider: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="perplexity">Perplexity</SelectItem>
                          <SelectItem value="openai">OpenAI</SelectItem>
                          <SelectItem value="anthropic">Anthropic</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor={`model-${agent.id}`}>Modèle</Label>
                      <Input
                        id={`model-${agent.id}`}
                        value={agent.model}
                        onChange={(e) => handleUpdateAgent(agent.id, { model: e.target.value })}
                        placeholder="Nom du modèle"
                      />
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditPrompt(agent)}
                        className="flex items-center gap-1"
                      >
                        <Edit className="w-3 h-3" />
                        Prompt
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="executions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Historique des Exécutions</CardTitle>
              <CardDescription>Suivez les exécutions de vos workflows avec détail des étapes</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                {executions.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Aucune exécution pour le moment</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Configurez vos API et lancez votre premier workflow
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {executions.map((execution) => (
                      <div key={execution.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium">
                            Workflow {execution.workflowId}
                          </span>
                          <Badge
                            variant={
                              execution.status === 'completed' ? 'default' :
                              execution.status === 'failed' ? 'destructive' :
                              execution.status === 'running' ? 'secondary' : 'outline'
                            }
                          >
                            {execution.status}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground mb-2">
                          Démarré: {execution.startTime.toLocaleString()}
                          {execution.endTime && (
                            <span> - Terminé: {execution.endTime.toLocaleString()}</span>
                          )}
                        </div>

                        {execution.steps.length > 0 && (
                          <div className="mt-3 space-y-2">
                            <h4 className="font-medium text-sm">Étapes :</h4>
                            {execution.steps.map((step, index) => (
                              <div key={index} className="text-xs bg-muted p-2 rounded">
                                <strong>{step.nodeId}:</strong> {step.status}
                                {step.completedAt && (
                                  <span className="ml-2 text-muted-foreground">
                                    ({new Date(step.completedAt).toLocaleTimeString()})
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        )}

                        {execution.output && (
                          <div className="mt-2 p-2 bg-muted rounded text-sm">
                            <strong>Résultat:</strong> {execution.output.summary ?
                              `${execution.output.summary.totalArticles} articles générés avec ${execution.output.summary.averageIterations.toFixed(1)} itérations en moyenne` :
                              'Workflow terminé avec succès'
                            }
                          </div>
                        )}

                        {execution.error && (
                          <div className="mt-2 p-2 bg-destructive/10 text-destructive rounded text-sm">
                            <strong>Erreur:</strong> {execution.error}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal d'édition de prompt */}
      {editingPrompt && selectedAgent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-4xl max-h-[80vh] overflow-hidden">
            <CardHeader>
              <CardTitle>Éditer le Prompt - {selectedAgent.name}</CardTitle>
              <CardDescription>
                Personnalisez les instructions de l'agent IA
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="agent-prompt">Instructions de l'Agent</Label>
                  <Textarea
                    id="agent-prompt"
                    value={tempPrompt}
                    onChange={(e) => setTempPrompt(e.target.value)}
                    rows={20}
                    className="font-mono text-sm"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setEditingPrompt(false)}
                  >
                    Annuler
                  </Button>
                  <Button onClick={handleSavePrompt} className="flex items-center gap-2">
                    <Save className="w-4 h-4" />
                    Sauvegarder
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}