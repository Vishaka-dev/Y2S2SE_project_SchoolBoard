# Role-Based Registration Architecture

## Overview

This document describes the enhanced registration system using **SOLID principles** and the **Strategy Pattern** to support role-based registration for STUDENT, TEACHER, and INSTITUTE users.

## Architecture Design

### Design Patterns Applied

1. **Strategy Pattern**: Different registration logic for each role
2. **Factory Pattern**: Creates appropriate strategy based on role
3. **Dependency Inversion Principle**: Controller and Service depend on abstractions
4. **Single Responsibility Principle**: Each strategy handles one role type
5. **Open/Closed Principle**: Easy to add new roles without modifying existing code

### Class Diagrams

```
┌─────────────────────────────────────────────────┐
│          RegistrationStrategy (Interface)       │
│  + validateRequest(RegisterRequest)            │
│  + createProfile(User, RegisterRequest)        │
└─────────────────┬───────────────────────────────┘
                  │
        ┌─────────┴──────────┬──────────────────┐
        │                    │                  │
┌───────▼────────┐  ┌────────▼────────┐  ┌─────▼──────────┐
│   Student      │  │    Teacher       │  │   Institute    │
│   Strategy     │  │    Strategy      │  │   Strategy     │
└────────────────┘  └──────────────────┘  └────────────────┘
        │                    │                  │
        └─────────┬──────────┴──────────────────┘
                  │
        ┌─────────▼────────────────┐
        │ RegistrationStrategy     │
        │      Factory             │
        │  + getStrategy(Role)     │
        └──────────────────────────┘
```

## Database Schema

### Users Table (Existing)

```sql
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255),
    role VARCHAR(20) NOT NULL,
    provider VARCHAR(20) DEFAULT 'LOCAL',
    provider_id VARCHAR(255),
    image_url VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

### Student Profiles Table

```sql
CREATE TABLE student_profiles (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    education_level VARCHAR(20) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    date_of_birth DATE NOT NULL,
    province VARCHAR(50) NOT NULL,
    interests VARCHAR(500),
    -- School-specific fields
    school_name VARCHAR(200),
    grade INTEGER,
    -- University-specific fields
    university_name VARCHAR(200),
    degree_program VARCHAR(200),
    year_of_study INTEGER,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP
);
```

### Teacher Profiles Table

```sql
CREATE TABLE teacher_profiles (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    full_name VARCHAR(100) NOT NULL,
    date_of_birth DATE NOT NULL,
    province VARCHAR(50) NOT NULL,
    institution_name VARCHAR(200) NOT NULL,
    subject_specialization VARCHAR(200) NOT NULL,
    years_of_experience INTEGER,
    qualifications VARCHAR(500),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP
);
```

### Institute Profiles Table

```sql
CREATE TABLE institute_profiles (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
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
    updated_at TIMESTAMP
);
```

## API Endpoints

### Register Student (School)

**POST** `/api/auth/register`

```json
{
  "username": "john_school",
  "email": "john@example.com",
  "password": "password123",
  "role": "STUDENT",
  "educationLevel": "SCHOOL",
  "fullName": "John Doe",
  "dateOfBirth": "2008-05-15",
  "province": "Western",
  "interests": "Mathematics, Science, Cricket",
  "schoolName": "Royal College Colombo",
  "grade": 11
}
```

### Register Student (University)

**POST** `/api/auth/register`

```json
{
  "username": "jane_uni",
  "email": "jane@example.com",
  "password": "password123",
  "role": "STUDENT",
  "educationLevel": "UNIVERSITY",
  "fullName": "Jane Smith",
  "dateOfBirth": "2002-08-20",
  "province": "Southern",
  "interests": "Computer Science, AI, Robotics",
  "universityName": "University of Moratuwa",
  "degreeProgram": "BSc Computer Science",
  "yearOfStudy": 2
}
```

### Register Teacher

**POST** `/api/auth/register`

```json
{
  "username": "mr_fernando",
  "email": "fernando@example.com",
  "password": "password123",
  "role": "TEACHER",
  "fullName": "Sunil Fernando",
  "dateOfBirth": "1985-03-10",
  "province": "Central",
  "institutionName": "Kandy Central College",
  "subjectSpecialization": "Mathematics",
  "yearsOfExperience": 10,
  "qualifications": "BSc Mathematics, MSc Education"
}
```

### Register Institute

**POST** `/api/auth/register`

```json
{
  "username": "royal_college",
  "email": "admin@royal.lk",
  "password": "password123",
  "role": "INSTITUTE",
  "institutionName": "Royal College Colombo",
  "institutionType": "SCHOOL",
  "registrationNumber": "RC-001",
  "province": "Western",
  "district": "Colombo",
  "address": "Rajakeeya Mawatha, Colombo 07",
  "contactPerson": "Principal",
  "contactNumber": "+94112123456",
  "website": "https://www.royalcollege.lk"
}
```

## Response Format

### Success Response (201 Created)

```json
{
  "id": 1,
  "username": "john_school",
  "email": "john@example.com",
  "role": "STUDENT",
  "createdAt": "2026-03-01T10:30:00",
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "message": "Registration successful"
}
```

### Error Responses

#### Validation Error (400 Bad Request)

```json
{
  "timestamp": "2026-03-01T10:30:00",
  "status": 400,
  "error": "Bad Request",
  "message": "School name is required for school students",
  "path": "/api/auth/register"
}
```

#### Username Already Exists (409 Conflict)

```json
{
  "timestamp": "2026-03-01T10:30:00",
  "status": 409,
  "error": "Conflict",
  "message": "Username already exists",
  "path": "/api/auth/register"
}
```

## Validation Rules

### Common Fields (All Roles)

- `username`: Required, 3-50 characters, unique
- `email`: Required, valid email format, unique
- `password`: Required, minimum 6 characters
- `role`: Required, must be STUDENT, TEACHER, or INSTITUTE

### Student-Specific

**Common:**

- `educationLevel`: Required (SCHOOL or UNIVERSITY)
- `fullName`: Required
- `dateOfBirth`: Required
- `province`: Required

**School Students:**

- `schoolName`: Required
- `grade`: Required, 1-13

**University Students:**

- `universityName`: Required
- `degreeProgram`: Required
- `yearOfStudy`: Required, 1-6

### Teacher-Specific

- `fullName`: Required
- `dateOfBirth`: Required
- `province`: Required
- `institutionName`: Required
- `subjectSpecialization`: Required
- `yearsOfExperience`: Optional
- `qualifications`: Optional

### Institute-Specific

- `institutionName`: Required
- `institutionType`: Required
- `registrationNumber`: Required, unique
- `province`: Required
- `district`: Required
- `address`: Required
- `contactPerson`: Required
- `contactNumber`: Required
- `website`: Optional
- `verified`: Auto-set to false (admin verification required)

## Testing with cURL

### Register School Student

```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_school",
    "email": "john@example.com",
    "password": "password123",
    "role": "STUDENT",
    "educationLevel": "SCHOOL",
    "fullName": "John Doe",
    "dateOfBirth": "2008-05-15",
    "province": "Western",
    "interests": "Mathematics, Science",
    "schoolName": "Royal College",
    "grade": 11
  }'
```

### Register University Student

```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "jane_uni",
    "email": "jane@example.com",
    "password": "password123",
    "role": "STUDENT",
    "educationLevel": "UNIVERSITY",
    "fullName": "Jane Smith",
    "dateOfBirth": "2002-08-20",
    "province": "Southern",
    "interests": "CS, AI",
    "universityName": "University of Moratuwa",
    "degreeProgram": "BSc CS",
    "yearOfStudy": 2
  }'
```

### Register Teacher

```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "mr_fernando",
    "email": "fernando@example.com",
    "password": "password123",
    "role": "TEACHER",
    "fullName": "Sunil Fernando",
    "dateOfBirth": "1985-03-10",
    "province": "Central",
    "institutionName": "Kandy Central College",
    "subjectSpecialization": "Mathematics",
    "yearsOfExperience": 10
  }'
```

## Architecture Benefits

### ✅ SOLID Principles

1. **Single Responsibility**: Each strategy handles one role type
2. **Open/Closed**: Add new roles by creating new strategies, no modification needed
3. **Liskov Substitution**: All strategies implement the same interface
4. **Interface Segregation**: Clean, focused interface with only required methods
5. **Dependency Inversion**: Service depends on abstraction (RegistrationStrategy), not concrete classes

### ✅ Benefits

- **Maintainability**: Easy to modify role-specific logic
- **Testability**: Each strategy can be tested independently
- **Extensibility**: Add new roles without changing existing code
- **Clarity**: No large if-else blocks, clear separation of concerns
- **Type Safety**: Compile-time checking with enums

### ✅ No Code Smells

- ❌ No God Objects
- ❌ No Large If-Else Chains
- ❌ No Duplicate Code
- ✅ Clean Separation of Concerns
- ✅ Single Source of Truth

## Future Enhancements

1. **Profile Update APIs**: Separate endpoints for updating profiles
2. **Profile Verification**: Email/phone verification for students
3. **Institute Approval Workflow**: Admin dashboard for verifying institutes
4. **Profile Completion**: Track profile completion percentage
5. **Advanced Validation**: Custom validators using Spring Validation
6. **Events**: Publish domain events on profile creation using Spring Events

## Project Structure

```
backend/src/main/java/com/my_app/schoolboard/
├── model/
│   ├── User.java
│   ├── Role.java (STUDENT, TEACHER, INSTITUTE, ADMIN)
│   ├── EducationLevel.java (SCHOOL, UNIVERSITY)
│   ├── StudentProfile.java
│   ├── TeacherProfile.java
│   └── InstituteProfile.java
├── repository/
│   ├── UserRepository.java
│   ├── StudentProfileRepository.java
│   ├── TeacherProfileRepository.java
│   └── InstituteProfileRepository.java
├── strategy/
│   ├── RegistrationStrategy.java (interface)
│   ├── StudentRegistrationStrategy.java
│   ├── TeacherRegistrationStrategy.java
│   └── InstituteRegistrationStrategy.java
├── factory/
│   └── RegistrationStrategyFactory.java
├── dto/
│   ├── RegisterRequest.java (enhanced with all fields)
│   └── AuthResponse.java
├── service/
│   ├── AuthService.java (interface)
│   └── impl/
│       └── AuthServiceImpl.java (uses factory and strategies)
├── controller/
│   └── AuthController.java
└── exception/
    └── (existing exception handlers)
```

## Summary

This architecture provides a **clean, maintainable, and extensible** solution for role-based registration following industry best practices and SOLID principles. The Strategy Pattern eliminates code duplication and makes it easy to add new user types in the future.
