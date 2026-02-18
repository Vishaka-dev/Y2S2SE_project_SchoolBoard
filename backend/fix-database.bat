@echo off
REM Database Fix Script for SchoolBoard
REM This script updates existing users to have provider = 'LOCAL'

echo ========================================
echo   SchoolBoard Database Fix
echo ========================================
echo.
echo This will update existing users in the database
echo to set provider = 'LOCAL' for OAuth2 compatibility.
echo.

set PGPASSWORD=Kw62590889
"C:\Program Files\PostgreSQL\16\bin\psql.exe" -U postgres -d school_board -c "UPDATE users SET provider = 'LOCAL' WHERE provider IS NULL; SELECT 'Updated ' || COUNT(*) || ' users' FROM users WHERE provider = 'LOCAL';"

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERROR: Failed to update database
    echo Please run the following SQL manually:
    echo.
    echo   UPDATE users SET provider = 'LOCAL' WHERE provider IS NULL;
    echo.
    pause
    exit /b 1
)

echo.
echo ========================================
echo   Database fixed successfully!
echo ========================================
echo.
pause
