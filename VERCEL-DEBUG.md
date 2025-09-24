# 🔧 Guide de Debug Vercel - MCP n8n

## 🚨 Erreurs Courantes

### **404 Errors**
```
404: NOT_FOUND
Code: NOT_FOUND
ID: cdg1::hwwtq-1758752740046-ae1f3c8946ef
```

### **Browser Console Errors**
```
admin:1 Unchecked runtime.lastError: The message port closed before a response was received.
admin:1 Failed to load resource: the server responded with a status of 404 ()
```

## ✅ Corrections Appliquées

### **1. Structure API nettoyée**
- ❌ Supprimé `app/api/` (App Router conflictuel)
- ✅ Gardé `api/` (Pages Router stable)
- ✅ Simplifié les handlers MCP

### **2. Routes API disponibles**
```
GET  /api/test              - Test de base
GET  /api/mcp/initialize    - MCP server info
POST /api/mcp/tools/list    - Liste des outils MCP
POST /api/mcp/tools/call    - Exécution d'outils
GET  /api/n8n/workflows     - Workflows n8n
POST /api/n8n/execute       - Exécution n8n
```

### **3. Tests à effectuer**

#### **Test 1: API de base**
```bash
curl https://ton-domaine.vercel.app/api/test
```
**Résultat attendu:**
```json
{
  "message": "✅ API is working!",
  "timestamp": "2024-09-24T...",
  "vercel": { "region": "cdg1" }
}
```

#### **Test 2: MCP Initialize**
```bash
curl https://ton-domaine.vercel.app/api/mcp/initialize
```
**Résultat attendu:**
```json
{
  "protocolVersion": "2024-11-05",
  "serverInfo": {
    "name": "magicpath-n8n-server",
    "version": "1.0.0"
  }
}
```

#### **Test 3: Interface Web**
- ✅ `/workflow` - Interface n8n
- ✅ `/mcp` - Dashboard MCP

## 🔍 Debug Steps

### **1. Vérifier les Logs Vercel**
1. Dashboard Vercel > Ton projet
2. **Functions** > **View Function Logs**
3. Regarder les erreurs en temps réel

### **2. Tester les APIs une par une**
```bash
# Test de base
curl -v https://ton-domaine.vercel.app/api/test

# Test MCP
curl -v https://ton-domaine.vercel.app/api/mcp/initialize

# Test avec POST
curl -X POST https://ton-domaine.vercel.app/api/mcp/tools/list \
  -H "Content-Type: application/json"
```

### **3. Variables d'environnement**
Vérifier dans Vercel Dashboard > Settings > Environment Variables :
```
PERPLEXITY_API_KEY=pplx-...
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
```

## 🛠️ Troubleshooting

### **Si `/api/test` ne fonctionne pas**
- Problème de déploiement de base
- Vérifier que le build Vercel s'est bien terminé

### **Si `/api/mcp/*` ne fonctionne pas**
- Problème avec les routes dynamiques `[...path].ts`
- Vérifier les logs Vercel pour les erreurs

### **Si interface `/mcp` plante**
- Problème frontend
- Vérifier la console browser pour les erreurs JS

### **Si tout fonctionne en local mais pas en prod**
- Variables d'environnement manquantes
- Configuration Vercel incorrecte

## 🔄 Commandes de Re-deployment

```bash
# Force redeploy
git add . && git commit -m "fix: debug vercel deployment" && git push

# Build local test
npm run build

# Vérifier les APIs localement
npm run dev
# Puis tester http://localhost:3000/api/test
```

## 📞 URLs à tester

### **Production**
- **API Test**: https://ton-domaine.vercel.app/api/test
- **MCP Server**: https://ton-domaine.vercel.app/api/mcp/initialize
- **Dashboard MCP**: https://ton-domaine.vercel.app/mcp
- **Interface n8n**: https://ton-domaine.vercel.app/workflow

### **Status Check**
Si toutes ces URLs répondent ✅, le serveur MCP fonctionne !

---

**🎯 Objectif**: Toutes les APIs doivent répondre sans 404