# Postman Testing Guide - SchoolBoard API

This guide provides step-by-step instructions for testing the SchoolBoard authentication APIs using Postman.

## 🔧 Prerequisites

1. **Backend Server Running**: Ensure your backend is running on `http://localhost:8080`
2. **Postman Installed**: Download from [postman.com](https://www.postman.com/downloads/)
3. **Database Running**: PostgreSQL should be running and accessible

## 📋 Base URL

```
http://localhost:8080
```

---

## 1️⃣ User Registration (Sign Up)

### Endpoint

```
POST http://localhost:8080/api/auth/register
```

### Headers

```
Content-Type: application/json
```

### Common Fields (Required for All Users)

- `username`: String (3-50 characters)
- `email`: Valid email address
- `password`: String (minimum 6 characters)
- `role`: Enum - `STUDENT`, `TEACHER`, `INSTITUTE`, or `ADMIN`

---

### 📚 Register as SCHOOL STUDENT

**Request Body:**

```json
{
  "username": "student_john",
  "email": "john.student@example.com",
  "password": "password123",
  "role": "STUDENT",
  "fullName": "John Smith",
  "dateOfBirth": "2008-05-15",
  "province": "Western",
  "educationLevel": "SCHOOL",
  "schoolName": "Royal College",
  "grade": 10,
  "interests": "Mathematics, Science, Cricket"
}
```

**Expected Response (201 Created):**

```json
{
  "id": 1,
  "username": "student_john",
  "email": "john.student@example.com",
  "role": "STUDENT",
  "createdAt": "2026-03-04T10:30:00",
  "token": "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJzdHVkZW50X2pvaG4iLCJpYXQiOjE3MDk1NDM...",
  "message": "Registration successful"
}
```

---

### 🎓 Register as UNIVERSITY STUDENT

**Request Body:**

```json
{
  "username": "uni_sarah",
  "email": "sarah.uni@example.com",
  "password": "password123",
  "role": "STUDENT",
  "fullName": "Sarah Williams",
  "dateOfBirth": "2003-08-20",
  "province": "Central",
  "educationLevel": "UNIVERSITY",
  "universityName": "University of Colombo",
  "degreeProgram": "Computer Science",
  "yearOfStudy": 2,
  "interests": "AI, Web Development, Research"
}
```

---

### 👨‍🏫 Register as TEACHER

**Request Body:**

```json
{
  "username": "teacher_mike",
  "email": "mike.teacher@example.com",
  "password": "password123",
  "role": "TEACHER",
  "fullName": "Michael Johnson",
  "dateOfBirth": "1985-03-12",
  "province": "Southern",
  "institutionName": "St. Thomas College",
  "subjectSpecialization": "Mathematics and Physics",
  "yearsOfExperience": 12,
  "qualifications": "B.Sc. (Hons) Mathematics, M.Sc. Education"
}
```

---

### 🏫 Register as INSTITUTE

**Request Body:**

```json
{
  "username": "royal_college",
  "email": "admin@royalcollege.lk",
  "password": "password123",
  "role": "INSTITUTE",
  "fullName": "Royal College Colombo",
  "institutionType": "National School",
  "registrationNumber": "REG-001-WP",
  "province": "Western",
  "district": "Colombo",
  "address": "Rajakeeya Mawatha, Colombo 7",
  "contactPerson": "Principal A.B.C. Perera",
  "contactNumber": "+94112345678",
  "website": "https://www.royalcollege.lk"
}
```

---

### 🔐 Register as ADMIN

**Request Body:**

```json
{
  "username": "admin_user",
  "email": "admin@schoolboard.com",
  "password": "securepassword123",
  "role": "ADMIN",
  "fullName": "System Administrator",
  "province": "Western"
}
```

---

## 2️⃣ User Login

### Endpoint

```
POST http://localhost:8080/api/auth/login
```

### Headers

```
Content-Type: application/json
```

### Request Body (Login with Username)

```json
{
  "username": "student_john",
  "password": "password123"
}
```

### Alternative: Login with Email

```json
{
  "username": "john.student@example.com",
  "password": "password123"
}
```

### Expected Response (200 OK)

```json
{
  "id": 1,
  "username": "student_john",
  "email": "john.student@example.com",
  "role": "STUDENT",
  "createdAt": "2026-03-04T10:30:00",
  "token": "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJzdHVkZW50X2pvaG4iLCJpYXQiOjE3MDk1NDM...",
  "message": "Login successful"
}
```

---

## 3️⃣ Using JWT Token for Protected Endpoints

After successful login/registration, you'll receive a JWT token. Use this token for authenticated requests.

### Step 1: Copy the Token

From the login/register response, copy the `token` value.

### Step 2: Add Authorization Header

For any protected endpoint requests, add the following header:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJzdHVkZW50X2pvaG4iLCJpYXQiOjE3MDk1NDM...
```

### Example: Get User Account

```
GET http://localhost:8080/api/account/me
```

**Headers:**

```
Authorization: Bearer <your-jwt-token>
```

---

## 🧪 Postman Collection Setup

### Option 1: Manual Setup

1. **Create a New Collection**
   - Name it "SchoolBoard API"
   - Add a variable `baseUrl` with value `http://localhost:8080`

2. **Add Environment Variables**
   - Create environment: "SchoolBoard Local"
   - Add variable: `jwt_token` (leave empty initially)

3. **Auto-save Token Script**
   - In Login/Register requests, go to "Tests" tab
   - Add this script to automatically save the token:

   ```javascript
   if (pm.response.code === 200 || pm.response.code === 201) {
     var jsonData = pm.response.json();
     pm.environment.set("jwt_token", jsonData.token);
     console.log("Token saved:", jsonData.token);
   }
   ```

4. **Use Token in Protected Requests**
   - In Authorization tab: Select "Bearer Token"
   - Token field: `{{jwt_token}}`

### Option 2: Import Collection

Create a `SchoolBoard.postman_collection.json` file with all the requests pre-configured (see below).

---

## ❌ Common Errors and Solutions

### 400 Bad Request - Validation Errors

**Response:**

```json
{
  "timestamp": "2026-03-04T10:30:00",
  "status": 400,
  "error": "Bad Request",
  "message": "Validation failed",
  "errors": {
    "email": "Email should be valid",
    "password": "Password must be at least 6 characters"
  }
}
```

**Solution:** Check all required fields and validation rules.

### 401 Unauthorized

**Response:**

```json
{
  "error": "Unauthorized",
  "message": "Authentication required"
}
```

**Solution:** Ensure you've added the Authorization header with a valid JWT token.

### 409 Conflict - User Already Exists

**Response:**

```json
{
  "timestamp": "2026-03-04T10:30:00",
  "status": 409,
  "error": "Conflict",
  "message": "Username or email already exists"
}
```

**Solution:** Use a different username or email address.

### 500 Internal Server Error

**Solution:** Check backend logs for details. Common causes:

- Database connection issues
- Missing environment variables
- Invalid data types

---

## 🔍 Testing Checklist

### Registration Tests

- ✅ Register as School Student
- ✅ Register as University Student
- ✅ Register as Teacher
- ✅ Register as Institute
- ✅ Register as Admin
- ✅ Try duplicate username (should fail)
- ✅ Try duplicate email (should fail)
- ✅ Try invalid email format (should fail)
- ✅ Try short password < 6 chars (should fail)

### Login Tests

- ✅ Login with username
- ✅ Login with email
- ✅ Login with wrong password (should fail)
- ✅ Login with non-existent user (should fail)

### Token Tests

- ✅ Access protected endpoint with valid token
- ✅ Access protected endpoint without token (should fail)
- ✅ Access protected endpoint with expired token (should fail)
- ✅ Access protected endpoint with invalid token (should fail)

---

## 📊 Quick Test Data Set

Here are 4 test users you can quickly create:

**Student:**

```json
{
  "username": "test_student",
  "email": "student@test.com",
  "password": "test123",
  "role": "STUDENT",
  "fullName": "Test Student",
  "educationLevel": "SCHOOL",
  "schoolName": "Test School",
  "grade": 10
}
```

**Teacher:**

```json
{
  "username": "test_teacher",
  "email": "teacher@test.com",
  "password": "test123",
  "role": "TEACHER",
  "fullName": "Test Teacher",
  "institutionName": "Test School",
  "subjectSpecialization": "Mathematics",
  "yearsOfExperience": 5
}
```

**Institute:**

```json
{
  "username": "test_institute",
  "email": "institute@test.com",
  "password": "test123",
  "role": "INSTITUTE",
  "fullName": "Test Institute",
  "institutionType": "School",
  "registrationNumber": "TEST-001",
  "contactPerson": "Test Admin",
  "contactNumber": "0771234567"
}
```

**Admin:**

```json
{
  "username": "test_admin",
  "email": "admin@test.com",
  "password": "test123",
  "role": "ADMIN",
  "fullName": "Test Admin"
}
```

---

## 4️⃣ Upload Profile Photo

Profile photo upload is available only for authenticated users and should be done after login.

### Endpoint

```
POST http://localhost:8080/api/account/profile-photo
```

### Headers

```
Authorization: Bearer <your-jwt-token>
```

### Request Type

**Body Type**: `form-data` (NOT `raw` JSON)

### Form Data

- **Key**: `file`
- **Type**: File
- **Value**: Select your image file

### Requirements

- **Allowed formats**: JPEG, JPG, PNG
- **Maximum size**: 5MB
- **Authentication**: Required (JWT token in header)

### Postman Setup Steps

1. **Set Request Type**: POST
2. **Enter URL**: `http://localhost:8080/api/account/profile-photo`
3. **Add Authorization**:
   - Go to "Authorization" tab
   - Type: Bearer Token
   - Token: Paste your JWT token (from login response)
4. **Set Body**:
   - Go to "Body" tab
   - Select "form-data" (NOT "raw")
   - Add key: `file`
   - Change type from "Text" to "File" (dropdown on right)
   - Click "Select Files" and choose your image
5. **Send Request**

### Expected Response (200 OK)

```json
{
  "profileImageUrl": "http://localhost:8080/uploads/profile-images/profile_1_1709543245678.jpg",
  "message": "Profile photo uploaded successfully"
}
```

### Verifying Upload

After successful upload:

1. Call `GET /api/account/me` to see the updated profile
2. The response will include `imageUrl` with your new profile photo URL
3. You can access the image directly in browser: `http://localhost:8080/uploads/profile-images/profile_1_1709543245678.jpg`

### Upload Behavior

- **First Upload**: Creates new profile photo
- **Subsequent Uploads**: Replaces old photo with new one (old file is deleted)
- **File Naming**: `profile_<userId>_<timestamp>.jpg`

### Error Cases

**400 Bad Request - Invalid File Type**

```json
{
  "timestamp": "2026-03-04T10:30:00",
  "status": 400,
  "error": "Bad Request",
  "message": "Invalid file type. Only JPEG and PNG images are allowed"
}
```

**400 Bad Request - File Too Large**

```json
{
  "timestamp": "2026-03-04T10:30:00",
  "status": 400,
  "error": "Bad Request",
  "message": "File size exceeds maximum limit of 5 MB"
}
```

**400 Bad Request - Empty File**

```json
{
  "timestamp": "2026-03-04T10:30:00",
  "status": 400,
  "error": "Bad Request",
  "message": "Cannot upload empty file"
}
```

**401 Unauthorized - No Token**

```json
{
  "error": "Unauthorized",
  "message": "Authentication required"
}
```

---

## 🚀 Next Steps

After testing authentication:

1. Test account management endpoints (`/api/account/**`)
2. Test user-specific endpoints (`/api/users/**`)
3. Explore Swagger UI at: `http://localhost:8080/api-docs`

---

## 💡 Pro Tips

1. **Use Postman Collections**: Organize requests by feature (Auth, Account, Posts, etc.)
2. **Environment Variables**: Use different environments for local/dev/staging
3. **Pre-request Scripts**: Automatically refresh expired tokens
4. **Tests Tab**: Write assertions to verify responses
5. **Console Logs**: Check Postman console for debugging (View → Show Postman Console)

---

## 📞 Support

If you encounter issues:

1. Check backend console logs
2. Verify database connection
3. Ensure all environment variables are set
4. Check Swagger documentation at `/api-docs`

Happy Testing! 🎉
