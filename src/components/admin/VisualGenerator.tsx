import { useMemo, useState } from 'react';
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar, LineChart, Line } from 'recharts';

function randomData(n = 6) {
  return Array.from({ length: n }).map((_, i) => ({ name: `S${i + 1}`, value: Math.round(50 + Math.random() * 50) }));
}

export default function VisualGenerator({ onInsert }: { onInsert: (md: string) => void }) {
  const [type, setType] = useState<'napkin' | 'bar' | 'line'>('napkin');
  const data = useMemo(() => randomData(), [type]);

  function insert() {
    if (type === 'napkin') {
      const md = '```text\n[Source] --> [Transform] --> [Dashboard]\n```\n\n';
      onInsert(md);
      return;
    }
    if (type === 'bar') {
      const rows = data.map(d => `| ${d.name} | ${d.value} |`).join('\n');
      const md = `### Bar chart — Exemple\n\n![Bar chart](#)\n\n| Label | Valeur |\n|---|---:|\n${rows}\n\n`;
      onInsert(md);
      return;
    }
    if (type === 'line') {
      const rows = data.map(d => `| ${d.name} | ${d.value} |`).join('\n');
      const md = `### Line chart — Exemple\n\n![Line chart](#)\n\n| Label | Valeur |\n|---|---:|\n${rows}\n\n`;
      onInsert(md);
      return;
    }
  }

  return (
    <div className="border rounded p-3 space-y-3">
      <div className="font-semibold">Visual Generator (minimal)</div>
      <div className="flex items-center gap-2 text-sm">
        <label className="text-slate-600">Type</label>
        <select className="border rounded px-2 py-1" value={type} onChange={(e)=>setType(e.target.value as any)}>
          <option value="napkin">Napkin diagram</option>
          <option value="bar">Bar chart</option>
          <option value="line">Line chart</option>
        </select>
        <button className="ml-auto px-2 py-1 rounded bg-teal-600 text-white text-sm" onClick={insert}>Insérer (Markdown)</button>
      </div>
      <div className="bg-white rounded border p-2" style={{ height: 180 }}>
        {type === 'napkin' && (
          <pre className="text-sm text-slate-700">[Source] --&gt; [Transform] --&gt; [Dashboard]</pre>
        )}
        {type === 'bar' && (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#0ea5e9" />
            </BarChart>
          </ResponsiveContainer>
        )}
        {type === 'line' && (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#22c55e" />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
      <div className="text-xs text-slate-500">Astuce: vous pourrez remplacer les placeholders par de vraies images ou composants charts.</div>
    </div>
  );
}


