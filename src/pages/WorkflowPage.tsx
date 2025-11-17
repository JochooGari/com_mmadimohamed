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
import { WorkflowTimeline } from '@/components/WorkflowTimeline';
import { DebugConsole } from '@/components/DebugConsole';
import { MetricsPanel } from '@/components/MetricsPanel';
import { ToastProvider, useToast } from '@/components/ErrorToast';
import { useAgents, Agent } from '@/hooks/useAgents';
import { getApiKey } from '@/lib/aiProviders';

interface WorkflowAgent {
  id: string;
  name: string;
  description: string;
  provider: 'perplexity' | 'openai' | 'anthropic';
  model: string;
  temperature?: number;
  maxTokens?: number;
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

function WorkflowInner() {
  // Use centralized agents hook for synchronization with Admin Agents
  const {
    agents: centralAgents,
    updateAgent: updateCentralAgent,
    getAgent,
    syncWithWorkflowStorage,
    saveWorkflowPrompts
  } = useAgents();

  const [config, setConfig] = useState<WorkflowConfig>({
    siteUrl: '',
    targetScores: {
      seoMinimum: 98,
      geoMinimum: 95
    },
    maxIterations: 3
  });

  // Get API keys from environment variables (configured in /admin/settings)
  const apiKeys = {
    perplexity: getApiKey('perplexity') || '',
    openai: getApiKey('openai') || '',
    anthropic: getApiKey('anthropic') || ''
  };

  // Convert central agents to WorkflowAgent format for local use
  const workflowAgentIds = ['search-content', 'ghostwriter', 'review-content'];
  const agents: WorkflowAgent[] = workflowAgentIds.map(id => {
    const agent = getAgent(id);
    if (!agent) {
      // Fallback defaults if agent not found
      return {
        id,
        name: id === 'search-content' ? 'Agent Search Content' :
              id === 'ghostwriter' ? 'Agent Ghostwriter' : 'Agent Reviewer',
        description: '',
        provider: (id === 'search-content' ? 'perplexity' :
                  id === 'ghostwriter' ? 'openai' : 'anthropic') as 'perplexity' | 'openai' | 'anthropic',
        model: id === 'search-content' ? 'sonar' :
               id === 'ghostwriter' ? 'gpt-4o' : 'claude-sonnet-4-5-20250514',
        temperature: id === 'review-content' ? 0.3 : id === 'ghostwriter' ? 0.8 : 0.7,
        maxTokens: id === 'ghostwriter' ? 8000 : 2000,
        status: 'inactive' as const,
        prompt: ''
      };
    }
    return {
      id: agent.id,
      name: agent.name,
      description: agent.description || '',
      provider: (agent.provider || 'openai') as 'perplexity' | 'openai' | 'anthropic',
      model: agent.model,
      temperature: agent.temperature,
      maxTokens: agent.maxTokens,
      status: (agent.status || 'inactive') as 'active' | 'inactive',
      prompt: agent.prompt || ''
    };
  });

  // Wrapper to update agents in central store
  const setAgents = (updater: WorkflowAgent[] | ((prev: WorkflowAgent[]) => WorkflowAgent[])) => {
    const newAgents = typeof updater === 'function' ? updater(agents) : updater;
    newAgents.forEach(agent => {
      updateCentralAgent(agent.id, {
        name: agent.name,
        description: agent.description,
        provider: agent.provider,
        model: agent.model,
        temperature: agent.temperature,
        maxTokens: agent.maxTokens,
        status: agent.status,
        prompt: agent.prompt
      });
    });
  };

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
  const [recentSites, setRecentSites] = useState<string[]>([]);

  // Load persisted prompts and recent sites
  useEffect(() => { (async () => {
    try {
      const r = await fetch('/api/storage?agent=workflow&type=prompts');
      if (r.ok) {
        const data = await r.json();
        if (data && typeof data === 'object') {
          setAgents(prev => prev.map(a => ({ ...a, prompt: data[a.id]?.prompt ?? a.prompt })));
        }
      }
    } catch {}
    try {
      const raw = localStorage.getItem('workflow_recent_sites');
      if (raw) {
        const arr = JSON.parse(raw);
        if (Array.isArray(arr)) setRecentSites(arr);
      }
    } catch {}
  })(); }, []);

  // Validate configuration
  const validateConfig = (): boolean => {
    const errors: string[] = [];

    if (!config.siteUrl.trim() && customTopics.length === 0) {
      errors.push('URL du site requis (ou ajoutez des sujets personnalisés)');
    }

    agents.forEach(agent => {
      const apiKey = apiKeys[agent.provider as keyof typeof apiKeys];
      if (!apiKey?.trim()) {
        errors.push(`Clé API ${agent.provider} manquante pour ${agent.name} (configurer dans /admin/settings)`);
      }
    });

    setConfigErrors(errors);
    return errors.length === 0;
  };

  // Update agent status based on API key availability
  useEffect(() => {
    const updatedAgents: WorkflowAgent[] = agents.map(agent => ({
      ...agent,
      status: (apiKeys[agent.provider as keyof typeof apiKeys]?.trim() ? 'active' : 'inactive') as 'active' | 'inactive'
    }));
    setAgents(updatedAgents);
  }, [apiKeys.perplexity, apiKeys.openai, apiKeys.anthropic]);

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
        temperature: agents.find(a => a.id === 'search-content')?.temperature,
        maxTokens: agents.find(a => a.id === 'search-content')?.maxTokens,
        apiKey: apiKeys.perplexity
      },
      ghostwriterAgent: {
        provider: agents.find(a => a.id === 'ghostwriter')?.provider || 'openai',
        model: agents.find(a => a.id === 'ghostwriter')?.model || 'gpt-4o',
        temperature: agents.find(a => a.id === 'ghostwriter')?.temperature,
        maxTokens: agents.find(a => a.id === 'ghostwriter')?.maxTokens,
        apiKey: apiKeys.openai
      },
      reviewerAgent: {
        provider: agents.find(a => a.id === 'review-content')?.provider || 'anthropic',
        model: agents.find(a => a.id === 'review-content')?.model || 'claude-sonnet-4-5-20250514',
        temperature: agents.find(a => a.id === 'review-content')?.temperature,
        maxTokens: agents.find(a => a.id === 'review-content')?.maxTokens,
        apiKey: apiKeys.anthropic
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

    // persist recent site URLs (max 5)
    try {
      const url = (config.siteUrl || '').trim();
      if (url) {
        const next = [url, ...recentSites.filter(u => u !== url)].slice(0, 5);
        setRecentSites(next);
        localStorage.setItem('workflow_recent_sites', JSON.stringify(next));
      }
    } catch {}

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

      const body = await response.json().catch(() => ({}));

      const failed = body?.status === 'failed' || !!body?.error;
      if (!response.ok || failed) {
        setExecutions(prev => prev.map(exec =>
          exec.id === newExecution.id
            ? {
                ...exec,
                status: 'failed',
                endTime: new Date(),
                steps: Array.isArray(body?.steps) ? body.steps : exec.steps,
                error: body?.error || (!response.ok ? 'Erreur API (500)' : 'Exécution échouée')
              }
            : exec
        ));
      } else {
        setExecutions(prev => prev.map(exec =>
          exec.id === newExecution.id
            ? {
                ...exec,
                status: 'completed',
                endTime: new Date(),
                steps: Array.isArray(body?.steps) ? body.steps : [],
                output: body?.output
              }
            : exec
        ));
      }

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
      const updated = agents.map(agent =>
        agent.id === selectedAgent.id
          ? { ...agent, prompt: tempPrompt }
          : agent);
      setAgents(updated);
      // persist prompts mapping { [agentId]: { prompt } }
      const mapping: Record<string, { prompt: string }> = {};
      updated.forEach(a => { mapping[a.id] = { prompt: a.prompt || '' }; });
      fetch('/api/storage', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ action:'save_workflow_prompts', data: mapping }) }).catch(()=>{});
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

  // Use centralized hook functions for sync
  const saveAllPrompts = async () => {
    await saveWorkflowPrompts();
  };

  const loadAllPrompts = async () => {
    await syncWithWorkflowStorage();
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

  const latest = executions[0];
  const mapToTimeline = (nodeId: string, name: string) => {
    const st = latest?.steps?.find((s:any)=> s.nodeId===nodeId)?.status;
    return st === 'completed' ? 'completed' : st === 'failed' ? 'failed' : latest?.status === 'running' ? 'running' : 'pending';
  };
  const steps = [
    { id: 'search-content', name: 'Search Content', status: mapToTimeline('search-content','Search Content') },
    { id: 'ghostwriter', name: 'Ghostwriter', status: mapToTimeline('ghostwriter','Ghostwriter') },
    { id: 'review-content', name: 'Reviewer', status: mapToTimeline('review-content','Reviewer') },
  ] as any[];
  const currentStepIndex = Math.max(0, steps.findIndex((s:any)=> s.status==='running') !== -1 ? steps.findIndex((s:any)=> s.status==='running') : steps.findIndex((s:any)=> s.status==='completed'));

  const [metricsCollapsed, setMetricsCollapsed] = useState(false);
  const performance = {
    executionTime: latest?.endTime && latest?.startTime ? (latest.endTime.getTime() - latest.startTime.getTime()) : 0,
    tokensUsed: 0,
    requestsCount: latest?.steps?.length || 0,
    successRate: latest?.steps ? Math.round((latest.steps.filter((s:any)=> s.status==='completed').length / latest.steps.length) * 100) : 0,
    errorRate: latest?.steps ? Math.round((latest.steps.filter((s:any)=> s.status==='failed').length / latest.steps.length) * 100) : 0,
    averageLatency: 0,
  } as any;
  const agentsMetrics = [
    { agentId:'search-content', agentName:'Search Content', requestsCount:1, successRate: steps[0].status==='completed'?100:0, averageResponseTime:0, tokensUsed:0, status: steps[0].status==='failed'?'error':(steps[0].status==='completed'?'active':'idle') },
    { agentId:'ghostwriter', agentName:'Ghostwriter', requestsCount:1, successRate: steps[1].status==='completed'?100:0, averageResponseTime:0, tokensUsed:0, status: steps[1].status==='failed'?'error':(steps[1].status==='completed'?'active':'idle') },
    { agentId:'review-content', agentName:'Reviewer', requestsCount:1, successRate: steps[2].status==='completed'?100:0, averageResponseTime:0, tokensUsed:0, status: steps[2].status==='failed'?'error':(steps[2].status==='completed'?'active':'idle') },
  ] as any[];

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

      {/* Top horizontal timeline */}
      <WorkflowTimeline steps={steps as any[]} currentStepIndex={currentStepIndex} />

      <div className="flex gap-4">
        <MetricsPanel isCollapsed={metricsCollapsed} onToggleCollapse={()=> setMetricsCollapsed(v=>!v)} performance={performance as any} agents={agentsMetrics as any} />
        <div className="flex-1">
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
                  <div className="flex gap-2">
                    <Input
                      id="site-url"
                      placeholder="https://votre-site.com"
                      value={config.siteUrl}
                      onChange={(e) => setConfig(prev => ({ ...prev, siteUrl: e.target.value }))}
                    />
                    {recentSites.length > 0 && (
                      <Select onValueChange={(v:any)=> setConfig(prev=>({ ...prev, siteUrl: v }))}>
                        <SelectTrigger className="w-[280px]">
                          <SelectValue placeholder="Récents" />
                        </SelectTrigger>
                        <SelectContent>
                          {recentSites.map((u)=> (
                            <SelectItem key={u} value={u}>{u}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Historique local: dernières URL utilisées</p>
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
                <CardTitle>Statut des Clés API</CardTitle>
                <CardDescription>
                  Les clés API sont configurées dans <a href="/admin/settings" className="text-blue-600 hover:underline">/admin/settings</a>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-2 border rounded">
                  <span>Perplexity</span>
                  {apiKeys.perplexity ? (
                    <Badge variant="default" className="bg-green-100 text-green-700">
                      <CheckCircle className="w-3 h-3 mr-1" /> Configurée
                    </Badge>
                  ) : (
                    <Badge variant="destructive">
                      <AlertCircle className="w-3 h-3 mr-1" /> Manquante
                    </Badge>
                  )}
                </div>
                <div className="flex items-center justify-between p-2 border rounded">
                  <span>OpenAI</span>
                  {apiKeys.openai ? (
                    <Badge variant="default" className="bg-green-100 text-green-700">
                      <CheckCircle className="w-3 h-3 mr-1" /> Configurée
                    </Badge>
                  ) : (
                    <Badge variant="destructive">
                      <AlertCircle className="w-3 h-3 mr-1" /> Manquante
                    </Badge>
                  )}
                </div>
                <div className="flex items-center justify-between p-2 border rounded">
                  <span>Anthropic</span>
                  {apiKeys.anthropic ? (
                    <Badge variant="default" className="bg-green-100 text-green-700">
                      <CheckCircle className="w-3 h-3 mr-1" /> Configurée
                    </Badge>
                  ) : (
                    <Badge variant="destructive">
                      <AlertCircle className="w-3 h-3 mr-1" /> Manquante
                    </Badge>
                  )}
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
          <div className="flex items-center justify-end gap-2">
            <Button variant="outline" size="sm" onClick={loadAllPrompts}>Charger prompts sauvegardés</Button>
            <Button variant="outline" size="sm" onClick={saveAllPrompts}>Sauvegarder tous les prompts</Button>
          </div>
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
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label>Température</Label>
                        <Input
                          type="number"
                          step="0.1"
                          value={agent.temperature ?? ''}
                          onChange={(e)=> handleUpdateAgent(agent.id, { temperature: Number(e.target.value) })}
                          placeholder="0.7"
                        />
                      </div>
                      <div>
                        <Label>Tokens max</Label>
                        <Input
                          type="number"
                          value={agent.maxTokens ?? ''}
                          onChange={(e)=> handleUpdateAgent(agent.id, { maxTokens: Number(e.target.value) })}
                          placeholder="2000"
                        />
                      </div>
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
                            <div key={index} className="text-xs bg-muted p-2 rounded space-y-1">
                              <div>
                                <strong>{step.nodeId}:</strong> {step.status}
                                {step.completedAt && (
                                  <span className="ml-2 text-muted-foreground">({new Date(step.completedAt).toLocaleTimeString()})</span>
                                )}
                                {step.debug && (
                                  <span className="ml-2 text-muted-foreground">[{step.debug.provider}/{step.debug.model}]</span>
                                )}
                              </div>
                              {step.debug?.raw && (
                                <pre className="whitespace-pre-wrap bg-white p-2 rounded border max-h-48 overflow-auto">
                                  {Array.isArray(step.debug.raw) ? step.debug.raw.join('\n\n---\n\n') : step.debug.raw}
                                </pre>
                              )}
                            </div>
                          ))}
                          </div>
                        )}

                        {execution.output && (
                          <div className="mt-2 p-2 bg-muted rounded text-sm space-y-1">
                            <div>
                              <strong>Résultat:</strong> {execution.output.summary ?
                                `${execution.output.summary.totalArticles} articles générés avec ${execution.output.summary.averageIterations.toFixed(1)} itérations en moyenne` :
                                'Workflow terminé avec succès'
                              }
                            </div>
                            <pre className="text-[11px] whitespace-pre-wrap bg-white p-2 rounded border max-h-40 overflow-auto">
                              {typeof execution.output === 'string' ? execution.output : JSON.stringify(execution.output, null, 2)}
                            </pre>
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
        </div>
      </div>

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

export default function WorkflowPage() {
  return (
    <ToastProvider>
      <WorkflowInner />
    </ToastProvider>
  );
}