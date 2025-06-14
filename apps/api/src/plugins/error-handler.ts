import { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';

const errorHandlerPlugin: FastifyPluginAsync = async (fastify) => {
  // グローバルエラーハンドラー
  fastify.setErrorHandler(async (error, request, reply) => {
    fastify.log.error({
      error: error.message,
      stack: error.stack,
      url: request.url,
      method: request.method,
      ip: request.ip,
    }, 'Unhandled error occurred');

    // バリデーションエラー
    if (error.validation) {
      return reply.code(400).send({
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: error.validation,
      });
    }

    // JWT関連エラー
    if (error.code?.startsWith('FAST_JWT_')) {
      return reply.code(401).send({
        error: 'Authentication failed',
        code: 'AUTHENTICATION_ERROR',
      });
    }

    // データベースエラー
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      return reply.code(503).send({
        error: 'Database connection failed',
        code: 'DATABASE_ERROR',
      });
    }

    // レート制限エラー
    if (error.statusCode === 429) {
      return reply.code(429).send({
        error: 'Too many requests',
        code: 'RATE_LIMIT_EXCEEDED',
        retryAfter: (error as any).retryAfter || 60,
      });
    }

    // 本番環境では詳細なエラー情報を隠す
    if (process.env.NODE_ENV === 'production') {
      return reply.code(error.statusCode || 500).send({
        error: 'Internal server error',
        code: 'INTERNAL_ERROR',
      });
    }

    // 開発環境では詳細なエラー情報を返す
    return reply.code(error.statusCode || 500).send({
      error: error.message,
      code: error.code || 'INTERNAL_ERROR',
      stack: error.stack,
    });
  });

  // 404エラーハンドラー
  fastify.setNotFoundHandler(async (request, reply) => {
    return reply.code(404).send({
      error: `Route ${request.method} ${request.url} not found`,
      code: 'ROUTE_NOT_FOUND',
    });
  });

  // Pre-validation フック（リクエストログ）
  fastify.addHook('preValidation', async (request) => {
    request.log.info({
      method: request.method,
      url: request.url,
      ip: request.ip,
      userAgent: request.headers['user-agent'],
    }, 'Incoming request');
  });

  // Pre-serialization フック（レスポンスログ）
  fastify.addHook('preSerialization', async (request, reply, payload) => {
    request.log.info({
      method: request.method,
      url: request.url,
      statusCode: reply.statusCode,
      responseTime: reply.getResponseTime(),
    }, 'Request completed');
    
    return payload;
  });
};

export default fp(errorHandlerPlugin, {
  name: 'error-handler-plugin',
});