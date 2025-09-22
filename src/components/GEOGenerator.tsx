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
  const [sections, setSections] = React.useState<any[]>([]);
  const [lockedIds, setLockedIds] = React.useState<string[]>([]);
  const [scores, setScores] = React.useState<{seo?:number; geo?:number}>({});
  const [isWorking, setIsWorking] = React.useState(false);
  const [logs, setLogs] = React.useState<any[]>([]);
  const [chainPreview, setChainPreview] = React.useState<{draft?:string; review?:string} | null>(null);
  const [models, setModels] = React.useState<{ openai: string; anthropic: string; perplexity: string }>({
    openai: 'gpt-4-turbo',
    anthropic: 'claude-3-sonnet',
    perplexity: 'sonar'
  });
  const [prompts, setPrompts] = React.useState<{ openai: string; anthropic: string; perplexity: string }>({
    openai: '',
    anthropic: '',
    perplexity: ''
  });

  const importTemplate = async () => {
    setIsWorking(true);
    try {
      const r = await fetch('/api/geo', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ action:'import_template', html: templateHtml }) });
      if (!r.ok) throw new Error(await r.text());
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
      const r = await fetch('/api/geo', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ action:'chain_draft', topic, locked: lockedIds, editable: sections, outline:'H1/H2/H3', models, prompts }) });
      const d = await r.json();
      setLogs(d.logs || []);
      setChainPreview({ draft: d.draft, review: d.review });
      // Optionally parse review JSON to sections if provided
    } catch(e:any){ alert('Erreur chaîne: ' + (e?.message||'unknown')); } finally { setIsWorking(false); }
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

      <Card>
        <CardHeader><CardTitle>Importer un template (coller HTML)</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <Textarea className="min-h-[140px]" placeholder="Collez ici l'HTML extrait d'un article pour créer un template" value={templateHtml} onChange={(e)=> setTemplateHtml(e.target.value)} />
          <Button onClick={importTemplate} disabled={isWorking} className="bg-blue-600 hover:bg-blue-700">Importer</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Nouveau draft</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <Input value={topic} onChange={(e)=> setTopic(e.target.value)} placeholder="Sujet principal (ex: Power BI pour la finance)" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="text-sm text-gray-600">OpenAI (draft)</label>
              <Select value={models.openai} onValueChange={(v)=> setModels(prev=> ({ ...prev, openai: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {['gpt-4o','gpt-4-turbo','gpt-4.1-mini'].map(m=> (<SelectItem key={m} value={m}>{m}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm text-gray-600">Anthropic (review)</label>
              <Select value={models.anthropic} onValueChange={(v)=> setModels(prev=> ({ ...prev, anthropic: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {['claude-3-sonnet','claude-3-opus','claude-3-5-sonnet'].map(m=> (<SelectItem key={m} value={m}>{m}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm text-gray-600">Perplexity (score)</label>
              <Select value={models.perplexity} onValueChange={(v)=> setModels(prev=> ({ ...prev, perplexity: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {['sonar','sonar-pro','llama-3.1-sonar-large-128k-online'].map(m=> (<SelectItem key={m} value={m}>{m}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Prompts personnalisés (optionnels)</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="text-sm text-gray-600">OpenAI (draft) – User prompt</label>
                <Textarea
                  className="min-h-[90px]"
                  placeholder="Collez ici votre consigne de rédaction (structure H1/H2/H3, CTA, FAQ, JSON-LD...)"
                  value={prompts.openai}
                  onChange={(e)=> setPrompts(prev=> ({ ...prev, openai: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-sm text-gray-600">Anthropic (review) – User prompt</label>
                <Textarea
                  className="min-h-[90px]"
                  placeholder="Consignes d'édition: clarté, cohérence, ton, consolidation, conserver Hn, sections verrouillées..."
                  value={prompts.anthropic}
                  onChange={(e)=> setPrompts(prev=> ({ ...prev, anthropic: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-sm text-gray-600">Perplexity (score) – User prompt</label>
                <Textarea
                  className="min-h-[90px]"
                  placeholder="Précisez vos critères/poids SEO & GEO, format JSON attendu, exigences de traçabilité..."
                  value={prompts.perplexity}
                  onChange={(e)=> setPrompts(prev=> ({ ...prev, perplexity: e.target.value }))}
                />
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={generateDraft} disabled={isWorking} className="bg-purple-600 hover:bg-purple-700">Générer le draft</Button>
            <Button onClick={scoreArticle} disabled={isWorking}>Scorer SEO/GEO</Button>
            <Button onClick={exportHtml} disabled={isWorking}>Exporter HTML</Button>
            <Button onClick={runChain} disabled={isWorking} className="bg-green-600 hover:bg-green-700">Chaîne multi‑modèles</Button>
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

      {(logs.length > 0 || chainPreview) && (
        <Card>
          <CardHeader><CardTitle>Échanges IA (synthèse)</CardTitle></CardHeader>
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
            {chainPreview?.draft && (
              <div>
                <h4 className="text-sm font-medium mb-1">Draft (OpenAI)</h4>
                <Textarea className="min-h-[100px]" value={chainPreview.draft} readOnly />
              </div>
            )}
            {chainPreview?.review && (
              <div>
                <h4 className="text-sm font-medium mb-1">Review (Claude)</h4>
                <Textarea className="min-h-[100px]" value={chainPreview.review} readOnly />
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}


