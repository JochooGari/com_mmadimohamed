#!/usr/bin/env node
require('dotenv').config({ path: './magicpath-project/.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkArticle() {
  const jobId = 'job_1763863415450_';

  console.log(`🔍 Analyse de l'article ${jobId}\n`);
  console.log('='.repeat(80));

  const { data, error } = await supabase
    .from('articles_content')
    .select('*')
    .eq('job_id', jobId)
    .single();

  if (error) {
    console.error('❌ Erreur:', error);
    return;
  }

  const html = data.content?.html || '';
  const wordCount = html.split(/\s+/).length;
  const isComplete = html.includes('</article>');
  const lastChars = html.slice(-200);

  console.log('\n📊 ANALYSE:');
  console.log('  Job ID:', data.job_id);
  console.log('  Titre:', data.section_title);
  console.log('  Section Index:', data.section_index);
  console.log('  Nombre de mots:', wordCount);
  console.log('  HTML complet (balise </article>):', isComplete ? '✅ OUI' : '❌ NON - TRONQUÉ');
  console.log('  Score:', data.content?.score || 'N/A');
  console.log('\n📝 Derniers 200 caractères:');
  console.log(lastChars);
  console.log('\n');

  // Check si c'est un problème de JSON Schema
  console.log('🔍 Structure du content:');
  console.log('  Type:', typeof data.content);
  console.log('  Clés:', Object.keys(data.content || {}).join(', '));

  if (data.content?.improvedHTML) {
    console.log('\n⚠️  PROBLÈME DÉTECTÉ: Le champ s\'appelle "improvedHTML" au lieu de "html"');
    console.log('  Longueur improvedHTML:', data.content.improvedHTML.length);
    console.log('  Est complet:', data.content.improvedHTML.includes('</article>') ? 'OUI' : 'NON');
  }
}

checkArticle();
