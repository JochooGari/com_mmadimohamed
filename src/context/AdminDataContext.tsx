import { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type ResearchItem = { id: string; topic: string; source: string; relevance: number; keywords: string[]; addedBy: string; timestamp: string; insights: string };
export type ContentItem = { id: string; type: 'LinkedIn Post' | 'Article' | 'Newsletter'; title: string; content: string; status: 'draft' | 'pending' | 'approved' | 'published'; createdBy: string; scheduledFor?: string };
export type PerformanceItem = { contentId: string; views: number; likes: number; comments: number; shares: number; engagementRate: number; sentiment: 'positive'|'neutral'|'negative' };

type AdminData = {
  research: ResearchItem[];
  content: ContentItem[];
  performance: PerformanceItem[];
  addResearch: (r: Omit<ResearchItem, 'id'|'timestamp'>) => void;
  addContent: (c: Omit<ContentItem, 'id'>) => void;
  updateContentStatus: (id: string, status: ContentItem['status']) => void;
  addPerformance: (p: PerformanceItem) => void;
};

const Ctx = createContext<AdminData | null>(null);

export function AdminDataProvider({ children }: { children: React.ReactNode }) {
  const [research, setResearch] = useState<ResearchItem[]>(() => {
    try { const raw = localStorage.getItem('admin:data:research'); return raw ? JSON.parse(raw) : []; } catch { return []; }
  });
  const [content, setContent] = useState<ContentItem[]>(() => {
    try { const raw = localStorage.getItem('admin:data:content'); return raw ? JSON.parse(raw) : []; } catch { return []; }
  });
  const [performance, setPerformance] = useState<PerformanceItem[]>(() => {
    try { const raw = localStorage.getItem('admin:data:performance'); return raw ? JSON.parse(raw) : []; } catch { return []; }
  });

  useEffect(() => { try { localStorage.setItem('admin:data:research', JSON.stringify(research)); } catch {} }, [research]);
  useEffect(() => { try { localStorage.setItem('admin:data:content', JSON.stringify(content)); } catch {} }, [content]);
  useEffect(() => { try { localStorage.setItem('admin:data:performance', JSON.stringify(performance)); } catch {} }, [performance]);

  const api = useMemo<AdminData>(() => ({
    research,
    content,
    performance,
    addResearch: (r) => setResearch(prev => [{ id: `R${Date.now()}`, timestamp: new Date().toISOString(), ...r }, ...prev]),
    addContent: (c) => setContent(prev => [{ id: `C${Date.now()}`, ...c }, ...prev]),
    updateContentStatus: (id, status) => setContent(prev => prev.map(x => x.id === id ? { ...x, status } : x)),
    addPerformance: (p) => setPerformance(prev => [p, ...prev]),
  }), [research, content, performance]);

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export function useAdminData() {
  const c = useContext(Ctx);
  if (!c) throw new Error('useAdminData must be used within AdminDataProvider');
  return c;
}



