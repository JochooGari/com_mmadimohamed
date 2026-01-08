#!/usr/bin/env node
/**
 * Copie automatiquement le credential Perplexity de STEP 4 vers STEP 4b
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env.n8n');
const envContent = fs.readFileSync(envPath, 'utf8');
const N8N_API_KEY = envContent.match(/N8N_API_KEY=(.+)/)[1].trim();
const N8N_URL = 'n8n.srv1144760.hstgr.cloud';
const WORKFLOW_ID = '06yXZiR5QaoQmZsY';

console.log('🔧 FIX CREDENTIAL PERPLEXITY STEP 4b\n');
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
    // 1. Récupérer le workflow
    console.log('📥 Récupération du workflow...\n');
    const workflow = await httpsRequest('GET', `/api/v1/workflows/${WORKFLOW_ID}`);

    // 2. Trouver les nodes STEP 4 et STEP 4b
    const step4Node = workflow.nodes.find(n => n.name === 'STEP 4 - Score (Perplexity)');
    const step4bNode = workflow.nodes.find(n => n.name === 'STEP 4b - Get Enrichment (Perplexity)');

    if (!step4Node || !step4bNode) {
      throw new Error('Nodes STEP 4 ou STEP 4b introuvables');
    }

    console.log('✅ Nodes trouvés:');
    console.log('   - STEP 4 - Score (Perplexity)');
    console.log('   - STEP 4b - Get Enrichment (Perplexity)');
    console.log('');

    // 3. Vérifier si STEP 4 a un credential
    if (!step4Node.credentials || !step4Node.credentials.perplexityApi) {
      throw new Error('STEP 4 n\'a pas de credential Perplexity configuré');
    }

    const credentialId = step4Node.credentials.perplexityApi.id;

    console.log('🔑 Credential trouvé sur STEP 4:');
    console.log('   ID:', credentialId);
    console.log('');

    // 4. Copier le credential vers STEP 4b
    console.log('🔄 Copie du credential vers STEP 4b...\n');

    const step4bIndex = workflow.nodes.findIndex(n => n.name === 'STEP 4b - Get Enrichment (Perplexity)');

    workflow.nodes[step4bIndex].credentials = {
      perplexityApi: {
        id: credentialId,
        name: step4Node.credentials.perplexityApi.name || 'Perplexity account'
      }
    };

    // 5. Sauvegarder
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
    console.log('🎉 CREDENTIAL COPIÉ AVEC SUCCÈS !');
    console.log('');
    console.log('✅ Le node "STEP 4b - Get Enrichment (Perplexity)" utilise maintenant');
    console.log('   le même credential que "STEP 4 - Score (Perplexity)"');
    console.log('');
    console.log('🧪 Testez maintenant:');
    console.log('   node workflow-n8n/test-complete-loop.js');
    console.log('');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

main();
