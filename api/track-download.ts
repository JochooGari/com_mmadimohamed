import { createClient } from '@supabase/supabase-js';

export const config = { runtime: 'edge' };

export default async function handler(req: Request) {
  const url = new URL(req.url);
  const id = url.searchParams.get('id');
  if (!id) return new Response('Bad Request', { status: 400 });

  const supabase = createClient(process.env.VITE_SUPABASE_URL as string, process.env.SUPABASE_SERVICE_ROLE as string);
  // Get file_url for the resource
  const { data: res, error } = await supabase.from('resources').select('file_url').eq('id', id).maybeSingle();
  if (error || !res?.file_url) return new Response('Not Found', { status: 404 });

  // increment downloads
  await supabase.rpc('increment_downloads', { resource_id: id }).catch(async () => {
    await supabase.from('resources').update({ downloads: (undefined as any) }).eq('id', id);
  });

  // If file_url is a Supabase Storage path (e.g. bucket/path.ext), sign it
  let redirectUrl = res.file_url as string;
  if (!/^https?:\/\//i.test(redirectUrl) && redirectUrl.includes('/')) {
    const [bucket, ...rest] = redirectUrl.split('/');
    const path = rest.join('/');
    const { data: signed } = await (supabase.storage.from(bucket).createSignedUrl(path, 60 * 10) as any);
    if (signed?.signedUrl) redirectUrl = signed.signedUrl;
  }

  return new Response(null, { status: 302, headers: { Location: redirectUrl } });
}


