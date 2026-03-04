# Google OAuth2 Implementation Guide

## Overview
This Spring Boot 3 application implements a **stateless** Google OAuth2 authentication system using JWT tokens. The implementation follows production-level best practices and integrates seamlessly with the existing local authentication system.

## Architecture

### Components

#### 1. **User Model** (`User.java`)
```java
@Entity
@Table(name = "users")
public class User {
    private Long id;
    private String username;      // Generated from email for OAuth2 users
    private String email;          // Primary identifier
    private String password;       // Nullable for OAuth2 users
    private Role role;             // USER, ADMIN, etc.
    private AuthProvider provider; // LOCAL or GOOGLE
    private String providerId;     // Google's unique user ID
    private String imageUrl;       // Profile picture URL
}
```

**Key Points:**
- `password` is nullable for OAuth2 users (never stored)
- `provider` enum tracks authentication method (LOCAL vs GOOGLE)
- `providerId` stores Google's unique identifier
- `username` is auto-generated from email for OAuth2 users

#### 2. **CustomOAuth2UserService** (`CustomOAuth2UserService.java`)
Handles OAuth2 user authentication and registration.

**Flow:**
1. Google sends user info to Spring Security
2. `loadUser()` is called with OAuth2UserRequest
3. Extract user info from Google (email, name, picture, etc.)
4. Check if user exists in database by email:
   - **If exists**: Authenticate existing user (regardless of provider)
   - **If not exists**: Create new user with `provider=GOOGLE`
5. Return `CustomOAuth2User` wrapper

**Key Methods:**
- `loadUser()`: Entry point called by Spring Security
- `processOAuth2User()`: Main logic for user creation/authentication
- `registerNewUser()`: Creates new Google user in database
- `updateExistingUser()`: Updates Google user profile info
- `generateUsername()`: Creates unique username from email

**Business Logic:**
```java
if (user exists with this email) {
    if (provider == GOOGLE) {
        // Update profile picture and provider ID
        updateExistingUser(user, oAuth2UserInfo);
    } else {
        // LOCAL user - just authenticate (no updates)
        // This allows LOCAL users to also use Google login
    }
} else {
    // Create new GOOGLE user
    registerNewUser(oAuth2UserInfo);
}
```

#### 3. **OAuth2AuthenticationSuccessHandler** (`OAuth2AuthenticationSuccessHandler.java`)
Generates JWT and redirects to frontend.

**Flow:**
1. OAuth2 authentication succeeds
2. Extract `CustomOAuth2User` from Authentication object
3. Generate JWT token using `JwtService.generateToken(user)`
4. Build redirect URL: `http://localhost:5173/oauth2/success?token=<JWT>`
5. Frontend receives token in URL parameter

**Key Configuration:**
```java
@Value("${app.frontend-url}")
private String frontendUrl; // http://localhost:5173

String targetUrl = frontendUrl + "/oauth2/success?token=" + jwt;
```

#### 4. **SecurityConfig** (`SecurityConfig.java`)
Configures Spring Security for **stateless** JWT + OAuth2.

**Key Features:**
```java
@Bean
public SecurityFilterChain securityFilterChain(HttpSecurity http) {
    http
        .csrf(csrf -> csrf.disable())  // Disabled for stateless API
        .sessionManagement(session -> session
            .sessionCreationPolicy(SessionCreationPolicy.STATELESS))  // NO SESSIONS
        .oauth2Login(oauth2 -> oauth2
            .userInfoEndpoint(userInfo -> userInfo
                .userService(customOAuth2UserService))  // Custom user service
            .successHandler(oAuth2AuthenticationSuccessHandler)  // JWT generation
            .failureHandler(oAuth2AuthenticationFailureHandler))
        .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);
}
```

**Security Strategy:**
- No sessions (SessionCreationPolicy.STATELESS)
- CSRF disabled (safe for stateless APIs)
- JWT filter validates all requests
- OAuth2 login generates JWT (not session)

#### 5. **OAuth2UserInfo** (`OAuth2UserInfo.java`)
DTO that extracts user data from Google's OAuth2 response.

```java
public static OAuth2UserInfo fromGoogle(Map<String, Object> attributes) {
    return new OAuth2UserInfo(
        attributes.get("sub"),      // Google user ID
        attributes.get("name"),     // Full name
        attributes.get("email"),    // Email
        attributes.get("picture")   // Profile picture URL
    );
}
```

#### 6. **CustomOAuth2User** (`CustomOAuth2User.java`)
Wrapper that implements `OAuth2User` and contains our `User` entity.

```java
public class CustomOAuth2User implements OAuth2User {
    private final Map<String, Object> attributes;  // Google attributes
    private final User user;                       // Our User entity
    
    // Provides both Google data and our User data
}
```

## Configuration

### application.properties
```properties
# Database
spring.datasource.url=jdbc:postgresql://localhost:5432/school_board
spring.datasource.username=postgres
spring.datasource.password=YOUR_PASSWORD

# JWT
jwt.secret-key=YOUR_SECRET_KEY
jwt.expiration-ms=86400000  # 24 hours

# Google OAuth2
spring.security.oauth2.client.registration.google.client-id=YOUR_CLIENT_ID
spring.security.oauth2.client.registration.google.client-secret=YOUR_CLIENT_SECRET
spring.security.oauth2.client.registration.google.scope=profile,email
spring.security.oauth2.client.registration.google.redirect-uri=http://localhost:8080/login/oauth2/code/google

# Provider config
spring.security.oauth2.client.provider.google.authorization-uri=https://accounts.google.com/o/oauth2/v2/auth
spring.security.oauth2.client.provider.google.token-uri=https://oauth2.googleapis.com/token
spring.security.oauth2.client.provider.google.user-info-uri=https://www.googleapis.com/oauth2/v3/userinfo
spring.security.oauth2.client.provider.google.user-name-attribute=sub

# Frontend URL
app.frontend-url=http://localhost:5173
```

## Authentication Flow

### Google OAuth2 Login Flow

```
┌─────────────┐                ┌──────────────┐                ┌─────────────┐
│   Frontend  │                │   Backend    │                │   Google    │
│  (React)    │                │ (Spring Boot)│                │   OAuth2    │
└─────────────┘                └──────────────┘                └─────────────┘
      │                               │                               │
      │ 1. Click "Login with Google"  │                               │
      │─────────────────────────────>│                               │
      │                               │                               │
      │ 2. Redirect to Google         │                               │
      │<──────────────────────────────│                               │
      │                               │                               │
      │ 3. User authenticates         │                               │
      │───────────────────────────────────────────────────────────>│
      │                               │                               │
      │ 4. Google callback with code  │                               │
      │                               │<──────────────────────────────│
      │                               │                               │
      │                               │ 5. Exchange code for token    │
      │                               │───────────────────────────────>│
      │                               │                               │
      │                               │ 6. Return access token        │
      │                               │<──────────────────────────────│
      │                               │                               │
      │                               │ 7. Fetch user info            │
      │                               │───────────────────────────────>│
      │                               │                               │
      │                               │ 8. Return user data           │
      │                               │<──────────────────────────────│
      │                               │                               │
      │                               │ 9. CustomOAuth2UserService    │
      │                               │    - Check if user exists     │
      │                               │    - Create/update user       │
      │                               │                               │
      │                               │ 10. SuccessHandler            │
      │                               │     - Generate JWT            │
      │                               │                               │
      │ 11. Redirect with JWT         │                               │
      │<──────────────────────────────│                               │
      │ /oauth2/success?token=<JWT>   │                               │
      │                               │                               │
      │ 12. Store token in localStorage│                              │
      │ 13. Use token for API calls   │                               │
      │─────────────────────────────>│                               │
      │    Authorization: Bearer <JWT> │                               │
```

### Step-by-Step Breakdown

**Step 1-2: Initiate OAuth2**
- Frontend redirects to: `http://localhost:8080/oauth2/authorization/google`
- Backend redirects to Google's authorization page

**Step 3-4: User Authentication**
- User logs in with Google account
- Google redirects back with authorization code

**Step 5-6: Token Exchange**
- Spring Security automatically exchanges code for access token
- Happens in the background

**Step 7-8: User Info Retrieval**
- Spring Security fetches user info from Google
- Returns: email, name, picture, sub (Google ID)

**Step 9: User Processing**
- `CustomOAuth2UserService.loadUser()` is called
- Check database for user by email
- Create new user OR authenticate existing user

**Step 10: JWT Generation**
- `OAuth2AuthenticationSuccessHandler` generates JWT
- JWT contains user ID, email, role

**Step 11-12: Frontend Redirect**
- Redirect to: `http://localhost:5173/oauth2/success?token=eyJhbGc...`
- Frontend extracts token from URL and stores it

**Step 13: API Calls**
- All subsequent requests include: `Authorization: Bearer <JWT>`
- `JwtAuthenticationFilter` validates token

## Database Schema

### Users Table
```sql
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255),  -- NULL for OAuth2 users
    role VARCHAR(20) NOT NULL,
    provider VARCHAR(20) NOT NULL,
    provider_id VARCHAR(255),
    image_url VARCHAR(500),
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_provider ON users(provider);
```

### Example Data

**LOCAL User (Email/Password):**
```sql
INSERT INTO users (username, email, password, role, provider) VALUES
('john_doe', 'john@example.com', '$2a$10$hashed...', 'USER', 'LOCAL');
```

**GOOGLE User (OAuth2):**
```sql
INSERT INTO users (username, email, password, role, provider, provider_id, image_url) VALUES
('john_example', 'john@example.com', NULL, 'USER', 'GOOGLE', '1234567890', 'https://...');
```

## Frontend Integration

### Login Component
```javascript
// authService.js
const authService = {
  getGoogleAuthUrl: () => {
    return `http://localhost:8080/oauth2/authorization/google`;
  },
};

// Login.jsx
const handleGoogleLogin = () => {
  window.location.href = authService.getGoogleAuthUrl();
};
```

### OAuth2 Success Handler
```javascript
// OAuth2Redirect.jsx
const OAuth2Redirect = () => {
  const [searchParams] = useSearchParams();
  
  useEffect(() => {
    const token = searchParams.get('token');
    
    if (token) {
      localStorage.setItem('token', token);
      navigate('/dashboard');
    }
  }, [searchParams]);
};
```

### API Calls with JWT
```javascript
// apiClient.js
apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

## Security Features

### 1. **Stateless Architecture**
- No server-side sessions
- JWT contains all necessary user info
- Scales horizontally

### 2. **CSRF Protection**
- Disabled (not needed for stateless APIs)
- Safe because tokens are in Authorization header (not cookies)

### 3. **Token Expiration**
- JWT expires after 24 hours (configurable)
- Frontend must handle token refresh or re-login

### 4. **Password Security**
- OAuth2 users never have passwords stored
- LOCAL users have bcrypt-hashed passwords
- Password field is nullable

### 5. **Email Uniqueness**
- Email is unique constraint
- Prevents duplicate accounts
- Both LOCAL and GOOGLE users can use same email

## Testing

### Test Google OAuth2 Login

**1. Start Backend:**
```bash
cd backend
./mvnw spring-boot:run
```

**2. Start Frontend:**
```bash
cd frontend
npm run dev
# Runs on http://localhost:5173
```

**3. Test Flow:**
1. Navigate to http://localhost:5173/login
2. Click "Login with Google"
3. Select Google account
4. Should redirect to: http://localhost:5173/oauth2/success?token=<JWT>
5. Frontend should store token and navigate to dashboard

**4. Verify Database:**
```sql
SELECT username, email, provider, provider_id, image_url 
FROM users 
WHERE provider = 'GOOGLE';
```

**5. Test API with JWT:**
```bash
# Extract token from localStorage
TOKEN="<your-jwt-token>"

# Test protected endpoint
curl -H "Authorization: Bearer $TOKEN" \
     http://localhost:8080/api/user/profile
```

### Test Scenarios

#### Scenario 1: New Google User
- **Email**: newuser@gmail.com (not in database)
- **Expected**: Create new user with provider=GOOGLE
- **Database**: New row inserted

#### Scenario 2: Existing Google User
- **Email**: existing@gmail.com (already has provider=GOOGLE)
- **Expected**: Authenticate existing user, update profile picture
- **Database**: Row updated (image_url, provider_id)

#### Scenario 3: Existing LOCAL User
- **Email**: local@example.com (registered via email/password)
- **Expected**: Authenticate existing user (no changes)
- **Database**: No updates

## Troubleshooting

### Common Issues

#### 1. "Redirect URI mismatch"
**Cause**: Google Console redirect URI doesn't match
**Solution**: In Google Console, add:
```
http://localhost:8080/login/oauth2/code/google
```

#### 2. "Email not found from OAuth2 provider"
**Cause**: Google account doesn't have email permission
**Solution**: Ensure scope includes 'email'
```properties
spring.security.oauth2.client.registration.google.scope=profile,email
```

#### 3. "401 Unauthorized" on API calls
**Cause**: JWT expired or invalid
**Solution**: Check token expiration, regenerate token

#### 4. "User already exists with different provider"
**Update**: This is now fixed. Users can login with either LOCAL or GOOGLE regardless of original provider.

## Best Practices

### 1. **Environment Variables**
Never commit credentials to Git:
```bash
# .env file
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
JWT_SECRET_KEY=your-secret-key
DB_PASSWORD=your-db-password
```

### 2. **Token Security**
- Use strong secret keys (256-bit minimum)
- Set appropriate expiration times
- Store tokens in localStorage (not cookies for SPA)
- Use HTTPS in production

### 3. **Error Handling**
- Log OAuth2 failures
- Provide user-friendly error messages
- Redirect to login on authentication failure

### 4. **Database Indexing**
- Index email field for fast lookups
- Index provider field for analytics

### 5. **Production Deployment**
- Use environment-specific configuration
- Enable HTTPS only
- Update frontend URL to production domain
- Update Google Console redirect URIs

## Summary

This implementation provides:
- ✅ **Stateless authentication** (no sessions)
- ✅ **JWT-based security** for both LOCAL and GOOGLE
- ✅ **User creation** for new Google users
- ✅ **User authentication** for existing users
- ✅ **Production-ready** architecture
- ✅ **Spring Boot 3** compatible
- ✅ **Clean separation** of concerns
- ✅ **Comprehensive error handling**

The system seamlessly integrates Google OAuth2 with existing JWT authentication, maintaining a stateless architecture suitable for modern web applications.
