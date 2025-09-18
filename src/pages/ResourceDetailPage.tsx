import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { tryGetSupabaseClient } from '../lib/supabase';
import { defaultContent } from '../data/defaultContent';
import { slugify } from '../lib/utils';
import MarkdownRenderer from '../components/markdown/MarkdownRenderer';
import Breadcrumbs from '../components/navigation/Breadcrumbs';
import SEOHead from '../components/seo/SEOHead';
import { track } from '../lib/analytics';

interface Resource {
  id: string; slug: string; title: string; excerpt?: string; tags?: string[]; category?: string; file_url?: string; thumb_url?: string; content_md?: string; published_at?: string;
}

export default function ResourceDetailPage() {
  const { slug } = useParams();
  const [resource, setResource] = useState<Resource | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [related, setRelated] = useState<Resource[]>([]);

  useEffect(() => {
    const run = async () => {
      setNotFound(false);
      const supabase = tryGetSupabaseClient();
      if (!slug) return;
      if (!supabase) {
        const r = defaultContent.resources.find((x) => slugify(x.title) === slug);
        if (r) {
          setResource({ id: r.id, slug, title: r.title, excerpt: r.description, tags: [], category: r.category });
        } else {
          setNotFound(true);
        }
        return;
      }
      const { data } = await supabase.from('resources').select('*').eq('slug', slug).maybeSingle();
      if (data) {
        setResource(data as any);
        track('view_resource', { slug });
        if (data.tags?.length) {
          const { data: rel } = await supabase.from('resources').select('id,slug,title,excerpt,tags,category').neq('slug', slug).contains('tags', data.tags).limit(6);
          setRelated((rel ?? []) as any);
        }
      } else {
        setNotFound(true);
      }
    };
    run();
  }, [slug]);

  if (notFound) return <section className="container mx-auto px-4 py-10">Introuvable</section>;
  if (!resource) return <section className="container mx-auto px-4 py-10">Chargement…</section>;

  const canonical = `${import.meta.env.SITE_URL ?? ''}/resource/${resource.slug}`;
  const jsonLd = [{
    '@context': 'https://schema.org', '@type': 'CreativeWork', name: resource.title, description: resource.excerpt, url: canonical, datePublished: resource.published_at,
  }, { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Accueil', item: `${import.meta.env.SITE_URL ?? ''}/` },
    { '@type': 'ListItem', position: 2, name: 'Bibliothèque', item: `${import.meta.env.SITE_URL ?? ''}/bibliotheque` },
    { '@type': 'ListItem', position: 3, name: resource.title, item: canonical }
  ] }];

  return (
    <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <SEOHead title={resource.title} description={resource.excerpt} canonical={canonical} jsonLd={jsonLd} />
      <Breadcrumbs items={[{ label: 'Accueil', href: '/' }, { label: 'Bibliothèque', href: '/bibliotheque' }, { label: resource.title }]} />
      <h1 className="text-3xl font-bold mb-3">{resource.title}</h1>
      {resource.excerpt && <p className="text-slate-600 mb-6">{resource.excerpt}</p>}
      {resource.content_md && <MarkdownRenderer content={resource.content_md} />}
      {/* Cette page ne montre plus d'action spécifique; la navigation directe se fait depuis les cartes */}
      {related.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-semibold mb-4">Contenus liés</h2>
          <ul className="list-disc pl-6">
            {related.map((r) => (
              <li key={r.id}><Link className="text-teal-700 hover:underline" to={`/resource/${r.slug}`}>{r.title}</Link></li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}


