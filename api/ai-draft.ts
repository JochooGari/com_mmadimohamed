export const config = { runtime: 'edge' };

type Input = {
  topic: string;
  intent?: string;
  sources?: string[];
  language?: 'fr' | 'en';
  angle?: string;
};

function limit(str: string, n: number) {
  return str.length <= n ? str : str.slice(0, n - 1) + '…';
}

function strategist(topic: string) {
  const baseAngles = [
    `Perspective: pourquoi ${topic} améliore le ROI sans surcoût caché`,
    `Preuve: ce que montrent les chiffres quand on met ${topic} en place`,
    `Process: 3 étapes pour réussir ${topic} sans se perdre en complexité`,
  ];
  const mots = [topic, 'Power BI', 'DAX', 'dashboard', 'data governance', 'performance', 'reporting', 'Paris'];
  return {
    angles: baseAngles,
    mots_cles_semantiques: mots,
    intent: ['informational', 'transactional'],
    briefs_par_format: [
      { format: 'Blog', brief: 'Article pratique en 1200-1800 mots, avec plan H2/H3, exemples et FAQ.' },
      { format: 'LinkedIn', brief: 'Post 120-180 mots avec hook clair, principe, preuve, process, CTA RDV.' },
      { format: 'Newsletter', brief: 'Edition courte 300-600 mots: intro, idée clé, pas-à-pas, ressource bonus, CTA.' },
    ],
  };
}

function ghostwriter(topic: string, angle: string) {
  const title = limit(`${topic}: ${angle.replace(/^(Perspective|Preuve|Process):\s*/i, '')}`, 58);
  const meta = limit(`Comment appliquer ${topic} avec un plan simple et mesurable.`, 152);
  const plan = [
    { h2: 'Introduction', points: ['Où vous perdez du temps aujourd\'hui', `Ce que ${topic} peut changer`] },
    { h2: 'Étape 1 — Cadrage', points: ['KPI cibles', 'Contraintes', 'Données disponibles'] },
    { h2: 'Étape 2 — Mise en œuvre', points: ['Modèle', 'DAX', 'Performance'] },
    { h2: 'Étape 3 — Adoption', points: ['Formation', 'Gouvernance', 'Itérations courtes'] },
    { h2: 'FAQ', points: [] },
    { h2: 'Conclusion', points: ['Résumer le gain', 'Prochain pas'] },
  ];
  const blog = {
    title_seo: title,
    meta_description: meta,
    plan_h2_h3: plan,
    intro: `Dans cet article, on explique ${topic} sans bla-bla: objectif clair, étapes concrètes et résultats mesurables.`,
    sections: [
      { h2: 'Introduction', content: 'Pourquoi agir maintenant et quels problèmes récurrents résoudre.' },
      { h2: 'Étape 1 — Cadrage', content: 'Choisir 3 KPIs. Cartographier les données. Décider des contraintes perf.' },
      { h2: 'Étape 2 — Mise en œuvre', content: 'Modèle en étoile, mesures DAX, tests de perf, standards UX des visuels.' },
      { h2: 'Étape 3 — Adoption', content: 'Former les utilisateurs, définir la gouvernance, itérer chaque 2 semaines.' },
    ],
    faq: [
      { q: `Combien de temps pour ${topic} ?`, a: 'Un premier livrable en 2 à 4 semaines est réaliste.' },
      { q: 'Comment mesurer le ROI ?', a: 'Gagner du temps de préparation, fiabilité des chiffres, décisions plus rapides.' },
    ],
    conclusion: 'Gardez une boucle courte: cadrer, livrer, apprendre. Et capitaliser sur ce qui marche.',
    interlinking: ['bibliotheque', 'blog', 'contact'],
  };
  const linkedin = {
    variants: [
      `Hook: ${limit(angle, 90)}.\n\nLe principe: se concentrer sur 3 KPIs utiles (pas 30).\nPreuve: les équipes qui font ça réduisent le temps de reporting de 30-50%.\nProcess: cadrage 1h, prototype 1 semaine, itérations de 2 semaines.\n\nCTA: envie d\'un plan clair ? Ecrivez-moi.`,
    ],
  };
  const newsletter = {
    subject: limit(`Votre plan simple pour ${topic}`, 60),
    preview: limit('Un process court pour livrer un vrai résultat.', 90),
    body: `Bonjour,\n\nVoici un plan court pour ${topic}:\n1) Cadrage (KPI, données)\n2) Mise en œuvre (modèle, DAX, perf)\n3) Adoption (formation, gouvernance)\n\nSi vous voulez un exemple adapté à votre contexte, répondez et on cale un créneau.\n`,
  };
  const draft_md = `# ${blog.title_seo}\n\n${blog.intro}\n\n## ${plan[1].h2}\n- ${plan[1].points.join('\n- ')}\n\n## ${plan[2].h2}\n- ${plan[2].points.join('\n- ')}\n\n## ${plan[3].h2}\n- ${plan[3].points.join('\n- ')}\n\n## FAQ\n- ${blog.faq[0].q}\n\n${blog.faq[0].a}`;
  return { blog, linkedin, newsletter, draft_md };
}

export default async function handler(req: Request) {
  if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });
  const body = (await req.json().catch(() => null)) as Input | null;
  if (!body || !body.topic) return new Response('Bad Request: missing topic', { status: 400 });

  const { topic, intent = 'informational', sources = [], language = 'fr', angle } = body;

  const strat = strategist(topic);
  const chosenAngle = angle || strat.angles[0];
  const gw = ghostwriter(topic, chosenAngle);

  const result = {
    createdAt: new Date().toISOString(),
    language,
    strategist: strat,
    ghostwriter: gw,
    sources,
  };

  // Optional: save as draft in Supabase if service role is provided
  try {
    if ((globalThis as any).process?.env?.VITE_SUPABASE_URL && (globalThis as any).process?.env?.SUPABASE_SERVICE_ROLE) {
      // dynamic import to keep edge bundle small
      // @ts-ignore
      const { createClient } = await import('@supabase/supabase-js');
      // @ts-ignore
      const supabase = createClient((process as any).env.VITE_SUPABASE_URL, (process as any).env.SUPABASE_SERVICE_ROLE);
      const excerpt = limit(gw.blog.meta_description, 150);
      await supabase.from('articles').insert({
        slug: topic.toLowerCase().replace(/\s+/g, '-').slice(0, 60),
        title: gw.blog.title_seo,
        excerpt,
        content: { strategist: strat, ghostwriter: gw },
        content_md: gw.draft_md,
        tags: ['IA-draft'],
        published: false,
      });
    }
  } catch {}

  return new Response(JSON.stringify(result), { headers: { 'content-type': 'application/json' } });
}


