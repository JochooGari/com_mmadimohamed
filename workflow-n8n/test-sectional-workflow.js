#!/usr/bin/env node
/**
 * TEST DU WORKFLOW SECTIONAL
 */

const axios = require('axios');
const fs = require('fs');

async function testWorkflow() {
  try {
    // Charger la config
    const config = JSON.parse(fs.readFileSync('workflow-n8n/workflow-config.json', 'utf8'));
    const webhookUrl = config.webhook_url;

    console.log('\n🧪 TEST DU WORKFLOW SECTIONAL\n');
    console.log('='.repeat(80));
    console.log('📡 URL:', webhookUrl);

    const testPayload = {
      topic: "Power BI pour la Finance - Guide Complet 2025",
      outline: "Introduction Power BI Finance|Connexion aux sources de données|Visualisations KPI financiers"
    };

    console.log('\n📦 Payload:');
    console.log(JSON.stringify(testPayload, null, 2));

    console.log('\n⏱️  Envoi de la requête (estimé: 3-5 minutes)...\n');

    const startTime = Date.now();
    const response = await axios.post(webhookUrl, testPayload, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 600000 // 10 minutes max
    });

    const duration = ((Date.now() - startTime) / 1000).toFixed(1);

    console.log('✅ SUCCÈS!\n');
    console.log('='.repeat(80));
    console.log('⏱️  Durée:', duration + 's');
    console.log('📊 Status:', response.status);
    console.log('\n📄 Réponse:');
    console.log(JSON.stringify(response.data, null, 2));

    if (response.data.job_id) {
      console.log('\n💾 Article sauvegardé dans Supabase:');
      console.log('   Job ID:', response.data.job_id);
      console.log('   Sections:', response.data.total_sections);
      console.log('   Titre:', response.data.h1);

      console.log('\n📝 Vérifie les sections dans Supabase:');
      console.log(`   SELECT * FROM articles_content WHERE job_id = '${response.data.job_id}' ORDER BY section_index;`);
    }

    console.log('\n='.repeat(80));
    console.log('✅ Test terminé!\n');

  } catch (error) {
    console.error('\n❌ ERREUR:', error.message);

    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }

    if (error.code === 'ECONNABORTED') {
      console.error('\n⏱️  Timeout: Le workflow prend plus de 10 minutes');
      console.error('   Vérifie l\'exécution dans n8n:');
      console.error('   👉 https://n8n.srv1144760.hstgr.cloud/executions');
    }

    process.exit(1);
  }
}

testWorkflow();
