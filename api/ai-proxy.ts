type Message = { role: 'system' | 'user' | 'assistant'; content: string };

function getKey(provider: string): string | undefined {
  switch (provider) {
    case 'openai': return process.env.OPENAI_API_KEY;
    case 'anthropic': return process.env.ANTHROPIC_API_KEY;
    case 'google': return process.env.GOOGLE_AI_API_KEY;
    case 'mistral': return process.env.MISTRAL_API_KEY;
    case 'perplexity': return process.env.PERPLEXITY_API_KEY;
    default: return undefined;
  }
}

function normalize(provider: string, data: any, model: string) {
  let content = '';
  let usage: any | undefined;
  switch (provider) {
    case 'openai':
    case 'mistral':
    case 'perplexity':
      // GPT-5 may use output_text or different format
      content = data?.choices?.[0]?.message?.content
        || data?.output_text
        || data?.choices?.[0]?.text
        || '';
      usage = data?.usage && {
        promptTokens: data.usage.prompt_tokens,
        completionTokens: data.usage.completion_tokens,
        totalTokens: data.usage.total_tokens,
      };
      break;
    case 'anthropic':
      content = data?.content?.[0]?.text || '';
      usage = data?.usage && {
        promptTokens: data.usage.input_tokens,
        completionTokens: data.usage.output_tokens,
        totalTokens: (data.usage.input_tokens ?? 0) + (data.usage.output_tokens ?? 0),
      };
      break;
    case 'google':
      content = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
      break;
  }
  return { content, usage, model };
}

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { provider = 'openai', model, messages, temperature = 0.2, maxTokens = 800 } = (req.body || {}) as {
      provider: string; model: string; messages: Message[]; temperature?: number; maxTokens?: number;
    };

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'messages required' });
    }
    const key = getKey(provider);
    if (!key) {
      return res.status(401).json({ error: `Missing server API key for ${provider}` });
    }

    let url = '';
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    let body: any = {};

    switch (provider) {
      case 'openai': {
        url = 'https://api.openai.com/v1/chat/completions';
        headers.Authorization = `Bearer ${key}`;
        // GPT-5 uses max_completion_tokens and requires temperature=1
        if (model.startsWith('gpt-5')) {
          body = { model, messages, temperature: 1, max_completion_tokens: maxTokens };
        } else {
          body = { model, messages, temperature, max_tokens: maxTokens };
        }
        break;
      }
      case 'anthropic': {
        url = 'https://api.anthropic.com/v1/messages';
        headers['x-api-key'] = key;
        headers['anthropic-version'] = '2023-06-01';
        const system = messages.find(m => m.role === 'system')?.content;
        const convo = messages.filter(m => m.role !== 'system');
        body = { model, max_tokens: maxTokens, temperature, system, messages: convo };
        break;
      }
      case 'google': {
        url = `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${key}`;
        const contents = messages.filter(m => m.role !== 'system').map(m => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] }));
        body = { contents, generationConfig: { temperature, maxOutputTokens: maxTokens } };
        break;
      }
      case 'mistral': {
        url = 'https://api.mistral.ai/v1/chat/completions';
        headers.Authorization = `Bearer ${key}`;
        body = { model, messages, temperature, max_tokens: maxTokens };
        break;
      }
      case 'perplexity': {
        url = 'https://api.perplexity.ai/chat/completions';
        headers.Authorization = `Bearer ${key}`;
        body = { model, messages, temperature, max_tokens: maxTokens };
        break;
      }
      default:
        return res.status(400).json({ error: `Unknown provider ${provider}` });
    }

    const r = await fetch(url, { method: 'POST', headers, body: JSON.stringify(body) });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) {
      return res.status(r.status).json({ error: data?.error?.message || data?.message || r.statusText });
    }
    const normalized = normalize(provider, data, model);
    // Debug: include raw response structure for GPT-5
    if (model.startsWith('gpt-5')) {
      (normalized as any).debug = {
        hasChoices: !!data?.choices,
        choicesLength: data?.choices?.length,
        hasOutputText: !!data?.output_text,
        firstChoiceKeys: data?.choices?.[0] ? Object.keys(data.choices[0]) : [],
        rawKeys: Object.keys(data || {})
      };
    }
    return res.status(200).json(normalized);
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || 'Server error' });
  }
}


