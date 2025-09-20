// @ts-nocheck
import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE;
  if (!url || !key) return null;
  return createClient(url as string, key as string, { auth: { persistSession: false, autoRefreshToken: false } });
}

async function putObject(bucket: string, path: string, text: string, contentType = 'application/json') {
  const supabase = getSupabase();
  if (!supabase) return;
  await supabase.storage.from(bucket).upload(path, new Blob([text]) as any, { upsert: true, contentType });
}

async function getObjectJSON<T = any>(bucket: string, path: string): Promise<T | null> {
  const supabase = getSupabase();
  if (!supabase) return null;
  const { data } = await supabase.storage.from(bucket).download(path);
  if (!data) return null;
  const text = await (data as any).text();
  try { return JSON.parse(text); } catch { return null; }
}

async function updateIndex(content: any) {
  const indexPath = 'monitoring_index.json';
  let index = await getObjectJSON('monitoring', indexPath);
  if (!index) {
    index = { lastUpdated: '', totalItems: 0, byType: {}, bySource: {}, byDate: {}, keywords: {} };
  }
  index.lastUpdated = new Date().toISOString();
  index.totalItems++;
  const t = content.type || 'article';
  index.byType[t] = (index.byType[t] || 0) + 1;
  if (content.source) index.bySource[content.source] = (index.bySource[content.source] || 0) + 1;
  const dateKey = new Date(content.publishedAt || Date.now()).toISOString().split('T')[0];
  index.byDate[dateKey] = (index.byDate[dateKey] || 0) + 1;
  const words = (content.content || '').toLowerCase().split(/\s+/).filter(w => w.length > 4).slice(0, 10);
  for (const w of words) index.keywords[w] = (index.keywords[w] || 0) + 1;
  await putObject('monitoring', indexPath, JSON.stringify(index, null, 2));
}

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    if (req.method === 'POST') {
      const { action } = req.body || {};
      if (action === 'run_now') {
        // Collecte minimale: sitemap du site + 5 pages max
        const base = process.env.SITE_URL || (process.env.VERCEL_URL ? (process.env.VERCEL_URL.startsWith('http') ? process.env.VERCEL_URL : `https://${process.env.VERCEL_URL}`) : '');
        if (!base) return res.status(500).json({ error: 'Missing SITE_URL/VERCEL_URL' });
        let targets: string[] = [];
        try {
          const sm = await fetch(`${base}/sitemap.xml`);
          if (sm.ok) {
            const xml = await sm.text();
            const locs = Array.from(xml.matchAll(/<loc>([^<]+)<\/loc>/gi)).map(m => m[1]);
            targets = locs.filter(u => /\/blog\//.test(u) || /\/resource\//.test(u)).slice(0, 5);
          }
        } catch {}
        if (targets.length === 0) targets = [base];

        for (const url of targets) {
          try {
            const r = await fetch(url);
            if (!r.ok) continue;
            const html = await r.text();
            const title = (html.match(/<title>([^<]+)<\/title>/i)?.[1] || '').trim();
            const description = (html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)/i)?.[1] || '').trim();
            const text = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
              .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
              .replace(/<[^>]+>/g, ' ')
              .replace(/\s+/g, ' ')
              .trim();
            const body = description || text.slice(0, 1400);
            const obj = {
              id: `web_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
              title: title || 'Page',
              content: body,
              type: /\/blog\//.test(url) ? 'article' : 'document',
              source: new URL(url).host,
              url,
              publishedAt: new Date().toISOString(),
              collectedAt: new Date().toISOString()
            };
            await putObject('monitoring', `sources/${obj.type}_${obj.id}.json`, JSON.stringify(obj, null, 2));
            await updateIndex(obj);
          } catch {}
        }
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
