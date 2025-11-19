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

function stripFences(text: string): string {
  if (typeof text !== 'string') return '';
  let t = text.trim();
  if (/^```/m.test(t)) {
    t = t.replace(/^```(?:json|JSON)?\n?/i,'').replace(/\n?```$/,'').trim();
  }
  return t;
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
        const { topic = 'Sujet', locked = [], editable = [], outline = 'H1/H2/H3', models = {}, providers = {}, prompts = {} } = req.body || {};
        const base = process.env.SITE_URL || (process.env.VERCEL_URL ? (process.env.VERCEL_URL.startsWith('http') ? process.env.VERCEL_URL : `https://${process.env.VERCEL_URL}`) : '');
        const callAI = async (provider:string, model:string, messages:any, temperature=0.3, maxTokens=1200) => {
          const r = await fetch(`${base}/api/ai-proxy`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ provider, model, messages, temperature, maxTokens }) });
          if (!r.ok) throw new Error(`${provider} ${model} ${r.status}`);
          return r.json();
        };
        const logs:any[] = [];
        // 1) OpenAI draft
        const sys1 = 'You output ONLY compact JSON. No prose. No markdown. Return strictly {"sections":[{"id":"...","title":"...","html":"..."}]} in French.';
        const usr1 = (prompts?.openai||'').trim().length>0
          ? `${prompts.openai}\n\nRappel: retourne UNIQUEMENT le JSON strict {"sections":[{"id":"...","title":"...","html":"..."}]}`
          : `Sujet: ${topic}\nOutline: ${outline}\nLocked: ${JSON.stringify(locked).slice(0,1000)}\nEditable: ${JSON.stringify(editable).slice(0,2000)}\nLivrable JSON strict: {"sections":[{"id":"...","title":"...","html":"..."}]}`;
        const draftProvider = providers.draft || 'openai';
        const draftModel = (models.draft || (models as any).openai || 'gpt-5');
        const openai = await callAI(draftProvider, draftModel, [ {role:'system', content: sys1}, {role:'user', content: usr1} ]).catch(e=>({ error:String(e)}));
        logs.push({ step:'draft', summary: openai?.usage || null, model: draftModel, provider: draftProvider });
        const draftTextRaw = (openai?.content || openai?.choices?.[0]?.message?.content || '').trim();
        const draftText = stripFences(draftTextRaw);
        // 2) Claude review (must return JSON sections)
        const sys2 = 'You output ONLY compact JSON. No prose. No markdown. Improve clarity/consistency; preserve structure and locks; return strictly {"sections":[{"id":"...","title":"...","html":"..."}],"notes":["..."]} in French.';
        const usr2 = (prompts?.anthropic||'').trim().length>0
          ? `${prompts.anthropic.replace('{draft}', draftText)}\n\nRappel: retourne UNIQUEMENT le JSON strict {"sections":[{"id":"...","title":"...","html":"..."}],"notes":["..."]}`
          : `Review and improve these sections JSON. Keep locked untouched. Return {"sections":[{"id":"...","html":"..."}],"notes":["..."]}.\n\n${draftText}`;
        const reviewProvider = providers.review || 'anthropic';
        const anthropicModel = (models.review || (models as any).anthropic || 'claude-sonnet-4-5-20250514');
        const claude = await callAI(reviewProvider, anthropicModel, [ {role:'system', content: sys2}, {role:'user', content: usr2} ]).catch(e=>({ error:String(e)}));
        logs.push({ step:'review', summary: claude?.usage || null, model: anthropicModel, provider: reviewProvider });
        const reviewTextRaw = (claude?.content || '').trim() || draftText;
        const reviewText = stripFences(reviewTextRaw);
        let reviewJson: any = null;
        try { reviewJson = JSON.parse(reviewText); } catch {}
        let reviewOut = '';
        if (reviewJson && Array.isArray(reviewJson.sections)) {
          reviewOut = JSON.stringify(reviewJson);
        } else {
          // no fallback content; return empty to let frontend show strict error
          reviewOut = '';
        }
        // 3) Optional scoring (no provider forced by default)
        const sys3 = 'You output ONLY compact JSON. No prose. No markdown.';
        const usr3 = (prompts?.perplexity||'').trim().length>0
          ? `${prompts.perplexity.replace('{article}', reviewOut || reviewText)}`
          : `Compute SEO/GEO (0..100) + strengths/weaknesses/fixes. Return {"scores":{"seo":0,"geo":0},"strengths":[],"weaknesses":[],"fixes":[]} for article sections JSON:\n${reviewOut || reviewText}`;
        const scoreProvider = (providers?.score || '').trim();
        const scoreModel = (models?.score || (scoreProvider ? (models as any)?.[scoreProvider] : '') || '').trim();
        let scoreObj: any = null;
        if (scoreProvider && scoreModel) {
          const scoreRes = await callAI(scoreProvider, scoreModel, [ {role:'system', content: sys3}, {role:'user', content: usr3} ], 0.2, 800).catch(e=>({ error:String(e)}));
          logs.push({ step:'score', summary: scoreRes?.usage || null, model: scoreModel, provider: scoreProvider });
          try { const t = stripFences((scoreRes?.content||'').trim()); scoreObj = JSON.parse(t); } catch {}
        } else {
          logs.push({ step:'score', skipped: true, reason: 'No score provider/model selected' });
        }
        return res.json({ logs, draft: draftText, review: reviewOut, feedback: { openai: 'Draft généré', claude: (reviewJson?.notes||[]), perplexity: scoreObj } });
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
      if (action === 'save_template_html') {
        const { html, title } = req.body || {};
        const id = Date.now().toString();
        const path = `geo/templates/generated_${id}.html`;
        await put('agents', path, String(html||''), 'text/html');
        // update templates index
        const idxPath = 'geo/templates/index.json';
        const idx = (await getJSON<any>('agents', idxPath)) || { items: [] };
        idx.items.unshift({ id, title: title || 'Article', path, createdAt: new Date().toISOString() });
        await put('agents', idxPath, JSON.stringify(idx, null, 2));
        return res.json({ ok: true, id, path });
      }

      // ===== KNOWLEDGE BASE: Upload & Analyze Documents =====

      if (action === 'upload_document') {
        const { content, fileName, fileType, tags = [] } = req.body || {};
        if (!content || !fileName) {
          return res.status(400).json({ error: 'content and fileName are required' });
        }

        const id = Date.now().toString();
        const base = process.env.SITE_URL || (process.env.VERCEL_URL ? (process.env.VERCEL_URL.startsWith('http') ? process.env.VERCEL_URL : `https://${process.env.VERCEL_URL}`) : '');

        // Call AI to extract queries, entities, pain points from document
        const callAI = async (provider:string, model:string, messages:any, temperature=0.3, maxTokens=2000) => {
          const r = await fetch(`${base}/api/ai-proxy`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ provider, model, messages, temperature, maxTokens }) });
          if (!r.ok) throw new Error(`${provider} ${model} ${r.status}`);
          return r.json();
        };

        const systemPrompt = `Tu es un expert en analyse de contenu. Analyse ce document et extrait:
1. Les questions explicites et implicites (queries)
2. Les entités clés (personnes, entreprises, concepts, technologies)
3. Les pain points / problématiques mentionnées
4. Les données chiffrées avec leurs sources
5. Les tags/thèmes principaux

Retourne UNIQUEMENT un JSON valide avec cette structure:
{
  "queries": ["question 1", "question 2", ...],
  "entities": ["entité 1", "entité 2", ...],
  "painPoints": ["problème 1", "problème 2", ...],
  "stats": [{"key": "métrique", "value": "valeur", "source": "source"}],
  "tags": ["tag1", "tag2", ...],
  "summary": "résumé en 2-3 phrases"
}`;

        const userPrompt = `Analyse ce document:\n\nNom: ${fileName}\nType: ${fileType}\n\nContenu:\n${content.slice(0, 15000)}`;

        try {
          const aiResponse = await callAI('openai', 'gpt-5', [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ], 0.3, 2000);

          const responseText = stripFences((aiResponse?.content || '').trim());
          let extracted = { queries: [], entities: [], painPoints: [], stats: [], tags: [], summary: '' };

          try {
            extracted = JSON.parse(responseText);
          } catch {
            // If JSON parsing fails, try to extract what we can
            extracted.summary = responseText.slice(0, 500);
          }

          // Merge provided tags with extracted tags
          const allTags = [...new Set([...tags, ...(extracted.tags || [])])];

          // Save document to knowledge base
          const document = {
            id,
            fileName,
            fileType,
            content: content.slice(0, 50000), // Limit stored content
            extracted: {
              ...extracted,
              tags: allTags
            },
            status: 'processed',
            createdAt: new Date().toISOString()
          };

          await put('agents', `geo/knowledge/documents/${id}.json`, JSON.stringify(document, null, 2));

          // Update documents index
          const idxPath = 'geo/knowledge/documents/index.json';
          const idx = (await getJSON<any>('agents', idxPath)) || { items: [] };
          idx.items.unshift({
            id,
            fileName,
            fileType,
            tags: allTags,
            queriesCount: extracted.queries?.length || 0,
            status: 'processed',
            createdAt: document.createdAt
          });
          await put('agents', idxPath, JSON.stringify(idx, null, 2));

          return res.json({
            ok: true,
            id,
            status: 'processed',
            extracted: {
              queries: extracted.queries || [],
              entities: extracted.entities || [],
              painPoints: extracted.painPoints || [],
              stats: extracted.stats || [],
              tags: allTags,
              summary: extracted.summary || ''
            }
          });
        } catch (e: any) {
          // Save document with error status
          const document = {
            id,
            fileName,
            fileType,
            content: content.slice(0, 50000),
            extracted: null,
            status: 'error',
            error: e?.message || 'Analysis failed',
            createdAt: new Date().toISOString()
          };

          await put('agents', `geo/knowledge/documents/${id}.json`, JSON.stringify(document, null, 2));

          return res.status(500).json({ error: e?.message || 'Document analysis failed', id });
        }
      }

      if (action === 'list_documents') {
        const idx = await getJSON('agents', 'geo/knowledge/documents/index.json') || { items: [] };
        return res.json(idx);
      }

      if (action === 'get_document') {
        const { documentId } = req.body || {};
        if (!documentId) return res.status(400).json({ error: 'documentId required' });

        const doc = await getJSON('agents', `geo/knowledge/documents/${documentId}.json`);
        if (!doc) return res.status(404).json({ error: 'Document not found' });

        return res.json(doc);
      }

      if (action === 'delete_document') {
        const { documentId } = req.body || {};
        if (!documentId) return res.status(400).json({ error: 'documentId required' });

        // Remove from index
        const idxPath = 'geo/knowledge/documents/index.json';
        const idx = (await getJSON<any>('agents', idxPath)) || { items: [] };
        idx.items = idx.items.filter((item: any) => item.id !== documentId);
        await put('agents', idxPath, JSON.stringify(idx, null, 2));

        // Note: Supabase storage doesn't have a simple delete, we just remove from index
        return res.json({ ok: true });
      }

      if (action === 'extract_queries') {
        const { documentId, text } = req.body || {};

        let content = text;
        if (!content && documentId) {
          const doc = await getJSON<any>('agents', `geo/knowledge/documents/${documentId}.json`);
          if (doc) content = doc.content;
        }

        if (!content) return res.status(400).json({ error: 'text or documentId required' });

        const base = process.env.SITE_URL || (process.env.VERCEL_URL ? (process.env.VERCEL_URL.startsWith('http') ? process.env.VERCEL_URL : `https://${process.env.VERCEL_URL}`) : '');

        const callAI = async (provider:string, model:string, messages:any, temperature=0.3, maxTokens=2000) => {
          const r = await fetch(`${base}/api/ai-proxy`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ provider, model, messages, temperature, maxTokens }) });
          if (!r.ok) throw new Error(`${provider} ${model} ${r.status}`);
          return r.json();
        };

        const systemPrompt = `Tu es un expert en analyse de contenu et SEO. Analyse ce texte et extrait les requêtes/questions que les utilisateurs pourraient poser.

Regroupe les requêtes en clusters thématiques et classifie chaque cluster par:
- Intent: informational, howto, comparison, transactional
- Personas cibles: ESN, DAF, Executive, Developer, Marketing, etc.
- Priorité: high, medium, low (basée sur la pertinence et le potentiel)

Retourne UNIQUEMENT un JSON valide:
{
  "clusters": [
    {
      "id": "cluster-1",
      "theme": "Nom du thème",
      "queries": ["requête 1", "requête 2", ...],
      "intent": "informational",
      "personas": ["ESN", "Executive"],
      "priority": "high",
      "volumeEstimate": 1000
    }
  ]
}`;

        const userPrompt = `Extrait les requêtes de ce texte:\n\n${content.slice(0, 12000)}`;

        try {
          const aiResponse = await callAI('openai', 'gpt-5', [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ], 0.4, 2000);

          const responseText = stripFences((aiResponse?.content || '').trim());
          let result = { clusters: [] };

          try {
            result = JSON.parse(responseText);
          } catch {}

          // Save clusters to knowledge base
          if (result.clusters && result.clusters.length > 0) {
            const clustersPath = 'geo/knowledge/queries/clusters.json';
            const existing = (await getJSON<any>('agents', clustersPath)) || { clusters: [] };

            // Merge new clusters with existing (avoid duplicates by theme)
            const existingThemes = new Set(existing.clusters.map((c: any) => c.theme));
            const newClusters = result.clusters.filter((c: any) => !existingThemes.has(c.theme));
            existing.clusters = [...newClusters, ...existing.clusters];
            existing.updatedAt = new Date().toISOString();

            await put('agents', clustersPath, JSON.stringify(existing, null, 2));
          }

          return res.json(result);
        } catch (e: any) {
          return res.status(500).json({ error: e?.message || 'Query extraction failed' });
        }
      }

      if (action === 'list_query_clusters') {
        const clusters = await getJSON('agents', 'geo/knowledge/queries/clusters.json') || { clusters: [] };
        return res.json(clusters);
      }

      return res.status(400).json({ error: 'Unknown action' });
    }
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (e:any) {
    return res.status(500).json({ error: e?.message || 'Server error' });
  }
}


