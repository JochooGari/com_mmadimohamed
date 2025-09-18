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
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="api-keys" className="flex items-center gap-2">
            <Key className="h-4 w-4" />
            Clés API
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