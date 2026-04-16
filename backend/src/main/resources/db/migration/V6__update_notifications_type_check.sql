-- Align notifications type check constraint with NotificationType enum values.
-- This migration is idempotent and safe for environments where the table already exists.

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
    END IF;
END $$;
