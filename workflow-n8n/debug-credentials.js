#!/usr/bin/env node
/**
 * Debug: Affiche la configuration complète des nodes Perplexity
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env.n8n');
const envContent = fs.readFileSync(envPath, 'utf8');
const N8N_API_KEY = envContent.match(/N8N_API_KEY=(.+)/)[1].trim();
const N8N_URL = 'n8n.srv1144760.hstgr.cloud';
const WORKFLOW_ID = '06yXZiR5QaoQmZsY';

console.log('🔍 DEBUG CREDENTIALS PERPLEXITY\n');
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
    const workflow = await httpsRequest('GET', `/api/v1/workflows/${WORKFLOW_ID}`);

    const step4 = workflow.nodes.find(n => n.name === 'STEP 4 - Score (Perplexity)');
    const step4b = workflow.nodes.find(n => n.name === 'STEP 4b - Get Enrichment (Perplexity)');

    console.log('📋 STEP 4 - Score (Perplexity):\n');
    console.log(JSON.stringify(step4, null, 2));
    console.log('\n');
    console.log('='.repeat(60));
    console.log('\n');
    console.log('📋 STEP 4b - Get Enrichment (Perplexity):\n');
    console.log(JSON.stringify(step4b, null, 2));
    console.log('\n');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

main();
