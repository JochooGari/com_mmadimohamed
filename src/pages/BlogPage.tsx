import { useMemo, useState } from 'react';
import ArticleCard from '../components/blog/ArticleCard';
import FiltersBar from '../components/library/FiltersBar';
import { useArticles } from '../hooks/useSupabaseLists';
import { defaultContent } from '../data/defaultContent';
import { slugify } from '../lib/utils';
import SEOHead from '../components/seo/SEOHead';

export default function BlogPage() {
  const [q, setQ] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [sort, setSort] = useState<'recent' | 'popular'>('recent');
  const [page, setPage] = useState(1);
  const pageSize = 12;

  const { data, isLoading } = useArticles({ q, tags, sort, page, pageSize });
  const fallbackItems = defaultContent.blog.map((a) => ({
    id: a.id,
    slug: slugify(a.title),
    title: a.title,
    excerpt: a.excerpt,
    tags: a.tags,
    cover_url: a.image && a.image.length ? a.image : undefined,
  }));
  const items = (data?.items?.length ? data.items : fallbackItems) as any[];
  const totalPages = useMemo(() => Math.max(1, Math.ceil(((data?.count ?? items.length) / pageSize))), [data?.count, items.length]);

  const canonical = `${import.meta.env.SITE_URL ?? ''}/blog`;
  const jsonLd = [{ '@context': 'https://schema.org', '@type': 'Blog', name: 'Blog', url: canonical }];

  return (
    <section>
      <div className="bg-teal-600 text-white py-10 mt-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold mb-3">Blog</h1>
          <p className="opacity-90 max-w-4xl">
            Découvrez des articles clairs et directement actionnables sur Power BI, la modélisation DAX, la performance des rapports et la gouvernance des données. 
            Chaque contenu va à l’essentiel: principes éprouvés, exemples concrets et process simples à mettre en place en équipe. 
            Vous trouverez des tutos, des bonnes pratiques de visualisation, des retours d’expérience et des conseils SEO éditoriaux pour publier plus vite, mieux, et durablement. 
            L’objectif: vous aider à livrer des dashboards utiles et performants tout en évitant les pièges courants (dette technique, lenteurs, “reporting pour le reporting”).
          </p>
        </div>
      </div>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <SEOHead title="Blog Power BI et Data" description="Articles utiles sur Power BI, DAX, performance, UX data et stratégie contenu." canonical={canonical} jsonLd={jsonLd} />
      <FiltersBar q={q} onQChange={setQ} category={undefined} onCategoryChange={()=>{}} tags={tags} onTagsChange={setTags} sort={sort} onSortChange={setSort} categories={[]} availableTags={["Power BI","DAX","DataOps"]} />
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {isLoading && <div>Chargement…</div>}
        {!isLoading && items.map((a) => <ArticleCard key={a.id} item={a as any} />)}
      </div>
      <div className="flex justify-center gap-2 mt-8">
        <button className="px-3 py-2 border rounded" disabled={page<=1} onClick={() => setPage((p)=>p-1)}>Précédent</button>
        <span>Page {page} / {totalPages}</span>
        <button className="px-3 py-2 border rounded" disabled={page>=totalPages} onClick={() => setPage((p)=>p+1)}>Suivant</button>
      </div>
      </div>
    </section>
  );
}


