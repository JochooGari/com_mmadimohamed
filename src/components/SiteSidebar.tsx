import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

type SidebarConfig = {
  ctaPrimary?: { title?: string; subtitle?: string; buttonLabel?: string; buttonHref?: string };
  leadMagnet?: { title?: string; subtitle?: string; placeholder?: string; buttonLabel?: string; href?: string };
  about?: { name?: string; role?: string; bio?: string; avatarUrl?: string; links?: { label: string; href: string }[] };
  caseStudies?: { title?: string; items?: { title: string; href: string }[] };
  traffic?: { title?: string; subtitle?: string; buttonLabel?: string; buttonHref?: string };
};

const defaults: SidebarConfig = {
  ctaPrimary: {
    title: 'Projet Data/IA Finance',
    subtitle: "Accélérez vos dashboards, ROI et automatisations (CFO/Comex).",
    buttonLabel: 'Discuter de votre projet',
    buttonHref: '/contact'
  },
  leadMagnet: {
    title: 'Discover 100s of keywords Instantly',
    subtitle: 'Mini-outils, prompts et checklists SEO/GEO à télécharger.',
    placeholder: 'Votre email professionnel',
    buttonLabel: 'Télécharger',
    href: '/bibliotheque'
  },
  about: {
    name: 'MMADI Mohamed',
    role: 'Data Analyst & Expert Power BI',
    bio: 'J’aide CFO/CMO à piloter le cash, automatiser le reporting et industrialiser les insights via Power BI, IA et scripts.',
    avatarUrl: 'https://www.gravatar.com/avatar?d=identicon',
    links: [
      { label: 'LinkedIn', href: 'https://www.linkedin.com' },
      { label: 'Portfolio', href: '/' }
    ]
  },
  caseStudies: {
    title: 'Études de cas',
    items: [
      { title: 'Automatisation reporting CFO (+30h/mois gagnées)', href: '/blog' },
      { title: 'Pilotage cash temps réel (FinOps)', href: '/blog' },
      { title: 'Data Marketing: attribution & ROI', href: '/blog' }
    ]
  },
  traffic: {
    title: 'Envie de plus de trafic qualifié ?',
    subtitle: 'Scoring SEO/GEO + contenu assisté IA pour votre niche.',
    buttonLabel: 'Lancer un audit gratuit',
    buttonHref: '/contact'
  }
};

export default function SiteSidebar() {
  const [cfg, setCfg] = useState<SidebarConfig>(defaults);

  useEffect(() => { (async () => {
    try {
      const r = await fetch('/api/storage?agent=site&type=sidebar');
      if (r.ok) {
        const d = await r.json();
        setCfg({ ...defaults, ...(d || {}) });
      }
    } catch {}
  })(); }, []);

  return (
    <aside className="space-y-6 lg:sticky lg:top-24">
      {/* Primary CTA */}
      <div className="rounded-xl border bg-gradient-to-br from-teal-50 to-white p-5 shadow-sm">
        <h3 className="text-xl font-semibold text-slate-900">{cfg.ctaPrimary?.title}</h3>
        <p className="text-slate-600 mt-1">{cfg.ctaPrimary?.subtitle}</p>
        <Link to={cfg.ctaPrimary?.buttonHref || '/contact'} className="mt-3 inline-flex items-center justify-center rounded-lg bg-teal-600 px-4 py-2 text-white hover:bg-teal-700">
          {cfg.ctaPrimary?.buttonLabel}
        </Link>
      </div>

      {/* Lead magnet */}
      <div className="rounded-xl border bg-white p-5 shadow-sm">
        <h4 className="font-semibold text-slate-900">{cfg.leadMagnet?.title}</h4>
        <p className="text-slate-600 text-sm mt-1">{cfg.leadMagnet?.subtitle}</p>
        <div className="mt-3 flex gap-2">
          <input type="email" placeholder={cfg.leadMagnet?.placeholder} className="flex-1 rounded-md border px-3 py-2 text-sm" />
          <a href={cfg.leadMagnet?.href} className="rounded-md bg-slate-900 text-white px-3 py-2 text-sm hover:bg-slate-800">{cfg.leadMagnet?.buttonLabel}</a>
        </div>
      </div>

      {/* About */}
      <div className="rounded-xl border bg-white p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <img src={cfg.about?.avatarUrl} alt={cfg.about?.name} className="h-12 w-12 rounded-full object-cover" />
          <div>
            <div className="font-semibold text-slate-900">{cfg.about?.name}</div>
            <div className="text-sm text-slate-600">{cfg.about?.role}</div>
          </div>
        </div>
        <p className="text-sm text-slate-700 mt-3">{cfg.about?.bio}</p>
        {cfg.about?.links && (
          <div className="mt-3 flex flex-wrap gap-2">
            {cfg.about.links.map((l, i) => (
              <a key={i} href={l.href} className="text-sm text-teal-700 hover:underline">{l.label}</a>
            ))}
          </div>
        )}
      </div>

      {/* Case studies */}
      <div className="rounded-xl border bg-white p-5 shadow-sm">
        <h4 className="font-semibold text-slate-900">{cfg.caseStudies?.title}</h4>
        <ul className="mt-2 space-y-2">
          {(cfg.caseStudies?.items || []).map((it, i) => (
            <li key={i}><a className="text-sm text-slate-700 hover:text-teal-700 hover:underline" href={it.href}>{it.title}</a></li>
          ))}
        </ul>
      </div>

      {/* Traffic CTA */}
      <div className="rounded-xl border bg-gradient-to-br from-orange-50 to-white p-5 shadow-sm">
        <h4 className="font-semibold text-slate-900">{cfg.traffic?.title}</h4>
        <p className="text-sm text-slate-700 mt-1">{cfg.traffic?.subtitle}</p>
        <Link to={cfg.traffic?.buttonHref || '/contact'} className="mt-3 inline-flex items-center justify-center rounded-lg bg-orange-600 px-4 py-2 text-white hover:bg-orange-700">
          {cfg.traffic?.buttonLabel}
        </Link>
      </div>
    </aside>
  );
}


