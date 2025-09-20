// @ts-nocheck
// Scheduled by Vercel Cron (see vercel.json -> crons)

export default async function handler(req: any, res: any) {
  try {
    const base =
      process.env.SITE_URL ||
      (process.env.VERCEL_URL
        ? (process.env.VERCEL_URL.startsWith('http') ? process.env.VERCEL_URL : `https://${process.env.VERCEL_URL}`)
        : '');

    if (!base) {
      return res.status(500).json({ error: 'Missing SITE_URL/VERCEL_URL' });
    }

    const r = await fetch(`${base}/api/monitoring`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'run_now' })
    });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) {
      return res.status(r.status).json({ error: data?.error || 'monitoring failed' });
    }
    return res.status(200).json({ ok: true, result: data });
  } catch (e: any) {
    return res.status(500).json({ error: e?.message || 'cron error' });
  }
}


