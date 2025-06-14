import { defineConfig } from 'drizzle-kit';
import * as dotenv from 'dotenv';

// ルートディレクトリの.envファイルを読み込み
dotenv.config({ path: '../../.env' });

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/schema.ts',
  out: './migrations',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  verbose: true,
  strict: true,
});