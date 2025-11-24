#!/usr/bin/env node
/**
 * CRÉATION WORKFLOW SCORING SEO/GEO VIA API N8N
 * Basé sur le PRD - Éditeur d'Articles Moderne
 */

require('dotenv').config({ path: 'c:/Users/power/OneDrive/Documents/Website_2025_06_30/magicpath-project/.env.local' });
const axios = require('axios');
const fs = require('fs');

const N8N_URL = (process.env.N8N_url || 'https://n8n.srv1144760.hstgr.cloud/api/v1').replace('/api/v1', '');
const N8N_API_KEY = (process.env.N8N_API_KEY || '').trim();

console.log('\n📊 CRÉATION WORKFLOW SCORING SEO/GEO\n');
console.log('='.repeat(80));
console.log('🔑 N8N_URL:', N8N_URL);
console.log('🔑 N8N_API_KEY:', N8N_API_KEY ? 'présente ✅' : 'MANQUANTE ❌');

async function createScoringWorkflow() {
  try {
    // Charger le workflow JSON
    const workflowPath = 'workflow-n8n/workflow-scoring-seo-geo.json';
    console.log('\n📂 Lecture du fichier:', workflowPath);

    const workflowData = JSON.parse(fs.readFileSync(workflowPath, 'utf8'));

    console.log('✅ Workflow chargé:');
    console.log('   Nom:', workflowData.name);
    console.log('   Nodes:', workflowData.nodes.length);
    console.log('   Description: Scoring SEO/GEO avec Perplexity');

    // Nettoyer les propriétés non supportées par l'API
    const cleanWorkflow = {
      name: workflowData.name,
      nodes: workflowData.nodes,
      connections: workflowData.connections,
      settings: workflowData.settings || {},
      staticData: workflowData.staticData || null
    };

    console.log('\n🧹 Workflow nettoyé (propriétés API uniquement)');

    // Créer le workflow via API
    console.log('\n🔄 Création du workflow via API n8n...');

    const response = await axios.post(`${N8N_URL}/api/v1/workflows`, cleanWorkflow, {
      headers: {
        'X-N8N-API-KEY': N8N_API_KEY,
        'Content-Type': 'application/json'
      }
    });

    const newWorkflow = response.data;

    console.log('\n✅ WORKFLOW SCORING CRÉÉ AVEC SUCCÈS!\n');
    console.log('=' .repeat(80));
    console.log('📋 Détails:');
    console.log('   ID:', newWorkflow.id);
    console.log('   Nom:', newWorkflow.name);
    console.log('   Actif:', newWorkflow.active ? 'OUI ✅' : 'NON ⚠️');
    console.log('   Nodes:', newWorkflow.nodes?.length || 0);
    console.log('   Créé le:', newWorkflow.createdAt);

    console.log('\n🔗 Webhook URL:');
    console.log('   POST', `${N8N_URL}/webhook/score-article`);

    console.log('\n📝 Exemple d\'utilisation:');
    console.log(`
curl -X POST ${N8N_URL}/webhook/score-article \\
  -H "Content-Type: application/json" \\
  -d '{
    "content": "<article><h1>Mon article</h1><p>Contenu...</p></article>",
    "config": {
      "primaryKeyword": "Power BI",
      "articleType": "guide",
      "targetLength": 2500
    },
    "userProfile": {
      "industry": "Finance & BI",
      "market": "france"
    },
    "level": "full"
  }'
    `);

    console.log('\n📊 Scoring Framework:');
    console.log('   • SEO: 76% (12 critères)');
    console.log('   • GEO: 19% (6 critères)');
    console.log('   • Fraîcheur: 5% (3 critères)');
    console.log('   • Total: 21 critères pondérés');

    console.log('\n=' .repeat(80));
    console.log('✅ Configuration terminée!\n');

    // Sauvegarder la config
    const configPath = 'workflow-n8n/workflow-scoring-config.json';
    fs.writeFileSync(configPath, JSON.stringify({
      workflow_id: newWorkflow.id,
      workflow_name: newWorkflow.name,
      webhook_url: `${N8N_URL}/webhook/score-article`,
      scoring_version: 'v1.0',
      created_at: new Date().toISOString(),
      usage: {
        endpoints: [
          'POST /webhook/score-article',
          'Integration avec éditeur TipTap',
          'Integration avec workflow sectional'
        ],
        parameters: {
          content: 'HTML de l\'article (requis)',
          config: 'Configuration article (primaryKeyword, articleType, etc.)',
          userProfile: 'Profil utilisateur (industry, market)',
          level: 'Niveau d\'analyse (algo_only, quick, full)'
        }
      }
    }, null, 2));

    console.log('💾 Configuration sauvegardée:', configPath);

    // Instructions pour activation
    if (!newWorkflow.active) {
      console.log('\n⚠️  PROCHAINE ÉTAPE: Activer le workflow');
      console.log('   1. Ouvre:', `${N8N_URL}/workflow/${newWorkflow.id}`);
      console.log('   2. Vérifie que le credential Perplexity est connecté');
      console.log('   3. Active le workflow (toggle en haut à droite)');
    }

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

createScoringWorkflow();
