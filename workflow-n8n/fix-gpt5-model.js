#!/usr/bin/env node
/**
 * Fix GPT-5 model name in workflow
 * Change 'gpt-5-pro-preview' to correct model name
 */

const https = require('https');

const N8N_URL = 'https://n8n.srv1144760.hstgr.cloud';
const N8N_API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyMTJkMjhmOC0xYmU4LTQ3NDEtOGEwZi1lNzgyNDQ0Njc0YWQiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzYzODM1OTcyfQ.-yb4vasE1hjEMTsuGliDYZejFM7jfTW2WRHzMnSGB54';
const WORKFLOW_ID = '06yXZiR5QaoQmZsY';

// Correct GPT-5.1 model name (based on geo.ts usage)
const CORRECT_MODEL_NAME = 'gpt-5.1';

function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, N8N_URL);
    const payload = data ? JSON.stringify(data) : null;

    const options = {
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'X-N8N-API-KEY': N8N_API_KEY,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    };

    if (payload) {
      options.headers['Content-Length'] = Buffer.byteLength(payload);
    }

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const response = data ? JSON.parse(data) : {};
          if (res.statusCode >= 400) {
            reject(new Error(`HTTP ${res.statusCode}: ${JSON.stringify(response)}`));
          } else {
            resolve(response);
          }
        } catch (e) {
          reject(new Error(`Failed to parse response: ${e.message}\nRaw: ${data}`));
        }
      });
    });

    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

async function getWorkflow() {
  console.log(`📄 Fetching workflow ${WORKFLOW_ID}...\n`);
  return await makeRequest('GET', `/api/v1/workflows/${WORKFLOW_ID}`);
}

async function updateWorkflow(workflow) {
  console.log(`💾 Updating workflow ${WORKFLOW_ID}...\n`);
  return await makeRequest('PUT', `/api/v1/workflows/${WORKFLOW_ID}`, workflow);
}

async function main() {
  console.log('🔧 FIX GPT-5 MODEL NAME\n');
  console.log('='.repeat(60));
  console.log('');

  try {
    // 1. Get workflow
    const workflow = await getWorkflow();
    console.log(`✅ Found workflow: ${workflow.name}`);
    console.log(`   Nodes: ${workflow.nodes.length}\n`);

    let changes = 0;

    // 2. Find all Function Nodes that reference GPT-5
    workflow.nodes.forEach((node, index) => {
      if (node.type === 'n8n-nodes-base.code' && node.parameters.jsCode) {
        const code = node.parameters.jsCode;

        if (code.includes('gpt-5-pro-preview')) {
          console.log(`📍 Found GPT-5 reference in: ${node.name}`);
          console.log(`   Changing: gpt-5-pro-preview → ${CORRECT_MODEL_NAME}\n`);

          workflow.nodes[index].parameters.jsCode = code.replace(
            /gpt-5-pro-preview/g,
            CORRECT_MODEL_NAME
          );

          changes++;
        }
      }
    });

    if (changes === 0) {
      console.log('✅ No changes needed. Model name already correct.\n');
      return;
    }

    console.log(`🔧 Applying ${changes} change(s)...\n`);

    // 3. Save workflow
    const workflowToUpdate = {
      name: workflow.name,
      nodes: workflow.nodes,
      connections: workflow.connections,
      settings: workflow.settings
    };

    await updateWorkflow(workflowToUpdate);

    console.log('✅ Workflow updated successfully!\n');
    console.log('📊 Changes applied:');
    console.log(`   Model name: gpt-5-pro-preview → ${CORRECT_MODEL_NAME}`);
    console.log(`   Nodes updated: ${changes}`);
    console.log('');
    console.log('🎯 Next steps:');
    console.log('   - Test with: node test-complete-loop.js');
    console.log('');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

main();
