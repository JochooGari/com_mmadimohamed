#!/usr/bin/env node
/**
 * ACTIVATION DU WORKFLOW SECTIONAL
 */

require('dotenv').config({ path: 'c:/Users/power/OneDrive/Documents/Website_2025_06_30/magicpath-project/.env.local' });
const axios = require('axios');
const fs = require('fs');

const N8N_URL = (process.env.N8N_url || 'https://n8n.srv1144760.hstgr.cloud/api/v1').replace('/api/v1', '');
const N8N_API_KEY = (process.env.N8N_API_KEY || '').trim();

async function activateWorkflow() {
  try {
    // Charger la config
    const config = JSON.parse(fs.readFileSync('workflow-n8n/workflow-config.json', 'utf8'));
    const workflowId = config.workflow_id;

    console.log('\n🔄 Activation du workflow:', workflowId);

    // Utiliser PATCH pour activer (selon la doc n8n)
    const response = await axios.patch(
      `${N8N_URL}/api/v1/workflows/${workflowId}`,
      { active: true },
      {
        headers: {
          'X-N8N-API-KEY': N8N_API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ Workflow activé!');
    console.log('   ID:', response.data.id);
    console.log('   Nom:', response.data.name);
    console.log('   Actif:', response.data.active);

    console.log('\n🔗 Webhook URL:');
    console.log('   POST', config.webhook_url);

  } catch (error) {
    console.error('❌ Erreur:', error.message);

    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);

      if (error.response.status === 405) {
        console.log('\n💡 Alternative: Active le workflow manuellement dans l\'interface n8n');
        console.log('   👉 https://n8n.srv1144760.hstgr.cloud/workflow/' + config.workflow_id);
      }
    }

    process.exit(1);
  }
}

activateWorkflow();
