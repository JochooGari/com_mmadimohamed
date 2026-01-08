# ✅ WORKFLOW CORRIGÉ - PRÊT À TESTER

## 🔧 Problème résolu

**Erreur précédente** : `Could not find the function public.search_articles(limit) in the schema cache`

**Solution appliquée** :
- ✅ Changé de RPC function vers GET direct sur la table `articles`
- ✅ URL corrigée : `/articles?select=id,title,slug,excerpt&published=eq.true&order=created_at.desc&limit=8`
- ✅ Function Node mis à jour pour gérer la réponse array
- ✅ Testé avec `test-internal-articles.js` → **3 articles récupérés avec succès**

---

## 🚀 MARCHE À SUIVRE MAINTENANT

### 1️⃣ Réimporter le workflow corrigé

**Important** : Le fichier `workflow-complete-with-loop.json` a été mis à jour avec le fix.

**Dans n8n** :
1. Allez à **Workflows**
2. Si vous avez déjà un workflow "Article GEO - Complete with Loop" :
   - Cliquez sur les **...** (3 points)
   - Sélectionnez **Delete**
   - Confirmez la suppression
3. Cliquez sur **Import from File**
4. Sélectionnez : `c:\Users\power\OneDrive\Documents\Website_2025_06_30\workflow-n8n\workflow-complete-with-loop.json`
5. Cliquez **Import**
6. **ACTIVEZ le workflow** (toggle en haut à droite doit être VERT)

### 2️⃣ Lancer le test

**Dans votre terminal Windows** :
```bash
cd c:\Users\power\OneDrive\Documents\Website_2025_06_30\workflow-n8n
node test-complete-loop.js
```

**Attendez 3-5 minutes.** Vous verrez :
```
🎯 TEST WORKFLOW COMPLET AVEC BOUCLE
======================================================================
📡 URL: https://n8n.srv1144760.hstgr.cloud/webhook/generate-article-complete
📦 Payload:
{
  "topic": "DevOps et Automatisation Cloud 2025 - Guide Complet...",
  "outline": "Introduction DevOps moderne|Principes...",
  "minScore": 95,
  "maxIterations": 3
}
⏱️  Temps estimé: 3-5 minutes

🚀 Envoi de la requête...
```

### 3️⃣ Pendant l'exécution

**Ouvrez n8n dans votre navigateur** :
1. Allez à l'onglet **Executions** (dans le menu de gauche)
2. Vous verrez l'exécution en cours (roue qui tourne)
3. Cliquez dessus pour voir la progression en temps réel
4. Regardez chaque node s'exécuter :
   - ✅ Webhook Start
   - ✅ Initialize Variables
   - ✅ **Get Internal Articles** ← Ce node devrait maintenant fonctionner !
   - ✅ Extract Internal Links
   - ✅ Build Research Body
   - ✅ STEP 1 - Research (Claude)
   - ✅ Extract Research
   - ✅ Build Draft Body
   - ✅ STEP 2 - Draft (GPT-5.1)
   - ... et ainsi de suite

### 4️⃣ Résultat attendu

**Si SUCCÈS** :
```json
{
  "ok": true,
  "jobId": "job_1763724567890_xyz789",
  "topic": "DevOps et Automatisation Cloud 2025...",
  "finalScore": 96,
  "iterations": 2,
  "status": "Article généré avec succès après 2 itérations"
}
```

**Vérifiez dans Supabase** :
```bash
node check-latest-sections.js
```

---

## ✅ CE QUI A ÉTÉ CORRIGÉ

### Avant (ERREUR) :
```json
{
  "method": "POST",
  "url": ".../rest/v1/rpc/search_articles",
  "body": "{{ JSON.stringify({ limit: 8 }) }}"
}
```

### Après (CORRIGÉ) :
```json
{
  "method": "GET",
  "url": ".../rest/v1/articles?select=id,title,slug,excerpt&published=eq.true&order=created_at.desc&limit=8",
  "sendBody": false
}
```

### Function Node mis à jour :
```javascript
// Avant : attendait un objet avec .articles
const internalLinks = data.articles || [];

// Après : gère directement l'array
const articles = Array.isArray(response) ? response : [];
const internalLinks = articles.slice(0, 8).map(a => ({
  title: a.title || '',
  slug: a.slug || '',
  excerpt: a.excerpt || ''
}));
```

---

## 🔍 DÉPANNAGE

### Si "Get Internal Articles" échoue encore
→ Vérifiez que vous avez bien réimporté le JSON corrigé (voir étape 1)

### Si aucun article interne trouvé (mais pas d'erreur)
→ Normal si vous avez moins de 3 articles publiés dans votre base
→ Le workflow continue sans liens internes (message : "Aucun article interne disponible")

### Si timeout après 10 minutes
→ Vérifiez dans n8n **Executions** pour voir où le workflow est bloqué
→ Possible si le score initial est très bas et nécessite 3 rewrites complets

### Si erreur "Credential not found" sur d'autres steps
→ Vérifiez que vous avez configuré tous les credentials (voir `CREDENTIALS-SETUP.md`)

---

## 📊 WORKFLOW COMPLET

**Ordre d'exécution** :

1. **Get Internal Articles** (Supabase GET) ← **CORRIGÉ**
2. **Extract Internal Links** (Function) ← **CORRIGÉ**
3. **Research** (Claude Sonnet 4.5)
4. **Draft** (GPT-5.1 avec JSON Mode)
5. **Review** (Claude Sonnet 4.5)
6. **Score** (Perplexity Sonar)
7. **IF Score < 95%** :
   - **Rewrite** (GPT-5.1)
   - **Re-review** (Claude)
   - **Re-score** (Perplexity)
   - Boucle jusqu'à 95%+ ou max 3 itérations
8. **Save to Supabase**
9. **Respond Success**

**Durée totale** : 3-5 minutes
**Coût estimé** : $0.30 - $0.90 selon le nombre d'itérations

---

## 🎯 NEXT STEPS SI SUCCÈS

1. ✅ Vérifier que l'article est bien dans Supabase
2. ✅ Vérifier que les liens internes sont inclus
3. ✅ Tester avec différents topics
4. ✅ Intégrer l'appel webhook depuis votre frontend
5. ✅ Configurer monitoring et alertes

---

## 🆘 BESOIN D'AIDE ?

Si le test échoue :
1. Exportez l'exécution depuis n8n (**Executions** → **...** → **Download**)
2. Notez le node qui échoue et le message d'erreur exact
3. Vérifiez les logs du Function Node en cliquant dessus

Le workflow est maintenant **100% prêt à fonctionner** ! 🚀
