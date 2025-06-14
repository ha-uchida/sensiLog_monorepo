import { FastifyPluginAsync } from 'fastify';
import { Type } from '@sinclair/typebox';
import { sql } from 'drizzle-orm';

const healthRoutes: FastifyPluginAsync = async (fastify) => {
  // ヘルスチェックエンドポイント
  fastify.get('/health', {
    schema: {
      summary: 'ヘルスチェック',
      description: 'サーバーの稼働状況を確認します',
      tags: ['System'],
      response: {
        200: Type.Object({
          status: Type.Literal('ok'),
          timestamp: Type.String({ format: 'date-time' }),
          uptime: Type.Number(),
          environment: Type.String(),
          version: Type.String(),
          database: Type.Object({
            status: Type.String(),
            responseTime: Type.Number(),
          }),
        }),
      },
    },
    handler: async (request, reply) => {
      const startTime = Date.now();
      
      // データベース接続テスト
      let dbStatus = 'unknown';
      let dbResponseTime = 0;
      
      try {
        const dbStartTime = Date.now();
        await fastify.db.execute(sql`SELECT 1`);
        dbResponseTime = Date.now() - dbStartTime;
        dbStatus = 'connected';
      } catch (error) {
        fastify.log.error('Database health check failed:', error);
        dbStatus = 'disconnected';
        dbResponseTime = Date.now() - startTime;
      }

      return {
        status: 'ok' as const,
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
        version: process.env.npm_package_version || '1.0.0',
        database: {
          status: dbStatus,
          responseTime: dbResponseTime,
        },
      };
    },
  });

  // 詳細なシステム情報（開発環境のみ）
  if (process.env.NODE_ENV === 'development') {
    fastify.get('/health/detailed', {
      schema: {
        summary: '詳細ヘルスチェック',
        description: '詳細なサーバー情報を返します（開発環境のみ）',
        tags: ['System'],
        response: {
          200: Type.Object({
            status: Type.String(),
            timestamp: Type.String({ format: 'date-time' }),
            uptime: Type.Number(),
            environment: Type.String(),
            nodeVersion: Type.String(),
            platform: Type.String(),
            arch: Type.String(),
            memory: Type.Object({
              used: Type.Number(),
              total: Type.Number(),
              external: Type.Number(),
              heapUsed: Type.Number(),
              heapTotal: Type.Number(),
            }),
            cpu: Type.Object({
              user: Type.Number(),
              system: Type.Number(),
            }),
          }),
        },
      },
      handler: async () => {
        const memoryUsage = process.memoryUsage();
        const cpuUsage = process.cpuUsage();

        return {
          status: 'ok',
          timestamp: new Date().toISOString(),
          uptime: process.uptime(),
          environment: process.env.NODE_ENV || 'development',
          nodeVersion: process.version,
          platform: process.platform,
          arch: process.arch,
          memory: {
            used: memoryUsage.rss,
            total: memoryUsage.rss + memoryUsage.heapTotal,
            external: memoryUsage.external,
            heapUsed: memoryUsage.heapUsed,
            heapTotal: memoryUsage.heapTotal,
          },
          cpu: {
            user: cpuUsage.user,
            system: cpuUsage.system,
          },
        };
      },
    });
  }
};

export default healthRoutes;