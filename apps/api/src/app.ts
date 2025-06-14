import Fastify, { FastifyServerOptions } from 'fastify';
import swagger from '@fastify/swagger';
import swaggerUI from '@fastify/swagger-ui';
import cors from '@fastify/cors';
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';

export async function buildApp(opts: FastifyServerOptions = {}) {
  const app = Fastify(opts).withTypeProvider<TypeBoxTypeProvider>();

  // CORS設定
  await app.register(cors, {
    origin: (origin, cb) => {
      // 開発環境では全てのオリジンを許可
      if (process.env.NODE_ENV === 'development') {
        cb(null, true);
        return;
      }

      // 本番環境では特定のドメインのみ許可
      const allowedOrigins = [
        'https://sensilog.vercel.app',
        'https://sensilog.com',
        'https://www.sensilog.com',
      ];

      if (!origin || allowedOrigins.includes(origin)) {
        cb(null, true);
      } else {
        cb(new Error('CORS policy violation'), false);
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // OpenAPI/Swagger設定
  await app.register(swagger, {
    openapi: {
      openapi: '3.0.3',
      info: {
        title: 'SensiLog API',
        description: 'VALORANT感度・設定管理API',
        version: '1.0.0',
        contact: {
          name: 'SensiLog Team',
          url: 'https://sensilog.com',
        },
        license: {
          name: 'MIT',
          url: 'https://opensource.org/licenses/MIT',
        },
      },
      servers: [
        {
          url:
            process.env.NODE_ENV === 'production'
              ? 'https://api.sensilog.com'
              : `http://localhost:${process.env.PORT || 3001}`,
          description:
            process.env.NODE_ENV === 'production'
              ? 'Production'
              : 'Development',
        },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      },
      tags: [
        { name: 'System', description: 'システム関連' },
        { name: 'Authentication', description: '認証関連' },
        { name: 'Settings', description: '設定記録管理' },
        { name: 'MatchData', description: '試合データ' },
        { name: 'Analytics', description: '分析・統計' },
        { name: 'Riot', description: 'Riot API連携' },
        { name: 'Admin', description: '管理者機能' },
      ],
    },
  });

  // Swagger UI設定
  await app.register(swaggerUI, {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: false,
      displayOperationId: false,
      defaultModelsExpandDepth: 1,
      defaultModelExpandDepth: 1,
      defaultModelRendering: 'example',
      displayRequestDuration: true,
      tryItOutEnabled: true,
      requestInterceptor: (request: any) => {
        // 開発環境でのJWT自動付与
        if (
          typeof window !== 'undefined' &&
          window.localStorage?.getItem('authToken')
        ) {
          request.headers.Authorization =
            'Bearer ' + window.localStorage.getItem('authToken');
        }
        return request;
      },
    },
    staticCSP: true,
    transformSpecificationClone: true,
  });

  // プラグイン登録
  await app.register(import('./plugins/auth.ts'));
  await app.register(import('./plugins/db.ts'));
  await app.register(import('./plugins/error-handler.ts'));

  // ルート登録
  await app.register(import('./routes/health.ts'));
  await app.register(import('./routes/auth.ts'), { prefix: '/auth' });
  await app.register(import('./routes/settings.ts'), { prefix: '/settings' });
  await app.register(import('./routes/match-data.ts'), {
    prefix: '/match-data',
  });
  await app.register(import('./routes/analytics.ts'), { prefix: '/analytics' });
  await app.register(import('./routes/riot.ts'), { prefix: '/riot' });

  return app;
}
