# Database Fix Required

## Quick Fix (Choose ONE option)

### Option 1: Update Existing Data (Recommended)
Run this in your PostgreSQL client (pgAdmin, DBeaver, or psql):

```sql
UPDATE users SET provider = 'LOCAL' WHERE provider IS NULL;
```

### Option 2: Drop and Recreate Table (Will lose all existing data)
```sql
DROP TABLE users;
-- Restart the application - Hibernate will recreate the table
```

### Option 3: Using psql command line
```bash
# Open Command Prompt (not PowerShell) and run:
psql -U postgres -d school_board

# Then inside psql:
UPDATE users SET provider = 'LOCAL' WHERE provider IS NULL;
\q
```

### Option 4: Using pgAdmin
1. Open pgAdmin
2. Connect to school_board database
3. Open Query Tool
4. Paste: `UPDATE users SET provider = 'LOCAL' WHERE provider IS NULL;`
5. Click Execute (F5)

## After Running the SQL

1. Go back to your terminal
2. Run: `.\mvnw.cmd spring-boot:run`
3. The application should start successfully!

## Verification

After the application starts, you should see:
```
Started SchoolBoardApplication in X.XXX seconds
Tomcat started on port 8080
```

Then you can test:
- http://localhost:8080/api/auth/register
- http://localhost:8080/oauth2/authorization/google
