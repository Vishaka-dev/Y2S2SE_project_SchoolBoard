# SchoolBoard Backend - Production-Ready Authentication

A production-grade Spring Boot application with JWT authentication and Google OAuth2 integration.

## Features

- ✅ **JWT Authentication** - Stateless, secure token-based auth
- ✅ **Google OAuth2 Login** - Social login integration
- ✅ **BCrypt Password Hashing** - Secure password storage
- ✅ **Environment Variables** - No hardcoded secrets
- ✅ **Role-Based Access** - USER and ADMIN roles
- ✅ **Global Exception Handling** - Consistent error responses
- ✅ **Input Validation** - Comprehensive request validation
- ✅ **PostgreSQL Database** - Relational data storage
- ✅ **Lombok** - Reduced boilerplate code
- ✅ **Production-Ready** - Security best practices

## Tech Stack

- **Java 17**
- **Spring Boot 4.0.2**
- **Spring Security** with OAuth2
- **PostgreSQL**
- **JWT (JJWT 0.12.6)**
- **Maven**
- **Lombok**

## Quick Start

### Prerequisites

- Java 17 or higher
- PostgreSQL 12+
- Maven 3.6+
- Google Cloud Console account (for OAuth2)

### 1. Database Setup

```sql
CREATE DATABASE school_board;
```

### 2. Environment Configuration


Fill in your credentials in `.env`:
- Database credentials
- JWT secret key (generate with: `openssl rand -hex 32`)
- Google OAuth2 credentials (see OAUTH2_SETUP_GUIDE.md)

### 3. Load Environment Variables

**Windows PowerShell:**
```powershell
.\load-env.ps1
```

**Linux/Mac:**
```bash
export $(cat .env | grep -v '^#' | xargs)
```

### 4. Build & Run

```bash
# Install dependencies
.\mvnw clean install

# Run application
.\mvnw spring-boot:run
```

Application will start at `http://localhost:8080`

## API Endpoints

### Authentication Endpoints

#### Register New User
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (201):**
```json
{
  "id": 1,
  "username": "john_doe",
  "email": "john@example.com",
  "role": "USER",
  "createdAt": "2026-02-17T10:30:00",
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "message": "Registration successful"
}
```

#### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "john_doe",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "id": 1,
  "username": "john_doe",
  "email": "john@example.com",
  "role": "USER",
  "createdAt": "2026-02-17T10:30:00",
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "message": "Login successful"
}
```

#### Google OAuth2 Login
```
GET /oauth2/authorization/google
```

Redirects to Google login, then back to:
```
{FRONTEND_URL}/oauth2/redirect?token={JWT_TOKEN}
```

### Protected Endpoints

All other endpoints require JWT token in Authorization header:

```http
GET /api/your-endpoint
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...
```

## Testing with Postman

### 1. Register/Login

1. POST to `/api/auth/register` or `/api/auth/login`
2. Copy the `token` from response

### 2. Use JWT Token

**Method 1 - Authorization Tab:**
- Type: `Bearer Token`
- Token: `<paste your token>`

**Method 2 - Headers:**
- Key: `Authorization`
- Value: `Bearer <paste your token>`

### 3. OAuth2 Testing

1. Open browser: `http://localhost:8080/oauth2/authorization/google`
2. Login with Google
3. Copy token from redirect URL

See [JWT_DOCUMENTATION.md](JWT_DOCUMENTATION.md) for detailed API docs.

See [OAUTH2_SETUP_GUIDE.md](OAUTH2_SETUP_GUIDE.md) for OAuth2 setup.

## Project Structure

```
backend/
├── src/main/java/com/my_app/schoolboard/
│   ├── config/              # Security & JWT configuration
│   │   ├── JwtAuthenticationFilter.java
│   │   ├── SecurityConfig.java
│   │   ├── OAuth2AuthenticationSuccessHandler.java
│   │   └── OAuth2AuthenticationFailureHandler.java
│   ├── controller/          # REST API endpoints
│   │   └── AuthController.java
│   ├── dto/                 # Data Transfer Objects
│   │   ├── AuthResponse.java
│   │   ├── LoginRequest.java
│   │   ├── RegisterRequest.java
│   │   └── OAuth2UserInfo.java
│   ├── exception/           # Exception handling
│   │   ├── GlobalExceptionHandler.java
│   │   ├── ErrorResponse.java
│   │   └── ...
│   ├── model/               # JPA Entities
│   │   ├── User.java
│   │   ├── Role.java
│   │   └── AuthProvider.java
│   ├── repository/          # Data access layer
│   │   └── UserRepository.java
│   └── service/             # Business logic
│       ├── impl/
│       │   ├── AuthServiceImpl.java
│       │   ├── CustomUserDetailsService.java
│       │   └── CustomOAuth2UserService.java
│       ├── AuthService.java
│       └── JwtService.java
├── src/main/resources/
│   └── application.properties  # App configuration
├── .env.example             # Environment variables template
├── .gitignore              # Git ignore rules
├── load-env.ps1            # PowerShell env loader
├── pom.xml                 # Maven dependencies
├── README.md               # This file
├── OAUTH2_SETUP_GUIDE.md   # OAuth2 setup guide
└── JWT_DOCUMENTATION.md    # API documentation
```

## Security Features

### Password Security
- BCrypt hashing with salt
- Minimum 6 characters enforced
- Password never stored in plain text
- Null password for OAuth2 users

### JWT Security
- HS256 algorithm
- 24-hour expiration
- Stateless authentication
- Include user claims (id, email, role)

### OAuth2 Security
- Stateless CSRF protection
- Secure redirect URIs
- Provider validation
- Prevent account hijacking

### Application Security
- Environment-based configuration
- No hardcoded secrets
- CORS configuration ready
- Input validation
- Global exception handling

## Environment Variables

Required environment variables:

| Variable | Description | Example |
|----------|-------------|---------|
| `DB_URL` | PostgreSQL connection URL | `jdbc:postgresql://localhost:5432/school_board` |
| `DB_USERNAME` | Database username | `postgres` |
| `DB_PASSWORD` | Database password | `your_password` |
| `JWT_SECRET_KEY` | JWT signing key (256+ bits) | `generate with openssl` |
| `JWT_EXPIRATION_MS` | Token expiration time | `86400000` (24h) |
| `GOOGLE_CLIENT_ID` | Google OAuth2 client ID | From Google Console |
| `GOOGLE_CLIENT_SECRET` | Google OAuth2 client secret | From Google Console |
| `APP_BASE_URL` | Backend URL | `http://localhost:8080` |
| `FRONTEND_URL` | Frontend URL | `http://localhost:3000` |
| `SERVER_PORT` | Server port | `8080` |

## Production Deployment

### 1. Update Configuration

```properties
# Use production database
DB_URL=jdbc:postgresql://prod-db-host:5432/school_board

# Use production URLs
APP_BASE_URL=https://api.yourdomain.com
FRONTEND_URL=https://yourdomain.com
```

### 2. Update Google OAuth2 Redirect URIs

Add to Google Console:
```
https://api.yourdomain.com/login/oauth2/code/google
```

### 3. Set Environment Variables

**Heroku:**
```bash
heroku config:set KEY=value
```

**AWS/Docker:**
Use secrets management

### 4. Enable HTTPS

Always use HTTPS in production

### 5. Database Migration

```bash
# Run migrations
./mvnw flyway:migrate
```

## Development

### Running Tests

```bash
./mvnw test
```

### Building for Production

```bash
./mvnw clean package -DskipTests
java -jar target/SchoolBoard-0.0.1-SNAPSHOT.jar
```

### Generating JWT Secret

```bash
# OpenSSL
openssl rand -hex 32

# Python
python -c "import secrets; print(secrets.token_hex(32))"

# Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Common Issues

### Database Connection Failed
- Ensure PostgreSQL is running
- Check database credentials in `.env`
- Verify database exists

### OAuth2 redirect_uri_mismatch
- Check Google Console redirect URIs
- Must exactly match: `http://localhost:8080/login/oauth2/code/google`

### Environment Variables Not Loading
- Run `.\load-env.ps1` before starting app
- Or use IDE environment configuration

### JWT Token Invalid
- Check token expiration
- Verify JWT_SECRET_KEY matches
- Ensure token format: `Bearer <token>`

## Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## License

This project is licensed under the MIT License.

## Support

For detailed documentation:
- [JWT Documentation](JWT_DOCUMENTATION.md)
- [OAuth2 Setup Guide](OAUTH2_SETUP_GUIDE.md)
- [API Documentation](API_DOCUMENTATION.md)

## Authors

SchoolBoard Development Team
