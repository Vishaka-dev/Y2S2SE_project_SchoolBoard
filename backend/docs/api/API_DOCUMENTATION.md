# Authentication API Documentation

## Overview

Production-grade authentication module for the SchoolBoard platform with Spring Boot 3, Spring Security, and PostgreSQL.

## Technology Stack

- **Spring Boot 4.0.2**
- **Spring Security** - BCrypt password hashing
- **Spring Data JPA** - Database access
- **PostgreSQL** - Database
- **Lombok** - Reduce boilerplate
- **Bean Validation** - Request validation

## Architecture

- **Layered Architecture**: Controller → Service → Repository
- **DTO Pattern**: Never expose entities directly
- **Global Exception Handling**: Centralized error responses
- **Role-Based Access**: USER, ADMIN roles

## API Endpoints

### 1. Register User

**POST** `/api/auth/register`

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
  "message": "Registration successful"
}
```

**Validation Errors (400 Bad Request):**

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

## Database Configuration

Update `application.properties`:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/school_board
spring.datasource.username=postgres
spring.datasource.password=your_password
spring.jpa.hibernate.ddl-auto=update
```

## Running the Application

```bash
# Build the project
./mvnw clean install

# Run the application
./mvnw spring-boot:run
```

The application will start on `http://localhost:8080`

## Testing with cURL

### Register

```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Login

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "password": "password123"
  }'
```

## Project Structure

```
src/main/java/com/my_app/schoolboard/
├── config/
│   └── SecurityConfig.java          # Spring Security configuration
├── controller/
│   └── AuthController.java          # REST endpoints
├── dto/
│   ├── AuthResponse.java            # Response DTO
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
    └── impl/
        └── AuthServiceImpl.java     # Service implementation
```

## Security Features

✅ **BCrypt Password Hashing** - Passwords are never stored in plain text  
✅ **Stateless Configuration** - No server-side sessions  
✅ **CSRF Disabled** - For stateless REST API  
✅ **Role-Based Access** - USER and ADMIN roles  
✅ **Input Validation** - Bean validation on all requests  
✅ **Global Exception Handling** - Consistent error responses  
✅ **Clean Architecture** - Separation of concerns

## Validation Rules

### Username

- Required
- Min length: 3 characters
- Max length: 50 characters
- Must be unique

### Email

- Required
- Must be valid email format
- Must be unique

### Password

- Required
- Min length: 6 characters
- Hashed with BCrypt

## Next Steps

Phase 2 could include:

- JWT token generation and validation
- Refresh tokens
- Email verification
- Password reset functionality
- User profile management
- Posts and comments features
