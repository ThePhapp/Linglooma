@echo off
setlocal
rem Canonical, non-destructive forward migrations. Run from any directory.
where pwsh.exe >nul 2>&1
if %errorlevel% equ 0 (
    pwsh.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0run-migration.ps1"
) else (
    powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0run-migration.ps1"
)
exit /b %errorlevel%
