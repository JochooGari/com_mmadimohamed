#!/usr/bin/env node
require('dotenv').config({ path: 'c:/Users/power/OneDrive/Documents/Website_2025_06_30/magicpath-project/.env.local' });
const axios = require('axios');

const N8N_URL = (process.env.N8N_url || 'https://n8n.srv1144760.hstgr.cloud/api/v1').replace('/api/v1', '');
const N8N_API_KEY = (process.env.N8N_API_KEY || '').trim();

async function listWorkflows() {
  console.log('📋 Liste des workflows n8n\n');
  console.log('=' .repeat(80));

  try {
    const response = await axios.get(`${N8N_URL}/api/v1/workflows`, {
      headers: { 'X-N8N-API-KEY': N8N_API_KEY }
    });

    const workflows = response.data.data || response.data;

    console.log(`\n✅ ${workflows.length} workflow(s) trouvé(s):\n`);

    workflows.forEach((wf, i) => {
      console.log(`${i + 1}. ID: ${wf.id}`);
      console.log(`   Nom: ${wf.name}`);
      console.log(`   Actif: ${wf.active ? 'OUI' : 'NON'}`);
      console.log(`   Nodes: ${wf.nodes?.length || 'N/A'}`);
      console.log(`   Créé: ${wf.createdAt || 'N/A'}`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

listWorkflows();
