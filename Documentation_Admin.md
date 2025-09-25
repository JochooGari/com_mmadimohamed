# Documentation Complète - Page Admin & LinkedIn Agent

## Vue d'ensemble

La plateforme MagicPath comprend deux interfaces principales :
1. **Page Admin générale** : Gestion de contenu avec agents IA spécialisés
2. **LinkedIn Agent** : Système avancé de ghostwriting LinkedIn avec traitement IA des sources

Cette documentation couvre l'architecture complète, les fonctionnalités et les détails d'implémentation pour faciliter la reprise du code.

## Structure de l'interface

### Page principale (`AdminPage.tsx`)

**Localisation :** `src/pages/AdminPage.tsx`

La page principale offre une interface unifiée avec les éléments suivants :

- **Sélecteur de mode** : Basculer entre Articles et Ressources
- **Panneau d'agents** : Accès aux agents IA pour l'assistance à la rédaction
- **Canvas de workflow** : Interface visuelle pour orchestrer les processus IA
- **Éditeur de contenu** : Zone principale d'édition avec prévisualisation
- **Panneau SEO** : Optimisation automatique du référencement

## Gestion des API

### Diagnostic des clés API (`ApiKeyDiagnostic.tsx`)

**Localisation :** `src/components/ApiKeyDiagnostic.tsx`

#### Fonctionnalités principales

- **Vérification automatique** des clés API configurées
- **Support multi-providers** :
  - OpenAI (GPT-3.5/4)
  - Anthropic (Claude)
  - Google AI (Gemini)
  - Mistral AI
  - Perplexity

#### Interface de diagnostic

```tsx
const providers = [
  { id: 'openai', name: 'OpenAI', envVar: 'VITE_OPENAI_API_KEY' },
  { id: 'anthropic', name: 'Anthropic', envVar: 'VITE_ANTHROPIC_API_KEY' },
  { id: 'google', name: 'Google AI', envVar: 'VITE_GOOGLE_AI_API_KEY' },
  { id: 'mistral', name: 'Mistral AI', envVar: 'VITE_MISTRAL_API_KEY' },
  { id: 'perplexity', name: 'Perplexity', envVar: 'VITE_PERPLEXITY_API_KEY' }
];
```

#### Configuration requise

Créer un fichier `.env.local` avec :

```env
VITE_OPENAI_API_KEY=sk-...
VITE_ANTHROPIC_API_KEY=sk-ant-...
VITE_GOOGLE_AI_API_KEY=...
VITE_MISTRAL_API_KEY=...
VITE_PERPLEXITY_API_KEY=pplx-...
```

### Gestion sécurisée des clés

- **Masquage automatique** : Affichage partiel des clés (6 premiers + 4 derniers caractères)
- **Visibilité contrôlée** : Bouton pour révéler/masquer les clés complètes
- **Copie sécurisée** : Fonction de copie dans le presse-papier
- **Diagnostic en temps réel** : Vérification de la validité des clés

## Système d'agents IA

### Page de gestion (`AdminAgents.tsx`)

**Localisation :** `src/pages/AdminAgents.tsx`

#### Architecture des agents

Chaque agent IA comprend :

```typescript
type Agent = {
  id: string;
  name: string;
  role: string;
  prompt: string;
  systemPrompt?: string;
  status: 'active' | 'inactive';
  description?: string;
  category?: string;
  model: string;
  temperature?: number;
  maxTokens?: number;
  tools?: string[];
  variables?: Variable[];
  examples?: Example[];
};
```

#### Modèles IA supportés

- **GPT-4 Turbo** : 128k tokens, $0.01/1k tokens
- **GPT-3.5 Turbo** : 16k tokens, $0.002/1k tokens
- **Claude 3 Opus** : 200k tokens, $0.015/1k tokens
- **Claude 3 Sonnet** : 200k tokens, $0.003/1k tokens
- **Gemini Pro** : 32k tokens, $0.0005/1k tokens
- **Mistral Large** : 32k tokens, $0.008/1k tokens

#### Catégories d'agents

- Content Creation
- Data Analysis
- Marketing
- SEO
- Customer Support
- Research
- Productivity
- Development

### Agents pré-configurés

#### 1. Content Strategist
- **Modèle** : GPT-4 Turbo
- **Rôle** : Création de stratégies de contenu
- **Outils** : Recherche web, analyse de données
- **Variables** : public cible, secteur d'activité, objectifs

#### 2. AI Ghostwriter
- **Modèle** : Claude 3 Opus
- **Rôle** : Rédaction de contenu long-form
- **Format** : Markdown
- **Variables** : sujet, longueur cible, ton, mots-clés SEO

#### 3. SEO Optimizer
- **Modèle** : GPT-3.5 Turbo
- **Rôle** : Optimisation SEO
- **Format** : JSON
- **Variables** : contenu, mot-clé principal, mots-clés secondaires

#### 4. Data Analyst
- **Modèle** : Claude 3 Sonnet
- **Rôle** : Analyse de données et génération de rapports
- **Outils** : Calculatrice, analyse de données
- **Variables** : dataset, métriques, période

## Fonctionnalités de test des agents

### Mode test intégré

**Accès :** Bouton "Mode test" dans l'interface AdminAgents

#### Fonctionnalités de test

1. **Test en temps réel**
   - Interface de saisie de message de test
   - Affichage de la réponse simulée
   - Analyse des variables détectées

2. **Simulation de réponse**
   ```typescript
   const testAgent = async () => {
     if (!testInput.trim()) return;
     
     setTestOutput('🤖 Test en cours...');
     
     // Simulation d'appel API
     setTimeout(() => {
       setTestOutput(`**Agent:** ${draft.name}
       **Modèle:** ${getModelInfo(draft.model).name}
       **Température:** ${draft.temperature}
       
       **Réponse simulée:**
       Réponse basée sur le prompt configuré...`);
     }, 2000);
   };
   ```

3. **Validation de configuration**
   - Vérification des paramètres du modèle
   - Test des variables d'entrée
   - Validation des outils assignés

### Configuration avancée des tests

#### Paramètres de modèle testables

- **Température** : 0.0 (précis) à 2.0 (créatif)
- **Tokens max** : Jusqu'à la limite du modèle
- **Top P** : Contrôle de la diversité des réponses
- **Format de réponse** : Texte, Markdown, JSON

#### Variables d'entrée

Définition de variables typées :
- `string` : Texte simple
- `number` : Valeurs numériques
- `boolean` : Booléens
- `array` : Listes
- `object` : Objets complexes

#### Exemples (Few-shot learning)

Système d'exemples entrée/sortie pour améliorer la précision :

```typescript
type Example = {
  input: string;
  output: string;
};
```

### Outils disponibles pour les agents

1. **Recherche Web** : Accès aux informations en ligne
2. **Calculatrice** : Calculs mathématiques
3. **Lecteur de fichiers** : Analyse de documents
4. **Analyse de données** : Génération d'insights
5. **Générateur d'images** : Création visuelle
6. **Interpréteur de code** : Exécution et debug
7. **Envoi d'emails** : Communication automatisée
8. **Gestion du calendrier** : Planification

## Canvas de workflow

### Workflow visuel (`WorkflowCanvas.tsx`)

**Localisation :** `src/components/admin/WorkflowCanvas.tsx`

#### Fonctionnalités

- **Interface drag & drop** : Déplacement visuel des nœuds
- **Connexions intelligentes** : Création de liens entre étapes
- **Workflow par défaut** : Topic → Strategist → Ghostwriter → SEO
- **Sauvegarde automatique** : Persistance en localStorage

#### Nœuds de workflow

```typescript
type Node = { 
  id: string; 
  x: number; 
  y: number; 
  label: string 
};

type Edge = { 
  from: string; 
  to: string 
};
```

#### Intégration API

Appel d'API pour génération de contenu :

```typescript
const res = await fetch('/api/ai-draft', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ topic, language: 'fr' })
});
```

## Sécurité et bonnes pratiques

### Gestion des accès

- **AuthGuard** : Protection de toutes les pages admin
- **Vérification des permissions** : Contrôle d'accès granulaire

### Stockage local sécurisé

- **Chiffrement** : Données sensibles chiffrées
- **Validation** : Vérification de l'intégrité des données
- **Nettoyage** : Suppression automatique des données expirées

### Gestion d'erreurs

```typescript
try {
  const data = await apiCall();
  // Traitement des données
} catch (error) {
  console.error('Erreur API:', error);
  // Gestion gracieuse de l'erreur
}
```

## API et endpoints

### Endpoints principaux

- `POST /api/ai-draft` : Génération de brouillons
- `GET /api/agents` : Liste des agents disponibles
- `POST /api/agents/test` : Test d'agent
- `PUT /api/agents/:id` : Mise à jour d'agent

### Format de réponse

```json
{
  "success": true,
  "data": {
    "ghostwriter": {
      "blog": {
        "title_seo": "Titre optimisé",
        "meta_description": "Description SEO"
      },
      "draft_md": "Contenu markdown"
    }
  }
}
```

## Maintenance et monitoring

### Logs et debugging

- **Console logs** : Diagnostic des clés API
- **Error tracking** : Suivi des erreurs en temps réel
- **Performance monitoring** : Métriques de performance

### Mises à jour

- **Versioning des agents** : Gestion des versions
- **Migration de données** : Scripts de migration
- **Backup automatique** : Sauvegarde régulière

## Utilisation recommandée

### Workflow type

1. **Configuration initiale** : Vérifier les clés API
2. **Création d'agents** : Configurer les agents selon les besoins
3. **Test des agents** : Valider les configurations
4. **Création de contenu** : Utiliser le workflow complet
5. **Optimisation** : Ajuster les paramètres selon les résultats

### Bonnes pratiques

- **Tester régulièrement** les agents après modifications
- **Sauvegarder** les configurations importantes
- **Monitorer** les coûts d'utilisation des API
- **Optimiser** les prompts pour de meilleurs résultats
- **Documenter** les configurations personnalisées

# LinkedIn Agent - Documentation Technique Complète

## Architecture de la Page LinkedIn Agent

**Localisation :** `src/pages/LinkedInAgentPage.tsx`

### Interface Types & Structures

```typescript
interface ContentSource {
  id: string;
  name: string;
  title?: string;
  type: 'document' | 'transcript' | 'url' | 'article';
  fileType?: string;
  status: 'processing' | 'ready' | 'error';
  tags: string[];
  lastUpdated: string;
  addedDate: string;
  fileSize?: number;
  description?: string;
  storageUsed?: number;
}

interface Persona {
  id: string;
  name: string;
  type: 'ESN' | 'DAF' | 'Executive';
  painPoints: string[];
  objections: string[];
  kpis: string[];
  lexicon: string[];
}
```

## Système de Traitement IA des Fichiers

### Architecture de Traitement

1. **Upload & Extraction (`handleFileUpload`)**
   - Support multi-formats : Word, PDF, texte, audio
   - Génération d'ID unique : `${Date.now()}-${Math.random()}`
   - Extraction de métadonnées : taille, extension, type

2. **Traitement IA Optimisé (`processFileForAI`)**
   ```typescript
   const processFileForAI = async (file: File, sourceId: string) => {
     const content = await extractFileContent(file);
     const processedData = await optimizeForAI(content, file.type);
     
     // Structure optimisée pour migration web
     const optimizedStorage = {
       sourceId,
       fileName: file.name,
       processedAt: new Date().toISOString(),
       aiData: {
         chunks: number,
         keywords: number,
         suggestedTags: string[],
         embeddingVector: number[], // 384D
         summary: string,
         keyInsights: string[]
       },
       migrationReady: true
     };
   }
   ```

3. **Extraction de Contenu (`extractFileContent`)**
   - **Fichiers texte (.txt, .md)** : FileReader direct en UTF-8
   - **Documents Word (.docx)** : ✅ **Extraction réelle avec mammoth.js**
   - **Documents Word (.doc)** : Message de conversion vers .docx
   - **PDF** : Message de conversion recommandée vers .docx ou .txt
   - **Audio** : Simulation transcription (50ms)

   **🔧 Correction Technique (Sept 2025)** :
   - **Problème résolu** : Extraction binaire corrompue des fichiers Word
   - **Solution** : Intégration de mammoth.js pour traitement correct des .docx
   - **Avant** : `xml � (� ���j�0 E����Ѷ�J�` (données binaires corrompues)
   - **Après** : Extraction textuelle complète et lisible

### Stockage Dual-Layer

#### 1. Sources de Base
```javascript
// localStorage key: 'linkedin:sources'
{
  id: "unique-id",
  name: "document.docx",
  title: "Document Title",
  type: "document",
  fileType: "DOCX",
  status: "ready",
  tags: ["ESN", "recrutement"],
  addedDate: "2024-01-15",
  fileSize: 0.16,
  description: "Traité par IA - 15 chunks, 1250 mots-clés"
}
```

#### 2. Données IA Optimisées
```javascript
// localStorage key: 'linkedin:ai-processed'
{
  sourceId: "unique-id",
  fileName: "document.docx",
  processedAt: "2024-01-15T10:30:00Z",
  aiData: {
    chunks: 15,
    keywords: 1250,
    suggestedTags: ["ESN", "TJM", "recrutement"],
    embeddingVector: [0.1, -0.3, ...], // 384 dimensions
    summary: "Résumé automatique du contenu...",
    keyInsights: [
      "Point clé identifié dans le contenu",
      "Tendance métier détectée",
      "Opportunité business relevée"
    ]
  },
  migrationReady: true
}
```

## Organisation de l'Interface

### Layout Responsive

1. **Sources Internes (1/1)**
   - Tableau complet avec 7 colonnes
   - Actions : Voir données IA, Retraiter, Supprimer
   - Statistiques : Fichiers, Stockage, Statut IA, Traitement

2. **Veille Web (1/1)**
   - Domaines autorisés avec tags
   - Requêtes sauvegardées
   - Configuration cadence et langue

3. **Personas + Voix de Marque (1/2 + 2/2)**
   - Bibliothèque personas avec limitation 4 max
   - Assistant IA pour génération
   - Configuration voix de marque

### Système de Personas avec IA

#### Génération Automatique
```typescript
const generatePersonaWithAI = async (description: string) => {
  // Génération basée sur description utilisateur
  const aiPersona = {
    name: `${description} - Client Idéal`,
    type: 'Executive',
    painPoints: ["Budget serré", "Équipes résistantes"],
    objections: ["Coût trop important", "Timing pas adapté"],
    kpis: ["ROI", "Time-to-market"],
    lexicon: ["Transformation digitale", "KPI"]
  };
};
```

#### Stockage Personas
```javascript
// localStorage key: 'linkedin:personas'
[{
  id: "persona-1",
  name: "Directeur ESN Innovant",
  type: "ESN",
  painPoints: ["Pénurie de talents", "Marges sous pression"],
  objections: ["Prix trop élevé", "Pas le bon moment"],
  kpis: ["TJM moyen", "Taux d'intercontrat"],
  lexicon: ["Régie", "Forfait", "TJM", "Staffing"]
}]
```

## Fonctionnalités Avancées

### 1. Système de Surveillance des Fichiers

**Détection de Blocage :**
- Alerte si fichiers en traitement > 30s
- Bouton "Forcer le traitement" automatique
- Retraitement avec timeout réduit (1s)

**Indicateurs Visuels :**
- Animation de rotation pour traitement en cours
- Barre de progression globale
- Badge "Migration Ready" pour fichiers traités

### 2. Actions Contextuelles

```typescript
// Voir données IA traitées
const viewProcessedData = (sourceId: string) => {
  const processed = JSON.parse(localStorage.getItem('linkedin:ai-processed'));
  const sourceData = processed.find(p => p.sourceId === sourceId);
  // Affiche popup avec détails complets
};

// Retraitement forcé
const reprocessFile = (sourceId: string) => {
  // Reset statut + nouveau traitement rapide (1s)
  // Mise à jour des deux couches de stockage
};

// Suppression propre
const deleteSource = (sourceId: string) => {
  // Supprime source + données IA associées
  // Nettoyage complet des deux localStorage
};
```

### 3. Optimisations Performance

**Timings de Traitement :**
- Upload instantané
- Extraction Word (.docx) : ✅ **Réelle avec mammoth.js (~200ms)**
- Extraction Word (.doc) : Message d'erreur (format non supporté)
- Extraction PDF : Message de conversion recommandée
- Extraction texte : Instantané
- Traitement IA : 500ms
- **Total : < 1 seconde** pour fichiers .docx et .txt

**Gestion d'Erreurs :**
- Try/catch sur tous les traitements asynchrones
- Fallback automatique en cas d'échec
- États d'erreur avec possibilité de retraitement

## Architecture de Migration Web

### Structure Optimisée pour API

Les données sont stockées dans un format prêt pour migration :

```javascript
// Format migration-ready
{
  version: "1.0",
  timestamp: "2024-01-15T10:30:00Z",
  sources: [...], // Sources de base
  aiProcessed: [...], // Données IA optimisées
  personas: [...], // Bibliothèque personas
  migrationChecks: {
    totalFiles: number,
    processedFiles: number,
    readyForMigration: boolean,
    embeddingVectors: number,
    totalStorageKB: number
  }
}
```

### Points d'Intégration API Future

1. **Upload Endpoint :** `POST /api/linkedin/sources`
2. **Processing Endpoint :** `POST /api/linkedin/process`
3. **Personas Endpoint :** `GET|POST /api/linkedin/personas`
4. **Migration Endpoint :** `POST /api/linkedin/migrate`

## Dépendances Techniques

### Nouvelles Dépendances (Sept 2025)

#### mammoth.js
```json
{
  "mammoth": "^1.7.2"
}
```

**Utilisation :**
```typescript
import mammoth from 'mammoth';

const extractFileContent = async (file: File): Promise<string> => {
  if (file.name.endsWith('.docx')) {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value.trim();
  }
};
```

**Fonctionnalités :**
- ✅ Extraction textuelle complète des fichiers .docx
- ✅ Gestion des formats complexes (tableaux, listes, formatting)
- ✅ Préservation de la structure textuelle
- ❌ Pas de support .doc (ancien format)

**Installation :**
```bash
npm install mammoth --legacy-peer-deps
```

### Compatibilité
- **React 19** : Nécessite `--legacy-peer-deps` pour résoudre les conflits
- **TypeScript** : Support natif avec types inclus
- **Vite** : Compatible sans configuration supplémentaire

## Maintenance et Debugging

### Console Logs Importants

```javascript
// Diagnostic traitement
console.log('🔍 Traitement fichier:', {
  sourceId,
  fileName,
  fileSize,
  processingTime
});

// Debug extraction mammoth.js
console.log('📄 Extraction mammoth:', {
  fileName,
  fileType: file.type,
  extractedLength: text.length,
  firstChars: text.substring(0, 100)
});

// État de stockage
console.log('💾 Stockage local:', {
  sources: sources.length,
  processed: processedData.length,
  totalStorage: totalStorageKB
});

// Erreurs extraction
console.error('❌ Erreur extraction:', {
  fileName,
  error: error.message,
  fileType: file.type,
  fileSize: file.size
});
```

### Outils de Debug

1. **viewProcessedData()** : Inspection des données IA
2. **localStorage inspection** : Vérification des deux couches
3. **Indicateurs visuels** : Statuts en temps réel
4. **mammoth extraction logs** : Debug de l'extraction Word

### Troubleshooting Extraction Fichiers

#### Problème : Données binaires corrompues
**Symptômes :**
```
xml � (� ���j�0 E����Ѷ�J�(��ɢ�e h �*�8
```

**Cause :** Lecture des fichiers .docx comme texte brut (avant mammoth.js)

**Solution :** ✅ **Résolu avec mammoth.js** 
```typescript
// Avant (cassé)
const decoder = new TextDecoder('utf-8');
const text = decoder.decode(arrayBuffer);

// Après (corrigé)
const result = await mammoth.extractRawText({ arrayBuffer });
const text = result.value.trim();
```

#### Fichiers Supportés vs Non-Supportés
- ✅ **.docx** : Extraction complète avec mammoth
- ❌ **.doc** : Message de conversion vers .docx
- ✅ **.txt, .md** : Lecture directe UTF-8
- ⚠️ **.pdf** : Recommandation conversion

### Nettoyage des Données

```javascript
// Nettoyage complet (si nécessaire)
localStorage.removeItem('linkedin:sources');
localStorage.removeItem('linkedin:ai-processed');
localStorage.removeItem('linkedin:personas');
```

## Bonnes Pratiques

### Développement

1. **Toujours tester** les deux couches de stockage
2. **Vérifier la cohérence** entre sources et données IA
3. **Tester les cas d'erreur** (fichiers corrompus, timeouts)
4. **Monitorer les performances** (temps de traitement)

### Déploiement

1. **Backup des données** avant mises à jour
2. **Migration progressive** vers API web
3. **Monitoring du stockage** localStorage
4. **Tests de charge** avec gros fichiers

## Index des Fichiers & Composants

### Structure du Projet

```
src/
├── pages/
│   ├── AdminPage.tsx                 # Page admin principale
│   ├── AdminAgents.tsx              # Gestion agents IA généraux
│   ├── AdminApprovals.tsx           # Système d'approbation contenu
│   ├── LinkedInAgentPage.tsx        # ★ LinkedIn Agent complet
│   ├── AdminDashboard.tsx           # Dashboard analytics
│   ├── AdminAnalytics.tsx           # Métriques et KPIs
│   └── AdminSettings.tsx            # Configuration système
├── components/
│   ├── admin/
│   │   ├── AdminLayout.tsx          # Layout navigation admin
│   │   ├── AdminEditor.tsx          # Éditeur de contenu
│   │   ├── AdminTable.tsx           # Tableau sources/articles
│   │   ├── AgentsPanel.tsx          # Panneau agents IA
│   │   ├── WorkflowCanvas.tsx       # Canvas workflow visuel
│   │   └── AuthGuard.tsx            # Protection accès admin
│   ├── ui/                          # Composants UI réutilisables
│   │   ├── card.tsx, button.tsx     # Composants de base
│   │   ├── input.tsx, textarea.tsx  # Champs de saisie
│   │   └── tabs.tsx, badge.tsx      # Navigation et badges
│   └── ApiKeyDiagnostic.tsx         # ★ Diagnostic clés API
├── context/
│   ├── AdminDataContext.tsx         # Context données admin
│   └── ContentContext.tsx           # Context contenu global
└── lib/
    ├── aiProviders.tsx              # ★ Configuration providers IA
    ├── supabase.tsx                 # Client base de données
    └── utils.tsx                    # Utilitaires généraux
```

### Composants Clés LinkedIn Agent

| Composant | Responsabilité | État |
|-----------|---------------|------|
| `ContentSource` interface | Structure données fichiers | ✅ |
| `Persona` interface | Structure clients idéaux | ✅ |
| `handleFileUpload()` | Upload et traitement initial | ✅ |
| `processFileForAI()` | Traitement IA complet | ✅ |
| `generatePersonaWithAI()` | Génération personas IA | ✅ |
| `viewProcessedData()` | Inspection données IA | ✅ |
| `reprocessFile()` | Retraitement fichiers | ✅ |

### Configuration localStorage

```javascript
// Clés utilisées par le système
'linkedin:sources'        // Sources de fichiers
'linkedin:ai-processed'   // Données IA optimisées  
'linkedin:personas'       // Bibliothèque personas
'admin:agents'           // Agents IA généraux
'admin:approvals'        // Files d'approbation
```

### Variables d'Environnement Requises

```env
# API Keys pour providers IA
VITE_OPENAI_API_KEY=sk-...
VITE_ANTHROPIC_API_KEY=sk-ant-...
VITE_GOOGLE_AI_API_KEY=...
VITE_MISTRAL_API_KEY=...
VITE_PERPLEXITY_API_KEY=pplx-...

# Configuration Supabase (optionnel)
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

## Checklist de Reprise de Projet

### ✅ Étapes de Setup

1. **Installation dépendances**
   ```bash
   npm install
   npm run dev
   ```

2. **Configuration environnement**
   - Copier `.env.example` vers `.env.local`
   - Remplir les clés API nécessaires
   - Tester diagnostic API via `/admin`

3. **Vérification fonctionnalités**
   - [ ] Upload fichiers LinkedIn Agent
   - [ ] Traitement IA < 1s
   - [ ] Création/édition personas
   - [ ] Sauvegarde localStorage
   - [ ] Navigation admin complète

4. **Tests de migration**
   - [ ] Export données localStorage
   - [ ] Vérification format migration-ready
   - [ ] Test des endpoints API (si disponibles)

### 🚨 Points d'Attention

**Performance :**
- Surveiller taille localStorage (limite ~10MB)
- Optimiser traitement gros fichiers (>5MB)
- Monitorer temps de réponse IA

**Sécurité :**
- Validation uploads côté client
- Sanitisation contenu extrait
- Protection clés API

**UX/UI :**
- États de chargement visuels
- Messages d'erreur explicites
- Feedback utilisateur temps réel

## Migration vers Production

### Phase 1 : API Backend
1. Créer endpoints REST pour sources
2. Implémenter traitement IA serveur
3. Migration progressive localStorage → API

### Phase 2 : Optimisations
1. Authentification robuste
2. Gestion fichiers cloud (S3/GCS)
3. Cache Redis pour performances

### Phase 3 : Fonctionnalités Avancées
1. Collaboration multi-utilisateurs
2. Historique des modifications
3. Analytics avancées

Cette documentation complète permet une reprise facile du code avec tous les détails techniques nécessaires. 

**Dernière mise à jour :** Septembre 2025  
**Version :** 2.1 - Veille connectée + Déconnexion + Chat OpenAI strict

## Nouveautés (Sept 2025)

- Bouton « Se déconnecter » ajouté dans la sidebar (sous `Settings`) avec confirmation. Déconnexion Supabase si configuré, purge des marqueurs de session locaux, redirection `/login`. Les sources et la veille restent persistées.
- Chat de Vérification IA: suppression du fallback. Si `VITE_OPENAI_API_KEY` est absente/incorrecte, un message explicite s’affiche et aucune réponse simulée n’est produite.
- Veille LinkedIn/Web/RSS: endpoint `/api/monitoring` pour lancer un cycle de veille réel et stocker les résultats dans `data/monitoring/`. Support de:
  - `linkedin.postUrls` (public URLs de posts) — extraction de titre/description + métriques approximatives si détectables.
  - `rss.feeds` — parsing basique RSS/Atom.
  - `websites.urls` + `SITE_URL` — parsing sitemap puis extraction contenu des pages.
- Déduplication: la veille n’ajoute pas deux fois la même URL.

### Configuration de la veille

Fichier optionnel: `data/monitoring/config.json`

```json
{
  "linkedin": {
    "postUrls": [
      "https://www.linkedin.com/posts/...",
      "https://www.linkedin.com/posts/..."
    ]
  },
  "rss": {
    "feeds": [
      "https://hbr.org/feed",
      "https://blog.hubspot.com/feed.xml"
    ]
  },
  "websites": {
    "urls": [
      "https://ton-domaine",
      "https://mckinsey.com"
    ]
  }
}
```

Variables d’env utiles:

```
SITE_URL=https://ton-domaine (permet de crawler /sitemap.xml)
VITE_OPENAI_API_KEY=sk-...
```

### Utilisation

- Depuis l’onglet `Veille` du LinkedIn Agent, bouton « Lancer Veille » → POST `/api/monitoring` → collecte et stockage dans `data/monitoring/`.
- Les stats sont mises à jour via l’index `data/monitoring/monitoring_index.json`.
- Autorités (personnes/sources) identifiées via l’analyse de contenu (extraction d’auteurs et agrégation par occurrences). Un rapport quotidien est généré dans `data/monitoring/reports/`.

### Accès contenu interne

- Les articles/ressources du site sont intégrés via le sitemap (`SITE_URL/sitemap.xml`). Le contenu est extrait côté serveur (HTML → texte), puis indexé dans la veille.
- Le chat IA exploite vos fichiers (Knowledge) + la veille pour proposer des posts à forte valeur.

### Anti-doublons

- Déduplication par URL côté collecte.
- Recherche de similarité (mots‑clés) côté optimisation pour éviter de re‑proposer des posts quasi identiques.

## Déconnexion, Chat IA strict et backend local

### Bouton « Se déconnecter »

- Présent dans la sidebar sous `Settings` avec confirmation.
- Si Supabase est configuré, effectue `supabase.auth.signOut()`.
- Purge les marqueurs de session locaux puis redirige vers `/login`.
- Les sources internes et la veille restent persistées dans `IndexedDB` et `data/monitoring/`.

### Chat IA de vérification — pas de fallback

- Le Chat exploite vos documents internes + la veille comme contexte (RAG via `aiService`).
- Si la variable `VITE_OPENAI_API_KEY` est absente/incorrecte, un message explicite s’affiche et aucun simulacre n’est produit.
- Vérifier/ajouter la clé dans `.env.local` en local, et dans Vercel (Production) pour la prod.

### Démarrage backend local (APIs Vercel)

- Les endpoints `/api/*` tournent via Vercel Functions.
- En local, lancer le serveur Vercel sur `:3000` pour que le proxy Vite fonctionne:

```bash
cd magicpath-project
vercel dev --yes --confirm --port 3000
```

- Le `vite.config.ts` redirige `^/api/` vers `http://localhost:3000` en dev.

## Endpoint d’amorçage admin (Supabase)

### Objet

Crée un utilisateur test en production dans Supabase: `email: test@test.com`, `password: 1234test`.

### Endpoint

```
POST /api/admin/seed-test-user
Headers: { "x-seed-token": ADMIN_SEED_TOKEN }
Body: { "email": "test@test.com", "password": "1234test" }
```

### Sécurité & variables requises (Vercel → Production)

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY` (server only)
- `ADMIN_SEED_TOKEN` (secret à choisir)

Exemple d’appel:

```bash
curl -X POST "$SITE_URL/api/admin/seed-test-user" \
  -H "Content-Type: application/json" \
  -H "x-seed-token: $ADMIN_SEED_TOKEN" \
  -d '{"email":"test@test.com","password":"1234test"}'
```

Réponse attendue: `{ ok: true, created: true, userId: "..." }`.

## Variables d’environnement — récapitulatif

Ajouter en local (fichier `.env.local`) et/ou sur Vercel (Production):

```
# IA / Chat (côté serveur uniquement)
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=...
GOOGLE_AI_API_KEY=...
MISTRAL_API_KEY=...
PERPLEXITY_API_KEY=...

# Site (utile à la veille pour crawler le sitemap)
SITE_URL=https://votre-domaine

# Supabase (client)
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...

# Supabase (serveur)
SUPABASE_SERVICE_ROLE_KEY=...

# Endpoint seed admin
ADMIN_SEED_TOKEN=...
```

## Chat IA — sécurité des clés

- Le composant `KnowledgeChat` appelle désormais l’endpoint serveur `/api/ai-proxy`.
- Les clés IA ne sont plus exposées côté client (plus besoin de `VITE_OPENAI_API_KEY`).
- Configurez uniquement les clés côté serveur (variables non préfixées par `VITE_`).

## Mise à jour du schéma Supabase

- Le PRD inclut un DDL minimal (tables `articles`, `resources`, `messages` + RLS, index).
- Voir `docs/supabase/README.md` pour appliquer la migration via l’éditeur SQL Supabase ou la CLI.
- Une migration prête à l’emploi est fournie: `supabase/migrations/20250919_init.sql`.

## Notes de déploiement

- Déployer en production: `vercel --prod --yes`.
- Vérifier les logs si besoin: `vercel inspect <deployment> --logs`.
- Après déploiement, exécuter l’endpoint de seed si vous avez besoin du compte admin de test.

### Configuration Vercel (SPA + sitemaps)

Un fichier `vercel.json` est versionné pour garantir:

```json
{
  "rewrites": [
    { "source": "/robots.txt", "destination": "/api/robots" },
    { "source": "/sitemap.xml", "destination": "/api/sitemap" },
    { "source": "/sitemap-articles.xml", "destination": "/api/sitemap?type=articles" },
    { "source": "/sitemap-ressources.xml", "destination": "/api/sitemap?type=resources" },
    { "source": "/api/(.*)", "destination": "/api/$1" },
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

- Le dernier rewrite redirige toutes les routes client (`/admin`, `/blog/:slug`, etc.) vers `index.html` (SPA), évitant les 404.
- Les routes `robots.txt`, `sitemap*` et tout `/api/*` restent servies par les fonctions.