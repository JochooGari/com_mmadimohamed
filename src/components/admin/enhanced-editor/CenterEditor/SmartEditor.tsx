import { useState, useRef, useEffect } from 'react';
import { Bold, Italic, List, Link, Image, Code, Quote, Hash, Eye, Type, Palette, FileCode } from 'lucide-react';
import { Editor } from '@tinymce/tinymce-react';

interface SmartEditorProps {
  content: {
    title: string;
    slug: string;
    excerpt: string;
    content_md: string;
    content_html?: string;
    keywords: string[];
  };
  onChange: (updates: any) => void;
  focusMode?: boolean;
  zenMode?: boolean;
  mode?: 'visual' | 'html';
  onModeChange?: (m: 'visual'|'html') => void;
}

interface Suggestion {
  id: string;
  text: string;
  type: 'grammar' | 'style' | 'seo' | 'keyword';
  position: { start: number; end: number };
  replacement?: string;
}

export default function SmartEditor({ content, onChange, focusMode, zenMode, mode='visual', onModeChange }: SmartEditorProps) {
  const [activeField, setActiveField] = useState<'title' | 'excerpt' | 'content'>('content');
  const [showPreview, setShowPreview] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [selectedText, setSelectedText] = useState('');
  const [cursorPosition, setCursorPosition] = useState(0);
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [readingTime, setReadingTime] = useState(0);

  const titleRef = useRef<HTMLInputElement>(null);
  const excerptRef = useRef<HTMLTextAreaElement>(null);
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const editorRef = useRef<any>(null);

  // Update statistics
  useEffect(() => {
    const text = content.content_md;
    const words = text.split(/\s+/).filter(word => word.length > 0).length;
    const chars = text.length;
    const reading = Math.ceil(words / 200); // 200 mots par minute

    setWordCount(words);
    setCharCount(chars);
    setReadingTime(reading);
  }, [content.content_md]);

  // Smart suggestions (simulées)
  useEffect(() => {
    const generateSuggestions = () => {
      const text = content.content_md;
      const newSuggestions: Suggestion[] = [];

      // Exemple: détecter des répétitions de mots
      const words = text.toLowerCase().split(/\s+/);
      const wordCount = words.reduce((acc, word) => {
        acc[word] = (acc[word] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      Object.entries(wordCount).forEach(([word, count]) => {
        if (count > 3 && word.length > 4) {
          newSuggestions.push({
            id: `repetition-${word}`,
            text: `Le mot "${word}" est répété ${count} fois. Variez votre vocabulaire.`,
            type: 'style',
            position: { start: 0, end: 0 }
          });
        }
      });

      // Suggestion SEO
      if (content.keywords.length > 0 && !text.toLowerCase().includes(content.keywords[0]?.toLowerCase())) {
        newSuggestions.push({
          id: 'keyword-missing',
          text: `Intégrez votre mot-clé principal "${content.keywords[0]}" dans le contenu.`,
          type: 'seo',
          position: { start: 0, end: 0 }
        });
      }

      setSuggestions(newSuggestions.slice(0, 5)); // Limite à 5 suggestions
    };

    const timer = setTimeout(generateSuggestions, 1000);
    return () => clearTimeout(timer);
  }, [content.content_md, content.keywords]);

  // When switching from HTML->Visual and content_md is empty, seed with html
  useEffect(()=>{
    if (mode==='visual' && (!content.content_html || content.content_html.trim()==='') && content.content_md) {
      // no-op; keep md
    }
  }, [mode]);

  const handleTextChange = (field: keyof typeof content, value: string) => {
    onChange({ [field]: value });
  };

  const handleKeyDown = (e: React.KeyboardEvent, field: string) => {
    // Shortcuts clavier
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'b':
          e.preventDefault();
          insertFormatting('**', '**');
          break;
        case 'i':
          e.preventDefault();
          insertFormatting('*', '*');
          break;
        case 'k':
          e.preventDefault();
          insertFormatting('[', '](url)');
          break;
      }
    }

    // Autocomplétion avec Tab
    if (e.key === 'Tab' && selectedText) {
      e.preventDefault();
      // Implémenter l'autocomplétion
    }
  };

  const insertFormatting = (before: string, after: string) => {
    const textarea = contentRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    const newText = textarea.value.substring(0, start) + before + selectedText + after + textarea.value.substring(end);

    handleTextChange('content_md', newText);

    // Reposition le curseur
    setTimeout(() => {
      if (selectedText) {
        textarea.setSelectionRange(start + before.length, end + before.length);
      } else {
        textarea.setSelectionRange(start + before.length, start + before.length);
      }
      textarea.focus();
    }, 0);
  };

  const insertAtCursor = (text: string) => {
    const textarea = contentRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newText = textarea.value.substring(0, start) + text + textarea.value.substring(end);

    handleTextChange('content_md', newText);

    setTimeout(() => {
      textarea.setSelectionRange(start + text.length, start + text.length);
      textarea.focus();
    }, 0);
  };

  const formatButtons = [
    { icon: Bold, action: () => insertFormatting('**', '**'), title: 'Gras (Ctrl+B)' },
    { icon: Italic, action: () => insertFormatting('*', '*'), title: 'Italique (Ctrl+I)' },
    { icon: Hash, action: () => insertAtCursor('\n## '), title: 'Titre H2' },
    { icon: List, action: () => insertAtCursor('\n- '), title: 'Liste' },
    { icon: Quote, action: () => insertAtCursor('\n> '), title: 'Citation' },
    { icon: Link, action: () => insertFormatting('[', '](url)'), title: 'Lien (Ctrl+K)' },
    { icon: Code, action: () => insertFormatting('`', '`'), title: 'Code inline' },
    { icon: Image, action: () => insertAtCursor('![alt](image-url)'), title: 'Image' }
  ];

  const getProgressColor = (current: number, target: number) => {
    const percentage = (current / target) * 100;
    if (percentage < 50) return 'bg-red-500';
    if (percentage < 80) return 'bg-orange-500';
    if (percentage < 120) return 'bg-green-500';
    return 'bg-blue-500';
  };

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      {!zenMode && (
        <div className="border-b border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              {formatButtons.map((button, index) => (
                <button
                  key={index}
                  onClick={button.action}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                  title={button.title}
                >
                  <button.icon className="w-4 h-4" />
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button onClick={() => editorRef.current?.execCommand('mceCodeEditor')} className="px-3 py-1.5 text-sm rounded-md border hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2">
                <FileCode className="w-4 h-4" /> Source HTML
              </button>
              <button onClick={() => setShowPreview(!showPreview)} className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                  showPreview
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                    : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
                }`}>
                <Eye className="w-4 h-4 inline mr-1" /> Aperçu
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
            <span>{wordCount} mots</span>
            <span>{charCount} caractères</span>
            <span>{readingTime} min de lecture</span>
            <div className="flex items-center gap-2">
              <span>Progression:</span>
              <div className="w-20 h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${getProgressColor(wordCount, 1500)}`}
                  style={{ width: `${Math.min((wordCount / 1500) * 100, 100)}%` }}
                />
              </div>
              <span className="text-xs">{Math.round((wordCount / 1500) * 100)}%</span>
            </div>
          </div>
        </div>
      )}

      {/* Content Area */}
      <div className="flex-1 p-4 overflow-hidden">
        {!showPreview ? (
          <div className="h-full flex flex-col gap-4">
            {/* Title */}
            {!focusMode && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Titre de l'article
                </label>
                <input
                  ref={titleRef}
                  type="text"
                  value={content.title}
                  onChange={(e) => handleTextChange('title', e.target.value)}
                  placeholder="Titre accrocheur et optimisé SEO..."
                  className="w-full px-3 py-2 text-lg font-semibold border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {content.title.length}/60 caractères (optimal: 50-60)
                </div>
              </div>
            )}

            {/* Slug */}
            {!focusMode && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  URL (slug)
                </label>
                <input
                  type="text"
                  value={content.slug}
                  onChange={(e) => handleTextChange('slug', e.target.value)}
                  placeholder="url-optimisee-seo"
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            )}

            {/* Excerpt */}
            {!focusMode && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description (meta description)
                </label>
                <textarea
                  ref={excerptRef}
                  value={content.excerpt}
                  onChange={(e) => handleTextChange('excerpt', e.target.value)}
                  placeholder="Description accrocheuse qui donne envie de cliquer..."
                  rows={2}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                />
                <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {content.excerpt.length}/160 caractères (optimal: 150-160)
                </div>
              </div>
            )}

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Contenu principal (TinyMCE)</label>
              <Editor
                onInit={(_evt, editor) => { editorRef.current = editor; }}
                apiKey={'mzqxfb4pdq9g24k0hq3vgfnp0nhqxt041fhp3jm10avytq1f'}
                tinymceScriptSrc={'https://cdn.tiny.cloud/1/mzqxfb4pdq9g24k0hq3vgfnp0nhqxt041fhp3jm10avytq1f/tinymce/6/tinymce.min.js'}
                value={content.content_html || ''}
                init={{
                  height: 600,
                  menubar: false,
                  plugins: [
                    'anchor','autolink','charmap','codesample','emoticons','link','lists','media','searchreplace','table','visualblocks','wordcount','code'
                  ],
                  toolbar: 'undo redo | blocks fontfamily fontsize | bold italic underline | alignleft aligncenter alignright | bullist numlist | link media table | code',
                  paste_as_text: false,
                  content_style: 'body { font-family:Inter,system-ui,Arial; line-height:1.7; }'
                }}
                onEditorChange={(newValue) => handleTextChange('content_html', newValue)}
              />
            </div>

            {/* Smart Suggestions */}
            {suggestions.length > 0 && !zenMode && (
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  💡 Suggestions d'amélioration
                </h4>
                <div className="space-y-2">
                  {suggestions.map(suggestion => (
                    <div
                      key={suggestion.id}
                      className={`p-2 rounded-md text-sm border-l-4 ${
                        suggestion.type === 'seo' ? 'bg-blue-50 border-blue-400 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200' :
                        suggestion.type === 'style' ? 'bg-purple-50 border-purple-400 text-purple-800 dark:bg-purple-900/20 dark:text-purple-200' :
                        'bg-orange-50 border-orange-400 text-orange-800 dark:bg-orange-900/20 dark:text-orange-200'
                      }`}
                    >
                      {suggestion.text}
                      {suggestion.replacement && (
                        <button className="ml-2 px-2 py-1 text-xs bg-white rounded border hover:bg-gray-50">
                          Appliquer
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="h-full overflow-y-auto">
            {/* Preview calquée sur structure du site (article page) */}
            <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <h1 className="text-3xl font-bold mb-3">{content.title || "Titre de l'article"}</h1>
              {content.excerpt && <p className="text-slate-600 mb-6">{content.excerpt}</p>}
              <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: mode==='html' ? (content.content_html || '') : (content.content_html || '') }} />
            </section>
          </div>
        )}
      </div>
    </div>
  );
}