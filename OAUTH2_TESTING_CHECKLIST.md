# Google OAuth2 Setup Checklist

## ✅ Pre-Testing Checklist

### Google Cloud Console Configuration
- [ ] Go to [Google Cloud Console](https://console.cloud.google.com/)
- [ ] Navigate to **APIs & Services** > **Credentials**
- [ ] Find your OAuth 2.0 Client ID
- [ ] Under **Authorized redirect URIs**, verify this exact URI exists:
      ```
      http://localhost:8080/login/oauth2/code/google
      ```
- [ ] If not present, add it and click **SAVE**
- [ ] Wait 5 minutes for Google to propagate the changes

### Backend Setup
- [ ] Database is running (PostgreSQL on localhost:5432)
- [ ] `application.properties` has correct Google credentials
- [ ] Backend is built: `cd backend && .\mvnw clean install`
- [ ] Backend is running: `.\mvnw spring-boot:run`
- [ ] Backend is accessible at `http://localhost:8080`

### Frontend Setup
- [ ] Dependencies installed: `cd frontend && npm install`
- [ ] `.env` file exists with: `VITE_API_BASE_URL=http://localhost:8080`
- [ ] Frontend is running: `npm run dev`
- [ ] Frontend is accessible at `http://localhost:5173`

## 🧪 Testing Steps

### Step 1: Run Configuration Test
```powershell
cd backend
.\test-oauth2.ps1
```
This will verify all services are running correctly.

### Step 2: Test Regular Login (Should Work)
1. Go to `http://localhost:5173`
2. Enter email and password of a user you registered
3. Click "Sign in to Account"
4. Should redirect to Dashboard

### Step 3: Test Google OAuth2 Login
1. Go to `http://localhost:5173`
2. Click the **"Google"** button
3. **Watch Backend Console** - should see:
   ```
   === OAuth2 User Load Started ===
   Client Registration ID: google
   OAuth2 User Attributes: {sub=..., email=..., name=...}
   Processing OAuth2 user: your@email.com from provider: google
   === OAuth2 User Load Completed Successfully ===
   === OAuth2 Authentication Success Handler Called ===
   Frontend URL configured: http://localhost:5173
   Authenticated user: username (your@email.com)
   JWT token generated (length: xxx)
   Full redirect URL: http://localhost:5173/oauth2/success?token=...
   === Redirecting to Frontend ===
   ```
4. **Watch Browser Console (F12)** - should see:
   ```
   === OAuth2 Redirect Page Loaded ===
   Current URL: http://localhost:5173/oauth2/success?token=...
   Token from URL: eyJhbGciOiJIUzI1NiJ9...
   Saving token to localStorage
   Redirecting to dashboard
   ```
5. Should be redirected to Dashboard
6. Dashboard should display your user information

### Step 4: Verify Database
```sql
SELECT id, username, email, provider, role, created_at 
FROM users 
WHERE provider = 'GOOGLE';
```
Should show your Google user with:
- `provider` = 'GOOGLE'
- `password` = NULL
- `role` = 'USER'

## 🐛 If Google Login Fails

### Check 1: Google Redirect URI Error
**Error**: "redirect_uri_mismatch" or similar Google error page

**Solution**:
1. Copy the **exact** redirect URI from the error message
2. Go to Google Cloud Console > Credentials
3. Add that exact URI to Authorized redirect URIs
4. Save and wait 5 minutes
5. Try again in incognito mode

### Check 2: Stuck After Google Login
**Symptom**: Blank white page after selecting Google account

**Debug**:
1. Check backend console - any errors?
2. Check browser Network tab:
   - Was there a redirect to `/oauth2/success`?
   - What was the final URL?
3. Check browser console - any JavaScript errors?

**Common Causes**:
- Frontend not running on port 5173
- Backend `app.frontend-url` is wrong
- CORS blocking the request

### Check 3: "No token received"
**Symptom**: Frontend shows "No token received from OAuth2 provider"

**Debug**:
1. Check backend logs - was JWT generated?
2. Check browser URL bar - is there a `?token=` parameter?
3. Open Network tab, find the redirect request, check response headers

**Common Causes**:
- OAuth2AuthenticationSuccessHandler not being called
- JwtService failing to generate token
- Redirect URL not including token parameter

### Check 4: Backend Errors
**Symptom**: Backend shows exceptions in console

**Common Exceptions**:
- `Email not found from OAuth2 provider`: Google account has no email
- `OAuth2AuthenticationProcessingException`: General OAuth2 error
- `DataIntegrityViolationException`: Username collision (rare)

**Solution**:
- Make sure Google account has email
- Check backend logs for specific error
- Try with a different Google account

### Check 5: CORS Errors
**Symptom**: Browser console shows CORS policy errors

**Solution**:
1. Restart backend (CORS config might not have loaded)
2. Verify `app.frontend-url=http://localhost:5173` (no trailing slash)
3. Clear browser cache
4. Try incognito mode

## 📊 Monitoring Tools

### Backend Logs
Watch for these log entries:
- `=== OAuth2 User Load Started ===`
- `Processing OAuth2 user: email from provider: google`
- `OAuth2 authentication successful`
- `=== Redirecting to Frontend ===`

### Browser DevTools (F12)
- **Console**: JavaScript logs and errors
- **Network**: HTTP requests and redirects
- **Application > Local Storage**: Check if token is saved

### Database Queries
```sql
-- Check all users
SELECT * FROM users ORDER BY created_at DESC;

-- Check Google users
SELECT * FROM users WHERE provider = 'GOOGLE';

-- Count by provider
SELECT provider, COUNT(*) FROM users GROUP BY provider;
```

## ✅ Success Criteria

You'll know it's working when:
1. ✓ You click Google button
2. ✓ Google login page appears
3. ✓ You select your account
4. ✓ You grant permissions (first time only)
5. ✓ Browser redirects to `http://localhost:5173/oauth2/success?token=...`
6. ✓ Token is visible in URL (briefly)
7. ✓ Automatically redirects to Dashboard
8. ✓ Dashboard shows your information
9. ✓ New user appears in database with `provider = 'GOOGLE'`
10. ✓ You can refresh page and stay logged in

## 🔄 Clean Slate Test

If you want to start fresh:

```sql
-- Delete all Google users (keep LOCAL users)
DELETE FROM users WHERE provider = 'GOOGLE';
```

```powershell
# Clear frontend localStorage
# In browser console:
localStorage.clear()
```

Then try Google login again from the beginning.
