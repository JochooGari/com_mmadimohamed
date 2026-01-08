// Analyze part1 from Supabase - check for truncation
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './magicpath-project/.env.local' });

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE || process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false }
});

const JOB_ID = 'job_1763653473458_yj1kvs';

async function analyzePart1() {
  console.log('🔍 ANALYSE DE PART 1\n');
  console.log('='.repeat(60));

  // Download part1
  const { data, error } = await supabase.storage
    .from('agents')
    .download(`geo/articles/${JOB_ID}_part1.json`);

  if (error) {
    console.error(`❌ Download failed: ${error.message}`);
    return;
  }

  const text = await data.text();

  console.log(`\n📊 TAILLE:`);
  console.log(`   Downloaded: ${text.length} chars`);
  console.log(`   Bytes (UTF-8): ${Buffer.from(text, 'utf-8').length}`);

  console.log(`\n📝 PREVIEW (first 500 chars):`);
  console.log(text.slice(0, 500));

  console.log(`\n📝 END (last 500 chars):`);
  console.log(text.slice(-500));

  // Check if valid JSON
  console.log(`\n✅ JSON VALIDITY:`);
  try {
    const parsed = JSON.parse(text);
    console.log(`   ✅ Valid JSON`);
    console.log(`   Sections: ${parsed.sections?.length || 0}`);

    if (parsed.sections) {
      parsed.sections.forEach((s, i) => {
        const htmlLength = (s.html || '').length;
        console.log(`   ${i + 1}. ${s.id || s.title}: ${htmlLength} chars`);
      });
    }
  } catch (e) {
    console.log(`   ❌ INVALID JSON: ${e.message}`);
    const match = e.message.match(/position (\d+)/);
    if (match) {
      const pos = parseInt(match[1]);
      console.log(`\n   🔎 ERROR AT POSITION ${pos}:`);
      console.log(`      Context: ...${text.slice(Math.max(0, pos - 100), Math.min(text.length, pos + 100))}...`);
    }
  }

  console.log('\n' + '='.repeat(60));
}

analyzePart1().catch(console.error);
