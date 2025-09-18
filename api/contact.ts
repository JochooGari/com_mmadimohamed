import { createClient } from '@supabase/supabase-js';

export const config = { runtime: 'edge' };

export default async function handler(req: Request) {
  if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });
  const { name, email, body } = await req.json().catch(() => ({}));
  if (!name || !email || !body) return new Response('Bad Request', { status: 400 });

  const supabase = createClient(process.env.VITE_SUPABASE_URL as string, process.env.SUPABASE_SERVICE_ROLE as string);
  const { error } = await supabase.from('messages').insert({ name, email, body });
  if (error) return new Response('DB error', { status: 500 });

  // Optional: send email via Resend
  try {
    if (process.env.RESEND_API_KEY) {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ from: 'Site <noreply@domain.com>', to: ['you@domain.com'], subject: 'Nouveau message', html: `<p><b>${name}</b> (${email})</p><p>${body}</p>` })
      });
    }
  } catch {}

  return new Response(null, { status: 204 });
}


