# 🚀 Test Rapide du Workflow Complet

## ✅ Étapes de test

### 1. Réimporter le workflow corrigé dans n8n

1. Dans n8n, allez à **Workflows** → **Import from File**
2. Sélectionnez `workflow-complete-with-loop.json`
3. Si le workflow existe déjà, **supprimez l'ancien** avant d'importer
4. **Activez** le workflow (toggle vert en haut à droite)

### 2. Vérifier que le workflow est actif

**URL du webhook**: `https://n8n.srv1144760.hstgr.cloud/webhook/generate-article-complete`

Test rapide (doit retourner 404 mais confirme que le webhook écoute) :
```bash
curl https://n8n.srv1144760.hstgr.cloud/webhook/generate-article-complete
```

### 3. Lancer le test complet

```bash
cd c:\Users\power\OneDrive\Documents\Website_2025_06_30\workflow-n8n
node test-complete-loop.js
```

**Attendez 3-5 minutes** pour la réponse complète.

### 4. Vérifier la progression dans n8n

Pendant l'exécution :
1. Ouvrez n8n
2. Allez à l'onglet **Executions**
3. Cliquez sur l'exécution en cours
4. Regardez les nodes s'exécuter un par un

### 5. Vérifier les résultats dans Supabase

Une fois terminé :
```bash
node check-latest-sections.js
```

Ou directement dans Supabase Studio :
```sql
SELECT job_id, section_title, LENGTH(html_content) as size, created_at
FROM articles_content
ORDER BY created_at DESC
LIMIT 10;
```

---

## 🔍 Ce que vous devriez voir

### ✅ Succès attendu :

```json
{
  "ok": true,
  "jobId": "job_1763724240781_abc123",
  "topic": "DevOps et Automatisation Cloud 2025...",
  "finalScore": 96,
  "iterations": 2,
  "status": "Article généré avec succès"
}
```

### 📊 Workflow exécuté :

1. ✅ **Get Internal Articles** → Récupère 3-8 articles publiés
2. ✅ **Research (Claude)** → 10 points clés + données 2025
3. ✅ **Draft (GPT-5.1)** → Article complet 2500+ mots
4. ✅ **Review (Claude)** → Amélioration SEO/structure
5. ✅ **Score (Perplexity)** → Évaluation sur 100 points
6. ✅ **IF Score < 95%** :
   - **Rewrite (GPT-5.1)** → Corrections
   - **Re-review** → Nouvelle amélioration
   - **Re-score** → Nouvelle évaluation
   - **Boucle max 3 fois**
7. ✅ **Save to Supabase** → Sauvegarde finale

---

## ❌ Dépannage rapide

### Erreur "Webhook not found"
→ Le workflow n'est pas actif. Activez-le dans n8n (toggle vert).

### Erreur "Could not find function search_articles"
→ Vous utilisez l'ancien workflow. Réimportez `workflow-complete-with-loop.json`.

### Timeout après 10 minutes
→ Normal si le score initial est très bas. Vérifiez dans **Executions** si le workflow continue.

### "Credential not found"
→ Vérifiez que vous avez configuré :
- **Anthropic account** (pour Research et Review)
- **OpenAI account** (pour Draft et Rewrite)
- **Perplexity API** (Header Auth pour Score)

### Aucun article interne trouvé
→ Normal si vous avez < 3 articles publiés. Le workflow continue sans liens internes.

---

## 📊 Coûts estimés

**Par article généré :**
- Score obtenu du 1er coup (95%+) : **~$0.30**
- Avec 1 rewrite : **~$0.60**
- Avec 2 rewrites (max) : **~$0.90**

**Temps d'exécution :**
- Score obtenu du 1er coup : **~2 minutes**
- Avec rewrites : **3-5 minutes**

---

## 🎯 Prochaines étapes si succès

1. **Intégrez à votre frontend** :
   - Appelez le webhook depuis `/pages/WorkflowPage.tsx`
   - Affichez la progression en temps réel
   - Stockez le jobId pour récupération ultérieure

2. **Ajoutez le monitoring** :
   - Webhook de notification Slack/Discord quand article terminé
   - Dashboard de statistiques (scores moyens, temps d'exécution)

3. **Optimisez les prompts** :
   - Ajustez les prompts dans les Function Nodes
   - Testez différents minScore (90, 92, 95)
   - Ajustez maxIterations selon vos besoins

4. **Production** :
   - Configurez des alertes sur échecs
   - Ajoutez retry logic
   - Implémentez rate limiting côté frontend

---

## 🆘 Besoin d'aide ?

Si vous rencontrez un problème :
1. Exportez l'exécution échouée depuis n8n (**Executions** → **...** → **Download**)
2. Vérifiez les logs de chaque Function Node
3. Testez les credentials avec curl (voir `CREDENTIALS-SETUP.md`)
