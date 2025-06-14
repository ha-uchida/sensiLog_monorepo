import { FastifyPluginAsync } from 'fastify';
import { Type } from '@sinclair/typebox';
import { db, matchData, users } from '@sensilog/db';
import { eq, desc, and, gte, lte, inArray } from 'drizzle-orm';
import crypto from 'crypto';
import { RiotAPIService } from '../lib/riot-api.ts';

const matchDataRoutes: FastifyPluginAsync = async (fastify) => {
  // 試合データスキーマ定義
  const MatchDataSchema = Type.Object({
    id: Type.String({ format: 'uuid' }),
    userId: Type.String({ format: 'uuid' }),
    matchId: Type.String(),
    gameStartTime: Type.String({ format: 'date-time' }),
    gameEndTime: Type.Optional(Type.String({ format: 'date-time' })),
    mapName: Type.Optional(Type.String()),
    gameMode: Type.Optional(Type.String()),
    agentName: Type.Optional(Type.String()),
    kills: Type.Optional(Type.Integer({ minimum: 0 })),
    deaths: Type.Optional(Type.Integer({ minimum: 0 })),
    assists: Type.Optional(Type.Integer({ minimum: 0 })),
    combatScore: Type.Optional(Type.Number({ minimum: 0 })),
    headshotPercentage: Type.Optional(Type.Number({ minimum: 0, maximum: 100 })),
    kdRatio: Type.Optional(Type.Number({ minimum: 0 })),
    adr: Type.Optional(Type.Number({ minimum: 0 })),
    damageDealt: Type.Optional(Type.Integer({ minimum: 0 })),
    roundsPlayed: Type.Optional(Type.Integer({ minimum: 0 })),
    teamWon: Type.Optional(Type.Boolean()),
    rankTier: Type.Optional(Type.String()),
    createdAt: Type.String({ format: 'date-time' }),
  });

  // 試合データ一覧取得
  fastify.get('/', {
    schema: {
      summary: '試合データ取得',
      description: 'ユーザーの試合データ一覧を取得します',
      tags: ['MatchData'],
      security: [{ bearerAuth: [] }],
      querystring: Type.Object({
        startDate: Type.Optional(Type.String({ format: 'date' })),
        endDate: Type.Optional(Type.String({ format: 'date' })),
        maps: Type.Optional(Type.Array(Type.String())),
        agents: Type.Optional(Type.Array(Type.String())),
        gameMode: Type.Optional(Type.String()),
        limit: Type.Optional(Type.Integer({ minimum: 1, maximum: 200, default: 50 })),
        offset: Type.Optional(Type.Integer({ minimum: 0, default: 0 })),
      }),
      response: {
        200: Type.Object({
          matches: Type.Array(MatchDataSchema),
          total: Type.Integer(),
          hasMore: Type.Boolean(),
        }),
      },
    },
    preHandler: [fastify.authenticate],
    handler: async (request, reply) => {
      const { 
        startDate, 
        endDate, 
        maps, 
        agents, 
        gameMode, 
        limit = 50, 
        offset = 0 
      } = request.query as any;
      const userId = (request as any).user.id;

      // フィルター条件構築
      const conditions = [eq(matchData.userId, userId)];
      
      if (startDate) {
        conditions.push(gte(matchData.gameStartTime, new Date(startDate)));
      }
      
      if (endDate) {
        const endDateTime = new Date(endDate);
        endDateTime.setHours(23, 59, 59, 999);
        conditions.push(lte(matchData.gameStartTime, endDateTime));
      }

      if (maps && maps.length > 0) {
        conditions.push(inArray(matchData.mapName, maps));
      }

      if (agents && agents.length > 0) {
        conditions.push(inArray(matchData.agentName, agents));
      }

      if (gameMode) {
        conditions.push(eq(matchData.gameMode, gameMode));
      }

      // データ取得
      const matches = await db
        .select()
        .from(matchData)
        .where(and(...conditions))
        .orderBy(desc(matchData.gameStartTime))
        .limit(limit)
        .offset(offset);

      // 総数取得
      const totalResult = await db
        .select({ count: matchData.id })
        .from(matchData)
        .where(and(...conditions));

      const total = totalResult.length;

      return {
        matches: matches.map(match => ({
          ...match,
          combatScore: match.combatScore ? Number(match.combatScore) : undefined,
          headshotPercentage: match.headshotPercentage ? Number(match.headshotPercentage) : undefined,
          kdRatio: match.kdRatio ? Number(match.kdRatio) : undefined,
          adr: match.adr ? Number(match.adr) : undefined,
          gameStartTime: match.gameStartTime.toISOString(),
          gameEndTime: match.gameEndTime?.toISOString(),
          createdAt: match.createdAt.toISOString(),
        })),
        total,
        hasMore: offset + limit < total,
      };
    },
  });

  // 試合データ手動同期
  fastify.post('/sync', {
    schema: {
      summary: '試合データ手動同期',
      description: 'Riot APIから最新の試合データを取得します',
      tags: ['MatchData'],
      security: [{ bearerAuth: [] }],
      body: Type.Object({
        count: Type.Optional(Type.Integer({ minimum: 1, maximum: 20, default: 10 })),
      }),
      response: {
        202: Type.Object({
          message: Type.String(),
          jobId: Type.String(),
        }),
        400: Type.Object({
          error: Type.String(),
          code: Type.String(),
        }),
        429: Type.Object({
          error: Type.String(),
          code: Type.String(),
          retryAfter: Type.Number(),
        }),
      },
    },
    preHandler: [fastify.authenticate],
    handler: async (request, reply) => {
      const userId = (request as any).user.id;
      const { count = 10 } = request.body as any;

      // レート制限チェック（簡単な実装）
      const lastSync = await getLastSyncTime(userId);
      const now = Date.now();
      const cooldownMinutes = 5;
      
      if (lastSync && (now - lastSync) < cooldownMinutes * 60 * 1000) {
        const retryAfter = Math.ceil((cooldownMinutes * 60 * 1000 - (now - lastSync)) / 1000);
        return reply.code(429).send({
          error: 'Rate limit exceeded',
          code: 'RATE_LIMIT_EXCEEDED',
          retryAfter,
        });
      }

      // ユーザーのRiot PUUIDを取得
      const [user] = await db
        .select({ 
          riotPuuid: users.riotPuuid,
          gameName: users.gameName,
          tagLine: users.tagLine 
        })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (!user?.riotPuuid) {
        return reply.code(400).send({
          error: 'User does not have a linked Riot account',
          code: 'NO_RIOT_ACCOUNT',
        });
      }

      const jobId = crypto.randomUUID();

      // バックグラウンドで同期処理を実行
      syncMatchDataBackground(userId, user.riotPuuid, count, jobId, fastify)
        .catch(error => {
          fastify.log.error(`Background sync failed for user ${userId}:`, error);
        });
      
      // 最後の同期時間を記録
      await setLastSyncTime(userId, now);
      
      fastify.log.info(`Match data sync started for user ${userId}, job ${jobId}`);

      reply.code(202).send({
        message: '試合データの同期を開始しました',
        jobId,
      });
    },
  });

  // モック試合データ生成（開発環境のみ）
  fastify.post('/generate-mock', {
    schema: {
      summary: 'モック試合データ生成',
      description: '開発用のモック試合データを生成します',
      tags: ['MatchData'],
      security: [{ bearerAuth: [] }],
      body: Type.Object({
        count: Type.Optional(Type.Integer({ minimum: 1, maximum: 100, default: 20 })),
      }),
      response: {
        200: Type.Object({
          message: Type.String(),
          generated: Type.Integer(),
        }),
        403: Type.Object({
          error: Type.String(),
          code: Type.String(),
        }),
      },
    },
    preHandler: [fastify.authenticate],
    handler: async (request, reply) => {
      // 開発環境でない場合は403エラー
      if (process.env.NODE_ENV === 'production') {
        return reply.code(403).send({
          error: 'Mock data generation is only available in development',
          code: 'NOT_DEVELOPMENT_MODE',
        });
      }

      const { count = 20 } = request.body as any;
      const userId = (request as any).user.id;

      try {
        // ユーザー情報からpuuidを取得
        const [user] = await db
          .select({ riotPuuid: users.riotPuuid })
          .from(users)
          .where(eq(users.id, userId))
          .limit(1);

        if (!user?.riotPuuid) {
          return reply.code(400).send({
            error: 'User does not have a Riot PUUID',
            code: 'MISSING_PUUID',
          });
        }

        // モックデータ生成
        const { MockAuthService } = await import('../lib/mock-auth.ts');
        const mockMatches = await MockAuthService.getMockMatches(user.riotPuuid, { count });

        // データベースに挿入
        const matchesToInsert = mockMatches.map(match => ({
          userId,
          matchId: match.matchId,
          gameStartTime: match.gameStartTime,
          gameEndTime: match.gameEndTime,
          mapName: match.mapName,
          gameMode: match.gameMode,
          agentName: match.agentName,
          kills: match.kills,
          deaths: match.deaths,
          assists: match.assists,
          combatScore: match.combatScore.toString(),
          headshotPercentage: match.headshotPercentage.toString(),
          kdRatio: match.kdRatio.toString(),
          adr: match.adr.toString(),
          damageDealt: match.damageDealt,
          roundsPlayed: match.roundsPlayed,
          teamWon: match.teamWon,
          rankTier: match.rankTier,
        }));

        await db.insert(matchData).values(matchesToInsert);

        fastify.log.info(`Generated ${count} mock matches for user ${userId}`);

        return {
          message: `${count}件のモック試合データを生成しました`,
          generated: count,
        };

      } catch (error) {
        fastify.log.error('Mock data generation failed:', error);
        return reply.code(500).send({
          error: 'Failed to generate mock data',
          code: 'MOCK_GENERATION_FAILED',
        });
      }
    },
  });

  // 統計サマリー取得
  fastify.get('/summary', {
    schema: {
      summary: '試合データサマリー',
      description: '試合データの統計サマリーを取得します',
      tags: ['MatchData'],
      security: [{ bearerAuth: [] }],
      querystring: Type.Object({
        startDate: Type.Optional(Type.String({ format: 'date' })),
        endDate: Type.Optional(Type.String({ format: 'date' })),
      }),
      response: {
        200: Type.Object({
          totalMatches: Type.Integer(),
          averages: Type.Object({
            combatScore: Type.Optional(Type.Number()),
            headshotPercentage: Type.Optional(Type.Number()),
            kdRatio: Type.Optional(Type.Number()),
            adr: Type.Optional(Type.Number()),
          }),
          winRate: Type.Optional(Type.Number()),
          favoriteAgent: Type.Optional(Type.String()),
          favoriteMap: Type.Optional(Type.String()),
          recentPerformance: Type.Object({
            trend: Type.String({ enum: ['improving', 'declining', 'stable'] }),
            changePercent: Type.Number(),
          }),
        }),
      },
    },
    preHandler: [fastify.authenticate],
    handler: async (request, reply) => {
      const { startDate, endDate } = request.query as any;
      const userId = (request as any).user.id;

      // フィルター条件
      const conditions = [eq(matchData.userId, userId)];
      
      if (startDate) {
        conditions.push(gte(matchData.gameStartTime, new Date(startDate)));
      }
      
      if (endDate) {
        const endDateTime = new Date(endDate);
        endDateTime.setHours(23, 59, 59, 999);
        conditions.push(lte(matchData.gameStartTime, endDateTime));
      }

      // 基本統計取得
      const matches = await db
        .select()
        .from(matchData)
        .where(and(...conditions));

      if (matches.length === 0) {
        return {
          totalMatches: 0,
          averages: {},
          recentPerformance: {
            trend: 'stable' as 'stable',
            changePercent: 0,
          },
        };
      }

      // 統計計算
      const validMatches = matches.filter(m => m.combatScore !== null);
      const avgCombatScore = validMatches.length > 0 
        ? validMatches.reduce((sum, m) => sum + Number(m.combatScore), 0) / validMatches.length
        : undefined;

      const validHsMatches = matches.filter(m => m.headshotPercentage !== null);
      const avgHeadshotPercentage = validHsMatches.length > 0
        ? validHsMatches.reduce((sum, m) => sum + Number(m.headshotPercentage), 0) / validHsMatches.length
        : undefined;

      const validKdMatches = matches.filter(m => m.kdRatio !== null);
      const avgKdRatio = validKdMatches.length > 0
        ? validKdMatches.reduce((sum, m) => sum + Number(m.kdRatio), 0) / validKdMatches.length
        : undefined;

      const validAdrMatches = matches.filter(m => m.adr !== null);
      const avgAdr = validAdrMatches.length > 0
        ? validAdrMatches.reduce((sum, m) => sum + Number(m.adr), 0) / validAdrMatches.length
        : undefined;

      // 勝率計算
      const winMatches = matches.filter(m => m.teamWon === true);
      const winRate = matches.length > 0 ? (winMatches.length / matches.length) * 100 : undefined;

      // お気に入りエージェント・マップ
      const agentCounts = {} as any;
      const mapCounts = {} as any;
      
      matches.forEach(match => {
        if (match.agentName) {
          agentCounts[match.agentName] = (agentCounts[match.agentName] || 0) + 1;
        }
        if (match.mapName) {
          mapCounts[match.mapName] = (mapCounts[match.mapName] || 0) + 1;
        }
      });

      const favoriteAgent = Object.keys(agentCounts).length > 0
        ? Object.keys(agentCounts).reduce((a, b) => agentCounts[a] > agentCounts[b] ? a : b)
        : undefined;

      const favoriteMap = Object.keys(mapCounts).length > 0
        ? Object.keys(mapCounts).reduce((a, b) => mapCounts[a] > mapCounts[b] ? a : b)
        : undefined;

      // 最近のパフォーマンストレンド（簡単な実装）
      const recentMatches = matches.slice(0, 10);
      const olderMatches = matches.slice(10, 20);
      
      let trend: 'improving' | 'declining' | 'stable' = 'stable';
      let changePercent = 0;

      if (recentMatches.length >= 5 && olderMatches.length >= 5) {
        const recentAvg = recentMatches
          .filter(m => m.combatScore !== null)
          .reduce((sum, m) => sum + Number(m.combatScore), 0) / recentMatches.length;
        
        const olderAvg = olderMatches
          .filter(m => m.combatScore !== null)
          .reduce((sum, m) => sum + Number(m.combatScore), 0) / olderMatches.length;

        if (recentAvg > olderAvg * 1.05) {
          trend = 'improving';
        } else if (recentAvg < olderAvg * 0.95) {
          trend = 'declining';
        }

        changePercent = ((recentAvg - olderAvg) / olderAvg) * 100;
      }

      return {
        totalMatches: matches.length,
        averages: {
          combatScore: avgCombatScore,
          headshotPercentage: avgHeadshotPercentage,
          kdRatio: avgKdRatio,
          adr: avgAdr,
        },
        winRate,
        favoriteAgent,
        favoriteMap,
        recentPerformance: {
          trend,
          changePercent,
        },
      };
    },
  });
};

// バックグラウンド同期処理
async function syncMatchDataBackground(
  userId: string, 
  puuid: string, 
  count: number, 
  jobId: string,
  fastify: any
): Promise<void> {
  const riotApiKey = process.env.RIOT_API_KEY;
  
  if (!riotApiKey) {
    fastify.log.error('RIOT_API_KEY not configured');
    return;
  }

  try {
    const riotService = new RiotAPIService(riotApiKey, fastify.log);
    
    // Riot APIから試合データを取得
    const matches = await riotService.syncPlayerMatches(puuid, count);
    
    // データベースに保存（重複チェック）
    for (const match of matches) {
      const existing = await db
        .select({ id: matchData.id })
        .from(matchData)
        .where(and(
          eq(matchData.userId, userId),
          eq(matchData.matchId, match.matchId)
        ))
        .limit(1);

      if (existing.length === 0) {
        await db.insert(matchData).values({
          userId,
          matchId: match.matchId,
          gameStartTime: match.gameStartTime,
          gameEndTime: match.gameEndTime,
          mapName: match.mapName,
          gameMode: match.gameMode,
          agentName: match.agentName,
          kills: match.kills,
          deaths: match.deaths,
          assists: match.assists,
          combatScore: match.combatScore?.toString(),
          headshotPercentage: match.headshotPercentage?.toString(),
          kdRatio: match.kdRatio?.toString(),
          adr: match.adr?.toString(),
          damageDealt: match.damageDealt,
          roundsPlayed: match.roundsPlayed,
          teamWon: match.teamWon,
          rankTier: match.rankTier,
        });
      }
    }

    fastify.log.info(`Successfully synced ${matches.length} matches for user ${userId} (job ${jobId})`);
    
  } catch (error) {
    fastify.log.error(`Match sync failed for user ${userId} (job ${jobId}):`, error);
    throw error;
  }
}

// ヘルパー関数（仮実装）
async function getLastSyncTime(userId: string): Promise<number | null> {
  // TODO: Redis等から最後の同期時間を取得
  return null;
}

async function setLastSyncTime(userId: string, timestamp: number): Promise<void> {
  // TODO: Redis等に最後の同期時間を保存
}

export default matchDataRoutes;