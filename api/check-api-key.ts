import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { provider } = req.body;

  if (!provider) {
    return res.status(400).json({ error: 'Provider is required' });
  }

  // Map provider to possible environment variable names (in priority order)
  const envVarMap: Record<string, string[]> = {
    openai: ['OPENAI_API_KEY'],
    anthropic: ['ANTHROPIC_API_KEY'],
    perplexity: ['PERPLEXITY_API_KEY'],
    google: ['GEMINI_API_KEY', 'GOOGLE_AI_API_KEY', 'GOOGLE_API_KEY'],
    mistral: ['MISTRAL_API_KEY']
  };

  const envVarNames = envVarMap[provider];

  if (!envVarNames) {
    return res.status(400).json({
      error: 'Unknown provider',
      configured: false
    });
  }

  // Check multiple possible env var names
  let apiKey: string | undefined;
  let foundEnvVar: string | undefined;
  for (const name of envVarNames) {
    if (process.env[name]) {
      apiKey = process.env[name];
      foundEnvVar = name;
      break;
    }
  }
  const configured = !!(apiKey && apiKey.length > 0);

  return res.status(200).json({
    provider,
    configured,
    message: configured
      ? `Clé ${foundEnvVar} configurée`
      : `Clé ${envVarNames[0]} manquante`
  });
}
