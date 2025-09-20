import { createClient } from '@supabase/supabase-js';

export const config = { runtime: 'edge' };

function xmlUrl(loc: string, lastmod?: string) {
  return `<url><loc>${loc}</loc>${lastmod ? `<lastmod>${lastmod}</lastmod>` : ''}</url>`;
}

export default async function handler(req: Request) {
  const url = new URL(req.url);
  const type = url.searchParams.get('type');
  const base = process.env.SITE_URL || process.env.VERCEL_URL?.startsWith('http') ? (process.env.VERCEL_URL as string) : `https://${process.env.VERCEL_URL}`;

  const supabase = createClient(
    (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL) as string,
    (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE) as string
  );

  if (!type) {
    const body = `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <sitemap><loc>${base}/sitemap-articles.xml</loc></sitemap>\n  <sitemap><loc>${base}/sitemap-ressources.xml</loc></sitemap>\n</sitemapindex>`;
    return new Response(body, { headers: { 'content-type': 'application/xml', 'cache-control': 'public, s-maxage=21600, stale-while-revalidate=21600' } });
  }

  if (type === 'articles' || url.pathname.endsWith('sitemap-articles.xml')) {
    const { data } = await supabase.from('articles').select('slug, updated_at').eq('published', true).order('updated_at', { ascending: false }).limit(5000);
    const items = (data ?? []).map((r) => xmlUrl(`${base}/blog/${r.slug}`, r.updated_at)).join('');
    const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${items}</urlset>`;
    return new Response(body, { headers: { 'content-type': 'application/xml', 'cache-control': 'public, s-maxage=21600' } });
  }

  if (type === 'resources' || url.pathname.endsWith('sitemap-ressources.xml')) {
    const { data } = await supabase.from('resources').select('slug, updated_at').eq('published', true).order('updated_at', { ascending: false }).limit(5000);
    const items = (data ?? []).map((r) => xmlUrl(`${base}/resource/${r.slug}`, r.updated_at)).join('');
    const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${items}</urlset>`;
    return new Response(body, { headers: { 'content-type': 'application/xml', 'cache-control': 'public, s-maxage=21600' } });
  }

  return new Response('Not found', { status: 404 });
}


