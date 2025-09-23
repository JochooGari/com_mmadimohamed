import { useState, useEffect } from 'react';
import { FileText, Brain, BarChart3, Eye, EyeOff, Maximize2, Minimize2, Copy, ClipboardPaste } from 'lucide-react';
import ArticleOutline from './LeftPanel/ArticleOutline';
import ContentLibrary from './LeftPanel/ContentLibrary';
import SmartEditor from './CenterEditor/SmartEditor';
import AIAssistant from './RightPanel/AIAssistant';
import SEOScoring from './RightPanel/SEOScoring';
import GEOScoring from './RightPanel/GEOScoring';
import Insights from './RightPanel/Insights';

interface EnhancedEditorLayoutProps {
  articleId?: string;
  initialContent?: { title?: string; slug?: string; excerpt?: string; content_md?: string; };
  onSave?: (content: any) => void;
  mode?: 'articles' | 'resources';
}

interface EditorSettings { focusMode: boolean; zenMode: boolean; darkMode: boolean; leftPanelVisible: boolean; rightPanelVisible: boolean; }

export default function EnhancedEditorLayout({ articleId, initialContent, onSave, mode = 'articles' }: EnhancedEditorLayoutProps) {
  const [settings, setSettings] = useState<EditorSettings>({ focusMode: false, zenMode: false, darkMode: false, leftPanelVisible: true, rightPanelVisible: true });
  const [activeRightTab, setActiveRightTab] = useState<'ai' | 'seo' | 'geo' | 'insights'>('ai');
  const [editorMode, setEditorMode] = useState<'visual'|'html'>('visual');
  const [content, setContent] = useState({ title: initialContent?.title || '', slug: initialContent?.slug || '', excerpt: initialContent?.excerpt || '', content_md: initialContent?.content_md || '', content_html: '' as string, keywords: [] as string[], seoScore: 0, geoScore: 0 });
  const [htmlSnippet, setHtmlSnippet] = useState<string>('');
  const [showHtmlPreview, setShowHtmlPreview] = useState<boolean>(false);
  const [showHtmlPanel, setShowHtmlPanel] = useState<boolean>(false);
  const [autosaveStatus, setAutosaveStatus] = useState<'saved' | 'saving' | 'error'>('saved');

  useEffect(() => {
    const timer = setTimeout(() => {
      if (content.title || content.content_md || content.content_html) {
        setAutosaveStatus('saving');
        try {
          localStorage.setItem(`editor_draft_${articleId || 'new'}`, JSON.stringify(content));
          if (onSave) onSave(content);
          setAutosaveStatus('saved');
        } catch { setAutosaveStatus('error'); }
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, [content, articleId, onSave]);

  const toggleSetting = (key: keyof EditorSettings) => setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  const handleContentChange = (updates: Partial<typeof content>) => setContent(prev => ({ ...prev, ...updates }));

  const getLayoutClasses = () => { if (settings.zenMode) return 'grid grid-cols-1'; let baseClass = 'grid gap-4 '; if (!settings.leftPanelVisible && !settings.rightPanelVisible) baseClass += 'grid-cols-1'; else if (!settings.leftPanelVisible) baseClass += 'grid-cols-[1fr_30%]'; else if (!settings.rightPanelVisible) baseClass += 'grid-cols-[20%_1fr]'; else baseClass += 'grid-cols-[20%_1fr_30%]'; return baseClass; };

  return (
    <div className={`min-h-screen ${settings.darkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">{mode === 'articles' ? "Éditeur d'Articles" : 'Éditeur de Ressources'}</h1>
            <div className="flex items-center gap-2">
              <button className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">Sauvegarder</button>
              <button className="px-3 py-1.5 text-sm border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors">Aperçu</button>
              <button className="px-3 py-1.5 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">Publier</button>
              <button onClick={()=> setShowHtmlPanel(v=> !v)} className="px-3 py-1.5 text-sm border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors flex items-center gap-2"><ClipboardPaste className="w-4 h-4" /> Coller HTML</button>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => toggleSetting('rightPanelVisible')} className="px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-white">{settings.rightPanelVisible ? 'Replier panneau droit' : 'Déplier panneau droit'}</button>
            <button onClick={() => toggleSetting('leftPanelVisible')} className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded" title="Basculer panneau gauche">{settings.leftPanelVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
            <button onClick={() => toggleSetting('rightPanelVisible')} className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded" title="Basculer panneau droit">{settings.rightPanelVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
            <button onClick={() => toggleSetting('focusMode')} className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded" title="Mode focus"><Maximize2 className="w-4 h-4" /></button>
            <button onClick={() => toggleSetting('zenMode')} className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded" title="Mode zen"><Minimize2 className="w-4 h-4" /></button>
          </div>
        </div>
      </header>
      <main className="p-6">
        <div className={getLayoutClasses()}>
          {settings.leftPanelVisible && !settings.zenMode && (<aside className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="flex">
                  <button className="flex-1 px-4 py-3 text-sm font-medium text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 border-b-2 border-blue-500">
                    <FileText className="w-4 h-4 inline mr-2" />
                    Structure
                  </button>
                </nav>
              </div>
              <div className="h-[calc(100vh-200px)] overflow-y-auto">
                <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                  <ArticleOutline content={content.content_md} onStructureChange={() => {}} />
                </div>
                <div className="p-4">
                  <ContentLibrary onInsertContent={(insertContent) => handleContentChange({ content_md: content.content_md + '\n\n' + insertContent })} />
                </div>
              </div>
            </aside>)}
          <section className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <SmartEditor content={content} onChange={handleContentChange} focusMode={settings.focusMode} zenMode={settings.zenMode} mode={editorMode} onModeChange={setEditorMode} />
            {showHtmlPanel && (
              <div className="border-t border-gray-200 dark:border-gray-700 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100">Coller du HTML</h3>
                  <div className="flex items-center gap-2">
                    <button onClick={()=> { navigator.clipboard.writeText(htmlSnippet||''); }} disabled={!htmlSnippet} className="text-xs px-2 py-1 border rounded hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-1 disabled:opacity-50"><Copy className="w-3 h-3" /> Copier</button>
                    <button onClick={()=> setShowHtmlPreview(v=> !v)} disabled={!htmlSnippet} className="text-xs px-2 py-1 border rounded hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50">{showHtmlPreview? 'Masquer preview' : 'Prévisualiser'}</button>
                    <button onClick={()=> setHtmlSnippet('')} disabled={!htmlSnippet} className="text-xs px-2 py-1 border rounded hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50">Vider</button>
                  </div>
                </div>
                <textarea value={htmlSnippet} onChange={(e)=> setHtmlSnippet(e.target.value)} rows={6} placeholder="Collez ici votre bloc HTML…" className="w-full text-sm font-mono border rounded p-2 bg-white dark:bg-gray-900 dark:text-white dark:border-gray-700"></textarea>
                {showHtmlPreview && htmlSnippet && (<div className="border rounded p-3 bg-white dark:bg-gray-900 text-sm" dangerouslySetInnerHTML={{ __html: htmlSnippet }} />)}
                <div className="flex items-center justify-end">
                  <button onClick={()=> handleContentChange(editorMode==='html' ? { content_html: (content.content_html || '') + (content.content_html? '\n\n' : '') + htmlSnippet } : { content_md: (content.content_md || '') + (content.content_md? '\n\n' : '') + htmlSnippet })} disabled={!htmlSnippet} className="px-3 py-1.5 text-sm bg-teal-600 text-white rounded-md hover:bg-teal-700 disabled:opacity-50">Insérer dans l’article ({editorMode==='html' ? 'HTML' : 'Visuel'})</button>
                </div>
              </div>
            )}
          </section>
          {settings.rightPanelVisible && !settings.zenMode && (<aside className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="flex">
                  <button onClick={() => setActiveRightTab('ai')} className={`flex-1 px-3 py-3 text-sm font-medium border-b-2 ${activeRightTab === 'ai' ? 'text-blue-600 border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'text-gray-500 border-transparent hover:text-gray-700 hover:bg-gray-50'}`}><Brain className="w-4 h-4 inline mr-1" />IA</button>
                  <button onClick={() => setActiveRightTab('seo')} className={`flex-1 px-3 py-3 text-sm font-medium border-b-2 ${activeRightTab === 'seo' ? 'text-blue-600 border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'text-gray-500 border-transparent hover:text-gray-700 hover:bg-gray-50'}`}>SEO</button>
                  <button onClick={() => setActiveRightTab('geo')} className={`flex-1 px-3 py-3 text-sm font-medium border-b-2 ${activeRightTab === 'geo' ? 'text-blue-600 border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'text-gray-500 border-transparent hover:text-gray-700 hover:bg-gray-50'}`}>GEO</button>
                  <button onClick={() => setActiveRightTab('insights')} className={`flex-1 px-3 py-3 text-sm font-medium border-b-2 ${activeRightTab === 'insights' ? 'text-blue-600 border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'text-gray-500 border-transparent hover:text-gray-700 hover:bg-gray-50'}`}><BarChart3 className="w-4 h-4 inline mr-1" />Stats</button>
                </nav>
              </div>
              <div className="h-[calc(100vh-200px)] overflow-y-auto">
                {activeRightTab === 'ai' && (<AIAssistant content={content} onContentSuggestion={() => {}} />)}
                {activeRightTab === 'seo' && (<SEOScoring content={content} onScoreUpdate={(s)=> handleContentChange({ seoScore: s })} />)}
                {activeRightTab === 'geo' && (<GEOScoring content={content} onScoreUpdate={(s)=> handleContentChange({ geoScore: s })} />)}
                {activeRightTab === 'insights' && (<Insights content={content} />)}
              </div>
            </aside>)}
        </div>
      </main>
    </div>
  );
}