@echo off
echo Restarting backend server...
cd /d "%~dp0"
echo Stop the current backend with Ctrl+C before running this launcher.
npm start
