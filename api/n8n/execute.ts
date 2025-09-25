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
      const model = cfg?.searchAgent?.model || 'llama-3.1-sonar-large-128k-online';
      const apiKey = cfg?.searchAgent?.apiKey || getEnvKey(provider);
      const searchMessages = [
        { role: 'system', content: `Tu es un agent spécialisé dans l'analyse de contenu web et la proposition de sujets d'articles.\n\nAnalyse le site web fourni et propose 3-5 sujets d'articles pertinents.\n\nRetourne UNIQUEMENT un JSON valide avec cette structure :\n{\n  "topics": [\n    {\n      "title": "Titre suggéré",\n      "keywords": ["mot-clé1", "mot-clé2"],\n      "angle": "Description de l'angle",\n      "audience": "Description du public cible",\n      "sources": ["source1", "source2"]\n    }\n  ]\n}` },
        { role: 'user', content: `Analyse le site ${data.siteUrl || 'https://www.mmadimohamed.fr/'} et propose des sujets d'articles.` }
      ];
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
        completedAt: new Date().toISOString()
      });
    }

    // Step 2: Agent Ghostwriting
    const articles: any[] = [];
    for (const topic of topics) {
      const provider = (cfg?.ghostwriterAgent?.provider || 'openai') as string;
      const model = cfg?.ghostwriterAgent?.model || 'gpt-4o';
      const apiKey = cfg?.ghostwriterAgent?.apiKey || getEnvKey(provider);
      const ghostMessages = [
        { role: 'system', content: `Tu es un rédacteur expert. Rédige un article complet et optimisé SEO.\n\nRetourne UNIQUEMENT un JSON valide avec cette structure :\n{\n  "article": {\n    "title": "Titre H1",\n    "metaDescription": "Meta description SEO (150-160 caractères)",\n    "introduction": "Introduction engageante",\n    "content": "Corps de l'article en HTML avec balises H2, H3, p, ul, li",\n    "conclusion": "Conclusion avec call-to-action",\n    "images": ["suggestion1.jpg", "suggestion2.jpg"],\n    "wordCount": 1500\n  }\n}` },
        { role: 'user', content: `Rédige un article basé sur ce sujet : ${JSON.stringify(topic)}` }
      ];
      const text = await callProvider(
        provider,
        model,
        apiKey,
        ghostMessages,
        Number(cfg?.ghostwriterAgent?.temperature ?? 0.8),
        Number(cfg?.ghostwriterAgent?.maxTokens ?? 4000)
      );
      const json = extractJson(text);
      if (!json?.article) throw new Error('Réponse Ghostwriter invalide');
      const article = json.article;
      articles.push(article);
    }

    execution.steps.push({
      nodeId: 'ghostwriter',
      status: 'completed',
      output: { articles },
      completedAt: new Date().toISOString()
    });

    // Step 3: Agent Review Content
    const reviews: any[] = [];
    for (const article of articles) {
      const provider = (cfg?.reviewerAgent?.provider || 'anthropic') as string;
      const model = cfg?.reviewerAgent?.model || 'claude-3-sonnet-20240229';
      const apiKey = cfg?.reviewerAgent?.apiKey || getEnvKey(provider);
      const isClaude4 = /^claude[-_]?sonnet[-_]?4/i.test(String(model));
      const reviewMessages = [
        { role: 'user', content: `Analyse cet article et donne un score détaillé.\n\nRetourne UNIQUEMENT un JSON valide avec cette structure :\n{\n  "review": {\n    "globalScore": 85,\n    "detailedScores": {\n      "writing": 22,\n      "relevance": 18,\n      "seo": 17,\n      "geo": 13,\n      "structure": 13,\n      "engagement": 8,\n      "briefCompliance": 9\n    },\n    "strengths": ["Point fort 1", "Point fort 2"],\n    "improvements": ["Amélioration 1", "Amélioration 2"],\n    "recommendations": ["Recommandation 1", "Recommandation 2"],\n    "actions": ["Action 1", "Action 2"],\n    "targetScore": 95\n  }\n}\n\nArticle à analyser : ${JSON.stringify(article)}` }
      ];
      const text = await callProvider(
        provider,
        model,
        apiKey,
        reviewMessages,
        Number(cfg?.reviewerAgent?.temperature ?? (isClaude4 ? 0.7 : 0.3)),
        Number(cfg?.reviewerAgent?.maxTokens ?? (isClaude4 ? 8000 : 2000))
      );
      const json = extractJson(text);
      if (!json?.review) throw new Error('Réponse Reviewer invalide');
      const review = json.review;
      reviews.push(review);
    }

    execution.steps.push({
      nodeId: 'review-content',
      status: 'completed',
      output: { reviews },
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

  if (provider === 'openai') {
    const useResponses = /^(gpt-4o|o)/i.test(String(model));
    headers.Authorization = `Bearer ${apiKey}`;
    if (useResponses) {
      url = 'https://api.openai.com/v1/responses';
      const input = messages.map((m:any)=> `${m.role.toUpperCase()}: ${m.content}`).join('\n\n');
      body = { model, input, temperature, max_completion_tokens: maxTokens };
    } else {
      url = 'https://api.openai.com/v1/chat/completions';
      body = { model, messages, temperature, max_tokens: maxTokens };
    }
  } else if (provider === 'anthropic') {
    url = 'https://api.anthropic.com/v1/messages';
    headers['x-api-key'] = apiKey;
    headers['anthropic-version'] = '2023-06-01';
    const system = messages.find(m=> m.role==='system')?.content;
    const convo = messages.filter(m=> m.role !== 'system');
    body = { model, max_tokens: maxTokens, temperature, system, messages: convo };
  } else if (provider === 'perplexity') {
    url = 'https://api.perplexity.ai/chat/completions';
    headers.Authorization = `Bearer ${apiKey}`;
    body = { model, messages, temperature, max_tokens: maxTokens };
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