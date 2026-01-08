// List recent workflow jobs
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './magicpath-project/.env.local' });

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE || process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function listJobs() {
  console.log('📋 Listing 5 most recent workflow jobs...\n');

  const { data, error } = await supabase
    .from('workflow_jobs')
    .select('job_id, status, current_step, topic, created_at, updated_at')
    .order('created_at', { ascending: false })
    .limit(5);

  if (error) {
    console.error('❌ Error:', error.message);
    return;
  }

  data.forEach((job, i) => {
    console.log(`${i + 1}. ${job.job_id}`);
    console.log(`   Topic: ${job.topic || '(no topic)'}`);
    console.log(`   Status: ${job.status}`);
    console.log(`   Step: ${job.current_step}`);
    console.log(`   Created: ${job.created_at}`);
    console.log(`   Updated: ${job.updated_at}\n`);
  });
}

listJobs().catch(console.error);
