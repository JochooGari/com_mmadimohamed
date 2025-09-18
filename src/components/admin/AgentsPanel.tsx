import { useEffect, useState } from 'react';

const DEFAULT_AGENTS = [
  'Scripting', 'Ghostwriting', 'Newsletter', 'Strategy', 'Executive Assistant', 'SEO Expert', 'Content Marketer'
];

export default function AgentsPanel({ onRun }: { onRun: (agent: string) => void }) {
  const [agents, setAgents] = useState<string[]>(() => {
    try { const raw = localStorage.getItem('admin:agents'); if (raw) { const arr = JSON.parse(raw) as any[]; return arr.map(a=>a.name) } } catch {}
    return DEFAULT_AGENTS;
  });
  useEffect(() => {
    try { const raw = localStorage.getItem('admin:agents'); if (raw) { const arr = JSON.parse(raw) as any[]; setAgents(arr.map(a=>a.name)); } } catch {}
  }, []);
  const [newAgent, setNewAgent] = useState('');

  return (
    <div className="border rounded p-3 space-y-3">
      <div className="font-semibold">Agents IA</div>
      <div className="flex flex-wrap gap-2">
        {agents.map((a) => (
          <button key={a} className="px-2 py-1 text-sm rounded border hover:bg-slate-50" onClick={() => onRun(a)}>{a}</button>
        ))}
      </div>
      <div className="flex gap-2">
        <input className="border rounded px-2 py-1 text-sm flex-1" value={newAgent} onChange={(e)=>setNewAgent(e.target.value)} placeholder="Ajouter un agent (ex: Ads Copy)" />
        <button className="px-2 py-1 text-sm rounded bg-teal-600 text-white" onClick={()=>{ if(newAgent.trim()){ setAgents([...agents, newAgent.trim()]); setNewAgent(''); } }}>Ajouter</button>
      </div>
    </div>
  );
}


