# LearnLink API Documentation

**Base URL**: `{{base_url}}` (e.g., `http://localhost:8080`)
**Authentication**: Most endpoints require a Bearer Token (JWT). Pass it in the request headers as: `Authorization: Bearer <your_token>`

## 1. Manage Users

### 1.1 Login
Authenticate an existing user and receive an access token.
- **Method & Path**: `POST /api/auth/login`
- **Headers**: `Content-Type: application/json`
- **Request Body**:
  ```json
  {
    "username": "user@example.com",
    "password": "password"
  }
  ```
- **Expected Responses**:
  - `200 OK`: Login successful. Returns the JWT access token.
  - `401 Unauthorized`: Invalid credentials.

### 1.2 Register
Create a new user account.
- **Method & Path**: `POST /api/auth/register`
- **Headers**: `Content-Type: application/json`
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "username": "newuser123",
    "password": "SecurePassword123!",
    "fullName": "John Doe"
  }
  ```
- **Expected Responses**:
  - `201 Created`: Account successfully created.
  - `400 Bad Request`: Missing fields or email/username already in use.

### 1.3 Get Profile
Retrieve the authenticated user's profile details.
- **Method & Path**: `GET /api/account/me`
- **Headers**: `Authorization: Bearer <token>`
- **Expected Responses**:
  - `200 OK`: Returns the user's profile object (AccountResponseDTO).
  - `401 Unauthorized`: Missing or invalid token.

### 1.4 Update Profile
Update specific fields in the authenticated user's profile.
- **Method & Path**: `PATCH /api/account/me`
- **Headers**:
  - `Authorization: Bearer <token>`
  - `Content-Type: application/json`
- **Request Body**:
  ```json
  {
    "fullName": "John Updated",
    "bio": "New bio here",
    "province": "Western",
    "district": "Colombo",
    "phoneNumber": "0771234567",
    "interests": [
      "Programming",
      "Math"
    ]
  }
  ```
- **Expected Responses**:
  - `200 OK`: Profile successfully updated.
  - `400 Bad Request`: Invalid data formats.

### 1.5 Change Password
Update the authenticated user's password.
- **Method & Path**: `PATCH /api/account/change-password`
- **Headers**:
  - `Authorization: Bearer <token>`
  - `Content-Type: application/json`
- **Request Body**:
  ```json
  {
    "currentPassword": "OldPassword123!",
    "newPassword": "NewPassword123!",
    "confirmPassword": "NewPassword123!"
  }
  ```
- **Expected Responses**:
  - `200 OK`: Password changed successfully.
  - `400 Bad Request`: Passwords do not match or the current password is incorrect.

### 1.6 Change Email
Update the authenticated user's email address.
- **Method & Path**: `PATCH /api/account/change-email`
- **Headers**:
  - `Authorization: Bearer <token>`
  - `Content-Type: application/json`
- **Request Body**:
  ```json
  {
    "newEmail": "newemail@example.com",
    "password": "CurrentPassword123!"
  }
  ```
- **Expected Responses**:
  - `200 OK`: Email successfully updated.
  - `403 Forbidden`: Incorrect password provided for verification.

### 1.7 Delete Account
Permanently delete the authenticated user's account.
- **Method & Path**: `DELETE /api/account/me`
- **Headers**:
  - `Authorization: Bearer <token>`
  - `Content-Type: application/json`
- **Request Body**:
  ```json
  {
    "password": "CurrentPassword123!"
  }
  ```
- **Expected Responses**:
  - `200 OK` / `204 No Content`: Account successfully deleted.
  - `403 Forbidden`: Incorrect password provided.

### 1.8 Profile Photo
Uploads or updates the profile photo for the authenticated user.
- **Method & Path**: `POST /api/account/profile-photo`
- **Headers**:
  - `Authorization: Bearer <token>`
- **Request Body** (`multipart/form-data`):
  - `file`: (File) The profile photo (JPEG/PNG, max 5MB).
- **Expected Responses**:
  - `200 OK`: Profile photo uploaded successfully. Returns image URL.
  - `400 Bad Request`: Invalid file type or size exceeded.

## 2. Admin Operations

### 2.1 Get All Users
Fetch a list of all users registered on the platform.
- **Method & Path**: `GET /api/users`
- **Headers**: `Authorization: Bearer <admin_token>`
- **Expected Responses**:
  - `200 OK`: Returns an array of user objects.
  - `403 Forbidden`: User does not have administrative rights.

### 2.2 Get User by ID
Fetch a specific user by their ID.
- **Method & Path**: `GET /api/users/{id}`
- **Headers**: `Authorization: Bearer <admin_token>`
- **Expected Responses**:
  - `200 OK`: Returns the user object.
  - `404 Not Found`: User not found.

### 2.3 Get User by Email
Fetch a specific user by their email address.
- **Method & Path**: `GET /api/users/email/{email}`
- **Headers**: `Authorization: Bearer <admin_token>`
- **Expected Responses**:
  - `200 OK`: Returns the user object.
  - `404 Not Found`: User not found.

### 2.4 Get User by Username
Fetch a specific user by their username.
- **Method & Path**: `GET /api/users/username/{username}`
- **Headers**: `Authorization: Bearer <admin_token>`
- **Expected Responses**:
  - `200 OK`: Returns the user object.
  - `404 Not Found`: User not found.

### 2.5 Update User (Admin)
Update details of a specific user.
- **Method & Path**: `PUT /api/users/{id}`
- **Headers**:
  - `Authorization: Bearer <admin_token>`
  - `Content-Type: application/json`
- **Request Body**:
  ```json
  {
    "username": "updated_username",
    "email": "updated_email@example.com",
    "role": "USER",
    "imageUrl": "http://example.com/image.jpg"
  }
  ```
- **Expected Responses**:
  - `200 OK`: Returns the updated user object.
  - `404 Not Found`: User not found.

### 2.6 Delete User (Admin)
Delete a specific user by their ID.
- **Method & Path**: `DELETE /api/users/{id}`
- **Headers**: `Authorization: Bearer <admin_token>`
- **Expected Responses**:
  - `200 OK`: User deleted successfully.
  - `404 Not Found`: User not found.

### 2.7 Get Total User Count
Get the total number of registered users.
- **Method & Path**: `GET /api/users/count`
- **Headers**: `Authorization: Bearer <admin_token>`
- **Expected Responses**:
  - `200 OK`: Returns the total count.

### 2.8 Check if Email Exists
Check if an email address is already registered.
- **Method & Path**: `GET /api/users/exists/email/{email}`
- **Expected Responses**:
  - `200 OK`: Returns a boolean indicating existence (`{"exists": true}`).

### 2.9 Check if Username Exists
Check if a username is already registered.
- **Method & Path**: `GET /api/users/exists/username/{username}`
- **Expected Responses**:
  - `200 OK`: Returns a boolean indicating existence (`{"exists": true}`).

## 3. Post Creation & Management

### 3.1 Create Post
Create a new post. This endpoint uses `multipart/form-data`, which allows for text content and optional file uploads (like images).
- **Method & Path**: `POST /api/posts`
- **Headers**:
  - `Authorization: Bearer <token>`
- **Request Body** (`multipart/form-data`):
  - `content` (Text, optional): "test post content"
  - `image` (File, optional): Optional media attachment.
- **Expected Responses**:
  - `201 Created`: Post successfully published. Returns PostResponseDTO.
  - `400 Bad Request`: Missing required fields (if both content and image are empty).

### 3.2 Get Posts (Feed)
Retrieve a paginated list of posts.
- **Method & Path**: `GET /api/posts`
- **Headers**:
  - `Authorization: Bearer <token>`
- **Query Parameters**:
  - `page` (integer, optional): Page number (default: 0).
  - `size` (integer, optional): Number of posts per page (default: 10).
- **Expected Responses**:
  - `200 OK`: Returns an array of post objects.
  - `401 Unauthorized`: Missing or invalid token.

### 3.3 Get Posts by User
Retrieve all posts created by a specific user.
- **Method & Path**: `GET /api/posts/user/{username}`
- **Headers**:
  - `Authorization: Bearer <token>`
- **Expected Responses**:
  - `200 OK`: Returns an array of post objects for the specified user.
  - `401 Unauthorized`: Missing or invalid token.

### 3.4 Update Post
Update the content or image of an existing post.
- **Method & Path**: `PATCH /api/posts/{id}`
- **Headers**:
  - `Authorization: Bearer <token>`
- **Request Body** (`multipart/form-data`):
  - `content` (Text, optional): "updated post content"
  - `image` (File, optional): Updated media attachment.
- **Expected Responses**:
  - `200 OK`: Post successfully updated. Returns the updated post object.
  - `401 Unauthorized` / `403 Forbidden`: User is not allowed to edit this post.
  - `404 Not Found`: Post not found.

### 3.5 Delete Post
Delete an existing post.
- **Method & Path**: `DELETE /api/posts/{id}`
- **Headers**:
  - `Authorization: Bearer <token>`
- **Expected Responses**:
  - `204 No Content`: Post successfully deleted.
  - `401 Unauthorized` / `403 Forbidden`: User is not allowed to delete this post.
  - `404 Not Found`: Post not found.
