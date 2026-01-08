// Execute n8n workflow via API
const https = require('https');
require('dotenv').config({ path: '.env.n8n' });

const N8N_API_URL = process.env.N8N_API_URL || 'https://n8n.srv1144760.hstgr.cloud/api/v1';
const N8N_API_KEY = process.env.N8N_API_KEY;

if (!N8N_API_KEY) {
  console.error('❌ N8N_API_KEY not found in .env.n8n');
  process.exit(1);
}

async function apiCall(path, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, N8N_API_URL);

    const options = {
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'X-N8N-API-KEY': N8N_API_KEY,
        'Accept': 'application/json'
      }
    };

    if (body) {
      const postData = JSON.stringify(body);
      options.headers['Content-Type'] = 'application/json';
      options.headers['Content-Length'] = Buffer.byteLength(postData);
    }

    console.log(`📡 ${method} ${url.pathname}`);

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ status: res.statusCode, data: json });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(JSON.stringify(body));
    }

    req.end();
  });
}

async function listWorkflows() {
  console.log('\n📋 Listing workflows...\n');

  const { status, data } = await apiCall('/workflows');

  if (status !== 200) {
    console.error('❌ Error:', status, data);
    return null;
  }

  console.log(`✅ Found ${data.data?.length || 0} workflows:\n`);

  data.data?.forEach((wf, i) => {
    console.log(`${i + 1}. ${wf.name} (ID: ${wf.id})`);
    console.log(`   Active: ${wf.active ? '✅' : '❌'}`);
    console.log(`   Nodes: ${wf.nodes?.length || 0}`);
    console.log(`   Updated: ${wf.updatedAt}\n`);
  });

  return data.data;
}

async function executeWorkflow(workflowId, inputData = {}) {
  console.log(`\n🚀 Executing workflow ${workflowId}...\n`);

  const { status, data } = await apiCall(`/workflows/${workflowId}/execute`, 'POST', inputData);

  if (status !== 200 && status !== 201) {
    console.error('❌ Execution failed:', status, data);
    return null;
  }

  console.log('✅ Workflow execution started!');
  console.log(`📋 Execution ID: ${data.data?.executionId || 'N/A'}\n`);

  return data.data;
}

async function getExecution(executionId) {
  console.log(`\n📊 Getting execution ${executionId}...\n`);

  const { status, data } = await apiCall(`/executions/${executionId}`);

  if (status !== 200) {
    console.error('❌ Error:', status, data);
    return null;
  }

  console.log('✅ Execution details:');
  console.log(`   Status: ${data.data?.status || 'unknown'}`);
  console.log(`   Finished: ${data.data?.finished ? '✅' : '❌'}`);
  console.log(`   Started: ${data.data?.startedAt}`);
  console.log(`   Stopped: ${data.data?.stoppedAt}\n`);

  return data.data;
}

async function main() {
  console.log('🔧 N8N WORKFLOW EXECUTOR');
  console.log('='.repeat(60));
  console.log(`🌐 API URL: ${N8N_API_URL}\n`);

  try {
    // List workflows
    const workflows = await listWorkflows();

    if (!workflows || workflows.length === 0) {
      console.log('⚠️  No workflows found');
      return;
    }

    // Find the Article GEO Generation workflow
    const targetWorkflow = workflows.find(wf =>
      wf.name.includes('Article GEO') ||
      wf.name.includes('Full Workflow')
    );

    if (!targetWorkflow) {
      console.log('⚠️  Article GEO workflow not found');
      console.log('\n💡 Available workflows:');
      workflows.forEach((wf, i) => console.log(`   ${i + 1}. ${wf.name}`));
      return;
    }

    console.log(`\n🎯 Target workflow: ${targetWorkflow.name}`);
    console.log(`   ID: ${targetWorkflow.id}`);
    console.log(`   Active: ${targetWorkflow.active ? '✅' : '❌'}\n`);

    // Prepare test data
    const testData = {
      topic: 'DevOps et Automatisation Cloud 2025 - Guide Complet',
      outline: 'Introduction DevOps moderne|Principes fondamentaux|Infrastructure as Code|CI/CD Pipelines|FAQ',
      minScore: 95,
      maxIterations: 3
    };

    console.log('📦 Test payload:');
    console.log(JSON.stringify(testData, null, 2));

    // Execute workflow
    const execution = await executeWorkflow(targetWorkflow.id, testData);

    if (execution && execution.executionId) {
      // Wait a bit then check status
      console.log('\n⏳ Waiting 5 seconds before checking status...\n');
      await new Promise(resolve => setTimeout(resolve, 5000));

      await getExecution(execution.executionId);
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ Done!\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

main();
