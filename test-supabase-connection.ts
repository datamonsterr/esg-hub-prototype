import { config } from 'dotenv';
import path from 'path';

// Load environment variables from .env.local FIRST
config({ path: path.join(__dirname, '.env.local') });

async function testSupabaseConnection() {
  console.log('Testing Supabase connection...\n');

  // Check environment variables
  console.log('1. Checking environment variables:');
  console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '✓ Set' : '✗ Missing');
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✓ Set' : '✗ Missing');
  console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✓ Set' : '✗ Missing');
  console.log();

  // Import supabase AFTER loading env vars
  const { supabase, supabaseAdmin } = await import('./src/lib/supabase');

  // Test basic connection with anon client
  console.log('2. Testing basic connection (anon client):');
  try {
    const { data, error } = await supabase.from('organizations').select('count').limit(1);
    if (error) {
      console.log('✗ Basic connection failed:', error.message);
    } else {
      console.log('✓ Basic connection successful');
    }
  } catch (err) {
    console.log('✗ Basic connection error:', err);
  }
  console.log();

  // Test admin connection
  console.log('3. Testing admin connection (service role):');
  try {
    const { data, error } = await supabaseAdmin.from('organizations').select('count').limit(1);
    if (error) {
      console.log('✗ Admin connection failed:', error.message);
    } else {
      console.log('✓ Admin connection successful');
    }
  } catch (err) {
    console.log('✗ Admin connection error:', err);
  }
  console.log();

  // Test specific tables
  console.log('4. Testing table access:');
  const tables = ['organizations', 'users', 'assessments', 'products'];
  
  for (const table of tables) {
    try {
      const { data, error } = await supabaseAdmin.from(table).select('*').limit(1);
      if (error) {
        console.log(`✗ ${table}: ${error.message}`);
      } else {
        console.log(`✓ ${table}: accessible (${data?.length || 0} rows sample)`);
      }
    } catch (err) {
      console.log(`✗ ${table}: error -`, err);
    }
  }
  console.log();

  // Test the getCurrentUserContext function
  console.log('5. Testing getCurrentUserContext function:');
  try {
    // Note: This might fail since we don't have Clerk auth in this test
    const { getCurrentUserContext } = await import('./src/lib/supabase-utils');
    const userContext = await getCurrentUserContext();
    console.log('✓ getCurrentUserContext works:', userContext);
  } catch (err) {
    console.log('✗ getCurrentUserContext error (expected without Clerk auth):', err instanceof Error ? err.message : err);
  }
}

// Run the test
testSupabaseConnection().catch(console.error);
