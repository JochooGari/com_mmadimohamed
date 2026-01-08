# PROBLÈME: GPT-5.1 Responses API - JSON Mode ne fonctionne pas

**Date**: 2025-11-20
**Modèle**: gpt-5.1-turbo-2025-07-15
**API**: OpenAI Responses API (`/v1/responses`)
**Contexte**: Génération d'articles par sections avec output JSON

---

## RÉSUMÉ DU PROBLÈME

GPT-5.1 via Responses API génère du **JSON invalide** (guillemets non échappés dans le HTML) même avec `text.format` correctement configuré selon la documentation OpenAI.

**Erreur observée**:
```
Unterminated string in JSON at position 8861 (line 1 column 8862)
```

---

## CHRONOLOGIE DES TENTATIVES

### 1. Tentative initiale: `response_format` (ÉCHOUÉ)
**Code**:
```typescript
body = {
  model: 'gpt-5.1',
  input: '...',
  reasoning: { effort: 'low' },
  max_output_tokens: 2500,
  response_format: { type: 'json_object' }  // ❌ INCORRECT pour GPT-5
};
```

**Résultat**:
```json
{
  "error": {
    "message": "Unsupported parameter: 'response_format'. In the Responses API, this parameter has moved to 'text.format'. Try again with the new parameter.",
    "type": "invalid_request_error",
    "param": null,
    "code": "unsupported_parameter"
  }
}
```

**Statut**: OpenAI rejette `response_format` pour Responses API ✅ Clair

---

### 2. Tentative avec schéma vide (ÉCHOUÉ)
**Code**:
```typescript
body = {
  model: 'gpt-5.1',
  input: '...',
  reasoning: { effort: 'low' },
  max_output_tokens: 2500,
  text: {
    format: {
      type: 'json_schema',
      name: 'json_response',
      schema: {
        type: 'object',
        additionalProperties: true  // ❌ Schéma trop vague
      },
      strict: false
    }
  }
};
```

**Résultat**:
```json
{
  "error": {
    "message": "Invalid schema for response_format 'json_response': In context=(), object schema missing properties.",
    "type": "invalid_request_error",
    "param": "text.format.schema",
    "code": "invalid_json_schema"
  }
}
```

**Statut**: OpenAI exige au moins une propriété définie ✅ Clair

---

### 3. Tentative avec schéma strict (ACCEPTÉ mais JSON INVALIDE)
**Code actuel** ([ai-proxy.ts:116-134](magicpath-project/api/ai-proxy.ts:116-134)):
```typescript
body = {
  model: 'gpt-5.1',
  input: systemPrompt + userPrompt,
  reasoning: { effort: 'low' },
  max_output_tokens: 2500,
  text: {
    format: {
      type: 'json_schema',
      name: 'json_response',
      schema: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          title: { type: 'string' },
          html: { type: 'string' }
        },
        required: ['id', 'title', 'html'],
        additionalProperties: false
      },
      strict: true
    }
  }
};
```

**Résultat**: ✅ Requête acceptée (pas d'erreur 400)
**MAIS**: ❌ JSON parsing échoue côté application

```
Error: Unterminated string in JSON at position 8861
```

**Statut**: GPT-5.1 génère du JSON malformé malgré `strict: true`

---

## DÉTAILS DE L'ERREUR JSON

### Prompts envoyés

**System Prompt** ([geo.ts:1070-1078](magicpath-project/api/geo.ts:1070-1078)):
```typescript
const introSys = `You are a JSON generation assistant. You MUST output ONLY valid JSON.
CRITICAL RULES:
- Output MUST be valid JSON (parseable by JSON.parse())
- All quotes inside HTML content MUST be properly escaped
- NO line breaks inside JSON strings
- Format: {"id":"intro","title":"Introduction","html":"<h1>...</h1><p>...</p>"}
- All content in French`;
```

**User Prompt** (exemple pour section intro):
```
Tu es un expert GEO & SEO, spécialiste Neil Patel.
Rédige UNIQUEMENT le H1 et l'introduction d'un article (150-200 mots max).

SUJET: DevOps et Automatisation Cloud 2025
CONTEXTE: {...}

STRUCTURE:
- H1 titre SEO accrocheur (<h1>...</h1>)
- Introduction 150-200 mots:
  * Hook (stat ou question)
  * Promise (ce que le lecteur va apprendre)
  * Valeur (pourquoi c'est important)

Return ONLY this JSON (no other text): {"id":"intro","title":"Introduction","html":"<h1>...</h1><p>...</p>..."}
```

### Exemple de réponse GPT-5.1 (reconstruit)

```json
{
  "id": "intro",
  "title": "Introduction",
  "html": "<h1>DevOps 2025: L"Automatisation au Service de l"Excellence</h1><p>En 2025, le DevOps..."
}
```

**Problème**: Les guillemets dans `L"Automatisation` et `l"Excellence` cassent la syntaxe JSON.

**Attendu**:
```json
{
  "id": "intro",
  "title": "Introduction",
  "html": "<h1>DevOps 2025: L'Automatisation au Service de l'Excellence</h1><p>En 2025, le DevOps..."
}
```
OU avec échappement:
```json
{
  "id": "intro",
  "title": "Introduction",
  "html": "<h1>DevOps 2025: L\"Automatisation au Service de l\"Excellence</h1><p>En 2025, le DevOps..."
}
```

---

## CONFIGURATION ACTUELLE

### Fichier: `magicpath-project/api/ai-proxy.ts`

**Lignes 103-134** (GPT-5 Responses API):
```typescript
if (model.startsWith('gpt-5')) {
  url = 'https://api.openai.com/v1/responses';
  const systemMsg = messages.find(m => m.role === 'system')?.content || '';
  const userMsgs = messages.filter(m => m.role !== 'system').map(m => m.content).join('\n\n');
  const input = systemMsg ? `${systemMsg}\n\n${userMsgs}` : userMsgs;

  body = {
    model,
    input,
    reasoning: { effort: 'low' },
    max_output_tokens: maxTokens
  };

  // Add text.format for JSON mode in GPT-5 Responses API
  if (response_format?.type === 'json_object') {
    body.text = {
      format: {
        type: 'json_schema',
        name: 'json_response',
        schema: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            title: { type: 'string' },
            html: { type: 'string' }
          },
          required: ['id', 'title', 'html'],
          additionalProperties: false
        },
        strict: true
      }
    };
  }
}
```

### Fichier: `magicpath-project/api/geo.ts`

**Lignes 1016-1031** (fonction callAI):
```typescript
const callAI = async (provider:string, model:string, messages:any, temperature=0.3, maxTokens=2000, responseFormat?: 'json_object' | 'text') => {
  const body: any = { provider, model, messages, temperature, maxTokens };

  // Add response_format if json_object requested (OpenAI only)
  if (responseFormat === 'json_object') {
    body.response_format = { type: 'json_object' };
  }

  const r = await fetch(`${base}/api/ai-proxy`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body) });
  if (!r.ok) {
    const errorData = await r.json().catch(() => ({}));
    console.error('❌ callAI Error:', { provider, model, status: r.status, errorData });
    throw new Error(`${provider} ${model} ${r.status}: ${JSON.stringify(errorData)}`);
  }
  return r.json();
};
```

**Lignes 1068-1101** (Appel pour section intro):
```typescript
const introRes = await callAI('openai', 'gpt-5.1', [
  {role:'system', content: introSys},
  {role:'user', content: introUsr}
], 0.3, 2500, 'json_object'); // ← Demande JSON Mode
```

---

## LOGS VERCEL (Exemple d'erreur)

**Job**: `job_1763666425454_y59u3s`
**Step**: `draft_sections`
**Provider**: `openai`
**Model**: `gpt-5.1`

**Erreur capturée**:
```json
{
  "error": "Unterminated string in JSON at position 8861 (line 1 column 8862)",
  "jobId": "job_1763666425454_y59u3s",
  "step": "draft_sections"
}
```

**Contexte**:
- Section 0 (intro): ✅ Génération réussie (1390 chars sauvegardés)
- Section 1 (H2 #1): ❌ Crash sur `JSON.parse()` de la réponse GPT-5.1

---

## DOCUMENTATION OPENAI CONSULTÉE

### Source 1: GPT-5 API Quick Start Guide
**URL**: https://benjamincrozat.com/gpt-5-api

**Citation clé**:
> "In the Responses API, JSON control lives under text.format. Responses API uses max_output_tokens and text.format for JSON, while Chat Completions API uses max_completion_tokens and response_format."

**Exemple fourni**:
```bash
curl -s https://api.openai.com/v1/responses \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-5",
    "input": [
      {
        "role": "system",
        "content": [{
          "type": "input_text",
          "text": "Return compact JSON only."
        }]
      },
      {
        "role": "user",
        "content": [{
          "type": "input_text",
          "text": "Solve 8x + 31 = 2."
        }]
      }
    ],
    "text": {
      "format": {
        "type": "json_schema",
        "name": "equation_solution",
        "schema": {
          "type": "object",
          "properties": {
            "steps": {
              "type": "array",
              "items": {
                "type": "string"
              }
            },
            "final_answer": {
              "type": "string"
            }
          },
          "required": ["steps", "final_answer"],
          "additionalProperties": false
        },
        "strict": true
      }
    }
  }'
```

**⚠️ DIFFÉRENCE IMPORTANTE**: L'exemple OpenAI utilise `input` comme **array d'objets** avec structure `role`/`content[{type, text}]`.

**Notre implémentation**: Nous utilisons `input` comme **string simple** (messages convertis en texte).

### Source 2: OpenAI Cookbook - GPT-5 New Params
**URL**: https://cookbook.openai.com/examples/gpt-5/gpt-5_new_params_and_tools

**Citation**:
> "Structured Outputs in the API ensure that model outputs now reliably adhere to developer-supplied JSON Schemas, with the new feature designed to ensure model-generated outputs will exactly match JSON Schemas provided by developers."

**Garantie affichée**: 100% reliability pour `strict: true`

---

## HYPOTHÈSES SUR LA CAUSE

### Hypothèse 1: Format `input` incorrect
**Notre code** (ai-proxy.ts:106-108):
```typescript
const systemMsg = messages.find(m => m.role === 'system')?.content || '';
const userMsgs = messages.filter(m => m.role !== 'system').map(m => m.content).join('\n\n');
const input = systemMsg ? `${systemMsg}\n\n${userMsgs}` : userMsgs;
```
→ Produit une **string simple**

**Documentation OpenAI**:
```typescript
input: [
  {
    role: "system",
    content: [{ type: "input_text", text: "..." }]
  },
  {
    role: "user",
    content: [{ type: "input_text", text: "..." }]
  }
]
```
→ Attend un **array d'objets structurés**

**Impact potentiel**: Le `text.format` strict ne s'applique peut-être pas correctement quand `input` est une string au lieu d'un array.

### Hypothèse 2: Modèle `gpt-5.1` vs `gpt-5`
- Documentation montre des exemples avec `"model": "gpt-5"`
- Nous utilisons `"model": "gpt-5.1"` (avec sous-version)
- Le support de `text.format` strict pourrait être incomplet sur gpt-5.1

### Hypothèse 3: Bug OpenAI - JSON Mode non fiable
- Malgré `strict: true`, GPT-5.1 génère quand même du JSON invalide
- Le contenu HTML avec guillemets français (`l'`, `d'`) pose problème
- Possible que le mode strict ne couvre pas les cas edge avec HTML imbriqué

### Hypothèse 4: Schéma trop simple
- Notre schéma définit `html: { type: 'string' }` sans contraintes
- OpenAI ne sait peut-être pas que cette string contient du HTML nécessitant un échappement spécial
- Peut-être faut-il ajouter des hints (`format: "html"` ou `description: "HTML-escaped string"`)

---

## TESTS EFFECTUÉS

✅ **Test 1**: Vérification que la requête atteint bien OpenAI Responses API
✅ **Test 2**: Validation du format `text.format` selon erreurs OpenAI
✅ **Test 3**: Ajout de propriétés requises au schéma
✅ **Test 4**: Activation de `strict: true`
✅ **Test 5**: System prompt explicite demandant JSON valide
❌ **Test 6**: Parsing JSON de la réponse GPT-5.1 → **ÉCHOUE systématiquement**

---

## COMPORTEMENT OBSERVÉ

**Section 0 (intro)**: Fonctionne ~50% du temps
- Succès: JSON valide parsé et sauvegardé en DB
- Échec: `Unterminated string` à différentes positions (8861, 9287, 8325...)

**Sections 1-4 (H2s)**: Échouent ~100% du temps
- Toujours la même erreur `Unterminated string`
- Position varie (indique contenu différent, pas toujours même erreur)

**Pattern**: Le problème semble aléatoire, dépendant du contenu généré (présence de `l'`, `d'`, guillemets dans le texte français)

---

## QUESTION POUR LE DÉVELOPPEUR

**Avec gpt-5.1 obligatoire**, quelles sont les options:

### Option A: Corriger le format `input`
Transformer `input` de string simple vers array structuré selon doc OpenAI:

```typescript
// Au lieu de:
const input = systemMsg ? `${systemMsg}\n\n${userMsgs}` : userMsgs;

// Faire:
const input = [
  {
    role: "system",
    content: [{ type: "input_text", text: systemMsg }]
  },
  {
    role: "user",
    content: [{ type: "input_text", text: userMsgs }]
  }
];
```

**Question**: Est-ce que ce format pourrait améliorer la fiabilité du `text.format` strict?

### Option B: Enrichir le schéma JSON
Ajouter des métadonnées pour guider GPT-5.1:

```typescript
schema: {
  type: 'object',
  properties: {
    id: {
      type: 'string',
      description: 'Unique section identifier'
    },
    title: {
      type: 'string',
      description: 'Section title in French'
    },
    html: {
      type: 'string',
      description: 'HTML content with properly escaped quotes (use apostrophes for French contractions like l\' instead of l")',
      pattern: '^<.*>$'  // Must be valid HTML
    }
  },
  required: ['id', 'title', 'html'],
  additionalProperties: false
}
```

**Question**: Les `description` et `pattern` peuvent-ils influencer GPT-5.1 pour mieux échapper?

### Option C: Post-processing de sécurité
Ajouter une couche de nettoyage avant `JSON.parse()`:

```typescript
const cleanJSON = (rawText: string): string => {
  // Tentative de réparation automatique
  // 1. Remplacer guillemets typographiques
  let fixed = rawText.replace(/[""]/g, '\\"');
  // 2. Échapper guillemets dans HTML
  // ... regex complexes ...
  return fixed;
};

const parsed = JSON.parse(cleanJSON(response.content));
```

**Question**: Est-ce une solution acceptable ou trop fragile?

### Option D: Utiliser `reasoning.effort: 'medium'` ou `'high'`
Actuellement: `reasoning: { effort: 'low' }`

**Question**: Est-ce que `effort: 'medium'` améliorerait la conformité JSON strict?

### Option E: Désactiver `text.format` et parser manuellement
Retirer le `text.format`, laisser GPT-5.1 retourner du texte libre, et extraire le JSON:

```typescript
const extractJSON = (text: string) => {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('No JSON found');
  return JSON.parse(cleanJSON(match[0]));
};
```

**Question**: Y a-t-il une meilleure approche de parsing robuste?

---

## FICHIERS CONCERNÉS

1. **`magicpath-project/api/ai-proxy.ts`**: Lines 103-134 (GPT-5 handling)
2. **`magicpath-project/api/geo.ts`**: Lines 1016-1031 (callAI function), 1068-1208 (section generation)
3. **`RAPPORT-PROBLEMES-SOLUTIONS.md`**: Documentation complète du contexte

---

## ENVIRONNEMENT

- **Runtime**: Vercel Edge Functions (Node.js 20.x)
- **Timeout**: 25 secondes max
- **API Key**: OpenAI API configurée via `process.env.OPENAI_API_KEY`
- **Base de données**: Supabase (table `articles_content` avec colonne `content: JSONB`)

---

## DEMANDE EXPLICITE

**Besoin**: Solution pour forcer GPT-5.1 à générer du JSON 100% valide via Responses API, OU méthode robuste de parsing/nettoyage compatible avec Edge Functions.

**Contrainte**: DOIT utiliser `gpt-5.1-turbo-2025-07-15` (pas de fallback gpt-4o).

**Format attendu**: Avis technique + code de la solution recommandée.
