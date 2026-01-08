// Test workflow complet (generate-article)
const https = require('https');

const WEBHOOK_URL = 'https://n8n.srv1144760.hstgr.cloud/webhook/generate-article';

const payload = {
  topic: 'DevOps et Automatisation Cloud 2025 - Guide Complet',
  outline: 'Introduction DevOps moderne|Principes fondamentaux et best practices|Infrastructure as Code (IaC)|CI/CD et pipelines automatisés|FAQ DevOps 2025'
};

console.log('🧪 TEST WORKFLOW COMPLET (Research + Draft + Save)');
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
  timeout: 120000 // 2 minutes
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
        console.log('✅ SUCCÈS - Article section générée!');
        console.log(`📋 Job ID: ${json.jobId}`);
        console.log(`📝 Topic: ${json.topic}`);
        console.log(`🔄 Status: ${json.status}`);
        console.log(`💬 Message: ${json.message}`);
        console.log('\n📊 Vérifiez dans Supabase:');
        console.log(`   SELECT * FROM articles_content WHERE job_id = '${json.jobId}';`);
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
  console.error('\n❌ Timeout (> 2 minutes)');
  req.destroy();
});

req.write(postData);
req.end();
