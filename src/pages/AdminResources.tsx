import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { 
  FolderOpen, 
  Plus, 
  Edit3, 
  Trash2, 
  Download, 
  Upload,
  Save,
  Search,
  Filter,
  Calendar,
  User,
  FileText,
  Image,
  Archive,
  Video,
  Eye,
  BarChart3,
  TrendingUp
} from 'lucide-react';

type Resource = {
  id: string;
  title: string;
  description: string;
  category: string;
  type: 'pdf' | 'excel' | 'powerbi' | 'video' | 'template' | 'guide';
  fileUrl: string;
  thumbnailUrl?: string;
  downloadCount: number;
  fileSize: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  featured: boolean;
  status: 'draft' | 'published';
};

const SAMPLE_RESOURCES: Resource[] = [
  {
    id: '1',
    title: 'Template Dashboard Power BI - Finance',
    description: 'Template complet pour créer un tableau de bord financier avec Power BI',
    category: 'Finance',
    type: 'powerbi',
    fileUrl: '#',
    thumbnailUrl: '/api/placeholder/300/200',
    downloadCount: 2847,
    fileSize: '12.5 MB',
    createdBy: 'Admin',
    createdAt: '2025-01-10T09:00:00Z',
    updatedAt: '2025-01-15T14:30:00Z',
    tags: ['Power BI', 'Finance', 'Template', 'Dashboard'],
    featured: true,
    status: 'published'
  },
  {
    id: '2',
    title: 'Guide DAX - Fonctions essentielles',
    description: 'PDF de 45 pages avec toutes les fonctions DAX indispensables',
    category: 'Documentation',
    type: 'pdf',
    fileUrl: '#',
    downloadCount: 1523,
    fileSize: '8.2 MB',
    createdBy: 'Expert DAX',
    createdAt: '2025-01-08T15:30:00Z',
    updatedAt: '2025-01-12T10:15:00Z',
    tags: ['DAX', 'PDF', 'Guide', 'Power BI'],
    featured: true,
    status: 'published'
  },
  {
    id: '3',
    title: 'Modèle Excel - Analyse des ventes',
    description: 'Fichier Excel avec formules avancées pour l\'analyse des ventes',
    category: 'Sales',
    type: 'excel',
    fileUrl: '#',
    downloadCount: 895,
    fileSize: '4.7 MB',
    createdBy: 'Sales Analyst',
    createdAt: '2025-01-05T11:20:00Z',
    updatedAt: '2025-01-14T16:45:00Z',
    tags: ['Excel', 'Sales', 'Analysis', 'Template'],
    featured: false,
    status: 'published'
  },
  {
    id: '4',
    title: 'Tutoriel Vidéo - Power Query',
    description: 'Série de vidéos pour maîtriser Power Query étape par étape',
    category: 'Tutorial',
    type: 'video',
    fileUrl: '#',
    downloadCount: 1247,
    fileSize: '150 MB',
    createdBy: 'Video Creator',
    createdAt: '2025-01-03T14:00:00Z',
    updatedAt: '2025-01-10T09:30:00Z',
    tags: ['Power Query', 'Video', 'Tutorial', 'Training'],
    featured: false,
    status: 'draft'
  }
];

const CATEGORIES = ['Tous', 'Finance', 'Sales', 'Marketing', 'Documentation', 'Tutorial'];
const TYPES = ['Tous', 'pdf', 'excel', 'powerbi', 'video', 'template', 'guide'];

export default function AdminResources() {
  const [resources, setResources] = useState<Resource[]>(SAMPLE_RESOURCES);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Tous');
  const [typeFilter, setTypeFilter] = useState('Tous');
  const [showForm, setShowForm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [draft, setDraft] = useState<Partial<Resource>>({
    title: '',
    description: '',
    category: 'Documentation',
    type: 'pdf',
    tags: [],
    featured: false,
    status: 'draft'
  });

  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'Tous' || resource.category === categoryFilter;
    const matchesType = typeFilter === 'Tous' || resource.type === typeFilter;
    return matchesSearch && matchesCategory && matchesType;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'pdf': return <FileText className="w-4 h-4" />;
      case 'excel': return <BarChart3 className="w-4 h-4" />;
      case 'powerbi': return <TrendingUp className="w-4 h-4" />;
      case 'video': return <Video className="w-4 h-4" />;
      case 'template': return <Archive className="w-4 h-4" />;
      case 'guide': return <FileText className="w-4 h-4" />;
      default: return <FolderOpen className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'pdf': return 'bg-red-100 text-red-800';
      case 'excel': return 'bg-green-100 text-green-800';
      case 'powerbi': return 'bg-yellow-100 text-yellow-800';
      case 'video': return 'bg-purple-100 text-purple-800';
      case 'template': return 'bg-blue-100 text-blue-800';
      case 'guide': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleSaveResource = () => {
    if (!draft.title?.trim()) return;
    
    const now = new Date().toISOString();
    const resource: Resource = {
      id: selectedResource?.id || Date.now().toString(),
      title: draft.title,
      description: draft.description || '',
      category: draft.category || 'Documentation',
      type: draft.type as Resource['type'] || 'pdf',
      fileUrl: draft.fileUrl || '#',
      downloadCount: selectedResource?.downloadCount || 0,
      fileSize: draft.fileSize || '0 MB',
      createdBy: draft.createdBy || 'User',
      createdAt: selectedResource?.createdAt || now,
      updatedAt: now,
      tags: draft.tags || [],
      featured: draft.featured || false,
      status: draft.status as Resource['status'] || 'draft'
    };

    if (selectedResource) {
      setResources(prev => prev.map(r => r.id === selectedResource.id ? resource : r));
    } else {
      setResources(prev => [resource, ...prev]);
    }

    // Reset form
    setDraft({});
    setSelectedResource(null);
    setIsEditing(false);
    setShowForm(false);
  };

  const handleEditResource = (resource: Resource) => {
    setSelectedResource(resource);
    setDraft(resource);
    setIsEditing(true);
    setShowForm(true);
  };

  const handleDeleteResource = (id: string) => {
    setResources(prev => prev.filter(r => r.id !== id));
  };

  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Mock file upload
      const mockUrl = URL.createObjectURL(file);
      const fileSize = (file.size / (1024 * 1024)).toFixed(1) + ' MB';
      setDraft(prev => ({
        ...prev,
        fileUrl: mockUrl,
        fileSize: fileSize
      }));
    }
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(new Date(dateString));
  };

  const formatDownloads = (count: number) => {
    if (count >= 1000) {
      return (count / 1000).toFixed(1) + 'k';
    }
    return count.toString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des Ressources</h1>
          <p className="text-gray-600 mt-1">Gérez vos templates, guides et fichiers téléchargeables</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button onClick={() => { setShowForm(true); setDraft({}); setSelectedResource(null); setIsEditing(false); }}>
            <Plus className="w-4 h-4 mr-2" />
            Nouvelle Ressource
          </Button>
        </div>
      </div>

      <Tabs defaultValue="list" className="space-y-6">
        <TabsList>
          <TabsTrigger value="list">Toutes les Ressources</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Resources List Tab */}
        <TabsContent value="list" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Input
                      placeholder="Rechercher des ressources..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Filter className="w-4 h-4 text-gray-500" />
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    {CATEGORIES.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    {TYPES.map(type => (
                      <option key={type} value={type}>{type === 'Tous' ? 'Tous types' : type.toUpperCase()}</option>
                    ))}
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Resource Form */}
          {showForm && (
            <Card className="border-teal-200 bg-teal-50/50">
              <CardHeader>
                <CardTitle>
                  {isEditing ? 'Modifier la ressource' : 'Nouvelle ressource'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">
                      Titre
                    </label>
                    <Input
                      placeholder="Titre de la ressource"
                      value={draft.title || ''}
                      onChange={(e) => setDraft(d => ({ ...d, title: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">
                      Catégorie
                    </label>
                    <select
                      value={draft.category || 'Documentation'}
                      onChange={(e) => setDraft(d => ({ ...d, category: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                      {CATEGORIES.slice(1).map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">
                      Type de fichier
                    </label>
                    <select
                      value={draft.type || 'pdf'}
                      onChange={(e) => setDraft(d => ({ ...d, type: e.target.value as Resource['type'] }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                      {TYPES.slice(1).map(type => (
                        <option key={type} value={type}>{type.toUpperCase()}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">
                      Statut
                    </label>
                    <select
                      value={draft.status || 'draft'}
                      onChange={(e) => setDraft(d => ({ ...d, status: e.target.value as Resource['status'] }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                      <option value="draft">Brouillon</option>
                      <option value="published">Publié</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">
                    Description
                  </label>
                  <Textarea
                    placeholder="Description de la ressource"
                    value={draft.description || ''}
                    onChange={(e) => setDraft(d => ({ ...d, description: e.target.value }))}
                    rows={3}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">
                    Tags (séparés par des virgules)
                  </label>
                  <Input
                    placeholder="ex: Power BI, Template, Finance"
                    value={draft.tags?.join(', ') || ''}
                    onChange={(e) => setDraft(d => ({ 
                      ...d, 
                      tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)
                    }))}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">
                    Fichier
                  </label>
                  <div className="flex items-center space-x-3">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={handleFileUpload}
                      className="flex items-center"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Choisir un fichier
                    </Button>
                    {draft.fileSize && (
                      <span className="text-sm text-gray-600">
                        Fichier sélectionné ({draft.fileSize})
                      </span>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileSelect}
                    className="hidden"
                    accept=".pdf,.xlsx,.xls,.pptx,.mp4,.zip"
                  />
                </div>

                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={draft.featured || false}
                    onChange={(e) => setDraft(d => ({ ...d, featured: e.target.checked }))}
                    className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                  />
                  <label htmlFor="featured" className="text-sm text-gray-700">
                    Mettre en avant cette ressource
                  </label>
                </div>

                <div className="flex items-center space-x-3 pt-4">
                  <Button onClick={handleSaveResource} className="bg-teal-500 hover:bg-teal-600">
                    <Save className="w-4 h-4 mr-2" />
                    {isEditing ? 'Mettre à jour' : 'Créer la ressource'}
                  </Button>
                  <Button variant="outline" onClick={() => { setShowForm(false); setDraft({}); setSelectedResource(null); }}>
                    Annuler
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Resources Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredResources.map((resource) => (
              <Card key={resource.id} className="hover:shadow-lg transition-shadow duration-200">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge className={getTypeColor(resource.type)}>
                          <div className="flex items-center space-x-1">
                            {getTypeIcon(resource.type)}
                            <span>{resource.type.toUpperCase()}</span>
                          </div>
                        </Badge>
                        <Badge className={getStatusColor(resource.status)}>
                          {resource.status === 'published' ? 'Publié' : 'Brouillon'}
                        </Badge>
                        {resource.featured && (
                          <Badge className="bg-yellow-100 text-yellow-800">
                            Mis en avant
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-base line-clamp-2">
                        {resource.title}
                      </CardTitle>
                    </div>
                    {resource.thumbnailUrl && (
                      <div className="w-16 h-16 bg-gray-100 rounded-lg ml-2 flex items-center justify-center">
                        <Image className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                  </div>
                </CardHeader>

                <CardContent>
                  <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                    {resource.description}
                  </p>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span className="flex items-center">
                        <Download className="w-3 h-3 mr-1" />
                        {formatDownloads(resource.downloadCount)} téléchargements
                      </span>
                      <span>{resource.fileSize}</span>
                    </div>

                    {resource.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {resource.tags.slice(0, 3).map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {resource.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{resource.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}

                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span className="flex items-center">
                        <User className="w-3 h-3 mr-1" />
                        {resource.createdBy}
                      </span>
                      <span className="flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        {formatDate(resource.updatedAt)}
                      </span>
                    </div>

                    <div className="flex space-x-2 pt-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => handleEditResource(resource)}
                      >
                        <Edit3 className="w-3 h-3 mr-1" />
                        Éditer
                      </Button>
                      <Button variant="outline" size="sm">
                        <Eye className="w-3 h-3 mr-1" />
                        Voir
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="w-3 h-3" />
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => handleDeleteResource(resource.id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Empty State */}
          {filteredResources.length === 0 && (
            <Card className="text-center py-12">
              <CardContent>
                <FolderOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchTerm ? 'Aucune ressource trouvée' : 'Aucune ressource'}
                </h3>
                <p className="text-gray-500 mb-6">
                  {searchTerm 
                    ? 'Essayez de modifier vos critères de recherche'
                    : 'Commencez par ajouter votre première ressource'
                  }
                </p>
                {!searchTerm && (
                  <Button onClick={() => { setShowForm(true); setDraft({}); }} className="bg-teal-500 hover:bg-teal-600">
                    <Plus className="w-4 h-4 mr-2" />
                    Ajouter une ressource
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600">Total Ressources</p>
                    <p className="text-2xl font-bold text-gray-900">{resources.length}</p>
                  </div>
                  <FolderOpen className="w-8 h-8 text-teal-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600">Téléchargements</p>
                    <p className="text-2xl font-bold text-green-600">
                      {formatDownloads(resources.reduce((acc, r) => acc + r.downloadCount, 0))}
                    </p>
                  </div>
                  <Download className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600">Ressources populaires</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {resources.filter(r => r.downloadCount > 1000).length}
                    </p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600">Mises en avant</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {resources.filter(r => r.featured).length}
                    </p>
                  </div>
                  <Eye className="w-8 h-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top Resources */}
          <Card>
            <CardHeader>
              <CardTitle>Ressources les plus téléchargées</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {resources
                  .sort((a, b) => b.downloadCount - a.downloadCount)
                  .slice(0, 5)
                  .map((resource, index) => (
                    <div key={resource.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center">
                          <span className="text-sm font-bold text-teal-600">#{index + 1}</span>
                        </div>
                        <div>
                          <h4 className="font-medium text-sm">{resource.title}</h4>
                          <p className="text-xs text-gray-500">{resource.category}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <Badge className={getTypeColor(resource.type)}>
                          {resource.type.toUpperCase()}
                        </Badge>
                        <span className="text-sm font-medium">
                          {formatDownloads(resource.downloadCount)} téléchargements
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}