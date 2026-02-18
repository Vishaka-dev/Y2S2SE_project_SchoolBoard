-- Fix existing users table for OAuth2 integration
-- Run this script to update existing users

-- 1. Update existing users to set provider to LOCAL
UPDATE users SET provider = 'LOCAL' WHERE provider IS NULL;

-- 2. Set default value for provider column (optional, for future records)
ALTER TABLE users ALTER COLUMN provider SET DEFAULT 'LOCAL';

-- 3. Verify the changes
SELECT id, username, email, provider FROM users;
