// Script pour compter les mots d'un article depuis Supabase DB ou Storage
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './magicpath-project/.env.local' });

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Variables d\'environnement Supabase non définies');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false }
});

// Fonction pour compter les mots dans le HTML
function countWords(html) {
  if (!html) return 0;

  // Supprimer les balises HTML
  const text = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '') // Enlever scripts
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')   // Enlever styles
    .replace(/<[^>]+>/g, ' ')                          // Enlever toutes les balises
    .replace(/&nbsp;/g, ' ')                           // Remplacer &nbsp;
    .replace(/&[a-z]+;/gi, ' ')                        // Enlever entités HTML
    .replace(/\s+/g, ' ')                              // Normaliser espaces
    .trim();

  // Compter les mots (séparés par espaces)
  const words = text.split(/\s+/).filter(w => w.length > 0);
  return words.length;
}

async function countArticleWords(jobId) {
  console.log(`📊 Comptage des mots pour job: ${jobId}\n`);
  console.log('='.repeat(70));

  try {
    // 1. Essayer de récupérer depuis la DB (nouvelle méthode)
    console.log('\n🔍 Méthode 1: Récupération depuis articles_content (DB JSONB)...');
    const { data: sections, error: dbError } = await supabase
      .from('articles_content')
      .select('*')
      .eq('job_id', jobId)
      .order('section_index', { ascending: true });

    if (!dbError && sections && sections.length > 0) {
      console.log(`✅ Trouvé ${sections.length} sections dans la DB\n`);

      let totalWords = 0;
      const details = [];

      sections.forEach((section, idx) => {
        const html = section.content?.html || '';
        const words = countWords(html);
        totalWords += words;

        details.push({
          index: section.section_index,
          title: section.section_title || section.content?.title || 'Sans titre',
          words: words,
          chars: html.length
        });
      });

      // Affichage détaillé
      console.log('📝 DÉTAIL PAR SECTION:');
      console.log('-'.repeat(70));
      details.forEach(d => {
        console.log(`   Section ${d.index}: ${d.title}`);
        console.log(`   → ${d.words} mots | ${d.chars} chars`);
        console.log('');
      });

      console.log('='.repeat(70));
      console.log(`\n📊 TOTAL ARTICLE: ${totalWords} mots`);
      console.log(`   Minimum requis: 2000 mots`);

      if (totalWords >= 2000) {
        console.log(`   ✅ OBJECTIF ATTEINT (+${totalWords - 2000} mots)`);
      } else {
        console.log(`   ❌ OBJECTIF NON ATTEINT (manque ${2000 - totalWords} mots)`);
      }

      console.log('='.repeat(70));
      return;
    }

    // 2. Fallback: Essayer depuis Storage (ancienne méthode)
    console.log('⚠️  Aucune section trouvée dans la DB');
    console.log('\n🔍 Méthode 2: Récupération depuis Storage HTML...');

    const { data: htmlData, error: storageError } = await supabase.storage
      .from('agents')
      .download(`geo/articles/${jobId}.html`);

    if (storageError || !htmlData) {
      console.error(`❌ Fichier HTML non trouvé: ${storageError?.message || 'aucune donnée'}`);
      return;
    }

    const html = await htmlData.text();
    const totalWords = countWords(html);

    console.log('='.repeat(70));
    console.log(`\n📊 TOTAL ARTICLE: ${totalWords} mots`);
    console.log(`   Minimum requis: 2000 mots`);

    if (totalWords >= 2000) {
      console.log(`   ✅ OBJECTIF ATTEINT (+${totalWords - 2000} mots)`);
    } else {
      console.log(`   ❌ OBJECTIF NON ATTEINT (manque ${2000 - totalWords} mots)`);
    }

    console.log(`   HTML size: ${html.length} chars`);
    console.log('='.repeat(70));

  } catch (error) {
    console.error(`❌ Erreur: ${error.message}`);
  }
}

// Usage: node count-article-words.js JOB_ID
const jobId = process.argv[2] || 'job_1763656821143_54pw4a';
countArticleWords(jobId).catch(console.error);
