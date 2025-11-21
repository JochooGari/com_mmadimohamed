// @ts-nocheck
// API endpoint for n8n workflow integration
// Simplified version focused on n8n compatibility

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Parse body - n8n sends JSON
    let body = req.body;

    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (e) {
        return res.status(400).json({ error: 'Invalid JSON body' });
      }
    }

    const { action, ...params } = body || {};

    console.log(`[n8n-geo] Action: ${action}`, params);

    // Health check
    if (action === 'health' || req.method === 'GET') {
      return res.json({
        ok: true,
        service: 'n8n-geo',
        version: '1.0.0',
        timestamp: new Date().toISOString()
      });
    }

    // Webhook receiver for n8n workflows
    if (action === 'workflow_webhook') {
      const { jobId, step, data } = params;

      return res.json({
        ok: true,
        received: true,
        jobId,
        step,
        timestamp: new Date().toISOString()
      });
    }

    // Start workflow - creates job and returns jobId
    if (action === 'start_workflow') {
      const { topic, outline, minScore = 95, maxIterations = 3 } = params;

      if (!topic) {
        return res.status(400).json({ error: 'topic required' });
      }

      const jobId = `job_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

      return res.json({
        ok: true,
        jobId,
        topic,
        outline,
        minScore,
        maxIterations,
        status: 'pending',
        nextStep: 'research',
        createdAt: new Date().toISOString()
      });
    }

    // Unknown action
    return res.status(400).json({
      error: 'Unknown action',
      action,
      availableActions: [
        'health',
        'workflow_webhook',
        'start_workflow'
      ]
    });

  } catch (error: any) {
    console.error('[n8n-geo] Error:', error);
    return res.status(500).json({
      error: error.message || 'Internal server error',
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}
