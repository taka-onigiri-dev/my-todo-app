@echo off
chcp 65001 >nul
cd /d "%~dp0.."

echo === My ToDo App (Web) ===
echo.

if not exist node_modules (
    echo Installing dependencies...
    call npm install --legacy-peer-deps
    echo.
)

echo Starting Expo for Web...
npx expo start --web

pause
