#!/usr/bin/env node
/**
 * Ajoute l'étape "Get Enrichment Suggestions" avec Perplexity
 * après le scoring pour obtenir les recommandations précises
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 AJOUT ÉTAPE ENRICHMENT PERPLEXITY\n');
console.log('='.repeat(60));
console.log('');

// Charger le workflow actuel
const workflowPath = path.join(__dirname, 'workflow-complete-with-loop.json');
const workflow = JSON.parse(fs.readFileSync(workflowPath, 'utf8'));

console.log('📥 Workflow chargé:', workflow.nodes.length, 'nodes\n');

// Trouver les nodes concernés
const extractScoreNode = workflow.nodes.find(n => n.name === 'Extract Score & Decide');
const ifScoreNode = workflow.nodes.find(n => n.name === 'IF Score < 95%');
const buildRewriteNode = workflow.nodes.find(n => n.name === 'Build Rewrite Body');

if (!extractScoreNode || !ifScoreNode || !buildRewriteNode) {
  console.error('❌ Nodes introuvables');
  process.exit(1);
}

console.log('✅ Nodes trouvés:');
console.log('   - Extract Score & Decide');
console.log('   - IF Score < 95%');
console.log('   - Build Rewrite Body\n');

// 1. Créer le node "Build Enrichment Body"
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
    },
    {
      "type": "structure",
      "description": "Ajouter une section H2 sur [sujet]",
      "priority": "high",
      "example": "## Nouveau titre suggéré"
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
  "keywordGaps": ["mot-clé GEO 1", "mot-clé GEO 2", "mot-clé GEO 3"],
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

// 2. Créer le node "STEP 4b - Get Enrichment (Perplexity)"
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
    buildEnrichmentNode.position[0] + 240,
    buildEnrichmentNode.position[1]
  ]
};

// 3. Créer le node "Extract Enrichment"
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

  // Try direct parse
  try {
    enrichmentData = JSON.parse(enrichmentText);
  } catch {
    // Try extracting JSON from markdown code block
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

// Build detailed enrichment instructions for rewrite
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

5️⃣ ÉLÉMENTS DÉTAILLÉS PRIORITAIRES:
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
    getEnrichmentNode.position[0] + 240,
    getEnrichmentNode.position[1]
  ]
};

// Ajouter les nouveaux nodes
workflow.nodes.push(buildEnrichmentNode);
workflow.nodes.push(getEnrichmentNode);
workflow.nodes.push(extractEnrichmentNode);

console.log('✅ 3 nouveaux nodes créés:');
console.log('   1. Build Enrichment Body');
console.log('   2. STEP 4b - Get Enrichment (Perplexity)');
console.log('   3. Extract Enrichment\n');

// Mettre à jour les connexions
console.log('🔗 Mise à jour des connexions...\n');

// Ancienne chaîne: Extract Score → IF Score < 95%
// Nouvelle chaîne: Extract Score → Build Enrichment → Get Enrichment → Extract Enrichment → IF Score < 95%

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

console.log('✅ Connexions mises à jour\n');

// Mettre à jour le Build Rewrite Body pour utiliser les suggestions
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

console.log('✅ Build Rewrite Body mis à jour\n');

// Sauvegarder le nouveau workflow
const newWorkflowPath = path.join(__dirname, 'workflow-complete-with-enrichment.json');
fs.writeFileSync(newWorkflowPath, JSON.stringify(workflow, null, 2));

console.log('='.repeat(60));
console.log('');
console.log('🎉 WORKFLOW ENRICHI CRÉÉ AVEC SUCCÈS !');
console.log('');
console.log('📁 Fichier:', path.basename(newWorkflowPath));
console.log('📊 Total nodes:', workflow.nodes.length);
console.log('');
console.log('📋 Nouvelle structure:');
console.log('   1. Research (Claude)');
console.log('   2. Draft (GPT-5.1)');
console.log('   3. Review (Claude)');
console.log('   4. Score (Perplexity)');
console.log('   → 4b. Get Enrichment (Perplexity) ✨ NOUVEAU');
console.log('   → Extract Enrichment ✨ NOUVEAU');
console.log('   5. IF Score < 95%');
console.log('      → Rewrite avec suggestions Perplexity');
console.log('      → Re-review');
console.log('      → Re-score');
console.log('      → Boucle jusqu\'à 95%+ (max 3 itérations)');
console.log('   6. Save to Supabase');
console.log('');
console.log('✅ Le rewrite inclura maintenant:');
console.log('   • Liens externes suggérés par Perplexity');
console.log('   • Mots-clés GEO manquants');
console.log('   • Améliorations de structure');
console.log('   • Comblement des lacunes de contenu');
console.log('');
console.log('📥 Importez ce fichier dans n8n pour activer la nouvelle version');
console.log('');
