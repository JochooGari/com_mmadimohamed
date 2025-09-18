import SEOHead from '../components/seo/SEOHead';
import { Button } from '../components/ui/button';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { BarChart2, LineChart, Cog, Layers } from 'lucide-react';

export default function ServicesPowerBIParis() {
  const siteUrl = (import.meta as any).env.SITE_URL || 'http://localhost:5173';
  const phone = '+33 6 86 16 97 50'.replace(/\s+/g, ' ');

  const jsonLd = [{
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: 'Services Power BI — Paris',
    url: `${siteUrl}/services/power-bi-paris`,
    telephone: phone,
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Paris',
      addressCountry: 'FR'
    },
    areaServed: ['Paris', 'Île-de-France', 'France'],
    sameAs: []
  }];

  return (
    <section>
      <SEOHead
        title="Services Power BI à Paris — Dashboards & DAX"
        description="Consultant Power BI à Paris: dashboards, DAX, performance, formation et industrialisation. Interventions en Île-de-France et à distance."
        canonical={`${siteUrl}/services/power-bi-paris`}
        jsonLd={jsonLd}
      />
      <div className="bg-teal-600 text-white py-10 mt-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold mb-2">Services Power BI — Paris</h1>
          <p className="opacity-90 max-w-3xl">Dashboards clairs, DAX efficace et mises en production sereines. Basé à Paris, interventions France entière.</p>
        </div>
      </div>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        {/* Services cards esthétiques */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="h-full">
            <CardHeader className="flex flex-row items-center gap-3">
              <BarChart2 className="w-5 h-5 text-teal-600" />
              <CardTitle>Conception de dashboards</CardTitle>
            </CardHeader>
            <CardContent className="text-slate-600">UX, KPI, storytelling, drill-down. Lisibilité et accessibilité soignées.</CardContent>
          </Card>
          <Card className="h-full">
            <CardHeader className="flex flex-row items-center gap-3">
              <Layers className="w-5 h-5 text-teal-600" />
              <CardTitle>Modélisation & DAX</CardTitle>
            </CardHeader>
            <CardContent className="text-slate-600">Modèles en étoile, mesures robustes, performances (aggregations, DirectQuery).</CardContent>
          </Card>
          <Card className="h-full">
            <CardHeader className="flex flex-row items-center gap-3">
              <Cog className="w-5 h-5 text-teal-600" />
              <CardTitle>Industrialisation</CardTitle>
            </CardHeader>
            <CardContent className="text-slate-600">Gouvernance, refresh, workspaces, CI/CD léger et bonnes pratiques de déploiement.</CardContent>
          </Card>
        </div>

        {/* Process simple */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardHeader><CardTitle>1) Audit express</CardTitle></CardHeader>
            <CardContent className="text-slate-600">Objectifs, données, KPIs et priorités. On pose un plan en 1–2 heures.</CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>2) Prototype rapide</CardTitle></CardHeader>
            <CardContent className="text-slate-600">Maquette Power BI testable, itérations courtes jusqu’au “OK”.</CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>3) Mise en prod + transfert</CardTitle></CardHeader>
            <CardContent className="text-slate-600">Déploiement propre, documentation courte et formation ciblée.</CardContent>
          </Card>
        </div>

        {/* CTA vers section Contact existante */}
        <div className="rounded bg-teal-50 border border-teal-100 p-5 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-slate-700">Une question ou un projet ? Contactez-moi à Paris (tél. <a className="underline" href="tel:+33686169750">06 86 16 97 50</a>) ou via le formulaire.</p>
          <div className="flex gap-3">
            <Button asChild><Link to="/#contact">Aller au formulaire</Link></Button>
            <Button asChild variant="outline"><a href="tel:+33686169750">Appeler</a></Button>
          </div>
        </div>
      </div>
    </section>
  );
}


