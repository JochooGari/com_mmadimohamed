import SEOHead from '../components/seo/SEOHead';
import { PowerBILibrary } from '../components/powerbi/PowerBILibrary';
import { mockDashboards } from '../data/mock-powerbi-dashboards';

export default function LibraryPage() {
  const canonical = `${import.meta.env.SITE_URL ?? ''}/bibliotheque`;
  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Collection',
      name: 'Bibliothèque Power BI - Dashboards par expertise',
      url: canonical,
      description: 'Dashboards Power BI prêts à l\'emploi pour Finance, Comptabilité, Sales, Marketing et Supply Chain'
    }
  ];

  return (
    <section className="min-h-screen">
      <SEOHead
        title="Bibliothèque Power BI — Dashboards par expertise"
        description="Dashboards Power BI professionnels pour Finance, Comptabilité, Sales, Marketing et Supply Chain. Filtrez par topic, persona et sous-topic."
        canonical={canonical}
        jsonLd={jsonLd}
      />

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-teal-600 to-teal-700 text-white py-16 mt-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Bibliothèque Power BI
          </h1>
          <p className="text-xl opacity-90 max-w-4xl">
            Dashboards Power BI professionnels prêts à l'emploi, organisés par domaine d'expertise et persona.
            Chaque dashboard inclut les mesures DAX, KPIs essentiels, et documentation complète pour une implémentation rapide.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm">
              📊 Finance & Comptabilité
            </div>
            <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm">
              📈 Sales & Marketing
            </div>
            <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm">
              📦 Supply Chain
            </div>
            <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm">
              {mockDashboards.length} dashboards disponibles
            </div>
          </div>
        </div>
      </div>

      {/* Power BI Library Component */}
      <PowerBILibrary dashboards={mockDashboards} />
    </section>
  );
}


