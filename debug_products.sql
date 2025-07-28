-- Debug script to check product data in database
-- Run this to see what's actually in your products table

-- Check if the specific product exists
SELECT id, name, sku, organization_id 
FROM products 
WHERE id = 'bb22cc33-dd44-5ee5-ff66-778899aabbcc';

-- Check all products in the organization
SELECT id, name, sku, type, organization_id
FROM products 
WHERE organization_id = '87b2f94e-9e22-5fe5-ae9f-fa08574f3ee3'
ORDER BY name;

-- Check if parent_ids column exists
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'products' 
AND column_name = 'parent_ids';

-- Count total products
SELECT COUNT(*) as total_products FROM products;

-- Check organization data
SELECT id, name FROM organizations WHERE id = '87b2f94e-9e22-5fe5-ae9f-fa08574f3ee3';
