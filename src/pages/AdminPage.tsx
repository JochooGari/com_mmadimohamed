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
import EnhancedEditorLayout from '../components/admin/enhanced-editor/EnhancedEditorLayout';
import { Settings } from 'lucide-react';

export default function AdminPage() {
  const [mode, setMode] = useState<'articles' | 'resources'>('articles');
  const [selected, setSelected] = useState<any | null>(null);
  const [topic, setTopic] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [useEnhancedEditor, setUseEnhancedEditor] = useState(false);

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

  // Si l'éditeur amélioré est activé, utiliser la nouvelle interface
  if (useEnhancedEditor) {
    return (
      <AuthGuard>
        <EnhancedEditorLayout
          articleId={selected?.id}
          initialContent={selected}
          onSave={onSubmit}
          mode={mode}
        />
      </AuthGuard>
    );
  }

  // Interface classique (existante)
  return (
    <AuthGuard>
      <section className="container mx-auto px-4 py-10">
        {/* Header avec switch pour l'éditeur amélioré */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <button className={`px-3 py-2 border rounded ${mode==='articles'?'bg-slate-100':''}`} onClick={()=>setMode('articles')}>Articles</button>
            <button className={`px-3 py-2 border rounded ${mode==='resources'?'bg-slate-100':''}`} onClick={()=>setMode('resources')}>Ressources</button>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">Interface :</span>
            <button
              onClick={() => setUseEnhancedEditor(false)}
              className={`px-3 py-2 text-sm rounded-md transition-colors ${
                !useEnhancedEditor
                  ? 'bg-blue-100 text-blue-800 border border-blue-300'
                  : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
              }`}
            >
              Classique
            </button>
            <button
              onClick={() => setUseEnhancedEditor(true)}
              className={`px-3 py-2 text-sm rounded-md transition-colors flex items-center gap-2 ${
                useEnhancedEditor
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
              }`}
            >
              <Settings className="w-4 h-4" />
              Éditeur IA Amélioré
              {useEnhancedEditor && <span className="text-xs bg-white/20 px-1.5 py-0.5 rounded-full">NOUVEAU</span>}
            </button>
          </div>
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

        {/* Notification pour l'éditeur amélioré */}
        <div className="mt-8 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
            <div>
              <h4 className="font-medium text-purple-900 mb-1">
                🚀 Nouvel Éditeur IA Amélioré Disponible !
              </h4>
              <p className="text-sm text-purple-700 mb-2">
                Interface révolutionnaire avec scoring SEO/GEO temps réel, assistant IA contextuel, et analytics avancés.
              </p>
              <div className="flex items-center gap-4 text-xs text-purple-600">
                <span>✨ Chat IA avec commandes /slash</span>
                <span>📊 Scoring SEO/GEO automatique</span>
                <span>🎯 Optimisations temps réel</span>
                <span>📈 Analytics concurrence</span>
              </div>
            </div>
            <button
              onClick={() => setUseEnhancedEditor(true)}
              className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-md hover:from-purple-600 hover:to-pink-600 transition-all duration-200 shadow-lg hover:shadow-xl whitespace-nowrap font-medium"
            >
              Découvrir →
            </button>
          </div>
        </div>
      </section>
    </AuthGuard>
  );
}


