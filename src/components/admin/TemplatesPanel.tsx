export default function TemplatesPanel({ onInsert }: { onInsert: (md: string) => void }) {
  const templates = [
    { name: 'Article — Plan standard', md: `# Titre de l'article\n\n## Introduction\n- Problème\n- Objectif\n\n## Étape 1 — Cadrage\n- KPIs\n- Données\n\n## Étape 2 — Mise en œuvre\n- Modèle\n- DAX\n- Performance\n\n## Étape 3 — Adoption\n- Formation\n- Gouvernance\n\n## Conclusion\n- Résumé\n- Prochain pas` },
    { name: 'Étude de cas', md: `# Étude de cas — Client X\n\n## Contexte\n\n## Défi\n\n## Solution\n\n## Résultats\n- KPI 1\n- KPI 2\n\n## Leçons apprises` },
    { name: 'Checklist', md: `# Checklist — Lancement Power BI\n\n- [ ] Définir KPIs\n- [ ] Cartographier données\n- [ ] Modèle en étoile\n- [ ] Mesures DAX\n- [ ] Tests performance\n- [ ] Documentation` },
  ];
  return (
    <div className="border rounded p-3 space-y-2">
      <div className="font-semibold">Templates</div>
      {templates.map(t => (
        <button key={t.name} className="w-full text-left px-2 py-1 text-sm rounded border hover:bg-slate-50" onClick={()=>onInsert(t.md)}>{t.name}</button>
      ))}
    </div>
  );
}


