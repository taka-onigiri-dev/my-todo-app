@echo off
echo === My ToDo App (Expo Go) ===
echo.

if not exist node_modules (
    echo Installing dependencies...
    call npm install
    echo.
)

echo Starting Expo for Expo Go...
echo.
echo Options:
echo   --tunnel : Use tunnel mode (for network restrictions)
echo.

if "%1"=="--tunnel" (
    echo Starting with tunnel mode...
    npx expo start --tunnel
) else (
    npx expo start
)
