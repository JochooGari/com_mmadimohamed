# MagicPath n8n MCP Server - Guide d'utilisation

## Configuration

Le serveur MCP n8n est configuré dans `~/.cursor/mcp.json` :

```json
{
  "magicpath-n8n": {
    "command": "node",
    "args": ["C:\\Users\\power\\OneDrive\\Documents\\Website_2025_06_30\\magicpath-project\\mcp-server-n8n.js"],
    "env": {
      "MCP_N8N_API_URL": "https://mmadimohamed.fr/api"
    }
  }
}
```

## Utilisation dans Cursor

### 1. Activer Agent Mode
Appuyez sur `Ctrl + K` pour activer le mode Agent dans Cursor.

### 2. Utiliser les outils MCP

#### Exécuter le workflow complet
```
@mcp Execute le workflow de création de contenu pour https://example.com
```

Ou avec plus d'options :
```
@mcp Execute le workflow de création de contenu pour https://example.com avec style professionnel et score minimum de 80
```

#### Rechercher des sujets d'articles
```
@mcp Trouve 5 sujets d'articles pour le site https://example.com
```

#### Générer un article
```
@mcp Génère un article sur le sujet "Intelligence Artificielle" avec les mots-clés ["IA", "machine learning", "automatisation"] pour un public technique
```

#### Réviser un article
```
@mcp Révise cet article:
Titre: Mon article
Contenu: [contenu de l'article]
```

#### Vérifier le statut des workflows
```
@mcp Montre-moi les 10 dernières exécutions de workflow
```

## Outils disponibles

### 1. `execute_content_workflow`
Exécute le workflow complet (3 agents : Search, Ghostwriter, Reviewer)

**Paramètres :**
- `siteUrl` (requis) : URL du site à analyser
- `targetAudience` (optionnel) : Audience cible
- `contentStyle` (optionnel) : Style du contenu (professional, casual, technical, educational)
- `minScore` (optionnel) : Score minimum de qualité (0-100)

**Exemple :**
```json
{
  "siteUrl": "https://magicpath.ai",
  "targetAudience": "Entrepreneurs",
  "contentStyle": "professional",
  "minScore": 85
}
```

### 2. `search_content_topics`
Recherche de sujets de contenu avec Agent Search Content (Perplexity)

**Paramètres :**
- `siteUrl` (requis) : URL du site à analyser
- `topicCount` (optionnel) : Nombre de sujets (1-10, défaut: 5)

**Exemple :**
```json
{
  "siteUrl": "https://example.com",
  "topicCount": 5
}
```

### 3. `generate_article`
Génération d'article avec Agent Ghostwriter (GPT-4o/GPT-5)

**Paramètres :**
- `topic` (requis) :
  - `title` : Titre de l'article
  - `keywords` : Liste de mots-clés
  - `audience` : Audience cible
  - `angle` (optionnel) : Angle éditorial
- `wordCount` (optionnel) : Nombre de mots (défaut: 800)
- `includeImages` (optionnel) : Inclure des suggestions d'images (défaut: true)

**Exemple :**
```json
{
  "topic": {
    "title": "Les meilleures pratiques SEO en 2025",
    "keywords": ["SEO", "référencement", "Google", "optimisation"],
    "audience": "Marketeurs digitaux",
    "angle": "Guide pratique et actionnable"
  },
  "wordCount": 1200,
  "includeImages": true
}
```

### 4. `review_article`
Révision d'article avec Agent Reviewer (Claude Sonnet)

**Paramètres :**
- `article` (requis) :
  - `title` : Titre de l'article
  - `content` : Contenu de l'article
  - `metaDescription` (optionnel) : Meta description
- `criteria` (optionnel) : Critères de révision (0-100) :
  - `writing` : Qualité de rédaction
  - `relevance` : Pertinence
  - `seo` : Optimisation SEO
  - `structure` : Structure
  - `engagement` : Engagement
  - `briefCompliance` : Conformité au brief

**Exemple :**
```json
{
  "article": {
    "title": "Mon article",
    "content": "Contenu de l'article...",
    "metaDescription": "Description courte"
  },
  "criteria": {
    "writing": 30,
    "relevance": 25,
    "seo": 20,
    "structure": 15,
    "engagement": 10
  }
}
```

### 5. `get_workflow_status`
Consulter l'historique des exécutions de workflows

**Paramètres :**
- `limit` (optionnel) : Nombre d'exécutions à retourner (défaut: 10)
- `status` (optionnel) : Filtrer par statut (all, completed, failed, running)

**Exemple :**
```json
{
  "limit": 20,
  "status": "completed"
}
```

## Ressources disponibles

### 1. `workflow://content-agents`
Configuration complète du workflow de génération de contenu (3 agents)

### 2. `workflow://status`
Historique récent des exécutions de workflows

## Prompts disponibles

### 1. `create_content_strategy`
Génère une stratégie de contenu complète pour un site web

**Arguments :**
- `website` (requis) : URL du site
- `industry` (optionnel) : Secteur d'activité

### 2. `optimize_article_seo`
Optimise un article pour le SEO avec des mots-clés spécifiques

**Arguments :**
- `article` (requis) : Contenu de l'article
- `keywords` (requis) : Mots-clés cibles (séparés par des virgules)

## Architecture

### Workflow 3 Agents - Style "Neil Patel"

#### 1. **Agent Search Content** (Perplexity Sonar)
**Rôle** : Analyste de contenu web et recherche SEO

**Mission** :
- Analyser un site web cible
- Identifier 5 opportunités de contenu à forte valeur ajoutée
- Détecter les content gaps (lacunes de contenu)
- Trouver des opportunités de positionnement concurrentiel

**Critères de sélection** :
1. Sujets alignés avec l'expertise du site
2. Questions fréquentes non/mal traitées
3. Opportunités face à la concurrence
4. Potentiel de trafic qualifié
5. Compatibilité approche "Neil Patel" (long-form, actionnable, data-driven)

**Output JSON** :
```json
{
  "topics": [
    {
      "title": "Titre de l'article",
      "keywords": ["mot-clé 1", "mot-clé 2"],
      "angle": "Pain point + solution",
      "difficulty": "faible|moyen|élevé",
      "searchVolume": "100-1K|1K-10K|10K+",
      "rationale": "Pourquoi pertinent"
    }
  ],
  "contentGaps": "Principaux manques identifiés",
  "competitiveAdvantage": "Différenciation concurrence"
}
```

#### 2. **Agent Ghostwriter** (OpenAI GPT-4o/GPT-5)
**Rôle** : Expert GEO & SEO, spécialiste écriture Neil Patel

**Structure obligatoire** :
- ✅ Titre SEO optimisé H1 (50-60 car, mot-clé principal)
- ✅ Introduction accrocheuse (100-150 mots : hook, problématique, promesse)
- ✅ Plan détaillé (Table des matières H2/H3 avec ancres)
- ✅ Corps : 3 à 7 H2 principaux
  - Chaque H2 avec H3 structurants
  - Paragraphes courts (2-4 phrases, 3-5 lignes max)
  - Checklist/points clés par section
  - Tableaux comparatifs/data-driven
  - Encadrés "Étude de cas" ou "Exemple réel"
  - Visuels tous les 400 mots
  - Liens internes (3-5) et externes (2-3)
  - Angle : pain point → résolution → tips
- ✅ 2 CTA éditoriaux (milieu + fin)
- ✅ FAQ (3-5 Q/R)
- ✅ Conclusion-action (récap, invitation, question ouverte)
- ✅ JSON-LD FAQPage
- ✅ Métadonnées SEO (meta title, description, slug, keywords)

**Règles strictes** :
- ✅ Paragraphes courts, jamais de blocs de texte
- ✅ Tout skimmable (facilement scannable)
- ✅ Langage simple, ton conversationnel
- ✅ Data-driven (chiffres, stats, exemples)
- ✅ Présence visuelle régulière (1/400 mots)
- ❌ Pas de longs paragraphes
- ❌ Pas de jargon sans explication
- ❌ Pas de cliparts ou images génériques

**Output JSON** : Article complet avec title, meta, introduction, sections, cta, faq, conclusion, jsonLd, wordCount, readingTime

#### 3. **Agent Reviewer** (Anthropic Claude Sonnet)
**Rôle** : Expert GEO & SEO, auditeur qualité articles

**Grille d'évaluation (Score /100)** :
1. **Structure & Organisation** (20 pts)
   - H1 optimisé, intro accrocheuse, plan H2/H3, structuration claire
2. **Lisibilité & Engagement** (25 pts)
   - Paragraphes courts, ton direct, listes, langage accessible, skimmable
3. **Contenu Actionnable** (20 pts)
   - Angle pain point/résolution, cas pratiques, tableaux, conseils concrets
4. **Éléments Visuels** (15 pts)
   - Images/schémas réguliers, descriptions visuels, tableaux, pas de clipart
5. **SEO & Liens** (10 pts)
   - Liens internes/externes, mots-clés, meta optimisés
6. **CTA & Conversion** (5 pts)
   - 2 CTA éditoriaux, orientés valeur
7. **FAQ & Conclusion** (5 pts)
   - FAQ enrichie, conclusion-action, JSON-LD

**Critères de validation** :
- ❌ **Rejet automatique** (< 60) : Absence intro, paragraphes > 7 lignes, < 3 H2, pas de FAQ/CTA, < 2000 mots
- ⚠️ **Améliorations nécessaires** (60-79) : Structure faible, peu de visuels, manque d'exemples
- ✅ **Prêt à publier** (80-89) : Respecte tous les critères de base
- 🏆 **Excellence** (90-100) : Dépasse les attentes sur tous critères

**Output JSON** : Scores détaillés, strengths, weaknesses, missingElements, seoFeedback, geoFeedback, recommendations, verdict

### Prompts stockés

**Fichier** : `agents/workflow/inputs/prompts.json` (Supabase Storage)
**Accessible via** : `https://mmadimohamed.fr/api/storage?agent=workflow&type=prompts`

**Contenu** :
- `search-content` : Prompt complet pour Agent Search
- `ghostwriter` : Prompt complet pour Agent Ghostwriter (10 sections)
- `review-content` : Prompt complet pour Agent Reviewer (grille /100)

### API Backend

- **Endpoint** : `https://mmadimohamed.fr/api/n8n/execute`
- **Fichier** : `api/n8n/execute.ts`
- **Service MCP** : `src/services/mcpService.ts`
- **Storage API** : `api/storage.ts` (lecture/écriture Supabase Storage)

## Dépannage

### Le MCP ne se connecte pas

1. **Recharger Cursor** : `Ctrl + Shift + P` → "Developer: Reload Window"
2. **Vérifier les logs** : Ouvrir Developer Tools (F12) → Console
3. **Tester l'API** :
   ```bash
   curl https://mmadimohamed.fr/api/mcp/initialize
   ```

### Erreurs d'exécution

1. **Vérifier les clés API** dans `.env.local` :
   - `VITE_OPENAI_API_KEY`
   - `VITE_ANTHROPIC_API_KEY`
   - `VITE_PERPLEXITY_API_KEY`

2. **Vérifier le déploiement Vercel** :
   ```bash
   npx vercel ls
   ```

### Le serveur MCP ne démarre pas

1. **Vérifier le fichier** : `mcp-server-n8n.js` existe
2. **Tester manuellement** :
   ```bash
   node mcp-server-n8n.js
   ```
3. **Vérifier les dépendances** :
   ```bash
   npm list @modelcontextprotocol/sdk
   ```

## Authentification

### Accès Admin

**URL** : https://mmadimohamed.fr/login
**Email** : `marketingb3dconsulting@gmail.com`
**Password** : `Portfolio2025!`
**User ID** : `4af711c7-6be9-48c7-8d16-2143d9c29fbc`

### Supabase

**Project URL** : https://xroduivvgnviqjdvehuw.supabase.co
**Project Ref** : `xroduivvgnviqjdvehuw`
**Dashboard** : https://supabase.com/dashboard/project/xroduivvgnviqjdvehuw

### Variables d'environnement requises

```bash
# Clés API pour les agents IA
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
PERPLEXITY_API_KEY=pplx-...

# Supabase
SUPABASE_URL=https://xroduivvgnviqjdvehuw.supabase.co
SUPABASE_SERVICE_ROLE=eyJ...
```

## Support

Pour toute question ou problème :
- Documentation MCP : https://modelcontextprotocol.io
- Repository GitHub : https://github.com/JochooGari/com_mmadimohamed
- Email : marketingb3dconsulting@gmail.com
