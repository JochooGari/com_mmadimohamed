import SEOHead from '../components/seo/SEOHead';
import { Button } from '../components/ui/button';
import { useNavigate } from 'react-router-dom';

export default function PharmaEmbedPage() {
  const navigate = useNavigate();
  const demoUrl = (import.meta as any).env.VITE_PHARMA_DEMO_URL as string | undefined;
  const url = demoUrl && demoUrl.length ? demoUrl : '';

  return (
    <section>
      <SEOHead
        title="Template dashboard Pharma"
        description="Supply Chain Intelligence Platform — galerie et démos Power BI pour la pharma."
        canonical={`${(import.meta as any).env.SITE_URL ?? ''}/resource/templates-dashboard-phrama`}
      />
      <div className="bg-teal-600 text-white py-10 mt-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold">Template dashboard Pharma</h1>
          <Button variant="outline" className="bg-white/10 text-white border-white hover:bg-white/20" onClick={() => navigate('/bibliotheque')}>Retour à la bibliothèque</Button>
        </div>
      </div>
      {url ? (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded border shadow overflow-hidden" style={{ height: 'calc(100vh - 160px)' }}>
            <iframe
              src={url}
              title="Pharma Demo"
              className="w-full h-full"
              loading="eager"
              frameBorder={0}
              allow="clipboard-write; fullscreen"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-downloads"
            />
          </div>
          <div className="mt-3 text-sm">
            <a className="text-teal-700 hover:underline" href={url} target="_blank" rel="noreferrer">Ouvrir dans un nouvel onglet</a>
          </div>
        </div>
      ) : (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-4 rounded border bg-yellow-50 text-yellow-800">
            <p>
              Définissez VITE_PHARMA_DEMO_URL dans votre .env.local pour intégrer la page déployée (ex: https://votre-demo.vercel.app).
            </p>
          </div>
        </div>
      )}
    </section>
  );
}


