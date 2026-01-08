// Test n8n workflow via webhook (direct call)
const https = require('https');

// L'URL du webhook de votre workflow
// Format: https://n8n.srv1144760.hstgr.cloud/webhook/start-article-simple
const WEBHOOK_URL = 'https://n8n.srv1144760.hstgr.cloud/webhook/start-article-simple';

const testPayload = {
  topic: 'DevOps et Automatisation Cloud 2025 - Guide Complet',
  outline: 'Introduction DevOps moderne|Principes fondamentaux|Infrastructure as Code|CI/CD Pipelines|FAQ',
  minScore: 95,
  maxIterations: 3
};

console.log('🧪 TEST N8N WORKFLOW VIA WEBHOOK');
console.log('='.repeat(60));
console.log(`📡 URL: ${WEBHOOK_URL}`);
console.log(`📦 Payload:\n${JSON.stringify(testPayload, null, 2)}\n`);

const url = new URL(WEBHOOK_URL);
const postData = JSON.stringify(testPayload);

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

console.log('🚀 Sending request...\n');

const req = https.request(options, (res) => {
  console.log(`📊 Status Code: ${res.statusCode}`);
  console.log(`📋 Headers:`, res.headers);
  console.log('\n📄 Response Body:\n');

  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
    process.stdout.write(chunk.toString());
  });

  res.on('end', () => {
    console.log('\n\n' + '='.repeat(60));

    try {
      const json = JSON.parse(data);
      console.log('\n✅ JSON Response:');
      console.log(JSON.stringify(json, null, 2));

      if (json.ok) {
        console.log('\n🎉 SUCCESS!');
        console.log(`📋 Job ID: ${json.jobId}`);
        console.log(`🔄 Status: ${json.status}`);
        console.log(`📝 Step: ${json.step}`);
      }
    } catch (e) {
      if (data.includes('error') || res.statusCode >= 400) {
        console.log('\n❌ Request failed');
      } else {
        console.log('\n⚠️  Response is not JSON (might be HTML or plain text)');
      }
    }

    console.log('\n✅ Test completed\n');
  });
});

req.on('error', (e) => {
  console.error(`\n❌ Request Error: ${e.message}`);
  console.error(e);
});

req.on('timeout', () => {
  console.error('\n❌ Request Timeout (> 2 minutes)');
  req.destroy();
});

req.write(postData);
req.end();
