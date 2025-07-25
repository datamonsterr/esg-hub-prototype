import { NextRequest, NextResponse } from "next/server";
import { validateDatabaseConnection } from "@/src/lib/database-validator";
import { validateSupabaseConfig } from "@/src/lib/supabase-config-validator";
import { supabaseAdmin } from "@/src/lib/supabase";

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Validate Supabase configuration
    const configValidation = validateSupabaseConfig();
    
    if (!configValidation.isValid) {
      return NextResponse.json({
        status: 'error',
        message: 'Supabase configuration is invalid',
        errors: configValidation.errors,
        timestamp: new Date().toISOString(),
        responseTime: Date.now() - startTime
      }, { status: 503 });
    }

    // Validate database connection and schema
    const dbValidation = await validateDatabaseConnection();
    
    if (!dbValidation.isValid) {
      return NextResponse.json({
        status: 'error',
        message: 'Database validation failed',
        errors: dbValidation.errors,
        warnings: dbValidation.warnings,
        tableStatus: dbValidation.tableStatus,
        timestamp: new Date().toISOString(),
        responseTime: Date.now() - startTime
      }, { status: 503 });
    }

    // Test a few key operations
    const tests = {
      basicQuery: false,
      userTableAccess: false,
      organizationTableAccess: false,
      writeAccess: false
    };

    // Test basic query
    try {
      const { error } = await supabaseAdmin
        .from('organizations')
        .select('count')
        .limit(1);
      tests.basicQuery = !error;
    } catch (err) {
      // basicQuery remains false
    }

    // Test user table access
    try {
      const { error } = await supabaseAdmin
        .from('users')
        .select('count')
        .limit(1);
      tests.userTableAccess = !error;
    } catch (err) {
      // userTableAccess remains false
    }

    // Test organization table access
    try {
      const { error } = await supabaseAdmin
        .from('organizations')
        .select('id, name')
        .limit(1);
      tests.organizationTableAccess = !error;
    } catch (err) {
      // organizationTableAccess remains false
    }

    // Test write access (create and delete a test record)
    try {
      const testOrgName = `test_health_check_${Date.now()}`;
      const { data: insertResult, error: insertError } = await supabaseAdmin
        .from('organizations')
        .insert({
          name: testOrgName,
          email: 'health-check@test.com'
        })
        .select('id')
        .single();

      if (!insertError && insertResult) {
        // Clean up test record
        await supabaseAdmin
          .from('organizations')
          .delete()
          .eq('id', insertResult.id);
        tests.writeAccess = true;
      }
    } catch (err) {
      // writeAccess remains false
    }

    const allTestsPassed = Object.values(tests).every(test => test === true);
    const responseTime = Date.now() - startTime;

    return NextResponse.json({
      status: allTestsPassed ? 'healthy' : 'degraded',
      message: allTestsPassed ? 'All systems operational' : 'Some systems have issues',
      config: {
        isValid: configValidation.isValid,
        errors: configValidation.errors
      },
      database: {
        isValid: dbValidation.isValid,
        errors: dbValidation.errors,
        warnings: dbValidation.warnings,
        tableStatus: dbValidation.tableStatus
      },
      tests,
      timestamp: new Date().toISOString(),
      responseTime
    }, { 
      status: allTestsPassed ? 200 : 503 
    });

  } catch (error) {
    const responseTime = Date.now() - startTime;
    
    return NextResponse.json({
      status: 'error',
      message: 'Health check failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
      responseTime
    }, { status: 500 });
  }
}
