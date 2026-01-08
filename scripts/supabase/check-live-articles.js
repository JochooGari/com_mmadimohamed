// Check articles on live site
const https = require('https');

function checkArticles() {
  const options = {
    hostname: 'www.mmadimohamed.fr',
    path: '/api/articles',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  };

  const req = https.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      try {
        const articles = JSON.parse(data);
        console.log(`📊 Articles trouvés sur le site: ${articles.length || 0}\n`);

        if (articles && articles.length > 0) {
          articles.slice(0, 10).forEach((a, i) => {
            console.log(`${i + 1}. ${a.title}`);
            console.log(`   Slug: ${a.slug}`);
            console.log(`   Status: ${a.published ? '✅ Publié' : '📝 Brouillon'}`);
            console.log(`   Créé: ${a.created_at}\n`);
          });
        } else {
          console.log('⚠️  Aucun article trouvé');
        }
      } catch (e) {
        console.log('Réponse brute:', data.slice(0, 500));
        console.error('Erreur de parsing:', e.message);
      }
    });
  });

  req.on('error', (e) => {
    console.error('Erreur de requête:', e.message);
  });

  req.end();
}

checkArticles();
