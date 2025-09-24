# 🚀 Guide Complet MCP Server sur Vercel

## 🎯 Vue d'ensemble

Le serveur MCP (Model Context Protocol) permet aux clients IA comme Claude Code, Cursor, et Windsurf de se connecter directement à tes workflows n8n via une API standardisée.

## ✅ Ce qui a été installé

### **📦 Packages installés**
- `@vercel/mcp-adapter` : Adaptateur officiel Vercel pour MCP
- Support complet HTTP et SSE transport

### **📁 Fichiers créés**
```
api/mcp/
├── index.ts              # Serveur MCP principal
├── [...path].ts         # Route handler Pages Router
app/api/mcp/[...path]/
└── route.ts             # Route handler App Router
src/
├── services/mcpService.ts # Client MCP pour l'interface
└── pages/MCPDashboard.tsx # Interface d'administration
mcp-config.json          # Configuration client MCP
```

## 🛠️ Configuration

### **1. Variables d'environnement**
Ajouter dans Vercel Dashboard ou `.env.local` :
```bash
PERPLEXITY_API_KEY=pplx-your-key
OPENAI_API_KEY=sk-your-key
ANTHROPIC_API_KEY=sk-ant-your-key
```

### **2. URL du serveur MCP**
```
Production: https://ton-domaine.vercel.app/api/mcp
Local: http://localhost:3000/api/mcp
```

## 🔧 Outils MCP disponibles

### **`execute_content_workflow`**
Execute le workflow complet (Search + Ghostwriting + Review)
```json
{
  "siteUrl": "https://magicpath.ai",
  "targetAudience": "Professionals",
  "contentStyle": "professional",
  "minScore": 80
}
```

### **`search_content_topics`**
Analyse un site et propose des sujets d'articles
```json
{
  "siteUrl": "https://example.com",
  "topicCount": 5
}
```

### **`generate_article`**
Génère un article à partir d'un sujet
```json
{
  "topic": {
    "title": "L'IA dans les entreprises",
    "keywords": ["IA", "entreprise"],
    "audience": "Dirigeants"
  },
  "wordCount": 1500
}
```

### **`review_article`**
Analyse et note un article
```json
{
  "article": {
    "title": "Mon article",
    "content": "Contenu de l'article...",
    "metaDescription": "Meta description"
  }
}
```

## 📋 Ressources MCP

### **`workflow://content-agents`**
Configuration complète du workflow

### **`prompts://search-agent`**
Prompt système pour l'agent de recherche

### **`prompts://ghostwriter-agent`**
Prompt système pour l'agent rédacteur

### **`prompts://review-agent`**
Prompt système pour l'agent de révision

## 💬 Prompts prédéfinis

### **`create_content_strategy`**
Génère une stratégie de contenu complète
- **Arguments**: `website` (requis), `industry` (optionnel)

### **`optimize_article_seo`**
Optimise un article pour le SEO
- **Arguments**: `article` (requis), `keywords` (requis)

## 🧪 Test du serveur

### **Via le Dashboard MCP**
1. Allez sur `/mcp`
2. Vérifiez la connexion
3. Testez les outils dans l'onglet "Test Tools"

### **Via API directe**
```bash
# Test de connexion
curl https://ton-domaine.vercel.app/api/mcp/initialize

# Exécution d'outil
curl -X POST https://ton-domaine.vercel.app/api/mcp/tools/call \
  -H "Content-Type: application/json" \
  -d '{"method":"tools/call","params":{"name":"search_content_topics","arguments":{"siteUrl":"https://magicpath.ai"}}}'
```

## 🔌 Connexion depuis Claude Code

### **Configuration dans Claude Code**
1. Ouvrir les paramètres Claude Code
2. Aller dans "MCP Servers"
3. Ajouter le serveur :
   ```json
   {
     "name": "magicpath-n8n",
     "serverUrl": "https://ton-domaine.vercel.app/api/mcp",
     "description": "MagicPath n8n Content Agents"
   }
   ```

### **Utilisation**
Une fois connecté, tu peux utiliser les outils directement :
```
@magicpath-n8n execute_content_workflow siteUrl="https://example.com"
```

## 🔌 Connexion depuis Cursor/Windsurf

### **Configuration MCP**
Créer/modifier le fichier de config MCP :
```json
{
  "mcpServers": {
    "magicpath-n8n": {
      "command": "npx",
      "args": ["--yes", "@modelcontextprotocol/server-everything"],
      "env": {
        "MCP_SERVER_URL": "https://ton-domaine.vercel.app/api/mcp"
      }
    }
  }
}
```

## 📊 Monitoring et Analytics

### **Dashboard Vercel**
- Fonctions > Logs : Voir les appels MCP en temps réel
- Analytics : Suivre l'utilisation des outils
- Erreurs : Diagnostiquer les problèmes API

### **Interface MCP Dashboard**
- Statut de connexion en temps réel
- Liste des outils, ressources, prompts
- Interface de test intégrée
- Logs d'exécution

## 🚨 Dépannage

### **Erreur "Server not responding"**
```bash
# Vérifier le déploiement
curl https://ton-domaine.vercel.app/api/mcp/initialize
```
- Vérifier que le déploiement est terminé
- Contrôler les logs Vercel Functions

### **Erreur "Tool execution failed"**
- Vérifier les clés API dans les variables d'environnement
- Contrôler les quotas des APIs IA
- Regarder les logs Vercel pour plus de détails

### **Erreur "Invalid arguments"**
- Vérifier le format JSON des arguments
- Consulter le schéma de l'outil dans le dashboard
- Utiliser l'interface de test pour valider

## 🔒 Sécurité

### **Authentification**
- Le serveur MCP utilise les variables d'environnement Vercel
- Pas d'authentification supplémentaire requise (serveur sécurisé)

### **Rate Limiting**
- Limitations naturelles des APIs IA
- Vercel Functions : limites par plan

### **CORS**
- Configuré pour accepter les connexions MCP standard
- Headers appropriés pour les clients IA

## 📈 Performances

### **Optimisations Vercel**
- Functions avec support Edge (plus rapide)
- Mise en cache automatique des réponses statiques
- Compression gzip/brotli

### **Recommendations**
- Utiliser des prompts concis pour réduire la latence
- Cache les résultats similaires côté client
- Surveiller les quotas des APIs IA

## 🔄 Intégrations avancées

### **Webhook notifications**
Ajouter des webhooks pour notifier d'autres services :
```typescript
// Dans le handler d'outil
await fetch(process.env.WEBHOOK_URL, {
  method: 'POST',
  body: JSON.stringify({
    tool: toolName,
    result,
    timestamp: new Date().toISOString()
  })
});
```

### **Base de données**
Stocker les résultats dans Supabase/PlanetScale :
```typescript
// Exemple d'intégration DB
const { data, error } = await supabase
  .from('mcp_executions')
  .insert({
    tool_name: toolName,
    arguments: args,
    result,
    created_at: new Date()
  });
```

## 🚀 Prochaines étapes

### **Extensions possibles**
- [ ] Authentification JWT pour les clients MCP
- [ ] Système de cache Redis avec Upstash
- [ ] Métriques avancées avec Analytics
- [ ] Support des webhooks bidirectionnels
- [ ] Interface de monitoring en temps réel

### **Intégrations supplémentaires**
- [ ] Zapier via webhooks
- [ ] Slack notifications
- [ ] CMS integration (WordPress, Contentful)
- [ ] Analytics tracking (Mixpanel, PostHog)

---

## 🎉 Le serveur MCP est maintenant opérationnel !

**URLs importantes:**
- **Dashboard MCP**: `https://ton-domaine.vercel.app/mcp`
- **API MCP**: `https://ton-domaine.vercel.app/api/mcp`
- **Workflow Interface**: `https://ton-domaine.vercel.app/workflow`

Connecte maintenant Claude Code, Cursor ou Windsurf pour utiliser tes agents n8n directement depuis l'IA ! 🤖✨