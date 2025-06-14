FROM node:20-alpine AS base

# pnpmをインストール
RUN npm install -g pnpm

WORKDIR /app

# 依存関係のコピーとインストール
COPY package.json pnpm-lock.yaml ./
COPY pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/
COPY packages/db/package.json ./packages/db/

# 依存関係をインストール
RUN pnpm install --force

# ソースコードをコピー
COPY . .

# 開発用ステージ
FROM base AS development
EXPOSE 3001
CMD ["pnpm", "--filter", "@sensilog/api", "dev"]

# ビルド用ステージ
FROM base AS builder
RUN pnpm --filter "@sensilog/api" build

# 本番用ステージ
FROM node:20-alpine AS production

RUN npm install -g pnpm

WORKDIR /app

# 本番用依存関係のみインストール
COPY package.json pnpm-lock.yaml ./
COPY pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/
COPY packages/db/package.json ./packages/db/

RUN pnpm install --force

# ビルド成果物をコピー
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/packages/db ./packages/db

# 非rootユーザーを作成
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

USER nextjs

EXPOSE 3001

CMD ["node", "apps/api/dist/server.js"]