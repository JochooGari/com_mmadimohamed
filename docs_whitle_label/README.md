## AI Service White‑Label – Guide d’intégration

Ce dossier fournit tout le nécessaire pour réutiliser et dupliquer le système d’IA (frontend + backend) de `YouTube Creator` dans un autre projet web SaaS.

### Ce que vous obtenez
- **Frontend**: services d’IA prêts à l’emploi (`AIService_dev.jsx`, `AIService_prod.jsx`, services d’analyse/stratégie/transformation, agrégateur d’environnement, gestion intelligente des ports).
- **Backend**: routes et services d’IA unifiés (multi‑providers), orchestrateur d’agents, configurations de prompts/agents.
- **ENV samples**: variables d’environnement à renseigner pour chaque projet.

### Architecture
- **Frontend**
  - `src/components/services/index.jsx`: sélection auto dev/prod et export des services.
  - `AIService_dev.jsx`: utilise OpenAI directement ou délègue au backend via détection de port (`/api/agents`).
  - `AIService_prod.jsx`: configuration par variables d’environnement (`VITE_BACKEND_URL`/`VITE_BACKEND_PORT`).
  - Services complémentaires: `TransformationService.jsx`, `StrategyService.jsx`, `BusinessIntelligenceService.jsx`.
  - Intégrations optionnelles via `InvokeLLM` (Base44). Si vous ne souhaitez pas installer `@base44/sdk`, remplacez les appels `InvokeLLM(...)` par `aiService.invokeLLM(...)` ou `aiService.openAIRequest(...)` selon besoin.

- **Backend**
  - `backend/routes/agents.js`: endpoints `/api/agents/*` (transform, workflows, status, providers, etc.).
  - `backend/services/AIService.js`: client IA unifié (OpenAI, Perplexity, Claude, Gemini) piloté par ENV.
  - `backend/services/AgentOrchestrator.js`: agents spécialisés (veille, script, newsletter, twitter) + workflows.
  - `backend/config/*.json`: prompts, agents, providers et options.

### Dépendances minimales
- Frontend: React + fetch natif. Optionnel: `@base44/sdk` si vous gardez `src/api/integrations.js` tel quel.
- Backend: Node 18+, `express`, `cors`, `dotenv`. Fournissez vos clés API (voir ENV).

### Variables d’environnement
- Frontend (`.env` ou `.env.local`):
  - `VITE_OPENAI_API_KEY` (optionnel si tout passe par le backend)
  - `VITE_BACKEND_URL` (ex: `http://localhost:3003`) OU `VITE_BACKEND_PORT`
  - `VITE_BACKEND_FALLBACK_PORTS` (ex: `3003,3002,3001`)

- Backend (`.env` ou `backend/.env`):
  - `PORT` (par défaut 3003)
  - `OPENAI_API_KEY`, `PERPLEXITY_API_KEY`, `CLAUDE_API_KEY`, `GEMINI_API_KEY`
  - `CORS_ORIGIN` (ex: `http://localhost:5173`)

Des fichiers exemples sont fournis: `frontend.env.sample`, `backend.env.sample`.

### Installation rapide
1) Copiez le contenu de `docs_whitle_label/frontend/` dans le frontend de votre projet, en préservant la structure des dossiers `src/...`.
2) Copiez le contenu de `docs_whitle_label/backend/` dans votre backend (ou fusionnez avec votre API existante) et installez les dépendances nécessaires.
3) Créez vos fichiers `.env` à partir des samples et renseignez vos clés.
4) Lancez le backend, puis le frontend.

### Endpoints backend essentiels
- `POST /api/agents/transform` → transformation via prompts: `promptId` ∈ `article | tweets | newsletters | intelligence`.
- `POST /api/agents/workflows/content-creation` → chaîne complète (script/article, tweets, newsletters).
- `GET /api/agents/health` et `GET /api/agents/status` → santé et statut.

### Exemple d’appel frontend (génération article GEO)
```js
const result = await aiService.generateGEOArticle(transcript, title, { tone: 'professionnel', length: 'long' });
if (result.success) console.log(result.article);
```

### Adaptation white‑label (conseils)
- Remplacez les noms/URLs de domaine dans `ServiceConfig` et `ports.js`.
- Si vous n’utilisez pas Base44, remplacez `InvokeLLM` par `aiService.openAIRequest`/`invokeLLM` dans les services concernés.
- Sécurisez vos clés: n’ajoutez jamais de clés réelles dans le code source. Utilisez `.env`.

### Contenu du dossier
- `frontend/` → copies prêtes des fichiers sources (services & intégrations).
- `backend/` → services, routes et configs nécessaires au système IA.
- `frontend.env.sample`, `backend.env.sample` → modèles d’ENV.

### Licence & limites
Réutilisation interne/white‑label uniquement. Vérifiez les licences des providers IA tiers et respectez leurs conditions d’utilisation.


