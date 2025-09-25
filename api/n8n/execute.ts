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
      const searchResult = await executeSearchContent(
        data.siteUrl || 'https://www.mmadimohamed.fr/',
        cfg?.searchAgent?.model || 'llama-3.1-sonar-large-128k-online',
        cfg?.searchAgent?.apiKey || process.env.PERPLEXITY_API_KEY
      );
      topics = searchResult.topics || [];
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
      const article = await executeGhostwriting(
        topic,
        cfg?.ghostwriterAgent?.model || 'gpt-4',
        cfg?.ghostwriterAgent?.apiKey || process.env.OPENAI_API_KEY
      );
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
      const review = await executeReviewContent(
        article,
        cfg?.reviewerAgent?.model || 'claude-3-sonnet-20240229',
        cfg?.reviewerAgent?.apiKey || process.env.ANTHROPIC_API_KEY
      );
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

async function executeSearchContent(siteUrl: string, model: string, apiKey?: string) {
  const perplexityKey = apiKey || process.env.PERPLEXITY_API_KEY;

  if (!perplexityKey) {
    throw new Error('PERPLEXITY_API_KEY not configured');
  }

  const response = await fetch('https://api.perplexity.ai/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${perplexityKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: 'system',
          content: `Tu es un agent spécialisé dans l'analyse de contenu web et la proposition de sujets d'articles.

Analyse le site web fourni et propose 3-5 sujets d'articles pertinents.

Retourne UNIQUEMENT un JSON valide avec cette structure :
{
  "topics": [
    {
      "title": "Titre suggéré",
      "keywords": ["mot-clé1", "mot-clé2"],
      "angle": "Description de l'angle",
      "audience": "Description du public cible",
      "sources": ["source1", "source2"]
    }
  ]
}`
        },
        {
          role: 'user',
          content: `Analyse le site ${siteUrl} et propose des sujets d'articles.`
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    })
  });

  if (!response.ok) {
    throw new Error(`Perplexity API error: ${response.statusText}`);
  }

  const data = await response.json();
  const content = data.choices[0].message.content;

  // Extract JSON from response
  try {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (e) {
    console.error('JSON parsing error:', e);
  }

  throw new Error('Perplexity response did not contain valid JSON topics');
}

async function executeGhostwriting(topic: any, model: string, apiKey?: string) {
  const openaiKey = apiKey || process.env.OPENAI_API_KEY;

  if (!openaiKey) {
    throw new Error('OPENAI_API_KEY not configured');
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openaiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: 'system',
          content: `Tu es un rédacteur expert. Rédige un article complet et optimisé SEO.

Retourne UNIQUEMENT un JSON valide avec cette structure :
{
  "article": {
    "title": "Titre H1",
    "metaDescription": "Meta description SEO (150-160 caractères)",
    "introduction": "Introduction engageante",
    "content": "Corps de l'article en HTML avec balises H2, H3, p, ul, li",
    "conclusion": "Conclusion avec call-to-action",
    "images": ["suggestion1.jpg", "suggestion2.jpg"],
    "wordCount": 1500
  }
}`
        },
        {
          role: 'user',
          content: `Rédige un article basé sur ce sujet : ${JSON.stringify(topic)}`
        }
      ],
      temperature: 0.8,
      max_tokens: 4000
    })
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.statusText}`);
  }

  const data = await response.json();
  const content = data.choices[0].message.content;

  try {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return parsed.article;
    }
  } catch (e) {
    console.error('JSON parsing error:', e);
  }

  throw new Error('OpenAI response did not contain valid JSON article');
}

async function executeReviewContent(article: any, model: string, apiKey?: string) {
  const anthropicKey = apiKey || process.env.ANTHROPIC_API_KEY;

  if (!anthropicKey) {
    throw new Error('ANTHROPIC_API_KEY not configured');
  }

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': anthropicKey,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model,
      max_tokens: 2000,
      messages: [
        {
          role: 'user',
          content: `Analyse cet article et donne un score détaillé.

Retourne UNIQUEMENT un JSON valide avec cette structure :
{
  "review": {
    "globalScore": 85,
    "detailedScores": {
      "writing": 22,
      "relevance": 18,
      "seo": 17,
      "structure": 13,
      "engagement": 8,
      "briefCompliance": 9
    },
    "strengths": ["Point fort 1", "Point fort 2"],
    "improvements": ["Amélioration 1", "Amélioration 2"],
    "recommendations": ["Recommandation 1", "Recommandation 2"],
    "actions": ["Action 1", "Action 2"],
    "targetScore": 95
  }
}

Article à analyser : ${JSON.stringify(article)}`
        }
      ]
    })
  });

  if (!response.ok) {
    throw new Error(`Anthropic API error: ${response.statusText}`);
  }

  const data = await response.json();
  const content = data.content[0].text;

  try {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return parsed.review;
    }
  } catch (e) {
    console.error('JSON parsing error:', e);
  }

  throw new Error('Anthropic response did not contain valid JSON review');
}