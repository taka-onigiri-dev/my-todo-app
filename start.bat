@echo off
echo === My ToDo App ===
echo.

if not exist node_modules (
    echo Installing dependencies...
    call npm install
    echo.
)

echo Starting Expo for Expo Go (iPhone/Android)...
echo Scan the QR code with your device camera or Expo Go app.
echo.
npx expo start
