# Account Management API - Testing Guide

## Prerequisites

- Application running on `http://localhost:8080`
- Valid JWT token obtained from login/register
- Tools: Postman, cURL, or any HTTP client

## Authentication Header

All requests require JWT token in header:

```
Authorization: Bearer <your-jwt-token>
```

---

## Test Scenarios

### 1. Get Current Account Details

#### Request

```http
GET /api/account/me HTTP/1.1
Host: localhost:8080
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

#### Expected Response (200 OK)

```json
{
  "id": 1,
  "email": "student@example.com",
  "username": "student1",
  "role": "STUDENT",
  "provider": "LOCAL",
  "createdAt": "2026-03-03T10:00:00",
  "imageUrl": null,
  "profile": {
    "educationLevel": "SCHOOL",
    "fullName": "John Doe",
    "dateOfBirth": "2005-01-15",
    "province": "Western",
    "schoolName": "Example School",
    "grade": 10,
    "interests": "Science, Math"
  }
}
```

#### cURL Command

```bash
curl -X GET http://localhost:8080/api/account/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

---

### 2. Update Profile Information

#### Test Case 2.1: Update Student Profile (School)

**Request**

```http
PATCH /api/account/me HTTP/1.1
Host: localhost:8080
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "fullName": "John Updated Doe",
  "province": "Central",
  "interests": "Science, Technology, Mathematics",
  "schoolName": "New School Name",
  "grade": 11
}
```

**Expected Response (200 OK)**

```json
{
  "id": 1,
  "email": "student@example.com",
  "username": "student1",
  "role": "STUDENT",
  "provider": "LOCAL",
  "createdAt": "2026-03-03T10:00:00",
  "profile": {
    "fullName": "John Updated Doe",
    "province": "Central",
    "interests": "Science, Technology, Mathematics",
    "schoolName": "New School Name",
    "grade": 11
  }
}
```

#### Test Case 2.2: Update Teacher Profile

**Request**

```http
PATCH /api/account/me HTTP/1.1
Host: localhost:8080
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "fullName": "Dr. Jane Smith",
  "institutionName": "Example University",
  "subjectSpecialization": "Computer Science",
  "yearsOfExperience": 12,
  "qualifications": "PhD in Computer Science, MSc in AI"
}
```

#### Test Case 2.3: Invalid Update (Exceeds Length)

**Request**

```http
PATCH /api/account/me HTTP/1.1
Host: localhost:8080
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "fullName": "ThisIsAVeryLongNameThatExceedsTheMaximumLengthOf100CharactersAndShouldBeRejectedByTheValidationThisIsAVeryLongNameThatExceedsTheMaximumLength"
}
```

**Expected Response (400 Bad Request)**

```json
{
  "timestamp": "2026-03-03T10:00:00",
  "status": 400,
  "error": "Bad Request",
  "message": "Validation failed",
  "path": "/api/account/me",
  "validationErrors": {
    "fullName": "Full name must not exceed 100 characters"
  }
}
```

---

### 3. Change Password

#### Test Case 3.1: Successful Password Change

**Request**

```http
PATCH /api/account/change-password HTTP/1.1
Host: localhost:8080
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "currentPassword": "OldPassword123!",
  "newPassword": "NewPassword123!",
  "confirmPassword": "NewPassword123!"
}
```

**Expected Response (200 OK)**

```json
{
  "message": "Password changed successfully",
  "status": "success"
}
```

**cURL Command**

```bash
curl -X PATCH http://localhost:8080/api/account/change-password \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "OldPassword123!",
    "newPassword": "NewPassword123!",
    "confirmPassword": "NewPassword123!"
  }'
```

#### Test Case 3.2: Wrong Current Password

**Request**

```json
{
  "currentPassword": "WrongPassword123!",
  "newPassword": "NewPassword123!",
  "confirmPassword": "NewPassword123!"
}
```

**Expected Response (400 Bad Request)**

```json
{
  "timestamp": "2026-03-03T10:00:00",
  "status": 400,
  "error": "Bad Request",
  "message": "Current password is incorrect",
  "path": "/api/account/change-password"
}
```

#### Test Case 3.3: Password Mismatch

**Request**

```json
{
  "currentPassword": "OldPassword123!",
  "newPassword": "NewPassword123!",
  "confirmPassword": "DifferentPassword123!"
}
```

**Expected Response (400 Bad Request)**

```json
{
  "timestamp": "2026-03-03T10:00:00",
  "status": 400,
  "error": "Bad Request",
  "message": "New password and confirmation do not match",
  "path": "/api/account/change-password"
}
```

#### Test Case 3.4: Weak Password

**Request**

```json
{
  "currentPassword": "OldPassword123!",
  "newPassword": "weak",
  "confirmPassword": "weak"
}
```

**Expected Response (400 Bad Request)**

```json
{
  "timestamp": "2026-03-03T10:00:00",
  "status": 400,
  "error": "Bad Request",
  "message": "Validation failed",
  "path": "/api/account/change-password",
  "validationErrors": {
    "newPassword": "Password must contain at least one uppercase letter, one lowercase letter, one digit, and one special character"
  }
}
```

#### Test Case 3.5: OAuth2 User Attempting Password Change

**Expected Response (400 Bad Request)**

```json
{
  "timestamp": "2026-03-03T10:00:00",
  "status": 400,
  "error": "Bad Request",
  "message": "Cannot change password for OAuth2 accounts",
  "path": "/api/account/change-password"
}
```

---

### 4. Change Email

#### Test Case 4.1: Successful Email Change

**Request**

```http
PATCH /api/account/change-email HTTP/1.1
Host: localhost:8080
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "newEmail": "newemail@example.com",
  "password": "CurrentPassword123!"
}
```

**Expected Response (200 OK)**

```json
{
  "id": 1,
  "email": "newemail@example.com",
  "username": "student1",
  "role": "STUDENT",
  "provider": "LOCAL",
  "createdAt": "2026-03-03T10:00:00",
  "profile": { ... }
}
```

#### Test Case 4.2: Email Already Exists

**Request**

```json
{
  "newEmail": "existing@example.com",
  "password": "CurrentPassword123!"
}
```

**Expected Response (409 Conflict)**

```json
{
  "timestamp": "2026-03-03T10:00:00",
  "status": 409,
  "error": "Conflict",
  "message": "Email 'existing@example.com' is already in use",
  "path": "/api/account/change-email"
}
```

#### Test Case 4.3: Invalid Email Format

**Request**

```json
{
  "newEmail": "invalid-email-format",
  "password": "CurrentPassword123!"
}
```

**Expected Response (400 Bad Request)**

```json
{
  "timestamp": "2026-03-03T10:00:00",
  "status": 400,
  "error": "Bad Request",
  "message": "Validation failed",
  "path": "/api/account/change-email",
  "validationErrors": {
    "newEmail": "Email must be valid"
  }
}
```

#### Test Case 4.4: Wrong Password

**Request**

```json
{
  "newEmail": "newemail@example.com",
  "password": "WrongPassword123!"
}
```

**Expected Response (400 Bad Request)**

```json
{
  "timestamp": "2026-03-03T10:00:00",
  "status": 400,
  "error": "Bad Request",
  "message": "Password is incorrect",
  "path": "/api/account/change-email"
}
```

---

### 5. Delete Account (Soft Delete)

#### Test Case 5.1: Successful Account Deletion

**Request**

```http
DELETE /api/account/me HTTP/1.1
Host: localhost:8080
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "password": "CurrentPassword123!"
}
```

**Expected Response (200 OK)**

```json
{
  "message": "Account deleted successfully",
  "status": "success"
}
```

**cURL Command**

```bash
curl -X DELETE http://localhost:8080/api/account/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"password": "CurrentPassword123!"}'
```

#### Test Case 5.2: Wrong Password

**Request**

```json
{
  "password": "WrongPassword123!"
}
```

**Expected Response (400 Bad Request)**

```json
{
  "timestamp": "2026-03-03T10:00:00",
  "status": 400,
  "error": "Bad Request",
  "message": "Password is incorrect",
  "path": "/api/account/me"
}
```

#### Test Case 5.3: Attempt to Access Deleted Account

**Request** (after deletion)

```http
GET /api/account/me HTTP/1.1
Host: localhost:8080
Authorization: Bearer SAME_JWT_TOKEN
Content-Type: application/json
```

**Expected Response (403 Forbidden)**

```json
{
  "timestamp": "2026-03-03T10:00:00",
  "status": 403,
  "error": "Forbidden",
  "message": "This account has been deleted",
  "path": "/api/account/me"
}
```

#### Test Case 5.4: Attempt to Login with Deleted Account

**Request**

```http
POST /api/auth/login HTTP/1.1
Host: localhost:8080
Content-Type: application/json

{
  "email": "deleted@example.com",
  "password": "Password123!"
}
```

**Expected Response (403 Forbidden)**

```json
{
  "timestamp": "2026-03-03T10:00:00",
  "status": 403,
  "error": "Forbidden",
  "message": "This account has been deleted and cannot be accessed",
  "path": "/api/auth/login"
}
```

---

## Security Test Scenarios

### Test Case S1: Unauthenticated Access

**Request** (without Authorization header)

```http
GET /api/account/me HTTP/1.1
Host: localhost:8080
Content-Type: application/json
```

**Expected Response (401 Unauthorized)**

```json
{
  "timestamp": "2026-03-03T10:00:00",
  "status": 401,
  "error": "Unauthorized",
  "message": "Full authentication is required to access this resource",
  "path": "/api/account/me"
}
```

### Test Case S2: Expired/Invalid Token

**Request** (with expired token)

```http
GET /api/account/me HTTP/1.1
Host: localhost:8080
Authorization: Bearer EXPIRED_OR_INVALID_TOKEN
Content-Type: application/json
```

**Expected Response (401 Unauthorized)**

---

## Postman Collection Setup

### Environment Variables

```json
{
  "base_url": "http://localhost:8080",
  "jwt_token": "{{your_jwt_token}}",
  "student_email": "student@example.com",
  "teacher_email": "teacher@example.com"
}
```

### Pre-request Script (for all requests)

```javascript
pm.request.headers.add({
  key: "Authorization",
  value: "Bearer " + pm.environment.get("jwt_token"),
});
```

---

## Test Execution Checklist

- [ ] Get account details for STUDENT role
- [ ] Get account details for TEACHER role
- [ ] Get account details for INSTITUTE role
- [ ] Update student profile (school)
- [ ] Update student profile (university)
- [ ] Update teacher profile
- [ ] Update institute profile
- [ ] Change password successfully
- [ ] Change password with wrong current password
- [ ] Change password with mismatched confirmation
- [ ] Change password with weak password
- [ ] Change email successfully
- [ ] Change email to existing address
- [ ] Change email with invalid format
- [ ] Delete account successfully
- [ ] Attempt to access deleted account
- [ ] Test all endpoints without authentication
- [ ] Test all endpoints with expired token
- [ ] Verify profile data persistence after updates
- [ ] Verify soft delete preserves data

---

## Database Verification Queries

### Check Active Users

```sql
SELECT id, email, username, role, is_active, deleted_at
FROM users
WHERE is_active = true;
```

### Check Deleted Users

```sql
SELECT id, email, username, role, is_active, deleted_at
FROM users
WHERE is_active = false OR deleted_at IS NOT NULL;
```

### Verify Profile Updates

```sql
SELECT u.email, sp.full_name, sp.school_name, sp.grade, sp.updated_at
FROM users u
JOIN student_profiles sp ON u.id = sp.user_id
WHERE u.email = 'student@example.com';
```

---

## Notes

1. **JWT Token Expiry**: Tokens typically expire after a set period. Obtain a fresh token if requests fail with 401.

2. **Password Requirements**:
   - Minimum 8 characters
   - At least one uppercase letter
   - At least one lowercase letter
   - At least one digit
   - At least one special character (@$!%\*?&)

3. **Email Validation**: Must be a valid email format (e.g., user@domain.com)

4. **Soft Delete**: Deleted accounts remain in the database with `is_active=false` and `deleted_at` timestamp set.

5. **OAuth2 Accounts**: Cannot change password through this API.

6. **Transaction Rollback**: Any failures during profile update will roll back all changes.
