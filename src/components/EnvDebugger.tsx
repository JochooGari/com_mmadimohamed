import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Bug, 
  RefreshCw, 
  Copy,
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react';

export default function EnvDebugger() {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copié !');
  };

  // Récupération de TOUTES les variables d'environnement
  const allEnvVars = import.meta.env;
  
  // Variables spécifiques aux clés API
  const apiKeyVars = {
    'VITE_OPENAI_API_KEY': import.meta.env.VITE_OPENAI_API_KEY,
    'VITE_ANTHROPIC_API_KEY': import.meta.env.VITE_ANTHROPIC_API_KEY,
    'VITE_GOOGLE_AI_API_KEY': import.meta.env.VITE_GOOGLE_AI_API_KEY,
    'VITE_MISTRAL_API_KEY': import.meta.env.VITE_MISTRAL_API_KEY,
    'VITE_PERPLEXITY_API_KEY': import.meta.env.VITE_PERPLEXITY_API_KEY
  };

  const reload = () => {
    window.location.reload();
  };

  const getStatusIcon = (value: string | undefined) => {
    if (value && value.length > 0) {
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    }
    return <AlertCircle className="h-4 w-4 text-red-600" />;
  };

  const maskValue = (value: string | undefined) => {
    if (!value) return '❌ undefined';
    if (value.length === 0) return '❌ chaîne vide';
    if (value.length <= 8) return value;
    return value.substring(0, 6) + '...' + value.substring(value.length - 4);
  };

  return (
    <Card className="border-2 border-orange-200">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bug className="h-5 w-5 text-orange-600" />
            Debug Variables d'Environnement
          </div>
          <Button variant="outline" size="sm" onClick={reload}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </CardTitle>
        <CardDescription>
          Diagnostic approfondi des variables Vite
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* État global */}
        <div className="p-4 bg-blue-50 rounded-lg">
          <h3 className="font-medium text-blue-800 mb-2">📊 Résumé</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <strong>Variables Vite détectées:</strong> {Object.keys(allEnvVars).length}
            </div>
            <div>
              <strong>Variables VITE_*:</strong> {Object.keys(allEnvVars).filter(k => k.startsWith('VITE_')).length}
            </div>
            <div>
              <strong>Clés API configurées:</strong> {Object.values(apiKeyVars).filter(v => v && v.length > 0).length}/5
            </div>
            <div>
              <strong>Mode:</strong> {import.meta.env.MODE}
            </div>
          </div>
        </div>

        {/* Variables d'API spécifiques */}
        <div>
          <h3 className="font-medium mb-3">🔑 Variables API (détail)</h3>
          <div className="space-y-3">
            {Object.entries(apiKeyVars).map(([key, value]) => (
              <div key={key} className="p-3 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">{key}</code>
                    {getStatusIcon(value)}
                  </div>
                  {value && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(value)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  )}
                </div>
                
                <div className="text-sm space-y-1">
                  <div className="flex items-center gap-2">
                    <strong>Valeur:</strong>
                    <span className="font-mono text-xs p-1 bg-gray-100 rounded">
                      {maskValue(value)}
                    </span>
                  </div>
                  <div>
                    <strong>Type:</strong> {typeof value}
                  </div>
                  <div>
                    <strong>Longueur:</strong> {value ? value.length : 0} caractères
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Toutes les variables Vite */}
        <details className="border rounded-lg p-4">
          <summary className="cursor-pointer font-medium">
            🔍 Toutes les variables d'environnement Vite
          </summary>
          <div className="mt-3 space-y-2 max-h-64 overflow-y-auto">
            {Object.entries(allEnvVars).map(([key, value]) => (
              <div key={key} className="text-sm border-b pb-1">
                <code className="text-blue-600">{key}</code>
                <span className="text-gray-500"> = </span>
                <span className="font-mono">
                  {typeof value === 'string' && value.length > 50 
                    ? value.substring(0, 50) + '...' 
                    : String(value)
                  }
                </span>
              </div>
            ))}
          </div>
        </details>

        {/* Instructions debug */}
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h4 className="font-medium text-yellow-800 mb-2">🛠️ Instructions Debug</h4>
          <div className="text-sm text-yellow-700 space-y-2">
            <div>
              <strong>1. Vérifiez le fichier .env.local :</strong>
              <pre className="text-xs bg-yellow-100 p-2 rounded mt-1 overflow-x-auto">
{`# Le fichier doit être à la racine du projet (même niveau que package.json)
VITE_OPENAI_API_KEY=sk-votre_cle_ici
VITE_PERPLEXITY_API_KEY=pplx-votre_cle_ici`}
              </pre>
            </div>
            
            <div>
              <strong>2. Redémarrez complètement :</strong>
              <pre className="text-xs bg-yellow-100 p-2 rounded mt-1">
{`# Arrêtez le serveur (Ctrl+C)
# Puis relancez :
npm run dev`}
              </pre>
            </div>

            <div>
              <strong>3. Vérifiez le nom du fichier :</strong>
              <ul className="text-xs ml-4 list-disc">
                <li>Doit s'appeler exactement <code>.env.local</code></li>
                <li>Pas <code>.env</code> ou <code>env.local</code></li>
                <li>Le point au début est important</li>
              </ul>
            </div>

            <div>
              <strong>4. Syntaxe du fichier :</strong>
              <ul className="text-xs ml-4 list-disc">
                <li>Pas d'espaces autour du =</li>
                <li>Pas de guillemets</li>
                <li>Une variable par ligne</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Actions de debug */}
        <div className="flex gap-2">
          <Button 
            onClick={() => {
              console.log('🔍 Variables d\'environnement complètes:', allEnvVars);
              console.log('🔑 Variables API spécifiques:', apiKeyVars);
              alert('Variables loggées dans la console (F12)');
            }}
            variant="outline"
          >
            <Info className="h-4 w-4 mr-2" />
            Log dans Console
          </Button>
          
          <Button
            onClick={() => {
              const debugInfo = {
                timestamp: new Date().toISOString(),
                mode: import.meta.env.MODE,
                allVars: allEnvVars,
                apiVars: apiKeyVars,
                userAgent: navigator.userAgent
              };
              copyToClipboard(JSON.stringify(debugInfo, null, 2));
            }}
            variant="outline"
          >
            <Copy className="h-4 w-4 mr-2" />
            Copier Debug Info
          </Button>
        </div>

      </CardContent>
    </Card>
  );
}