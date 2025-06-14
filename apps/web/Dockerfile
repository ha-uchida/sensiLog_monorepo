FROM node:20-alpine AS base

# pnpmをインストール
RUN npm install -g pnpm

WORKDIR /app

# 依存関係のコピーとインストール
COPY package.json pnpm-lock.yaml ./
COPY pnpm-workspace.yaml ./
COPY apps/web/package.json ./apps/web/
COPY packages/api-client/package.json ./packages/api-client/

# 依存関係をインストール
RUN pnpm install --force

# ソースコードをコピー
COPY . .

# 開発用ステージ
FROM base AS development
EXPOSE 3000
CMD ["pnpm", "--filter", "@sensilog/web", "dev"]

# ビルド用ステージ
FROM base AS builder

# 環境変数（ビルド時）
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_ADSENSE_CLIENT_ID
ARG NEXT_PUBLIC_GA_ID

ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_ADSENSE_CLIENT_ID=$NEXT_PUBLIC_ADSENSE_CLIENT_ID
ENV NEXT_PUBLIC_GA_ID=$NEXT_PUBLIC_GA_ID

# API Clientを生成
RUN pnpm generate:api

# Next.jsアプリをビルド
RUN pnpm --filter "@sensilog/web" build

# 本番用ステージ
FROM node:20-alpine AS production

RUN npm install -g pnpm

WORKDIR /app

# 本番用依存関係のみインストール
COPY package.json pnpm-lock.yaml ./
COPY pnpm-workspace.yaml ./
COPY apps/web/package.json ./apps/web/

RUN pnpm install --force

# ビルド成果物をコピー
COPY --from=builder /app/apps/web/.next ./apps/web/.next
COPY --from=builder /app/apps/web/public ./apps/web/public
COPY --from=builder /app/apps/web/next.config.ts ./apps/web/
COPY --from=builder /app/apps/web/package.json ./apps/web/

# 非rootユーザーを作成
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# .nextディレクトリの所有者を変更
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next ./apps/web/.next

USER nextjs

EXPOSE 3000

CMD ["pnpm", "--filter", "@sensilog/web", "start"]