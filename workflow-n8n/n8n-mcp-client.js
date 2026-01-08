#!/usr/bin/env node
/**
 * Client MCP n8n pour gérer les workflows directement
 * Utilise l'API MCP de n8n via HTTP
 */

const https = require('https');
const http = require('http');

const N8N_MCP_URL = 'https://n8n.srv1144760.hstgr.cloud/mcp-server/http';
const N8N_BEARER_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyMTJkMjhmOC0xYmU4LTQ3NDEtOGEwZi1lNzgyNDQ0Njc0YWQiLCJpc3MiOiJuOG4iLCJhdWQiOiJtY3Atc2VydmVyLWFwaSIsImp0aSI6ImY5OTQ0YzgzLTFlNGMtNDBhMC1hNzA3LTA3Njc1N2I3YjlkZiIsImlhdCI6MTc2Mzc2MTczMn0.CEzIa1jde0Os8aNQrQv1ZSrdBrPUuUvaOt6CxXD4O8c';

/**
 * Envoie une requête MCP à n8n
 */
async function sendMCPRequest(method, params = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(N8N_MCP_URL);
    const payload = JSON.stringify({
      jsonrpc: '2.0',
      id: Date.now(),
      method,
      params
    });

    const options = {
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json, text/event-stream',
        'Content-Length': Buffer.byteLength(payload),
        'Authorization': `Bearer ${N8N_BEARER_TOKEN}`
      }
    };

    const client = url.protocol === 'https:' ? https : http;
    const req = client.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          // Parse SSE format: "event: message\ndata: {json}\n\n"
          const lines = data.trim().split('\n');
          let jsonData = null;

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              jsonData = line.substring(6); // Remove "data: " prefix
              break;
            }
          }

          if (!jsonData) {
            // Try direct JSON parse as fallback
            jsonData = data;
          }

          const response = JSON.parse(jsonData);
          if (response.error) {
            reject(new Error(response.error.message || JSON.stringify(response.error)));
          } else {
            resolve(response.result);
          }
        } catch (e) {
          reject(new Error(`Failed to parse response: ${e.message}\n\nRaw data: ${data}`));
        }
      });
    });

    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

/**
 * Liste tous les workflows
 */
async function listWorkflows(search = '') {
  console.log('📋 Searching workflows...\n');
  try {
    const result = await sendMCPRequest('tools/call', {
      name: 'search_workflows',
      arguments: search ? { name: search } : {}
    });

    if (result && result.content) {
      const text = result.content[0].text;
      console.log(text);
      console.log('');

      // Try to extract workflow IDs from the response
      const idMatches = text.match(/ID: (\d+)/g);
      if (idMatches) {
        const ids = idMatches.map(m => m.replace('ID: ', ''));
        return ids;
      }
      return [];
    }
  } catch (error) {
    console.error('❌ Error listing workflows:', error.message);
    throw error;
  }
}

/**
 * Récupère un workflow par son ID
 */
async function getWorkflow(workflowId) {
  console.log(`📄 Getting workflow ${workflowId}...\n`);
  try {
    const result = await sendMCPRequest('tools/call', {
      name: 'get_workflow_details',
      arguments: { workflowId: workflowId }
    });

    if (result && result.content) {
      const text = result.content[0].text;
      console.log(text);
      console.log('');
      return text;
    }
  } catch (error) {
    console.error('❌ Error getting workflow:', error.message);
    throw error;
  }
}

/**
 * Met à jour un node dans un workflow
 */
async function updateWorkflowNode(workflowId, nodeId, nodeUpdates) {
  console.log(`🔧 Updating node ${nodeId} in workflow ${workflowId}...\n`);

  // D'abord récupérer le workflow complet
  const workflow = await getWorkflow(workflowId);

  // Trouver le node à modifier
  const nodeIndex = workflow.nodes.findIndex(n => n.id === nodeId);
  if (nodeIndex === -1) {
    throw new Error(`Node ${nodeId} not found in workflow`);
  }

  // Appliquer les modifications
  workflow.nodes[nodeIndex] = {
    ...workflow.nodes[nodeIndex],
    ...nodeUpdates
  };

  // Sauvegarder le workflow
  try {
    const result = await sendMCPRequest('tools/call', {
      name: 'update_workflow',
      arguments: {
        workflow_id: workflowId,
        workflow: workflow
      }
    });

    console.log('✅ Node updated successfully\n');
    return result;
  } catch (error) {
    console.error('❌ Error updating workflow:', error.message);
    throw error;
  }
}

/**
 * Liste les outils MCP disponibles
 */
async function listTools() {
  console.log('🔧 Listing available MCP tools...\n');
  try {
    const result = await sendMCPRequest('tools/list', {});

    if (result && result.tools) {
      console.log(`✅ Found ${result.tools.length} tools:\n`);
      result.tools.forEach((tool, i) => {
        console.log(`${i + 1}. ${tool.name}`);
        console.log(`   ${tool.description}`);
        console.log('');
      });
      return result.tools;
    }
  } catch (error) {
    console.error('❌ Error listing tools:', error.message);
    throw error;
  }
}

/**
 * Teste la connexion MCP
 */
async function testConnection() {
  console.log('🔌 Testing n8n MCP connection...\n');
  try {
    const result = await sendMCPRequest('initialize', {
      protocolVersion: '2024-11-05',
      capabilities: {},
      clientInfo: {
        name: 'n8n-mcp-client',
        version: '1.0.0'
      }
    });

    console.log('✅ MCP Connection successful!');
    console.log(`   Server: ${result.serverInfo?.name || 'n8n'}`);
    console.log(`   Version: ${result.serverInfo?.version || 'unknown'}\n`);
    return result;
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    throw error;
  }
}

// CLI
const command = process.argv[2];
const args = process.argv.slice(3);

async function main() {
  console.log('🚀 n8n MCP Client\n');
  console.log('='.repeat(60));
  console.log('');

  try {
    switch (command) {
      case 'test':
        await testConnection();
        break;

      case 'tools':
        await listTools();
        break;

      case 'list':
        await listWorkflows();
        break;

      case 'get':
        if (!args[0]) {
          console.error('❌ Usage: node n8n-mcp-client.js get <workflow_id>');
          process.exit(1);
        }
        await getWorkflow(args[0]);
        break;

      case 'update-node':
        if (args.length < 3) {
          console.error('❌ Usage: node n8n-mcp-client.js update-node <workflow_id> <node_id> <json_updates>');
          process.exit(1);
        }
        const updates = JSON.parse(args[2]);
        await updateWorkflowNode(args[0], args[1], updates);
        break;

      default:
        console.log('Usage:');
        console.log('  node n8n-mcp-client.js test              # Test connection');
        console.log('  node n8n-mcp-client.js tools             # List available tools');
        console.log('  node n8n-mcp-client.js list              # List workflows');
        console.log('  node n8n-mcp-client.js get <id>          # Get workflow');
        console.log('  node n8n-mcp-client.js update-node <wf_id> <node_id> <json>');
        console.log('');
    }
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

main();
