# CLAUDE.md - プロジェクトガイドライン

このファイルは Claude Code がこのリポジトリで作業する際のガイドラインです。

## 基本原則

### 設計と実装の連動

1. **README.md は常に最新の設計書として維持する**
   - 新機能を実装したら、README.md の「できること」セクションを更新
   - 技術スタックを変更したら、README.md に反映
   - 拡張案を実装したら「今後の拡張案」から「できること」へ移動

2. **実装前に設計を確認**
   - 機能追加の依頼を受けたら、まず README.md の設計内容を確認
   - 設計と矛盾する実装は避ける
   - 必要なら設計変更を提案してから実装

3. **コードコメントより README を優先**
   - アーキテクチャや機能概要は README.md に記載
   - コード内コメントは実装詳細のみに留める

## プロジェクト構造

```
my-todo-app/
├── app/                    # 画面コンポーネント (expo-router)
│   ├── _layout.tsx         # ルートレイアウト
│   └── index.tsx           # メイン ToDo 画面
├── src/
│   └── storage/
│       └── todoStorage.ts  # AsyncStorage 永続化
├── assets/                 # 画像アセット
├── package.json            # 依存関係
└── README.md               # 設計書（常に最新に保つ）
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
- [ ] README.md の「できること」を更新したか
- [ ] 技術スタック変更があれば README.md を更新したか
- [ ] TypeScript エラーがないか (`npx tsc --noEmit`)
- [ ] アプリが起動するか (`npx expo start`)
