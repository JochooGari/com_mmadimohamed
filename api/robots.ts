export const config = { runtime: 'edge' };

export default async function handler() {
  const base = process.env.SITE_URL || 'https://example.com';
  const body = `User-agent: *\nAllow: /\nSitemap: ${base}/sitemap.xml\n`;
  return new Response(body, { headers: { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'public, max-age=3600' } });
}


