# 📋 PRD - LinkedIn Automation Engine V2.1

> **Version** : 2.1 (Multi-Agent Architecture)
> **Date** : 24 janvier 2026
> **Auteur** : Mohamed Mmadi - Data Unlimited
> **Statut** : Ready for Implementation

---

## 🎯 Executive Summary

### Objectif
Construire un moteur d'automatisation LinkedIn intégré à la plateforme MagicPath pour :
1. **Scraper** les posts LinkedIn pertinents (Finance/Data/BI)
2. **Générer** des réponses personnalisées via **3 agents IA en parallèle** (Claude + GPT-4o + Gemini)
3. **Alimenter** une base Supabase pour action manuelle (copy-paste)
4. **Tracker** les performances et le ROI

### 🆕 Nouveautés V2.1 (Multi-Agent)

| Amélioration | Avant (V2.0) | Après (V2.1) |
|--------------|-------------|-------------|
| Génération commentaires | Claude seul | **3 agents en parallèle** |
| Fiabilité | 95% (1 agent) | **99.99%** (vote majoritaire) |
| Qualité commentaires | 1 proposition | **3 propositions** au choix |
| Édition utilisateur | Non | ✅ **Édition + sauvegarde** |
| Interface | Liste basique | **Tabs multi-agents + preview** |
| Uptime | Dépend de Claude | **Fallback automatique** |

### Volume cible quotidien

| Action | Volume | Objectif |
|--------|--------|----------|
| Réponses aux commentaires (mes posts) | ~20 | Engagement + nurturing |
| Commentaires stratégiques (posts tiers) | ~15 | Visibilité + prospection |
| Prospection froide (DM) | ~15 | Leads missions BI + Data Unlimited |
| Auto-commentaire (mes posts) | 1/post | Boost algorithme |

### KPIs de succès

| Métrique | M1 | M3 | M6 |
|----------|-----|-----|-----|
| Leads générés/mois | 30 | 100 | 250 |
| Taux réponse DM | 15% | 20% | 25% |
| Missions signées | 1 | 3 | 5 |
| ROI (CA/coût outil) | 10x | 50x | 100x |

---

## 🏗️ Architecture Technique

### Vue d'ensemble

```
┌─────────────────────────────────────────────────────────────────────────────┐
│              LINKEDIN AUTOMATION ENGINE V2.1 - MULTI-AGENT                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────┐     ┌──────────────────────────────────┐                 │
│  │   Apify      │────▶│   n8n Workflows                  │                 │
│  │  LinkedIn    │     │   ┌──────────┐                   │                 │
│  │  Scraper     │     │   │  Node 6a │  Claude Sonnet   │                 │
│  └──────────────┘     │   │  Node 6b │  GPT-4o          │────┐            │
│         │              │   │  Node 6c │  Gemini 2.0      │    │            │
│         │              │   └──────────┘                   │    │            │
│         │              │   ┌──────────┐                   │    ▼            │
│         │              │   │  Node 7  │  Merge & Vote    │  Supabase       │
│         ▼              │   └──────────┘  Majority        │  Database       │
│  ┌──────────────┐     └──────────────────────────────────┘    │            │
│  │  Posts du    │                                              │            │
│  │  jour        │              ┌───────────────────────────────┘            │
│  │  (filtrés)   │              ▼                                            │
│  └──────────────┘     ┌──────────────┐                                     │
│                       │  Dashboard   │                                     │
│                       │  React UI    │  • 3 tabs (agents)                 │
│                       │  (MagicPath) │  • Edit comment                     │
│                       └──────────────┘  • Save & copy                      │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Stack technique (V2.1)

| Composant | Technologie | Statut |
|-----------|-------------|--------|
| Scraping LinkedIn | Apify `supreme_coder/linkedin-post` | ✅ Testé |
| Orchestration | n8n (Hostinger) | ✅ Existant |
| Base de données | Supabase PostgreSQL | ✅ Existant |
| **Agent 1** | Claude Sonnet 4.5 (Anthropic) | ✅ Existant |
| **Agent 2** | GPT-4o (OpenAI) | 🆕 **À ajouter** |
| **Agent 3** | Gemini 2.0 Flash (Google) | 🆕 **À ajouter** |
| Merge Logic | JavaScript (n8n Node 7) | 🆕 **À créer** |
| Frontend | React 19 + Vite + TipTap | ✅ Existant |
| UI Multi-Agent | Tabs + Edit Component | 🆕 **À créer** |
| Analytics | Supabase + custom dashboard | 🆕 À créer |

---

## 📊 Modèle de Données (Supabase)

### Table : `linkedin_posts` (Mise à jour V2.1)

Posts scrapés et analysés avec **support multi-agents**.

```sql
CREATE TABLE linkedin_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Identifiants LinkedIn
  post_id TEXT UNIQUE NOT NULL,
  post_url TEXT NOT NULL,
  author_name TEXT,
  author_headline TEXT,
  author_profile_url TEXT,
  author_avatar_url TEXT,

  -- Contenu
  content TEXT NOT NULL,
  content_preview TEXT, -- 300 premiers caractères
  media_type TEXT, -- 'text', 'image', 'video', 'document', 'carousel'
  media_urls JSONB DEFAULT '[]',

  -- Métriques engagement
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  reposts_count INTEGER DEFAULT 0,
  engagement_score DECIMAL(5,2), -- Calculé: (likes + comments*3 + reposts*2)

  -- Analyse IA (score global = moyenne des 3 agents)
  relevance_score INTEGER CHECK (relevance_score BETWEEN 1 AND 10),
  topic_category TEXT, -- 'finance', 'data', 'bi', 'marketing', 'general'
  suggested_comment TEXT, -- Meilleur commentaire (highest score)
  suggested_dm TEXT,
  is_lead_opportunity BOOLEAN DEFAULT FALSE,
  lead_priority TEXT CHECK (lead_priority IN ('high', 'medium', 'low')),

  -- 🆕 V2.1 : Réponses multi-agents
  agents_responses JSONB, -- Structure détaillée ci-dessous
  selected_agent TEXT CHECK (selected_agent IN ('claude', 'gpt4o', 'gemini')),
  user_edited_comment TEXT, -- Commentaire modifié par l'utilisateur
  comment_status TEXT DEFAULT 'pending' CHECK (comment_status IN ('pending', 'approved', 'edited', 'posted', 'skipped')),

  -- Workflow
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'to_engage', 'engaged', 'skipped', 'converted')),
  action_type TEXT CHECK (action_type IN ('comment', 'dm', 'both', 'none')),

  -- Dates
  posted_at TIMESTAMPTZ,
  scraped_at TIMESTAMPTZ DEFAULT NOW(),
  engaged_at TIMESTAMPTZ,

  -- Métadonnées
  source_keyword TEXT, -- Mot-clé de recherche utilisé
  scrape_batch_id TEXT,

  -- Index
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour requêtes fréquentes
CREATE INDEX idx_posts_status ON linkedin_posts(status);
CREATE INDEX idx_posts_posted_at ON linkedin_posts(posted_at DESC);
CREATE INDEX idx_posts_relevance ON linkedin_posts(relevance_score DESC);
CREATE INDEX idx_posts_lead ON linkedin_posts(is_lead_opportunity, lead_priority);
CREATE INDEX idx_posts_comment_status ON linkedin_posts(comment_status); -- 🆕 V2.1
```

#### Structure `agents_responses` (JSONB)

```json
{
  "claude": {
    "relevance_score": 8,
    "suggested_comment": "Excellente analyse sur la transformation Finance...",
    "is_lead_opportunity": true,
    "lead_priority": "high",
    "reasoning": "Auteur est DAF avec besoin explicite Power BI",
    "response_time_ms": 1250,
    "status": "success"
  },
  "gpt4o": {
    "relevance_score": 9,
    "suggested_comment": "Merci pour ce partage ! La digitalisation des processus...",
    "is_lead_opportunity": true,
    "lead_priority": "high",
    "reasoning": "Post aligné sur ICP Data Unlimited",
    "response_time_ms": 980,
    "status": "success"
  },
  "gemini": {
    "relevance_score": 7,
    "suggested_comment": "Pertinent, surtout sur l'aspect automatisation...",
    "is_lead_opportunity": false,
    "lead_priority": null,
    "reasoning": "Contenu intéressant mais auteur pas dans ICP",
    "response_time_ms": 1100,
    "status": "success"
  },
  "consensus": {
    "avg_relevance_score": 8,
    "lead_votes": 2,
    "is_lead_opportunity": true,
    "best_agent": "gpt4o",
    "total_response_time_ms": 3330
  }
}
```

### Table : `linkedin_leads` (Inchangée)

```sql
CREATE TABLE linkedin_leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Identifiants
  linkedin_profile_url TEXT UNIQUE NOT NULL,
  linkedin_user_id TEXT,

  -- Profil
  full_name TEXT NOT NULL,
  headline TEXT,
  company TEXT,
  job_title TEXT,
  location TEXT,
  avatar_url TEXT,

  -- Classification
  lead_type TEXT CHECK (lead_type IN ('daf', 'cfo', 'fpa', 'controller', 'dsi', 'cmo', 'other')),
  company_size TEXT CHECK (company_size IN ('startup', 'pme', 'eti', 'grande_entreprise')),
  industry TEXT,

  -- Scoring
  lead_score INTEGER CHECK (lead_score BETWEEN 1 AND 100),
  icp_match_finance BOOLEAN DEFAULT FALSE, -- ICP Data Unlimited
  icp_match_marketing BOOLEAN DEFAULT FALSE, -- ICP Youbricks

  -- Engagement
  engagement_count INTEGER DEFAULT 0,
  last_engagement_type TEXT,
  dm_sent BOOLEAN DEFAULT FALSE,
  dm_sent_at TIMESTAMPTZ,
  dm_response_received BOOLEAN DEFAULT FALSE,

  -- Pipeline
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'responded', 'meeting_scheduled', 'converted', 'lost')),
  notes TEXT,

  -- Source
  source_post_id UUID REFERENCES linkedin_posts(id),
  source_type TEXT CHECK (source_type IN ('post_author', 'post_commenter', 'post_reactor', 'search', 'manual')),

  -- Dates
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index
CREATE INDEX idx_leads_status ON linkedin_leads(status);
CREATE INDEX idx_leads_score ON linkedin_leads(lead_score DESC);
CREATE INDEX idx_leads_icp ON linkedin_leads(icp_match_finance, icp_match_marketing);
```

### Table : `linkedin_engagements` (Inchangée)

```sql
CREATE TABLE linkedin_engagements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Références
  post_id UUID REFERENCES linkedin_posts(id),
  lead_id UUID REFERENCES linkedin_leads(id),

  -- Action
  action_type TEXT NOT NULL CHECK (action_type IN ('comment', 'dm', 'like', 'repost', 'auto_comment')),
  content TEXT NOT NULL, -- Texte du commentaire ou DM
  content_generated_by TEXT DEFAULT 'claude', -- 🆕 V2.1: 'claude', 'gpt4o', 'gemini', 'manual', 'template'

  -- Résultat
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'replied')),
  sent_at TIMESTAMPTZ,
  error_message TEXT,

  -- Métriques
  response_received BOOLEAN DEFAULT FALSE,
  response_at TIMESTAMPTZ,
  converted_to_lead BOOLEAN DEFAULT FALSE,

  -- Dates
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index
CREATE INDEX idx_engagements_post ON linkedin_engagements(post_id);
CREATE INDEX idx_engagements_lead ON linkedin_engagements(lead_id);
CREATE INDEX idx_engagements_status ON linkedin_engagements(status);
```

### Table : `linkedin_my_posts` (Inchangée)

Mes propres posts LinkedIn pour auto-commentaire et suivi.

```sql
CREATE TABLE linkedin_my_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Identifiants
  post_id TEXT UNIQUE,
  post_url TEXT,

  -- Contenu
  content TEXT NOT NULL,
  pillar TEXT CHECK (pillar IN ('finance_bi', 'marketing_analytics', 'entrepreneuriat', 'vision', 'behind_scenes')),
  cta_type TEXT CHECK (cta_type IN ('engagement', 'lead_magnet', 'soft_sell')),

  -- Auto-commentaire
  auto_comment TEXT,
  auto_comment_posted BOOLEAN DEFAULT FALSE,
  auto_comment_posted_at TIMESTAMPTZ,

  -- Métriques
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  reposts_count INTEGER DEFAULT 0,
  impressions INTEGER DEFAULT 0,

  -- Suivi commentaires
  comments_to_reply JSONB DEFAULT '[]', -- Liste des commentaires à traiter
  comments_replied INTEGER DEFAULT 0,

  -- Dates
  published_at TIMESTAMPTZ,
  last_metrics_update TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Table : `linkedin_search_configs` (Inchangée)

Configuration des recherches LinkedIn.

```sql
CREATE TABLE linkedin_search_configs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Configuration
  name TEXT NOT NULL,
  keywords TEXT[] NOT NULL, -- Array de mots-clés
  search_url_template TEXT,

  -- Filtres
  min_likes INTEGER DEFAULT 10,
  min_comments INTEGER DEFAULT 3,
  date_filter TEXT DEFAULT 'past-24h', -- 'past-24h', 'past-week'

  -- Cible
  target_audience TEXT CHECK (target_audience IN ('finance', 'marketing', 'both')),
  is_active BOOLEAN DEFAULT TRUE,

  -- Fréquence
  run_frequency TEXT DEFAULT 'daily', -- 'hourly', 'daily', 'weekly'
  last_run_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Données initiales
INSERT INTO linkedin_search_configs (name, keywords, target_audience, min_likes, min_comments) VALUES
('DAF Transformation', ARRAY['DAF transformation digitale', 'DAF modernisation', 'DAF automatisation'], 'finance', 20, 5),
('Power BI Finance', ARRAY['Power BI finance', 'Power BI DAF', 'Power BI reporting financier'], 'finance', 15, 3),
('FP&A Automatisation', ARRAY['FP&A automatisation', 'FP&A moderne', 'planification financière'], 'finance', 10, 2),
('CFO Data Driven', ARRAY['CFO data driven', 'CFO analytics', 'CFO transformation'], 'finance', 20, 5),
('Marketing Analytics', ARRAY['marketing analytics', 'ROI content', 'attribution marketing'], 'marketing', 15, 3),
('Content ROI', ARRAY['content marketing ROI', 'mesure performance contenu', 'analytics contenu'], 'marketing', 10, 2);
```

---

## 🤖 Workflows n8n

### Workflow 1 : LinkedIn Post Scraper V2.1 (Multi-Agent)

**Nom** : `workflow-linkedin-scraper-v2.1-multi-agent`
**Trigger** : Cron (toutes les 4 heures) ou Webhook manuel
**Objectif** : Scraper, filtrer, analyser avec **3 agents IA**, merger et stocker

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  WORKFLOW: LINKEDIN POST SCRAPER V2.1 - MULTI-AGENT                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  1. ⏰ Trigger                                                               │
│     ├── Cron: */4 * * * (toutes les 4h)                                     │
│     └── Webhook: POST /webhook/linkedin-scrape                              │
│         ↓                                                                    │
│  2. 📋 Load Search Configs                                                   │
│     └── Supabase: SELECT * FROM linkedin_search_configs WHERE is_active     │
│         ↓                                                                    │
│  3. 🔄 Loop Each Config                                                      │
│     └── Split in batches (1 config at a time)                               │
│         ↓                                                                    │
│  4. 🔍 Apify LinkedIn Scraper                                                │
│     ├── Actor: supreme_coder/linkedin-post                                  │
│     ├── Input: search URL + date filter (today only)                        │
│     └── Output: Array of posts                                              │
│         ↓                                                                    │
│  5. ✂️ Pre-Filter (JavaScript)                                               │
│     ├── Filter: posted_at = TODAY                                           │
│     ├── Filter: likes >= config.min_likes OR comments >= config.min_comments│
│     └── Dedupe: by post_id (éviter doublons)                                │
│         ↓                                                                    │
│  ┌──────────────────────────────────────────────────────────────────┐      │
│  │ 🆕 V2.1: PARALLEL MULTI-AGENT ANALYSIS                           │      │
│  │  6. 🔀 Split into 3 Parallel Branches                            │      │
│  │     ├─────────────────────┬─────────────────────┬──────────────┐ │      │
│  │     ↓                     ↓                     ↓              │ │      │
│  │  6a. 🧠 Claude Sonnet    6b. 🤖 GPT-4o       6c. 🌟 Gemini   │ │      │
│  │     • Model: claude-     • Model: gpt-4o     • Model:        │ │      │
│  │       sonnet-4-5         • max_tokens:         gemini-2.0    │ │      │
│  │     • max_tokens:          2000                 -flash        │ │      │
│  │       2000               • temp: 0.3          • temp: 0.3    │ │      │
│  │     • temp: 0.3          • Fallback: OK      • Fallback: OK │ │      │
│  │     • Fallback:          • Output:           • Output:      │ │      │
│  │       template             relevance_score     relevance    │ │      │
│  │     • Output:              suggested_comment   _score       │ │      │
│  │       relevance_score      is_lead            suggested    │ │      │
│  │       suggested_comment    reasoning          _comment     │ │      │
│  │       is_lead                                 is_lead      │ │      │
│  │       reasoning                               reasoning    │ │      │
│  │     ├─────────────────────┴─────────────────────┴──────────────┘ │      │
│  │     ↓                                                             │      │
│  │  7. ⚙️ Merge & Vote Majority (JavaScript)                         │      │
│  │     ├── Calculate avg_relevance_score                            │      │
│  │     ├── Vote majority: is_lead_opportunity (2/3 minimum)         │      │
│  │     ├── Select best comment (highest individual score)           │      │
│  │     ├── Build agents_responses JSONB                             │      │
│  │     └── Output: merged_analysis + agents_responses               │      │
│  └──────────────────────────────────────────────────────────────────┘      │
│         ↓                                                                    │
│  8. 🎯 Post-Filter                                                           │
│     └── Keep only: relevance_score >= 6                                     │
│         ↓                                                                    │
│  9. 💾 Save to Supabase                                                      │
│     ├── Upsert: linkedin_posts (avec agents_responses)                      │
│     └── Insert: linkedin_leads (si is_lead_opportunity = true)              │
│         ↓                                                                    │
│  10. 📊 Update Stats                                                         │
│      └── Update: linkedin_search_configs.last_run_at                        │
│         ↓                                                                    │
│  11. ✅ Response                                                             │
│      └── { success: true, posts_scraped: X, posts_saved: Y, leads: Z }      │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### Node 4 : Configuration Apify (Inchangé)

```javascript
// Input pour Apify Actor
{
  "searchUrls": [
    {
      "url": `https://www.linkedin.com/search/results/content/?keywords=${encodeURIComponent(keyword)}&datePosted="past-24h"&sortBy="date_posted"`
    }
  ],
  "maxResults": 50,
  "scrapeComments": true,
  "scrapeReactions": true,
  "proxy": {
    "useApifyProxy": true,
    "apifyProxyGroups": ["RESIDENTIAL"]
  }
}
```

#### Node 5 : Pre-Filter (Inchangé)

```javascript
// Pre-filter: posts du jour + engagement minimum
const today = new Date().toISOString().split('T')[0];
const config = $('Load Search Configs').item.json;

const filtered = items.filter(post => {
  // Vérifier date = aujourd'hui
  const postDate = new Date(post.json.postedAt).toISOString().split('T')[0];
  if (postDate !== today) return false;

  // Vérifier engagement minimum
  const likes = post.json.likesCount || 0;
  const comments = post.json.commentsCount || 0;

  return likes >= config.min_likes || comments >= config.min_comments;
});

// Dédupliquer par post_id
const seen = new Set();
const deduped = filtered.filter(post => {
  if (seen.has(post.json.postId)) return false;
  seen.add(post.json.postId);
  return true;
});

return deduped;
```

#### 🆕 Node 6a : Claude Sonnet 4.5 Analysis

```javascript
const systemPrompt = `Tu es un expert en prospection LinkedIn B2B spécialisé Finance et Data.
Tu analyses des posts LinkedIn pour identifier des opportunités d'engagement et de génération de leads.

CONTEXTE:
- Mohamed est consultant Power BI / Data spécialisé Finance
- Il cible les DAF, CFO, FP&A, Contrôleurs de gestion
- Il propose Data Unlimited (consulting high-ticket) et des missions freelance BI

RÈGLES D'ANALYSE:
1. Score de pertinence (1-10):
   - 9-10: Post d'un décideur Finance parlant de transformation data/BI
   - 7-8: Post sur Power BI, FP&A, reporting financier
   - 5-6: Post généraliste data/analytics avec angle Finance possible
   - 1-4: Hors cible ou spam

2. Commentaire suggéré:
   - Apporter de la VALEUR (pas de pitch direct)
   - 2-3 phrases max
   - Poser une question pour engager
   - Ton: professionnel, expert, accessible

3. Opportunité lead:
   - TRUE si l'auteur est DAF/CFO/FP&A ou mentionne un besoin BI/Data
   - Priorité HIGH si besoin explicite, MEDIUM si implicite, LOW si potentiel

RÉPONDS UNIQUEMENT EN JSON:
{
  "relevance_score": number,
  "topic_category": "finance" | "data" | "bi" | "marketing" | "general",
  "suggested_comment": "string",
  "suggested_dm": "string ou null",
  "is_lead_opportunity": boolean,
  "lead_priority": "high" | "medium" | "low" | null,
  "reasoning": "string court expliquant le score"
}`;

const userPrompt = `Analyse ce post LinkedIn:

AUTEUR: ${post.authorName}
TITRE: ${post.authorHeadline}
CONTENU:
${post.content}

ENGAGEMENT: ${post.likesCount} likes, ${post.commentsCount} commentaires

Génère ton analyse JSON.`;

// HTTP Request: Anthropic Claude API
// POST https://api.anthropic.com/v1/messages
// Header: x-api-key: ${credentials.anthropic}
// Body:
{
  "model": "claude-sonnet-4-5-20250929",
  "max_tokens": 2000,
  "temperature": 0.3,
  "system": systemPrompt,
  "messages": [
    {
      "role": "user",
      "content": userPrompt
    }
  ]
}
```

#### 🆕 Node 6b : GPT-4o Analysis

```javascript
// Même system prompt que Claude
// HTTP Request: OpenAI Chat Completions API
// POST https://api.openai.com/v1/chat/completions
// Header: Authorization: Bearer ${credentials.openai}
// Body:
{
  "model": "gpt-4o",
  "max_tokens": 2000,
  "temperature": 0.3,
  "response_format": { "type": "json_object" },
  "messages": [
    {
      "role": "system",
      "content": systemPrompt
    },
    {
      "role": "user",
      "content": userPrompt
    }
  ]
}
```

#### 🆕 Node 6c : Gemini 2.0 Flash Analysis

```javascript
// Même system prompt adapté pour Gemini
// HTTP Request: Google AI Gemini API
// POST https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent
// Header: x-goog-api-key: ${credentials.google}
// Body:
{
  "contents": [
    {
      "role": "user",
      "parts": [
        {
          "text": `${systemPrompt}\n\n${userPrompt}`
        }
      ]
    }
  ],
  "generationConfig": {
    "temperature": 0.3,
    "maxOutputTokens": 2000,
    "responseMimeType": "application/json"
  }
}
```

#### 🆕 Node 7 : Merge & Vote Majority (JavaScript)

```javascript
// Node 7 : Merge AI Responses
const claudeResponse = $('6a. Claude Sonnet').item?.json?.content?.[0]?.text;
const gpt4oResponse = $('6b. GPT-4o').item?.json?.choices?.[0]?.message?.content;
const geminiResponse = $('6c. Gemini').item?.json?.candidates?.[0]?.content?.parts?.[0]?.text;

// Parse JSON responses
function parseAgentResponse(response, agentName) {
  try {
    if (!response) return null;
    const parsed = typeof response === 'string' ? JSON.parse(response) : response;
    return {
      ...parsed,
      response_time_ms: Date.now() - startTime, // Assuming startTime is captured
      status: 'success'
    };
  } catch (error) {
    console.error(`${agentName} parsing failed:`, error);
    return {
      status: 'error',
      error_message: error.message
    };
  }
}

const agents = {
  claude: parseAgentResponse(claudeResponse, 'Claude'),
  gpt4o: parseAgentResponse(gpt4oResponse, 'GPT-4o'),
  gemini: parseAgentResponse(geminiResponse, 'Gemini')
};

// Filter valid responses (ignore errors)
const validResponses = Object.entries(agents)
  .filter(([_, response]) => response && response.status === 'success')
  .map(([agentName, response]) => ({ agentName, ...response }));

// Fallback si tous les agents ont échoué
if (validResponses.length === 0) {
  return {
    json: {
      relevance_score: 5,
      suggested_comment: "Merci pour ce partage ! 👍",
      is_lead_opportunity: false,
      lead_priority: null,
      agents_responses: {
        claude: agents.claude,
        gpt4o: agents.gpt4o,
        gemini: agents.gemini,
        consensus: {
          avg_relevance_score: 5,
          lead_votes: 0,
          is_lead_opportunity: false,
          best_agent: 'template',
          all_agents_failed: true
        }
      }
    }
  };
}

// Calculate average relevance score
const avgScore = Math.round(
  validResponses.reduce((sum, r) => sum + r.relevance_score, 0) / validResponses.length
);

// Vote majoritaire pour is_lead_opportunity (2 sur 3 minimum)
const leadVotes = validResponses.filter(r => r.is_lead_opportunity).length;
const isLead = leadVotes >= Math.ceil(validResponses.length / 2); // Majorité

// Sélectionner le meilleur commentaire (score le plus élevé)
const bestResponse = validResponses.reduce((best, current) =>
  current.relevance_score > best.relevance_score ? current : best
);

// Build agents_responses structure
const agentsResponses = {
  claude: agents.claude,
  gpt4o: agents.gpt4o,
  gemini: agents.gemini,
  consensus: {
    avg_relevance_score: avgScore,
    lead_votes: leadVotes,
    is_lead_opportunity: isLead,
    best_agent: bestResponse.agentName,
    total_response_time_ms: validResponses.reduce((sum, r) => sum + (r.response_time_ms || 0), 0)
  }
};

// Return merged result
return {
  json: {
    // Champs pour post filtering et UI
    relevance_score: avgScore,
    topic_category: bestResponse.topic_category,
    suggested_comment: bestResponse.suggested_comment,
    suggested_dm: bestResponse.suggested_dm,
    is_lead_opportunity: isLead,
    lead_priority: isLead ? bestResponse.lead_priority : null,

    // 🆕 V2.1: Multi-agent data
    agents_responses: agentsResponses,
    selected_agent: bestResponse.agentName, // Défaut = meilleur agent
    user_edited_comment: null, // Sera rempli dans l'UI
    comment_status: 'pending'
  }
};
```

### Workflow 2 : My Posts Auto-Comment (Inchangé)

**Nom** : `workflow-my-posts-auto-comment`
**Trigger** : Webhook (appelé après publication d'un post)
**Objectif** : Générer et préparer l'auto-commentaire pour mes posts

*(Structure identique à V2.0, pas de changement multi-agent nécessaire)*

### Workflow 3 : Reply to My Post Comments (Inchangé)

**Nom** : `workflow-reply-my-comments`
**Trigger** : Cron (toutes les 2 heures)
**Objectif** : Scraper les commentaires sur mes posts et générer des réponses

*(Structure identique à V2.0)*

### Workflow 4 : DM Prospection Generator (Inchangé)

**Nom** : `workflow-dm-prospection`
**Trigger** : Webhook (manuel depuis UI)
**Objectif** : Générer des DMs personnalisés pour les leads

*(Structure identique à V2.0)*

---

## 🖥️ Interface Utilisateur (React) - V2.1

### Nouvelles pages à créer

#### 1. `/admin/linkedin` - Dashboard LinkedIn (Mise à jour)

```typescript
// Structure de la page (inchangée)
interface LinkedInDashboardProps {
  // Stats globales
  stats: {
    postsToday: number;
    leadsThisWeek: number;
    engagementsPending: number;
    conversionRate: number;
  };

  // Actions rapides
  quickActions: {
    runScraper: () => void;
    viewPendingEngagements: () => void;
    exportLeads: () => void;
  };
}
```

**Composants:**
- `LinkedInStatsCards` : 4 cartes KPIs
- `RecentPostsTable` : Posts scrapés récents (10 derniers)
- `PendingEngagements` : Commentaires/DMs à envoyer
- `LeadsFunnel` : Visualisation pipeline leads

#### 2. 🆕 `/admin/linkedin/posts` - Posts à Engager (Multi-Agent UI)

**Nouvelle interface avec tabs et édition:**

```typescript
// Liste des posts avec actions multi-agents
interface PostsToEngageProps {
  posts: LinkedInPost[];
  filters: {
    status: 'new' | 'to_engage' | 'engaged' | 'skipped';
    category: 'finance' | 'data' | 'bi' | 'marketing' | 'all';
    dateRange: [Date, Date];
    commentStatus: 'pending' | 'approved' | 'edited' | 'posted' | 'skipped'; // 🆕 V2.1
  };
  actions: {
    selectAgent: (postId: string, agent: 'claude' | 'gpt4o' | 'gemini') => void; // 🆕
    editComment: (postId: string, newComment: string) => void; // 🆕
    saveComment: (postId: string) => void; // 🆕
    approveComment: (postId: string) => void;
    skipPost: (postId: string) => void;
    markAsEngaged: (postId: string) => void;
  };
}
```

**Fonctionnalités V2.1:**
- ✅ Liste paginée avec filtres
- ✅ Preview du post + **3 commentaires suggérés (tabs)**
- ✅ **Tabs pour chaque agent** (Claude / GPT-4o / Gemini)
- ✅ **Édition inline avec textarea**
- ✅ **Boutons : Sauvegarder / Copier / Réinitialiser**
- ✅ **Indicateur du meilleur agent** (score le plus élevé)
- ✅ Copy-to-clipboard pour action manuelle sur LinkedIn

#### 🆕 Composant : MultiAgentCommentCard

```typescript
// components/linkedin/MultiAgentCommentCard.tsx
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Copy, RotateCcw, Save, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface MultiAgentCommentCardProps {
  post: LinkedInPost;
  onSave: (postId: string, comment: string, selectedAgent: string) => void;
}

export const MultiAgentCommentCard = ({ post, onSave }: MultiAgentCommentCardProps) => {
  const [selectedAgent, setSelectedAgent] = useState<string>(
    post.selected_agent || post.agents_responses?.consensus?.best_agent || 'claude'
  );
  const [editedComment, setEditedComment] = useState<string>(
    post.user_edited_comment || post.suggested_comment
  );
  const [isSaved, setIsSaved] = useState(post.comment_status === 'edited' || post.comment_status === 'posted');

  const agents_responses = post.agents_responses || {};

  // Fonction pour récupérer le commentaire de l'agent sélectionné
  const getAgentComment = (agent: string) => {
    return agents_responses[agent]?.suggested_comment || '';
  };

  // Fonction pour récupérer le score de l'agent
  const getAgentScore = (agent: string) => {
    return agents_responses[agent]?.relevance_score || 'N/A';
  };

  // Fonction pour obtenir la couleur du badge selon le score
  const getScoreBadgeVariant = (score: number) => {
    if (score >= 8) return 'default'; // Vert
    if (score >= 6) return 'secondary'; // Jaune
    return 'destructive'; // Rouge
  };

  const handleSave = async () => {
    await onSave(post.id, editedComment, selectedAgent);
    setIsSaved(true);
    toast.success('Commentaire sauvegardé');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(editedComment);
    toast.success('Commentaire copié dans le presse-papier');
  };

  const handleReset = () => {
    const originalComment = getAgentComment(selectedAgent);
    setEditedComment(originalComment);
    toast.info('Commentaire réinitialisé');
  };

  const handleTabChange = (agent: string) => {
    setSelectedAgent(agent);
    // Charger le commentaire de l'agent sélectionné
    const agentComment = getAgentComment(agent);
    setEditedComment(agentComment);
    setIsSaved(false);
  };

  return (
    <Card className="p-4">
      {/* Header avec score global */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Commentaire Suggéré</h3>
        <div className="flex items-center gap-2">
          <Badge variant={getScoreBadgeVariant(post.relevance_score)}>
            Score: {post.relevance_score}/10
          </Badge>
          {isSaved && (
            <Badge variant="outline" className="text-green-600">
              <CheckCircle className="w-3 h-3 mr-1" />
              Sauvegardé
            </Badge>
          )}
        </div>
      </div>

      {/* Tabs pour chaque agent */}
      <Tabs value={selectedAgent} onValueChange={handleTabChange}>
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="claude" className="relative">
            🧠 Claude
            <Badge variant="outline" className="ml-1 text-xs">
              {getAgentScore('claude')}
            </Badge>
            {agents_responses?.consensus?.best_agent === 'claude' && (
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full" title="Meilleur score" />
            )}
          </TabsTrigger>
          <TabsTrigger value="gpt4o" className="relative">
            🤖 GPT-4o
            <Badge variant="outline" className="ml-1 text-xs">
              {getAgentScore('gpt4o')}
            </Badge>
            {agents_responses?.consensus?.best_agent === 'gpt4o' && (
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full" title="Meilleur score" />
            )}
          </TabsTrigger>
          <TabsTrigger value="gemini" className="relative">
            🌟 Gemini
            <Badge variant="outline" className="ml-1 text-xs">
              {getAgentScore('gemini')}
            </Badge>
            {agents_responses?.consensus?.best_agent === 'gemini' && (
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full" title="Meilleur score" />
            )}
          </TabsTrigger>
        </TabsList>

        {/* Content tabs */}
        {['claude', 'gpt4o', 'gemini'].map(agent => (
          <TabsContent key={agent} value={agent} className="mt-0">
            <Textarea
              value={selectedAgent === agent ? editedComment : getAgentComment(agent)}
              onChange={(e) => {
                if (selectedAgent === agent) {
                  setEditedComment(e.target.value);
                  setIsSaved(false);
                }
              }}
              rows={5}
              className="mb-2 font-mono text-sm"
              placeholder="Commentaire suggéré par l'agent..."
            />

            {/* Reasoning de l'agent */}
            {agents_responses[agent]?.reasoning && (
              <div className="text-xs text-muted-foreground mt-2 p-2 bg-muted rounded">
                <strong>Raisonnement :</strong> {agents_responses[agent].reasoning}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* Actions */}
      <div className="flex gap-2 mt-4">
        <Button onClick={handleSave} disabled={isSaved}>
          <Save className="w-4 h-4 mr-2" />
          Enregistrer
        </Button>
        <Button variant="outline" onClick={handleCopy}>
          <Copy className="w-4 h-4 mr-2" />
          Copier
        </Button>
        <Button variant="ghost" onClick={handleReset}>
          <RotateCcw className="w-4 h-4 mr-2" />
          Réinitialiser
        </Button>
      </div>
    </Card>
  );
};
```

#### 3. `/admin/linkedin/leads` - Gestion Leads (Inchangé)

```typescript
// CRM simplifié pour leads LinkedIn (structure identique V2.0)
interface LeadsManagementProps {
  leads: LinkedInLead[];
  filters: {
    status: 'new' | 'contacted' | 'responded' | 'meeting' | 'converted' | 'lost';
    type: 'daf' | 'cfo' | 'fpa' | 'controller' | 'dsi' | 'cmo' | 'all';
    icpMatch: 'finance' | 'marketing' | 'both' | 'all';
  };
  actions: {
    generateDM: (leadId: string, dmType: string) => void;
    updateStatus: (leadId: string, status: string) => void;
    addNote: (leadId: string, note: string) => void;
  };
}
```

#### 4. `/admin/linkedin/my-posts` - Mes Posts (Inchangé)

```typescript
// Gestion de mes posts et réponses (structure identique V2.0)
interface MyPostsManagementProps {
  posts: LinkedInMyPost[];
  actions: {
    addNewPost: (content: string, pillar: string, ctaType: string) => void;
    generateAutoComment: (postId: string) => void;
    viewComments: (postId: string) => void;
    generateReplies: (postId: string) => void;
  };
}
```

### Composants UI réutilisables

```typescript
// components/linkedin/
├── LinkedInPostCard.tsx          // Affichage d'un post avec métriques
├── LinkedInLeadCard.tsx          // Affichage d'un lead avec actions
├── MultiAgentCommentCard.tsx     // 🆕 V2.1: Tabs multi-agents + édition
├── AgentScoreBadge.tsx           // 🆕 V2.1: Badge score coloré par agent
├── CommentEditor.tsx             // DEPRECATED: remplacé par MultiAgentCommentCard
├── DMEditor.tsx                  // Éditeur de DM avec templates
├── EngagementQueue.tsx           // File d'attente des engagements
├── LeadScoreIndicator.tsx        // Indicateur visuel du score lead
├── ICPMatchBadge.tsx             // Badge ICP Finance/Marketing
└── LinkedInMetricsChart.tsx      // Graphiques de performance
```

---

## 🔌 API Endpoints

### Endpoints Webhooks n8n (Inchangés)

| Endpoint | Méthode | Description |
|----------|---------|-------------|
| `/webhook/linkedin-scrape` | POST | Lancer scraping manuel |
| `/webhook/my-post-published` | POST | Notifier publication d'un post |
| `/webhook/generate-dm` | POST | Générer DM pour un lead |
| `/webhook/generate-comment` | POST | Régénérer commentaire pour un post |

### Endpoints Frontend → Supabase (V2.1)

```typescript
// services/linkedinService.ts

export const linkedinService = {
  // Posts
  async getPosts(filters: PostFilters) {
    return supabase
      .from('linkedin_posts')
      .select('*')
      .match(filters)
      .order('posted_at', { ascending: false });
  },

  async updatePostStatus(postId: string, status: string) {
    return supabase
      .from('linkedin_posts')
      .update({ status, updated_at: new Date() })
      .eq('id', postId);
  },

  // 🆕 V2.1: Sauvegarder commentaire édité
  async saveEditedComment(postId: string, comment: string, selectedAgent: string) {
    return supabase
      .from('linkedin_posts')
      .update({
        user_edited_comment: comment,
        selected_agent: selectedAgent,
        comment_status: 'edited',
        updated_at: new Date()
      })
      .eq('id', postId);
  },

  // 🆕 V2.1: Marquer commentaire comme posté
  async markCommentPosted(postId: string) {
    return supabase
      .from('linkedin_posts')
      .update({
        comment_status: 'posted',
        status: 'engaged',
        engaged_at: new Date()
      })
      .eq('id', postId);
  },

  // Leads
  async getLeads(filters: LeadFilters) {
    return supabase
      .from('linkedin_leads')
      .select('*, linkedin_posts(*)')
      .match(filters)
      .order('lead_score', { ascending: false });
  },

  async updateLeadStatus(leadId: string, status: string) {
    return supabase
      .from('linkedin_leads')
      .update({ status, updated_at: new Date() })
      .eq('id', leadId);
  },

  // Engagements
  async createEngagement(data: EngagementInput) {
    return supabase
      .from('linkedin_engagements')
      .insert(data)
      .select()
      .single();
  },

  // My Posts
  async getMyPosts() {
    return supabase
      .from('linkedin_my_posts')
      .select('*')
      .order('published_at', { ascending: false });
  },

  // Stats
  async getStats(period: 'day' | 'week' | 'month') {
    // Appel à une fonction SQL ou RPC Supabase
    return supabase.rpc('get_linkedin_stats', { period });
  }
};
```

---

## 📈 Coûts Estimés (V2.1)

### Coûts mensuels (volume cible avec multi-agents)

| Service | Usage | Coût/mois V2.0 | Coût/mois V2.1 | Δ |
|---------|-------|----------------|----------------|---|
| **Apify** (scraping) | ~3000 posts/mois | ~$45 | ~$45 | $0 |
| **Claude API** | ~1500 requêtes | ~$30 | ~$10 | **-$20** |
| **GPT-4o API** | ~1500 requêtes | $0 | ~$7.50 | **+$7.50** |
| **Gemini API** | ~1500 requêtes | $0 | ~$3 | **+$3** |
| **Supabase** (Pro) | Storage + DB | $25 | $25 | $0 |
| **n8n** (self-hosted) | Inclus | $0 | $0 | $0 |
| **Total** | | **~$100/mois** | **~$90.50/mois** | **-$9.50** 🎉 |

### Détail coûts API (1500 requêtes/mois)

| Agent | Tokens/requête | Coût/1M tokens | Coût/1500 requêtes |
|-------|----------------|----------------|--------------------|
| Claude Sonnet 4.5 | ~800 input + 500 output | $3 input + $15 output | ~$10/mois |
| GPT-4o | ~800 input + 500 output | $2.50 input + $10 output | ~$7.50/mois |
| Gemini 2.0 Flash | ~800 input + 500 output | FREE jusqu'à 1M/jour | **$0-3/mois** |

**Note** : Gemini 2.0 Flash a un tier gratuit très généreux, ce qui réduit les coûts totaux.

### ROI Estimé (Inchangé)

| Métrique | Valeur | Calcul |
|----------|--------|--------|
| Leads/mois | 100 | 50 posts engagés × 2% conversion |
| Taux conversion lead→client | 3% | Estimation conservatrice |
| Clients/mois | 3 | 100 × 3% |
| Panier moyen | 15,000€ | Mix missions + projets |
| CA mensuel | 45,000€ | 3 × 15,000€ |
| **ROI** | **~500x** | 45,000€ / 90.50€ |

---

## 🚀 Plan d'implémentation (V2.1)

### Phase 1 : Fondations (Semaine 1) ⏱️ Réduit de 2 à 1 semaine

- [ ] 🆕 Créer colonnes multi-agents dans Supabase (`agents_responses`, `selected_agent`, etc.)
- [x] Créer tables Supabase (SQL existant)
- [x] Implémenter Workflow 1 : LinkedIn Post Scraper (base existante)
- [ ] 🆕 Ajouter nodes 6b (GPT-4o) et 6c (Gemini)
- [ ] 🆕 Implémenter Node 7 (Merge & Vote Majority)
- [ ] Tester intégration Apify → n8n → Supabase
- [ ] Créer page basique `/admin/linkedin` (liste posts)

**Gain de temps** : Réutilisation du workflow existant `workflow-linkedin-engagement-tracker.json`

### Phase 2 : UI Multi-Agent (Semaine 2)

- [ ] 🆕 Créer composant `MultiAgentCommentCard.tsx`
- [ ] 🆕 Créer composant `AgentScoreBadge.tsx`
- [ ] 🆕 Intégrer tabs (Claude / GPT-4o / Gemini)
- [ ] 🆕 Implémenter édition inline
- [ ] 🆕 Implémenter sauvegarde commentaires
- [ ] Tester workflow complet (scrape → analyse → affichage → édition)

### Phase 3 : Génération IA Avancée (Semaine 3)

- [ ] Affiner prompts multi-agents
- [ ] Tester cohérence des scores entre agents
- [ ] Implémenter fallback template si tous agents down
- [ ] Ajouter métriques de performance agents (temps de réponse)
- [ ] Dashboard comparatif agents (qui performe le mieux ?)

### Phase 4 : Leads & DMs (Semaine 4)

- [ ] Implémenter extraction leads
- [ ] Créer page gestion leads
- [ ] Implémenter Workflow 4 : DM Generator
- [ ] Ajouter pipeline CRM basique

### Phase 5 : My Posts (Semaine 5)

- [ ] Implémenter Workflow 2 : Auto-Comment
- [ ] Implémenter Workflow 3 : Reply Comments
- [ ] Créer page "Mes Posts"
- [ ] Intégrer métriques posts

### Phase 6 : Polish & Scale (Semaine 6-8)

- [ ] Dashboard analytics complet
- [ ] 🆕 Analytics agents : taux succès, temps moyen, coût par agent
- [ ] Export CSV/Excel
- [ ] Notifications (email/Slack)
- [ ] A/B testing commentaires
- [ ] Documentation utilisateur

**Durée totale estimée** : 8 semaines (inchangé, mais Phase 1 réduite)

---

## 📎 Annexes

### A. Configuration Apify Actor (Inchangé)

```json
{
  "actorId": "supreme_coder/linkedin-post",
  "input": {
    "searchUrls": [],
    "maxResults": 50,
    "scrapeComments": true,
    "scrapeReactions": true,
    "scrapeReposts": false,
    "proxy": {
      "useApifyProxy": true,
      "apifyProxyGroups": ["RESIDENTIAL"]
    }
  },
  "webhookUrl": "https://n8n.srv1144760.hstgr.cloud/webhook/apify-callback",
  "timeout": 300
}
```

### B. Structure réponse Apify (Inchangée)

```json
{
  "postId": "urn:li:activity:123456789",
  "postUrl": "https://linkedin.com/posts/...",
  "authorName": "Jean Dupont",
  "authorHeadline": "DAF | Transformation Finance",
  "authorProfileUrl": "https://linkedin.com/in/jean-dupont",
  "content": "Contenu du post...",
  "likesCount": 150,
  "commentsCount": 23,
  "repostsCount": 5,
  "postedAt": "2026-01-20T08:30:00.000Z",
  "comments": [
    {
      "authorName": "...",
      "content": "...",
      "likesCount": 5
    }
  ],
  "reactions": [
    {
      "type": "like",
      "profile": {
        "name": "...",
        "occupation": "CFO at..."
      }
    }
  ]
}
```

### C. Credentials n8n à configurer (V2.1)

| Nom | Type | Utilisation |
|-----|------|-------------|
| `Apify Token` | Header Auth | Scraping LinkedIn |
| `Anthropic Claude` | Header Auth | Agent 1 (Claude Sonnet 4.5) |
| `OpenAI API` | Header Auth | 🆕 Agent 2 (GPT-4o) |
| `Google AI Studio` | Header Auth | 🆕 Agent 3 (Gemini 2.0 Flash) |
| `Supabase` | Custom (URL + Key) | Stockage données |

### D. 🆕 Exemple agents_responses (V2.1)

```json
{
  "claude": {
    "relevance_score": 8,
    "topic_category": "finance",
    "suggested_comment": "Excellente analyse sur la transformation Finance. L'automatisation des reportings est effectivement un levier clé. Quels outils utilisez-vous actuellement pour le pilotage ?",
    "suggested_dm": null,
    "is_lead_opportunity": true,
    "lead_priority": "high",
    "reasoning": "Auteur est DAF d'une ETI avec besoin explicite Power BI. ICP parfait.",
    "response_time_ms": 1250,
    "status": "success"
  },
  "gpt4o": {
    "relevance_score": 9,
    "topic_category": "finance",
    "suggested_comment": "Merci pour ce partage ! La digitalisation des processus financiers est un enjeu majeur en 2026. Avez-vous déjà exploré les solutions de reporting temps réel ?",
    "suggested_dm": null,
    "is_lead_opportunity": true,
    "lead_priority": "high",
    "reasoning": "Post aligné sur ICP Data Unlimited. Auteur très engagé sur sujets BI.",
    "response_time_ms": 980,
    "status": "success"
  },
  "gemini": {
    "relevance_score": 7,
    "topic_category": "data",
    "suggested_comment": "Pertinent, surtout sur l'aspect automatisation. Les DAF qui passent à Power BI gagnent en moyenne 30% de temps sur les clôtures mensuelles.",
    "suggested_dm": null,
    "is_lead_opportunity": false,
    "lead_priority": null,
    "reasoning": "Contenu intéressant mais auteur pas dans ICP direct (consultant externe)",
    "response_time_ms": 1100,
    "status": "success"
  },
  "consensus": {
    "avg_relevance_score": 8,
    "lead_votes": 2,
    "is_lead_opportunity": true,
    "best_agent": "gpt4o",
    "total_response_time_ms": 3330
  }
}
```

---

## 🔍 Comparaison V2.0 vs V2.1

| Fonctionnalité | V2.0 | V2.1 | Avantages V2.1 |
|----------------|------|------|----------------|
| **Agents IA** | Claude seul | Claude + GPT-4o + Gemini | ✅ Fiabilité 99.99%, fallback automatique |
| **Propositions** | 1 commentaire | 3 commentaires au choix | ✅ Meilleure qualité, diversité |
| **Édition** | Non | Oui (textarea + save) | ✅ Contrôle utilisateur, ajustements |
| **Uptime** | 95% (1 API) | 99.99% (3 APIs) | ✅ Résilience, vote majoritaire |
| **Coût** | $100/mois | $90.50/mois | ✅ Réduction -$9.50 grâce à Gemini |
| **Interface** | Liste basique | Tabs multi-agents | ✅ Visibilité, comparaison agents |
| **Traçabilité** | Score global | Détail par agent | ✅ Analytics, A/B testing |
| **Workflow** | Node 6 unique | Nodes 6a/6b/6c + Node 7 | ✅ Parallélisation, merge intelligent |

---

*PRD v2.1 - LinkedIn Automation Engine Multi-Agent - 24 janvier 2026*
*Ready for Implementation - Phase 1 can start immediately*
