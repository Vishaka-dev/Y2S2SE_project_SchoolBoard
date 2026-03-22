-- ============================================================================
-- Account Management Feature - Database Migration Script
-- ============================================================================
-- Description: Adds soft delete support to the users table
-- Version: 1.0
-- Date: 2026-03-03
-- ============================================================================

-- Add soft delete columns to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true NOT NULL,
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;

-- Update existing users to set is_active to true
UPDATE users 
SET is_active = true 
WHERE is_active IS NULL;

-- Create indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);
CREATE INDEX IF NOT EXISTS idx_users_email_active ON users(email, is_active);
CREATE INDEX IF NOT EXISTS idx_users_username_active ON users(username, is_active);

-- Add comment to columns for documentation
COMMENT ON COLUMN users.is_active IS 'Indicates if the account is active (false for soft-deleted accounts)';
COMMENT ON COLUMN users.deleted_at IS 'Timestamp when the account was soft deleted';

-- ============================================================================
-- Verification Queries
-- ============================================================================
-- Use these queries to verify the migration was successful:

-- Check if columns were added
-- SELECT column_name, data_type, is_nullable, column_default
-- FROM information_schema.columns
-- WHERE table_name = 'users' AND column_name IN ('is_active', 'deleted_at');

-- Check if indexes were created
-- SELECT indexname, indexdef
-- FROM pg_indexes
-- WHERE tablename = 'users' AND indexname LIKE 'idx_users_%active%';

-- Count active vs inactive users
-- SELECT 
--   is_active,
--   COUNT(*) as count
-- FROM users
-- GROUP BY is_active;

-- ============================================================================
-- Rollback Script (if needed)
-- ============================================================================
-- WARNING: Use with caution - this will remove soft delete functionality

-- DROP INDEX IF EXISTS idx_users_is_active;
-- DROP INDEX IF EXISTS idx_users_email_active;
-- DROP INDEX IF EXISTS idx_users_username_active;
-- ALTER TABLE users DROP COLUMN IF EXISTS is_active;
-- ALTER TABLE users DROP COLUMN IF EXISTS deleted_at;

-- ============================================================================
