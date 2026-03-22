# OAuth2 Quick Start Guide

## 🚀 Quick Setup

### Prerequisites
- PostgreSQL running on port 5432
- Database: `school_board`
- Google OAuth2 credentials configured

### 1. Configure Google Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Enable Google+ API
3. Configure OAuth consent screen
4. Create OAuth 2.0 Client ID
5. Add authorized redirect URI:
   ```
   http://localhost:8080/login/oauth2/code/google
   ```

### 2. Update application.properties

```properties
spring.security.oauth2.client.registration.google.client-id=YOUR_CLIENT_ID
spring.security.oauth2.client.registration.google.client-secret=YOUR_CLIENT_SECRET
```

### 3. Start Application

**Backend:**
```bash
cd backend
./mvnw spring-boot:run
```

**Frontend:**
```bash
cd frontend
npm run dev
```

Visit: http://localhost:5173

## 📋 Complete Implementation Checklist

### ✅ Backend Components

| Component | File | Status | Purpose |
|-----------|------|--------|---------|
| User Model | `User.java` | ✅ | Stores user data with provider field |
| Auth Provider Enum | `AuthProvider.java` | ✅ | LOCAL, GOOGLE |
| Role Enum | `Role.java` | ✅ | USER, ADMIN |
| User Repository | `UserRepository.java` | ✅ | Database access |
| Custom OAuth2 Service | `CustomOAuth2UserService.java` | ✅ | Process Google users |
| Custom OAuth2 User | `CustomOAuth2User.java` | ✅ | Wrapper for OAuth2User |
| OAuth2 UserInfo DTO | `OAuth2UserInfo.java` | ✅ | Extract Google data |
| Success Handler | `OAuth2AuthenticationSuccessHandler.java` | ✅ | Generate JWT & redirect |
| Failure Handler | `OAuth2AuthenticationFailureHandler.java` | ✅ | Handle OAuth2 errors |
| Security Config | `SecurityConfig.java` | ✅ | Stateless JWT + OAuth2 |
| JWT Filter | `JwtAuthenticationFilter.java` | ✅ | Validate JWT tokens |
| JWT Service | `JwtService.java` | ✅ | Generate/validate JWT |

### ✅ Frontend Components

| Component | File | Status | Purpose |
|-----------|------|--------|---------|
| Login Page | `Login.jsx` | ✅ | Google login button |
| Register Page | `Register.jsx` | ✅ | User registration |
| OAuth2 Redirect | `OAuth2Redirect.jsx` | ✅ | Handle token from URL |
| Auth Service | `authService.js` | ✅ | Authentication API calls |
| API Client | `apiClient.js` | ✅ | Axios with JWT interceptor |
| Protected Route | `ProtectedRoute.jsx` | ✅ | Route guards |
| App Router | `App.jsx` | ✅ | React Router config |

## 🔐 Authentication Endpoints

### Backend API

| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| `/api/auth/register` | POST | Public | Email/password registration |
| `/api/auth/login` | POST | Public | Email/password login |
| `/oauth2/authorization/google` | GET | Public | Initiate Google login |
| `/login/oauth2/code/google` | GET | Public | Google callback (handled by Spring) |
| `/oauth2/success` | GET | Public | Not used (handled by frontend) |
| `/api/user/*` | ANY | JWT Required | Protected user endpoints |

### Frontend Routes

| Route | Component | Protection | Purpose |
|-------|-----------|------------|---------|
| `/login` | Login | Public (redirect if auth) | Login page |
| `/register` | Register | Public (redirect if auth) | Registration page |
| `/oauth2/success` | OAuth2Redirect | Public | Receives JWT token |
| `/oauth2/redirect` | OAuth2Redirect | Public | Legacy support |
| `/dashboard` | Dashboard | Protected | User dashboard |
| `/` | - | - | Redirect to /login |

## 🧪 Testing Checklist

### Manual Tests

#### ✅ Test 1: New Google User Registration
1. Navigate to http://localhost:5173/login
2. Click "Login with Google"
3. Select a Google account not in database
4. Should redirect to /oauth2/success?token=xxx
5. Should auto-login to dashboard
6. Verify in database:
   ```sql
   SELECT * FROM users WHERE email = 'your-google-email';
   -- Should see: provider='GOOGLE', password=NULL
   ```

#### ✅ Test 2: Existing Google User Login
1. Register with Google (Test 1)
2. Logout
3. Login with Google again using same account
4. Should authenticate successfully
5. Should redirect to dashboard
6. Database should have same user (no duplicate)

#### ✅ Test 3: Existing LOCAL User with Google
1. Register via email/password at /register
2. Logout
3. Login with Google using same email
4. Should authenticate successfully
5. Should redirect to dashboard
6. Database should keep provider='LOCAL'

#### ✅ Test 4: Email/Password Login
1. Navigate to /login
2. Enter email and password
3. Click "Sign in"
4. Should receive JWT token
5. Should redirect to dashboard

#### ✅ Test 5: Protected Routes
1. Visit /dashboard without token
2. Should redirect to /login
3. Login (email or Google)
4. Should access /dashboard successfully

#### ✅ Test 6: JWT API Calls
1. Login to get JWT token
2. Open browser console
3. Check localStorage for 'token'
4. Make API call to protected endpoint
5. Should include Authorization header
6. Should receive 200 OK

### Database Verification

```sql
-- Check all users
SELECT id, username, email, role, provider, created_at 
FROM users 
ORDER BY created_at DESC;

-- Count by provider
SELECT provider, COUNT(*) 
FROM users 
GROUP BY provider;

-- Find Google users
SELECT username, email, provider_id, image_url 
FROM users 
WHERE provider = 'GOOGLE';

-- Find LOCAL users
SELECT username, email 
FROM users 
WHERE provider = 'LOCAL';
```

### API Testing with curl

```bash
# 1. Register new user
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123"
  }'

# 2. Login
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "test@example.com",
    "password": "password123"
  }'

# 3. Use JWT token
TOKEN="<token-from-login-response>"

curl http://localhost:8080/api/user/profile \
  -H "Authorization: Bearer $TOKEN"
```

## 📊 User Flow Diagrams

### Google OAuth2 Login Flow
```
User → Click "Google" → Backend → Google Login Page
                                      ↓
User ← Dashboard ← Store Token ← Frontend ← Redirect with JWT
                                                ↑
                                        Generate JWT ← Authenticate User
                                                            ↑
                                                    Create/Find User in DB
                                                            ↑
                                                    Fetch User Info from Google
```

### Email/Password Login Flow
```
User → Enter Credentials → POST /api/auth/login → Validate Password
                                                        ↓
User ← Dashboard ← Store Token ← JWT Response ← Generate JWT
```

## 🐛 Debugging Tips

### Enable Debug Logging

Add to `application.properties`:
```properties
# OAuth2 debug logging
logging.level.org.springframework.security=DEBUG
logging.level.org.springframework.security.oauth2=TRACE
logging.level.com.my_app.schoolboard=DEBUG

# Show SQL queries
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true
```

### Common Issues & Solutions

#### Issue: "Redirect URI mismatch"
**Solution:** Check Google Console authorized redirect URIs
```
http://localhost:8080/login/oauth2/code/google
```

#### Issue: "Email not found from OAuth2 provider"
**Solution:** Check Google OAuth scope includes 'email'
```properties
spring.security.oauth2.client.registration.google.scope=profile,email
```

#### Issue: Token not saved in frontend
**Solution:** Check browser console for errors, verify redirect URL

#### Issue: 401 on protected endpoints
**Solution:** Check JWT token in localStorage, verify Authorization header

#### Issue: CORS errors
**Solution:** Verify CORS configuration in SecurityConfig

#### Issue: Google login redirects but no token
**Solution:** Check OAuth2AuthenticationSuccessHandler logs

### Logging Examples

**Successful OAuth2 Login:**
```
INFO  CustomOAuth2UserService : Processing OAuth2 user: john@gmail.com from provider: google
INFO  CustomOAuth2UserService : Registering new OAuth2 user: john@gmail.com
INFO  OAuth2AuthenticationSuccessHandler : OAuth2 authentication successful for user: john@gmail.com
INFO  OAuth2AuthenticationSuccessHandler : Redirecting to: http://localhost:5173/oauth2/success?token=eyJhbGc...
```

**OAuth2 Error:**
```
ERROR CustomOAuth2UserService : Error processing OAuth2 user
WARN  OAuth2AuthenticationFailureHandler : OAuth2 authentication failed
```

## 📝 Configuration Summary

### Backend (application.properties)
```properties
# Database
spring.datasource.url=jdbc:postgresql://localhost:5432/school_board
spring.datasource.username=postgres
spring.datasource.password=YOUR_PASSWORD

# JPA
spring.jpa.hibernate.ddl-auto=update

# JWT
jwt.secret-key=YOUR_SECRET_KEY
jwt.expiration-ms=86400000

# Google OAuth2
spring.security.oauth2.client.registration.google.client-id=YOUR_CLIENT_ID
spring.security.oauth2.client.registration.google.client-secret=YOUR_CLIENT_SECRET
spring.security.oauth2.client.registration.google.scope=profile,email
spring.security.oauth2.client.registration.google.redirect-uri=http://localhost:8080/login/oauth2/code/google

# Frontend URL
app.frontend-url=http://localhost:5173
```

### Frontend (.env)
```properties
VITE_API_BASE_URL=http://localhost:8080
```

## ✨ Production Checklist

- [ ] Use environment variables for all secrets
- [ ] Change JWT secret key to strong 256-bit key
- [ ] Update frontend URL to production domain
- [ ] Update Google Console redirect URIs for production
- [ ] Enable HTTPS only
- [ ] Set appropriate CORS origins
- [ ] Configure token expiration appropriately
- [ ] Add refresh token mechanism
- [ ] Implement rate limiting
- [ ] Add logging and monitoring
- [ ] Secure PostgreSQL connection
- [ ] Use connection pooling
- [ ] Add health check endpoints
- [ ] Configure proper error handling

## 📚 Additional Resources

- [Spring Security OAuth2 Client](https://docs.spring.io/spring-security/reference/servlet/oauth2/client/index.html)
- [Google OAuth2 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [JWT.io](https://jwt.io) - Decode and verify JWT tokens
- [Spring Boot 3 Security](https://spring.io/guides/gs/securing-web/)

---

**Implementation Status:** ✅ **COMPLETE**

All components are configured and ready for testing!
