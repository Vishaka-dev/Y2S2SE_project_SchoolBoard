-- Fix Schema Migration Issues
-- Run this script in pgAdmin or your PostgreSQL client before starting the backend

-- Step 1: Update existing users to have valid roles
-- Convert old 'USER' role to 'STUDENT' (default role)
UPDATE users 
SET role = 'STUDENT' 
WHERE role = 'USER' OR role NOT IN ('STUDENT', 'TEACHER', 'INSTITUTE', 'ADMIN');

-- Step 2: Clean up profile tables with incomplete data
-- Option A: Delete all profile records (if you don't need existing data)
DELETE FROM student_profiles;
DELETE FROM teacher_profiles;
DELETE FROM institute_profiles;

-- Step 3: Drop and recreate profile tables to ensure clean schema
-- This ensures all constraints are properly set up

-- Drop existing profile tables
DROP TABLE IF EXISTS student_profiles CASCADE;
DROP TABLE IF EXISTS teacher_profiles CASCADE;
DROP TABLE IF EXISTS institute_profiles CASCADE;

-- Recreate student_profiles table
CREATE TABLE student_profiles (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    full_name VARCHAR(200) NOT NULL,
    education_level VARCHAR(50) NOT NULL CHECK (education_level IN ('SCHOOL', 'UNIVERSITY')),
    date_of_birth DATE NOT NULL,
    province VARCHAR(100) NOT NULL,
    interests TEXT,
    
    -- School-specific fields (required when education_level = 'SCHOOL')
    school_name VARCHAR(200),
    grade INTEGER CHECK (grade BETWEEN 1 AND 13),
    
    -- University-specific fields (required when education_level = 'UNIVERSITY')
    university_name VARCHAR(200),
    degree_program VARCHAR(200),
    year_of_study INTEGER CHECK (year_of_study BETWEEN 1 AND 6),
    
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    
    CONSTRAINT fk_student_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Recreate teacher_profiles table
CREATE TABLE teacher_profiles (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    full_name VARCHAR(200) NOT NULL,
    date_of_birth DATE NOT NULL,
    institution_name VARCHAR(200) NOT NULL,
    subject_specialization VARCHAR(200) NOT NULL,
    years_of_experience INTEGER,
    qualifications TEXT,
    province VARCHAR(100) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    
    CONSTRAINT fk_teacher_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Recreate institute_profiles table
CREATE TABLE institute_profiles (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    institution_name VARCHAR(200) NOT NULL,
    institution_type VARCHAR(100) NOT NULL,
    registration_number VARCHAR(100) NOT NULL UNIQUE,
    contact_email VARCHAR(255) NOT NULL,
    contact_phone VARCHAR(20) NOT NULL,
    address TEXT NOT NULL,
    province VARCHAR(100) NOT NULL,
    description TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    
    CONSTRAINT fk_institute_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Step 4: Create indexes for better performance
CREATE INDEX idx_student_profiles_user_id ON student_profiles(user_id);
CREATE INDEX idx_student_profiles_education_level ON student_profiles(education_level);
CREATE INDEX idx_student_profiles_province ON student_profiles(province);

CREATE INDEX idx_teacher_profiles_user_id ON teacher_profiles(user_id);
CREATE INDEX idx_teacher_profiles_institution ON teacher_profiles(institution_name);
CREATE INDEX idx_teacher_profiles_province ON teacher_profiles(province);

CREATE INDEX idx_institute_profiles_user_id ON institute_profiles(user_id);
CREATE INDEX idx_institute_profiles_verified ON institute_profiles(is_verified);
CREATE INDEX idx_institute_profiles_province ON institute_profiles(province);

-- Step 5: Verify the fix
-- Check that all users have valid roles
SELECT role, COUNT(*) as count 
FROM users 
GROUP BY role;

-- Confirm profile tables are empty and ready
SELECT 'student_profiles' as table_name, COUNT(*) as count FROM student_profiles
UNION ALL
SELECT 'teacher_profiles', COUNT(*) FROM teacher_profiles
UNION ALL
SELECT 'institute_profiles', COUNT(*) FROM institute_profiles;

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Schema migration fix completed successfully!';
    RAISE NOTICE 'All user roles have been updated to valid values.';
    RAISE NOTICE 'Profile tables have been recreated with correct schema.';
    RAISE NOTICE 'You can now start your Spring Boot application.';
END $$;
