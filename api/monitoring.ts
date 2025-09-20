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

async function listObjects(bucket: string, prefix: string) {
  const supabase = getSupabase();
  if (!supabase) return [] as any[];
  const { data } = await supabase.storage.from(bucket).list(prefix, { limit: 100, offset: 0 });
  return data || [];
}

async function getConfig() {
  const def = {
    weights: { engagement: 0.4, business: 0.3, novelty: 0.2, priority: 0.1 },
    rss: [],
    websites: [],
    youtube: [],
    objective: '',
    autoDiscovery: true
  };
  const cfg = await getObjectJSON('monitoring', 'config.json');
  return { ...def, ...(cfg || {}) };
}

type Status = {
  startedAt?: string;
  finishedAt?: string;
  lastRunAt?: string;
  message?: string;
  success?: boolean;
  itemsProcessed?: number;
  sourcesProcessed?: number;
};

async function getStatus(): Promise<Status> {
  return (await getObjectJSON<Status>('monitoring', 'status.json')) || {};
}

async function setStatus(patch: Partial<Status>) {
  const current = await getStatus();
  const merged = { ...current, ...patch } as Status;
  await putObject('monitoring', 'status.json', JSON.stringify(merged, null, 2));
  return merged;
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
        await setStatus({ startedAt: new Date().toISOString(), success: undefined, message: 'Veille en cours...', itemsProcessed: 0, sourcesProcessed: 0 });
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

        let processed = 0;
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
            processed++;
          } catch {}
        }
        const stats = await getMonitoringStats();
        await setStatus({ finishedAt: new Date().toISOString(), lastRunAt: new Date().toISOString(), success: true, message: 'Veille terminée', itemsProcessed: processed, sourcesProcessed: targets.length });
        return res.json({ success: true, processed, targets: targets.length, stats });
      }
      if (action === 'save_config') {
        const cfg = req.body?.config;
        if (!cfg || typeof cfg !== 'object') return res.status(400).json({ error: 'config missing' });
        await putObject('monitoring', 'config.json', JSON.stringify(cfg, null, 2));
        return res.json({ ok: true });
      }
      if (action === 'discover_sources') {
        const cfg = await getConfig();
        const rssSet = new Set<string>(cfg.rss || []);
        const ytSet = new Set<string>(cfg.youtube || []);
        const webList: string[] = Array.isArray(cfg.websites) ? cfg.websites : [];
        let discovered = 0;
        for (const w of webList) {
          try {
            const u = new URL(w);
            const r = await fetch(u.origin);
            const html = await r.text();
            // RSS <link rel="alternate" type="application/rss+xml" href="...">
            const feedLinks = Array.from(html.matchAll(/<link[^>]+type=["']application\/rss\+xml["'][^>]*href=["']([^"']+)/gi)).map(m => m[1]);
            feedLinks.forEach(f => rssSet.add(f));
            // YouTube links on page
            const ytLinks = Array.from(html.matchAll(/href=["']https?:\/\/(?:www\.)?youtube\.com\/[^"']+["']/gi)).map(m => m[0].slice(6, -1));
            ytLinks.forEach(l => ytSet.add(l));
            discovered += feedLinks.length + ytLinks.length;
          } catch {}
        }
        const updated = { ...cfg, rss: Array.from(rssSet), youtube: Array.from(ytSet) };
        await putObject('monitoring', 'config.json', JSON.stringify(updated, null, 2));
        await setStatus({ message: `Découverte: +${discovered} flux/chaînes`, success: true });
        return res.json({ ok: true, rss: updated.rss.length, youtube: updated.youtube.length, discovered });
      }
      return res.status(400).json({ error: 'Unknown action' });
    }

    if (req.method === 'GET') {
      const url = new URL(req.url, 'http://x');
      if (url.searchParams.get('config') === '1') {
        const cfg = await getConfig();
        return res.json(cfg);
      }
      if (url.searchParams.get('list') === '1') {
        const cfg = await getConfig();
        // lister les objets sous sources/
        const entries = await listObjects('monitoring', 'sources');
        const supabase = getSupabase();
        const rows: any[] = [];
        for (const e of entries) {
          if (!e?.name?.endsWith('.json')) continue;
          const { data } = await supabase.storage.from('monitoring').download(`sources/${e.name}`);
          if (!data) continue;
          const text = await (data as any).text();
          try {
            const obj = JSON.parse(text);
            const engagement = Math.min(1, ((obj.metadata?.engagement?.likes || 20) + (obj.metadata?.engagement?.comments || 5)) / 200);
            const business = /roi|revenue|pipeline|deal|cash|daf|cfo|case/i.test(obj.content || '') ? 0.9 : 0.6;
            const novelty = Math.min(1, (obj.content || '').split(/\b/).length / 2000);
            const priority = 0.5 + (business - 0.5) * 0.5 + (engagement - 0.5) * 0.3;
            const w = cfg.weights || { engagement: 0.4, business: 0.3, novelty: 0.2, priority: 0.1 };
            const global = engagement*w.engagement + business*w.business + novelty*w.novelty + priority*w.priority;
            rows.push({
              id: obj.id,
              title: obj.title,
              type: obj.type,
              source: obj.source,
              date: obj.publishedAt,
              scores: { engagement, business, novelty, priority, global }
            });
          } catch {}
        }
        rows.sort((a,b)=> (b.scores.global - a.scores.global));
        return res.json({ items: rows });
      }
      if (url.searchParams.get('status') === '1') {
        const st = await getStatus();
        return res.json(st);
      }
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
