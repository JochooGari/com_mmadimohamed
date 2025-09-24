import { z } from 'zod';
import { createMcpHandler } from '@vercel/mcp-adapter';

const handler = createMcpHandler(
  (server) => {
    // Tool: Execute complete content workflow
    server.tool(
      'execute_content_workflow',
      'Execute the complete content agents workflow (Search + Ghostwriting + Review)',
      {
        siteUrl: z.string().url().describe('URL of the website to analyze for content topics').default('https://magicpath.ai')
      },
      async ({ siteUrl }) => {
        try {
          // Call our existing n8n execute API
          const response = await fetch(`${process.env.VERCEL_URL || 'https://mmadimohamed.fr'}/api/n8n/execute`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              workflowId: 'content-agents-workflow',
              data: { siteUrl }
            })
          });

          if (!response.ok) {
            throw new Error(`Workflow execution failed: ${response.statusText}`);
          }

          const result = await response.json();

          return {
            content: [
              {
                type: 'text',
                text: `✅ Content workflow executed for ${siteUrl}\n\nResults:\n${JSON.stringify(result, null, 2)}`
              }
            ]
          };
        } catch (error: any) {
          return {
            content: [
              {
                type: 'text',
                text: `❌ Error executing workflow: ${error.message}`
              }
            ]
          };
        }
      }
    );

    // Tool: Search content topics
    server.tool(
      'search_content_topics',
      'Use Agent Search Content to analyze a website and suggest article topics',
      {
        siteUrl: z.string().url().describe('URL of the website to analyze'),
        topicCount: z.number().int().min(1).max(10).default(5).describe('Number of topics to suggest (1-10)')
      },
      async ({ siteUrl, topicCount }) => {
        return {
          content: [
            {
              type: 'text',
              text: `🔍 Searching for ${topicCount} content topics on ${siteUrl}\n\nThis would typically:\n1. Analyze the website content\n2. Identify content gaps\n3. Suggest relevant article topics\n4. Provide SEO keywords for each topic`
            }
          ]
        };
      }
    );

    // Resource: Content Agents Workflow
    server.resource(
      'workflow://content-agents',
      'Complete workflow configuration for content generation agents',
      'application/json',
      async () => {
        const workflowConfig = {
          name: 'Content Agents Workflow',
          version: '1.0.0',
          agents: [
            {
              name: 'Search Agent',
              role: 'content-research',
              description: 'Analyzes websites and identifies content opportunities'
            },
            {
              name: 'Ghostwriter Agent',
              role: 'content-creation',
              description: 'Creates high-quality articles based on research'
            },
            {
              name: 'Review Agent',
              role: 'content-review',
              description: 'Reviews and optimizes content for quality and SEO'
            }
          ],
          workflow: {
            steps: [
              'Site Analysis',
              'Topic Research',
              'Content Generation',
              'Quality Review',
              'SEO Optimization'
            ]
          }
        };

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(workflowConfig, null, 2)
            }
          ]
        };
      }
    );

    // Prompt: Create content strategy
    server.prompt(
      'create_content_strategy',
      'Generate a complete content strategy for a website',
      [
        {
          name: 'website',
          description: 'Website URL to analyze',
          required: true
        }
      ],
      async ({ website }) => {
        return {
          messages: [
            {
              role: 'user',
              content: {
                type: 'text',
                text: `Create a comprehensive content strategy for the website: ${website}

Please analyze the website and provide:
1. Target audience analysis
2. Content gaps identification
3. Recommended content types
4. SEO keyword opportunities
5. Content calendar suggestions
6. Success metrics to track

Focus on actionable insights that can drive organic traffic and engagement.`
              }
            }
          ]
        };
      }
    );
  },
  {
    name: 'magicpath-n8n-server',
    version: '1.0.0',
    description: 'MCP Server for MagicPath n8n Content Agents Workflows'
  },
  {
    basePath: '/api',
    transport: 'http' // Use the new streamable HTTP transport
  }
);

// Export as default for Pages Router
export default handler;