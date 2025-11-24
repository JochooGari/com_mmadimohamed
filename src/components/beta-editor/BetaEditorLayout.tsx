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
  BarChart3
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

  // Configuration TipTap
  const editor = useEditor({
    extensions: [
      StarterKit,
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
                <Button variant="outline">
                  <Eye className="h-4 w-4 mr-2" />
                  Aperçu
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
                  onClick={() => {
                    const url = window.prompt('URL de l\'image');
                    if (url && editor) {
                      editor.chain().focus().setImage({ src: url }).run();
                    }
                  }}
                >
                  <ImageIcon className="h-4 w-4 mr-2" />
                  Image
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const url = window.prompt('URL du lien');
                    if (url && editor) {
                      editor.chain().focus().setLink({ href: url }).run();
                    }
                  }}
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
              </div>
            </TabsContent>

            <TabsContent value="edition" className="m-0">
              <div className="flex items-center gap-2">
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
                <div className="w-px h-6 bg-gray-300 mx-1" />
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

            {/* Éditeur TipTap */}
            <EditorContent editor={editor} />
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
    </div>
  );
}
