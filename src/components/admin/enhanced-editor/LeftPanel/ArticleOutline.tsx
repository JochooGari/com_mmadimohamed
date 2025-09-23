import { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, Hash, Type, Move3D, Plus } from 'lucide-react';

interface OutlineItem {
  id: string;
  level: 1 | 2 | 3 | 4 | 5 | 6;
  text: string;
  wordCount: number;
  position: number;
  isOptimized: boolean;
}

interface ArticleOutlineProps {
  content: string;
  onStructureChange?: (newStructure: OutlineItem[]) => void;
}

export default function ArticleOutline({ content, onStructureChange }: ArticleOutlineProps) {
  const [outline, setOutline] = useState<OutlineItem[]>([]);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [draggedItem, setDraggedItem] = useState<string | null>(null);

  // Extract outline from markdown content
  useEffect(() => {
    const extractOutline = (markdown: string): OutlineItem[] => {
      const lines = markdown.split('\n');
      const items: OutlineItem[] = [];
      let position = 0;

      lines.forEach((line, index) => {
        const match = line.match(/^(#{1,6})\s+(.+)$/);
        if (match) {
          const level = match[1].length as 1 | 2 | 3 | 4 | 5 | 6;
          const text = match[2].trim();

          // Calculate word count for this section
          let sectionWordCount = 0;
          for (let i = index + 1; i < lines.length; i++) {
            if (lines[i].match(/^#{1,6}\s+/)) break;
            sectionWordCount += lines[i].split(/\s+/).filter(word => word.length > 0).length;
          }

          items.push({
            id: `heading-${index}-${Date.now()}`,
            level,
            text,
            wordCount: sectionWordCount,
            position,
            isOptimized: sectionWordCount >= 150 && sectionWordCount <= 300
          });
          position++;
        }
      });

      return items;
    };

    setOutline(extractOutline(content));
  }, [content]);

  const toggleExpanded = (id: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const getIndentLevel = (level: number) => {
    return (level - 1) * 16;
  };

  const getLevelIcon = (level: number) => {
    switch (level) {
      case 1: return <Type className="w-4 h-4 text-purple-600" />;
      case 2: return <Hash className="w-3.5 h-3.5 text-blue-600" />;
      case 3: return <Hash className="w-3 h-3 text-green-600" />;
      default: return <Hash className="w-2.5 h-2.5 text-gray-500" />;
    }
  };

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedItem(id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedItem || draggedItem === targetId) return;

    // Implement reordering logic here
    const newOutline = [...outline];
    const draggedIndex = newOutline.findIndex(item => item.id === draggedItem);
    const targetIndex = newOutline.findIndex(item => item.id === targetId);

    if (draggedIndex !== -1 && targetIndex !== -1) {
      const [draggedElement] = newOutline.splice(draggedIndex, 1);
      newOutline.splice(targetIndex, 0, draggedElement);
      setOutline(newOutline);
      onStructureChange?.(newOutline);
    }

    setDraggedItem(null);
  };

  const getWordCountColor = (count: number) => {
    if (count < 50) return 'text-red-500';
    if (count < 150) return 'text-orange-500';
    if (count <= 300) return 'text-green-500';
    return 'text-blue-500';
  };

  const totalWords = outline.reduce((sum, item) => sum + item.wordCount, 0);
  const optimizedSections = outline.filter(item => item.isOptimized).length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
          Plan de l'article
        </h3>

        {/* Statistics */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-2">
            <div className="text-xs text-gray-600 dark:text-gray-400">Total mots</div>
            <div className="font-semibold text-gray-900 dark:text-white">{totalWords}</div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-2">
            <div className="text-xs text-gray-600 dark:text-gray-400">Sections OK</div>
            <div className="font-semibold text-gray-900 dark:text-white">
              {optimizedSections}/{outline.length}
            </div>
          </div>
        </div>

        {/* SEO Structure Suggestion */}
        {outline.length === 0 && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mb-4">
            <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
              Structure SEO recommandée
            </h4>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <li>• 1 titre H1 (titre principal)</li>
              <li>• 2-4 titres H2 (sections principales)</li>
              <li>• 3-6 titres H3 (sous-sections)</li>
              <li>• 150-300 mots par section</li>
            </ul>
          </div>
        )}
      </div>

      {/* Outline Tree */}
      <div className="space-y-1">
        {outline.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <Type className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Commencez à écrire pour voir la structure</p>
          </div>
        ) : (
          outline.map((item) => (
            <div
              key={item.id}
              className={`group relative border border-gray-200 dark:border-gray-600 rounded-lg p-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                draggedItem === item.id ? 'opacity-50' : ''
              }`}
              draggable
              onDragStart={(e) => handleDragStart(e, item.id)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, item.id)}
              style={{ marginLeft: getIndentLevel(item.level) }}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-2 flex-1 min-w-0">
                  {/* Level Icon */}
                  <div className="flex-shrink-0 mt-0.5">
                    {getLevelIcon(item.level)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm text-gray-900 dark:text-white truncate">
                      {item.text}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-xs ${getWordCountColor(item.wordCount)}`}>
                        {item.wordCount} mots
                      </span>
                      {item.isOptimized && (
                        <span className="text-xs bg-green-100 text-green-800 px-1.5 py-0.5 rounded-full">
                          ✓ Optimisé
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    className="p-1 text-gray-400 hover:text-gray-600 rounded"
                    title="Déplacer"
                  >
                    <Move3D className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Optimization Tips */}
              {!item.isOptimized && (
                <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  {item.wordCount < 150 && "💡 Section trop courte (min 150 mots)"}
                  {item.wordCount > 300 && "⚠️ Section trop longue (max 300 mots)"}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Quick Actions */}
      <div className="pt-4 border-t border-gray-200 dark:border-gray-600">
        <h4 className="font-medium text-sm text-gray-900 dark:text-white mb-2">
          Actions rapides
        </h4>
        <div className="space-y-2">
          <button className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-md transition-colors">
            <Plus className="w-4 h-4 inline mr-2" />
            Ajouter une section
          </button>
          <button className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-md transition-colors">
            <Type className="w-4 h-4 inline mr-2" />
            Optimiser la structure SEO
          </button>
        </div>
      </div>
    </div>
  );
}