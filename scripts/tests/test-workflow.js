// Script pour exécuter le workflow complet automatiquement
const API_URL = 'https://com-mmadimohamed.vercel.app/api/geo';

async function runWorkflow() {
  console.log('🚀 Démarrage du workflow...');

  // 1. Start workflow
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
  console.log(`✅ Job créé: ${jobId}`);

  // 2. Execute steps until completion
  let completed = false;
  let stepCount = 0;
  const maxSteps = 50; // Safety limit

  while (!completed && stepCount < maxSteps) {
    stepCount++;

    console.log(`\n⏳ Étape ${stepCount}...`);

    const stepRes = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'workflow_step',
        jobId
      })
    });

    const stepData = await stepRes.json();
    console.log(`   Step: ${stepData.step} → ${stepData.nextStep || 'FIN'}`);
    console.log(`   Iteration: ${stepData.iteration}`);

    if (stepData.scores && stepData.scores.length > 0) {
      const lastScore = stepData.scores[stepData.scores.length - 1];
      console.log(`   📊 Score: SEO ${lastScore.seo}/100, GEO ${lastScore.geo}/100`);
    }

    completed = stepData.completed;

    if (!completed) {
      // Small delay between steps
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  // 3. Get final result
  console.log('\n📥 Récupération du résultat final...');

  const statusRes = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'workflow_status',
      jobId
    })
  });

  const finalData = await statusRes.json();

  console.log('\n✅ WORKFLOW TERMINÉ\n');
  console.log(`Status: ${finalData.status}`);
  console.log(`Iterations: ${finalData.iteration}`);
  console.log(`Best Score: ${finalData.bestScore}`);
  console.log(`\nScores par iteration:`);
  finalData.scores.forEach((s, i) => {
    console.log(`  Iteration ${i + 1}: SEO ${s.seo}/100, GEO ${s.geo}/100 (Total: ${s.total})`);
  });

  if (finalData.article) {
    console.log(`\n📝 Article généré (${finalData.article.length} caractères)`);
    // Save article to file
    const fs = require('fs');
    fs.writeFileSync('article-datawarehouse-finance.json', finalData.article, 'utf8');
    console.log('   Sauvegardé dans: article-datawarehouse-finance.json');
  }

  console.log(`\n📊 Token usage:`);
  finalData.logs.forEach(log => {
    if (log.usage) {
      console.log(`   ${log.step} (iter ${log.iteration || 0}): ${log.usage.totalTokens} tokens`);
    }
  });
}

runWorkflow().catch(console.error);
