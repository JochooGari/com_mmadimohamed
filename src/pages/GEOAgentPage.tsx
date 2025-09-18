import React, { useState } from 'react';
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
  Activity
} from 'lucide-react';
import AgentTester from '@/components/AgentTester';

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

  const generateGEOContent = async (step: number) => {
    console.log(`Generating GEO content - Step ${step}`);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      console.log('Uploading files for GEO processing:', files);
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
            Génération
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
                  />
                  <label htmlFor="geo-file-upload" className="cursor-pointer">
                    <Upload className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">
                      Transcripts, études, briefs clients
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      L'IA extraira les questions implicites et problèmes
                    </p>
                  </label>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-purple-600" />
                        <span className="font-medium">9 ChatGPT Writing Tips.txt</span>
                        <Badge variant="default">Processed</Badge>
                      </div>
                      <div className="flex gap-1 mt-1">
                        <Badge variant="outline" className="text-xs">#prompting</Badge>
                        <Badge variant="outline" className="text-xs">#AI_writing</Badge>
                        <Badge variant="outline" className="text-xs">#ESN</Badge>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">23 queries extraites</p>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-purple-600" />
                        <span className="font-medium">Writing Online 2025.txt</span>
                        <Badge variant="secondary">Processing</Badge>
                      </div>
                      <div className="flex gap-1 mt-1">
                        <Badge variant="outline" className="text-xs">#content_strategy</Badge>
                        <Badge variant="outline" className="text-xs">#platforms</Badge>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">En cours d'analyse...</p>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Clock className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
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
                  <Label>Domaines institutionnels (.org/.gov)</Label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {['oecd.org', 'imf.org', 'worldbank.org', 'eurostat.ec.europa.eu'].map(domain => (
                      <Badge key={domain} variant="default" className="flex items-center gap-1">
                        <Shield className="h-3 w-3" />
                        {domain}
                        <X className="h-3 w-3 cursor-pointer" />
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Médias de référence</Label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {['reuters.com', 'ft.com', 'bbc.com', 'lesechos.fr'].map(domain => (
                      <Badge key={domain} variant="secondary" className="flex items-center gap-1">
                        {domain}
                        <X className="h-3 w-3 cursor-pointer" />
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Fréquence de crawl</Label>
                  <Select value={contentSources.crawlFrequency} onValueChange={(value) => 
                    setContentSources(prev => ({ ...prev, crawlFrequency: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2h">Toutes les 2h</SelectItem>
                      <SelectItem value="12h">Toutes les 12h</SelectItem>
                      <SelectItem value="24h">Quotidien</SelectItem>
                      <SelectItem value="weekly">Hebdomadaire</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

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

            {/* Personas & intentions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Personas & Intentions
                </CardTitle>
                <CardDescription>Cibles et types de requêtes à couvrir</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-3 border rounded-lg text-center">
                    <h3 className="font-semibold text-blue-600">ESN</h3>
                    <p className="text-xs text-gray-600 mt-1">
                      Process, outils, ROI
                    </p>
                    <Badge variant="outline" className="mt-2 text-xs">
                      RDV qualifiés
                    </Badge>
                  </div>
                  <div className="p-3 border rounded-lg text-center">
                    <h3 className="font-semibold text-green-600">DAF</h3>
                    <p className="text-xs text-gray-600 mt-1">
                      Mesures, budgets, risques
                    </p>
                    <Badge variant="outline" className="mt-2 text-xs">
                      Couverture FX
                    </Badge>
                  </div>
                  <div className="p-3 border rounded-lg text-center">
                    <h3 className="font-semibold text-purple-600">Executive</h3>
                    <p className="text-xs text-gray-600 mt-1">
                      Stratégie, décisions
                    </p>
                    <Badge variant="outline" className="mt-2 text-xs">
                      Time-to-decision
                    </Badge>
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <Label>Types d'intentions à cibler</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { type: 'Informational', desc: 'Qu\'est-ce que, pourquoi', color: 'blue' },
                      { type: 'How-to', desc: 'Comment faire, étapes', color: 'green' },
                      { type: 'Comparison', desc: 'X vs Y, alternatives', color: 'purple' },
                      { type: 'Transactional', desc: 'Audit, démo, essai', color: 'orange' }
                    ].map(intent => (
                      <label key={intent.type} className="flex items-center gap-2 p-2 border rounded">
                        <input type="checkbox" defaultChecked />
                        <div className="flex-1">
                          <span className={`text-sm font-medium text-${intent.color}-600`}>
                            {intent.type}
                          </span>
                          <p className="text-xs text-gray-500">{intent.desc}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Moteurs IA cibles */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  Moteurs IA ciblés
                </CardTitle>
                <CardDescription>Optimisation pour plateformes spécifiques</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {targetEngines.map(engine => (
                  <div key={engine.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Switch 
                        checked={engine.active}
                        onCheckedChange={(checked) => console.log(`Toggle ${engine.name}: ${checked}`)}
                      />
                      <div>
                        <span className="font-medium">{engine.name}</span>
                        <p className="text-xs text-gray-500">
                          {engine.citations} citations ce mois
                        </p>
                      </div>
                    </div>
                    <Badge variant={engine.active ? 'default' : 'secondary'}>
                      {engine.active ? 'Actif' : 'Inactif'}
                    </Badge>
                  </div>
                ))}

                <div className="mt-4 p-3 bg-blue-50 border-blue-200 border rounded-lg">
                  <p className="text-sm font-medium text-blue-800 mb-1">💡 Conseil GEO</p>
                  <p className="text-sm text-blue-700">
                    Perplexity privilégie les sources récentes (&lt; 90j) avec preuves chiffrées.
                    AI Overviews favorise les réponses structurées en 60 mots + développement.
                  </p>
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

        {/* Onglet Génération */}
        <TabsContent value="generation">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pipeline GEO */}
            <Card>
              <CardHeader>
                <CardTitle>Pipeline GEO (3 étapes)</CardTitle>
                <CardDescription>Mining → Brief → Livrable optimisé IA</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <Button 
                    size="lg" 
                    className="text-lg px-8 py-4"
                    onClick={() => generateGEOContent(1)}
                  >
                    <Play className="h-5 w-5 mr-2" />
                    Générer GEO (1→2→3)
                  </Button>
                </div>

                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                        <span className="text-purple-600 font-semibold">1</span>
                      </div>
                      <h3 className="font-semibold">Mining requêtes</h3>
                      <Badge variant="outline">Ready</Badge>
                    </div>
                    <p className="text-sm text-gray-600 ml-11">
                      Extraction queries + entities + preuves depuis transcripts/web
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                        <span className="text-orange-600 font-semibold">2</span>
                      </div>
                      <h3 className="font-semibold">Brief GEO</h3>
                      <Badge variant="secondary">Pending</Badge>
                    </div>
                    <p className="text-sm text-gray-600 ml-11">
                      Angles answer-first + modules (FAQ, HowTo, Comparaison) par query
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-green-600 font-semibold">3</span>
                      </div>
                      <h3 className="font-semibold">Livrables</h3>
                      <Badge variant="secondary">Pending</Badge>
                    </div>
                    <p className="text-sm text-gray-600 ml-11">
                      Article GEO + chunks Q/A + posts LinkedIn/X + JSON-LD
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

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

        {/* Onglet Test Réel */}
        <TabsContent value="test">
          <AgentTester 
            agentType="geo"
            defaultPrompts={{
              system: `Tu es un expert en GEO (Generative Optimization Engine). Tu crées du contenu optimisé pour être cité par les moteurs IA (Perplexity, AI Overviews, Copilot).

Règles:
- Réponse directe ≤60 mots en début
- Chaque affirmation chiffrée = 1 source fiable (.org/.gov)
- Structure H2/H3 en questions
- JSON-LD FAQPage
- Pas d'hallucination`,
              user: `Crée un article GEO optimisé sur "{input}" pour répondre aux requêtes des DAF/ESN.

Structure requise:
1. Réponse directe ≤60 mots
2. 3 sections H2 en questions
3. Tableau comparatif
4. FAQ (3 Q/A)
5. Sources citées

Public: Dirigeants B2B cherchant des solutions concrètes.`
            }}
            onConfigSave={(config) => {
              console.log('Configuration GEO sauvegardée:', config);
              // Ici vous pouvez sauvegarder la config dans votre backend
            }}
          />
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