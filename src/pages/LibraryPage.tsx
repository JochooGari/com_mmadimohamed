import { useMemo, useState } from 'react';
import FiltersBar from '../components/library/FiltersBar';
import ResourceCard from '../components/library/ResourceCard';
import { useResources } from '../hooks/useSupabaseLists';
import { defaultContent } from '../data/defaultContent';
import { slugify } from '../lib/utils';
import SEOHead from '../components/seo/SEOHead';

const CATEGORIES = ['Pharma', 'Marketing', 'Sales'];

export default function LibraryPage() {
  const [q, setQ] = useState('');
  const [category, setCategory] = useState<string | undefined>();
  const [tags, setTags] = useState<string[]>([]);
  const [sort, setSort] = useState<'recent' | 'popular'>('recent');
  const [page, setPage] = useState(1);
  const pageSize = 12;

  const { data, isLoading } = useResources({ q, category, tags, sort, page, pageSize });
  const fallbackItems = defaultContent.resources.map((r) => ({
    id: r.id,
    slug: slugify(r.title),
    title: r.title,
    excerpt: r.description,
    category: r.category,
    tags: [],
    downloads: r.downloadCount,
  }));
  const items = (data?.items?.length ? data.items : fallbackItems) as any[];
  const totalPages = useMemo(() => Math.max(1, Math.ceil(((data?.count ?? items.length) / pageSize))), [data?.count, items.length]);

  const canonical = `${import.meta.env.SITE_URL ?? ''}/bibliotheque`;
  const jsonLd = [{ '@context': 'https://schema.org', '@type': 'Collection', name: 'Bibliothèque de ressources', url: canonical }];

  return (
    <section>
      <div className="bg-teal-600 text-white py-10 mt-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold mb-3">Bibliothèque</h1>
          <p className="opacity-90 max-w-4xl">
            Une sélection de guides, templates, checklists et outils pour gagner du temps avec Power BI et structurer vos projets data. 
            Chaque ressource est pensée pour être immédiatement actionnable: configuration pas à pas, bonnes pratiques DAX, modèles réutilisables et astuces performance. 
            Filtrez par catégorie ou tags, triez par popularité ou nouveauté, et explorez les contenus liés pour bâtir une base solide et durable.
          </p>
        </div>
      </div>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <SEOHead title="Bibliothèque Power BI — Guides & Templates" description="Guides, templates et outils Power BI pour accélérer vos projets data." canonical={canonical} jsonLd={jsonLd} />
      <FiltersBar q={q} onQChange={setQ} category={category} onCategoryChange={setCategory} tags={tags} onTagsChange={setTags} sort={sort} onSortChange={setSort} categories={CATEGORIES} availableTags={["Power BI","DAX","Template"]} />
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {isLoading && <div>Chargement…</div>}
        {!isLoading && items.map((r) => <ResourceCard key={r.id} item={r as any} />)}
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


