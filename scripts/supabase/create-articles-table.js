// Create articles_content table in Supabase
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
  console.log('🏗️  Creating articles_content table...\n');

  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql: SQL });

    if (error) {
      // Try direct query if RPC doesn't exist
      console.log('⚠️  RPC not found, trying direct execution...');

      // Execute line by line
      const statements = SQL.split(';').filter(s => s.trim());

      for (const stmt of statements) {
        if (!stmt.trim()) continue;
        console.log(`Executing: ${stmt.trim().substring(0, 50)}...`);

        const { error: stmtError } = await supabase.from('_sql').select('*').limit(0);
        if (stmtError) {
          console.log(`  ⚠️  ${stmtError.message}`);
        }
      }

      console.log('\n❌ Cannot execute SQL directly via Supabase client.');
      console.log('📝 Please run the SQL manually in Supabase Dashboard:');
      console.log('   1. Go to https://supabase.com/dashboard/project/YOUR_PROJECT/editor');
      console.log('   2. Open SQL Editor');
      console.log('   3. Copy/paste the SQL from: magicpath-project/supabase/migrations/create_articles_content.sql');
      console.log('   4. Click "Run"');

      return;
    }

    console.log('✅ Table created successfully!');
    console.log(`   Result: ${JSON.stringify(data)}`);

  } catch (e) {
    console.error('❌ Error:', e.message);
    console.log('\n📝 Please run the SQL manually in Supabase Dashboard (see instructions above)');
  }
}

createTable().catch(console.error);
