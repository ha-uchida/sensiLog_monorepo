#!/bin/bash
set -e

echo "🔄 Generating API client from OpenAPI spec..."

# OpenAPIスキーマのバリデーション（swagger-codegenがある場合）
if command -v swagger-codegen &> /dev/null; then
  echo "📋 Validating OpenAPI schema..."
  swagger-codegen validate -i ./api-spec/openapi.yaml
  echo "✅ OpenAPI schema is valid"
else
  echo "⚠️  swagger-codegen not found, skipping schema validation"
fi

# 既存の生成ファイルをクリーンアップ
echo "🧹 Cleaning up existing generated files..."
# rm -rf ./packages/api-client/src/api.ts
rm -rf ./packages/api-client/src/schemas/

# API client生成
echo "⚙️  Generating API client..."
pnpm orval --config ./orval.config.js

# 生成されたファイルのフォーマット
echo "💅 Formatting generated files..."
pnpm prettier --write "./packages/api-client/src/**/*.{ts,tsx}" || true

echo "✅ API client generated successfully"

# TypeScriptコンパイルチェック
echo "🔍 Running type checking..."
cd packages/api-client
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
echo "  - API functions: $(grep -c "export const use" ./packages/api-client/src/api/*/*.ts || echo "0")"
echo "  - Schema files: $(find ./packages/api-client/src/schemas -name "*.ts" | wc -l || echo "0")"

echo "🎉 API client generation completed successfully!"
echo ""
echo "Next steps:"
echo "  1. Review generated files in packages/api-client/src/"
echo "  2. Update frontend components to use the new API client"
echo "  3. Test the API integration"