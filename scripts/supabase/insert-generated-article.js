// Insert generated article into public.articles table
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: './magicpath-project/.env.local' });

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE || process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const JOB_ID = process.argv[2] || 'job_1763724240781_tj0og4';

async function insertArticle() {
  console.log(`📝 Insertion de l'article pour job: ${JOB_ID}\n`);

  // Read the HTML file
  const htmlPath = path.join(__dirname, `ARTICLE_${JOB_ID}.html`);

  if (!fs.existsSync(htmlPath)) {
    console.error(`❌ Fichier HTML non trouvé: ${htmlPath}`);
    return;
  }

  const html = fs.readFileSync(htmlPath, 'utf-8');
  console.log(`✅ HTML chargé: ${html.length} caractères\n`);

  // Extract title from HTML (between <title> tags or first <h1>)
  const titleMatch = html.match(/<h1[^>]*>(.*?)<\/h1>/i);
  const title = titleMatch ? titleMatch[1].replace(/<[^>]+>/g, '').trim() : 'Article Généré par IA';

  // Generate slug
  const slug = title
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  console.log(`📌 Titre: ${title}`);
  console.log(`📌 Slug: ${slug}\n`);

  // Convert HTML to markdown content (simplified)
  const content_md = html
    .replace(/<[^>]+>/g, '') // Remove all HTML tags
    .replace(/\s+/g, ' ') // Normalize spaces
    .trim();

  // Insert into articles table
  const articleData = {
    slug: `${slug}-${Date.now()}`, // Add timestamp to ensure uniqueness
    title,
    excerpt: content_md.slice(0, 200) + '...',
    content_md: content_md.slice(0, 10000), // Limit to avoid too large
    published: false, // Draft by default
    tags: ['ia-generé', 'devops', 'automatisation']
  };

  console.log('📤 Insertion dans la base de données...\n');

  const { data, error } = await supabase
    .from('articles')
    .insert([articleData])
    .select();

  if (error) {
    console.error('❌ Erreur d\'insertion:', error.message);
    console.error('   Détails:', error);
    return;
  }

  console.log('✅ Article inséré avec succès!\n');
  console.log('📊 Détails de l\'article:');
  console.log(`   ID: ${data[0].id}`);
  console.log(`   Titre: ${data[0].title}`);
  console.log(`   Slug: ${data[0].slug}`);
  console.log(`   Status: ${data[0].published ? 'publié' : 'brouillon'}`);
  console.log(`   Créé: ${data[0].created_at}\n`);

  console.log(`🌐 Visible dans l'admin UI: https://com-mmadimohamed.vercel.app/admin/articles`);
}

insertArticle().catch(console.error);
