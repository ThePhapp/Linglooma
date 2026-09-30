@echo off
REM ==========================================
REM Run Migration to Supabase Database
REM ==========================================

echo.
echo ========================================
echo  Running Migration to Supabase
echo ========================================
echo.

REM Check if DATABASE_URL is set
if not defined DATABASE_URL (
    echo [ERROR] DATABASE_URL not found in environment!
    echo.
    echo Please set DATABASE_URL first:
    echo set DATABASE_URL=postgresql://postgres.[PROJECT_REF]:[YOUR-PASSWORD]@[POOLER_HOST]:6543/postgres
    echo.
    pause
    exit /b 1
)

echo Using DATABASE_URL from environment...
echo.
echo Running migration file: linglooma_update.sql
echo.

REM Run migration using psql
psql "%DATABASE_URL%" -f ..\02-database-postgresql\linglooma_update.sql

if errorlevel 1 (
    echo.
    echo [ERROR] Migration failed!
    echo.
    echo Troubleshooting:
    echo 1. Make sure psql is installed: https://www.postgresql.org/download/
    echo 2. Verify DATABASE_URL is correct
    echo 3. Check if Supabase database is active
    echo.
) else (
    echo.
    echo ========================================
    echo  Migration completed successfully!
    echo ========================================
    echo.
    echo Tables created: 11
    echo Sample data inserted
    echo.
)

pause
