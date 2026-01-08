// Test n8n workflow via webhook
const https = require('https');

// IMPORTANT: Remplacez par votre URL webhook n8n après import du workflow
const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL || 'VOTRE_URL_WEBHOOK_ICI';

const testPayload = {
  topic: 'DevOps et Automatisation Cloud 2025 - Guide Complet',
  outline: 'Introduction DevOps moderne|Principes fondamentaux|Infrastructure as Code|CI/CD Pipelines|FAQ',
  minScore: 95,
  maxIterations: 3
};

async function testWorkflow() {
  console.log('🧪 TEST DU WORKFLOW N8N');
  console.log('=' .repeat(60));
  console.log(`📝 Topic: ${testPayload.topic}`);
  console.log(`🎯 Min Score: ${testPayload.minScore}\n`);

  if (N8N_WEBHOOK_URL === 'VOTRE_URL_WEBHOOK_ICI') {
    console.error('❌ ERREUR: Veuillez définir N8N_WEBHOOK_URL');
    console.log('\n💡 Instructions:');
    console.log('1. Importez workflow-n8n-article-generation.json dans n8n');
    console.log('2. Activez le workflow');
    console.log('3. Copiez l\'URL du webhook "Webhook - Start Article"');
    console.log('4. Définissez: export N8N_WEBHOOK_URL="votre_url_webhook"');
    console.log('5. Relancez ce script\n');
    process.exit(1);
  }

  return new Promise((resolve, reject) => {
    const url = new URL(N8N_WEBHOOK_URL);
    const postData = JSON.stringify(testPayload);

    const options = {
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname + url.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      },
      timeout: 120000 // 2 minutes
    };

    console.log(`📡 Appel webhook: ${url.hostname}${url.pathname}\n`);

    const req = https.request(options, (res) => {
      let data = '';

      console.log(`📊 Status: ${res.statusCode}`);

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        console.log('\n📄 Réponse:\n');
        try {
          const json = JSON.parse(data);
          console.log(JSON.stringify(json, null, 2));

          if (json.ok) {
            console.log('\n✅ WORKFLOW EXÉCUTÉ AVEC SUCCÈS!');
            console.log(`📋 Job ID: ${json.jobId}`);
            console.log(`🔄 Status: ${json.status}`);
            console.log(`📝 Notes: ${json.notes?.length || 0} suggestions`);
          } else {
            console.log('\n⚠️  Le workflow s\'est terminé mais avec des warnings');
          }

          resolve(json);
        } catch (e) {
          console.log(data);
          console.log('\n⚠️  Réponse non-JSON reçue');
          resolve(data);
        }
      });
    });

    req.on('error', (e) => {
      console.error(`\n❌ Erreur: ${e.message}`);
      reject(e);
    });

    req.on('timeout', () => {
      console.error('\n❌ Timeout - Le workflow prend trop de temps');
      req.destroy();
      reject(new Error('Timeout'));
    });

    req.write(postData);
    req.end();
  });
}

// Run test
testWorkflow()
  .then(() => {
    console.log('\n' + '='.repeat(60));
    console.log('✅ Test terminé\n');
    process.exit(0);
  })
  .catch((err) => {
    console.error('\n❌ Test échoué:', err.message);
    process.exit(1);
  });
