-- V4: Migrate student interests from a single VARCHAR column
--     to a normalized collection table (supports List<String> via @ElementCollection)

-- Drop the old single-string column (no longer needed)
ALTER TABLE student_profiles DROP COLUMN IF EXISTS interests;

-- Create the new normalized interests collection table
CREATE TABLE IF NOT EXISTS student_interests (
    student_profile_id BIGINT       NOT NULL,
    interest           VARCHAR(100) NOT NULL,
    CONSTRAINT fk_student_interests_profile
        FOREIGN KEY (student_profile_id)
        REFERENCES student_profiles(id)
        ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_student_interests_profile_id
    ON student_interests(student_profile_id);
