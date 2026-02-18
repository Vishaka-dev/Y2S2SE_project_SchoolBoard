# ⚠️ DATABASE FIX NEEDED

## The Issue
The application failed to start because existing users in the database have NULL values in the `provider` column.

## ✅ QUICK FIX (Copy & Paste)

### Open Command Prompt and run this ONE command:

```cmd
cd "e:\Y2S2 project\Y2S2SE_project_SchoolBoard\backend" && echo UPDATE users SET provider = 'LOCAL' WHERE provider IS NULL; | "C:\Program Files\PostgreSQL\16\bin\psql.exe" -U postgres -d school_board
```

**Note:** Change `PostgreSQL\16` to your PostgreSQL version (could be 14, 15, 17, etc.)

---

## Alternative: Use pgAdmin (Easiest)

1. Open **pgAdmin**
2. Connect to **school_board** database
3. Click **Query Tool** (or press F5)
4. Paste this SQL:
   ```sql
   UPDATE users SET provider = 'LOCAL' WHERE provider IS NULL;
   ```
5. Click **Execute** (▶ button or F5)
6. You should see: `UPDATE X` (X = number of rows updated)

---

## After Fixing the Database

Run the application:

```powershell
cd "e:\Y2S2 project\Y2S2SE_project_SchoolBoard\backend"
.\mvnw.cmd spring-boot:run
```

The application should now start successfully! ✅

---

## What This Fix Does

Updates all existing users to use "LOCAL" authentication provider (email/password login).
This is required for the new OAuth2 (Google login) feature to work properly.

---

## Test After Starting

Once the application starts, test these endpoints:

**Traditional Login:**
```
POST http://localhost:8080/api/auth/login
{
  "username": "your_username",
  "password": "your_password"
}
```

**Google OAuth2 Login:**
```
http://localhost:8080/oauth2/authorization/google
```

Both should work! 🎉
