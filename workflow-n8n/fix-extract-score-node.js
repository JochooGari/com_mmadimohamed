#!/usr/bin/env node
/**
 * Corrige le node "Extract Score & Decide" pour:
 * 1. Utiliser Extract Enrichment au lieu de Extract Review
 * 2. Exporter correctement seoScore et geoScore
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env.n8n');
const envContent = fs.readFileSync(envPath, 'utf8');
const N8N_API_KEY = envContent.match(/N8N_API_KEY=(.+)/)[1].trim();
const N8N_URL = 'n8n.srv1144760.hstgr.cloud';
const WORKFLOW_ID = '06yXZiR5QaoQmZsY';

console.log('🔧 CORRECTION EXTRACT SCORE & DECIDE\n');
console.log('='.repeat(60));
console.log('');

function httpsRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: N8N_URL,
      port: 443,
      path: path,
      method: method,
      headers: { 'X-N8N-API-KEY': N8N_API_KEY, 'Accept': 'application/json' }
    };

    if (data) {
      const payload = JSON.stringify(data);
      options.headers['Content-Type'] = 'application/json';
      options.headers['Content-Length'] = Buffer.byteLength(payload);
    }

    const req = https.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => { responseData += chunk; });
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try { resolve(JSON.parse(responseData)); } catch { resolve(responseData); }
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${responseData}`));
        }
      });
    });

    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function main() {
  try {
    console.log('📥 Récupération du workflow...\n');
    const workflow = await httpsRequest('GET', `/api/v1/workflows/${WORKFLOW_ID}`);

    const extractScoreIndex = workflow.nodes.findIndex(n => n.name === 'Extract Score & Decide');

    if (extractScoreIndex === -1) {
      throw new Error('Node "Extract Score & Decide" introuvable');
    }

    console.log('✅ Node trouvé');
    console.log('');
    console.log('🔄 Application de la correction...\n');

    // NOTE: Maintenant le flux est:
    // STEP 4 - Score → Extract Score & Decide → Build Enrichment → Get Enrichment → Extract Enrichment → IF Score < 95%
    // Donc Extract Score & Decide doit toujours utiliser Extract Review (avant l'enrichment)

    workflow.nodes[extractScoreIndex].parameters.jsCode = `// Extract score and decide next step
const response = $input.all()[0].json;
const prev = $node['Extract Review'].json;

let scoreData = { scores: { seo: 0, geo: 0 }, breakdown: {}, strengths: [], weaknesses: [], fixes: [] };

try {
  const scoreText = response.choices?.[0]?.message?.content || '{}';
  scoreData = JSON.parse(scoreText);
} catch (e) {
  const match = (response.choices?.[0]?.message?.content || '').match(/\`\`\`json\\\\s*([\\\\s\\\\S]*?)\\\\s*\`\`\`/);
  if (match) {
    try { scoreData = JSON.parse(match[1]); } catch {}
  }
}

const seoScore = scoreData.scores?.seo || 0;
const geoScore = scoreData.scores?.geo || 0;
const avgScore = Math.round((seoScore + geoScore) / 2);

console.log('Scores extraits:', { seoScore, geoScore, avgScore });

return {
  json: {
    ...prev,
    avgScore: avgScore,
    seoScore: seoScore,
    geoScore: geoScore,
    scoreBreakdown: scoreData,
    currentScore: avgScore
  }
};`;

    console.log('✅ Code mis à jour avec:');
    console.log('   - Export de avgScore, seoScore, geoScore');
    console.log('   - Console.log pour debug');
    console.log('   - Utilise toujours Extract Review (correct)');
    console.log('');

    console.log('💾 Sauvegarde...\n');

    const workflowToUpdate = {
      name: workflow.name,
      nodes: workflow.nodes,
      connections: workflow.connections,
      settings: workflow.settings
    };

    await httpsRequest('PUT', `/api/v1/workflows/${WORKFLOW_ID}`, workflowToUpdate);

    console.log('='.repeat(60));
    console.log('');
    console.log('🎉 CORRECTION APPLIQUÉE !');
    console.log('');
    console.log('✅ Le node "Extract Score & Decide" exporte maintenant:');
    console.log('   - avgScore (moyenne arrondie)');
    console.log('   - seoScore (score SEO individuel)');
    console.log('   - geoScore (score GEO individuel)');
    console.log('');
    console.log('Ces valeurs seront disponibles pour Build Enrichment Body.');
    console.log('');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

main();
