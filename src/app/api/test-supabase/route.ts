import { supabaseAdmin } from '@/src/lib/supabase';

export async function GET() {
  try {
    console.log('Testing Supabase connection...');
    
    // Test 1: Simple query to check connection
    const { data: testData, error: testError } = await supabaseAdmin
      .from('organizations')
      .select('count')
      .limit(1);
    
    if (testError) {
      console.error('Test 1 - Basic query failed:', testError);
      return Response.json({
        success: false,
        test: 'basic_query',
        error: testError.message,
        details: testError
      }, { status: 500 });
    }
    
    console.log('Test 1 - Basic query successful:', testData);
    
    // Test 2: Try to query users table specifically
    const { data: usersData, error: usersError } = await supabaseAdmin
      .from('users')
      .select('count')
      .limit(1);
    
    if (usersError) {
      console.error('Test 2 - Users query failed:', usersError);
      return Response.json({
        success: false,
        test: 'users_query',
        error: usersError.message,
        details: usersError,
        basic_query_worked: true
      }, { status: 500 });
    }
    
    console.log('Test 2 - Users query successful:', usersData);
    
    // Test 3: Try to insert a test record
    const testUserId = 'test_user_' + Date.now();
    const { data: insertData, error: insertError } = await supabaseAdmin
      .from('users')
      .insert({
        id: testUserId,
        organization_id: 1,
        organization_role: 'employee',
        is_active: true
      })
      .select()
      .single();
    
    if (insertError) {
      console.error('Test 3 - Insert failed:', insertError);
      return Response.json({
        success: false,
        test: 'insert_test',
        error: insertError.message,
        details: insertError,
        basic_query_worked: true,
        users_query_worked: true
      }, { status: 500 });
    }
    
    console.log('Test 3 - Insert successful:', insertData);
    
    // Clean up test record
    await supabaseAdmin
      .from('users')
      .delete()
      .eq('id', testUserId);
    
    return Response.json({
      success: true,
      message: 'All Supabase tests passed!',
      tests: {
        basic_query: true,
        users_query: true,
        insert_test: true
      }
    });
    
  } catch (error) {
    console.error('Supabase test failed:', error);
    return Response.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      details: error
    }, { status: 500 });
  }
}
