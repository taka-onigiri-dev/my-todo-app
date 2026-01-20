# CLAUDE.md - プロジェクトガイドライン

このファイルは Claude Code がこのリポジトリで作業する際のガイドラインです。

## 最重要原則: 再構築可能なドキュメント

**コードは消えても、ドキュメントから完全に再構築できる状態を維持する。**

### なぜ重要か

- コードベースが壊れても、設計書があれば復旧可能
- 新しい環境でもゼロから構築できる
- Claude が読めば同じものを再実装できる

### ドキュメント作成ルール

1. **README.md は「実装仕様書」として書く**
   - 「何ができるか」だけでなく「どう実装されているか」を記載
   - データ構造、状態管理、永続化の仕組みを明記
   - 外部から見えない内部仕様も書く

2. **docs/ フォルダに詳細設計を置く**（必要に応じて）
   - `docs/architecture.md` - 全体構成
   - `docs/data-model.md` - データ構造定義
   - `docs/screens.md` - 画面仕様

3. **再構築に必要な情報を必ず含める**
   - 使用ライブラリとバージョン（package.json の主要部分を README にも記載）
   - ファイル構成と各ファイルの責務
   - データの型定義（TypeScript interface）
   - 画面のワイヤーフレーム（テキストベースでOK）

---

## 設計と実装の連動

1. **README.md は常に最新の設計書として維持する**
   - 新機能を実装したら、README.md の「できること」セクションを更新
   - 技術スタックを変更したら、README.md に反映
   - 拡張案を実装したら「今後の拡張案」から「できること」へ移動

2. **実装前に設計を確認**
   - 機能追加の依頼を受けたら、まず README.md の設計内容を確認
   - 設計と矛盾する実装は避ける
   - 必要なら設計変更を提案してから実装

3. **実装後は必ずドキュメント更新**
   - コードを書いたら、対応するドキュメントも同時に更新
   - 「後で書く」は禁止

---

## README.md の必須セクション

README.md には以下を必ず含める:

```markdown
# アプリ名

## 概要
（1-2文でアプリの目的）

## できること（機能一覧）
- 機能1: 詳細説明
- 機能2: 詳細説明

## 技術スタック
- フレームワーク: xxx (バージョン)
- 言語: xxx
- 主要ライブラリ: xxx

## データ構造
（主要な型定義を記載）

## ファイル構成
（ディレクトリツリーと各ファイルの説明）

## 画面仕様
（各画面の要素とユーザー操作）

## セットアップ手順
（ゼロから動かすまでの手順）

## 今後の拡張案
（未実装の機能案）
```

---

## プロジェクト構造

```
my-todo-app/
├── app/                    # 画面コンポーネント (expo-router)
│   ├── _layout.tsx         # ルートレイアウト
│   └── index.tsx           # メイン ToDo 画面
├── src/
│   └── storage/
│       └── todoStorage.ts  # AsyncStorage 永続化
├── scripts/                # 起動スクリプト（Windows用 .bat など）
├── assets/                 # 画像アセット
├── CLAUDE.md               # このファイル（Claude用ガイドライン）
├── README.md               # 設計書兼実装仕様書
└── package.json            # 依存関係
```

## 技術スタック

- **フレームワーク**: React Native (Expo SDK 54)
- **言語**: TypeScript
- **ルーティング**: expo-router
- **永続化**: AsyncStorage
- **対象プラットフォーム**: iOS (Expo Go), Android, Web

## コーディング規約

- TypeScript strict モードを使用
- 関数コンポーネント + Hooks を使用
- スタイルは StyleSheet.create で定義
- 日本語コメント可（ユーザーが日本語話者のため）

## コミットメッセージ

日本語で記述。プレフィックス例:
- `feat:` 新機能
- `fix:` バグ修正
- `chore:` 設定変更、依存関係更新
- `docs:` ドキュメント更新
- `refactor:` リファクタリング

## 変更時のチェックリスト

機能を追加・変更したら:
- [ ] README.md を更新したか（機能、データ構造、画面仕様）
- [ ] 新しいファイルがあれば構成図に追加したか
- [ ] 型定義を変更したらドキュメントにも反映したか
- [ ] TypeScript エラーがないか (`npx tsc --noEmit`)
- [ ] アプリが起動するか (`npx expo start`)

## 再構築テスト

定期的に以下を確認:
- README.md だけ読んで、同じアプリを作れるか？
- 必要な情報が欠けていないか？
- 曖昧な記述がないか？

---

## 過去の失敗・教訓（2026-01 初回構築時）

### 1. Windows バッチファイルが動かない

**症状**: `start.bat` をダブルクリックしても何も起きない

**原因**:
- Linux 環境で作成したため改行コードが LF（Unix）になっていた
- `pause` がないのでエラーが見えずにウィンドウが閉じた

**解決策**:
- 改行コードを CRLF（Windows）に変換: `sed -i 's/$/\r/' *.bat`
- 末尾に `pause` を追加してエラーを確認できるようにする

**教訓**: Windows 用 .bat は必ず CRLF + pause 付きで作成

---

### 2. `expo-asset` が見つからないエラー

**症状**:
```
Error: The required package `expo-asset` cannot be found
```

**原因**: Expo の必須パッケージを package.json に含めていなかった

**解決策**: 以下のパッケージを追加
- `expo-asset`
- `expo-constants`
- `expo-font`
- `expo-linking`
- etc.

**教訓**: Expo プロジェクトは `npx create-expo-app` で作るか、必要な依存関係を確認してから手動構築

---

### 3. Expo Go のバージョン不一致

**症状**:
```
Project is incompatible with this version of Expo Go
The installed version of Expo Go is for SDK 54.0.0
The project you opened uses SDK 52
```

**原因**: 最初に SDK 52 で作成したが、ユーザーの Expo Go アプリは SDK 54 だった

**解決策**: package.json を SDK 54 対応バージョンに更新
- `expo: ~54.0.0`
- 各パッケージも SDK 54 互換バージョンに

**教訓**:
- Expo Go は最新 SDK のみサポート
- プロジェクト開始時に Expo Go のバージョンを確認する
- または最初から最新 SDK を使う

---

### 4. npm install で peer dependency エラー

**症状**:
```
npm error ERESOLVE unable to resolve dependency tree
```

**原因**: パッケージ間の peer dependency 競合

**解決策**: `npm install --legacy-peer-deps` を使用

**教訓**: Expo プロジェクトでは `--legacy-peer-deps` が必要になることが多い

---

### 5. TypeScript コンパイルエラー

**症状**:
```
error TS6046: Argument for '--module' option must be: ...
```

**原因**: TypeScript バージョンが古く、Expo の tsconfig.base が要求する機能に対応していなかった

**解決策**: TypeScript を ~5.7.0 にアップグレード

**教訓**: Expo SDK アップグレード時は TypeScript バージョンも確認
