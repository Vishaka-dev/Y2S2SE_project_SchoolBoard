# Account Management Feature - Quick Start Guide

## 🚀 Implementation Summary

A complete, production-grade Account Management system has been implemented for your Spring Boot application following SOLID principles and clean architecture.

## ✅ What's Been Implemented

### Core Features

1. **View Account Details** - `GET /api/account/me`
2. **Update Profile** - `PATCH /api/account/me`
3. **Change Password** - `PATCH /api/account/change-password`
4. **Change Email** - `PATCH /api/account/change-email`
5. **Delete Account** - `DELETE /api/account/me` (soft delete)

### Security Features

- ✅ JWT authentication required for all endpoints
- ✅ Password strength validation
- ✅ BCrypt password encoding
- ✅ Soft delete (preserves data)
- ✅ Deleted account login prevention
- ✅ Mass assignment protection via DTOs
- ✅ Role-based access control

### Architecture

- ✅ Clean separation: Controller → Service → Repository
- ✅ SOLID principles throughout
- ✅ Comprehensive exception handling
- ✅ Transaction management
- ✅ Input validation with Bean Validation
- ✅ Logging with SLF4J

## 📁 Files Created

### Exceptions (5 files)

- `ResourceNotFoundException.java`
- `UnauthorizedOperationException.java`
- `InvalidPasswordException.java`
- `EmailAlreadyExistsException.java`
- `AccountDeletedException.java`

### DTOs (8 files)

- `AccountResponseDTO.java`
- `StudentProfileDTO.java`
- `TeacherProfileDTO.java`
- `InstituteProfileDTO.java`
- `UpdateProfileRequestDTO.java`
- `ChangePasswordRequestDTO.java`
- `ChangeEmailRequestDTO.java`
- `DeleteAccountRequestDTO.java`

### Service Layer (2 files)

- `AccountService.java` (interface)
- `AccountServiceImpl.java` (implementation with role-specific logic)

### Controller (1 file)

- `AccountController.java` (RESTful endpoints)

### Tests (3 files in test_cases folder)

- `AccountServiceImplTest.java` (unit tests)
- `AccountControllerTest.java` (integration tests)
- `AccountManagementIntegrationTest.java` (end-to-end tests)

### Documentation (2 files)

- `ACCOUNT_MANAGEMENT_DOCUMENTATION.md` (comprehensive guide)
- `test_cases/API_TESTING_GUIDE.md` (API testing scenarios)

### Database (1 file)

- `src/main/resources/db/migration/V2__add_soft_delete_support.sql`

## 📝 Files Modified

1. **User.java** - Added soft delete fields and methods
2. **UserRepository.java** - Added active user queries
3. **GlobalExceptionHandler.java** - Added new exception handlers
4. **CustomUserDetailsService.java** - Added isActive check

## 🗄️ Database Changes Required

Run this migration to add soft delete support:

```sql
-- Add soft delete columns
ALTER TABLE users
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true NOT NULL,
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;

-- Update existing users
UPDATE users SET is_active = true WHERE is_active IS NULL;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);
CREATE INDEX IF NOT EXISTS idx_users_email_active ON users(email, is_active);
```

Or use Flyway migration file provided: `V2__add_soft_delete_support.sql`

## 🧪 Running Tests

### Unit Tests

```bash
mvn test -Dtest=AccountServiceImplTest
```

### Integration Tests

```bash
mvn test -Dtest=AccountControllerTest
```

### Full Test Suite

```bash
mvn test -Dtest=AccountManagementIntegrationTest
```

## 📡 API Endpoints

### 1. Get Account Details

```bash
curl -X GET http://localhost:8080/api/account/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 2. Update Profile

```bash
curl -X PATCH http://localhost:8080/api/account/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"fullName": "Updated Name", "province": "Western"}'
```

### 3. Change Password

```bash
curl -X PATCH http://localhost:8080/api/account/change-password \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "OldPass123!",
    "newPassword": "NewPass123!",
    "confirmPassword": "NewPass123!"
  }'
```

### 4. Change Email

```bash
curl -X PATCH http://localhost:8080/api/account/change-email \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"newEmail": "new@email.com", "password": "Password123!"}'
```

### 5. Delete Account

```bash
curl -X DELETE http://localhost:8080/api/account/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"password": "Password123!"}'
```

## 🔒 Password Requirements

- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one digit
- At least one special character (@$!%\*?&)

Example valid password: `SecurePass123!`

## ⚙️ Configuration

No additional configuration needed. The feature uses existing:

- Spring Security configuration
- JWT authentication setup
- Database connection settings
- Transaction management

## 🎯 Role-Specific Behavior

### STUDENT

Can update:

- Full name, date of birth, province, interests
- School-specific: school name, grade
- University-specific: university name, degree program, year of study

### TEACHER

Can update:

- Full name, date of birth, province
- Institution name, subject specialization
- Years of experience, qualifications

### INSTITUTE

Can update:

- Province, district, address
- Contact person, contact number
- Website

**Note:** Role and education level cannot be changed through this API.

## 🚨 Important Notes

1. **Soft Delete**: Deleting an account sets `isActive=false` but preserves all data
2. **OAuth2 Users**: Cannot change password (they authenticate via Google)
3. **Email Uniqueness**: New email must not already exist in the system
4. **Authentication Required**: All endpoints require valid JWT token
5. **Transaction Safety**: Failed operations are rolled back automatically

## 📚 Documentation Files

1. **ACCOUNT_MANAGEMENT_DOCUMENTATION.md** - Complete technical documentation
2. **test_cases/API_TESTING_GUIDE.md** - Detailed API testing scenarios
3. **V2\_\_add_soft_delete_support.sql** - Database migration script

## ✨ Key Benefits

- **Production-Ready**: Follows industry best practices
- **Secure**: Multiple layers of security validation
- **Maintainable**: Clean architecture with clear separation of concerns
- **Testable**: Comprehensive test coverage (unit, integration, e2e)
- **Well-Documented**: Extensive documentation and examples
- **Extensible**: Easy to add new features following established patterns

## 🔍 Testing the Implementation

1. **Start your application**:

   ```bash
   cd backend
   ./mvnw spring-boot:run
   ```

2. **Run database migration** (if using Flyway)

3. **Login/Register** to get JWT token

4. **Test endpoints** using Postman or cURL

5. **Run test suite**:
   ```bash
   ./mvnw test
   ```

## 🆘 Troubleshooting

### Issue: "User not authenticated"

- **Solution**: Ensure JWT token is included in Authorization header

### Issue: "Account has been deleted"

- **Solution**: Account was soft-deleted, cannot be accessed without restoration

### Issue: "Email already in use"

- **Solution**: Choose a different email address

### Issue: "Password is incorrect"

- **Solution**: Verify current password is correct

## 📞 Support

For questions or issues:

1. Check `ACCOUNT_MANAGEMENT_DOCUMENTATION.md` for detailed info
2. Review `API_TESTING_GUIDE.md` for test scenarios
3. Examine test files for usage examples

## 🎉 Ready to Deploy!

The implementation is production-ready with:

- ✅ No compilation errors
- ✅ Comprehensive test coverage
- ✅ Security best practices
- ✅ Clean, maintainable code
- ✅ Complete documentation

**Happy coding! 🚀**
