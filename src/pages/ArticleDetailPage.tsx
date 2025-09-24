import { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { tryGetSupabaseClient } from '../lib/supabase';
import { defaultContent } from '../data/defaultContent';
import { slugify } from '../lib/utils';
import MarkdownRenderer from '../components/markdown/MarkdownRenderer';
import SiteSidebar from '../components/SiteSidebar';
import Breadcrumbs from '../components/navigation/Breadcrumbs';
import SEOHead from '../components/seo/SEOHead';
import { track } from '../lib/analytics';

interface Article { id: string; slug: string; title: string; excerpt?: string; content_md?: string; tags?: string[]; cover_url?: string; published_at?: string }

export default function ArticleDetailPage() {
  const { slug } = useParams();
  const [article, setArticle] = useState<Article | null>(null);
  const [related, setRelated] = useState<Article[]>([]);
  const progressRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const run = async () => {
      const supabase = tryGetSupabaseClient();
      if (!supabase) { setArticle(null); return; }
      const { data } = await supabase.from('articles').select('*').eq('slug', slug).maybeSingle();
      if (data) {
        setArticle(data as any);
        track('view_article', { slug });
        if (data.tags?.length) {
          const { data: rel } = await supabase.from('articles').select('id,slug,title,excerpt,tags').neq('slug', slug).contains('tags', data.tags).limit(6);
          setRelated((rel ?? []) as any);
        }
      }
    };
    run();
  }, [slug]);

  useEffect(() => {
    const onScroll = () => {
      const el = contentRef.current;
      const bar = progressRef.current;
      if (!el || !bar) return;
      const top = el.getBoundingClientRect().top + window.scrollY;
      const height = el.offsetHeight;
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const denom = Math.max(1, height - window.innerHeight);
      const progress = Math.min(1, Math.max(0, (scrollTop - top) / denom));
      bar.style.width = `${progress * 100}%`;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    onScroll();
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  if (!article) {
    const a = defaultContent.blog.find((x) => slugify(x.title) === slug);
    if (a) {
      const local: Article = { id: a.id, slug: slug!, title: a.title, excerpt: a.excerpt, content_md: a.content ?? undefined, tags: a.tags };
      setArticle(local);
      // Éviter l'accès à article.* dans ce render; attendre le prochain render
      return <section className="container mx-auto px-4 py-10">Chargement...</section>;
    } else {
      return <section className="container mx-auto px-4 py-10">Introuvable</section>;
    }
  }

  const canonical = `${import.meta.env.SITE_URL ?? ''}/blog/${article.slug}`;
  const jsonLd = [{ '@context': 'https://schema.org', '@type': 'BlogPosting', headline: article.title, description: article.excerpt, datePublished: article.published_at, image: article.cover_url, mainEntityOfPage: canonical }, { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [ { '@type': 'ListItem', position: 1, name: 'Accueil', item: `${import.meta.env.SITE_URL ?? ''}/` }, { '@type': 'ListItem', position: 2, name: 'Blog', item: `${import.meta.env.SITE_URL ?? ''}/blog` }, { '@type': 'ListItem', position: 3, name: article.title, item: canonical } ] }];

  return (
    <section className="article-page container mx-auto px-4 py-10">
      <div className="read-progress" ref={progressRef} />
      <SEOHead title={article.title} description={article.excerpt} canonical={canonical} ogImage={article.cover_url} jsonLd={jsonLd} />
      <div className="max-w-7xl mx-auto">
        <Breadcrumbs items={[{ label: 'Accueil', href: '/' }, { label: 'Blog', href: '/blog' }, { label: article.title }]} />
        <header className="mb-6">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 mb-3">{article.title}</h1>
          {article.excerpt && <p className="text-slate-600 text-lg">{article.excerpt}</p>}
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_400px] gap-6">
          <div>
            <div ref={contentRef} className="content-wrapper neil-patel-style max-w-[1280px] mx-auto">
              <article>
                {article.content_md && (/^\s*<[^>]+>/.test(article.content_md)
                  ? (
                    <div
                      className="article-body"
                      dangerouslySetInnerHTML={{ __html: article.content_md }}
                    />
                  ) : (
                    <div className="article-body">
                      <MarkdownRenderer content={article.content_md} />
                    </div>
                  )
                )}
              </article>
            </div>
          </div>
          <div>
            <SiteSidebar />
          </div>
        </div>

        {related.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-semibold mb-4">Articles liés</h2>
            <ul className="list-disc pl-6">
              {related.map((r) => (
                <li key={r.id}><Link className="text-teal-700 hover:underline" to={`/blog/${r.slug}`}>{r.title}</Link></li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}


