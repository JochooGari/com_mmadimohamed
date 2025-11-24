#!/usr/bin/env node
/**
 * CRÉATION WORKFLOW SECTIONAL VIA API N8N
 */

require('dotenv').config({ path: 'c:/Users/power/OneDrive/Documents/Website_2025_06_30/magicpath-project/.env.local' });
const axios = require('axios');
const fs = require('fs');

const N8N_URL = (process.env.N8N_url || 'https://n8n.srv1144760.hstgr.cloud/api/v1').replace('/api/v1', '');
const N8N_API_KEY = (process.env.N8N_API_KEY || '').trim();

console.log('\n🚀 CRÉATION WORKFLOW SECTIONAL VIA API N8N\n');
console.log('='.repeat(80));
console.log('🔑 N8N_URL:', N8N_URL);
console.log('🔑 N8N_API_KEY:', N8N_API_KEY ? 'présente ✅' : 'MANQUANTE ❌');

async function createWorkflow() {
  try {
    // Charger le workflow JSON
    const workflowPath = 'workflow-n8n/workflow-sectional-complete.json';
    console.log('\n📂 Lecture du fichier:', workflowPath);

    const workflowData = JSON.parse(fs.readFileSync(workflowPath, 'utf8'));

    console.log('✅ Workflow chargé:');
    console.log('   Nom:', workflowData.name);
    console.log('   Nodes:', workflowData.nodes.length);

    // Nettoyer les propriétés non supportées par l'API
    const cleanWorkflow = {
      name: workflowData.name,
      nodes: workflowData.nodes,
      connections: workflowData.connections,
      settings: workflowData.settings || {},
      staticData: workflowData.staticData || null
      // tags est read-only, on ne l'envoie pas
    };

    console.log('\n🧹 Workflow nettoyé (propriétés API uniquement)');
    console.log('   Propriétés:', Object.keys(cleanWorkflow).join(', '));

    // Créer le workflow via API
    console.log('\n🔄 Création du workflow via API n8n...');

    const response = await axios.post(`${N8N_URL}/api/v1/workflows`, cleanWorkflow, {
      headers: {
        'X-N8N-API-KEY': N8N_API_KEY,
        'Content-Type': 'application/json'
      }
    });

    const newWorkflow = response.data;

    console.log('\n✅ WORKFLOW CRÉÉ AVEC SUCCÈS!\n');
    console.log('=' .repeat(80));
    console.log('📋 Détails:');
    console.log('   ID:', newWorkflow.id);
    console.log('   Nom:', newWorkflow.name);
    console.log('   Actif:', newWorkflow.active ? 'OUI ✅' : 'NON ⚠️');
    console.log('   Nodes:', newWorkflow.nodes?.length || 0);
    console.log('   Créé le:', newWorkflow.createdAt);

    if (!newWorkflow.active) {
      console.log('\n⚠️  Le workflow n\'est pas actif par défaut.');
      console.log('   Activation du workflow...');

      // Activer le workflow
      try {
        await axios.patch(
          `${N8N_URL}/api/v1/workflows/${newWorkflow.id}`,
          { active: true },
          {
            headers: {
              'X-N8N-API-KEY': N8N_API_KEY,
              'Content-Type': 'application/json'
            }
          }
        );
        console.log('   ✅ Workflow activé!');
      } catch (activateError) {
        console.error('   ❌ Erreur activation:', activateError.message);
        console.log('   👉 Active-le manuellement:', `${N8N_URL}/workflow/${newWorkflow.id}`);
      }
    }

    console.log('\n🔗 Webhook URL:');
    console.log('   POST', `${N8N_URL}/webhook/generate-article-sectional`);

    console.log('\n📝 Test du workflow:');
    console.log(`
curl -X POST ${N8N_URL}/webhook/generate-article-sectional \\
  -H "Content-Type: application/json" \\
  -d '{
    "topic": "Power BI pour la Finance - Guide 2025",
    "outline": "Introduction|Connexion données|Visualisations KPI"
  }'
    `);

    console.log('\n=' .repeat(80));
    console.log('✅ Configuration terminée!\n');

    // Sauvegarder l'ID du workflow
    const configPath = 'workflow-n8n/workflow-config.json';
    fs.writeFileSync(configPath, JSON.stringify({
      workflow_id: newWorkflow.id,
      workflow_name: newWorkflow.name,
      webhook_url: `${N8N_URL}/webhook/generate-article-sectional`,
      created_at: new Date().toISOString()
    }, null, 2));

    console.log('💾 Configuration sauvegardée:', configPath);

  } catch (error) {
    console.error('\n❌ ERREUR:', error.message);

    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', JSON.stringify(error.response.data, null, 2));

      if (error.response.status === 401) {
        console.error('\n🔑 Problème d\'authentification:');
        console.error('   Vérifie que N8N_API_KEY est correct dans .env.local');
      }

      if (error.response.status === 400) {
        console.error('\n📋 Problème de format du workflow:');
        console.error('   L\'API n8n a rejeté certaines propriétés');
      }
    }

    process.exit(1);
  }
}

createWorkflow();
