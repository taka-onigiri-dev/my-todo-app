@echo off
chcp 65001 >nul
cd /d "%~dp0.."

echo === My ToDo App ===
echo.

REM 最新コード取得 & 依存関係インストール
git pull
call npm install --legacy-peer-deps
echo.

echo Starting Expo...
npx expo start

pause
