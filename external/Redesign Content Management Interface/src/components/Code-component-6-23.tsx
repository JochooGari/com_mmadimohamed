import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Bot, Plus, Settings } from 'lucide-react';

export function AgentsList() {
  const agents = [
    {
      name: 'Scraping',
      type: 'Ghostwriting',
      status: 'active',
      description: 'Agent spécialisé dans la collecte de données web'
    },
    {
      name: 'Newsletter',
      type: 'Strategy',
      status: 'active', 
      description: 'Création automatique de newsletters personnalisées'
    },
    {
      name: 'Executive Assistant',
      type: 'SEO Expert',
      status: 'inactive',
      description: 'Assistant virtuel pour tâches administratives'
    },
    {
      name: 'Content Marketer',
      type: 'Content Creation',
      status: 'active',
      description: 'Génération de contenu marketing optimisé'
    }
  ];

  const getStatusColor = (status: string) => {
    return status === 'active' 
      ? 'bg-green-100 text-green-800' 
      : 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Agents IA</h2>
        <Button className="bg-teal-500 hover:bg-teal-600">
          <Plus className="w-4 h-4 mr-2" />
          Ajouter un agent (ex: ADS)
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {agents.map((agent, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Bot className="w-5 h-5 text-teal-500" />
                  <CardTitle className="text-base">{agent.name}</CardTitle>
                </div>
                <Button variant="ghost" size="sm">
                  <Settings className="w-4 h-4" />
                </Button>
              </div>
              <Badge className={getStatusColor(agent.status)}>
                {agent.status === 'active' ? 'Actif' : 'Inactif'}
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-gray-600">Type: </span>
                  <span className="text-sm">{agent.type}</span>
                </div>
                <p className="text-sm text-gray-600">{agent.description}</p>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    Configurer
                  </Button>
                  <Button 
                    size="sm" 
                    className={agent.status === 'active' 
                      ? 'bg-red-500 hover:bg-red-600' 
                      : 'bg-teal-500 hover:bg-teal-600'
                    }
                  >
                    {agent.status === 'active' ? 'Arrêter' : 'Activer'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}