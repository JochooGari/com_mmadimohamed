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

function idFromUrl(url: string) {
  try { return Buffer.from(url).toString('base64').replace(/=+$/, ''); } catch { return ''; }
}

async function getExistingIdsSet(): Promise<Set<string>> {
  const entries = await listObjects('monitoring', 'sources');
  const set = new Set<string>();
  for (const e of entries) {
    const name = e?.name || '';
    // pattern: type_<id>.json
    const m = name.match(/^[^_]+_(.+)\.json$/);
    if (m && m[1]) set.add(m[1]);
  }
  return set;
}

async function getConfig() {
  const def = {
    weights: { engagement: 0.4, business: 0.3, novelty: 0.2, priority: 0.1 },
    rss: [],
    websites: [],
    youtube: [],
    objective: '',
    autoDiscovery: true,
    aiResearch: true,
    aiProvider: 'perplexity',
    aiModel: 'sonar-pro',
    scoringPrompt: '',
    maxNewPerFeed: 5,
    maxNewPerRun: 50
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
        const base = process.env.SITE_URL || (process.env.VERCEL_URL ? (process.env.VERCEL_URL.startsWith('http') ? process.env.VERCEL_URL : `https://${process.env.VERCEL_URL}`) : '');
        if (!base) return res.status(500).json({ error: 'Missing SITE_URL/VERCEL_URL' });

        const cfg = await getConfig();
        // Avant collecte: découverte via IA si activée
        try {
          if (cfg.aiResearch) {
            const dr = await fetch(`${base}/api/monitoring`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'discover_sources' }) });
            if (!dr.ok) {
              const t = await dr.text().catch(()=> '');
              await setStatus({ message: `Erreur découverte IA: ${t || dr.status}`, success: false });
              return res.status(500).json({ error: 'AI discovery failed', details: t || dr.status });
            }
          }
        } catch (e:any) {
          await setStatus({ message: `Erreur découverte IA: ${e?.message||'unknown'}`, success: false });
          return res.status(500).json({ error: 'AI discovery failed', details: e?.message });
        }
        // recharger la config après découverte
        const cfg2 = await getConfig();
        const rssList: string[] = Array.isArray(cfg2.rss) ? cfg2.rss : [];
        const websites: string[] = Array.isArray(cfg2.websites) ? cfg2.websites : [];
        const youtubeList: string[] = Array.isArray(cfg2.youtube) ? cfg2.youtube : [];
        const maxNewPerFeed = Number(cfg2.maxNewPerFeed) || 5;
        const maxNewPerRun = Number(cfg2.maxNewPerRun) || 50;
        const existingIds = await getExistingIdsSet();

        const targets: string[] = [];
        // 1) Sitemap (limité)
        try {
          const sm = await fetch(`${base}/sitemap.xml`);
          if (sm.ok) {
            const xml = await sm.text();
            const locs = Array.from(xml.matchAll(/<loc>([^<]+)<\/loc>/gi)).map(m => m[1]);
            targets.push(...locs.filter(u => /\/blog\//.test(u) || /\/resource\//.test(u)).slice(0, 5));
          }
        } catch {}

        // 2) RSS → extraire de nouveaux liens par flux
        for (const feedUrl of rssList) {
          try {
            const r = await fetch(feedUrl);
            if (!r.ok) continue;
            const xml = await r.text();
            const itemLinks = Array.from(xml.matchAll(/<item>[\s\S]*?<link>([^<]+)<\/link>[\s\S]*?<\/item>/gi)).map(m => m[1]);
            const atomLinks = Array.from(xml.matchAll(/<entry>[\s\S]*?<link[^>]*href=["']([^"']+)["'][\s\S]*?<\/entry>/gi)).map(m => m[1]);
            const all = [...itemLinks, ...atomLinks];
            let added = 0;
            for (const u of all) {
              const id = idFromUrl(u);
              if (!id || existingIds.has(id)) continue;
              targets.push(u);
              added++; if (added >= maxNewPerFeed || targets.length >= maxNewPerRun) break; // limite par flux et par run
            }
            if (targets.length >= maxNewPerRun) break;
          } catch {}
        }

        // 3) Websites explicites
        targets.push(...websites);

        // 4) YouTube → convertir en flux XML puis en liens vidéo (2)
        for (const y of youtubeList) {
          try {
            if (/youtube\.com\/(?:channel)\//i.test(y)) {
              const id = y.split('/').pop() || '';
              const feed = `https://www.youtube.com/feeds/videos.xml?channel_id=${id}`;
              const r = await fetch(feed); if (r.ok) {
                const xml = await r.text();
                const vids = Array.from(xml.matchAll(/<entry>[\s\S]*?<link[^>]*href=["']([^"']+)["'][\s\S]*?<\/entry>/gi)).map(m => m[1]);
                let yadded = 0;
                for (const v of vids) { const id = idFromUrl(v); if (id && !existingIds.has(id)) { targets.push(v); yadded++; if (yadded >= maxNewPerFeed || targets.length >= maxNewPerRun) break; } }
              }
            } else if (/youtube\.com\/user\//i.test(y)) {
              const user = y.split('/').pop() || '';
              const feed = `https://www.youtube.com/feeds/videos.xml?user=${user}`;
              const r = await fetch(feed); if (r.ok) {
                const xml = await r.text();
                const vids = Array.from(xml.matchAll(/<entry>[\s\S]*?<link[^>]*href=["']([^"']+)["'][\s\S]*?<\/entry>/gi)).map(m => m[1]);
                let yadded = 0;
                for (const v of vids) { const id = idFromUrl(v); if (id && !existingIds.has(id)) { targets.push(v); yadded++; if (yadded >= maxNewPerFeed || targets.length >= maxNewPerRun) break; } }
              }
            }
          } catch {}
        }

        let processed = 0;
        let optimizedOk = 0;
        let optimizedFailed = 0;
        const seen = new Set<string>();
        for (const url of targets.slice(0, maxNewPerRun)) {
          if (!url || seen.has(url)) continue;
          const id = idFromUrl(url);
          if (!id || existingIds.has(id)) continue; // déjà collecté dans un run précédent
          seen.add(url);
          try {
            const r = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
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
              id,
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
            // Optimisation IA obligatoire (no fallback)
            try {
              const sys = 'You output ONLY compact JSON. No prose.';
              const basePrompt = (cfg2.scoringPrompt && cfg2.scoringPrompt.length > 0)
                ? cfg2.scoringPrompt
                : 'Analyse et score le document pour la veille CFO/CMO. Retourne uniquement le JSON demandé.';
              const jsonRule = 'Renvoie UNIQUEMENT un JSON compact {"title":"...","url":"...","sector":"...","signals":["..."],"summary":"...","bullets":["..."],"scores":{"engagement":0..1,"business":0..1,"novelty":0..1,"priority":0..1,"global":0..1}} sans aucun texte.';
              const prompt = `${basePrompt}\n\n${jsonRule}`;
              const body = {
                provider: cfg2.aiProvider || 'perplexity',
                model: cfg2.aiModel || 'llama-3.1-sonar-large-128k-online',
                messages: [
                  { role: 'system', content: sys },
                  { role: 'user', content: `${prompt}\n\nTITRE: ${obj.title}\nSOURCE: ${obj.url}\nTEXTE:\n${obj.content}` }
                ],
                temperature: 0.2,
                maxTokens: 800
              } as any;
              const r2 = await fetch(`${base}/api/ai-proxy`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
              if (!r2.ok) throw new Error(`ai-proxy status ${r2.status}`);
              const d2 = await r2.json();
              let text2 = (d2?.content || d2?.text || d2?.choices?.[0]?.message?.content || '').trim();
              // Tolérance: retirer éventuels fences ``` ou ```json
              if (/^```/.test(text2)) {
                text2 = text2.replace(/^```(?:json)?\n?/i, '').replace(/\n?```$/i, '').trim();
              }
              // Si toujours non parseable, essayer d'extraire le premier objet JSON
              let j: any;
              try {
                j = JSON.parse(text2);
              } catch {
                const first = text2.indexOf('{');
                const last = text2.lastIndexOf('}');
                if (first >= 0 && last > first) {
                  const sub = text2.slice(first, last + 1);
                  j = JSON.parse(sub);
                } else {
                  throw new Error('invalid JSON from AI');
                }
              }
              await putObject('monitoring', `optimized/optimized_${obj.id}.json`, JSON.stringify({ id: obj.id, url: obj.url, ...j, optimizedAt: new Date().toISOString() }, null, 2));
              optimizedOk++;
            } catch (e:any) {
              optimizedFailed++;
            }
            processed++;
          } catch {}
        }
        const stats = await getMonitoringStats();
        const sourcesCount = (websites?.length || 0) + (rssList?.length || 0) + (youtubeList?.length || 0);
        const success = optimizedFailed === 0;
        const message = success ? 'Veille terminée (IA OK)' : `Veille partielle: optimisations échouées ${optimizedFailed}`;
        await setStatus({ finishedAt: new Date().toISOString(), lastRunAt: new Date().toISOString(), success, message, itemsProcessed: processed, sourcesProcessed: sourcesCount });
        if (!success) return res.status(500).json({ success: false, processed, optimizedOk, optimizedFailed });
        return res.json({ success: true, processed, optimizedOk, targets: sourcesCount, stats });
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
        const webSet = new Set<string>(cfg.websites || []);
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
        // Découverte via IA (Perplexity) si activée
        try {
          if (cfg.aiResearch) {
            const base = process.env.SITE_URL || (process.env.VERCEL_URL ? (process.env.VERCEL_URL.startsWith('http') ? process.env.VERCEL_URL : `https://${process.env.VERCEL_URL}`) : '');
            if (base) {
              const prompt = cfg.scoringPrompt && cfg.scoringPrompt.length > 10
                ? cfg.scoringPrompt
                : `Tu es un agent de veille. Objectif: ${cfg.objective || 'veille marketing/IA B2B'}. Propose jusqu'à 10 URLs pertinentes (web/RSS/YouTube) qui permettront de générer contenus et lead magnets orientés conversion. Favorise thématiques business (ROI, pipeline, benchmark, classement), CTA/Conversion (demo, essai, webinar, download), lead magnets (guide, template, checklist). Renvoie UNIQUEMENT un JSON compact {"websites":[],"rss":[],"youtube":[]} sans texte.`;
              const body = {
                provider: cfg.aiProvider || 'perplexity',
                model: cfg.aiModel || 'sonar-pro',
                messages: [
                  { role: 'system', content: 'You output ONLY compact JSON. No prose.' },
                  { role: 'user', content: prompt }
                ],
                temperature: 0.2,
                maxTokens: 500
              } as any;
              const r = await fetch(`${base}/api/ai-proxy`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
              if (r.ok) {
                const data = await r.json();
                const text = (data?.content || data?.text || data?.choices?.[0]?.message?.content || '').trim();
                try {
                  const json = JSON.parse(text);
                  const add = (arr:any, set:Set<string>) => { if (Array.isArray(arr)) arr.forEach((u:string)=> { if (typeof u === 'string' && /^https?:\/\//i.test(u)) set.add(u); }); };
                  add(json.websites, webSet);
                  add(json.rss, rssSet);
                  add(json.youtube, ytSet);
                } catch {}
              }
            }
          }
        } catch {}
        const updated = { ...cfg, rss: Array.from(rssSet), youtube: Array.from(ytSet), websites: Array.from(webSet) };
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
        // lister les objets sous sources/ mais n'afficher que ceux avec un optimized correspondant
        const entries = await listObjects('monitoring', 'sources');
        const supabase = getSupabase();
        const map = new Map<string, any>();
        const bc = cfg.businessCriteria || {};
        const topicKw: string[] = bc.topicKeywords || ['roi','revenue','pipeline','benchmark','market','classement','pricing','case study','b2b','saas'];
        const convKw: string[] = bc.conversionKeywords || ['download','inscription','subscribe','contact','demo','webinar','trial','lead','cta','conversion'];
        const lmKw: string[] = bc.leadMagnetKeywords || ['guide','template','checklist','whitepaper','ebook','rapport','étude','liste','classement','ranking'];
        const bw = bc.weights || { topic: 0.5, conversion: 0.3, leadMagnet: 0.2 };
        const bwSum = (bw.topic||0) + (bw.conversion||0) + (bw.leadMagnet||0) || 1;
        const nrm = (n:number)=> Math.max(0, Math.min(1, n));
        const kwScore = (text:string, kws:string[]) => {
          if (!text) return 0;
          if (!kws || kws.length === 0) return 0;
          const lower = text.toLowerCase();
          const hits = kws.reduce((acc, k) => acc + (lower.includes(k.toLowerCase()) ? 1 : 0), 0);
          return nrm(hits / Math.max(3, Math.ceil(kws.length/2)));
        };
        const limit = Math.min(200, Math.max(1, parseInt(url.searchParams.get('limit') || '50', 10)));
        const sort = (url.searchParams.get('sort') || 'global_desc').toLowerCase();
        const topicFilterParam = (url.searchParams.get('topic') || '').toLowerCase();
        const classifyTopic = (title: string, source: string) => {
          const s = `${title || ''} ${source || ''}`.toLowerCase();
          if (/linkedin|algorithme/.test(s)) return 'linkedin';
          if (/seo|semrush|ahrefs|ranking|backlink/.test(s)) return 'seo';
          if (/finance|cfo|daf|budget|cash/.test(s)) return 'finance';
          if (/growth|acquisition|leads|pipeline/.test(s)) return 'growth';
          if (/ai| ia |machine learning|ml/.test(s)) return 'ai';
          return 'general';
        };
        const normalize01 = (val:number) => {
          if (typeof val !== 'number' || isNaN(val)) return 0;
          if (val <= 1) return Math.max(0, Math.min(1, val));
          // support 0..10 or 0..100 inputs
          if (val <= 10) return Math.max(0, Math.min(1, val / 10));
          return Math.max(0, Math.min(1, val / 100));
        };

        for (const e of entries) {
          if (!e?.name?.endsWith('.json')) continue;
          const { data } = await supabase.storage.from('monitoring').download(`sources/${e.name}`);
          if (!data) continue;
          const text = await (data as any).text();
          try {
            const obj = JSON.parse(text);
            // Exiger un optimized; sinon ignorer cet item (no fallback)
            const optProbe = await supabase.storage.from('monitoring').download(`optimized/optimized_${obj.id}.json`);
            if (!optProbe?.data) continue;
            // Lire les scores IA et métadonnées
            const t2 = await (optProbe.data as any).text();
            const jo = JSON.parse(t2);
            const engagement = normalize01(Number(jo?.scores?.engagement) || 0);
            const business = normalize01(Number(jo?.scores?.business) || 0);
            const novelty = normalize01(Number(jo?.scores?.novelty) || 0);
            const priority = normalize01(Number(jo?.scores?.priority) || 0);
            const globalRaw = Number(jo?.scores?.global ?? (0.4*engagement + 0.3*business + 0.2*novelty + 0.1*priority));
            const global = normalize01(globalRaw);
            const row = {
              id: obj.id,
              title: jo?.title || obj.title,
              type: obj.type,
              source: obj.source,
              date: obj.publishedAt,
              url: obj.url,
              addedAt: obj.collectedAt || obj.publishedAt,
              sector: jo?.sector || classifyTopic(obj.title, obj.source),
              signals: Array.isArray(jo?.signals) ? jo.signals : [],
              justification: jo?.justification?.business || jo?.justification?.priority || jo?.justification?.engagement || '',
              scores: { engagement, business, novelty, priority, global }
            };
            const key = obj.url || obj.id;
            if (!map.has(key)) map.set(key, row);
          } catch {}
        }
        // Si aucun item, renvoyer une erreur explicite (pas de fallback)
        let rows = Array.from(map.values());
        if (rows.length === 0) {
          return res.status(404).json({ error: 'Aucun résultat optimisé disponible. L’IA doit réussir le scoring. Vérifiez PERPLEXITY_API_KEY, le modèle (sonar-pro), et le prompt.' });
        }
        if (topicFilterParam) rows = rows.filter(r => (r.topic || '').toLowerCase() === topicFilterParam);
        if (sort === 'date_desc') rows.sort((a,b)=> new Date(b.addedAt||b.date||0).getTime() - new Date(a.addedAt||a.date||0).getTime());
        else if (sort === 'score_asc') rows.sort((a,b)=> (a.scores.global - b.scores.global));
        else rows.sort((a,b)=> (b.scores.global - a.scores.global));
        return res.json({ items: rows.slice(0, limit) });
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
