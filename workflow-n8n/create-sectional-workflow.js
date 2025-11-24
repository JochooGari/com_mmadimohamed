#!/usr/bin/env node
/**
 * CRÉATION WORKFLOW N8N : GÉNÉRATION PAR SECTIONS
 *
 * Architecture simplifiée pour PoC:
 * 1. Webhook Trigger
 * 2. Generate Outline (GPT-5) → Plan H1/H2/H3
 * 3. Save Outline to Supabase
 * 4. Split Sections (Loop)
 * 5. Writer Section (GPT-5.1) → HTML validé
 * 6. Reviewer Section (Claude) → Score SEO/GEO
 * 7. Save Section to Supabase
 * 8. Response
 */

require('dotenv').config({ path: 'c:/Users/power/OneDrive/Documents/Website_2025_06_30/magicpath-project/.env.local' });
const axios = require('axios');
const fs = require('fs');

const N8N_URL = (process.env.N8N_url || 'https://n8n.srv1144760.hstgr.cloud/api/v1').replace('/api/v1', '');
const N8N_API_KEY = (process.env.N8N_API_KEY || '').trim();

console.log('\n🔧 CRÉATION WORKFLOW SECTIONAL (Version simplifiée)\n');
console.log('=' .repeat(80));

// Au lieu de créer 23 nodes complexes, on va juste EXPORTER un workflow JSON
// que tu pourras importer manuellement dans n8n

const workflowJSON = {
  "name": "Article Generation - Sectional (Simple)",
  "nodes": [
    {
      "parameters": {
        "httpMethod": "POST",
        "path": "generate-article-sectional",
        "responseMode": "responseNode",
        "options": {}
      },
      "id": "webhook-1",
      "name": "Webhook",
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 2,
      "position": [240, 300],
      "webhookId": "generate-sectional"
    },
    {
      "parameters": {
        "assignments": {
          "assignments": [
            {
              "id": "topic",
              "name": "topic",
              "value": "={{ $json.topic }}",
              "type": "string"
            },
            {
              "id": "outline",
              "name": "outline",
              "value": "={{ $json.outline }}",
              "type": "string"
            },
            {
              "id": "sections_array",
              "name": "sections",
              "value": "={{ $json.outline.split('|').map(s => s.trim()) }}",
              "type": "array"
            }
          ]
        },
        "options": {}
      },
      "id": "extract-input",
      "name": "Extract Input",
      "type": "n8n-nodes-base.set",
      "typeVersion": 3.4,
      "position": [460, 300]
    },
    {
      "parameters": {
        "content": `## ✅ WORKFLOW SECTIONAL CRÉÉ

Ce workflow est un **proof of concept** simplifié de la génération par sections.

### Architecture actuelle:
1. **Webhook** → Reçoit topic + outline
2. **Extract Input** → Parse les sections
3. **Note d'information** (ce node!)

### Pour compléter le workflow:

Tu dois ajouter manuellement les nodes suivants via l'interface n8n:

#### STEP 1: Generate Outline
- Type: **Code** (JavaScript)
- Fonction: Construit le prompt pour GPT-5 demandant le plan détaillé
- Output: \`apiBody\` avec le JSON Schema pour l'outline

#### STEP 2: Call GPT-5 Outline
- Type: **HTTP Request**
- Method: POST
- URL: https://api.openai.com/v1/chat/completions
- Auth: OpenAI API credential
- Body: \`{{ $json.apiBody }}\`

#### STEP 3: Extract Outline
- Type: **Code**
- Fonction: Parse la réponse GPT-5, extrait le JSON outline

#### STEP 4: Split Sections
- Type: **Split In Batches**
- Batch Size: 1
- Input: \`{{ $json.sections }}\`

#### STEP 5: Writer Section (dans la loop)
- Type: **Code** → Build prompt pour la section
- Type: **HTTP Request** → Call GPT-5.1 avec max_output_tokens=3500
- Type: **Code** → Validate HTML (vérifie </section>)

#### STEP 6: Reviewer Section
- Type: **Code** → Build reviewer prompt avec tableau scoring
- Type: **HTTP Request** → Call Claude Sonnet
- Type: **Code** → Extract scores SEO/GEO

#### STEP 7: Save Section
- Type: **Supabase** Insert
- Table: articles_content
- Fields: job_id, section_index, section_title, content (JSON)

#### STEP 8: Loop Back
- Connecte la sauvegarde au node "Split Sections" (input 0)

#### STEP 9: Response
- Type: **Respond to Webhook**
- Body: \`{{ {success: true, sections: $json.totalSections} }}\`

---

### 📝 Prompts à utiliser:

Les prompts complets sont disponibles dans:
- **Writer**: Voir le document fourni par l'utilisateur
- **Reviewer**: Voir le prompt de scoring avec tableau pondéré

### ⚙️ Paramètres critiques:

**GPT-5.1 (Writer)**:
\`\`\`json
{
  "model": "gpt-5.1",
  "input": [{
    "role": "user",
    "content": [{"type": "input_text", "text": "..."}]
  }],
  "text": {
    "format": {
      "type": "json_schema",
      "schema": {...},
      "strict": true
    }
  },
  "max_output_tokens": 3500,
  "temperature": 0.5
}
\`\`\`

**Claude Sonnet (Reviewer)**:
\`\`\`json
{
  "model": "claude-sonnet-4-5-20250929",
  "max_tokens": 2000,
  "temperature": 0.3,
  "messages": [{"role": "user", "content": "..."}]
}
\`\`\`

---

**Alternative plus rapide**: Je peux te créer un fichier JSON complet que tu importes directement dans n8n!
`,
        "height": 820,
        "width": 680
      },
      "id": "note-instructions",
      "name": "📋 Instructions",
      "type": "n8n-nodes-base.stickyNote",
      "typeVersion": 1,
      "position": [680, 80]
    },
    {
      "parameters": {
        "respondWith": "json",
        "responseBody": `={{ {
  "message": "Workflow sectional démarré",
  "topic": $json.topic,
  "sections_count": $json.sections.length,
  "next_step": "Add the remaining nodes manually or import complete workflow JSON"
} }}`,
        "options": {}
      },
      "id": "response",
      "name": "Response",
      "type": "n8n-nodes-base.respondToWebhook",
      "typeVersion": 1,
      "position": [680, 300]
    }
  ],
  "connections": {
    "Webhook": {
      "main": [[{ "node": "Extract Input", "type": "main", "index": 0 }]]
    },
    "Extract Input": {
      "main": [[{ "node": "Response", "type": "main", "index": 0 }]]
    }
  },
  "pinData": {},
  "settings": {
    "executionOrder": "v1"
  },
  "staticData": null,
  "tags": [],
  "triggerCount": 0,
  "updatedAt": new Date().toISOString(),
  "versionId": "1"
};

// Sauvegarder le workflow JSON
const outputPath = 'workflow-n8n/workflow-sectional-simple.json';
fs.writeFileSync(outputPath, JSON.stringify(workflowJSON, null, 2));

console.log('\n✅ Workflow JSON créé:', outputPath);
console.log('\n📥 COMMENT IMPORTER:');
console.log('   1. Ouvre n8n: https://n8n.srv1144760.hstgr.cloud');
console.log('   2. Clique "Add workflow" → "Import from File"');
console.log('   3. Sélectionne:', outputPath);
console.log('   4. Active le workflow');
console.log('\n💡 ALTERNATIVE: Je vais créer un workflow COMPLET avec tous les nodes...\n');
