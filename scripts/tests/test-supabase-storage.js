// Test script to debug Supabase Storage put/get operations
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './magicpath-project/.env.local' });

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Supabase credentials missing');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false }
});

const TEST_PATH = 'geo/articles/test_part1.json';
const TEST_DATA = JSON.stringify({ sections: [{ id: 's1', title: 'Test', html: '<p>Test content</p>' }] });

async function testPutAndGet() {
  console.log('🧪 Testing Supabase Storage operations...\n');

  // Test 1: PUT operation
  console.log(`1️⃣ Testing PUT: ${TEST_PATH}`);
  console.log(`   Data size: ${TEST_DATA.length} bytes`);

  try {
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('agents')
      .upload(TEST_PATH, new Blob([TEST_DATA]), {
        upsert: true,
        contentType: 'application/json'
      });

    if (uploadError) {
      console.error(`❌ Upload failed:`, uploadError.message);
      return;
    }

    console.log(`✅ Upload succeeded:`, uploadData);
  } catch (error) {
    console.error(`❌ Upload exception:`, error.message);
    return;
  }

  // Wait a bit for eventual consistency
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Test 2: GET operation via download
  console.log(`\n2️⃣ Testing DOWNLOAD: ${TEST_PATH}`);

  try {
    const { data: downloadData, error: downloadError } = await supabase.storage
      .from('agents')
      .download(TEST_PATH);

    if (downloadError) {
      console.error(`❌ Download failed:`, downloadError.message);
      return;
    }

    if (!downloadData) {
      console.error(`❌ No data returned`);
      return;
    }

    const text = await downloadData.text();
    console.log(`✅ Download succeeded: ${text.length} bytes`);
    console.log(`   First 100 chars: ${text.substring(0, 100)}`);

    // Test 3: Parse JSON
    console.log(`\n3️⃣ Testing JSON PARSE`);
    try {
      const parsed = JSON.parse(text);
      console.log(`✅ Parse succeeded:`, parsed);
    } catch (parseError) {
      console.error(`❌ Parse failed:`, parseError.message);
    }

  } catch (error) {
    console.error(`❌ Download exception:`, error.message);
  }

  console.log(`\n✅ Test complete!`);
}

testPutAndGet().catch(console.error);
