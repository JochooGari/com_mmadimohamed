#!/usr/bin/env node
/**
 * Correction FINALE de l'API GPT-5 Responses
 * Basé sur la documentation officielle:
 * https://platform.openai.com/docs/api-reference/responses/create
 *
 * Changements:
 * - messages → input
 * - response_format → text.format
 * - max_completion_tokens → max_output_tokens
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env.n8n');
const envContent = fs.readFileSync(envPath, 'utf8');
const N8N_API_KEY = envContent.match(/N8N_API_KEY=(.+)/)[1].trim();
const N8N_URL = 'n8n.srv1144760.hstgr.cloud';
const WORKFLOW_ID = '06yXZiR5QaoQmZsY';

console.log('🔧 CORRECTION FINALE GPT-5 RESPONSES API\n');
console.log('='.repeat(60));
console.log('');

function httpsRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: N8N_URL,
      port: 443,
      path: path,
      method: method,
      headers: {
        'X-N8N-API-KEY': N8N_API_KEY,
        'Accept': 'application/json'
      }
    };

    if (data) {
      const payload = JSON.stringify(data);
      options.headers['Content-Type'] = 'application/json';
      options.headers['Content-Length'] = Buffer.byteLength(payload);
    }

    const req = https.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => { responseData += chunk; });
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve(JSON.parse(responseData));
          } catch {
            resolve(responseData);
          }
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${responseData}`));
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

async function main() {
  try {
    console.log('📥 Récupération du workflow...\n');
    const workflow = await httpsRequest('GET', `/api/v1/workflows/${WORKFLOW_ID}`);

    console.log('🔍 Nodes à mettre à jour:');
    console.log('   - Build Draft Body (GPT-5.1)');
    console.log('   - Build Rewrite Body');
    console.log('');

    // 1. Build Draft Body
    const draftIndex = workflow.nodes.findIndex(n => n.name === 'Build Draft Body (GPT-5.1)');
    if (draftIndex !== -1) {
      console.log('🔄 Mise à jour: Build Draft Body (GPT-5.1)...');

      workflow.nodes[draftIndex].parameters.jsCode = `// Build Draft request body for GPT-5.1 Responses API
const data = $input.all()[0].json;

const draftPrompt = \`Tu es un rédacteur expert SEO/GEO.

SUJET: \${data.topic}

PLAN:
\${data.outline}

RECHERCHE PRÉALABLE:
\${data.researchText || 'Non disponible'}

LIENS INTERNES DISPONIBLES:
\${data.internalLinksText || 'Aucun'}

Ta mission: Rédige un article complet de 2500+ mots en français, optimisé SEO/GEO.

Structure requise:
- H1 (titre principal)
- 4-6 sections H2
- Sous-sections H3 si pertinent
- 3-5 liens internes (utilise les liens fournis ci-dessus)
- Format HTML strict (pas de markdown)

Réponds en JSON strict:
{
  "html": "<article><h1>Titre</h1>...</article>"
}\`;

return {
  json: {
    ...data,
    apiBody: JSON.stringify({
      model: "gpt-5.1",
      modalities: ["text"],
      text: {
        format: {
          type: "json_schema",
          json_schema: {
            name: "article_draft",
            strict: true,
            schema: {
              type: "object",
              properties: {
                html: {
                  type: "string",
                  description: "Article complet en HTML"
                }
              },
              required: ["html"],
              additionalProperties: false
            }
          }
        }
      },
      input: draftPrompt,
      max_output_tokens: 16000,
      temperature: 1
    })
  }
};`;

      console.log('   ✅ max_completion_tokens → max_output_tokens\n');
    }

    // 2. Build Rewrite Body
    const rewriteIndex = workflow.nodes.findIndex(n => n.name === 'Build Rewrite Body');
    if (rewriteIndex !== -1) {
      console.log('🔄 Mise à jour: Build Rewrite Body...');

      workflow.nodes[rewriteIndex].parameters.jsCode = `// Build rewrite request with Perplexity enrichment suggestions
const prev = $node['Extract Enrichment'].json;

const rewritePrompt = \`Tu es un rédacteur expert SEO/GEO.

ARTICLE ACTUEL (Score: \${prev.avgScore}/100, SEO: \${prev.seoScore}, GEO: \${prev.geoScore}):
\${prev.draftHTML || ''}

REVIEW PRÉCÉDENTE:
\${prev.reviewText || ''}

\${prev.enrichmentInstructions || '🎯 SUGGESTIONS PERPLEXITY NON DISPONIBLES'}

Ta mission: RÉÉCRIRE cet article en INTÉGRANT TOUTES les suggestions Perplexity ci-dessus.

IMPÉRATIF:
- ✅ Ajoute TOUS les liens externes suggérés par Perplexity (avec ancres appropriées)
- ✅ Intègre TOUS les mots-clés GEO manquants identifiés
- ✅ Applique TOUTES les améliorations de structure recommandées
- ✅ Comble TOUTES les lacunes de contenu listées
- ✅ Priorité aux éléments marqués "high priority"
- Garde le même ton et style professionnel
- 2500+ mots minimum
- Format HTML strict (pas de markdown)

Réponds en JSON strict:
{
  "html": "<article>...</article>",
  "addedElements": {
    "externalLinks": ["url1", "url2"],
    "keywords": ["kw1", "kw2"],
    "structureChanges": ["change1"],
    "contentAdditions": ["addition1"]
  }
}\`;

return {
  json: {
    ...prev,
    apiBody: JSON.stringify({
      model: "gpt-5.1",
      modalities: ["text"],
      text: {
        format: {
          type: "json_schema",
          json_schema: {
            name: "article_rewrite_with_enrichment",
            strict: true,
            schema: {
              type: "object",
              properties: {
                html: {
                  type: "string",
                  description: "Article complet en HTML avec toutes les suggestions Perplexity appliquées"
                },
                addedElements: {
                  type: "object",
                  properties: {
                    externalLinks: {
                      type: "array",
                      items: { type: "string" },
                      description: "URLs des liens externes ajoutés selon suggestions Perplexity"
                    },
                    keywords: {
                      type: "array",
                      items: { type: "string" },
                      description: "Mots-clés GEO ajoutés selon suggestions Perplexity"
                    },
                    structureChanges: {
                      type: "array",
                      items: { type: "string" },
                      description: "Changements de structure appliqués"
                    },
                    contentAdditions: {
                      type: "array",
                      items: { type: "string" },
                      description: "Ajouts de contenu pour combler les lacunes"
                    }
                  },
                  required: ["externalLinks", "keywords", "structureChanges", "contentAdditions"],
                  additionalProperties: false
                }
              },
              required: ["html", "addedElements"],
              additionalProperties: false
            }
          }
        }
      },
      input: rewritePrompt,
      max_output_tokens: 16000,
      temperature: 1
    })
  }
};`;

      console.log('   ✅ max_completion_tokens → max_output_tokens\n');
    }

    // 3. Sauvegarder
    console.log('💾 Mise à jour du workflow...\n');

    const workflowToUpdate = {
      name: workflow.name,
      nodes: workflow.nodes,
      connections: workflow.connections,
      settings: workflow.settings
    };

    await httpsRequest('PUT', `/api/v1/workflows/${WORKFLOW_ID}`, workflowToUpdate);

    console.log('='.repeat(60));
    console.log('');
    console.log('🎉 CORRECTION FINALE APPLIQUÉE !');
    console.log('');
    console.log('✅ Format API Responses complet:');
    console.log('   {');
    console.log('     model: "gpt-5.1",');
    console.log('     modalities: ["text"],');
    console.log('     text: {');
    console.log('       format: {');
    console.log('         type: "json_schema",');
    console.log('         json_schema: { ... }');
    console.log('       }');
    console.log('     },');
    console.log('     input: "prompt",  ✅');
    console.log('     max_output_tokens: 16000,  ✅');
    console.log('     temperature: 1');
    console.log('   }');
    console.log('');
    console.log('✅ Tous les paramètres conformes à la documentation officielle');
    console.log('');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

main();
