# Schema Migration Fix Guide

## Problem

Your backend failed to start with the error:

```
No enum constant com.my_app.schoolboard.model.Role.USER
```

This happens because:

1. **Old data in database**: Your database has users with `role='USER'`, but the Role enum was changed to only include: `STUDENT`, `TEACHER`, `INSTITUTE`, `ADMIN`
2. **Schema mismatch**: Profile tables were created before the new NOT NULL fields were added, causing migration failures

## Solution

### Step 1: Open pgAdmin 4

1. Launch pgAdmin 4
2. Connect to your PostgreSQL server
3. Select the `school_board` database

### Step 2: Run the Fix Script

1. Right-click on `school_board` database
2. Select **Query Tool**
3. Open the file `fix-schema-migration.sql` (or copy its contents)
4. Click **Execute** (F5)

### Step 3: Verify the Fix

The script will show you:

- Count of users by role (should only show STUDENT, TEACHER, INSTITUTE, ADMIN)
- Profile table counts (should be 0 for all tables)
- Success message

### Step 4: Restart Your Backend

1. Go back to IntelliJ IDEA
2. Stop the running Spring Boot application (if still running)
3. Start the application again
4. You should see successful startup with no errors

## What the Script Does

### 1. Updates User Roles

- Converts all `role='USER'` to `role='STUDENT'`
- Ensures all users have valid roles

### 2. Cleans Profile Tables

- Deletes any incomplete profile data
- Drops and recreates all profile tables with correct schema
- Ensures all NOT NULL constraints are properly set

### 3. Creates Performance Indexes

- Adds indexes on frequently queried columns
- Improves database query performance

## After Running the Script

Your database will be ready for the new registration system:

- All users will have valid roles
- Profile tables will be empty but properly structured
- You can test registration with the new role-based system

## Test Registration

After fixing the database, test the new registration endpoints:

### Test School Student Registration

```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "test_student",
    "email": "student@example.com",
    "password": "password123",
    "role": "STUDENT",
    "fullName": "Test Student",
    "dateOfBirth": "2005-01-15",
    "province": "Western",
    "educationLevel": "SCHOOL",
    "schoolName": "Royal College",
    "grade": 11
  }'
```

### Test University Student Registration

```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "uni_student",
    "email": "uni@example.com",
    "password": "password123",
    "role": "STUDENT",
    "fullName": "University Student",
    "dateOfBirth": "2002-03-20",
    "province": "Western",
    "educationLevel": "UNIVERSITY",
    "universityName": "University of Colombo",
    "degreeProgram": "Computer Science",
    "yearOfStudy": 2
  }'
```

## Important Notes

⚠️ **Data Loss Warning**: This script will delete all existing profile data. If you need to preserve data, manually migrate it before running this script.

✅ **Safe for Development**: This approach is perfect for development/testing environments.

🔄 **For Production**: Use versioned migration tools like Flyway or Liquibase with proper rollback capabilities.

## Troubleshooting

### If you still see errors after running the script:

1. **Check if script ran completely**

   ```sql
   SELECT role, COUNT(*) FROM users GROUP BY role;
   ```

   Should only show: STUDENT, TEACHER, INSTITUTE, ADMIN

2. **Verify profile tables exist**

   ```sql
   SELECT table_name FROM information_schema.tables
   WHERE table_schema = 'public'
   AND table_name LIKE '%_profiles';
   ```

3. **Clear IntelliJ IDEA cache**
   - File → Invalidate Caches / Restart
   - Select "Invalidate and Restart"

4. **Clean and rebuild**
   ```bash
   cd backend
   ./mvnw clean package
   ```

## Next Steps

Once your backend starts successfully:

1. ✅ Test all registration endpoints (STUDENT, TEACHER, INSTITUTE)
2. ✅ Test login with newly registered users
3. ✅ Verify profile creation in database
4. ✅ Check that Strategy Pattern is working correctly

For more details on the new architecture, see:

- [REGISTRATION_ARCHITECTURE.md](REGISTRATION_ARCHITECTURE.md)
- [REGISTRATION_TEST_CASES.md](REGISTRATION_TEST_CASES.md)
- [QUICK_START_REGISTRATION.md](QUICK_START_REGISTRATION.md)
