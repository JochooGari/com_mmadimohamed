require('dotenv').config({ path: 'magicpath-project/.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log('🔑 URL:', supabaseUrl);
console.log('🔑 Key présente:', supabaseKey ? 'OUI' : 'NON');

const supabase = createClient(supabaseUrl, supabaseKey);

(async () => {
  console.log('🔍 Vérification utilisateur: marketingb3dconsulting@gmail.com\n');

  // Note: Avec anon key, on ne peut pas lister tous les users
  // On va vérifier directement avec une tentative de connexion ou via profiles
  console.log('ℹ️  Vérification via table profiles (anon key ne permet pas auth.admin)');

  // Vérifier dans la table profiles
  const { data: profiles, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('email', 'marketingb3dconsulting@gmail.com');

  if (!profileError && profiles && profiles.length > 0) {
    console.log('\n✅ Profil trouvé dans table profiles:');
    console.log(JSON.stringify(profiles[0], null, 2));
  } else {
    console.log('\n❌ Aucun profil dans table profiles');
    if (profileError) console.error('   Erreur:', profileError.message);
  }

  // Vérifier les articles de cet utilisateur
  if (profiles && profiles.length > 0) {
    const userId = profiles[0].id;
    const { data: articles, error: articlesError } = await supabase
      .from('articles')
      .select('id, title, slug, published, author_id')
      .eq('author_id', userId)
      .limit(5);

    if (!articlesError && articles && articles.length > 0) {
      console.log('\n📝 Articles de cet utilisateur:', articles.length);
      articles.forEach(a => {
        console.log(`   - ${a.title} (${a.slug}) - ${a.published ? 'Publié' : 'Brouillon'}`);
      });
    } else {
      console.log('\n📝 Aucun article trouvé pour cet utilisateur');
      if (articlesError) console.error('   Erreur:', articlesError.message);
    }

    // Vérifier tous les articles de la base
    const { data: allArticles, error: allError } = await supabase
      .from('articles')
      .select('id, title, author_id')
      .limit(10);

    if (!allError && allArticles) {
      console.log('\n📊 Total articles dans la base:', allArticles.length);
      console.log('   Author IDs présents:');
      const uniqueAuthors = [...new Set(allArticles.map(a => a.author_id))];
      uniqueAuthors.forEach(aid => {
        const count = allArticles.filter(a => a.author_id === aid).length;
        console.log(`   - ${aid}: ${count} article(s)`);
      });
    }
  }
})();
