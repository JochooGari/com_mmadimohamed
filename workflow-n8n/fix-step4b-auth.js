#!/usr/bin/env node
/**
 * Modifie STEP 4b pour utiliser la même authentication que STEP 4
 * (Generic Credential Type + Header Auth au lieu de Predefined Perplexity API)
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env.n8n');
const envContent = fs.readFileSync(envPath, 'utf8');
const N8N_API_KEY = envContent.match(/N8N_API_KEY=(.+)/)[1].trim();
const N8N_URL = 'n8n.srv1144760.hstgr.cloud';
const WORKFLOW_ID = '06yXZiR5QaoQmZsY';

console.log('🔧 FIX STEP 4b AUTHENTICATION\n');
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

    // 2. Trouver les nodes
    const step4 = workflow.nodes.find(n => n.name === 'STEP 4 - Score (Perplexity)');
    const step4bIndex = workflow.nodes.findIndex(n => n.name === 'STEP 4b - Get Enrichment (Perplexity)');

    if (!step4 || step4bIndex === -1) {
      throw new Error('Nodes STEP 4 ou STEP 4b introuvables');
    }

    console.log('✅ Nodes trouvés');
    console.log('');
    console.log('📋 STEP 4 utilise:');
    console.log('   Authentication:', step4.parameters.authentication);
    console.log('   GenericAuthType:', step4.parameters.genericAuthType);
    console.log('   Credential ID:', step4.credentials?.httpHeaderAuth?.id);
    console.log('   Credential Name:', step4.credentials?.httpHeaderAuth?.name);
    console.log('');

    // 3. Copier exactement la configuration de STEP 4 vers STEP 4b
    console.log('🔄 Application de la même configuration à STEP 4b...\n');

    workflow.nodes[step4bIndex].parameters = {
      ...workflow.nodes[step4bIndex].parameters,
      authentication: 'genericCredentialType',
      genericAuthType: 'httpHeaderAuth',
      sendHeaders: true  // Important pour Header Auth
    };

    // Supprimer le nodeCredentialType qui n'est plus nécessaire
    delete workflow.nodes[step4bIndex].parameters.nodeCredentialType;

    // Copier le credential
    workflow.nodes[step4bIndex].credentials = {
      httpHeaderAuth: {
        id: step4.credentials.httpHeaderAuth.id,
        name: step4.credentials.httpHeaderAuth.name
      }
    };

    console.log('✅ Configuration copiée:');
    console.log('   Authentication: genericCredentialType');
    console.log('   GenericAuthType: httpHeaderAuth');
    console.log('   Credential ID:', workflow.nodes[step4bIndex].credentials.httpHeaderAuth.id);
    console.log('   Credential Name:', workflow.nodes[step4bIndex].credentials.httpHeaderAuth.name);
    console.log('');

    // 4. Sauvegarder
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
    console.log('🎉 STEP 4b CORRIGÉ AVEC SUCCÈS !');
    console.log('');
    console.log('✅ "STEP 4b - Get Enrichment (Perplexity)" utilise maintenant:');
    console.log('   - La même méthode d\'authentication que STEP 4');
    console.log('   - Le même credential "Header Auth account"');
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
