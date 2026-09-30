@echo off
echo ==========================================
echo Starting Database Container Only
echo ==========================================
echo.

REM Change to script directory (project root)
cd /d "%~dp0"

echo Starting database container only...
docker compose up -d db

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ==========================================
    echo Database container started successfully!
    echo ==========================================
    echo.
    echo Waiting for database to be ready...
    timeout /t 5 /nobreak >nul
    
    echo.
    echo Database is ready!
    echo   - Host: localhost
    echo   - Port: 5433
    echo   - Database: linglooma
    echo   - User: postgres
    echo   - Password: your configured local database password
    echo.
    echo You can now run backend locally:
    echo   cd 01-backend-nodejs
    echo   npm run dev
    echo.
    echo To check database container:
    echo   docker ps
    echo.
    echo To view database logs:
    echo   docker compose logs -f db
    echo.
) else (
    echo ERROR: Failed to start database container
    pause
    exit /b 1
)

pause
