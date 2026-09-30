@echo off
echo ==========================================
echo Switching to DOCKER Mode
echo ==========================================
echo.

cd /d "%~dp0"

if not exist ".env.docker" (
    if not exist ".env.docker.example" (
        echo ERROR: .env.docker.example not found!
        pause
        exit /b 1
    )
    echo Creating .env.docker from the safe example template...
    copy /Y ".env.docker.example" ".env.docker" >nul
    echo Review .env.docker and replace placeholder credentials before using AI features.
)

echo Backing up current .env to .env.backup...
if exist ".env" (
    copy /Y ".env" ".env.backup" >nul
)

echo Copying .env.docker to .env...
copy /Y ".env.docker" ".env" >nul

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ==========================================
    echo SUCCESS! Now using DOCKER configuration
    echo ==========================================
    echo.
    echo Configuration:
    echo   - DB_HOST: db ^(Docker network^)
    echo   - All services run in Docker
    echo.
    echo Next steps:
    echo   1. Go to project root:
    echo      cd ..
    echo.
    echo   2. Start all services:
    echo      docker-compose up --build
    echo.
    echo   3. Access:
    echo      Frontend: http://localhost
    echo      Backend: http://localhost:3000
    echo      Database: localhost:5432
    echo.
) else (
    echo ERROR: Failed to copy .env.docker to .env
)

pause
