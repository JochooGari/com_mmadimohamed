require('dotenv').config({ path: 'magicpath-project/.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

(async () => {
  console.log('🔍 Diagnostic complet\n');

  // Test 1: Vérifier la table articles
  console.log('📋 Test 1: Table articles');
  const { data: articles, error: articlesError } = await supabase
    .from('articles')
    .select('id, title, author_id, published')
    .limit(5);

  if (articlesError) {
    console.log('   ❌ Erreur:', articlesError.message);
  } else {
    console.log('   ✅ Table accessible, articles trouvés:', articles?.length || 0);
    if (articles && articles.length > 0) {
      console.log('   Premier article:', articles[0]);
    }
  }

  // Test 2: Vérifier la table articles_content
  console.log('\n📋 Test 2: Table articles_content');
  const { data: content, error: contentError } = await supabase
    .from('articles_content')
    .select('job_id, section_title')
    .limit(3);

  if (contentError) {
    console.log('   ❌ Erreur:', contentError.message);
  } else {
    console.log('   ✅ Table accessible, sections trouvées:', content?.length || 0);
  }

  // Test 3: Essayer de se connecter avec l'utilisateur
  console.log('\n👤 Test 3: Tentative de connexion');
  console.log('   Email: marketingb3dconsulting@gmail.com');
  console.log('   Note: Ce test ne fonctionnera que si le mot de passe est connu');

  // Test 4: Vérifier si on peut lister les users (probablement non avec anon key)
  console.log('\n🔐 Test 4: Permissions auth');
  const { data: session } = await supabase.auth.getSession();
  console.log('   Session active:', session?.session ? 'OUI' : 'NON');

  // Suggestion de diagnostic
  console.log('\n💡 Diagnostic:');
  console.log('   1. Je n\'ai PAS modifié les tables Supabase');
  console.log('   2. J\'ai seulement créé des composants React (BetaEditorLayout, ScorePanel, etc.)');
  console.log('   3. Le problème pourrait venir de:');
  console.log('      - Mot de passe oublié');
  console.log('      - Email non confirmé');
  console.log('      - Problème côté Supabase auth');
  console.log('      - RLS (Row Level Security) activé');
  console.log('\n📝 Actions suggérées:');
  console.log('   1. Va sur Supabase Dashboard → Authentication → Users');
  console.log('   2. Cherche marketingb3dconsulting@gmail.com');
  console.log('   3. Vérifie le statut (actif/confirmé)');
  console.log('   4. Si besoin, reset le mot de passe depuis le dashboard');
})();
