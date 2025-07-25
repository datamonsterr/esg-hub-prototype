#!/usr/bin/env node

// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' });

// Debug script to check environment variables
console.log('🔍 Debugging Environment Variables');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Present' : '❌ Missing');
console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Present' : '❌ Missing');
console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Present' : '❌ Missing');

console.log('\n📋 Environment Variable Values:');
console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 50) + '...');
console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 50) + '...');
console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY?.substring(0, 50) + '...');

// Try loading config
try {
  const { validateSupabaseConfig } = require('./src/lib/supabase-config-validator');
  const config = validateSupabaseConfig();
  console.log('\n✅ Config validation result:', config.isValid ? 'VALID' : 'INVALID');
  if (!config.isValid) {
    console.log('❌ Errors:', config.errors);
  }
} catch (error) {
  console.log('\n❌ Error loading config:', error.message);
}
