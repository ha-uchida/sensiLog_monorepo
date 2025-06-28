# Firebase Hosting Setup Guide

Firebase Hostingにデプロイするために必要な設定手順です。

## 1. Firebaseプロジェクトの作成

1. [Firebase Console](https://console.firebase.google.com/)にアクセス
2. 「プロジェクトを作成」をクリック
3. プロジェクト名を`sensilog-app`に設定
4. Google Analyticsの設定（オプション）
5. プロジェクトの作成を完了

## 2. Firebase Hostingの有効化

1. Firebaseコンソールで作成したプロジェクトを選択
2. 左メニューから「Hosting」を選択
3. 「始める」をクリック
4. セットアップ手順に従う（CLIのインストールは不要）

## 3. サービスアカウントの作成

1. Firebaseコンソールで「プロジェクトの設定」→「サービスアカウント」タブを開く
2. 「新しい秘密鍵の生成」をクリック
3. JSONファイルがダウンロードされる
4. このJSONファイルの内容をGitHub Secretsに追加する

## 4. GitHub Secretsの設定

GitHubリポジトリで以下の手順を実行：

1. Settings → Secrets and variables → Actions
2. 「New repository secret」をクリック
3. 以下のシークレットを追加：

### FIREBASE_SERVICE_ACCOUNT
- Name: `FIREBASE_SERVICE_ACCOUNT`
- Value: ダウンロードしたJSONファイルの内容全体をコピー＆ペースト

### その他のシークレット（オプション）
- `NEXT_PUBLIC_API_URL`: APIのURL（例：https://api.sensilog.com）
- `NEXT_PUBLIC_GA_ID`: Google AnalyticsのID
- `NEXT_PUBLIC_ADSENSE_CLIENT_ID`: Google AdSenseのクライアントID

## 5. ローカルでのFirebase初期化（オプション）

ローカルでFirebaseを使用する場合：

```bash
# Firebase CLIのインストール
npm install -g firebase-tools

# ログイン
firebase login

# プロジェクトの初期化
firebase init hosting

# 以下の設定を選択：
# - Use an existing project → sensilog-app
# - Public directory → apps/web/out
# - Configure as single-page app → Yes
# - Set up automatic builds → No
```

## 6. デプロイのテスト

1. GitHubにプッシュ
2. Actionsタブでワークフローの実行を確認
3. 成功したら、Firebaseコンソールでデプロイされたサイトを確認

## トラブルシューティング

### "Failed to get Firebase project" エラー
- Firebaseプロジェクトが正しく作成されているか確認
- プロジェクトIDが`sensilog-app`と一致しているか確認
- サービスアカウントのJSONが正しくGitHub Secretsに設定されているか確認

### 権限エラー
- サービスアカウントに以下の権限があるか確認：
  - Firebase Hosting Admin
  - Firebase Authentication Admin（認証を使用する場合）
  - Cloud Build Service Account（自動ビルドを使用する場合）

### デプロイされたサイトが表示されない
- Firebaseコンソールでホスティングドメインを確認
- ビルド出力が`apps/web/out`に正しく生成されているか確認
- `firebase.json`の設定が正しいか確認