@echo off
setlocal
echo This launcher no longer accepts or writes database credentials.
echo Set DATABASE_URL in your local .env or deployment secret manager, then follow:
echo   ..\SUPABASE_SETUP_GUIDE.md
echo To apply schema changes, run:
echo   run-supabase-migration.bat
exit /b 1
