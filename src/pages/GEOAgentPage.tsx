import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Search,
  Upload,
  Globe,
  Users,
  Target,
  FileText,
  Calendar,
  BarChart3,
  Settings,
  Play,
  Pause,
  Eye,
  TrendingUp,
  Hash,
  Clock,
  Shield,
  Zap,
  CheckCircle,
  AlertCircle,
  Plus,
  X,
  Save,
  Download,
  Brain,
  Lightbulb,
  Code,
  Database,
  Link,
  Award,
  Activity,
  Loader2,
  Trash2
} from 'lucide-react';
import AgentTester from '@/components/AgentTester';
import GEOGenerator from '@/components/GEOGenerator';

interface KnowledgeDocument {
  id: string;
  filename: string;
  uploadedAt: string;
  status: 'processing' | 'completed' | 'error';
  analysis?: {
    queries: string[];
    entities: string[];
    painPoints: string[];
    stats: string[];
    tags: string[];
  };
}

interface GEOCampaign {
  id: string;
  name: string;
  focus: 'prompting' | 'writing' | 'AI_tools' | 'content_strategy';
  status: 'draft' | 'active' | 'paused' | 'completed';
  engines: string[];
  kpis: {
    citations: number;
    coverage: number;
    rdv: number;
    queries: number;
  };
}

interface QueryCluster {
  id: string;
  theme: string;
  queries: string[];
  intent: 'informational' | 'transactional' | 'howto' | 'comparison';
  personas: string[];
  priority: 'high' | 'medium' | 'low';
}

interface ContentModule {
  id: string;
  type: 'AnswerBox' | 'FAQ' | 'HowTo' | 'Checklist' | 'Comparison' | 'StatsTable' | 'Glossary';
  title: string;
  content: string;
  sources: string[];
  confidence: number;
}

export default function GEOAgentPage() {
  const [activeTab, setActiveTab] = useState('knowledge');
  const [documents, setDocuments] = useState<KnowledgeDocument[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoadingDocuments, setIsLoadingDocuments] = useState(true);
  const [campaigns, setCampaigns] = useState<GEOCampaign[]>([
    {
      id: '1',
      name: 'Prompting Expert Content',
      focus: 'prompting',
      status: 'active',
      engines: ['Perplexity', 'AI Overviews', 'Copilot'],
      kpis: { citations: 12, coverage: 0.78, rdv: 5, queries: 23 }
    }
  ]);

  const [queryClusters] = useState<QueryCluster[]>([
    {
      id: '1',
      theme: 'Modular Prompting',
      queries: [
        'modular prompting pour pipeline d\'articles LinkedIn B2B',
        'singular vs modular prompts différences',
        'pipeline prompts étapes best practices'
      ],
      intent: 'informational',
      personas: ['ESN', 'Executive'],
      priority: 'high'
    },
    {
      id: '2',
      theme: 'ROI Mesure IA',
      queries: [
        'mesurer le ROI des prompts d\'écriture',
        'temps gagné prompts IA vs écriture manuelle',
        'KPIs prompting content marketing'
      ],
      intent: 'howto',
      personas: ['DAF'],
      priority: 'high'
    }
  ]);

  const [targetEngines] = useState([
    { id: 'perplexity', name: 'Perplexity', active: true, citations: 8 },
    { id: 'ai_overviews', name: 'Google AI Overviews', active: true, citations: 15 },
    { id: 'copilot', name: 'Bing Copilot', active: true, citations: 6 },
    { id: 'chatgpt', name: 'ChatGPT Browse', active: false, citations: 3 },
    { id: 'poe', name: 'Poe', active: false, citations: 1 },
    { id: 'you', name: 'You.com', active: false, citations: 2 }
  ]);

  const [geoSettings, setGeoSettings] = useState({
    answerability: 0.25,
    evidenceCoverage: 0.25,
    entityDensity: 0.15,
    structureReadability: 0.15,
    recency: 0.10,
    originalityData: 0.10
  });

  const [contentSources, setContentSources] = useState({
    whitelistDomains: [
      'oecd.org', 'imf.org', 'worldbank.org', 'eurostat.ec.europa.eu',
      'reuters.com', 'ft.com', 'bbc.com', 'lesechos.fr', 'lemonde.fr'
    ],
    crawlFrequency: '12h',
    confidenceThreshold: 0.8
  });

  const [currentCampaign, setCurrentCampaign] = useState({
    name: '',
    focus: 'prompting',
    targetQueries: [],
    modules: ['AnswerBox', 'HowTo', 'FAQ'],
    languages: ['fr', 'en'],
    freshnessDays: 90
  });

  // Load documents from API on mount
  const loadDocuments = async () => {
    setIsLoadingDocuments(true);
    try {
      const response = await fetch('/api/geo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'list_documents' })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.documents) {
          setDocuments(data.documents);
        }
      }
    } catch (error) {
      console.error('Error loading documents:', error);
    } finally {
      setIsLoadingDocuments(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  const generateGEOContent = async (step: number) => {
    console.log(`Generating GEO content - Step ${step}`);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);

    for (const file of Array.from(files)) {
      try {
        // Read file content
        const content = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsText(file);
        });

        // Send to API for analysis
        const response = await fetch('/api/geo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'upload_document',
            filename: file.name,
            content: content
          })
        });

        if (response.ok) {
          const data = await response.json();
          // Add new document to state
          setDocuments(prev => [...prev, {
            id: data.document.id,
            filename: data.document.filename,
            uploadedAt: data.document.uploadedAt,
            status: 'completed',
            analysis: data.document.analysis
          }]);
        } else {
          console.error('Upload failed:', await response.text());
        }
      } catch (error) {
        console.error('Error uploading file:', error);
      }
    }

    setIsUploading(false);
    // Reset file input
    event.target.value = '';
  };

  const handleDeleteDocument = async (docId: string) => {
    try {
      const response = await fetch('/api/geo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete_document',
          documentId: docId
        })
      });

      if (response.ok) {
        setDocuments(prev => prev.filter(doc => doc.id !== docId));
      }
    } catch (error) {
      console.error('Error deleting document:', error);
    }
  };

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Search className="h-8 w-8 text-purple-600" />
          <div>
            <h1 className="text-3xl font-bold">Agent GEO (Generative Optimization)</h1>
            <p className="text-gray-600">Création de contenu optimisé pour moteurs IA</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Mode Analyse
          </Button>
          <Button className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Auto-Generate
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="knowledge" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Sources
          </TabsTrigger>
          <TabsTrigger value="queries" className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            Requêtes
          </TabsTrigger>
          <TabsTrigger value="generation" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Générateur
          </TabsTrigger>
          <TabsTrigger value="optimization" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Optimisation
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Citations IA
          </TabsTrigger>
          <TabsTrigger value="test" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Test Réel
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Config
          </TabsTrigger>
        </TabsList>

        {/* Onglet Sources */}
        <TabsContent value="knowledge">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sources internes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Transcripts & Documents
                </CardTitle>
                <CardDescription>Contenus propriétaires pour extraction de queries</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx,.txt,.mp3,.wav"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="geo-file-upload"
                    disabled={isUploading}
                  />
                  <label htmlFor="geo-file-upload" className={`cursor-pointer ${isUploading ? 'opacity-50' : ''}`}>
                    {isUploading ? (
                      <Loader2 className="h-12 w-12 text-purple-600 mx-auto mb-2 animate-spin" />
                    ) : (
                      <Upload className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    )}
                    <p className="text-sm text-gray-600">
                      {isUploading ? 'Analyse en cours...' : 'Transcripts, études, briefs clients'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      L'IA extraira les questions implicites et problèmes
                    </p>
                  </label>
                </div>

                <ScrollArea className="h-[300px]">
                  <div className="space-y-2">
                    {isLoadingDocuments ? (
                      <div className="flex items-center justify-center p-6">
                        <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
                        <span className="ml-2 text-sm text-gray-600">Chargement des documents...</span>
                      </div>
                    ) : documents.length === 0 ? (
                      <div className="text-center p-6 text-gray-500">
                        <FileText className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                        <p className="text-sm">Aucun document uploadé</p>
                        <p className="text-xs">Uploadez des transcripts pour extraire des requêtes</p>
                      </div>
                    ) : (
                      documents.map(doc => (
                        <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-purple-600" />
                              <span className="font-medium text-sm">{doc.filename}</span>
                              <Badge variant={doc.status === 'completed' ? 'default' : 'secondary'}>
                                {doc.status === 'completed' ? 'Processed' : 'Processing'}
                              </Badge>
                            </div>
                            {doc.analysis?.tags && doc.analysis.tags.length > 0 && (
                              <div className="flex gap-1 mt-1 flex-wrap">
                                {doc.analysis.tags.slice(0, 3).map(tag => (
                                  <Badge key={tag} variant="outline" className="text-xs">
                                    #{tag}
                                  </Badge>
                                ))}
                              </div>
                            )}
                            <p className="text-xs text-gray-500 mt-1">
                              {doc.analysis?.queries?.length || 0} queries extraites
                              {doc.analysis?.entities?.length ? ` • ${doc.analysis.entities.length} entités` : ''}
                            </p>
                          </div>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="sm" title="Voir détails">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteDocument(doc.id)}
                              title="Supprimer"
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Domaines autorisés */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Sources externes fiables
                </CardTitle>
                <CardDescription>Domaines autorisés pour preuves et citations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Ajouter un domaine</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="exemple.com"
                      id="new-domain-input"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          const input = e.target as HTMLInputElement;
                          const domain = input.value.trim();
                          if (domain && !contentSources.whitelistDomains.includes(domain)) {
                            setContentSources(prev => ({
                              ...prev,
                              whitelistDomains: [...prev.whitelistDomains, domain]
                            }));
                            input.value = '';
                          }
                        }
                      }}
                    />
                    <Button
                      size="sm"
                      onClick={() => {
                        const input = document.getElementById('new-domain-input') as HTMLInputElement;
                        const domain = input?.value.trim();
                        if (domain && !contentSources.whitelistDomains.includes(domain)) {
                          setContentSources(prev => ({
                            ...prev,
                            whitelistDomains: [...prev.whitelistDomains, domain]
                          }));
                          input.value = '';
                        }
                      }}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Domaines autorisés ({contentSources.whitelistDomains.length})</Label>
                  <ScrollArea className="h-[200px]">
                    <div className="flex flex-wrap gap-2">
                      {contentSources.whitelistDomains.map(domain => (
                        <Badge key={domain} variant="secondary" className="flex items-center gap-1">
                          <Shield className="h-3 w-3" />
                          {domain}
                          <X
                            className="h-3 w-3 cursor-pointer hover:text-red-500"
                            onClick={() => {
                              setContentSources(prev => ({
                                ...prev,
                                whitelistDomains: prev.whitelistDomains.filter(d => d !== domain)
                              }));
                            }}
                          />
                        </Badge>
                      ))}
                    </div>
                  </ScrollArea>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>Seuil de confiance</Label>
                  <div className="px-3 py-2 border rounded-lg">
                    <input
                      type="range"
                      min="0.5"
                      max="1"
                      step="0.05"
                      value={contentSources.confidenceThreshold}
                      onChange={(e) => setContentSources(prev => ({
                        ...prev,
                        confidenceThreshold: parseFloat(e.target.value)
                      }))}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>0.5</span>
                      <span className="font-medium">{contentSources.confidenceThreshold}</span>
                      <span>1.0</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Onglet Requêtes */}
        <TabsContent value="queries">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Clusters de requêtes extraites</CardTitle>
                  <CardDescription>Requêtes identifiées depuis les transcripts</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {queryClusters.map(cluster => (
                    <div key={cluster.id} className="p-4 border rounded-lg space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold">{cluster.theme}</h3>
                        <div className="flex gap-2">
                          <Badge variant={cluster.priority === 'high' ? 'default' : 'secondary'}>
                            {cluster.priority}
                          </Badge>
                          <Badge variant="outline">{cluster.intent}</Badge>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        {cluster.queries.map((query, index) => (
                          <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                            <Search className="h-4 w-4 text-gray-400" />
                            <span className="flex-1 text-sm">{query}</span>
                            <Button variant="ghost" size="sm">
                              <Target className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">Personas:</span>
                        {cluster.personas.map(persona => (
                          <Badge key={persona} variant="outline" className="text-xs">
                            {persona}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex gap-2">
                        <Button size="sm" className="flex-1">
                          Générer contenu GEO
                        </Button>
                        <Button size="sm" variant="outline">
                          Analyser concurrence
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Outils d'analyse */}
            <Card>
              <CardHeader>
                <CardTitle>Outils d'analyse</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Recherche de nouvelles requêtes</Label>
                  <div className="flex gap-2">
                    <Input placeholder="modular prompting..." className="flex-1" />
                    <Button size="sm">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <Label>Quick Actions</Label>
                  <Button variant="outline" className="w-full justify-start">
                    <Lightbulb className="h-4 w-4 mr-2" />
                    Extraire queries d'un transcript
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Activity className="h-4 w-4 mr-2" />
                    Analyser gaps de couverture
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Award className="h-4 w-4 mr-2" />
                    Identifier opportunités citations
                  </Button>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>Volume estimé (mois)</Label>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Prompting tips</span>
                      <Badge variant="secondary">2.4k</Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>ROI AI writing</span>
                      <Badge variant="secondary">890</Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Claude projects setup</span>
                      <Badge variant="secondary">1.2k</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Onglet Générateur */}
        <TabsContent value="generation">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Personas & intentions */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Personas & Intentions
                </CardTitle>
                <CardDescription>Cibles et types de requêtes</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {[
                    { name: 'ESN', color: 'blue', desc: 'Process, outils, ROI' },
                    { name: 'DAF', color: 'green', desc: 'Mesures, budgets, risques' },
                    { name: 'Executive', color: 'purple', desc: 'Stratégie, décisions' }
                  ].map(persona => (
                    <div key={persona.name} className="p-2 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <h3 className={`font-semibold text-${persona.color}-600 text-sm`}>{persona.name}</h3>
                        <input type="checkbox" defaultChecked />
                      </div>
                      <p className="text-xs text-gray-600">{persona.desc}</p>
                    </div>
                  ))}
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label className="text-xs">Intentions</Label>
                  <div className="grid grid-cols-2 gap-1">
                    {[
                      { type: 'Info', desc: 'Qu\'est-ce que' },
                      { type: 'How-to', desc: 'Comment faire' },
                      { type: 'Compare', desc: 'X vs Y' },
                      { type: 'Action', desc: 'Audit, démo' }
                    ].map(intent => (
                      <label key={intent.type} className="flex items-center gap-1 p-1 text-xs">
                        <input type="checkbox" defaultChecked />
                        <span>{intent.type}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="lg:col-span-2">
              <GEOGenerator className="" />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Modules de contenu */}
            <Card>
              <CardHeader>
                <CardTitle>Modules de contenu GEO</CardTitle>
                <CardDescription>Composants optimisés pour citations IA</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { type: 'AnswerBox', desc: '≤60 mots réponse directe', icon: CheckCircle },
                    { type: 'FAQ', desc: 'Paires Q/A structurées', icon: FileText },
                    { type: 'HowTo', desc: 'Étapes numérotées', icon: Target },
                    { type: 'Checklist', desc: 'Liste vérification', icon: CheckCircle },
                    { type: 'Comparison', desc: 'Tableau comparatif', icon: BarChart3 },
                    { type: 'StatsTable', desc: 'Données chiffrées', icon: Database },
                    { type: 'Glossary', desc: 'Définitions entités', icon: Hash },
                    { type: 'References', desc: 'Sources citées', icon: Link }
                  ].map(module => {
                    const Icon = module.icon;
                    return (
                      <label key={module.type} className="flex items-center gap-2 p-3 border rounded cursor-pointer hover:bg-gray-50">
                        <input type="checkbox" defaultChecked />
                        <Icon className="h-4 w-4 text-purple-600" />
                        <div className="flex-1">
                          <span className="text-sm font-medium">{module.type}</span>
                          <p className="text-xs text-gray-500">{module.desc}</p>
                        </div>
                      </label>
                    );
                  })}
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>JSON-LD Schema.org</Label>
                  <div className="space-y-1">
                    {['FAQPage', 'HowTo', 'BreadcrumbList', 'Product'].map(schema => (
                      <label key={schema} className="flex items-center gap-2">
                        <input type="checkbox" defaultChecked />
                        <Code className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">{schema}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Langues cibles</Label>
                  <div className="flex gap-2">
                    <Badge variant="default">FR</Badge>
                    <Badge variant="outline">EN</Badge>
                    <Badge variant="outline">ES</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Onglet Optimisation */}
        <TabsContent value="optimization">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Scoring GEO */}
            <Card>
              <CardHeader>
                <CardTitle>Scoring GEO automatique</CardTitle>
                <CardDescription>Critères de ranking pour moteurs IA</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label>Answerability (réponse directe)</Label>
                      <span className="text-sm font-medium">{(geoSettings.answerability * 100).toFixed(0)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="0.5"
                      step="0.05"
                      value={geoSettings.answerability}
                      onChange={(e) => setGeoSettings(prev => ({ ...prev, answerability: parseFloat(e.target.value) }))}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label>Evidence Coverage (preuves)</Label>
                      <span className="text-sm font-medium">{(geoSettings.evidenceCoverage * 100).toFixed(0)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="0.5"
                      step="0.05"
                      value={geoSettings.evidenceCoverage}
                      onChange={(e) => setGeoSettings(prev => ({ ...prev, evidenceCoverage: parseFloat(e.target.value) }))}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label>Entity Density (entités)</Label>
                      <span className="text-sm font-medium">{(geoSettings.entityDensity * 100).toFixed(0)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="0.3"
                      step="0.05"
                      value={geoSettings.entityDensity}
                      onChange={(e) => setGeoSettings(prev => ({ ...prev, entityDensity: parseFloat(e.target.value) }))}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label>Structure Readability</Label>
                      <span className="text-sm font-medium">{(geoSettings.structureReadability * 100).toFixed(0)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="0.3"
                      step="0.05"
                      value={geoSettings.structureReadability}
                      onChange={(e) => setGeoSettings(prev => ({ ...prev, structureReadability: parseFloat(e.target.value) }))}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label>Recency (fraîcheur)</Label>
                      <span className="text-sm font-medium">{(geoSettings.recency * 100).toFixed(0)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="0.2"
                      step="0.05"
                      value={geoSettings.recency}
                      onChange={(e) => setGeoSettings(prev => ({ ...prev, recency: parseFloat(e.target.value) }))}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label>Originality Data</Label>
                      <span className="text-sm font-medium">{(geoSettings.originalityData * 100).toFixed(0)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="0.2"
                      step="0.05"
                      value={geoSettings.originalityData}
                      onChange={(e) => setGeoSettings(prev => ({ ...prev, originalityData: parseFloat(e.target.value) }))}
                      className="w-full"
                    />
                  </div>
                </div>

                <div className="text-center pt-4 border-t">
                  <div className="text-2xl font-bold text-purple-600 mb-2">
                    {(Object.values(geoSettings).reduce((a, b) => a + b, 0) * 100).toFixed(0)}/100
                  </div>
                  <p className="text-sm text-gray-600">Score GEO global</p>
                </div>
              </CardContent>
            </Card>

            {/* Checklist qualité */}
            <Card>
              <CardHeader>
                <CardTitle>Checklist qualité GEO</CardTitle>
                <CardDescription>Vérifications avant publication</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <span className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      Réponse ≤60 mots en tête
                    </span>
                    <Badge variant="default">✓</Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <span className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      1+ source par claim chiffrée
                    </span>
                    <Badge variant="default">✓</Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <span className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-orange-600" />
                      Fraîcheur &lt; 90 jours
                    </span>
                    <Badge variant="outline">67% OK</Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <span className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      Structure H2/H3 questions
                    </span>
                    <Badge variant="default">✓</Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <span className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      JSON-LD FAQPage valide
                    </span>
                    <Badge variant="default">✓</Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <span className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-yellow-600" />
                      Entities coverage
                    </span>
                    <Badge variant="outline">8/12 termes</Badge>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Suggestions d'amélioration:</Label>
                  <ul className="text-sm space-y-1 text-gray-600">
                    <li>• Ajouter tableau comparatif "Before vs After"</li>
                    <li>• Mettre à jour stats OECD (actuellement 8 mois)</li>
                    <li>• Inclure glossaire des termes techniques</li>
                    <li>• Ajouter BreadcrumbList schema</li>
                  </ul>
                </div>

                <Button className="w-full">
                  Optimiser automatiquement
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Onglet Analytics Citations */}
        <TabsContent value="analytics">
          <div className="space-y-6">
            {/* KPIs citations IA */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <Award className="h-8 w-8 text-purple-600" />
                    <div>
                      <p className="text-sm text-gray-600">Citations IA totales</p>
                      <p className="text-2xl font-bold">47</p>
                      <p className="text-xs text-green-600">+23 vs mois dernier</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <Target className="h-8 w-8 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-600">Coverage queries</p>
                      <p className="text-2xl font-bold">78%</p>
                      <p className="text-xs text-green-600">+12% vs concurrence</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <Clock className="h-8 w-8 text-green-600" />
                    <div>
                      <p className="text-sm text-gray-600">Fraîcheur moyenne</p>
                      <p className="text-2xl font-bold">23j</p>
                      <p className="text-xs text-green-600">Excellent pour IA</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <Calendar className="h-8 w-8 text-orange-600" />
                    <div>
                      <p className="text-sm text-gray-600">RDV générés</p>
                      <p className="text-2xl font-bold">12</p>
                      <p className="text-xs text-green-600">CAC: 67€</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Répartition par moteur */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Citations par moteur IA</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { name: 'Perplexity', citations: 18, trend: '+8', color: 'purple' },
                      { name: 'AI Overviews', citations: 15, trend: '+12', color: 'blue' },
                      { name: 'Bing Copilot', citations: 8, trend: '+3', color: 'green' },
                      { name: 'ChatGPT Browse', citations: 4, trend: '0', color: 'gray' },
                      { name: 'You.com', citations: 2, trend: '0', color: 'gray' }
                    ].map(engine => (
                      <div key={engine.name} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full bg-${engine.color}-500`}></div>
                          <span className="font-medium">{engine.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">{engine.citations}</Badge>
                          <Badge variant={engine.trend === '0' ? 'outline' : 'default'} className="text-xs">
                            {engine.trend === '0' ? '=' : engine.trend}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Top queries citées</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <span className="flex-1">"modular prompting pipeline"</span>
                      <Badge>12 citations</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <span className="flex-1">"ROI prompts écriture"</span>
                      <Badge>8 citations</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <span className="flex-1">"Claude projects setup"</span>
                      <Badge>7 citations</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <span className="flex-1">"singular vs modular prompts"</span>
                      <Badge>5 citations</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Apprentissage automatique */}
            <Card>
              <CardHeader>
                <CardTitle>Patterns détectés automatiquement</CardTitle>
                <CardDescription>L'IA apprend des citations réussies</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <div className="p-4 bg-green-50 border-green-200 border rounded-lg">
                    <p className="text-sm font-medium text-green-800 mb-2">📊 Pattern structure</p>
                    <p className="text-sm text-green-700">
                      Les contenus avec "Answer + 3 étapes + Tableau" obtiennent 3x plus de citations
                    </p>
                  </div>
                  
                  <div className="p-4 bg-blue-50 border-blue-200 border rounded-lg">
                    <p className="text-sm font-medium text-blue-800 mb-2">⏱️ Pattern timing</p>
                    <p className="text-sm text-blue-700">
                      Perplexity privilégie contenus &lt; 30j, AI Overviews plus flexible (&lt; 90j)
                    </p>
                  </div>

                  <div className="p-4 bg-purple-50 border-purple-200 border rounded-lg">
                    <p className="text-sm font-medium text-purple-800 mb-2">🎯 Pattern sources</p>
                    <p className="text-sm text-purple-700">
                      Citations OECD/IMF/Worldbank génèrent 2.3x plus de reprises que médias
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Onglet Test Réel (même UI que Générateur) */}
        <TabsContent value="test">
          <GEOGenerator />
        </TabsContent>

        {/* Onglet Configuration */}
        <TabsContent value="settings">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Garde-fous GEO */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Garde-fous GEO
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Citation obligatoire</h3>
                      <p className="text-sm text-gray-500">Chaque claim chiffrée doit avoir une source</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Pas d'hallucination</h3>
                      <p className="text-sm text-gray-500">Vérifier tous les faits avant publication</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Score de confiance</h3>
                      <p className="text-sm text-gray-500">Afficher la confiance de chaque affirmation</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Pas de données personnelles</h3>
                      <p className="text-sm text-gray-500">Exclure infos clients confidentielles</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>

                <div className="space-y-2 pt-4">
                  <Label>Seuil de fraîcheur (jours)</Label>
                  <Input 
                    type="number" 
                    value={currentCampaign.freshnessDays}
                    onChange={(e) => setCurrentCampaign(prev => ({ 
                      ...prev, 
                      freshnessDays: parseInt(e.target.value) 
                    }))}
                    placeholder="90"
                  />
                  <p className="text-xs text-gray-500">
                    Sources plus anciennes seront marquées comme "moins fiables"
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Templates & exports */}
            <Card>
              <CardHeader>
                <CardTitle>Templates & Exports</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Templates article GEO</Label>
                  <Select defaultValue="answer-first">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="answer-first">Answer-first + développement</SelectItem>
                      <SelectItem value="complete-guide">Guide complet avec ToC</SelectItem>
                      <SelectItem value="comparison">Format comparaison</SelectItem>
                      <SelectItem value="howto">How-to structuré</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Formats d'export</Label>
                  <div className="space-y-1">
                    <label className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked />
                      <FileText className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">Article HTML + JSON-LD</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked />
                      <Database className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">Chunks Q/A (JSON)</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" />
                      <Code className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">Posts LinkedIn/X</span>
                    </label>
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <Label>Actions rapides</Label>
                  <Button variant="outline" className="w-full justify-start">
                    <Download className="h-4 w-4 mr-2" />
                    Exporter campagne GEO
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Upload className="h-4 w-4 mr-2" />
                    Importer queries CSV
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Save className="h-4 w-4 mr-2" />
                    Sauvegarder template
                  </Button>
                </div>

                <Separator />

                <Button className="w-full">
                  <Settings className="h-4 w-4 mr-2" />
                  Appliquer configuration
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}