import { FastifyPluginAsync } from 'fastify';
import { Type } from '@sinclair/typebox';
import { db, users } from '@sensilog/db';
import { eq } from 'drizzle-orm';
import { RiotAPIService } from '../lib/riot-api.ts';

const riotRoutes: FastifyPluginAsync = async (fastify) => {
  // プレイヤー検索
  fastify.post('/search-player', {
    schema: {
      summary: 'プレイヤー検索',
      description: 'ゲーム名とタグラインでプレイヤーを検索します',
      tags: ['Riot'],
      security: [{ bearerAuth: [] }],
      body: Type.Object({
        gameName: Type.String({ minLength: 1, maxLength: 16 }),
        tagLine: Type.String({ minLength: 1, maxLength: 5 }),
      }),
      response: {
        200: Type.Object({
          puuid: Type.String(),
          gameName: Type.String(),
          tagLine: Type.String(),
          found: Type.Boolean(),
        }),
        400: Type.Object({
          error: Type.String(),
          code: Type.String(),
        }),
        404: Type.Object({
          error: Type.String(),
          code: Type.String(),
        }),
      },
    },
    preHandler: [fastify.authenticate],
    handler: async (request, reply) => {
      const { gameName, tagLine } = request.body as any;
      const riotApiKey = process.env.RIOT_API_KEY;

      if (!riotApiKey) {
        return reply.code(400).send({
          error: 'Riot API is not configured',
          code: 'API_NOT_CONFIGURED',
        });
      }

      try {
        const riotService = new RiotAPIService(riotApiKey, fastify.log);
        const playerData = await riotService.findPlayer(gameName, tagLine);

        return {
          puuid: playerData.puuid,
          gameName,
          tagLine,
          found: true,
        };
      } catch (error) {
        fastify.log.error(
          `Player search failed for ${gameName}#${tagLine}:`,
          error,
        );

        if ((error as any).message.includes('404')) {
          return reply.code(404).send({
            error: 'Player not found',
            code: 'PLAYER_NOT_FOUND',
          });
        }

        return reply.code(400).send({
          error: 'Failed to search player',
          code: 'SEARCH_FAILED',
        });
      }
    },
  });

  // アカウント連携
  fastify.post('/link-account', {
    schema: {
      summary: 'Riotアカウント連携',
      description: 'ユーザーとRiotアカウントを連携します',
      tags: ['Riot'],
      security: [{ bearerAuth: [] }],
      body: Type.Object({
        gameName: Type.String({ minLength: 1, maxLength: 16 }),
        tagLine: Type.String({ minLength: 1, maxLength: 5 }),
      }),
      response: {
        200: Type.Object({
          message: Type.String(),
          linked: Type.Boolean(),
          puuid: Type.String(),
        }),
        400: Type.Object({
          error: Type.String(),
          code: Type.String(),
        }),
        404: Type.Object({
          error: Type.String(),
          code: Type.String(),
        }),
      },
    },
    preHandler: [fastify.authenticate],
    handler: async (request, reply) => {
      const { gameName, tagLine } = request.body as any;
      const userId = (request as any).user.id;
      const riotApiKey = process.env.RIOT_API_KEY;

      if (!riotApiKey) {
        return reply.code(400).send({
          error: 'Riot API is not configured',
          code: 'API_NOT_CONFIGURED',
        });
      }

      try {
        // プレイヤーを検索
        const riotService = new RiotAPIService(riotApiKey, fastify.log);
        const playerData = await riotService.findPlayer(gameName, tagLine);

        // アカウント情報を更新
        await db
          .update(users)
          .set({
            riotPuuid: playerData.puuid,
            gameName,
            tagLine,
            updatedAt: new Date(),
          })
          .where(eq(users.id, userId));

        fastify.log.info(
          `User ${userId} linked Riot account: ${gameName}#${tagLine} (${playerData.puuid})`,
        );

        return {
          message: 'Riotアカウントが正常に連携されました',
          linked: true,
          puuid: playerData.puuid,
        };
      } catch (error) {
        fastify.log.error(
          `Account linking failed for ${gameName}#${tagLine}:`,
          error,
        );

        if ((error as any).message.includes('404')) {
          return reply.code(404).send({
            error: 'Player not found',
            code: 'PLAYER_NOT_FOUND',
          });
        }

        return reply.code(400).send({
          error: 'Failed to link account',
          code: 'LINK_FAILED',
        });
      }
    },
  });

  // アカウント連携解除
  fastify.delete('/unlink-account', {
    schema: {
      summary: 'Riotアカウント連携解除',
      description: 'Riotアカウントの連携を解除します',
      tags: ['Riot'],
      security: [{ bearerAuth: [] }],
      response: {
        200: Type.Object({
          message: Type.String(),
          unlinked: Type.Boolean(),
        }),
      },
    },
    preHandler: [fastify.authenticate],
    handler: async (request) => {
      const userId = (request as any).user.id;

      // アカウント情報をクリア
      await db
        .update(users)
        .set({
          riotPuuid: null,
          gameName: null,
          tagLine: null,
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId));

      fastify.log.info(`User ${userId} unlinked Riot account`);

      return {
        message: 'Riotアカウントの連携が解除されました',
        unlinked: true,
      };
    },
  });

  // 連携状態確認
  fastify.get('/link-status', {
    schema: {
      summary: 'Riotアカウント連携状態確認',
      description: 'Riotアカウントの連携状態を確認します',
      tags: ['Riot'],
      security: [{ bearerAuth: [] }],
      response: {
        200: Type.Object({
          linked: Type.Boolean(),
          gameName: Type.Optional(Type.String()),
          tagLine: Type.Optional(Type.String()),
          puuid: Type.Optional(Type.String()),
        }),
      },
    },
    preHandler: [fastify.authenticate],
    handler: async (request) => {
      const userId = (request as any).user.id;

      const [user] = await db
        .select({
          riotPuuid: users.riotPuuid,
          gameName: users.gameName,
          tagLine: users.tagLine,
        })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      return {
        linked: !!user?.riotPuuid,
        gameName: user?.gameName || undefined,
        tagLine: user?.tagLine || undefined,
        puuid: user?.riotPuuid || undefined,
      };
    },
  });
};

export default riotRoutes;
