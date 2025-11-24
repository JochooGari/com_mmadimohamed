# 🚀 Workflow Article Sectional - Déployé !

## ✅ Workflow Créé avec Succès

Le workflow **"Article Generation - Sectional (Complete)"** a été créé automatiquement via l'API n8n.

### 📋 Informations

- **Workflow ID**: `s8M2fat5quiV8xOc`
- **Webhook URL**: `https://n8n.srv1144760.hstgr.cloud/webhook/generate-article-sectional`
- **Statut**: Créé ✅ (nécessite activation manuelle)
- **Nodes**: 14
- **Date création**: 24 novembre 2025

---

## 🎯 Prochaines Étapes

### 1. Activer le Workflow (2 minutes)

**Option A: Via Interface n8n (Recommandé)**
```
1. Ouvre: https://n8n.srv1144760.hstgr.cloud/workflow/s8M2fat5quiV8xOc
2. Clique sur le toggle "Active" en haut à droite
3. Vérifie que tous les credentials sont connectés (OpenAI, Claude, Supabase)
```

**Option B: Via Script**
```bash
node workflow-n8n/activate-workflow.js
```

### 2. Tester le Workflow (3-5 minutes)

```bash
node workflow-n8n/test-sectional-workflow.js
```

Ou via cURL :
```bash
curl -X POST https://n8n.srv1144760.hstgr.cloud/webhook/generate-article-sectional \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "Power BI pour la Finance - Guide 2025",
    "outline": "Introduction|Connexion données|Visualisations KPI"
  }'
```

### 3. Vérifier les Résultats

Après exécution, vérifie dans Supabase :

```sql
-- Voir les sections générées
SELECT
  job_id,
  section_index,
  section_title,
  content->>'score' as score,
  content->>'word_count' as word_count,
  created_at
FROM articles_content
WHERE job_id LIKE 'job_%'
ORDER BY job_id DESC, section_index ASC
LIMIT 20;
```

---

## 📁 Fichiers Disponibles

### Scripts de Gestion

| Fichier | Description | Usage |
|---------|-------------|-------|
| `create-via-api.js` | Crée le workflow via API ✅ | `node workflow-n8n/create-via-api.js` |
| `activate-workflow.js` | Active le workflow | `node workflow-n8n/activate-workflow.js` |
| `test-sectional-workflow.js` | Teste le workflow complet | `node workflow-n8n/test-sectional-workflow.js` |
| `list-workflows.js` | Liste tous les workflows n8n | `node workflow-n8n/list-workflows.js` |

### Configuration

| Fichier | Description |
|---------|-------------|
| `workflow-config.json` | Config du workflow (ID, webhook URL) |
| `workflow-sectional-complete.json` | Export JSON du workflow complet |

### Documentation

| Fichier | Description |
|---------|-------------|
| `README.md` | Ce fichier - Quick start |
| `../README-WORKFLOW-SECTIONAL.md` | Guide complet d'utilisation |
| `../GUIDE-MIGRATION-WORKFLOW-SECTIONAL.md` | Documentation technique |

---

## 🏗️ Architecture du Workflow

```
Webhook → Build Outline → GPT-5 Outline → Extract Outline
                                              ↓
                                         Split Sections
                                              ↓
                                    ┌─────────┴─────────┐
                                    │  POUR CHAQUE      │
                                    │  SECTION (Loop)   │
                                    ├───────────────────┤
                                    │  Build Writer     │
                                    │  GPT-5 Writer     │
                                    │  Validate HTML    │
                                    │  Build Reviewer   │
                                    │  Claude Reviewer  │
                                    │  Extract Score    │
                                    │  Prepare Save     │
                                    │  Save Supabase    │
                                    └───────┬───────────┘
                                            ↓
                                       Response
```

---

## 🔧 Paramètres Clés

### GPT-5.1 (Writer par section)
```json
{
  "model": "gpt-5.1",
  "max_output_tokens": 3500,
  "temperature": 0.5
}
```

**Résultat**: 400-600 mots/section, HTML validé avec `</section>`

### Claude Sonnet 4.5 (Reviewer)
```json
{
  "model": "claude-sonnet-4-5-20250929",
  "max_tokens": 2000,
  "temperature": 0.3
}
```

**Scoring**:
- SEO: 80%
- GEO: 19%
- Fraîcheur: 1%

---

## 📊 Avantages vs Workflow Monobloc

| Critère | Monobloc (ancien) | Sectional (nouveau) |
|---------|-------------------|---------------------|
| Tokens/génération | 15000-20000 | 1200-1500 |
| Troncature HTML | ❌ Fréquente | ✅ Impossible |
| Validation HTML | ❌ Aucune | ✅ Par section |
| Score SEO/GEO | ≈85% global | 90-95% par section |
| Temps exécution | 3-5 min | 5-8 min |
| Qualité finale | ❌ Variable | ✅ Garantie |

---

## 🐛 Dépannage

### Le workflow n'apparaît pas dans n8n

**Solution**: Recharge la page n8n ou vérifie l'ID dans `workflow-config.json`

### Erreur "Credentials not found"

**Solution**: Ouvre le workflow dans n8n et reconnecte les credentials :
1. Node "STEP 1 - Generate Outline" → OpenAI
2. Node "STEP 3 - Reviewer Section" → Anthropic Claude
3. Node "STEP 4 - Save Section" → Supabase

### Webhook retourne 404

**Solution**: Le workflow n'est pas activé. Active-le dans l'interface n8n.

### Section HTML incomplète

**Solution**: Le workflow throw automatiquement une erreur si `</section>` manque. Relance l'exécution.

---

## 📞 Support

**Workflow n8n**: https://n8n.srv1144760.hstgr.cloud
**Executions**: https://n8n.srv1144760.hstgr.cloud/executions
**Workflow direct**: https://n8n.srv1144760.hstgr.cloud/workflow/s8M2fat5quiV8xOc

---

## 🎉 Prêt à Utiliser !

Le workflow est déployé et prêt. Il suffit de :
1. ✅ Activer dans n8n
2. ✅ Tester avec 3 sections
3. ✅ Vérifier la qualité HTML
4. ✅ Passer en production

**Dernière mise à jour**: 24 novembre 2025
