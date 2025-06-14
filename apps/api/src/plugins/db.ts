import { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import { db } from '@sensilog/db';
import { sql } from 'drizzle-orm';

declare module 'fastify' {
  interface FastifyInstance {
    db: typeof db;
  }
}

const dbPlugin: FastifyPluginAsync = async (fastify) => {
  // データベースインスタンスをFastifyインスタンスに追加
  fastify.decorate('db', db);

  // データベース接続テスト
  try {
    // 簡単なクエリでデータベース接続をテスト
    await db.execute(sql`SELECT 1`);
    fastify.log.info('✅ Database connection established');
  } catch (error) {
    fastify.log.error('❌ Database connection failed:', error);
    throw error;
  }

  // アプリケーション終了時のクリーンアップ
  fastify.addHook('onClose', async () => {
    fastify.log.info('🔌 Closing database connections...');
    // Neonの場合、明示的なクローズは不要ですが、将来的な拡張のため
  });
};

export default fp(dbPlugin, {
  name: 'db-plugin',
});