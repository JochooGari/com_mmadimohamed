import type { VercelRequest, VercelResponse } from '@vercel/node';
import { MonitoringAgent } from '../src/lib/monitoringAgent';
import { MonitoringStorage } from '../src/lib/fileStorage';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    if (req.method === 'POST') {
      const { action, config } = req.body || {};
      if (action === 'run_now') {
        // Mettre à jour la config de sources si fournie
        if (config && typeof config === 'object') {
          const agent = MonitoringAgent.getInstance();
          if (config.linkedin) await agent.updateSourceConfig('linkedin', config.linkedin);
          if (config.rss) await agent.updateSourceConfig('rss', config.rss);
          if (config.websites) await agent.updateSourceConfig('websites', config.websites);
        }
        await MonitoringAgent.getInstance().runNow();
        const stats = await MonitoringStorage.getMonitoringStats();
        return res.json({ success: true, stats });
      }
      return res.status(400).json({ error: 'Unknown action' });
    }

    if (req.method === 'GET') {
      const stats = await MonitoringStorage.getMonitoringStats();
      return res.json(stats);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (e: any) {
    console.error('Monitoring API error:', e);
    return res.status(500).json({ error: 'Internal error', details: e?.message });
  }
}


