import 'dotenv/config';
import { buildApp } from './app.ts';

const start = async () => {
  const app = await buildApp({
    logger: {
      level: process.env.LOG_LEVEL || 'info',
      transport: process.env.NODE_ENV === 'development' ? {
        target: "pino-pretty",
        options: { 
          colorize: true,
          translateTime: 'HH:MM:ss Z',
          ignore: 'pid,hostname'
        }
      } : undefined,
    },
  });

  try {
    const port = Number(process.env.PORT) || 3001;
    const host = process.env.HOST || '0.0.0.0';
    
    await app.listen({ port, host });
    
    app.log.info(`🚀 SensiLog API Server running on http://${host}:${port}`);
    app.log.info(`📖 Swagger UI available at http://${host}:${port}/docs`);
    app.log.info(`🔍 Health check: http://${host}:${port}/health`);
    
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Received SIGINT, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Received SIGTERM, shutting down gracefully...');
  process.exit(0);
});

start().catch((err) => {
  console.error('❌ Failed to start server:', err);
  process.exit(1);
});