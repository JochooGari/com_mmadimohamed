# Guide d'installation N8N - Workflow Article GEO

## 📋 Prérequis

✅ VPS n8n Hostinger installé et accessible
✅ Credentials Claude (Anthropic) configurés dans n8n
✅ API déployée sur Vercel: `https://com-mmadimohamed.vercel.app/api/n8n-geo`

## 🔧 Configuration des Credentials dans n8n

### 1. Anthropic (Claude) - ✅ DÉJÀ CONFIGURÉ
- Type: `Anthropic`
- API Key: `sk-ant-...`
- Base URL: `https://api.anthropic.com`

### 2. OpenAI (GPT-4/GPT-5)
**Étapes:**
1. Dans n8n, allez à **Credentials** → **Add Credential**
2. Cherchez et sélectionnez **OpenAI**
3. Remplissez:
   - **API Key**: Votre clé OpenAI (`sk-proj-...`)
   - **Base URL**: `https://api.openai.com/v1`
4. **Test** puis **Save**

### 3. Supabase
**Option A - Credential Supabase natif (recommandé):**
1. Credentials → Add Credential → **Supabase**
2. Remplissez:
   - **Host**: `xroduivvgnviqjdvehuw.supabase.co`
   - **Service Role Secret**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhyb2R1aXZ2Z252aXFqZHZlaHV3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDg1Njg5NywiZXhwIjoyMDY2NDMyODk3fQ.lJe0rcdAJYdS4VjcR5IV_kqA9lEUJoWq8VKsSD5EUV0`

**Option B - HTTP Header Auth:**
1. Credentials → Add Credential → **Header Auth**
2. Name: `Supabase Auth`
3. Remplissez:
   - **Header Name**: `apikey`
   - **Header Value**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (service role key)
4. Ajoutez un second header:
   - **Header Name**: `Authorization`
   - **Header Value**: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### 4. Perplexity (Optionnel - pour scoring)
1. Credentials → Add Credential → **Header Auth**
2. Name: `Perplexity API`
3. Remplissez:
   - **Header Name**: `Authorization`
   - **Header Value**: `Bearer VOTRE_CLE_PERPLEXITY`

---

## 📥 Import du Workflow

### Étape 1: Importer le fichier JSON
1. Dans n8n, cliquez sur **Workflows** → **Import from File**
2. Sélectionnez le fichier: `workflow-n8n-article-generation.json`
3. Cliquez sur **Import**

### Étape 2: Configurer les Credentials
Le workflow importé aura des credentials manquants (icônes rouges). Pour chaque node:

**Node "STEP 1 - Research (Claude)":**
- Cliquez sur le node
- Dans **Credential to connect with**, sélectionnez votre credential **Anthropic**

**Node "STEP 2 - Draft Introduction (GPT-4)":**
- Credential: Sélectionnez votre credential **OpenAI**
- Ou configurez **Generic Credential Type** → **HTTP Header Auth**
  - Header Name: `Authorization`
  - Header Value: `Bearer VOTRE_CLE_OPENAI`

**Node "Save to Supabase":**
- Si vous utilisez Supabase credential natif, sélectionnez-le
- Sinon, utilisez **HTTP Header Auth** configuré précédemment

**Node "STEP 3 - Review (Claude)":**
- Credential: Sélectionnez votre credential **Anthropic**

### Étape 3: Activer le Workflow
1. Cliquez sur le toggle en haut à droite: **Inactive** → **Active**
2. Le webhook devient disponible
3. Copiez l'URL du webhook depuis le node "Webhook - Start Article"

**Format de l'URL:**
```
https://votre-instance-n8n.com/webhook/start-article
```

---

## 🧪 Test du Workflow

### Méthode 1: Test depuis le script Node.js

```bash
# Définir l'URL du webhook
export N8N_WEBHOOK_URL="https://votre-n8n.com/webhook/start-article"

# Lancer le test
node test-n8n-workflow.js
```

### Méthode 2: Test manuel avec curl

```bash
curl -X POST "https://votre-n8n.com/webhook/start-article" \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "DevOps et Automatisation Cloud 2025",
    "outline": "Introduction|Principes|IaC|CI/CD|FAQ",
    "minScore": 95,
    "maxIterations": 3
  }'
```

### Méthode 3: Test depuis n8n UI
1. Ouvrez le workflow dans n8n
2. Cliquez sur le node "Webhook - Start Article"
3. Cliquez sur **Listen for Test Event**
4. Envoyez une requête POST depuis Postman/Insomnia avec le payload ci-dessus
5. Vérifiez l'exécution dans n8n

---

## 📊 Structure du Workflow

```
Webhook Start
    ↓
Create Job Context (génère jobId unique)
    ↓
STEP 1: Research (Claude Sonnet 4.5)
    ↓
Process Research (extraction)
    ↓
STEP 2: Draft Introduction (GPT-4)
    ↓
Process Introduction (parsing JSON)
    ↓
Save to Supabase (table articles_content)
    ↓
STEP 3: Review (Claude Sonnet 4.5)
    ↓
Process Review (extraction améliorations)
    ↓
Respond to Webhook (retourne jobId + status)
```

---

## 🔍 Vérification des Résultats

### Dans Supabase
```sql
-- Voir les dernières sections créées
SELECT
  job_id,
  section_title,
  section_index,
  created_at
FROM articles_content
ORDER BY created_at DESC
LIMIT 10;
```

### Avec le script d'analyse
```bash
# Analyser un job spécifique
node analyze-job.js job_1763754539613_pz8fj9

# Lister tous les jobs récents
node list-recent-storage-jobs.js
```

---

## 🚀 Prochaines Étapes

1. ✅ **Workflow de base fonctionnel** (Research → Draft → Review)
2. 🔄 **Ajouter les étapes manquantes:**
   - Draft Section 1, 2, 3, 4 (boucle)
   - Enrichment (liens internes)
   - Score (Perplexity)
   - Rewrite (si score < 95)
   - Assemble Article (fusion finale)
3. 📝 **Intégration complète:**
   - Sauvegarder dans `public.articles`
   - Générer le HTML final
   - Assigner `author_id` automatiquement

---

## ❓ Troubleshooting

### Erreur "Unauthorized" sur Supabase
- Vérifiez que vous utilisez bien la **Service Role Key** (pas l'anon key)
- Format: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### Erreur "Invalid JSON" sur GPT-4
- Vérifiez que `response_format: {"type": "json_object"}` est bien configuré
- Le prompt système doit dire "réponds en JSON"

### Webhook timeout
- Vérifiez les credentials de chaque node
- Testez chaque étape individuellement avec "Execute Node"

### Section non sauvegardée
- Vérifiez la structure de la table `articles_content`:
  - Colonnes: `job_id`, `section_index`, `section_id`, `section_title`, `content` (JSONB)
- Vérifiez les RLS policies sur la table

---

## 📞 Support

- **Logs n8n**: Workflow → Executions → Voir les détails
- **Logs Vercel**: Dashboard Vercel → Functions → Logs
- **Logs Supabase**: Dashboard → Table Editor → Filter

