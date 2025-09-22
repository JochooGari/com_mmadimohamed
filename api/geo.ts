// @ts-nocheck
import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE;
  if (!url || !key) return null;
  return createClient(url as string, key as string, { auth: { persistSession: false, autoRefreshToken: false } });
}

async function put(bucket: string, path: string, text: string, contentType='application/json') {
  const sb = getSupabase();
  await sb.storage.from(bucket).upload(path, new Blob([text]) as any, { upsert: true, contentType });
}
async function getJSON<T=any>(bucket: string, path: string): Promise<T|null> {
  const sb = getSupabase();
  const { data } = await sb.storage.from(bucket).download(path);
  if (!data) return null; const txt = await (data as any).text();
  try { return JSON.parse(txt); } catch { return null; }
}

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    if (req.method === 'POST') {
      const { action } = req.body || {};
      if (action === 'import_template') {
        const { html, url } = req.body || {};
        const id = Date.now().toString();
        const record = { id, html: String(html||''), url: String(url||''), createdAt: new Date().toISOString() };
        await put('agents', `geo/templates/${id}.json`, JSON.stringify(record, null, 2));
        return res.json({ ok: true, id });
      }
      if (action === 'list_templates') {
        // Simplified: store an index file
        const idx = await getJSON('agents','geo/templates/index.json') || { items: [] };
        return res.json(idx);
      }
      if (action === 'draft') {
        // stub draft echo
        const { outline, topic } = req.body || {};
        return res.json({ sections: [ { id:'intro', title:'Introduction', html:`<p>Draft intro for ${topic}</p>` } ] });
      }
      if (action === 'section_rewrite') {
        const { sectionId, html } = req.body || {};
        return res.json({ sectionId, html });
      }
      if (action === 'score') {
        return res.json({ scores: { seo: 85, geo: 86 }, strengths:['structure'], weaknesses:['few sources'], fixes:['add sources'] });
      }
      if (action === 'chain_draft') {
        const { topic = 'Sujet', locked = [], editable = [], outline = 'H1/H2/H3' } = req.body || {};
        const base = process.env.SITE_URL || (process.env.VERCEL_URL ? (process.env.VERCEL_URL.startsWith('http') ? process.env.VERCEL_URL : `https://${process.env.VERCEL_URL}`) : '');
        const callAI = async (provider:string, model:string, messages:any, temperature=0.3, maxTokens=1200) => {
          const r = await fetch(`${base}/api/ai-proxy`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ provider, model, messages, temperature, maxTokens }) });
          if (!r.ok) throw new Error(`${provider} ${model} ${r.status}`);
          return r.json();
        };
        const logs:any[] = [];
        // 1) OpenAI draft
        const sys1 = 'You write publication-quality French long-form. Respect locked sections; return only edited sections JSON.';
        const usr1 = `Topic: ${topic}\nOutline: ${outline}\nLocked: ${JSON.stringify(locked).slice(0,1000)}\nEditable: ${JSON.stringify(editable).slice(0,2000)}\nReturn JSON {"sections":[{"id":"...","title":"...","html":"..."}]}`;
        const openai = await callAI('openai', 'gpt-4-turbo', [ {role:'system', content: sys1}, {role:'user', content: usr1} ]).catch(e=>({ error:String(e)}));
        logs.push({ step:'openai_draft', summary: openai?.usage || null, model: 'gpt-4-turbo' });
        const draftText = (openai?.content || openai?.choices?.[0]?.message?.content || '').trim();
        // 2) Claude review
        const sys2 = 'You are a senior French editor. Improve clarity/consistency; preserve structure; return JSON sections only.';
        const usr2 = `Review and improve these sections JSON. Keep locked untouched. Return {"sections":[{"id":"...","html":"..."}],"notes":["..."]}\n\n${draftText}`;
        const claude = await callAI('anthropic', 'claude-3-sonnet', [ {role:'system', content: sys2}, {role:'user', content: usr2} ]).catch(e=>({ error:String(e)}));
        logs.push({ step:'claude_review', summary: claude?.usage || null, model: 'claude-3-sonnet' });
        const reviewText = (claude?.content || '').trim() || draftText;
        // 3) Perplexity scoring
        const sys3 = 'You output ONLY compact JSON. No prose. No markdown.';
        const usr3 = `Compute SEO/GEO (0..100) + strengths/weaknesses/fixes. Return {"scores":{"seo":0,"geo":0},"strengths":[],"weaknesses":[],"fixes":[]} for article sections JSON:\n${reviewText}`;
        const ppx = await callAI('perplexity', 'sonar', [ {role:'system', content: sys3}, {role:'user', content: usr3} ], 0.2, 800).catch(e=>({ error:String(e)}));
        logs.push({ step:'perplexity_score', summary: ppx?.usage || null, model: 'sonar' });
        return res.json({ draft: draftText, review: reviewText, score: ppx?.content || '', logs });
      }
      if (action === 'export_html') {
        const { html } = req.body || {};
        const id = Date.now().toString();
        await put('agents', `geo/exports/article_${id}.html`, String(html||''), 'text/html');
        return res.json({ ok: true, id });
      }
      return res.status(400).json({ error: 'Unknown action' });
    }
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (e:any) {
    return res.status(500).json({ error: e?.message || 'Server error' });
  }
}


