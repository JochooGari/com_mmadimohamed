import { useState } from 'react';
import { Button } from './ui/button';
import { WorkflowBuilder } from './WorkflowBuilder';
import { ArticleGenerator } from './ArticleGenerator';

export function ContentStudio() {
  const [activeTab, setActiveTab] = useState<'articles' | 'ressources'>('articles');

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex space-x-4">
        <Button 
          variant={activeTab === 'articles' ? 'default' : 'outline'}
          onClick={() => setActiveTab('articles')}
          className={activeTab === 'articles' ? 'bg-teal-500 hover:bg-teal-600' : ''}
        >
          Articles
        </Button>
        <Button 
          variant={activeTab === 'ressources' ? 'default' : 'outline'}
          onClick={() => setActiveTab('ressources')}
          className={activeTab === 'ressources' ? 'bg-teal-500 hover:bg-teal-600' : ''}
        >
          Ressources
        </Button>
      </div>

      {/* Workflow Builder */}
      <WorkflowBuilder />

      {/* Content based on active tab */}
      {activeTab === 'articles' && <ArticleGenerator />}
      
      {activeTab === 'ressources' && (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Ressources</h3>
          <p className="text-gray-500">Interface de gestion des ressources à venir...</p>
        </div>
      )}
    </div>
  );
}