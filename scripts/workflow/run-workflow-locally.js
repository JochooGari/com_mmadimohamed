// Run full workflow locally (no timeout constraints)
const https = require('https');
const http = require('http');

const BASE_URL = 'http://localhost:3000'; // Or use Vercel preview URL

const TOPIC = 'DevOps et Automatisation Cloud 2025 - Guide Complet';
const OUTLINE = 'Introduction DevOps moderne|Principes fondamentaux et best practices|Infrastructure as Code (IaC)|CI/CD et pipelines automatisés|FAQ DevOps 2025';

async function makeRequest(action, jobId = null) {
  return new Promise((resolve, reject) => {
    const url = jobId
      ? `https://com-mmadimohamed.vercel.app/api/geo?action=${action}&job_id=${jobId}`
      : `https://com-mmadimohamed.vercel.app/api/geo?action=${action}&topic=${encodeURIComponent(TOPIC)}&outline=${encodeURIComponent(OUTLINE)}`;

    console.log(`\n🚀 ${action.toUpperCase()}: ${url.substring(0, 100)}...`);

    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve(json);
        } catch (e) {
          console.error('Parse error:', data.substring(0, 200));
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function pollJobStatus(jobId, maxAttempts = 60, interval = 5000) {
  for (let i = 0; i < maxAttempts; i++) {
    console.log(`\n⏳ Polling job status (attempt ${i + 1}/${maxAttempts})...`);

    const status = await makeRequest('get_job_status', jobId);

    console.log(`   Status: ${status.status}`);
    console.log(`   Step: ${status.current_step}`);

    if (status.status === 'done') {
      console.log('\n✅ Job completed!');
      return status;
    }

    if (status.status === 'error') {
      console.error('\n❌ Job failed:', status.error);
      return status;
    }

    // Wait before next poll
    await new Promise(resolve => setTimeout(resolve, interval));
  }

  throw new Error('Job polling timeout');
}

async function runWorkflow() {
  console.log('🎯 STARTING LOCAL WORKFLOW TEST');
  console.log('================================\n');
  console.log(`Topic: ${TOPIC}`);
  console.log(`Outline: ${OUTLINE}\n`);

  try {
    // Step 1: Start workflow
    console.log('\n📝 STEP 1: Starting workflow...');
    const startResult = await makeRequest('start_workflow');
    const jobId = startResult.jobId;

    if (!jobId) {
      throw new Error('No job ID returned');
    }

    console.log(`✅ Job created: ${jobId}`);

    // Step 2: Poll until completion
    console.log('\n⏳ STEP 2: Waiting for workflow to complete...');
    const finalStatus = await pollJobStatus(jobId);

    // Step 3: Display results
    console.log('\n📊 FINAL RESULTS:');
    console.log('=================');
    console.log(JSON.stringify(finalStatus, null, 2));

    console.log(`\n🌐 View article at: https://www.mmadimohamed.fr/admin/articles`);
    console.log(`📋 Job ID: ${jobId}`);

  } catch (error) {
    console.error('\n❌ Workflow failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

runWorkflow();
