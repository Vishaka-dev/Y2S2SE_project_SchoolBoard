# Google OAuth2 Authentication Setup Guide

## Overview
This document provides setup instructions for Google OAuth2 integration with JWT authentication in the SchoolBoard application.

## Prerequisites
- Google Cloud Console account
- PostgreSQL database running
- Java 17+
- Maven

## 1. Google OAuth2 Setup

### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Project name: `SchoolBoard` (or your preferred name)

### Step 2: Enable Google+ API

1. Navigate to **APIs & Services** > **Library**
2. Search for "Google+ API"
3. Click **Enable**

### Step 3: Configure OAuth Consent Screen

1. Go to **APIs & Services** > **OAuth consent screen**
2. Select **External** user type (or Internal for Google Workspace)
3. Fill in the required information:
   - App name: `SchoolBoard`
   - User support email: Your email
   - Developer contact email: Your email
4. Add scopes:
   - `.../auth/userinfo.email`
   - `.../auth/userinfo.profile`
5. Add test users (for development)
6. Save and continue

### Step 4: Create OAuth2 Credentials

1. Go to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **OAuth client ID**
3. Application type: **Web application**
4. Name: `SchoolBoard Web Client`
5. Authorized JavaScript origins:
   ```
   http://localhost:8080
   http://localhost:3000
   ```
6. Authorized redirect URIs:
   ```
   http://localhost:8080/login/oauth2/code/google
   ```
7. Click **Create**
8. **Copy the Client ID and Client Secret** - you'll need these!

## 2. Environment Configuration

### Step 1: Create Environment File

1. Copy the `.env.example` file to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and fill in your credentials:

```properties
# Database Configuration
DB_URL=jdbc:postgresql://localhost:5432/school_board
DB_USERNAME=postgres
DB_PASSWORD=your_database_password

# JWT Configuration
JWT_SECRET_KEY=your_jwt_secret_key_at_least_256_bits_long
JWT_EXPIRATION_MS=86400000

# Google OAuth2 Configuration
GOOGLE_CLIENT_ID=your_google_client_id_from_step_4
GOOGLE_CLIENT_SECRET=your_google_client_secret_from_step_4

# Application Configuration
APP_BASE_URL=http://localhost:8080
FRONTEND_URL=http://localhost:3000

# Server Configuration
SERVER_PORT=8080
```

### Step 2: Generate JWT Secret Key

Generate a secure random key (at least 256 bits):

```bash
# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Using Python
python -c "import secrets; print(secrets.token_hex(32))"

# Using OpenSSL
openssl rand -hex 32
```

### Step 3: Load Environment Variables

**For Windows (PowerShell):**
```powershell
# Load environment variables from .env file
Get-Content .env | ForEach-Object {
    if ($_ -match '^([^#].+?)=(.+)$') {
        [Environment]::SetEnvironmentVariable($matches[1], $matches[2], "Process")
    }
}
```

**For Linux/Mac:**
```bash
export $(cat .env | grep -v '^#' | xargs)
```

**Alternative: Use IntelliJ IDEA EnvFile Plugin:**
1. Install "EnvFile" plugin
2. In Run Configuration, enable EnvFile
3. Add your `.env` file

## 3. Running the Application

### Step 1: Build the Application
```bash
./mvnw clean install
```

### Step 2: Run the Application
```bash
./mvnw spring-boot:run
```

The application will start on `http://localhost:8080`

## 4. Testing OAuth2 Login

### Browser Testing

1. Navigate to:
   ```
   http://localhost:8080/oauth2/authorization/google
   ```

2. You'll be redirected to Google's login page

3. After successful login, you'll be redirected to:
   ```
   http://localhost:3000/oauth2/redirect?token=<JWT_TOKEN>
   ```

4. The JWT token will be included in the query parameters

### Frontend Integration Example

```javascript
// React example
useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  const token = params.get('token');
  const error = params.get('error');
  
  if (token) {
    // Store token in localStorage
    localStorage.setItem('jwt_token', token);
    // Redirect to dashboard
    navigate('/dashboard');
  } else if (error) {
    // Handle error
    console.error('OAuth2 error:', error);
  }
}, []);
```

### HTML Button Example

```html
<a href="http://localhost:8080/oauth2/authorization/google" 
   class="google-login-btn">
  <img src="google-icon.png" alt="Google" />
  Sign in with Google
</a>
```

## 5. API Authentication Flow

### Traditional Login Flow
```
POST /api/auth/register → JWT Token
POST /api/auth/login → JWT Token
```

### OAuth2 Login Flow
```
1. Frontend redirects to: /oauth2/authorization/google
2. User authenticates with Google
3. Google redirects back to: /login/oauth2/code/google
4. Backend processes OAuth2 user info
5. Backend creates/updates user in database
6. Backend generates JWT token
7. Backend redirects to: {FRONTEND_URL}/oauth2/redirect?token={JWT_TOKEN}
```

### Using JWT Token in Requests

```bash
curl -H "Authorization: Bearer {JWT_TOKEN}" \
     http://localhost:8080/api/protected-endpoint
```

## 6. Database Schema

The User table now supports OAuth2:

```sql
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255),  -- NULL for OAuth2 users
    role VARCHAR(20) NOT NULL,
    provider VARCHAR(20) NOT NULL,  -- LOCAL or GOOGLE
    provider_id VARCHAR(255),  -- Google user ID
    image_url VARCHAR(500),  -- Profile picture URL
    created_at TIMESTAMP NOT NULL
);
```

## 7. Security Best Practices

### Production Deployment

1. **Never commit `.env` file** - it's in `.gitignore`
2. **Use environment variables** in production (not .env file)
3. **Rotate JWT secret** regularly
4. **Use HTTPS** in production
5. **Update redirect URIs** for production domain:
   ```
   https://yourdomain.com/login/oauth2/code/google
   ```

### Environment Variables in Production

**Heroku:**
```bash
heroku config:set GOOGLE_CLIENT_ID=your_client_id
heroku config:set GOOGLE_CLIENT_SECRET=your_client_secret
heroku config:set JWT_SECRET_KEY=your_jwt_secret
```

**AWS/Docker:**
Use AWS Secrets Manager or Docker secrets

**Kubernetes:**
Use Kubernetes Secrets

## 8. Troubleshooting

### Issue: "redirect_uri_mismatch" error

**Solution:** Ensure the redirect URI in Google Console exactly matches:
```
http://localhost:8080/login/oauth2/code/google
```

### Issue: OAuth2 user has no password

**Expected:** OAuth2 users don't have passwords. They authenticate via Google.

### Issue: Email already exists with different provider

**Solution:** The system prevents this. Users must use the provider they originally registered with.

### Issue: Environment variables not loading

**Windows PowerShell:**
```powershell
$env:GOOGLE_CLIENT_ID = "your_value"
./mvnw spring-boot:run
```

## 9. Testing Checklist

- [ ] Google OAuth2 credentials configured
- [ ] Environment variables set
- [ ] Database running
- [ ] Application starts without errors
- [ ] Can register with email/password
- [ ] Can login with email/password
- [ ] Can login with Google OAuth2
- [ ] JWT token generated for both methods
- [ ] Protected endpoints require valid JWT

## 10. Next Steps

1. **Frontend Implementation:**
   - Add "Sign in with Google" button
   - Handle OAuth2 redirect
   - Store JWT token
   - Add token to API requests

2. **Additional Features:**
   - Add Facebook/GitHub OAuth2
   - Implement refresh tokens
   - Add email verification
   - Implement password reset

## Support

For issues or questions, check:
- Application logs: `logs/application.log`
- Google Console: [console.cloud.google.com](https://console.cloud.google.com/)
- Spring Security OAuth2 docs: [spring.io/guides](https://spring.io/guides/tutorials/spring-boot-oauth2/)
