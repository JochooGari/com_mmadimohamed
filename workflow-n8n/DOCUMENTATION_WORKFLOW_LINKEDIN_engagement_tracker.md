# 📘 Documentation Technique
# LinkedIn Engagement Tracker v2.0

---

## 📑 Table des matières

1. [Vue d'ensemble](#1-vue-densemble)
2. [Architecture technique](#2-architecture-technique)
3. [Prérequis](#3-prérequis)
4. [Installation et configuration](#4-installation-et-configuration)
5. [Description des nodes](#5-description-des-nodes)
6. [Mapping des champs Apify](#6-mapping-des-champs-apify)
7. [Structure Google Sheets](#7-structure-google-sheets)
8. [Analyse des coûts](#8-analyse-des-coûts)
9. [Personnalisation](#9-personnalisation)
10. [Troubleshooting](#10-troubleshooting)
11. [Évolutions futures](#11-évolutions-futures)

---

## 1. Vue d'ensemble

### 1.1 Objectif

Ce workflow automatise la veille LinkedIn pour identifier des posts à fort potentiel d'engagement dans le domaine Finance/Data, avec extraction automatique de leads potentiels.

### 1.2 Cas d'usage

- **Engagement stratégique** : Identifier les posts pertinents pour commenter et gagner en visibilité
- **Génération de leads** : Extraire les profils Finance des réactions pour prospection
- **Personal branding** : Alimenter une présence LinkedIn cohérente et ciblée

### 1.3 Flux de données

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         LINKEDIN ENGAGEMENT TRACKER v2                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   ⏰ Cron (4h)                                                               │
│       │                                                                      │
│       ▼                                                                      │
│   🔍 Apify Scrape ──────────────────────────────────────────┐               │
│       │ (5 recherches LinkedIn, 20 posts/recherche)          │               │
│       │                                                      │               │
│       ▼                                                      │               │
│   ✂️ Split Items                                             │               │
│       │ (Sépare le tableau en items)                         │               │
│       │                                                      │               │
│       ▼                                                      │               │
│   🎚️ Pré-filtrage ◄─────────────────────────────────────────┘               │
│       │ (likes > 20 OU comments > 5)                                         │
│       │ (~100 posts → ~30 posts)                                             │
│       │                                                                      │
│       ▼                                                                      │
│   🔄 Batch (1 par 1)                                                         │
│       │                                                                      │
│       ▼                                                                      │
│   🧠 GPT-4o-mini ───────────────────────────────────────────┐               │
│       │ (Analyse pertinence, suggestion commentaire)         │               │
│       │                                                      │               │
│       ▼                                                      │               │
│   ⚙️ Process & Enrichissement ◄─────────────────────────────┘               │
│       │ (Parse IA + extraction leads réactions)                              │
│       │                                                                      │
│       ▼                                                                      │
│   🎯 Filter Score >= 6                                                       │
│       │                                                                      │
│       ├──────────────────────┬───────────────────────────────┐              │
│       ▼                      ▼                               │              │
│   📋 Google Sheets      📊 Google Sheets                     │              │
│   (Posts_A_Commenter)   (Leads_Potentiels)                   │              │
│                                                              │              │
└──────────────────────────────────────────────────────────────┘              │
```

---

## 2. Architecture technique

### 2.1 Stack technologique

| Composant | Technologie | Version |
|-----------|-------------|---------|
| Orchestration | n8n | >= 1.0 |
| Scraping LinkedIn | Apify (supreme_coder/linkedin-post) | Latest |
| Analyse IA | OpenAI GPT-4o-mini | Latest |
| Stockage | Google Sheets | v4 API |

### 2.2 Endpoints utilisés

#### Apify
```
POST https://api.apify.com/v2/acts/supreme_coder~linkedin-post/run-sync-get-dataset-items
```
- **Avantage** : Attend la fin du run et retourne directement les données
- **Timeout** : 300 secondes (5 minutes)

#### OpenAI
```
POST https://api.openai.com/v1/chat/completions
```
- **Modèle** : `gpt-4o-mini`
- **Temperature** : 0.3 (réponses cohérentes)

### 2.3 Fréquence d'exécution

- **Intervalle** : Toutes les 4 heures
- **Runs par jour** : 6
- **Posts analysés/jour** : ~180 max (30 posts × 6 runs)

---

## 3. Prérequis

### 3.1 Comptes requis

| Service | Compte | Coût estimé |
|---------|--------|-------------|
| n8n | Self-hosted ou Cloud | Gratuit - $20/mois |
| Apify | Compte avec crédits | ~$30-50/mois |
| OpenAI | API Key avec crédits | ~$20-40/mois |
| Google | Compte Google (Sheets) | Gratuit |

### 3.2 Credentials à créer dans n8n

#### 3.2.1 Apify (HTTP Query Auth)
```
Type: Query Parameters
Name: token
Value: apify_api_XXXXXXXXXXXXXXXXXXXXXXXX
```

#### 3.2.2 OpenAI (HTTP Header Auth)
```
Type: Header Auth
Name: Authorization
Value: Bearer sk-XXXXXXXXXXXXXXXXXXXXXXXX
```

#### 3.2.3 Google Sheets
```
Type: OAuth2 ou Service Account
Scopes: https://www.googleapis.com/auth/spreadsheets
```

---

## 4. Installation et configuration

### 4.1 Import du workflow

1. Ouvrir n8n
2. Aller dans **Workflows** → **Import from File**
3. Sélectionner `linkedin_engagement_tracker_v2.json`
4. Cliquer sur **Import**

### 4.2 Configuration des credentials

#### Étape 1 : Apify
1. Aller sur https://console.apify.com/account/integrations
2. Copier le **API Token**
3. Dans n8n : **Credentials** → **New** → **HTTP Query Auth**
4. Configurer :
   - Name: `Apify Token`
   - Query Auth Parameter Name: `token`
   - Value: `[votre token]`

#### Étape 2 : OpenAI
1. Aller sur https://platform.openai.com/api-keys
2. Créer une nouvelle API Key
3. Dans n8n : **Credentials** → **New** → **HTTP Header Auth**
4. Configurer :
   - Name: `OpenAI API Key`
   - Header Name: `Authorization`
   - Header Value: `Bearer sk-...`

#### Étape 3 : Google Sheets
1. Dans n8n : **Credentials** → **New** → **Google Sheets OAuth2**
2. Suivre le flow OAuth pour autoriser l'accès
3. Ou utiliser un Service Account (recommandé pour production)

### 4.3 Configuration du Google Sheet

1. Créer un nouveau Google Sheet
2. Copier l'ID du document (dans l'URL : `docs.google.com/spreadsheets/d/[ID_ICI]/edit`)
3. Créer 2 onglets :
   - `Posts_A_Commenter`
   - `Leads_Potentiels`
4. Remplacer `VOTRE_GOOGLE_SHEET_ID` dans les 2 nodes Google Sheets

### 4.4 Test initial

1. Désactiver le trigger Cron (clic droit → Disable)
2. Cliquer sur **Execute Workflow** manuellement
3. Vérifier chaque node un par un
4. Une fois validé, réactiver le Cron

---

## 5. Description des nodes

### 5.1 ⏰ Toutes les 4h (Schedule Trigger)

**Type** : `n8n-nodes-base.scheduleTrigger`

**Configuration** :
```json
{
  "rule": {
    "interval": [
      {
        "field": "hours",
        "hoursInterval": 4
      }
    ]
  }
}
```

**Rôle** : Déclenche le workflow automatiquement toutes les 4 heures.

---

### 5.2 🔍 Scrape LinkedIn Posts (HTTP Request)

**Type** : `n8n-nodes-base.httpRequest`

**Endpoint** : 
```
POST https://api.apify.com/v2/acts/supreme_coder~linkedin-post/run-sync-get-dataset-items
```

**Body** :
```javascript
{
  "urls": [
    "https://www.linkedin.com/search/results/content/?keywords=DAF%20transformation%20digitale&datePosted=%22past-24h%22",
    "https://www.linkedin.com/search/results/content/?keywords=Power%20BI%20finance&datePosted=%22past-24h%22",
    "https://www.linkedin.com/search/results/content/?keywords=FP%26A%20automatisation&datePosted=%22past-24h%22",
    "https://www.linkedin.com/search/results/content/?keywords=CFO%20data%20driven&datePosted=%22past-24h%22",
    "https://www.linkedin.com/search/results/content/?keywords=reporting%20financier%20Excel&datePosted=%22past-24h%22"
  ],
  "limitPerSource": 20,
  "deepScrape": true,
  "rawData": false
}
```

**Paramètres clés** :
| Paramètre | Valeur | Description |
|-----------|--------|-------------|
| `urls` | Array de recherches | URLs de recherche LinkedIn |
| `limitPerSource` | 20 | Max posts par recherche |
| `deepScrape` | true | Inclut likes, comments, réactions détaillées |
| `rawData` | false | Données formatées (pas brutes) |

**Output** : Tableau de posts LinkedIn avec toutes les métadonnées.

---

### 5.3 ✂️ Split Items (Split Out)

**Type** : `n8n-nodes-base.splitOut`

**Rôle** : Transforme le tableau unique en items n8n individuels pour traitement séquentiel.

**Input** : `[{post1}, {post2}, {post3}, ...]`

**Output** : 
```
Item 0: {post1}
Item 1: {post2}
Item 2: {post3}
...
```

---

### 5.4 🎚️ Pré-filtrage (Code)

**Type** : `n8n-nodes-base.code`

**Rôle** : Filtre les posts AVANT l'analyse IA pour économiser les coûts.

**Critères de filtrage** :
- `numLikes >= 20` OU `numComments >= 5`
- Contenu texte >= 50 caractères
- Exclusion des reposts sans contenu

**Tri** : Par engagement décroissant (likes + comments × 3)

**Limite** : 30 posts max pour l'analyse IA

**Impact coût** : Réduit les appels OpenAI de ~70-80%

---

### 5.5 🔄 Batch (Split In Batches)

**Type** : `n8n-nodes-base.splitInBatches`

**Configuration** : `batchSize: 1`

**Rôle** : Envoie les posts un par un à l'API OpenAI pour éviter les erreurs de rate limit.

---

### 5.6 🧠 Analyse IA (HTTP Request)

**Type** : `n8n-nodes-base.httpRequest`

**Endpoint** : `POST https://api.openai.com/v1/chat/completions`

**Modèle** : `gpt-4o-mini` (20x moins cher que GPT-4-turbo)

**Prompt système** :
```
Tu es un expert en personal branding LinkedIn spécialisé Finance/Data. 
Analyse ce post pour identifier des opportunités d'engagement stratégique. 
Réponds UNIQUEMENT avec un JSON valide, sans texte avant ou après, sans backticks.
```

**Output attendu** :
```json
{
  "score_pertinence": 8,
  "categorie": "METIER",
  "persona_auteur": "DAF",
  "themes": ["reporting", "automatisation", "Power BI"],
  "opportunite_lead": true,
  "raison_opportunite": "DAF d'ETI avec problème de reporting manuel",
  "suggestion_commentaire": "Excellent point sur l'automatisation. On observe la même chose chez nos clients ETI...",
  "angle_approche": "business_value",
  "action": "commenter"
}
```

**Valeurs possibles** :

| Champ | Valeurs |
|-------|---------|
| `score_pertinence` | 1-10 |
| `categorie` | METIER, TECH, THOUGHT_LEADERSHIP, AUTRE |
| `persona_auteur` | DAF, CDG, CFO, FP&A, Data Analyst, Consultant, Autre |
| `angle_approche` | technique, business_value, storytelling, contrarian |
| `action` | commenter, connecter, DM_apres_commentaire, ignorer |

---

### 5.7 ⚙️ Process & Enrichissement (Code)

**Type** : `n8n-nodes-base.code`

**Rôle** :
1. Parser la réponse JSON de l'IA
2. Extraire les leads Finance des réactions
3. Combiner données post + analyse
4. Trier (leads first, puis par score)

**Extraction des leads** :
```javascript
const financeLeads = reactions.filter(r => {
  const job = r.profile?.occupation?.toLowerCase() || '';
  return job.includes('finance') || 
         job.includes('cfo') || 
         job.includes('daf') ||
         job.includes('fp&a') ||
         job.includes('controller');
});
```

---

### 5.8 🎯 Filter Score >= 6 (Filter)

**Type** : `n8n-nodes-base.filter`

**Condition** : `score >= 6`

**Mode** : `typeValidation: "loose"` (accepte string ou number)

**Rôle** : Ne garde que les posts suffisamment pertinents pour engagement.

---

### 5.9 📋 Save to Google Sheets (Google Sheets)

**Type** : `n8n-nodes-base.googleSheets`

**Opération** : `append`

**Destination** : Onglet `Posts_A_Commenter`

---

### 5.10 📊 Save Leads Séparément (Google Sheets)

**Type** : `n8n-nodes-base.googleSheets`

**Opération** : `append`

**Destination** : Onglet `Leads_Potentiels`

---

## 6. Mapping des champs Apify

### 6.1 Champs principaux

| Champ API | Type | Description | Exemple |
|-----------|------|-------------|---------|
| `url` | string | URL complète du post | `https://www.linkedin.com/feed/update/urn:li:activity:...` |
| `text` | string | Contenu textuel du post | `"100 ChatGPT Tips..."` |
| `authorName` | string | Nom complet de l'auteur | `"Nicolas Boucher"` |
| `authorHeadline` | string | Titre LinkedIn | `"I teach Finance Teams..."` |
| `authorProfileUrl` | string | URL du profil | `https://www.linkedin.com/in/bouchernicolas` |
| `authorProfileId` | string | ID public LinkedIn | `"bouchernicolas"` |
| `numLikes` | integer | Nombre de likes | `278` |
| `numComments` | integer | Nombre de commentaires | `45` |
| `numShares` | integer | Nombre de partages | `8` |
| `postedAtISO` | string | Date ISO de publication | `"2025-11-29T14:51:16.463Z"` |
| `postedAtTimestamp` | integer | Timestamp Unix (ms) | `1764427876463` |
| `timeSincePosted` | string | Temps relatif | `"6h"` |
| `type` | string | Type de post | `"text"`, `"image"`, `"document"`, `"video"` |

### 6.2 Champs détaillés (deepScrape: true)

| Champ | Type | Description |
|-------|------|-------------|
| `reactions` | array | Liste des réactions avec profils complets |
| `comments` | array | Liste des commentaires avec profils |
| `author` | object | Objet auteur complet (photo, background, etc.) |

### 6.3 Structure d'une réaction

```json
{
  "type": "LIKE",
  "profile": {
    "firstName": "Pierre-Emmanuel",
    "lastName": "Herlin",
    "occupation": "FP&A Director at eDreams ODIGEO | ESSEC MBA",
    "id": "106860751",
    "publicId": "pierreemmanuelherlin",
    "profileId": "ACoAAAZekM8BZLJJEdFiXQoj0l0dz-qiShpYyjk",
    "picture": "https://media.licdn.com/..."
  }
}
```

**Types de réactions** : `LIKE`, `EMPATHY`, `ENTERTAINMENT`, `INTEREST`, `APPRECIATION`, `PRAISE`

---

## 7. Structure Google Sheets

### 7.1 Onglet `Posts_A_Commenter`

| Colonne | Type | Description |
|---------|------|-------------|
| Date Analyse | DateTime | Timestamp de l'analyse |
| Statut | String | "À traiter", "Commenté", "Ignoré" |
| Score | Number | Score de pertinence (1-10) |
| Opportunité Lead | String | "🎯 OUI" ou "Non" |
| Auteur | String | Nom de l'auteur |
| Titre Auteur | String | Headline LinkedIn |
| Profil Auteur | URL | Lien vers le profil |
| URL Post | URL | Lien vers le post |
| Extrait Contenu | String | 300 premiers caractères |
| Likes | Number | Nombre de likes |
| Commentaires | Number | Nombre de commentaires |
| Catégorie | String | METIER, TECH, etc. |
| Persona | String | DAF, CFO, etc. |
| Thèmes | String | Liste des thèmes détectés |
| Raison Opportunité | String | Explication de l'opportunité |
| Commentaire Suggéré | String | Proposition de commentaire |
| Angle | String | Angle d'approche recommandé |
| Action | String | Action recommandée |
| Leads dans Réactions | String | Profils Finance ayant réagi |

### 7.2 Onglet `Leads_Potentiels`

| Colonne | Type | Description |
|---------|------|-------------|
| Date | DateTime | Date d'extraction |
| Source Post | URL | Post d'origine |
| Auteur Post | String | Auteur du post source |
| Leads Identifiés | String | Liste des leads (nom - titre) |
| Statut Contact | String | "À contacter", "Contacté", "Converti" |

---

## 8. Analyse des coûts

### 8.1 Coûts Apify

| Élément | Calcul | Coût |
|---------|--------|------|
| Posts par run | 5 recherches × 20 posts | 100 posts |
| Compute units/run | ~0.5 CU | ~$0.25 |
| Runs par jour | 6 | ~$1.50/jour |
| **Coût mensuel** | 30 jours | **~$45/mois** |

### 8.2 Coûts OpenAI (GPT-4o-mini)

| Élément | Calcul | Coût |
|---------|--------|------|
| Posts analysés/run | ~30 (après filtrage) | - |
| Tokens/analyse | ~800 input + ~200 output | ~1000 tokens |
| Prix GPT-4o-mini | $0.15/1M input, $0.60/1M output | - |
| Coût/run | 30 × 1000 tokens | ~$0.02 |
| Runs par jour | 6 | ~$0.12/jour |
| **Coût mensuel** | 30 jours | **~$4/mois** |

### 8.3 Coût total estimé

| Service | Mensuel | Annuel |
|---------|---------|--------|
| Apify | $45 | $540 |
| OpenAI | $4 | $48 |
| n8n Cloud (optionnel) | $20 | $240 |
| **TOTAL** | **$49-69** | **$588-828** |

### 8.4 ROI estimé

- **Leads générés** : ~50-100/mois
- **Taux conversion** : 2-5%
- **Valeur client moyen** : 5,000€
- **CA potentiel** : 5,000€ - 25,000€/mois
- **ROI** : 70x - 350x

---

## 9. Personnalisation

### 9.1 Modifier les recherches LinkedIn

Dans le node `🔍 Scrape LinkedIn Posts`, modifier le tableau `urls` :

```javascript
{
  "urls": [
    // Format : https://www.linkedin.com/search/results/content/?keywords=[MOTS_CLÉS]&datePosted="past-24h"
    
    // Recherches Finance
    "https://www.linkedin.com/search/results/content/?keywords=DAF%20transformation&datePosted=%22past-24h%22",
    
    // Recherches Tech
    "https://www.linkedin.com/search/results/content/?keywords=Power%20BI%20dashboard&datePosted=%22past-24h%22",
    
    // Recherches par persona
    "https://www.linkedin.com/search/results/content/?keywords=CFO%20strategy&datePosted=%22past-24h%22"
  ]
}
```

### 9.2 Ajuster les critères de filtrage

Dans le node `🎚️ Pré-filtrage`, modifier les seuils :

```javascript
// Seuil actuel
if (likes < 20 && comments < 5) continue;

// Pour plus de posts (moins strict)
if (likes < 10 && comments < 3) continue;

// Pour moins de posts (plus strict)
if (likes < 50 && comments < 10) continue;
```

### 9.3 Modifier le prompt IA

Dans le node `🧠 Analyse IA`, adapter le contexte :

```javascript
// Contexte à personnaliser
"**Contexte Mohamed:**\n" +
"- Data Business Analyst spécialisé Finance et Marketing\n" +
"- Expertise: Power BI, Python, automatisation reporting, FP&A\n" +
"- Cible: DAF, CDG, CFO, Head of FP&A de PME/ETI\n" +
"- Offre: Data Unlimited (consulting data premium)\n"
```

### 9.4 Ajouter des filtres de leads

Dans le node `⚙️ Process & Enrichissement`, étendre les critères :

```javascript
const financeLeads = reactions.filter(r => {
  const job = (r.profile?.occupation || '').toLowerCase();
  return job.includes('finance') || 
         job.includes('cfo') || 
         job.includes('daf') ||
         job.includes('fp&a') ||
         job.includes('controller') ||
         job.includes('contrôleur') ||
         job.includes('trésor') ||
         // Ajouts personnalisés
         job.includes('comptab') ||
         job.includes('audit') ||
         job.includes('directeur financier');
});
```

---

## 10. Troubleshooting

### 10.1 Erreurs courantes

#### ❌ "Error: Request failed with status code 401"
**Cause** : Token Apify ou OpenAI invalide
**Solution** : Vérifier et renouveler les credentials

#### ❌ "Error: Timeout of 300000ms exceeded"
**Cause** : Apify met trop de temps
**Solutions** :
- Réduire `limitPerSource` (10 au lieu de 20)
- Réduire le nombre d'URLs de recherche
- Augmenter le timeout à 600000ms

#### ❌ "Cannot read property 'choices' of undefined"
**Cause** : Réponse OpenAI vide ou malformée
**Solution** : Vérifier le crédit OpenAI et le format du prompt

#### ❌ "Invalid JSON in AI response"
**Cause** : L'IA n'a pas retourné un JSON valide
**Solution** : Le code gère déjà ce cas avec un fallback. Si fréquent, renforcer le prompt.

#### ❌ "Google Sheets: Document not found"
**Cause** : ID du document incorrect ou permissions manquantes
**Solution** : Vérifier l'ID et partager le Sheet avec le Service Account

### 10.2 Logs et debugging

1. **Activer les logs n8n** :
   ```bash
   export N8N_LOG_LEVEL=debug
   ```

2. **Tester node par node** :
   - Désactiver tous les nodes sauf le premier
   - Activer progressivement et vérifier les outputs

3. **Vérifier les données intermédiaires** :
   - Clic sur un node → onglet "Output"
   - Comparer avec le format attendu

### 10.3 Monitoring

Métriques à surveiller :
- Nombre de posts scrapés vs analysés
- Taux de posts avec score >= 6
- Nombre de leads extraits
- Coûts Apify et OpenAI quotidiens

---

## 11. Évolutions futures

### 11.1 Court terme (v2.1)

- [ ] Ajouter déduplication (éviter les doublons entre runs)
- [ ] Notification email des posts haute priorité
- [ ] Dashboard Notion ou Airtable au lieu de Sheets

### 11.2 Moyen terme (v3.0)

- [ ] Scraping des profils auteurs pour enrichissement
- [ ] Workflow DM automatique (après commentaire validé)
- [ ] Intégration CRM (HubSpot, Pipedrive)
- [ ] Analytics de performance (taux de réponse aux commentaires)

### 11.3 Long terme (v4.0)

- [ ] IA fine-tunée sur ton style de commentaire
- [ ] Prédiction de viralité des posts
- [ ] Multi-compte LinkedIn (équipe)
- [ ] API custom pour éviter les coûts Apify

---

## 📎 Annexes

### A. Ressources

- [Documentation Apify - linkedin-post](https://apify.com/supreme_coder/linkedin-post)
- [Documentation OpenAI API](https://platform.openai.com/docs)
- [Documentation n8n](https://docs.n8n.io)
- [Google Sheets API](https://developers.google.com/sheets/api)

### B. Changelog

| Version | Date | Modifications |
|---------|------|---------------|
| v1.0 | - | Version initiale (bugguée) |
| v2.0 | 2025-12-03 | Refonte complète, mapping corrigé, extraction leads |

### C. Auteur

**Mohamed Mmadi**  
Data Business Analyst | Fondateur Data Unlimited & Youbricks  
LinkedIn : [Profil à ajouter]

---

*Documentation générée le 3 décembre 2025*
