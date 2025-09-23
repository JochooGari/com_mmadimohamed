// @ts-nocheck
import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE;
  if (!url || !key) return null;
  return createClient(url as string, key as string, { auth: { persistSession: false, autoRefreshToken: false } });
}

async function readConfig() {
  try {
    const supabase = getSupabase();
    const { data } = await supabase.storage.from('agents').download('connectors/config.json');
    if (!data) return { providers: {} };
    const text = await (data as any).text();
    return JSON.parse(text);
  } catch { return { providers: {} }; }
}

async function writeConfig(cfg: any) {
  const supabase = getSupabase();
  await supabase.storage.from('agents').upload('connectors/config.json', new Blob([JSON.stringify(cfg, null, 2)]) as any, { upsert: true, contentType: 'application/json' });
}

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    if (req.method === 'GET') {
      const cfg = await readConfig();
      return res.json(cfg);
    }
    if (req.method === 'POST') {
      const { action, provider, content, meta } = req.body || {};
      if (action === 'connect') {
        const cfg = await readConfig();
        cfg.providers = cfg.providers || {};
        cfg.providers[provider] = { connected: true, connectedAt: new Date().toISOString() };
        await writeConfig(cfg);
        return res.json({ ok: true });
      }
      if (action === 'disconnect') {
        const cfg = await readConfig();
        cfg.providers = cfg.providers || {};
        cfg.providers[provider] = { connected: false, disconnectedAt: new Date().toISOString() };
        await writeConfig(cfg);
        return res.json({ ok: true });
      }
      if (action === 'publish_linkedin') {
        const cfg = await readConfig();
        if (!cfg?.providers?.linkedin?.connected) {
          return res.status(400).send('Compte LinkedIn non connecté. Allez dans Connecteurs.');
        }
        // Simuler la publication: enregistrer dans storage
        const supabase = getSupabase();
        const path = `agents/linkedin/outputs/published_${Date.now()}.json`;
        await supabase.storage.from('agents').upload(path, new Blob([JSON.stringify({ content, meta, publishedAt: new Date().toISOString() }, null, 2)]) as any, { upsert: true, contentType: 'application/json' });
        return res.status(200).send('Publié (simulé)');
      }
      return res.status(400).json({ error: 'Unknown action' });
    }
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (e:any) {
    return res.status(500).json({ error: e?.message || 'Server error' });
  }
}



