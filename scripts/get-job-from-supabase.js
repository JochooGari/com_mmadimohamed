// Script pour récupérer le job directement via l'API backend
const API_URL = 'https://com-mmadimohamed.vercel.app/api/geo';

async function getJobArticle() {
  console.log('📥 Récupération du job depuis Supabase via backend...');

  // Use backend API to get the full job
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'workflow_save_article',
      jobId: 'job_1763587238718_og5nz9',
      title: 'Datawarehouse Finance et Power BI - Guide complet (SEO 92, GEO 95)'
    })
  });

  const data = await res.json();

  if (data.ok) {
    console.log('✅ Article sauvegardé !');
    console.log('   ID:', data.id);
    console.log('   HTML length:', data.html?.length || 0);
    console.log('   Outline H1:', data.outline?.h1 || '');

    // Now load the saved template
    console.log('\n📥 Chargement du template sauvegardé...');

    const loadRes = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'import_template',
        templateId: data.id
      })
    });

    const templateData = await loadRes.json();
    console.log('   HTML length:', templateData.html?.length || 0);

    if (templateData.html && templateData.html.length > 0) {
      const fs = require('fs');
      fs.writeFileSync('article-final.html', templateData.html, 'utf8');
      console.log('\n✅ Article sauvegardé dans: article-final.html');
      console.log('🎉 L\'article est maintenant disponible dans l\'onglet Templates du frontend !');
    } else {
      console.log('❌ L\'article est vide');
    }
  } else {
    console.error('❌ Erreur:', data);
  }
}

getJobArticle().catch(console.error);
