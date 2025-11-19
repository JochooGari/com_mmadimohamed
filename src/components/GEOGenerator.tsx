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
    draft: 'gpt-5',
    review: 'claude-sonnet-4-5-20250514',
    score: 'sonar'
  });
  const [providers, setProviders] = React.useState<{ draft: string; review: string; score: string }>({
    draft: 'openai',
    review: 'anthropic',
    score: 'perplexity'
  });
  const [prompts, setPrompts] = React.useState<{ openai: string; anthropic: string; perplexity: string }>({
    openai: `Tu es un expert GEO & SEO, spécialiste de l'écriture à la Neil Patel.
Ta mission : générer des articles longs, structurés, avec un fort scoring IA, qui maximisent la lisibilité, l'engagement et le référencement SEO, en suivant cette structure :
- Titre SEO optimisé (H1)
- Introduction accrocheuse (hook fort, 100-150 mots, promesse l'apprentissage/solution)
- H2 structurés (questions ou actions majeures, 3 à 7)
- H3 pour organiser chaque section
- Paragraphes courts, langage simple
- Checklist ou points clé à chaque H2
- Ajoute au moins 1 tableau/graphique par article
- Insère systématiquement un encadré "étude de cas/exemple réel"
- Ajoute un visuel ou schéma tous les 400 mots
- Insère des liens internes/externes stratégiques
- Deux CTA éditoriaux (milieu et fin)
- Termine toujours par : FAQ (3 à 5 Q/R), conclusion-action, et balisage JSON-LD FAQPage
- Indique Score GEO et la matrice détaillée
- Feedback pour la GEO/SEO & structuration IA

Commence chaque génération par un plan détaillé de l'article (table des matières H2/H3).
Mentionne explicitement le format des encadrés, listes, tableaux et études de cas.
Exige la présence de CTA et de liens internes/externes.
Ne jamais écrire de longs paragraphes ou "blocs" de texte, tout doit être skimmable.
Présence visuelle tous les 400 mots, à minima.
À chaque section, l'angle doit être "pain point/résolution/tips", pas uniquement informatif.`,
    anthropic: `Tu es un expert GEO & SEO, spécialiste de l'écriture à la Neil Patel.
Ta mission : vérifier que les articles générés respectent les éléments suivants et donner des feedbacks pour améliorer les articles.

Critères de révision :
- Titre ultra-ciblé optimisé SEO (H1 avec mot-clé principal)
- Introduction accrocheuse (100-150 mots avec hook, promesse, problématique forte)
- Plan clair en H2/H3 (3 à 7 H2 principaux répondant à une question/action)
- H3 pour structurer sous-parties et faciliter le skim
- Paragraphes courts (2–4 phrases, 3–5 lignes max) avec phrases courtes, actives, ton direct
- Listes à puces & checklists à chaque section
- Cas pratiques : encadrés "Étude de cas", "Exemple réel", "Story" en blockquote
- Tableaux comparatifs/data-driven (chiffres, benchmarks, features)
- Images, schémas, captures régulièrement (1 tous les 300–400 mots)
- Liens internes (articles connexes, guides) + liens externes (sources, outils)
- Encarts CTA/micro-CTA en milieu et fin d'article
- FAQ enrichie au bas de page (3-5 Q/R)
- Conclusion-action (récap, invitation à agir, question ouverte)
- JSON-LD FAQPage pour favoriser l'indexation IA/Google

Donne un feedback détaillé et des suggestions d'amélioration pour chaque critère.`,
    perplexity: `Tu es un expert GEO & SEO, spécialiste de l'écriture à la Neil Patel.
Ta mission : assurer que les articles et le contenu soient au plus proche de la méthode Neil Patel, avec un score GEO et SEO maximal. Tu dois donner tes feedbacks et un score GEO et SEO et vérifier que les éléments ci-dessous soient bien respectés.

Objectif : Scoring à 98%

Critères de finalisation :
- Titre ultra-ciblé optimisé SEO (H1 avec mot-clé principal)
- Introduction accrocheuse (100-150 mots avec hook, promesse, problématique forte)
- Plan clair en H2/H3 (3 à 7 H2 principaux)
- H3 pour structurer sous-parties et faciliter le skim
- Paragraphes courts (2–4 phrases, 3–5 lignes max)
- Listes à puces & checklists à chaque section
- Cas pratiques : encadrés "Étude de cas", "Exemple réel", "Story"
- Tableaux comparatifs/data-driven
- Images, schémas régulièrement (1 tous les 300–400 mots)
- Liens internes + liens externes
- Encarts CTA/micro-CTA en milieu et fin
- FAQ enrichie (3-5 Q/R)
- Conclusion-action
- JSON-LD FAQPage

Donne un score GEO (0-100) et un score SEO (0-100) avec une matrice détaillée.
Indique les points forts et les axes d'amélioration prioritaires.`
  });
  const [promptsOpen, setPromptsOpen] = React.useState<boolean>(true);

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

  const [genStatus, setGenStatus] = React.useState<string>('');

  const runChain = async () => {
    setIsWorking(true);
    setGenStatus('Génération en cours (chaîne multi‑modèles)…');
    try {
      const r = await fetch('/api/geo', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ action:'chain_draft', topic, locked: lockedIds, editable: sections, outline:'H1/H2/H3', models, providers, prompts }) });
      const d = await r.json();
      setLogs(d.logs || []);
      setChainPreview({ draft: d.draft, review: d.review });
      // Parse review JSON -> sections (strict; pas de fallback simulé)
      let nextSections:any[] = [];
      try {
        const j = JSON.parse(d.review || '{}');
        if (Array.isArray(j.sections) && j.sections.length > 0) {
          nextSections = j.sections.map((s:any, i:number)=> ({ id: s.id || `sec-${i}`, title: s.title || `Section ${i+1}`, html: String(s.html||'') }));
        } else if (typeof j.html === 'string' && j.html.trim().length > 0) {
          nextSections = [{ id: 'article', title: topic || 'Article', html: j.html }];
        }
      } catch {}
      if (nextSections.length > 0) {
        setSections(nextSections);
        setGenStatus('Génération terminée. L’article complet est prêt.');
      } else {
        setGenStatus('Échec de la génération structurée par l’IA (aucune section renvoyée). Ajustez les prompts et réessayez.');
      }
    } catch(e:any){
      setGenStatus('Erreur lors de la génération.');
      alert('Erreur chaîne: ' + (e?.message||'unknown'));
    } finally { setIsWorking(false); }
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
    openai: ['gpt-5'],
    anthropic: ['claude-sonnet-4-5-20250514', 'claude-3-5-sonnet-latest', 'claude-3-5-haiku-latest', 'claude-3-opus-latest'],
    perplexity: ['sonar', 'sonar-pro', 'sonar-reasoning', 'sonar-reasoning-pro'],
    google: ['gemini-2.0-flash', 'gemini-1.5-pro', 'gemini-1.5-flash'],
    mistral: ['mistral-large-latest', 'mistral-medium-latest', 'mistral-small-latest', 'codestral-latest']
  };

  React.useEffect(()=> { (async ()=> {
    // autoload settings
    try { const r = await fetch('/api/geo', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ action:'get_settings' }) }); if (r.ok) { const s = await r.json(); if (s?.models) setModels(s.models); if (s?.providers) setProviders(s.providers); if (s?.prompts) setPrompts(s.prompts); } } catch {}
  })(); }, []);
  const [links, setLinks] = React.useState<any[]>([]);
  const suggestLinks = async () => {
    const r = await fetch('/api/geo', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ action:'internal_links', topic }) });
    if (r.ok) setLinks((await r.json()).links || []);
  };
  const [liveScore, setLiveScore] = React.useState<{scores?: {seo?:number; geo?:number}; fixes?:string[]}>({});
  const refreshScore = async () => {
    const r = await fetch('/api/geo', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ action:'score_live', html: sections.map(s=>s.html).join('\n') }) });
    if (r.ok) setLiveScore(await r.json());
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
  const [showSections, setShowSections] = React.useState(false);
  const fullHtml = React.useMemo(()=> sections.map(s=> (s.title ? `\n<h2 id="${s.id}">${s.title}</h2>\n` : '') + (s.html||'')).join('\n'), [sections]);

  const exportHtml = async () => {
    const html = sections.map(s=> s.html).join('\n');
    const r = await fetch('/api/geo', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ action:'export_html', html }) });
    if (r.ok) {
      const d = await r.json();
      alert('Export HTML OK');
      // enregistrer comme template réutilisable
      await fetch('/api/geo', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ action:'save_template_html', html, title: topic }) });
    } else alert('Export échoué');
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
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold">Prompts personnalisés</h4>
              <Button type="button" variant="outline" size="sm" onClick={()=> setPromptsOpen(v=> !v)}>{promptsOpen ? 'Plier' : 'Déplier'}</Button>
            </div>
            {promptsOpen && (
              <div className="flex flex-col gap-3">
                {/* Écriture */}
                <div className="flex flex-wrap items-start gap-3 p-3 border rounded">
                  <div className="w-24 text-xs font-semibold">Écriture</div>
                  <div className="flex items-center gap-2">
                    <Select value={providers.draft} onValueChange={(v)=> setProviders(prev=> ({ ...prev, draft: v }))}>
                      <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {['openai','anthropic','perplexity','google','mistral'].map(p=> (<SelectItem key={p} value={p}>{p}</SelectItem>))}
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
                        {['openai','anthropic','perplexity','google','mistral'].map(p=> (<SelectItem key={p} value={p}>{p}</SelectItem>))}
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
                        {['openai','anthropic','perplexity','google','mistral'].map(p=> (<SelectItem key={p} value={p}>{p}</SelectItem>))}
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
            )}
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={runChain} disabled={isWorking} className="bg-green-600 hover:bg-green-700">Générer l’article (chaîne multi‑modèles)</Button>
            <Button onClick={saveSettings} disabled={isWorking} variant="outline">Sauvegarder</Button>
            {genStatus && (<span className="text-sm text-gray-600">{genStatus}</span>)}
          </div>
        </CardContent>
      </Card>

      {sections.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Article complet</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {genStatus && (<div className="text-sm text-gray-600">{genStatus}</div>)}
            <div className="bg-white border rounded p-3 text-sm whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: fullHtml }} />
            <div className="flex gap-2">
              <Button onClick={exportHtml} disabled={isWorking}>Exporter HTML</Button>
              <Button variant="outline" size="sm" onClick={()=> setShowSections(v=> !v)}>{showSections ? 'Masquer les sections' : 'Modifier par section'}</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {showSections && sections.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Édition par section</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {sections.map((s, idx) => (
              <div key={s.id} className="border rounded p-3">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-sm">{s.title || `Section ${idx+1}`}</h4>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={()=> rewriteSection(s)}>Régénérer</Button>
                  </div>
                </div>
                <Textarea className="min-h-[160px]" value={s.html} onChange={(e)=> setSections(prev=> prev.map(x=> x.id===s.id? { ...x, html: e.target.value }: x))} />
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

      {/* Assistants */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Liens internes</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Button size="sm" onClick={suggestLinks}>Suggérer liens</Button>
            <ul className="list-disc ml-5 text-sm">
              {links.map((l:any,i:number)=> (
                <li key={i} className="flex items-center gap-2">
                  <a className="text-blue-600" href={l.url} target="_blank" rel="noreferrer">{l.url}</a>
                  <Button size="sm" variant="outline" onClick={() => {
                    // insérer le lien dans l'introduction si présente, sinon dans la première section
                    setSections(prev => prev.map((s,idx) => idx===0 ? { ...s, html: (s.html||'') + `\n<p><a href="${l.url}" rel="noopener">${l.title||'Lien interne'}</a></p>` } : s));
                  }}>Insérer</Button>
                </li>
              ))}
            </ul>
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
              Forcer l'angle Pain Point / Résolution / Tips dans chaque section
            </label>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


