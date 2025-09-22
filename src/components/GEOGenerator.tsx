import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

export default function GEOGenerator({ className='' }: { className?: string }) {
  const [topic, setTopic] = React.useState('Power BI pour la finance');
  const [templateHtml, setTemplateHtml] = React.useState('');
  const [templateUrl, setTemplateUrl] = React.useState('');
  const [sections, setSections] = React.useState<any[]>([]);
  const [lockedIds, setLockedIds] = React.useState<string[]>([]);
  const [scores, setScores] = React.useState<{seo?:number; geo?:number}>({});
  const [isWorking, setIsWorking] = React.useState(false);
  const [logs, setLogs] = React.useState<any[]>([]);
  const [chainPreview, setChainPreview] = React.useState<{draft?:string; review?:string} | null>(null);
  const [models, setModels] = React.useState<{ draft: string; review: string; score: string }>({
    draft: 'gpt-4-turbo',
    review: 'claude-3-sonnet',
    score: 'sonar'
  });
  const [providers, setProviders] = React.useState<{ draft: string; review: string; score: string }>({
    draft: 'openai',
    review: 'anthropic',
    score: 'perplexity'
  });
  const [prompts, setPrompts] = React.useState<{ openai: string; anthropic: string; perplexity: string }>({
    openai: '',
    anthropic: '',
    perplexity: ''
  });

  const importTemplate = async () => {
    setIsWorking(true);
    try {
      const r = await fetch('/api/geo', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ action:'import_template', html: templateHtml, url: templateUrl }) });
      if (!r.ok) throw new Error(await r.text());
      const d = await r.json();
      if (d?.outline?.sections?.length) {
        setSections(d.outline.sections.map((s:any)=> ({ id: s.id, title: s.title, html: '' })));
      }
      alert('Template importé');
    } catch(e:any){ alert('Erreur import: ' + (e?.message||'unknown')); } finally { setIsWorking(false); }
  };

  const generateDraft = async () => {
    setIsWorking(true);
    try {
      const r = await fetch('/api/geo', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ action:'draft', topic, outline: 'H1/H2/H3' }) });
      const d = await r.json();
      setSections(d.sections || []);
    } catch(e:any){ alert('Erreur draft: ' + (e?.message||'unknown')); } finally { setIsWorking(false); }
  };

  const rewriteSection = async (s:any) => {
    if (lockedIds.includes(s.id)) { alert('Section verrouillée'); return; }
    const newHtml = prompt('Modifier HTML de la section', s.html) || s.html;
    setIsWorking(true);
    try {
      const r = await fetch('/api/geo', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ action:'section_rewrite', sectionId: s.id, html: newHtml }) });
      const d = await r.json();
      setSections(prev => prev.map(x => x.id === d.sectionId ? { ...x, html: d.html } : x));
    } catch(e:any){ alert('Erreur rewrite: ' + (e?.message||'unknown')); } finally { setIsWorking(false); }
  };

  const scoreArticle = async () => {
    setIsWorking(true);
    try {
      const r = await fetch('/api/geo', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ action:'score', html: sections.map(s=>s.html).join('\n') }) });
      const d = await r.json();
      setScores(d.scores || {});
    } catch(e:any){ alert('Erreur score: ' + (e?.message||'unknown')); } finally { setIsWorking(false); }
  };

  const runChain = async () => {
    setIsWorking(true);
    try {
      const r = await fetch('/api/geo', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ action:'chain_draft', topic, locked: lockedIds, editable: sections, outline:'H1/H2/H3', models, providers, prompts }) });
      const d = await r.json();
      setLogs(d.logs || []);
      setChainPreview({ draft: d.draft, review: d.review });
      // Optionally parse review JSON to sections if provided
    } catch(e:any){ alert('Erreur chaîne: ' + (e?.message||'unknown')); } finally { setIsWorking(false); }
  };

  const saveSettings = async () => {
    try {
      const r = await fetch('/api/geo', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ action:'save_settings', models, providers, prompts }) });
      if (!r.ok) throw new Error(await r.text());
      alert('Paramètres sauvegardés');
    } catch(e:any) {
      alert('Erreur sauvegarde: ' + (e?.message || 'unknown'));
    }
  };

  const providerModels: Record<string,string[]> = {
    openai: ['gpt-4o','gpt-4-turbo','gpt-4.1-mini'],
    anthropic: ['claude-3-sonnet','claude-3-opus','claude-3-5-sonnet'],
    perplexity: ['sonar','sonar-pro','llama-3.1-sonar-large-128k-online']
  };

  const [toc, setToc] = React.useState<{id:string; title:string; level:number}[]>([]);
  React.useEffect(()=> { (async ()=> {
    // autoload settings
    try { const r = await fetch('/api/geo', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ action:'get_settings' }) }); if (r.ok) { const s = await r.json(); if (s?.models) setModels(s.models); if (s?.providers) setProviders(s.providers); if (s?.prompts) setPrompts(s.prompts); } } catch {}
  })(); }, []);
  const generateTOC = async () => {
    const r = await fetch('/api/geo', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ action:'toc_generate', sections }) });
    if (r.ok) {
      const d = await r.json(); setToc(d.toc || []);
    }
  };
  const [media, setMedia] = React.useState<any[]>([]);
  const suggestMedia = async () => {
    const r = await fetch('/api/geo', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ action:'media_suggest', topic, sections }) });
    if (r.ok) setMedia((await r.json()).items || []);
  };
  const [links, setLinks] = React.useState<any[]>([]);
  const suggestLinks = async () => {
    const r = await fetch('/api/geo', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ action:'internal_links', topic }) });
    if (r.ok) setLinks((await r.json()).links || []);
  };
  const [ctas, setCtas] = React.useState<any[]>([]);
  const generateCTA = async () => {
    const r = await fetch('/api/geo', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ action:'cta_generate', topic }) });
    if (r.ok) setCtas((await r.json()).ctas || []);
  };
  const [liveScore, setLiveScore] = React.useState<{seo?:number; geo?:number; fixes?:string[]}>({});
  const refreshScore = async () => {
    const r = await fetch('/api/geo', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ action:'score_live', html: sections.map(s=>s.html).join('\n') }) });
    if (r.ok) setLiveScore((await r.json()).scores ? (await r.json()) : await r.json());
  };
  const [faq, setFaq] = React.useState<any>({ faq:[], jsonld:null });
  const generateFAQ = async () => {
    const r = await fetch('/api/geo', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ action:'faq_generate', topic }) });
    if (r.ok) setFaq(await r.json());
  };
  const [painpoint, setPainpoint] = React.useState<boolean>(false);
  const togglePainpoint = async (v:boolean) => {
    setPainpoint(v);
    await fetch('/api/geo', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ action:'set_painpoint_mode', enabled: v }) });
  };
  const [history, setHistory] = React.useState<any[]>([]);
  const logEvent = async (event:string, payload?:any) => {
    setHistory(prev=> [{ ts: new Date().toISOString(), event }, ...prev]);
    await fetch('/api/geo', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ action:'version_log', event, payload }) });
  };
  const [bench, setBench] = React.useState<any[]>([]);
  const runBenchmark = async () => {
    const r = await fetch('/api/geo', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ action:'benchmark', topic }) });
    if (r.ok) setBench((await r.json()).rows || []);
  };

  const exportHtml = async () => {
    const html = sections.map(s=> s.html).join('\n');
    const r = await fetch('/api/geo', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ action:'export_html', html }) });
    if (r.ok) alert('Export HTML OK'); else alert('Export échoué');
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">GEO Agent – Générateur d'articles</h2>
          <p className="text-gray-600">Templates depuis URL/HTML, draft, édition partielle, scoring SEO/GEO.</p>
        </div>
        <div className="flex gap-2">
          <Badge className="bg-blue-100 text-blue-800">SEO: {scores.seo ?? '—'}</Badge>
          <Badge className="bg-green-100 text-green-800">GEO: {scores.geo ?? '—'}</Badge>
        </div>
      </div>

      {/* Bandeau import masqué pour le moment; laisser le code pour réactivation ultérieure */}

      <Card>
        <CardHeader><CardTitle>Nouveau draft</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <Input value={topic} onChange={(e)=> setTopic(e.target.value)} placeholder="Sujet principal (ex: Power BI pour la finance)" />
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Prompts personnalisés</h4>
            <div className="flex flex-col gap-3">
              {/* Écriture */}
              <div className="flex flex-wrap items-start gap-3 p-3 border rounded">
                <div className="w-24 text-xs font-semibold">Écriture</div>
                <div className="flex items-center gap-2">
                  <Select value={providers.draft} onValueChange={(v)=> setProviders(prev=> ({ ...prev, draft: v }))}>
                    <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {['openai','anthropic','perplexity'].map(p=> (<SelectItem key={p} value={p}>{p}</SelectItem>))}
                    </SelectContent>
                  </Select>
                  <Select value={models.draft} onValueChange={(v)=> setModels(prev=> ({ ...prev, draft: v }))}>
                    <SelectTrigger className="w-56"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {providerModels[providers.draft].map(m=> (<SelectItem key={m} value={m}>{m}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1 min-w-[260px]">
                  <Textarea className="min-h-[70px]" placeholder="Consigne de rédaction (H1/H2/H3, CTA, FAQ, JSON-LD...)" value={prompts.openai} onChange={(e)=> setPrompts(prev=> ({ ...prev, openai: e.target.value }))} />
                </div>
              </div>
              {/* Révision */}
              <div className="flex flex-wrap items-start gap-3 p-3 border rounded">
                <div className="w-24 text-xs font-semibold">Révision</div>
                <div className="flex items-center gap-2">
                  <Select value={providers.review} onValueChange={(v)=> setProviders(prev=> ({ ...prev, review: v }))}>
                    <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {['openai','anthropic','perplexity'].map(p=> (<SelectItem key={p} value={p}>{p}</SelectItem>))}
                    </SelectContent>
                  </Select>
                  <Select value={models.review} onValueChange={(v)=> setModels(prev=> ({ ...prev, review: v }))}>
                    <SelectTrigger className="w-56"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {providerModels[providers.review].map(m=> (<SelectItem key={m} value={m}>{m}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1 min-w-[260px]">
                  <Textarea className="min-h-[70px]" placeholder="Consignes d'édition (clarté, ton, cohérence, sections verrouillées...)" value={prompts.anthropic} onChange={(e)=> setPrompts(prev=> ({ ...prev, anthropic: e.target.value }))} />
                </div>
              </div>
              {/* Finalisation */}
              <div className="flex flex-wrap items-start gap-3 p-3 border rounded">
                <div className="w-24 text-xs font-semibold">Finalisation</div>
                <div className="flex items-center gap-2">
                  <Select value={providers.score} onValueChange={(v)=> setProviders(prev=> ({ ...prev, score: v }))}>
                    <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {['openai','anthropic','perplexity'].map(p=> (<SelectItem key={p} value={p}>{p}</SelectItem>))}
                    </SelectContent>
                  </Select>
                  <Select value={models.score} onValueChange={(v)=> setModels(prev=> ({ ...prev, score: v }))}>
                    <SelectTrigger className="w-56"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {providerModels[providers.score].map(m=> (<SelectItem key={m} value={m}>{m}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1 min-w-[260px]">
                  <Textarea className="min-h-[70px]" placeholder="Critères & format JSON pour le scoring GEO/SEO, sources, FAQ, JSON-LD…" value={prompts.perplexity} onChange={(e)=> setPrompts(prev=> ({ ...prev, perplexity: e.target.value }))} />
                </div>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={generateDraft} disabled={isWorking} className="bg-purple-600 hover:bg-purple-700">Générer le draft</Button>
            <Button onClick={exportHtml} disabled={isWorking}>Exporter HTML</Button>
            <Button onClick={runChain} disabled={isWorking} className="bg-green-600 hover:bg-green-700">Chaîne multi‑modèles</Button>
            <Button onClick={saveSettings} disabled={isWorking} variant="outline">Sauvegarder</Button>
          </div>
        </CardContent>
      </Card>

      {sections.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Sections (verrouillage / régénération)</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {sections.map((s) => (
              <div key={s.id} className="border rounded p-3">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-sm">{s.title || s.id}</h4>
                  <div className="flex items-center gap-2">
                    <label className="text-sm">
                      <input type="checkbox" checked={lockedIds.includes(s.id)} onChange={(e)=> setLockedIds(prev => e.target.checked ? [...prev, s.id] : prev.filter(x=>x!==s.id))} /> Verrouiller
                    </label>
                    <Button variant="outline" size="sm" onClick={()=> rewriteSection(s)} disabled={lockedIds.includes(s.id)}>Régénérer</Button>
                  </div>
                </div>
                <div className="bg-white border rounded p-3 text-sm whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: s.html }} />
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {(logs.length > 0) && (
        <Card>
          <CardHeader><CardTitle>Échanges IA (synthèse collaborative)</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm text-gray-700">
              {logs.map((l, i)=> (
                <div key={i} className="flex items-center justify-between p-2 border rounded">
                  <div>
                    <span className="font-medium">{l.step}</span> · <span>{l.model}</span>
                  </div>
                  <div className="text-xs text-gray-500">tokens: {l.summary?.totalTokens ?? '—'}</div>
                </div>
              ))}
            </div>
            {/* Feedback des IA */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3 border rounded">
                <h4 className="text-sm font-semibold">OpenAI (Draft)</h4>
                <p className="text-xs text-gray-600">Feedback: Draft généré</p>
              </div>
              <div className="p-3 border rounded">
                <h4 className="text-sm font-semibold">Claude (Review)</h4>
                <ul className="list-disc ml-4 text-xs text-gray-700">
                  {(logs as any) && []}
                </ul>
              </div>
              <div className="p-3 border rounded">
                <h4 className="text-sm font-semibold">Perplexity (Score)</h4>
                <p className="text-xs text-gray-700">Voir panneau SEO/GEO (à gauche) + sources suggérées.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* TOC + Assistants */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Plan / TDM</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Button size="sm" onClick={generateTOC}>Générer le plan</Button>
            <ul className="list-disc ml-5 text-sm">
              {toc.map(item => (
                <li key={item.id} className={item.level===3 ? 'ml-4' : ''}>
                  <a href={`#${item.id}`} onClick={(e)=> { e.preventDefault(); const el=document.getElementById(item.id); if(el) el.scrollIntoView({behavior:'smooth'}); }}>{item.title}</a>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Rich media assistant</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Button size="sm" onClick={suggestMedia}>Suggérer médias</Button>
            {media.slice(0,5).map((m:any)=> (
              <div key={m.sectionId} className="text-sm border rounded p-2">
                <div className="font-medium">Section: {m.sectionId}</div>
                <ul className="list-disc ml-5">
                  {m.suggestions.map((s:any,i:number)=> (<li key={i}>{s.type}: {s.prompt}</li>))}
                </ul>
                <div className="flex gap-2 mt-2">
                  <Button size="sm" variant="outline" onClick={async ()=>{
                    const text = prompt('Prompt image OpenAI', m.suggestions?.[0]?.prompt || '') || '';
                    if (!text) return;
                    const r = await fetch('/api/geo', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ action:'image_generate', prompt: text }) });
                    const d = await r.json();
                    if (d?.url) {
                      // insertion directe dans la section
                      setSections(prev => prev.map(sec => sec.id === m.sectionId ? { ...sec, html: (sec.html||'') + `\n<p><img src="${d.url}" alt="${text}" /></p>` } : sec));
                    }
                  }}>Générer & insérer</Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Liens internes</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Button size="sm" onClick={suggestLinks}>Suggérer liens</Button>
            <ul className="list-disc ml-5 text-sm">
              {links.map((l:any,i:number)=> (
                <li key={i} className="flex items-center gap-2">
                  <a className="text-blue-600" href={l.url} target="_blank" rel="noreferrer">{l.url}</a>
                  <Button size="sm" variant="outline" onClick={() => {
                    // insérer le lien dans l’introduction si présente, sinon dans la première section
                    setSections(prev => prev.map((s,idx) => idx===0 ? { ...s, html: (s.html||'') + `\n<p><a href="${l.url}" rel="noopener">${l.title||'Lien interne'}</a></p>` } : s));
                  }}>Insérer</Button>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>CTA</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Button size="sm" onClick={generateCTA}>Générer CTA</Button>
            <div className="flex flex-wrap gap-2">
              {ctas.map((c:any,i:number)=> (
                <div key={i} className="flex items-center gap-2">
                  <Button variant={c.variant||'outline'}>{c.label}</Button>
                  <Button size="sm" variant="outline" onClick={() => {
                    setSections(prev => prev.map((s,idx)=> idx===prev.length-1 ? { ...s, html: (s.html||'') + `\n<p class=\"cta\"><a href=\"${c.href}\">${c.label}</a></p>` } : s));
                  }}>Insérer</Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Live scoring GEO/SEO</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Button size="sm" onClick={refreshScore}>Mettre à jour</Button>
            <div className="text-sm">SEO: {liveScore?.scores?.seo ?? '—'} / GEO: {liveScore?.scores?.geo ?? '—'}</div>
            {Array.isArray(liveScore?.fixes) && (
              <ul className="list-disc ml-5 text-sm">
                {liveScore.fixes.map((f:string,i:number)=> (<li key={i}>{f}</li>))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>FAQ & JSON-LD</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Button size="sm" onClick={generateFAQ}>Générer FAQ</Button>
            <ul className="list-disc ml-5 text-sm">
              {(faq.faq||[]).map((q:any,i:number)=> (<li key={i}><strong>{q.q}</strong> – {q.a}</li>))}
            </ul>
            {faq.jsonld && (
              <Textarea className="min-h-[100px]" readOnly value={JSON.stringify(faq.jsonld, null, 2)} />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Mode Pain Point</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <label className="text-sm flex items-center gap-2">
              <input type="checkbox" checked={painpoint} onChange={(e)=> togglePainpoint(e.target.checked)} />
              Forcer l’angle Pain Point / Résolution / Tips dans chaque section
            </label>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Historique & versions</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <div className="flex gap-2">
              <Button size="sm" onClick={()=> logEvent('draft_generated')}>Logger: draft</Button>
              <Button size="sm" onClick={()=> logEvent('reviewed')}>Logger: review</Button>
            </div>
            <ul className="list-disc ml-5 text-sm">
              {history.map((h:any,i:number)=> (<li key={i}>{new Date(h.ts).toLocaleString('fr-FR')} – {h.event}</li>))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Benchmark auto</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <Button size="sm" onClick={runBenchmark}>Lancer benchmark</Button>
            <table className="w-full text-sm">
              <thead><tr><th className="text-left">Titre</th><th>Score</th><th>Médias</th></tr></thead>
              <tbody>
                {bench.map((b:any,i:number)=> (
                  <tr key={i} className="border-t">
                    <td className="py-1"><a className="text-blue-600" href={b.url} target="_blank" rel="noreferrer">{b.title || b.url}</a></td>
                    <td className="text-center">{b.score}</td>
                    <td className="text-center">{b.media}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


