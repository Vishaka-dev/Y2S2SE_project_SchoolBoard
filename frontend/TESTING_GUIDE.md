# Quick Start Guide - Testing Authentication

This guide will help you quickly test the JWT and OAuth2 authentication system.

## Prerequisites Checklist

- [ ] Backend server running on `http://localhost:8080`
- [ ] PostgreSQL database running and migrated
- [ ] Google OAuth2 credentials configured in backend
- [ ] Node.js 20+ installed

## Step 1: Start the Frontend

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies (if not already done)
npm install

# Start development server
npm run dev
```

The frontend should start at `http://localhost:3000` (or another port if 3000 is busy).

## Step 2: Test Traditional Login

### Using Email/Password

1. Open browser at `http://localhost:3000`
2. You should see the Login page with:
   - Email input field
   - Password input field
   - "Sign in to Account" button
   - "Google" button

3. Enter credentials:
   - Email: Your registered email
   - Password: Your password

4. Click "Sign in to Account"

5. If successful:
   - You'll be redirected to `/dashboard`
   - JWT token stored in localStorage
   - Dashboard displays welcome message

6. If failed:
   - Error message displays below the form
   - Check backend logs for details

### Register New User (Optional)

If you need to create a test user, use the backend API directly:

```bash
POST http://localhost:8080/api/auth/register
Content-Type: application/json

{
  "name": "Test User",
  "email": "test@example.com",
  "password": "password123"
}
```

## Step 3: Test Google OAuth2 Login

### Setup Google OAuth2 (One-time)

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Find your OAuth 2.0 Client ID
3. Add authorized redirect URI:
   ```
   http://localhost:8080/login/oauth2/code/google
   ```
4. Save changes
5. Wait 1-2 minutes for propagation

### Test OAuth2 Flow

1. On the login page, click the **"Google"** button
2. You'll be redirected to Google's login page
3. Choose/login with your Google account
4. Authorize the application
5. You'll be redirected back to the application
6. Frontend receives JWT token and redirects to Dashboard

### OAuth2 Flow Diagram

```
Browser → Click Google Button
   ↓
Frontend redirects to:
   http://localhost:8080/oauth2/authorization/google
   ↓
Google Login Page → User authenticates
   ↓
Google redirects to:
   http://localhost:8080/login/oauth2/code/google?code=...
   ↓
Backend processes code, creates JWT
   ↓
Backend redirects to:
   http://localhost:3000/oauth2/redirect?token=JWT_TOKEN
   ↓
Frontend stores token, redirects to Dashboard
```

## Step 4: Verify Authentication

### Check Token Storage

1. Open browser DevTools (F12)
2. Go to Application/Storage → Local Storage
3. Find `http://localhost:3000`
4. You should see: `token: "eyJ..."`

### Test Protected Route

1. Navigate to Dashboard: `http://localhost:3000/dashboard`
2. If logged in: Dashboard loads
3. If not logged in: Redirected to `/login`

### Test Logout

1. On Dashboard, click "Logout" button
2. Token is removed from localStorage
3. Redirected to login page
4. Try accessing `/dashboard` directly → Should redirect to `/login`

## Step 5: Testing Scenarios

### Scenario 1: Invalid Credentials

1. Enter wrong email/password
2. Click login
3. Expected: Error message displays
4. Verify: "Invalid credentials" or similar message

### Scenario 2: Token Expiration

1. Login successfully
2. Wait for token to expire (24 hours by default)
3. Try making authenticated request
4. Expected: Auto-logout, redirect to login

### Scenario 3: Direct Dashboard Access

1. Clear localStorage (or use incognito)
2. Navigate to `http://localhost:3000/dashboard`
3. Expected: Immediate redirect to `/login`

### Scenario 4: OAuth2 Error Handling

1. Click Google login
2. Decline authorization on Google page
3. Expected: Redirect back with error message
4. After 3 seconds: Redirect to login

## Troubleshooting

### Frontend Won't Start

```bash
# Clear dependencies and reinstall
rm -rf node_modules package-lock.json
npm install

# Check Node version
node --version  # Should be 20+
```

### API Connection Refused

- **Problem**: `ERR_CONNECTION_REFUSED` in console
- **Solution**: Verify backend is running on port 8080
  ```bash
  curl http://localhost:8080/api/auth/login
  ```

### CORS Errors

- **Problem**: CORS policy errors in console
- **Solution**: Check backend `CorsConfig.java` allows `http://localhost:3000`

### OAuth2 "Invalid Client" Error

- **Problem**: Google returns "Error 401: invalid_client"
- **Solutions**:
  1. Verify redirect URI in Google Console
  2. Check Google Client ID in backend `.env`
  3. Ensure backend reads environment variables correctly

### Token Not Persisting

- **Problem**: Login works but token disappears
- **Solutions**:
  1. Check browser console for errors
  2. Verify localStorage is enabled
  3. Check if private/incognito mode is preventing storage

### Redirect Loop

- **Problem**: Keeps redirecting between `/login` and `/dashboard`
- **Solutions**:
  1. Clear localStorage: `localStorage.clear()`
  2. Check token validity
  3. Verify `authService.isAuthenticated()` logic

## Testing Checklist

- [ ] Frontend starts without errors
- [ ] Login page displays correctly
- [ ] Email/password login works
- [ ] Invalid credentials show error
- [ ] Successful login redirects to dashboard
- [ ] Token stored in localStorage
- [ ] Dashboard displays user data
- [ ] Google button present
- [ ] Google OAuth2 redirects correctly
- [ ] OAuth2 login completes successfully
- [ ] Logout works and clears token
- [ ] Protected routes redirect when not authenticated
- [ ] Direct dashboard access redirected if not logged in

## Developer Tools

### Inspect Network Requests

1. Open DevTools → Network tab
2. Login with email/password
3. Find `POST /api/auth/login` request
4. Check:
   - Request payload: `{ email, password }`
   - Response: `{ token: "..." }`
   - Status: 200 OK

### Inspect Elements

1. Right-click on login form → Inspect
2. Verify Tailwind classes are applied
3. Check for any styling issues

### React DevTools

1. Install React DevTools extension
2. Inspect component tree
3. Check component props and state

## Next Steps

Once authentication is working:

1. Add more protected routes
2. Implement user profile page
3. Add password reset functionality
4. Implement refresh token logic
5. Add multi-factor authentication
6. Create admin dashboard

## Support

If you encounter issues not covered here:

1. Check backend logs for errors
2. Check browser console for frontend errors
3. Verify environment variables are loaded
4. Check database connectivity
5. Refer to `FRONTEND_README.md` for detailed documentation

---

**Happy Testing! 🚀**
