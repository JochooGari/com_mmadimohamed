import { createMCPHandler } from '@vercel/mcp-adapter';

// Configuration du serveur MCP pour n8n workflows
const mcpHandler = createMCPHandler({
  name: 'magicpath-n8n-server',
  version: '1.0.0',
  description: 'MCP Server for MagicPath n8n Content Agents Workflows',

  // Outils disponibles
  tools: [
    {
      name: 'execute_content_workflow',
      description: 'Execute the complete content agents workflow (Search + Ghostwriting + Review)',
      inputSchema: {
        type: 'object',
        properties: {
          siteUrl: {
            type: 'string',
            description: 'URL of the website to analyze for content topics',
            default: 'https://magicpath.ai'
          },
          targetAudience: {
            type: 'string',
            description: 'Target audience for the content',
            default: 'Professionals and entrepreneurs'
          },
          contentStyle: {
            type: 'string',
            description: 'Writing style preference',
            enum: ['professional', 'casual', 'technical', 'educational'],
            default: 'professional'
          },
          minScore: {
            type: 'number',
            description: 'Minimum quality score required (0-100)',
            default: 80
          }
        },
        required: ['siteUrl']
      }
    },
    {
      name: 'search_content_topics',
      description: 'Use Agent Search Content to analyze a website and suggest article topics',
      inputSchema: {
        type: 'object',
        properties: {
          siteUrl: {
            type: 'string',
            description: 'URL of the website to analyze'
          },
          topicCount: {
            type: 'number',
            description: 'Number of topics to suggest (3-5)',
            minimum: 1,
            maximum: 10,
            default: 5
          }
        },
        required: ['siteUrl']
      }
    },
    {
      name: 'generate_article',
      description: 'Use Agent Ghostwriting to create an article from a topic brief',
      inputSchema: {
        type: 'object',
        properties: {
          topic: {
            type: 'object',
            description: 'Topic brief with title, keywords, angle, audience',
            properties: {
              title: { type: 'string' },
              keywords: { type: 'array', items: { type: 'string' } },
              angle: { type: 'string' },
              audience: { type: 'string' }
            },
            required: ['title', 'keywords', 'audience']
          },
          wordCount: {
            type: 'number',
            description: 'Target word count for the article',
            minimum: 300,
            maximum: 3000,
            default: 1500
          },
          includeImages: {
            type: 'boolean',
            description: 'Include image suggestions',
            default: true
          }
        },
        required: ['topic']
      }
    },
    {
      name: 'review_article',
      description: 'Use Agent Review Content to analyze and score an article',
      inputSchema: {
        type: 'object',
        properties: {
          article: {
            type: 'object',
            description: 'Article to review',
            properties: {
              title: { type: 'string' },
              content: { type: 'string' },
              metaDescription: { type: 'string' }
            },
            required: ['title', 'content']
          },
          criteria: {
            type: 'object',
            description: 'Review criteria weights',
            properties: {
              writing: { type: 'number', default: 25 },
              relevance: { type: 'number', default: 20 },
              seo: { type: 'number', default: 20 },
              structure: { type: 'number', default: 15 },
              engagement: { type: 'number', default: 10 },
              briefCompliance: { type: 'number', default: 10 }
            }
          }
        },
        required: ['article']
      }
    },
    {
      name: 'get_workflow_status',
      description: 'Get the status and history of workflow executions',
      inputSchema: {
        type: 'object',
        properties: {
          limit: {
            type: 'number',
            description: 'Maximum number of executions to return',
            default: 10
          },
          status: {
            type: 'string',
            description: 'Filter by execution status',
            enum: ['all', 'completed', 'failed', 'running'],
            default: 'all'
          }
        }
      }
    }
  ],

  // Ressources disponibles
  resources: [
    {
      uri: 'workflow://content-agents',
      name: 'Content Agents Workflow',
      description: 'Complete workflow configuration for content generation agents',
      mimeType: 'application/json'
    },
    {
      uri: 'prompts://search-agent',
      name: 'Search Agent Prompt',
      description: 'System prompt for the content search agent',
      mimeType: 'text/plain'
    },
    {
      uri: 'prompts://ghostwriter-agent',
      name: 'Ghostwriter Agent Prompt',
      description: 'System prompt for the article writing agent',
      mimeType: 'text/plain'
    },
    {
      uri: 'prompts://review-agent',
      name: 'Review Agent Prompt',
      description: 'System prompt for the content review agent',
      mimeType: 'text/plain'
    }
  ],

  // Prompts prédéfinis
  prompts: [
    {
      name: 'create_content_strategy',
      description: 'Generate a complete content strategy for a website',
      arguments: [
        {
          name: 'website',
          description: 'Website URL to analyze',
          required: true
        },
        {
          name: 'industry',
          description: 'Industry or niche of the business',
          required: false
        }
      ]
    },
    {
      name: 'optimize_article_seo',
      description: 'Optimize an article for SEO based on target keywords',
      arguments: [
        {
          name: 'article',
          description: 'Article content to optimize',
          required: true
        },
        {
          name: 'keywords',
          description: 'Target keywords for SEO optimization',
          required: true
        }
      ]
    }
  ]
});

// Implémentation des handlers
mcpHandler.setToolHandler('execute_content_workflow', async (args) => {
  try {
    // Appel à notre API de workflow existante
    const response = await fetch('/api/n8n/execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        workflowId: 'content-agents-workflow',
        data: args
      })
    });

    if (!response.ok) {
      throw new Error(`Workflow execution failed: ${response.statusText}`);
    }

    const result = await response.json();

    return {
      content: [{
        type: 'text',
        text: `✅ Workflow executed successfully!\n\n` +
              `📊 **Results Summary:**\n` +
              `• Topics found: ${result.output?.topics?.length || 0}\n` +
              `• Articles generated: ${result.output?.articles?.length || 0}\n` +
              `• Average score: ${result.output?.reviews?.reduce((acc: number, r: any) => acc + r.globalScore, 0) / (result.output?.reviews?.length || 1) || 0}/100\n\n` +
              `📝 **Detailed Results:**\n\`\`\`json\n${JSON.stringify(result.output, null, 2)}\n\`\`\``
      }]
    };
  } catch (error) {
    return {
      content: [{
        type: 'text',
        text: `❌ Workflow execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      }]
    };
  }
});

mcpHandler.setToolHandler('search_content_topics', async (args) => {
  try {
    const response = await fetch('/api/n8n/execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        workflowId: 'search-content-only',
        data: { siteUrl: args.siteUrl, topicCount: args.topicCount }
      })
    });

    const result = await response.json();

    return {
      content: [{
        type: 'text',
        text: `🔍 **Content Topics Analysis for ${args.siteUrl}**\n\n` +
              `Found ${result.topics?.length || 0} relevant topics:\n\n` +
              (result.topics?.map((topic: any, i: number) =>
                `**${i + 1}. ${topic.title}**\n` +
                `• Keywords: ${topic.keywords?.join(', ') || 'N/A'}\n` +
                `• Audience: ${topic.audience || 'N/A'}\n` +
                `• Angle: ${topic.angle || 'N/A'}\n`
              ).join('\n') || 'No topics found')
      }]
    };
  } catch (error) {
    return {
      content: [{
        type: 'text',
        text: `❌ Topic search failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      }]
    };
  }
});

mcpHandler.setResourceHandler(async (uri) => {
  switch (uri) {
    case 'workflow://content-agents':
      return {
        contents: [{
          uri,
          mimeType: 'application/json',
          text: JSON.stringify({
            name: 'Content Agents Workflow',
            agents: [
              { name: 'Search Content', model: 'perplexity', status: 'active' },
              { name: 'Ghostwriting', model: 'gpt-4', status: 'active' },
              { name: 'Review Content', model: 'claude-3', status: 'active' }
            ],
            configuration: {
              autoRun: false,
              minScore: 80,
              notifyOnComplete: true
            }
          }, null, 2)
        }]
      };

    case 'prompts://search-agent':
      return {
        contents: [{
          uri,
          mimeType: 'text/plain',
          text: `Tu es un agent spécialisé dans l'analyse de contenu web et la proposition de sujets d'articles.

Tâches :
1. Scanner le site web fourni
2. Analyser le contenu existant
3. Identifier les lacunes et opportunités
4. Proposer 3-5 sujets d'articles pertinents
5. Fournir un brief pour chaque sujet

Format de sortie JSON requis avec topics, keywords, angle, audience, sources.`
        }]
      };

    default:
      throw new Error(`Resource not found: ${uri}`);
  }
});

mcpHandler.setPromptHandler('create_content_strategy', async (args) => {
  return {
    messages: [
      {
        role: 'user',
        content: {
          type: 'text',
          text: `Créer une stratégie de contenu complète pour le site ${args.website}${args.industry ? ` dans le secteur ${args.industry}` : ''}.

Inclure :
1. Analyse concurrentielle
2. Sujets de contenu prioritaires
3. Calendrier éditorial
4. Métriques de succès
5. Recommandations SEO`
        }
      }
    ]
  };
});

export default mcpHandler;