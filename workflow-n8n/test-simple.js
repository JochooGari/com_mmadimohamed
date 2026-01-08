// Test workflow simple (start-article-fixed)
const https = require('https');

const WEBHOOK_URL = 'https://n8n.srv1144760.hstgr.cloud/webhook/start-article-fixed';

const payload = {
  topic: 'DevOps et Automatisation Cloud 2025 - Guide Complet',
  outline: 'Introduction DevOps moderne|Principes fondamentaux|Infrastructure as Code|CI/CD Pipelines|FAQ'
};

console.log('🧪 TEST WORKFLOW SIMPLE (avec Function Nodes)');
console.log('='.repeat(60));
console.log(`📡 URL: ${WEBHOOK_URL}`);
console.log(`📦 Payload:\n${JSON.stringify(payload, null, 2)}\n`);

const url = new URL(WEBHOOK_URL);
const postData = JSON.stringify(payload);

const options = {
  hostname: url.hostname,
  port: url.port || 443,
  path: url.pathname,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  },
  timeout: 60000
};

console.log('🚀 Envoi de la requête...\n');

const req = https.request(options, (res) => {
  console.log(`📊 Status: ${res.statusCode}\n`);

  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    console.log('📄 Réponse:\n');
    try {
      const json = JSON.parse(data);
      console.log(JSON.stringify(json, null, 2));

      if (json.ok) {
        console.log('\n' + '='.repeat(60));
        console.log('✅ SUCCÈS!');
        console.log(`📋 Job ID: ${json.jobId}`);
        console.log(`📝 Topic: ${json.topic}`);
        console.log(`🔄 Step: ${json.step}`);
        console.log(`📊 Research: ${json.research?.substring(0, 100)}...`);
      }
    } catch (e) {
      console.log(data);
      console.log('\n⚠️  Réponse non-JSON');
    }
    console.log('\n' + '='.repeat(60));
  });
});

req.on('error', (e) => console.error(`\n❌ Erreur: ${e.message}`));
req.on('timeout', () => {
  console.error('\n❌ Timeout');
  req.destroy();
});

req.write(postData);
req.end();
