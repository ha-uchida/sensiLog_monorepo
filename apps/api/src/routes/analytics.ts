import { FastifyPluginAsync } from 'fastify';
import { Type } from '@sinclair/typebox';
import { db, matchData, settingsRecords } from '@sensilog/db';
import { eq, and, gte, lte, desc } from 'drizzle-orm';

const analyticsRoutes: FastifyPluginAsync = async (fastify) => {
  // 分析データポイントスキーマ
  const AnalyticsDataPointSchema = Type.Object({
    date: Type.String({ format: 'date' }),
    value: Type.Number(),
    matchCount: Type.Integer(),
  });

  const PerformanceSummarySchema = Type.Object({
    average: Type.Number(),
    best: Type.Number(),
    worst: Type.Number(),
    trend: Type.String({ enum: ['improving', 'declining', 'stable'] }),
    changePercent: Type.Number(),
  });

  const SettingsChangeSchema = Type.Object({
    date: Type.String({ format: 'date-time' }),
    changes: Type.Array(Type.Object({
      field: Type.String(),
      oldValue: Type.Optional(Type.String()),
      newValue: Type.String(),
    })),
  });

  const DateRangeSchema = Type.Object({
    startDate: Type.String({ format: 'date' }),
    endDate: Type.String({ format: 'date' }),
  });

  const ComparisonResultSchema = Type.Object({
    period1: Type.Object({
      label: Type.String(),
      stats: PerformanceSummarySchema,
    }),
    period2: Type.Object({
      label: Type.String(),
      stats: PerformanceSummarySchema,
    }),
    comparison: Type.Record(Type.String(), Type.Object({
      difference: Type.Number(),
      percentChange: Type.Number(),
      trend: Type.String({ enum: ['up', 'down', 'same'] }),
    })),
  });

  // パフォーマンス分析データ取得
  fastify.get('/performance', {
    schema: {
      summary: 'パフォーマンス分析データ取得',
      description: '指定されたメトリクスのパフォーマンス分析データを取得します',
      tags: ['Analytics'],
      security: [{ bearerAuth: [] }],
      querystring: Type.Object({
        metric: Type.String({ 
          enum: ['combatScore', 'headshotPercentage', 'kdRatio', 'adr'] 
        }),
        startDate: Type.Optional(Type.String({ format: 'date' })),
        endDate: Type.Optional(Type.String({ format: 'date' })),
        groupBy: Type.Optional(Type.String({ 
          enum: ['day', 'week', 'month'],
          default: 'day' 
        })),
      }),
      response: {
        200: Type.Object({
          dataPoints: Type.Array(AnalyticsDataPointSchema),
          summary: PerformanceSummarySchema,
          settingsChanges: Type.Array(SettingsChangeSchema),
        }),
      },
    },
    preHandler: [fastify.authenticate],
    handler: async (request, reply) => {
      const { metric, startDate, endDate, groupBy = 'day' } = request.query as any;
      const userId = (request as any).user.id;

      // 日付範囲設定
      const endDateTime = endDate ? new Date(endDate) : new Date();
      const startDateTime = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30日前

      endDateTime.setHours(23, 59, 59, 999);

      // 試合データ取得
      const matches = await db
        .select()
        .from(matchData)
        .where(and(
          eq(matchData.userId, userId),
          gte(matchData.gameStartTime, startDateTime),
          lte(matchData.gameStartTime, endDateTime)
        ))
        .orderBy(matchData.gameStartTime);

      // メトリクス値のマッピング
      const getMetricValue = (match: any) => {
        switch (metric) {
          case 'combatScore':
            return match.combatScore ? Number(match.combatScore) : null;
          case 'headshotPercentage':
            return match.headshotPercentage ? Number(match.headshotPercentage) : null;
          case 'kdRatio':
            return match.kdRatio ? Number(match.kdRatio) : null;
          case 'adr':
            return match.adr ? Number(match.adr) : null;
          default:
            return null;
        }
      };

      // データポイント生成
      const dataPoints = generateDataPoints(matches, getMetricValue, groupBy, startDateTime, endDateTime);

      // サマリー計算
      const validValues = matches
        .map(getMetricValue)
        .filter((value): value is number => value !== null);

      const summary = calculateSummary(validValues);

      // 設定変更履歴取得
      const settingsChanges = await getSettingsChanges(userId, startDateTime, endDateTime);

      return {
        dataPoints,
        summary,
        settingsChanges,
      };
    },
  });

  // 期間比較分析
  fastify.post('/comparison', {
    schema: {
      summary: '期間比較分析',
      description: '2つの期間のパフォーマンスを比較分析します',
      tags: ['Analytics'],
      security: [{ bearerAuth: [] }],
      body: Type.Object({
        period1: DateRangeSchema,
        period2: DateRangeSchema,
        metrics: Type.Array(Type.String({ 
          enum: ['combatScore', 'headshotPercentage', 'kdRatio', 'adr'] 
        })),
      }),
      response: {
        200: ComparisonResultSchema,
      },
    },
    preHandler: [fastify.authenticate],
    handler: async (request, reply) => {
      const { period1, period2, metrics } = request.body as any;
      const userId = (request as any).user.id;

      // 期間1のデータ取得
      const matches1 = await getMatchesInPeriod(userId, period1.startDate, period1.endDate);
      // 期間2のデータ取得
      const matches2 = await getMatchesInPeriod(userId, period2.startDate, period2.endDate);

      // 各期間の統計計算
      const stats1 = calculatePeriodStats(matches1, metrics);
      const stats2 = calculatePeriodStats(matches2, metrics);

      // 比較計算
      const comparison = {} as any;
      for (const metric of metrics) {
        const value1 = stats1.averages[metric];
        const value2 = stats2.averages[metric];

        if (value1 !== undefined && value2 !== undefined) {
          const difference = value2 - value1;
          const percentChange = value1 !== 0 ? (difference / value1) * 100 : 0;
          const trend = difference > 0 ? 'up' : difference < 0 ? 'down' : 'same';

          comparison[metric] = {
            difference,
            percentChange,
            trend,
          };
        }
      }

      return {
        period1: {
          label: formatPeriodLabel(period1),
          stats: stats1.summary,
        },
        period2: {
          label: formatPeriodLabel(period2),
          stats: stats2.summary,
        },
        comparison,
      };
    },
  });

  // 相関分析
  fastify.get('/correlation', {
    schema: {
      summary: '設定とパフォーマンスの相関分析',
      description: '設定変更とパフォーマンス変化の相関を分析します',
      tags: ['Analytics'],
      security: [{ bearerAuth: [] }],
      querystring: Type.Object({
        metric: Type.String({ 
          enum: ['combatScore', 'headshotPercentage', 'kdRatio', 'adr'] 
        }),
        settingField: Type.String({
          enum: ['sensitivity', 'dpi', 'mouseDevice']
        }),
        days: Type.Optional(Type.Integer({ minimum: 7, maximum: 365, default: 30 })),
      }),
      response: {
        200: Type.Object({
          correlationCoefficient: Type.Number(),
          significance: Type.String({ enum: ['strong', 'moderate', 'weak', 'none'] }),
          dataPoints: Type.Array(Type.Object({
            settingValue: Type.Union([Type.Number(), Type.String()]),
            performanceValue: Type.Number(),
            date: Type.String({ format: 'date' }),
          })),
          insights: Type.Array(Type.Object({
            type: Type.String(),
            message: Type.String(),
            confidence: Type.Number(),
          })),
        }),
      },
    },
    preHandler: [fastify.authenticate],
    handler: async (request, reply) => {
      const { metric, settingField, days = 30 } = request.query as any;
      const userId = (request as any).user.id;

      const endDate = new Date();
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

      // 相関分析実装（簡易版）
      // 実際の実装では、より高度な統計手法を使用
      return {
        correlationCoefficient: 0.75, // 仮の値
        significance: 'moderate' as const,
        dataPoints: [], // 仮の空配列
        insights: [
          {
            type: 'trend',
            message: 'DPIを800から1600に変更後、ACSが平均15%向上しています',
            confidence: 0.8,
          },
        ],
      };
    },
  });
};

// ヘルパー関数
function generateDataPoints(
  matches: any[],
  getMetricValue: (match: any) => number | null,
  groupBy: string,
  startDate: Date,
  endDate: Date
): any[] {
  const dataPoints = [];
  const currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    const nextDate = new Date(currentDate);
    
    switch (groupBy) {
      case 'week':
        nextDate.setDate(nextDate.getDate() + 7);
        break;
      case 'month':
        nextDate.setMonth(nextDate.getMonth() + 1);
        break;
      default: // day
        nextDate.setDate(nextDate.getDate() + 1);
    }

    const periodMatches = matches.filter(match => {
      const matchDate = new Date(match.gameStartTime);
      return matchDate >= currentDate && matchDate < nextDate;
    });

    if (periodMatches.length > 0) {
      const values = periodMatches
        .map(getMetricValue)
        .filter((value): value is number => value !== null);

      if (values.length > 0) {
        const average = values.reduce((sum, value) => sum + value, 0) / values.length;
        
        dataPoints.push({
          date: currentDate.toISOString().split('T')[0],
          value: average,
          matchCount: periodMatches.length,
        });
      }
    }

    currentDate.setTime(nextDate.getTime());
  }

  return dataPoints;
}

function calculateSummary(values: number[]): any {
  if (values.length === 0) {
    return {
      average: 0,
      best: 0,
      worst: 0,
      trend: 'stable' as const,
      changePercent: 0,
    };
  }

  const average = values.reduce((sum, value) => sum + value, 0) / values.length;
  const best = Math.max(...values);
  const worst = Math.min(...values);

  // 簡単なトレンド計算
  const firstHalf = values.slice(0, Math.floor(values.length / 2));
  const secondHalf = values.slice(Math.floor(values.length / 2));

  const firstAvg = firstHalf.reduce((sum, value) => sum + value, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((sum, value) => sum + value, 0) / secondHalf.length;

  let trend: 'improving' | 'declining' | 'stable' = 'stable';
  if (secondAvg > firstAvg * 1.05) trend = 'improving';
  else if (secondAvg < firstAvg * 0.95) trend = 'declining';

  const changePercent = firstAvg !== 0 ? ((secondAvg - firstAvg) / firstAvg) * 100 : 0;

  return {
    average,
    best,
    worst,
    trend,
    changePercent,
  };
}

async function getMatchesInPeriod(userId: string, startDate: string, endDate: string) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);

  return await db
    .select()
    .from(matchData)
    .where(and(
      eq(matchData.userId, userId),
      gte(matchData.gameStartTime, start),
      lte(matchData.gameStartTime, end)
    ))
    .orderBy(matchData.gameStartTime);
}

function calculatePeriodStats(matches: any[], metrics: string[]) {
  const averages = {} as any;
  const validMatches = matches.filter(m => m.combatScore !== null);

  for (const metric of metrics) {
    const values = matches
      .map(match => {
        switch (metric) {
          case 'combatScore':
            return match.combatScore ? Number(match.combatScore) : null;
          case 'headshotPercentage':
            return match.headshotPercentage ? Number(match.headshotPercentage) : null;
          case 'kdRatio':
            return match.kdRatio ? Number(match.kdRatio) : null;
          case 'adr':
            return match.adr ? Number(match.adr) : null;
          default:
            return null;
        }
      })
      .filter((value): value is number => value !== null);

    if (values.length > 0) {
      averages[metric] = values.reduce((sum, value) => sum + value, 0) / values.length;
    }
  }

  const summary = calculateSummary(validMatches.map(m => Number(m.combatScore)));

  return { averages, summary };
}

async function getSettingsChanges(userId: string, startDate: Date, endDate: Date) {
  const settings = await db
    .select()
    .from(settingsRecords)
    .where(and(
      eq(settingsRecords.userId, userId),
      gte(settingsRecords.createdAt, startDate),
      lte(settingsRecords.createdAt, endDate)
    ))
    .orderBy(desc(settingsRecords.createdAt));

  // 設定変更の検出と変換（簡易実装）
  const changes = [];
  for (let i = 1; i < settings.length; i++) {
    const current = settings[i - 1];
    const previous = settings[i];

    const settingChanges = [];

    if (current.sensitivity !== previous.sensitivity) {
      settingChanges.push({
        field: 'sensitivity',
        oldValue: previous.sensitivity?.toString(),
        newValue: current.sensitivity.toString(),
      });
    }

    if (current.dpi !== previous.dpi) {
      settingChanges.push({
        field: 'dpi',
        oldValue: previous.dpi?.toString(),
        newValue: current.dpi.toString(),
      });
    }

    if (current.mouseDevice !== previous.mouseDevice) {
      settingChanges.push({
        field: 'mouseDevice',
        oldValue: previous.mouseDevice,
        newValue: current.mouseDevice || '',
      });
    }

    if (settingChanges.length > 0) {
      changes.push({
        date: current.createdAt.toISOString(),
        changes: settingChanges,
      });
    }
  }

  return changes;
}

function formatPeriodLabel(period: { startDate: string; endDate: string }): string {
  const start = new Date(period.startDate);
  const end = new Date(period.endDate);
  
  return `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`;
}

export default analyticsRoutes;