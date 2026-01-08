#!/usr/bin/env node
/**
 * Test simple Perplexity workflow
 */

const https = require('https');

const WEBHOOK_URL = 'https://n8n.srv1144760.hstgr.cloud/webhook/test-perplexity';

console.log('🧪 TEST PERPLEXITY API SIMPLE\n');
console.log('='.repeat(60));
console.log('');
console.log('📡 URL:', WEBHOOK_URL);
console.log('⏱️  Temps estimé: 5-10 secondes');
console.log('');

const url = new URL(WEBHOOK_URL);

const options = {
  hostname: url.hostname,
  port: 443,
  path: url.pathname,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  }
};

console.log('🚀 Envoi de la requête...\n');

const startTime = Date.now();

const req = https.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    const duration = ((Date.now() - startTime) / 1000).toFixed(1);

    console.log(`📊 Status: ${res.statusCode}`);
    console.log(`⏱️  Durée: ${duration}s`);
    console.log('');

    try {
      const response = JSON.parse(data);
      console.log('📄 Réponse:\n');
      console.log(JSON.stringify(response, null, 2));
      console.log('');

      if (response.success) {
        console.log('✅ TEST RÉUSSI !');
        console.log('');
        console.log(`📊 Score moyen: ${response.avgScore}/100`);
        console.log(`   SEO: ${response.seoScore}/100`);
        console.log(`   GEO: ${response.geoScore}/100`);
        console.log('');
        console.log('💪 Forces:');
        response.strengths?.forEach((s, i) => console.log(`   ${i + 1}. ${s}`));
        console.log('');
        console.log('⚠️  Faiblesses:');
        response.weaknesses?.forEach((w, i) => console.log(`   ${i + 1}. ${w}`));
      } else {
        console.log('❌ Erreur dans la réponse');
      }
    } catch (e) {
      console.log('📄 Réponse (texte):\n');
      console.log(data);
      console.log('');
      console.log(`⚠️  Réponse non-JSON: ${e.message}`);
    }

    console.log('');
    console.log('='.repeat(60));
  });
});

req.on('error', (error) => {
  console.error('❌ Erreur:', error.message);
  process.exit(1);
});

req.end();
