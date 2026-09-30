@echo off
REM ==========================================
REM Switch to Supabase Database Configuration
REM ==========================================

echo.
echo ========================================
echo  Supabase Database Configuration
echo ========================================
echo.

REM Check if .env file exists
if not exist .env (
    echo [ERROR] .env file not found!
    echo Please create .env from .env.example first
    pause
    exit /b 1
)

REM Prompt for Supabase DATABASE_URL
echo Please enter your Supabase DATABASE_URL:
echo Format: postgresql://postgres.xxxxx:password@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres
echo.
set /p DATABASE_URL="DATABASE_URL: "

if "%DATABASE_URL%"=="" (
    echo [ERROR] DATABASE_URL cannot be empty!
    pause
    exit /b 1
)

REM Backup current .env
echo.
echo [1/3] Backing up current .env to .env.backup...
copy /Y .env .env.backup > nul
echo       Backup created: .env.backup

REM Create new .env with DATABASE_URL
echo.
echo [2/3] Creating new .env with Supabase configuration...

(
echo # ==========================================
echo # DATABASE CONFIGURATION - SUPABASE
echo # ==========================================
echo DATABASE_URL=%DATABASE_URL%
echo.
echo # Local DB config ^(commented out when using Supabase^)
echo # DB_HOST=localhost
echo # DB_PORT=5433
echo # DB_USER=postgres
echo # DB_PASSWORD=your_local_database_password
echo # DB_NAME=linglooma
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

echo       New .env created with DATABASE_URL

REM Test connection
echo.
echo [3/3] Testing connection to Supabase...
echo.
node -e "require('dotenv').config(); const {Pool}=require('pg'); const p=new Pool({connectionString:process.env.DATABASE_URL,ssl:{rejectUnauthorized:false}}); p.connect((e,c,r)=>{if(e){console.error('❌ Connection FAILED:',e.message);}else{console.log('✅ Connection SUCCESS!');r();}p.end()});"

echo.
echo ========================================
echo  Configuration Complete!
echo ========================================
echo.
echo Your database is now configured to use Supabase.
echo.
echo To restore local configuration, run: use-local-db.bat
echo.
pause
