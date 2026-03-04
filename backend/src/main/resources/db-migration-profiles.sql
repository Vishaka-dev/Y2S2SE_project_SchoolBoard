-- Migration script for role-based registration system
-- Run this script on your PostgreSQL database

-- Step 1: Create student_profiles table
CREATE TABLE IF NOT EXISTS student_profiles (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT UNIQUE NOT NULL,
    education_level VARCHAR(20) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    date_of_birth DATE NOT NULL,
    province VARCHAR(50) NOT NULL,
    interests VARCHAR(500),
    -- School-specific fields (nullable)
    school_name VARCHAR(200),
    grade INTEGER,
    -- University-specific fields (nullable)
    university_name VARCHAR(200),
    degree_program VARCHAR(200),
    year_of_study INTEGER,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP,
    CONSTRAINT fk_student_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT chk_education_level CHECK (education_level IN ('SCHOOL', 'UNIVERSITY')),
    CONSTRAINT chk_grade CHECK (grade >= 1 AND grade <= 13),
    CONSTRAINT chk_year_of_study CHECK (year_of_study >= 1 AND year_of_study <= 6)
);

-- Step 2: Create teacher_profiles table
CREATE TABLE IF NOT EXISTS teacher_profiles (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT UNIQUE NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    date_of_birth DATE NOT NULL,
    province VARCHAR(50) NOT NULL,
    institution_name VARCHAR(200) NOT NULL,
    subject_specialization VARCHAR(200) NOT NULL,
    years_of_experience INTEGER,
    qualifications VARCHAR(500),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP,
    CONSTRAINT fk_teacher_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Step 3: Create institute_profiles table
CREATE TABLE IF NOT EXISTS institute_profiles (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT UNIQUE NOT NULL,
    institution_name VARCHAR(200) NOT NULL,
    institution_type VARCHAR(50) NOT NULL,
    registration_number VARCHAR(100) UNIQUE NOT NULL,
    province VARCHAR(50) NOT NULL,
    district VARCHAR(50) NOT NULL,
    address VARCHAR(500) NOT NULL,
    contact_person VARCHAR(100) NOT NULL,
    contact_number VARCHAR(20) NOT NULL,
    website VARCHAR(200),
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP,
    CONSTRAINT fk_institute_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Step 4: Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_student_education_level ON student_profiles(education_level);
CREATE INDEX IF NOT EXISTS idx_student_province ON student_profiles(province);
CREATE INDEX IF NOT EXISTS idx_teacher_province ON teacher_profiles(province);
CREATE INDEX IF NOT EXISTS idx_teacher_institution ON teacher_profiles(institution_name);
CREATE INDEX IF NOT EXISTS idx_institute_province ON institute_profiles(province);
CREATE INDEX IF NOT EXISTS idx_institute_type ON institute_profiles(institution_type);
CREATE INDEX IF NOT EXISTS idx_institute_verified ON institute_profiles(verified);

-- Step 5: Add comments for documentation
COMMENT ON TABLE student_profiles IS 'Student profile data for both school and university students';
COMMENT ON TABLE teacher_profiles IS 'Teacher profile data';
COMMENT ON TABLE institute_profiles IS 'Educational institute profile data';

COMMENT ON COLUMN student_profiles.education_level IS 'SCHOOL or UNIVERSITY';
COMMENT ON COLUMN student_profiles.grade IS 'Grade for school students (1-13)';
COMMENT ON COLUMN student_profiles.year_of_study IS 'Year of study for university students (1-6)';
COMMENT ON COLUMN institute_profiles.verified IS 'Whether the institute has been verified by admin';

-- Step 6: Verify tables were created
SELECT 
    table_name, 
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public' 
  AND table_name IN ('student_profiles', 'teacher_profiles', 'institute_profiles')
ORDER BY table_name;

-- Step 7: Show table structures
\d student_profiles
\d teacher_profiles
\d institute_profiles

-- Optional: If you have existing users with role 'USER', update them to 'STUDENT'
-- UPDATE users SET role = 'STUDENT' WHERE role = 'USER';
