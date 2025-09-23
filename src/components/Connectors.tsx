import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

type ProviderId = 'linkedin' | 'gmail' | 'notion' | 'onenote';

export default function Connectors({ className = '' }: { className?: string }) {
  const [cfg, setCfg] = React.useState<any>({ providers: {} });
  const [loading, setLoading] = React.useState(false);

  const load = async () => {
    try {
      const r = await fetch('/api/connectors');
      if (r.ok) setCfg(await r.json());
    } catch {}
  };
  React.useEffect(() => { load(); }, []);

  const toggle = async (provider: ProviderId, connect: boolean) => {
    setLoading(true);
    try {
      const r = await fetch('/api/connectors', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: connect ? 'connect' : 'disconnect', provider }) });
      if (r.ok) await load();
      else alert('Erreur connecteur');
    } finally { setLoading(false); }
  };

  const providers: { id: ProviderId; name: string; desc: string }[] = [
    { id: 'linkedin', name: 'LinkedIn', desc: 'Publier des posts et récupérer des stats' },
    { id: 'gmail', name: 'Gmail', desc: 'Lire newsletters pour la veille' },
    { id: 'notion', name: 'Notion', desc: 'Sauvegarder drafts et connaissances' },
    { id: 'onenote', name: 'OneNote', desc: 'Envoyer des notes et briefs' }
  ];

  return (
    <div className={`space-y-4 ${className}`}>
      <h3 className="text-lg font-semibold">Connecteurs</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {providers.map(p => {
          const state = cfg?.providers?.[p.id]?.connected;
          return (
            <Card key={p.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{p.name}</span>
                  <Badge className={state ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                    {state ? 'Connecté' : 'Déconnecté'}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-gray-600">{p.desc}</p>
                <div className="flex gap-2">
                  {!state ? (
                    <Button disabled={loading} onClick={() => toggle(p.id, true)} className="bg-blue-600 hover:bg-blue-700">Se connecter</Button>
                  ) : (
                    <Button variant="outline" disabled={loading} onClick={() => toggle(p.id, false)}>Se déconnecter</Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      <p className="text-xs text-gray-500">Note: OAuth réel à intégrer ultérieurement. Les connexions sont simulées et stockées côté serveur.</p>
    </div>
  );
}



