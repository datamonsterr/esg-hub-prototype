import { createClient } from '@supabase/supabase-js'
import { getSupabaseConfigWithValidation } from './supabase-config-validator'

// Lazy initialization to ensure environment variables are loaded
let _config: any = null;
let _supabase: any = null;
let _supabaseAdmin: any = null;

function getConfig() {
  if (!_config) {
    _config = getSupabaseConfigWithValidation();
  }
  return _config;
}

export function getSupabase() {
  if (!_supabase) {
    const config = getConfig();
    _supabase = createClient(config.url, config.anonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true
      },
      db: {
        schema: 'public'
      }
    });
  }
  return _supabase;
}

export function getSupabaseAdmin() {
  if (!_supabaseAdmin) {
    const config = getConfig();
    
    if (!config.serviceRoleKey && process.env.NODE_ENV === 'production') {
      throw new Error('Supabase service role key is required in production');
    }
    
    _supabaseAdmin = createClient(config.url, config.serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      },
      db: {
        schema: 'public'
      },
      global: {
        headers: {
          Authorization: `Bearer ${config.serviceRoleKey}`,
        }
      }
    });
  }
  return _supabaseAdmin;
}

// Export lazy-initialized clients
export const supabase = new Proxy({} as any, {
  get(target, prop) {
    return getSupabase()[prop];
  }
});

export const supabaseAdmin = new Proxy({} as any, {
  get(target, prop) {
    return getSupabaseAdmin()[prop];
  }
});

// Database types based on our schema
export type Database = {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: number
          name: string
          address: string | null
          email: string | null
          created_at: string
        }
        Insert: {
          id?: number
          name: string
          address?: string | null
          email?: string | null
          created_at?: string
        }
        Update: {
          id?: number
          name?: string
          address?: string | null
          email?: string | null
          created_at?: string
        }
      }
      users: {
        Row: {
          id: string
          organization_id: number
          organization_role: string
          is_active: boolean
        }
        Insert: {
          id: string
          organization_id: number
          organization_role?: string
          is_active?: boolean
        }
        Update: {
          id?: string
          organization_id?: number
          organization_role?: string
          is_active?: boolean
        }
      }
      products: {
        Row: {
          id: number
          organization_id: number
          parent_id: number | null
          name: string
          sku: string | null
          description: string | null
          category: string | null
          type: string
          quantity: number
          unit: string
          metadata: any
          data_completeness: number
          missing_data_fields: string[] | null
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          organization_id: number
          parent_id?: number | null
          name: string
          sku?: string | null
          description?: string | null
          category?: string | null
          type?: string
          quantity?: number
          unit?: string
          metadata?: any
          data_completeness?: number
          missing_data_fields?: string[] | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          organization_id?: number
          parent_id?: number | null
          name?: string
          sku?: string | null
          description?: string | null
          category?: string | null
          type?: string
          quantity?: number
          unit?: string
          metadata?: any
          data_completeness?: number
          missing_data_fields?: string[] | null
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
      assessment_templates: {
        Row: {
          id: number
          created_by_organization_id: number
          title: string
          description: string | null
          icon: string | null
          recommended: boolean
          last_used: string | null
          tags: string[] | null
          schema: any
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          created_by_organization_id: number
          title: string
          description?: string | null
          icon?: string | null
          recommended?: boolean
          last_used?: string | null
          tags?: string[] | null
          schema: any
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          created_by_organization_id?: number
          title?: string
          description?: string | null
          icon?: string | null
          recommended?: boolean
          last_used?: string | null
          tags?: string[] | null
          schema?: any
          created_at?: string
          updated_at?: string
        }
      }
      assessments: {
        Row: {
          id: number
          template_id: number
          organization_id: number
          requesting_organization_id: number | null
          title: string
          description: string | null
          topic: string | null
          status: string
          priority: string
          product_ids: number[] | null
          created_by: string
          due_date: string | null
          completed_at: string | null
          data_completeness: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          template_id: number
          organization_id: number
          requesting_organization_id?: number | null
          title: string
          description?: string | null
          topic?: string | null
          status?: string
          priority?: string
          product_ids?: number[] | null
          created_by: string
          due_date?: string | null
          completed_at?: string | null
          data_completeness?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          template_id?: number
          organization_id?: number
          requesting_organization_id?: number | null
          title?: string
          description?: string | null
          topic?: string | null
          status?: string
          priority?: string
          product_ids?: number[] | null
          created_by?: string
          due_date?: string | null
          completed_at?: string | null
          data_completeness?: number
          created_at?: string
          updated_at?: string
        }
      }
      trace_requests: {
        Row: {
          id: number
          requesting_organization_id: number
          target_organization_id: number
          product_ids: number[] | null
          assessment_id: number
          parent_request_id: number | null
          status: string
          priority: string
          due_date: string | null
          message: string | null
          cascade_settings: any
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          requesting_organization_id: number
          target_organization_id: number
          product_ids?: number[] | null
          assessment_id: number
          parent_request_id?: number | null
          status?: string
          priority?: string
          due_date?: string | null
          message?: string | null
          cascade_settings?: any
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          requesting_organization_id?: number
          target_organization_id?: number
          product_ids?: number[] | null
          assessment_id?: number
          parent_request_id?: number | null
          status?: string
          priority?: string
          due_date?: string | null
          message?: string | null
          cascade_settings?: any
          created_at?: string
          updated_at?: string
        }
      }
      assessment_responses: {
        Row: {
          id: number
          assessment_id: number
          trace_request_id: number | null
          responding_organization_id: number
          submitted_by_user_id: string
          response_data: any
          attachments: string[] | null
          submitted_at: string
          created_at: string
        }
        Insert: {
          id?: number
          assessment_id: number
          trace_request_id?: number | null
          responding_organization_id: number
          submitted_by_user_id: string
          response_data: any
          attachments?: string[] | null
          submitted_at?: string
          created_at?: string
        }
        Update: {
          id?: number
          assessment_id?: number
          trace_request_id?: number | null
          responding_organization_id?: number
          submitted_by_user_id?: string
          response_data?: any
          attachments?: string[] | null
          submitted_at?: string
          created_at?: string
        }
      }
      organization_invites: {
        Row: {
          id: number
          email: string
          organization_id: number
          organization_role: string
          invited_by: string
          status: string
          token: string
          expires_at: string
          created_at: string
        }
        Insert: {
          id?: number
          email: string
          organization_id: number
          organization_role?: string
          invited_by: string
          status?: string
          token: string
          expires_at: string
          created_at?: string
        }
        Update: {
          id?: number
          email?: string
          organization_id?: number
          organization_role?: string
          invited_by?: string
          status?: string
          token?: string
          expires_at?: string
          created_at?: string
        }
      }
      notifications: {
        Row: {
          id: number
          organization_id: number
          type: string
          title: string
          message: string
          is_read: boolean
          priority: string
          action_url: string | null
          created_at: string
        }
        Insert: {
          id?: number
          organization_id: number
          type: string
          title: string
          message: string
          is_read?: boolean
          priority?: string
          action_url?: string | null
          created_at?: string
        }
        Update: {
          id?: number
          organization_id?: number
          type?: string
          title?: string
          message?: string
          is_read?: boolean
          priority?: string
          action_url?: string | null
          created_at?: string
        }
      }
      integration_activities: {
        Row: {
          id: number
          organization_id: number
          title: string
          subtitle: string | null
          status: string
          created_at: string
        }
        Insert: {
          id?: number
          organization_id: number
          title: string
          subtitle?: string | null
          status: string
          created_at?: string
        }
        Update: {
          id?: number
          organization_id?: number
          title?: string
          subtitle?: string | null
          status?: string
          created_at?: string
        }
      }
      file_uploads: {
        Row: {
          id: number
          organization_id: number
          original_filename: string
          stored_filename: string
          file_path: string
          file_size: number
          mime_type: string | null
          description: string | null
          upload_status: string
          processing_status: string
          extracted_data: any
          metadata: any
          uploaded_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          organization_id: number
          original_filename: string
          stored_filename: string
          file_path: string
          file_size: number
          mime_type?: string | null
          description?: string | null
          upload_status?: string
          processing_status?: string
          extracted_data?: any
          metadata?: any
          uploaded_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          organization_id?: number
          original_filename?: string
          stored_filename?: string
          file_path?: string
          file_size?: number
          mime_type?: string | null
          description?: string | null
          upload_status?: string
          processing_status?: string
          extracted_data?: any
          metadata?: any
          uploaded_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
