@echo off
setlocal
if not defined DATABASE_URL (
    echo Set DATABASE_URL for the target PostgreSQL database before running this launcher.
    exit /b 1
)
echo Applying forward migrations to the database in DATABASE_URL.
echo See ..\02-database-postgresql\RUN_MIGRATION.md for connection and backup instructions.
pushd "%~dp0..\02-database-postgresql" || exit /b 1
call run-migration.bat
set "result=%ERRORLEVEL%"
popd
exit /b %result%
