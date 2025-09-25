// @ts-nocheck
import { NextApiRequest, NextApiResponse } from 'next';

// Execute workflow via direct AI API calls
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { workflowId, data, config } = req.body;

    if (workflowId === 'content-agents-workflow') {
      return await executeContentAgentsWorkflow(req, res, data, config);
    }

    return res.status(404).json({ error: 'Workflow not found' });
  } catch (error: any) {
    console.error('Workflow execution error:', error);
    return res.status(500).json({ error: error.message || 'Execution failed' });
  }
}

async function executeContentAgentsWorkflow(req: NextApiRequest, res: NextApiResponse, data: any, cfg: any) {
  const execution: any = {
    id: `exec-${Date.now()}`,
    workflowId: 'content-agents-workflow',
    status: 'running',
    startedAt: new Date().toISOString(),
    steps: [] as any[]
  };

  try {
    // Load prompts saved from the admin UI
    const prompts = await loadWorkflowPrompts().catch(() => ({} as any));

    // Step 1: Agent Search Content (can be skipped if custom topics provided)
    let topics: any[] = [];
    if (Array.isArray(data?.customTopics) && data.customTopics.length > 0) {
      topics = data.customTopics;
      execution.steps.push({
        nodeId: 'search-content',
        status: 'completed',
        output: { topics },
        completedAt: new Date().toISOString()
      });
    } else {
      const provider = (cfg?.searchAgent?.provider || 'perplexity') as string;
      const model = cfg?.searchAgent?.model || normalizedDefaultModel(provider);
      const apiKey = cfg?.searchAgent?.apiKey || getEnvKey(provider);
      const searchPrompt = String(prompts?.['search-content']?.prompt || '').trim();
      if (!searchPrompt) {
        throw new Error("Prompt manquant pour l'agent Search Content. Veuillez le renseigner dans l'interface (Onglet Agents > Prompt).");
      }
      const searchMessages = [ { role: 'user', content: replaceVars(searchPrompt, { siteUrl: data.siteUrl || '' }) } ];
      const text = await callProvider(
        provider,
        model,
        apiKey,
        searchMessages,
        Number(cfg?.searchAgent?.temperature ?? 0.7),
        Number(cfg?.searchAgent?.maxTokens ?? 2000)
      );
      const json = extractJson(text);
      topics = json?.topics || [];
    execution.steps.push({
      nodeId: 'search-content',
      status: 'completed',
      output: { topics },
      debug: { provider, model, raw: String(text).slice(0, 2000) },
      completedAt: new Date().toISOString()
    });
    }

    // Step 2: Agent Ghostwriting
    const articles: any[] = [];
    const ghostDebug: string[] = [];
    for (const topic of topics) {
      const provider = (cfg?.ghostwriterAgent?.provider || 'openai') as string;
      const model = cfg?.ghostwriterAgent?.model || normalizedDefaultModel(provider);
      const apiKey = cfg?.ghostwriterAgent?.apiKey || getEnvKey(provider);
      const ghostPrompt = String(prompts?.['ghostwriter']?.prompt || '').trim();
      if (!ghostPrompt) {
        throw new Error("Prompt manquant pour l'agent Ghostwriter. Veuillez le renseigner dans l'interface (Onglet Agents > Prompt).");
      }
      const ghostMessages = [ { role: 'user', content: replaceVars(ghostPrompt, { topic: JSON.stringify(topic) }) } ];
      const text = await callProvider(
        provider,
        model,
        apiKey,
        ghostMessages,
        Number(cfg?.ghostwriterAgent?.temperature ?? 0.8),
        Number(cfg?.ghostwriterAgent?.maxTokens ?? 8000)
      );
      ghostDebug.push(String(text).slice(0, 2000));
      // Accept either strict JSON or free-form content
      const json = tryExtractJson(text);
      let article: any;
      if (json?.article) {
        article = json.article;
      } else {
        article = buildArticleFromText(text);
      }
      articles.push(article);
    }

    execution.steps.push({
      nodeId: 'ghostwriter',
      status: 'completed',
      output: { articles },
      debug: { provider: (cfg?.ghostwriterAgent?.provider || 'openai'), model: (cfg?.ghostwriterAgent?.model || normalizedDefaultModel(cfg?.ghostwriterAgent?.provider || 'openai')), raw: ghostDebug },
      completedAt: new Date().toISOString()
    });

    // Step 3: Agent Review Content
    const reviews: any[] = [];
    const reviewDebug: string[] = [];
    for (const article of articles) {
      const provider = (cfg?.reviewerAgent?.provider || 'anthropic') as string;
      const model = cfg?.reviewerAgent?.model || normalizedDefaultModel(provider);
      const apiKey = cfg?.reviewerAgent?.apiKey || getEnvKey(provider);
      const isClaude4 = /^claude[-_]?sonnet[-_]?4/i.test(String(model));
      const reviewPrompt = String(prompts?.['review-content']?.prompt || '').trim();
      if (!reviewPrompt) {
        throw new Error("Prompt manquant pour l'agent Reviewer. Veuillez le renseigner dans l'interface (Onglet Agents > Prompt).");
      }
      const reviewMessages = [ { role: 'user', content: replaceVars(reviewPrompt, { article: JSON.stringify(article) }) } ];
      const text = await callProvider(
        provider,
        model,
        apiKey,
        reviewMessages,
        Number(cfg?.reviewerAgent?.temperature ?? (isClaude4 ? 0.7 : 0.3)),
        Number(cfg?.reviewerAgent?.maxTokens ?? (isClaude4 ? 8000 : 2000))
      );
      reviewDebug.push(String(text).slice(0, 2000));
      const json = extractJson(text);
      if (!json?.review) throw new Error('Réponse Reviewer invalide');
      const review = json.review;
      reviews.push(review);
    }

    execution.steps.push({
      nodeId: 'review-content',
      status: 'completed',
      output: { reviews },
      debug: { provider: (cfg?.reviewerAgent?.provider || 'anthropic'), model: (cfg?.reviewerAgent?.model || normalizedDefaultModel(cfg?.reviewerAgent?.provider || 'anthropic')), raw: reviewDebug },
      completedAt: new Date().toISOString()
    });

    // Final result
    const result = {
      ...execution,
      status: 'completed',
      finishedAt: new Date().toISOString(),
      output: {
        topics,
        articles,
        reviews,
        summary: {
          totalArticles: articles.length,
          averageIterations: 1
        }
      }
    };

    return res.status(200).json(result);

  } catch (error: any) {
    execution.status = 'failed';
    execution.error = error.message;
    execution.finishedAt = new Date().toISOString();

    return res.status(500).json(execution);
  }
}

// Helpers
function getEnvKey(provider: string | undefined): string | undefined {
  switch ((provider || '').toLowerCase()) {
    case 'openai': return process.env.OPENAI_API_KEY;
    case 'anthropic': return process.env.ANTHROPIC_API_KEY;
    case 'perplexity': return process.env.PERPLEXITY_API_KEY;
    default: return undefined;
  }
}

async function callProvider(provider: string, model: string, apiKey: string | undefined, messages: any[], temperature = 0.3, maxTokens = 1000): Promise<string> {
  if (!apiKey) throw new Error(`${provider} API key not configured`);
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  let url = '';
  let body: any = {};
  const normalizedModel = normalizeModel(provider, model);

  if (provider === 'openai') {
    const useResponses = /^(gpt-4o|o)/i.test(String(normalizedModel));
    headers.Authorization = `Bearer ${apiKey}`;
    if (useResponses) {
      url = 'https://api.openai.com/v1/responses';
      const input = messages.map((m:any)=> `${m.role.toUpperCase()}: ${m.content}`).join('\n\n');
      body = { model: normalizedModel, input, temperature, max_output_tokens: maxTokens };
    } else {
      url = 'https://api.openai.com/v1/chat/completions';
      body = { model: normalizedModel, messages, temperature, max_tokens: maxTokens };
    }
  } else if (provider === 'anthropic') {
    url = 'https://api.anthropic.com/v1/messages';
    headers['x-api-key'] = apiKey;
    headers['anthropic-version'] = '2023-06-01';
    const system = messages.find(m=> m.role==='system')?.content;
    const convo = messages.filter(m=> m.role !== 'system');
    body = { model: normalizedModel, max_tokens: maxTokens, temperature, system, messages: convo };
  } else if (provider === 'perplexity') {
    url = 'https://api.perplexity.ai/chat/completions';
    headers.Authorization = `Bearer ${apiKey}`;
    body = { model: normalizedModel, messages, temperature, max_tokens: maxTokens };
  } else {
    throw new Error(`Unknown provider ${provider}`);
  }

  const r = await fetch(url, { method: 'POST', headers, body: JSON.stringify(body) });
  const d = await r.json().catch(()=>({}));
  if (!r.ok) throw new Error(`${provider} API error: ${d?.error?.message || r.statusText}`);

  // Normalize
  if (provider === 'anthropic') {
    return d?.content?.[0]?.text || '';
  }
  return d?.choices?.[0]?.message?.content || '';
}

function extractJson(text: string): any {
  const t = (text || '').trim();
  const m = t.match(/\{[\s\S]*\}/);
  if (!m) throw new Error('No JSON block found');
  return JSON.parse(m[0]);
}

function tryExtractJson(text: string): any | null {
  try { return extractJson(text); } catch { return null; }
}

function buildArticleFromText(text: string) {
  const t = (text || '').trim();
  // Try to extract title from HTML H1 or markdown H1
  let title = '';
  const h1 = t.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  if (h1 && h1[1]) {
    title = h1[1].replace(/<[^>]+>/g, '').trim();
  }
  if (!title) {
    const md = t.match(/^#\s+(.+)$/m);
    if (md && md[1]) title = md[1].trim();
  }
  if (!title) {
    // fallback first non-empty line
    const first = t.split(/\n+/).find(l => l.trim().length > 0) || '';
    title = first.replace(/^#+\s*/, '').slice(0, 120) || 'Article';
  }
  return {
    title,
    metaDescription: '',
    introduction: '',
    content: t,
    conclusion: ''
  };
}

function normalizeModel(provider: string, rawModel: string): string {
  const m = String(rawModel || '').trim();
  if (provider.toLowerCase() === 'perplexity') {
    // Map legacy/verbose sonar model ids to supported ones
    if (/large|pro/i.test(m)) return 'sonar-pro';
    if (/sonar/i.test(m)) return 'sonar';
    return 'sonar';
  }
  return m;
}

function normalizedDefaultModel(provider: string): string {
  const p = (provider || '').toLowerCase();
  if (p === 'perplexity') return 'sonar';
  if (p === 'openai') return 'gpt-4o';
  if (p === 'anthropic') return 'claude-3-sonnet-20240229';
  return 'gpt-4o';
}

async function loadWorkflowPrompts(): Promise<Record<string, { prompt: string }>> {
  const base = process.env.SITE_URL || (process.env.VERCEL_URL ? (process.env.VERCEL_URL.startsWith('http') ? process.env.VERCEL_URL : `https://${process.env.VERCEL_URL}`) : '');
  const url = `${base}/api/storage?agent=workflow&type=prompts`;
  const r = await fetch(url);
  if (!r.ok) throw new Error('Impossible de charger les prompts');
  return r.json();
}

function replaceVars(template: string, vars: Record<string, string>): string {
  let out = template;
  Object.entries(vars).forEach(([k, v]) => {
    out = out.replaceAll(`{${k}}`, v);
  });
  return out;
}