#!/usr/bin/env node
/**
 * Check n8n workflow executions via API
 */

const https = require('https');

const N8N_URL = 'https://n8n.srv1144760.hstgr.cloud';
const N8N_API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyMTJkMjhmOC0xYmU4LTQ3NDEtOGEwZi1lNzgyNDQ0Njc0YWQiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzYzODM1OTcyfQ.-yb4vasE1hjEMTsuGliDYZejFM7jfTW2WRHzMnSGB54';
const WORKFLOW_ID = '06yXZiR5QaoQmZsY';

function makeRequest(method, path) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, N8N_URL);

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
    req.end();
  });
}

async function getExecutions(workflowId, limit = 10) {
  console.log(`📊 Fetching executions for workflow ${workflowId}...\n`);

  const data = await makeRequest('GET', `/api/v1/executions?workflowId=${workflowId}&limit=${limit}&includeData=true`);

  if (!data.data || data.data.length === 0) {
    console.log('⚠️  No executions found.\n');
    return;
  }

  console.log(`✅ Found ${data.data.length} executions:\n`);

  data.data.forEach((exec, i) => {
    console.log(`${i + 1}. Execution ${exec.id}`);
    console.log(`   Status: ${getStatusIcon(exec.status)} ${exec.status}`);
    console.log(`   Started: ${new Date(exec.startedAt).toLocaleString()}`);
    if (exec.stoppedAt) {
      const duration = new Date(exec.stoppedAt) - new Date(exec.startedAt);
      console.log(`   Duration: ${(duration / 1000).toFixed(1)}s`);
    }

    if (exec.status === 'error' && exec.data) {
      console.log(`   ❌ Error: ${getErrorMessage(exec.data)}`);
    }

    if (exec.status === 'running') {
      console.log(`   ⏳ Currently executing...`);
    }

    console.log('');
  });

  // Show details of the most recent execution
  const latest = data.data[0];
  console.log('📋 Latest execution details:\n');
  console.log(`   ID: ${latest.id}`);
  console.log(`   Workflow: ${latest.workflowId}`);
  console.log(`   Status: ${latest.status}`);
  console.log(`   Mode: ${latest.mode}`);

  if (latest.data && latest.data.resultData) {
    const resultData = latest.data.resultData;
    if (resultData.error) {
      console.log(`\n   ❌ ERROR DETAILS:`);
      console.log(`   Message: ${resultData.error.message || 'Unknown error'}`);
      console.log(`   Node: ${resultData.error.node?.name || 'Unknown'}`);
      if (resultData.error.description) {
        console.log(`   Description: ${resultData.error.description}`);
      }
      if (resultData.error.httpCode) {
        console.log(`   HTTP Code: ${resultData.error.httpCode}`);
      }
    }

    if (resultData.runData) {
      const nodes = Object.keys(resultData.runData);
      console.log(`\n   ✅ Executed nodes: ${nodes.length}`);
      nodes.forEach(nodeName => {
        const nodeData = resultData.runData[nodeName];
        const lastRun = nodeData[nodeData.length - 1];
        if (lastRun) {
          const status = lastRun.error ? '❌ Error' : '✅ Success';
          console.log(`      - ${nodeName}: ${status}`);
          if (lastRun.error) {
            console.log(`        Error: ${lastRun.error.message || JSON.stringify(lastRun.error).substring(0, 100)}`);
          }
        }
      });
    }
  }
  console.log('');
}

function getStatusIcon(status) {
  switch (status) {
    case 'success': return '✅';
    case 'error': return '❌';
    case 'running': return '⏳';
    case 'waiting': return '⏸️';
    case 'canceled': return '🚫';
    default: return '❓';
  }
}

function getErrorMessage(executionData) {
  if (!executionData || !executionData.resultData) return 'Unknown error';

  const error = executionData.resultData.error;
  if (!error) return 'Unknown error';

  return error.message || error.description || JSON.stringify(error).substring(0, 200);
}

async function main() {
  console.log('🔍 N8N WORKFLOW EXECUTIONS\n');
  console.log('='.repeat(60));
  console.log('');

  try {
    await getExecutions(WORKFLOW_ID, 5);
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

main();
