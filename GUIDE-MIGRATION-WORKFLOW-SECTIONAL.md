# 🔄 Guide de Migration: Workflow Monobloc → Génération par Sections

## 📊 Problème actuel

Le workflow "Full Workflow" génère des articles **monoblocs** (15000+ mots en une seule réponse GPT-5), ce qui cause:

- ❌ **Troncature HTML** - Articles coupés en plein milieu (limite `max_output_tokens`)
- ❌ **Impossible de scorer par section** - Score global approximatif
- ❌ **Pas de validation HTML** - Balises non fermées passent inaperçues
- ❌ **Enrichissement imprécis** - Suggestions trop générales

## ✅ Solution: Génération par Sections

### Architecture Cible

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. Generate Outline (GPT-5)                                     │
│    → Plan complet: H1 + sections [H2, H3[], mots estimés]      │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 2. Save Outline → Supabase (table: articles_outline)           │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 3. Split Sections (Loop sur chaque H2)                         │
└─────────────────────────────────────────────────────────────────┘
                              ↓
        ╔═══════════════════════════════════════════╗
        ║  LOOP START (pour chaque section)        ║
        ╠═══════════════════════════════════════════╣
        ║  4. Writer Section (GPT-5.1)             ║
        ║     → 400-600 mots max                   ║
        ║     → max_output_tokens: 3500            ║
        ║     → JSON: {section_index, h2, html}    ║
        ╟───────────────────────────────────────────╢
        ║  5. Validate HTML                        ║
        ║     → Vérifie </section> présent         ║
        ║     → Vérifie word_count >= 400          ║
        ╟───────────────────────────────────────────╢
        ║  6. Reviewer Section (Claude)            ║
        ║     → Score SEO/GEO avec tableau pondéré ║
        ║     → Feedback ciblé par section         ║
        ╟───────────────────────────────────────────╢
        ║  7. IF Score < 95                        ║
        ║     → Enrichment (Perplexity)            ║
        ║     → Rewrite Section (GPT-5.1)          ║
        ╟───────────────────────────────────────────╢
        ║  8. Save Section → Supabase              ║
        ║     (articles_content + section_index)   ║
        ╚═══════════════════════════════════════════╝
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 9. All Sections Complete → Response                            │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Migration Étape par Étape

### Option 1: Créer un Nouveau Workflow (RECOMMANDÉ)

**Avantage**: Garde l'ancien workflow intact pour comparaison.

1. **Dans n8n, clique "Add workflow"**
2. **Nomme-le**: "Article Generation - Sectional"
3. **Suis les étapes ci-dessous** pour créer chaque node

### Option 2: Modifier "Full Workflow"

**Attention**: Sauvegarde d'abord le workflow actuel (Export → JSON)

---

## 📝 STEP 1: Generate Outline

### Node 1.1: Build Outline Prompt

**Type**: Code (JavaScript)

```javascript
// STEP 1: Generate Outline
const topic = $json.topic;
const outline = $json.outline; // "Section 1 | Section 2 | Section 3"
const sections = outline.split('|').map(s => s.trim());

const outlinePrompt = `**Tu es un expert SEO & GEO, spécialiste du contenu long-form à la Neil Patel, dédié à l'audience Finance/BI (CFO, DAF, Comex, ETI/PME) en France/Europe.**

SUJET: ${topic}

SECTIONS DEMANDÉES:
${sections.map((s, i) => `${i + 1}. ${s}`).join('\n')}

**Ta mission**: Génère un plan détaillé en JSON avec:

1. **H1** (titre principal SEO-optimisé)
2. **Introduction** (100-150 mots, hook + promesse)
3. Pour chaque section:
   - **h2**: Titre de section (question/action, mots-clés)
   - **h3_list**: Liste des sous-sections H3
   - **estimated_words**: Estimation mots (400-600 par section)
   - **key_points**: 3-5 points clés à couvrir
   - **links_needed**: Types de liens externes à intégrer
4. **FAQ** (3-5 questions)
5. **Conclusion** (résumé + CTA)

**Format JSON strict**:
{
  "h1": "Titre principal",
  "intro": "Texte introduction complète",
  "sections": [
    {
      "section_index": 0,
      "h2": "Titre H2",
      "h3_list": ["Sous-titre 1", "Sous-titre 2"],
      "estimated_words": 500,
      "key_points": ["Point 1", "Point 2"],
      "links_needed": ["étude gouvernementale", "forum LinkedIn"]
    }
  ],
  "faq": [
    {"question": "Q1?", "answer": "Réponse courte"}
  ],
  "conclusion": "Texte conclusion + CTA"
}

Génère maintenant ce plan détaillé.`;

return {
  json: {
    topic,
    sections,
    outlinePrompt,
    apiBody: JSON.stringify({
      model: "gpt-5.1",
      input: [{
        role: "user",
        content: [{type: "input_text", text: outlinePrompt}]
      }],
      text: {
        format: {
          type: "json_schema",
          name: "article_outline",
          schema: {
            type: "object",
            properties: {
              h1: { type: "string" },
              intro: { type: "string" },
              sections: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    section_index: { type: "number" },
                    h2: { type: "string" },
                    h3_list: { type: "array", items: { type: "string" } },
                    estimated_words: { type: "number" },
                    key_points: { type: "array", items: { type: "string" } },
                    links_needed: { type: "array", items: { type: "string" } }
                  },
                  required: ["section_index", "h2", "h3_list", "estimated_words", "key_points"],
                  additionalProperties: false
                }
              },
              faq: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    question: { type: "string" },
                    answer: { type: "string" }
                  },
                  required: ["question", "answer"],
                  additionalProperties: false
                }
              },
              conclusion: { type: "string" }
            },
            required: ["h1", "intro", "sections", "faq", "conclusion"],
            additionalProperties: false
          },
          strict: true
        }
      },
      max_output_tokens: 4000,
      temperature: 1
    })
  }
};
```

### Node 1.2: Call GPT-5 Outline

**Type**: HTTP Request

- **Method**: POST
- **URL**: `https://api.openai.com/v1/chat/completions`
- **Authentication**: OpenAI API
- **Headers**:
  - `Content-Type`: `application/json`
- **Body**: `={{ $json.apiBody }}`

### Node 1.3: Extract Outline

**Type**: Code

```javascript
const prev = $node['Build Outline Prompt'].json;
const response = $json;

let outline;
try {
  const content = response.choices[0].message.content;
  outline = JSON.parse(content);
} catch (e) {
  throw new Error('Failed to parse outline JSON: ' + e.message);
}

console.log('📋 Outline généré:', outline.h1);
console.log('📊 Sections:', outline.sections.length);

return {
  json: {
    topic: prev.topic,
    outline: outline,
    h1: outline.h1,
    intro: outline.intro,
    sections: outline.sections,
    faq: outline.faq,
    conclusion: outline.conclusion,
    totalSections: outline.sections.length,
    job_id: `job_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`
  }
};
```

---

## 🔁 STEP 2: Split Into Sections (Loop)

### Node 2.1: Split In Batches

**Type**: Split In Batches

- **Batch Size**: `1`
- **Input**: `={{ $json.sections }}`

---

## ✍️ STEP 3: Writer Section (dans la loop)

### Node 3.1: Build Writer Prompt

**Type**: Code

```javascript
const outlineData = $node['Extract Outline'].json;
const sectionIndex = $node['Split In Batches'].context.currentRunIndex;
const section = outlineData.sections[sectionIndex];

const writerPrompt = `**Tu es un expert SEO & GEO, spécialiste du contenu long-form à la Neil Patel, dédié à l'audience Finance/BI (CFO, DAF, Comex, ETI/PME) en France/Europe.**

**CONTEXTE DE L'ARTICLE:**
- Titre principal (H1): ${outlineData.h1}
- Section actuelle: ${sectionIndex + 1}/${outlineData.totalSections}

**TA MISSION**: Rédige UNIQUEMENT la section suivante (400-600 mots max):

**H2**: ${section.h2}

**Sous-sections à couvrir (H3)**:
${section.h3_list.map((h3, i) => `  ${i + 1}. ${h3}`).join('\n')}

**Points clés obligatoires**:
${section.key_points.map((p, i) => `  • ${p}`).join('\n')}

**Liens externes à intégrer** (au moins 2):
${(section.links_needed || ['étude officielle', 'forum métier']).map(l => `  • ${l}`).join('\n')}

---

## EXIGENCES STRICTES:

1. **Structure HTML**:
   - Wrapper: <section id="section-${sectionIndex}" itemscope itemtype="https://schema.org/Article">
   - H2 principal avec itemprop="headline"
   - H3 pour chaque sous-section
   - Paragraphes courts (3-4 phrases max)
   - FERME TOUJOURS la balise </section>

2. **Contenu**:
   - 400-600 mots (pas plus!)
   - Style Neil Patel: paragraphes ultra-courts, actionnables
   - Au moins 1 liste à puces ou tableau
   - Au moins 2 liens externes autoritaires
   - Citations communautaires ou cas réels si possible
   - Chiffres France/Europe récents

3. **SEO**:
   - Mots-clés naturellement intégrés
   - Longue traîne dans H3
   - Schema.org itemprops

4. **GEO**:
   - Marqueurs France/Europe
   - Sources locales/institutionnelles
   - Exemples terrain français

**Format JSON strict de réponse**:
{
  "section_index": ${sectionIndex},
  "h2": "${section.h2}",
  "html": "<section id=\\"section-${sectionIndex}\\" itemscope itemtype=\\"https://schema.org/Article\\">...</section>",
  "word_count": 500,
  "links_added": ["https://...", "https://..."],
  "notes": ["Points importants couverts"]
}

**IMPORTANT**: Le HTML DOIT être complet et fermé (</section> à la fin)!`;

return {
  json: {
    ...outlineData,
    sectionIndex,
    section,
    writerPrompt,
    apiBody: JSON.stringify({
      model: "gpt-5.1",
      input: [{
        role: "user",
        content: [{type: "input_text", text: writerPrompt}]
      }],
      text: {
        format: {
          type: "json_schema",
          name: "section_content",
          schema: {
            type: "object",
            properties: {
              section_index: { type: "number" },
              h2: { type: "string" },
              html: { type: "string" },
              word_count: { type: "number" },
              links_added: { type: "array", items: { type: "string" } },
              notes: { type: "array", items: { type: "string" } }
            },
            required: ["section_index", "h2", "html", "word_count"],
            additionalProperties: false
          },
          strict: true
        }
      },
      max_output_tokens: 3500,
      temperature: 0.5
    })
  }
};
```

### Node 3.2: Call GPT-5.1 Writer

**Type**: HTTP Request

- **Method**: POST
- **URL**: `https://api.openai.com/v1/chat/completions`
- **Authentication**: OpenAI API
- **Body**: `={{ $json.apiBody }}`

### Node 3.3: Validate HTML

**Type**: Code

```javascript
const prev = $node['Build Writer Prompt'].json;
const response = $json;

let sectionData;
try {
  const content = response.choices[0].message.content;
  sectionData = JSON.parse(content);
} catch (e) {
  throw new Error('Failed to parse section JSON: ' + e.message);
}

// ✅ VALIDATION HTML
const html = sectionData.html;
const hasClosingSection = html.includes('</section>');
const hasOpeningSection = html.includes('<section');
const wordCount = html.split(/\s+/).length;

if (!hasOpeningSection || !hasClosingSection) {
  throw new Error(`❌ HTML INCOMPLET pour section ${prev.sectionIndex}! Balise <section> non fermée.`);
}

if (wordCount < 300) {
  throw new Error(`❌ Section ${prev.sectionIndex} trop courte: ${wordCount} mots (min 400)`);
}

console.log(`✅ Section ${prev.sectionIndex} validée: ${wordCount} mots, HTML complet`);

return {
  json: {
    ...prev,
    sectionHTML: html,
    h2: sectionData.h2,
    wordCount: sectionData.word_count || wordCount,
    linksAdded: sectionData.links_added || [],
    notes: sectionData.notes || [],
    htmlValid: true
  }
};
```

---

## 📊 STEP 4: Reviewer Section

### Node 4.1: Build Reviewer Prompt

**Type**: Code

```javascript
const prev = $node['Validate HTML'].json;

const reviewerPrompt = `Tu es agent reviewer éditorial expert SEO et GEO dans la finance/BI (Power BI, reporting CFO) France/Europe.

**SECTION À ÉVALUER** (Section ${prev.sectionIndex + 1}):

**H2**: ${prev.h2}

**HTML**:
${prev.sectionHTML}

---

## Ta mission

Évalue cette section selon le tableau de scoring pondéré ci-dessous et fournis:

1. **Score SEO** (pondération 80%)
2. **Score GEO** (pondération 19%)
3. **Score Fraîcheur** (pondération 1%)
4. **Score global** (/100)
5. **Feedback actionnable** pour atteindre ≥95

---

## Tableau de scoring (à remplir)

### SEO (80% du score total)
- Structure H2/H3 (10%)
- Mots-clés principaux (8%)
- Longue traîne (7%)
- Lisibilité/paragraphes courts (7%)
- Liens externes autorité (8%)
- Benchmarks/chiffres (8%)
- Media/tableaux (7%)
- CTA/lead magnets (6%)
- Qualité intro/hook (7%)
- Plan/skimming (8%)
- FAQ pertinente (7%)
- Liens internes cluster (7%)

### GEO (19% du score total)
- Localisation France/EU (5%)
- Citations communautaires (3%)
- FAQ GEO contextualisée (3%)
- Benchmarks marché FR/EU (3%)
- Sources nationales/institutionnelles (3%)
- Feedback retours terrain (2%)

### Fraîcheur (1% du score total)
- Date actualisation visible (1%)

---

**Format JSON strict de réponse**:
{
  "section_index": ${prev.sectionIndex},
  "scores": {
    "seo": 85,
    "geo": 90,
    "freshness": 100,
    "global": 86
  },
  "feedback": [
    "Ajouter 1 lien externe gouvernemental après le 2e paragraphe",
    "Intégrer citation LinkedIn/forum dans H3.2",
    "Ajouter tableau comparatif outils"
  ],
  "missing_elements": {
    "external_links": 1,
    "community_quotes": 1,
    "tables": 1
  },
  "readyForPublication": false
}`;

return {
  json: {
    ...prev,
    reviewerPrompt,
    apiBody: JSON.stringify({
      model: "claude-sonnet-4-5-20250929",
      max_tokens: 2000,
      temperature: 0.3,
      messages: [{
        role: "user",
        content: reviewerPrompt
      }]
    })
  }
};
```

### Node 4.2: Call Claude Reviewer

**Type**: HTTP Request

- **Method**: POST
- **URL**: `https://api.anthropic.com/v1/messages`
- **Authentication**: Anthropic API
- **Headers**:
  - `Content-Type`: `application/json`
  - `anthropic-version`: `2023-06-01`
- **Body**: `={{ $json.apiBody }}`

### Node 4.3: Extract Score

**Type**: Code

```javascript
const prev = $node['Build Reviewer Prompt'].json;
const response = $json;

let scoreData;
try {
  const content = response.content[0].text;
  scoreData = JSON.parse(content);
} catch (e) {
  throw new Error('Failed to parse reviewer response: ' + e.message);
}

const globalScore = scoreData.scores.global;
const seoScore = scoreData.scores.seo;
const geoScore = scoreData.scores.geo;

console.log(`📊 Section ${prev.sectionIndex} - Score: ${globalScore}/100 (SEO: ${seoScore}, GEO: ${geoScore})`);

return {
  json: {
    ...prev,
    scoreData,
    globalScore,
    seoScore,
    geoScore,
    feedback: scoreData.feedback || [],
    missingElements: scoreData.missing_elements || {},
    needsEnrichment: globalScore < 95
  }
};
```

---

## 💾 STEP 5: Save Section

### Node 5.1: Prepare for Save

**Type**: Code

```javascript
const data = $json;

return {
  json: {
    job_id: data.job_id,
    section_index: data.sectionIndex,
    section_title: data.h2,
    content: {
      html: data.sectionHTML,
      score: data.globalScore,
      seo_score: data.seoScore,
      geo_score: data.geoScore,
      word_count: data.wordCount,
      links: data.linksAdded || [],
      feedback: data.feedback || [],
      validated: data.htmlValid
    }
  }
};
```

### Node 5.2: Insert to Supabase

**Type**: Supabase → Insert

- **Table**: `articles_content`
- **Mapping**:
  - `job_id`: `={{ $json.job_id }}`
  - `section_index`: `={{ $json.section_index }}`
  - `section_title`: `={{ $json.section_title }}`
  - `content`: `={{ $json.content }}`

---

## 🔄 STEP 6: Loop Back

Connecte le node "Insert to Supabase" au node **"Split In Batches"** (input 0 = continuer la boucle).

---

## ✅ STEP 7: All Sections Complete

### Node 7.1: Response

**Type**: Respond to Webhook

```javascript
const outlineData = $node['Extract Outline'].json;

return {
  json: {
    success: true,
    message: `Article complet généré avec ${outlineData.totalSections} sections`,
    job_id: outlineData.job_id,
    total_sections: outlineData.totalSections,
    h1: outlineData.h1
  }
};
```

---

## 🎯 Avantages de cette Architecture

✅ **Pas de troncature** - Chaque section fait 400-600 mots (≈1200 tokens, loin de la limite)
✅ **Validation HTML** - Chaque section vérifie `</section>` avant sauvegarde
✅ **Score précis** - SEO/GEO calculé par section avec tableau pondéré
✅ **Enrichissement ciblé** - Suggestions Perplexity spécifiques à chaque section
✅ **Traçabilité** - Chaque section sauvegardée avec `section_index` dans Supabase
✅ **Recomposition flexible** - Backend/UI assemblent l'article complet

---

## 📊 Comparaison Monobloc vs Sectional

| **Critère** | **Monobloc (actuel)** | **Sectional (nouveau)** |
|-------------|----------------------|-------------------------|
| Tokens par génération | 15000-20000 | 1200-1500 |
| Risque troncature | ❌ ÉLEVÉ | ✅ AUCUN |
| Validation HTML | ❌ Impossible | ✅ Par section |
| Score SEO/GEO | ❌ Global approximatif | ✅ Par section précis |
| Enrichissement | ❌ Générique | ✅ Ciblé |
| Durée workflow | ~3-5 min | ~5-8 min (mais + fiable) |

---

## 🚀 Prochaines Étapes

1. ✅ Créer le nouveau workflow "Article Generation - Sectional" dans n8n
2. ✅ Tester avec 1 article (3-5 sections)
3. ✅ Vérifier la qualité HTML de chaque section
4. ✅ Comparer les scores SEO/GEO avec l'ancien système
5. ✅ Modifier l'UI admin pour afficher les sections assemblées

---

**Questions?** Demande-moi pour:
- JSON complet à importer directement
- Script de migration automatique via API
- Modification de l'UI pour la recomposition d'articles
