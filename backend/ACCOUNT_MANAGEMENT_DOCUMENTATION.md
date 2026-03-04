# Account Management Feature - Implementation Documentation

## Overview

This document describes the production-grade Account Management feature implementation for the Spring Boot application with PostgreSQL and JWT authentication. The feature supports secure account operations following SOLID principles and clean architecture.

## Features Implemented

### 1. View Account Details

- **Endpoint**: `GET /api/account/me`
- Returns authenticated user's account information with role-specific profile data
- Excludes sensitive fields (password)
- Supports all roles: STUDENT, TEACHER, INSTITUTE

### 2. Update Profile Information

- **Endpoint**: `PATCH /api/account/me`
- Updates only editable profile fields based on user role
- Validates input data
- Prevents unauthorized field changes (role, provider, password, isActive)

### 3. Change Password

- **Endpoint**: `PATCH /api/account/change-password`
- Validates current password
- Enforces password strength requirements
- Only available for LOCAL provider users (not OAuth2)
- Encodes password using BCrypt

### 4. Change Email

- **Endpoint**: `PATCH /api/account/change-email`
- Validates password for confirmation
- Checks email availability
- Prevents duplicate emails
- Simulates email verification flow

### 5. Delete Account (Soft Delete)

- **Endpoint**: `DELETE /api/account/me`
- Requires password confirmation
- Sets `isActive = false` and records `deletedAt` timestamp
- Preserves all data (no hard delete)
- Prevents login for deleted accounts

## Architecture

### Entity Layer

#### User Entity

```java
- id: Long
- email: String (unique)
- username: String (unique)
- password: String (nullable for OAuth2)
- role: Role enum
- provider: AuthProvider enum
- providerId: String
- imageUrl: String
- createdAt: LocalDateTime
- isActive: Boolean (default: true)
- deletedAt: LocalDateTime (nullable)
```

**Key Methods**:

- `softDelete()`: Sets account as inactive
- `isDeleted()`: Checks if account is deleted
- `prePersist()`: Sets default values

#### Profile Entities

- **StudentProfile**: School and University student data
- **TeacherProfile**: Teacher-specific information
- **InstituteProfile**: Institution details

All profiles are linked to User with `@OneToOne` relationship.

### DTO Layer

#### Request DTOs

- `UpdateProfileRequestDTO`: Profile update fields (role-specific)
- `ChangePasswordRequestDTO`: Password change with validation
- `ChangeEmailRequestDTO`: Email change with password confirmation
- `DeleteAccountRequestDTO`: Account deletion with password

#### Response DTOs

- `AccountResponseDTO`: User account with profile data
- `StudentProfileDTO`: Student profile information
- `TeacherProfileDTO`: Teacher profile information
- `InstituteProfileDTO`: Institute profile information

### Service Layer

#### AccountService Interface

Defines contract for account management operations:

- `getCurrentUserAccount()`: Get current user account
- `updateProfile()`: Update profile information
- `changePassword()`: Change user password
- `changeEmail()`: Change user email
- `deleteAccount()`: Soft delete account

#### AccountServiceImpl

Implements business logic with role-specific handling:

**Key Features**:

- Extracts authenticated user from SecurityContext
- Delegates to role-specific update methods
- Validates business rules
- Logs all operations
- Uses `@Transactional` for data consistency

**Role-Specific Methods**:

- `updateStudentProfile()`: Handles SCHOOL and UNIVERSITY students
- `updateTeacherProfile()`: Handles teacher updates
- `updateInstituteProfile()`: Handles institution updates

### Controller Layer

#### AccountController

RESTful endpoints with security:

- Base path: `/api/account`
- All endpoints require `@PreAuthorize("isAuthenticated()")`
- Uses DTOs for request/response
- Returns appropriate HTTP status codes

### Repository Layer

#### UserRepository

Enhanced with soft delete support:

- `findActiveByUsername()`: Find active users only
- `findActiveByEmail()`: Find active users by email
- `findActiveById()`: Find active user by ID
- `existsActiveByUsername()`: Check active username
- `existsActiveByEmail()`: Check active email

### Exception Handling

#### Custom Exceptions

- `ResourceNotFoundException`: 404 Not Found
- `UnauthorizedOperationException`: 403 Forbidden
- `InvalidPasswordException`: 400 Bad Request
- `EmailAlreadyExistsException`: 409 Conflict
- `AccountDeletedException`: 403 Forbidden

#### GlobalExceptionHandler

Centralized exception handling with proper HTTP status codes and error responses.

## Security Features

### Authentication Check

- All endpoints require valid JWT token
- Uses Spring Security `SecurityContextHolder`
- Validates account is not deleted before proceeding

### Authorization

- Role-based access control with `@PreAuthorize`
- Users can only access their own account
- No privilege escalation possible

### Password Security

- BCrypt encoding for password storage
- Password strength validation (min 8 chars, uppercase, lowercase, digit, special char)
- Current password verification for sensitive operations
- OAuth2 users cannot change password

### Data Protection

- DTOs prevent mass assignment vulnerabilities
- Sensitive fields never exposed in responses
- Input validation with Bean Validation annotations
- SQL injection prevention through JPA

### Soft Delete Security

- Deleted accounts cannot authenticate
- `CustomUserDetailsService` checks `isActive` flag
- Queries filter deleted users by default
- Data preserved for audit/recovery purposes

## Database Schema Changes

### User Table Updates

```sql
ALTER TABLE users ADD COLUMN is_active BOOLEAN DEFAULT true NOT NULL;
ALTER TABLE users ADD COLUMN deleted_at TIMESTAMP;
CREATE INDEX idx_users_is_active ON users(is_active);
CREATE INDEX idx_users_email_active ON users(email, is_active);
```

## API Documentation

### GET /api/account/me

**Description**: Get current user account details

**Authentication**: Required

**Response**: 200 OK

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

### PATCH /api/account/me

**Description**: Update profile information

**Authentication**: Required

**Request Body**:

```json
{
  "fullName": "John Updated",
  "province": "Central",
  "interests": "Science, Technology"
}
```

**Response**: 200 OK (AccountResponseDTO)

### PATCH /api/account/change-password

**Description**: Change account password

**Authentication**: Required

**Request Body**:

```json
{
  "currentPassword": "OldPass123!",
  "newPassword": "NewPass123!",
  "confirmPassword": "NewPass123!"
}
```

**Response**: 200 OK

```json
{
  "message": "Password changed successfully",
  "status": "success"
}
```

### PATCH /api/account/change-email

**Description**: Change account email address

**Authentication**: Required

**Request Body**:

```json
{
  "newEmail": "newemail@example.com",
  "password": "CurrentPass123!"
}
```

**Response**: 200 OK (AccountResponseDTO)

### DELETE /api/account/me

**Description**: Soft delete account

**Authentication**: Required

**Request Body**:

```json
{
  "password": "CurrentPass123!"
}
```

**Response**: 200 OK

```json
{
  "message": "Account deleted successfully",
  "status": "success"
}
```

## Testing

### Unit Tests

**Location**: `backend/test_cases/AccountServiceImplTest.java`

**Coverage**:

- Service layer business logic
- Role-specific profile updates
- Password validation
- Email validation
- Soft delete functionality
- Exception scenarios

### Integration Tests

**Location**: `backend/test_cases/AccountControllerTest.java`

**Coverage**:

- Controller endpoints
- Request/response validation
- HTTP status codes
- Authentication requirements
- Input validation

### End-to-End Tests

**Location**: `backend/test_cases/AccountManagementIntegrationTest.java`

**Coverage**:

- Database integration
- Profile relationships
- Soft delete behavior
- Data persistence
- Query filtering

## Best Practices Implemented

### SOLID Principles

- **Single Responsibility**: Each class has one clear purpose
- **Open/Closed**: Extended through interfaces, closed for modification
- **Liskov Substitution**: Proper inheritance and polymorphism
- **Interface Segregation**: Focused service interface
- **Dependency Inversion**: Depends on abstractions, not concretions

### Clean Architecture

- Clear separation of layers (Controller → Service → Repository)
- Business logic in service layer, not controller
- DTOs for data transfer between layers
- Entities encapsulate domain logic

### Production Standards

- Comprehensive logging with SLF4J
- Transaction management with `@Transactional`
- Input validation with Bean Validation
- Proper error handling and messages
- Security best practices
- Performance optimization (fetch strategies, indexes)

### Code Quality

- Descriptive naming conventions
- JavaDoc documentation
- Consistent formatting
- No code duplication
- Testable design

## Error Handling

### Common Error Responses

**401 Unauthorized**: User not authenticated

```json
{
  "timestamp": "2026-03-03T10:00:00",
  "status": 401,
  "error": "Unauthorized",
  "message": "User is not authenticated",
  "path": "/api/account/me"
}
```

**403 Forbidden**: Account deleted or unauthorized operation

```json
{
  "timestamp": "2026-03-03T10:00:00",
  "status": 403,
  "error": "Forbidden",
  "message": "This account has been deleted",
  "path": "/api/account/me"
}
```

**400 Bad Request**: Invalid input or password

```json
{
  "timestamp": "2026-03-03T10:00:00",
  "status": 400,
  "error": "Bad Request",
  "message": "Current password is incorrect",
  "path": "/api/account/change-password"
}
```

**409 Conflict**: Email already exists

```json
{
  "timestamp": "2026-03-03T10:00:00",
  "status": 409,
  "error": "Conflict",
  "message": "Email 'example@test.com' is already in use",
  "path": "/api/account/change-email"
}
```

## Deployment Considerations

### Database Migration

Run migration script to add new columns:

```sql
-- Add soft delete columns to users table
ALTER TABLE users ADD COLUMN is_active BOOLEAN DEFAULT true NOT NULL;
ALTER TABLE users ADD COLUMN deleted_at TIMESTAMP;

-- Add indexes for performance
CREATE INDEX idx_users_is_active ON users(is_active);
CREATE INDEX idx_users_email_active ON users(email, is_active);

-- Update existing users
UPDATE users SET is_active = true WHERE is_active IS NULL;
```

### Environment Configuration

Ensure `application.properties` includes:

```properties
# Enable method-level security
spring.security.enable-method-security=true

# Transaction settings
spring.jpa.properties.hibernate.enable_lazy_load_no_trans=false
```

### Monitoring

- Log all account operations
- Monitor failed authentication attempts
- Track soft delete events
- Alert on suspicious activity

## Future Enhancements

1. **Email Verification**: Implement actual email verification flow with tokens
2. **Token Blacklist**: Invalidate JWT tokens after password change or account deletion
3. **Account Recovery**: Allow reactivation of soft-deleted accounts
4. **Audit Trail**: Detailed logging of all account changes
5. **Rate Limiting**: Prevent brute force attacks on password changes
6. **Two-Factor Authentication**: Add 2FA support
7. **Session Management**: Track active sessions and allow logout from all devices

## Files Created/Modified

### Created Files

1. `exception/ResourceNotFoundException.java`
2. `exception/UnauthorizedOperationException.java`
3. `exception/InvalidPasswordException.java`
4. `exception/EmailAlreadyExistsException.java`
5. `exception/AccountDeletedException.java`
6. `dto/AccountResponseDTO.java`
7. `dto/StudentProfileDTO.java`
8. `dto/TeacherProfileDTO.java`
9. `dto/InstituteProfileDTO.java`
10. `dto/UpdateProfileRequestDTO.java`
11. `dto/ChangePasswordRequestDTO.java`
12. `dto/ChangeEmailRequestDTO.java`
13. `dto/DeleteAccountRequestDTO.java`
14. `service/AccountService.java`
15. `service/AccountServiceImpl.java`
16. `controller/AccountController.java`
17. `test_cases/AccountServiceImplTest.java`
18. `test_cases/AccountControllerTest.java`
19. `test_cases/AccountManagementIntegrationTest.java`

### Modified Files

1. `model/User.java` - Added soft delete support
2. `repository/UserRepository.java` - Added active user queries
3. `exception/GlobalExceptionHandler.java` - Added new exception handlers
4. `service/impl/CustomUserDetailsService.java` - Added isActive check

## Conclusion

This implementation provides a production-grade account management system with comprehensive security, proper architecture, and extensive testing. The code follows industry best practices and is ready for production deployment.
