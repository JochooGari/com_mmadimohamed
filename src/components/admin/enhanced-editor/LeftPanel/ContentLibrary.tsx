import { useState } from 'react';
import { Search, FileText, Image, Code, Quote, Table, Star, Plus, Copy } from 'lucide-react';

interface Template {
  id: string;
  name: string;
  description: string;
  category: 'intro' | 'section' | 'conclusion' | 'cta' | 'table' | 'quote' | 'code';
  content: string;
  tags: string[];
  isPopular: boolean;
  wordCount: number;
}

interface Snippet {
  id: string;
  name: string;
  content: string;
  type: 'text' | 'markdown' | 'html' | 'code';
  category: string;
}

interface ContentLibraryProps {
  onInsertContent: (content: string) => void;
}

const DEFAULT_TEMPLATES: Template[] = [
  {
    id: 'intro-engaging',
    name: 'Introduction Engageante',
    description: 'Accroche avec statistique et question',
    category: 'intro',
    content: `## Introduction

Saviez-vous que [STATISTIQUE] ? Cette donnée révèle l'importance cruciale de [SUJET] dans notre environnement professionnel actuel.

Dans cet article, nous explorerons :
- [Point clé 1]
- [Point clé 2]
- [Point clé 3]

Découvrons ensemble comment [OBJECTIF PRINCIPAL].`,
    tags: ['SEO', 'engagement', 'statistique'],
    isPopular: true,
    wordCount: 65
  },
  {
    id: 'section-benefits',
    name: 'Section Avantages',
    description: 'Liste des bénéfices avec exemples',
    category: 'section',
    content: `## Les Avantages de [SUJET]

### 1. [Avantage Principal]
[Description détaillée avec exemple concret]

### 2. [Deuxième Avantage]
[Explication avec données chiffrées si possible]

### 3. [Troisième Avantage]
[Témoignage ou cas d'usage]

💡 **À retenir :** [Point clé synthétique]`,
    tags: ['structure', 'listes', 'bénéfices'],
    isPopular: true,
    wordCount: 85
  },
  {
    id: 'conclusion-cta',
    name: 'Conclusion avec CTA',
    description: 'Synthèse et appel à l\'action',
    category: 'conclusion',
    content: `## Conclusion

[SUJET] représente un enjeu majeur pour [CIBLE]. Nous avons vu que :

✅ [Récap point 1]
✅ [Récap point 2]
✅ [Récap point 3]

**Prêt à passer à l'action ?**

[APPEL À L'ACTION SPÉCIFIQUE]

---

*Vous avez des questions sur [SUJET] ? N'hésitez pas à [CONTACT METHOD].*`,
    tags: ['conclusion', 'CTA', 'synthèse'],
    isPopular: true,
    wordCount: 75
  },
  {
    id: 'table-comparison',
    name: 'Tableau Comparatif',
    description: 'Comparaison de solutions/options',
    category: 'table',
    content: `## Comparaison des Solutions

| Critère | Solution A | Solution B | Solution C |
|---------|------------|------------|------------|
| **Prix** | [Prix A] | [Prix B] | [Prix C] |
| **Facilité d'usage** | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐ |
| **Fonctionnalités** | [Détail A] | [Détail B] | [Détail C] |
| **Support** | [Support A] | [Support B] | [Support C] |

**Notre recommandation :** [Justification du choix optimal]`,
    tags: ['tableau', 'comparaison', 'analyse'],
    isPopular: false,
    wordCount: 45
  }
];

const DEFAULT_SNIPPETS: Snippet[] = [
  {
    id: 'attention-box',
    name: 'Boîte d\'attention',
    content: `> ⚠️ **Important**
> [Message important à retenir]`,
    type: 'markdown',
    category: 'mise-en-forme'
  },
  {
    id: 'key-takeaway',
    name: 'Point clé',
    content: `💡 **À retenir :**
[Point essentiel à mémoriser]`,
    type: 'markdown',
    category: 'mise-en-forme'
  },
  {
    id: 'pro-tip',
    name: 'Conseil Pro',
    content: `🚀 **Conseil Pro**
[Astuce d'expert ou technique avancée]`,
    type: 'markdown',
    category: 'mise-en-forme'
  }
];

export default function ContentLibrary({ onInsertContent }: ContentLibraryProps) {
  const [activeTab, setActiveTab] = useState<'templates' | 'snippets'>('templates');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const templates = DEFAULT_TEMPLATES;
  const snippets = DEFAULT_SNIPPETS;

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const filteredSnippets = snippets.filter(snippet => {
    const matchesSearch = snippet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         snippet.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || snippet.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = [
    { id: 'all', name: 'Tout' },
    { id: 'intro', name: 'Intros' },
    { id: 'section', name: 'Sections' },
    { id: 'conclusion', name: 'Conclusions' },
    { id: 'table', name: 'Tableaux' },
    { id: 'quote', name: 'Citations' },
    { id: 'mise-en-forme', name: 'Mise en forme' }
  ];

  const handleInsertTemplate = (template: Template) => {
    onInsertContent(template.content);
  };

  const handleInsertSnippet = (snippet: Snippet) => {
    onInsertContent(snippet.content);
  };

  const copyToClipboard = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
    } catch (err) {
      console.error('Erreur copie clipboard:', err);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
          Bibliothèque de contenu
        </h3>

        {/* Tabs */}
        <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1 mb-3">
          <button
            onClick={() => setActiveTab('templates')}
            className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'templates'
                ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
            }`}
          >
            <FileText className="w-4 h-4 inline mr-2" />
            Templates
          </button>
          <button
            onClick={() => setActiveTab('snippets')}
            className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'snippets'
                ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
            }`}
          >
            <Code className="w-4 h-4 inline mr-2" />
            Snippets
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-1 mb-4">
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-2 py-1 text-xs rounded-full transition-colors ${
                selectedCategory === category.id
                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {activeTab === 'templates' && (
          <>
            {filteredTemplates.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Aucun template trouvé</p>
              </div>
            ) : (
              filteredTemplates.map(template => (
                <div
                  key={template.id}
                  className="border border-gray-200 dark:border-gray-600 rounded-lg p-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-sm text-gray-900 dark:text-white">
                          {template.name}
                        </h4>
                        {template.isPopular && (
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        )}
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {template.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {template.wordCount} mots
                      </span>
                      <div className="flex gap-1">
                        {template.tags.slice(0, 2).map(tag => (
                          <span
                            key={tag}
                            className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full dark:bg-gray-600 dark:text-gray-300"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => copyToClipboard(template.content)}
                        className="p-1 text-gray-400 hover:text-gray-600 rounded transition-colors"
                        title="Copier"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleInsertTemplate(template)}
                        className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                      >
                        Insérer
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </>
        )}

        {activeTab === 'snippets' && (
          <>
            {filteredSnippets.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <Code className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Aucun snippet trouvé</p>
              </div>
            ) : (
              filteredSnippets.map(snippet => (
                <div
                  key={snippet.id}
                  className="border border-gray-200 dark:border-gray-600 rounded-lg p-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-sm text-gray-900 dark:text-white">
                      {snippet.name}
                    </h4>
                    <span className="text-xs bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded-full dark:bg-purple-900 dark:text-purple-200">
                      {snippet.type}
                    </span>
                  </div>

                  <div className="bg-gray-100 dark:bg-gray-600 rounded p-2 mb-2">
                    <code className="text-xs text-gray-800 dark:text-gray-200 font-mono">
                      {snippet.content.substring(0, 80)}
                      {snippet.content.length > 80 && '...'}
                    </code>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {snippet.category}
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => copyToClipboard(snippet.content)}
                        className="p-1 text-gray-400 hover:text-gray-600 rounded transition-colors"
                        title="Copier"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleInsertSnippet(snippet)}
                        className="px-2 py-1 text-xs bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
                      >
                        Insérer
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </>
        )}
      </div>

      {/* Quick Actions */}
      <div className="pt-4 border-t border-gray-200 dark:border-gray-600">
        <button className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20 rounded-md transition-colors">
          <Plus className="w-4 h-4" />
          Créer un template personnalisé
        </button>
      </div>
    </div>
  );
}