# OAuth2 Google Login Debug Guide

## ✅ Current Configuration Status

### Backend Configuration
- **Frontend URL**: `http://localhost:5173`
- **Backend URL**: `http://localhost:8080`
- **OAuth2 Redirect**: `/oauth2/success?token=JWT`
- **Google Redirect URI**: `http://localhost:8080/login/oauth2/code/google`

### Frontend Configuration
- **Port**: 5173 (Vite default)
- **OAuth2 Routes**: `/oauth2/success` and `/oauth2/redirect`
- **Backend API**: `http://localhost:8080`

---

## 🔍 Step-by-Step Debugging

### Step 1: Verify Google Cloud Console Settings
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to: **APIs & Services > Credentials**
3. Click on your OAuth 2.0 Client ID
4. Under **Authorized redirect URIs**, you MUST have:
   ```
   http://localhost:8080/login/oauth2/code/google
   ```
5. If not present, add it and **SAVE**
6. Wait 5 minutes for changes to propagate

### Step 2: Check Backend Logs
When you click "Google" button, check backend console for:
```
Processing OAuth2 user: [email] from provider: google
OAuth2 authentication successful for user: [email]
Redirecting to: http://localhost:5173/oauth2/success?token=...
```

### Step 3: Check Frontend Network Tab
1. Open browser DevTools (F12)
2. Go to Network tab
3. Click "Google" button
4. Watch for:
   - Redirect to `http://localhost:8080/oauth2/authorization/google`
   - Redirect to Google login
   - Callback to `http://localhost:8080/login/oauth2/code/google`
   - Final redirect to `http://localhost:5173/oauth2/success?token=...`

### Step 4: Check Browser Console
Look for any JavaScript errors in the browser console

---

## 🚀 Quick Testing Commands

### Terminal 1 - Start Backend
```powershell
cd backend
.\mvnw clean spring-boot:run
```

### Terminal 2 - Start Frontend
```powershell
cd frontend
npm run dev
```

---

## 🐛 Common Issues & Solutions

### Issue 1: "Redirect URI mismatch" error
**Problem**: Google shows error about redirect URI
**Solution**: 
- Verify `http://localhost:8080/login/oauth2/code/google` is in Google Console
- Make sure there are no typos or trailing slashes
- Clear browser cache and cookies

### Issue 2: Google login works but no redirect to frontend
**Problem**: Stuck on blank page after Google login
**Solution**:
- Check backend logs for "Redirecting to:" message
- Verify `app.frontend-url=http://localhost:5173` in application.properties
- Make sure frontend is running on port 5173

### Issue 3: Backend creates user but frontend doesn't receive token
**Problem**: User created in DB but frontend shows "No token received"
**Solution**:
- Check CORS configuration allows `http://localhost:5173`
- Verify OAuth2AuthenticationSuccessHandler is generating token
- Check browser Network tab for the redirect URL with token parameter

### Issue 4: "Email not found from OAuth2 provider"
**Problem**: Backend throws exception during OAuth2 processing
**Solution**:
- Make sure Google OAuth scopes include "email" and "profile"
- Verify in Google Console that email scope is enabled

### Issue 5: CORS errors
**Problem**: Browser shows CORS policy errors
**Solution**:
- Restart backend after changing CORS configuration
- Make sure frontend URL matches exactly (no trailing slash)
- Clear browser cache

---

## 🧪 Manual Testing Steps

1. **Start Backend**: `cd backend && .\mvnw spring-boot:run`
2. **Start Frontend**: `cd frontend && npm run dev`
3. **Open Browser**: Navigate to `http://localhost:5173`
4. **Click Google Button**: Should redirect to Google
5. **Select Account**: Choose your Google account
6. **Allow Permissions**: Grant email and profile access
7. **Verify Redirect**: Should return to `http://localhost:5173/oauth2/success?token=...`
8. **Check Dashboard**: Should auto-redirect to dashboard
9. **Verify in Database**: 
   ```sql
   SELECT id, username, email, provider FROM users WHERE provider = 'GOOGLE';
   ```

---

## 📊 Database Verification

After successful Google login, verify user was created:

```sql
-- Check if Google user exists
SELECT * FROM users WHERE provider = 'GOOGLE';

-- Verify password is null for OAuth2 users
SELECT id, username, email, password, provider 
FROM users 
WHERE provider = 'GOOGLE';
```

Expected result:
- `username`: Generated from email (e.g., "john_doe")
- `email`: Your Google email
- `password`: Should be NULL
- `provider`: Should be "GOOGLE"
- `role`: Should be "USER"

---

## 🔧 Configuration Files Check

### backend/src/main/resources/application.properties
```properties
# Google OAuth2
spring.security.oauth2.client.registration.google.client-id=${GOOGLE_CLIENT_ID}
spring.security.oauth2.client.registration.google.client-secret=${GOOGLE_CLIENT_SECRET}
spring.security.oauth2.client.registration.google.scope=profile,email
spring.security.oauth2.client.registration.google.redirect-uri=http://localhost:8080/login/oauth2/code/google

# Frontend URL
app.frontend-url=http://localhost:5173
```

### frontend/.env
```
VITE_API_BASE_URL=http://localhost:8080
```

---

## 🎯 Expected Flow

1. User clicks "Google" button
2. Frontend redirects to: `http://localhost:8080/oauth2/authorization/google`
3. Backend redirects to: `https://accounts.google.com/o/oauth2/auth...`
4. User logs in with Google
5. Google redirects to: `http://localhost:8080/login/oauth2/code/google?code=...`
6. Backend processes OAuth2:
   - `CustomOAuth2UserService.loadUser()` is called
   - Checks if user exists by email
   - Creates new user if not exists (provider=GOOGLE)
   - Returns `CustomOAuth2User` object
7. `OAuth2AuthenticationSuccessHandler` is called:
   - Generates JWT token using `jwtService.generateToken(user)`
   - Redirects to: `http://localhost:5173/oauth2/success?token=JWT`
8. Frontend `OAuth2Redirect` component:
   - Extracts token from URL params
   - Saves to localStorage
   - Redirects to `/dashboard`

---

## 📝 Enable More Detailed Logging

Already enabled in application.properties:
```properties
logging.level.com.my_app.schoolboard=DEBUG
logging.level.org.springframework.security=DEBUG
```

This will show:
- OAuth2 user processing
- JWT token generation
- Security filter chain execution
- Redirect URLs

---

## 🆘 Still Not Working?

1. **Clean and rebuild**:
   ```powershell
   cd backend
   .\mvnw clean install
   .\mvnw spring-boot:run
   ```

2. **Clear browser data**:
   - Clear cookies for `localhost`
   - Clear localStorage
   - Use incognito mode

3. **Check database connection**:
   ```sql
   SELECT COUNT(*) FROM users;
   ```

4. **Verify Google credentials are valid**:
   - Client ID and Secret are correct
   - OAuth consent screen is configured
   - Test users are added (if in testing mode)

5. **Check firewall/antivirus**:
   - Make sure ports 8080 and 5173 are not blocked

---

## 📞 Get More Help

If still not working, provide:
1. Backend console logs from startup to Google login attempt
2. Browser console errors
3. Network tab screenshot showing the redirect chain
4. Screenshot of any error messages
