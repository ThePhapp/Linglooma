@echo off
setlocal
echo use-local-db.bat is a compatibility wrapper for the safe local environment template.
call "%~dp0use-local-env.bat"
exit /b %errorlevel%
