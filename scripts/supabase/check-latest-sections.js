// Check latest sections created in Supabase
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './magicpath-project/.env.local' });

const supabase = createClient(
  process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE || process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkLatest() {
  console.log('📋 Checking latest sections in Supabase...\n');

  const { data, error } = await supabase
    .from('articles_content')
    .select('job_id, section_index, section_title, created_at')
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) {
    console.error('❌ Error:', error.message);
    return;
  }

  if (!data || data.length === 0) {
    console.log('⚠️  No sections found in database');
    return;
  }

  console.log(`✅ Found ${data.length} recent sections:\n`);

  data.forEach((section, i) => {
    console.log(`${i + 1}. Job: ${section.job_id}`);
    console.log(`   Section ${section.section_index}: ${section.section_title}`);
    console.log(`   Created: ${section.created_at}\n`);
  });
}

checkLatest().catch(console.error);
