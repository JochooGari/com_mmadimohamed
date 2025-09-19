# 🗂️ Système de Stockage Local - MagicPath

## 🚀 Migration du localStorage vers fichiers locaux

**Statut :** ✅ Système opérationnel et prêt à l'utilisation

### 📋 Guide de Migration

1. **Démarrer le serveur de développement :**
   ```bash
   npm run dev
   ```

2. **Ouvrir l'application :**
   - Navigateur → http://localhost:5174

3. **Exécuter la migration :**
   - Ouvrir la console (F12 → Console)
   - Taper : `migrateTolocalStorage()`

## 🏗️ Architecture des Dossiers

```
data/
├── agents/
│   ├── linkedin/
│   │   ├── inputs/           # 📄 Tes données sources
│   │   │   ├── sources.json         # Liste des sources
│   │   │   ├── config.json          # Configuration agent
│   │   │   ├── campaigns.json       # Campagnes
│   │   │   └── source_*.txt         # Contenu de chaque source
│   │   └── outputs/          # 🧠 Données optimisées IA
│   │       ├── knowledge_base.json  # Base de connaissances
│   │       ├── system_prompt.txt    # Prompt système optimisé
│   │       ├── context_chunks.json  # Chunks pour retrieval
│   │       └── ai_optimized.json    # Métadonnées IA
│   └── geo/
│       ├── inputs/           # 📄 Tes données sources  
│       └── outputs/          # 🧠 Données optimisées IA
├── monitoring/
│   ├── sources/              # 📊 Contenu brut collecté
│   │   ├── article_*.json           # Articles web
│   │   ├── post_*.json              # Posts LinkedIn
│   │   └── tweet_*.json             # Tweets
│   ├── optimized/            # 🎯 Données veille optimisées
│   │   ├── monitoring_knowledge_base.json
│   │   ├── insights.json            # Analyses automatiques
│   │   └── optimized_*.json         # Contenus optimisés
│   ├── reports/              # 📈 Rapports de veille
│   └── monitoring_index.json        # Index de recherche
├── exports/                  # 💾 Exports de données
├── backups/                  # 🔄 Sauvegardes
├── global_knowledge_base.json       # 🌐 Base globale
├── semantic_index.json              # 🔍 Index sémantique
├── migration_report.json            # 📋 Rapport migration
└── test_report.json                 # 🧪 Rapport tests
```

## 🔧 Fonctionnalités

### 🤖 **Agents LinkedIn & GEO**
- **Stockage persistant** : Fini le localStorage, données sauvées en fichiers
- **Organisation claire** : Séparation inputs utilisateur / outputs IA
- **Optimisation IA** : Base de connaissances enrichie automatiquement
- **Prompts système** : Générés automatiquement depuis tes données
- **Recherche avancée** : Index sémantique et chunks contextuels

### 📊 **Système de Veille**
- **Multi-sources** : LinkedIn, Twitter, YouTube, RSS, sites web
- **Traçage complet** : Chaque article, post, tweet, vidéo tracé
- **Optimisation auto** : Résumés, mots-clés, sentiment, pertinence
- **Analytics** : Statistiques, tendances, recommandations
- **Rapports** : Génération automatique de rapports quotidiens

### 🧠 **Optimisation IA**
- **Extraction concepts** : Identification automatique des concepts clés
- **Stratégies** : Extraction des meilleures pratiques et stratégies
- **Métriques** : Suivi des KPIs et performances importantes
- **Relations** : Mapping des relations entre concepts
- **Embeddings** : Préparation pour recherche vectorielle

## 📁 Types de Fichiers

### 📄 **Inputs (Tes données)**
- `sources.json` - Liste et métadonnées de tes sources
- `config.json` - Configuration de l'agent
- `campaigns.json` - Tes campagnes marketing
- `source_*.txt` - Contenu textuel de chaque source

### 🧠 **Outputs (Optimisé IA)**
- `knowledge_base.json` - Base de connaissances structurée
- `system_prompt.txt` - Prompt système personnalisé
- `context_chunks.json` - Chunks pour recherche contextuelle
- `ai_optimized.json` - Métadonnées enrichies pour l'IA

### 📊 **Monitoring (Veille)**
- `article_*.json` - Articles web avec métadonnées
- `post_*.json` - Posts LinkedIn avec engagement
- `tweet_*.json` - Tweets avec métriques
- `monitoring_index.json` - Index de recherche global

## 🚀 Utilisation

### **Migration (Une seule fois)**
```javascript
// Dans la console du navigateur
migrateTolocalStorage()
```

### **API Backend**
```typescript
// Sauvegarder des sources
await WebFileStorage.saveContentSources('linkedin', sources);

// Récupérer la configuration
const config = await WebFileStorage.getAgentConfig('linkedin');

// Optimiser pour l'IA
await WebFileStorage.optimizeAgentData('linkedin');
```

### **Veille automatique**
```typescript
// Sauvegarder contenu de veille
await WebFileStorage.saveMonitoringContent(content);

// Récupérer statistiques
const stats = await WebFileStorage.getMonitoringStats();
```

## 🔍 Avantages du Nouveau Système

### ✅ **Par rapport au localStorage**
- 📁 **Persistance garantie** : Données sauvées sur disque
- 📂 **Organisation** : Structure claire et navigable
- 🔍 **Traçabilité** : Chaque fichier daté et versionné
- 🧠 **Optimisation IA** : Données préparées pour l'IA
- 📊 **Analytics** : Statistiques et insights automatiques

### 🆕 **Nouvelles capacités**
- 🔄 **Veille automatique** : Collection multi-sources
- 🎯 **Recommandations** : Suggestions de contenu automatiques
- 📈 **Rapports** : Génération de rapports périodiques
- 🔗 **Relations** : Mapping des concepts entre sources
- 🌐 **Base globale** : Unification des connaissances

## 🛠️ Architecture Technique

### **Frontend (navigateur)**
- `webStorage.ts` - Interface client pour l'API
- `migrationScript.ts` - Logique de migration
- Console globale : `migrateTolocalStorage()`

### **Backend (serveur)**
- `api/storage.ts` - API REST pour fichiers
- Gestion CORS et sécurité
- Optimisation automatique des données

### **Lancer les APIs en local (Vercel Functions)**
```bash
cd magicpath-project
vercel dev --yes --confirm --port 3000
```
Le proxy Vite (défini dans `vite.config.ts`) redirige `^/api/` vers `http://localhost:3000`.

### **Optimisation IA**
- `aiOptimizer.ts` - Moteur d'optimisation
- Extraction de concepts et stratégies
- Génération de prompts système
- Création d'index sémantique

## 📋 Migration Checklist

- ✅ Structure des dossiers créée
- ✅ API backend opérationnelle  
- ✅ Interface client adaptée
- ✅ Migration localStorage → fichiers
- ✅ Optimisation IA des données
- ✅ Système de veille initialisé
- ✅ Tests et validation
- ✅ Documentation complète

## 🔧 Maintenance

### **Sauvegardes automatiques**
- Exports quotidiens dans `data/exports/`
- Sauvegardes avant modifications dans `data/backups/`

### **Optimisation continue**
- Re-optimisation automatique à chaque ajout de source
- Mise à jour des index de recherche
- Génération de nouveaux insights

### **Monitoring système**
- Rapports de performance dans les logs
- Statistiques d'utilisation dans `test_report.json`
- Alertes en cas d'erreur dans la console

---

**🎉 Le système de stockage local est maintenant opérationnel !**  
**Exécute `migrateTolocalStorage()` dans la console pour commencer.**