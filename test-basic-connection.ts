// Simple test script to verify basic Supabase connection
// This will work without RLS by using service role privileges

import { config } from 'dotenv';
import path from 'path';

// Load environment variables
config({ path: path.join(__dirname, '.env.local') });

async function testBasicConnection() {
  console.log('Testing basic Supabase connection...\n');

  // Import after env vars are loaded
  const { createClient } = await import('@supabase/supabase-js');
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  console.log('Environment check:');
  console.log('- URL:', supabaseUrl ? '✓ Set' : '✗ Missing');
  console.log('- Service Key:', supabaseServiceKey ? '✓ Set' : '✗ Missing');
  console.log();

  // Create admin client (bypasses RLS)
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
    db: { schema: 'public' }
  });

  console.log('Testing connection with service role...');
  
  try {
    // Test 1: Check if we can connect and access information_schema
    console.log('\n1. Testing basic database connection:');
    const { data: connectionTest, error: connectionError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .limit(5);

    if (connectionError) {
      console.log('✗ Connection failed:', connectionError.message);
    } else {
      console.log('✓ Connection successful');
      console.log('Available tables:', connectionTest?.map(t => t.table_name).join(', '));
    }

    // Test 2: Check if organizations table exists
    console.log('\n2. Testing organizations table:');
    const { data: orgData, error: orgError } = await supabase
      .from('organizations')
      .select('*')
      .limit(1);

    if (orgError) {
      console.log('✗ Organizations table error:', orgError.message);
      if (orgError.message.includes('does not exist')) {
        console.log('  → Table needs to be created. Run the migration script.');
      }
    } else {
      console.log('✓ Organizations table accessible');
      console.log('  Sample data:', orgData);
    }

    // Test 3: Check if users table exists
    console.log('\n3. Testing users table:');
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .limit(1);

    if (userError) {
      console.log('✗ Users table error:', userError.message);
      if (userError.message.includes('does not exist')) {
        console.log('  → Table needs to be created. Run the migration script.');
      }
    } else {
      console.log('✓ Users table accessible');
      console.log('  Sample data:', userData);
    }

    // Test 4: Try to create a test organization if table exists
    if (!orgError && orgData !== null) {
      console.log('\n4. Testing data insertion:');
      const { data: insertData, error: insertError } = await supabase
        .from('organizations')
        .insert({ 
          name: `Test Org ${Date.now()}`, 
          email: 'test@example.com' 
        })
        .select()
        .single();

      if (insertError) {
        console.log('✗ Insert failed:', insertError.message);
      } else {
        console.log('✓ Insert successful:', insertData);
        
        // Clean up test data
        await supabase
          .from('organizations')
          .delete()
          .eq('id', insertData.id);
        console.log('✓ Test data cleaned up');
      }
    }

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

testBasicConnection().catch(console.error);
