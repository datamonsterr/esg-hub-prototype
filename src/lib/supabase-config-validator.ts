/**
 * Supabase Configuration Validator
 * Validates and provides robust configuration for new Supabase instances
 */

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  serviceRoleKey: string;
  isValid: boolean;
  errors: string[];
}

/**
 * Validates Supabase environment configuration
 */
export function validateSupabaseConfig(): SupabaseConfig {
  const errors: string[] = [];
  
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url) {
    errors.push('NEXT_PUBLIC_SUPABASE_URL environment variable is missing');
  } else if (!isValidSupabaseUrl(url)) {
    errors.push('NEXT_PUBLIC_SUPABASE_URL is not a valid Supabase URL');
  }

  if (!anonKey) {
    errors.push('NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable is missing');
  } else if (!isValidSupabaseKey(anonKey)) {
    errors.push('NEXT_PUBLIC_SUPABASE_ANON_KEY is not a valid Supabase key');
  }

  if (!serviceRoleKey) {
    errors.push('SUPABASE_SERVICE_ROLE_KEY environment variable is missing');
  } else if (!isValidSupabaseKey(serviceRoleKey)) {
    errors.push('SUPABASE_SERVICE_ROLE_KEY is not a valid Supabase key');
  }

  return {
    url: url || '',
    anonKey: anonKey || '',
    serviceRoleKey: serviceRoleKey || '',
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validates if URL is a proper Supabase URL format
 */
function isValidSupabaseUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.includes('supabase');
  } catch {
    return false;
  }
}

/**
 * Validates if key is a proper Supabase key format
 */
function isValidSupabaseKey(key: string): boolean {
  // Supabase keys are usually JWT tokens starting with 'eyJ'
  return key.length > 50 && (key.startsWith('eyJ') || key.startsWith('sbp_'));
}

/**
 * Gets configuration with detailed error reporting
 */
export function getSupabaseConfigWithValidation() {
  const config = validateSupabaseConfig();
  
  if (!config.isValid) {
    const errorMessage = `Supabase configuration errors:\n${config.errors.join('\n')}`;
    
    if (process.env.NODE_ENV === 'development') {
      console.error('❌ Supabase Configuration Error:', errorMessage);
      console.log('\n🔧 To fix this:');
      console.log('1. Copy .env.example to .env.local');
      console.log('2. Update the Supabase environment variables with your new instance values');
      console.log('3. Make sure your Supabase project is properly set up with the required schema');
    }
    
    throw new Error(errorMessage);
  }
  
  if (process.env.NODE_ENV === 'development') {
    console.log('✅ Supabase configuration is valid');
  }
  
  return config;
}
