import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Input } from '../components/ui/input';
import WorkflowCanvas from '../components/admin/WorkflowCanvas';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Save, 
  Download, 
  Upload,
  Workflow,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

type WorkflowTemplate = {
  id: string;
  name: string;
  description: string;
  category: string;
  nodes: any[];
  edges: any[];
  lastUsed?: string;
};

const WORKFLOW_TEMPLATES: WorkflowTemplate[] = [
  {
    id: 'content-pipeline',
    name: 'Pipeline de Contenu Complet',
    description: 'Research → Strategist → Ghostwriter → Lead Validation → CEO Approval → Publication',
    category: 'Content',
    nodes: [
      { id: 'research', x: 50, y: 100, label: 'Research' },
      { id: 'strategist', x: 200, y: 100, label: 'Strategist' },
      { id: 'ghostwriter', x: 350, y: 100, label: 'Ghostwriter' },
      { id: 'lead', x: 500, y: 100, label: 'Content Lead' },
      { id: 'ceo', x: 650, y: 100, label: 'CEO Approval' },
      { id: 'community', x: 800, y: 100, label: 'Community' },
      { id: 'analyst', x: 950, y: 100, label: 'Analyst' }
    ],
    edges: [
      { from: 'research', to: 'strategist' },
      { from: 'strategist', to: 'ghostwriter' },
      { from: 'ghostwriter', to: 'lead' },
      { from: 'lead', to: 'ceo' },
      { from: 'ceo', to: 'community' },
      { from: 'community', to: 'analyst' }
    ]
  },
  {
    id: 'seo-optimization',
    name: 'Optimisation SEO',
    description: 'Analyse des mots-clés → Optimisation du contenu → Validation technique',
    category: 'SEO',
    nodes: [
      { id: 'topic', x: 50, y: 100, label: 'Topic' },
      { id: 'keyword-research', x: 200, y: 100, label: 'Keyword Research' },
      { id: 'seo-optimizer', x: 350, y: 100, label: 'SEO Optimizer' },
      { id: 'technical-check', x: 500, y: 100, label: 'Technical Check' }
    ],
    edges: [
      { from: 'topic', to: 'keyword-research' },
      { from: 'keyword-research', to: 'seo-optimizer' },
      { from: 'seo-optimizer', to: 'technical-check' }
    ]
  },
  {
    id: 'social-media',
    name: 'Publication Réseaux Sociaux',
    description: 'Génération de posts adaptés pour LinkedIn, Twitter et Facebook',
    category: 'Social Media',
    nodes: [
      { id: 'topic', x: 50, y: 100, label: 'Topic' },
      { id: 'content-adapter', x: 200, y: 50, label: 'LinkedIn Adapter' },
      { id: 'twitter-adapter', x: 200, y: 100, label: 'Twitter Adapter' },
      { id: 'facebook-adapter', x: 200, y: 150, label: 'Facebook Adapter' },
      { id: 'scheduler', x: 350, y: 100, label: 'Scheduler' }
    ],
    edges: [
      { from: 'topic', to: 'content-adapter' },
      { from: 'topic', to: 'twitter-adapter' },
      { from: 'topic', to: 'facebook-adapter' },
      { from: 'content-adapter', to: 'scheduler' },
      { from: 'twitter-adapter', to: 'scheduler' },
      { from: 'facebook-adapter', to: 'scheduler' }
    ]
  }
];

export default function AdminWorkflow() {
  const [selectedTemplate, setSelectedTemplate] = useState<WorkflowTemplate | null>(null);
  const [workflowName, setWorkflowName] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [executionLogs, setExecutionLogs] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('canvas');

  const handleTemplateSelect = (template: WorkflowTemplate) => {
    setSelectedTemplate(template);
    setWorkflowName(template.name);
  };

  const handleSaveWorkflow = () => {
    if (!workflowName.trim()) return;
    // Logic to save current workflow
    console.log('Saving workflow:', workflowName);
  };

  const handleExecuteWorkflow = () => {
    setIsRunning(true);
    setExecutionLogs(['🚀 Démarrage du workflow...']);
    
    // Simulate workflow execution
    setTimeout(() => {
      setExecutionLogs(prev => [...prev, '✅ Workflow exécuté avec succès']);
      setIsRunning(false);
    }, 3000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'running': return 'bg-blue-100 text-blue-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Workflow Automation</h1>
          <p className="text-gray-600 mt-1">Créez et gérez vos workflows d'automatisation IA</p>
        </div>
        <div className="flex items-center space-x-3">
          <Input
            placeholder="Nom du workflow"
            value={workflowName}
            onChange={(e) => setWorkflowName(e.target.value)}
            className="w-64"
          />
          <Button variant="outline" onClick={handleSaveWorkflow}>
            <Save className="w-4 h-4 mr-2" />
            Sauvegarder
          </Button>
          <Button 
            onClick={handleExecuteWorkflow}
            disabled={isRunning}
            className={isRunning ? 'bg-gray-400' : 'bg-teal-500 hover:bg-teal-600'}
          >
            {isRunning ? (
              <Pause className="w-4 h-4 mr-2" />
            ) : (
              <Play className="w-4 h-4 mr-2" />
            )}
            {isRunning ? 'En cours...' : 'Exécuter'}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="canvas">Canvas Workflow</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="history">Historique</TabsTrigger>
        </TabsList>

        {/* Canvas Tab */}
        <TabsContent value="canvas" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <Workflow className="w-5 h-5 mr-2 text-teal-600" />
                  Éditeur Visuel de Workflow
                </CardTitle>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    <Upload className="w-4 h-4 mr-2" />
                    Importer
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Exporter
                  </Button>
                  <Button variant="outline" size="sm">
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Reset
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <WorkflowCanvas onAIResult={(result) => {
                setExecutionLogs(prev => [...prev, `✨ Résultat IA: ${JSON.stringify(result, null, 2)}`]);
              }} />
            </CardContent>
          </Card>

          {/* Execution Status */}
          {(isRunning || executionLogs.length > 0) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="w-5 h-5 mr-2 text-blue-600" />
                  Statut d'Exécution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {executionLogs.map((log, index) => (
                    <div key={index} className="flex items-center space-x-2 text-sm">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span>{log}</span>
                    </div>
                  ))}
                  {isRunning && (
                    <div className="flex items-center space-x-2 text-sm">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                      <span>En cours d'exécution...</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {WORKFLOW_TEMPLATES.map((template) => (
              <Card 
                key={template.id} 
                className="cursor-pointer hover:shadow-lg transition-shadow duration-200"
                onClick={() => handleTemplateSelect(template)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base">{template.name}</CardTitle>
                      <Badge variant="outline" className="mt-2 text-xs">
                        {template.category}
                      </Badge>
                    </div>
                    <Workflow className="w-6 h-6 text-teal-500" />
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">{template.description}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{template.nodes.length} étapes</span>
                    {template.lastUsed && (
                      <span>Utilisé le {template.lastUsed}</span>
                    )}
                  </div>
                  <Button 
                    size="sm" 
                    className="w-full mt-4 bg-teal-500 hover:bg-teal-600"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTemplateSelect(template);
                      setActiveTab('canvas');
                    }}
                  >
                    Utiliser ce template
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Create Custom Template */}
          <Card className="border-dashed border-2 border-gray-300">
            <CardContent className="text-center py-12">
              <Workflow className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Créer un template personnalisé</h3>
              <p className="text-gray-500 mb-6">Créez vos propres workflows réutilisables</p>
              <Button onClick={() => setActiveTab('canvas')} className="bg-teal-500 hover:bg-teal-600">
                Nouveau template
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Historique des Exécutions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { id: 1, workflow: 'Pipeline de Contenu Complet', status: 'completed', date: '2025-01-15 14:30', duration: '2m 45s' },
                  { id: 2, workflow: 'Optimisation SEO', status: 'completed', date: '2025-01-15 10:15', duration: '1m 20s' },
                  { id: 3, workflow: 'Publication Réseaux Sociaux', status: 'error', date: '2025-01-14 16:45', duration: '0m 30s' },
                  { id: 4, workflow: 'Pipeline de Contenu Complet', status: 'completed', date: '2025-01-14 09:20', duration: '3m 10s' },
                ].map((execution) => (
                  <div key={execution.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        {execution.status === 'completed' ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : execution.status === 'error' ? (
                          <AlertCircle className="w-5 h-5 text-red-500" />
                        ) : (
                          <Clock className="w-5 h-5 text-blue-500" />
                        )}
                        <Badge className={getStatusColor(execution.status)}>
                          {execution.status === 'completed' ? 'Terminé' : 
                           execution.status === 'error' ? 'Erreur' : 'En cours'}
                        </Badge>
                      </div>
                      <div>
                        <h4 className="font-medium">{execution.workflow}</h4>
                        <p className="text-sm text-gray-500">{execution.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className="text-sm text-gray-500">{execution.duration}</span>
                      <Button variant="outline" size="sm">
                        Voir détails
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Actions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <Workflow className="w-5 h-5 text-blue-500 mt-0.5" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">Conseils pour les Workflows</h3>
            <div className="text-sm text-blue-700 mt-1 space-y-1">
              <p>• Glissez-déposez les nœuds pour les repositionner</p>
              <p>• Double-cliquez pour connecter deux nœuds</p>
              <p>• Utilisez les templates pour démarrer rapidement</p>
              <p>• Sauvegardez vos workflows pour les réutiliser</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}