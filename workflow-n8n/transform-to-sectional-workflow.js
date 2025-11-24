#!/usr/bin/env node
/**
 * TRANSFORMATION WORKFLOW N8N : ARTICLE MONOBLOC → GÉNÉRATION PAR SECTIONS
 *
 * Architecture cible :
 * 1. Generate Outline (GPT-5) → Plan H1/H2/H3 + estimation mots
 * 2. Split Sections → Boucle sur chaque H2/H3
 * 3. Writer (par section) → 400-600 mots, HTML validé
 * 4. Reviewer (par section) → Score SEO/GEO avec tableau pondéré
 * 5. Enrichment (si score < 95) → Suggestions Perplexity
 * 6. Rewrite (si nécessaire) → Amélioration section
 * 7. Save Section → articles_content avec section_index
 * 8. Recompose Final → Assemblage complet côté backend
 */

require('dotenv').config({ path: 'c:/Users/power/OneDrive/Documents/Website_2025_06_30/magicpath-project/.env.local' });
const axios = require('axios');

const N8N_URL = (process.env.N8N_url || 'https://n8n.srv1144760.hstgr.cloud/api/v1').replace('/api/v1', '');
const N8N_API_KEY = (process.env.N8N_API_KEY || '').trim();

console.log('🔑 N8N_URL:', N8N_URL);
console.log('🔑 N8N_API_KEY présente:', N8N_API_KEY ? 'OUI' : 'NON');
const WORKFLOW_ID = '06yXZiR5QaoQmZsY'; // "Full Workflow"

// Credentials IDs (récupérés du workflow actuel)
const CREDENTIALS = {
  claudeAuth: { id: 'TT555VQ7I164GBRX', name: 'Anthropic Claude account' },
  openaiAuth: { id: 'CZtCJqLCWSNLG0pB', name: 'OpenAI account' },
  perplexityAuth: { id: 'TT555VQ7I164GBRX', name: 'Perplexity API' },
  supabaseAuth: { id: 'WjTJ7AJ4DFGNPXWr', name: 'Supabase account' }
};

console.log('🔄 TRANSFORMATION WORKFLOW → GÉNÉRATION PAR SECTIONS\n');
console.log('=' .repeat(80));

async function transformWorkflow() {
  // 1. Récupérer le workflow actuel
  console.log('\n📥 Récupération du workflow actuel...');
  const response = await axios.get(`${N8N_URL}/api/v1/workflows/${WORKFLOW_ID}`, {
    headers: { 'X-N8N-API-KEY': N8N_API_KEY }
  });

  const workflow = response.data;
  console.log(`✅ Workflow récupéré: ${workflow.name}`);
  console.log(`   Nodes actuels: ${workflow.nodes.length}`);

  // 2. Créer la nouvelle architecture
  const newNodes = createSectionalNodes();
  const newConnections = createSectionalConnections();

  // 3. Remplacer les nodes
  workflow.nodes = newNodes;
  workflow.connections = newConnections;
  workflow.name = "Article Generation - Sectional (Full)";

  // 4. Sauvegarder
  console.log('\n💾 Sauvegarde du workflow transformé...');
  await axios.put(`${N8N_URL}/api/v1/workflows/${WORKFLOW_ID}`, workflow, {
    headers: {
      'X-N8N-API-KEY': N8N_API_KEY,
      'Content-Type': 'application/json'
    }
  });

  console.log('✅ Workflow transformé avec succès!\n');
  console.log('=' .repeat(80));
  console.log('\n📋 NOUVELLE ARCHITECTURE:');
  console.log('   1. Webhook Trigger');
  console.log('   2. Generate Outline (GPT-5) → Plan complet');
  console.log('   3. Split Sections → Boucle sur H2/H3');
  console.log('   4. LOOP START');
  console.log('      → Writer Section (GPT-5.1)');
  console.log('      → Validate HTML');
  console.log('      → Reviewer Section (Claude)');
  console.log('      → Score & Decide');
  console.log('      → IF < 95: Enrichment (Perplexity) → Rewrite');
  console.log('      → Save Section to Supabase');
  console.log('   5. LOOP END');
  console.log('   6. Recompose Article → Assemblage final');
  console.log('\n🎯 Avantages:');
  console.log('   • Chaque section: 500-800 mots (≈1200 tokens)');
  console.log('   • Validation HTML par section');
  console.log('   • Score SEO/GEO par section');
  console.log('   • Pas de troncature');
  console.log('   • Enrichissement ciblé');
}

function createSectionalNodes() {
  return [
    // NODE 0: Webhook Trigger
    {
      parameters: {
        httpMethod: 'POST',
        path: 'generate-article-sectional',
        responseMode: 'responseNode',
        options: {}
      },
      id: 'webhook-trigger',
      name: 'Webhook Trigger',
      type: 'n8n-nodes-base.webhook',
      typeVersion: 2,
      position: [240, 300],
      webhookId: 'generate-article-sectional'
    },

    // NODE 1: Generate Outline (GPT-5)
    {
      parameters: {
        jsCode: `// STEP 1: Generate Outline
const topic = $json.topic;
const outline = $json.outline; // "Section 1 | Section 2 | Section 3"
const sections = outline.split('|').map(s => s.trim());

const outlinePrompt = \`**Tu es un expert SEO & GEO, spécialiste du contenu long-form à la Neil Patel, dédié à l'audience Finance/BI (CFO, DAF, Comex, ETI/PME) en France/Europe.**

SUJET: \${topic}

SECTIONS DEMANDÉES:
\${sections.map((s, i) => \`\${i + 1}. \${s}\`).join('\\n')}

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

Génère maintenant ce plan détaillé.\`;

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
};`
      },
      id: 'build-outline-body',
      name: 'Build Outline Body',
      type: 'n8n-nodes-base.code',
      typeVersion: 2,
      position: [460, 300]
    },

    // NODE 2: Call GPT-5 for Outline
    {
      parameters: {
        method: 'POST',
        url: 'https://api.openai.com/v1/chat/completions',
        authentication: 'predefinedCredentialType',
        nodeCredentialType: 'openAiApi',
        sendHeaders: true,
        headerParameters: {
          parameters: [
            { name: 'Content-Type', value: 'application/json' }
          ]
        },
        sendBody: true,
        specifyBody: 'json',
        jsonBody: '={{ $json.apiBody }}',
        options: {}
      },
      id: 'call-gpt5-outline',
      name: 'STEP 1 - Generate Outline (GPT-5)',
      type: 'n8n-nodes-base.httpRequest',
      typeVersion: 4.2,
      position: [680, 300],
      credentials: {
        openAiApi: CREDENTIALS.openaiAuth
      }
    },

    // NODE 3: Extract Outline
    {
      parameters: {
        jsCode: `const prev = $node['Build Outline Body'].json;
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
    totalSections: outline.sections.length
  }
};`
      },
      id: 'extract-outline',
      name: 'Extract Outline',
      type: 'n8n-nodes-base.code',
      typeVersion: 2,
      position: [900, 300]
    },

    // NODE 4: Split Into Sections (Loop)
    {
      parameters: {
        batchSize: 1,
        options: {}
      },
      id: 'split-sections',
      name: 'Split Sections',
      type: 'n8n-nodes-base.splitInBatches',
      typeVersion: 3,
      position: [1120, 300]
    },

    // NODE 5: Build Section Writer Prompt
    {
      parameters: {
        jsCode: `// Build Writer Prompt for CURRENT SECTION
const outlineData = $node['Extract Outline'].json;
const currentBatch = $json;

const sectionIndex = $node['Split Sections'].context.currentRunIndex;
const section = outlineData.sections[sectionIndex];

const writerPrompt = \`**Tu es un expert SEO & GEO, spécialiste du contenu long-form à la Neil Patel, dédié à l'audience Finance/BI (CFO, DAF, Comex, ETI/PME) en France/Europe.**

**CONTEXTE DE L'ARTICLE:**
- Titre principal (H1): \${outlineData.h1}
- Section actuelle: \${sectionIndex + 1}/\${outlineData.totalSections}

**TA MISSION**: Rédige UNIQUEMENT la section suivante (400-600 mots max):

**H2**: \${section.h2}

**Sous-sections à couvrir (H3)**:
\${section.h3_list.map((h3, i) => \`  \${i + 1}. \${h3}\`).join('\\n')}

**Points clés obligatoires**:
\${section.key_points.map((p, i) => \`  • \${p}\`).join('\\n')}

**Liens externes à intégrer** (au moins 2):
\${(section.links_needed || ['étude officielle', 'forum métier']).map(l => \`  • \${l}\`).join('\\n')}

---

## EXIGENCES STRICTES:

1. **Structure HTML**:
   - Wrapper: <section id="section-\${sectionIndex}" itemscope itemtype="https://schema.org/Article">
   - H2 principal avec itemprop="headline"
   - H3 pour chaque sous-section
   - Paragraphes courts (3-4 phrases max)
   - FERME TOUJOURS la balise </section>

2. **Contenu**:
   - 400-600 mots (pas plus!)
   - Style Neil Patel: paragraphes ultra-courts, actionnables
   - Au moins 1 liste à puces ou tableau
   - Au moins 2 liens externes autoritaires (gouvernement, LinkedIn, forum, étude)
   - Citations communautaires ou cas réels si possible
   - Chiffres France/Europe récents

3. **SEO**:
   - Mots-clés naturellement intégrés
   - Longue traîne dans H3
   - Schema.org itemprops (headline, articleBody)

4. **GEO**:
   - Marqueurs France/Europe
   - Sources locales/institutionnelles
   - Exemples terrain français

**Format JSON strict de réponse**:
{
  "section_index": \${sectionIndex},
  "h2": "\${section.h2}",
  "html": "<section id=\\"section-\${sectionIndex}\\" itemscope itemtype=\\"https://schema.org/Article\\">...</section>",
  "word_count": 500,
  "links_added": ["https://...", "https://..."],
  "notes": ["Points importants couverts"]
}

**IMPORTANT**: Le HTML DOIT être complet et fermé (</section> à la fin)!\`;

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
};`
      },
      id: 'build-writer-section',
      name: 'Build Writer Section Body',
      type: 'n8n-nodes-base.code',
      typeVersion: 2,
      position: [1340, 300]
    },

    // NODE 6: Call GPT-5 Writer (Section)
    {
      parameters: {
        method: 'POST',
        url: 'https://api.openai.com/v1/chat/completions',
        authentication: 'predefinedCredentialType',
        nodeCredentialType: 'openAiApi',
        sendHeaders: true,
        headerParameters: {
          parameters: [
            { name: 'Content-Type', value: 'application/json' }
          ]
        },
        sendBody: true,
        specifyBody: 'json',
        jsonBody: '={{ $json.apiBody }}',
        options: {}
      },
      id: 'call-writer-section',
      name: 'STEP 2 - Writer Section (GPT-5.1)',
      type: 'n8n-nodes-base.httpRequest',
      typeVersion: 4.2,
      position: [1560, 300],
      credentials: {
        openAiApi: CREDENTIALS.openaiAuth
      }
    },

    // NODE 7: Extract & Validate HTML
    {
      parameters: {
        jsCode: `const prev = $node['Build Writer Section Body'].json;
const response = $json;

let sectionData;
try {
  const content = response.choices[0].message.content;
  sectionData = JSON.parse(content);
} catch (e) {
  throw new Error('Failed to parse section JSON: ' + e.message);
}

// VALIDATION HTML
const html = sectionData.html;
const hasClosingSection = html.includes('</section>');
const hasOpeningSection = html.includes('<section');
const wordCount = html.split(/\\s+/).length;

if (!hasOpeningSection || !hasClosingSection) {
  throw new Error(\`❌ HTML INCOMPLET pour section \${prev.sectionIndex}! Balise <section> non fermée.\`);
}

if (wordCount < 300) {
  throw new Error(\`❌ Section \${prev.sectionIndex} trop courte: \${wordCount} mots (min 400)\`);
}

console.log(\`✅ Section \${prev.sectionIndex} validée: \${wordCount} mots, HTML complet\`);

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
};`
      },
      id: 'validate-html',
      name: 'Validate HTML',
      type: 'n8n-nodes-base.code',
      typeVersion: 2,
      position: [1780, 300]
    },

    // NODE 8: Build Reviewer Prompt (avec nouveau prompt de scoring)
    {
      parameters: {
        jsCode: `const prev = $node['Validate HTML'].json;

const reviewerPrompt = \`Tu es agent reviewer éditorial expert SEO et GEO dans la finance/BI (Power BI, reporting CFO) France/Europe.

**SECTION À ÉVALUER** (Section \${prev.sectionIndex + 1}):

**H2**: \${prev.h2}

**HTML**:
\${prev.sectionHTML}

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
  "section_index": \${prev.sectionIndex},
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
}\`;

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
};`
      },
      id: 'build-reviewer',
      name: 'Build Reviewer Body',
      type: 'n8n-nodes-base.code',
      typeVersion: 2,
      position: [2000, 300]
    },

    // NODE 9: Call Claude Reviewer
    {
      parameters: {
        method: 'POST',
        url: 'https://api.anthropic.com/v1/messages',
        authentication: 'predefinedCredentialType',
        nodeCredentialType: 'anthropicApi',
        sendHeaders: true,
        headerParameters: {
          parameters: [
            { name: 'Content-Type', value: 'application/json' },
            { name: 'anthropic-version', value: '2023-06-01' }
          ]
        },
        sendBody: true,
        specifyBody: 'json',
        jsonBody: '={{ $json.apiBody }}',
        options: {}
      },
      id: 'call-reviewer',
      name: 'STEP 3 - Reviewer Section (Claude)',
      type: 'n8n-nodes-base.httpRequest',
      typeVersion: 4.2,
      position: [2220, 300],
      credentials: {
        anthropicApi: CREDENTIALS.claudeAuth
      }
    },

    // NODE 10: Extract Score & Decide
    {
      parameters: {
        jsCode: `const prev = $node['Build Reviewer Body'].json;
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

console.log(\`📊 Section \${prev.sectionIndex} - Score: \${globalScore}/100 (SEO: \${seoScore}, GEO: \${geoScore})\`);

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
};`
      },
      id: 'extract-score-section',
      name: 'Extract Score & Decide',
      type: 'n8n-nodes-base.code',
      typeVersion: 2,
      position: [2440, 300]
    },

    // NODE 11: IF Score < 95
    {
      parameters: {
        conditions: {
          boolean: [
            {
              value1: '={{ $json.needsEnrichment }}',
              value2: true
            }
          ]
        }
      },
      id: 'if-needs-enrichment',
      name: 'IF Score < 95',
      type: 'n8n-nodes-base.if',
      typeVersion: 2,
      position: [2660, 300]
    },

    // NODE 12: Build Enrichment (Perplexity)
    {
      parameters: {
        jsCode: `const prev = $node['Extract Score & Decide'].json;

const enrichmentPrompt = \`Tu es un expert SEO/GEO. Analyse cette section qui a obtenu un score de \${prev.globalScore}/100 (SEO: \${prev.seoScore}, GEO: \${prev.geoScore}).

**SECTION ACTUELLE**:
\${prev.sectionHTML}

**FEEDBACK REVIEWER**:
\${prev.feedback.join('\\n')}

**ÉLÉMENTS MANQUANTS**:
\${JSON.stringify(prev.missingElements, null, 2)}

**Ta mission**: Liste PRÉCISÉMENT les éléments à ajouter pour atteindre 95%+.

Réponds en JSON strict:
{
  "external_links_suggested": [
    {"url": "https://...", "anchor": "texte du lien", "insert_after": "paragraphe X"}
  ],
  "community_quotes_suggested": [
    {"quote": "...", "source": "LinkedIn/Reddit/Forum", "insert_location": "H3.2"}
  ],
  "tables_suggested": [
    {"title": "Comparaison outils BI", "location": "après H3.1"}
  ],
  "keyword_gaps": ["mot-clé 1", "mot-clé 2"],
  "estimated_score_increase": 10
}\`;

return {
  json: {
    ...prev,
    enrichmentPrompt,
    apiBody: JSON.stringify({
      model: "sonar",
      messages: [{
        role: "user",
        content: enrichmentPrompt
      }],
      max_tokens: 1500,
      temperature: 0.3
    })
  }
};`
      },
      id: 'build-enrichment',
      name: 'Build Enrichment Body',
      type: 'n8n-nodes-base.code',
      typeVersion: 2,
      position: [2880, 200]
    },

    // NODE 13: Call Perplexity Enrichment
    {
      parameters: {
        method: 'POST',
        url: 'https://api.perplexity.ai/chat/completions',
        authentication: 'genericCredentialType',
        genericAuthType: 'httpHeaderAuth',
        sendHeaders: true,
        headerParameters: {
          parameters: [
            { name: 'Content-Type', value: 'application/json' }
          ]
        },
        sendBody: true,
        specifyBody: 'json',
        jsonBody: '={{ $json.apiBody }}',
        options: {}
      },
      id: 'call-enrichment',
      name: 'STEP 4 - Get Enrichment (Perplexity)',
      type: 'n8n-nodes-base.httpRequest',
      typeVersion: 4.2,
      position: [3100, 200],
      credentials: {
        httpHeaderAuth: CREDENTIALS.perplexityAuth
      }
    },

    // NODE 14: Extract Enrichment
    {
      parameters: {
        jsCode: `const prev = $node['Build Enrichment Body'].json;
const response = $json;

let enrichmentData;
try {
  const content = response.choices[0].message.content;
  enrichmentData = JSON.parse(content);
} catch (e) {
  console.warn('Failed to parse enrichment, using empty suggestions');
  enrichmentData = {
    external_links_suggested: [],
    community_quotes_suggested: [],
    tables_suggested: [],
    keyword_gaps: [],
    estimated_score_increase: 0
  };
}

console.log(\`💡 Enrichment: +\${enrichmentData.estimated_score_increase} points estimés\`);

return {
  json: {
    ...prev,
    enrichment: enrichmentData
  }
};`
      },
      id: 'extract-enrichment',
      name: 'Extract Enrichment',
      type: 'n8n-nodes-base.code',
      typeVersion: 2,
      position: [3320, 200]
    },

    // NODE 15: Build Rewrite with Enrichment
    {
      parameters: {
        jsCode: `const prev = $node['Extract Enrichment'].json;
const enrichment = prev.enrichment;

const rewritePrompt = \`Tu es un expert SEO/GEO. Améliore cette section pour atteindre 95%+ de score.

**SECTION ACTUELLE** (Score: \${prev.globalScore}/100):
\${prev.sectionHTML}

**AMÉLIORATIONS À INTÉGRER**:

1. **Liens externes à ajouter**:
\${enrichment.external_links_suggested.map(l => \`   • [\${l.anchor}](\${l.url}) → \${l.insert_after}\`).join('\\n')}

2. **Citations communautaires**:
\${enrichment.community_quotes_suggested.map(q => \`   • "\${q.quote}" (Source: \${q.source}) → \${q.insert_location}\`).join('\\n')}

3. **Tableaux/visuels**:
\${enrichment.tables_suggested.map(t => \`   • \${t.title} → \${t.location}\`).join('\\n')}

4. **Mots-clés manquants**: \${enrichment.keyword_gaps.join(', ')}

**Ta mission**: Réécris la section en intégrant CES ÉLÉMENTS EXACTEMENT.

**Format JSON strict**:
{
  "section_index": \${prev.sectionIndex},
  "h2": "\${prev.h2}",
  "improved_html": "<section>...</section>",
  "improvements_applied": ["liste des améliorations"],
  "final_word_count": 550
}

IMPORTANT: HTML complet avec </section>!\`;

return {
  json: {
    ...prev,
    rewritePrompt,
    apiBody: JSON.stringify({
      model: "gpt-5.1",
      input: [{
        role: "user",
        content: [{type: "input_text", text: rewritePrompt}]
      }],
      text: {
        format: {
          type: "json_schema",
          name: "improved_section",
          schema: {
            type: "object",
            properties: {
              section_index: { type: "number" },
              h2: { type: "string" },
              improved_html: { type: "string" },
              improvements_applied: { type: "array", items: { type: "string" } },
              final_word_count: { type: "number" }
            },
            required: ["section_index", "h2", "improved_html"],
            additionalProperties: false
          },
          strict: true
        }
      },
      max_output_tokens: 4000,
      temperature: 0.5
    })
  }
};`
      },
      id: 'build-rewrite',
      name: 'Build Rewrite Body',
      type: 'n8n-nodes-base.code',
      typeVersion: 2,
      position: [3540, 200]
    },

    // NODE 16: Call GPT-5 Rewrite
    {
      parameters: {
        method: 'POST',
        url: 'https://api.openai.com/v1/chat/completions',
        authentication: 'predefinedCredentialType',
        nodeCredentialType: 'openAiApi',
        sendHeaders: true,
        headerParameters: {
          parameters: [
            { name: 'Content-Type', value: 'application/json' }
          ]
        },
        sendBody: true,
        specifyBody: 'json',
        jsonBody: '={{ $json.apiBody }}',
        options: {}
      },
      id: 'call-rewrite',
      name: 'STEP 5 - Rewrite Section (GPT-5.1)',
      type: 'n8n-nodes-base.httpRequest',
      typeVersion: 4.2,
      position: [3760, 200],
      credentials: {
        openAiApi: CREDENTIALS.openaiAuth
      }
    },

    // NODE 17: Extract Rewritten HTML
    {
      parameters: {
        jsCode: `const prev = $node['Build Rewrite Body'].json;
const response = $json;

let rewriteData;
try {
  const content = response.choices[0].message.content;
  rewriteData = JSON.parse(content);
} catch (e) {
  throw new Error('Failed to parse rewrite JSON: ' + e.message);
}

const improvedHTML = rewriteData.improved_html;

// Validation
if (!improvedHTML.includes('</section>')) {
  throw new Error('Rewritten HTML incomplete!');
}

console.log(\`✅ Section \${prev.sectionIndex} améliorée: \${rewriteData.final_word_count} mots\`);

return {
  json: {
    ...prev,
    finalHTML: improvedHTML,
    improvementsApplied: rewriteData.improvements_applied || [],
    finalWordCount: rewriteData.final_word_count
  }
};`
      },
      id: 'extract-rewrite',
      name: 'Extract Rewritten HTML',
      type: 'n8n-nodes-base.code',
      typeVersion: 2,
      position: [3980, 200]
    },

    // NODE 18: Merge (IF true/false paths)
    {
      parameters: {},
      id: 'merge-enrichment-paths',
      name: 'Merge',
      type: 'n8n-nodes-base.merge',
      typeVersion: 3,
      position: [4200, 300]
    },

    // NODE 19: Prepare Section for Save
    {
      parameters: {
        jsCode: `const data = $json;

// Si enrichment + rewrite, utilise finalHTML, sinon sectionHTML
const html = data.finalHTML || data.sectionHTML;
const wordCount = data.finalWordCount || data.wordCount;

return {
  json: {
    job_id: data.topic.replace(/\\s+/g, '_').toLowerCase() + '_' + Date.now(),
    section_index: data.sectionIndex,
    section_title: data.h2,
    content: {
      html: html,
      score: data.globalScore,
      word_count: wordCount,
      links: data.linksAdded || [],
      improvements: data.improvementsApplied || []
    }
  }
};`
      },
      id: 'prepare-save',
      name: 'Prepare Section for Save',
      type: 'n8n-nodes-base.code',
      typeVersion: 2,
      position: [4420, 300]
    },

    // NODE 20: Save to Supabase
    {
      parameters: {
        operation: 'insert',
        tableId: 'articles_content',
        options: {
          queryName: 'insert_section'
        }
      },
      id: 'save-section',
      name: 'STEP 6 - Save Section',
      type: '@n8n/n8n-nodes-langchain.supabaseInsert',
      typeVersion: 1,
      position: [4640, 300],
      credentials: {
        supabaseApi: CREDENTIALS.supabaseAuth
      }
    },

    // NODE 21: Loop Back (Split Sections)
    {
      parameters: {},
      id: 'loop-back',
      name: 'Loop Back to Next Section',
      type: 'n8n-nodes-base.noOp',
      typeVersion: 1,
      position: [4860, 300]
    },

    // NODE 22: All Sections Complete
    {
      parameters: {
        jsCode: `// Toutes les sections sont sauvegardées
const outlineData = $node['Extract Outline'].json;

console.log('✅ Toutes les sections générées et sauvegardées!');
console.log(\`📊 Total: \${outlineData.totalSections} sections\`);

return {
  json: {
    success: true,
    message: \`Article complet généré avec \${outlineData.totalSections} sections\`,
    job_id: $json.job_id,
    total_sections: outlineData.totalSections
  }
};`
      },
      id: 'all-sections-complete',
      name: 'All Sections Complete',
      type: 'n8n-nodes-base.code',
      typeVersion: 2,
      position: [5080, 300]
    },

    // NODE 23: Response
    {
      parameters: {
        respondWith: 'json',
        responseBody: '={{ $json }}',
        options: {}
      },
      id: 'response',
      name: 'Response',
      type: 'n8n-nodes-base.respondToWebhook',
      typeVersion: 1,
      position: [5300, 300]
    }
  ];
}

function createSectionalConnections() {
  return {
    'Webhook Trigger': {
      main: [[{ node: 'Build Outline Body', type: 'main', index: 0 }]]
    },
    'Build Outline Body': {
      main: [[{ node: 'STEP 1 - Generate Outline (GPT-5)', type: 'main', index: 0 }]]
    },
    'STEP 1 - Generate Outline (GPT-5)': {
      main: [[{ node: 'Extract Outline', type: 'main', index: 0 }]]
    },
    'Extract Outline': {
      main: [[{ node: 'Split Sections', type: 'main', index: 0 }]]
    },
    'Split Sections': {
      main: [
        [{ node: 'Build Writer Section Body', type: 'main', index: 0 }],
        [{ node: 'All Sections Complete', type: 'main', index: 0 }]
      ]
    },
    'Build Writer Section Body': {
      main: [[{ node: 'STEP 2 - Writer Section (GPT-5.1)', type: 'main', index: 0 }]]
    },
    'STEP 2 - Writer Section (GPT-5.1)': {
      main: [[{ node: 'Validate HTML', type: 'main', index: 0 }]]
    },
    'Validate HTML': {
      main: [[{ node: 'Build Reviewer Body', type: 'main', index: 0 }]]
    },
    'Build Reviewer Body': {
      main: [[{ node: 'STEP 3 - Reviewer Section (Claude)', type: 'main', index: 0 }]]
    },
    'STEP 3 - Reviewer Section (Claude)': {
      main: [[{ node: 'Extract Score & Decide', type: 'main', index: 0 }]]
    },
    'Extract Score & Decide': {
      main: [[{ node: 'IF Score < 95', type: 'main', index: 0 }]]
    },
    'IF Score < 95': {
      main: [
        [{ node: 'Build Enrichment Body', type: 'main', index: 0 }], // true
        [{ node: 'Merge', type: 'main', index: 0 }] // false
      ]
    },
    'Build Enrichment Body': {
      main: [[{ node: 'STEP 4 - Get Enrichment (Perplexity)', type: 'main', index: 0 }]]
    },
    'STEP 4 - Get Enrichment (Perplexity)': {
      main: [[{ node: 'Extract Enrichment', type: 'main', index: 0 }]]
    },
    'Extract Enrichment': {
      main: [[{ node: 'Build Rewrite Body', type: 'main', index: 0 }]]
    },
    'Build Rewrite Body': {
      main: [[{ node: 'STEP 5 - Rewrite Section (GPT-5.1)', type: 'main', index: 0 }]]
    },
    'STEP 5 - Rewrite Section (GPT-5.1)': {
      main: [[{ node: 'Extract Rewritten HTML', type: 'main', index: 0 }]]
    },
    'Extract Rewritten HTML': {
      main: [[{ node: 'Merge', type: 'main', index: 0 }]]
    },
    'Merge': {
      main: [[{ node: 'Prepare Section for Save', type: 'main', index: 0 }]]
    },
    'Prepare Section for Save': {
      main: [[{ node: 'STEP 6 - Save Section', type: 'main', index: 0 }]]
    },
    'STEP 6 - Save Section': {
      main: [[{ node: 'Loop Back to Next Section', type: 'main', index: 0 }]]
    },
    'Loop Back to Next Section': {
      main: [[{ node: 'Split Sections', type: 'main', index: 0 }]]
    },
    'All Sections Complete': {
      main: [[{ node: 'Response', type: 'main', index: 0 }]]
    }
  };
}

// Execute
transformWorkflow().catch(err => {
  console.error('\n❌ ERREUR:', err.message);
  process.exit(1);
});
