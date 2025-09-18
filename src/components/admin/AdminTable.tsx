import { useEffect, useState } from 'react';
import { getSupabaseClient, tryGetSupabaseClient } from '../../lib/supabase';
import { defaultContent } from '../../data/defaultContent';

export interface AdminRow { id: string; slug?: string; title?: string; updated_at?: string; }

export default function AdminTable({ mode, onSelect }: { mode: 'articles' | 'resources'; onSelect: (row: AdminRow | null) => void }) {
  const [rows, setRows] = useState<AdminRow[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const supabase = tryGetSupabaseClient();
      if (supabase) {
        const { data } = await supabase.from(mode).select('id,slug,title,updated_at').order('updated_at', { ascending: false }).limit(100);
        setRows((data as any) ?? []);
      } else {
        // merge localStorage items with defaults
        const key = mode === 'articles' ? 'local:articles' : 'local:resources';
        let local: AdminRow[] = [];
        try { const raw = window.localStorage.getItem(key); local = raw ? JSON.parse(raw) as AdminRow[] : []; } catch {}
        if (mode === 'articles') {
          const base = defaultContent.blog.map((a) => ({ id: a.id, title: a.title, slug: a.title.toLowerCase().replace(/\s+/g, '-'), updated_at: '' }));
          setRows([ ...local, ...base ]);
        } else {
          const base = defaultContent.resources.map((r) => ({ id: r.id, title: r.title, slug: r.title.toLowerCase().replace(/\s+/g, '-'), updated_at: '' }));
          setRows([ ...local, ...base ]);
        }
      }
      setLoading(false);
    };
    load();
  }, [mode]);

  return (
    <div className="border rounded">
      <div className="px-3 py-2 border-b flex items-center justify-between">
        <div className="font-semibold capitalize">{mode}</div>
        <button className="px-2 py-1 text-sm rounded bg-teal-600 text-white" onClick={() => onSelect({ id: '', title: '', slug: '' })}>Nouveau</button>
      </div>
      <div className="max-h-[420px] overflow-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left">
            <tr>
              <th className="p-2">Titre</th>
              <th className="p-2">Slug</th>
              <th className="p-2 w-24">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td className="p-2" colSpan={3}>Chargement…</td></tr>
            )}
            {!loading && rows.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="p-2">{r.title}</td>
                <td className="p-2 text-slate-500">{r.slug}</td>
                <td className="p-2">
                  <button className="px-2 py-1 text-sm rounded border" onClick={() => onSelect(r)}>Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}


