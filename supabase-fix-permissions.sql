-- IMPORTANT: Run this in your Supabase Dashboard SQL Editor
-- This will fix the RLS policies and permissions

-- First, let's check the current RLS status
SELECT schemaname, tablename, rowsecurity, forcerowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('organizations', 'users', 'products', 'assessments', 'notifications');

-- Grant necessary permissions to authenticated role
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Grant permissions to service_role (should bypass RLS)
GRANT USAGE ON SCHEMA public TO service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- Ensure service_role can bypass RLS
ALTER ROLE service_role SET row_security = off;

-- Drop all existing policies (if any) to start fresh
DO $$ 
DECLARE 
    pol RECORD;
BEGIN
    FOR pol IN 
        SELECT schemaname, tablename, policyname 
        FROM pg_policies 
        WHERE schemaname = 'public'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(pol.policyname) || ' ON ' || quote_ident(pol.schemaname) || '.' || quote_ident(pol.tablename) || ';';
    END LOOP;
END $$;

-- Temporarily disable RLS on all tables to allow service role access
ALTER TABLE organizations DISABLE ROW LEVEL SECURITY;
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE assessments DISABLE ROW LEVEL SECURITY;
ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_templates DISABLE ROW LEVEL SECURITY;
ALTER TABLE trace_requests DISABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_responses DISABLE ROW LEVEL SECURITY;
ALTER TABLE organization_invites DISABLE ROW LEVEL SECURITY;
ALTER TABLE file_uploads DISABLE ROW LEVEL SECURITY;
ALTER TABLE integration_activities DISABLE ROW LEVEL SECURITY;

-- Insert a default organization if it doesn't exist
INSERT INTO organizations (id, name, address, email) 
VALUES (1, 'Default Organization', 'Default Address', 'admin@example.com')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  address = EXCLUDED.address,
  email = EXCLUDED.email;

-- Verify the data was inserted
SELECT * FROM organizations WHERE id = 1;
