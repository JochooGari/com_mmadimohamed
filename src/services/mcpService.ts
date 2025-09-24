interface MCPTool {
  name: string;
  description: string;
  inputSchema: any;
}

interface MCPResource {
  uri: string;
  name: string;
  description: string;
  mimeType: string;
}

interface MCPPrompt {
  name: string;
  description: string;
  arguments: Array<{
    name: string;
    description: string;
    required: boolean;
  }>;
}

interface MCPServerInfo {
  name: string;
  version: string;
  description: string;
  tools: MCPTool[];
  resources: MCPResource[];
  prompts: MCPPrompt[];
}

interface MCPExecutionResult {
  content: Array<{
    type: string;
    text: string;
  }>;
}

class MCPService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NODE_ENV === 'production'
      ? '/api/mcp'
      : 'http://localhost:3000/api/mcp';
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`MCP API error: ${response.statusText}`);
    }

    return response.json();
  }

  // Get server information and capabilities
  async getServerInfo(): Promise<MCPServerInfo> {
    return this.request('/initialize');
  }

  // Execute a tool
  async executeTool(toolName: string, args: any): Promise<MCPExecutionResult> {
    return this.request('/tools/call', {
      method: 'POST',
      body: JSON.stringify({
        method: 'tools/call',
        params: {
          name: toolName,
          arguments: args
        }
      })
    });
  }

  // Content workflow tools
  async executeContentWorkflow(params: {
    siteUrl: string;
    targetAudience?: string;
    contentStyle?: 'professional' | 'casual' | 'technical' | 'educational';
    minScore?: number;
  }): Promise<MCPExecutionResult> {
    return this.executeTool('execute_content_workflow', params);
  }

  async searchContentTopics(params: {
    siteUrl: string;
    topicCount?: number;
  }): Promise<MCPExecutionResult> {
    return this.executeTool('search_content_topics', params);
  }

  async generateArticle(params: {
    topic: {
      title: string;
      keywords: string[];
      angle?: string;
      audience: string;
    };
    wordCount?: number;
    includeImages?: boolean;
  }): Promise<MCPExecutionResult> {
    return this.executeTool('generate_article', params);
  }

  async reviewArticle(params: {
    article: {
      title: string;
      content: string;
      metaDescription?: string;
    };
    criteria?: {
      writing?: number;
      relevance?: number;
      seo?: number;
      structure?: number;
      engagement?: number;
      briefCompliance?: number;
    };
  }): Promise<MCPExecutionResult> {
    return this.executeTool('review_article', params);
  }

  async getWorkflowStatus(params?: {
    limit?: number;
    status?: 'all' | 'completed' | 'failed' | 'running';
  }): Promise<MCPExecutionResult> {
    return this.executeTool('get_workflow_status', params || {});
  }

  // Get resources
  async getResource(uri: string): Promise<any> {
    return this.request('/resources/read', {
      method: 'POST',
      body: JSON.stringify({
        method: 'resources/read',
        params: { uri }
      })
    });
  }

  // Execute prompts
  async executePrompt(promptName: string, args: Record<string, string>): Promise<any> {
    return this.request('/prompts/get', {
      method: 'POST',
      body: JSON.stringify({
        method: 'prompts/get',
        params: {
          name: promptName,
          arguments: args
        }
      })
    });
  }

  // Helper methods for common workflows
  async createContentStrategy(website: string, industry?: string): Promise<MCPExecutionResult> {
    return this.executePrompt('create_content_strategy', { website, industry: industry || '' });
  }

  async optimizeArticleSEO(article: string, keywords: string): Promise<MCPExecutionResult> {
    return this.executePrompt('optimize_article_seo', { article, keywords });
  }

  // Test connection
  async testConnection(): Promise<boolean> {
    try {
      await this.getServerInfo();
      return true;
    } catch {
      return false;
    }
  }

  // Get available tools list
  async getAvailableTools(): Promise<MCPTool[]> {
    const serverInfo = await this.getServerInfo();
    return serverInfo.tools;
  }

  // Get available resources list
  async getAvailableResources(): Promise<MCPResource[]> {
    const serverInfo = await this.getServerInfo();
    return serverInfo.resources;
  }

  // Get available prompts list
  async getAvailablePrompts(): Promise<MCPPrompt[]> {
    const serverInfo = await this.getServerInfo();
    return serverInfo.prompts;
  }
}

export const mcpService = new MCPService();
export type { MCPTool, MCPResource, MCPPrompt, MCPServerInfo, MCPExecutionResult };