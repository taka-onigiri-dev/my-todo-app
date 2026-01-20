@echo off
chcp 65001 >nul
echo === my-todo-app セットアップ ===
echo.

REM Node.js バージョン確認
echo Node.js バージョン:
node -v
echo npm バージョン:
npm -v
echo.

REM 依存関係インストール
echo 依存関係をインストール中...
call npm install --legacy-peer-deps

echo.
echo === セットアップ完了 ===
echo.
echo 起動コマンド:
echo   npm start      - Expo Go で起動
echo   npm run web    - Web ブラウザで起動
echo   npm run tunnel - トンネルモードで起動（別ネットワーク対応）
echo.
pause
