import { NextApiRequest, NextApiResponse } from 'next';
import mcpHandler from './index';

// MCP Server handler pour Pages Router (compatibility)
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Convertir la requête Next.js vers le format attendu par l'adaptateur MCP
    const request = new Request(
      `${req.url?.startsWith('/') ? `http://localhost:3000${req.url}` : req.url}`,
      {
        method: req.method || 'GET',
        headers: req.headers as Record<string, string>,
        body: req.method !== 'GET' && req.method !== 'HEAD' ? JSON.stringify(req.body) : undefined
      }
    );

    // Appeler le handler MCP
    const response = await mcpHandler(request);

    // Copier les headers de la réponse
    for (const [key, value] of response.headers.entries()) {
      res.setHeader(key, value);
    }

    // Copier le status code
    res.status(response.status);

    // Copier le body
    if (response.body) {
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let result = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        result += decoder.decode(value, { stream: true });
      }

      // Déterminer si c'est du JSON ou du texte
      try {
        const json = JSON.parse(result);
        res.json(json);
      } catch {
        res.send(result);
      }
    } else {
      res.end();
    }
  } catch (error) {
    console.error('MCP Handler Error:', error);
    res.status(500).json({
      error: 'MCP server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}