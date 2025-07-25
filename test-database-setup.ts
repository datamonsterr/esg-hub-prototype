// Quick fix to test and set up your database
import { config } from 'dotenv';
import path from 'path';

// Load environment variables
config({ path: path.join(__dirname, '.env.local') });

async function setupDatabase() {
  console.log('Setting up database with test data...\n');

  const { createClient } = await import('@supabase/supabase-js');
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  // Create admin client with explicit service role configuration
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
    db: { schema: 'public' },
    global: {
      headers: {
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'apikey': supabaseServiceKey,
        'Prefer': 'return=representation'
      }
    }
  });

  console.log('Environment check:');
  console.log('- URL:', supabaseUrl ? '✓ Set' : '✗ Missing');
  console.log('- Service Key:', supabaseServiceKey ? '✓ Set' : '✗ Missing');
  console.log();

  try {
    // Test 1: Try to insert a test organization
    console.log('1. Testing organization insert:');
    const { data: orgData, error: orgError } = await supabase
      .from('organizations')
      .insert({ 
        name: 'Test Organization', 
        email: 'admin@testorg.com',
        address: '123 Test Street' 
      })
      .select()
      .single();

    if (orgError) {
      console.log('✗ Organization insert failed:', orgError.message);
      console.log('Error details:', orgError);
    } else {
      console.log('✓ Organization created successfully:', orgData);
      
      // Test 2: Try to insert a test user
      console.log('\n2. Testing user insert:');
      const testUserId = 'test_user_' + Date.now();
      const { data: userData, error: userError } = await supabase
        .from('users')
        .insert({
          id: testUserId,
          organization_id: orgData.id,
          organization_role: 'admin',
          is_active: true
        })
        .select()
        .single();

      if (userError) {
        console.log('✗ User insert failed:', userError.message);
      } else {
        console.log('✓ User created successfully:', userData);
      }

      // Test 3: Query the data back
      console.log('\n3. Testing data retrieval:');
      const { data: retrievedOrg, error: retrieveError } = await supabase
        .from('organizations')
        .select(`
          id,
          name,
          email,
          users:users(id, organization_role, is_active)
        `)
        .eq('id', orgData.id)
        .single();

      if (retrieveError) {
        console.log('✗ Data retrieval failed:', retrieveError.message);
      } else {
        console.log('✓ Data retrieved successfully:', retrievedOrg);
      }

      // Clean up test data
      console.log('\n4. Cleaning up test data:');
      if (userData) {
        await supabase.from('users').delete().eq('id', testUserId);
        console.log('✓ Test user deleted');
      }
      
      await supabase.from('organizations').delete().eq('id', orgData.id);
      console.log('✓ Test organization deleted');
    }

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

setupDatabase().catch(console.error);
