import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { 
  Settings, 
  Key, 
  Shield, 
  Database, 
  Bell, 
  Globe,
  Save,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { aiService, AI_PROVIDERS } from '@/lib/aiProviders';
import ApiKeyDiagnostic from '@/components/ApiKeyDiagnostic';
import EnvDebugger from '@/components/EnvDebugger';
import { getDefaultProvider, getDefaultModel, setDefaultProviderModel, setDefaultParams } from '@/lib/appSettings';

export default function AdminSettings() {
  const [apiKeys, setApiKeys] = useState({
    openai: '',
    anthropic: '',
    google: '',
    mistral: ''
  });
  
  const [showKeys, setShowKeys] = useState({
    openai: false,
    anthropic: false,
    google: false,
    mistral: false
  });

  const [testResults, setTestResults] = useState<Record<string, boolean | null>>({});
  const [testing, setTesting] = useState<Record<string, boolean>>({});

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    agentFailures: true,
    apiLimits: true,
    securityAlerts: true
  });

  const [generalSettings, setGeneralSettings] = useState({
    autoSave: true,
    darkMode: false,
    language: 'fr',
    timezone: 'Europe/Paris'
  });

  // Chat test (unifié)
  const [chatProvider, setChatProvider] = useState<string>(getDefaultProvider() || 'openai');
  const [chatModel, setChatModel] = useState<string>(getDefaultModel() || 'gpt-4o');
  const [chatMemory, setChatMemory] = useState<boolean>(true);
  const [chatTemp, setChatTemp] = useState<number>(0.7);
  const [chatMaxTokens, setChatMaxTokens] = useState<number>(2000);
  const [chatInput, setChatInput] = useState<string>('');
  const [chatMessages, setChatMessages] = useState<Array<{role:'user'|'assistant'|'system'; content:string}>>([]);
  const [lastDebug, setLastDebug] = useState<{ provider?: string; model?: string; tokensParam?: string; temperatureSent?: boolean; maxTokensUsed?: number } | null>(null);
  const [chatAdvanced, setChatAdvanced] = useState<boolean>(false);
  const [chatTopP, setChatTopP] = useState<number>(0.9);
  const [chatFreqPenalty, setChatFreqPenalty] = useState<number>(0.3);
  const [chatPresencePenalty, setChatPresencePenalty] = useState<number>(0.1);
  const providerModels = AI_PROVIDERS.find(p=>p.id===chatProvider)?.models || [];
  // Reset transcript when provider/model changes and mémoire désactivée
  React.useEffect(() => {
    if (!chatMemory) setChatMessages([]);
    setLastDebug(null);
  }, [chatProvider, chatModel, chatMemory]);

  // Persist defaults for other pages (Workflow, Agents)
  React.useEffect(()=>{
    try { setDefaultProviderModel(chatProvider as any, chatModel); } catch {}
  }, [chatProvider, chatModel]);
  React.useEffect(()=>{
    try { setDefaultParams(chatTemp, chatMaxTokens); } catch {}
  }, [chatTemp, chatMaxTokens]);
  
  const sendChat = async () => {
    const content = chatInput.trim();
    if (!content) return;
    setChatInput('');
    const sys = [] as Array<{role:'system'; content:string}>;
    if (chatAdvanced) {
      sys.push({ role:'system', content: `Tu es un expert en stratégie contenu, SEO et growth. Objectif: produire des réponses actionnables et structurées comme sur l'interface web officielle.
Format attendu:
1) Accroche claire (1-2 phrases)
2) Plan numéroté avec titres forts, sous-points précis et exemples
3) Bonnes pratiques et erreurs à éviter
4) Mini plan d'action 30/60/90 jours si pertinent
5) Question de suivi pour contextualiser
Style: français naturel, ton pro, concis mais riche, éventuellement emojis contextuels, listes et tableaux lorsque utile.` });
    }
    const history = chatMemory ? [...sys, ...chatMessages] : [...sys];
    const messages = [...history, { role:'user' as const, content }];
    setChatMessages(messages);
    const r = await fetch('/api/n8n/execute', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ workflowId:'test-agent', data:{ messages }, config:{ provider: chatProvider, model: chatModel, temperature: chatTemp, maxTokens: chatMaxTokens, topP: chatTopP, frequencyPenalty: chatFreqPenalty, presencePenalty: chatPresencePenalty } }) });
    const body = await r.json().catch(()=>({}));
    const text = body?.output?.text || body?.error || 'Erreur';
    setLastDebug(body?.debug || null);
    setChatMessages(prev => [...prev, { role:'assistant', content: String(text) }]);
  };

  const handleApiKeyChange = (provider: string, value: string) => {
    setApiKeys(prev => ({ ...prev, [provider]: value }));
    setTestResults(prev => ({ ...prev, [provider]: null }));
  };

  const toggleKeyVisibility = (provider: string) => {
    setShowKeys(prev => ({ ...prev, [provider]: !prev[provider] }));
  };

  const testConnection = async (provider: string) => {
    if (!apiKeys[provider]) return;
    
    setTesting(prev => ({ ...prev, [provider]: true }));
    
    const providerConfig = AI_PROVIDERS.find(p => p.id === provider);
    if (!providerConfig) return;
    
    try {
      const result = await aiService.testConnection(provider, providerConfig.models[0]);
      setTestResults(prev => ({ ...prev, [provider]: result }));
    } catch (error) {
      setTestResults(prev => ({ ...prev, [provider]: false }));
    } finally {
      setTesting(prev => ({ ...prev, [provider]: false }));
    }
  };

  const saveApiKeys = () => {
    console.log('Sauvegarde des clés API:', apiKeys);
  };

  const saveNotifications = () => {
    console.log('Sauvegarde des notifications:', notifications);
  };

  const saveGeneralSettings = () => {
    console.log('Sauvegarde des paramètres généraux:', generalSettings);
  };

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center gap-3 mb-8">
        <Settings className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold">Paramètres d'administration</h1>
          <p className="text-gray-600">Configurez les paramètres système et les intégrations</p>
        </div>
      </div>

      <Tabs defaultValue="api-keys" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="api-keys" className="flex items-center gap-2">
            <Key className="h-4 w-4" />
            Clés API
          </TabsTrigger>
          <TabsTrigger value="ai-chat" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Test IA (Chat)
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Sécurité
          </TabsTrigger>
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Général
          </TabsTrigger>
        </TabsList>

        <TabsContent value="api-keys">
          <div className="space-y-6">
            <EnvDebugger />
            <ApiKeyDiagnostic />
            
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Configuration des fournisseurs IA
              </CardTitle>
              <CardDescription>
                Configurez vos clés API pour les différents fournisseurs d'intelligence artificielle
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {AI_PROVIDERS.map(provider => (
                <div key={provider.id} className="space-y-4 p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold">{provider.name}</h3>
                      <Badge variant="secondary">{provider.models.length} modèles</Badge>
                      {testResults[provider.id] === true && (
                        <Badge variant="default" className="bg-green-100 text-green-700">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Connecté
                        </Badge>
                      )}
                      {testResults[provider.id] === false && (
                        <Badge variant="destructive">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Erreur
                        </Badge>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => testConnection(provider.id)}
                        disabled={!apiKeys[provider.id] || testing[provider.id]}
                      >
                        {testing[provider.id] ? 'Test...' : 'Tester'}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`${provider.id}-key`}>Clé API</Label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Input
                          id={`${provider.id}-key`}
                          type={showKeys[provider.id] ? 'text' : 'password'}
                          value={apiKeys[provider.id]}
                          onChange={(e) => handleApiKeyChange(provider.id, e.target.value)}
                          placeholder={`Entrez votre clé API ${provider.name}`}
                          className="pr-10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3"
                          onClick={() => toggleKeyVisibility(provider.id)}
                        >
                          {showKeys[provider.id] ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500">
                      URL de base: {provider.baseUrl}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {provider.models.map(model => (
                        <Badge key={model} variant="outline" className="text-xs">
                          {model}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              ))}

              <div className="flex justify-end pt-4">
                <Button onClick={saveApiKeys} className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  Sauvegarder les clés API
                </Button>
              </div>
            </CardContent>
          </Card>
          </div>
        </TabsContent>

        <TabsContent value="ai-chat">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">Chat de test (mémoire optionnelle)</CardTitle>
              <CardDescription>Sélectionnez le fournisseur et le modèle, puis discutez pour valider la connectivité et la qualité.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
                <div>
                  <Label>Fournisseur</Label>
                  <select className="w-full p-2 border rounded-md" value={chatProvider} onChange={(e)=>{ setChatProvider(e.target.value); const first = (AI_PROVIDERS.find(p=>p.id===e.target.value)?.models||[])[0] || ''; setChatModel(first); }}>
                    {AI_PROVIDERS.map(p=> (<option key={p.id} value={p.id}>{p.name}</option>))}
                  </select>
                </div>
                <div>
                  <Label>Modèle</Label>
                  <select className="w-full p-2 border rounded-md" value={chatModel} onChange={(e)=> setChatModel(e.target.value)}>
                    {providerModels.map(m=> (<option key={m} value={m}>{m}</option>))}
                  </select>
                </div>
                <div>
                  <Label>Température ({chatTemp.toFixed(2)})</Label>
                  <input type="range" min={0} max={2} step={0.1} value={chatTemp} onChange={(e)=> setChatTemp(parseFloat(e.target.value))} className="w-full" />
                </div>
                <div>
                  <Label>Max tokens</Label>
                  <Input type="number" min={1} value={chatMaxTokens} onChange={(e)=> setChatMaxTokens(parseInt(e.target.value||'0'))} />
                </div>
                <div className="flex items-end gap-2">
                  <div className="flex items-center gap-2">
                    <Switch checked={chatMemory} onCheckedChange={setChatMemory} />
                    <span className="text-sm">Mémoire conversationnelle</span>
                  </div>
                </div>
                <div className="flex items-end gap-2">
                  <div className="flex items-center gap-2">
                    <Switch checked={chatAdvanced} onCheckedChange={setChatAdvanced} />
                    <span className="text-sm">Qualité avancée (style web)</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
                <div>
                  <Label>Top‑P</Label>
                  <Input type="number" step="0.05" min={0} max={1} value={chatTopP} onChange={(e)=> setChatTopP(parseFloat(e.target.value||'0'))} />
                </div>
                <div>
                  <Label>Frequency penalty</Label>
                  <Input type="number" step="0.1" min={0} max={2} value={chatFreqPenalty} onChange={(e)=> setChatFreqPenalty(parseFloat(e.target.value||'0'))} />
                </div>
                <div>
                  <Label>Presence penalty</Label>
                  <Input type="number" step="0.1" min={0} max={2} value={chatPresencePenalty} onChange={(e)=> setChatPresencePenalty(parseFloat(e.target.value||'0'))} />
                </div>
              </div>

              {lastDebug && (
                <div className="text-xs text-gray-600 flex flex-wrap gap-2 items-center">
                  <span>Paramètres envoyés:</span>
                  <Badge variant="outline">provider: {lastDebug.provider}</Badge>
                  <Badge variant="outline">model: {lastDebug.model}</Badge>
                  <Badge variant="outline">temp: {lastDebug.temperatureSent ? chatTemp : 'omise'}</Badge>
                  <Badge variant="outline">{lastDebug.tokensParam || 'max_tokens'}: {lastDebug.maxTokensUsed ?? chatMaxTokens}</Badge>
                </div>
              )}

              <div className="border rounded-lg p-3 bg-white min-h-[200px] max-h-[340px] overflow-auto">
                {chatMessages.length===0 && (
                  <div className="text-sm text-gray-500">Commencez une conversation pour tester le modèle.</div>
                )}
                {chatMessages.map((m,i)=>(
                  <div key={i} className={`text-sm mb-2 ${m.role==='assistant'?'text-gray-900':'text-gray-700'}`}>
                    <strong>{m.role==='assistant'?'IA':'Vous'}:</strong> <span className="whitespace-pre-wrap">{m.content}</span>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Input placeholder="Écrire un message..." value={chatInput} onChange={(e)=> setChatInput(e.target.value)} />
                <Button onClick={sendChat}>Envoyer</Button>
                <Button variant="outline" onClick={()=> setChatMessages([])}>Vider l'historique</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Préférences de notifications
              </CardTitle>
              <CardDescription>
                Configurez les types de notifications que vous souhaitez recevoir
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Notifications par email</h3>
                    <p className="text-sm text-gray-500">Recevoir les notifications importantes par email</p>
                  </div>
                  <Switch
                    checked={notifications.emailNotifications}
                    onCheckedChange={(checked) => 
                      setNotifications(prev => ({ ...prev, emailNotifications: checked }))
                    }
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Échecs d'agents</h3>
                    <p className="text-sm text-gray-500">Être notifié lorsqu'un agent IA échoue</p>
                  </div>
                  <Switch
                    checked={notifications.agentFailures}
                    onCheckedChange={(checked) => 
                      setNotifications(prev => ({ ...prev, agentFailures: checked }))
                    }
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Limites API</h3>
                    <p className="text-sm text-gray-500">Alertes sur l'approche des limites d'utilisation API</p>
                  </div>
                  <Switch
                    checked={notifications.apiLimits}
                    onCheckedChange={(checked) => 
                      setNotifications(prev => ({ ...prev, apiLimits: checked }))
                    }
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Alertes de sécurité</h3>
                    <p className="text-sm text-gray-500">Notifications pour les événements de sécurité</p>
                  </div>
                  <Switch
                    checked={notifications.securityAlerts}
                    onCheckedChange={(checked) => 
                      setNotifications(prev => ({ ...prev, securityAlerts: checked }))
                    }
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button onClick={saveNotifications} className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  Sauvegarder les notifications
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Paramètres de sécurité
              </CardTitle>
              <CardDescription>
                Configurez les paramètres de sécurité et d'accès
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="p-4 border rounded-lg bg-yellow-50">
                  <h3 className="font-medium text-yellow-800 mb-2">Recommandations de sécurité</h3>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    <li>• Utilisez des clés API avec des permissions limitées</li>
                    <li>• Renouvelez régulièrement vos clés API</li>
                    <li>• Surveillez l'utilisation de vos APIs</li>
                    <li>• Ne partagez jamais vos clés API</li>
                  </ul>
                </div>

                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium mb-2">Stockage des clés API</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    En production, les clés API sont stockées de manière sécurisée côté serveur.
                    Les variables d'environnement VITE_ sont uniquement pour le développement.
                  </p>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700">
                    <Database className="h-3 w-3 mr-1" />
                    Chiffrement AES-256
                  </Badge>
                </div>

                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium mb-2">Audit et surveillance</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Toutes les interactions avec les APIs sont enregistrées pour l'audit et la surveillance.
                  </p>
                  <div className="flex gap-2">
                    <Badge variant="outline">Logs API</Badge>
                    <Badge variant="outline">Métriques d'usage</Badge>
                    <Badge variant="outline">Détection d'anomalies</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Paramètres généraux
              </CardTitle>
              <CardDescription>
                Configurez les préférences générales de l'interface d'administration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Sauvegarde automatique</h3>
                    <p className="text-sm text-gray-500">Sauvegarder automatiquement les modifications</p>
                  </div>
                  <Switch
                    checked={generalSettings.autoSave}
                    onCheckedChange={(checked) => 
                      setGeneralSettings(prev => ({ ...prev, autoSave: checked }))
                    }
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Mode sombre</h3>
                    <p className="text-sm text-gray-500">Utiliser le thème sombre de l'interface</p>
                  </div>
                  <Switch
                    checked={generalSettings.darkMode}
                    onCheckedChange={(checked) => 
                      setGeneralSettings(prev => ({ ...prev, darkMode: checked }))
                    }
                  />
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label htmlFor="language">Langue de l'interface</Label>
                  <select
                    id="language"
                    className="w-full p-2 border rounded-md"
                    value={generalSettings.language}
                    onChange={(e) => 
                      setGeneralSettings(prev => ({ ...prev, language: e.target.value }))
                    }
                  >
                    <option value="fr">Français</option>
                    <option value="en">English</option>
                    <option value="es">Español</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timezone">Fuseau horaire</Label>
                  <select
                    id="timezone"
                    className="w-full p-2 border rounded-md"
                    value={generalSettings.timezone}
                    onChange={(e) => 
                      setGeneralSettings(prev => ({ ...prev, timezone: e.target.value }))
                    }
                  >
                    <option value="Europe/Paris">Europe/Paris (UTC+1)</option>
                    <option value="UTC">UTC</option>
                    <option value="America/New_York">America/New_York (EST)</option>
                    <option value="Asia/Tokyo">Asia/Tokyo (JST)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button onClick={saveGeneralSettings} className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  Sauvegarder les paramètres
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}