import { useState } from 'react';
import { ArrowRight, Plus, Settings, Play, Copy, RotateCcw } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';

interface WorkflowNode {
  id: string;
  type: 'topic' | 'strategist' | 'ghostwriter' | 'seo';
  label: string;
  status: 'pending' | 'running' | 'completed' | 'error';
}

export function WorkflowBuilder() {
  const [nodes, setNodes] = useState<WorkflowNode[]>([
    { id: '1', type: 'topic', label: 'Topic', status: 'completed' },
    { id: '2', type: 'strategist', label: 'Strategist', status: 'completed' },
    { id: '3', type: 'ghostwriter', label: 'Ghostwriter', status: 'running' },
    { id: '4', type: 'seo', label: 'SEO', status: 'pending' },
  ]);

  const [connections] = useState([
    { from: '1', to: '2' },
    { from: '2', to: '3' },
    { from: '3', to: '4' },
  ]);

  const getNodeColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 border-green-300 text-green-800';
      case 'running': return 'bg-blue-100 border-blue-300 text-blue-800';
      case 'error': return 'bg-red-100 border-red-300 text-red-800';
      default: return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed': return <Badge className="bg-green-500">Terminé</Badge>;
      case 'running': return <Badge className="bg-blue-500">En cours</Badge>;
      case 'error': return <Badge className="bg-red-500">Erreur</Badge>;
      default: return <Badge variant="secondary">En attente</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Workflow Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Workflow (type Make)</h3>
          <p className="text-sm text-gray-500">Topic: Ics: Reporting Power BI Finance</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Plus className="w-4 h-4 mr-1" />
            Node
          </Button>
          <Button variant="outline" size="sm">
            <Copy className="w-4 h-4 mr-1" />
            Copier JSON
          </Button>
          <Button variant="outline" size="sm">
            <RotateCcw className="w-4 h-4 mr-1" />
            Reset
          </Button>
          <Button size="sm" className="bg-teal-500 hover:bg-teal-600">
            <Play className="w-4 h-4 mr-1" />
            Exécuter
          </Button>
        </div>
      </div>

      {/* Workflow Canvas */}
      <Card>
        <CardContent className="p-8">
          <div className="flex items-center justify-center space-x-8">
            {nodes.map((node, index) => (
              <div key={node.id} className="flex items-center">
                {/* Node */}
                <div className="relative">
                  <div 
                    className={`
                      w-24 h-16 rounded-lg border-2 flex items-center justify-center cursor-pointer
                      transition-all hover:shadow-md ${getNodeColor(node.status)}
                    `}
                  >
                    <div className="text-center">
                      <div className="text-sm font-medium">{node.label}</div>
                      <div className="text-xs mt-1">
                        {getStatusBadge(node.status)}
                      </div>
                    </div>
                  </div>
                  
                  {/* Settings button */}
                  <Button
                    variant="outline"
                    size="sm"
                    className="absolute -top-2 -right-2 w-6 h-6 rounded-full p-0"
                  >
                    <Settings className="w-3 h-3" />
                  </Button>
                </div>

                {/* Arrow */}
                {index < nodes.length - 1 && (
                  <ArrowRight className="w-6 h-6 text-gray-400 mx-4" />
                )}
              </div>
            ))}
          </div>

          {/* Connection Info */}
          <div className="mt-8 grid grid-cols-2 gap-6">
            <Card>
              <CardContent className="p-4">
                <h4 className="font-medium mb-3">Propriétés du nœud</h4>
                <p className="text-sm text-gray-600">Sélectionnez un nœud pour l'éditer</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <h4 className="font-medium mb-3">Connexions</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Topic → Strategist</span>
                    <Button variant="link" size="sm" className="h-auto p-0">Supprimer</Button>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Strategist → Ghostwriter</span>
                    <Button variant="link" size="sm" className="h-auto p-0">Supprimer</Button>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Ghostwriter → SEO</span>
                    <Button variant="link" size="sm" className="h-auto p-0">Supprimer</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}