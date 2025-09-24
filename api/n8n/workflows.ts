import { NextApiRequest, NextApiResponse } from 'next';

// Simulate n8n workflow management via Vercel API
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    switch (method) {
      case 'GET':
        return handleGetWorkflows(req, res);
      case 'POST':
        return handleCreateWorkflow(req, res);
      case 'PUT':
        return handleUpdateWorkflow(req, res);
      case 'DELETE':
        return handleDeleteWorkflow(req, res);
      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error: any) {
    console.error('N8n API Error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}

async function handleGetWorkflows(req: NextApiRequest, res: NextApiResponse) {
  // Return mock workflows for now
  const workflows = [
    {
      id: 'content-agents-workflow',
      name: 'Content Agents Workflow',
      active: true,
      nodes: [
        {
          id: 'search-content',
          name: 'Agent Search Content',
          type: 'ai-agent',
          model: 'perplexity'
        },
        {
          id: 'ghostwriter',
          name: 'Agent Ghostwriting',
          type: 'ai-agent',
          model: 'gpt-4'
        },
        {
          id: 'review-content',
          name: 'Agent Review Content',
          type: 'ai-agent',
          model: 'claude-3'
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  return res.status(200).json(workflows);
}

async function handleCreateWorkflow(req: NextApiRequest, res: NextApiResponse) {
  const { name, nodes } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Workflow name is required' });
  }

  // Mock workflow creation
  const workflow = {
    id: `workflow-${Date.now()}`,
    name,
    nodes: nodes || [],
    active: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  return res.status(201).json(workflow);
}

async function handleUpdateWorkflow(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  const updates = req.body;

  if (!id) {
    return res.status(400).json({ error: 'Workflow ID is required' });
  }

  // Mock workflow update
  const workflow = {
    id,
    ...updates,
    updatedAt: new Date().toISOString()
  };

  return res.status(200).json(workflow);
}

async function handleDeleteWorkflow(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'Workflow ID is required' });
  }

  return res.status(200).json({ success: true, message: 'Workflow deleted' });
}