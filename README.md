# SensiLog - VALORANTプレイヤー向け感度管理システム

VALORANTプレイヤーの感度・デバイス設定とパフォーマンスデータを管理・分析するWebアプリケーション

## 🎯 主要機能

- **Riot OAuth認証**: Riot Gamesアカウントでのログイン
- **設定記録管理**: 感度・DPI・デバイス情報の記録
- **試合データ自動取得**: Riot API経由での試合結果取得
- **パフォーマンス分析**: グラフ表示・フィルター・期間比較
- **チーム管理**: 管理者による代理入力機能

## 🏗️ 技術スタック

### フロントエンド
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **State Management**: Zustand
- **API Client**: React Query + Orval生成

### バックエンド
- **Runtime**: Node.js 20 LTS
- **Framework**: Fastify + TypeScript
- **API Documentation**: OpenAPI 3.0
- **Authentication**: JWT + Riot OAuth
- **Validation**: Zod

### データベース
- **ORM**: Drizzle ORM
- **Database**: PostgreSQL (Neon)
- **Migrations**: Drizzle Kit

### インフラ
- **Frontend**: Vercel
- **Backend**: Railway
- **Database**: Neon PostgreSQL
- **Storage**: Cloudflare R2
- **Monitoring**: Sentry

## 📁 プロジェクト構造

```
sensiLog_monorepo/
├── apps/
│   ├── web/                 # Next.js フロントエンド
│   └── api/                 # Fastify バックエンド
├── packages/
│   ├── db/                  # Drizzle スキーマ
│   ├── api-client/          # Orval生成クライアント
│   └── ui/                  # 共有UIコンポーネント
├── api-spec/
│   └── openapi.yaml         # OpenAPI仕様書
└── scripts/
    └── generate-api.sh      # API生成スクリプト
```

## 🚀 開発環境セットアップ

### 前提条件
- Node.js 20+
- pnpm 8+
- Git

### 1. プロジェクトクローン
```bash
git clone <repository-url>
cd sensiLog_monorepo
```

### 2. 依存関係インストール
```bash
pnpm install
```

### 3. 環境変数設定
```bash
cp .env.example .env
# .envファイルを編集
```

### 4. データベースセットアップ
```bash
pnpm db:push
```

### 5. API Client生成
```bash
pnpm generate:api
```

### 6. 開発サーバー起動
```bash
pnpm dev
```

## 📝 利用可能スクリプト

- `pnpm dev` - 開発サーバー起動
- `pnpm build` - 全体ビルド
- `pnpm build:web` - フロントエンドビルド
- `pnpm build:api` - バックエンドビルド
- `pnpm generate:api` - API Client生成
- `pnpm db:push` - データベース更新
- `pnpm db:studio` - Drizzle Studio起動
- `pnpm lint` - Lint実行
- `pnpm type-check` - 型チェック

## 🔧 API開発フロー

1. `api-spec/openapi.yaml`でAPI仕様定義
2. バックエンドで実装
3. `pnpm generate:api`でクライアント生成
4. フロントエンドで型安全にAPI使用

## 📚 ドキュメント

- [API仕様書](http://localhost:3001/docs) - Swagger UI
- [データベーススキーマ](http://localhost:4983) - Drizzle Studio

## 💰 コスト構成

- **Vercel**: 無料プラン
- **Railway**: 無料枠（月$5まで）
- **Neon**: 無料プラン（3GB）
- **Cloudflare R2**: 無料枠（10GB）

**月額コスト**: 0-500円（無料枠活用）

## 🎮 Riot API連携

1. [Riot Developer Portal](https://developer.riotgames.com/)でAPI Key取得
2. Production Key申請（本番運用時）
3. RSO Client申請（OAuth認証用）

## 📈 収益化

- Google AdSense統合
- レスポンシブ広告配置
- GA4連携によるアクセス解析

## 🚢 デプロイ

### 開発環境
```bash
pnpm dev
```

### 本番環境
- Frontend: Vercel自動デプロイ
- Backend: Railway自動デプロイ
- Database: Neon PostgreSQL

## 🤝 コントリビューション

1. Issue作成
2. Feature Branchで開発
3. Pull Request作成
4. レビュー・マージ

## 📄 ライセンス

MIT License

## 📞 サポート

- [GitHub Issues](https://github.com/username/sensilog/issues)
- Discord: SensiLogコミュニティ