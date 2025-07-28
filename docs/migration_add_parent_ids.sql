-- Migration script to add parent_ids column to products table
-- Run this script to update your existing database

-- Add the parent_ids column to the products table
ALTER TABLE products 
ADD COLUMN parent_ids UUID[] DEFAULT '{}';

-- Add comment for the new column
COMMENT ON COLUMN products.parent_ids IS 'Array of parent product IDs from other organizations that import this product';

-- Update any existing data if needed (optional)
-- UPDATE products SET parent_ids = '{}' WHERE parent_ids IS NULL;

-- Create index for parent_ids to improve query performance
CREATE INDEX idx_products_parent_ids ON products USING GIN(parent_ids);
