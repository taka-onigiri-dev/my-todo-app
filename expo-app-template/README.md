# アプリ名

## 概要

（アプリの説明を書く）

## できること（機能一覧）

- **機能1**: 説明
- **機能2**: 説明

## 技術スタック

| 項目 | 技術 | バージョン |
|------|------|-----------|
| フレームワーク | React Native (Expo) | SDK 54 |
| 言語 | TypeScript | ~5.7.0 |
| ルーティング | expo-router | ~4.0.22 |
| 永続化 | AsyncStorage | 2.1.2 |

## データ構造

```typescript
// 主要な型定義を記載
interface Example {
  id: string;
  name: string;
}
```

## ファイル構成

```
my-app/
├── app/
│   ├── _layout.tsx         # ルートレイアウト
│   └── index.tsx           # メイン画面
├── src/
│   └── ...                 # ロジック・ユーティリティ
├── scripts/
│   └── start.bat           # Windows 起動スクリプト
├── assets/                 # 画像アセット
├── CLAUDE.md               # Claude 用ガイドライン
├── README.md               # この設計書
└── package.json            # 依存関係
```

## 画面仕様

```
┌─────────────────────────────────────┐
│  画面名                   (ヘッダー) │
├─────────────────────────────────────┤
│                                     │
│  （画面の内容を記載）                │
│                                     │
└─────────────────────────────────────┘
```

## セットアップ手順

```bash
# 1. リポジトリをクローン
git clone <repository-url>
cd my-app

# 2. 依存関係をインストール
npm install --legacy-peer-deps

# 3. 開発サーバー起動
npx expo start
```

### Windows ワンクリック起動

`scripts/start.bat` をダブルクリック

### Expo Go で確認

1. PC と iPhone を同じ Wi-Fi に接続
2. `npx expo start` で QR コード表示
3. iPhone カメラで QR を読み取り

## 今後の拡張案

- [ ] 機能A
- [ ] 機能B
