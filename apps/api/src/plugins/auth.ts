import { FastifyPluginAsync, FastifyRequest, FastifyReply, FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import jwt from '@fastify/jwt';
import { db, users } from '@sensilog/db';
import { eq } from 'drizzle-orm';


const authPlugin: FastifyPluginAsync = async (fastify) => {
  // JWT設定
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is required');
  }

  await fastify.register(jwt, {
    secret: process.env.JWT_SECRET,
    sign: {
      expiresIn: '7d', // 7日間
    },
  });

  // 認証ミドルウェア
  fastify.decorate('authenticate', async function (request: FastifyRequest, reply: FastifyReply) {
    try {
      // JWTトークンを検証
      const payload = await (request as any).jwtVerify();
      
      // ユーザー情報をデータベースから取得
      const [user] = await db
        .select({
          id: users.id,
          email: users.email,
          riotPuuid: users.riotPuuid,
          gameName: users.gameName,
          tagLine: users.tagLine,
          isAdmin: users.isAdmin,
        })
        .from(users)
        .where(eq(users.id, (payload as any).userId))
        .limit(1);

      if (!user) {
        return reply.code(401).send({ 
          error: 'User not found',
          code: 'USER_NOT_FOUND'
        });
      }

      // リクエストオブジェクトにユーザー情報を添付
      (request as any).user = user;
      
    } catch (err) {
      fastify.log.error('Authentication failed:', err);
      
      if ((err as any).code === 'FAST_JWT_INVALID_SIGNATURE') {
        return reply.code(401).send({ 
          error: 'Invalid token signature',
          code: 'INVALID_TOKEN'
        });
      }
      
      if ((err as any).code === 'FAST_JWT_EXPIRED') {
        return reply.code(401).send({ 
          error: 'Token has expired',
          code: 'TOKEN_EXPIRED'
        });
      }
      
      return reply.code(401).send({ 
        error: 'Authentication required',
        code: 'AUTHENTICATION_REQUIRED'
      });
    }
  });

  // 管理者認証ミドルウェア
  fastify.decorate('requireAdmin', async function (request: FastifyRequest, reply: FastifyReply) {
    await fastify.authenticate(request, reply);
    
    if (!(request as any).user.isAdmin) {
      return reply.code(403).send({ 
        error: 'Admin access required',
        code: 'ADMIN_ACCESS_REQUIRED'
      });
    }
  });

  // トークン生成ヘルパー
  fastify.decorate('generateToken', function (payload: any) {
    return fastify.jwt.sign(payload);
  });

  // トークン検証ヘルパー
  fastify.decorate('verifyToken', function (token: string) {
    return fastify.jwt.verify(token);
  });
};

export default fp(authPlugin, {
  name: 'auth-plugin',
});