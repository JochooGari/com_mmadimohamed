// Script pour sauvegarder l'article du workflow dans le frontend
const fs = require('fs');

const API_URL = 'https://com-mmadimohamed.vercel.app/api/geo';

async function saveArticle() {
  console.log('📥 Récupération du workflow...');

  // 1. Get workflow status
  const statusRes = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'workflow_status',
      jobId: 'job_1763587238718_og5nz9'
    })
  });

  const data = await statusRes.json();
  console.log(`Status: ${data.status}`);
  console.log(`Best Score: ${data.bestScore}`);
  console.log(`Iterations: ${data.iteration}`);

  if (!data.article) {
    console.error('❌ Pas d\'article dans le workflow');
    return;
  }

  console.log(`✅ Article récupéré (${data.article.length} caractères)`);

  // 2. Parse the article
  let articleData;
  try {
    articleData = JSON.parse(data.article);
  } catch (e) {
    console.error('❌ Erreur de parsing JSON:', e.message);
    // Save raw article for debugging
    fs.writeFileSync('article-raw.txt', data.article, 'utf8');
    console.log('   Article brut sauvegardé dans: article-raw.txt');
    return;
  }

  console.log(`   Sections: ${articleData.sections?.length || 0}`);

  // 3. Convert to HTML
  const htmlContent = articleData.sections
    ?.map(s => s.html || '')
    .join('\n\n') || '';

  console.log(`   HTML généré: ${htmlContent.length} caractères`);

  // 4. Save to file
  fs.writeFileSync('article-datawarehouse-finance.html', htmlContent, 'utf8');
  console.log('✅ Article HTML sauvegardé dans: article-datawarehouse-finance.html');

  // 5. Save full JSON for reference
  const fullRecord = {
    id: Date.now().toString(),
    title: 'Datawarehouse Finance et Power BI - Guide complet',
    html: htmlContent,
    sections: articleData.sections,
    metadata: {
      topic: data.jobId,
      bestScore: data.bestScore,
      iterations: data.iteration,
      scores: data.scores,
      generatedAt: new Date().toISOString()
    }
  };

  fs.writeFileSync('article-datawarehouse-finance.json', JSON.stringify(fullRecord, null, 2), 'utf8');
  console.log('✅ Article JSON sauvegardé dans: article-datawarehouse-finance.json');

  // 6. Upload to backend via import_template
  console.log('\n📤 Upload vers le backend...');

  const uploadRes = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'import_template',
      title: 'Datawarehouse Finance et Power BI - Guide complet (SEO 92, GEO 95)',
      html: htmlContent,
      url: `workflow:${data.jobId}`
    })
  });

  const uploadData = await uploadRes.json();

  if (uploadData.ok || uploadData.id) {
    console.log(`✅ Article uploadé avec succès !`);
    console.log(`   ID: ${uploadData.id}`);
    console.log(`\n🎉 L'article est maintenant disponible dans l'onglet "Articles" du frontend !`);
  } else {
    console.error('❌ Erreur upload:', uploadData);
  }
}

saveArticle().catch(console.error);
