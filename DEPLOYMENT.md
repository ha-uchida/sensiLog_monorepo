# SensiLog デプロイメントガイド

## 超低コスト構成（月額0-500円）

### 必要なアカウント
- [GitHub](https://github.com) (無料)
- [Vercel](https://vercel.com) (無料プラン)
- [Railway](https://railway.app) (無料枠$5/月)
- [Neon](https://neon.tech) (無料プラン)
- [Cloudflare](https://cloudflare.com) (無料プラン、オプション)

## 1. データベースセットアップ (Neon)

### 1.1 Neonアカウント作成
1. [Neon](https://neon.tech)にアクセス
2. GitHubアカウントでサインアップ
3. 新しいプロジェクトを作成

### 1.2 データベース作成
```bash
# プロジェクト名: sensilog
# リージョン: Asia Pacific (東京)
# PostgreSQLバージョン: 15
```

### 1.3 接続文字列取得
```
postgresql://username:password@ep-xxxx.ap-southeast-1.aws.neon.tech/sensilog?sslmode=require
```

## 2. バックエンドデプロイ (Railway)

### 2.1 Railwayプロジェクト作成
1. [Railway](https://railway.app)にアクセス
2. GitHubでサインイン
3. "New Project" → "Deploy from GitHub repo"
4. `sensilog-monorepo`リポジトリを選択

### 2.2 環境変数設定
```bash
# Railway Dashboard → Variables
DATABASE_URL=postgresql://username:password@ep-xxxx.ap-southeast-1.aws.neon.tech/sensilog?sslmode=require
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters
RIOT_CLIENT_ID=your-riot-client-id
RIOT_CLIENT_SECRET=your-riot-client-secret
NODE_ENV=production
PORT=3001
CORS_ORIGINS=https://sensilog.vercel.app
```

### 2.3 デプロイ設定
```json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "cd apps/api && pnpm start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

## 3. フロントエンドデプロイ (Vercel)

### 3.1 Vercelプロジェクト作成
1. [Vercel](https://vercel.com)にアクセス
2. GitHubでサインイン
3. "Add New" → "Project"
4. `sensilog-monorepo`リポジトリをインポート

### 3.2 ビルド設定
```bash
# Framework Preset: Next.js
# Root Directory: apps/web
# Build Command: cd ../.. && pnpm generate:api && cd apps/web && pnpm build
# Output Directory: .next
# Install Command: cd ../.. && pnpm install
```

### 3.3 環境変数設定
```bash
# Vercel Dashboard → Settings → Environment Variables
NEXT_PUBLIC_API_URL=https://your-railway-app.railway.app
NEXT_PUBLIC_ADSENSE_CLIENT_ID=ca-pub-xxxxxxxxxxxxxxxxx
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

## 4. ドメイン設定

### 4.1 カスタムドメイン (オプション)
```bash
# Vercel
sensilog.com → Vercel App

# Railway  
api.sensilog.com → Railway Service
```

### 4.2 Cloudflare設定 (オプション)
```bash
# DNS Records
A     sensilog.com         → Vercel IP
CNAME api.sensilog.com     → railway.app
CNAME www.sensilog.com     → sensilog.com
```

## 5. 環境別設定

### 5.1 開発環境
```bash
# .env.local (ローカル開発)
DATABASE_URL=postgresql://localhost:5432/sensilog_dev
JWT_SECRET=development-jwt-secret-minimum-32-characters
RIOT_CLIENT_ID=your-dev-riot-client-id
RIOT_CLIENT_SECRET=your-dev-riot-client-secret
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 5.2 ステージング環境
```bash
# Railway (staging service)
DATABASE_URL=postgresql://staging-connection-string
JWT_SECRET=staging-jwt-secret
NODE_ENV=staging

# Vercel (preview deployments)
NEXT_PUBLIC_API_URL=https://your-staging-railway.railway.app
```

### 5.3 本番環境
```bash
# Railway (production service)
DATABASE_URL=postgresql://production-connection-string
JWT_SECRET=production-jwt-secret-super-secure
NODE_ENV=production

# Vercel (production)
NEXT_PUBLIC_API_URL=https://api.sensilog.com
NEXT_PUBLIC_ADSENSE_CLIENT_ID=ca-pub-production-id
NEXT_PUBLIC_GA_ID=G-PRODUCTION-ID
```

## 6. CI/CD設定

### 6.1 GitHub Actions
既に設定済み:
- `.github/workflows/ci.yml` - テスト・ビルドチェック
- `.github/workflows/deploy.yml` - 自動デプロイ

### 6.2 必要なシークレット
```bash
# GitHub Repository Settings → Secrets
RAILWAY_TOKEN=your-railway-token
RAILWAY_PROJECT_ID=your-project-id
VERCEL_TOKEN=your-vercel-token
VERCEL_ORG_ID=your-org-id
VERCEL_PROJECT_ID=your-project-id
NEXT_PUBLIC_API_URL=https://api.sensilog.com
NEXT_PUBLIC_ADSENSE_CLIENT_ID=ca-pub-xxxxxxxxx
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

## 7. 監視・ログ

### 7.1 Railway監視
- メトリクス: CPU、メモリ、ネットワーク
- ログ: アプリケーションログ
- アラート: エラー率・レスポンス時間

### 7.2 Vercel監視
- Analytics: ページビュー、パフォーマンス
- Functions: API使用量、エラー率
- Speed Insights: Core Web Vitals

### 7.3 外部監視 (オプション)
```bash
# Uptime Robot (無料)
HTTP監視: https://sensilog.com
HTTP監視: https://api.sensilog.com/health

# Sentry (エラー追跡)
DSN設定: NEXT_PUBLIC_SENTRY_DSN
```

## 8. スケーリング戦略

### 8.1 トラフィック増加時
```bash
# Railway (Pro Plan: $20/月)
- より多いリソース
- 専用インスタンス
- 自動スケーリング

# Vercel (Pro Plan: $20/月)
- 商用利用ライセンス
- より多い帯域幅
- 高度な分析機能
```

### 8.2 データベース拡張
```bash
# Neon (Scale Plan: $19/月)
- 10GB ストレージ
- 自動バックアップ
- ポイントインタイム復旧
```

## 9. セキュリティ

### 9.1 環境変数の管理
- 機密情報はすべて環境変数で管理
- `.env.example`ファイルで設定例を提供
- 本番用シークレットは定期的に更新

### 9.2 HTTPS設定
- Vercel: 自動HTTPS
- Railway: 自動HTTPS
- カスタムドメイン: SSL証明書自動更新

### 9.3 CORS設定
```typescript
// apps/api/src/app.ts
origin: [
  'https://sensilog.com',
  'https://www.sensilog.com',
  'https://sensilog.vercel.app'
]
```

## 10. 運用チェックリスト

### 10.1 デプロイ前
- [ ] 環境変数設定確認
- [ ] データベースマイグレーション実行
- [ ] API健全性テスト
- [ ] フロントエンドビルド確認

### 10.2 デプロイ後
- [ ] ヘルスチェックAPI確認
- [ ] フロントエンド表示確認
- [ ] 認証フロー動作確認
- [ ] データベース接続確認
- [ ] ログ出力確認

### 10.3 定期メンテナンス
- [ ] 依存関係更新 (月1回)
- [ ] セキュリティアップデート
- [ ] データベースバックアップ確認
- [ ] パフォーマンス監視
- [ ] エラーログ確認

## コスト見積もり

### 無料枠利用時 (月額 0円)
- Vercel Hobby: $0
- Railway: $5クレジット/月
- Neon: $0 (3GB制限)
- Cloudflare: $0

### 拡張時 (月額 約$60)
- Vercel Pro: $20
- Railway Pro: $20  
- Neon Scale: $19
- 監視ツール: 〜$10

この構成により、段階的にスケールしながら安定したサービス運用が可能です。