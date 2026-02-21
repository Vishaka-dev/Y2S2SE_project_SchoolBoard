# Quick Start Guide - OAuth2 Setup

## ⚡ 5-Minute Setup

### Step 1: Google Console (2 min)
1. Go to https://console.cloud.google.com/
2. Create project → Enable Google+ API
3. OAuth consent screen → Fill basic info
4. Credentials → Create OAuth 2.0 Client ID
5. Redirect URI: `http://localhost:8080/login/oauth2/code/google`
6. **Copy Client ID & Secret**

### Step 2: Environment Setup (1 min)
```powershell
# Copy template
cp .env.example .env

# Edit .env - fill in these 4 critical values:
DB_PASSWORD=your_postgres_password
JWT_SECRET_KEY=run: openssl rand -hex 32
GOOGLE_CLIENT_ID=paste_from_step_1
GOOGLE_CLIENT_SECRET=paste_from_step_1
```

### Step 3: Run (2 min)
```powershell
# Load environment variables
.\load-env.ps1

# Start application
.\mvnw spring-boot:run
```

## 🧪 Quick Test

### Browser Test
```
http://localhost:8080/oauth2/authorization/google
```
→ Login with Google → Get redirected with JWT token

### Postman Test - Traditional Login
```
POST http://localhost:8080/api/auth/register
Content-Type: application/json

{
  "username": "testuser",
  "email": "test@example.com",
  "password": "password123"
}
```
→ Copy the `token` from response

## 🔐 Use JWT Token

**Postman Authorization Tab:**
- Type: `Bearer Token`
- Token: `<paste token here>`

**Or in Headers:**
```
Authorization: Bearer <paste token here>
```

## 📱 Frontend Button

```html
<a href="http://localhost:8080/oauth2/authorization/google">
  🔐 Sign in with Google
</a>
```

```javascript
// Handle redirect (React/Vue/Angular)
const token = new URLSearchParams(window.location.search).get('token');
if (token) {
  localStorage.setItem('jwt_token', token);
  navigate('/dashboard');
}
```

## ❓ Troubleshooting

| Problem | Solution |
|---------|----------|
| "redirect_uri_mismatch" | Check Google Console redirect URI exactly matches |
| Environment variables not loading | Run `.\load-env.ps1` first |
| Database connection failed | Check PostgreSQL is running & .env has correct password |
| JWT token invalid | Regenerate JWT_SECRET_KEY with `openssl rand -hex 32` |

## 📚 Full Documentation
- [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md) - What changed
- [OAUTH2_SETUP_GUIDE.md](OAUTH2_SETUP_GUIDE.md) - Detailed OAuth2 setup
- [README.md](README.md) - Complete project docs

## 🚀 Endpoints Summary

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/register` | POST | Register with username/password |
| `/api/auth/login` | POST | Login with username/password |
| `/oauth2/authorization/google` | GET | Login with Google OAuth2 |

All return JWT token → Use in `Authorization: Bearer <token>` header

---
Ready to go? Start with Step 1! 🎉
