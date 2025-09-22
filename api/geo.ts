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

function extractOutline(html: string) {
  const getText = (re: RegExp) => {
    const arr: { title:string; level:number; id:string }[] = [];
    let m: RegExpExecArray | null;
    while ((m = re.exec(html)) !== null) {
      const title = (m[1] || '').replace(/<[^>]+>/g,'').trim();
      const level = m[0].toLowerCase().startsWith('<h1') ? 1 : m[0].toLowerCase().startsWith('<h2') ? 2 : 3;
      const id = `${title.toLowerCase().replace(/[^a-z0-9]+/g,'-')}-${arr.length}`.replace(/^-|-$|--+/g,'-');
      if (title) arr.push({ title, level, id });
    }
    return arr;
  };
  const h1 = (html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1] || '').replace(/<[^>]+>/g,'').trim();
  const sections = [
    ...getText(/<h2[^>]*>([\s\S]*?)<\/h2>/gi),
    ...getText(/<h3[^>]*>([\s\S]*?)<\/h3>/gi)
  ];
  return { h1, sections };
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
        let { html, url } = req.body || {};
        if (!html && url) {
          try {
            const r = await fetch(url);
            if (r.ok) html = await r.text();
          } catch {}
        }
        const id = Date.now().toString();
        const outline = extractOutline(String(html||''));
        const record = { id, html: String(html||''), url: String(url||''), outline, createdAt: new Date().toISOString() };
        await put('agents', `geo/templates/${id}.json`, JSON.stringify(record, null, 2));
        // update index
        const idx = (await getJSON<any>('agents','geo/templates/index.json')) || { items: [] };
        idx.items.unshift({ id, title: outline.h1 || 'Template', createdAt: record.createdAt, url: record.url });
        await put('agents','geo/templates/index.json', JSON.stringify(idx, null, 2));
        return res.json({ ok: true, id, outline });
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
        const { topic = 'Sujet', locked = [], editable = [], outline = 'H1/H2/H3', models = {}, providers = {} } = req.body || {};
        const base = process.env.SITE_URL || (process.env.VERCEL_URL ? (process.env.VERCEL_URL.startsWith('http') ? process.env.VERCEL_URL : `https://${process.env.VERCEL_URL}`) : '');
        const callAI = async (provider:string, model:string, messages:any, temperature=0.3, maxTokens=1200) => {
          const r = await fetch(`${base}/api/ai-proxy`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ provider, model, messages, temperature, maxTokens }) });
          if (!r.ok) throw new Error(`${provider} ${model} ${r.status}`);
          return r.json();
        };
        const logs:any[] = [];
        // 1) OpenAI draft
        const sys1 = 'You write publication-quality French long-form. Respect locked sections; return only edited sections JSON.';
        const usr1 = (models?.openai && (req.body?.prompts?.openai||'').trim().length>0)
          ? req.body.prompts.openai
          : `Sujet: ${topic}\nOutline: ${outline}\nLocked: ${JSON.stringify(locked).slice(0,1000)}\nEditable: ${JSON.stringify(editable).slice(0,2000)}\nLivrable JSON strict: {"sections":[{"id":"...","title":"...","html":"..."}]}`;
        const draftProvider = providers.draft || 'openai';
        const draftModel = models.draft || models.openai || 'gpt-4-turbo';
        const openai = await callAI(draftProvider, draftModel, [ {role:'system', content: sys1}, {role:'user', content: usr1} ]).catch(e=>({ error:String(e)}));
        logs.push({ step:'draft', summary: openai?.usage || null, model: draftModel, provider: draftProvider });
        const draftText = (openai?.content || openai?.choices?.[0]?.message?.content || '').trim();
        // 2) Claude review
        const sys2 = 'You are a senior French editor. Improve clarity/consistency; preserve structure; return JSON sections only.';
        const usr2 = (req.body?.prompts?.anthropic||'').trim().length>0
          ? req.body.prompts.anthropic.replace('{draft}', draftText)
          : `Review and improve these sections JSON. Keep locked untouched. Return {"sections":[{"id":"...","html":"..."}],"notes":["..."]}\n\n${draftText}`;
        const reviewProvider = providers.review || 'anthropic';
        const anthropicModel = models.review || models.anthropic || 'claude-3-sonnet';
        const claude = await callAI(reviewProvider, anthropicModel, [ {role:'system', content: sys2}, {role:'user', content: usr2} ]).catch(e=>({ error:String(e)}));
        logs.push({ step:'review', summary: claude?.usage || null, model: anthropicModel, provider: reviewProvider });
        const reviewText = (claude?.content || '').trim() || draftText;
        let claudeNotes: string[] = [];
        try { const j = JSON.parse(reviewText); claudeNotes = Array.isArray(j?.notes) ? j.notes : []; } catch {}
        // 3) Perplexity scoring
        const sys3 = 'You output ONLY compact JSON. No prose. No markdown.';
        const usr3 = (req.body?.prompts?.perplexity||'').trim().length>0
          ? req.body.prompts.perplexity.replace('{article}', reviewText)
          : `Compute SEO/GEO (0..100) + strengths/weaknesses/fixes. Return {"scores":{"seo":0,"geo":0},"strengths":[],"weaknesses":[],"fixes":[]} for article sections JSON:\n${reviewText}`;
        const scoreProvider = providers.score || 'perplexity';
        const ppxModel = models.score || models.perplexity || 'sonar';
        const ppx = await callAI(scoreProvider, ppxModel, [ {role:'system', content: sys3}, {role:'user', content: usr3} ], 0.2, 800).catch(e=>({ error:String(e)}));
        logs.push({ step:'score', summary: ppx?.usage || null, model: ppxModel, provider: scoreProvider });
        let scoreObj: any = null; try { scoreObj = JSON.parse((ppx?.content||'').trim()); } catch {}
        return res.json({ logs, feedback: { openai: 'Draft généré', claude: claudeNotes, perplexity: scoreObj } });
      }
      if (action === 'save_settings') {
        const { models, providers, prompts } = req.body || {};
        await put('agents','geo/inputs/prompt_settings.json', JSON.stringify({ models, providers, prompts, savedAt: new Date().toISOString() }, null, 2));
        return res.json({ ok: true });
      }
      if (action === 'get_settings') {
        const cfg = await getJSON('agents','geo/inputs/prompt_settings.json');
        return res.json(cfg || {});
      }
      if (action === 'toc_generate') {
        const { sections = [] } = req.body || {};
        const toc = (sections || []).map((s:any, i:number)=> ({ id: s.id || `sec-${i}`, title: s.title || `Section ${i+1}`, level: (s.level||2) }));
        return res.json({ toc });
      }
      if (action === 'media_suggest') {
        const { topic = '', sections = [] } = req.body || {};
        const items = (sections||[]).map((s:any)=> ({ sectionId: s.id, suggestions: [ { type:'image', prompt:`Illustration schéma pour ${s.title}` }, { type:'graph', prompt:`Graph KPI ${topic} – ${s.title}` } ] }));
        return res.json({ items });
      }
      if (action === 'internal_links') {
        const { topic = '' } = req.body || {};
        const base = process.env.SITE_URL || (process.env.VERCEL_URL ? (process.env.VERCEL_URL.startsWith('http') ? process.env.VERCEL_URL : `https://${process.env.VERCEL_URL}`) : '');
        let links: any[] = [];
        try {
          const r = await fetch(`${base}/sitemap.xml`);
          if (r.ok) {
            const xml = await r.text();
            const locs = Array.from(xml.matchAll(/<loc>([^<]+)<\/loc>/gi)).map(m=> m[1]);
            links = locs.filter(u=> u.toLowerCase().includes('blog') || u.toLowerCase().includes('resource')).slice(0,10).map(u=> ({ url: u, why: 'related', score: 0.7 }));
          }
        } catch {}
        return res.json({ links });
      }
      if (action === 'cta_generate') {
        const { topic = '' } = req.body || {};
        return res.json({ ctas: [
          { label:'Télécharger le guide PDF', href:'#', variant:'primary' },
          { label:'Booker un appel expert', href:'#', variant:'outline' },
          { label:`Découvrir l’outil GEO Analyzer`, href:'#', variant:'link' }
        ]});
      }
      if (action === 'score_live') {
        const { html = '' } = req.body || {};
        const seo = 82, geo = 84;
        return res.json({ scores:{ seo, geo }, fixes:['Ajouter 2 sources officielles','Insérer un tableau comparatif','Ajouter 2 liens internes'], breakdown:{ seo:{ structure:18, semantics:14 }, geo:{ factual:20, traceability:16 } } });
      }
      if (action === 'faq_generate') {
        const { topic = '' } = req.body || {};
        const faq = [ { q:`Qu’est-ce que ${topic}?`, a:'...' }, { q:`Comment démarrer?`, a:'...' }, { q:`Bonnes pratiques?`, a:'...' } ];
        const jsonld = { '@context':'https://schema.org', '@type':'FAQPage', mainEntity: faq.map(x=> ({ '@type':'Question', name:x.q, acceptedAnswer:{ '@type':'Answer', text:x.a } })) };
        return res.json({ faq, jsonld });
      }
      if (action === 'serp_perplexity') {
        const { query = '' } = req.body || {};
        const base = process.env.SITE_URL || (process.env.VERCEL_URL ? (process.env.VERCEL_URL.startsWith('http') ? process.env.VERCEL_URL : `https://${process.env.VERCEL_URL}`) : '');
        const messages = [
          { role:'system', content:'You output ONLY compact JSON. No prose.' },
          { role:'user', content:`Do a web search for: ${query}. Return ONLY JSON: {"results":[{"url":"...","title":"...","why":"..."}]}.`}
        ];
        try {
          const r = await fetch(`${base}/api/ai-proxy`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ provider:'perplexity', model:'sonar', messages, temperature:0.1, maxTokens:600 }) });
          const d = await r.json();
          let text = (d?.content || '').trim();
          if (/^```/.test(text)) text = text.replace(/^```(?:json)?\n?/i,'').replace(/\n?```$/i,'').trim();
          const json = JSON.parse(text);
          return res.json(json);
        } catch (e:any) {
          return res.status(500).json({ error: e?.message || 'serp error' });
        }
      }
      if (action === 'image_generate') {
        const { prompt = '' } = req.body || {};
        const key = process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_SERVER || process.env.OPENAI_API_KEY_PRIVATE;
        if (!key) return res.status(401).json({ error: 'Missing OpenAI key' });
        try {
          const r = await fetch('https://api.openai.com/v1/images/generations', { method:'POST', headers:{ 'Content-Type':'application/json', 'Authorization':`Bearer ${key}` }, body: JSON.stringify({ model:'gpt-image-1', prompt, size:'1024x1024' }) });
          const data = await r.json();
          if (!r.ok) return res.status(r.status).json({ error: data?.error?.message || 'image error' });
          const url = data?.data?.[0]?.url || null;
          return res.json({ url });
        } catch (e:any) {
          return res.status(500).json({ error: e?.message || 'image error' });
        }
      }
      if (action === 'set_painpoint_mode') {
        const { enabled } = req.body || {};
        await put('agents','geo/inputs/painpoint_mode.json', JSON.stringify({ enabled: !!enabled, updatedAt: new Date().toISOString() }));
        return res.json({ ok: true });
      }
      if (action === 'version_log') {
        const { event, payload } = req.body || {};
        const sb = getSupabase();
        const path = 'geo/versions/log.json';
        const current = (await getJSON<any>('agents', path)) || { items: [] };
        current.items.unshift({ ts: new Date().toISOString(), event, payload });
        await put('agents', path, JSON.stringify(current, null, 2));
        return res.json({ ok: true });
      }
      if (action === 'benchmark') {
        const { topic='' } = req.body || {};
        // stubbed competitors
        const rows = [
          { url:'https://example.com/article-1', title:'Guide complet', score:88, media:3 },
          { url:'https://example.com/article-2', title:'Tutoriel pas à pas', score:84, media:2 }
        ];
        return res.json({ rows });
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


