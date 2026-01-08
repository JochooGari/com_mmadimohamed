// Check articles table structure
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './magicpath-project/.env.local' });

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE || process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function checkStructure() {
  console.log('🔍 Vérification de la structure de la table articles\n');

  // Get one article to see structure
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .limit(1);

  if (error) {
    console.error('❌ Erreur:', error.message);
    return;
  }

  if (!data || data.length === 0) {
    console.log('⚠️  La table articles est vide\n');

    // Try to get table info from pg_catalog (requires superuser)
    console.log('💡 Colonnes probables basées sur l\'UI visible:');
    console.log('   - id (UUID)');
    console.log('   - title (text)');
    console.log('   - slug (text)');
    console.log('   - content (text or jsonb)');
    console.log('   - html (text)');
    console.log('   - status (text: draft, published, etc.)');
    console.log('   - author_id (UUID)');
    console.log('   - created_at (timestamp)');
    console.log('   - updated_at (timestamp)\n');
  } else {
    console.log('✅ Structure de la table articles:\n');
    const article = data[0];
    Object.keys(article).forEach(key => {
      const value = article[key];
      const type = typeof value;
      const preview = value ? String(value).slice(0, 50) : '(null)';
      console.log(`   ${key}: ${type} = ${preview}...`);
    });
  }

  // Count total articles
  const { count } = await supabase
    .from('articles')
    .select('*', { count: 'exact', head: true });

  console.log(`\n📊 Total d'articles dans la table: ${count || 0}`);
}

checkStructure().catch(console.error);
