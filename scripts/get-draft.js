// Script pour récupérer l'article complet depuis le backend
const fs = require('fs');

const API_URL = 'https://com-mmadimohamed.vercel.app/api/geo';
const JOB_ID = 'job_1763629312158_263pf1';

async function getDraft() {
  console.log('📥 Récupération du brouillon complet...\n');

  // Le backend peut lire le fichier complet depuis Supabase
  // On va utiliser une approche différente: on récupère via l'API
  // et on reconstruit l'article depuis les logs si nécessaire

  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'workflow_status',
      jobId: JOB_ID
    })
  });

  const data = await res.json();

  console.log('Job ID:', data.jobId);
  console.log('Status:', data.status);
  console.log('Iteration:', data.iteration);
  console.log('');

  if (!data.article) {
    console.error('❌ Pas d\'article disponible');
    return;
  }

  // L'article est probablement tronqué dans la réponse HTTP
  // Mais on peut au moins extraire ce qu'on a
  console.log('Article length (reçu):', data.article.length);

  // Essayer de parser ce qu'on a
  let sections = [];
  let articlePreview = data.article;

  // Si l'article est tronqué, essayons de le réparer en ajoutant les fermetures manquantes
  if (!articlePreview.endsWith('}')) {
    // Compter les accolades pour voir ce qui manque
    const openBraces = (articlePreview.match(/{/g) || []).length;
    const closeBraces = (articlePreview.match(/}/g) || []).length;
    const missing = openBraces - closeBraces;

    console.log(`Accolades ouvrantes: ${openBraces}`);
    console.log(`Accolades fermantes: ${closeBraces}`);
    console.log(`Manquantes: ${missing}`);

    if (missing > 0) {
      articlePreview += '"}]}' + '}]}]}'.substring(0, missing);
    }
  }

  try {
    const articleData = JSON.parse(articlePreview);
    sections = articleData.sections || [];
    console.log(`✅ ${sections.length} sections parsées\n`);
  } catch (e) {
    console.error('❌ Erreur parsing:', e.message);
    console.log('\nSauvegarde de l\'article brut...');
    fs.writeFileSync('brouillon_raw.txt', articlePreview, 'utf8');
    console.log('Sauvegardé: brouillon_raw.txt');
    return;
  }

  // Extraire le HTML
  const htmlContent = sections.map(s => {
    const title = s.title ? `\n\n<!-- Section: ${s.title} -->\n` : '';
    return title + (s.html || '');
  }).join('\n');

  // Sauvegarder
  fs.writeFileSync('brouillon_writer_complet.html', htmlContent, 'utf8');
  console.log('✅ HTML sauvegardé: brouillon_writer_complet.html');
  console.log(`   Taille: ${htmlContent.length} caractères\n`);

  // Afficher un résumé
  console.log('📋 SECTIONS:');
  sections.forEach((s, i) => {
    const htmlLen = s.html?.length || 0;
    console.log(`   ${i + 1}. ${s.title || 'Sans titre'} (${htmlLen} car)`);
  });

  // Extraire les premiers paragraphes pour aperçu
  console.log('\n📄 APERÇU (premiers 500 caractères):');
  const preview = htmlContent.replace(/<[^>]*>/g, '').substring(0, 500);
  console.log(preview + '...\n');

  console.log('🎉 Ouvrez brouillon_writer_complet.html dans votre navigateur pour voir l\'article complet');
}

getDraft().catch(console.error);
