@echo off
chcp 65001 >nul
cd /d "%~dp0.."

echo === アプリ起動 ===
echo.

git pull
call npm install --legacy-peer-deps
npx expo start

pause
