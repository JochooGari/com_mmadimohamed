#!/usr/bin/env node
/**
 * Test direct de l'API Perplexity (sans n8n)
 * Pour vérifier que l'API key est valide
 */

const https = require('https');

const API_KEY = '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';

console.log('🧪 TEST DIRECT API PERPLEXITY\n');
console.log('='.repeat(60));
console.log('');
console.log('🔑 API Key:', API_KEY.substring(0, 15) + '...');
console.log('📡 URL: https://api.perplexity.ai/chat/completions');
console.log('');

const payload = JSON.stringify({
  model: 'sonar',
  messages: [{
    role: 'user',
    content: 'Test simple, réponds juste "OK" en français'
  }],
  max_tokens: 20
});

const options = {
  hostname: 'api.perplexity.ai',
  port: 443,
  path: '/chat/completions',
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${API_KEY}`,
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(payload)
  }
};

console.log('🚀 Envoi de la requête...\n');

const startTime = Date.now();

const req = https.request(options, (res) => {
  let data = '';

  console.log(`📊 Status: ${res.statusCode}`);
  console.log(`📋 Headers:`, res.headers);
  console.log('');

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`⏱️  Durée: ${duration}s`);
    console.log('');

    if (res.statusCode === 200) {
      console.log('✅ SUCCÈS ! L\'API key est valide.\n');
      try {
        const response = JSON.parse(data);
        console.log('📄 Réponse:\n');
        console.log(JSON.stringify(response, null, 2));
        console.log('');
        console.log('💬 Message:', response.choices?.[0]?.message?.content);
      } catch (e) {
        console.log('📄 Réponse (texte):', data);
      }
    } else if (res.statusCode === 401) {
      console.log('❌ ERREUR 401: API key invalide ou expirée\n');
      console.log('Réponse:', data.substring(0, 500));
      console.log('\n⚠️  Vérifiez votre API key Perplexity sur https://www.perplexity.ai/settings/api');
    } else {
      console.log(`❌ ERREUR ${res.statusCode}\n`);
      console.log('Réponse:', data.substring(0, 500));
    }

    console.log('');
    console.log('='.repeat(60));
  });
});

req.on('error', (error) => {
  console.error('❌ Erreur réseau:', error.message);
  process.exit(1);
});

req.write(payload);
req.end();
