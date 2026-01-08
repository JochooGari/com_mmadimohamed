// Script pour télécharger l'article complet depuis Supabase Storage ou la table articles_content
// Utilisé pour contourner les limites HTTP et fournir un HTML local

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

require('dotenv').config({ path: './magicpath-project/.env.local' });

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Variables d\'environnement Supabase manquantes (SUPABASE_URL / SUPABASE_SERVICE_ROLE).');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false }
});

const JOB_ID = process.argv[2] || process.env.JOB_ID;
if (!JOB_ID) {
  console.error('Usage: node download-from-supabase.js <jobId>');
  process.exit(1);
}

async function downloadArticle() {
  console.log('📥 Téléchargement de l\'article depuis Supabase...');
  console.log(`   Job ID: ${JOB_ID}\n`);

  // 1) Fichier HTML déjà assemblé
  const htmlPath = `geo/articles/${JOB_ID}.html`;
  const htmlRes = await supabase.storage.from('agents').download(htmlPath);
  if (htmlRes.data && !htmlRes.error) {
    const htmlText = await htmlRes.data.text();
    const filename = `ARTICLE_${JOB_ID}.html`;
    fs.writeFileSync(filename, htmlText, 'utf8');
    console.log(`✅ HTML direct téléchargé: ${filename}`);
    console.log(`   Taille: ${Math.round(htmlText.length / 1024)} KB`);
    return;
  }
  console.log(`⚠️  HTML direct introuvable (${htmlRes.error?.message || 'pas de fichier'}) → fallback JSON/DB`);

  // 2) Sections stockées en DB (articles_content)
  const { data: dbSections, error: dbError } = await supabase
    .from('articles_content')
    .select('*')
    .eq('job_id', JOB_ID)
    .order('section_index', { ascending: true });

  if (dbSections && dbSections.length > 0) {
    console.log(`✅ ${dbSections.length} sections récupérées depuis articles_content`);
    const sections = dbSections.map((row) => row.content);
    return generateHTML({ sections }, JOB_ID);
  }
  if (dbError) {
    console.log('⚠️  Impossible de lire articles_content:', dbError.message);
  }

  // 3) Fichiers JSON legacy
  await legacyDownload();
}

async function legacyDownload() {
  console.log('🔄 Fallback legacy JSON...');
  let { data, error } = await supabase.storage
    .from('agents')
    .download(`geo/jobs/${JOB_ID}_article.json`);

  if (!data || error) {
    console.log(`⚠️  Fichier séparé absent (${error?.message || 'aucune donnée'}), lecture du job principal...`);
    const result = await supabase.storage.from('agents').download(`geo/jobs/${JOB_ID}.json`);
    if (result.error || !result.data) {
      console.error('❌ Impossible de récupérer le job:', result.error?.message || 'aucune donnée');
      process.exit(1);
    }
    const jobText = await result.data.text();
    const job = JSON.parse(jobText);
    if (!job.article) {
      console.error('❌ Pas d\'article stocké dans ce job (migration récente ?)');
      process.exit(1);
    }
    try {
      const articleData = JSON.parse(job.article);
      return generateHTML(articleData, JOB_ID);
    } catch (e) {
      console.error('❌ Article JSON illisible:', e.message);
      process.exit(1);
    }
  } else {
    const articleText = await data.text();
    const articleData = JSON.parse(articleText);
    return generateHTML(articleData, JOB_ID);
  }
}

function generateHTML(articleData, jobId) {
  const sections = articleData.sections || [];
  if (sections.length === 0) {
    console.error('❌ Aucun contenu de section disponible.');
    process.exit(1);
  }

  console.log(`📦 ${sections.length} sections récupérées – génération HTML locale...`);
  let totalWords = 0;
  sections.forEach((s, i) => {
    const text = (s.html || '').replace(/<[^>]*>/g, '');
    const words = text.split(/\s+/).filter((w) => w.length > 0);
    totalWords += words.length;
    console.log(`   ${i + 1}. ${s.title || s.id} - ${words.length} mots`);
  });
  console.log(`
📊 TOTAL: ${totalWords} mots
`);

  const generatedAt = new Date().toISOString();
  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="generated-at" content="${generatedAt}">
    <title>Article Complet - ${sections[0]?.title || 'Article GEO/SEO'}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
            max-width: 900px;
            margin: 40px auto;
            padding: 0 20px;
            line-height: 1.7;
            background: #f5f5f5;
            color: #333;
        }
        .container {
            background: white;
            padding: 40px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .meta {
            background: #e8f5e9;
            padding: 20px;
            border-left: 4px solid #4caf50;
            margin: 30px 0;
            border-radius: 4px;
        }
        h1 {
            color: #1a237e;
            font-size: 2.2em;
            margin-bottom: 20px;
            border-bottom: 3px solid #3f51b5;
            padding-bottom: 15px;
        }
        h2 {
            color: #283593;
            font-size: 1.8em;
            margin-top: 50px;
            margin-bottom: 20px;
            border-bottom: 2px solid #7986cb;
            padding-bottom: 10px;
        }
        h3 {
            color: #5c6bc0;
            font-size: 1.4em;
            margin-top: 30px;
        }
        h4 {
            color: #7986cb;
            font-size: 1.1em;
            margin-top: 20px;
        }
        a {
            color: #1976d2;
            text-decoration: none;
        }
        a:hover {
            text-decoration: underline;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        table th {
            background: #3f51b5;
            color: white;
            padding: 12px;
            text-align: left;
        }
        table td {
            padding: 10px;
            border: 1px solid #ddd;
        }
        table tr:nth-child(even) {
            background: #f5f5f5;
        }
        .key-points {
            background: #fff3e0;
            border-left: 4px solid #ff9800;
            padding: 15px 20px;
            margin: 20px 0;
            border-radius: 4px;
        }
        .case-study {
            background: #e3f2fd;
            border-left: 4px solid #2196f3;
            padding: 15px 20px;
            margin: 20px 0;
            border-radius: 4px;
        }
        .tip-box {
            background: #f1f8e9;
            border-left: 4px solid #8bc34a;
            padding: 15px 20px;
            margin: 20px 0;
            border-radius: 4px;
        }
        .warning-box {
            background: #ffebee;
            border-left: 4px solid #f44336;
            padding: 15px 20px;
            margin: 20px 0;
            border-radius: 4px;
        }
        .cta-box {
            background: #fff8e1;
            border: 2px solid #ffc107;
            padding: 20px;
            margin: 30px 0;
            border-radius: 8px;
            text-align: center;
        }
        ul, ol {
            margin: 15px 0;
            padding-left: 30px;
        }
        li {
            margin: 8px 0;
        }
        p {
            margin: 15px 0;
        }
        strong {
            color: #d32f2f;
            font-weight: 600;
        }
    </style>
</head>
<body>

<div class="container">

<div class="meta">
    <strong>📄 ARTICLE COMPLET - GPT-5.1 (sections DB)</strong><br>
    Job ID: ${jobId}<br>
    Sections: ${sections.length}<br>
    Mots: ~${totalWords}<br>
    Généré localement: ${new Date(generatedAt).toLocaleString('fr-FR')}
</div>

${sections.map((section, i) => `<!-- ========== SECTION ${i + 1}: ${section.title || section.id} ========== -->\n${section.html}`).join('\n\n')}

</div>

</body>
</html>`;

  const filename = `ARTICLE_${jobId}.html`;
  fs.writeFileSync(filename, html, 'utf8');
  console.log(`✅ HTML généré: ${filename}`);
  console.log(`   Taille: ${Math.round(html.length / 1024)} KB`);
  console.log('➡️  Ouvrez ce fichier dans votre navigateur pour le vérifier.');
}

(async () => {
  try {
    await downloadArticle();
  } catch (err) {
    console.error('❌ Erreur:', err?.message || err);
    process.exit(1);
  }
})();
