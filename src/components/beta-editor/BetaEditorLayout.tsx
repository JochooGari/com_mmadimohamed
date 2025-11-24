/**
 * Layout principal de l'onglet Article (bêta)
 * Basé sur PRD Section 5.1 - Layout de l'onglet
 */

import { useState, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import TiptapUnderline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import { Color } from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import { FontFamily } from '@tiptap/extension-font-family';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
  FileText,
  Image as ImageIcon,
  Link as LinkIcon,
  Table as TableIcon,
  Bold,
  Italic,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  Save,
  Eye,
  Settings,
  BarChart3,
  Code,
  FileCode,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Type,
  Underline,
  Strikethrough,
  Quote,
  Upload
} from 'lucide-react';
import { ScorePanel } from './ScorePanel';
import { ArticleConfigForm } from './ArticleConfigForm';
import type { ArticleConfig } from '../../stores/scoring-store';

interface BetaEditorLayoutProps {
  articleId?: string;
  initialContent?: string;
  initialConfig?: ArticleConfig;
  onSave?: (content: string, config: ArticleConfig) => Promise<void>;
}

export function BetaEditorLayout({
  articleId,
  initialContent = '',
  initialConfig,
  onSave
}: BetaEditorLayoutProps) {
  const [activeTab, setActiveTab] = useState<string>('accueil');
  const [showConfig, setShowConfig] = useState(!initialConfig);
  const [articleConfig, setArticleConfig] = useState<ArticleConfig | null>(initialConfig || null);
  const [isSaving, setIsSaving] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [viewMode, setViewMode] = useState<'visual' | 'html'>('visual');
  const [htmlSource, setHtmlSource] = useState('');
  const [showPasteModal, setShowPasteModal] = useState(false);
  const [pasteHtmlInput, setPasteHtmlInput] = useState('');
  const [showImageModal, setShowImageModal] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');
  const [customCss, setCustomCss] = useState('');

  // Charger le CSS personnalisé depuis l'onglet Style
  useEffect(() => {
    (async () => {
      try {
        const response = await fetch('/api/storage?agent=site&type=theme');
        if (response.ok) {
          const cssText = await response.text();
          setCustomCss(cssText || '');
        }
      } catch (error) {
        console.error('Error loading custom CSS:', error);
      }
    })();
  }, []);

  // Configuration TipTap
  const editor = useEditor({
    extensions: [
      StarterKit,
      TiptapUnderline,
      TextStyle,
      Color,
      FontFamily,
      TextAlign.configure({
        types: ['heading', 'paragraph']
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          target: '_blank',
          rel: 'noopener noreferrer'
        }
      }),
      Image,
      Table.configure({
        resizable: true
      }),
      TableRow,
      TableCell,
      TableHeader
    ],
    content: initialContent,
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-xl focus:outline-none min-h-[600px] p-6'
      }
    },
    onUpdate: ({ editor }) => {
      const text = editor.getText();
      setWordCount(text.split(/\s+/).filter(Boolean).length);
    }
  });

  // Afficher le formulaire de config si pas de config
  if (!articleConfig) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <ArticleConfigForm
          onSubmit={(config) => {
            setArticleConfig(config);
            setShowConfig(false);
          }}
          onCancel={() => {
            // Retour à la liste
            window.history.back();
          }}
        />
      </div>
    );
  }

  const handleSave = async () => {
    if (!editor || !articleConfig) return;

    setIsSaving(true);
    try {
      const html = editor.getHTML();
      if (onSave) {
        await onSave(html, articleConfig);
      }
    } catch (error) {
      console.error('Save error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const toggleViewMode = () => {
    if (!editor) return;

    if (viewMode === 'visual') {
      // Passer en mode HTML : récupérer le HTML de l'éditeur
      const html = editor.getHTML();
      setHtmlSource(html);
      setViewMode('html');
    } else {
      // Passer en mode visuel : injecter le HTML dans l'éditeur
      try {
        editor.commands.setContent(htmlSource);
        setViewMode('visual');
      } catch (error) {
        console.error('Error setting HTML content:', error);
        alert('Erreur lors de l\'injection du HTML. Vérifiez la syntaxe.');
      }
    }
  };

  const openPasteModal = () => {
    setPasteHtmlInput('');
    setShowPasteModal(true);
  };

  const handlePasteHtml = () => {
    if (!editor || !pasteHtmlInput.trim()) return;

    try {
      editor.commands.setContent(pasteHtmlInput);
      const text = editor.getText();
      setWordCount(text.split(/\s+/).filter(Boolean).length);
      setShowPasteModal(false);
      setPasteHtmlInput('');
    } catch (error) {
      console.error('Error pasting HTML:', error);
      alert('Erreur lors du collage du HTML. Vérifiez la syntaxe.');
    }
  };

  const openImageModal = () => {
    setImageUrl('');
    setImageFile(null);
    setShowImageModal(true);
  };

  const handleInsertImage = async () => {
    if (!editor) return;

    try {
      let finalUrl = imageUrl;

      // Si un fichier est sélectionné, le convertir en base64
      if (imageFile) {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64String = reader.result as string;
          editor.chain().focus().setImage({ src: base64String }).run();
          setShowImageModal(false);
          setImageUrl('');
          setImageFile(null);
        };
        reader.readAsDataURL(imageFile);
        return;
      }

      // Sinon utiliser l'URL
      if (finalUrl) {
        editor.chain().focus().setImage({ src: finalUrl }).run();
        setShowImageModal(false);
        setImageUrl('');
      }
    } catch (error) {
      console.error('Error inserting image:', error);
      alert('Erreur lors de l\'insertion de l\'image.');
    }
  };

  const openLinkModal = () => {
    const { from, to } = editor?.state.selection || {};
    const text = editor?.state.doc.textBetween(from || 0, to || 0) || '';
    setLinkText(text);
    setLinkUrl('');
    setShowLinkModal(true);
  };

  const handleInsertLink = () => {
    if (!editor || !linkUrl.trim()) return;

    try {
      if (linkText) {
        editor.chain().focus().insertContent(`<a href="${linkUrl}">${linkText}</a>`).run();
      } else {
        editor.chain().focus().setLink({ href: linkUrl }).run();
      }
      setShowLinkModal(false);
      setLinkUrl('');
      setLinkText('');
    } catch (error) {
      console.error('Error inserting link:', error);
      alert('Erreur lors de l\'insertion du lien.');
    }
  };

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col">
      {/* Ruban supérieur - Tabs */}
      <div className="border-b bg-white">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full justify-start rounded-none border-b">
            <TabsTrigger value="accueil" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Accueil
            </TabsTrigger>
            <TabsTrigger value="insertion" className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4" />
              Insertion
            </TabsTrigger>
            <TabsTrigger value="edition" className="flex items-center gap-2">
              <Bold className="h-4 w-4" />
              Édition
            </TabsTrigger>
            <TabsTrigger value="scoring" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Scoring
            </TabsTrigger>
          </TabsList>

          {/* Ruban : Contenu selon onglet actif */}
          <div className="bg-gray-50 border-b p-2">
            <TabsContent value="accueil" className="m-0">
              <div className="flex items-center gap-2">
                <Button variant="default" onClick={handleSave} disabled={isSaving}>
                  <Save className="h-4 w-4 mr-2" />
                  {isSaving ? 'Sauvegarde...' : 'Enregistrer'}
                </Button>
                <Button variant="outline" onClick={toggleViewMode}>
                  {viewMode === 'visual' ? (
                    <>
                      <Code className="h-4 w-4 mr-2" />
                      Mode HTML
                    </>
                  ) : (
                    <>
                      <Eye className="h-4 w-4 mr-2" />
                      Mode Visuel
                    </>
                  )}
                </Button>
                <Button variant="outline" onClick={openPasteModal}>
                  <FileCode className="h-4 w-4 mr-2" />
                  Coller HTML
                </Button>
                <Button variant="outline" onClick={() => setShowConfig(true)}>
                  <Settings className="h-4 w-4 mr-2" />
                  Configuration
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="insertion" className="m-0">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={openImageModal}
                >
                  <ImageIcon className="h-4 w-4 mr-2" />
                  Image
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={openLinkModal}
                >
                  <LinkIcon className="h-4 w-4 mr-2" />
                  Lien
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    editor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
                  }}
                >
                  <TableIcon className="h-4 w-4 mr-2" />
                  Tableau
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => editor?.chain().focus().toggleBlockquote().run()}
                  data-active={editor?.isActive('blockquote')}
                  className="data-[active=true]:bg-gray-200"
                >
                  <Quote className="h-4 w-4 mr-2" />
                  Citation
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="edition" className="m-0">
              <div className="flex items-center gap-2 flex-wrap">
                {/* Sélecteur de type de bloc */}
                <select
                  className="px-3 py-1.5 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === 'paragraph') {
                      editor?.chain().focus().setParagraph().run();
                    } else if (value.startsWith('h')) {
                      const level = parseInt(value.substring(1)) as 1 | 2 | 3 | 4 | 5 | 6;
                      editor?.chain().focus().toggleHeading({ level }).run();
                    }
                  }}
                  value={
                    editor?.isActive('heading', { level: 1 }) ? 'h1' :
                    editor?.isActive('heading', { level: 2 }) ? 'h2' :
                    editor?.isActive('heading', { level: 3 }) ? 'h3' :
                    editor?.isActive('heading', { level: 4 }) ? 'h4' :
                    editor?.isActive('heading', { level: 5 }) ? 'h5' :
                    editor?.isActive('heading', { level: 6 }) ? 'h6' :
                    'paragraph'
                  }
                >
                  <option value="paragraph">Paragraph</option>
                  <option value="h1">Heading 1</option>
                  <option value="h2">Heading 2</option>
                  <option value="h3">Heading 3</option>
                  <option value="h4">Heading 4</option>
                  <option value="h5">Heading 5</option>
                  <option value="h6">Heading 6</option>
                </select>

                {/* Sélecteur de police */}
                <select
                  className="px-3 py-1.5 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white min-w-[140px]"
                  onChange={(e) => {
                    if (e.target.value === 'default') {
                      editor?.chain().focus().unsetFontFamily().run();
                    } else {
                      editor?.chain().focus().setFontFamily(e.target.value).run();
                    }
                  }}
                  defaultValue="default"
                >
                  <option value="default">Inter, system</option>
                  <option value="Arial">Arial</option>
                  <option value="'Arial Black'">Arial Black</option>
                  <option value="'Comic Sans MS'">Comic Sans MS</option>
                  <option value="'Courier New'">Courier New</option>
                  <option value="Georgia">Georgia</option>
                  <option value="Helvetica">Helvetica</option>
                  <option value="Impact">Impact</option>
                  <option value="'Times New Roman'">Times New Roman</option>
                  <option value="'Trebuchet MS'">Trebuchet MS</option>
                  <option value="Verdana">Verdana</option>
                </select>

                {/* Sélecteur de taille */}
                <select
                  className="px-3 py-1.5 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                  onChange={(e) => {
                    const size = e.target.value;
                    if (size === 'default') {
                      editor?.chain().focus().unsetMark('textStyle').run();
                    } else {
                      // Pour la taille, on utilise l'attribut style inline
                      editor?.chain().focus().setMark('textStyle', { fontSize: size }).run();
                    }
                  }}
                  defaultValue="default"
                >
                  <option value="default">Taille</option>
                  <option value="12px">12px</option>
                  <option value="14px">14px</option>
                  <option value="16px">16px</option>
                  <option value="18px">18px</option>
                  <option value="20px">20px</option>
                  <option value="24px">24px</option>
                  <option value="28px">28px</option>
                  <option value="32px">32px</option>
                  <option value="36px">36px</option>
                  <option value="48px">48px</option>
                </select>

                <div className="w-px h-6 bg-gray-300 mx-1" />

                {/* Formatage de base */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => editor?.chain().focus().toggleBold().run()}
                  data-active={editor?.isActive('bold')}
                  className="data-[active=true]:bg-gray-200"
                >
                  <Bold className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => editor?.chain().focus().toggleItalic().run()}
                  data-active={editor?.isActive('italic')}
                  className="data-[active=true]:bg-gray-200"
                >
                  <Italic className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => editor?.chain().focus().toggleUnderline().run()}
                  data-active={editor?.isActive('underline')}
                  className="data-[active=true]:bg-gray-200"
                >
                  <Underline className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => editor?.chain().focus().toggleStrike().run()}
                  data-active={editor?.isActive('strike')}
                  className="data-[active=true]:bg-gray-200"
                >
                  <Strikethrough className="h-4 w-4" />
                </Button>

                <div className="w-px h-6 bg-gray-300 mx-1" />

                {/* Titres */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
                  data-active={editor?.isActive('heading', { level: 1 })}
                  className="data-[active=true]:bg-gray-200"
                >
                  <Heading1 className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
                  data-active={editor?.isActive('heading', { level: 2 })}
                  className="data-[active=true]:bg-gray-200"
                >
                  <Heading2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
                  data-active={editor?.isActive('heading', { level: 3 })}
                  className="data-[active=true]:bg-gray-200"
                >
                  <Heading3 className="h-4 w-4" />
                </Button>

                <div className="w-px h-6 bg-gray-300 mx-1" />

                {/* Alignement */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => editor?.chain().focus().setTextAlign('left').run()}
                  data-active={editor?.isActive({ textAlign: 'left' })}
                  className="data-[active=true]:bg-gray-200"
                >
                  <AlignLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => editor?.chain().focus().setTextAlign('center').run()}
                  data-active={editor?.isActive({ textAlign: 'center' })}
                  className="data-[active=true]:bg-gray-200"
                >
                  <AlignCenter className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => editor?.chain().focus().setTextAlign('right').run()}
                  data-active={editor?.isActive({ textAlign: 'right' })}
                  className="data-[active=true]:bg-gray-200"
                >
                  <AlignRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => editor?.chain().focus().setTextAlign('justify').run()}
                  data-active={editor?.isActive({ textAlign: 'justify' })}
                  className="data-[active=true]:bg-gray-200"
                >
                  <AlignJustify className="h-4 w-4" />
                </Button>

                <div className="w-px h-6 bg-gray-300 mx-1" />

                {/* Listes */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => editor?.chain().focus().toggleBulletList().run()}
                  data-active={editor?.isActive('bulletList')}
                  className="data-[active=true]:bg-gray-200"
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => editor?.chain().focus().toggleOrderedList().run()}
                  data-active={editor?.isActive('orderedList')}
                  className="data-[active=true]:bg-gray-200"
                >
                  <ListOrdered className="h-4 w-4" />
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="scoring" className="m-0">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Configuration :</span>
                  <Badge variant="outline">{articleConfig.primaryKeyword}</Badge>
                  <Badge variant="outline">{articleConfig.articleType}</Badge>
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>

      {/* Zone principale : Éditeur + Scoring */}
      <div className="flex-1 flex overflow-hidden">
        {/* Zone d'édition */}
        <div className="flex-1 overflow-y-auto bg-white">
          <Card className="m-4 border-0 shadow-none">
            {/* Métadonnées article */}
            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <FileText className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium">Mot-clé :</span>
                    <span className="text-sm">{articleConfig.primaryKeyword}</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>{articleConfig.articleType}</span>
                    <span>•</span>
                    <span>Cible : {articleConfig.targetLength} mots</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Éditeur TipTap ou HTML source */}
            {viewMode === 'visual' ? (
              <div className="article-preview-container">
                {customCss && (
                  <style dangerouslySetInnerHTML={{ __html: customCss }} />
                )}
                <EditorContent editor={editor} />
              </div>
            ) : (
              <div className="relative">
                <textarea
                  className="w-full min-h-[600px] p-4 font-mono text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  value={htmlSource}
                  onChange={(e) => setHtmlSource(e.target.value)}
                  placeholder="<!-- Éditez le HTML ici -->"
                  spellCheck={false}
                />
                <div className="mt-2 text-xs text-gray-500">
                  💡 Modifiez le HTML directement, puis cliquez sur "Mode Visuel" pour voir le résultat.
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Panneau de scoring (droite) */}
        <div className="w-80 border-l bg-gray-50 overflow-y-auto">
          <ScorePanel
            editor={editor}
            articleConfig={articleConfig}
            articleId={articleId}
          />
        </div>
      </div>

      {/* Barre de statut */}
      <div className="border-t bg-white px-4 py-2 flex items-center justify-between text-sm text-gray-600">
        <div className="flex items-center gap-4">
          <span>📝 {wordCount}/{articleConfig.targetLength} mots</span>
          <span>•</span>
          <span>💾 Brouillon</span>
        </div>
        <div>
          Score: {editor ? '--' : '--'} (cliquez sur Analyser)
        </div>
      </div>

      {/* Modal de configuration (si réouvert) */}
      {showConfig && articleConfig && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">Configuration de l'article</h2>
            <ArticleConfigForm
              initialConfig={articleConfig}
              onSubmit={(config) => {
                setArticleConfig(config);
                setShowConfig(false);
              }}
              onCancel={() => setShowConfig(false)}
            />
          </div>
        </div>
      )}

      {/* Modal Coller HTML */}
      {showPasteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[85vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <div>
                <h2 className="text-xl font-semibold">Coller votre HTML</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Collez le HTML généré par un workflow, GPT, ou autre source
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPasteModal(false)}
              >
                ✕
              </Button>
            </div>

            {/* Content */}
            <div className="flex-1 p-6 overflow-y-auto">
              <textarea
                className="w-full h-[500px] p-4 font-mono text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                value={pasteHtmlInput}
                onChange={(e) => setPasteHtmlInput(e.target.value)}
                placeholder={`<!-- Collez votre HTML ici -->

Exemple :
<article>
  <h1>Titre de l'article</h1>
  <p>Paragraphe d'introduction...</p>
  <h2>Section 1</h2>
  <p>Contenu de la section...</p>
</article>`}
                spellCheck={false}
                autoFocus
              />
              <div className="mt-3 text-xs text-gray-500 flex items-start gap-2">
                <span>💡</span>
                <span>
                  Le HTML sera injecté dans l'éditeur TipTap. Assurez-vous que le HTML est valide
                  pour éviter les erreurs d'affichage.
                </span>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-6 border-t bg-gray-50">
              <div className="text-sm text-gray-600">
                {pasteHtmlInput.length > 0 && (
                  <span>
                    {pasteHtmlInput.length} caractères • {pasteHtmlInput.split(/\s+/).filter(Boolean).length} mots
                  </span>
                )}
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowPasteModal(false)}
                >
                  Annuler
                </Button>
                <Button
                  variant="default"
                  onClick={handlePasteHtml}
                  disabled={!pasteHtmlInput.trim()}
                >
                  <FileCode className="h-4 w-4 mr-2" />
                  Injecter le HTML
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Insertion Image */}
      {showImageModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <div>
                <h2 className="text-xl font-semibold">Insérer une image</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Choisissez un fichier local ou collez une URL
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowImageModal(false)}
              >
                ✕
              </Button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              {/* Upload fichier */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Fichier local
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                    className="flex-1 text-sm file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"
                  />
                  {imageFile && (
                    <Badge variant="secondary">
                      {(imageFile.size / 1024).toFixed(1)} KB
                    </Badge>
                  )}
                </div>
              </div>

              {/* Séparateur */}
              <div className="flex items-center gap-3">
                <div className="flex-1 border-t"></div>
                <span className="text-xs text-gray-500">OU</span>
                <div className="flex-1 border-t"></div>
              </div>

              {/* URL */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  URL de l'image
                </label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  disabled={!!imageFile}
                />
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50">
              <Button
                variant="outline"
                onClick={() => {
                  setShowImageModal(false);
                  setImageUrl('');
                  setImageFile(null);
                }}
              >
                Annuler
              </Button>
              <Button
                variant="default"
                onClick={handleInsertImage}
                disabled={!imageUrl && !imageFile}
              >
                <ImageIcon className="h-4 w-4 mr-2" />
                Insérer
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Insertion Lien */}
      {showLinkModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-xl w-full">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <div>
                <h2 className="text-xl font-semibold">Insérer un lien</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Créez un lien hypertexte
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowLinkModal(false)}
              >
                ✕
              </Button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Texte du lien
                </label>
                <input
                  type="text"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  placeholder="Cliquez ici"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  URL du lien <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  autoFocus
                />
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50">
              <Button
                variant="outline"
                onClick={() => {
                  setShowLinkModal(false);
                  setLinkUrl('');
                  setLinkText('');
                }}
              >
                Annuler
              </Button>
              <Button
                variant="default"
                onClick={handleInsertLink}
                disabled={!linkUrl.trim()}
              >
                <LinkIcon className="h-4 w-4 mr-2" />
                Insérer
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
