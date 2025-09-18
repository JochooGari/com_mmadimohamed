import { useQuery } from '@tanstack/react-query';
import { tryGetSupabaseClient } from '../lib/supabase';

export interface ListParams {
  q?: string;
  tags?: string[];
  category?: string;
  sort?: 'recent' | 'popular';
  page?: number;
  pageSize?: number;
}

const DEFAULT_PAGE_SIZE = 12;

export function useResources(params: ListParams) {
  const { q, tags, category, sort = 'recent', page = 1, pageSize = DEFAULT_PAGE_SIZE } = params;
  return useQuery({
    queryKey: ['resources', { q, tags, category, sort, page, pageSize }],
    queryFn: async () => {
      const supabase = tryGetSupabaseClient();
      if (!supabase) return { items: [], count: 0 };
      let query = supabase.from('resources').select('*', { count: 'exact' }).eq('published', true);

      if (q) query = query.ilike('title', `%${q}%`);
      if (category) query = query.eq('category', category);
      if (tags && tags.length) query = query.contains('tags', tags);
      if (sort === 'popular') query = query.order('downloads', { ascending: false });
      else query = query.order('published_at', { ascending: false });

      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      const { data, count, error } = await query.range(from, to);
      if (error) throw error;
      return { items: data ?? [], count: count ?? 0 };
    },
  });
}

export function useArticles(params: ListParams) {
  const { q, tags, sort = 'recent', page = 1, pageSize = DEFAULT_PAGE_SIZE } = params;
  return useQuery({
    queryKey: ['articles', { q, tags, sort, page, pageSize }],
    queryFn: async () => {
      const supabase = tryGetSupabaseClient();
      if (!supabase) return { items: [], count: 0 };
      let query = supabase.from('articles').select('*', { count: 'exact' }).eq('published', true);
      if (q) query = query.ilike('title', `%${q}%`);
      if (tags && tags.length) query = query.contains('tags', tags);
      if (sort === 'popular') query = query.order('published_at', { ascending: false });
      else query = query.order('published_at', { ascending: false });

      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      const { data, count, error } = await query.range(from, to);
      if (error) throw error;
      return { items: data ?? [], count: count ?? 0 };
    },
  });
}


