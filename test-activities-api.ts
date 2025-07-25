import { supabaseAdmin } from './src/lib/supabase';

async function testActivitiesAPI() {
  console.log('Testing Activities API setup...');
  
  try {
    // Test if integration_activities table exists and is accessible
    const { data, error } = await supabaseAdmin
      .from('integration_activities')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('❌ Database error:', error);
      return false;
    }
    
    console.log('✅ Successfully connected to integration_activities table');
    console.log('Sample data:', data);
    
    // Test schema structure
    const { data: schemaData, error: schemaError } = await supabaseAdmin
      .from('integration_activities')
      .select('id, organization_id, title, subtitle, status, created_at')
      .limit(0);
    
    if (schemaError) {
      console.error('❌ Schema validation error:', schemaError);
      return false;
    }
    
    console.log('✅ Schema validation passed');
    
    return true;
  } catch (error) {
    console.error('❌ Test failed:', error);
    return false;
  }
}

// Run the test
testActivitiesAPI().then(success => {
  if (success) {
    console.log('🎉 Activities API setup is ready!');
  } else {
    console.log('💥 Activities API setup has issues');
  }
  process.exit(success ? 0 : 1);
});
