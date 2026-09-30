@echo off
echo ==========================================
echo Switching to LOCAL Development Mode
echo ==========================================
echo.

cd /d "%~dp0"

if not exist ".env.local" (
    if not exist ".env.local.example" (
        echo ERROR: .env.local.example not found!
        pause
        exit /b 1
    )
    echo Creating .env.local from the safe example template...
    copy /Y ".env.local.example" ".env.local" >nul
    echo Review .env.local and replace placeholder credentials before using AI features.
)

echo Backing up current .env to .env.backup...
if exist ".env" (
    copy /Y ".env" ".env.backup" >nul
)

echo Copying .env.local to .env...
copy /Y ".env.local" ".env" >nul

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ==========================================
    echo SUCCESS! Now using LOCAL configuration
    echo ==========================================
    echo.
    echo Configuration:
    echo   - DB_HOST: localhost
    echo   - Backend: Run with 'npm run dev'
    echo   - Frontend: Run with 'npm run dev'
    echo   - Database: Docker container ^(host port 5433^)
    echo.
    echo Next steps:
    echo   1. Make sure database container is running:
    echo      docker compose -f ..\docker-compose.yml up -d db
    echo.
    echo   2. Start backend:
    echo      npm run dev
    echo.
    echo   3. Start frontend ^(in another terminal^):
    echo      cd ..\00-frontend-react
    echo      npm run dev
    echo.
) else (
    echo ERROR: Failed to copy .env.local to .env
)

pause
