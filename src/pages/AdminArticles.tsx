import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { 
  FileText, 
  Plus, 
  Edit3, 
  Trash2, 
  Eye, 
  Save,
  Search,
  Filter,
  Calendar,
  User,
  Clock,
  BarChart3,
  Bot,
  AlertCircle
} from 'lucide-react';
import { useAdminData } from '../context/AdminDataContext';
import { tryGetSupabaseClient } from '../lib/supabase';
import EnhancedEditorLayout from '../components/admin/enhanced-editor/EnhancedEditorLayout';
import AuthGuard from '../components/admin/AuthGuard';

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

const SAMPLE_ARTICLES: Article[] = [
  {
    id: '1',
    title: 'Guide Power BI : Optimisation des performances',
    excerpt: 'Découvrez les meilleures pratiques pour améliorer les performances de vos rapports Power BI',
    content: '<h1>Guide Power BI : Optimisation des performances</h1><p>Power BI est un outil...</p>',
    status: 'published',
    createdBy: 'Agent Ghostwriter',
    createdAt: '2025-01-15T10:30:00Z',
    updatedAt: '2025-01-15T14:30:00Z',
    tags: ['Power BI', 'Performance', 'Guide'],
    readTime: 8,
    seoScore: 85
  }
];

export default function AdminArticles() {
  const admin = useAdminData();
  const supabase = tryGetSupabaseClient();
  const [useEnhancedEditor, setUseEnhancedEditor] = useState<boolean>(false);
  const [articles, setArticles] = useState<Article[]>(SAMPLE_ARTICLES);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showForm, setShowForm] = useState(false);
  
  const [draft, setDraft] = useState<Partial<Article>>({
    title: '',
    excerpt: '',
    content: '',
    tags: [],
    status: 'draft'
  });
  const [editorTab, setEditorTab] = useState<'html'|'preview'>('html');
  const [liveScore, setLiveScore] = useState<{ scores?: { seo?: number; geo?: number }; fixes?: string[]; strengths?: string[]; weaknesses?: string[] }>({});
  const [chatMessages, setChatMessages] = useState<{role:'user'|'assistant'|'system'; content:string}[]>([
    { role:'system', content: 'Tu es un assistant éditorial SEO/GEO senior. Tu proposes des recommandations concrètes (titres Hn, liens FR/EU, CTA, FAQ, JSON-LD) et tu fournis des extraits HTML prêts à insérer.' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [chatOpen, setChatOpen] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<{ type:'success'|'error'|'info'; text:string }|null>(null);

  // Ctrl+S to save
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        if (showForm) {
          e.preventDefault();
          handleSaveArticle();
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [showForm, draft]);

  // Toggle from URL (?editor=pro)
  useEffect(() => {
    try {
      const p = new URLSearchParams(window.location.search);
      if (p.get('editor') === 'pro') setUseEnhancedEditor(true);
    } catch {}
  }, []);

  // Load from Supabase
  useEffect(() => { (async () => {
    if (!supabase) return;
    const { data, error } = await supabase.from('articles').select('*').order('updated_at', { ascending:false }).limit(200);
    if (!error && Array.isArray(data)) {
      const rows: Article[] = data.map((r:any) => ({
        id: r.id,
        title: r.title,
        excerpt: r.excerpt || '',
        content: (r.content_md || (typeof r.content === 'string' ? r.content : (r.content?.html || '')) || ''),
        status: r.published ? 'published' : 'draft',
        createdBy: r.author_id || 'User',
        createdAt: r.created_at,
        updatedAt: r.updated_at,
        tags: r.tags || [],
        readTime: Math.ceil(((r.content_md || (typeof r.content==='string'? r.content : (r.content?.html||''))||'')).length / 1000),
        seoScore: undefined
      }));
      setArticles(rows);
    }
  })(); }, [supabase]);

  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || article.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'approved': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'published': return 'Publié';
      case 'approved': return 'Approuvé';
      case 'pending': return 'En attente';
      case 'draft': return 'Brouillon';
      default: return status;
    }
  };

  const getSeoScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

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

  const handleSaveArticle = async () => {
    if (!draft.title?.trim()) return;
    const now = new Date().toISOString();
    const article: Article = {
      id: selectedArticle?.id || crypto.randomUUID(),
      title: draft.title!,
      excerpt: draft.excerpt || '',
      content: draft.content || '',
      status: (draft.status as Article['status']) || 'draft',
      createdBy: selectedArticle?.createdBy || 'User',
      createdAt: selectedArticle?.createdAt || now,
      updatedAt: now,
      tags: draft.tags || [],
      readTime: Math.ceil((draft.content?.length || 0) / 1000),
      seoScore: selectedArticle?.seoScore
    };
    try { 
      setSaving(true); setSaveMsg({ type:'info', text:'Sauvegarde en cours…' });
      const saved = await upsertArticleSupabase(article);
      if (saved?.id) article.id = saved.id;
      setSaveMsg({ type:'success', text:'Article sauvegardé.' });
    } catch (e:any) { 
      setSaveMsg({ type:'error', text:'Erreur sauvegarde: ' + (e?.message||'unknown') });
    }
    setSaving(false);
    if (selectedArticle) setArticles(prev => prev.map(a => a.id === selectedArticle.id ? article : a)); else setArticles(prev => [article, ...prev]);
    setDraft({}); setSelectedArticle(null); setIsEditing(false); setShowForm(false);
  };

  const handlePublishArticle = async () => {
    if (!draft.title?.trim()) return;
    const now = new Date().toISOString();
    const article: Article = {
      id: selectedArticle?.id || crypto.randomUUID(),
      title: draft.title!,
      excerpt: draft.excerpt || '',
      content: draft.content || '',
      status: 'published',
      createdBy: selectedArticle?.createdBy || 'User',
      createdAt: selectedArticle?.createdAt || now,
      updatedAt: now,
      tags: draft.tags || [],
      readTime: Math.ceil((draft.content?.length || 0) / 1000),
      seoScore: selectedArticle?.seoScore
    };
    try { 
      setSaving(true); setSaveMsg({ type:'info', text:'Publication…' });
      await upsertArticleSupabase(article);
      setSaveMsg({ type:'success', text:'Article publié.' });
    } catch (e:any) { setSaveMsg({ type:'error', text:'Erreur publication: ' + (e?.message||'unknown') }); setSaving(false); return; }
    setSaving(false);
    setArticles(prev => [article, ...prev.filter(a => a.id !== article.id)]);
    setDraft({}); setSelectedArticle(null); setIsEditing(false); setShowForm(false);
  };

  const handleDeleteArticle = async (id: string) => {
    try { if (supabase) { await supabase.from('articles').delete().eq('id', id); } } catch (e:any) { console.warn('Supabase delete failed', e?.message); }
    setArticles(prev => prev.filter(a => a.id !== id));
  };

  const generateAIArticle = async () => {
    const aiArticle = {
      title: 'Article généré par IA : Tendances Data 2025',
      excerpt: 'Découvrez les principales tendances en matière de données pour 2025',
      content: '<h1>Tendances Data 2025</h1><p>Les données continuent de transformer...</p>',
      tags: ['Data', 'Tendances', '2025'],
      status: 'draft' as const,
      createdBy: 'Agent IA'
    };
    
    setDraft(aiArticle);
    setShowForm(true);
    setIsEditing(false);
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateString));
  };

  const calcScore = async () => {
    try {
      const r = await fetch('/api/geo', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ action:'score_live', html: draft.content || '' }) });
      if (!r.ok) throw new Error(await r.text());
      const d = await r.json();
      setLiveScore(d);
    } catch (e:any) {
      alert('Erreur scoring: ' + (e?.message||'unknown'));
    }
  };

  const sendChat = async () => {
    if (!chatInput.trim()) return;
    const next = [...chatMessages, { role:'user' as const, content: chatInput }];
    setChatMessages(next);
    setChatInput('');
    setChatLoading(true);
    try {
      const messages = [
        ...next,
        { role:'system' as const, content: `Contexte article HTML actuel:\n${draft.content || ''}\n\nTu proposes: recommandations SEO/GEO, liens FR/EU, sources autoritaires, complétions de paragraphes, CTAs contextuels, FAQ, et JSON-LD. Réponds en sections claires avec extraits HTML prêts à insérer.` }
      ];
      const r = await fetch('/api/ai-proxy', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ provider:'perplexity', model:'sonar', messages, temperature:0.3, maxTokens:900 }) });
      const d = await r.json();
      const text = (d?.content || d?.choices?.[0]?.message?.content || '').trim();
      setChatMessages(prev => [...prev, { role:'assistant', content: text }]);
    } catch (e:any) {
      setChatMessages(prev => [...prev, { role:'assistant', content: 'Erreur IA: ' + (e?.message||'unknown') }]);
    } finally {
      setChatLoading(false);
    }
  };

  const insertLastAssistant = () => {
    const last = [...chatMessages].reverse().find(m => m.role === 'assistant');
    if (!last) return;
    setDraft(d => ({ ...d, content: (d.content || '') + '\n' + last.content }));
  };

  // If enhanced editor is enabled, render it inside Articles page
  if (useEnhancedEditor) {
    return (
      <AuthGuard>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Articles – Éditeur IA Amélioré</h1>
              <p className="text-gray-600 mt-1">Structure · Éditeur intelligent · IA/SEO/GEO</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={()=> setUseEnhancedEditor(false)}>Revenir à l’éditeur classique</Button>
            </div>
          </div>
          <EnhancedEditorLayout
            mode="articles"
            initialContent={{ title: draft.title || '', slug: '', excerpt: draft.excerpt || '', content_md: draft.content || '' }}
            onSave={(content)=> { setDraft(d => ({ ...d, title: content?.title || d.title, excerpt: content?.excerpt || d.excerpt, content: (content?.content_html || content?.content_md || d.content) })); }}
            onSaveAction={async (content)=> {
              const now = new Date().toISOString();
              const article: Article = { id: selectedArticle?.id || crypto.randomUUID(), title: content.title || draft.title || 'Sans titre', excerpt: content.excerpt || '', content: content.content_html || content.content_md || '', status: 'draft', createdBy: selectedArticle?.createdBy || 'User', createdAt: selectedArticle?.createdAt || now, updatedAt: now, tags: draft.tags || [] } as Article;
              try { await upsertArticleSupabase(article); } catch {}
            }}
            onPublishAction={async (content)=> {
              const now = new Date().toISOString();
              const article: Article = { id: selectedArticle?.id || crypto.randomUUID(), title: content.title || draft.title || 'Sans titre', excerpt: content.excerpt || '', content: content.content_html || content.content_md || '', status: 'published', createdBy: selectedArticle?.createdBy || 'User', createdAt: selectedArticle?.createdAt || now, updatedAt: now, tags: draft.tags || [] } as Article;
              try { await upsertArticleSupabase(article); } catch (e:any) { alert('Erreur publication: ' + (e?.message||'unknown')); return; }
            }}
          />
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gestion des Articles</h1>
            <p className="text-gray-600 mt-1">Créez, éditez et publiez vos articles de blog</p>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" onClick={generateAIArticle}>
              <Bot className="w-4 h-4 mr-2" />
              Générer avec IA
            </Button>
            <Button onClick={() => { setShowForm(true); setDraft({}); setSelectedArticle(null); setIsEditing(false); }}>
              <Plus className="w-4 h-4 mr-2" />
              Nouveau Article
            </Button>
            <Button variant="outline" onClick={()=> setUseEnhancedEditor(true)}>Éditeur IA Amélioré</Button>
          </div>
        </div>

        <Tabs defaultValue="list" className="space-y-6">
          <TabsList>
            <TabsTrigger value="list">Liste des Articles</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Article List Tab */}
          <TabsContent value="list" className="space-y-6">
            {/* Filters */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <Input
                        placeholder="Rechercher des articles..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Filter className="w-4 h-4 text-gray-500" />
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                      <option value="all">Tous les statuts</option>
                      <option value="draft">Brouillons</option>
                      <option value="pending">En attente</option>
                      <option value="approved">Approuvés</option>
                      <option value="published">Publiés</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Article Form */}
            {showForm && (
              <Card className="border-teal-200 bg-teal-50/50 relative">
                {/* Sticky actions bar */}
                <div className="sticky top-0 z-10 bg-teal-50/90 border-b px-4 py-3 flex flex-wrap gap-2 items-center justify-between">
                  <div className="font-medium text-sm text-gray-700">
                    {isEditing ? 'Modification' : 'Nouvel article'} · {draft.title || 'Sans titre'}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" onClick={handleSaveArticle} className="bg-teal-600 hover:bg-teal-700" disabled={saving}>
                      <Save className="w-3 h-3 mr-2" /> {saving ? 'En cours…' : 'Sauvegarder (Ctrl+S)'}
                    </Button>
                    <Button size="sm" variant="outline" onClick={handlePublishArticle} disabled={saving}>Marquer publié</Button>
                    <Button size="sm" variant="outline" onClick={calcScore} disabled={saving}>Calculer scoring & reco</Button>
                    <Button size="sm" onClick={handlePublishArticle} className="bg-green-600 hover:bg-green-700" disabled={saving}>Publier</Button>
                    <Button size="sm" variant="outline" onClick={()=> setShowForm(false)}>Fermer</Button>
                  </div>
                </div>

                <CardHeader>
                  <CardTitle>
                    {isEditing ? 'Modifier l\'article' : 'Nouveau article'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {saveMsg && (
                    <div className={`text-sm rounded border px-3 py-2 ${saveMsg.type==='success'?'bg-green-50 border-green-200 text-green-700': saveMsg.type==='error'?'bg-red-50 border-red-200 text-red-700':'bg-amber-50 border-amber-200 text-amber-700'}`}>{saveMsg.text}</div>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 block mb-1">
                        Titre
                      </label>
                      <Input
                        placeholder="Titre de l'article"
                        value={draft.title || ''}
                        onChange={(e) => setDraft(d => ({ ...d, title: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 block mb-1">
                        Statut
                      </label>
                      <select
                        value={draft.status || 'draft'}
                        onChange={(e) => setDraft(d => ({ ...d, status: e.target.value as Article['status'] }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                      >
                        <option value="draft">Brouillon</option>
                        <option value="pending">En attente de validation</option>
                        <option value="approved">Approuvé</option>
                        <option value="published">Publié</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">
                      Extrait
                    </label>
                    <Textarea
                      placeholder="Résumé de l'article (méta description)"
                      value={draft.excerpt || ''}
                      onChange={(e) => setDraft(d => ({ ...d, excerpt: e.target.value }))}
                      rows={2}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-2">
                      Contenu (HTML)
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-xs text-gray-500">Éditeur HTML</div>
                          <div className="space-x-2">
                            <Button size="sm" variant="outline" onClick={()=> setEditorTab('html')} disabled={editorTab==='html'}>Éditer</Button>
                            <Button size="sm" variant="outline" onClick={()=> setEditorTab('preview')} disabled={editorTab==='preview'}>Prévisualiser</Button>
                          </div>
                        </div>
                        <Textarea
                          placeholder="<h1>Titre</h1>\n<p>Votre contenu HTML…</p>"
                          value={draft.content || ''}
                          onChange={(e) => setDraft(d => ({ ...d, content: e.target.value }))}
                          rows={editorTab==='html' ? 16 : 8}
                          className="font-mono text-sm"
                        />
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-2">Preview</div>
                        <div className="border rounded p-3 bg-white min-h-[260px] text-sm prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: draft.content || '' }} />
                      </div>
                    </div>
                  </div>

                  {(liveScore?.scores || liveScore?.fixes) && (
                    <div className="rounded border p-3 bg-white space-y-2">
                      <div className="text-sm">SEO: {liveScore?.scores?.seo ?? '—'} / GEO: {liveScore?.scores?.geo ?? '—'}</div>
                      {liveScore?.strengths && (
                        <div>
                          <div className="text-xs font-semibold mb-1">Points forts</div>
                          <ul className="list-disc ml-5 text-sm">{(liveScore.strengths||[]).map((s,i)=> (<li key={i}>{s}</li>))}</ul>
                        </div>
                      )}
                      {liveScore?.weaknesses && (
                        <div>
                          <div className="text-xs font-semibold mb-1">Points d\'amélioration</div>
                          <ul className="list-disc ml-5 text-sm">{(liveScore.weaknesses||[]).map((s,i)=> (<li key={i}>{s}</li>))}</ul>
                        </div>
                      )}
                      {liveScore?.fixes && (
                        <div>
                          <div className="text-xs font-semibold mb-1">Recommandations</div>
                          <ul className="list-disc ml-5 text-sm">{(liveScore.fixes||[]).map((s,i)=> (<li key={i}>{s}</li>))}</ul>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Chat IA collapsible */}
                  <Card className="mt-4">
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle>Assistant IA – Recommandations & complétions</CardTitle>
                      <Button size="sm" variant="outline" onClick={()=> setChatOpen(v=> !v)}>{chatOpen ? 'Masquer' : 'Afficher'}</Button>
                    </CardHeader>
                    {chatOpen && (
                      <CardContent className="space-y-3">
                        <div className="border rounded p-3 bg-white h-64 overflow-auto text-sm">
                          {chatMessages.filter(m=> m.role!=='system').map((m, i)=> (
                            <div key={i} className={`mb-2 ${m.role==='assistant' ? 'text-gray-800' : 'text-gray-700'}`}>
                              <span className="font-medium mr-2">{m.role==='assistant' ? 'IA' : 'Vous'}:</span>
                              <span dangerouslySetInnerHTML={{ __html: m.content.replace(/\n/g,'<br/>') }} />
                            </div>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <Input value={chatInput} onChange={(e)=> setChatInput(e.target.value)} placeholder="Demander des liens, sources, compléter un paragraphe…" />
                          <Button onClick={sendChat} disabled={chatLoading}>{chatLoading ? 'Envoi…' : 'Envoyer'}</Button>
                          <Button variant="outline" onClick={insertLastAssistant}>Insérer la dernière réponse</Button>
                        </div>
                      </CardContent>
                    )}
                  </Card>
                </CardContent>
              </Card>
            )}

            {/* Articles Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredArticles.map((article) => (
                <Card key={article.id} className="hover:shadow-lg transition-shadow duration-200">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-base line-clamp-2 mb-2">
                          {article.title}
                        </CardTitle>
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge className={getStatusColor(article.status)}>
                            {getStatusLabel(article.status)}
                          </Badge>
                          {article.seoScore && (
                            <Badge variant="outline" className={getSeoScoreColor(article.seoScore)}>
                              SEO: {article.seoScore}%
                            </Badge>
                          )}
                        </div>
                      </div>
                      <FileText className="w-5 h-5 text-teal-500 ml-2" />
                    </div>
                  </CardHeader>

                  <CardContent>
                    <p className="text-sm text-gray-600 line-clamp-3 mb-4">
                      {article.excerpt}
                    </p>

                    <div className="space-y-3">
                      {article.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {article.tags.slice(0, 3).map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {article.tags.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{article.tags.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}

                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center space-x-3">
                          <span className="flex items-center">
                            <User className="w-3 h-3 mr-1" />
                            {article.createdBy}
                          </span>
                          {article.readTime && (
                            <span className="flex items-center">
                              <Clock className="w-3 h-3 mr-1" />
                              {article.readTime} min
                            </span>
                          )}
                        </div>
                        <span className="flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          {formatDate(article.updatedAt)}
                        </span>
                      </div>

                      <div className="flex space-x-2 pt-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => { setSelectedArticle(article); setDraft(article); setIsEditing(true); setShowForm(true); }}
                        >
                          <Edit3 className="w-3 h-3 mr-1" />
                          Éditer
                        </Button>
                        <Button variant="outline" size="sm">
                          <Eye className="w-3 h-3 mr-1" />
                          Voir
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDeleteArticle(article.id)}>
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Empty State */}
            {filteredArticles.length === 0 && (
              <Card className="text-center py-12">
                <CardContent>
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {searchTerm ? 'Aucun article trouvé' : 'Aucun article'}
                  </h3>
                  <p className="text-gray-500 mb-6">
                    {searchTerm 
                      ? 'Essayez de modifier vos critères de recherche'
                      : 'Commencez par créer votre premier article'
                    }
                  </p>
                  {!searchTerm && (
                    <div className="space-x-3">
                      <Button onClick={() => { setShowForm(true); setDraft({}); }} className="bg-teal-500 hover:bg-teal-600">
                        <Plus className="w-4 h-4 mr-2" />
                        Créer un article
                      </Button>
                      <Button variant="outline" onClick={generateAIArticle}>
                        <Bot className="w-4 h-4 mr-2" />
                        Générer avec IA
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-600">Total Articles</p>
                      <p className="text-2xl font-bold text-gray-900">{articles.length}</p>
                    </div>
                    <FileText className="w-8 h-8 text-teal-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-600">Publiés</p>
                      <p className="text-2xl font-bold text-green-600">
                        {articles.filter(a => a.status === 'published').length}
                      </p>
                    </div>
                    <BarChart3 className="w-8 h-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-600">En attente</p>
                      <p className="text-2xl font-bold text-yellow-600">
                        {articles.filter(a => a.status === 'pending').length}
                      </p>
                    </div>
                    <AlertCircle className="w-8 h-8 text-yellow-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-600">Score SEO Moyen</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {Math.round(articles.reduce((acc, a) => acc + (a.seoScore || 0), 0) / articles.length || 0)}%
                      </p>
                    </div>
                    <BarChart3 className="w-8 h-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Performance des Articles</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-gray-500">
                  <BarChart3 className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p>Analytics détaillées à venir...</p>
                  <p className="text-sm">Connectez Google Analytics pour voir les performances</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AuthGuard>
  );
}