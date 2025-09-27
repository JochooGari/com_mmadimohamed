// @ts-nocheck

// Execute workflow via direct AI API calls
export default async function handler(req: any, res: any) {
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

    if (workflowId === 'test-agent') {
      return await executeTestAgent(req, res, data, config);
    }

    return res.status(404).json({ error: 'Workflow not found' });
  } catch (error: any) {
    console.error('Workflow execution error:', error);
    return res.status(500).json({ error: error.message || 'Execution failed' });
  }
}

async function executeTestAgent(req: any, res: any, data: any, cfg: any) {
  const provider = String(cfg?.provider || 'openai');
  const model = String(cfg?.model || normalizedDefaultModel(provider));
  const apiKey = cfg?.apiKey || getEnvKey(provider);
  const temperature = Number(cfg?.temperature ?? 0.7);
  const maxTokens = Number(cfg?.maxTokens ?? 1000);
  const messages = Array.isArray(data?.messages) ? data.messages : [];
  try {
    const text = await callProvider(provider, model, apiKey, messages, temperature, maxTokens);
    return res.status(200).json({ status:'completed', output: { text }, debug: { provider, model } });
  } catch (e: any) {
    return res.status(200).json({ status:'failed', error: e.message || 'Test agent failed', debug: { provider, model } });
  }
}

async function executeContentAgentsWorkflow(req: any, res: any, data: any, cfg: any) {
  const execution: any = {
    id: `exec-${Date.now()}`,
    workflowId: 'content-agents-workflow',
    status: 'running',
    startedAt: new Date().toISOString(),
    steps: [] as any[]
  };

  try {
    // Load prompts saved from the admin UI
    const prompts = await loadWorkflowPrompts(req).catch(() => ({} as any));

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
      try {
        const json = extractJson(text);
        topics = json?.topics || [];
    execution.steps.push({
      nodeId: 'search-content',
      status: 'completed',
          output: { topics },
          debug: { provider, model, raw: String(text).slice(0, 2000) },
          completedAt: new Date().toISOString()
        });
      } catch (e: any) {
        execution.steps.push({
          nodeId: 'search-content',
          status: 'failed',
          error: 'Search Content a renvoyé un format non-JSON. Corrigez le prompt (voir Debug).',
          debug: { provider, model, raw: String(text).slice(0, 2000) },
      completedAt: new Date().toISOString()
    });
        throw new Error('Search Content: No JSON block found');
      }
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
        Number(cfg?.ghostwriterAgent?.maxTokens ?? 8000),
        {
          topP: cfg?.ghostwriterAgent?.topP,
          frequencyPenalty: cfg?.ghostwriterAgent?.frequencyPenalty,
          presencePenalty: cfg?.ghostwriterAgent?.presencePenalty
        }
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
    const isClaudeLarge = /claude-3(\.5|\.7)?-sonnet|claude-3-opus/i.test(String(model));
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
        Number(cfg?.reviewerAgent?.temperature ?? (isClaudeLarge ? 0.7 : 0.3)),
        Number(cfg?.reviewerAgent?.maxTokens ?? (isClaudeLarge ? 8000 : 2000))
      );
      reviewDebug.push(String(text).slice(0, 2000));
      let review: any;
      try {
        const json = extractJson(text);
        if (!json?.review) throw new Error('Réponse Reviewer invalide');
        review = json.review;
      } catch (e: any) {
        execution.steps.push({
          nodeId: 'review-content',
          status: 'failed',
          error: 'Reviewer a renvoyé un format non-JSON. Corrigez le prompt (voir Debug).',
          debug: { provider, model, raw: String(text).slice(0, 2000) },
          completedAt: new Date().toISOString()
        });
        throw new Error('Reviewer: No JSON block found');
      }
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

    // Return 200 with structured failure so the frontend can display detailed steps/debug
    return res.status(200).json(execution);
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

async function callProvider(provider: string, model: string, apiKey: string | undefined, messages: any[], temperature = 0.3, maxTokens = 1000, extra: { topP?: number; frequencyPenalty?: number; presencePenalty?: number } = {}): Promise<string> {
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
      if (typeof extra.topP === 'number') body.top_p = extra.topP;
      if (typeof extra.frequencyPenalty === 'number') body.frequency_penalty = extra.frequencyPenalty;
      if (typeof extra.presencePenalty === 'number') body.presence_penalty = extra.presencePenalty;
    } else {
      url = 'https://api.openai.com/v1/chat/completions';
      body = { model: normalizedModel, messages, temperature, max_tokens: maxTokens };
      if (typeof extra.topP === 'number') body.top_p = extra.topP;
      if (typeof extra.frequencyPenalty === 'number') body.frequency_penalty = extra.frequencyPenalty;
      if (typeof extra.presencePenalty === 'number') body.presence_penalty = extra.presencePenalty;
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
    return String(d?.content?.[0]?.text || '');
  }
  // OpenAI: support both Chat Completions and Responses API
  if (typeof d?.output_text === 'string' && d.output_text.length > 0) {
    return d.output_text as string;
  }
  const chatContent = d?.choices?.[0]?.message?.content;
  if (typeof chatContent === 'string') return chatContent as string;
  if (Array.isArray(chatContent)) {
    const parts = chatContent.map((p: any) => (typeof p === 'string' ? p : (p?.text ?? '')));
    return parts.join('');
  }
  // Responses API structured output
  if (Array.isArray(d?.output?.[0]?.content)) {
    const parts = d.output[0].content.map((c: any) => (c?.text ?? ''));
    return parts.join('');
  }
  return '';
}

function extractJson(text: string): any {
  const t = (text || '').trim();
  // Prefer fenced code block first
  const fence = t.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidates: string[] = [];
  if (fence && fence[1]) candidates.push(fence[1].trim());
  // Then try lazy curly matches (multiple)
  const re = /\{[\s\S]*?\}/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(t)) !== null) {
    candidates.push(m[0]);
  }
  for (const c of candidates) {
    try { return JSON.parse(c); } catch {}
  }
  throw new Error('No JSON block found');
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
  if (p === 'anthropic') return 'claude-3-5-sonnet-latest';
  return 'gpt-4o';
}

async function loadWorkflowPrompts(req: any): Promise<Record<string, { prompt: string }>> {
  const proto = (req.headers['x-forwarded-proto'] as string) || 'https';
  const host = (req.headers['x-forwarded-host'] as string) || (req.headers['host'] as string) || process.env.VERCEL_URL || '';
  const base = process.env.SITE_URL || (host ? (host.startsWith('http') ? host : `${proto}://${host}`) : '');
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