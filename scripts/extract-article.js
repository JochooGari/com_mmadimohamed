// Script pour extraire et sauvegarder l'article depuis le fichier Supabase
const fs = require('fs');

// Lire le fichier job
const jobPath = 'C:\\Users\\power\\OneDrive\\Documents\\Website_2025_06_30\\job_supabase\\job_1763587238718_og5nz9.json';
const job = JSON.parse(fs.readFileSync(jobPath, 'utf8'));

console.log('📄 Job chargé:', job.id);
console.log('   Topic:', job.topic);
console.log('   Best Score:', job.bestScore);
console.log('   Status:', job.status);
console.log('   Template ID:', job.templateId);

if (!job.bestArticle) {
  console.error('❌ Pas de bestArticle dans le job');
  process.exit(1);
}

// Parse l'article JSON
let articleData;
try {
  articleData = JSON.parse(job.bestArticle);
  console.log('✅ Article parsé:', articleData.sections?.length || 0, 'sections');
} catch (e) {
  console.error('❌ Erreur parsing article:', e.message);
  process.exit(1);
}

// Extraire le HTML de toutes les sections
const htmlContent = articleData.sections
  ?.map(s => s.html || '')
  .join('\n\n') || '';

console.log('📝 HTML généré:', htmlContent.length, 'caractères');

// Sauvegarder en HTML
fs.writeFileSync('article-datawarehouse-finance-final.html', htmlContent, 'utf8');
console.log('✅ Article HTML sauvegardé: article-datawarehouse-finance-final.html');

// Créer un record complet pour l'API
const record = {
  id: Date.now().toString(),
  title: job.topic,
  html: htmlContent,
  sections: articleData.sections,
  metadata: {
    jobId: job.id,
    bestScore: job.bestScore,
    iterations: job.iteration,
    scores: job.scores,
    status: job.status,
    generatedAt: new Date().toISOString()
  },
  createdAt: new Date().toISOString()
};

fs.writeFileSync('article-datawarehouse-finance-complete.json', JSON.stringify(record, null, 2), 'utf8');
console.log('✅ Article JSON complet sauvegardé: article-datawarehouse-finance-complete.json');

// Upload vers le backend
const API_URL = 'https://com-mmadimohamed.vercel.app/api/geo';

async function uploadArticle() {
  console.log('\n📤 Upload vers le backend...');

  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'import_template',
      title: `${job.topic} (SEO ${job.scores[1]?.seo || 92}, GEO ${job.scores[1]?.geo || 88})`,
      html: htmlContent,
      url: `workflow:${job.id}`
    })
  });

  const data = await res.json();

  if (data.ok || data.id) {
    console.log('✅ Article uploadé avec succès !');
    console.log('   ID:', data.id);
    console.log('   Outline H1:', data.outline?.h1?.substring(0, 100) || '');
    console.log('\n🎉 L\'article est maintenant disponible dans l\'onglet "Articles" du frontend !');
  } else {
    console.error('❌ Erreur upload:', data);
  }
}

uploadArticle().catch(console.error);
