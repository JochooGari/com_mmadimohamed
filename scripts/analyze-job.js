// Download and analyze job from Supabase
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './magicpath-project/.env.local' });

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE || process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false }
});

const JOB_ID = process.argv[2] || 'job_1763666425454_y59u3s';

async function analyzeJob() {
  console.log(`🔍 ANALYSE DU JOB: ${JOB_ID}\n`);
  console.log('='.repeat(70));

  // Download job from Storage
  const { data, error } = await supabase.storage
    .from('agents')
    .download(`geo/jobs/${JOB_ID}.json`);

  if (error) {
    console.error(`❌ Erreur: ${error.message}`);
    return;
  }

  const jobText = await data.text();
  const job = JSON.parse(jobText);

  console.log(`\n📊 STATUT DU JOB:`);
  console.log(`   Status: ${job.status}`);
  console.log(`   Current step: ${job.currentStep}`);
  console.log(`   Next step: ${job.nextStep || 'N/A'}`);
  console.log(`   Created: ${job.createdAt}`);
  console.log(`   Updated: ${job.updatedAt}`);

  if (job.error) {
    console.log(`\n❌ ERREUR: ${job.error}`);
  }

  console.log(`\n📝 LOGS (${job.logs?.length || 0} entrées):`);
  if (job.logs && job.logs.length > 0) {
    job.logs.forEach((log, i) => {
      console.log(`\n   ${i + 1}. STEP: ${log.step}`);
      console.log(`      Model: ${log.model || 'N/A'}`);
      console.log(`      Finish reason: ${log.finish_reason || 'N/A'}`);
      if (log.usage) {
        console.log(`      Tokens: prompt=${log.usage.prompt_tokens}, completion=${log.usage.completion_tokens}`);
      }
      if (log.error) {
        console.log(`      ❌ ERROR: ${log.error}`);
      }
    });
  }

  // Check sections in DB
  console.log(`\n\n🔍 SECTIONS DANS LA BASE DE DONNÉES:`);
  const { data: sections, error: sectionsError } = await supabase
    .from('articles_content')
    .select('*')
    .eq('job_id', JOB_ID)
    .order('section_index', { ascending: true });

  if (sectionsError) {
    console.error(`   ❌ Erreur: ${sectionsError.message}`);
  } else if (!sections || sections.length === 0) {
    console.log(`   ⚠️  Aucune section trouvée`);
  } else {
    console.log(`   ✅ ${sections.length} sections trouvées:`);
    sections.forEach(s => {
      const htmlSize = (s.content?.html || '').length;
      console.log(`      ${s.section_index}. ${s.section_title || s.section_id}: ${htmlSize} chars`);
    });
  }

  // Check verification metadata
  if (job.verification) {
    console.log(`\n\n📊 VERIFICATION METADATA:`);
    console.log(`   Sections generated: ${job.verification.sectionsGenerated || 'N/A'}`);
    console.log(`   HTML size: ${job.verification.htmlSize || 'N/A'}`);
    console.log(`   Generation method: ${job.verification.generationMethod || 'N/A'}`);
  }

  console.log('\n' + '='.repeat(70));
}

analyzeJob().catch(err => {
  console.error('❌ Erreur:', err.message);
  process.exit(1);
});
