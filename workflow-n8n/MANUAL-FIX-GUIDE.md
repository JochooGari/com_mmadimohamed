# 🔧 GUIDE DE CORRECTION MANUELLE DU WORKFLOW

## Problème actuel

Le workflow "Full Workflow" utilise encore l'ancienne méthode RPC qui ne fonctionne pas :
- URL: `/rest/v1/rpc/search_articles`
- Méthode: POST
- Erreur: `Could not find function public.search_articles`

## Solution : Modifier 2 nodes dans n8n

### ✅ Node 1 : "Get Internal Articles"

1. **Ouvrez le workflow dans n8n**
2. **Cliquez sur le node "Get Internal Articles"**
3. **Modifiez les paramètres suivants** :

**Method:**
```
GET
```

**URL:**
```
https://xroduivvgnviqjdvehuw.supabase.co/rest/v1/articles?select=id,title,slug,excerpt&published=eq.true&order=created_at.desc&limit=8
```

**Send Body:**
```
❌ Décochez "Send Body"
```

**Headers** (gardez les mêmes) :
```
apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhyb2R1aXZ2Z252aXFqZHZlaHV3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDg1Njg5NywiZXhwIjoyMDY2NDMyODk3fQ.lJe0rcdAJYdS4VjcR5IV_kqA9lEUJoWq8VKsSD5EUV0

Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhyb2R1aXZ2Z252aXFqZHZlaHV3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDg1Njg5NywiZXhwIjoyMDY2NDMyODk3fQ.lJe0rcdAJYdS4VjcR5IV_kqA9lEUJoWq8VKsSD5EUV0
```

---

### ✅ Node 2 : "Extract Internal Links"

1. **Cliquez sur le node "Extract Internal Links"**
2. **Remplacez tout le code JavaScript par** :

```javascript
// Extract internal articles for linking
const response = $input.all()[0].json;
const prev = $node['Initialize Variables'].json;

// Response is an array from Supabase GET request
const articles = Array.isArray(response) ? response : [];

const internalLinks = articles.slice(0, 8).map(a => ({
  title: a.title || '',
  slug: a.slug || '',
  excerpt: a.excerpt || ''
}));

return {
  json: {
    ...prev,
    internalArticles: internalLinks,
    internalLinksText: internalLinks.length > 0
      ? internalLinks.map(a => `- [${a.title}](/articles/${a.slug})`).join('\n')
      : 'Aucun article interne disponible'
  }
};
```

**Changement clé** : `const articles = Array.isArray(response) ? response : [];` au lieu de `const articles = $input.all()[0].json || [];`

---

### 💾 Sauvegarde

1. **Cliquez sur "Save"** en haut à droite
2. Le workflow est automatiquement mis à jour (il est déjà actif)

---

### ✅ Test

**Testez immédiatement le workflow corrigé** :

```bash
cd c:\Users\power\OneDrive\Documents\Website_2025_06_30\workflow-n8n
node test-complete-loop.js
```

**Ou testez juste la récupération des articles internes** :

```bash
node test-internal-articles.js
```

---

## 📊 Avant / Après

### ❌ Avant (ERREUR)

**Node: Get Internal Articles**
```json
{
  "method": "POST",
  "url": ".../rest/v1/rpc/search_articles",
  "sendBody": true,
  "body": "={{ JSON.stringify({ limit: 8 }) }}"
}
```

**Node: Extract Internal Links**
```javascript
const articles = $input.all()[0].json || [];  // Attend un objet
```

**Résultat**: ❌ Error `Could not find function public.search_articles`

---

### ✅ Après (CORRIGÉ)

**Node: Get Internal Articles**
```json
{
  "method": "GET",
  "url": ".../rest/v1/articles?select=id,title,slug,excerpt&published=eq.true&order=created_at.desc&limit=8",
  "sendBody": false
}
```

**Node: Extract Internal Links**
```javascript
const articles = Array.isArray(response) ? response : [];  // Gère un array
```

**Résultat**: ✅ Récupère 3-8 articles publiés sans erreur

---

## 🎯 Temps estimé

**2 minutes** pour faire les deux modifications.

---

## ⚠️ Important

- **Ne créez PAS de nouveau workflow**, modifiez juste ces 2 nodes
- **Les credentials restent les mêmes** (Anthropic, OpenAI, Perplexity)
- **Le workflow reste actif** pendant la modification
- Une fois sauvegardé, le fix est immédiatement appliqué

---

## 🆘 Si vous avez un problème

Exportez simplement le workflow corrigé pour moi :
1. Dans n8n, cliquez sur **...** (3 points en haut)
2. **Download**
3. Envoyez-moi le fichier JSON

Je pourrai alors voir exactement ce qui ne va pas.
