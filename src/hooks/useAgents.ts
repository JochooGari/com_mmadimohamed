import { useState, useEffect, useCallback } from 'react';

// Types
export type AIProvider = 'openai' | 'anthropic' | 'perplexity' | 'google' | 'mistral' | 'local';

export interface Agent {
  id: string;
  name: string;
  role: string;
  prompt: string;
  systemPrompt?: string;
  status?: 'active' | 'inactive';
  description?: string;
  category?: string;
  provider?: AIProvider;
  model: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  stopSequences?: string[];
  tools?: string[];
  memoryEnabled?: boolean;
  contextWindow?: number;
  responseFormat?: 'text' | 'json' | 'markdown';
  instructions?: string;
  examples?: Array<{ input: string; output: string }>;
  variables?: Array<{ name: string; type: string; description: string; required: boolean }>;
}

export interface AIModel {
  id: string;
  name: string;
  provider: AIProvider;
  maxTokens: number;
  costPer1kTokens: number;
  capabilities: string[];
}

// Default models list with updated Claude models
export const AI_MODELS: AIModel[] = [
  {
    id: 'gpt-4-turbo',
    name: 'GPT-4 Turbo',
    provider: 'openai',
    maxTokens: 128000,
    costPer1kTokens: 0.01,
    capabilities: ['text-generation', 'code-generation', 'analysis', 'reasoning']
  },
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'openai',
    maxTokens: 128000,
    costPer1kTokens: 0.005,
    capabilities: ['text-generation', 'code-generation', 'analysis', 'reasoning', 'vision']
  },
  {
    id: 'gpt-3.5-turbo',
    name: 'GPT-3.5 Turbo',
    provider: 'openai',
    maxTokens: 16385,
    costPer1kTokens: 0.002,
    capabilities: ['text-generation', 'conversations', 'summarization']
  },
  {
    id: 'sonar',
    name: 'Perplexity Sonar',
    provider: 'perplexity',
    maxTokens: 32768,
    costPer1kTokens: 0,
    capabilities: ['web-search', 'retrieval', 'text-generation']
  },
  {
    id: 'sonar-pro',
    name: 'Perplexity Sonar Pro',
    provider: 'perplexity',
    maxTokens: 131072,
    costPer1kTokens: 0,
    capabilities: ['web-search', 'retrieval', 'text-generation']
  },
  {
    id: 'claude-sonnet-4-5-20250514',
    name: 'Claude Sonnet 4.5',
    provider: 'anthropic',
    maxTokens: 200000,
    costPer1kTokens: 0.003,
    capabilities: ['text-generation', 'analysis', 'reasoning', 'code-generation']
  },
  {
    id: 'claude-3-5-sonnet-latest',
    name: 'Claude 3.5 Sonnet',
    provider: 'anthropic',
    maxTokens: 200000,
    costPer1kTokens: 0.003,
    capabilities: ['text-generation', 'analysis', 'conversations']
  },
  {
    id: 'claude-3-5-haiku-latest',
    name: 'Claude 3.5 Haiku',
    provider: 'anthropic',
    maxTokens: 200000,
    costPer1kTokens: 0.001,
    capabilities: ['text-generation', 'fast-responses', 'conversations']
  },
  {
    id: 'gemini-pro',
    name: 'Gemini Pro',
    provider: 'google',
    maxTokens: 32768,
    costPer1kTokens: 0.0005,
    capabilities: ['text-generation', 'multimodal', 'reasoning']
  },
  {
    id: 'gemini-2.0-flash',
    name: 'Gemini 2.0 Flash',
    provider: 'google',
    maxTokens: 1000000,
    costPer1kTokens: 0.0001,
    capabilities: ['text-generation', 'multimodal', 'fast-responses']
  },
  {
    id: 'mistral-large',
    name: 'Mistral Large',
    provider: 'mistral',
    maxTokens: 32768,
    costPer1kTokens: 0.008,
    capabilities: ['text-generation', 'multilingual', 'reasoning']
  }
];

// Default agents configuration
const DEFAULT_AGENTS: Agent[] = [
  {
    id: 'search-content',
    name: 'Agent Search Content',
    role: 'Content Discovery',
    prompt: `Tu es un agent spécialisé dans l'analyse de contenu web et la proposition de sujets d'articles.

Tâches :
1. Scanner le site web fourni
2. Analyser le contenu existant
3. Identifier les lacunes et opportunités
4. Proposer 3-5 sujets d'articles pertinents
5. Fournir un brief pour chaque sujet

Retourne les sujets au format JSON.`,
    systemPrompt: '',
    status: 'active',
    description: 'Recherche et analyse le contenu web pour proposer des sujets pertinents',
    category: 'Content Creation',
    provider: 'perplexity',
    model: 'sonar',
    temperature: 0.7,
    maxTokens: 2000,
    responseFormat: 'json',
    tools: ['web_search', 'data_analysis', 'file_reader'],
    memoryEnabled: true
  },
  {
    id: 'ghostwriter',
    name: 'Agent Ghostwriter',
    role: 'Content Writing',
    prompt: `Tu es un rédacteur expert spécialisé dans la création de contenu web de qualité professionnelle style Neil Patel.

IMPORTANT: Tu DOIS toujours fournir un article COMPLET. Ne jamais dire "I'm unable to..." ou tronquer le contenu.

Structure requise :
- Titre accrocheur (H1)
- Introduction engageante (150-200 mots)
- Corps de l'article avec sous-titres (H2, H3) - minimum 1500 mots
- Conclusion avec call-to-action
- Meta description (155 caractères)

Critères de qualité :
- Ton professionnel mais accessible
- Optimisation SEO naturelle
- Données et exemples concrets
- Lisibilité élevée (phrases courtes, paragraphes aérés)

Retourne l'article COMPLET au format JSON avec cette structure :
{
  "title": "Titre H1",
  "metaTitle": "Meta title SEO",
  "metaDescription": "Meta description SEO",
  "slug": "url-slug",
  "keywords": ["mot-clé1", "mot-clé2"],
  "tableOfContents": [...],
  "introduction": "Introduction engageante",
  "sections": [...],
  "conclusion": "Conclusion avec CTA",
  "wordCount": 1500
}`,
    systemPrompt: 'Tu es un ghostwriter professionnel. Tu produis TOUJOURS des articles complets sans jamais tronquer ou refuser.',
    status: 'active',
    description: 'Rédacteur IA spécialisé dans le contenu long-form optimisé SEO/GEO',
    category: 'Content Creation',
    provider: 'openai',
    model: 'gpt-4o',
    temperature: 0.8,
    maxTokens: 8000,
    responseFormat: 'json',
    tools: ['web_search', 'data_analysis', 'file_reader'],
    memoryEnabled: true
  },
  {
    id: 'review-content',
    name: 'Agent Reviewer',
    role: 'Content Review',
    prompt: `Tu es un expert en révision de contenu et optimisation éditoriale.

Analyse l'article fourni et retourne UNIQUEMENT un JSON valide :
{
  "review": {
    "globalScore": 85,
    "detailedScores": {
      "writing": 22,
      "relevance": 18,
      "seo": 17,
      "geo": 13,
      "structure": 13,
      "engagement": 8,
      "briefCompliance": 9
    },
    "strengths": ["Point fort 1", "Point fort 2"],
    "improvements": ["Amélioration 1", "Amélioration 2"],
    "recommendations": ["Recommandation 1", "Recommandation 2"],
    "actions": ["Action 1", "Action 2"],
    "targetScore": 95
  }
}`,
    systemPrompt: '',
    status: 'active',
    description: 'Analyse les articles et donne des scores SEO/GEO avec recommandations',
    category: 'Content Creation',
    provider: 'anthropic',
    model: 'claude-sonnet-4-5-20250514',
    temperature: 0.3,
    maxTokens: 2000,
    responseFormat: 'json',
    tools: ['web_search', 'data_analysis', 'file_reader'],
    memoryEnabled: true
  },
  {
    id: 'content-strategist',
    name: 'Content Strategist',
    role: 'Strategy & Planning',
    prompt: 'Tu es un expert en stratégie de contenu qui crée des plans éditoriaux détaillés.',
    systemPrompt: 'Tu es un stratège de contenu expérimenté. Analyse les tendances du marché et propose des stratégies de contenu cohérentes.',
    status: 'active',
    description: 'Développe des stratégies de contenu basées sur les données et les tendances',
    category: 'Content Creation',
    provider: 'openai',
    model: 'gpt-4-turbo',
    temperature: 0.7,
    maxTokens: 2000,
    topP: 0.9,
    tools: ['web_search', 'data_analysis'],
    memoryEnabled: true,
    contextWindow: 8000,
    responseFormat: 'markdown'
  },
  {
    id: 'seo-optimizer',
    name: 'SEO Optimizer',
    role: 'SEO Expert',
    prompt: 'Tu es un expert SEO qui optimise le contenu pour les moteurs de recherche.',
    systemPrompt: 'Analyse le contenu et propose des améliorations SEO spécifiques et actionnables.',
    status: 'active',
    description: 'Optimise le contenu pour le référencement naturel',
    category: 'SEO',
    provider: 'openai',
    model: 'gpt-3.5-turbo',
    temperature: 0.3,
    maxTokens: 1500,
    tools: ['web_search', 'data_analysis'],
    responseFormat: 'json'
  },
  {
    id: 'linkedin-agent',
    name: 'LinkedIn Agent',
    role: 'Social Media',
    prompt: 'Tu es un expert en création de contenu LinkedIn engageant.',
    systemPrompt: 'Crée des posts LinkedIn optimisés pour l\'engagement et la visibilité.',
    status: 'active',
    description: 'Création automatisée de posts LinkedIn et gestion des commentaires',
    category: 'Marketing',
    provider: 'openai',
    model: 'gpt-4o',
    temperature: 0.7,
    maxTokens: 1000,
    tools: ['web_search'],
    responseFormat: 'text'
  }
];

const STORAGE_KEY = 'admin:agents';
const CUSTOM_MODELS_KEY = 'admin:custom_models';

// Event for cross-component synchronization
const AGENTS_UPDATED_EVENT = 'agents-updated';

/**
 * Centralized hook for managing agents across all interfaces
 * Provides bidirectional sync between Admin Agents, Workflow, GEO Agent, LinkedIn Agent
 */
export function useAgents() {
  const [agents, setAgentsState] = useState<Agent[]>(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Agent[];
        // Ensure workflow agents exist
        return ensureWorkflowAgents(parsed);
      }
      return DEFAULT_AGENTS;
    } catch {
      return DEFAULT_AGENTS;
    }
  });

  const [customModels, setCustomModelsState] = useState<AIModel[]>(() => {
    try {
      const raw = localStorage.getItem(CUSTOM_MODELS_KEY);
      return raw ? JSON.parse(raw) as AIModel[] : [];
    } catch {
      return [];
    }
  });

  const [isLoading, setIsLoading] = useState(false);

  // Ensure the 3 workflow agents always exist
  function ensureWorkflowAgents(agentsList: Agent[]): Agent[] {
    const workflowIds = ['search-content', 'ghostwriter', 'review-content'];
    let result = [...agentsList];

    workflowIds.forEach(id => {
      if (!result.some(a => a.id === id)) {
        const defaultAgent = DEFAULT_AGENTS.find(a => a.id === id);
        if (defaultAgent) {
          result = [defaultAgent, ...result];
        }
      }
    });

    return result;
  }

  // Save to localStorage and dispatch event for other components
  const saveAgents = useCallback((newAgents: Agent[]) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(newAgents));
      window.dispatchEvent(new CustomEvent(AGENTS_UPDATED_EVENT, { detail: newAgents }));
    } catch (error) {
      console.error('Failed to save agents:', error);
    }
  }, []);

  // Set agents with persistence
  const setAgents = useCallback((updater: Agent[] | ((prev: Agent[]) => Agent[])) => {
    setAgentsState(prev => {
      const newAgents = typeof updater === 'function' ? updater(prev) : updater;
      saveAgents(newAgents);
      return newAgents;
    });
  }, [saveAgents]);

  // Set custom models with persistence
  const setCustomModels = useCallback((updater: AIModel[] | ((prev: AIModel[]) => AIModel[])) => {
    setCustomModelsState(prev => {
      const newModels = typeof updater === 'function' ? updater(prev) : updater;
      try {
        localStorage.setItem(CUSTOM_MODELS_KEY, JSON.stringify(newModels));
      } catch {}
      return newModels;
    });
  }, []);

  // Listen for updates from other components
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          const newAgents = JSON.parse(e.newValue) as Agent[];
          setAgentsState(ensureWorkflowAgents(newAgents));
        } catch {}
      }
    };

    const handleCustomEvent = (e: CustomEvent<Agent[]>) => {
      setAgentsState(ensureWorkflowAgents(e.detail));
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener(AGENTS_UPDATED_EVENT, handleCustomEvent as EventListener);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener(AGENTS_UPDATED_EVENT, handleCustomEvent as EventListener);
    };
  }, []);

  // Get a specific agent by ID
  const getAgent = useCallback((id: string): Agent | undefined => {
    return agents.find(a => a.id === id);
  }, [agents]);

  // Update a specific agent
  const updateAgent = useCallback((id: string, updates: Partial<Agent>) => {
    setAgents(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
  }, [setAgents]);

  // Add a new agent
  const addAgent = useCallback((agent: Agent) => {
    setAgents(prev => {
      const exists = prev.some(a => a.id === agent.id);
      if (exists) {
        return prev.map(a => a.id === agent.id ? agent : a);
      }
      return [agent, ...prev];
    });
  }, [setAgents]);

  // Remove an agent
  const removeAgent = useCallback((id: string) => {
    // Don't allow removing workflow agents
    const workflowIds = ['search-content', 'ghostwriter', 'review-content'];
    if (workflowIds.includes(id)) {
      console.warn(`Cannot remove workflow agent: ${id}`);
      return;
    }
    setAgents(prev => prev.filter(a => a.id !== id));
  }, [setAgents]);

  // Toggle agent status
  const toggleAgentStatus = useCallback((id: string) => {
    setAgents(prev => prev.map(a =>
      a.id === id ? { ...a, status: a.status === 'active' ? 'inactive' : 'active' } : a
    ));
  }, [setAgents]);

  // Get all models (built-in + custom)
  const getAllModels = useCallback((): AIModel[] => {
    return [...AI_MODELS, ...customModels];
  }, [customModels]);

  // Get model info by ID
  const getModelInfo = useCallback((modelId: string): AIModel => {
    return getAllModels().find(m => m.id === modelId) || AI_MODELS[0];
  }, [getAllModels]);

  // Get models by provider
  const getModelsByProvider = useCallback((provider: AIProvider): AIModel[] => {
    return getAllModels().filter(m => m.provider === provider);
  }, [getAllModels]);

  // Sync prompts with workflow storage (backend)
  const syncWithWorkflowStorage = useCallback(async () => {
    setIsLoading(true);
    try {
      // Load from backend
      const response = await fetch('/api/storage?agent=workflow&type=prompts');
      if (response.ok) {
        const mapping = await response.json();
        const workflowIds = ['search-content', 'ghostwriter', 'review-content'];
        setAgents(prev => prev.map(a =>
          workflowIds.includes(a.id) && mapping?.[a.id]?.prompt
            ? { ...a, prompt: mapping[a.id].prompt }
            : a
        ));
      }
    } catch (error) {
      console.error('Failed to sync with workflow storage:', error);
    } finally {
      setIsLoading(false);
    }
  }, [setAgents]);

  // Save workflow prompts to backend
  const saveWorkflowPrompts = useCallback(async () => {
    setIsLoading(true);
    try {
      const workflowIds = ['search-content', 'ghostwriter', 'review-content'];
      const mapping: Record<string, { prompt: string }> = {};
      agents
        .filter(a => workflowIds.includes(a.id))
        .forEach(a => {
          mapping[a.id] = { prompt: a.prompt || '' };
        });

      await fetch('/api/storage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'save_workflow_prompts', data: mapping })
      });
    } catch (error) {
      console.error('Failed to save workflow prompts:', error);
    } finally {
      setIsLoading(false);
    }
  }, [agents]);

  // Reset to defaults
  const resetToDefaults = useCallback(() => {
    setAgents(DEFAULT_AGENTS);
  }, [setAgents]);

  return {
    // State
    agents,
    customModels,
    isLoading,

    // Setters
    setAgents,
    setCustomModels,

    // Agent operations
    getAgent,
    updateAgent,
    addAgent,
    removeAgent,
    toggleAgentStatus,

    // Model operations
    getAllModels,
    getModelInfo,
    getModelsByProvider,

    // Sync operations
    syncWithWorkflowStorage,
    saveWorkflowPrompts,
    resetToDefaults,

    // Constants
    AI_MODELS,
    DEFAULT_AGENTS
  };
}

export default useAgents;
