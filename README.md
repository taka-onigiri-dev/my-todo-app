# my-todo-app

Windows でも開発できる **React Native (Expo) + TypeScript** の ToDo アプリです。

## 概要

シンプルな ToDo 管理アプリ。タスクの追加・完了・削除ができ、データはローカルに永続化されます。

## できること（機能一覧）

- **タスク追加**: テキスト入力して「追加」ボタンまたは Enter で登録
- **完了切り替え**: チェックボックスをタップで完了/未完了を切り替え（取り消し線表示）
- **タスク削除**: × ボタンで削除
- **タスク編集**: タスクをタップしてテキストやカテゴリを変更
- **カテゴリ管理**: カテゴリを自由に追加・削除、色も選択可能
- **カテゴリフィルタ**: 「すべて」「未分類」または特定のカテゴリでタスクを絞り込み
- **上下ボタン並べ替え**: ↑↓ボタンでタスクの順序を変更
- **データ永続化**: アプリを閉じてもタスクとカテゴリが保持される（AsyncStorage）

## 技術スタック

| 項目 | 技術 | バージョン |
|------|------|-----------|
| フレームワーク | React Native (Expo) | SDK 54 |
| 言語 | TypeScript | ~5.7.0 |
| ルーティング | expo-router | ~4.0.22 |
| 永続化 | AsyncStorage | 2.1.2 |
| ジェスチャー | react-native-gesture-handler | ~2.20.0 |
| アニメーション | react-native-reanimated | ~3.16.0 |
| React | react | 18.3.1 |
| React Native | react-native | 0.77.1 |

## データ構造

### Todo 型

```typescript
interface Todo {
  id: string;              // ユニークID（タイムスタンプ + ランダム文字列）
  text: string;            // タスクのテキスト
  completed: boolean;      // 完了フラグ
  createdAt: number;       // 作成日時（Unix timestamp）
  categoryId: string | null; // カテゴリID（未分類の場合は null）
  order: number;           // 並べ替え用の順序
}
```

### Category 型

```typescript
interface Category {
  id: string;        // ユニークID（タイムスタンプ + ランダム文字列）
  name: string;      // カテゴリ名
  color: string;     // 表示色（HEX形式）
  createdAt: number; // 作成日時（Unix timestamp）
}
```

### ストレージ

- **タスク**
  - キー: `@my_todo_app:todos`
  - 形式: JSON 配列 (`Todo[]`)
- **カテゴリ**
  - キー: `@my_todo_app:categories`
  - 形式: JSON 配列 (`Category[]`)
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
├── scripts/                # スクリプト
│   ├── setup.bat           # Windows セットアップ
│   ├── setup.sh            # Mac/Linux セットアップ
│   ├── start.bat           # Windows 起動（自動更新 + Expo Go）
│   ├── start-expo-go.bat   # Windows 起動（--tunnel 対応）
│   └── start-web.bat       # Windows 起動（自動更新 + Web）
├── assets/                 # アイコン・スプラッシュ画像
├── CLAUDE.md               # Claude 用ガイドライン
├── README.md               # この設計書
├── package.json            # 依存関係
├── tsconfig.json           # TypeScript 設定
├── babel.config.js         # Babel 設定
└── app.json                # Expo 設定
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
┌─────────────────────────────────────┐
│  ToDo リスト              (ヘッダー) │
├─────────────────────────────────────┤
│ [すべて][未分類][仕事][買い物][+管理] │  ← カテゴリフィルタ
├─────────────────────────────────────┤
│ ┌─────────────────────────┐ ┌────┐ │
│ │ 新しいタスクを入力...    │ │追加│ │  ← 入力エリア
│ └─────────────────────────┘ └────┘ │
│ [未分類][仕事][買い物]              │  ← カテゴリ選択
├─────────────────────────────────────┤
│ ┌─────────────────────────────────┐ │
│ │ ☐ [仕事] タスク1    [↑][↓][×] │ │  ← ↑↓で並べ替え
│ └─────────────────────────────────┘ │     タップで編集
│ ┌─────────────────────────────────┐ │
│ │ ☑ [買い物] タスク2  [↑][↓][×] │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘

【編集モーダル】
┌─────────────────────────────────────┐
│        タスクを編集                  │
│ ┌─────────────────────────────────┐ │
│ │ タスク内容                       │ │
│ └─────────────────────────────────┘ │
│ カテゴリ: [未分類][仕事][買い物]     │
│            [キャンセル] [保存]      │
└─────────────────────────────────────┘

【カテゴリ管理モーダル】
┌─────────────────────────────────────┐
│        カテゴリ管理                  │
│ ┌──────────────┐ [●] [追加]        │  ← 色ボタンで色変更
│ │ 新しいカテゴリ│                   │
│ └──────────────┘                   │
│ ● 仕事               [削除]        │
│ ● 買い物             [削除]        │
│           [閉じる]                  │
└─────────────────────────────────────┘
```

### 操作フロー

1. **タスク追加**
   - カテゴリを選択（任意）
   - 入力欄にテキスト入力 → 「追加」ボタン or Enter
   - 新しいタスクがリスト末尾に追加
   - 入力欄がクリア

2. **完了切り替え**
   - チェックボックスをタップ
   - completed が反転、テキストに取り消し線

3. **削除**
   - × ボタンをタップ
   - 確認なしで即削除

4. **編集**
   - タスクのテキスト部分をタップ
   - 編集モーダルでテキストとカテゴリを変更
   - 「保存」で反映

5. **並べ替え**
   - タスク右側の ↑ ボタンで上に移動
   - ↓ ボタンで下に移動
   - 順序が自動保存

6. **カテゴリフィルタ**
   - 上部のチップをタップ
   - 「すべて」「未分類」または特定カテゴリで絞り込み

7. **カテゴリ管理**
   - 「+ 管理」ボタンをタップ
   - カテゴリ名を入力、色ボタンで色を選択、「追加」
   - 既存カテゴリは「削除」で削除（タスクは未分類に）

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

### npm スクリプト

| コマンド | 説明 |
|---------|------|
| `npm start` | Expo Go で起動 |
| `npm run web` | Web ブラウザで起動 |
| `npm run tunnel` | トンネルモードで起動（別ネットワーク対応） |
| `npm run typecheck` | TypeScript 型チェック |
| `npm run clean` | キャッシュをクリアして起動 |
| `npm run reinstall` | node_modules を削除して再インストール |

### Windows ワンクリック起動

- `scripts/setup.bat` → 初回セットアップ
- `scripts/start.bat` → 自動更新して Expo Go 起動
- `scripts/start-web.bat` → 自動更新して Web 起動

### Expo Go で確認

1. PC と iPhone を同じ Wi-Fi に接続
2. `npm start` または `scripts/start.bat` で QR コード表示
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

- [ ] 完了/未完了フィルタ
- [ ] 期限（デッドライン）機能
- [ ] リマインダー通知
- [ ] EAS Build で配布ビルド
- [ ] クラウド同期
