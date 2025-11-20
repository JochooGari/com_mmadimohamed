#!/usr/bin/env node

/**
 * MCP Server for MagicPath n8n Workflows
 * Connects to the HTTP API at https://mmadimohamed.fr/api/mcp
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ListPromptsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

const API_BASE_URL = process.env.MCP_N8N_API_URL || 'https://mmadimohamed.fr/api';

// Create MCP server instance
const server = new Server(
  {
    name: 'magicpath-n8n-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
      resources: {},
      prompts: {},
    },
  }
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
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
            },
            targetAudience: {
              type: 'string',
              description: 'Target audience for the content (optional)',
            },
            contentStyle: {
              type: 'string',
              enum: ['professional', 'casual', 'technical', 'educational'],
              description: 'Style of the content (optional)',
            },
            minScore: {
              type: 'number',
              description: 'Minimum quality score (0-100, optional)',
              minimum: 0,
              maximum: 100,
            },
          },
          required: ['siteUrl'],
        },
      },
      {
        name: 'search_content_topics',
        description: 'Use Agent Search Content (Perplexity) to analyze a website and suggest article topics',
        inputSchema: {
          type: 'object',
          properties: {
            siteUrl: {
              type: 'string',
              description: 'URL of the website to analyze',
            },
            topicCount: {
              type: 'number',
              description: 'Number of topics to suggest (1-10)',
              minimum: 1,
              maximum: 10,
              default: 5,
            },
          },
          required: ['siteUrl'],
        },
      },
      {
        name: 'generate_article',
        description: 'Generate an article using Agent Ghostwriter (GPT-4o/GPT-5)',
        inputSchema: {
          type: 'object',
          properties: {
            topic: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                keywords: { type: 'array', items: { type: 'string' } },
                angle: { type: 'string' },
                audience: { type: 'string' },
              },
              required: ['title', 'keywords', 'audience'],
            },
            wordCount: {
              type: 'number',
              description: 'Target word count (optional)',
              default: 800,
            },
            includeImages: {
              type: 'boolean',
              description: 'Include image suggestions (optional)',
              default: true,
            },
          },
          required: ['topic'],
        },
      },
      {
        name: 'review_article',
        description: 'Review an article using Agent Reviewer (Claude Sonnet)',
        inputSchema: {
          type: 'object',
          properties: {
            article: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                content: { type: 'string' },
                metaDescription: { type: 'string' },
              },
              required: ['title', 'content'],
            },
            criteria: {
              type: 'object',
              description: 'Review criteria weights (optional)',
              properties: {
                writing: { type: 'number', minimum: 0, maximum: 100 },
                relevance: { type: 'number', minimum: 0, maximum: 100 },
                seo: { type: 'number', minimum: 0, maximum: 100 },
                structure: { type: 'number', minimum: 0, maximum: 100 },
                engagement: { type: 'number', minimum: 0, maximum: 100 },
                briefCompliance: { type: 'number', minimum: 0, maximum: 100 },
              },
            },
          },
          required: ['article'],
        },
      },
      {
        name: 'get_workflow_status',
        description: 'Get the status of recent workflow executions',
        inputSchema: {
          type: 'object',
          properties: {
            limit: {
              type: 'number',
              description: 'Number of executions to return (optional)',
              default: 10,
            },
            status: {
              type: 'string',
              enum: ['all', 'completed', 'failed', 'running'],
              description: 'Filter by status (optional)',
              default: 'all',
            },
          },
        },
      },
    ],
  };
});

// Execute tools by calling the n8n API
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    // Call the n8n execute API
    const response = await fetch(`${API_BASE_URL}/n8n/execute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        toolName: name,
        arguments: args,
      }),
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    const result = await response.json();

    return {
      content: [
        {
          type: 'text',
          text: typeof result === 'string' ? result : JSON.stringify(result, null, 2),
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error executing tool ${name}: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
});

// List available resources
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  return {
    resources: [
      {
        uri: 'workflow://content-agents',
        name: 'Content Agents Workflow',
        description: 'Complete workflow configuration for content generation (3 agents)',
        mimeType: 'application/json',
      },
      {
        uri: 'workflow://status',
        name: 'Workflow Execution Status',
        description: 'Recent workflow execution history and status',
        mimeType: 'application/json',
      },
    ],
  };
});

// List available prompts
server.setRequestHandler(ListPromptsRequestSchema, async () => {
  return {
    prompts: [
      {
        name: 'create_content_strategy',
        description: 'Generate a comprehensive content strategy for a website',
        arguments: [
          {
            name: 'website',
            description: 'Website URL to analyze',
            required: true,
          },
          {
            name: 'industry',
            description: 'Industry or niche (optional)',
            required: false,
          },
        ],
      },
      {
        name: 'optimize_article_seo',
        description: 'Optimize an article for SEO with specific keywords',
        arguments: [
          {
            name: 'article',
            description: 'Article content to optimize',
            required: true,
          },
          {
            name: 'keywords',
            description: 'Target keywords (comma-separated)',
            required: true,
          },
        ],
      },
    ],
  };
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('MagicPath n8n MCP Server running on stdio');
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});
