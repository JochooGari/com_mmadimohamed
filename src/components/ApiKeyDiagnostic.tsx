import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Key, 
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff,
  RefreshCw,
  Copy
} from 'lucide-react';
import { getApiKey } from '@/lib/aiProviders';

export default function ApiKeyDiagnostic() {
  const [apiKeys, setApiKeys] = useState<Record<string, string | null>>({});
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [envVars, setEnvVars] = useState<Record<string, string | undefined>>({});

  const providers = [
    { id: 'openai', name: 'OpenAI', envVar: 'VITE_OPENAI_API_KEY' },
    { id: 'anthropic', name: 'Anthropic', envVar: 'VITE_ANTHROPIC_API_KEY' },
    { id: 'google', name: 'Google AI', envVar: 'VITE_GOOGLE_AI_API_KEY' },
    { id: 'mistral', name: 'Mistral AI', envVar: 'VITE_MISTRAL_API_KEY' },
    { id: 'perplexity', name: 'Perplexity', envVar: 'VITE_PERPLEXITY_API_KEY' }
  ];

  useEffect(() => {
    // Diagnostic des clés API
    const keys: Record<string, string | null> = {};
    const env: Record<string, string | undefined> = {};
    
    providers.forEach(provider => {
      keys[provider.id] = getApiKey(provider.id);
      env[provider.envVar] = import.meta.env[provider.envVar];
    });
    
    setApiKeys(keys);
    setEnvVars(env);
    
    console.log('🔍 Diagnostic des clés API:');
    console.log('Variables d\'environnement:', env);
    console.log('Clés récupérées:', keys);
  }, []);

  const toggleKeyVisibility = (providerId: string) => {
    setShowKeys(prev => ({ ...prev, [providerId]: !prev[providerId] }));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copié dans le presse-papier !');
  };

  const maskKey = (key: string | null) => {
    if (!key) return null;
    if (key.length <= 8) return key;
    return key.substring(0, 6) + '...' + key.substring(key.length - 4);
  };

  const refresh = () => {
    window.location.reload();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Diagnostic des clés API
          </div>
          <Button variant="outline" size="sm" onClick={refresh}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </CardTitle>
        <CardDescription>
          Vérification de la configuration des variables d'environnement
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* État global */}
        <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
          <div className="text-center">
            <div className="text-lg font-bold text-green-600">
              {Object.values(apiKeys).filter(key => key && key.length > 0).length}
            </div>
            <div className="text-sm text-gray-600">Clés configurées</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-red-600">
              {Object.values(apiKeys).filter(key => !key || key.length === 0).length}
            </div>
            <div className="text-sm text-gray-600">Clés manquantes</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-blue-600">
              {providers.length}
            </div>
            <div className="text-sm text-gray-600">Providers total</div>
          </div>
        </div>

        {/* Détail par provider */}
        <div className="space-y-3">
          <h3 className="font-medium">Détail par provider</h3>
          {providers.map(provider => {
            const hasKey = apiKeys[provider.id] && apiKeys[provider.id]!.length > 0;
            const envValue = envVars[provider.envVar];
            
            return (
              <div key={provider.id} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{provider.name}</span>
                    {hasKey ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-600" />
                    )}
                    <Badge variant={hasKey ? 'default' : 'destructive'}>
                      {hasKey ? 'Configuré' : 'Manquant'}
                    </Badge>
                  </div>
                  {hasKey && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleKeyVisibility(provider.id)}
                    >
                      {showKeys[provider.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  )}
                </div>

                <div className="space-y-2 text-sm">
                  <div>
                    <Label className="text-xs text-gray-500">Variable d'environnement</Label>
                    <div className="flex items-center gap-2">
                      <code className="text-xs bg-gray-100 px-2 py-1 rounded">{provider.envVar}</code>
                      {envValue && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(envValue)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs text-gray-500">Valeur détectée</Label>
                    <div className="font-mono text-xs p-2 bg-gray-100 rounded">
                      {hasKey ? (
                        showKeys[provider.id] ? 
                          apiKeys[provider.id] : 
                          maskKey(apiKeys[provider.id])
                      ) : (
                        <span className="text-red-600">❌ Aucune clé détectée</span>
                      )}
                    </div>
                  </div>

                  {!hasKey && (
                    <div className="p-2 bg-yellow-50 border border-yellow-200 rounded">
                      <p className="text-xs text-yellow-800">
                        💡 <strong>Pour corriger :</strong>
                      </p>
                      <ol className="text-xs text-yellow-700 mt-1 ml-4 list-decimal">
                        <li>Ajoutez <code>{provider.envVar}=votre_clé_ici</code> dans <code>.env.local</code></li>
                        <li>Redémarrez le serveur de développement</li>
                        <li>Actualisez cette page</li>
                      </ol>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Instructions */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-medium text-blue-800 mb-2">📋 Instructions de configuration</h4>
          <div className="text-sm text-blue-700 space-y-2">
            <p><strong>1. Ouvrez le fichier :</strong> <code>.env.local</code></p>
            <p><strong>2. Ajoutez vos clés :</strong></p>
            <pre className="text-xs bg-blue-100 p-2 rounded mt-1">
{`VITE_OPENAI_API_KEY=sk-...
VITE_ANTHROPIC_API_KEY=sk-ant-...
VITE_PERPLEXITY_API_KEY=pplx-...`}
            </pre>
            <p><strong>3. Redémarrez :</strong> <code>npm run dev</code></p>
            <p><strong>4. Actualisez cette page</strong></p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}