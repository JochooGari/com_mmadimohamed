#!/usr/bin/env node
/**
 * Fix the "Get Internal Articles" node in Full Workflow
 * Changes from RPC to direct GET query
 */

const https = require('https');

const N8N_URL = 'https://n8n.srv1144760.hstgr.cloud';
const N8N_API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyMTJkMjhmOC0xYmU4LTQ3NDEtOGEwZi1lNzgyNDQ0Njc0YWQiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzYzODM1OTcyfQ.-yb4vasE1hjEMTsuGliDYZejFM7jfTW2WRHzMnSGB54';
const WORKFLOW_ID = '06yXZiR5QaoQmZsY';

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
  console.log('🔧 FIX WORKFLOW - Get Internal Articles Node\n');
  console.log('='.repeat(60));
  console.log('');

  try {
    // 1. Get current workflow
    const workflow = await getWorkflow();
    console.log(`✅ Found workflow: ${workflow.name}`);
    console.log(`   Nodes: ${workflow.nodes.length}`);
    console.log(`   Active: ${workflow.active}\n`);

    // 2. Find "Get Internal Articles" node
    const nodeIndex = workflow.nodes.findIndex(n => n.name === 'Get Internal Articles');
    if (nodeIndex === -1) {
      throw new Error('Node "Get Internal Articles" not found!');
    }

    const oldNode = workflow.nodes[nodeIndex];
    console.log('📍 Found "Get Internal Articles" node:');
    console.log(`   Current URL: ${oldNode.parameters.url}`);
    console.log(`   Current Method: ${oldNode.parameters.method}\n`);

    // 3. Check if already fixed
    if (oldNode.parameters.url.includes('articles?select=')) {
      console.log('✅ Node already fixed! No changes needed.\n');
      return;
    }

    // 4. Apply fix
    console.log('🔧 Applying fix...\n');

    workflow.nodes[nodeIndex] = {
      ...oldNode,
      parameters: {
        method: 'GET',
        url: 'https://xroduivvgnviqjdvehuw.supabase.co/rest/v1/articles?select=id,title,slug,excerpt&published=eq.true&order=created_at.desc&limit=8',
        sendHeaders: true,
        headerParameters: {
          parameters: [
            {
              name: 'apikey',
              value: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhyb2R1aXZ2Z252aXFqZHZlaHV3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDg1Njg5NywiZXhwIjoyMDY2NDMyODk3fQ.lJe0rcdAJYdS4VjcR5IV_kqA9lEUJoWq8VKsSD5EUV0'
            },
            {
              name: 'Authorization',
              value: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhyb2R1aXZ2Z252aXFqZHZlaHV3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDg1Njg5NywiZXhwIjoyMDY2NDMyODk3fQ.lJe0rcdAJYdS4VjcR5IV_kqA9lEUJoWq8VKsSD5EUV0'
            }
          ]
        },
        sendBody: false,
        options: {}
      }
    };

    // 5. Fix "Extract Internal Links" Function Node
    const extractNodeIndex = workflow.nodes.findIndex(n => n.name === 'Extract Internal Links');
    if (extractNodeIndex !== -1) {
      console.log('🔧 Also fixing "Extract Internal Links" Function Node...\n');

      const newCode = `// Extract internal articles for linking
const response = $input.all()[0].json;
const prev = $node['Initialize Variables'].json;

// Response is an array from Supabase GET request
const articles = Array.isArray(response) ? response : [];

const internalLinks = articles.slice(0, 8).map(a => ({
  title: a.title || '',
  slug: a.slug || '',
  excerpt: a.excerpt || ''
}));

return {
  json: {
    ...prev,
    internalArticles: internalLinks,
    internalLinksText: internalLinks.length > 0
      ? internalLinks.map(a => \`- [\${a.title}](/articles/\${a.slug})\`).join('\\n')
      : 'Aucun article interne disponible'
  }
};`;

      workflow.nodes[extractNodeIndex].parameters.jsCode = newCode;
    }

    // 6. Save workflow (only send necessary fields, excluding read-only ones)
    const workflowToUpdate = {
      name: workflow.name,
      nodes: workflow.nodes,
      connections: workflow.connections,
      settings: workflow.settings
    };

    const updated = await updateWorkflow(workflowToUpdate);

    console.log('✅ Workflow updated successfully!\n');
    console.log('📊 Changes applied:');
    console.log('   1. Get Internal Articles: POST /rpc/search_articles → GET /articles?...');
    console.log('   2. Extract Internal Links: Updated to handle array response');
    console.log('');
    console.log('🎯 Next steps:');
    console.log('   - Workflow is still active, changes are live');
    console.log('   - Test with: node test-complete-loop.js');
    console.log('');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

main();
