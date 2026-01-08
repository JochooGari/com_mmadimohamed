// Run full workflow locally with step-by-step execution
const https = require('https');

const API_BASE = 'https://com-mmadimohamed.vercel.app';
const TOPIC = 'DevOps et Automatisation Cloud 2025 - Guide Complet';
const OUTLINE = 'Introduction DevOps moderne|Principes fondamentaux et best practices|Infrastructure as Code (IaC)|CI/CD et pipelines automatisés|FAQ DevOps 2025';
const MIN_SCORE = 95;
const MAX_ITERATIONS = 3;

async function apiCall(action, body = {}) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({ action, ...body });

    const options = {
      hostname: 'com-mmadimohamed.vercel.app',
      path: '/api/geo',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      },
      timeout: 120000 // 2 minutes per step
    };

    console.log(`\n📡 API Call: ${action}`);

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve(json);
        } catch (e) {
          console.error('Parse error:', data.substring(0, 300));
          reject(new Error(`JSON parse failed: ${e.message}`));
        }
      });
    });

    req.on('error', (e) => {
      reject(e);
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.write(postData);
    req.end();
  });
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runFullWorkflow() {
  console.log('🚀 DÉMARRAGE DU WORKFLOW COMPLET');
  console.log('=' .repeat(60));
  console.log(`📝 Topic: ${TOPIC}`);
  console.log(`📋 Outline: ${OUTLINE}`);
  console.log(`🎯 Min Score: ${MIN_SCORE}`);
  console.log(`🔄 Max Iterations: ${MAX_ITERATIONS}\n`);

  try {
    // Step 1: Start workflow
    console.log('ÉTAPE 1: Initialisation du workflow...');
    const startResult = await apiCall('workflow_start', {
      topic: TOPIC,
      outline: OUTLINE,
      minScore: MIN_SCORE,
      maxIterations: MAX_ITERATIONS
    });

    const jobId = startResult.jobId;

    if (!jobId) {
      throw new Error('No job ID returned from workflow_start');
    }

    console.log(`✅ Job créé: ${jobId}`);
    console.log(`   Status: ${startResult.status}`);
    console.log(`   Next step: ${startResult.nextStep}`);

    // Step 2: Execute workflow steps
    let currentStep = startResult.nextStep || 'research';
    let iteration = 0;
    let maxSteps = 50; // Safety limit
    let stepCount = 0;

    while (currentStep && currentStep !== 'done' && stepCount < maxSteps) {
      stepCount++;

      console.log(`\n${'='.repeat(60)}`);
      console.log(`ÉTAPE ${stepCount}: ${currentStep.toUpperCase()}`);
      console.log(`${'='.repeat(60)}`);

      const stepStart = Date.now();

      const stepResult = await apiCall('workflow_step', { jobId });

      const stepDuration = ((Date.now() - stepStart) / 1000).toFixed(1);

      console.log(`✅ Terminé en ${stepDuration}s`);
      console.log(`   Status: ${stepResult.status}`);
      console.log(`   Next step: ${stepResult.nextStep}`);

      if (stepResult.scores) {
        console.log(`   📊 Scores: SEO ${stepResult.scores.seo}/100, GEO ${stepResult.scores.geo}/100`);
      }

      if (stepResult.iteration !== undefined) {
        console.log(`   🔄 Iteration: ${stepResult.iteration}`);
      }

      // Update for next loop
      currentStep = stepResult.nextStep;

      // Small delay between steps
      if (currentStep && currentStep !== 'done') {
        await sleep(1000);
      }
    }

    if (stepCount >= maxSteps) {
      console.log('\n⚠️  Workflow stopped: max steps limit reached');
    }

    // Step 3: Final status
    console.log(`\n${'='.repeat(60)}`);
    console.log('✅ WORKFLOW TERMINÉ');
    console.log(`${'='.repeat(60)}`);
    console.log(`\n📋 Job ID: ${jobId}`);
    console.log(`🌐 Admin: https://www.mmadimohamed.fr/admin/articles`);
    console.log(`📁 Storage: https://storage.supabase.co/v1/object/public/agents/geo/articles/${jobId}.html\n`);

  } catch (error) {
    console.error('\n❌ ERREUR:', error.message);
    console.error(error);
    process.exit(1);
  }
}

// Run it!
runFullWorkflow();
