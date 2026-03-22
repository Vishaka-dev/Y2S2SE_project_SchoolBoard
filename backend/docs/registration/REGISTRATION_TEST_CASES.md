# Registration API Test Cases

## Test with HTTP Client (IntelliJ/VS Code REST Client)

### 1. Register School Student

```http
POST http://localhost:8080/api/auth/register
Content-Type: application/json

{
  "username": "school_student_1",
  "email": "student1@school.com",
  "password": "password123",
  "role": "STUDENT",
  "educationLevel": "SCHOOL",
  "fullName": "Kamal Perera",
  "dateOfBirth": "2008-05-15",
  "province": "Western",
  "interests": "Mathematics, Physics, Cricket",
  "schoolName": "Royal College Colombo",
  "grade": 11
}
```

### 2. Register University Student

```http
POST http://localhost:8080/api/auth/register
Content-Type: application/json

{
  "username": "uni_student_1",
  "email": "student1@uni.com",
  "password": "password123",
  "role": "STUDENT",
  "educationLevel": "UNIVERSITY",
  "fullName": "Nimal Silva",
  "dateOfBirth": "2002-08-20",
  "province": "Southern",
  "interests": "Computer Science, AI, Machine Learning",
  "universityName": "University of Moratuwa",
  "degreeProgram": "BSc Computer Science and Engineering",
  "yearOfStudy": 2
}
```

### 3. Register Teacher

```http
POST http://localhost:8080/api/auth/register
Content-Type: application/json

{
  "username": "teacher_1",
  "email": "teacher1@school.com",
  "password": "password123",
  "role": "TEACHER",
  "fullName": "Sunil Fernando",
  "dateOfBirth": "1985-03-10",
  "province": "Central",
  "institutionName": "Kandy Central College",
  "subjectSpecialization": "Mathematics",
  "yearsOfExperience": 10,
  "qualifications": "BSc Mathematics (Hons), MSc Education"
}
```

### 4. Register Institute

```http
POST http://localhost:8080/api/auth/register
Content-Type: application/json

{
  "username": "royal_college",
  "email": "admin@royal.lk",
  "password": "password123",
  "role": "INSTITUTE",
  "institutionName": "Royal College Colombo",
  "institutionType": "SCHOOL",
  "registrationNumber": "RC-COL-001",
  "province": "Western",
  "district": "Colombo",
  "address": "Rajakeeya Mawatha, Colombo 07, Sri Lanka",
  "contactPerson": "Principal - Dr. B.A. Abeyratne",
  "contactNumber": "+94112123456",
  "website": "https://www.royalcollege.lk"
}
```

## Test Validation Errors

### Missing Education Level for Student

```http
POST http://localhost:8080/api/auth/register
Content-Type: application/json

{
  "username": "invalid_student",
  "email": "invalid@test.com",
  "password": "password123",
  "role": "STUDENT",
  "fullName": "Test User"
}
```

**Expected Response**: 400 Bad Request - "Education level is required for students"

### Missing School Fields

```http
POST http://localhost:8080/api/auth/register
Content-Type: application/json

{
  "username": "invalid_school",
  "email": "invalid@school.com",
  "password": "password123",
  "role": "STUDENT",
  "educationLevel": "SCHOOL",
  "fullName": "Test Student",
  "dateOfBirth": "2008-01-01",
  "province": "Western"
}
```

**Expected Response**: 400 Bad Request - "School name is required for school students"

### Invalid Grade

```http
POST http://localhost:8080/api/auth/register
Content-Type: application/json

{
  "username": "invalid_grade",
  "email": "invalid@grade.com",
  "password": "password123",
  "role": "STUDENT",
  "educationLevel": "SCHOOL",
  "fullName": "Test Student",
  "dateOfBirth": "2008-01-01",
  "province": "Western",
  "schoolName": "Test School",
  "grade": 20
}
```

**Expected Response**: 400 Bad Request - "Grade must be between 1 and 13"

### Missing University Fields

```http
POST http://localhost:8080/api/auth/register
Content-Type: application/json

{
  "username": "invalid_uni",
  "email": "invalid@uni.com",
  "password": "password123",
  "role": "STUDENT",
  "educationLevel": "UNIVERSITY",
  "fullName": "Test Student",
  "dateOfBirth": "2002-01-01",
  "province": "Western"
}
```

**Expected Response**: 400 Bad Request - "University name is required for university students"

### Duplicate Username

```http
POST http://localhost:8080/api/auth/register
Content-Type: application/json

{
  "username": "school_student_1",
  "email": "different@email.com",
  "password": "password123",
  "role": "STUDENT",
  "educationLevel": "SCHOOL",
  "fullName": "Another Student",
  "dateOfBirth": "2008-01-01",
  "province": "Western",
  "schoolName": "Test School",
  "grade": 10
}
```

**Expected Response**: 409 Conflict - "Username already exists"

## Verify Database

After registration, verify data was created:

```sql
-- Check users table
SELECT id, username, email, role, created_at FROM users ORDER BY created_at DESC;

-- Check student profiles
SELECT sp.*, u.username
FROM student_profiles sp
JOIN users u ON sp.user_id = u.id;

-- Check teacher profiles
SELECT tp.*, u.username
FROM teacher_profiles tp
JOIN users u ON tp.user_id = u.id;

-- Check institute profiles
SELECT ip.*, u.username
FROM institute_profiles ip
JOIN users u ON ip.user_id = u.id;
```

## Test Login

After registering, test login:

```http
POST http://localhost:8080/api/auth/login
Content-Type: application/json

{
  "username": "school_student_1",
  "password": "password123"
}
```

## PowerShell Test Script

Save as `test-registration.ps1`:

```powershell
$baseUrl = "http://localhost:8080/api/auth/register"

# Test 1: School Student
Write-Host "Testing School Student Registration..." -ForegroundColor Cyan
$schoolStudent = @{
    username = "test_school_$(Get-Random)"
    email = "school$(Get-Random)@test.com"
    password = "password123"
    role = "STUDENT"
    educationLevel = "SCHOOL"
    fullName = "Test School Student"
    dateOfBirth = "2008-05-15"
    province = "Western"
    interests = "Math, Science"
    schoolName = "Test School"
    grade = 11
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri $baseUrl -Method Post -Body $schoolStudent -ContentType "application/json"
Write-Host "✓ School student registered: $($response.username)" -ForegroundColor Green

# Test 2: University Student
Write-Host "`nTesting University Student Registration..." -ForegroundColor Cyan
$uniStudent = @{
    username = "test_uni_$(Get-Random)"
    email = "uni$(Get-Random)@test.com"
    password = "password123"
    role = "STUDENT"
    educationLevel = "UNIVERSITY"
    fullName = "Test University Student"
    dateOfBirth = "2002-08-20"
    province = "Southern"
    interests = "CS, AI"
    universityName = "Test University"
    degreeProgram = "BSc CS"
    yearOfStudy = 2
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri $baseUrl -Method Post -Body $uniStudent -ContentType "application/json"
Write-Host "✓ University student registered: $($response.username)" -ForegroundColor Green

# Test 3: Teacher
Write-Host "`nTesting Teacher Registration..." -ForegroundColor Cyan
$teacher = @{
    username = "test_teacher_$(Get-Random)"
    email = "teacher$(Get-Random)@test.com"
    password = "password123"
    role = "TEACHER"
    fullName = "Test Teacher"
    dateOfBirth = "1985-03-10"
    province = "Central"
    institutionName = "Test College"
    subjectSpecialization = "Mathematics"
    yearsOfExperience = 10
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri $baseUrl -Method Post -Body $teacher -ContentType "application/json"
Write-Host "✓ Teacher registered: $($response.username)" -ForegroundColor Green

Write-Host "`n✓ All tests passed!" -ForegroundColor Green
```

Run with:

```powershell
.\test-registration.ps1
```
