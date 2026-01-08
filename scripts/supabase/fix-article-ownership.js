// Fix article ownership - assign to your user
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './magicpath-project/.env.local' });

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE || process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function fixOwnership() {
  console.log('🔍 Recherche de votre utilisateur...\n');

  // Find user by email
  const { data: users, error: userError } = await supabase.auth.admin.listUsers();

  if (userError) {
    console.error('❌ Erreur recherche utilisateur:', userError.message);
    return;
  }

  const user = users.users.find(u => u.email === 'marketingb3dconsulting@gmail.com');

  if (!user) {
    console.log('⚠️  Utilisateur non trouvé avec cet email');
    console.log('   Utilisateurs disponibles:');
    users.users.forEach(u => console.log(`   - ${u.email} (ID: ${u.id})`));
    return;
  }

  console.log(`✅ Utilisateur trouvé:`);
  console.log(`   Email: ${user.email}`);
  console.log(`   ID: ${user.id}\n`);

  // Find the article we just created (most recent)
  const { data: articles, error: articleError } = await supabase
    .from('articles')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5);

  if (articleError) {
    console.error('❌ Erreur recherche article:', articleError.message);
    return;
  }

  console.log(`📋 Derniers articles:\n`);
  articles.forEach((a, i) => {
    console.log(`${i + 1}. ${a.title}`);
    console.log(`   ID: ${a.id}`);
    console.log(`   Author ID: ${a.author_id || '(null)'}`);
    console.log(`   Créé: ${a.created_at}\n`);
  });

  // Update the most recent article (the one we created)
  const articleToUpdate = articles[0];

  console.log(`🔧 Attribution de l'article à votre utilisateur...\n`);

  const { data: updated, error: updateError } = await supabase
    .from('articles')
    .update({ author_id: user.id })
    .eq('id', articleToUpdate.id)
    .select();

  if (updateError) {
    console.error('❌ Erreur de mise à jour:', updateError.message);
    return;
  }

  console.log('✅ Article mis à jour avec succès!');
  console.log(`   Article: ${updated[0].title}`);
  console.log(`   Author ID: ${updated[0].author_id}`);
  console.log('\n🌐 Rafraîchissez https://www.mmadimohamed.fr/admin/articles');
}

fixOwnership().catch(console.error);
