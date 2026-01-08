# 🧪 TEST PERPLEXITY - WORKFLOW MINIMAL

## 📋 Ce qui a été créé

**Workflow de test** : `workflow-test-perplexity.json`

**Structure** :
1. Webhook (trigger)
2. Set Test Article (article HTML de test)
3. Build Score Request (construit le JSON pour Perplexity)
4. **Perplexity Score** (appel API Perplexity)
5. Extract Score (extrait et formatte le résultat)

**Avantage** : Workflow minimal pour tester uniquement Perplexity sans gaspiller de tokens sur Claude/GPT-5.

---

## 🚀 MARCHE À SUIVRE

### 1. Importez le workflow dans n8n

1. Ouvrez n8n → **Workflows**
2. **Import from File**
3. Sélectionnez `workflow-test-perplexity.json`
4. **Import**

### 2. Configurez le credential Perplexity

**Sur le node "Perplexity Score"** :

1. Cliquez sur le node
2. **Authentication** : Generic Credential Type → Header Auth
3. **Header Auth** : Sélectionnez `Header Auth account` (celui que vous avez créé)
4. **Vérifiez** :
   - Send Body: ✅ activé
   - Content Type: Raw
   - Raw Content Type: application/json
   - Body: `={{ $json.apiBody }}`

### 3. Activez le workflow

Toggle en haut à droite → **VERT** ✅

### 4. Testez

```bash
cd workflow-n8n
node test-perplexity-simple.js
```

---

## ✅ Résultat attendu

```
🧪 TEST PERPLEXITY API SIMPLE
============================================================

📡 URL: https://n8n.srv1144760.hstgr.cloud/webhook/test-perplexity
⏱️  Temps estimé: 5-10 secondes

🚀 Envoi de la requête...

📊 Status: 200
⏱️  Durée: 6.2s

📄 Réponse:

{
  "success": true,
  "avgScore": 78,
  "seoScore": 75,
  "geoScore": 81,
  "breakdown": {
    "structure": 80,
    "content": 75,
    "keywords": 70,
    "links": 60,
    "engagement": 85
  },
  "strengths": [
    "Structure H1-H2 claire",
    "Listes à puces bien utilisées"
  ],
  "weaknesses": [
    "Manque de liens internes",
    "Pas assez de mots-clés stratégiques"
  ]
}

✅ TEST RÉUSSI !

📊 Score moyen: 78/100
   SEO: 75/100
   GEO: 81/100
```

---

## ❌ Si erreur "Credentials not found"

### Solution 1 : Vérifier le credential

Dans n8n → **Credentials** :
1. Trouvez `Header Auth account`
2. Cliquez pour éditer
3. Vérifiez :
   - **Name** : `Authorization`
   - **Value** : `Bearer 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`
4. **Save**

### Solution 2 : Recréer le credential

Si ça ne marche toujours pas :
1. **Supprimez** l'ancien credential "Header Auth account"
2. **Créez-en un nouveau** :
   - Type: Header Auth
   - Name: `Perplexity API` (nouveau nom)
   - Header Name: `Authorization`
   - Header Value: `Bearer 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`
3. **Dans le workflow test**, sélectionnez ce nouveau credential
4. **Save** et testez

---

## 📊 Vérifier l'exécution dans n8n

1. Allez à **Executions**
2. Cliquez sur la dernière exécution
3. Regardez chaque node :
   - ✅ Webhook : Reçu
   - ✅ Set Test Article : Article HTML créé
   - ✅ Build Score Request : JSON construit
   - ✅ Perplexity Score : **C'est ici que ça peut échouer**
   - ✅ Extract Score : Score extrait

Si "Perplexity Score" est rouge (❌), cliquez dessus pour voir l'erreur exacte.

---

## 🎯 Une fois que ça marche

**Copiez exactement la configuration du node "Perplexity Score"** vers le workflow principal "Full Workflow" :

1. Dans le workflow test, cliquez sur "Perplexity Score"
2. Notez la configuration exacte
3. Ouvrez "Full Workflow"
4. Cliquez sur "STEP 4 - Score (Perplexity)"
5. Appliquez la même configuration
6. Save

**Testez le workflow complet** :
```bash
node test-complete-loop.js
```

---

## 💡 Debug

Si vous avez toujours "Credentials not found" même après avoir tout vérifié, essayez :

**Test direct avec curl** (pour vérifier que l'API key est valide) :

```bash
curl -X POST https://api.perplexity.ai/chat/completions \
  -H "Authorization: Bearer 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" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "sonar",
    "messages": [{
      "role": "user",
      "content": "Test simple"
    }],
    "max_tokens": 50
  }'
```

Si curl fonctionne mais pas n8n, c'est un problème de configuration du credential dans n8n.

---

## 🔑 Points importants

- ✅ Le workflow de test est **minimal** (5 nodes)
- ✅ Pas de gaspillage de tokens Claude/GPT-5
- ✅ Teste **uniquement** Perplexity
- ✅ Article de test pré-rempli
- ✅ Résultat clair et formaté

**Coût du test** : ~$0.01 (seulement Perplexity Sonar)
