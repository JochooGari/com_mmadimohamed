#!/usr/bin/env node
/**
 * Ajoute l'étape "Get Enrichment Suggestions" après le scoring Perplexity
 * Pour que Claude analyse le score et propose des améliorations spécifiques
 */

const https = require('https');

const N8N_API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MjIsImVtYWlsIjoiZGV2QG1hZ2ljcGF0aC5jb20iLCJwYXNzd29yZCI6IiQyYSQxMCRmTmhSNkxBb0Uyd3l6eGg4NDF0NllPRFVyeDJDLmNaOWQyb2xBR1JRLjRXOE1scEdGM1kwdSJ9.VdOTnlOPeXqYDk3j05Ej-P-HXLLBXwJLnMOt_ZwfYs0';
const N8N_URL = 'n8n.srv1144760.hstgr.cloud';
const WORKFLOW_ID = '06yXZiR5QaoQmZsY';

console.log('🔧 AJOUT ÉTAPE ENRICHMENT AU WORKFLOW\n');
console.log('='.repeat(60));
console.log('');

// Étape 1: Récupérer le workflow actuel
function getWorkflow() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: N8N_URL,
      port: 443,
      path: `/api/v1/workflows/${WORKFLOW_ID}`,
      method: 'GET',
      headers: {
        'X-N8N-API-KEY': N8N_API_KEY,
        'Accept': 'application/json'
      }
    };

    console.log('📥 Récupération du workflow...');

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log('✅ Workflow récupéré\n');
          resolve(JSON.parse(data));
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

// Étape 2: Ajouter les nouveaux nodes
function addEnrichmentNodes(workflow) {
  console.log('🔧 Ajout des nodes d\'enrichissement...\n');

  // Trouver les nodes existants
  const extractScoreNode = workflow.nodes.find(n => n.name === 'Extract Score & Decide');
  const buildRewriteNode = workflow.nodes.find(n => n.name === 'Build Rewrite Body');

  if (!extractScoreNode || !buildRewriteNode) {
    throw new Error('Nodes Extract Score ou Build Rewrite introuvables');
  }

  // 1. Build Enrichment Body (demande à Perplexity les suggestions)
  const buildEnrichmentNode = {
    parameters: {
      jsCode: `// Build enrichment request to get suggestions for reaching 95%+
const prev = $node['Extract Score & Decide'].json;
const currentScore = prev.avgScore || 0;
const seoScore = prev.seoScore || 0;
const geoScore = prev.geoScore || 0;
const articleHTML = prev.draftHTML || '';

const enrichmentPrompt = \`Tu es un expert SEO/GEO. Analyse cet article qui a obtenu un score de \${currentScore}/100 (SEO: \${seoScore}, GEO: \${geoScore}).

ARTICLE ACTUEL:
\${articleHTML}

Ta mission: Liste PRÉCISÉMENT les éléments manquants pour atteindre 95%+ de score GEO.

Réponds en JSON strict:
{
  "missingElements": [
    {
      "type": "external_link",
      "description": "Ajouter un lien vers [source autoritaire spécifique]",
      "priority": "high",
      "example": "https://example.com/relevant-topic"
    },
    {
      "type": "keyword",
      "description": "Intégrer le mot-clé '[mot-clé GEO spécifique]' dans H2",
      "priority": "medium",
      "example": "H2 suggéré: ..."
    },
    {
      "type": "structure",
      "description": "Ajouter une section H2 sur [sujet manquant]",
      "priority": "high",
      "example": "## Titre suggéré..."
    }
  ],
  "externalLinksNeeded": [
    {
      "domain": "example.com",
      "topic": "Sujet pertinent",
      "reason": "Pourquoi ce lien est nécessaire"
    }
  ],
  "keywordGaps": ["mot-clé 1", "mot-clé 2", "mot-clé 3"],
  "structureImprovements": ["Amélioration 1", "Amélioration 2"],
  "estimatedScoreIncrease": 10
}\`;

return {
  json: {
    ...prev,
    apiBody: JSON.stringify({
      model: "sonar",
      messages: [
        {
          role: "system",
          content: "Tu es un expert SEO/GEO. Réponds UNIQUEMENT en JSON valide avec des suggestions précises et actionnables."
        },
        {
          role: "user",
          content: enrichmentPrompt
        }
      ],
      temperature: 0.3,
      max_tokens: 2000
    })
  }
};`
    },
    id: 'build-enrichment-body',
    name: 'Build Enrichment Body',
    type: 'n8n-nodes-base.code',
    typeVersion: 2,
    position: [
      extractScoreNode.position[0] + 220,
      extractScoreNode.position[1]
    ]
  };

  // 2. STEP 4b - Get Enrichment (Perplexity)
  const getEnrichmentNode = {
    parameters: {
      method: 'POST',
      url: 'https://api.perplexity.ai/chat/completions',
      authentication: 'predefinedCredentialType',
      nodeCredentialType: 'perplexityApi',
      sendBody: true,
      contentType: 'raw',
      rawContentType: 'application/json',
      body: '={{ $json.apiBody }}',
      options: {}
    },
    id: 'get-enrichment-perplexity',
    name: 'STEP 4b - Get Enrichment (Perplexity)',
    type: 'n8n-nodes-base.httpRequest',
    typeVersion: 4.2,
    position: [
      buildEnrichmentNode.position[0] + 220,
      buildEnrichmentNode.position[1]
    ]
  };

  // 3. Extract Enrichment Suggestions
  const extractEnrichmentNode = {
    parameters: {
      jsCode: `// Extract enrichment suggestions
const response = $input.all()[0].json;
const prev = $node['Extract Score & Decide'].json;

let enrichmentData = {
  missingElements: [],
  externalLinksNeeded: [],
  keywordGaps: [],
  structureImprovements: [],
  estimatedScoreIncrease: 0
};

try {
  const enrichmentText = response.choices?.[0]?.message?.content || '{}';

  // Try direct parse
  try {
    enrichmentData = JSON.parse(enrichmentText);
  } catch {
    // Try extracting JSON from markdown code block
    const match = enrichmentText.match(/\`\`\`json\\s*([\\s\\S]*?)\\s*\`\`\`/);
    if (match) {
      enrichmentData = JSON.parse(match[1]);
    }
  }
} catch (e) {
  console.log('Error parsing enrichment:', e.message);
}

// Build enrichment instructions for rewrite
const enrichmentInstructions = \`
ÉLÉMENTS À AJOUTER POUR ATTEINDRE 95%+:

1. LIENS EXTERNES REQUIS (\${enrichmentData.externalLinksNeeded?.length || 0}):
\${enrichmentData.externalLinksNeeded?.map((link, i) =>
  \`   \${i+1}. Ajouter lien vers \${link.domain} sur le sujet "\${link.topic}"
      Raison: \${link.reason}\`
).join('\\n') || '   - Aucun lien externe requis'}

2. MOTS-CLÉS GEO MANQUANTS (\${enrichmentData.keywordGaps?.length || 0}):
\${enrichmentData.keywordGaps?.map((kw, i) => \`   \${i+1}. "\${kw}"\`).join('\\n') || '   - Aucun mot-clé manquant'}

3. AMÉLIORATIONS STRUCTURE:
\${enrichmentData.structureImprovements?.map((imp, i) => \`   \${i+1}. \${imp}\`).join('\\n') || '   - Structure OK'}

4. ÉLÉMENTS DÉTAILLÉS:
\${enrichmentData.missingElements?.map((elem, i) =>
  \`   \${i+1}. [\${elem.priority?.toUpperCase()}] \${elem.description}
      Exemple: \${elem.example || 'N/A'}\`
).join('\\n\\n') || '   - Aucun élément spécifique'}

Augmentation de score estimée: +\${enrichmentData.estimatedScoreIncrease || 0} points
\`;

return {
  json: {
    ...prev,
    enrichmentData: enrichmentData,
    enrichmentInstructions: enrichmentInstructions,
    missingElements: enrichmentData.missingElements || [],
    externalLinksNeeded: enrichmentData.externalLinksNeeded || [],
    keywordGaps: enrichmentData.keywordGaps || [],
    estimatedScoreIncrease: enrichmentData.estimatedScoreIncrease || 0
  }
};`
    },
    id: 'extract-enrichment',
    name: 'Extract Enrichment',
    type: 'n8n-nodes-base.code',
    typeVersion: 2,
    position: [
      getEnrichmentNode.position[0] + 220,
      getEnrichmentNode.position[1]
    ]
  };

  // Ajouter les nouveaux nodes au workflow
  workflow.nodes.push(buildEnrichmentNode);
  workflow.nodes.push(getEnrichmentNode);
  workflow.nodes.push(extractEnrichmentNode);

  console.log('✅ 3 nouveaux nodes ajoutés:');
  console.log('   1. Build Enrichment Body');
  console.log('   2. STEP 4b - Get Enrichment (Perplexity)');
  console.log('   3. Extract Enrichment\n');

  return workflow;
}

// Étape 3: Mettre à jour les connexions
function updateConnections(workflow) {
  console.log('🔗 Mise à jour des connexions...\n');

  // Nouvelle chaîne:
  // Extract Score & Decide → Build Enrichment Body → Get Enrichment → Extract Enrichment → IF Score < 95%

  // 1. Extract Score → Build Enrichment
  workflow.connections['Extract Score & Decide'] = {
    main: [
      [
        {
          node: 'Build Enrichment Body',
          type: 'main',
          index: 0
        }
      ]
    ]
  };

  // 2. Build Enrichment → Get Enrichment
  workflow.connections['Build Enrichment Body'] = {
    main: [
      [
        {
          node: 'STEP 4b - Get Enrichment (Perplexity)',
          type: 'main',
          index: 0
        }
      ]
    ]
  };

  // 3. Get Enrichment → Extract Enrichment
  workflow.connections['STEP 4b - Get Enrichment (Perplexity)'] = {
    main: [
      [
        {
          node: 'Extract Enrichment',
          type: 'main',
          index: 0
        }
      ]
    ]
  };

  // 4. Extract Enrichment → IF Score < 95%
  workflow.connections['Extract Enrichment'] = {
    main: [
      [
        {
          node: 'IF Score < 95%',
          type: 'main',
          index: 0
        }
      ]
    ]
  };

  console.log('✅ Connexions mises à jour\n');

  return workflow;
}

// Étape 4: Mettre à jour le node "Build Rewrite Body" pour utiliser les suggestions
function updateRewriteBody(workflow) {
  console.log('📝 Mise à jour du Build Rewrite Body...\n');

  const buildRewriteIndex = workflow.nodes.findIndex(n => n.name === 'Build Rewrite Body');

  if (buildRewriteIndex === -1) {
    throw new Error('Node Build Rewrite Body introuvable');
  }

  // Ajouter les suggestions d'enrichissement au prompt de rewrite
  workflow.nodes[buildRewriteIndex].parameters.jsCode = `// Build rewrite request with enrichment suggestions
const prev = $node['Extract Enrichment'].json;

const rewritePrompt = \`Tu es un rédacteur expert SEO/GEO.

ARTICLE ACTUEL (Score: \${prev.avgScore}/100):
\${prev.draftHTML || ''}

REVIEW PRÉCÉDENTE:
\${prev.reviewText || ''}

🎯 SUGGESTIONS D'ENRICHISSEMENT POUR ATTEINDRE 95%+:
\${prev.enrichmentInstructions || 'Aucune suggestion disponible'}

Ta mission: RÉÉCRIRE cet article en INTÉGRANT TOUTES les suggestions d'enrichissement ci-dessus.

IMPORTANT:
- Ajoute TOUS les liens externes suggérés
- Intègre TOUS les mots-clés GEO manquants
- Applique TOUTES les améliorations de structure
- Garde le même ton et style
- 2500+ mots minimum
- Format HTML strict (pas de markdown)

Réponds en JSON strict:
{
  "html": "<article>...</article>",
  "addedElements": {
    "externalLinks": ["url1", "url2"],
    "keywords": ["kw1", "kw2"],
    "structureChanges": ["change1"]
  }
}\`;

return {
  json: {
    ...prev,
    apiBody: JSON.stringify({
      model: "gpt-5.1",
      modalities: ["text"],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "article_rewrite",
          strict: true,
          schema: {
            type: "object",
            properties: {
              html: {
                type: "string",
                description: "Article complet en HTML avec enrichissements appliqués"
              },
              addedElements: {
                type: "object",
                properties: {
                  externalLinks: {
                    type: "array",
                    items: { type: "string" },
                    description: "URLs des liens externes ajoutés"
                  },
                  keywords: {
                    type: "array",
                    items: { type: "string" },
                    description: "Mots-clés GEO ajoutés"
                  },
                  structureChanges: {
                    type: "array",
                    items: { type: "string" },
                    description: "Changements de structure appliqués"
                  }
                },
                required: ["externalLinks", "keywords", "structureChanges"],
                additionalProperties: false
              }
            },
            required: ["html", "addedElements"],
            additionalProperties: false
          }
        }
      },
      messages: [
        {
          role: "user",
          content: rewritePrompt
        }
      ],
      max_completion_tokens: 16000
    })
  }
};`;

  console.log('✅ Build Rewrite Body mis à jour pour utiliser les suggestions\n');

  return workflow;
}

// Étape 5: Sauvegarder le workflow
function updateWorkflow(workflow) {
  return new Promise((resolve, reject) => {
    const workflowToUpdate = {
      name: workflow.name,
      nodes: workflow.nodes,
      connections: workflow.connections,
      settings: workflow.settings
    };

    const payload = JSON.stringify(workflowToUpdate);

    const options = {
      hostname: N8N_URL,
      port: 443,
      path: `/api/v1/workflows/${WORKFLOW_ID}`,
      method: 'PUT',
      headers: {
        'X-N8N-API-KEY': N8N_API_KEY,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    };

    console.log('💾 Sauvegarde du workflow...');

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log('✅ Workflow mis à jour avec succès!\n');
          resolve(JSON.parse(data));
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

// Exécution principale
async function main() {
  try {
    // 1. Récupérer le workflow
    let workflow = await getWorkflow();

    // 2. Ajouter les nodes d'enrichissement
    workflow = addEnrichmentNodes(workflow);

    // 3. Mettre à jour les connexions
    workflow = updateConnections(workflow);

    // 4. Mettre à jour le Build Rewrite Body
    workflow = updateRewriteBody(workflow);

    // 5. Sauvegarder
    await updateWorkflow(workflow);

    console.log('='.repeat(60));
    console.log('');
    console.log('🎉 ÉTAPE ENRICHMENT AJOUTÉE AVEC SUCCÈS !');
    console.log('');
    console.log('📊 Nouvelle structure du workflow:');
    console.log('   1. Research (Claude)');
    console.log('   2. Draft (GPT-5.1)');
    console.log('   3. Review (Claude)');
    console.log('   4. Score (Perplexity)');
    console.log('   → 4b. Get Enrichment (Perplexity) ✨ NOUVEAU');
    console.log('   5. IF Score < 95%');
    console.log('      → Rewrite avec suggestions d\'enrichissement');
    console.log('      → Re-review');
    console.log('      → Re-score');
    console.log('   6. Save to Supabase');
    console.log('');
    console.log('✅ Le rewrite utilisera maintenant les suggestions précises');
    console.log('   pour atteindre 95%+ (liens externes, mots-clés GEO, etc.)');
    console.log('');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

main();
