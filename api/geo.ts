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

  // 🔧 FIX: Utiliser Buffer (Node.js) ou TextEncoder (Edge) au lieu de Blob
  // Cela évite la troncation avec les caractères UTF-8 et gros contenus
  const bytes = typeof Buffer !== 'undefined'
    ? Buffer.from(text, 'utf-8')  // Node.js runtime
    : new TextEncoder().encode(text);  // Edge runtime

  const byteLength = bytes.byteLength || bytes.length;
  console.log(`📤 Uploading ${path}: ${text.length} chars → ${byteLength} bytes`);

  const { data, error } = await sb.storage.from(bucket).upload(path, bytes, {
    upsert: true,
    contentType,
    cacheControl: '3600'
  });

  if (error) throw new Error(`Storage upload failed: ${error.message}`);

  console.log(`✅ Upload successful: ${path} (${byteLength} bytes)`);
  return data;
}
async function getJSON<T=any>(bucket: string, path: string): Promise<T|null> {
  const sb = getSupabase();
  const { data, error } = await sb.storage.from(bucket).download(path);
  if (error) throw new Error(`Storage download failed: ${error.message}`);
  if (!data) return null;
  const txt = await (data as any).text();
  try { return JSON.parse(txt); } catch (e: any) {
    throw new Error(`JSON parse failed for ${path}: ${e.message}`);
  }
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

function generateHTMLFromSections(sections: any[], jobId: string): string {
  // Compter les mots
  let totalWords = 0;
  sections.forEach((s: any) => {
    const text = (s.html || '').replace(/<[^>]*>/g, '');
    const words = text.split(/\s+/).filter((w: string) => w.length > 0);
    totalWords += words.length;
  });

  const generatedAt = new Date().toISOString();

  return `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="generated-at" content="${generatedAt}">
    <title>Article Complet - ${sections[0]?.title || 'Article GEO/SEO'}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
            max-width: 900px;
            margin: 40px auto;
            padding: 0 20px;
            line-height: 1.7;
            background: #f5f5f5;
            color: #333;
        }
        .container {
            background: white;
            padding: 40px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .meta {
            background: #e8f5e9;
            padding: 20px;
            border-left: 4px solid #4caf50;
            margin: 30px 0;
            border-radius: 4px;
        }
        h1 {
            color: #1a237e;
            font-size: 2.2em;
            margin-bottom: 20px;
            border-bottom: 3px solid #3f51b5;
            padding-bottom: 15px;
        }
        h2 {
            color: #283593;
            font-size: 1.8em;
            margin-top: 50px;
            margin-bottom: 20px;
            border-bottom: 2px solid #7986cb;
            padding-bottom: 10px;
        }
        h3 {
            color: #5c6bc0;
            font-size: 1.4em;
            margin-top: 30px;
        }
        h4 {
            color: #7986cb;
            font-size: 1.1em;
            margin-top: 20px;
        }
        a {
            color: #1976d2;
            text-decoration: none;
        }
        a:hover {
            text-decoration: underline;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        table th {
            background: #3f51b5;
            color: white;
            padding: 12px;
            text-align: left;
        }
        table td {
            padding: 10px;
            border: 1px solid #ddd;
        }
        table tr:nth-child(even) {
            background: #f5f5f5;
        }
        .key-points {
            background: #fff3e0;
            border-left: 4px solid #ff9800;
            padding: 15px 20px;
            margin: 20px 0;
            border-radius: 4px;
        }
        .case-study {
            background: #e3f2fd;
            border-left: 4px solid #2196f3;
            padding: 15px 20px;
            margin: 20px 0;
            border-radius: 4px;
        }
        .tip-box {
            background: #f1f8e9;
            border-left: 4px solid #8bc34a;
            padding: 15px 20px;
            margin: 20px 0;
            border-radius: 4px;
        }
        .warning-box {
            background: #ffebee;
            border-left: 4px solid #f44336;
            padding: 15px 20px;
            margin: 20px 0;
            border-radius: 4px;
        }
        .cta-box {
            background: #fff8e1;
            border: 2px solid #ffc107;
            padding: 20px;
            margin: 30px 0;
            border-radius: 8px;
            text-align: center;
        }
        ul, ol {
            margin: 15px 0;
            padding-left: 30px;
        }
        li {
            margin: 8px 0;
        }
        p {
            margin: 15px 0;
        }
        strong {
            color: #d32f2f;
            font-weight: 600;
        }
    </style>
</head>
<body>

<div class="container">

<div class="meta">
    <strong>✅ ARTICLE COMPLET GÉNÉRÉ EN 2 PARTIES - GPT-5.1</strong><br>
    Job ID: ${jobId}<br>
    Sections: ${sections.length}<br>
    Mots: ~${totalWords}<br>
    Généré le: ${new Date(generatedAt).toLocaleString('fr-FR')}<br>
    <strong style="color: #4caf50;">✓ GÉNÉRATION DIRECTE HTML - SANS TRONCATION!</strong>
</div>

${sections.map((section: any, i: number) => {
  return `\n<!-- ========== SECTION ${i + 1}: ${section.title || section.id} ========== -->\n${section.html}`;
}).join('\n\n')}

<div class="meta">
    <strong>📋 TABLE DES MATIÈRES:</strong>
    <ol style="margin: 10px 0 0 20px;">
${sections.map((s: any) => `        <li>${s.title || s.id}</li>`).join('\n')}
    </ol>
</div>

</div>

</body>
</html>`;
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
        const { topic = 'Sujet', locked = [], editable = [], outline = 'H1/H2/H3', models = {}, providers = {}, prompts = {}, minScore = 95, maxIterations = 3 } = req.body || {};
        const base = process.env.SITE_URL || (process.env.VERCEL_URL ? (process.env.VERCEL_URL.startsWith('http') ? process.env.VERCEL_URL : `https://${process.env.VERCEL_URL}`) : '');
        const callAI = async (provider:string, model:string, messages:any, temperature=0.3, maxTokens=4000) => {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s timeout per call
          try {
            const r = await fetch(`${base}/api/ai-proxy`, {
              method:'POST',
              headers:{'Content-Type':'application/json'},
              body: JSON.stringify({ provider, model, messages, temperature, maxTokens }),
              signal: controller.signal
            });
            clearTimeout(timeoutId);
            if (!r.ok) throw new Error(`${provider} ${model} ${r.status}`);
            return r.json();
          } catch (e: any) {
            clearTimeout(timeoutId);
            throw e;
          }
        };

        const logs:any[] = [];
        const draftProvider = providers.draft || 'openai';
        const draftModel = (models.draft || (models as any).openai || 'gpt-5.1');
        const reviewProvider = providers.review || 'anthropic';
        const anthropicModel = (models.review || (models as any).anthropic || 'claude-sonnet-4-5-20250929');
        const scoreProvider = providers?.score || 'perplexity';
        const scoreModel = models?.score || (models as any)?.perplexity || 'sonar';

        // ===== PHASE 0: AGENT RECHERCHE (Perplexity) - Veille approfondie =====
        const researchSys = `Tu es un agent de veille et de collecte d'informations pour contenu GEO/SEO.
Ta mission : rechercher les meilleures sources web sur le sujet demandé, ainsi que des thèmes connexes stratégiques.
Fournis une liste de liens externes, articles, études, rapports, documents, et bases de données fiables (.org, .edu, .gov, grandes marques, leaders du secteur).

Pour chaque lien, indique le titre, résumé, pertinence pour le sujet, date ou fraîcheur, et tout chiffre ou donnée clé à extraire.

Retourne UNIQUEMENT un JSON valide:
{
  "articles": [{"url": "...", "title": "...", "summary": "...", "authority": "high/medium/low", "date": "..."}],
  "stats": [{"metric": "...", "value": "...", "source": "...", "url": "...", "year": "..."}],
  "experts": [{"name": "...", "title": "...", "quote": "...", "source": "...", "url": "..."}],
  "keywords": ["mot-clé 1", "mot-clé 2", ...],
  "trends": ["tendance 1", "tendance 2", ...],
  "officialSources": [{"name": "...", "url": "...", "type": "..."}]
}`;

        const researchUsr = `Recherche approfondie sur "${topic}".
Retourne :
- 10 à 15 liens externes de haute autorité
- Titres, résumés, pertinence, date
- Chiffres/statistiques clés avec sources
- Experts reconnus avec citations
- Propose aussi des angles connexes utiles
Privilégie les données récentes (2023-2025) et sources françaises/internationales.`;

        const researchRes = await callAI('perplexity', 'sonar', [ {role:'system', content: researchSys}, {role:'user', content: researchUsr} ], 0.3, 2500).catch(e=>({ error:String(e)}));
        logs.push({ step:'research', iteration: 0, summary: researchRes?.usage || null, model: 'sonar', provider: 'perplexity' });

        let research: any = { articles: [], stats: [], experts: [], keywords: [], trends: [], officialSources: [] };
        try {
          const researchText = stripFences((researchRes?.content || '').trim());
          research = JSON.parse(researchText);
        } catch {}

        // ===== PHASE 1: AGENT WRITER (GPT-5.1) - Rédaction avec contexte enrichi =====
        const sys1 = 'You output ONLY compact JSON. No prose. No markdown. Return strictly {"sections":[{"id":"...","title":"...","html":"..."}]} in French.';
        const usr1 = `Tu es un expert GEO & SEO. Rédige un article LONG (minimum 2000 mots) structuré style Neil Patel.

Sujet: ${topic}
Outline: ${outline}

CONTEXTE DE RECHERCHE (utilise ces informations):
- Articles de référence: ${JSON.stringify(research.articles || []).slice(0, 2500)}
- Statistiques avec sources: ${JSON.stringify(research.stats || []).slice(0, 2000)}
- Experts et citations: ${JSON.stringify(research.experts || []).slice(0, 1500)}
- Mots-clés importants: ${(research.keywords || []).join(', ')}
- Tendances: ${(research.trends || []).join(', ')}
- Sources officielles: ${JSON.stringify(research.officialSources || []).slice(0, 1500)}

INSTRUCTIONS OBLIGATOIRES:
- Article de 2000+ mots minimum, contenu substantiel
- 1 lien externe minimum tous les 200 mots (balise <a href="..." target="_blank">)
- Chaque chiffre/stat DOIT être sourcé avec hyperlien
- Meta title & description optimisés avec mots-clés
- Structure H1/H2/H3 hiérarchique claire
- Tableaux comparatifs, listes à puces détaillées
- Section FAQ avec 5+ questions et schema JSON-LD FAQPage
- 2 CTA engageants minimum
- Liens internes vers contenus connexes
- Schema.org Article, BreadcrumbList
- Cite les experts avec credentials et sources

JSON final : {"sections":[{"id":"...","title":"...","html":"..."}]}`;

        const openai = await callAI(draftProvider, draftModel, [ {role:'system', content: sys1}, {role:'user', content: usr1} ]).catch(e=>({ error:String(e)}));
        logs.push({ step:'draft', iteration: 0, summary: openai?.usage || null, model: draftModel, provider: draftProvider });

        let currentArticle = stripFences((openai?.content || '').trim());
        let bestArticle = currentArticle;
        let bestScore = 0;
        let iteration = 0;
        let finalScore: any = null;
        let allNotes: string[] = [];

        // ===== BOUCLE ITÉRATIVE =====
        while (iteration < maxIterations) {
          iteration++;

          // ===== PHASE 2: AGENT REVIEW (Claude) - Révision SEO/GEO =====
          const sys2 = `You output ONLY compact JSON. No prose. No markdown.
Tu es un expert SEO/GEO. Améliore cet article pour atteindre un score SEO et GEO de 95+/100.
Applique ces optimisations:
- Vérifie que les mots-clés sont bien intégrés
- Optimise la structure H1/H2/H3
- Améliore les listes et tableaux
- Vérifie la présence de données chiffrées sourcées
- Optimise les liens internes et externes
- Améliore la section FAQ
- Renforce les CTA
- Optimise la lisibilité
Return strictly {"sections":[{"id":"...","title":"...","html":"..."}],"notes":["..."]} in French.`;

          const usr2 = `Article à améliorer:\n\n${currentArticle}\n\nRappel: retourne UNIQUEMENT le JSON strict`;

          const claude = await callAI(reviewProvider, anthropicModel, [ {role:'system', content: sys2}, {role:'user', content: usr2} ]).catch(e=>({ error:String(e)}));
          logs.push({ step:'review', iteration, summary: claude?.usage || null, model: anthropicModel, provider: reviewProvider });

          const reviewTextRaw = (claude?.content || '').trim() || currentArticle;
          const reviewText = stripFences(reviewTextRaw);
          let reviewJson: any = null;
          try { reviewJson = JSON.parse(reviewText); } catch {}

          if (reviewJson && Array.isArray(reviewJson.sections)) {
            currentArticle = JSON.stringify(reviewJson);
            if (reviewJson.notes) allNotes = [...allNotes, ...reviewJson.notes];
          }

          // ===== PHASE 3: AGENT ENRICHISSEMENT (Perplexity) - Liens et sources =====
          const enrichSys = `Tu es un agent d'enrichissement SEO/GEO. Recherche sur le web pour trouver:
1. Des liens externes de haute autorité à ajouter
2. Des données chiffrées récentes avec sources vérifiables
3. Des backlinks potentiels (sites qui pourraient linker cet article)
4. Des références académiques ou officielles

Retourne UNIQUEMENT un JSON valide:
{
  "externalLinks": [{"url": "...", "anchorText": "...", "context": "où l'insérer dans l'article"}],
  "newStats": [{"metric": "...", "value": "...", "source": "...", "url": "..."}],
  "citations": [{"text": "...", "source": "...", "url": "..."}],
  "improvements": ["amélioration 1", "amélioration 2", ...]
}`;

          const enrichUsr = `Enrichis cet article avec des liens externes et sources vérifiables:

Sujet: ${topic}
Article actuel (résumé): ${currentArticle.slice(0, 3000)}

Trouve des sources de haute autorité (sites officiels, études, experts reconnus).`;

          const enrichRes = await callAI('perplexity', 'sonar', [ {role:'system', content: enrichSys}, {role:'user', content: enrichUsr} ], 0.3, 1500).catch(e=>({ error:String(e)}));
          logs.push({ step:'enrich', iteration, summary: enrichRes?.usage || null, model: 'sonar', provider: 'perplexity' });

          let enrichment: any = { externalLinks: [], newStats: [], citations: [], improvements: [] };
          try {
            const enrichText = stripFences((enrichRes?.content || '').trim());
            enrichment = JSON.parse(enrichText);
          } catch {}

          // ===== PHASE 4: AGENT SCORE (Perplexity) - Scoring détaillé =====
          const sys3 = 'You output ONLY compact JSON. No prose. No markdown.';
          const usr3 = `Tu es l'agent Score GEO/SEO expert. Évalue cet article sur 100 points.

CRITÈRES SEO (50 points):
- Structure H1/H2/H3 (10 pts)
- Mots-clés et sémantique (10 pts)
- Meta title/description (5 pts)
- Liens externes de qualité (10 pts)
- Lisibilité et UX (5 pts)
- Données structurées schema.org (10 pts)

CRITÈRES GEO (50 points):
- Sources citées avec URLs vérifiables (15 pts)
- Données chiffrées avec références (10 pts)
- Fraîcheur du contenu (5 pts)
- Autorité et expertise démontrée (10 pts)
- Traçabilité des informations (10 pts)

Retourne:
{
  "scores": {"seo": 0, "geo": 0, "total": 0},
  "breakdown": {
    "seo": {"structure": 0, "keywords": 0, "meta": 0, "links": 0, "readability": 0, "schema": 0},
    "geo": {"sources": 0, "stats": 0, "freshness": 0, "authority": 0, "traceability": 0}
  },
  "strengths": [],
  "weaknesses": [],
  "fixes": []
}

Article à évaluer:\n${currentArticle.slice(0, 8000)}`;

          const scoreRes = await callAI(scoreProvider, scoreModel, [ {role:'system', content: sys3}, {role:'user', content: usr3} ], 0.2, 1200).catch(e=>({ error:String(e)}));
          logs.push({ step:'score', iteration, summary: scoreRes?.usage || null, model: scoreModel, provider: scoreProvider });

          try {
            const t = stripFences((scoreRes?.content||'').trim());
            finalScore = JSON.parse(t);
          } catch {}

          const seoScore = finalScore?.scores?.seo || 0;
          const geoScore = finalScore?.scores?.geo || 0;
          const totalScore = seoScore + geoScore;

          // Conserver la meilleure version pour éviter la régression
          if (totalScore > bestScore) {
            bestScore = totalScore;
            bestArticle = currentArticle;
          }

          logs.push({ step:'check', iteration, seo: seoScore, geo: geoScore, total: totalScore, bestScore, target: minScore, passed: seoScore >= minScore && geoScore >= minScore });

          if (seoScore >= minScore && geoScore >= minScore) {
            break; // Target reached!
          }

          // ===== PHASE 5: AGENT WRITER REWRITE (GPT-5.1) - Réécriture avec enrichissements =====
          if (iteration < maxIterations) {
            const sys4 = 'You output ONLY compact JSON. No prose. No markdown. Return strictly {"sections":[{"id":"...","title":"...","html":"..."}]} in French.';
            const usr4 = `Tu es un rédacteur SEO/GEO expert. Réécris cet article pour atteindre 95% SEO/GEO.

Article actuel:
${currentArticle}

Score actuel: SEO ${seoScore}/100, GEO ${geoScore}/100

ENRICHISSEMENTS À INTÉGRER (de Perplexity):
- Liens externes: ${JSON.stringify(enrichment.externalLinks || []).slice(0, 1500)}
- Nouvelles stats: ${JSON.stringify(enrichment.newStats || []).slice(0, 1000)}
- Citations: ${JSON.stringify(enrichment.citations || []).slice(0, 1000)}
- Améliorations suggérées: ${(enrichment.improvements || []).join(', ')}

Faiblesses à corriger:
${(finalScore?.weaknesses || []).join('\n- ')}

Corrections demandées:
${(finalScore?.fixes || []).join('\n- ')}

IMPORTANT: Intègre TOUS les liens externes, stats et citations fournis. Ajoute les URLs dans des balises <a href="...">.
Retourne UNIQUEMENT le JSON strict {"sections":[{"id":"...","title":"...","html":"..."}]}`;

            const rewrite = await callAI(draftProvider, draftModel, [ {role:'system', content: sys4}, {role:'user', content: usr4} ]).catch(e=>({ error:String(e)}));
            logs.push({ step:'rewrite', iteration, summary: rewrite?.usage || null, model: draftModel, provider: draftProvider });

            const rewriteText = stripFences((rewrite?.content || '').trim());
            if (rewriteText) {
              currentArticle = rewriteText;
            }
          }
        }

        // Retourner la meilleure version (pas la dernière si régression)
        const finalArticle = bestScore > (finalScore?.scores?.seo || 0) + (finalScore?.scores?.geo || 0) ? bestArticle : currentArticle;

        return res.json({
          logs,
          draft: finalArticle,
          review: finalArticle,
          iterations: iteration,
          finalScores: finalScore?.scores || { seo: 0, geo: 0 },
          bestScore,
          breakdown: finalScore?.breakdown || null,
          research: {
            articles: research.articles?.length || 0,
            stats: research.stats?.length || 0,
            keywords: research.keywords || [],
            experts: research.experts?.length || 0
          },
          feedback: {
            openai: `Article généré en ${iteration} itération(s) - Meilleur score: ${bestScore}`,
            claude: allNotes,
            perplexity: finalScore
          }
        });
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
          const aiResponse = await callAI('openai', 'gpt-5.1', [
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
          const aiResponse = await callAI('openai', 'gpt-5.1', [
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

      // ===== WORKFLOW ASYNCHRONE ÉTAPE PAR ÉTAPE =====

      if (action === 'workflow_start') {
        const { topic, outline, minScore = 95, maxIterations = 5 } = req.body || {};
        if (!topic) return res.status(400).json({ error: 'topic required' });

        const jobId = `job_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
        const job = {
          id: jobId,
          topic,
          outline: outline || 'H1/H2/H3',
          minScore,
          maxIterations,
          currentStep: 'research',
          iteration: 0,
          status: 'pending',
          article: '',
          bestArticle: '',
          bestScore: 0,
          research: null,
          enrichment: null,
          scores: [],
          logs: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        await put('agents', `geo/jobs/${jobId}.json`, JSON.stringify(job, null, 2));
        return res.json({ ok: true, jobId, status: 'pending', nextStep: 'research' });
      }

      if (action === 'workflow_step') {
        const { jobId } = req.body || {};
        if (!jobId) return res.status(400).json({ error: 'jobId required' });

        const job = await getJSON<any>('agents', `geo/jobs/${jobId}.json`);
        if (!job) return res.status(404).json({ error: 'Job not found' });

        const base = process.env.SITE_URL || (process.env.VERCEL_URL ? (process.env.VERCEL_URL.startsWith('http') ? process.env.VERCEL_URL : `https://${process.env.VERCEL_URL}`) : '');
        const callAI = async (provider:string, model:string, messages:any, temperature=0.3, maxTokens=2000) => {
          const r = await fetch(`${base}/api/ai-proxy`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ provider, model, messages, temperature, maxTokens }) });
          if (!r.ok) throw new Error(`${provider} ${model} ${r.status}`);
          return r.json();
        };

        const step = job.currentStep;
        let nextStep = '';
        let completed = false;

        try {
          // ===== STEP: RESEARCH =====
          if (step === 'research') {
            const researchSys = `Tu es un agent de veille et de collecte d'informations pour contenu GEO/SEO.
Fournis une liste de liens externes, articles, études, rapports fiables.
Retourne UNIQUEMENT un JSON valide:
{
  "articles": [{"url": "...", "title": "...", "summary": "...", "authority": "high/medium/low"}],
  "stats": [{"metric": "...", "value": "...", "source": "...", "url": "..."}],
  "experts": [{"name": "...", "title": "...", "quote": "...", "url": "..."}],
  "keywords": [],
  "officialSources": [{"name": "...", "url": "..."}]
}`;
            const researchUsr = `Recherche approfondie sur "${job.topic}". Trouve 10-15 liens externes de haute autorité, chiffres avec sources, experts.`;

            const res = await callAI('perplexity', 'sonar', [{role:'system', content: researchSys}, {role:'user', content: researchUsr}], 0.3, 1500);
            job.logs.push({ step: 'research', usage: res?.usage, timestamp: new Date().toISOString() });

            try {
              job.research = JSON.parse(stripFences((res?.content || '').trim()));
            } catch { job.research = { articles: [], stats: [], experts: [], keywords: [] }; }

            nextStep = 'draft_part1';
          }

          // ===== STEP: DRAFT PART 1 (H1 + intro + 3 premières sections H2) =====
          else if (step === 'draft_part1') {
            const outlineParts = (job.outline || '').split('|').map(s => s.trim());
            const firstSections = outlineParts.slice(0, 4); // H1 + 3 premiers H2

            const sys1 = 'You output ONLY compact JSON. Return strictly {"sections":[{"id":"...","title":"...","html":"..."}]} in French.';
            const usr1 = `Tu es un expert GEO & SEO, spécialiste Neil Patel.
Rédige la PREMIÈRE PARTIE d'un article long (2500-3000 mots pour cette partie).

SUJET: ${job.topic}
SECTIONS À TRAITER: ${firstSections.join(' | ')}
CONTEXTE: ${JSON.stringify(job.research || {}).slice(0, 6000)}

STRUCTURE OBLIGATOIRE:
1. H1 titre SEO + intro 100-150 mots (hook, promise, valeur)
2. 3 premières sections H2 complètes (800-1000 mots CHACUNE)

Chaque H2:
- Angle: Pain point → Résolution → Tips
- H3 pour structurer
- Paragraphes courts (2-4 lignes)
- Tableaux HTML <table> si pertinent
- Encadrés: <div class="tip-box"><strong>💡 Astuce:</strong>...</div>
- Encadrés: <div class="key-points"><h4>✅ Points clés:</h4><ul><li>...</li></ul></div>
- Liens externes fiables <a href="" target="_blank" rel="noopener">
- 1 lien tous les 150-200 mots
- Stats sourcées

Schema.org Article:
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"Article","headline":"${job.topic}","author":{"@type":"Person","name":"Expert"},"inLanguage":"fr"}
</script>

CTA milieu: <div class="cta-box"><strong>🎯 [Titre]:</strong> [Action]</div>`;

            const res = await callAI('openai', 'gpt-5.1', [{role:'system', content: sys1}, {role:'user', content: usr1}], 0.3, 8000);
            job.logs.push({ step: 'draft_part1', usage: res?.usage, timestamp: new Date().toISOString() });

            // 🔎 === DIAGNOSTIC LOGS - WHERE IS TRUNCATION? ===
            const rawContent = res?.content || '';
            console.log('🔎 === DIAGNOSTIC DRAFT_PART1 ===');
            console.log(`🔎 [0] finish_reason: ${res?.finish_reason || 'unknown'}`);
            console.log(`🔎 [0a] usage: ${JSON.stringify(res?.usage)}`);
            console.log(`🔎 [1] rawContent.length (from API): ${rawContent.length} chars`);
            console.log(`🔎 [2] First 200 chars of raw: ${rawContent.slice(0, 200)}`);
            console.log(`🔎 [3] Last 200 chars of raw: ${rawContent.slice(-200)}`);

            const part1Content = stripFences(rawContent.trim());
            console.log(`🔎 [4] part1Content.length (after stripFences): ${part1Content.length} chars`);
            console.log(`🔎 [5] First 100 chars: ${part1Content.slice(0, 100)}`);
            console.log(`🔎 [6] Last 100 chars: ${part1Content.slice(-100)}`);

            // Verify JSON validity BEFORE upload
            let jsonValid = false;
            try {
              JSON.parse(part1Content);
              jsonValid = true;
              console.log('🔎 [7] JSON valid BEFORE upload ✅');
            } catch (e: any) {
              console.log(`🔎 [7] JSON ALREADY INVALID BEFORE upload ❌: ${e.message}`);
              console.log(`🔎 [7a] Error position: ${e.message.match(/position (\d+)/)?.[1] || 'unknown'}`);
            }

            // 🆕 Sauvegarder Part 1 séparément dans geo/articles/
            try {
              console.log(`🔎 [8] Starting upload: ${part1Content.length} chars → put('agents', 'geo/articles/${jobId}_part1.json', ...)`);
              await put('agents', `geo/articles/${jobId}_part1.json`, part1Content);
              console.log(`🔎 [9] Upload completed successfully ✅`);
              job.articlePart1Ready = true;
            } catch (error: any) {
              console.error(`🔎 [10] Upload FAILED ❌: ${error.message}`);
              job.status = 'error';
              job.error = `Failed to save Part 1: ${error.message}`;
              throw error;
            }

            // Ne pas stocker dans job.article pour éviter la troncation
            job.article = null;
            nextStep = 'draft_part2';
          }

          // ===== STEP: DRAFT PART 2 (3 dernières sections + FAQ + Conclusion) =====
          else if (step === 'draft_part2') {
            const outlineParts = (job.outline || '').split('|').map(s => s.trim());
            const lastSections = outlineParts.slice(4); // Dernières sections

            const sys2 = 'You output ONLY compact JSON. Return strictly {"sections":[{"id":"...","title":"...","html":"..."}]} in French.';
            const usr2 = `Tu es un expert GEO & SEO, spécialiste Neil Patel.
Rédige la SECONDE PARTIE d'un article (2500-3000 mots pour cette partie).

SUJET: ${job.topic}
SECTIONS À TRAITER: ${lastSections.join(' | ')}
CONTEXTE: ${JSON.stringify(job.research || {}).slice(0, 6000)}

STRUCTURE OBLIGATOIRE:
1. ${lastSections.length} sections H2 complètes (800-1000 mots CHACUNE)
2. FAQ (3-5 Q/R) avec JSON-LD FAQPage
3. Conclusion-action (résumé, next steps)

Chaque H2:
- Angle: Pain point → Résolution → Tips
- H3 pour structurer
- Paragraphes courts (2-4 lignes)
- Tableaux HTML <table>
- Encadrés études de cas: <div class="case-study"><h4>📊 Étude de cas:</h4><p>...</p></div>
- Encadrés: <div class="key-points"><h4>✅ Points clés:</h4><ul><li>...</li></ul></div>
- Liens externes <a href="" target="_blank" rel="noopener">
- Stats sourcées

FAQ:
<h2>FAQ</h2>
[Questions/réponses]
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"FAQPage","mainEntity":[{"@type":"Question","name":"...","acceptedAnswer":{"@type":"Answer","text":"..."}}]}
</script>

CTA fin: <div class="cta-box"><strong>🎯 [Titre]:</strong> [Action]</div>`;

            const res2 = await callAI('openai', 'gpt-5.1', [{role:'system', content: sys2}, {role:'user', content: usr2}], 0.3, 8000);
            job.logs.push({ step: 'draft_part2', usage: res2?.usage, timestamp: new Date().toISOString() });

            console.log(`🔎 [draft_part2] finish_reason: ${res2?.finish_reason || 'unknown'}`);
            console.log(`🔎 [draft_part2] usage: ${JSON.stringify(res2?.usage)}`);

            const part2Content = stripFences((res2?.content || '').trim());
            console.log(`✅ Part 2 generated: ${part2Content.length} chars`);

            // 🆕 Sauvegarder Part 2 séparément
            try {
              await put('agents', `geo/articles/${jobId}_part2.json`, part2Content);
              console.log(`✅ Part 2 saved to geo/articles/${jobId}_part2.json`);
            } catch (error: any) {
              console.error(`❌ Failed to save Part 2:`, error.message);
              job.status = 'error';
              job.error = `Failed to save Part 2: ${error.message}`;
              throw error;
            }

            // 🆕 Lire Part 1 et fusionner
            let merged: any = null;
            let part1DataSize = 0;
            try {
              // getJSON returns already-parsed JSON
              const part1Data = await getJSON<any>('agents', `geo/articles/${jobId}_part1.json`);
              if (!part1Data) throw new Error('Part 1 not found');

              const part2Data = JSON.parse(part2Content);

              merged = {
                sections: [...(part1Data.sections || []), ...(part2Data.sections || [])]
              };

              part1DataSize = JSON.stringify(part1Data).length;
              console.log(`✅ Merged ${merged.sections.length} sections`);
            } catch (error: any) {
              console.error(`❌ Failed to merge parts:`, error.message);
              job.status = 'error';
              job.error = `Failed to merge parts: ${error.message}`;
              throw error;
            }

            // 🆕 Générer HTML immédiatement
            try {
              const html = generateHTMLFromSections(merged.sections, jobId);
              console.log(`✅ HTML generated: ${html.length} chars, ${merged.sections.length} sections`);

              // Sauvegarder HTML
              await put('agents', `geo/articles/${jobId}.html`, html, 'text/html');
              console.log(`✅ HTML saved to geo/articles/${jobId}.html`);

              // Mise à jour du job avec metadata uniquement
              job.htmlReady = true;
              job.htmlUrl = `https://storage.supabase.co/v1/object/public/agents/geo/articles/${jobId}.html`;
              job.sectionsCount = merged.sections.length;
              job.article = null; // Libérer la mémoire
              job.bestArticle = null;
              job.iteration = 1;

              // Ajouter verification
              job.verification = {
                part1Size: part1DataSize,
                part2Size: part2Content.length,
                htmlSize: html.length,
                sectionsCount: merged.sections.length,
                generatedAt: new Date().toISOString()
              };

              console.log(`✅ Verification:`, job.verification);

            } catch (error: any) {
              console.error(`❌ Failed to generate HTML:`, error.message);
              job.status = 'error';
              job.error = `Failed to generate HTML: ${error.message}`;
              job.htmlReady = false;
              throw error;
            }

            nextStep = 'review';
          }

          // ===== STEP: REVIEW =====
          else if (step === 'review') {
            const sys2 = `You output ONLY compact JSON. Améliore pour 95%+ SEO/GEO.
Return {"sections":[{"id":"...","title":"...","html":"..."}],"notes":[]} in French.`;
            const usr2 = `Article à améliorer:\n${job.article}\n\nGarde toutes les sections complètes et détaillées. Ne coupe rien.`;

            const res = await callAI('anthropic', 'claude-sonnet-4-5-20250929', [{role:'system', content: sys2}, {role:'user', content: usr2}], 0.3, 8000);
            job.logs.push({ step: 'review', iteration: job.iteration, usage: res?.usage, timestamp: new Date().toISOString() });

            const reviewText = stripFences((res?.content || '').trim());
            try {
              const reviewJson = JSON.parse(reviewText);
              if (reviewJson.sections) job.article = JSON.stringify(reviewJson);
            } catch {}

            nextStep = 'enrich';

            // Save article to separate file
            await put('agents', `geo/jobs/${jobId}_article.json`, job.article);
          }

          // ===== STEP: ENRICH =====
          else if (step === 'enrich') {
            const enrichSys = `Agent d'enrichissement SEO/GEO. Trouve liens externes, stats, citations.
Retourne JSON: {"externalLinks":[], "newStats":[], "citations":[], "improvements":[]}`;
            const enrichUsr = `Enrichis: ${job.topic}\nArticle: ${job.article.slice(0, 3000)}`;

            const res = await callAI('perplexity', 'sonar', [{role:'system', content: enrichSys}, {role:'user', content: enrichUsr}], 0.3, 1500);
            job.logs.push({ step: 'enrich', iteration: job.iteration, usage: res?.usage, timestamp: new Date().toISOString() });

            try {
              job.enrichment = JSON.parse(stripFences((res?.content || '').trim()));
            } catch { job.enrichment = { externalLinks: [], newStats: [], citations: [] }; }

            nextStep = 'score';
          }

          // ===== STEP: SCORE =====
          else if (step === 'score') {
            const sys3 = `Agent Score GEO/SEO. Évalue sur 100 points.
Retourne: {"scores":{"seo":0,"geo":0},"breakdown":{},"strengths":[],"weaknesses":[],"fixes":[]}`;
            const usr3 = `Évalue:\n${job.article.slice(0, 8000)}`;

            const res = await callAI('perplexity', 'sonar', [{role:'system', content: sys3}, {role:'user', content: usr3}], 0.2, 1200);
            job.logs.push({ step: 'score', iteration: job.iteration, usage: res?.usage, timestamp: new Date().toISOString() });

            let scoreObj: any = null;
            try { scoreObj = JSON.parse(stripFences((res?.content || '').trim())); } catch {}

            const seo = scoreObj?.scores?.seo || 0;
            const geo = scoreObj?.scores?.geo || 0;
            const total = seo + geo;

            job.scores.push({ iteration: job.iteration, seo, geo, total });

            if (total > job.bestScore) {
              job.bestScore = total;
              job.bestArticle = job.article;
            }

            if (seo >= job.minScore && geo >= job.minScore) {
              job.status = 'completed';
              job.finalScore = scoreObj;
              completed = true;
            } else if (job.iteration >= job.maxIterations) {
              job.status = 'max_iterations';
              job.finalScore = scoreObj;
              completed = true;
            } else {
              nextStep = 'rewrite';
              job.lastScore = scoreObj;
            }

            // Auto-save article as template when workflow completes
            if (completed && job.bestArticle) {
              try {
                let sections = [];
                try {
                  const articleData = JSON.parse(job.bestArticle);
                  sections = articleData.sections || [];
                } catch {}

                const htmlContent = sections.map((s: any) => s.html || '').join('\n');
                const templateId = `wf_${Date.now()}`;
                const record = {
                  id: templateId,
                  html: htmlContent,
                  url: `workflow:${jobId}`,
                  outline: extractOutline(htmlContent),
                  metadata: {
                    topic: job.topic,
                    jobId,
                    bestScore: job.bestScore,
                    iterations: job.iteration,
                    scores: job.scores,
                    status: job.status,
                    generatedAt: new Date().toISOString()
                  },
                  createdAt: new Date().toISOString()
                };

                await put('agents', `geo/articles/${templateId}.json`, JSON.stringify(record, null, 2));

                const idx = (await getJSON<any>('agents', 'geo/templates/index.json')) || { items: [] };
                idx.items.unshift({
                  id: templateId,
                  title: job.topic || 'Article GEO',
                  createdAt: record.createdAt,
                  url: record.url,
                  score: job.bestScore,
                  iterations: job.iteration,
                  status: job.status
                });
                await put('agents', 'geo/templates/index.json', JSON.stringify(idx, null, 2));

                job.templateId = templateId;
              } catch (err: any) {
                console.error('Failed to auto-save article:', err);
              }
            }
          }

          // ===== STEP: REWRITE =====
          else if (step === 'rewrite') {
            const sys4 = 'You output ONLY compact JSON. Return {"sections":[{"id":"...","title":"...","html":"..."}]} in French.';
            const usr4 = `Tu es un expert GEO & SEO. Réécris cet article pour atteindre 95%+ SEO/GEO.

ARTICLE ACTUEL:
${job.article}

SCORES ACTUELS: SEO ${job.lastScore?.scores?.seo}/100, GEO ${job.lastScore?.scores?.geo}/100

ENRICHISSEMENTS DISPONIBLES:
${JSON.stringify(job.enrichment || {}).slice(0, 2000)}

FAIBLESSES IDENTIFIÉES:
${(job.lastScore?.weaknesses || []).join('\n- ')}

CORRECTIONS À APPLIQUER:
${(job.lastScore?.fixes || []).join('\n- ')}

INSTRUCTIONS STRICTES:
✅ Garde la structure Neil Patel (5000+ mots, Pain point → Solution → Tips)
✅ Garde TOUS les éléments: tableaux, études de cas, encadrés, CTA, FAQ, JSON-LD
✅ Améliore liens externes (autorité, diversité, pertinence)
✅ Ajoute stats manquantes avec sources
✅ Renforce les encadrés visuels (💡 Astuce, ⚠️ Attention, 📊 Étude de cas)
✅ Optimise titres H2/H3 pour mots-clés
✅ Améliore transitions entre sections
✅ Paragraphes courts (2-4 lignes), langage simple
✅ Intègre les enrichissements fournis
✅ Corrige toutes les faiblesses listées

❌ NE COUPE RIEN, NE RACCOURCIS PAS
❌ Ne perds aucun tableau, encadré, CTA
❌ Ne dégrade pas la structure visuelle`;

            const res = await callAI('openai', 'gpt-5.1', [{role:'system', content: sys4}, {role:'user', content: usr4}], 0.3, 8000);
            job.logs.push({ step: 'rewrite', iteration: job.iteration, usage: res?.usage, timestamp: new Date().toISOString() });

            const rewriteText = stripFences((res?.content || '').trim());
            if (rewriteText) job.article = rewriteText;

            job.iteration++;
            nextStep = 'review';

            // Save article to separate file
            await put('agents', `geo/jobs/${jobId}_article.json`, job.article);
          }

          job.currentStep = nextStep;
          job.updatedAt = new Date().toISOString();
          await put('agents', `geo/jobs/${jobId}.json`, JSON.stringify(job, null, 2));

          return res.json({
            ok: true,
            jobId,
            step,
            nextStep: completed ? null : nextStep,
            completed,
            iteration: job.iteration,
            scores: job.scores,
            status: job.status,
            // 🆕 Ajouter htmlUrl si disponible
            htmlReady: job.htmlReady || false,
            htmlUrl: job.htmlUrl || null,
            sectionsCount: job.sectionsCount || null
          });

        } catch (e: any) {
          job.status = 'error';
          job.error = e?.message || 'Step failed';
          job.updatedAt = new Date().toISOString();
          await put('agents', `geo/jobs/${jobId}.json`, JSON.stringify(job, null, 2));
          return res.status(500).json({ error: e?.message, jobId, step });
        }
      }

      if (action === 'workflow_status') {
        const { jobId } = req.body || {};
        if (!jobId) return res.status(400).json({ error: 'jobId required' });

        const job = await getJSON<any>('agents', `geo/jobs/${jobId}.json`);
        if (!job) return res.status(404).json({ error: 'Job not found' });

        return res.json({
          jobId: job.id,
          status: job.status,
          currentStep: job.currentStep,
          iteration: job.iteration,
          scores: job.scores,
          bestScore: job.bestScore,
          article: job.bestArticle || null,
          finalScore: job.finalScore,
          research: job.research ? { articles: job.research.articles?.length, stats: job.research.stats?.length } : null,
          logs: job.logs,
          // 🆕 Nouveaux champs HTML
          htmlReady: job.htmlReady || false,
          htmlUrl: job.htmlUrl || null,
          sectionsCount: job.sectionsCount || null,
          verification: job.verification || null
        });
      }

      if (action === 'workflow_get_article') {
        const { jobId, field = 'article' } = req.body || {};
        if (!jobId) return res.status(400).json({ error: 'jobId required' });

        // Try to read from separate article file first (new format)
        try {
          const articleContent = await getJSON<string>('agents', `geo/jobs/${jobId}_article.json`);
          if (articleContent) {
            // Parse and return metadata only to avoid truncation
            const articleData = JSON.parse(articleContent);
            return res.json({
              ok: true,
              jobId,
              sections: articleData.sections?.length || 0,
              sectionTitles: (articleData.sections || []).map((s: any) => s.title || s.id),
              message: 'Use workflow_generate_html to get full article as HTML file'
            });
          }
        } catch (e) {
          // File doesn't exist or error, fallback to job file
        }

        // Fallback: read from job file (old format)
        const job = await getJSON<any>('agents', `geo/jobs/${jobId}.json`);
        if (!job) return res.status(404).json({ error: 'Job not found' });

        const articleField = field === 'best' ? 'bestArticle' : 'article';
        const articleRaw = job[articleField];

        if (!articleRaw) {
          return res.status(404).json({ error: `No ${articleField} in job` });
        }

        try {
          const articleData = JSON.parse(articleRaw);
          return res.json({
            ok: true,
            jobId,
            sections: articleData.sections?.length || 0,
            sectionTitles: (articleData.sections || []).map((s: any) => s.title || s.id),
            message: 'Use workflow_generate_html to get full article as HTML file'
          });
        } catch {
          return res.json({ ok: true, jobId, article: articleRaw });
        }
      }

      if (action === 'workflow_generate_html') {
        const { jobId } = req.body || {};
        if (!jobId) return res.status(400).json({ error: 'jobId required' });

        const job = await getJSON<any>('agents', `geo/jobs/${jobId}.json`);
        if (!job) return res.status(404).json({ error: 'Job not found' });

        // Si HTML déjà généré, retourner l'URL directement
        if (job.htmlReady && job.htmlUrl) {
          return res.json({
            ok: true,
            jobId,
            htmlUrl: job.htmlUrl,
            sectionsCount: job.sectionsCount,
            verification: job.verification,
            message: 'HTML already generated'
          });
        }

        // Sinon, génération fallback (pour anciens jobs ou jobs en erreur)
        let articleData: any = null;
        try {
          // Try reading from separate parts
          const part1Raw = await getJSON<string>('agents', `geo/articles/${jobId}_part1.json`);
          const part2Raw = await getJSON<string>('agents', `geo/articles/${jobId}_part2.json`);

          if (part1Raw && part2Raw) {
            const part1Data = JSON.parse(part1Raw);
            const part2Data = JSON.parse(part2Raw);
            articleData = {
              sections: [...(part1Data.sections || []), ...(part2Data.sections || [])]
            };
          }
        } catch (e) {
          // Fallback to job.article (legacy)
          if (job?.article) {
            try {
              articleData = JSON.parse(job.article);
            } catch {
              articleData = job.article;
            }
          }
        }

        if (!articleData || !articleData.sections) {
          return res.status(404).json({
            error: 'No article found for this job',
            debug: { hasData: !!articleData, hasSections: articleData?.sections },
            suggestion: 'Try running draft_part1 and draft_part2 first'
          });
        }
        const sections = articleData.sections || [];

        // Count words
        let totalWords = 0;
        sections.forEach((s: any) => {
          const text = (s.html || '').replace(/<[^>]*>/g, '');
          const words = text.split(/\s+/).filter((w: string) => w.length > 0);
          totalWords += words.length;
        });

        // Generate HTML
        const html = `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Article Complet - Datawarehouse Finance et Power BI</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
            max-width: 900px;
            margin: 40px auto;
            padding: 0 20px;
            line-height: 1.7;
            background: #f5f5f5;
            color: #333;
        }
        .container {
            background: white;
            padding: 40px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .meta {
            background: #e8f5e9;
            padding: 20px;
            border-left: 4px solid #4caf50;
            margin: 30px 0;
            border-radius: 4px;
        }
        h1 {
            color: #1a237e;
            font-size: 2.2em;
            margin-bottom: 20px;
            border-bottom: 3px solid #3f51b5;
            padding-bottom: 15px;
        }
        h2 {
            color: #283593;
            font-size: 1.8em;
            margin-top: 50px;
            margin-bottom: 20px;
            border-bottom: 2px solid #7986cb;
            padding-bottom: 10px;
        }
        h3 {
            color: #5c6bc0;
            font-size: 1.4em;
            margin-top: 30px;
        }
        h4 {
            color: #7986cb;
            font-size: 1.1em;
            margin-top: 20px;
        }
        a {
            color: #1976d2;
            text-decoration: none;
        }
        a:hover {
            text-decoration: underline;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        table th {
            background: #3f51b5;
            color: white;
            padding: 12px;
            text-align: left;
        }
        table td {
            padding: 10px;
            border: 1px solid #ddd;
        }
        table tr:nth-child(even) {
            background: #f5f5f5;
        }
        .key-points {
            background: #fff3e0;
            border-left: 4px solid #ff9800;
            padding: 15px 20px;
            margin: 20px 0;
            border-radius: 4px;
        }
        .case-study {
            background: #e3f2fd;
            border-left: 4px solid #2196f3;
            padding: 15px 20px;
            margin: 20px 0;
            border-radius: 4px;
        }
        .tip-box {
            background: #f1f8e9;
            border-left: 4px solid #8bc34a;
            padding: 15px 20px;
            margin: 20px 0;
            border-radius: 4px;
        }
        .warning-box {
            background: #ffebee;
            border-left: 4px solid #f44336;
            padding: 15px 20px;
            margin: 20px 0;
            border-radius: 4px;
        }
        .cta-box {
            background: #fff8e1;
            border: 2px solid #ffc107;
            padding: 20px;
            margin: 30px 0;
            border-radius: 8px;
            text-align: center;
        }
        .visual-placeholder {
            background: #fafafa;
            border: 2px dashed #9e9e9e;
            padding: 20px;
            margin: 20px 0;
            border-radius: 4px;
            text-align: center;
        }
        ul, ol {
            margin: 15px 0;
            padding-left: 30px;
        }
        li {
            margin: 8px 0;
        }
        p {
            margin: 15px 0;
        }
        strong {
            color: #d32f2f;
            font-weight: 600;
        }
    </style>
</head>
<body>

<div class="container">

<div class="meta">
    <strong>✅ ARTICLE COMPLET GÉNÉRÉ EN 2 PARTIES - GPT-5.1</strong><br>
    Job ID: ${jobId}<br>
    Sections: ${sections.length}<br>
    Mots: ~${totalWords}<br>
    <strong style="color: #4caf50;">✓ SANS TIMEOUT - Fusion automatique réussie!</strong>
</div>

${sections.map((section: any, i: number) => {
  return `\n<!-- ========== SECTION ${i + 1}: ${section.title || section.id} ========== -->\n${section.html}`;
}).join('\n\n')}

<div class="meta">
    <strong>📋 TABLE DES MATIÈRES:</strong>
    <ol style="margin: 10px 0 0 20px;">
${sections.map((s: any) => `        <li>${s.title || s.id}</li>`).join('\n')}
    </ol>
</div>

</div>

</body>
</html>`;

        // Save HTML to public location
        const htmlPath = `geo/articles/${jobId}.html`;
        await put('agents', htmlPath, html);

        return res.json({
          ok: true,
          jobId,
          sections: sections.length,
          words: totalWords,
          htmlUrl: `https://storage.supabase.co/v1/object/public/agents/${htmlPath}`,
          message: 'HTML file generated successfully'
        });
      }

      if (action === 'workflow_save_article') {
        const { jobId, title } = req.body || {};
        if (!jobId) return res.status(400).json({ error: 'jobId required' });

        const job = await getJSON<any>('agents', `geo/jobs/${jobId}.json`);
        if (!job) return res.status(404).json({ error: 'Job not found' });
        if (!job.bestArticle) return res.status(400).json({ error: 'No article in job' });

        // Parse the article JSON to get sections
        let sections = [];
        try {
          const articleData = JSON.parse(job.bestArticle);
          sections = articleData.sections || [];
        } catch {
          // If parsing fails, try to treat it as sections array directly
          sections = [];
        }

        // Convert sections to HTML
        const htmlContent = sections.map((s: any) => s.html || '').join('\n');

        // Extract outline from HTML
        const outline = extractOutline(htmlContent);

        // Save as a template/article
        const id = Date.now().toString();
        const record = {
          id,
          html: htmlContent,
          url: '',
          outline,
          metadata: {
            topic: job.topic,
            jobId: job.id,
            bestScore: job.bestScore,
            iterations: job.iteration,
            scores: job.scores,
            generatedAt: new Date().toISOString()
          },
          createdAt: new Date().toISOString()
        };

        await put('agents', `geo/articles/${id}.json`, JSON.stringify(record, null, 2));

        // Update templates index so it appears in the UI
        const idx = (await getJSON<any>('agents', 'geo/templates/index.json')) || { items: [] };
        idx.items.unshift({
          id,
          title: title || job.topic || 'Article GEO',
          createdAt: record.createdAt,
          url: `workflow:${jobId}`,
          score: job.bestScore,
          iterations: job.iteration
        });
        await put('agents', 'geo/templates/index.json', JSON.stringify(idx, null, 2));

        return res.json({
          ok: true,
          id,
          outline,
          html: htmlContent,
          metadata: record.metadata
        });
      }

      return res.status(400).json({ error: 'Unknown action' });
    }
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (e:any) {
    return res.status(500).json({ error: e?.message || 'Server error' });
  }
}


