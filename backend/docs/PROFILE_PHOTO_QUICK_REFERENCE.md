# Profile Photo Upload - Quick Reference

## 📍 Endpoint

```http
POST /api/account/profile-photo
Content-Type: multipart/form-data
Authorization: Bearer <jwt-token>
```

---

## 📤 Request (Postman)

1. **Method**: POST
2. **URL**: `http://localhost:8080/api/account/profile-photo`
3. **Authorization Tab**:
   - Type: `Bearer Token`
   - Token: `<your-jwt-token>`
4. **Body Tab**:
   - Select: `form-data`
   - Key: `file`
   - Type: `File` (change from Text dropdown)
   - Value: Select image file

---

## ✅ Success Response (200 OK)

```json
{
  "profileImageUrl": "http://localhost:8080/uploads/profile-images/profile_1_1709543245678.jpg",
  "message": "Profile photo uploaded successfully"
}
```

---

## ❌ Error Responses

### Wrong File Type (400)

```json
{
  "timestamp": "2026-03-04T10:30:00",
  "status": 400,
  "error": "Bad Request",
  "message": "Invalid file type. Only JPEG and PNG images are allowed"
}
```

### File Too Large (400)

```json
{
  "timestamp": "2026-03-04T10:30:00",
  "status": 400,
  "error": "Bad Request",
  "message": "File size exceeds maximum limit of 5 MB"
}
```

### Not Authenticated (401)

```json
{
  "error": "Unauthorized",
  "message": "Authentication required"
}
```

---

## 📋 Validation Rules

| Rule               | Value                     |
| ------------------ | ------------------------- |
| **Allowed Types**  | JPEG, JPG, PNG            |
| **Max Size**       | 5 MB                      |
| **Authentication** | Required (JWT)            |
| **Location**       | `uploads/profile-images/` |

---

## 🔄 Behavior

- **First upload**: Creates new profile photo
- **Subsequent uploads**: Replaces old photo (old file deleted)
- **File naming**: `profile_<userId>_<timestamp>.ext`
- **Accessibility**: Public URL, accessible in browser

---

## 🧪 Test Flow

1. **Login**:

   ```http
   POST /api/auth/login
   { "username": "test_student", "password": "test123" }
   ```

   → Copy `token` from response

2. **Upload Photo**:

   ```http
   POST /api/account/profile-photo
   Authorization: Bearer <token>
   Body: form-data with file
   ```

   → Get `profileImageUrl`

3. **Verify**:

   ```http
   GET /api/account/me
   Authorization: Bearer <token>
   ```

   → Check `imageUrl` field has your uploaded photo URL

4. **View Image**:
   Open in browser:
   ```
   http://localhost:8080/uploads/profile-images/profile_1_12345.jpg
   ```

---

## 🎯 Key Features

✅ Only authenticated users can upload  
✅ Automatic file validation (type, size)  
✅ Old file auto-deleted on replacement  
✅ Secure path validation  
✅ Clean architecture (easy to migrate to S3)  
✅ Images served as static resources

---

## 📂 Files Created/Modified

### New Files

- `FileStorageService.java` - Interface
- `LocalFileStorageService.java` - Implementation
- `InvalidFileException.java` - Custom exception
- `FileStorageException.java` - Custom exception
- `ProfileImageUploadResponseDTO.java` - Response DTO

### Modified Files

- `User.java` - Added `profileImageUrl` field
- `AccountService.java` - Added `updateProfileImage` method
- `AccountServiceImpl.java` - Implemented upload logic
- `AccountController.java` - Added `/profile-photo` endpoint
- `GlobalExceptionHandler.java` - Added exception handlers
- `WebMvcConfig.java` - Added resource handler
- `application.properties` - Added configuration

---

## 🚀 Ready to Use!

The implementation is complete and production-ready. Test with Postman using the guide above!

**Documentation**: See `PROFILE_PHOTO_IMPLEMENTATION.md` for full details.
