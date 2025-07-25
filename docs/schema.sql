-- Table to store organization details
CREATE TABLE organizations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address TEXT,
    email VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table for user accounts, linked to organizations
CREATE TABLE users (
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
CREATE TABLE products (
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
        ON DELETE SET NULL,
    UNIQUE (organization_id, sku)
);

-- Table for assessment form templates
CREATE TABLE assessment_templates (
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
CREATE TABLE assessments (
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
        ON DELETE SET NULL,
    CONSTRAINT fk_created_by_user
        FOREIGN KEY(created_by)
        REFERENCES users(id)
        ON DELETE SET NULL
);

-- Table to track traceability requests between organizations
CREATE TABLE trace_requests (
    id SERIAL PRIMARY KEY,
    requesting_organization_id INT NOT NULL,
    target_organization_id INT NOT NULL,
    product_ids INT[], -- Now includes both products and components
    assessment_id INT NOT NULL, -- References specific assessment instance
    -- Self-referencing key for cascading trace
    parent_request_id INT,
    status VARCHAR(50) DEFAULT 'pending', -- "pending", "in_progress", "completed", "rejected", "overdue"
    priority VARCHAR(20) DEFAULT 'medium', -- "low", "medium", "high", "urgent"
    due_date TIMESTAMPTZ,
    message TEXT,
    cascade_settings JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT fk_requesting_organization
        FOREIGN KEY(requesting_organization_id)
        REFERENCES organizations(id),
    CONSTRAINT fk_target_organization
        FOREIGN KEY(target_organization_id)
        REFERENCES organizations(id),
    CONSTRAINT fk_assessment
        FOREIGN KEY(assessment_id)
        REFERENCES assessments(id),
    CONSTRAINT fk_parent_request
        FOREIGN KEY(parent_request_id)
        REFERENCES trace_requests(id)
        ON DELETE SET NULL
);

-- Table to store responses to assessment requests
CREATE TABLE assessment_responses (
    id SERIAL PRIMARY KEY,
    assessment_id INT NOT NULL, -- References the assessment instance
    trace_request_id INT, -- Optional reference to trace request
    responding_organization_id INT NOT NULL,
    submitted_by_user_id VARCHAR(255) NOT NULL, -- Clerk user ID
    -- Stores the actual answers to the form
    response_data JSONB NOT NULL,
    attachments TEXT[],
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT fk_assessment
        FOREIGN KEY(assessment_id)
        REFERENCES assessments(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_trace_request
        FOREIGN KEY(trace_request_id)
        REFERENCES trace_requests(id)
        ON DELETE SET NULL,
    CONSTRAINT fk_responding_organization
        FOREIGN KEY(responding_organization_id)
        REFERENCES organizations(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_submitted_by_user
        FOREIGN KEY(submitted_by_user_id)
        REFERENCES users(id)
        ON DELETE SET NULL
);

-- Table for organization member invites
CREATE TABLE organization_invites (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    organization_id INT NOT NULL,
    organization_role VARCHAR(50) DEFAULT 'employee', -- "admin" | "employee"
    invited_by VARCHAR(255) NOT NULL, -- Clerk user ID
    status VARCHAR(50) DEFAULT 'pending', -- "pending", "sent", "accepted", "expired"
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT fk_invite_organization
        FOREIGN KEY(organization_id)
        REFERENCES organizations(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_invited_by_user
        FOREIGN KEY(invited_by)
        REFERENCES users(id)
        ON DELETE SET NULL
);

-- Table for notifications
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    organization_id INT NOT NULL,
    type VARCHAR(100) NOT NULL,
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

-- Table for integration activities
CREATE TABLE integration_activities (
    id SERIAL PRIMARY KEY,
    organization_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    subtitle VARCHAR(255),
    status VARCHAR(50) NOT NULL, -- "success", "processing", "completed", "failed"
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT fk_activity_organization
        FOREIGN KEY(organization_id)
        REFERENCES organizations(id)
        ON DELETE CASCADE
);

-- Table for file uploads and document processing
CREATE TABLE file_uploads (
    id SERIAL PRIMARY KEY,
    organization_id INT NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    stored_filename VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    mime_type VARCHAR(100),
    description TEXT,
    upload_status VARCHAR(50) DEFAULT 'uploaded', -- "uploaded", "processing", "processed", "failed"
    processing_status VARCHAR(50) DEFAULT 'pending', -- "pending", "processing", "completed", "failed"
    extracted_data JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    uploaded_by VARCHAR(255), -- Clerk user ID
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT fk_upload_organization
        FOREIGN KEY(organization_id)
        REFERENCES organizations(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_uploaded_by_user
        FOREIGN KEY(uploaded_by)
        REFERENCES users(id)
        ON DELETE SET NULL
);

-- Add indexes for foreign keys to improve query performance
CREATE INDEX idx_users_organization_id ON users(organization_id);
CREATE INDEX idx_products_organization_id ON products(organization_id);
CREATE INDEX idx_products_parent_id ON products(parent_id);
CREATE INDEX idx_products_supplier_id ON products(supplier_organization_id);
CREATE INDEX idx_products_type ON products(type);
CREATE INDEX idx_assessment_templates_created_by_org ON assessment_templates(created_by_organization_id);
CREATE INDEX idx_assessments_organization_id ON assessments(organization_id);
CREATE INDEX idx_assessments_template_id ON assessments(template_id);
CREATE INDEX idx_assessments_requesting_organization_id ON assessments(requesting_organization_id);
CREATE INDEX idx_assessments_created_by ON assessments(created_by);
CREATE INDEX idx_assessments_status ON assessments(status);
CREATE INDEX idx_trace_req_req_org ON trace_requests(requesting_organization_id);
CREATE INDEX idx_trace_req_target_org ON trace_requests(target_organization_id);
CREATE INDEX idx_trace_req_assessment ON trace_requests(assessment_id);
CREATE INDEX idx_resp_assessment_id ON assessment_responses(assessment_id);
CREATE INDEX idx_resp_trace_request_id ON assessment_responses(trace_request_id);
CREATE INDEX idx_resp_submitted_by ON assessment_responses(submitted_by_user_id);
CREATE INDEX idx_resp_responding_org ON assessment_responses(responding_organization_id);
CREATE INDEX idx_invites_organization_id ON organization_invites(organization_id);
CREATE INDEX idx_invites_email ON organization_invites(email);
CREATE INDEX idx_notifications_organization_id ON notifications(organization_id);
CREATE INDEX idx_notifications_unread ON notifications(organization_id, is_read);
CREATE INDEX idx_activities_organization_id ON integration_activities(organization_id);
CREATE INDEX idx_uploads_organization_id ON file_uploads(organization_id);
CREATE INDEX idx_uploads_uploaded_by ON file_uploads(uploaded_by);