// Script workflow manuel avec validation à chaque étape
const fs = require('fs');
const readline = require('readline');

const API_URL = 'https://com-mmadimohamed.vercel.app/api/geo';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function ask(question) {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

async function manualWorkflow() {
  console.log('🚀 Workflow Manuel - Validation étape par étape\n');

  // 1. Start workflow
  console.log('📝 Création du job workflow...');
  const startRes = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'workflow_start',
      topic: 'Datawarehouse Finance et Power BI : Guide complet pour la modernisation du reporting financier',
      outline: 'H1: Guide complet Datawarehouse Finance Power BI | H2: Introduction reporting financier moderne | H2: Architecture Datawarehouse Finance | H2: Developpement DAX avance | H2: ETL/ELT Azure Integration | H2: Cas pratiques secteur financier | H2: FAQ',
      minScore: 95,
      maxIterations: 5
    })
  });

  const { jobId } = await startRes.json();
  console.log(`✅ Job créé: ${jobId}\n`);

  // ===== ÉTAPE 1: AGENT RECHERCHE (Perplexity) =====
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📡 ÉTAPE 1: AGENT RECHERCHE (Perplexity Sonar)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const answer1 = await ask('Lancer la recherche web ? (o/n) ');
  if (answer1.toLowerCase() !== 'o') {
    console.log('❌ Workflow annulé');
    rl.close();
    return;
  }

  console.log('⏳ Recherche en cours...');
  const step1Res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'workflow_step', jobId })
  });
  const step1 = await step1Res.json();
  console.log(`✅ Recherche terminée (${step1.step} → ${step1.nextStep})\n`);

  // Afficher le résultat de la recherche
  const status1Res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'workflow_status', jobId })
  });
  const status1 = await status1Res.json();

  console.log('📊 RÉSULTAT RECHERCHE:');
  console.log(`   Articles trouvés: ${status1.research?.articles || 0}`);
  console.log(`   Stats trouvées: ${status1.research?.stats || 0}`);
  console.log(`   Tokens utilisés: ${status1.logs[0]?.usage?.totalTokens || 0}\n`);

  const answer2 = await ask('Continuer avec l\'agent Writer ? (o/n) ');
  if (answer2.toLowerCase() !== 'o') {
    console.log('❌ Workflow arrêté à la recherche');
    console.log(`📝 Job ID: ${jobId} (vous pouvez reprendre plus tard)`);
    rl.close();
    return;
  }

  // ===== ÉTAPE 2: AGENT WRITER (GPT-5.1) =====
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✍️  ÉTAPE 2: AGENT WRITER (GPT-5.1)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  console.log('⏳ Rédaction en cours...');
  const step2Res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'workflow_step', jobId })
  });
  const step2 = await step2Res.json();
  console.log(`✅ Brouillon terminé (${step2.step} → ${step2.nextStep})\n`);

  const status2Res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'workflow_status', jobId })
  });
  const status2 = await status2Res.json();

  console.log('📊 RÉSULTAT WRITER:');
  const draftLog = status2.logs.find(l => l.step === 'draft');
  console.log(`   Tokens générés: ${draftLog?.usage?.completionTokens || 0}`);
  console.log(`   Tokens totaux: ${draftLog?.usage?.totalTokens || 0}`);

  // Essayer d'extraire un aperçu de l'article
  if (status2.article) {
    try {
      const articlePreview = JSON.parse(status2.article.substring(0, 1000));
      console.log(`   Sections: ${articlePreview.sections?.length || '?'}`);
      console.log(`   Premier titre: ${articlePreview.sections?.[0]?.title || 'N/A'}`);
    } catch {}
  }
  console.log('');

  // Sauvegarder le brouillon pour consultation
  if (status2.article) {
    fs.writeFileSync(`draft_${jobId}.txt`, status2.article.substring(0, 5000), 'utf8');
    console.log(`💾 Aperçu sauvegardé: draft_${jobId}.txt (premiers 5000 caractères)\n`);
  }

  const answer3 = await ask('Continuer avec les étapes de révision ? (o/n) ');
  if (answer3.toLowerCase() !== 'o') {
    console.log('❌ Workflow arrêté après le draft');
    console.log(`📝 Job ID: ${jobId}`);
    console.log(`💾 Brouillon: draft_${jobId}.txt`);
    rl.close();
    return;
  }

  // ===== BOUCLE D'ITÉRATION =====
  let continueLoop = true;
  let currentIteration = 1;

  while (continueLoop && currentIteration <= 5) {
    console.log(`\n${'━'.repeat(50)}`);
    console.log(`🔄 ITERATION ${currentIteration}`);
    console.log('━'.repeat(50) + '\n');

    // Review (Claude)
    console.log('📝 Étape: Review (Claude)...');
    await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'workflow_step', jobId })
    });

    // Enrich (Perplexity)
    console.log('🔗 Étape: Enrichissement (Perplexity)...');
    await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'workflow_step', jobId })
    });

    // Score (Perplexity)
    console.log('📊 Étape: Scoring (Perplexity)...');
    const scoreRes = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'workflow_step', jobId })
    });
    const scoreData = await scoreRes.json();

    // Afficher les scores
    const statusRes = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'workflow_status', jobId })
    });
    const statusData = await statusRes.json();

    const lastScore = statusData.scores[statusData.scores.length - 1];
    console.log(`\n✅ SCORES ITERATION ${currentIteration}:`);
    console.log(`   SEO: ${lastScore?.seo || 0}/100`);
    console.log(`   GEO: ${lastScore?.geo || 0}/100`);
    console.log(`   Total: ${lastScore?.total || 0}/200`);
    console.log(`   Meilleur score: ${statusData.bestScore}/200\n`);

    if (scoreData.completed) {
      console.log('🎉 Workflow terminé !');
      console.log(`   Status: ${scoreData.status}`);
      console.log(`   Template ID: ${statusData.templateId || 'En cours de sauvegarde...'}\n`);
      continueLoop = false;
    } else {
      const answer = await ask(`Continuer l'itération ${currentIteration + 1} ? (o/n) `);
      if (answer.toLowerCase() !== 'o') {
        console.log('❌ Workflow arrêté par l\'utilisateur');
        continueLoop = false;
      } else {
        // Rewrite
        console.log('✍️  Étape: Réécriture (GPT-5.1)...');
        await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'workflow_step', jobId })
        });
        currentIteration++;
      }
    }
  }

  console.log(`\n${'━'.repeat(50)}`);
  console.log('📋 RÉSUMÉ FINAL');
  console.log('━'.repeat(50));
  console.log(`Job ID: ${jobId}`);
  console.log(`Iterations complétées: ${currentIteration - 1}`);
  console.log(`Meilleur score: ${statusData.bestScore}/200`);
  console.log(`\n🔗 L'article sera disponible dans l'onglet Articles du frontend.`);

  rl.close();
}

manualWorkflow().catch(console.error);
