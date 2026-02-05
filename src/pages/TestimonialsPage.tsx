import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Star,
  Play,
  Quote,
  Video,
  Download,
  Mail,
  BadgeCheck,
  Linkedin,
  Github,
  Twitter,
  Copyright,
  ArrowLeft,
  ExternalLink,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type Category = 'all' | 'powerbi' | 'data-eng' | 'formation';

interface Testimonial {
  id: string;
  type: 'video' | 'text';
  category: Category[];
  quote: string;
  authorName: string;
  authorInitials: string;
  authorTitle: string;
  verified: boolean;
  stars: number;
  videoDuration?: string;
  videoThumbnail?: string;
}

// ---------------------------------------------------------------------------
// Data  – adapted to MMADI Mohamed's real CV expertise
// ---------------------------------------------------------------------------
const testimonials: Testimonial[] = [
  {
    id: '1',
    type: 'video',
    category: ['powerbi'],
    quote:
      "Le tableau de bord financier Power BI concu par Mohamed nous a permis de reduire nos delais de reporting de 5 jours a quelques heures. Un vrai game-changer pour notre direction financiere.",
    authorName: 'Jean Leclerc',
    authorInitials: 'JL',
    authorTitle: 'CFO, FinanceCorp',
    verified: true,
    stars: 5,
    videoDuration: '02:14',
    videoThumbnail:
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop',
  },
  {
    id: '2',
    type: 'video',
    category: ['formation'],
    quote:
      "Excellente pedagogie lors de la formation Power BI de nos equipes. Nous sommes maintenant autonomes sur la creation de rapports et la modelisation DAX.",
    authorName: 'Sophie Martin',
    authorInitials: 'SM',
    authorTitle: 'DRH, TechSolutions',
    verified: false,
    stars: 5,
    videoDuration: '01:45',
    videoThumbnail:
      'https://images.unsplash.com/photo-1551434678-e076c223a692?q=80&w=2070&auto=format&fit=crop',
  },
  {
    id: '3',
    type: 'video',
    category: ['data-eng'],
    quote:
      "La refonte de notre architecture de donnees multi-cloud Azure/GCP a ete un tournant. Les donnees sont fiables, automatisees et le reporting self-service fonctionne parfaitement.",
    authorName: 'Pierre Dubois',
    authorInitials: 'PD',
    authorTitle: 'CTO, RetailGroup',
    verified: true,
    stars: 5,
    videoDuration: '03:20',
    videoThumbnail:
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2015&auto=format&fit=crop',
  },
  {
    id: '4',
    type: 'video',
    category: ['powerbi'],
    quote:
      "Diagnostic clair lors de l'audit Power BI. Les optimisations DAX et Power Query ont divise le temps de chargement de nos rapports par 3.",
    authorName: 'Amelie Laurent',
    authorInitials: 'AL',
    authorTitle: 'Data Manager, LogistiX',
    verified: false,
    stars: 5,
    videoDuration: '01:12',
  },
  {
    id: '5',
    type: 'text',
    category: ['data-eng', 'powerbi'],
    quote:
      "Nous avions des donnees eparpillees sur Excel, SAP et Salesforce. Le modele de donnees unifie mis en place par Mohamed est robuste et evolutif. Un vrai partenaire Data qui comprend les enjeux metier.",
    authorName: 'Thomas Robert',
    authorInitials: 'TR',
    authorTitle: 'CEO, StartupFlow',
    verified: false,
    stars: 5,
  },
  {
    id: '6',
    type: 'text',
    category: ['formation', 'powerbi'],
    quote:
      "La gouvernance data instauree et les formations sur mesure ont permis a nos equipes Pharma d'etre totalement autonomes. Mohamed sait traduire le technique en langage business.",
    authorName: 'Claire Fontaine',
    authorInitials: 'CF',
    authorTitle: 'Directrice Data, PharmaCo',
    verified: true,
    stars: 5,
  },
];

const categories: { value: Category; label: string }[] = [
  { value: 'all', label: 'Tous' },
  { value: 'powerbi', label: 'Power BI' },
  { value: 'data-eng', label: 'Data Eng' },
  { value: 'formation', label: 'Formation' },
];

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------
const Stars: React.FC<{ count: number }> = ({ count }) => (
  <div className="flex gap-1 text-teal-500">
    {Array.from({ length: count }).map((_, i) => (
      <Star key={i} className="w-3.5 h-3.5 fill-current" />
    ))}
  </div>
);

const VideoCard: React.FC<{ t: Testimonial }> = ({ t }) => (
  <motion.div
    layout
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: 20 }}
    transition={{ duration: 0.35 }}
    className="group relative flex flex-col gap-5"
  >
    {/* Thumbnail */}
    <div className="relative aspect-video rounded-2xl overflow-hidden border border-slate-100 bg-slate-50 card-shadow cursor-pointer">
      {t.videoThumbnail ? (
        <img
          src={t.videoThumbnail}
          alt="Preview"
          className="absolute inset-0 w-full h-full object-cover opacity-90 transition-transform duration-700 group-hover:scale-105"
        />
      ) : (
        <>
          <div className="absolute inset-0 bg-gradient-to-br from-teal-50 to-white" />
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-teal-500 to-transparent" />
        </>
      )}
      <div className="absolute inset-0 bg-slate-900/10 group-hover:bg-slate-900/20 transition-colors" />

      {/* Play */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-16 h-16 rounded-full bg-white/90 backdrop-blur-sm shadow-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110">
          <Play className="text-teal-600 ml-1 w-6 h-6 fill-teal-600" />
        </div>
      </div>

      {t.videoDuration && (
        <div className="absolute bottom-4 right-4 px-2.5 py-1 rounded-md bg-black/70 backdrop-blur-md text-[11px] font-semibold text-white">
          {t.videoDuration}
        </div>
      )}
    </div>

    {/* Content */}
    <div className="flex flex-col gap-3 px-1">
      <Stars count={t.stars} />
      <p className="text-sm text-slate-600 font-medium leading-relaxed line-clamp-2">
        "{t.quote}"
      </p>
      <div className="flex items-center gap-3 pt-2">
        <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-xs text-slate-700 font-bold border border-slate-200">
          {t.authorInitials}
        </div>
        <div>
          <h3 className="text-sm font-semibold text-slate-900">{t.authorName}</h3>
          <p className="text-xs text-slate-500">{t.authorTitle}</p>
        </div>
        {t.verified && (
          <div className="ml-auto">
            <BadgeCheck className="text-teal-500 w-5 h-5" />
          </div>
        )}
      </div>
    </div>
  </motion.div>
);

const TextCard: React.FC<{ t: Testimonial }> = ({ t }) => (
  <motion.div
    layout
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: 20 }}
    transition={{ duration: 0.35 }}
    className="group relative flex flex-col gap-5"
  >
    <div className="bg-white rounded-2xl p-8 flex flex-col justify-between h-full min-h-[240px] border border-slate-200 card-shadow transition-colors">
      <div>
        <Quote className="text-teal-200 fill-teal-50 w-8 h-8 mb-4" />
        <p className="text-sm text-slate-600 font-medium leading-relaxed">
          "{t.quote}"
        </p>
      </div>
      <div className="flex items-center gap-3 pt-6 mt-auto border-t border-slate-100">
        <div className="w-9 h-9 rounded-full bg-teal-50 flex items-center justify-center text-xs text-teal-700 font-bold border border-teal-100">
          {t.authorInitials}
        </div>
        <div>
          <h3 className="text-sm font-semibold text-slate-900">{t.authorName}</h3>
          <p className="text-xs text-slate-500">{t.authorTitle}</p>
        </div>
        {t.verified && (
          <div className="ml-auto">
            <BadgeCheck className="text-teal-500 w-5 h-5" />
          </div>
        )}
      </div>
    </div>
  </motion.div>
);

const CtaCard: React.FC = () => (
  <motion.div
    layout
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: 20 }}
    transition={{ duration: 0.35 }}
    className="group relative flex flex-col justify-center items-center text-center p-6 rounded-2xl border-2 border-dashed border-slate-200 hover:border-teal-200 transition-all bg-slate-50/50"
  >
    <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center mb-4 text-teal-600">
      <Video className="w-6 h-6" />
    </div>
    <h3 className="text-slate-900 font-bold mb-2">Vous etes client ?</h3>
    <p className="text-sm text-slate-500 mb-6 max-w-[200px]">
      Partagez votre experience et aidez d'autres entreprises.
    </p>
    <a
      href="mailto:contact@mmadimohamed.com?subject=Temoignage%20client"
      className="px-5 py-2.5 rounded-lg bg-white text-slate-900 text-sm font-semibold border border-slate-200 hover:border-teal-300 hover:text-teal-700 transition-all shadow-sm"
    >
      Envoyer un temoignage
    </a>
  </motion.div>
);

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------
export default function TestimonialsPage() {
  const [activeFilter, setActiveFilter] = useState<Category>('all');

  const filtered =
    activeFilter === 'all'
      ? testimonials
      : testimonials.filter((t) => t.category.includes(activeFilter));

  return (
    <div className="min-h-screen bg-white text-slate-600 antialiased selection:bg-teal-100 selection:text-teal-800">
      {/* Background gradient blobs */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute -top-[10%] -right-[5%] w-[600px] h-[600px] bg-teal-50/80 rounded-full blur-3xl rotate-12 opacity-70" />
        <div className="absolute top-[20%] -left-[10%] w-[500px] h-[500px] bg-teal-100/40 rounded-full blur-3xl opacity-60" />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-teal-400 rounded-full flex items-center justify-center shadow-sm group-hover:bg-teal-500 transition-colors">
              <span className="text-white font-bold text-sm tracking-tighter">MM</span>
            </div>
            <span className="text-slate-900 font-bold tracking-tight text-lg">
              Chef de projet Data
            </span>
          </Link>

          <div className="hidden lg:flex items-center gap-8 text-sm font-medium text-slate-500">
            <Link to="/" className="hover:text-teal-600 transition-colors">
              Accueil
            </Link>
            <Link to="/#expertise" className="hover:text-teal-600 transition-colors">
              Expertise
            </Link>
            <Link to="/blog" className="hover:text-teal-600 transition-colors">
              Blog
            </Link>
            <Link to="/bibliotheque" className="hover:text-teal-600 transition-colors">
              Bibliotheque
            </Link>
            <span className="text-teal-600 font-semibold">Temoignages</span>
          </div>

          <div className="hidden sm:flex items-center gap-3">
            <Link
              to="/#contact"
              className="text-sm font-semibold text-white bg-slate-900 hover:bg-black px-5 py-2.5 rounded-lg transition-all shadow-sm"
            >
              Me contacter
            </Link>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Back link */}
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-teal-600 transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour a l'accueil
          </Link>

          {/* Hero */}
          <div className="text-center max-w-3xl mx-auto mb-20">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-teal-100 bg-teal-50 text-teal-700 text-xs font-semibold mb-8 shadow-sm">
              <Star className="w-3.5 h-3.5 fill-teal-700" />
              <span>100% Satisfaction Client</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold text-slate-900 tracking-tight mb-6 leading-[1.1]">
              La donnee transforme
              <br />
              <span className="text-teal-600">votre business.</span>
            </h1>

            <p className="text-lg text-slate-500 font-normal leading-relaxed max-w-2xl mx-auto">
              Decouvrez comment j'aide les entreprises a visualiser leurs KPIs et optimiser
              leurs decisions grace a Power BI, la gouvernance data et la formation sur
              mesure. Retours d'experience directs.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-24 border-y border-slate-100 py-10 bg-white/50">
            <div className="text-center md:border-r border-slate-100">
              <div className="text-3xl font-bold text-slate-900 tracking-tight mb-1">50+</div>
              <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                Dashboards livres
              </div>
            </div>
            <div className="text-center md:border-r border-slate-100 hidden md:block">
              <div className="text-3xl font-bold text-slate-900 tracking-tight mb-1">8 Ans</div>
              <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                Expertise Power BI
              </div>
            </div>
            <div className="text-center md:border-r border-slate-100 hidden md:block">
              <div className="text-3xl font-bold text-slate-900 tracking-tight mb-1">5+</div>
              <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                Secteurs d'activite
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-slate-900 tracking-tight mb-1">5/5</div>
              <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                Note Moyenne
              </div>
            </div>
          </div>

          {/* Filter tabs */}
          <div className="flex justify-center mb-16">
            <div className="inline-flex p-1.5 bg-slate-100 rounded-xl border border-slate-200">
              {categories.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setActiveFilter(cat.value)}
                  className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeFilter === cat.value
                      ? 'bg-white text-slate-900 font-semibold shadow-sm ring-1 ring-slate-200'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Grid */}
          <motion.div
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            <AnimatePresence mode="popLayout">
              {filtered.map((t) =>
                t.type === 'video' ? (
                  <VideoCard key={t.id} t={t} />
                ) : (
                  <TextCard key={t.id} t={t} />
                )
              )}
              <CtaCard key="cta" />
            </AnimatePresence>
          </motion.div>

          {/* Bottom CTA */}
          <div className="mt-32 relative overflow-hidden rounded-[2rem] bg-teal-50 border border-teal-100">
            <div className="absolute -right-20 -top-20 w-64 h-64 bg-teal-200 rounded-full blur-3xl opacity-30" />
            <div className="absolute left-10 bottom-10 w-32 h-32 bg-teal-300 rounded-[2rem] rotate-12 blur-sm opacity-20" />

            <div className="relative z-10 px-8 py-20 text-center">
              <h2 className="text-3xl md:text-5xl font-bold text-slate-900 tracking-tight mb-5">
                Pret a valoriser vos donnees ?
              </h2>
              <p className="text-slate-500 mb-10 max-w-xl mx-auto text-lg">
                Discutons de votre projet Power BI, Data Engineering ou de vos besoins en
                formation sur mesure.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <a
                  href="/Mohamed_MMADI_CV.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-8 py-3.5 rounded-lg bg-teal-600 text-white font-semibold hover:bg-teal-700 transition-all shadow-lg shadow-teal-600/20 flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Telecharger mon CV
                </a>
                <Link
                  to="/#contact"
                  className="w-full sm:w-auto px-8 py-3.5 rounded-lg bg-white border border-teal-200 text-teal-700 hover:bg-teal-50 transition-all font-semibold flex items-center justify-center gap-2"
                >
                  <Mail className="w-4 h-4" />
                  Me contacter
                </Link>
              </div>

              {/* Skill tags */}
              <div className="hidden lg:flex absolute bottom-8 left-8 gap-2">
                <span className="px-3 py-1 bg-white/60 backdrop-blur rounded text-[10px] font-semibold text-teal-800 border border-teal-100">
                  Power BI
                </span>
                <span className="px-3 py-1 bg-white/60 backdrop-blur rounded text-[10px] font-semibold text-teal-800 border border-teal-100">
                  SQL Server
                </span>
                <span className="px-3 py-1 bg-white/60 backdrop-blur rounded text-[10px] font-semibold text-teal-800 border border-teal-100">
                  Azure
                </span>
                <span className="px-3 py-1 bg-white/60 backdrop-blur rounded text-[10px] font-semibold text-teal-800 border border-teal-100">
                  DAX
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-100 bg-white py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 text-slate-400">
            <Copyright className="w-4 h-4" />
            <span className="text-sm font-medium">
              2025 MMADI Mohamed - Chef de projet Data. Tous droits reserves.
            </span>
          </div>
          <div className="flex gap-6">
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-teal-600 transition-colors"
            >
              <Linkedin className="w-5 h-5" />
            </a>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-teal-600 transition-colors"
            >
              <Github className="w-5 h-5" />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-teal-600 transition-colors"
            >
              <Twitter className="w-5 h-5" />
            </a>
          </div>
        </div>
      </footer>

      {/* Inline styles for card shadow effects */}
      <style>{`
        .card-shadow {
          box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.05), 0 0 3px rgba(0,0,0,0.05);
        }
        .card-shadow:hover {
          box-shadow: 0 10px 40px -5px rgba(13, 148, 136, 0.15), 0 0 5px rgba(13, 148, 136, 0.1);
        }
      `}</style>
    </div>
  );
}
