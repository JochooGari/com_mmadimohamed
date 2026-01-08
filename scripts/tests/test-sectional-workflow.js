// Test complet du workflow avec génération par section
// Lance research + draft_sections et affiche les résultats

const BASE_URL = 'https://com-mmadimohamed.vercel.app';

async function testWorkflow() {
  console.log('🧪 TEST DU WORKFLOW AVEC GÉNÉRATION PAR SECTION\n');
  console.log('='.repeat(70));

  // Configuration du test
  const testTopic = 'DevOps et Automatisation Cloud 2025';
  const testOutline = 'Introduction au DevOps | Principes clés | Infrastructure as Code | CI/CD Pipeline';

  console.log(`\n📋 Configuration:`);
  console.log(`   Topic: ${testTopic}`);
  console.log(`   Outline: ${testOutline}`);
  console.log(`   Sections attendues: 6 (intro + 4 H2 + FAQ/conclusion)`);
  console.log(`   Mots attendus: ~3500 mots\n`);

  // Step 1: Start workflow
  console.log('🚀 STEP 1: Starting workflow...\n');
  const startRes = await fetch(`${BASE_URL}/api/geo`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'workflow_start',
      topic: testTopic,
      outline: testOutline
    })
  });

  const startData = await startRes.json();
  if (!startData.ok) {
    console.error('❌ Failed to start workflow:', startData);
    return;
  }

  const jobId = startData.jobId;
  console.log(`✅ Workflow started: ${jobId}`);
  console.log(`   Next step: ${startData.nextStep}\n`);

  // Step 2: Execute research
  console.log('🔍 STEP 2: Executing research...\n');
  await new Promise(r => setTimeout(r, 2000));

  const researchRes = await fetch(`${BASE_URL}/api/geo`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'workflow_step',
      jobId: jobId
    })
  });

  const researchData = await researchRes.json();
  console.log(`Research completed:`);
  console.log(`   Next step: ${researchData.nextStep}`);
  console.log(`   Status: ${researchData.status}\n`);

  if (researchData.nextStep !== 'draft_sections') {
    console.log(`⚠️  Expected nextStep 'draft_sections', got '${researchData.nextStep}'`);
    console.log(`   This means the new sectional generation code is not being used.`);
    console.log(`   Check that the code was deployed correctly.\n`);
  }

  // Step 3: Execute draft_sections (NEW STEP)
  console.log('📝 STEP 3: Executing draft_sections (NEW SECTIONAL GENERATION)...\n');
  console.log('   This will generate 6 sections individually with 2500 tokens each:');
  console.log('   - Section 0: H1 + Intro');
  console.log('   - Sections 1-4: Individual H2 sections');
  console.log('   - Section 5: FAQ + Conclusion\n');
  console.log('   ⏱️  This may take 3-5 minutes (6 GPT-5.1 calls)...\n');

  await new Promise(r => setTimeout(r, 3000));

  const draftStart = Date.now();
  const draftRes = await fetch(`${BASE_URL}/api/geo`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'workflow_step',
      jobId: jobId
    })
  });

  const draftTime = ((Date.now() - draftStart) / 1000).toFixed(1);
  const draftData = await draftRes.json();

  console.log(`\n✅ draft_sections completed in ${draftTime}s`);
  console.log(`   Next step: ${draftData.nextStep}`);
  console.log(`   Status: ${draftData.status}\n`);

  if (draftData.error) {
    console.error(`❌ Error during draft_sections: ${draftData.error}\n`);

    if (draftData.error.includes('articles_content') || draftData.error.includes('relation')) {
      console.log('💡 DIAGNOSTIC: La table articles_content n\'existe pas encore!\n');
      console.log('📝 ACTION REQUISE:');
      console.log('   1. Ouvrir Supabase Dashboard → SQL Editor');
      console.log('   2. Exécuter le SQL depuis:');
      console.log('      magicpath-project/supabase/migrations/create_articles_content.sql\n');
      console.log('   Puis relancer ce test.\n');
    }

    return;
  }

  // Step 4: Check results
  console.log('🔍 STEP 4: Analyzing results...\n');

  // Download job to check verification metadata
  const jobRes = await fetch(`${BASE_URL}/api/geo?action=get_job&jobId=${jobId}`);
  if (jobRes.ok) {
    const job = await jobRes.json();

    if (job.verification) {
      console.log('📊 VERIFICATION METADATA:');
      console.log(`   Sections generated: ${job.verification.sectionsGenerated || 'N/A'}`);
      console.log(`   HTML size: ${job.verification.htmlSize || 'N/A'} chars`);
      console.log(`   Generation method: ${job.verification.generationMethod || 'N/A'}`);

      if (job.verification.sectionsDetails) {
        console.log(`\n   SECTIONS DETAILS:`);
        job.verification.sectionsDetails.forEach(s => {
          console.log(`      ${s.index}. ${s.title}: ${s.size} chars`);
        });
      }
    }

    if (job.logs && job.logs.length > 0) {
      console.log(`\n📝 LOGS (last 5):`);
      job.logs.slice(-5).forEach(log => {
        console.log(`   ${log.step}: ${log.finish_reason || 'N/A'} | usage: ${JSON.stringify(log.usage || {})}`);
      });
    }
  }

  console.log('\n' + '='.repeat(70));
  console.log(`\n✅ TEST TERMINÉ`);
  console.log(`\n📊 Prochaines étapes:`);
  console.log(`   1. Compter les mots: node count-article-words.js ${jobId}`);
  console.log(`   2. Vérifier l'article: ${BASE_URL}/api/geo?action=get_article&jobId=${jobId}`);
  console.log(`   3. Identifier les ajustements nécessaires\n`);
}

testWorkflow().catch(err => {
  console.error('\n❌ TEST FAILED:', err.message);
  console.error(err);
});
