import { useState, useEffect } from 'react';
import EnhancedEditorLayout from '../components/admin/enhanced-editor/EnhancedEditorLayout';
import AuthGuard from '../components/admin/AuthGuard';
import { tryGetSupabaseClient } from '../lib/supabase';

type Article = {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  status: 'draft' | 'pending' | 'approved' | 'published';
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  readTime?: number;
  seoScore?: number;
};

export default function AdminArticles() {
  const supabase = tryGetSupabaseClient();
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [draft, setDraft] = useState<Partial<Article>>({
    title: '',
    excerpt: '',
    content: '',
    tags: [],
    status: 'draft'
  });

  const slugifyLocal = (s: string) => s
    .toLowerCase()
    .normalize('NFD').replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
    .slice(0, 120);

  const upsertArticleSupabase = async (a: Article) => {
    if (!supabase) return;
    const computedSlug = slugifyLocal(a.title || '') || `article-${Date.now()}`;
    const payload: any = {
      slug: computedSlug,
      title: a.title,
      excerpt: a.excerpt,
      content_md: a.content || '',
      tags: Array.isArray(a.tags) ? a.tags : [],
      published: a.status === 'published',
      published_at: a.status === 'published' ? new Date().toISOString() : null
    };
    const { data, error } = await supabase.from('articles').upsert(payload, { onConflict: 'slug' }).select('*').single();
    if (error) throw error;
    return data;
  };

  return (
    <AuthGuard>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Articles – Éditeur IA Avancé</h1>
            <p className="text-gray-600 mt-1">Structure · Éditeur intelligent · IA/SEO/GEO</p>
          </div>
        </div>
        <EnhancedEditorLayout
          mode="articles"
          initialContent={{ title: draft.title || '', slug: '', excerpt: draft.excerpt || '', content_md: draft.content || '' }}
          onSave={(content)=> {
            setDraft(d => ({
              ...d,
              title: content?.title || d.title,
              excerpt: content?.excerpt || d.excerpt,
              content: (content?.content_html || content?.content_md || d.content)
            }));
          }}
          onSaveAction={async (content)=> {
            const now = new Date().toISOString();
            const article: Article = {
              id: selectedArticle?.id || crypto.randomUUID(),
              title: content.title || draft.title || 'Sans titre',
              excerpt: content.excerpt || '',
              content: content.content_html || content.content_md || '',
              status: 'draft',
              createdBy: selectedArticle?.createdBy || 'User',
              createdAt: selectedArticle?.createdAt || now,
              updatedAt: now,
              tags: draft.tags || []
            } as Article;
            try {
              await upsertArticleSupabase(article);
            } catch(e) {
              console.error('Save error:', e);
            }
          }}
          onPublishAction={async (content)=> {
            const now = new Date().toISOString();
            const article: Article = {
              id: selectedArticle?.id || crypto.randomUUID(),
              title: content.title || draft.title || 'Sans titre',
              excerpt: content.excerpt || '',
              content: content.content_html || content.content_md || '',
              status: 'published',
              createdBy: selectedArticle?.createdBy || 'User',
              createdAt: selectedArticle?.createdAt || now,
              updatedAt: now,
              tags: draft.tags || []
            } as Article;
            try {
              await upsertArticleSupabase(article);
            } catch (e:any) {
              alert('Erreur publication: ' + (e?.message||'unknown'));
              return;
            }
          }}
        />
      </div>
    </AuthGuard>
  );
}