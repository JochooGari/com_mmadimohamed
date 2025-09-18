import { Link } from 'react-router-dom';

export interface Crumb { label: string; href?: string }

export default function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav className="text-sm text-slate-600 mb-4" aria-label="breadcrumb">
      <ol className="flex flex-wrap gap-1 items-center">
        {items.map((c, i) => (
          <li key={i} className="flex items-center gap-1">
            {c.href ? <Link className="hover:text-teal-700" to={c.href}>{c.label}</Link> : <span>{c.label}</span>}
            {i < items.length - 1 && <span className="mx-1">/</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}


