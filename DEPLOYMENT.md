# 🚀 Déploiement n8n sur Vercel

## ✅ Ce qui est déployé

### **Solution Hybride Vercel + API**
Au lieu de déployer n8n directement (impossible sur Vercel), j'ai créé un système équivalent :

- **APIs Vercel** : `/api/n8n/workflows.ts` et `/api/n8n/execute.ts`
- **Exécution directe** : Appels directs aux APIs IA (Perplexity, OpenAI, Claude)
- **Interface identique** : Page `/workflow` comme si c'était n8n

## 🔧 Configuration Vercel

### 1. Variables d'environnement

Dans le dashboard Vercel, ajoute ces variables :

```bash
PERPLEXITY_API_KEY=pplx-your-key-here
OPENAI_API_KEY=sk-your-openai-key-here
ANTHROPIC_API_KEY=sk-ant-your-anthropic-key-here
```

### 2. Déploiement

```bash
# Push automatique via Git
git add .
git commit -m "deploy: n8n system on vercel"
git push origin main
```

Vercel détecte automatiquement et déploie !

## 🎯 URLs disponibles

### **Interface principale**
- **Workflow Manager** : `https://ton-site.vercel.app/workflow`

### **APIs disponibles**
- **GET /api/n8n/workflows** - Lister les workflows
- **POST /api/n8n/workflows** - Créer un workflow
- **POST /api/n8n/execute** - Exécuter le workflow

## 🧪 Test de fonctionnement

### Via l'interface web :
1. Va sur `/workflow`
2. Clique "Lancer le Workflow"
3. Les 3 agents s'exécutent en séquence

### Via API directe :
```javascript
// Test de l'exécution
fetch('/api/n8n/execute', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    workflowId: 'content-agents-workflow',
    data: { siteUrl: 'https://magicpath.ai' }
  })
})
.then(res => res.json())
.then(console.log);
```

## 🔄 Workflow d'exécution

### **Étape 1 : Agent Search Content**
- **API** : Perplexity (`llama-3.1-sonar-large-128k-online`)
- **Action** : Analyse le site et propose 3-5 sujets
- **Output** : JSON avec topics, keywords, audiences

### **Étape 2 : Agent Ghostwriting**
- **API** : OpenAI GPT-4
- **Action** : Rédige un article pour chaque sujet
- **Output** : HTML, meta-description, suggestions d'images

### **Étape 3 : Agent Review Content**
- **API** : Anthropic Claude-3
- **Action** : Note l'article (/100) + recommandations
- **Output** : Scores détaillés, points d'amélioration

## ⚡ Avantages de cette solution

### **vs n8n local :**
- ✅ Déployé sur Vercel (pas besoin de serveur)
- ✅ Scalable automatiquement
- ✅ SSL/HTTPS inclus
- ✅ Monitoring Vercel intégré

### **vs n8n Cloud :**
- ✅ Gratuit (pas de plan n8n payant)
- ✅ Contrôle total du code
- ✅ Intégré à ton projet existant

## 🛠️ Développement local

```bash
# Lancer en mode dev
npm run dev

# Tester les APIs
curl -X POST http://localhost:3000/api/n8n/execute \
  -H "Content-Type: application/json" \
  -d '{"workflowId":"content-agents-workflow","data":{"siteUrl":"https://magicpath.ai"}}'
```

## 📊 Monitoring

### **Logs Vercel**
- Dashboard Vercel > Functions > Logs
- Voir les exécutions en temps réel
- Erreurs API trackées automatiquement

### **Interface Workflow**
- Historique des exécutions
- Temps de réponse des agents
- Taux de succès par agent

## 🔒 Sécurité

### **Clés API**
- Stockées dans variables d'environnement Vercel
- Jamais exposées côté client
- Chiffrement automatique

### **Rate Limiting**
- Limites naturelles des APIs (Perplexity, OpenAI, Claude)
- Vercel Functions : 1000 exécutions/jour (hobby)

## 🚨 Dépannage

### **Erreur "API Key not configured"**
```bash
# Vérifier dans Vercel Dashboard > Settings > Environment Variables
PERPLEXITY_API_KEY=✅
OPENAI_API_KEY=✅
ANTHROPIC_API_KEY=✅
```

### **Timeout sur Vercel**
- Limite : 10s (Hobby), 25s (Pro)
- Solution : Optimiser les prompts IA pour des réponses plus courtes

### **Quota API dépassé**
- Vérifier les dashboards des fournisseurs IA
- Upgrader les plans si nécessaire

## 📈 Scaling

### **Pour plus de volume :**
1. **Vercel Pro** : 25s timeout, plus d'exécutions
2. **API Caching** : Cache les résultats similaires
3. **Queue System** : Traitement asynchrone avec Upstash Redis

### **Pour plus de complexité :**
1. **n8n Cloud** : Workflows visuels avancés
2. **Railway/DigitalOcean** : n8n server dédié
3. **Hybrid** : Garde l'interface, déporte n8n

## ✨ Prochaines étapes

- [ ] Système de cache pour éviter les doublons
- [ ] Base de données pour l'historique
- [ ] Webhooks pour intégrations externes
- [ ] Interface d'édition des prompts avancée

---

**🎉 Ton système n8n est maintenant déployé sur Vercel !**

Teste sur : `https://ton-site.vercel.app/workflow`