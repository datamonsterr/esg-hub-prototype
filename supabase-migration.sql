-- Migration to set up database schema and RLS policies
-- Run this in your Supabase SQL editor

-- First, create the tables (if they don't exist)
-- Table to store organization details
CREATE TABLE IF NOT EXISTS organizations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address TEXT,
    email VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table for user accounts, linked to organizations
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(255) PRIMARY KEY, -- Clerk user ID
    organization_id INT NOT NULL,
    organization_role VARCHAR(50) DEFAULT 'employee', -- "admin" | "employee"
    is_active BOOLEAN DEFAULT true,
    CONSTRAINT fk_organization
        FOREIGN KEY(organization_id)
        REFERENCES organizations(id)
        ON DELETE CASCADE
);

-- Table for products/components owned by organizations (unified table)
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    organization_id INT NOT NULL,
    parent_id INT, -- For hierarchical relationships (BOM structure)
    name VARCHAR(255) NOT NULL,
    sku VARCHAR(100),
    description TEXT,
    category VARCHAR(100),
    -- e.g., raw_material, sub_assembly, component, final_product
    type VARCHAR(50) NOT NULL DEFAULT 'final_product',
    quantity DECIMAL(10, 4) DEFAULT 1.0,
    unit VARCHAR(20) DEFAULT 'pcs',
    supplier_organization_id INT,
    metadata JSONB DEFAULT '{}',
    data_completeness DECIMAL(5,2) DEFAULT 0.0,
    missing_data_fields TEXT[],
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT fk_product_organization
        FOREIGN KEY(organization_id)
        REFERENCES organizations(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_parent_product
        FOREIGN KEY(parent_id)
        REFERENCES products(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_supplier_organization
        FOREIGN KEY(supplier_organization_id)
        REFERENCES organizations(id)
        ON DELETE SET NULL
);

-- Table for assessment form templates
CREATE TABLE IF NOT EXISTS assessment_templates (
    id SERIAL PRIMARY KEY,
    created_by_organization_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    icon VARCHAR(100),
    recommended BOOLEAN DEFAULT false,
    last_used TIMESTAMPTZ,
    tags TEXT[],
    -- Stores the form structure (questions, types)
    schema JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT fk_created_by_organization
        FOREIGN KEY(created_by_organization_id)
        REFERENCES organizations(id)
        ON DELETE SET NULL
);

-- Table for individual assessments created from templates
CREATE TABLE IF NOT EXISTS assessments (
    id SERIAL PRIMARY KEY,
    template_id INT NOT NULL,
    organization_id INT NOT NULL,
    requesting_organization_id INT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    topic VARCHAR(100),
    status VARCHAR(50) DEFAULT 'draft', -- "draft", "in_progress", "complete"
    priority VARCHAR(20) DEFAULT 'medium', -- "low", "medium", "high", "urgent"
    product_ids INT[],
    created_by VARCHAR(255) NOT NULL, -- Clerk user ID who created the assessment
    due_date TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    data_completeness DECIMAL(5,2) DEFAULT 0.0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT fk_assessment_template
        FOREIGN KEY(template_id)
        REFERENCES assessment_templates(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_assessment_organization
        FOREIGN KEY(organization_id)
        REFERENCES organizations(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_requesting_organization
        FOREIGN KEY(requesting_organization_id)
        REFERENCES organizations(id)
        ON DELETE SET NULL
);

-- Table for notifications
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    organization_id INT NOT NULL,
    type VARCHAR(50) NOT NULL, -- "assessment", "trace_request", "general"
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    priority VARCHAR(20) DEFAULT 'medium', -- "low", "medium", "high"
    action_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT fk_notification_organization
        FOREIGN KEY(organization_id)
        REFERENCES organizations(id)
        ON DELETE CASCADE
);

-- Now enable RLS on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies

-- Organizations: Users can only see their own organization
CREATE POLICY "Users can view their own organization" ON organizations
    FOR SELECT USING (
        id IN (
            SELECT organization_id FROM users WHERE id = auth.uid()::text
        )
    );

-- Users: Users can see other users in their organization
CREATE POLICY "Users can view users in their organization" ON users
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id FROM users WHERE id = auth.uid()::text
        )
    );

-- Users can update their own record
CREATE POLICY "Users can update their own record" ON users
    FOR UPDATE USING (id = auth.uid()::text);

-- Products: Users can see products from their organization
CREATE POLICY "Users can view products in their organization" ON products
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id FROM users WHERE id = auth.uid()::text
        )
    );

-- Products: Users can insert products for their organization
CREATE POLICY "Users can insert products for their organization" ON products
    FOR INSERT WITH CHECK (
        organization_id IN (
            SELECT organization_id FROM users WHERE id = auth.uid()::text
        )
    );

-- Products: Users can update products in their organization
CREATE POLICY "Users can update products in their organization" ON products
    FOR UPDATE USING (
        organization_id IN (
            SELECT organization_id FROM users WHERE id = auth.uid()::text
        )
    );

-- Assessment templates: Users can view all templates (or restrict as needed)
CREATE POLICY "Users can view assessment templates" ON assessment_templates
    FOR SELECT USING (true);

-- Assessments: Users can see assessments for their organization
CREATE POLICY "Users can view assessments for their organization" ON assessments
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id FROM users WHERE id = auth.uid()::text
        ) OR requesting_organization_id IN (
            SELECT organization_id FROM users WHERE id = auth.uid()::text
        )
    );

-- Assessments: Users can create assessments for their organization
CREATE POLICY "Users can create assessments for their organization" ON assessments
    FOR INSERT WITH CHECK (
        organization_id IN (
            SELECT organization_id FROM users WHERE id = auth.uid()::text
        )
    );

-- Notifications: Users can see notifications for their organization
CREATE POLICY "Users can view notifications for their organization" ON notifications
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id FROM users WHERE id = auth.uid()::text
        )
    );

-- Notifications: Users can update notifications for their organization (mark as read)
CREATE POLICY "Users can update notifications for their organization" ON notifications
    FOR UPDATE USING (
        organization_id IN (
            SELECT organization_id FROM users WHERE id = auth.uid()::text
        )
    );

-- Insert a default organization for testing
INSERT INTO organizations (name, address, email) 
VALUES ('Default Organization', 'Default Address', 'admin@example.com')
ON CONFLICT DO NOTHING;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_organization_id ON users(organization_id);
CREATE INDEX IF NOT EXISTS idx_products_organization_id ON products(organization_id);
CREATE INDEX IF NOT EXISTS idx_assessments_organization_id ON assessments(organization_id);
CREATE INDEX IF NOT EXISTS idx_notifications_organization_id ON notifications(organization_id);

-- Grant necessary permissions to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
