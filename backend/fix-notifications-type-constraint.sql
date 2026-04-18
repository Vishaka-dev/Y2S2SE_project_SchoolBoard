-- Fix notifications type check constraint drift.
-- Use this when follow/reaction requests fail with SQLState 23514 and notifications_type_check.

-- Optional: inspect current constraint definition.
SELECT
    con.conname AS constraint_name,
    pg_get_constraintdef(con.oid) AS definition
FROM pg_constraint con
JOIN pg_class rel ON rel.oid = con.conrelid
JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
WHERE rel.relname = 'notifications'
  AND nsp.nspname = 'public'
  AND con.conname = 'notifications_type_check';

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'public'
          AND table_name = 'notifications'
    ) THEN
        ALTER TABLE notifications
            DROP CONSTRAINT IF EXISTS notifications_type_check;

        ALTER TABLE notifications
            ADD CONSTRAINT notifications_type_check
            CHECK (
                type IN (
                    'RESOURCE_UPLOADED',
                    'PROFILE_UPDATED',
                    'PASSWORD_CHANGED',
                    'GROUP_CREATED',
                    'MESSAGE_RECEIVED',
                    'EVENT_CREATED',
                    'USER_FOLLOWED',
                    'POST_REACTED'
                )
            );

        RAISE NOTICE 'Updated notifications_type_check constraint successfully.';
    ELSE
        RAISE NOTICE 'Table notifications does not exist, skipping constraint fix.';
    END IF;
END $$;

-- Verify final constraint definition.
SELECT
    con.conname AS constraint_name,
    pg_get_constraintdef(con.oid) AS definition
FROM pg_constraint con
JOIN pg_class rel ON rel.oid = con.conrelid
JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
WHERE rel.relname = 'notifications'
  AND nsp.nspname = 'public'
  AND con.conname = 'notifications_type_check';
