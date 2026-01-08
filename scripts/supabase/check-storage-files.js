// Check what files exist in Supabase Storage for a job
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './magicpath-project/.env.local' });

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE || process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false }
});

const JOB_ID = 'job_1763653473458_yj1kvs'; // With diagnostic logs

async function checkFiles() {
  console.log(`🔍 Checking files for job: ${JOB_ID}\n`);

  // List all files in geo/articles/ directory
  console.log('📁 Listing geo/articles/ directory...');
  const { data: files, error: listError } = await supabase.storage
    .from('agents')
    .list('geo/articles', { limit: 100, sortBy: { column: 'created_at', order: 'desc' } });

  if (listError) {
    console.error('❌ List error:', listError.message);
  } else {
    console.log(`✅ Found ${files.length} files in geo/articles/\n`);

    // Filter for our job
    const jobFiles = files.filter(f => f.name.startsWith(JOB_ID));
    console.log(`Files for ${JOB_ID}:`);
    if (jobFiles.length === 0) {
      console.log('  ❌ NO FILES FOUND!');
    } else {
      jobFiles.forEach(f => {
        console.log(`  ✅ ${f.name} - ${f.metadata?.size || '?'} bytes`);
      });
    }
  }

  // Try to download Part 1 directly
  console.log(`\n📥 Attempting to download Part 1...`);
  const { data: part1, error: part1Error } = await supabase.storage
    .from('agents')
    .download(`geo/articles/${JOB_ID}_part1.json`);

  if (part1Error) {
    console.error(`❌ Part 1 download failed: ${part1Error.message}`);
  } else {
    const text = await part1.text();
    console.log(`✅ Part 1 exists: ${text.length} bytes`);
    console.log(`   Preview: ${text.substring(0, 100)}`);
  }

  // Try to download Part 2 directly
  console.log(`\n📥 Attempting to download Part 2...`);
  const { data: part2, error: part2Error } = await supabase.storage
    .from('agents')
    .download(`geo/articles/${JOB_ID}_part2.json`);

  if (part2Error) {
    console.error(`❌ Part 2 download failed: ${part2Error.message}`);
  } else {
    const text = await part2.text();
    console.log(`✅ Part 2 exists: ${text.length} bytes`);
    console.log(`   Preview: ${text.substring(0, 100)}`);
  }
}

checkFiles().catch(console.error);
