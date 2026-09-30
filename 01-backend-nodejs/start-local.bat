@echo off
echo ==========================================
echo Starting Backend in LOCAL Mode
echo ==========================================
echo.

cd /d "%~dp0"

REM Check if node_modules exists
if not exist "node_modules" (
    echo node_modules not found! Installing dependencies...
    echo.
    npm ci
    if %ERRORLEVEL% NEQ 0 (
        echo ERROR: Failed to install dependencies
        pause
        exit /b 1
    )
)

REM Switch to local env
echo Switching to local environment...
call use-local-env.bat

echo.
echo ==========================================
echo Starting backend server...
echo ==========================================
echo.

npm run dev
