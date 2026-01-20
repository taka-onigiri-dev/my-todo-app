# my-todo-app

Windows でも開発できる **React Native (Expo) + TypeScript** の ToDo アプリです。

## 概要

シンプルな ToDo 管理アプリ。タスクの追加・完了・削除ができ、データはローカルに永続化されます。

## できること（機能一覧）

- **タスク追加**: テキスト入力して「追加」ボタンまたは Enter で登録
- **完了切り替え**: チェックボックスをタップで完了/未完了を切り替え（取り消し線表示）
- **タスク削除**: × ボタンで削除
- **データ永続化**: アプリを閉じてもタスクが保持される（AsyncStorage）

## 技術スタック

| 項目 | 技術 | バージョン |
|------|------|-----------|
| フレームワーク | React Native (Expo) | SDK 54 |
| 言語 | TypeScript | ~5.7.0 |
| ルーティング | expo-router | ~4.0.22 |
| 永続化 | AsyncStorage | 2.1.2 |
| React | react | 18.3.1 |
| React Native | react-native | 0.77.1 |

## データ構造

### Todo 型

```typescript
interface Todo {
  id: string;        // ユニークID（タイムスタンプ + ランダム文字列）
  text: string;      // タスクのテキスト
  completed: boolean; // 完了フラグ
  createdAt: number;  // 作成日時（Unix timestamp）
}
```

### ストレージ

- **キー**: `@my_todo_app:todos`
- **形式**: JSON 配列 (`Todo[]`)
- **保存先**: AsyncStorage（デバイスのローカルストレージ）

## ファイル構成

```
my-todo-app/
├── app/
│   ├── _layout.tsx         # ルートレイアウト（ヘッダースタイル設定）
│   └── index.tsx           # メイン ToDo 画面
├── src/
│   └── storage/
│       └── todoStorage.ts  # AsyncStorage 操作（load/save/create）
├── assets/                 # アイコン・スプラッシュ画像
├── CLAUDE.md               # Claude 用ガイドライン
├── README.md               # この設計書
├── package.json            # 依存関係
├── tsconfig.json           # TypeScript 設定
├── babel.config.js         # Babel 設定
├── app.json                # Expo 設定
├── start.bat               # Windows 起動（Expo Go）
├── start-expo-go.bat       # Windows 起動（Expo Go、--tunnel 対応）
└── start-web.bat           # Windows 起動（Web）
```

### 各ファイルの責務

| ファイル | 責務 |
|---------|------|
| `app/index.tsx` | UI表示、状態管理（useState）、ユーザー操作ハンドリング |
| `app/_layout.tsx` | 全画面共通のレイアウト、ヘッダースタイル |
| `src/storage/todoStorage.ts` | AsyncStorage への読み書き、Todo オブジェクト生成 |

## 画面仕様

### メイン画面（app/index.tsx）

```
┌─────────────────────────────────┐
│  ToDo リスト          (ヘッダー) │
├─────────────────────────────────┤
│ ┌─────────────────────┐ ┌────┐ │
│ │ 新しいタスクを入力...│ │追加│ │  ← 入力エリア
│ └─────────────────────┘ └────┘ │
├─────────────────────────────────┤
│ ┌─────────────────────────────┐ │
│ │ ☐  タスク1              [×] │ │  ← 未完了タスク
│ └─────────────────────────────┘ │
│ ┌─────────────────────────────┐ │
│ │ ☑  タスク2（取り消し線）[×] │ │  ← 完了タスク
│ └─────────────────────────────┘ │
│                                 │
│     タスクがありません           │  ← 空の場合
│     上の入力欄から追加してください │
└─────────────────────────────────┘
```

### 操作フロー

1. **タスク追加**
   - 入力欄にテキスト入力 → 「追加」ボタン or Enter
   - 新しいタスクがリスト先頭に追加
   - 入力欄がクリア

2. **完了切り替え**
   - チェックボックスをタップ
   - completed が反転、テキストに取り消し線

3. **削除**
   - × ボタンをタップ
   - 確認なしで即削除

## セットアップ手順

### 前提条件

- Node.js (LTS)
- iPhone に Expo Go アプリ（App Store からインストール）

### 手順

```bash
# 1. リポジトリをクローン
git clone <repository-url>
cd my-todo-app

# 2. 依存関係をインストール
npm install --legacy-peer-deps

# 3. 開発サーバー起動
npx expo start
```

### Windows ワンクリック起動

- `start.bat` ダブルクリック → Expo Go 用に起動
- `start-web.bat` ダブルクリック → Web ブラウザで起動

### Expo Go で確認

1. PC と iPhone を同じ Wi-Fi に接続
2. `start.bat` 実行で QR コード表示
3. iPhone カメラで QR を読み取り

## 既知の問題・注意点

### Expo Go 起動時の警告

```
[runtime not ready]: console.error: Could not access feature flag 'disableEventLoopOnBridgeless'
```

- **原因**: React Native 0.77 + Expo SDK 54 の組み合わせで発生する既知の警告
- **影響**: なし（アプリは正常に動作する）
- **対応**: 無視して OK（開発中のみ表示、本番には影響しない）

### npm install 時の警告

```
npm warn deprecated ...
```

- Expo の依存関係に含まれる古いパッケージによる警告
- 機能に影響なし

### `--legacy-peer-deps` が必要な理由

一部パッケージの peer dependency 競合があるため、インストール時に `--legacy-peer-deps` フラグが必要。

## 今後の拡張案

- [ ] タスク編集機能
- [ ] ドラッグ&ドロップ並べ替え
- [ ] カテゴリー管理
- [ ] フィルタ機能（未完了のみ、カテゴリ別）
- [ ] EAS Build で配布ビルド
