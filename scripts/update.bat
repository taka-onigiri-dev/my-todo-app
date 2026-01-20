@echo off
chcp 65001 >nul
cd /d "%~dp0.."

echo === my-todo-app 更新 ===
echo.

echo 最新のコードを取得中...
git pull
echo.

echo 依存関係を更新中...
call npm install --legacy-peer-deps
echo.

echo === 更新完了 ===
echo.
pause
