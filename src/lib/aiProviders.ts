// Configuration des fournisseurs d'IA et gestion des clés API

export interface AIProvider {
  id: string;
  name: string;
  baseUrl: string;
  requiresAuth: boolean;
  models: string[];
}

export const AI_PROVIDERS: AIProvider[] = [
  {
    id: 'openai',
    name: 'OpenAI',
    baseUrl: 'https://api.openai.com/v1',
    requiresAuth: true,
    models: ['gpt-5', 'gpt-4-turbo', 'gpt-4', 'gpt-4o']
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    baseUrl: 'https://api.anthropic.com/v1',
    requiresAuth: true,
    models: ['claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku']
  },
  {
    id: 'google',
    name: 'Google AI',
    baseUrl: 'https://generativelanguage.googleapis.com/v1',
    requiresAuth: true,
    models: ['gemini-pro', 'gemini-pro-vision']
  },
  {
    id: 'mistral',
    name: 'Mistral AI',
    baseUrl: 'https://api.mistral.ai/v1',
    requiresAuth: true,
    models: ['mistral-large', 'mistral-medium', 'mistral-small']
  },
  {
    id: 'perplexity',
    name: 'Perplexity',
    baseUrl: 'https://api.perplexity.ai',
    requiresAuth: true,
    models: ['sonar', 'sonar-pro', 'llama-3.1-sonar-small-128k-online', 'llama-3.1-sonar-large-128k-online']
  }
];

// Gestion des clés API (stockage sécurisé côté serveur recommandé)
export const getApiKey = (provider: string): string | null => {
  // En production, ces clés devraient être stockées côté serveur
  // et récupérées via une API sécurisée
  switch (provider) {
    case 'openai':
      return import.meta.env.VITE_OPENAI_API_KEY || null;
    case 'anthropic':
      return import.meta.env.VITE_ANTHROPIC_API_KEY || null;
    case 'google':
      return import.meta.env.VITE_GOOGLE_AI_API_KEY || null;
    case 'mistral':
      return import.meta.env.VITE_MISTRAL_API_KEY || null;
    case 'perplexity':
      return import.meta.env.VITE_PERPLEXITY_API_KEY || null;
    default:
      return null;
  }
};

// Interface pour les messages de chat
export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

// Interface pour les paramètres de génération
export interface GenerationParams {
  model: string;
  messages: ChatMessage[];
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  stopSequences?: string[];
}

// Interface pour la réponse IA
export interface AIResponse {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  model: string;
  finishReason?: string;
}

// Service principal pour appeler les APIs IA
export class AIService {
  private getHeaders(provider: string): Record<string, string> {
    const apiKey = getApiKey(provider);
    if (!apiKey) {
      throw new Error(`Clé API manquante pour le fournisseur ${provider}`);
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    switch (provider) {
      case 'openai':
        headers.Authorization = `Bearer ${apiKey}`;
        break;
      case 'anthropic':
        headers['x-api-key'] = apiKey;
        headers['anthropic-version'] = '2023-06-01';
        break;
      case 'google':
        // Google utilise l'API key dans l'URL
        break;
      case 'mistral':
        headers.Authorization = `Bearer ${apiKey}`;
        break;
      case 'perplexity':
        headers.Authorization = `Bearer ${apiKey}`;
        break;
    }

    return headers;
  }

  private formatMessages(provider: string, messages: ChatMessage[]): any {
    switch (provider) {
      case 'openai':
      case 'mistral':
      case 'perplexity':
        return messages;
      
      case 'anthropic':
        // Claude utilise un format légèrement différent
        const systemMessage = messages.find(m => m.role === 'system');
        const conversationMessages = messages.filter(m => m.role !== 'system');
        
        return {
          system: systemMessage?.content,
          messages: conversationMessages
        };
      
      case 'google':
        // Gemini utilise un format différent
        return {
          contents: messages.filter(m => m.role !== 'system').map(m => ({
            role: m.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: m.content }]
          }))
        };
      
      default:
        return messages;
    }
  }

  async generateCompletion(
    provider: string,
    params: GenerationParams
  ): Promise<AIResponse> {
    const providerConfig = AI_PROVIDERS.find(p => p.id === provider);
    if (!providerConfig) {
      throw new Error(`Fournisseur ${provider} non supporté`);
    }

    try {
      const headers = this.getHeaders(provider);
      const formattedMessages = this.formatMessages(provider, params.messages);
      
      let url = providerConfig.baseUrl;
      let body: any = {};

      switch (provider) {
        case 'openai':
          url += '/chat/completions';
          body = {
            model: params.model,
            messages: formattedMessages,
            temperature: params.temperature ?? 0.7,
            max_tokens: params.maxTokens ?? 2000,
            top_p: params.topP ?? 0.9,
            frequency_penalty: params.frequencyPenalty ?? 0,
            presence_penalty: params.presencePenalty ?? 0,
            stop: params.stopSequences
          };
          break;

        case 'anthropic':
          url += '/messages';
          body = {
            model: params.model,
            max_tokens: params.maxTokens ?? 2000,
            temperature: params.temperature ?? 0.7,
            top_p: params.topP ?? 0.9,
            ...formattedMessages
          };
          break;

        case 'google':
          const apiKey = getApiKey('google');
          url += `/models/${params.model}:generateContent?key=${apiKey}`;
          body = {
            ...formattedMessages,
            generationConfig: {
              temperature: params.temperature ?? 0.7,
              maxOutputTokens: params.maxTokens ?? 2000,
              topP: params.topP ?? 0.9
            }
          };
          break;

        case 'mistral':
          url += '/chat/completions';
          body = {
            model: params.model,
            messages: formattedMessages,
            temperature: params.temperature ?? 0.7,
            max_tokens: params.maxTokens ?? 2000,
            top_p: params.topP ?? 0.9
          };
          break;

        case 'perplexity':
          url += '/chat/completions';
          body = {
            model: params.model,
            messages: formattedMessages,
            temperature: params.temperature ?? 0.7,
            max_tokens: params.maxTokens ?? 2000,
            top_p: params.topP ?? 0.9
          };
          break;
      }

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(`Erreur ${provider}: ${response.status} - ${error.message || response.statusText}`);
      }

      const data = await response.json();
      
      // Normaliser la réponse selon le fournisseur
      return this.normalizeResponse(provider, data, params.model);
      
    } catch (error) {
      console.error(`Erreur lors de l'appel à ${provider}:`, error);
      throw error;
    }
  }

  private normalizeResponse(provider: string, data: any, model: string): AIResponse {
    let content = '';
    let usage: { promptTokens: number; completionTokens: number; totalTokens: number } | undefined = undefined;

    switch (provider) {
      case 'openai':
      case 'mistral':
      case 'perplexity':
        content = data.choices?.[0]?.message?.content || '';
        usage = data.usage ? {
          promptTokens: data.usage.prompt_tokens,
          completionTokens: data.usage.completion_tokens,
          totalTokens: data.usage.total_tokens
        } : undefined;
        break;

      case 'anthropic':
        content = data.content?.[0]?.text || '';
        usage = data.usage ? {
          promptTokens: data.usage.input_tokens,
          completionTokens: data.usage.output_tokens,
          totalTokens: data.usage.input_tokens + data.usage.output_tokens
        } : undefined;
        break;

      case 'google':
        content = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        // Google ne fournit pas toujours les détails d'usage
        break;
    }

    return {
      content,
      usage,
      model,
      finishReason: data.choices?.[0]?.finish_reason || data.stop_reason
    };
  }

  // Méthode pour tester la connexion à un fournisseur
  async testConnection(provider: string, model: string): Promise<boolean> {
    try {
      await this.generateCompletion(provider, {
        model,
        messages: [
          { role: 'user', content: 'Hello, this is a test message. Please respond with "Test successful".' }
        ],
        temperature: 0.1,
        maxTokens: 10
      });
      return true;
    } catch (error) {
      console.error(`Test de connexion échoué pour ${provider}:`, error);
      return false;
    }
  }
}

// Instance globale du service IA
export const aiService = new AIService();