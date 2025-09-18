import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { ContentStudio } from './components/ContentStudio';
import { AgentsList } from './components/AgentsList';
import { Button } from './components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { BarChart, Users, FileText, TrendingUp } from 'lucide-react';

function Dashboard() {
  const stats = [
    { title: 'Articles publiés', value: '247', icon: FileText, change: '+12%' },
    { title: 'Vues mensuelles', value: '45.2K', icon: Users, change: '+8%' },
    { title: 'Score SEO moyen', value: '72/100', icon: TrendingUp, change: '+5%' },
    { title: 'Workflows actifs', value: '12', icon: BarChart, change: '+3%' },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Dashboard</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600">{stat.change}</span> depuis le mois dernier
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Activité récente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm">Workflow "SEO Optimization" terminé</span>
                <span className="text-xs text-gray-500 ml-auto">Il y a 2h</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm">Nouvel article généré: "Power BI Analytics"</span>
                <span className="text-xs text-gray-500 ml-auto">Il y a 4h</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span className="text-sm">Agent "Content Writer" mis à jour</span>
                <span className="text-xs text-gray-500 ml-auto">Il y a 6h</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Performance SEO</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">Articles optimisés</span>
                <span className="text-sm font-medium">89%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Score moyen</span>
                <span className="text-sm font-medium">72/100</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Mots-clés ciblés</span>
                <span className="text-sm font-medium">156</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function PlaceholderSection({ title }: { title: string }) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">{title}</h2>
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
            <p className="text-gray-500">Cette section sera développée prochainement</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function App() {
  const [activeSection, setActiveSection] = useState('content-studio');

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <Dashboard />;
      case 'content-studio':
        return <ContentStudio />;
      case 'ai-agents':
        return <AgentsList />;
      case 'approvals':
        return <PlaceholderSection title="Approvals" />;
      case 'seo':
        return <PlaceholderSection title="SEO" />;
      case 'analytics':
        return <PlaceholderSection title="Analytics" />;
      case 'settings':
        return <PlaceholderSection title="Settings" />;
      default:
        return <ContentStudio />;
    }
  };

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Sidebar */}
      <Sidebar 
        activeSection={activeSection} 
        onSectionChange={setActiveSection} 
      />
      
      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <nav className="flex space-x-6">
                <a href="#" className="text-sm font-medium text-gray-900">Accueil</a>
                <a href="#" className="text-sm font-medium text-gray-500 hover:text-gray-900">Expertise</a>
                <a href="#" className="text-sm font-medium text-gray-500 hover:text-gray-900">Blog</a>
                <a href="#" className="text-sm font-medium text-gray-500 hover:text-gray-900">Bibliothèque</a>
                <a href="#" className="text-sm font-medium text-gray-500 hover:text-gray-900">Contact</a>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">Me contacter</Button>
              <Button size="sm" className="bg-black text-white hover:bg-gray-800">Se connecter</Button>
            </div>
          </div>
        </header>
        
        {/* Page Content */}
        <main className="p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}