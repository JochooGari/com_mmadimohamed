interface N8nWorkflow {
  id: string;
  name: string;
  nodes: N8nNode[];
  connections: Record&lt;string, any&gt;;
  active: boolean;
  settings: Record&lt;string, any&gt;;
}

interface N8nNode {
  id: string;
  name: string;
  type: string;
  position: [number, number];
  parameters: Record&lt;string, any&gt;;
}

interface WorkflowExecution {
  id: string;
  workflowId: string;
  status: 'new' | 'running' | 'success' | 'error' | 'waiting' | 'canceled';
  startedAt: string;
  finishedAt?: string;
  data?: any;
  error?: string;
}

class N8nService {
  private baseUrl: string;
  private apiKey: string | null = null;

  constructor() {
    // Use Vercel API endpoints instead of n8n server
    this.baseUrl = process.env.NODE_ENV === 'production'
      ? '/api/n8n'  // Vercel production
      : window.location.origin + '/api/n8n';  // Local dev with Vercel API
  }

  setApiKey(apiKey: string) {
    this.apiKey = apiKey;
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...(this.apiKey && { 'X-N8N-API-KEY': this.apiKey }),
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(`N8n API error: ${response.statusText}`);
    }

    return response.json();
  }

  // Workflow Management
  async getWorkflows(): Promise&lt;N8nWorkflow[]&gt; {
    return this.request('/workflows');
  }

  async getWorkflow(id: string): Promise&lt;N8nWorkflow&gt; {
    return this.request(`/api/v1/workflows/${id}`);
  }

  async createWorkflow(workflow: Partial&lt;N8nWorkflow&gt;): Promise&lt;N8nWorkflow&gt; {
    return this.request('/api/v1/workflows', {
      method: 'POST',
      body: JSON.stringify(workflow),
    });
  }

  async updateWorkflow(id: string, workflow: Partial&lt;N8nWorkflow&gt;): Promise&lt;N8nWorkflow&gt; {
    return this.request(`/api/v1/workflows/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(workflow),
    });
  }

  async deleteWorkflow(id: string): Promise&lt;void&gt; {
    return this.request(`/api/v1/workflows/${id}`, {
      method: 'DELETE',
    });
  }

  // Workflow Execution
  async executeWorkflow(id: string, data?: any): Promise&lt;WorkflowExecution&gt; {
    return this.request('/execute', {
      method: 'POST',
      body: JSON.stringify({
        workflowId: id,
        data: data || {}
      }),
    });
  }

  async getExecutions(workflowId?: string): Promise&lt;WorkflowExecution[]&gt; {
    const endpoint = workflowId
      ? `/api/v1/executions?workflowId=${workflowId}`
      : '/api/v1/executions';
    return this.request(endpoint);
  }

  async getExecution(id: string): Promise&lt;WorkflowExecution&gt; {
    return this.request(`/api/v1/executions/${id}`);
  }

  // Agent Content Workflows
  async createContentAgentsWorkflow(): Promise&lt;N8nWorkflow&gt; {
    const workflow = {
      name: 'Content Agents Workflow',
      nodes: [
        // Trigger node
        {
          id: 'trigger',
          name: 'Manual Trigger',
          type: 'n8n-nodes-base.manualTrigger',
          position: [100, 100],
          parameters: {}
        },
        // Agent Search Content
        {
          id: 'search-content',
          name: 'Agent Search Content',
          type: 'n8n-nodes-base.httpRequest',
          position: [300, 100],
          parameters: {
            url: 'https://api.perplexity.ai/chat/completions',
            method: 'POST',
            headers: {
              'Authorization': 'Bearer {{ $env["PERPLEXITY_API_KEY"] }}',
              'Content-Type': 'application/json'
            },
            body: {
              model: 'llama-3.1-sonar-large-128k-online',
              messages: [
                {
                  role: 'system',
                  content: `Tu es un agent spécialisé dans l'analyse de contenu web et la proposition de sujets d'articles.

Tâches :
1. Scanner le site web fourni
2. Analyser le contenu existant
3. Identifier les lacunes et opportunités
4. Proposer 3-5 sujets d'articles pertinents
5. Fournir un brief pour chaque sujet avec :
   - Titre suggéré
   - Mots-clés cibles
   - Angle d'approche
   - Public cible
   - Sources potentielles

Critères de sélection :
- Pertinence avec le contenu existant
- Potentiel SEO
- Intérêt pour l'audience
- Faisabilité de rédaction`
                },
                {
                  role: 'user',
                  content: 'Analyse le site {{ $json["siteUrl"] || "https://magicpath.ai" }} et propose des sujets d\\'articles.'
                }
              ],
              temperature: 0.7,
              max_tokens: 2000
            }
          }
        },
        // Agent Ghostwriting
        {
          id: 'ghostwriter',
          name: 'Agent Ghostwriting',
          type: 'n8n-nodes-base.httpRequest',
          position: [500, 100],
          parameters: {
            url: 'https://api.openai.com/v1/chat/completions',
            method: 'POST',
            headers: {
              'Authorization': 'Bearer {{ $env["OPENAI_API_KEY"] }}',
              'Content-Type': 'application/json'
            },
            body: {
              model: 'gpt-4',
              messages: [
                {
                  role: 'system',
                  content: `Tu es un rédacteur expert spécialisé dans la création de contenu web de qualité.

Tâches :
1. Analyser le brief du sujet fourni
2. Rechercher et vérifier les informations
3. Structurer l'article de manière logique
4. Rédiger un contenu engageant et informatif
5. Optimiser pour le SEO
6. Inclure des éléments visuels suggérés

Structure requise :
- Titre accrocheur (H1)
- Introduction engageante
- Corps de l'article avec sous-titres (H2, H3)
- Conclusion avec call-to-action
- Meta description
- Suggestions d'images

Critères de qualité :
- Ton adapté au public cible
- Longueur optimale (800-2000 mots)
- Densité de mots-clés naturelle
- Lisibilité élevée
- Sources citées si nécessaire`
                },
                {
                  role: 'user',
                  content: 'Rédige un article basé sur ce brief : {{ $json["searchContent"] }}'
                }
              ],
              temperature: 0.8,
              max_tokens: 4000
            }
          }
        },
        // Agent Review Content
        {
          id: 'review-content',
          name: 'Agent Review Content',
          type: 'n8n-nodes-base.httpRequest',
          position: [700, 100],
          parameters: {
            url: 'https://api.anthropic.com/v1/messages',
            method: 'POST',
            headers: {
              'x-api-key': '{{ $env["ANTHROPIC_API_KEY"] }}',
              'anthropic-version': '2023-06-01',
              'Content-Type': 'application/json'
            },
            body: {
              model: 'claude-3-sonnet-20240229',
              max_tokens: 2000,
              messages: [
                {
                  role: 'user',
                  content: `Tu es un expert en révision de contenu et optimisation éditoriale.

Tâches :
1. Analyser l'article fourni en détail
2. Évaluer selon les critères définis
3. Attribuer un score global (/100)
4. Fournir des recommandations spécifiques
5. Suggérer des améliorations concrètes

Critères d'évaluation :
- Qualité rédactionnelle (25 pts)
- Pertinence du contenu (20 pts)
- Optimisation SEO (20 pts)
- Structure et lisibilité (15 pts)
- Engagement potentiel (10 pts)
- Respect du brief (10 pts)

Format de sortie :
- Score global et détaillé
- Points forts identifiés
- Points d'amélioration
- Recommandations prioritaires
- Actions correctives suggérées
- Score cible à atteindre

Article à analyser : {{ $json["article"] }}`
                }
              ]
            }
          }
        },
        // Store Results
        {
          id: 'store-results',
          name: 'Store Results',
          type: 'n8n-nodes-base.webhook',
          position: [900, 100],
          parameters: {
            path: 'content-workflow-results',
            httpMethod: 'POST'
          }
        }
      ],
      connections: {
        'Manual Trigger': {
          main: [
            [
              {
                node: 'Agent Search Content',
                type: 'main',
                index: 0
              }
            ]
          ]
        },
        'Agent Search Content': {
          main: [
            [
              {
                node: 'Agent Ghostwriting',
                type: 'main',
                index: 0
              }
            ]
          ]
        },
        'Agent Ghostwriting': {
          main: [
            [
              {
                node: 'Agent Review Content',
                type: 'main',
                index: 0
              }
            ]
          ]
        },
        'Agent Review Content': {
          main: [
            [
              {
                node: 'Store Results',
                type: 'main',
                index: 0
              }
            ]
          ]
        }
      },
      active: true,
      settings: {
        saveDataSuccessExecution: 'all',
        saveDataErrorExecution: 'all',
        saveManualExecutions: true
      }
    };

    return this.createWorkflow(workflow);
  }

  // Utility methods
  async testConnection(): Promise&lt;boolean&gt; {
    try {
      await this.request('/healthz');
      return true;
    } catch {
      return false;
    }
  }

  async getNodeTypes(): Promise&lt;any[]&gt; {
    return this.request('/api/v1/node-types');
  }
}

export const n8nService = new N8nService();
export type { N8nWorkflow, N8nNode, WorkflowExecution };