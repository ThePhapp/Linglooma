@echo off
setlocal
echo Checking the configured PostgreSQL host port 5433...
netstat -ano | findstr ":5433"
if %errorlevel% equ 0 (
    echo A process is listening on port 5433. Use docker compose ps to confirm it is the Linglooma database.
) else (
    echo Nothing is listening on port 5433. Start the database with: docker compose up -d db
)
exit /b 0
