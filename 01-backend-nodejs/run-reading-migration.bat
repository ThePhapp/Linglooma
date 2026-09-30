@echo off
setlocal
echo Reading schema changes use the forward migration runner.
echo See ..\02-database-postgresql\RUN_MIGRATION.md for connection and backup instructions.
pushd "%~dp0..\02-database-postgresql" || exit /b 1
call run-migration.bat
set "result=%ERRORLEVEL%"
popd
exit /b %result%
