#!/bin/bash
set -e

echo "🔄 Generating API client from NestJS Swagger..."

# NestJSが起動しているか確認
if ! curl -s http://localhost:3001/docs-json > /dev/null; then
  echo "❌ NestJS API is not running on http://localhost:3001"
  echo "Please start the API with 'pnpm dev --filter=api' first"
  exit 1
fi

# 既存の生成ファイルをクリーンアップ
echo "🧹 Cleaning up existing generated files..."
rm -rf ./apps/web/src/lib/api-client/generated/

# API client生成
echo "⚙️  Generating API client..."
pnpm orval

# 生成されたファイルのフォーマット
echo "💅 Formatting generated files..."
pnpm prettier --write "./apps/web/src/lib/api-client/generated/**/*.{ts,tsx}" || true

echo "✅ API client generated successfully"

# TypeScriptコンパイルチェック
echo "🔍 Running type checking..."
cd apps/web
pnpm tsc --noEmit

if [ $? -eq 0 ]; then
  echo "✅ Type checking passed"
else
  echo "❌ Type checking failed"
  exit 1
fi

cd ../..

# 生成されたファイルの統計表示
echo "📊 Generation statistics:"
echo "  - API functions: $(find ./apps/web/src/lib/api-client/generated -name "*.ts" -exec grep -l "export const use" {} \; | wc -l || echo "0")"
echo "  - Model files: $(find ./apps/web/src/lib/api-client/generated/models -name "*.ts" 2>/dev/null | wc -l || echo "0")"

echo "🎉 API client generation completed successfully!"
echo ""
echo "Next steps:"
echo "  1. Review generated files in apps/web/src/lib/api-client/generated/"
echo "  2. Update frontend components to use the new API client"
echo "  3. Test the API integration"