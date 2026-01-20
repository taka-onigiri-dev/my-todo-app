# テンプレートの使い方

## 新規プロジェクト作成手順

### 1. このテンプレートをコピー

```bash
cp -r expo-app-template my-new-app
cd my-new-app
```

### 2. package.json を作成

```bash
mv package.json.template package.json
# "name" を自分のアプリ名に変更
```

### 3. app.json を編集

- `name`: アプリ表示名
- `slug`: URL用の名前（小文字、ハイフン可）
- `scheme`: ディープリンク用スキーム

### 4. assets フォルダを作成

```bash
mkdir assets
```

以下の画像を用意:
- `icon.png` (1024x1024) - アプリアイコン
- `splash-icon.png` (512x512) - スプラッシュ画面
- `adaptive-icon.png` (1024x1024) - Android用
- `favicon.png` (48x48) - Web用

※ 仮画像は https://placeholder.com などで作成可

### 5. app フォルダを作成

```bash
mkdir -p app
```

最低限必要なファイル:

**app/_layout.tsx**
```tsx
import { Stack } from 'expo-router';

export default function RootLayout() {
  return <Stack />;
}
```

**app/index.tsx**
```tsx
import { View, Text, StyleSheet } from 'react-native';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text>Hello World</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
```

### 6. 依存関係インストール

```bash
npm install --legacy-peer-deps
```

### 7. 起動

```bash
npx expo start
```

### 8. Git 初期化

```bash
git init
git add -A
git commit -m "feat: 初期セットアップ"
```

---

## ファイル説明

| ファイル | 説明 |
|---------|------|
| `CLAUDE.md` | Claude 用ガイドライン（過去の失敗・教訓含む） |
| `README.md` | 設計書テンプレート |
| `package.json.template` | 依存関係テンプレート（SDK 54対応済み） |
| `app.json` | Expo 設定 |
| `tsconfig.json` | TypeScript 設定 |
| `babel.config.js` | Babel 設定（reanimated対応済み） |
| `.gitignore` | Git 除外設定 |
| `scripts/start.bat` | Windows 起動スクリプト |

---

## 注意点

- `npm install` は必ず `--legacy-peer-deps` をつける
- ライブラリ追加前に Expo Go 互換か確認（CLAUDE.md 参照）
- Windows の .bat ファイルは CRLF 改行コードで保存
