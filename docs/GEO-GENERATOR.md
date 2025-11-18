# Générateur Article GEO

Documentation des fonctionnalités du module de génération d'articles optimisés pour les moteurs IA (GEO - Generative Engine Optimization).

## Table des matières

1. [Vue d'ensemble](#vue-densemble)
2. [Fonctionnalités prioritaires](#fonctionnalités-prioritaires)
3. [Fonctionnalités futures](#fonctionnalités-futures)
4. [Architecture technique](#architecture-technique)
5. [Roadmap](#roadmap)

---

## Vue d'ensemble

Le Générateur Article GEO est un outil de création de contenu optimisé pour être cité par les moteurs de recherche IA (Perplexity, Google AI Overviews, Bing Copilot, ChatGPT Browse).

### Objectif
Produire des articles de qualité professionnelle style Neil Patel, avec :
- Structure optimale pour les citations IA
- Sources fiables et données chiffrées
- FAQ et JSON-LD pour les rich snippets
- Scoring SEO/GEO automatisé

### Workflow principal
```
Sources (Knowledge Base) → Extraction requêtes → Génération article → Scoring → Publication
```

---

## Fonctionnalités prioritaires

### 1. Upload & Analyse de documents

**Priorité :** ⭐⭐⭐⭐⭐
**État :** À implémenter
**Emplacement :** Onglet "Sources"

#### Description
Permet d'alimenter la base de connaissances avec vos documents propriétaires pour que l'IA génère des articles basés sur VOS insights, pas des généralités.

#### Fonctionnalités
- Upload de fichiers (PDF, DOCX, TXT, MP3, WAV)
- Parsing et extraction du texte
- Analyse IA pour identifier :
  - Questions implicites
  - Pain points récurrents
  - Entités clés (personnes, entreprises, concepts)
  - Données chiffrées
- Stockage dans Supabase comme "knowledge base"
- Tagging automatique (#prompting, #AI_writing, etc.)

#### Formats supportés
| Format | Extension | Traitement |
|--------|-----------|------------|
| Document texte | .txt | Direct |
| PDF | .pdf | Parser PDF (pdf-parse) |
| Word | .docx | Parser DOCX (mammoth) |
| Audio | .mp3, .wav | Transcription (Whisper API) |

#### API Backend
```typescript
// POST /api/geo
{
  action: 'upload_document',
  file: File,
  metadata: {
    name: string,
    type: 'transcript' | 'study' | 'brief' | 'other',
    tags: string[]
  }
}

// Response
{
  id: string,
  status: 'processed',
  extracted: {
    queries: string[],
    entities: string[],
    painPoints: string[],
    stats: { key: string, value: string, source: string }[]
  }
}
```

#### Interface utilisateur
- Zone de drag & drop
- Liste des documents uploadés avec statut
- Badges de tags extraits
- Nombre de queries extraites par document
- Bouton "Voir détails" pour chaque document

---

### 2. Extraction automatique de requêtes depuis transcripts

**Priorité :** ⭐⭐⭐⭐⭐
**État :** À implémenter
**Emplacement :** Onglet "Requêtes"

#### Description
Transforme automatiquement un transcript (réunion client, interview, podcast) en questions exploitables pour la génération d'articles.

#### Fonctionnalités
- Analyse sémantique du transcript
- Identification des questions explicites et implicites
- Classification par intention :
  - **Informational** : "Qu'est-ce que...", "Pourquoi..."
  - **How-to** : "Comment faire...", "Étapes pour..."
  - **Comparison** : "X vs Y", "Différences entre..."
  - **Transactional** : "Prix de...", "Où acheter..."
- Regroupement en clusters thématiques
- Attribution de personas (ESN, DAF, Executive)
- Priorisation (high/medium/low)

#### API Backend
```typescript
// POST /api/geo
{
  action: 'extract_queries',
  documentId: string,
  // ou
  text: string
}

// Response
{
  clusters: [
    {
      id: string,
      theme: string,
      queries: string[],
      intent: 'informational' | 'howto' | 'comparison' | 'transactional',
      personas: string[],
      priority: 'high' | 'medium' | 'low',
      volumeEstimate: number
    }
  ]
}
```

#### Interface utilisateur
- Liste des clusters avec badges intent/priority
- Affichage des queries par cluster
- Bouton "Générer contenu GEO" par cluster
- Bouton "Analyser concurrence" par cluster
- Estimation du volume de recherche mensuel

---

### 3. Scoring GEO réel

**Priorité :** ⭐⭐⭐⭐⭐
**État :** À implémenter (actuellement hardcodé 82/84)
**Emplacement :** GEOGenerator + Onglet "Optimisation"

#### Description
Évalue réellement la qualité GEO de l'article généré selon des critères objectifs, avec suggestions d'amélioration actionables.

#### Critères de scoring (100 points)

| Critère | Poids | Description |
|---------|-------|-------------|
| **Answerability** | 25% | Réponse directe ≤60 mots en tête de section |
| **Evidence Coverage** | 25% | Sources citées pour chaque claim chiffrée |
| **Entity Density** | 15% | Présence d'entités nommées (personnes, orgs, concepts) |
| **Structure Readability** | 15% | H2/H3 en questions, listes, tableaux |
| **Recency** | 10% | Fraîcheur des données (< 90 jours) |
| **Originality Data** | 10% | Données propriétaires vs génériques |

#### Analyse détaillée
- **Structure** : Nombre de H2/H3, présence de listes/tableaux
- **Sources** : Nombre de citations, qualité des domaines
- **Entités** : Extraction NER (Named Entity Recognition)
- **Fraîcheur** : Date des sources citées
- **Mots-clés** : Densité et placement

#### API Backend
```typescript
// POST /api/geo
{
  action: 'score_live',
  html: string,
  config: {
    weights: {
      answerability: 0.25,
      evidenceCoverage: 0.25,
      entityDensity: 0.15,
      structureReadability: 0.15,
      recency: 0.10,
      originalityData: 0.10
    }
  }
}

// Response
{
  scores: {
    seo: number,  // 0-100
    geo: number   // 0-100
  },
  breakdown: {
    answerability: { score: number, max: 25, details: string },
    evidenceCoverage: { score: number, max: 25, details: string },
    entityDensity: { score: number, max: 15, details: string },
    structureReadability: { score: number, max: 15, details: string },
    recency: { score: number, max: 10, details: string },
    originalityData: { score: number, max: 10, details: string }
  },
  strengths: string[],
  weaknesses: string[],
  fixes: string[],
  entities: string[],
  sources: { url: string, domain: string, date: string }[]
}
```

#### Interface utilisateur
- Score global GEO/SEO en badges colorés
- Breakdown par critère avec barres de progression
- Liste des forces et faiblesses
- Suggestions d'amélioration prioritaires
- Bouton "Optimiser automatiquement"

---

### 4. FAQ & JSON-LD dynamique

**Priorité :** ⭐⭐⭐⭐
**État :** À implémenter (actuellement template générique)
**Emplacement :** GEOGenerator

#### Description
Génère de vraies FAQ basées sur le contenu de l'article avec le JSON-LD FAQPage valide pour les rich snippets Google.

#### Fonctionnalités
- Extraction des questions implicites dans l'article
- Génération de réponses concises (≤100 mots)
- JSON-LD Schema.org FAQPage valide
- Intégration dans l'article exporté
- Preview du rendu Google

#### API Backend
```typescript
// POST /api/geo
{
  action: 'faq_generate',
  topic: string,
  articleHtml: string,
  maxQuestions: number  // default: 5
}

// Response
{
  faq: [
    {
      q: string,
      a: string,
      source: string  // section de l'article
    }
  ],
  jsonld: {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [...]
  }
}
```

#### Interface utilisateur
- Liste des Q/A générées
- Édition inline des réponses
- Preview JSON-LD
- Bouton "Insérer dans l'article"
- Validation Schema.org

---

### 5. Benchmark concurrence

**Priorité :** ⭐⭐⭐⭐
**État :** À implémenter (actuellement 2 lignes hardcodées)
**Emplacement :** GEOGenerator

#### Description
Analyse les articles concurrents sur le même sujet pour identifier les gaps et définir un score cible réaliste.

#### Fonctionnalités
- Recherche des top 10 articles sur le sujet
- Analyse de chaque concurrent :
  - Structure (H2/H3, listes, tableaux)
  - Longueur (nombre de mots)
  - Médias (images, vidéos, graphiques)
  - Sources citées
  - Score GEO estimé
- Identification des gaps de contenu
- Recommandations pour se différencier

#### API Backend
```typescript
// POST /api/geo
{
  action: 'benchmark',
  topic: string,
  keywords: string[],
  maxResults: number  // default: 10
}

// Response
{
  rows: [
    {
      url: string,
      title: string,
      score: number,
      wordCount: number,
      media: number,
      sources: number,
      structure: {
        h2Count: number,
        h3Count: number,
        hasTables: boolean,
        hasLists: boolean
      }
    }
  ],
  gaps: string[],
  recommendations: string[],
  targetScore: number
}
```

#### Interface utilisateur
- Tableau des concurrents avec métriques
- Liens cliquables vers les articles
- Mise en évidence des gaps
- Score cible recommandé
- Bouton "Analyser un URL spécifique"

---

### 6. Liens internes intelligents

**Priorité :** ⭐⭐⭐⭐
**État :** À améliorer (actuellement parse juste le sitemap)
**Emplacement :** GEOGenerator

#### Description
Suggère des liens internes contextuels basés sur le contenu sémantique de l'article, pas juste les URLs du sitemap.

#### Fonctionnalités
- Indexation du contenu de chaque page interne
- Matching sémantique avec les sections de l'article
- Suggestion de l'emplacement optimal
- Texte d'ancrage recommandé
- Score de pertinence

#### API Backend
```typescript
// POST /api/geo
{
  action: 'internal_links',
  topic: string,
  articleSections: [
    { id: string, title: string, content: string }
  ]
}

// Response
{
  links: [
    {
      url: string,
      title: string,
      anchorText: string,
      targetSection: string,  // ID de la section
      relevanceScore: number,
      reason: string
    }
  ]
}
```

#### Interface utilisateur
- Liste des liens suggérés par section
- Texte d'ancrage éditable
- Score de pertinence
- Bouton "Insérer" pour chaque lien
- Preview du placement dans l'article

---

### 7. CTA contextuels

**Priorité :** ⭐⭐⭐
**État :** À implémenter (actuellement 3 CTAs fixes)
**Emplacement :** GEOGenerator

#### Description
Génère des appels à l'action adaptés au sujet, à l'audience et à l'intention de l'article.

#### Fonctionnalités
- Analyse du sujet et de l'audience
- Génération de CTAs variés :
  - Téléchargement (guide, checklist, template)
  - Contact (démo, audit, appel)
  - Navigation (article connexe, catégorie)
- Variantes de style (primary, outline, link)
- Placement optimal suggéré

#### API Backend
```typescript
// POST /api/geo
{
  action: 'cta_generate',
  topic: string,
  audience: string,
  intent: 'lead_gen' | 'engagement' | 'conversion',
  existingCtas: string[]  // URLs de ressources disponibles
}

// Response
{
  ctas: [
    {
      label: string,
      href: string,
      variant: 'primary' | 'outline' | 'link',
      placement: 'introduction' | 'middle' | 'conclusion',
      reason: string
    }
  ]
}
```

#### Interface utilisateur
- Liste des CTAs générés
- Sélection du style/variant
- Édition du label et URL
- Bouton "Insérer" avec placement suggéré

---

## Fonctionnalités futures

### 8. Mode Pain Point ⭐⭐⭐
**État :** À implémenter ultérieurement

Force la structure "Problème → Solution → Tips" dans chaque section pour des articles plus engageants et orientés conversion.

---

### 9. Génération d'images ⭐⭐⭐
**État :** À implémenter ultérieurement

Illustrations personnalisées via DALL-E 3 :
- Schémas explicatifs
- Graphiques de données
- Infographies
- Images de couverture

---

### 10. Moteurs IA ciblés ⭐⭐⭐
**État :** À implémenter ultérieurement

Adaptation du style selon le moteur cible :
- **Perplexity** : Sources récentes < 30j, données chiffrées
- **AI Overviews** : Réponse 60 mots + développement
- **Copilot** : Structure FAQ, listes

---

## Architecture technique

### Frontend
- **Page :** `src/pages/GEOAgentPage.tsx`
- **Composant principal :** `src/components/GEOGenerator.tsx`
- **Hook centralisé :** `src/hooks/useAgents.ts`

### Backend
- **API :** `api/geo.ts`
- **Proxy AI :** `api/ai-proxy.ts`
- **Stockage :** Supabase Storage (bucket `agents`)

### Modèles IA utilisés
| Étape | Provider | Modèle | Usage |
|-------|----------|--------|-------|
| Écriture | OpenAI | gpt-4o | Génération du draft |
| Révision | Anthropic | claude-sonnet-4-5 | Amélioration clarté |
| Scoring | Perplexity | sonar | Analyse GEO/SEO |

### Stockage Supabase
```
agents/
├── geo/
│   ├── templates/
│   │   ├── index.json
│   │   └── {id}.json
│   ├── exports/
│   │   └── article_{id}.html
│   ├── inputs/
│   │   ├── prompt_settings.json
│   │   └── painpoint_mode.json
│   ├── knowledge/
│   │   ├── documents/
│   │   │   └── {id}.json
│   │   └── queries/
│   │       └── clusters.json
│   └── versions/
│       └── log.json
```

---

## Roadmap

### Phase 1 : Core fonctionnel (actuel)
- [x] Génération multi-modèles (chain_draft)
- [x] Import template HTML/URL
- [x] Sélection provider/modèle
- [x] Prompts personnalisés
- [x] Export HTML
- [x] Persistance settings

### Phase 2 : Knowledge Base
- [ ] Upload & analyse documents
- [ ] Extraction requêtes depuis transcripts
- [ ] Indexation knowledge base

### Phase 3 : Scoring & Optimisation
- [ ] Scoring GEO réel
- [ ] FAQ & JSON-LD dynamique
- [ ] Benchmark concurrence

### Phase 4 : Maillage & Conversion
- [ ] Liens internes intelligents
- [ ] CTA contextuels

### Phase 5 : Avancé
- [ ] Mode Pain Point
- [ ] Génération d'images
- [ ] Optimisation par moteur IA

---

## Changelog

### v1.0.0 (actuel)
- Génération d'articles multi-modèles
- Import/export templates
- Édition par section

### v1.1.0 (à venir)
- Upload documents
- Extraction requêtes
- Scoring GEO réel
