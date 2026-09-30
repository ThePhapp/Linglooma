@echo off
REM ==========================================
REM Switch to Local Database Configuration
REM ==========================================

echo.
echo ========================================
echo  Local Database Configuration
echo ========================================
echo.

REM Check if .env file exists
if not exist .env (
    echo [ERROR] .env file not found!
    echo Please create .env from .env.example first
    pause
    exit /b 1
)

REM Backup current .env
echo [1/2] Backing up current .env to .env.backup...
copy /Y .env .env.backup > nul
echo       Backup created: .env.backup

REM Create new .env with local config
echo.
echo [2/2] Creating new .env with local configuration...

(
echo # ==========================================
echo # DATABASE CONFIGURATION - LOCAL
echo # ==========================================
echo DB_HOST=localhost
echo DB_PORT=5433
echo DB_USER=postgres
echo DB_PASSWORD=your_local_database_password
echo DB_NAME=linglooma
echo.
echo # Supabase DATABASE_URL ^(commented out when using local^)
echo # DATABASE_URL=postgresql://postgres.xxxxx:password@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres
echo.
echo # ==========================================
echo # JWT ^& API KEYS
echo # ==========================================
) > .env

REM Append existing JWT and API keys from backup
findstr /B "JWT_SECRET= JWT_EXPIRE= GEMINI_API_KEY= AZURE_SPEECH_KEY= AZURE_SPEECH_REGION= PORT=" .env.backup >> .env 2>nul

REM If keys not found in backup, use defaults
findstr /B "JWT_SECRET=" .env > nul
if errorlevel 1 (
    echo JWT_SECRET=replace_with_a_long_random_secret >> .env
    echo JWT_EXPIRE=1d >> .env
    echo GEMINI_API_KEY=your-gemini-api-key-here >> .env
    echo AZURE_SPEECH_KEY=your-azure-speech-key-here >> .env
    echo AZURE_SPEECH_REGION=eastasia >> .env
    echo PORT=3000 >> .env
)

echo       New .env created with local config

echo.
echo ========================================
echo  Configuration Complete!
echo ========================================
echo.
echo Your database is now configured to use local PostgreSQL.
echo Make sure PostgreSQL is running on localhost:5433
echo.
echo To check if PostgreSQL is running, run: check-port-5432.bat
echo To switch back to Supabase, run: use-supabase-db.bat
echo.
pause
