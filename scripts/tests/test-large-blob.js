// Test avec GROS contenu (20KB+) - Taille réelle du problème
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './magicpath-project/.env.local' });

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE || process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false }
});

// Générer un contenu de 25KB+ avec accents (comme le vrai workflow)
const generateLargeContent = () => {
  const sections = [];

  for (let i = 0; i < 8; i++) {
    sections.push({
      id: `section-${i}`,
      title: `Section ${i}: Architecture et Déploiement Microservices`,
      html: `<h2>Titre avec accents: é è à ù ç</h2>
      <p>${'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Voilà des données françaises avec accents: déploiement, sécurité, amélioration, stratégie, évaluation. '.repeat(200)}</p>
      <div class="key-points">
        <ul>${'<li>Point important avec caractères spéciaux: €, ©, ®</li>'.repeat(50)}</ul>
      </div>
      <table>
        <tr><th>Métrique</th><th>Valeur</th></tr>
        ${'<tr><td>Performance</td><td>+25%</td></tr>'.repeat(30)}
      </table>
      <div class="cta-box">
        <strong>Découvrez nos solutions de déploiement cloud</strong>
      </div>`
    });
  }

  return JSON.stringify({ sections });
};

async function testLargeBlob() {
  const content = generateLargeContent();

  console.log('🧪 TEST AVEC GROS CONTENU (Réel)\n');
  console.log('='.repeat(60));
  console.log(`📊 Taille: ${content.length} chars (~${Math.round(content.length / 1024)} KB)`);
  console.log(`📊 Bytes UTF-8: ${Buffer.from(content, 'utf-8').length}`);

  // Test OLD vs NEW
  console.log('\n🔴 OLD METHOD (Blob):');
  const oldBlob = new Blob([content]);
  const oldText = await oldBlob.text();
  console.log(`   Length: ${oldText.length} (${oldText === content ? '✅ OK' : '❌ TRONQUÉ'})`);

  console.log('\n🟢 NEW METHOD (Buffer):');
  const newBytes = Buffer.from(content, 'utf-8');
  console.log(`   Bytes: ${newBytes.length}`);

  // Upload OLD
  console.log('\n📤 Upload OLD (Blob):');
  try {
    await supabase.storage
      .from('agents')
      .upload('test/large-blob-old.json', oldBlob, { upsert: true, contentType: 'application/json' });
    console.log('   ✅ Uploaded');

    await new Promise(r => setTimeout(r, 2000));

    const { data } = await supabase.storage.from('agents').download('test/large-blob-old.json');
    const downloaded = await data.text();
    console.log(`   Downloaded: ${downloaded.length} chars`);
    console.log(`   Match: ${downloaded === content ? '✅' : '❌'}`);

    if (downloaded !== content) {
      console.log(`   ⚠️  PERTE: ${content.length - downloaded.length} chars`);

      try {
        JSON.parse(downloaded);
        console.log('   ✅ JSON encore valide (mais incomplet)');
      } catch (e) {
        console.log(`   ❌ JSON INVALIDE: ${e.message}`);
      }
    }
  } catch (e) {
    console.log(`   ❌ Erreur: ${e.message}`);
  }

  // Upload NEW
  console.log('\n📤 Upload NEW (Buffer):');
  try {
    await supabase.storage
      .from('agents')
      .upload('test/large-blob-new.json', newBytes, { upsert: true, contentType: 'application/json' });
    console.log('   ✅ Uploaded');

    await new Promise(r => setTimeout(r, 2000));

    const { data } = await supabase.storage.from('agents').download('test/large-blob-new.json');
    const downloaded = await data.text();
    console.log(`   Downloaded: ${downloaded.length} chars`);
    console.log(`   Match: ${downloaded === content ? '✅' : '❌'}`);

    if (downloaded === content) {
      console.log('   ✅ JSON COMPLET ET VALIDE');
    }
  } catch (e) {
    console.log(`   ❌ Erreur: ${e.message}`);
  }

  console.log('\n' + '='.repeat(60));
}

testLargeBlob().catch(console.error);
