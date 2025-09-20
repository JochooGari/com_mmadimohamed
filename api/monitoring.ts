// @ts-nocheck
import { createClient } from '@supabase/supabase-js';

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    if (req.method === 'POST') {
      const { action } = req.body || {};
      if (action === 'run_now') {
        // En production, nous persistons l'index dans Supabase Storage. Ici on renvoie l'état courant.
        const stats = await getMonitoringStats();
        return res.json({ success: true, stats });
      }
      return res.status(400).json({ error: 'Unknown action' });
    }

    if (req.method === 'GET') {
      const stats = await getMonitoringStats();
      return res.json(stats);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (e: any) {
    console.error('Monitoring API error:', e);
    return res.status(500).json({ error: 'Internal error', details: e?.message });
  }
}
async function getMonitoringStats() {
  // 1) Essayer Supabase Storage (prod)
  const url = process.env.SUPABASE_URL as string | undefined;
  const key = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE) as string | undefined;
  if (url && key) {
    try {
      const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
      const { data } = await supabase.storage.from('monitoring').download('monitoring_index.json');
      if (data) {
        const text = await (data as any).text();
        return JSON.parse(text);
      }
    } catch {}
  }
  // 2) Fallback: fichier local (dev)
  try {
    const fs = await import('fs');
    const path = await import('path');
    const indexFile = path.join(process.cwd(), 'data', 'monitoring', 'monitoring_index.json');
    const text = await fs.promises.readFile(indexFile, 'utf8');
    return JSON.parse(text);
  } catch {
    return { lastUpdated: '', totalItems: 0, byType: {}, bySource: {}, byDate: {}, keywords: {} };
  }
}
