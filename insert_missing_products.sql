-- Script to import CSV data into database if it's missing
-- This will insert the data from products_rows.csv

-- First, apply the migration to add parent_ids column if not done already
-- \i docs/migration_add_parent_ids.sql

-- Insert TV products data (the ones mentioned in the URL)
INSERT INTO products (
  id, organization_id, parent_ids, children_ids, name, sku, description, category, type, 
  quantity, unit, metadata, data_completeness, missing_data_fields, status, 
  created_at, updated_at
) VALUES 
(
  'aa11bb22-cc33-5dd4-ee55-ff6677889900'::uuid,
  '87b2f94e-9e22-5fe5-ae9f-fa08574f3ee3'::uuid,
  '{}',
  '{bb22cc33-dd44-5ee5-ff66-778899aabbcc,cc33dd44-ee55-5ff6-6778-899aabbccdde}',
  'Premium LED TV',
  'TV-001',
  '55-inch 4K Smart TV with eco-friendly features',
  'Electronics',
  'final_product',
  1.0000,
  'pcs',
  '{"brand": "EcoTech", "originCountry": "South Korea", "sustainabilityScore": 78}',
  83.20,
  '{packaging_materials,energy_consumption}',
  'active',
  '2024-03-01 09:00:00+00',
  '2024-03-15 10:30:00+00'
),
(
  'bb22cc33-dd44-5ee5-ff66-778899aabbcc'::uuid,
  '87b2f94e-9e22-5fe5-ae9f-fa08574f3ee3'::uuid,
  '{aa11bb22-cc33-5dd4-ee55-ff6677889900}',
  '{}',
  'TV Display Panel',
  'PANEL-001',
  '55-inch OLED display panel',
  'Electronics',
  'component',
  1.0000,
  'pcs',
  '{"materialType": "OLED", "originCountry": "South Korea", "certifications": ["RoHS"], "carbonFootprint": 28.5, "sustainabilityScore": 72}',
  79.40,
  '{rare_earth_sourcing,manufacturing_energy}',
  'active',
  '2024-03-01 09:15:00+00',
  '2024-03-15 10:45:00+00'
),
(
  'cc33dd44-ee55-5ff6-6778-899aabbccdde'::uuid,
  '87b2f94e-9e22-5fe5-ae9f-fa08574f3ee3'::uuid,
  '{aa11bb22-cc33-5dd4-ee55-ff6677889900}',
  '{}',
  'TV Circuit Board',
  'BOARD-001',
  'Main processing unit for smart TV',
  'Electronics',
  'component',
  1.0000,
  'pcs',
  '{"materialType": "PCB", "originCountry": "Taiwan", "certifications": ["RoHS"], "carbonFootprint": 12.3, "sustainabilityScore": 68}',
  74.60,
  '{conflict_minerals,waste_disposal}',
  'active',
  '2024-03-01 09:30:00+00',
  '2024-03-15 11:00:00+00'
)
ON CONFLICT (id) DO UPDATE SET
  parent_ids = EXCLUDED.parent_ids,
  children_ids = EXCLUDED.children_ids,
  name = EXCLUDED.name,
  sku = EXCLUDED.sku,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  type = EXCLUDED.type,
  quantity = EXCLUDED.quantity,
  unit = EXCLUDED.unit,
  metadata = EXCLUDED.metadata,
  data_completeness = EXCLUDED.data_completeness,
  missing_data_fields = EXCLUDED.missing_data_fields,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
