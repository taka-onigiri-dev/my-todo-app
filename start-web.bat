@echo off
echo === My ToDo App (Web) ===
echo.

if not exist node_modules (
    echo Installing dependencies...
    call npm install
    echo.
)

echo Starting Expo for Web...
npx expo start --web
