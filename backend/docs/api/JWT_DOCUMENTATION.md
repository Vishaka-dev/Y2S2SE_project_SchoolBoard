# JWT Authentication API Documentation

## Overview
Production-grade JWT-based authentication system for the SchoolBoard platform with stateless session management.

## Technology Stack
- **Spring Boot 4.0.2**
- **Spring Security** - JWT + BCrypt password hashing
- **JJWT 0.12.6** - JWT token generation and validation
- **Spring Data JPA** - Database access
- **PostgreSQL** - Database
- **Lombok** - Reduce boilerplate

## Architecture
- **Stateless JWT Authentication** - No server-side sessions
- **Layered Architecture**: Controller → Service → Repository
- **DTO Pattern**: Never expose entities directly
- **Global Exception Handling**: Centralized error responses
- **Role-Based Access**: USER, ADMIN roles
- **JWT Filter**: Validates token on every request

## JWT Configuration

### Application Properties
```properties
# JWT secret key (Base64 encoded - CHANGE THIS IN PRODUCTION!)
jwt.secret-key=404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970

# JWT expiration time in milliseconds (24 hours)
jwt.expiration-ms=86400000
```

### Token Claims
- **subject**: Username
- **email**: User email
- **role**: User role (USER/ADMIN)
- **iat**: Issued at timestamp
- **exp**: Expiration timestamp

## API Endpoints

### 1. Register User
**POST** `/api/auth/register`

Creates a new user account and returns JWT token.

**Request Body:**
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Success Response (201 Created):**
```json
{
  "id": 1,
  "username": "john_doe",
  "email": "john@example.com",
  "role": "USER",
  "createdAt": "2026-02-17T10:30:00",
  "token": "eyJhbGciOiJIUzI1NiJ9.eyJlbWFpbCI6ImpvaG5AZXhhbXBsZS5jb20iLCJyb2xlIjoiVVNFUiIsInN1YiI6ImpvaG5fZG9lIiwiaWF0IjoxNzM5NzkzNjAwLCJleHAiOjE3Mzk4ODAwMDB9.signature",
  "message": "Registration successful"
}
```

**Validation Errors (400):**
```json
{
  "timestamp": "2026-02-17T10:30:00",
  "status": 400,
  "error": "Bad Request",
  "message": "Validation failed",
  "path": "/api/auth/register",
  "validationErrors": {
    "username": "Username must be between 3 and 50 characters",
    "email": "Email should be valid",
    "password": "Password must be at least 6 characters"
  }
}
```

**Conflict (409):**
```json
{
  "timestamp": "2026-02-17T10:30:00",
  "status": 409,
  "error": "Conflict",
  "message": "Username already exists",
  "path": "/api/auth/register"
}
```

### 2. Login User
**POST** `/api/auth/login`

Authenticates user and returns JWT token.

**Request Body:**
```json
{
  "username": "john_doe",
  "password": "password123"
}
```

**Success Response (200 OK):**
```json
{
  "id": 1,
  "username": "john_doe",
  "email": "john@example.com",
  "role": "USER",
  "createdAt": "2026-02-17T10:30:00",
  "token": "eyJhbGciOiJIUzI1NiJ9.eyJlbWFpbCI6ImpvaG5AZXhhbXBsZS5jb20iLCJyb2xlIjoiVVNFUiIsInN1YiI6ImpvaG5fZG9lIiwiaWF0IjoxNzM5NzkzNjAwLCJleHAiOjE3Mzk4ODAwMDB9.signature",
  "message": "Login successful"
}
```

**Unauthorized (401):**
```json
{
  "timestamp": "2026-02-17T10:30:00",
  "status": 401,
  "error": "Unauthorized",
  "message": "Invalid username or password",
  "path": "/api/auth/login"
}
```

## Using JWT Tokens

### Authentication Flow
1. Client registers or logs in
2. Server validates credentials and generates JWT token
3. Client stores token (localStorage, sessionStorage, or cookie)
4. Client includes token in Authorization header for subsequent requests
5. Server validates token on each request via `JwtAuthenticationFilter`

### Making Authenticated Requests

Include the JWT token in the Authorization header:

```http
GET /api/protected-endpoint
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...
```

### Example with cURL

```bash
# 1. Login to get token
TOKEN=$(curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"john_doe","password":"password123"}' \
  | jq -r '.token')

# 2. Use token for authenticated request
curl -X GET http://localhost:8080/api/protected-endpoint \
  -H "Authorization: Bearer $TOKEN"
```

## Security Configuration

### Public Endpoints
- `/api/auth/**` - Registration and login (no authentication required)

### Protected Endpoints
- All other endpoints require valid JWT token

### Session Management
- **Stateless** - No server-side sessions
- JWT tokens are self-contained and validated on each request

### Password Security
- BCrypt hashing with automatic salt generation
- Passwords never stored in plain text
- Passwords never returned in API responses

## Components

### JwtService
Handles JWT token generation and validation:
- `generateToken(User)` - Creates JWT with user claims
- `validateToken(String, String)` - Validates token and username
- `extractUsername(String)` - Extracts username from token
- `extractEmail(String)` - Extracts email from token
- `extractRole(String)` - Extracts role from token

### JwtAuthenticationFilter
`OncePerRequestFilter` that:
1. Extracts JWT from Authorization header
2. Validates token format and signature
3. Loads user details from database
4. Sets authentication in SecurityContext

### SecurityConfig
Configures Spring Security:
- Disables CSRF for stateless API
- Configures stateless session management
- Adds JWT filter before UsernamePasswordAuthenticationFilter
- Configures public and protected endpoints

## Project Structure

```
src/main/java/com/my_app/schoolboard/
├── config/
│   ├── JwtAuthenticationFilter.java # JWT validation filter
│   └── SecurityConfig.java          # Spring Security configuration
├── controller/
│   └── AuthController.java          # REST endpoints
├── dto/
│   ├── AuthResponse.java            # Response DTO (includes token)
│   ├── LoginRequest.java            # Login request DTO
│   └── RegisterRequest.java         # Registration request DTO
├── exception/
│   ├── ErrorResponse.java           # Error response structure
│   ├── GlobalExceptionHandler.java  # Centralized exception handling
│   ├── InvalidCredentialsException.java
│   └── UserAlreadyExistsException.java
├── model/
│   ├── Role.java                    # User role enum
│   └── User.java                    # User entity
├── repository/
│   └── UserRepository.java          # Data access layer
└── service/
    ├── AuthService.java             # Service interface
    ├── JwtService.java              # JWT token operations
    └── impl/
        ├── AuthServiceImpl.java     # Service implementation
        └── CustomUserDetailsService.java # Spring Security integration
```

## Running the Application

```bash
# Build the project
./mvnw clean install

# Run the application
./mvnw spring-boot:run
```

The application will start on `http://localhost:8080`

## Security Best Practices

✅ **JWT-Based Stateless Authentication**  
✅ **BCrypt Password Hashing** - Industry-standard encryption  
✅ **Token Expiration** - 24-hour default (configurable)  
✅ **Secure Token Storage** - Never logged or exposed  
✅ **Role-Based Access Control** - USER and ADMIN roles  
✅ **Input Validation** - Bean validation on all requests  
✅ **Global Exception Handling** - No sensitive data in errors  
✅ **Clean Architecture** - Separation of concerns  
✅ **No Session State** - Fully stateless REST API  

## Validation Rules

### Username
- Required, 3-50 characters, unique

### Email
- Required, valid email format, unique

### Password
- Required, minimum 6 characters, BCrypt hashed

## Token Security

### Production Considerations

1. **Secret Key**: Generate a strong, random secret key
   ```bash
   openssl rand -base64 64
   ```

2. **HTTPS Only**: Always use HTTPS in production

3. **Token Storage**: 
   - **Best**: HttpOnly cookies with proper CORS
   - **Good**: sessionStorage (cleared on tab close)
   - **Caution**: localStorage (persists across sessions)

4. **Token Expiration**: Adjust based on security needs
   - Higher security: 15-30 minutes
   - Lower security: 24 hours
   - Implement refresh tokens for longer sessions

5. **Environment Variables**: Store secrets in environment variables
   ```properties
   jwt.secret-key=${JWT_SECRET_KEY}
   ```

## Testing

See [test-requests.http](test-requests.http) for ready-to-use HTTP requests.

## Next Steps

Potential enhancements:
- Refresh token mechanism
- Token blacklist for logout
- Email verification
- Password reset with token
- Rate limiting
- User profile endpoints
- Posts and comments features
- Role-based endpoint protection
