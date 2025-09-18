import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import MarkdownRenderer from '../markdown/MarkdownRenderer';

const Schema = z.object({ title: z.string().min(3), slug: z.string().min(3), excerpt: z.string().optional(), content_md: z.string().optional(), published: z.boolean().optional() });
export type AdminEditorValues = z.infer<typeof Schema>;

export default function AdminEditor({ initial, onSubmit, onValuesChange, onRegisterActions }: { initial?: Partial<AdminEditorValues>; onSubmit: (v: AdminEditorValues) => void; onValuesChange?: (v: Partial<AdminEditorValues>) => void; onRegisterActions?: (a: { insertSnippet: (t: string) => void; setTitle: (t: string) => void; setSlug: (s: string) => void; setExcerpt: (e: string) => void; }) => void }) {
  const { register, handleSubmit, watch, setValue, getValues } = useForm<AdminEditorValues>({ resolver: zodResolver(Schema), defaultValues: { title: '', slug: '', ...initial } });
  const contentMd = watch('content_md') || '';

  // expose external actions
  if (onRegisterActions) {
    onRegisterActions({
      insertSnippet: (t: string) => setValue('content_md', (getValues('content_md') || '') + (getValues('content_md') ? '\n\n' : '') + t),
      setTitle: (t: string) => setValue('title', t),
      setSlug: (s: string) => setValue('slug', s),
      setExcerpt: (e: string) => setValue('excerpt', e),
    });
  }

  // propagate values for SEO panel
  if (onValuesChange) {
    const sub = watch((v) => onValuesChange(v as any));
    // Note: react-hook-form watch subscription returns unsubscribe
    // but avoid memory leak if component re-renders frequently
  }
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-3">
        <Input placeholder="Titre" {...register('title')} />
        <Input placeholder="Slug" {...register('slug')} />
        <Textarea placeholder="Résumé" {...register('excerpt')} />
        <Textarea placeholder="Markdown" rows={12} {...register('content_md')} />
        <button className="px-3 py-2 rounded bg-teal-600 text-white">Enregistrer</button>
      </div>
      <div>
        <h3 className="text-slate-700 font-semibold mb-2">Aperçu</h3>
        <MarkdownRenderer content={contentMd} />
      </div>
    </form>
  );
}


