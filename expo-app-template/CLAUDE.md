# CLAUDE.md - Expo プロジェクト ガイドライン

このファイルは Claude Code がこのリポジトリで作業する際のガイドラインです。

---

## 最重要原則: 再構築可能なドキュメント

**コードは消えても、ドキュメントから完全に再構築できる状態を維持する。**

### ドキュメント作成ルール

1. **README.md は「実装仕様書」として書く**
   - 「何ができるか」だけでなく「どう実装されているか」を記載
   - データ構造、状態管理、永続化の仕組みを明記

2. **実装前に設計を確認、実装後は必ずドキュメント更新**
   - 機能追加の依頼を受けたら、まず README.md の設計内容を確認
   - コードを書いたら、対応するドキュメントも同時に更新
   - 「後で書く」は禁止

---

## 技術スタック

- **フレームワーク**: React Native (Expo SDK 54)
- **言語**: TypeScript
- **ルーティング**: expo-router
- **永続化**: AsyncStorage
- **対象**: iOS (Expo Go), Android, Web

---

## コーディング規約

- TypeScript strict モード
- 関数コンポーネント + Hooks
- スタイルは StyleSheet.create で定義
- 日本語コメント可

## コミットメッセージ

日本語で記述。プレフィックス:
- `feat:` 新機能
- `fix:` バグ修正
- `chore:` 設定変更
- `docs:` ドキュメント更新
- `refactor:` リファクタリング

---

## 過去の失敗・教訓（重要）

### 1. Expo Go のバージョン不一致

**症状**: `Project is incompatible with this version of Expo Go`

**原因**: プロジェクトの SDK バージョンと Expo Go アプリのバージョンが不一致

**解決策**:
- Expo Go は最新 SDK のみサポート
- 必ず最新の Expo SDK を使う（現在 SDK 54）
- `expo: ~54.0.0` を使用

**教訓**: プロジェクト開始時は必ず最新 SDK で作成

---

### 2. npm install で peer dependency エラー

**症状**: `npm error ERESOLVE unable to resolve dependency tree`

**解決策**: `npm install --legacy-peer-deps` を使用

**教訓**: Expo プロジェクトでは `--legacy-peer-deps` が必要になることが多い

---

### 3. Windows バッチファイルが動かない

**症状**: `.bat` をダブルクリックしても何も起きない

**原因**:
- Linux 環境で作成すると改行コードが LF になる
- `pause` がないとエラーが見えずにウィンドウが閉じる

**解決策**:
- 改行コードを CRLF に変換: `sed -i 's/$/\r/' *.bat`
- 末尾に `pause` を追加
- scripts フォルダに置く場合は `cd /d "%~dp0.."` でプロジェクトルートに移動

**教訓**: Windows 用 .bat は必ず CRLF + pause 付きで作成

---

### 4. react-native-reanimated のバージョン問題

**症状**: `Cannot find module 'react-native-worklets/plugin'`

**原因**: reanimated v4 は worklets-core が必要だが Expo Go と非互換

**解決策**: Expo SDK 54 には `react-native-reanimated@~3.16.0` を使用

**教訓**: ライブラリは Expo SDK に対応したバージョンを確認してから導入

---

### 5. Expo Go で動かないライブラリ

**症状**: アプリがクラッシュ、`Route missing default export`

**原因**: ネイティブモジュールが必要なライブラリは Expo Go で動かない

**動かないライブラリ例**:
- `react-native-draggable-flatlist`（ネイティブモジュール必要）
- その他ネイティブコードが必要なライブラリ

**解決策**:
- Expo Go 互換のライブラリを選ぶ
- または標準コンポーネントで代替実装（例: ドラッグ→上下ボタン）

**教訓**: ライブラリ導入前に「Expo Go compatible」か確認

---

### 6. Expo Go 起動時の警告（無視してOK）

**症状**:
```
[runtime not ready]: console.error: Could not access feature flag 'disableEventLoopOnBridgeless'
```

**原因**: React Native 0.77 + Expo SDK 54 の組み合わせで発生

**影響**: なし（アプリは正常動作）

**対応**: 無視して OK

---

## ライブラリ導入チェックリスト

新しいライブラリを入れる前に確認:

- [ ] Expo SDK 54 に対応しているか
- [ ] Expo Go で動作するか（ネイティブモジュール不要か）
- [ ] 最新の安定版か
- [ ] npm の weekly downloads が十分か（メンテされているか）

---

## README.md テンプレート

```markdown
# アプリ名

## 概要
（1-2文でアプリの目的）

## できること（機能一覧）
- 機能1: 詳細説明
- 機能2: 詳細説明

## 技術スタック
| 項目 | 技術 | バージョン |
|------|------|-----------|
| フレームワーク | React Native (Expo) | SDK 54 |
| 言語 | TypeScript | ~5.7.0 |

## データ構造
（主要な型定義）

## ファイル構成
（ディレクトリツリー）

## 画面仕様
（各画面のワイヤーフレーム）

## セットアップ手順
（ゼロから動かすまでの手順）

## 今後の拡張案
（未実装の機能案）
```

---

## 変更時のチェックリスト

機能を追加・変更したら:
- [ ] README.md を更新したか
- [ ] TypeScript エラーがないか (`npm run typecheck`)
- [ ] アプリが起動するか (`npx expo start`)
- [ ] Expo Go で動作確認したか
