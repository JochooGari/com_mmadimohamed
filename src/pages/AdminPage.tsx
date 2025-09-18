import AuthGuard from '../components/admin/AuthGuard';
import AdminEditor, { AdminEditorValues } from '../components/admin/AdminEditor';
import { useState } from 'react';
import { getSupabaseClient, tryGetSupabaseClient } from '../lib/supabase';
import { slugify } from '../lib/utils';
import AdminTable from '../components/admin/AdminTable';
import AgentsPanel from '../components/admin/AgentsPanel';
import WorkflowCanvas from '../components/admin/WorkflowCanvas';
import SeoPanel from '../components/admin/SeoPanel';
import TemplatesPanel from '../components/admin/TemplatesPanel';
import VisualGenerator from '../components/admin/VisualGenerator';

export default function AdminPage() {
  const [mode, setMode] = useState<'articles' | 'resources'>('articles');
  const [selected, setSelected] = useState<any | null>(null);
  const [topic, setTopic] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  async function onSubmit(values: AdminEditorValues) {
    const supabase = tryGetSupabaseClient();
    const base = mode === 'articles' ? 'articles' : 'resources';
    const payload: any = { ...values };
    if (values.slug) payload.slug = values.slug;
    if (values.title) payload.title = values.title;
    if (values.excerpt) payload.excerpt = values.excerpt;
    if (values?.published) payload.published_at = new Date().toISOString();
    if (supabase) {
      if (mode === 'articles') await supabase.from('articles').insert(payload);
      else await supabase.from('resources').insert(payload);
    } else {
      // save locally
      const key = mode === 'articles' ? 'local:articles' : 'local:resources';
      try {
        const raw = window.localStorage.getItem(key);
        const arr = raw ? JSON.parse(raw) : [];
        arr.unshift({ id: `${Date.now()}`, title: payload.title, slug: payload.slug, updated_at: new Date().toISOString() });
        window.localStorage.setItem(key, JSON.stringify(arr));
      } catch {}
    }
    alert('Enregistré');
  }

  return (
    <AuthGuard>
      <section className="container mx-auto px-4 py-10">
        <div className="flex items-center gap-4 mb-4">
          <button className={`px-3 py-2 border rounded ${mode==='articles'?'bg-slate-100':''}`} onClick={()=>setMode('articles')}>Articles</button>
          <button className={`px-3 py-2 border rounded ${mode==='resources'?'bg-slate-100':''}`} onClick={()=>setMode('resources')}>Ressources</button>
        </div>
        <div className="grid lg:grid-cols-[260px_1fr] gap-6 mb-6">
          <AgentsPanel onRun={(agent)=>{
            // simple hint: pre-fill topic per agent
            if (mode==='articles') setTopic(prev=> prev || `Plan d'article via agent ${agent}`);
          }} />
          <WorkflowCanvas onAIResult={(data)=>{
            const blog = data?.ghostwriter?.blog;
            const draft_md = data?.ghostwriter?.draft_md;
            if (blog) {
              setSelected({ title: blog.title_seo, slug: slugify(blog.title_seo), excerpt: blog.meta_description, content_md: draft_md });
            }
          }} />
        </div>
        {mode === 'articles' && (
          <div className="mb-4 flex items-center gap-2">
            <input className="border rounded px-3 py-2 w-full max-w-xl" placeholder="Sujet pour générer un brouillon (ex: Reporting Power BI Finance)" value={topic} onChange={(e)=>setTopic(e.target.value)} />
            <button disabled={!topic || aiLoading} onClick={async ()=>{
              try {
                setAiLoading(true);
                const res = await fetch('/api/ai-draft', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ topic, language: 'fr' }) });
                const data = await res.json();
                const blog = data?.ghostwriter?.blog;
                const draft_md = data?.ghostwriter?.draft_md;
                if (blog) {
                  setSelected({
                    title: blog.title_seo,
                    slug: slugify(blog.title_seo),
                    excerpt: blog.meta_description,
                    content_md: draft_md,
                  });
                }
              } finally {
                setAiLoading(false);
              }
            }} className="px-3 py-2 rounded bg-teal-600 text-white">{aiLoading ? 'Génération…' : 'Générer brouillon IA'}</button>
          </div>
        )}
        <div className="grid 2xl:grid-cols-[260px_1fr_320px] xl:grid-cols-[220px_1fr_300px] md:grid-cols-[1fr] gap-6">
          <div className="space-y-4">
            <AdminTable mode={mode} onSelect={setSelected} />
            <TemplatesPanel onInsert={(md)=> setSelected((prev:any)=> ({ ...(prev||{}), content_md: ((prev?.content_md||'') + (prev?.content_md?'\n\n':'') + md) }))} />
            <VisualGenerator onInsert={(md)=> setSelected((prev:any)=> ({ ...(prev||{}), content_md: ((prev?.content_md||'') + (prev?.content_md?'\n\n':'') + md) }))} />
          </div>
          <div>
            <h3 className="text-slate-700 font-semibold mb-2">{selected ? 'Édition' : 'Nouveau'} {mode === 'articles' ? 'Article' : 'Ressource'}</h3>
            <AdminEditor initial={selected ?? undefined} onSubmit={onSubmit} />
          </div>
          <SeoPanel values={{ title: selected?.title, excerpt: selected?.excerpt, content_md: selected?.content_md, keywords: [] }} />
        </div>
      </section>
    </AuthGuard>
  );
}


