// Check if article exists in public.articles table
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './magicpath-project/.env.local' });

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE || process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false }
});

const JOB_ID = process.argv[2] || 'job_1763724240781_tj0og4';

async function checkArticle() {
  console.log(`🔍 Recherche de l'article pour job: ${JOB_ID}\n`);

  // Check in public.articles table
  const { data: articles, error } = await supabase
    .from('articles')
    .select('*')
    .or(`id.eq.${JOB_ID},job_id.eq.${JOB_ID},slug.ilike.%${JOB_ID}%`)
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) {
    console.error('❌ Erreur:', error.message);
    return;
  }

  console.log(`📊 Résultats de la requête (${articles?.length || 0} articles):\n`);

  if (!articles || articles.length === 0) {
    console.log('⚠️  Aucun article trouvé dans public.articles');
    console.log('\n💡 Cela signifie que saveArticleRecord() n\'a pas été exécuté ou a échoué');
    console.log('   Vérifiez les logs Vercel pour voir les erreurs potentielles\n');

    // Check all recent articles
    console.log('📋 Listing des 5 derniers articles dans la table:');
    const { data: recent } = await supabase
      .from('articles')
      .select('id, title, slug, status, created_at')
      .order('created_at', { ascending: false })
      .limit(5);

    if (recent && recent.length > 0) {
      recent.forEach((art, i) => {
        console.log(`   ${i + 1}. ${art.title || '(sans titre)'}`);
        console.log(`      ID: ${art.id} | Slug: ${art.slug} | Status: ${art.status}`);
        console.log(`      Créé: ${art.created_at}\n`);
      });
    } else {
      console.log('   ⚠️  Aucun article dans la table\n');
    }
  } else {
    articles.forEach((art, i) => {
      console.log(`\n📄 Article ${i + 1}:`);
      console.log(`   ID: ${art.id}`);
      console.log(`   Job ID: ${art.job_id || '(non défini)'}`);
      console.log(`   Title: ${art.title || '(sans titre)'}`);
      console.log(`   Slug: ${art.slug || '(sans slug)'}`);
      console.log(`   Status: ${art.status}`);
      console.log(`   Author ID: ${art.author_id || '(non défini)'}`);
      console.log(`   Created: ${art.created_at}`);
      console.log(`   Updated: ${art.updated_at}`);
      console.log(`   Content length: ${art.content?.length || 0} chars`);
      console.log(`   HTML length: ${art.html?.length || 0} chars`);
    });
    console.log('\n✅ Article(s) trouvé(s) dans la base de données');
  }
}

checkArticle().catch(console.error);
