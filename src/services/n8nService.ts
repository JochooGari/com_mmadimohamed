interface N8nWorkflow {
  id: string;
  name: string;
  nodes: N8nNode[];
  connections: Record<string, any>;
  active: boolean;
  settings: Record<string, any>;
}

interface N8nNode {
  id: string;
  name: string;
  type: string;
  position: [number, number];
  parameters: Record<string, any>;
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
  async getWorkflows(): Promise<N8nWorkflow[]> {
    return this.request('/workflows');
  }

  async getWorkflow(id: string): Promise<N8nWorkflow> {
    return this.request(`/workflows?id=${id}`);
  }

  async createWorkflow(workflow: Partial<N8nWorkflow>): Promise<N8nWorkflow> {
    return this.request('/workflows', {
      method: 'POST',
      body: JSON.stringify(workflow),
    });
  }

  async updateWorkflow(id: string, workflow: Partial<N8nWorkflow>): Promise<N8nWorkflow> {
    return this.request(`/workflows?id=${id}`, {
      method: 'PUT',
      body: JSON.stringify(workflow),
    });
  }

  async deleteWorkflow(id: string): Promise<void> {
    return this.request(`/workflows?id=${id}`, {
      method: 'DELETE',
    });
  }

  // Workflow Execution
  async executeWorkflow(id: string, data?: any): Promise<WorkflowExecution> {
    return this.request('/execute', {
      method: 'POST',
      body: JSON.stringify({
        workflowId: id,
        data: data || {}
      }),
    });
  }

  async getExecutions(workflowId?: string): Promise<WorkflowExecution[]> {
    // For now, return empty array - implement storage later
    return [];
  }

  async getExecution(id: string): Promise<WorkflowExecution> {
    // For now, return mock execution
    return {
      id,
      workflowId: 'content-agents-workflow',
      status: 'success',
      startedAt: new Date().toISOString(),
      finishedAt: new Date().toISOString(),
      data: { result: 'Mock execution' }
    };
  }

  // Agent Content Workflows
  async createContentAgentsWorkflow(): Promise<N8nWorkflow> {
    const workflow = {
      name: 'Content Agents Workflow',
      nodes: [
        // Trigger node
        {
          id: 'trigger',
          name: 'Manual Trigger',
          type: 'n8n-nodes-base.manualTrigger',
          position: [100, 100] as [number, number],
          parameters: {}
        },
        // Agent Search Content
        {
          id: 'search-content',
          name: 'Agent Search Content',
          type: 'n8n-nodes-base.httpRequest',
          position: [300, 100] as [number, number],
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
                  content: 'Analyse le site {{ $json["siteUrl"] || "https://magicpath.ai" }} et propose des sujets d\'articles.'
                }
              ],
              temperature: 0.7,
              max_tokens: 2000
            }
          }
        }
      ],
      connections: {},
      active: true,
      settings: {}
    };

    return this.createWorkflow(workflow);
  }

  // Utility methods
  async testConnection(): Promise<boolean> {
    try {
      await this.request('/workflows');
      return true;
    } catch {
      return false;
    }
  }

  async getNodeTypes(): Promise<any[]> {
    // Mock node types for now
    return [
      { name: 'Manual Trigger', type: 'n8n-nodes-base.manualTrigger' },
      { name: 'HTTP Request', type: 'n8n-nodes-base.httpRequest' },
      { name: 'Code', type: 'n8n-nodes-base.code' }
    ];
  }
}

export const n8nService = new N8nService();
export type { N8nWorkflow, N8nNode, WorkflowExecution };