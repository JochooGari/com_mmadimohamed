import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-seed-token');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const token = (req.headers['x-seed-token'] as string) || (req.query.token as string);
  const expected = process.env.ADMIN_SEED_TOKEN;
  if (!expected || token !== expected) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    return res.status(500).json({ error: 'Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY' });
  }

  const supabase = createClient(supabaseUrl, serviceKey);

  const email = (req.body?.email as string) || 'test@test.com';
  const password = (req.body?.password as string) || '1234test';

  try {
    // Vérifier si l'utilisateur existe déjà
    const list = await supabase.auth.admin.listUsers({ page: 1, perPage: 200 });
    if (list?.data?.users?.some(u => u.email?.toLowerCase() === email.toLowerCase())) {
      return res.status(200).json({ ok: true, created: false, message: 'User already exists' });
    }

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    if (error) return res.status(400).json({ error: error.message });
    return res.status(200).json({ ok: true, created: true, userId: data.user?.id });
  } catch (e: any) {
    return res.status(500).json({ error: e?.message || 'Unknown error' });
  }
}



