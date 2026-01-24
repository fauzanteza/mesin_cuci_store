-- ============================================
-- ADD DELETED_AT COLUMNS FOR SOFT DELETE
-- Migration to add deleted_at columns to tables
-- ============================================
USE mesin_cuci_store;
-- Add deleted_at to users table
ALTER TABLE users
ADD COLUMN deleted_at TIMESTAMP NULL DEFAULT NULL
AFTER updated_at;
-- Add deleted_at to products table
ALTER TABLE products
ADD COLUMN deleted_at TIMESTAMP NULL DEFAULT NULL
AFTER updated_at;
-- Add deleted_at to orders table
ALTER TABLE orders
ADD COLUMN deleted_at TIMESTAMP NULL DEFAULT NULL
AFTER updated_at;
-- Add deleted_at to categories table (optional, for consistency)
ALTER TABLE categories
ADD COLUMN deleted_at TIMESTAMP NULL DEFAULT NULL
AFTER updated_at;
-- Add deleted_at to brands table (optional, for consistency)
ALTER TABLE brands
ADD COLUMN deleted_at TIMESTAMP NULL DEFAULT NULL
AFTER updated_at;
-- Add deleted_at to addresses table (optional, for consistency)
ALTER TABLE addresses
ADD COLUMN deleted_at TIMESTAMP NULL DEFAULT NULL
AFTER updated_at;
-- Add deleted_at to reviews table (optional, for consistency)
ALTER TABLE reviews
ADD COLUMN deleted_at TIMESTAMP NULL DEFAULT NULL
AFTER updated_at;
-- Verify the changes
SELECT TABLE_NAME,
    COLUMN_NAME,
    COLUMN_TYPE,
    IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'mesin_cuci_store'
    AND COLUMN_NAME = 'deleted_at'
ORDER BY TABLE_NAME;