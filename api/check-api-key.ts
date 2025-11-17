import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { provider } = req.body;

  if (!provider) {
    return res.status(400).json({ error: 'Provider is required' });
  }

  // Map provider to environment variable name
  const envVarMap: Record<string, string> = {
    openai: 'OPENAI_API_KEY',
    anthropic: 'ANTHROPIC_API_KEY',
    perplexity: 'PERPLEXITY_API_KEY',
    google: 'GOOGLE_AI_API_KEY',
    mistral: 'MISTRAL_API_KEY'
  };

  const envVarName = envVarMap[provider];

  if (!envVarName) {
    return res.status(400).json({
      error: 'Unknown provider',
      configured: false
    });
  }

  // Check if the environment variable is set
  const apiKey = process.env[envVarName];
  const configured = !!(apiKey && apiKey.length > 0);

  return res.status(200).json({
    provider,
    configured,
    message: configured
      ? `Clé ${envVarName} configurée`
      : `Clé ${envVarName} manquante`
  });
}
