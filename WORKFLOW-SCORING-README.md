# 📊 Workflow Scoring SEO/GEO - Déployé

## ✅ Workflow Créé avec Succès

Le workflow **"Article Scoring - SEO/GEO (Perplexity)"** a été créé automatiquement via l'API n8n.

### 📋 Informations

- **Workflow ID**: `DHNJWSCFI2UjTfvK`
- **Webhook URL**: `https://n8n.srv1144760.hstgr.cloud/webhook/score-article`
- **Statut**: Créé ✅ (nécessite activation)
- **Nodes**: 6
- **Modèle**: Perplexity Sonar
- **Framework**: v1.0 (conforme PRD)

---

## 🎯 Présentation

Ce workflow implémente le **système de scoring SEO/GEO** décrit dans le PRD - Éditeur d'Articles Moderne (Section 4.3).

### Critères de Scoring (21 au total)

#### SEO (76% du score)
1. Structure H1/H2/H3 (10%)
2. Qualité intro & hook (7%)
3. Densité mots-clés (8%)
4. Longue traîne (7%)
5. Skimmabilité (8%)
6. Lisibilité (7%)
7. FAQ & Schema (7%)
8. Preuves & données (6%)
9. Liens internes (5%)
10. Liens externes (5%)
11. Médias (4%)
12. CTA (2%)

#### GEO (19% du score)
13. Marqueurs géo (5%)
14. Citations communautaires (3%)
15. FAQ contextualisées (3%)
16. Benchmarks locaux (3%)
17. Sources nationales (3%)
18. Retours terrain (2%)

#### Fraîcheur (5% du score)
19. Date publication (2%)
20. Mentions temporelles (2%)
21. Âge sources (1%)

### Formule de Calcul

```javascript
scoreGlobal = (
  scoreSEO * 0.76 +
  scoreGEO * 0.19 +
  scoreFreshness * 0.05
) * freshnessPenalty
```

**Pénalité fraîcheur** :
- < 6 mois : 1.0 (aucune pénalité)
- 6-12 mois : 0.95 (-5%)
- 1-2 ans : 0.90 (-10%)
- > 2 ans : 0.80 (-20%)

---

## 🚀 Utilisation

### 1. Activer le Workflow

**Ouvre n8n** : https://n8n.srv1144760.hstgr.cloud/workflow/DHNJWSCFI2UjTfvK

1. Vérifie que le credential **Perplexity API** est connecté
2. Active le workflow (toggle en haut à droite)

### 2. Appeler le Webhook

#### Format de Requête

```bash
POST https://n8n.srv1144760.hstgr.cloud/webhook/score-article
Content-Type: application/json

{
  "content": "<article>HTML de l'article</article>",
  "config": {
    "primaryKeyword": "Power BI",
    "articleType": "guide|comparatif|tutoriel|actualite|liste|etude-cas|faq",
    "targetLength": 2500,
    "searchIntent": "informational|commercial|transactional|navigational",
    "secondaryKeywords": ["mot-clé 1", "mot-clé 2"]
  },
  "userProfile": {
    "industry": "Finance & BI|SaaS|E-commerce|...",
    "market": "france|france-eu|international"
  },
  "level": "algo_only|quick|full"
}
```

#### Exemple cURL

```bash
curl -X POST https://n8n.srv1144760.hstgr.cloud/webhook/score-article \
  -H "Content-Type: application/json" \
  -d '{
    "content": "<article><h1>Mon article</h1><p>Contenu...</p></article>",
    "config": {
      "primaryKeyword": "Power BI vs Tableau",
      "articleType": "comparatif",
      "targetLength": 2500
    },
    "userProfile": {
      "industry": "Finance & BI",
      "market": "france"
    },
    "level": "full"
  }'
```

#### Test avec le Script

```bash
node workflow-n8n/test-scoring-workflow.js
```

---

## 📤 Format de Réponse

```json
{
  "scores": {
    "global": 78,
    "seo": 60,
    "geo": 14,
    "freshness": 4
  },
  "status": "good",
  "statusColor": "yellow",
  "statusBadge": "Bon",
  "criteria": {
    "structure": {
      "score": 85,
      "severity": "ok",
      "feedback": "Hiérarchie H1/H2/H3 bien structurée"
    },
    "introHook": {
      "score": 45,
      "severity": "critical",
      "feedback": "L'introduction manque d'accroche. Ajouter un chiffre impactant."
    },
    // ... 19 autres critères
  },
  "priorities": [
    {
      "criterion": "introHook",
      "severity": "critical",
      "problem": "Introduction peu engageante",
      "action": "Ajouter une statistique marquante dans les 2 premières lignes",
      "location": "Début de l'article, avant le H1"
    }
  ],
  "freshnessPenalty": 0.95,
  "recommendations": {
    "critical": [
      "Améliorer l'accroche de l'introduction",
      "Ajouter 2 liens externes autoritaires"
    ],
    "improvements": [
      "Intégrer une FAQ Schema.org",
      "Ajouter des citations LinkedIn/Reddit"
    ],
    "strengths": [
      "Structure H1/H2/H3 excellente",
      "Bonne densité de mots-clés"
    ]
  },
  "summary": "Article de qualité moyenne. Score impacté par l'intro faible et le manque de sources externes. Corrections prioritaires : hook, liens externes, FAQ.",
  "criteriaCounts": {
    "ok": 13,
    "warning": 5,
    "critical": 3
  },
  "scoringVersion": "v1.0",
  "llmModel": "sonar",
  "promptVersion": "v1.0",
  "analyzedAt": "2025-01-24T08:45:00.000Z"
}
```

---

## 🎨 Zones de Score (Mode Standard)

| Zone | Plage | Couleur | Badge |
|------|-------|---------|-------|
| À améliorer | 0-69 | 🔴 Rouge | "À améliorer" |
| Bon | 70-84 | 🟡 Jaune | "Bon" |
| Excellent | 85-100 | 🟢 Vert | "Excellent" |

**Mode Pro** (4 zones) :
- Critique : 0-59
- À améliorer : 60-74
- Bon : 75-89
- Excellent : 90-100

---

## 🔗 Intégrations

### 1. Workflow Sectional

Intègre le scoring dans le workflow de génération par sections :

```javascript
// Dans le node "Extract Score" du workflow sectional
const scoringResponse = await axios.post(
  'https://n8n.srv1144760.hstgr.cloud/webhook/score-article',
  {
    content: sectionHTML,
    config: outlineData.config,
    userProfile: outlineData.userProfile,
    level: 'quick'
  }
);

const scores = scoringResponse.data.scores;
```

### 2. Éditeur TipTap (Frontend)

```typescript
// src/pages/AdminArticles.tsx - Onglet bêta
import { useScoringStore } from '@/stores/scoring-store';

const { runFullReview } = useScoringStore();

const handleAnalyze = async () => {
  const html = editor.getHTML();
  const config = articleConfig; // Formulaire initial
  const userProfile = user.profile;

  await runFullReview(articleId, html, config, userProfile);
};
```

### 3. API Backend

```typescript
// src/api/scoring.ts (Hono)
app.post('/api/articles/:id/score', async (c) => {
  const articleId = c.req.param('id');
  const article = await getArticle(articleId);

  const response = await fetch('https://n8n.srv1144760.hstgr.cloud/webhook/score-article', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      content: article.content_html,
      config: article.config_json,
      userProfile: c.get('user').profile,
      level: 'full'
    })
  });

  const scores = await response.json();

  // Sauvegarder dans Supabase
  await supabase.from('articles').update({
    score_global: scores.scores.global,
    score_seo: scores.scores.seo,
    score_geo: scores.scores.geo,
    score_freshness: scores.scores.freshness,
    freshness_penalty: scores.freshnessPenalty,
    last_scoring_at: new Date().toISOString()
  }).eq('id', articleId);

  // Sauvegarder l'historique
  await supabase.from('scoring_history').insert({
    article_id: articleId,
    ...scores,
    analysis_level: 'full'
  });

  return c.json(scores);
});
```

---

## 📊 Personnalisation du Prompt

Le prompt s'adapte automatiquement selon :

### Industry (Secteur d'activité)

```javascript
const industries = [
  'Finance & BI',
  'SaaS B2B',
  'E-commerce',
  'Santé & Pharma',
  'Industrie & Manufacturing',
  'Marketing & Communication',
  'Tech & DevOps',
  'RH & Formation',
  'Immobilier',
  'Autres'
];
```

### Market (Marché cible)

```javascript
const markets = [
  'france',        // Focus France uniquement
  'france-eu',     // France + Europe
  'international'  // Anglophone
];
```

### Article Type

```javascript
const articleTypes = [
  'guide',         // Guide ultime
  'comparatif',    // A vs B
  'tutoriel',      // How-to
  'actualite',     // News
  'liste',         // Top X
  'etude-cas',     // Case study
  'faq'            // Questions/réponses
];
```

---

## 🔧 Configuration Avancée

### Modifier les Pondérations

Les pondérations sont codées dans le node **"Extract & Process Scoring"** :

```javascript
// Ligne 42 du node
const scoreGlobal = Math.round(
  (scores.seo * 0.76 +      // SEO : 76%
   scores.geo * 0.19 +      // GEO : 19%
   scores.freshness * 0.05) // Fraîcheur : 5%
  * freshnessPenalty
);
```

Pour ajuster, modifie ces coefficients dans n8n.

### Ajuster la Pénalité Fraîcheur

```javascript
// Actuellement dans le prompt système (node 3)
// Peut être extrait dans un node JS séparé
function calculateFreshnessPenalty(lastUpdated: Date): number {
  const days = differenceInDays(new Date(), lastUpdated);
  if (days > 730) return 0.80; // > 2 ans
  if (days > 365) return 0.90; // > 1 an
  if (days > 180) return 0.95; // > 6 mois
  return 1.0;
}
```

---

## 🐛 Dépannage

### Webhook retourne 404

**Solution** : Le workflow n'est pas activé. Active-le dans n8n.

### Timeout après 60 secondes

**Cause** : Perplexity Sonar peut être lent pour les articles longs.

**Solution** : Augmente le timeout ou utilise `level: "quick"` pour une analyse rapide.

### Scores incohérents

**Cause** : Prompt peut nécessiter ajustement selon l'industry.

**Solution** : Modifie le prompt système dans le node **"Build Scoring Prompt"** (node 3).

### Erreur "Credential not found"

**Solution** : Ouvre le workflow dans n8n et reconnecte le credential **Perplexity API**.

---

## 📈 Métriques & Monitoring

### Coût par Analyse

- **Perplexity Sonar** : ~$0.001-0.003 par requête (selon longueur)
- **Niveau "quick"** : ~$0.001
- **Niveau "full"** : ~$0.003

### Temps d'Exécution

- **algo_only** : 0s (pas d'appel IA)
- **quick** : 3-5s
- **full** : 10-15s

### Limites

- **Articles < 500 mots** : Scores peu fiables
- **Articles > 5000 mots** : Peut dépasser le timeout
- **Limite Perplexity** : 600 requêtes/min

---

## 🚀 Prochaines Améliorations

1. **Cache de scoring** : Éviter de re-scorer les articles inchangés
2. **Scoring algorithmique local** : Calculer les 11 critères algo côté client avant l'appel IA
3. **Webhook callbacks** : Notifier l'éditeur quand le scoring est terminé
4. **Historique comparatif** : Voir l'évolution des scores dans le temps
5. **Export PDF** : Générer un rapport de scoring détaillé

---

## 📞 Support

**Workflow n8n** : https://n8n.srv1144760.hstgr.cloud
**Executions** : https://n8n.srv1144760.hstgr.cloud/executions
**Workflow direct** : https://n8n.srv1144760.hstgr.cloud/workflow/DHNJWSCFI2UjTfvK

**PRD complet** : Voir fichier fourni par l'utilisateur

---

**Dernière mise à jour** : 24 novembre 2025
**Version scoring** : v1.0
**Compatibilité** : n8n v1.0+, Perplexity Sonar
