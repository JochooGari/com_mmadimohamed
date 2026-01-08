// Test workflow complet avec boucle review/score/rewrite
const https = require('https');

const WEBHOOK_URL = 'https://n8n.srv1144760.hstgr.cloud/webhook/generate-article-complete';

const payload = {
  topic: 'DevOps et Automatisation Cloud 2025 - Guide Complet pour Entreprises Françaises',
  outline: 'Introduction DevOps moderne|Principes fondamentaux et ROI|Infrastructure as Code (IaC)|CI/CD et pipelines automatisés|Observabilité et monitoring|FAQ et bonnes pratiques 2025',
  minScore: 95,
  maxIterations: 3
};

console.log('🎯 TEST WORKFLOW COMPLET AVEC BOUCLE');
console.log('='.repeat(70));
console.log(`📡 URL: ${WEBHOOK_URL}`);
console.log(`📦 Payload:\n${JSON.stringify(payload, null, 2)}\n`);
console.log('⏱️  Temps estimé: 3-5 minutes (dépend du nombre d\'itérations)\n');

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
  timeout: 600000 // 10 minutes max
};

console.log('🚀 Envoi de la requête...\n');

const startTime = Date.now();

const req = https.request(options, (res) => {
  const duration = ((Date.now() - startTime) / 1000).toFixed(1);

  console.log(`📊 Status: ${res.statusCode}`);
  console.log(`⏱️  Durée: ${duration}s\n`);

  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    console.log('📄 Réponse:\n');
    try {
      const json = JSON.parse(data);
      console.log(JSON.stringify(json, null, 2));

      if (json.ok) {
        console.log('\n' + '='.repeat(70));
        console.log('✅ SUCCÈS - Article généré avec boucle qualité!');
        console.log('='.repeat(70));
        console.log(`📋 Job ID: ${json.jobId}`);
        console.log(`📝 Topic: ${json.topic}`);
        console.log(`📊 Score Final: ${json.finalScore}/100`);
        console.log(`🔄 Itérations: ${json.iterations}`);
        console.log(`💬 Status: ${json.status}`);
        console.log(`\n🎯 WORKFLOW EXÉCUTÉ:`);
        console.log(`   1. ✅ Recherche interne d'articles (liens)`);
        console.log(`   2. ✅ Research (Claude Sonnet 4.5)`);
        console.log(`   3. ✅ Draft initial (GPT-5.1)`);
        console.log(`   4. ✅ Review (Claude Sonnet 4.5)`);
        console.log(`   5. ✅ Score (Perplexity Sonar)`);
        if (json.iterations > 1) {
          console.log(`   6. ✅ Rewrite x${json.iterations - 1} (GPT-5.1)`);
          console.log(`   7. ✅ Re-review & Re-score (boucle)`);
        }
        console.log(`   ${json.iterations > 1 ? '8' : '6'}. ✅ Sauvegarde Supabase`);

        console.log(`\n📊 Vérifiez dans Supabase:`);
        console.log(`   SELECT * FROM articles_content WHERE job_id = '${json.jobId}';`);
        console.log(`\n🌐 Ou avec le script:`);
        console.log(`   node check-latest-sections.js`);
      }
    } catch (e) {
      console.log(data);
      console.log('\n⚠️  Réponse non-JSON');
    }
    console.log('\n' + '='.repeat(70));
  });
});

req.on('error', (e) => console.error(`\n❌ Erreur: ${e.message}`));
req.on('timeout', () => {
  console.error('\n❌ Timeout (> 10 minutes)');
  console.log('💡 Le workflow peut continuer en arrière-plan dans n8n.');
  console.log('   Vérifiez l\'onglet "Executions" pour voir la progression.');
  req.destroy();
});

req.write(postData);
req.end();
