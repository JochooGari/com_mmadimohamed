// List recent jobs from Supabase Storage
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './magicpath-project/.env.local' });

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE || process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function listJobs() {
  console.log('📋 Listing recent jobs from Storage...\n');

  const { data, error } = await supabase.storage
    .from('agents')
    .list('geo/articles', { limit: 50, sortBy: { column: 'created_at', order: 'desc' } });

  if (error) {
    console.error('❌ Error:', error.message);
    return;
  }

  // Extract unique job IDs
  const jobFiles = new Map();
  data.forEach(file => {
    const match = file.name.match(/^(job_\d+_\w+)/);
    if (match) {
      const jobId = match[1];
      if (!jobFiles.has(jobId)) {
        jobFiles.set(jobId, { name: jobId, created_at: file.created_at, files: [] });
      }
      jobFiles.get(jobId).files.push(file.name);
    }
  });

  // Sort by creation date
  const jobs = Array.from(jobFiles.values()).sort((a, b) =>
    new Date(b.created_at) - new Date(a.created_at)
  );

  console.log(`Found ${jobs.length} unique jobs\n`);

  jobs.slice(0, 10).forEach((job, i) => {
    console.log(`${i + 1}. ${job.name}`);
    console.log(`   Created: ${job.created_at}`);
    console.log(`   Files: ${job.files.length} (${job.files.join(', ')})\n`);
  });
}

listJobs().catch(console.error);
