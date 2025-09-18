Guidelines TypeScript – Projet MagicPath

Objectif
Réduire les erreurs de build en typant explicitement les collections et en protégeant les champs optionnels.

Règles pratiques
- Tableaux initialisés vides
  - Toujours typer: `const items: string[] = [];` ou `const rows: Array<Row> = [];`
  - Éviter `const x = [];` qui peut être inféré en never[] et casser `push()`.

- Objets de collection
  - Préférer des interfaces/types:
    - `type ContextChunk = { id: string; content: string; keywords: string[]; ... }`
    - `const chunks: ContextChunk[] = []`

- Champs optionnels et null guards
  - Accéder avec `?.` et provide defaults `??` quand affichés: `user?.name ?? '—'`
  - Lorsqu’un state est mis à jour pendant un render (ex: `setState(...)`), retourner immédiatement un fallback visuel pour éviter d’accéder à l’ancien state nul.

- Typage des services/retours API
  - Définir des types côté client pour les réponses API et caster au point d’entrée.
  - Ne pas propager `any`.

- Fonctions utilitaires
  - Annoter les retours non triviaux, surtout ceux qui retournent des collections.

Exemples du code
- `aiOptimizer.ts`
  - `ContextChunk[]`, `ContentRecommendation[]` utilisés pour éviter `never[]`.
- `KnowledgeChat.tsx`
  - `let insights: string[] = []` (au lieu de `[]`).
- `ArticleDetailPage.tsx`
  - Retour "Chargement..." après `setArticle(local)` pour éviter l’accès à `article.*` pendant le même render.

Checklist PR
- [ ] Aucun `const x = []` sans type.
- [ ] Champs potentiellement `undefined` protégés par `?.`/`??` côté UI.
- [ ] Pas de setState puis accès aux anciennes valeurs dans le même render.
- [ ] Types exportés depuis `src/lib/types.ts` réutilisés au lieu de redéfinir.


