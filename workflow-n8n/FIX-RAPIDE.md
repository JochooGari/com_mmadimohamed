# ⚡ FIX RAPIDE - 2 Minutes

## 🎯 Ouvrez n8n et modifiez 2 nodes

### 1️⃣ Node "Get Internal Articles"

**Changez 3 choses** :

| Paramètre | Ancien | Nouveau |
|-----------|--------|---------|
| **Method** | POST | **GET** |
| **URL** | `.../rpc/search_articles` | **`.../articles?select=id,title,slug,excerpt&published=eq.true&order=created_at.desc&limit=8`** |
| **Send Body** | ✅ Activé | **❌ Désactivé** |

**URL complète à copier-coller** :
```
https://xroduivvgnviqjdvehuw.supabase.co/rest/v1/articles?select=id,title,slug,excerpt&published=eq.true&order=created_at.desc&limit=8
```

---

### 2️⃣ Node "Extract Internal Links"

**Remplacez la ligne 2 du code** :

**Ancien** :
```javascript
const articles = $input.all()[0].json || [];
```

**Nouveau** :
```javascript
const response = $input.all()[0].json;
const articles = Array.isArray(response) ? response : [];
```

**OU copiez-collez tout le code complet** :

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

---

### 3️⃣ Sauvegardez

Cliquez sur **Save** en haut à droite.

---

### 4️⃣ Testez

```bash
node workflow-n8n/test-complete-loop.js
```

**C'est tout ! ✅**
