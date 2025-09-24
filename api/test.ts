import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  return res.status(200).json({
    message: '✅ API is working!',
    timestamp: new Date().toISOString(),
    method: req.method,
    path: req.url,
    vercel: {
      region: process.env.VERCEL_REGION || 'local',
      url: process.env.VERCEL_URL || 'localhost:3000'
    }
  });
}