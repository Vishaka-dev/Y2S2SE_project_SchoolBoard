# Fix OAuth2 "Error 401: invalid_client"

## ✅ Your Current Configuration (Now Fixed)

**Client ID:** `your-google-client-id.apps.googleusercontent.com`  
**Client Secret:** `your-google-client-secret`  
**Redirect URI:** `http://localhost:8080/login/oauth2/code/google`

---

## 🔧 FIX: Update Google Cloud Console

### Step 1: Go to Google Cloud Console
Open: https://console.cloud.google.com/apis/credentials

### Step 2: Find Your OAuth 2.0 Client ID
Look for your OAuth 2.0 Client ID (it will look like: `your-client-id.apps.googleusercontent.com`)

### Step 3: Click on it to Edit

### Step 4: Check "Authorized redirect URIs"
**Make sure this EXACT URI is added:**
```
http://localhost:8080/login/oauth2/code/google
```

⚠️ **Common mistakes:**
- Missing `/login/oauth2/code/google` path
- Using `https` instead of `http` for localhost
- Having a trailing slash: `google/` ❌
- Wrong port number

### Step 5: Also Check "Authorized JavaScript origins"
Add these if not present:
```
http://localhost:8080
http://localhost:3000
```

### Step 6: SAVE Changes!
Click the **SAVE** button at the bottom.

### Step 7: Wait 1-2 Minutes
Google sometimes takes a moment to update credentials.

---

## 🚀 After Fixing Google Console

### 1. Run the Database Fix (if not done yet)
Open **pgAdmin** → **school_board** database → **Query Tool**

```sql
UPDATE users SET provider = 'LOCAL' WHERE provider IS NULL;
```

### 2. Start the Application
```powershell
cd "e:\Y2S2 project\Y2S2SE_project_SchoolBoard\backend"
.\mvnw.cmd spring-boot:run
```

### 3. Test OAuth2 Login
Open browser: `http://localhost:8080/oauth2/authorization/google`

You should now be able to login with Google! ✅

---

## 🔍 If Still Not Working

### Check These:

1. **Correct Client ID?**
   - Go to Google Console credentials
   - Copy the Client ID again
   - Make sure it matches your .env file

2. **Correct Client Secret?**
   - Click "RESET SECRET" if needed
   - Copy the new secret
   - Update in: `backend/src/main/resources/application.properties`

3. **OAuth Consent Screen Published?**
   - Go to: OAuth consent screen
   - Status should be "Published" or "Testing"
   - Add your email as a test user if in "Testing" mode

4. **API Enabled?**
   - Go to: APIs & Services → Library
   - Search: "Google+ API"
   - Make sure it's ENABLED

---

## 📝 Quick Verification Checklist

- [ ] Redirect URI in Google Console: `http://localhost:8080/login/oauth2/code/google`
- [ ] Client ID matches in both places
- [ ] Client Secret matches in both places
- [ ] OAuth consent screen configured
- [ ] Test user added (if in Testing mode)
- [ ] Saved changes in Google Console
- [ ] Waited 1-2 minutes after saving
- [ ] Database fixed (provider column)
- [ ] Application restarted

---

## 🎯 Expected Result

After clicking "Sign in with Google":
1. Google login page appears
2. Select your account
3. Grant permissions
4. Redirect back with JWT token in URL
5. Success! 🎉

---

## Alternative: Start Fresh

If nothing works, create a NEW OAuth 2.0 Client ID:

1. Go to: https://console.cloud.google.com/apis/credentials
2. Click: **+ CREATE CREDENTIALS** → **OAuth client ID**
3. Application type: **Web application**
4. Name: `SchoolBoard Web Client`
5. Authorized redirect URIs:
   ```
   http://localhost:8080/login/oauth2/code/google
   ```
6. Click **CREATE**
7. Copy the new Client ID and Secret
8. Update in `application.properties`
