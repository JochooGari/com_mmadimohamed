import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Key,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Loader2
} from 'lucide-react';

interface ProviderStatus {
  id: string;
  name: string;
  status: 'loading' | 'configured' | 'missing' | 'error';
  message?: string;
}

export default function ApiKeyDiagnostic() {
  const [providers, setProviders] = useState<ProviderStatus[]>([
    { id: 'openai', name: 'OpenAI', status: 'loading' },
    { id: 'anthropic', name: 'Anthropic', status: 'loading' },
    { id: 'perplexity', name: 'Perplexity', status: 'loading' },
    { id: 'google', name: 'Google AI', status: 'loading' },
    { id: 'mistral', name: 'Mistral AI', status: 'loading' }
  ]);
  const [isLoading, setIsLoading] = useState(true);

  const checkApiKeys = async () => {
    setIsLoading(true);

    // Test each provider via server-side API
    const updatedProviders = await Promise.all(
      providers.map(async (provider) => {
        try {
          const response = await fetch('/api/check-api-key', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ provider: provider.id })
          });

          if (response.ok) {
            const data = await response.json();
            return {
              ...provider,
              status: data.configured ? 'configured' : 'missing',
              message: data.message
            } as ProviderStatus;
          } else {
            return {
              ...provider,
              status: 'error',
              message: 'Erreur lors de la vérification'
            } as ProviderStatus;
          }
        } catch (error) {
          return {
            ...provider,
            status: 'error',
            message: 'API non disponible'
          } as ProviderStatus;
        }
      })
    );

    setProviders(updatedProviders);
    setIsLoading(false);
  };

  useEffect(() => {
    checkApiKeys();
  }, []);

  const configuredCount = providers.filter(p => p.status === 'configured').length;
  const missingCount = providers.filter(p => p.status === 'missing').length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Diagnostic des clés API
          </div>
          <Button variant="outline" size="sm" onClick={checkApiKeys} disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>
        </CardTitle>
        <CardDescription>
          Vérification des clés API configurées côté serveur
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* État global */}
        <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
          <div className="text-center">
            <div className="text-lg font-bold text-green-600">
              {configuredCount}
            </div>
            <div className="text-sm text-gray-600">Clés configurées</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-red-600">
              {missingCount}
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
          <h3 className="font-medium">Statut par provider</h3>
          {providers.map(provider => (
            <div key={provider.id} className="p-3 border rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="font-medium">{provider.name}</span>
                {provider.status === 'loading' && (
                  <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                )}
                {provider.status === 'configured' && (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                )}
                {provider.status === 'missing' && (
                  <AlertCircle className="h-4 w-4 text-red-600" />
                )}
                {provider.status === 'error' && (
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                )}
              </div>
              <div>
                {provider.status === 'loading' && (
                  <Badge variant="outline">Vérification...</Badge>
                )}
                {provider.status === 'configured' && (
                  <Badge variant="default" className="bg-green-100 text-green-700">
                    Configurée
                  </Badge>
                )}
                {provider.status === 'missing' && (
                  <Badge variant="destructive">
                    Manquante
                  </Badge>
                )}
                {provider.status === 'error' && (
                  <Badge variant="outline" className="bg-yellow-100 text-yellow-700">
                    Erreur
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Instructions */}
        {missingCount > 0 && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-2">Configuration des clés API</h4>
            <div className="text-sm text-blue-700 space-y-2">
              <p>Les clés API sont configurées de manière sécurisée côté serveur :</p>
              <ul className="list-disc ml-4 space-y-1">
                <li><strong>En local :</strong> Dans le fichier <code>.env.local</code></li>
                <li><strong>En production :</strong> Dans les variables d'environnement Vercel</li>
              </ul>
              <p className="mt-2">
                Variables requises : <code>OPENAI_API_KEY</code>, <code>ANTHROPIC_API_KEY</code>, <code>PERPLEXITY_API_KEY</code>
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
