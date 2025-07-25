import { createClient } from '@supabase/supabase-js';

export async function GET() {
  try {
    console.log('Testing different Supabase configurations...');
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    
    console.log('URL:', supabaseUrl);
    console.log('Anon key exists:', !!supabaseAnonKey);
    console.log('Service key exists:', !!supabaseServiceKey);
    
    // Test 1: Try with anon key
    const anonClient = createClient(supabaseUrl, supabaseAnonKey);
    const { data: anonData, error: anonError } = await anonClient
      .from('organizations')
      .select('count')
      .limit(1);
    
    console.log('Anon client test:', { data: anonData, error: anonError });
    
    // Test 2: Try with service key but different config
    const serviceClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      },
      db: {
        schema: 'public'
      }
    });
    
    const { data: serviceData, error: serviceError } = await serviceClient
      .from('organizations')
      .select('count')
      .limit(1);
    
    console.log('Service client test:', { data: serviceData, error: serviceError });
    
    return Response.json({
      tests: {
        anon: { data: anonData, error: anonError?.message },
        service: { data: serviceData, error: serviceError?.message }
      },
      environment: {
        url: supabaseUrl,
        hasAnonKey: !!supabaseAnonKey,
        hasServiceKey: !!supabaseServiceKey
      }
    });
    
  } catch (error) {
    console.error('Configuration test failed:', error);
    return Response.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
