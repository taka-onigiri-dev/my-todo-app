@echo off
chcp 65001 >nul
cd /d "%~dp0.."

echo === My ToDo App (Expo Go) ===
echo.

if not exist node_modules (
    echo Installing dependencies...
    call npm install --legacy-peer-deps
    echo.
)

echo Starting Expo for Expo Go...
echo.

if "%1"=="--tunnel" (
    echo Starting with tunnel mode...
    npx expo start --tunnel
) else (
    npx expo start
)

pause
