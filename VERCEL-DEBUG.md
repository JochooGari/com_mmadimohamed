# 🔧 Guide de Debug Vercel - MCP n8n

## 🚨 Erreurs Courantes & Solutions

### **❌ Erreur 404 MCP - RÉSOLU**
```
404: NOT_FOUND
Code: NOT_FOUND
ID: cdg1::zfl2q-1758753634026-c0df55e8033d
```

**🔍 CAUSE IDENTIFIÉE :**
- **Mauvais projet Vercel** : Les modifications étaient déployées sur le mauvais projet
- **Project ID incorrect** : Utilisation du mauvais project ID dans les déploiements
- **Domaine OVH** : Le domaine `mmadimohamed.fr` pointait vers un autre projet

**✅ SOLUTION APPLIQUÉE :**
1. **Identification du bon projet** : `prj_giGdfhxL07bq8KarHz4Z5zVqzrOQ`
2. **Link correct du projet** : `npx vercel link --project prj_giGdfhxL07bq8KarHz4Z5zVqzrOQ --yes`
3. **Déploiement sur le bon projet** : Les endpoints MCP maintenant fonctionnels
4. **Configuration domaine OVH** : Parfaitement compatible avec Vercel

### **Browser Console Errors**
```
admin:1 Unchecked runtime.lastError: The message port closed before a response was received.
admin:1 Failed to load resource: the server responded with a status of 404 ()
```
**Status :** ✅ Résolu après déploiement sur le bon projet

## ✅ Corrections Appliquées

### **1. Structure API nettoyée**
- ❌ Supprimé `app/api/` (App Router conflictuel)
- ✅ Gardé `api/` (Pages Router stable)
- ✅ Simplifié les handlers MCP

### **2. Configuration MCP n8n Complète**

#### **📁 Structure des fichiers :**
```
magicpath-project/
├── api/
│   ├── mcp/
│   │   └── [...path].ts          # ✅ Handler MCP principal
│   ├── n8n/
│   │   ├── execute.ts            # ✅ Exécution workflows n8n
│   │   └── workflows.ts          # ✅ Liste workflows n8n
│   └── test.ts                   # ✅ Test API de base
├── mcp-config.json               # ✅ Configuration MCP complète
└── VERCEL-DEBUG.md              # 📖 Cette documentation
```

#### **⚙️ Configuration MCP (`mcp-config.json`) :**
```json
{
  "mcpServers": {
    "magicpath-n8n-vercel": {
      "command": "mcp-vercel-connector",
      "args": ["https://mmadimohamed.fr/api/mcp/initialize"],
      "env": {
        "MCP_SERVER_URL": "https://mmadimohamed.fr/api/mcp",
        "NODE_ENV": "production"
      }
    }
  },
  "vercel": {
    "serverUrl": "https://mmadimohamed.fr/api/mcp/initialize",
    "baseUrl": "https://mmadimohamed.fr",
    "projectId": "prj_giGdfhxL07bq8KarHz4Z5zVqzrOQ",
    "name": "magicpath-n8n-server",
    "version": "1.0.0",
    "protocolVersion": "2024-11-05",
    "transport": "http",
    "status": "✅ working"
  }
}
```

### **3. Routes API disponibles**
```
GET  /api/test                    - ✅ Test de base
GET  /api/mcp/initialize          - ✅ MCP server info
GET  /api/mcp/tools/list          - ✅ Liste des outils MCP
POST /api/mcp/tools/call          - ✅ Exécution d'outils MCP
GET  /api/mcp/resources/list      - ✅ Ressources MCP
GET  /api/mcp/prompts/list        - ✅ Prompts MCP
GET  /api/n8n/workflows           - ✅ Workflows n8n
POST /api/n8n/execute             - ✅ Exécution n8n
```

### **4. Outils MCP disponibles**
```json
{
  "tools": [
    {
      "name": "execute_content_workflow",
      "description": "Execute the complete content agents workflow (Search + Ghostwriting + Review)",
      "inputSchema": {
        "siteUrl": "string (required)",
        "default": "https://magicpath.ai"
      }
    },
    {
      "name": "search_content_topics",
      "description": "Use Agent Search Content to analyze a website and suggest article topics",
      "inputSchema": {
        "siteUrl": "string (required)",
        "topicCount": "number (1-10, default: 5)"
      }
    }
  ]
}
```

### **5. Tests à effectuer**

#### **✅ Test 1: API de base**
```bash
curl https://mmadimohamed.fr/api/test
```
**Résultat obtenu:**
```json
{
  "message": "✅ API is working!",
  "timestamp": "2025-09-24T23:49:04.042Z",
  "vercel": {
    "region": "iad1",
    "url": "com-mmadimohamed-1fcyr2g13-mohameds-projects-e8f6076a.vercel.app"
  }
}
```

#### **✅ Test 2: MCP Initialize**
```bash
curl https://mmadimohamed.fr/api/mcp/initialize
```
**Résultat attendu:**
```json
{
  "protocolVersion": "2024-11-05",
  "capabilities": {
    "tools": {},
    "resources": {},
    "prompts": {}
  },
  "serverInfo": {
    "name": "magicpath-n8n-server",
    "version": "1.0.0",
    "description": "MCP Server for MagicPath n8n Content Agents Workflows"
  }
}
```

#### **✅ Test 3: MCP Tools**
```bash
curl https://mmadimohamed.fr/api/mcp/tools/list
```

#### **✅ Test 4: Interface Web**
- ✅ `/workflow` - Interface n8n
- ✅ `/mcp` - Dashboard MCP

## 🔧 Procédure de Fix Complète

### **🎯 PROBLÈME RÉSOLU : Erreur 404 MCP**

#### **🔍 Diagnostic effectué :**
1. **✅ Identification projet** : `prj_giGdfhxL07bq8KarHz4Z5zVqzrOQ`
2. **✅ Link correct** : `npx vercel link --project prj_giGdfhxL07bq8KarHz4Z5zVqzrOQ --yes`
3. **✅ Déploiement** : `npx vercel --prod`
4. **✅ Tests endpoints** : Tous fonctionnels

#### **📋 Commandes utilisées pour résoudre :**
```bash
# 1. Link vers le bon projet Vercel
cd magicpath-project
npx vercel link --project prj_giGdfhxL07bq8KarHz4Z5zVqzrOQ --yes

# 2. Commit des corrections MCP
git add .
git commit -m "fix: restore working MCP endpoints with [...path].ts"
git push

# 3. Déploiement production
npx vercel --prod

# 4. Test des endpoints
curl https://mmadimohamed.fr/api/test
curl https://mmadimohamed.fr/api/mcp/initialize
```

## 🔍 Debug Steps (En cas de problème futur)

### **1. Vérifier les Logs Vercel**
```bash
# Inspecteur de déploiement
npx vercel inspect [DEPLOYMENT_URL] --logs

# Exemple :
npx vercel inspect com-mmadimohamed-ldin9sgs3-mohameds-projects-e8f6076a.vercel.app --logs
```

### **2. Vérifier le bon projet**
```bash
# Lister les projets
npx vercel ls

# Vérifier le projet lié
cat .vercel/project.json
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

### **🎯 Status Check Final**

#### **✅ URLs opérationnelles (25/09/2024) :**
- **✅ API Test**: https://mmadimohamed.fr/api/test
- **✅ MCP Server**: https://mmadimohamed.fr/api/mcp/initialize
- **✅ MCP Tools**: https://mmadimohamed.fr/api/mcp/tools/list
- **✅ Dashboard MCP**: https://mmadimohamed.fr/mcp
- **✅ Interface n8n**: https://mmadimohamed.fr/workflow

#### **🔗 Configuration finale :**
- **✅ Projet Vercel** : `prj_giGdfhxL07bq8KarHz4Z5zVqzrOQ`
- **✅ Domaine OVH** : `mmadimohamed.fr` (compatible Vercel)
- **✅ MCP Protocol** : `2024-11-05`
- **✅ Endpoints MCP** : Tous fonctionnels
- **✅ Workflow n8n** : Intégré avec agents content

---

## 🏆 RÉSUMÉ DE LA RÉSOLUTION

**Problème :** Erreur 404 sur endpoints MCP malgré les corrections
**Cause :** Déploiement sur le mauvais projet Vercel
**Solution :** Link et déploiement sur le bon projet (`prj_giGdfhxL07bq8KarHz4Z5zVqzrOQ`)
**Résultat :** ✅ Serveur MCP n8n 100% opérationnel

Le serveur MCP fonctionne parfaitement avec votre domaine OVH !