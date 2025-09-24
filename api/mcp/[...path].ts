import { NextApiRequest, NextApiResponse } from 'next';

// Simple MCP API handler for debugging
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { path } = req.query;
    const fullPath = Array.isArray(path) ? path.join('/') : path || '';

    console.log('MCP Request:', req.method, fullPath, req.body);

    // Handle different MCP endpoints
    switch (fullPath) {
      case 'initialize':
        return handleInitialize(req, res);

      case 'tools/list':
        return handleToolsList(req, res);

      case 'tools/call':
        return handleToolsCall(req, res);

      case 'resources/list':
        return handleResourcesList(req, res);

      case 'prompts/list':
        return handlePromptsList(req, res);

      default:
        return res.status(404).json({
          error: 'MCP endpoint not found',
          path: fullPath,
          available: ['initialize', 'tools/list', 'tools/call', 'resources/list', 'prompts/list']
        });
    }
  } catch (error: any) {
    console.error('MCP API Error:', error);
    return res.status(500).json({
      error: 'MCP server error',
      message: error.message || 'Unknown error'
    });
  }
}

async function handleInitialize(req: NextApiRequest, res: NextApiResponse) {
  return res.status(200).json({
    protocolVersion: "2024-11-05",
    capabilities: {
      tools: {},
      resources: {},
      prompts: {}
    },
    serverInfo: {
      name: "magicpath-n8n-server",
      version: "1.0.0",
      description: "MCP Server for MagicPath n8n Content Agents Workflows"
    }
  });
}

async function handleToolsList(req: NextApiRequest, res: NextApiResponse) {
  return res.status(200).json({
    tools: [
      {
        name: "execute_content_workflow",
        description: "Execute the complete content agents workflow (Search + Ghostwriting + Review)",
        inputSchema: {
          type: "object",
          properties: {
            siteUrl: {
              type: "string",
              description: "URL of the website to analyze for content topics",
              default: "https://magicpath.ai"
            }
          },
          required: ["siteUrl"]
        }
      },
      {
        name: "search_content_topics",
        description: "Use Agent Search Content to analyze a website and suggest article topics",
        inputSchema: {
          type: "object",
          properties: {
            siteUrl: {
              type: "string",
              description: "URL of the website to analyze"
            },
            topicCount: {
              type: "number",
              description: "Number of topics to suggest (3-5)",
              minimum: 1,
              maximum: 10,
              default: 5
            }
          },
          required: ["siteUrl"]
        }
      }
    ]
  });
}

async function handleToolsCall(req: NextApiRequest, res: NextApiResponse) {
  const { name, arguments: args } = req.body.params || {};

  if (!name) {
    return res.status(400).json({
      error: "Tool name is required"
    });
  }

  try {
    let result;

    switch (name) {
      case 'execute_content_workflow':
        result = await executeContentWorkflow(args);
        break;

      case 'search_content_topics':
        result = await searchContentTopics(args);
        break;

      default:
        return res.status(404).json({
          error: `Tool '${name}' not found`
        });
    }

    return res.status(200).json({
      content: [
        {
          type: "text",
          text: result
        }
      ]
    });
  } catch (error: any) {
    return res.status(500).json({
      error: `Tool execution failed: ${error.message}`
    });
  }
}

async function handleResourcesList(req: NextApiRequest, res: NextApiResponse) {
  return res.status(200).json({
    resources: [
      {
        uri: "workflow://content-agents",
        name: "Content Agents Workflow",
        description: "Complete workflow configuration for content generation agents",
        mimeType: "application/json"
      }
    ]
  });
}

async function handlePromptsList(req: NextApiRequest, res: NextApiResponse) {
  return res.status(200).json({
    prompts: [
      {
        name: "create_content_strategy",
        description: "Generate a complete content strategy for a website",
        arguments: [
          {
            name: "website",
            description: "Website URL to analyze",
            required: true
          }
        ]
      }
    ]
  });
}

// Tool implementations
async function executeContentWorkflow(args: any) {
  const { siteUrl = "https://magicpath.ai" } = args;

  // Call our existing n8n execute API
  const response = await fetch(`${process.env.VERCEL_URL || 'http://localhost:3000'}/api/n8n/execute`, {
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

  return `✅ Content workflow executed for ${siteUrl}\n\nResults:\n${JSON.stringify(result, null, 2)}`;
}

async function searchContentTopics(args: any) {
  const { siteUrl, topicCount = 5 } = args;

  return `🔍 Searching for ${topicCount} content topics on ${siteUrl}\n\nThis would typically:\n1. Analyze the website content\n2. Identify content gaps\n3. Suggest relevant article topics\n4. Provide SEO keywords for each topic`;
}