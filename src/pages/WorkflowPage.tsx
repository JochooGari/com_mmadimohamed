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
  const [agents, setAgents] = useState&lt;WorkflowAgent[]&gt;([
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

  const [executions, setExecutions] = useState&lt;WorkflowExecution[]&gt;([]);
  const [selectedAgent, setSelectedAgent] = useState&lt;WorkflowAgent | null&gt;(null);
  const [editingPrompt, setEditingPrompt] = useState(false);
  const [tempPrompt, setTempPrompt] = useState('');

  const handleRunWorkflow = () =&gt; {
    // Simuler l'exécution du workflow
    const newExecution: WorkflowExecution = {
      id: Date.now().toString(),
      agentId: 'search-content',
      status: 'running',
      startTime: new Date()
    };

    setExecutions(prev =&gt; [newExecution, ...prev]);

    // Simuler la completion après 5 secondes
    setTimeout(() =&gt; {
      setExecutions(prev =&gt; prev.map(exec =&gt;
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

  const handleEditPrompt = (agent: WorkflowAgent) =&gt; {
    setSelectedAgent(agent);
    setTempPrompt(agent.prompt);
    setEditingPrompt(true);
  };

  const handleSavePrompt = () =&gt; {
    if (selectedAgent) {
      setAgents(prev =&gt; prev.map(agent =&gt;
        agent.id === selectedAgent.id
          ? { ...agent, prompt: tempPrompt }
          : agent
      ));
      setEditingPrompt(false);
      setSelectedAgent(null);
    }
  };

  return (
    &lt;div className="container mx-auto p-6 space-y-6"&gt;
      &lt;div className="flex justify-between items-center"&gt;
        &lt;div&gt;
          &lt;h1 className="text-3xl font-bold"&gt;Workflow n8n - Agents de Contenu&lt;/h1&gt;
          &lt;p className="text-muted-foreground mt-2"&gt;
            Gérez vos agents de création de contenu automatisés
          &lt;/p&gt;
        &lt;/div&gt;
        &lt;Button onClick={handleRunWorkflow} className="flex items-center gap-2"&gt;
          &lt;Play className="w-4 h-4" /&gt;
          Lancer le Workflow
        &lt;/Button&gt;
      &lt;/div&gt;

      &lt;Tabs defaultValue="agents" className="space-y-6"&gt;
        &lt;TabsList&gt;
          &lt;TabsTrigger value="agents"&gt;Agents&lt;/TabsTrigger&gt;
          &lt;TabsTrigger value="executions"&gt;Exécutions&lt;/TabsTrigger&gt;
          &lt;TabsTrigger value="config"&gt;Configuration&lt;/TabsTrigger&gt;
        &lt;/TabsList&gt;

        &lt;TabsContent value="agents" className="space-y-4"&gt;
          &lt;div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"&gt;
            {agents.map((agent) =&gt; (
              &lt;Card key={agent.id} className="relative"&gt;
                &lt;CardHeader&gt;
                  &lt;div className="flex justify-between items-start"&gt;
                    &lt;div&gt;
                      &lt;CardTitle className="text-lg"&gt;{agent.name}&lt;/CardTitle&gt;
                      &lt;CardDescription&gt;{agent.description}&lt;/CardDescription&gt;
                    &lt;/div&gt;
                    &lt;Badge
                      variant={agent.status === 'active' ? 'default' : 'secondary'}
                    &gt;
                      {agent.status}
                    &lt;/Badge&gt;
                  &lt;/div&gt;
                &lt;/CardHeader&gt;
                &lt;CardContent&gt;
                  &lt;div className="space-y-3"&gt;
                    &lt;div className="flex justify-between text-sm"&gt;
                      &lt;span className="text-muted-foreground"&gt;Modèle:&lt;/span&gt;
                      &lt;span className="font-medium"&gt;{agent.model}&lt;/span&gt;
                    &lt;/div&gt;
                    {agent.successRate &amp;&amp; (
                      &lt;div className="flex justify-between text-sm"&gt;
                        &lt;span className="text-muted-foreground"&gt;Taux de succès:&lt;/span&gt;
                        &lt;span className="font-medium text-green-600"&gt;{agent.successRate}%&lt;/span&gt;
                      &lt;/div&gt;
                    )}
                    &lt;div className="flex gap-2 mt-4"&gt;
                      &lt;Button
                        variant="outline"
                        size="sm"
                        onClick={() =&gt; handleEditPrompt(agent)}
                        className="flex items-center gap-1"
                      &gt;
                        &lt;Edit className="w-3 h-3" /&gt;
                        Prompt
                      &lt;/Button&gt;
                      &lt;Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-1"
                      &gt;
                        &lt;Settings className="w-3 h-3" /&gt;
                        Config
                      &lt;/Button&gt;
                    &lt;/div&gt;
                  &lt;/div&gt;
                &lt;/CardContent&gt;
              &lt;/Card&gt;
            ))}
          &lt;/div&gt;
        &lt;/TabsContent&gt;

        &lt;TabsContent value="executions" className="space-y-4"&gt;
          &lt;Card&gt;
            &lt;CardHeader&gt;
              &lt;CardTitle&gt;Historique des Exécutions&lt;/CardTitle&gt;
              &lt;CardDescription&gt;Suivez les exécutions de vos workflows&lt;/CardDescription&gt;
            &lt;/CardHeader&gt;
            &lt;CardContent&gt;
              &lt;ScrollArea className="h-96"&gt;
                {executions.length === 0 ? (
                  &lt;p className="text-muted-foreground text-center py-8"&gt;
                    Aucune exécution pour le moment
                  &lt;/p&gt;
                ) : (
                  &lt;div className="space-y-4"&gt;
                    {executions.map((execution) =&gt; (
                      &lt;div key={execution.id} className="border rounded-lg p-4"&gt;
                        &lt;div className="flex justify-between items-center mb-2"&gt;
                          &lt;span className="font-medium"&gt;
                            {agents.find(a =&gt; a.id === execution.agentId)?.name}
                          &lt;/span&gt;
                          &lt;Badge
                            variant={
                              execution.status === 'completed' ? 'default' :
                              execution.status === 'failed' ? 'destructive' :
                              execution.status === 'running' ? 'secondary' : 'outline'
                            }
                          &gt;
                            {execution.status}
                          &lt;/Badge&gt;
                        &lt;/div&gt;
                        &lt;div className="text-sm text-muted-foreground"&gt;
                          Démarré: {execution.startTime.toLocaleString()}
                          {execution.endTime &amp;&amp; (
                            &lt;span&gt; - Terminé: {execution.endTime.toLocaleString()}&lt;/span&gt;
                          )}
                        &lt;/div&gt;
                        {execution.output &amp;&amp; (
                          &lt;div className="mt-2 p-2 bg-muted rounded text-sm"&gt;
                            {execution.output}
                          &lt;/div&gt;
                        )}
                        {execution.error &amp;&amp; (
                          &lt;div className="mt-2 p-2 bg-destructive/10 text-destructive rounded text-sm"&gt;
                            {execution.error}
                          &lt;/div&gt;
                        )}
                      &lt;/div&gt;
                    ))}
                  &lt;/div&gt;
                )}
              &lt;/ScrollArea&gt;
            &lt;/CardContent&gt;
          &lt;/Card&gt;
        &lt;/TabsContent&gt;

        &lt;TabsContent value="config" className="space-y-4"&gt;
          &lt;Card&gt;
            &lt;CardHeader&gt;
              &lt;CardTitle&gt;Configuration Globale&lt;/CardTitle&gt;
              &lt;CardDescription&gt;Paramètres généraux du workflow&lt;/CardDescription&gt;
            &lt;/CardHeader&gt;
            &lt;CardContent className="space-y-4"&gt;
              &lt;div className="grid gap-4"&gt;
                &lt;div&gt;
                  &lt;Label htmlFor="site-url"&gt;URL du Site à Scanner&lt;/Label&gt;
                  &lt;Input
                    id="site-url"
                    placeholder="https://votre-site.com"
                    defaultValue="https://magicpath.ai"
                  /&gt;
                &lt;/div&gt;
                &lt;div&gt;
                  &lt;Label htmlFor="perplexity-key"&gt;Clé API Perplexity&lt;/Label&gt;
                  &lt;Input
                    id="perplexity-key"
                    type="password"
                    placeholder="pplx-..."
                  /&gt;
                &lt;/div&gt;
                &lt;div&gt;
                  &lt;Label htmlFor="openai-key"&gt;Clé API OpenAI&lt;/Label&gt;
                  &lt;Input
                    id="openai-key"
                    type="password"
                    placeholder="sk-..."
                  /&gt;
                &lt;/div&gt;
                &lt;div&gt;
                  &lt;Label htmlFor="anthropic-key"&gt;Clé API Anthropic&lt;/Label&gt;
                  &lt;Input
                    id="anthropic-key"
                    type="password"
                    placeholder="sk-ant-..."
                  /&gt;
                &lt;/div&gt;
              &lt;/div&gt;
              &lt;Separator /&gt;
              &lt;div&gt;
                &lt;Label htmlFor="webhook-url"&gt;Webhook de Notification&lt;/Label&gt;
                &lt;Input
                  id="webhook-url"
                  placeholder="https://hooks.zapier.com/hooks/..."
                /&gt;
              &lt;/div&gt;
              &lt;Button className="w-full"&gt;Sauvegarder la Configuration&lt;/Button&gt;
            &lt;/CardContent&gt;
          &lt;/Card&gt;
        &lt;/TabsContent&gt;
      &lt;/Tabs&gt;

      {/* Modal d'édition de prompt */}
      {editingPrompt &amp;&amp; selectedAgent &amp;&amp; (
        &lt;div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"&gt;
          &lt;Card className="w-full max-w-4xl max-h-[80vh] overflow-hidden"&gt;
            &lt;CardHeader&gt;
              &lt;CardTitle&gt;Éditer le Prompt - {selectedAgent.name}&lt;/CardTitle&gt;
              &lt;CardDescription&gt;
                Modifiez les instructions de l'agent
              &lt;/CardDescription&gt;
            &lt;/CardHeader&gt;
            &lt;CardContent&gt;
              &lt;div className="space-y-4"&gt;
                &lt;div&gt;
                  &lt;Label htmlFor="agent-prompt"&gt;Instructions de l'Agent&lt;/Label&gt;
                  &lt;Textarea
                    id="agent-prompt"
                    value={tempPrompt}
                    onChange={(e) =&gt; setTempPrompt(e.target.value)}
                    rows={20}
                    className="font-mono text-sm"
                  /&gt;
                &lt;/div&gt;
                &lt;div className="flex justify-end gap-2"&gt;
                  &lt;Button
                    variant="outline"
                    onClick={() =&gt; setEditingPrompt(false)}
                  &gt;
                    Annuler
                  &lt;/Button&gt;
                  &lt;Button onClick={handleSavePrompt} className="flex items-center gap-2"&gt;
                    &lt;Save className="w-4 h-4" /&gt;
                    Sauvegarder
                  &lt;/Button&gt;
                &lt;/div&gt;
              &lt;/div&gt;
            &lt;/CardContent&gt;
          &lt;/Card&gt;
        &lt;/div&gt;
      )}
    &lt;/div&gt;
  );
}