import { FastifyPluginAsync } from 'fastify';
import { Type } from '@sinclair/typebox';
import { db, users, NewUser } from '@sensilog/db';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';

const authRoutes: FastifyPluginAsync = async (fastify) => {
  // Riot OAuth認証開始（開発環境ではモック認証）
  fastify.get('/riot/login', {
    schema: {
      summary: 'Riot OAuth認証開始',
      description: 'Riot Gamesアカウントでの認証を開始します（開発環境ではモック認証）',
      tags: ['Authentication'],
      response: {
        200: Type.Object({
          authUrl: Type.String({ format: 'uri' }),
          state: Type.String(),
          isDevelopment: Type.Optional(Type.Boolean()),
        }),
      },
    },
    handler: async (request, reply) => {
      // 開発環境ではモック認証URL
      if (process.env.NODE_ENV === 'development' || process.env.ENABLE_MOCK_AUTH === 'true') {
        const { MockAuthService } = await import('../lib/mock-auth.ts');
        const { authUrl, state } = MockAuthService.generateMockAuthUrl();
        
        return {
          authUrl,
          state,
          isDevelopment: true,
        };
      }

      // CSRF保護用のstateパラメータ生成
      const state = crypto.randomBytes(32).toString('hex');
      
      // Riot OAuth URL構築
      const riotClientId = process.env.RIOT_CLIENT_ID;
      if (!riotClientId) {
        return reply.code(500).send({
          error: 'Riot OAuth is not configured',
          code: 'OAUTH_NOT_CONFIGURED',
        });
      }

      const redirectUri = process.env.NODE_ENV === 'production'
        ? 'https://sensilog.com/auth/callback'
        : 'http://localhost:3000/auth/callback';

      const authUrl = new URL('https://auth.riotgames.com/authorize');
      authUrl.searchParams.set('client_id', riotClientId);
      authUrl.searchParams.set('redirect_uri', redirectUri);
      authUrl.searchParams.set('response_type', 'code');
      authUrl.searchParams.set('scope', 'openid offline_access');
      authUrl.searchParams.set('state', state);

      // stateをセッション等で保存（実装は簡略化）
      // TODO: 本番環境ではRedisやセッションストレージを使用

      return {
        authUrl: authUrl.toString(),
        state,
        isDevelopment: false,
      };
    },
  });

  // Riot OAuth認証コールバック
  fastify.post('/riot/callback', {
    schema: {
      summary: 'Riot OAuth認証コールバック',
      description: 'Riot認証サーバーからのコールバックを処理します',
      tags: ['Authentication'],
      body: Type.Object({
        code: Type.String(),
        state: Type.Optional(Type.String()),
      }),
      response: {
        200: Type.Object({
          user: Type.Object({
            id: Type.String({ format: 'uuid' }),
            email: Type.String({ format: 'email' }),
            gameName: Type.Optional(Type.String()),
            tagLine: Type.Optional(Type.String()),
            riotPuuid: Type.Optional(Type.String()),
            isAdmin: Type.Boolean(),
          }),
          token: Type.String(),
          expiresAt: Type.String({ format: 'date-time' }),
        }),
        400: Type.Object({
          error: Type.String(),
          code: Type.String(),
        }),
      },
    },
    handler: async (request, reply) => {
      const { code, state } = request.body as any;

      try {
        // TODO: stateの検証
        
        // Riot APIでアクセストークンを取得
        const tokenResponse = await exchangeCodeForToken(code);
        
        // Riot APIでユーザー情報を取得
        const riotUser = await getRiotUserInfo(tokenResponse.access_token);
        
        // データベースでユーザーを検索または作成
        let [existingUser] = await db
          .select()
          .from(users)
          .where(eq(users.riotPuuid, riotUser.puuid))
          .limit(1);

        if (!existingUser) {
          // 新規ユーザー作成
          const newUser: NewUser = {
            email: riotUser.email,
            riotPuuid: riotUser.puuid,
            gameName: riotUser.game_name,
            tagLine: riotUser.tag_line,
            accessToken: tokenResponse.access_token, // TODO: 暗号化
            refreshToken: tokenResponse.refresh_token, // TODO: 暗号化
            tokenExpiresAt: new Date(Date.now() + tokenResponse.expires_in * 1000),
          };

          [existingUser] = await db
            .insert(users)
            .values(newUser)
            .returning();
        } else {
          // 既存ユーザーのトークン更新
          [existingUser] = await db
            .update(users)
            .set({
              accessToken: tokenResponse.access_token, // TODO: 暗号化
              refreshToken: tokenResponse.refresh_token, // TODO: 暗号化
              tokenExpiresAt: new Date(Date.now() + tokenResponse.expires_in * 1000),
              gameName: riotUser.game_name,
              tagLine: riotUser.tag_line,
              updatedAt: new Date(),
            })
            .where(eq(users.id, existingUser.id))
            .returning();
        }

        // JWTトークン生成
        const jwtToken = fastify.generateToken({
          userId: existingUser.id,
          email: existingUser.email,
        });

        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // 7日後

        return {
          user: {
            id: existingUser.id,
            email: existingUser.email,
            gameName: existingUser.gameName,
            tagLine: existingUser.tagLine,
            riotPuuid: existingUser.riotPuuid,
            isAdmin: existingUser.isAdmin,
          },
          token: jwtToken,
          expiresAt: expiresAt.toISOString(),
        };

      } catch (error) {
        fastify.log.error('OAuth callback failed:', error);
        return reply.code(400).send({
          error: 'Authentication failed',
          code: 'OAUTH_CALLBACK_FAILED',
        });
      }
    },
  });

  // トークンリフレッシュ
  fastify.post('/refresh', {
    schema: {
      summary: 'JWTトークンリフレッシュ',
      description: 'JWTトークンを新しいものに更新します',
      tags: ['Authentication'],
      security: [{ bearerAuth: [] }],
      response: {
        200: Type.Object({
          token: Type.String(),
          expiresAt: Type.String({ format: 'date-time' }),
        }),
      },
    },
    preHandler: [fastify.authenticate],
    handler: async (request, reply) => {
      // 新しいトークンを生成
      const newToken = fastify.generateToken({
        userId: (request as any).user.id,
        email: (request as any).user.email,
      });

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7日後

      return {
        token: newToken,
        expiresAt: expiresAt.toISOString(),
      };
    },
  });

  // ユーザー情報取得
  fastify.get('/me', {
    schema: {
      summary: 'ユーザー情報取得',
      description: '認証済みユーザーの情報を取得します',
      tags: ['Authentication'],
      security: [{ bearerAuth: [] }],
      response: {
        200: Type.Object({
          id: Type.String({ format: 'uuid' }),
          email: Type.String({ format: 'email' }),
          gameName: Type.Optional(Type.String()),
          tagLine: Type.Optional(Type.String()),
          riotPuuid: Type.Optional(Type.String()),
          isAdmin: Type.Boolean(),
          createdAt: Type.String({ format: 'date-time' }),
          updatedAt: Type.String({ format: 'date-time' }),
        }),
      },
    },
    preHandler: [fastify.authenticate],
    handler: async (request) => {
      const [user] = await db
        .select({
          id: users.id,
          email: users.email,
          gameName: users.gameName,
          tagLine: users.tagLine,
          riotPuuid: users.riotPuuid,
          isAdmin: users.isAdmin,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt,
        })
        .from(users)
        .where(eq(users.id, (request as any).user.id))
        .limit(1);

      return user;
    },
  });
};

// Riot API / Mock APIヘルパー関数
async function exchangeCodeForToken(code: string) {
  // 開発環境ではモック認証を使用
  if (process.env.NODE_ENV === 'development' || process.env.ENABLE_MOCK_AUTH === 'true') {
    const { MockAuthService } = await import('../lib/mock-auth.ts');
    return await MockAuthService.verifyMockAuthCode(code);
  }

  // 本番環境ではRiot API使用
  const riotClientId = process.env.RIOT_CLIENT_ID;
  const riotClientSecret = process.env.RIOT_CLIENT_SECRET;

  if (!riotClientId || !riotClientSecret) {
    throw new Error('Riot OAuth credentials not configured');
  }

  // TODO: 実際のRiot API実装
  const response = await fetch('https://auth.riotgames.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${Buffer.from(`${riotClientId}:${riotClientSecret}`).toString('base64')}`,
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: process.env.RIOT_REDIRECT_URI || 'http://localhost:3000/auth/callback',
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to exchange code for token');
  }

  return await response.json();
}

async function getRiotUserInfo(accessToken: string) {
  // 開発環境ではモック認証を使用
  if (process.env.NODE_ENV === 'development' || process.env.ENABLE_MOCK_AUTH === 'true') {
    const { MockAuthService } = await import('../lib/mock-auth.ts');
    return await MockAuthService.getMockUserInfo(accessToken);
  }

  // 本番環境ではRiot API使用
  const response = await fetch('https://auth.riotgames.com/userinfo', {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to get user info');
  }

  const userData = await response.json();
  
  // Riot APIのレスポンス形式に合わせて変換
  return {
    puuid: userData.sub,
    email: userData.email,
    game_name: userData.preferred_username?.split('#')[0] || 'Unknown',
    tag_line: userData.preferred_username?.split('#')[1] || '0000',
  };
}

export default authRoutes;