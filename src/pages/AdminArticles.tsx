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
  Search,
  Filter,
  Calendar,
  User,
  Clock,
  BarChart3,
  Bot,
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import { useAdminData } from '../context/AdminDataContext';
import { tryGetSupabaseClient } from '../lib/supabase';
import EnhancedEditorLayout from '../components/admin/enhanced-editor/EnhancedEditorLayout';
import { Editor as TinymceEditor } from '@tinymce/tinymce-react';
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
  slug?: string;
};

export default function AdminArticles() {
  const admin = useAdminData();
  const supabase = tryGetSupabaseClient();
  const [articles, setArticles] = useState<Article[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const [draft, setDraft] = useState<Partial<Article>>({
    title: '',
    excerpt: '',
    content: '',
    tags: [],
    status: 'draft'
  });

  // Load articles from Supabase
  useEffect(() => {
    (async () => {
      if (!supabase) return;
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(200);

      if (!error && Array.isArray(data)) {
        const rows: Article[] = data.map((r: any) => ({
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
          seoScore: undefined,
          slug: r.slug
        }));
        setArticles(rows);
      }
    })();
  }, [supabase]);

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

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateString));
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

  const handleDeleteArticle = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet article ?')) return;
    try {
      if (supabase) {
        await supabase.from('articles').delete().eq('id', id);
      }
    } catch (e: any) {
      console.warn('Supabase delete failed', e?.message);
    }
    setArticles(prev => prev.filter(a => a.id !== id));
  };

  const handleEditArticle = (article: Article) => {
    setSelectedArticle(article);
    setDraft(article);
    setShowEditor(true);
  };

  const handleCreateArticle = () => {
    setSelectedArticle(null);
    setDraft({
      title: '',
      excerpt: '',
      content: '',
      tags: [],
      status: 'draft'
    });
    setShowEditor(true);
  };

  const generateAIArticle = async () => {
    const aiArticle = {
      title: 'Article généré par IA : Tendances Data 2025',
      excerpt: 'Découvrez les principales tendances en matière de données pour 2025',
      content: '<h1>Tendances Data 2025</h1><p>Les données continuent de transformer...</p>',
      tags: ['Data', 'Tendances', '2025'],
      status: 'draft' as const,
    };

    setDraft(aiArticle);
    setSelectedArticle(null);
    setShowEditor(true);
  };

  const getArticleUrl = (article: Article) => {
    const baseUrl = window.location.origin;
    const slug = article.slug || slugifyLocal(article.title);
    return `${baseUrl}/articles/${slug}`;
  };

  const viewArticle = (article: Article) => {
    const url = getArticleUrl(article);
    window.open(url, '_blank');
  };

  if (showEditor) {
    return (
      <AuthGuard>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {selectedArticle ? 'Modifier l\'article' : 'Nouvel article'} – Éditeur IA Avancé
              </h1>
              <p className="text-gray-600 mt-1">Structure · Éditeur intelligent · IA/SEO/GEO</p>
            </div>
            <Button variant="outline" onClick={() => setShowEditor(false)}>
              ← Retour à la liste
            </Button>
          </div>
          <EnhancedEditorLayout
            mode="articles"
            articleId={selectedArticle?.id}
            initialContent={{
              title: draft.title || '',
              slug: draft.slug || '',
              excerpt: draft.excerpt || '',
              content_md: draft.content || '',
              content_html: draft.content || '' // Assurez-vous que le contenu HTML est aussi passé
            }}
            onSave={(content) => {
              setDraft(d => ({
                ...d,
                title: content?.title || d.title,
                excerpt: content?.excerpt || d.excerpt,
                content: (content?.content_html || content?.content_md || d.content)
              }));
            }}
            onSaveAction={async (content) => {
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
                const saved = await upsertArticleSupabase(article);
                if (saved?.id) article.id = saved.id;
                if (saved?.slug) article.slug = saved.slug;

                // Update articles list
                setArticles(prev => {
                  const filtered = prev.filter(a => a.id !== article.id);
                  return [article, ...filtered];
                });
              } catch(e) {
                console.error('Save error:', e);
                alert('Erreur lors de la sauvegarde: ' + (e as any)?.message);
              }
            }}
            onPublishAction={async (content) => {
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
                const saved = await upsertArticleSupabase(article);
                if (saved?.slug) article.slug = saved.slug;

                // Update articles list
                setArticles(prev => {
                  const filtered = prev.filter(a => a.id !== article.id);
                  return [article, ...filtered];
                });

                alert('Article publié avec succès !');
                setShowEditor(false);
              } catch (e: any) {
                alert('Erreur publication: ' + (e?.message || 'unknown'));
              }
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
            <Button onClick={handleCreateArticle}>
              <Plus className="w-4 h-4 mr-2" />
              Nouveau Article
            </Button>
          </div>
        </div>

        <Tabs defaultValue="list" className="space-y-6">
          <TabsList>
            <TabsTrigger value="list">Liste des Articles</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="style">Style CSS</TabsTrigger>
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
                            <Badge variant="outline" className="text-blue-600">
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
                          onClick={() => handleEditArticle(article)}
                        >
                          <Edit3 className="w-3 h-3 mr-1" />
                          Éditer
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => viewArticle(article)}
                          disabled={article.status !== 'published'}
                        >
                          <ExternalLink className="w-3 h-3 mr-1" />
                          Voir
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteArticle(article.id)}
                        >
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
                      <Button onClick={handleCreateArticle} className="bg-teal-500 hover:bg-teal-600">
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
          </TabsContent>

          {/* Style CSS Tab */}
          <TabsContent value="style" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Style CSS – Charte graphique & Prévisualisation</CardTitle>
              </CardHeader>
              <CardContent>
                <CssStyleDesigner />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AuthGuard>
  );
}

function CssStyleDesigner() {
  const [cssUrl, setCssUrl] = useState('');
  const [cssCode, setCssCode] = useState('');
  const [status, setStatus] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'style' | 'preview' | 'editor'>('style');
  const [savedTemplates, setSavedTemplates] = useState<{name: string, css: string, url?: string}[]>([]);
  const [editorContent, setEditorContent] = useState({
    title: 'Titre d\'exemple – Style IA',
    slug: 'style-preview',
    excerpt: 'Prévisualisation des styles dans l\'éditeur IA avancé',
    content_md: `# H1 Exemple\n\n## Sous-titre\n\nParagraphe introductif avec un lien [CTA](/#).\n\n### Liste\n- Élément 1\n- Élément 2\n\n> Citation marquante.\n\n| Colonne | Valeur |\n|---|---|\n| KPI | 98% |`,
    content_html: ''
  });

  useEffect(() => { (async () => {
    try {
      // Charger le CSS actuel
      const r = await fetch('/api/storage?agent=site&type=theme');
      if (r.ok) {
        const text = await r.text();
        setCssCode(text || '');
      }
      // Charger les templates sauvegardés
      const templatesR = await fetch('/api/storage?agent=site&type=css_templates');
      if (templatesR.ok) {
        const templatesText = await templatesR.text();
        try {
          setSavedTemplates(JSON.parse(templatesText) || []);
        } catch {}
      }
    } catch {}
  })(); }, []);

  const importFromUrl = async () => {
    if (!cssUrl.trim()) return;
    setLoading(true); setStatus('Import en cours…');
    try {
      const r = await fetch(cssUrl);
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const text = await r.text();
      setCssCode(text);
      setStatus('Import réussi.');
    } catch (e:any) {
      setStatus('Erreur import: ' + (e?.message || 'inconnue'));
    } finally {
      setLoading(false);
    }
  };

  const saveCss = async () => {
    setLoading(true); setStatus('Sauvegarde…');
    try {
      const r = await fetch('/api/storage', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({
          action:'save_site_theme',
          data:{ css: cssCode, sourceUrl: cssUrl }
        })
      });
      if (!r.ok) throw new Error(await r.text());
      setStatus('✅ Style sauvegardé et appliqué à tous les articles.');
    } catch (e:any) {
      setStatus('Erreur sauvegarde: ' + (e?.message || 'inconnue'));
    } finally {
      setLoading(false);
    }
  };

  const saveAsTemplate = async () => {
    const templateName = prompt('Nom du template:');
    if (!templateName?.trim()) return;
    const newTemplate = { name: templateName.trim(), css: cssCode, url: cssUrl };
    const updatedTemplates = [...savedTemplates, newTemplate];
    setSavedTemplates(updatedTemplates);
    try {
      const r = await fetch('/api/storage', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({
          action:'save_css_templates',
          data: updatedTemplates
        })
      });
      if (!r.ok) throw new Error(await r.text());
      setStatus('✅ Template sauvegardé.');
    } catch (e:any) {
      setStatus('Erreur sauvegarde template: ' + (e?.message || 'inconnue'));
    }
  };

  const applyTemplate = async (template: {name: string, css: string, url?: string}) => {
    setCssCode(template.css);
    setCssUrl(template.url || '');
    setStatus(`✅ Template "${template.name}" appliqué.`);
  };

  const deleteTemplate = async (index: number) => {
    if (!confirm('Supprimer ce template?')) return;
    const updatedTemplates = savedTemplates.filter((_, i) => i !== index);
    setSavedTemplates(updatedTemplates);
    try {
      const r = await fetch('/api/storage', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({
          action:'save_css_templates',
          data: updatedTemplates
        })
      });
      if (!r.ok) throw new Error(await r.text());
      setStatus('✅ Template supprimé.');
    } catch (e:any) {
      setStatus('Erreur suppression: ' + (e?.message || 'inconnue'));
    }
  };

  const contentHtml = editorContent.content_html || `<h1>Étude de cas — Automatisation du reporting CFO</h1><p>Démo de style live.</p>`;

  const iframeHtml = `<!doctype html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style>
    body{margin:0;padding:24px;font-family:Inter,system-ui,Arial,sans-serif;background:#fff;color:#111;}
    .container{max-width:860px;margin:0 auto;}
    .toc{border:1px solid #e6e6e6;padding:12px;border-radius:10px;margin:16px 0}
    .toc h4{margin:0 0 8px 0}
    ${cssCode}
  </style>
  <title>Prévisualisation style</title>
</head>
<body>
  <div class="container neil-patel-style">
    <header class="article-header mb-6">
      <h1>${editorContent.title}</h1>
      <p class="meta">Score SEO 96/100 · Score GEO 95/100</p>
    </header>
    <nav class="toc">
      <h4>Sommaire</h4>
      <ol>
        <li>Problématique & Contexte</li>
        <li>Mise en œuvre</li>
        <li>Résultats & KPI</li>
      </ol>
    </nav>
    <article class="article-body">
      ${contentHtml}
    </article>
  </div>
</body>
</html>`;

  return (
    <div className="space-y-4">
      {/* Barre de navigation modes */}
      <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
        <div className="flex items-center gap-2">
          <Button size="sm" variant={mode==='style'? 'default':'outline'} onClick={() => setMode('style')}>🎨 Style</Button>
          <Button size="sm" variant={mode==='preview'? 'default':'outline'} onClick={() => setMode('preview')}>👁️ Preview</Button>
          <Button size="sm" variant={mode==='editor'? 'default':'outline'} onClick={() => setMode('editor')}>🧠 Éditeur IA</Button>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={saveCss} disabled={loading}>
            💾 Sauvegarder & Appliquer
          </Button>
          <Button size="sm" variant="outline" onClick={saveAsTemplate} disabled={loading || !cssCode.trim()}>
            📋 Sauver Template
          </Button>
          <Button size="sm" onClick={async () => {
            const r = await fetch('/api/storage', {
              method: 'POST', headers: { 'Content-Type':'application/json' },
              body: JSON.stringify({ action: 'publish_style_preview', data: { html: iframeHtml } })
            });
            const j = await r.json().catch(()=>null);
            if (j?.url) window.open(j.url, '_blank');
          }}>
            🚀 Publier aperçu (non listé)
          </Button>
        </div>
      </div>

      {status && (<div className="text-xs text-gray-600 p-2 bg-blue-50 rounded">{status}</div>)}

      {/* Templates sauvegardés */}
      {savedTemplates.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">📋 Templates Sauvegardés</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {savedTemplates.map((template, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm font-medium truncate">{template.name}</span>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => applyTemplate(template)}
                      className="text-xs px-2"
                    >
                      Appliquer
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deleteTemplate(index)}
                      className="text-xs px-2"
                    >
                      ×
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className={`grid gap-4 ${mode==='style' ? 'grid-cols-1 lg:grid-cols-3' : 'grid-cols-1'}`}>
        {/* Panneau CSS */}
        {mode==='style' && (
          <div className="lg:col-span-1 space-y-3">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Input
                  placeholder="URL CSS (export Figma / fichier public)"
                  value={cssUrl}
                  onChange={(e) => setCssUrl(e.target.value)}
                  className="text-xs"
                />
                <Button variant="outline" size="sm" onClick={importFromUrl} disabled={loading || !cssUrl.trim()}>
                  Import
                </Button>
              </div>
              <Textarea
                rows={28}
                className="font-mono text-xs"
                placeholder={`/* CSS personnalisé */
.article-header h1 {
  font-size: 2rem;
  color: #1f2937;
  margin-bottom: 1rem;
}

.neil-patel-style .micro-cta {
  display: inline-block;
  background: #3b82f6;
  color: white;
  padding: 8px 16px;
  border-radius: 6px;
  text-decoration: none;
  font-size: 14px;
}`}
                value={cssCode}
                onChange={(e) => setCssCode(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Preview / Éditeur */}
        {mode!=='style' && (
          <div className="col-span-1">
            <div className="text-sm text-gray-600 mb-2 flex items-center justify-between">
              <span>{mode==='preview' ? 'Aperçu Article' : 'Éditeur IA avancé (aperçu en temps réel)'}</span>
              <span className="text-xs text-gray-400">Les styles s'appliquent automatiquement aux articles publiés</span>
            </div>
            <div className="border rounded overflow-hidden bg-white">
              {mode==='preview' ? (
                <iframe title="preview" style={{ width:'100%', height: 700, border:'0' }} srcDoc={iframeHtml} />
              ) : (
                <div className="p-2">
                  <TinymceEditor
                    apiKey={(import.meta as any).env?.VITE_TINYMCE_API_KEY || (window as any).TINYMCE_API_KEY || 'no-api-key'}
                    value={editorContent.content_html || editorContent.content_md}
                    onEditorChange={(content) => setEditorContent(prev => ({ ...prev, content_html: content }))}
                    init={{
                      height: 640,
                      menubar: true,
                      plugins: [
                        'advlist', 'autolink', 'lists', 'link', 'image', 'charmap',
                        'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                        'insertdatetime', 'media', 'table', 'preview', 'help', 'wordcount'
                      ],
                      toolbar:
                        'undo redo | blocks | bold italic underline forecolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | table | link image | removeformat | help',
                      content_style: `body { font-family:Inter,Arial,sans-serif; font-size:14px; } ${cssCode}`,
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}