#!/usr/bin/env node
/**
 * Modifie directement le workflow "Full Workflow" actif dans n8n
 * pour ajouter l'étape d'enrichissement Perplexity
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Charger les variables d'environnement
const envPath = path.join(__dirname, '..', '.env.n8n');
const envContent = fs.readFileSync(envPath, 'utf8');
const N8N_API_KEY = envContent.match(/N8N_API_KEY=(.+)/)[1].trim();
const N8N_URL = 'n8n.srv1144760.hstgr.cloud';
const WORKFLOW_ID = '06yXZiR5QaoQmZsY';

console.log('🔧 MISE À JOUR DU WORKFLOW "FULL WORKFLOW"\n');
console.log('='.repeat(60));
console.log('');
console.log('🔑 API Key:', N8N_API_KEY.substring(0, 20) + '...');
console.log('🌐 URL:', N8N_URL);
console.log('📋 Workflow ID:', WORKFLOW_ID);
console.log('');

// Fonction pour faire une requête HTTPS
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
    // 1. Récupérer le workflow actuel
    console.log('📥 Récupération du workflow actuel...\n');
    const workflow = await httpsRequest('GET', `/api/v1/workflows/${WORKFLOW_ID}`);

    console.log('✅ Workflow récupéré:');
    console.log('   Nom:', workflow.name);
    console.log('   Nodes actuels:', workflow.nodes.length);
    console.log('');

    // 2. Trouver les nodes concernés
    const extractScoreNode = workflow.nodes.find(n => n.name === 'Extract Score & Decide');
    const ifScoreNode = workflow.nodes.find(n => n.name === 'IF Score < 95%');
    const buildRewriteNode = workflow.nodes.find(n => n.name === 'Build Rewrite Body');

    if (!extractScoreNode || !ifScoreNode || !buildRewriteNode) {
      throw new Error('Nodes critiques introuvables');
    }

    console.log('✅ Nodes trouvés:');
    console.log('   - Extract Score & Decide');
    console.log('   - IF Score < 95%');
    console.log('   - Build Rewrite Body');
    console.log('');

    // 3. Créer les 3 nouveaux nodes
    console.log('🔧 Création des nouveaux nodes...\n');

    const buildEnrichmentNode = {
      parameters: {
        jsCode: `// Build Perplexity enrichment request
const prev = $node['Extract Score & Decide'].json;
const currentScore = prev.avgScore || 0;
const seoScore = prev.seoScore || 0;
const geoScore = prev.geoScore || 0;
const articleHTML = prev.draftHTML || '';

const enrichmentPrompt = \`Tu es un expert SEO/GEO. Analyse cet article qui a obtenu un score de \${currentScore}/100 (SEO: \${seoScore}, GEO: \${geoScore}).

ARTICLE ACTUEL:
\${articleHTML}

Ta mission: Liste PRÉCISÉMENT les éléments à ajouter pour atteindre 95%+ de score GEO.

Réponds en JSON strict:
{
  "missingElements": [
    {
      "type": "external_link",
      "description": "Ajouter un lien vers [source autoritaire spécifique]",
      "priority": "high",
      "example": "https://example.com/topic"
    },
    {
      "type": "keyword",
      "description": "Intégrer le mot-clé GEO '[mot-clé]' dans H2",
      "priority": "medium",
      "example": "## Titre suggéré avec mot-clé"
    }
  ],
  "externalLinksNeeded": [
    {
      "domain": "example.com",
      "topic": "Sujet pertinent",
      "anchorText": "Texte d'ancre suggéré",
      "reason": "Pourquoi ce lien améliore le score GEO"
    }
  ],
  "keywordGaps": ["mot-clé GEO 1", "mot-clé GEO 2"],
  "structureImprovements": ["Amélioration 1", "Amélioration 2"],
  "contentGaps": ["Sujet manquant 1", "Sujet manquant 2"],
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
          content: "Tu es un expert SEO/GEO. Réponds UNIQUEMENT en JSON valide avec des suggestions précises et actionnables pour améliorer le score GEO."
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
        extractScoreNode.position[0] + 240,
        extractScoreNode.position[1]
      ]
    };

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
        buildEnrichmentNode.position[0] + 280,
        buildEnrichmentNode.position[1]
      ]
    };

    const extractEnrichmentNode = {
      parameters: {
        jsCode: `// Extract enrichment suggestions from Perplexity
const response = $input.all()[0].json;
const prev = $node['Extract Score & Decide'].json;

let enrichmentData = {
  missingElements: [],
  externalLinksNeeded: [],
  keywordGaps: [],
  structureImprovements: [],
  contentGaps: [],
  estimatedScoreIncrease: 0
};

try {
  const enrichmentText = response.choices?.[0]?.message?.content || '{}';
  try {
    enrichmentData = JSON.parse(enrichmentText);
  } catch {
    const match = enrichmentText.match(/\`\`\`json\\s*([\\s\\S]*?)\\s*\`\`\`/);
    if (match) {
      try {
        enrichmentData = JSON.parse(match[1]);
      } catch (e2) {
        console.log('Failed to parse JSON from code block:', e2.message);
      }
    }
  }
} catch (e) {
  console.log('Error parsing enrichment:', e.message);
}

const enrichmentInstructions = \`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 SUGGESTIONS PERPLEXITY POUR ATTEINDRE 95%+ DE SCORE GEO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 Score actuel: \${prev.avgScore}/100 (SEO: \${prev.seoScore}, GEO: \${prev.geoScore})
📈 Augmentation estimée: +\${enrichmentData.estimatedScoreIncrease || 0} points

1️⃣ LIENS EXTERNES REQUIS (\${enrichmentData.externalLinksNeeded?.length || 0}):
\${enrichmentData.externalLinksNeeded?.map((link, i) =>
  \`   \${i+1}. 🔗 Ajouter lien vers: \${link.domain}
      📝 Sujet: \${link.topic}
      🎯 Ancre: "\${link.anchorText}"
      💡 Raison: \${link.reason}\`
).join('\\n\\n') || '   ✅ Aucun lien externe requis'}

2️⃣ MOTS-CLÉS GEO MANQUANTS (\${enrichmentData.keywordGaps?.length || 0}):
\${enrichmentData.keywordGaps?.map((kw, i) => \`   \${i+1}. 🔑 "\${kw}"\`).join('\\n') || '   ✅ Mots-clés OK'}

3️⃣ AMÉLIORATIONS STRUCTURE (\${enrichmentData.structureImprovements?.length || 0}):
\${enrichmentData.structureImprovements?.map((imp, i) => \`   \${i+1}. 📐 \${imp}\`).join('\\n') || '   ✅ Structure OK'}

4️⃣ LACUNES DE CONTENU (\${enrichmentData.contentGaps?.length || 0}):
\${enrichmentData.contentGaps?.map((gap, i) => \`   \${i+1}. 📋 \${gap}\`).join('\\n') || '   ✅ Contenu complet'}

5️⃣ ÉLÉMENTS PRIORITAIRES:
\${enrichmentData.missingElements
  ?.filter(e => e.priority === 'high')
  .map((elem, i) =>
    \`   \${i+1}. 🔴 [\${elem.type.toUpperCase()}] \${elem.description}
      💡 Exemple: \${elem.example || 'N/A'}\`
  ).join('\\n\\n') || '   ✅ Aucun élément hautement prioritaire'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️  APPLIQUE TOUTES CES SUGGESTIONS DANS LA RÉÉCRITURE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
\`;

return {
  json: {
    ...prev,
    enrichmentData: enrichmentData,
    enrichmentInstructions: enrichmentInstructions,
    missingElements: enrichmentData.missingElements || [],
    externalLinksNeeded: enrichmentData.externalLinksNeeded || [],
    keywordGaps: enrichmentData.keywordGaps || [],
    structureImprovements: enrichmentData.structureImprovements || [],
    contentGaps: enrichmentData.contentGaps || [],
    estimatedScoreIncrease: enrichmentData.estimatedScoreIncrease || 0
  }
};`
      },
      id: 'extract-enrichment',
      name: 'Extract Enrichment',
      type: 'n8n-nodes-base.code',
      typeVersion: 2,
      position: [
        getEnrichmentNode.position[0] + 280,
        getEnrichmentNode.position[1]
      ]
    };

    // Ajouter les nouveaux nodes
    workflow.nodes.push(buildEnrichmentNode);
    workflow.nodes.push(getEnrichmentNode);
    workflow.nodes.push(extractEnrichmentNode);

    console.log('✅ 3 nouveaux nodes ajoutés:');
    console.log('   1. Build Enrichment Body');
    console.log('   2. STEP 4b - Get Enrichment (Perplexity)');
    console.log('   3. Extract Enrichment');
    console.log('');

    // 4. Mettre à jour les connexions
    console.log('🔗 Mise à jour des connexions...\n');

    workflow.connections['Extract Score & Decide'] = {
      main: [[{ node: 'Build Enrichment Body', type: 'main', index: 0 }]]
    };

    workflow.connections['Build Enrichment Body'] = {
      main: [[{ node: 'STEP 4b - Get Enrichment (Perplexity)', type: 'main', index: 0 }]]
    };

    workflow.connections['STEP 4b - Get Enrichment (Perplexity)'] = {
      main: [[{ node: 'Extract Enrichment', type: 'main', index: 0 }]]
    };

    workflow.connections['Extract Enrichment'] = {
      main: [[{ node: 'IF Score < 95%', type: 'main', index: 0 }]]
    };

    console.log('✅ Connexions mises à jour');
    console.log('');

    // 5. Mettre à jour le Build Rewrite Body
    console.log('📝 Mise à jour du Build Rewrite Body...\n');

    const buildRewriteIndex = workflow.nodes.findIndex(n => n.name === 'Build Rewrite Body');

    workflow.nodes[buildRewriteIndex].parameters.jsCode = `// Build rewrite request with Perplexity enrichment suggestions
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
      response_format: {
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
      },
      messages: [
        {
          role: "user",
          content: rewritePrompt
        }
      ],
      max_completion_tokens: 16000,
      temperature: 1
    })
  }
};`;

    console.log('✅ Build Rewrite Body mis à jour');
    console.log('');

    // 6. Sauvegarder via l'API
    console.log('💾 Mise à jour du workflow via l\'API n8n...\n');

    const workflowToUpdate = {
      name: workflow.name,
      nodes: workflow.nodes,
      connections: workflow.connections,
      settings: workflow.settings
    };

    await httpsRequest('PUT', `/api/v1/workflows/${WORKFLOW_ID}`, workflowToUpdate);

    console.log('='.repeat(60));
    console.log('');
    console.log('🎉 WORKFLOW MIS À JOUR AVEC SUCCÈS !');
    console.log('');
    console.log('📊 Statistiques:');
    console.log('   Nodes totaux:', workflow.nodes.length);
    console.log('   Nouveaux nodes: 3');
    console.log('   Connexions mises à jour: 5');
    console.log('');
    console.log('✅ Le workflow "Full Workflow" est maintenant enrichi avec:');
    console.log('   → STEP 4b - Get Enrichment (Perplexity)');
    console.log('   → Suggestions précises pour atteindre 95%+');
    console.log('   → Rewrite optimisé avec instructions Perplexity');
    console.log('');
    console.log('🧪 Testez maintenant avec:');
    console.log('   node workflow-n8n/test-complete-loop.js');
    console.log('');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

main();
