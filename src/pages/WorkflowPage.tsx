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
import { Play, Pause, Settings, Eye, Edit, Save } from 'lucide-react';

interface WorkflowAgent {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'inactive' | 'running';
  prompt: string;
  model: string;
  lastRun?: Date;
  successRate?: number;
}

interface WorkflowExecution {
  id: string;
  agentId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  startTime: Date;
  endTime?: Date;
  output?: string;
  error?: string;
}

export default function WorkflowPage() {
  const [agents, setAgents] = useState<WorkflowAgent[]>([
    {
      id: 'search-content',
      name: 'Agent Search Content',
      description: 'Scanne votre site et propose des sujets d\'articles',
      status: 'active',
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
   - Public cible
   - Sources potentielles

Critères de sélection :
- Pertinence avec le contenu existant
- Potentiel SEO
- Intérêt pour l'audience
- Faisabilité de rédaction`,
      model: 'perplexity',
      successRate: 87
    },
    {
      id: 'ghostwriter',
      name: 'Agent Ghostwriting',
      description: 'Rédige des articles basés sur les sujets proposés',
      status: 'active',
      prompt: `Tu es un rédacteur expert spécialisé dans la création de contenu web de qualité.

Tâches :
1. Analyser le brief du sujet fourni
2. Rechercher et vérifier les informations
3. Structurer l'article de manière logique
4. Rédiger un contenu engageant et informatif
5. Optimiser pour le SEO
6. Inclure des éléments visuels suggérés

Structure requise :
- Titre accrocheur (H1)
- Introduction engageante
- Corps de l'article avec sous-titres (H2, H3)
- Conclusion avec call-to-action
- Meta description
- Suggestions d'images

Critères de qualité :
- Ton adapté au public cible
- Longueur optimale (800-2000 mots)
- Densité de mots-clés naturelle
- Lisibilité élevée
- Sources citées si nécessaire`,
      model: 'gpt-4',
      successRate: 92
    },
    {
      id: 'review-content',
      name: 'Agent Review Content',
      description: 'Analyse et note les articles avec recommandations',
      status: 'active',
      prompt: `Tu es un expert en révision de contenu et optimisation éditoriale.

Tâches :
1. Analyser l'article fourni en détail
2. Évaluer selon les critères définis
3. Attribuer un score global (/100)
4. Fournir des recommandations spécifiques
5. Suggérer des améliorations concrètes

Critères d'évaluation :
- Qualité rédactionnelle (25 pts)
- Pertinence du contenu (20 pts)
- Optimisation SEO (20 pts)
- Structure et lisibilité (15 pts)
- Engagement potentiel (10 pts)
- Respect du brief (10 pts)

Format de sortie :
- Score global et détaillé
- Points forts identifiés
- Points d'amélioration
- Recommandations prioritaires
- Actions correctives suggérées
- Score cible à atteindre`,
      model: 'claude-3',
      successRate: 95
    }
  ]);

  const [executions, setExecutions] = useState<WorkflowExecution[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<WorkflowAgent | null>(null);
  const [editingPrompt, setEditingPrompt] = useState(false);
  const [tempPrompt, setTempPrompt] = useState('');

  const handleRunWorkflow = () => {
    // Simuler l'exécution du workflow
    const newExecution: WorkflowExecution = {
      id: Date.now().toString(),
      agentId: 'search-content',
      status: 'running',
      startTime: new Date()
    };

    setExecutions(prev => [newExecution, ...prev]);

    // Simuler la completion après 5 secondes
    setTimeout(() => {
      setExecutions(prev => prev.map(exec =>
        exec.id === newExecution.id
          ? {
              ...exec,
              status: 'completed',
              endTime: new Date(),
              output: 'Workflow terminé avec succès. 4 sujets d\'articles identifiés.'
            }
          : exec
      ));
    }, 5000);
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

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Workflow n8n - Agents de Contenu</h1>
          <p className="text-muted-foreground mt-2">
            Gérez vos agents de création de contenu automatisés
          </p>
        </div>
        <Button onClick={handleRunWorkflow} className="flex items-center gap-2">
          <Play className="w-4 h-4" />
          Lancer le Workflow
        </Button>
      </div>

      <Tabs defaultValue="agents" className="space-y-6">
        <TabsList>
          <TabsTrigger value="agents">Agents</TabsTrigger>
          <TabsTrigger value="executions">Exécutions</TabsTrigger>
          <TabsTrigger value="config">Configuration</TabsTrigger>
        </TabsList>

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
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Modèle:</span>
                      <span className="font-medium">{agent.model}</span>
                    </div>
                    {agent.successRate && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Taux de succès:</span>
                        <span className="font-medium text-green-600">{agent.successRate}%</span>
                      </div>
                    )}
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
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-1"
                      >
                        <Settings className="w-3 h-3" />
                        Config
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
              <CardDescription>Suivez les exécutions de vos workflows</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                {executions.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    Aucune exécution pour le moment
                  </p>
                ) : (
                  <div className="space-y-4">
                    {executions.map((execution) => (
                      <div key={execution.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium">
                            {agents.find(a => a.id === execution.agentId)?.name}
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
                        <div className="text-sm text-muted-foreground">
                          Démarré: {execution.startTime.toLocaleString()}
                          {execution.endTime && (
                            <span> - Terminé: {execution.endTime.toLocaleString()}</span>
                          )}
                        </div>
                        {execution.output && (
                          <div className="mt-2 p-2 bg-muted rounded text-sm">
                            {execution.output}
                          </div>
                        )}
                        {execution.error && (
                          <div className="mt-2 p-2 bg-destructive/10 text-destructive rounded text-sm">
                            {execution.error}
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

        <TabsContent value="config" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configuration Globale</CardTitle>
              <CardDescription>Paramètres généraux du workflow</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="site-url">URL du Site à Scanner</Label>
                  <Input
                    id="site-url"
                    placeholder="https://votre-site.com"
                    defaultValue="https://magicpath.ai"
                  />
                </div>
                <div>
                  <Label htmlFor="perplexity-key">Clé API Perplexity</Label>
                  <Input
                    id="perplexity-key"
                    type="password"
                    placeholder="pplx-..."
                  />
                </div>
                <div>
                  <Label htmlFor="openai-key">Clé API OpenAI</Label>
                  <Input
                    id="openai-key"
                    type="password"
                    placeholder="sk-..."
                  />
                </div>
                <div>
                  <Label htmlFor="anthropic-key">Clé API Anthropic</Label>
                  <Input
                    id="anthropic-key"
                    type="password"
                    placeholder="sk-ant-..."
                  />
                </div>
              </div>
              <Separator />
              <div>
                <Label htmlFor="webhook-url">Webhook de Notification</Label>
                <Input
                  id="webhook-url"
                  placeholder="https://hooks.zapier.com/hooks/..."
                />
              </div>
              <Button className="w-full">Sauvegarder la Configuration</Button>
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
                Modifiez les instructions de l'agent
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