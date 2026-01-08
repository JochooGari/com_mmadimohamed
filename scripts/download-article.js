#!/usr/bin/env node
require('dotenv').config({ path: './magicpath-project/.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function downloadArticle(jobId) {
  console.log(`📥 Téléchargement de l'article: ${jobId}\n`);

  const { data, error } = await supabase
    .from('articles_content')
    .select('*')
    .eq('job_id', jobId)
    .order('section_index');

  if (error) {
    console.error('❌ Erreur:', error);
    return;
  }

  if (!data || data.length === 0) {
    console.log('❌ Aucun article trouvé');
    return;
  }

  console.log(`✅ Trouvé ${data.length} section(s)\n`);

  const article = data[0];
  const html = article.content?.html || 'Pas de HTML';
  const score = article.content?.score || 'N/A';

  console.log('📊 Métadonnées:');
  console.log('   Job ID:', article.job_id);
  console.log('   Titre:', article.section_title);
  console.log('   Score:', score);
  console.log('   Créé:', article.created_at);
  console.log('   Nombre de mots:', html.split(/\s+/).length);
  console.log('');
  console.log('📄 HTML:');
  console.log('='.repeat(80));
  console.log(html.substring(0, 2000));
  console.log('...');
  console.log('='.repeat(80));
  console.log('');
  console.log(`💾 Article complet sauvegardé dans: ARTICLE_${jobId}.html`);

  const fs = require('fs');
  fs.writeFileSync(`ARTICLE_${jobId}.html`, html);
}

const jobId = process.argv[2] || 'job_1763863415450_';
downloadArticle(jobId);
