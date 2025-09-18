import { useState } from 'react';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';

interface FiltersBarProps {
  q?: string;
  onQChange: (v: string) => void;
  category?: string;
  onCategoryChange: (v: string | undefined) => void;
  tags: string[];
  onTagsChange: (tags: string[]) => void;
  sort: 'recent' | 'popular';
  onSortChange: (v: 'recent' | 'popular') => void;
  categories?: string[];
  availableTags?: string[];
}

export default function FiltersBar({ q, onQChange, category, onCategoryChange, tags, onTagsChange, sort, onSortChange, categories = [], availableTags = [] }: FiltersBarProps) {
  const [tagInput, setTagInput] = useState('');

  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div className="flex gap-3 flex-1">
        <Input placeholder="Rechercher..." value={q ?? ''} onChange={(e) => onQChange(e.target.value)} />
        {categories.length > 0 && (
          <Select value={category ?? 'all'} onValueChange={(v) => onCategoryChange(v === 'all' ? undefined : v)}>
            <SelectTrigger className="w-48"><SelectValue placeholder="Catégorie" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        <Select value={sort} onValueChange={(v) => onSortChange(v as 'recent' | 'popular')}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Tri" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">Récents</SelectItem>
            <SelectItem value="popular">Populaires</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <Input placeholder="Ajouter tag" value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={(e) => {
          if (e.key === 'Enter' && tagInput.trim()) {
            if (!tags.includes(tagInput.trim())) onTagsChange([...tags, tagInput.trim()]);
            setTagInput('');
          }
        }} className="w-40" />
        {availableTags?.slice(0, 6).map((t) => (
          <button key={t} onClick={() => onTagsChange(Array.from(new Set([...tags, t])))} className="text-sm text-slate-600 hover:text-teal-700">
            #{t}
          </button>
        ))}
        <div className="flex gap-2 flex-wrap">
          {tags.map((t) => (
            <Badge key={t} variant="secondary" className="cursor-pointer" onClick={() => onTagsChange(tags.filter((x) => x !== t))}>#{t} ✕</Badge>
          ))}
        </div>
      </div>
    </div>
  );
}


