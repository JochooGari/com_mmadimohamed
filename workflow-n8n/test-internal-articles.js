// Test Supabase articles query
const https = require('https');

const url = 'https://xroduivvgnviqjdvehuw.supabase.co/rest/v1/articles?select=id,title,slug,excerpt&published=eq.true&order=created_at.desc&limit=8';

const options = {
  hostname: 'xroduivvgnviqjdvehuw.supabase.co',
  path: '/rest/v1/articles?select=id,title,slug,excerpt&published=eq.true&order=created_at.desc&limit=8',
  method: 'GET',
  headers: {
    'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhyb2R1aXZ2Z252aXFqZHZlaHV3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDg1Njg5NywiZXhwIjoyMDY2NDMyODk3fQ.lJe0rcdAJYdS4VjcR5IV_kqA9lEUJoWq8VKsSD5EUV0',
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhyb2R1aXZ2Z252aXFqZHZlaHV3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDg1Njg5NywiZXhwIjoyMDY2NDMyODk3fQ.lJe0rcdAJYdS4VjcR5IV_kqA9lEUJoWq8VKsSD5EUV0'
  }
};

console.log('🧪 Test Supabase - Get Internal Articles');
console.log('='.repeat(60));

const req = https.request(options, (res) => {
  console.log(`📊 Status: ${res.statusCode}\n`);

  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    try {
      const articles = JSON.parse(data);

      if (Array.isArray(articles)) {
        console.log(`✅ Trouvé ${articles.length} articles publiés:\n`);
        articles.forEach((a, i) => {
          console.log(`${i + 1}. ${a.title}`);
          console.log(`   Slug: /articles/${a.slug}`);
          console.log(`   Excerpt: ${(a.excerpt || '').substring(0, 80)}...\n`);
        });

        if (articles.length === 0) {
          console.log('⚠️  Aucun article publié trouvé.');
          console.log('💡 Le workflow continuera sans liens internes.\n');
        }
      } else {
        console.log('⚠️  Réponse non-array:', articles);
      }
    } catch (e) {
      console.error('❌ Erreur JSON:', e.message);
      console.log('Données brutes:', data);
    }
    console.log('='.repeat(60));
  });
});

req.on('error', (e) => console.error(`❌ Erreur: ${e.message}`));
req.end();
