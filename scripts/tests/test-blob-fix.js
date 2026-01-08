// Test isolé pour valider le fix du Blob encoding
// Vérifie que les gros contenus avec accents passent bien

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

// Simuler exactement ce que GPT-5.1 génère
const testContent = JSON.stringify({
  sections: [
    {
      id: "intro",
      title: "Introduction à l'Architecture Microservices",
      html: "<h2>Voilà des accents: é è à ù ç ê î ô û</h2>" + "<p>".repeat(500) + "Test de contenu long avec accents français répété. " + "é".repeat(100) + "</p>".repeat(500)
    },
    {
      id: "section2",
      title: "Déploiement et Scalabilité",
      html: "<h3>Stratégies de déploiement</h3>" + "<p>".repeat(500) + "Contenu technique avec caractères spéciaux: €, ©, ®, °, ±, ×, ÷" + "</p>".repeat(500)
    },
    {
      id: "section3",
      title: "Études de cas réels",
      html: "<div class='case-study'>" + "<p>".repeat(300) + "Étude approfondie avec données françaises: 15 000€, +25%, amélioration significative" + "</p>".repeat(300) + "</div>"
    }
  ],
  metadata: {
    totalWords: 5000,
    generatedAt: new Date().toISOString(),
    encoding: "UTF-8",
    specialChars: "éèàùçêîôû€©®°±×÷"
  }
});

async function testBlobFix() {
  console.log('🧪 TEST BLOB ENCODING FIX\n');
  console.log('=' .repeat(50));

  // 1. Informations sur le contenu
  console.log('\n📊 CONTENU ORIGINAL:');
  console.log(`   - Longueur (chars): ${testContent.length}`);
  console.log(`   - Taille estimée (UTF-8): ~${Buffer.from(testContent, 'utf-8').length} bytes`);
  console.log(`   - Contient accents: ${/[éèàùçêîôû]/.test(testContent) ? '✅' : '❌'}`);
  console.log(`   - Contient caractères spéciaux: ${/[€©®]/.test(testContent) ? '✅' : '❌'}`);

  // 2. Test avec OLD METHOD (Blob) - pour comparaison
  console.log('\n\n🔴 TEST OLD METHOD (new Blob):');
  try {
    const oldBlob = new Blob([testContent]);
    const oldBytes = await oldBlob.text();
    console.log(`   - Blob.text() length: ${oldBytes.length} chars`);
    console.log(`   - Match avec original: ${oldBytes === testContent ? '✅' : '❌'}`);

    if (oldBytes !== testContent) {
      console.log(`   - ⚠️  PERTE: ${testContent.length - oldBytes.length} caractères!`);
    }
  } catch (e) {
    console.log(`   - ❌ Erreur: ${e.message}`);
  }

  // 3. Test avec NEW METHOD (Buffer/TextEncoder)
  console.log('\n\n🟢 TEST NEW METHOD (Buffer/TextEncoder):');
  const bytes = typeof Buffer !== 'undefined'
    ? Buffer.from(testContent, 'utf-8')
    : new TextEncoder().encode(testContent);

  console.log(`   - Runtime détecté: ${typeof Buffer !== 'undefined' ? 'Node.js (Buffer)' : 'Edge (TextEncoder)'}`);
  console.log(`   - Bytes length: ${bytes.byteLength || bytes.length}`);

  // 4. Upload vers Supabase
  console.log('\n\n📤 UPLOAD VERS SUPABASE:');
  const testPath = 'test/blob-fix-validation.json';

  try {
    const { data, error } = await supabase.storage
      .from('agents')
      .upload(testPath, bytes, {
        upsert: true,
        contentType: 'application/json',
        cacheControl: '3600'
      });

    if (error) {
      console.log(`   - ❌ Upload failed: ${error.message}`);
      return;
    }

    console.log(`   - ✅ Upload réussi: ${testPath}`);
    console.log(`   - Path: ${data.path}`);
  } catch (e) {
    console.log(`   - ❌ Exception: ${e.message}`);
    return;
  }

  // 5. Download et vérification
  console.log('\n\n📥 DOWNLOAD ET VÉRIFICATION:');

  await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2s for Supabase

  try {
    const { data: downloadData, error: downloadError } = await supabase.storage
      .from('agents')
      .download(testPath);

    if (downloadError) {
      console.log(`   - ❌ Download failed: ${downloadError.message}`);
      return;
    }

    const downloadedText = await downloadData.text();
    console.log(`   - Downloaded length: ${downloadedText.length} chars`);
    console.log(`   - Original length: ${testContent.length} chars`);

    // Comparaison détaillée
    const lengthMatch = downloadedText.length === testContent.length;
    const contentMatch = downloadedText === testContent;

    console.log(`\n   📊 RÉSULTATS:`);
    console.log(`   - Length match: ${lengthMatch ? '✅' : '❌'}`);
    console.log(`   - Content match: ${contentMatch ? '✅' : '❌'}`);

    if (!lengthMatch) {
      const diff = testContent.length - downloadedText.length;
      console.log(`   - ⚠️  DIFFÉRENCE: ${diff} caractères ${diff > 0 ? 'perdus' : 'ajoutés'}`);
    }

    // Test de parsing JSON
    console.log(`\n   🔍 TEST JSON PARSING:`);
    try {
      const parsed = JSON.parse(downloadedText);
      console.log(`   - ✅ JSON valide`);
      console.log(`   - Sections: ${parsed.sections?.length || 0}`);
      console.log(`   - Accents préservés: ${/[éèàùçêîôû]/.test(downloadedText) ? '✅' : '❌'}`);
    } catch (e) {
      console.log(`   - ❌ JSON invalide: ${e.message}`);
    }

    // Verdict final
    console.log('\n\n' + '='.repeat(50));
    if (lengthMatch && contentMatch) {
      console.log('✅ 🎉 TEST RÉUSSI! Le fix fonctionne parfaitement!');
      console.log('✅ Pas de troncation, pas de perte de caractères');
      console.log('✅ Prêt pour déploiement en production');
    } else {
      console.log('❌ TEST ÉCHOUÉ! Il reste un problème...');
      console.log('❌ Vérifier l\'implémentation de put()');
    }
    console.log('='.repeat(50));

  } catch (e) {
    console.log(`   - ❌ Exception: ${e.message}`);
  }
}

testBlobFix().catch(console.error);
