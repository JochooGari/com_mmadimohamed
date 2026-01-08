// Execute SQL to create articles_content table in Supabase
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
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

// SQL from migration file
const SQL = `
-- Create table for storing article sections (sectional generation approach)
CREATE TABLE IF NOT EXISTS articles_content (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id TEXT NOT NULL,
  section_index INTEGER NOT NULL,
  section_id TEXT,
  section_title TEXT,
  content JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(job_id, section_index)
);

-- Index for fast lookups by job_id
CREATE INDEX IF NOT EXISTS idx_articles_content_job_id ON articles_content(job_id);

-- Index for ordering by section_index
CREATE INDEX IF NOT EXISTS idx_articles_content_job_section ON articles_content(job_id, section_index);
`;

async function createTable() {
  console.log('🏗️  Creating articles_content table in Supabase...\n');

  try {
    // Try using Supabase REST API for SQL execution
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      },
      body: JSON.stringify({ query: SQL })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    }

    console.log('✅ Table articles_content créée avec succès!');
    console.log('✅ Indexes créés');
    console.log('\nVérification...');

    // Verify table exists
    const { data, error } = await supabase
      .from('articles_content')
      .select('count')
      .limit(1);

    if (error) {
      console.log(`⚠️  Vérification échouée: ${error.message}`);
      console.log('\n📝 Veuillez exécuter manuellement le SQL dans Supabase Dashboard:');
      console.log('   1. https://supabase.com/dashboard → votre projet → SQL Editor');
      console.log('   2. Coller le SQL depuis: magicpath-project/supabase/migrations/create_articles_content.sql');
    } else {
      console.log('✅ Table vérifiée et accessible!');
    }

  } catch (error) {
    console.error(`❌ Erreur: ${error.message}`);
    console.log('\n📝 Veuillez exécuter manuellement le SQL dans Supabase Dashboard:');
    console.log('   1. https://supabase.com/dashboard → votre projet → SQL Editor');
    console.log('   2. Coller le SQL depuis: magicpath-project/supabase/migrations/create_articles_content.sql');
  }
}

createTable().catch(console.error);
