# 🔧 FIX PERPLEXITY CREDENTIALS

## 🎉 EXCELLENT PROGRÈS !

### ✅ Ce qui fonctionne maintenant

**Exécution 25** :
- ✅ Get Internal Articles (corrigé automatiquement)
- ✅ Research (Claude)
- ✅ **Draft (GPT-5.1)** - Modèle corrigé vers `gpt-5.1` ✨
- ✅ Review (Claude)
- ✅ 15 nodes exécutés avec succès

### ❌ Dernier problème

**Node: STEP 4 - Score (Perplexity)**
```
Error: Credentials not found
```

Le node Perplexity utilise "Header Auth" mais n'a pas de credential configuré dans n8n.

---

## 🔑 Solution : Configurer les credentials Perplexity dans n8n

### Méthode 1 : Via l'interface n8n (RECOMMANDÉ) ⭐

1. **Ouvrez n8n** → `https://n8n.srv1144760.hstgr.cloud`

2. **Allez à "Credentials"** (menu de gauche)

3. **Créez un nouveau credential** :
   - Cliquez sur **+ New Credential**
   - Type: **Header Auth**
   - Name: `Perplexity API`

4. **Configurez le header** :
   ```
   Name: Authorization
   Value: Bearer [VOTRE_API_KEY_PERPLEXITY]
   ```

5. **Sauvegardez**

6. **Retournez au workflow "Full Workflow"**

7. **Cliquez sur le node "STEP 4 - Score (Perplexity)"**

8. **Dans "Credential to connect with"** :
   - Sélectionnez `Perplexity API` (le credential que vous venez de créer)

9. **Save** le workflow

10. **Testez** :
   ```bash
   node test-complete-loop.js
   ```

---

### Méthode 2 : Désactiver temporairement le scoring (WORKAROUND)

Si vous n'avez pas l'API key Perplexity pour le moment, vous pouvez temporairement :

1. **Modifier le node "Extract Score & Decide"**
2. **Forcer un score de 95%** pour éviter l'appel à Perplexity :

```javascript
// Extract score and decide next step
const response = $input.all()[0].json;
const prev = $node['Extract Review'].json;

// TEMPORAIRE : Force score 95% sans appel API
const scoreData = {
  scores: { seo: 95, geo: 95 },
  breakdown: { structure: 95, content: 95, keywords: 95, links: 95, engagement: 95 },
  strengths: ['Article bien structuré', 'Contenu riche'],
  weaknesses: [],
  fixes: []
};

const avgScore = 95;
const iteration = prev.currentIteration + 1;
const shouldRewrite = false; // Force direct save

return {
  json: {
    ...prev,
    currentScore: avgScore,
    currentIteration: iteration,
    scoreBreakdown: scoreData,
    shouldRewrite: shouldRewrite,
    status: 'ready_to_save'
  }
};
```

Cela permet de tester le reste du workflow sans Perplexity.

---

## 📊 Résumé des corrections appliquées

### 1. ✅ Get Internal Articles (CORRIGÉ)
```
POST /rpc/search_articles → GET /articles?select=...
```
**Status** : ✅ Fonctionne

### 2. ✅ GPT-5 Model Name (CORRIGÉ)
```
gpt-5-pro-preview → gpt-5.1
```
**Status** : ✅ Fonctionne (Draft généré avec succès)

### 3. ⏳ Perplexity Credentials (EN COURS)
```
Credentials not found
```
**Action requise** : Configurer Header Auth dans n8n

---

## 🎯 Prochaines étapes

### Une fois les credentials Perplexity configurés :

1. **Testez le workflow complet** :
   ```bash
   node test-complete-loop.js
   ```

2. **Vérifiez l'exécution** :
   ```bash
   node check-executions.js
   ```

3. **Si score < 95%**, le workflow :
   - Appellera GPT-5.1 pour réécrire
   - Boucle jusqu'à 3 fois
   - Sauvegarde dans Supabase

4. **Vérifiez dans Supabase** :
   ```bash
   node check-latest-sections.js
   ```

---

## 📁 Scripts disponibles

- `fix-workflow-api.js` - Corrige "Get Internal Articles"
- `fix-gpt5-model.js` - Corrige le nom du modèle GPT-5
- `check-executions.js` - Vérifie l'état des exécutions
- `test-complete-loop.js` - Teste le workflow complet
- `check-latest-sections.js` - Vérifie Supabase

---

## 🎉 Succès partiel

**Workflow fonctionnel jusqu'au scoring** :
- ✅ Récupération articles internes
- ✅ Recherche Claude
- ✅ **Draft GPT-5.1** (2500+ mots générés)
- ✅ Review Claude

**Il ne manque que** :
- ⏳ Credentials Perplexity pour le scoring

Une fois configuré, le workflow sera **100% opérationnel** ! 🚀
