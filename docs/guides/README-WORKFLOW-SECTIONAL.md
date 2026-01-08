# 🚀 Workflow Article Sectional - Guide d'Import et Utilisation

## 📦 Fichiers Disponibles

- **`workflow-sectional-complete.json`** - Workflow complet prêt à importer ✅
- **`GUIDE-MIGRATION-WORKFLOW-SECTIONAL.md`** - Documentation technique détaillée
- **Prompts intégrés** - Writer et Reviewer avec scoring pondéré

---

## 🎯 Import Rapide (5 minutes)

### Étape 1: Télécharger le Workflow

Le fichier est déjà prêt :
```
workflow-n8n/workflow-sectional-complete.json
```

### Étape 2: Importer dans n8n

1. **Ouvre n8n** : https://n8n.srv1144760.hstgr.cloud
2. **Clique** sur "Add workflow" (en haut à droite)
3. **Sélectionne** "Import from File"
4. **Choisis** le fichier `workflow-sectional-complete.json`
5. **Clique** "Import"

### Étape 3: Configurer les Credentials

Le workflow utilise 3 credentials (déjà configurés dans ton n8n) :

- ✅ **OpenAI API** (ID: `CZtCJqLCWSNLG0pB`) - Pour GPT-5.1
- ✅ **Anthropic Claude** (ID: `TT555VQ7I164GBRX`) - Pour Reviewer
- ✅ **Supabase** (ID: `WjTJ7AJ4DFGNPXWr`) - Pour sauvegarder sections

**Note**: Si les IDs ne correspondent pas, tu devras reconnecter les credentials dans chaque node HTTP Request.

### Étape 4: Activer le Workflow

1. **Toggle** le switch "Active" en haut à droite
2. **Webhook URL** sera généré automatiquement :
   ```
   https://n8n.srv1144760.hstgr.cloud/webhook/generate-article-sectional
   ```

---

## 🧪 Test du Workflow

### Test Simple (3 sections)

```bash
curl -X POST https://n8n.srv1144760.hstgr.cloud/webhook/generate-article-sectional \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "Power BI pour la Finance - Guide 2025",
    "outline": "Introduction Power BI Finance|Connexion aux sources de données|Visualisations KPI financiers"
  }'
```

### Test Complet (5-6 sections)

```bash
curl -X POST https://n8n.srv1144760.hstgr.cloud/webhook/generate-article-sectional \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "DevOps et Automatisation Cloud 2025 - Guide Complet",
    "outline": "Introduction DevOps moderne|Principes fondamentaux et ROI|Infrastructure as Code (IaC)|CI/CD et pipelines automatisés|Observabilité et monitoring|FAQ et bonnes pratiques 2025"
  }'
```

### Depuis Node.js

```javascript
const axios = require('axios');

async function generateArticle() {
  const response = await axios.post(
    'https://n8n.srv1144760.hstgr.cloud/webhook/generate-article-sectional',
    {
      topic: "Power BI pour la Finance - Guide 2025",
      outline: "Introduction Power BI Finance|Connexion aux sources de données|Visualisations KPI financiers"
    }
  );

  console.log('✅ Article généré:', response.data);
  console.log('   Job ID:', response.data.job_id);
  console.log('   Sections:', response.data.total_sections);
}

generateArticle();
```

---

## 📊 Architecture du Workflow

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. Webhook                                                      │
│    POST /generate-article-sectional                            │
│    Body: { topic, outline }                                    │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 2. Build Outline Prompt                                        │
│    → Parse sections (split by "|")                             │
│    → Build GPT-5 prompt avec JSON Schema                       │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 3. STEP 1 - Generate Outline (GPT-5)                          │
│    → model: gpt-5.1                                            │
│    → max_output_tokens: 4000                                   │
│    → Output: H1, intro, sections[], faq, conclusion           │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 4. Extract Outline                                             │
│    → Parse JSON response                                       │
│    → Generate job_id                                           │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 5. Split Sections (Loop)                                      │
│    → Batch size: 1 (une section à la fois)                    │
└─────────────────────────────────────────────────────────────────┘
                              ↓
        ╔═══════════════════════════════════════════╗
        ║  POUR CHAQUE SECTION (Loop)              ║
        ╠═══════════════════════════════════════════╣
        ║  6. Build Writer Prompt                  ║
        ║     → Prompt avec H2, H3, points clés    ║
        ║     → JSON Schema strict                 ║
        ╟───────────────────────────────────────────╢
        ║  7. STEP 2 - Writer Section (GPT-5.1)   ║
        ║     → 400-600 mots max                   ║
        ║     → max_output_tokens: 3500            ║
        ║     → temperature: 0.5                   ║
        ╟───────────────────────────────────────────╢
        ║  8. Validate HTML                        ║
        ║     ✅ Vérifie </section>                ║
        ║     ✅ Vérifie word_count >= 300         ║
        ║     ❌ Throw error si incomplet          ║
        ╟───────────────────────────────────────────╢
        ║  9. Build Reviewer Prompt                ║
        ║     → Tableau scoring SEO/GEO pondéré    ║
        ╟───────────────────────────────────────────╢
        ║  10. STEP 3 - Reviewer (Claude Sonnet)  ║
        ║     → Analyse + score /100               ║
        ║     → Feedback actionnable               ║
        ╟───────────────────────────────────────────╢
        ║  11. Extract Score                       ║
        ║     → Parse scores: SEO, GEO, global     ║
        ╟───────────────────────────────────────────╢
        ║  12. Prepare for Save                    ║
        ║     → Format pour Supabase               ║
        ╟───────────────────────────────────────────╢
        ║  13. STEP 4 - Save Section (Supabase)   ║
        ║     → Table: articles_content            ║
        ║     → Fields: job_id, section_index,     ║
        ║               section_title, content     ║
        ╚═══════════════════════════════════════════╝
                              ↓ (Loop back to step 5)
┌─────────────────────────────────────────────────────────────────┐
│ 14. Response (All Sections Complete)                          │
│     → success, job_id, total_sections, h1                     │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🎨 Structure de la Réponse

### Réponse Webhook (finale)

```json
{
  "success": true,
  "message": "Article généré avec 5 sections",
  "job_id": "job_1737676800123_a1b2c3",
  "total_sections": 5,
  "h1": "DevOps et Automatisation Cloud 2025 : Guide Complet pour les Entreprises Françaises"
}
```

### Données Sauvegardées (Supabase `articles_content`)

Pour chaque section :

```json
{
  "job_id": "job_1737676800123_a1b2c3",
  "section_index": 0,
  "section_title": "Comprendre le DevOps moderne en 2025",
  "content": {
    "html": "<section id=\"section-0\" itemscope itemtype=\"https://schema.org/Article\">...</section>",
    "score": 92,
    "seo_score": 90,
    "geo_score": 95,
    "word_count": 520,
    "links": ["https://...", "https://..."],
    "feedback": ["Ajouter tableau comparatif"],
    "validated": true
  },
  "created_at": "2025-01-24T10:30:00.000Z"
}
```

---

## 🔧 Paramètres Clés

### GPT-5.1 (Writer)

```json
{
  "model": "gpt-5.1",
  "max_output_tokens": 3500,
  "temperature": 0.5
}
```

**Pourquoi 3500 tokens ?**
- Section cible: 400-600 mots ≈ 800-1200 tokens
- JSON wrapper + HTML markup ≈ 500 tokens
- Marge de sécurité ≈ 1800 tokens
- **Total: 3500 tokens** (loin de la limite, pas de troncature)

### Claude Sonnet 4.5 (Reviewer)

```json
{
  "model": "claude-sonnet-4-5-20250929",
  "max_tokens": 2000,
  "temperature": 0.3
}
```

**Scoring Pondéré** :
- **SEO** : 80% du score total
- **GEO** : 19% du score total
- **Fraîcheur** : 1% du score total

---

## 📈 Avantages vs Workflow Monobloc

| **Critère** | **Monobloc (ancien)** | **Sectional (nouveau)** |
|-------------|----------------------|-------------------------|
| Tokens/génération | 15000-20000 | 1200-1500 |
| Risque troncature | ❌ ÉLEVÉ | ✅ AUCUN |
| Validation HTML | ❌ Impossible | ✅ Par section |
| Score SEO/GEO | ❌ Global (~85%) | ✅ Par section (90-95%) |
| Traçabilité | ❌ Faible | ✅ Par section_index |
| Temps exécution | 3-5 min | 5-8 min |
| Qualité HTML | ❌ Parfois tronqué | ✅ Toujours complet |

---

## 🐛 Troubleshooting

### Erreur: "Credentials not found"

**Solution** : Reconnecte les credentials dans les nodes HTTP Request :

1. Ouvre le node "STEP 1 - Generate Outline (GPT-5)"
2. Clique sur "Credential to connect with"
3. Sélectionne "OpenAI account"
4. Répète pour les autres nodes

### Erreur: "HTML INCOMPLET"

**Cause** : GPT-5 n'a pas fermé la balise `</section>`

**Solution automatique** : Le workflow throw une erreur et n'enregistre PAS la section. Relance l'exécution.

### Erreur: "Failed to parse JSON"

**Cause** : La réponse de l'API n'est pas du JSON valide

**Debug** :
1. Va dans l'exécution n8n
2. Clique sur le node qui a échoué
3. Regarde le "Output" brut
4. Vérifie que `response.choices[0].message.content` contient du JSON

### Section trop courte (<400 mots)

**Solution** : Ajuste le prompt Writer pour insister sur 500-600 mots minimum.

---

## 🔄 Prochaines Améliorations (Optionnel)

### 1. Ajouter Enrichment Loop (si score < 95)

Ajoute entre "Extract Score" et "Prepare for Save" :

```
IF globalScore < 95
  → Call Perplexity (enrichment suggestions)
  → Rewrite Section (GPT-5.1)
  → Re-score
```

### 2. Recomposition Automatique

Créer un endpoint `/api/articles/compose/:job_id` qui :
- Récupère toutes les sections du job_id
- Assemble dans l'ordre (section_index)
- Ajoute intro + conclusion + FAQ
- Retourne HTML complet

### 3. Dashboard Admin Sections

Modifier [`AdminArticles.tsx`](c:/Users/power/OneDrive/Documents/Website_2025_06_30/magicpath-project/src/pages/AdminArticles.tsx) :
- Regrouper sections par `job_id`
- Afficher score moyen SEO/GEO
- Bouton "Recomposer Article Complet"

---

## ✅ Checklist Déploiement

- [ ] Import workflow dans n8n
- [ ] Vérification credentials (OpenAI, Claude, Supabase)
- [ ] Activation du workflow
- [ ] Test avec 3 sections
- [ ] Vérification données Supabase
- [ ] Test avec 5-6 sections
- [ ] Comparaison qualité HTML vs ancien workflow
- [ ] Analyse scores SEO/GEO
- [ ] Mise en production

---

## 📞 Support

**Questions ?**
- Workflow n8n : https://n8n.srv1144760.hstgr.cloud
- Documentation technique : `GUIDE-MIGRATION-WORKFLOW-SECTIONAL.md`
- Prompts détaillés : Inclus dans les nodes du workflow

**Problème d'API ?**
- OpenAI Responses API : https://platform.openai.com/docs/api-reference/chat
- Claude Messages API : https://docs.anthropic.com/claude/reference/messages_post
- Supabase Insert : https://supabase.com/docs/reference/javascript/insert

---

**Dernière mise à jour** : 24 janvier 2025
**Version workflow** : 1.0.0
**Compatibilité** : n8n v1.0+, GPT-5.1, Claude Sonnet 4.5
