// Test simple du webhook n8n
const https = require('https');

// REMPLACEZ par votre URL webhook n8n
const WEBHOOK_URL = process.argv[2] || 'ENTREZ_VOTRE_URL_WEBHOOK';

if (WEBHOOK_URL === 'ENTREZ_VOTRE_URL_WEBHOOK') {
  console.error('❌ Usage: node test-webhook-simple.js "https://votre-n8n.com/webhook/start-article"');
  process.exit(1);
}

const payload = {
  topic: 'Test Article DevOps',
  outline: 'Introduction|Partie 1|Partie 2',
  minScore: 95,
  maxIterations: 2
};

console.log('🧪 Test du webhook n8n');
console.log('📡 URL:', WEBHOOK_URL);
console.log('📦 Payload:', JSON.stringify(payload, null, 2), '\n');

const url = new URL(WEBHOOK_URL);
const postData = JSON.stringify(payload);

const options = {
  hostname: url.hostname,
  port: url.port || (url.protocol === 'https:' ? 443 : 80),
  path: url.pathname + url.search,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  },
  timeout: 60000
};

const req = (url.protocol === 'https:' ? https : require('http')).request(options, (res) => {
  console.log(`✅ Status: ${res.statusCode}\n`);

  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    console.log('📄 Réponse:');
    try {
      const json = JSON.parse(data);
      console.log(JSON.stringify(json, null, 2));
    } catch (e) {
      console.log(data);
    }
  });
});

req.on('error', (e) => console.error('❌ Erreur:', e.message));
req.on('timeout', () => {
  console.error('❌ Timeout');
  req.destroy();
});

req.write(postData);
req.end();
