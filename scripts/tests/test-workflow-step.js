// Test single workflow_step call
const https = require('https');

const JOB_ID = process.argv[2] || 'job_1763753039066_mxe12z';

const postData = JSON.stringify({
  action: 'workflow_step',
  jobId: JOB_ID
});

const options = {
  hostname: 'com-mmadimohamed.vercel.app',
  path: '/api/geo',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  },
  timeout: 120000 // 2 minutes
};

console.log(`🔍 Testing workflow_step for job: ${JOB_ID}\n`);

const req = https.request(options, (res) => {
  let data = '';

  console.log(`📊 Status Code: ${res.statusCode}`);
  console.log(`📋 Headers:`, JSON.stringify(res.headers, null, 2));
  console.log('\n📄 Response Body:\n');

  res.on('data', (chunk) => {
    data += chunk;
    process.stdout.write(chunk);
  });

  res.on('end', () => {
    console.log('\n\n✅ Request completed');

    try {
      const json = JSON.parse(data);
      console.log('\n📦 Parsed JSON:');
      console.log(JSON.stringify(json, null, 2));
    } catch (e) {
      console.log('\n⚠️  Response is not valid JSON');
    }
  });
});

req.on('error', (e) => {
  console.error(`\n❌ Error: ${e.message}`);
});

req.on('timeout', () => {
  console.error('\n❌ Request timeout');
  req.destroy();
});

req.write(postData);
req.end();
