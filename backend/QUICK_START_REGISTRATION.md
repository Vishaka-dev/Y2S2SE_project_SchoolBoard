# Quick Start Guide - Role-Based Registration

## Prerequisites

✅ PostgreSQL database running on localhost:5432  
✅ Database `school_board` created  
✅ `.env` file configured in `backend/` directory  
✅ Maven installed (or use `mvnw`)

## Step 1: Run Database Migration

Open PostgreSQL command line or pgAdmin and run:

```bash
psql -U postgres -d school_board -f backend/src/main/resources/db-migration-profiles.sql
```

Or manually execute the SQL from the file to create these tables:

- `student_profiles`
- `teacher_profiles`
- `institute_profiles`

## Step 2: Build the Backend

```powershell
cd backend
.\mvnw clean install
```

## Step 3: Start the Backend

```powershell
.\run.ps1
```

or

```powershell
.\mvnw spring-boot:run
```

The application should start on **http://localhost:8080**

## Step 4: Test the Registration Endpoints

### Test 1: Register a School Student

```powershell
$response = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/register" `
  -Method Post `
  -ContentType "application/json" `
  -Body (@{
    username = "kamal_school"
    email = "kamal@school.com"
    password = "password123"
    role = "STUDENT"
    educationLevel = "SCHOOL"
    fullName = "Kamal Perera"
    dateOfBirth = "2008-05-15"
    province = "Western"
    interests = "Mathematics, Physics, Cricket"
    schoolName = "Royal College Colombo"
    grade = 11
  } | ConvertTo-Json)

Write-Host "✓ Registration successful!" -ForegroundColor Green
Write-Host "Username: $($response.username)" -ForegroundColor Cyan
Write-Host "Role: $($response.role)" -ForegroundColor Cyan
Write-Host "Token: $($response.token.Substring(0, 50))..." -ForegroundColor Yellow
```

### Test 2: Register a University Student

```powershell
$response = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/register" `
  -Method Post `
  -ContentType "application/json" `
  -Body (@{
    username = "nimal_uni"
    email = "nimal@uni.com"
    password = "password123"
    role = "STUDENT"
    educationLevel = "UNIVERSITY"
    fullName = "Nimal Silva"
    dateOfBirth = "2002-08-20"
    province = "Southern"
    interests = "Computer Science, AI, Machine Learning"
    universityName = "University of Moratuwa"
    degreeProgram = "BSc Computer Science"
    yearOfStudy = 2
  } | ConvertTo-Json)

Write-Host "✓ University student registered!" -ForegroundColor Green
```

### Test 3: Register a Teacher

```powershell
$response = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/register" `
  -Method Post `
  -ContentType "application/json" `
  -Body (@{
    username = "mr_fernando"
    email = "fernando@school.com"
    password = "password123"
    role = "TEACHER"
    fullName = "Sunil Fernando"
    dateOfBirth = "1985-03-10"
    province = "Central"
    institutionName = "Kandy Central College"
    subjectSpecialization = "Mathematics"
    yearsOfExperience = 10
    qualifications = "BSc Mathematics, MSc Education"
  } | ConvertTo-Json)

Write-Host "✓ Teacher registered!" -ForegroundColor Green
```

### Test 4: Register an Institute

```powershell
$response = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/register" `
  -Method Post `
  -ContentType "application/json" `
  -Body (@{
    username = "royal_college"
    email = "admin@royal.lk"
    password = "password123"
    role = "INSTITUTE"
    institutionName = "Royal College Colombo"
    institutionType = "SCHOOL"
    registrationNumber = "RC-COL-001"
    province = "Western"
    district = "Colombo"
    address = "Rajakeeya Mawatha, Colombo 07"
    contactPerson = "Principal"
    contactNumber = "+94112123456"
    website = "https://www.royalcollege.lk"
  } | ConvertTo-Json)

Write-Host "✓ Institute registered!" -ForegroundColor Green
```

## Step 5: Verify Database

Connect to PostgreSQL and run:

```sql
-- Check all users
SELECT id, username, email, role, created_at FROM users ORDER BY created_at DESC;

-- Check student profiles
SELECT
    u.username,
    sp.full_name,
    sp.education_level,
    sp.school_name,
    sp.university_name
FROM student_profiles sp
JOIN users u ON sp.user_id = u.id;

-- Check teacher profiles
SELECT
    u.username,
    tp.full_name,
    tp.institution_name,
    tp.subject_specialization
FROM teacher_profiles tp
JOIN users u ON tp.user_id = u.id;

-- Check institute profiles
SELECT
    u.username,
    ip.institution_name,
    ip.registration_number,
    ip.verified
FROM institute_profiles ip
JOIN users u ON ip.user_id = u.id;
```

## Step 6: Test Login

```powershell
$response = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" `
  -Method Post `
  -ContentType "application/json" `
  -Body (@{
    username = "kamal_school"
    password = "password123"
  } | ConvertTo-Json)

Write-Host "✓ Login successful!" -ForegroundColor Green
Write-Host "Token: $($response.token.Substring(0, 50))..." -ForegroundColor Yellow
```

## Step 7: Test Validation

### Test Missing Fields

```powershell
try {
    Invoke-RestMethod -Uri "http://localhost:8080/api/auth/register" `
      -Method Post `
      -ContentType "application/json" `
      -Body (@{
        username = "invalid_student"
        email = "invalid@test.com"
        password = "password123"
        role = "STUDENT"
        fullName = "Test User"
      } | ConvertTo-Json)
} catch {
    $error = $_.ErrorDetails.Message | ConvertFrom-Json
    Write-Host "✓ Validation working: $($error.message)" -ForegroundColor Yellow
}
```

## Complete Test Script

Save as `test-all-registrations.ps1`:

```powershell
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Testing Role-Based Registration" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$baseUrl = "http://localhost:8080/api/auth"

# Function to test registration
function Test-Registration {
    param($name, $data)

    try {
        Write-Host "Testing $name..." -ForegroundColor Cyan
        $response = Invoke-RestMethod -Uri "$baseUrl/register" -Method Post -Body ($data | ConvertTo-Json) -ContentType "application/json"
        Write-Host "✓ Success: $($response.username) ($($response.role))" -ForegroundColor Green
        return $response
    } catch {
        Write-Host "✗ Failed: $_" -ForegroundColor Red
        return $null
    }
}

# Test School Student
$schoolStudent = @{
    username = "test_school_$(Get-Random -Maximum 9999)"
    email = "school$(Get-Random -Maximum 9999)@test.com"
    password = "password123"
    role = "STUDENT"
    educationLevel = "SCHOOL"
    fullName = "Test School Student"
    dateOfBirth = "2008-05-15"
    province = "Western"
    interests = "Math, Science"
    schoolName = "Test School"
    grade = 11
}
Test-Registration "School Student" $schoolStudent

# Test University Student
$uniStudent = @{
    username = "test_uni_$(Get-Random -Maximum 9999)"
    email = "uni$(Get-Random -Maximum 9999)@test.com"
    password = "password123"
    role = "STUDENT"
    educationLevel = "UNIVERSITY"
    fullName = "Test Uni Student"
    dateOfBirth = "2002-08-20"
    province = "Southern"
    interests = "CS, AI"
    universityName = "Test University"
    degreeProgram = "BSc CS"
    yearOfStudy = 2
}
Test-Registration "University Student" $uniStudent

# Test Teacher
$teacher = @{
    username = "test_teacher_$(Get-Random -Maximum 9999)"
    email = "teacher$(Get-Random -Maximum 9999)@test.com"
    password = "password123"
    role = "TEACHER"
    fullName = "Test Teacher"
    dateOfBirth = "1985-03-10"
    province = "Central"
    institutionName = "Test College"
    subjectSpecialization = "Mathematics"
    yearsOfExperience = 10
}
Test-Registration "Teacher" $teacher

# Test Institute
$institute = @{
    username = "test_inst_$(Get-Random -Maximum 9999)"
    email = "inst$(Get-Random -Maximum 9999)@test.com"
    password = "password123"
    role = "INSTITUTE"
    institutionName = "Test Institute"
    institutionType = "SCHOOL"
    registrationNumber = "TEST-$(Get-Random -Maximum 9999)"
    province = "Western"
    district = "Colombo"
    address = "Test Address"
    contactPerson = "Test Person"
    contactNumber = "+94112345678"
}
Test-Registration "Institute" $institute

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  All Tests Completed!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
```

Run with:

```powershell
.\test-all-registrations.ps1
```

## Expected Console Output

When you run the backend, you should see logs like:

```
INFO  c.m.s.s.i.AuthServiceImpl - Attempting to register user: kamal_school with role: STUDENT
DEBUG c.m.s.s.StudentRegistrationStrategy - Validating student registration request
DEBUG c.m.s.s.StudentRegistrationStrategy - Student registration request validated successfully
INFO  c.m.s.s.i.AuthServiceImpl - User created successfully: kamal_school with role: STUDENT
INFO  c.m.s.s.StudentRegistrationStrategy - Creating student profile for user: kamal_school with education level: SCHOOL
INFO  c.m.s.s.StudentRegistrationStrategy - Student profile created successfully for user: kamal_school
```

## Troubleshooting

### Error: "Education level is required for students"

- Make sure you include `educationLevel` field in the request for STUDENT role

### Error: "School name is required for school students"

- For SCHOOL students, include `schoolName` and `grade`
- For UNIVERSITY students, include `universityName`, `degreeProgram`, and `yearOfStudy`

### Error: "Username already exists"

- Choose a different username or check the database

### Database Connection Error

- Verify PostgreSQL is running
- Check `.env` file has correct database credentials
- Verify database `school_board` exists

## Next Steps

1. ✅ Registration working with all roles
2. ✅ Profile creation automated via Strategy Pattern
3. ✅ Validation working correctly
4. 📋 Build frontend forms for each role
5. 📋 Add profile update endpoints
6. 📋 Add profile viewing endpoints
7. 📋 Add admin panel for institute verification

## Architecture Summary

```
User Registration Flow:
1. Request arrives at AuthController
2. Basic validation (username, email, password)
3. Factory selects appropriate strategy based on role
4. Strategy validates role-specific fields
5. User entity created and saved
6. Strategy creates profile (StudentProfile/TeacherProfile/InstituteProfile)
7. JWT token generated
8. Response sent to client

✅ No if-else chains
✅ Easy to add new roles
✅ Each strategy is independently testable
✅ Clean separation of concerns
```

Enjoy your clean, maintainable, SOLID-compliant registration system! 🚀
