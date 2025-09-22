import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Play, 
  Save, 
  Download,
  Upload,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Eye,
  Settings,
  Zap,
  BarChart3,
  FileText,
  Brain
} from 'lucide-react';
import { aiService, AI_PROVIDERS, getApiKey } from '@/lib/aiProviders';
import { LocalStorage } from '@/lib/storage';

interface TestResult {
  id: string;
  timestamp: string;
  provider: string;
  model: string;
  prompt: string;
  response: string;
  metrics: {
    responseTime: number;
    tokenCount: number;
    cost: number;
    quality: number;
  };
  score: number;
  feedback: string;
  variants?: { v120?: string; v180?: string; v300?: string };
}

interface AgentTesterProps {
  agentType: 'linkedin' | 'geo';
  defaultPrompts?: Record<string, string>;
  onConfigSave?: (config: any) => void;
}

export default function AgentTester({ agentType, defaultPrompts = {}, onConfigSave }: AgentTesterProps) {
  const [activeTest, setActiveTest] = useState('single');
  const [selectedProvider, setSelectedProvider] = useState('openai');
  const [selectedModel, setSelectedModel] = useState('gpt-4-turbo');
  const [testInput, setTestInput] = useState('');
  const [systemPrompt, setSystemPrompt] = useState(defaultPrompts.system || '');
  const [userPrompt, setUserPrompt] = useState(defaultPrompts.user || '');
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [currentConfig, setCurrentConfig] = useState({
    temperature: 0.7,
    maxTokens: 2000,
    topP: 0.9,
    frequencyPenalty: 0,
    presencePenalty: 0
  });
  const [apiKeyStatus, setApiKeyStatus] = useState<Record<string, boolean>>({});
  // Brief façon Générateur (UI identique)
  const [brief, setBrief] = useState({
    audience: 'DAF/Finance',
    angle: 'probleme' as 'probleme' | 'resultat',
    template: 'Liste3-5',
    sujet: '',
    preuve: true
  });

  // Vérification des clés API au chargement
  React.useEffect(() => {
    const checkApiKeys = () => {
      const status: Record<string, boolean> = {};
      AI_PROVIDERS.forEach(provider => {
        const key = getApiKey(provider.id);
        status[provider.id] = !!(key && key.length > 0);
      });
      setApiKeyStatus(status);
    };
    
    checkApiKeys();
  }, []);

  // Prompts pré-configurés selon le type d'agent
  const getDefaultPrompts = () => {
    if (agentType === 'linkedin') {
      return {
        system: `Tu es un expert en ghostwriting LinkedIn B2B. Tu crées des posts engageants de 120-180 mots avec:
- Hook accrocheur en première ligne
- 3-5 points de valeur concrets
- CTA clair pour générer des RDV
- Ton professionnel mais humain
- Preuves chiffrées quand possible`,
        user: `Crée un post LinkedIn sur le thème "${testInput}" pour un dirigeant d'ESN qui veut attirer des clients dans le secteur bancaire.

Inclus:
- Un hook qui interpelle
- 3 bénéfices concrets avec des chiffres
- Un CTA pour un audit gratuit de 20min

Format: Post de 150 mots maximum.`
      };
    } else {
      return {
        system: `Tu es un expert en GEO (Generative Optimization Engine). Tu crées du contenu optimisé pour être cité par les moteurs IA (Perplexity, AI Overviews, Copilot).

Règles:
- Réponse directe ≤60 mots en début
- Chaque affirmation chiffrée = 1 source fiable (.org/.gov)
- Structure H2/H3 en questions
- JSON-LD FAQPage
- Pas d'hallucination`,
        user: `Crée un article GEO optimisé sur "${testInput}" pour répondre aux requêtes des DAF/ESN.

Structure requise:
1. Réponse directe ≤60 mots
2. 3 sections H2 en questions
3. Tableau comparatif
4. FAQ (3 Q/A)
5. Sources citées

Public: Dirigeants B2B cherchant des solutions concrètes.`
      };
    }
  };

  const runSingleTest = async () => {
    setIsRunning(true);
    const startTime = Date.now();

    try {
      const prompts = testInput ? getDefaultPrompts() : { system: systemPrompt, user: userPrompt };

      // Récupérer contexte: sources internes + veille optimisée
      let contextBlocks: string[] = [];
      try {
        const [internalRes, veilleRes] = await Promise.all([
          fetch('/api/storage?agent=linkedin&type=sources').then(r => r.ok ? r.json() : [] as any).catch(()=>[]),
          fetch('/api/monitoring?list=1&limit=5&sort=global_desc').then(r => r.ok ? r.json() : { items: [] }).catch(()=>({ items: [] }))
        ]);
        const internals: any[] = Array.isArray(internalRes) ? internalRes : [];
        if (internals.length > 0) {
          const snips = internals.slice(0, 5).map((s:any) => `- ${s.name || s.id || ''}: ${String(s.content || s.summary || '').slice(0,180)}`);
          contextBlocks.push(`Sources internes:\n${snips.join('\n')}`);
        }
        const rows: any[] = Array.isArray(veilleRes?.items) ? veilleRes.items : [];
        if (rows.length > 0) {
          const snips = rows.slice(0, 5).map((r:any) => `- ${r.title || ''} (${r.sector || ''}) ${Math.round((r.scores?.global||0)*100)}% → ${r.url}`);
          contextBlocks.push(`Veille optimisée:\n${snips.join('\n')}`);
        }
      } catch {}

      const combinedUser = `${prompts.user}\n\nRetourne UNIQUEMENT un JSON {\"variant_120\":\"...\",\"variant_180\":\"...\",\"variant_300\":\"...\"}.\n\nContexte (utiliser uniquement ce qui suit si pertinent):\n${contextBlocks.join('\n')}`;

      // Appel via proxy serveur (pas d'exposition de clés)
      const proxyRes = await fetch('/api/ai-proxy', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: selectedProvider,
          model: selectedModel,
          messages: [
            { role: 'system', content: prompts.system },
            { role: 'user', content: combinedUser }
          ],
          temperature: currentConfig.temperature,
          maxTokens: currentConfig.maxTokens
        })
      });
      if (!proxyRes.ok) {
        const t = await proxyRes.text().catch(()=> '');
        throw new Error(`Proxy error ${proxyRes.status}: ${t}`);
      }
      const response = await proxyRes.json();
      let text = (response?.content || '').trim();
      if (/^```/.test(text)) text = text.replace(/^```(?:json)?\n?/i, '').replace(/\n?```$/i, '').trim();
      let v120: string | undefined, v180: string | undefined, v300: string | undefined;
      try {
        const j = JSON.parse(text);
        v120 = j?.variant_120; v180 = j?.variant_180; v300 = j?.variant_300;
      } catch {}

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      const newResult: TestResult = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        provider: selectedProvider,
        model: selectedModel,
        prompt: prompts.user,
        response: text || response.content,
        metrics: {
          responseTime,
          tokenCount: response.usage?.totalTokens || 0,
          cost: calculateCost(selectedProvider, selectedModel, response.usage?.totalTokens || 0),
          quality: 0 // À remplir manuellement
        },
        score: 0,
        feedback: '',
        variants: (v120 || v180 || v300) ? { v120, v180, v300 } : undefined
      };

      setTestResults(prev => [newResult, ...prev]);
    } catch (error: any) {
      console.error('Test failed:', error);
      alert(`Erreur de test: ${error?.message || String(error)}`);
    } finally {
      setIsRunning(false);
    }
  };

  const runBatchTest = async () => {
    setIsRunning(true);
    const testCases = [
      "optimisation des processus RH avec l'IA",
      "réduction des coûts IT en 2024", 
      "migration cloud pour PME",
      "cybersécurité pour ESN",
      "automatisation des workflows financiers"
    ];

    for (const testCase of testCases) {
      setTestInput(testCase);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Délai entre tests
      await runSingleTest();
    }
    
    setIsRunning(false);
  };

  const calculateCost = (provider: string, model: string, tokens: number): number => {
    // Coûts approximatifs en centimes d'euro pour 1000 tokens
    const costs: Record<string, Record<string, number>> = {
      'openai': { 'gpt-4-turbo': 0.02, 'gpt-5': 0.03, 'gpt-4': 0.015 },
      'anthropic': { 'claude-3-opus': 0.025, 'claude-3-sonnet': 0.006 },
      'mistral': { 'mistral-large': 0.008 },
      'perplexity': { 'sonar': 0.005, 'sonar-pro': 0.012, 'llama-3.1-sonar-large-128k-online': 0.004, 'llama-3.1-sonar-small-128k-online': 0.003 }
    };
    
    const costPer1k = costs[provider]?.[model] || 0.01;
    return (tokens / 1000) * costPer1k;
  };

  const saveOptimalConfig = () => {
    const config = {
      agentType,
      provider: selectedProvider,
      model: selectedModel,
      config: currentConfig,
      prompts: { system: systemPrompt, user: userPrompt },
      averageScore: testResults.reduce((sum, r) => sum + r.score, 0) / testResults.length,
      timestamp: new Date().toISOString()
    };
    
    LocalStorage.saveAgentConfig(agentType, config);
    LocalStorage.saveTestResults(agentType, testResults);
    onConfigSave?.(config);
    alert('Configuration sauvegardée !');
  };

  const loadOptimalConfig = () => {
    const config = LocalStorage.getAgentConfig(agentType);
    const savedResults = LocalStorage.getTestResults(agentType);
    
    if (config) {
      setSelectedProvider(config.provider);
      setSelectedModel(config.model);
      setCurrentConfig(config.config);
      setSystemPrompt(config.prompts.system);
      setUserPrompt(config.prompts.user);
      
      if (savedResults.length > 0) {
        setTestResults(savedResults);
      }
      
      alert('Configuration chargée !');
    } else {
      alert('Aucune configuration sauvegardée trouvée.');
    }
  };

  const exportResults = () => {
    const data = {
      agentType,
      config: { provider: selectedProvider, model: selectedModel, ...currentConfig },
      results: testResults,
      exported: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `agent_${agentType}_results_${Date.now()}.json`;
    a.click();
  };

  const rateResult = (resultId: string, score: number, feedback: string) => {
    setTestResults(prev => prev.map(result => 
      result.id === resultId 
        ? { ...result, score, feedback }
        : result
    ));
  };

  const getProviderModels = (providerId: string) => {
    return AI_PROVIDERS.find(p => p.id === providerId)?.models || [];
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-blue-600" />
            Testeur Agent {agentType.toUpperCase()} - Mode Réel
          </CardTitle>
          <CardDescription>
            Testez et affinez votre agent avec de vrais providers IA
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTest} onValueChange={setActiveTest}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="single">Test Simple</TabsTrigger>
              <TabsTrigger value="batch">Test Batch</TabsTrigger>
              <TabsTrigger value="results">Résultats</TabsTrigger>
            </TabsList>

            <TabsContent value="single" className="space-y-4 mt-4">
              {agentType === 'linkedin' && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      Nouveau Post LinkedIn (aperçu Générateur)
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Audience:</label>
                        <select value={brief.audience} onChange={(e)=> setBrief({...brief, audience: e.target.value})} className="w-full p-2 border rounded">
                          <option value="DAF/Finance">DAF/Finance</option>
                          <option value="ESN/IT">ESN/IT</option>
                          <option value="Executive/Direction">Executive/Direction</option>
                          <option value="RH/Recrutement">RH/Recrutement</option>
                          <option value="Sales/Business Dev">Sales/Business Dev</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Angle:</label>
                        <select value={brief.angle} onChange={(e)=> setBrief({...brief, angle: e.target.value as 'probleme'|'resultat'})} className="w-full p-2 border rounded">
                          <option value="probleme">Problème (Pain points)</option>
                          <option value="resultat">Résultat (Success story)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Template:</label>
                        <select value={brief.template} onChange={(e)=> setBrief({...brief, template: e.target.value})} className="w-full p-2 border rounded">
                          <option value="Liste3-5">Liste 3-5 points</option>
                          <option value="PPP">Perspective/Preuve/Process</option>
                          <option value="WhatHowWhy">What/How/Why</option>
                          <option value="CasClient">Cas Client Express</option>
                          <option value="MytheRealite">Mythe vs Réalité</option>
                        </select>
                      </div>
                      <div className="flex items-end">
                        <label className="flex items-center space-x-2">
                          <input type="checkbox" checked={brief.preuve} onChange={(e)=> setBrief({...brief, preuve: e.target.checked})} />
                          <span className="text-sm font-medium">Inclure preuve</span>
                        </label>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Sujet principal:</label>
                      <Input placeholder="Ex: Budget vs Rolling Forecast, Recrutement IT..." value={brief.sujet} onChange={(e)=> setBrief({...brief, sujet: e.target.value})} />
                    </div>
                    <div className="text-right">
                      <Button
                        onClick={() => { setTestInput(brief.sujet); runSingleTest(); }}
                        disabled={isRunning || !brief.sujet.trim()}
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        Générer via API
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Configuration */}
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Provider IA</Label>
                      <Select value={selectedProvider} onValueChange={setSelectedProvider}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {AI_PROVIDERS.map(provider => (
                            <SelectItem key={provider.id} value={provider.id}>
                              <div className="flex items-center gap-2">
                                {provider.name}
                                {apiKeyStatus[provider.id] ? (
                                  <CheckCircle className="h-3 w-3 text-green-600" />
                                ) : (
                                  <AlertCircle className="h-3 w-3 text-red-600" />
                                )}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {!apiKeyStatus[selectedProvider] && (
                        <p className="text-xs text-red-600 mt-1">
                          ⚠️ Clé API manquante pour {selectedProvider}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label>Modèle</Label>
                      <Select value={selectedModel} onValueChange={setSelectedModel}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {getProviderModels(selectedProvider).map(model => (
                            <SelectItem key={model} value={model}>
                              {model}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Temperature</Label>
                      <Input
                        type="number"
                        min="0"
                        max="2"
                        step="0.1"
                        value={currentConfig.temperature}
                        onChange={(e) => setCurrentConfig(prev => ({ 
                          ...prev, 
                          temperature: parseFloat(e.target.value) 
                        }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Max Tokens</Label>
                      <Input
                        type="number"
                        value={currentConfig.maxTokens}
                        onChange={(e) => setCurrentConfig(prev => ({ 
                          ...prev, 
                          maxTokens: parseInt(e.target.value) 
                        }))}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Sujet de test</Label>
                    <Input
                      value={testInput}
                      onChange={(e) => setTestInput(e.target.value)}
                      placeholder={agentType === 'linkedin' ? 
                        "ex: automatisation RH avec IA" : 
                        "ex: ROI des projets de transformation digitale"
                      }
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      onClick={runSingleTest} 
                      disabled={isRunning}
                      className="flex-1"
                    >
                      {isRunning ? <Clock className="h-4 w-4 mr-2 animate-spin" /> : <Play className="h-4 w-4 mr-2" />}
                      Tester
                    </Button>
                    <Button variant="outline" onClick={loadOptimalConfig}>
                      <Upload className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" onClick={saveOptimalConfig}>
                      <Save className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Prompts */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Prompt Système</Label>
                    <Textarea
                      value={systemPrompt}
                      onChange={(e) => setSystemPrompt(e.target.value)}
                      className="min-h-[120px]"
                      placeholder="Définissez le rôle et les règles de l'agent..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Prompt Utilisateur</Label>
                    <Textarea
                      value={userPrompt}
                      onChange={(e) => setUserPrompt(e.target.value)}
                      className="min-h-[120px]"
                      placeholder="Instruction spécifique pour cette génération..."
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="batch" className="space-y-4 mt-4">
              <div className="text-center">
                <Button 
                  size="lg"
                  onClick={runBatchTest}
                  disabled={isRunning}
                  className="px-8 py-4"
                >
                  {isRunning ? (
                    <>
                      <Clock className="h-5 w-5 mr-2 animate-spin" />
                      Test en cours...
                    </>
                  ) : (
                    <>
                      <Zap className="h-5 w-5 mr-2" />
                      Lancer Test Batch (5 sujets)
                    </>
                  )}
                </Button>
                <p className="text-sm text-gray-600 mt-2">
                  Teste automatiquement 5 sujets différents pour comparer les performances
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mt-6">
                {[
                  "Optimisation RH IA",
                  "Réduction coûts IT",
                  "Migration cloud PME", 
                  "Cybersécurité ESN",
                  "Workflows financiers"
                ].map((subject, index) => (
                  <Card key={index} className="p-4">
                    <div className="text-center">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <span className="text-blue-600 font-semibold">{index + 1}</span>
                      </div>
                      <p className="text-sm font-medium">{subject}</p>
                      <Badge variant="outline" className="mt-2 text-xs">
                        {isRunning ? 'En attente...' : 'Prêt'}
                      </Badge>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="results" className="space-y-4 mt-4">
              <div className="flex justify-between items-center">
                <div className="flex gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{testResults.length}</div>
                    <div className="text-sm text-gray-600">Tests</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {testResults.length > 0 ? 
                        (testResults.reduce((sum, r) => sum + r.metrics.responseTime, 0) / testResults.length / 1000).toFixed(1) : 
                        '0'
                      }s
                    </div>
                    <div className="text-sm text-gray-600">Temps moyen</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {testResults.length > 0 ? 
                        (testResults.reduce((sum, r) => sum + r.metrics.cost, 0)).toFixed(3) : 
                        '0'
                      }€
                    </div>
                    <div className="text-sm text-gray-600">Coût total</div>
                  </div>
                </div>
                <Button onClick={exportResults} variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Exporter
                </Button>
              </div>

              <div className="space-y-4">
                {testResults.map((result) => (
                  <Card key={result.id}>
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{result.provider} - {result.model}</CardTitle>
                          <CardDescription>
                            {new Date(result.timestamp).toLocaleString()} • 
                            {result.metrics.responseTime}ms • 
                            {result.metrics.tokenCount} tokens • 
                            {result.metrics.cost.toFixed(4)}€
                          </CardDescription>
                        </div>
                        <div className="flex gap-2">
                          {[1, 2, 3, 4, 5].map(star => (
                            <button
                              key={star}
                              onClick={() => rateResult(result.id, star, result.feedback)}
                              className={`text-lg ${star <= result.score ? 'text-yellow-500' : 'text-gray-300'}`}
                            >
                              ⭐
                            </button>
                          ))}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {result.variants ? (
                        <div className="space-y-4">
                          {[{label:'120 mots (Mobile)', val: result.variants.v120}, {label:'180 mots (Standard)', val: result.variants.v180}, {label:'300 mots (Détaillé)', val: result.variants.v300}] 
                            .filter(v=>!!v.val)
                            .map((v, idx)=> (
                              <div key={idx} className="border rounded-lg p-3">
                                <div className="flex items-center justify-between mb-2">
                                  <h4 className="font-medium text-sm">{v.label}</h4>
                                  <Button variant="outline" size="sm" onClick={()=> navigator.clipboard.writeText(v.val as string)}>Copier</Button>
                                </div>
                                <div className="bg-white border rounded p-3 text-sm whitespace-pre-wrap">{v.val}</div>
                              </div>
                            ))}
                        </div>
                      ) : (
                        <div>
                          <Label className="text-sm font-medium">Réponse générée:</Label>
                          <div className="mt-1 p-3 bg-gray-50 rounded-lg text-sm">{result.response}</div>
                        </div>
                      )}
                      
                      <div className="flex gap-2">
                        <Input
                          placeholder="Feedback sur cette génération..."
                          value={result.feedback}
                          onChange={(e) => rateResult(result.id, result.score, e.target.value)}
                          className="flex-1"
                        />
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            setSystemPrompt(result.prompt);
                            setActiveTest('single');
                          }}
                        >
                          Reproduire
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}