import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://xroduivvgnviqjdvehuw.supabase.co';
const SUPABASE_SERVICE_ROLE = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhyb2R1aXZ2Z252aXFqZHZlaHV3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDg1Njg5NywiZXhwIjoyMDY2NDMyODk3fQ.lJe0rcdAJYdS4VjcR5IV_kqA9lEUJoWq8VKsSD5EUV0';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createUser() {
  const email = 'marketingb3dconsulting@gmail.com';
  const password = 'TempPassword2025!'; // Changez ce mot de passe après la première connexion

  console.log('Creating user in Supabase Auth...');

  try {
    // 1. Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        full_name: 'Mohamed MMADI'
      }
    });

    if (authError) {
      console.error('Auth error:', authError);
      return;
    }

    console.log('✅ User created in auth.users:', authData.user.id);

    // 2. Create profile in user_profiles
    const { data: profileData, error: profileError } = await supabase
      .from('user_profiles')
      .insert({
        id: authData.user.id,
        email: email,
        full_name: 'Mohamed MMADI',
        role: 'admin',
        plan_type: 'premium',
        daily_limit: 1000,
        monthly_limit: 30000,
        extractions_used_today: 0,
        extractions_used_month: 0,
        last_reset_date: new Date().toISOString().split('T')[0]
      })
      .select();

    if (profileError) {
      console.error('Profile error:', profileError);
      return;
    }

    console.log('✅ User profile created');

    // 3. Create user_stats entry
    const { error: statsError } = await supabase
      .from('user_stats')
      .insert({
        user_id: authData.user.id,
        stat_date: new Date().toISOString().split('T')[0],
        extractions_count: 0,
        favorites_count: 0,
        content_generated_count: 0,
        languages_used: []
      });

    if (statsError) {
      console.log('⚠️ Stats error (non-critical):', statsError.message);
    } else {
      console.log('✅ User stats created');
    }

    console.log('\n🎉 User created successfully!\n');
    console.log('📧 Email:', email);
    console.log('🔑 Password:', password);
    console.log('👤 User ID:', authData.user.id);
    console.log('🔗 Login URL: https://mmadimohamed.fr');
    console.log('\n⚠️ IMPORTANT: Changez ce mot de passe après la première connexion!');

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

createUser();
