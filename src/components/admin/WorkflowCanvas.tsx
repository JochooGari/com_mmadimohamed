import { useEffect, useRef, useState } from 'react';
import { useAdminData } from '../../context/AdminDataContext';
import { Plus, Copy, RotateCcw, Play, Settings } from 'lucide-react';

type Node = { id: string; x: number; y: number; label: string };
type Edge = { from: string; to: string };

const DEFAULT_NODES: Node[] = [
  { id: 'topic', x: 80, y: 80, label: 'Topic' },
  { id: 'strategist', x: 260, y: 80, label: 'Strategist' },
  { id: 'ghost', x: 440, y: 80, label: 'Ghostwriter' },
  { id: 'seo', x: 620, y: 80, label: 'SEO' },
];
const DEFAULT_EDGES: Edge[] = [
  { from: 'topic', to: 'strategist' },
  { from: 'strategist', to: 'ghost' },
  { from: 'ghost', to: 'seo' },
];

export default function WorkflowCanvas({ onAIResult }: { onAIResult?: (result: any) => void }) {
  const admin = useAdminData();
  const [nodes, setNodes] = useState<Node[]>(() => {
    try {
      const saved = window.localStorage.getItem('workflow:nodes');
      return saved ? JSON.parse(saved) as Node[] : DEFAULT_NODES;
    } catch { return DEFAULT_NODES; }
  });
  const [edges, setEdges] = useState<Edge[]>(() => {
    try {
      const saved = window.localStorage.getItem('workflow:edges');
      return saved ? JSON.parse(saved) as Edge[] : DEFAULT_EDGES;
    } catch { return DEFAULT_EDGES; }
  });
  const [dragId, setDragId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ dx: number; dy: number }>({ dx: 0, dy: 0 });
  const [connectFrom, setConnectFrom] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [topic, setTopic] = useState<string>(() => {
    try { return window.localStorage.getItem('workflow:topic') || ''; } catch { return ''; }
  });
  const [logs, setLogs] = useState<string[]>([]);
  const [aiResult, setAiResult] = useState<any>(null);
  const [status, setStatus] = useState<Record<string, 'pending'|'running'|'completed'|'error'>>({
    topic: 'pending', strategist: 'pending', ghost: 'pending', seo: 'pending'
  });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      window.localStorage.setItem('workflow:nodes', JSON.stringify(nodes));
      window.localStorage.setItem('workflow:edges', JSON.stringify(edges));
    } catch {}
  }, [nodes, edges]);

  function onMouseDownNode(e: React.MouseEvent, id: string) {
    const rect = containerRef.current?.getBoundingClientRect();
    const node = nodes.find(n => n.id === id)!;
    const dx = e.clientX - (rect?.left ?? 0) - node.x;
    const dy = e.clientY - (rect?.top ?? 0) - node.y;
    setDragId(id);
    setDragOffset({ dx, dy });
  }

  function onMouseMove(e: React.MouseEvent) {
    if (!dragId) return;
    const rect = containerRef.current?.getBoundingClientRect();
    const x = e.clientX - (rect?.left ?? 0) - dragOffset.dx;
    const y = e.clientY - (rect?.top ?? 0) - dragOffset.dy;
    setNodes(prev => prev.map(n => n.id === dragId ? { ...n, x: Math.max(10, Math.min(x, (rect?.width ?? 800) - 100)), y: Math.max(10, Math.min(y, (rect?.height ?? 300) - 40)) } : n));
  }

  function onMouseUp() { setDragId(null); }

  function addNode() {
    const id = `node-${Date.now()}`;
    setNodes(prev => [...prev, { id, x: 120, y: 160, label: 'Step' }]);
    setStatus(prev => ({ ...prev, [id]: 'pending' }));
  }

  function toggleConnect(id: string) {
    if (!connectFrom) { setConnectFrom(id); return; }
    if (connectFrom === id) { setConnectFrom(null); return; }
    setEdges(prev => [...prev, { from: connectFrom, to: id }]);
    setConnectFrom(null);
  }

  async function copyJson() {
    const payload = JSON.stringify({ nodes, edges }, null, 2);
    try { await navigator.clipboard.writeText(payload); } catch {}
  }

  function reset() {
    setNodes(DEFAULT_NODES);
    setEdges(DEFAULT_EDGES);
  }

  function deleteNode(id: string) {
    setNodes(prev => prev.filter(n => n.id !== id));
    setEdges(prev => prev.filter(e => e.from !== id && e.to !== id));
    if (selectedId === id) setSelectedId(null);
  }

  function deleteEdgeAt(index: number) {
    setEdges(prev => prev.filter((_, i) => i !== index));
  }

  async function runWorkflow() {
    setLogs([]);
    try { window.localStorage.setItem('workflow:topic', topic); } catch {}
    if (!topic.trim()) { setLogs(l => [...l, '⚠️ Définissez un Topic avant exécution.']); return; }
    // Build simple execution order starting from 'topic'
    const idToNode = Object.fromEntries(nodes.map(n => [n.id, n] as const));
    const outgoing = (id: string) => edges.filter(e => e.from === id).map(e => e.to);
    let current = nodes.find(n => n.label.toLowerCase().includes('topic'))?.id || 'topic';
    if (!idToNode[current]) { setLogs(l => [...l, '⚠️ Aucun nœud Topic trouvé.']); return; }
    const visited: string[] = [];
    const order: string[] = [];
    function dfs(id: string) {
      if (visited.includes(id)) return; visited.push(id); order.push(id);
      outgoing(id).forEach(dfs);
    }
    dfs(current);
    setLogs(l => [...l, `▶️ Ordre: ${order.map(id => idToNode[id]?.label || id).join(' → ')}`]);
    // Execute basic actions
    let aiCalled = false; let result: any = null;
    // reset statuses
    setStatus(prev => Object.fromEntries(Object.keys(prev).map(k => [k, 'pending'])) as any);
    for (const id of order) {
      const label = (idToNode[id]?.label || '').toLowerCase();
      setStatus(prev => ({ ...prev, [id]: 'running' }));
      if ((label.includes('strategist') || label.includes('ghost')) && !aiCalled) {
        setLogs(l => [...l, '🤖 Appel IA: génération plan + brouillon…']);
        const res = await fetch('/api/ai-draft', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ topic, language: 'fr' }) });
        result = await res.json(); aiCalled = true; setAiResult(result); if (onAIResult) { try { onAIResult(result); } catch {} }
        try { admin.addContent({ type: 'LinkedIn Post', title: result?.ghostwriter?.blog?.title_seo || topic, content: result?.ghostwriter?.draft_md || '', status: 'draft', createdBy: 'Agent Ghostwriter' }); } catch {}
        setLogs(l => [...l, '✅ IA OK: plan/brief + draft générés.']);
      } else if (label.includes('seo')) {
        setLogs(l => [...l, '🔎 Étape SEO: vous pouvez ouvrir le panneau SEO pour optimiser titre/méta.']);
      } else if (label.includes('research') || label.includes('topic')) {
        try { admin.addResearch({ topic, source: 'Manual', relevance: 90, keywords: topic.split(/\s+/).slice(0,3), addedBy: 'Agent Veille', insights: `Sujet: ${topic}` }); } catch {}
        setLogs(l => [...l, `🧭 Topic: « ${topic} »`]);
      } else if (label.includes('community')) {
        const first = admin.content.find(c => c.status === 'approved' || c.status === 'pending' || c.status === 'draft');
        if (first) try { admin.updateContentStatus(first.id, 'published'); } catch {}
        setLogs(l => [...l, '📣 Publication (Community Manager)']);
      } else if (label.includes('analyst')) {
        const last = admin.content.find(c => c.status === 'published');
        if (last) try { admin.addPerformance({ contentId: last.id, views: 120 + Math.round(Math.random()*200), likes: 10 + Math.round(Math.random()*40), comments: 2 + Math.round(Math.random()*10), shares: 1 + Math.round(Math.random()*8), engagementRate: 4 + Math.round(Math.random()*3), sentiment: 'positive' }); } catch {}
        setLogs(l => [...l, '📈 Analyst: performance enregistrée']);
      } else if (label.includes('lead')) {
        const first = admin.content.find(c => c.status === 'draft');
        if (first) try { admin.updateContentStatus(first.id, 'pending'); } catch {}
        setLogs(l => [...l, '🛡 Content Lead: contenu en revue']);
      } else {
        setLogs(l => [...l, `➡️ Étape ${idToNode[id]?.label}`]);
      }
      setStatus(prev => ({ ...prev, [id]: 'completed' }));
    }
  }

  async function copyPlan() { if (aiResult?.strategist) try { await navigator.clipboard.writeText(JSON.stringify(aiResult.strategist, null, 2)); } catch {} }
  async function copyDraft() { if (aiResult?.ghostwriter?.draft_md) try { await navigator.clipboard.writeText(aiResult.ghostwriter.draft_md); } catch {} }

  return (
    <div className="border rounded p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="font-semibold">Workflow (type Make)</div>
        <div className="flex gap-2">
          <button className="px-2 py-1 text-sm rounded border flex items-center gap-1" onClick={addNode}><Plus className="w-3 h-3"/> Node</button>
          <button className="px-2 py-1 text-sm rounded border flex items-center gap-1" onClick={copyJson}><Copy className="w-3 h-3"/> Copier JSON</button>
          <button className="px-2 py-1 text-sm rounded border flex items-center gap-1" onClick={reset}><RotateCcw className="w-3 h-3"/> Reset</button>
          <button className="px-2 py-1 text-sm rounded bg-teal-600 text-white flex items-center gap-1" onClick={runWorkflow}><Play className="w-3 h-3"/> Exécuter</button>
        </div>
      </div>
      <div className="flex items-center gap-2 mb-2">
        <input className="border rounded px-2 py-1 text-sm w-full" placeholder="Topic (ex: Reporting Power BI Finance)" value={topic} onChange={(e)=>setTopic(e.target.value)} />
        <button className="px-2 py-1 text-sm rounded border" onClick={()=>setTopic('')}>Effacer</button>
      </div>
      <div ref={containerRef} onMouseMove={onMouseMove} onMouseUp={onMouseUp} className="relative bg-slate-50 rounded" style={{ height: 300 }}>
        <svg className="absolute inset-0 w-full h-full">
          {edges.map((e, i) => {
            const a = nodes.find(n => n.id === e.from);
            const b = nodes.find(n => n.id === e.to);
            if (!a || !b) return null;
            return <line key={i} x1={a.x+90} y1={a.y+20} x2={b.x} y2={b.y+20} stroke="#94a3b8" strokeWidth={2} markerEnd="url(#arrow)" />
          })}
          <defs>
            <marker id="arrow" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#94a3b8" />
            </marker>
          </defs>
        </svg>
        {nodes.map((n) => (
          <div
            key={n.id}
            className={`absolute bg-white shadow rounded px-3 py-2 text-sm border cursor-move ${connectFrom===n.id?'ring-2 ring-teal-500':''} ${selectedId===n.id?'ring-2 ring-indigo-500':''}`}
            style={{ left: n.x, top: n.y, width: 90 }}
            onMouseDown={(e)=>onMouseDownNode(e, n.id)}
            onDoubleClick={()=>toggleConnect(n.id)}
            onClick={()=>setSelectedId(n.id)}
            title="Glisser pour déplacer, double-clic pour connecter, clic pour sélectionner"
          >
            <div className="text-center">
              <div className="font-medium">{n.label}</div>
              <div className="mt-1">
                {status[n.id as keyof typeof status] === 'completed' && <span className="px-1.5 py-0.5 rounded text-[10px] bg-green-100 text-green-700">Terminé</span>}
                {status[n.id as keyof typeof status] === 'running' && <span className="px-1.5 py-0.5 rounded text-[10px] bg-blue-100 text-blue-700">En cours</span>}
                {(!status[n.id as keyof typeof status] || status[n.id as keyof typeof status] === 'pending') && <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 text-slate-700">En attente</span>}
              </div>
            </div>
            <button className="absolute -top-2 -right-2 w-6 h-6 rounded-full border bg-white flex items-center justify-center" title="Paramètres">
              <Settings className="w-3 h-3 text-slate-500" />
            </button>
          </div>
        ))}
      </div>
      <div className="text-xs text-slate-500 mt-2">Astuce: double‑cliquez deux nœuds à la suite pour créer une connexion.</div>
      {/* Inspector */}
      <div className="grid md:grid-cols-2 gap-3 mt-3">
        <div className="border rounded p-3">
          <div className="font-semibold mb-2">Propriétés du nœud</div>
          {selectedId ? (
            <>
              <div className="text-xs text-slate-500 mb-1">ID: {selectedId}</div>
              <input className="border rounded px-2 py-1 text-sm w-full mb-2" value={nodes.find(n=>n.id===selectedId)?.label || ''} onChange={(e)=>setNodes(prev=>prev.map(n=>n.id===selectedId?{...n,label:e.target.value}:n))} />
              <div className="flex gap-2">
                <button className="px-2 py-1 text-sm rounded border" onClick={()=>deleteNode(selectedId!)}>Supprimer</button>
                <button className="px-2 py-1 text-sm rounded border" onClick={()=>setSelectedId(null)}>Fermer</button>
              </div>
            </>
          ) : (<div className="text-sm text-slate-600">Sélectionnez un nœud pour l’éditer.</div>)}
        </div>
        <div className="border rounded p-3">
          <div className="font-semibold mb-2">Connexions</div>
          {edges.length===0 ? <div className="text-sm text-slate-600">Aucune connexion.</div> : (
            <ul className="text-sm">
              {edges.map((e,i)=>(
                <li key={i} className="flex items-center justify-between border-t py-1">
                  <span>{nodes.find(n=>n.id===e.from)?.label || e.from} → {nodes.find(n=>n.id===e.to)?.label || e.to}</span>
                  <button className="px-2 py-1 text-xs rounded border" onClick={()=>deleteEdgeAt(i)}>Supprimer</button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      {logs.length>0 && (
        <div className="mt-3 border rounded p-3 bg-slate-50 text-sm space-y-1">
          {logs.map((l,i)=>(<div key={i}>{l}</div>))}
          {aiResult && (
            <div className="pt-2 flex gap-2">
              <button className="px-2 py-1 text-sm rounded border" onClick={copyPlan}>Copier plan</button>
              <button className="px-2 py-1 text-sm rounded border" onClick={copyDraft}>Copier draft</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}


