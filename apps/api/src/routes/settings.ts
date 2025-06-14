import { FastifyPluginAsync } from 'fastify';
import { Type } from '@sinclair/typebox';
import { db, settingsRecords, NewSettingsRecord } from '@sensilog/db';
import { eq, desc, and, gte, lte, arrayContains } from 'drizzle-orm';

const settingsRoutes: FastifyPluginAsync = async (fastify) => {
  // 設定記録スキーマ定義
  const SettingsRecordSchema = Type.Object({
    id: Type.String({ format: 'uuid' }),
    userId: Type.String({ format: 'uuid' }),
    sensitivity: Type.Number({ minimum: 0, maximum: 10 }),
    dpi: Type.Integer({ minimum: 100, maximum: 10000 }),
    mouseDevice: Type.Optional(Type.String({ maxLength: 100 })),
    keyboardDevice: Type.Optional(Type.String({ maxLength: 100 })),
    mousepad: Type.Optional(Type.String({ maxLength: 100 })),
    tags: Type.Array(Type.String()),
    comment: Type.Optional(Type.String({ maxLength: 500 })),
    createdAt: Type.String({ format: 'date-time' }),
    updatedAt: Type.String({ format: 'date-time' }),
  });

  const CreateSettingsRecordSchema = Type.Object({
    sensitivity: Type.Number({ minimum: 0, maximum: 10 }),
    dpi: Type.Integer({ minimum: 100, maximum: 10000 }),
    mouseDevice: Type.Optional(Type.String({ maxLength: 100 })),
    keyboardDevice: Type.Optional(Type.String({ maxLength: 100 })),
    mousepad: Type.Optional(Type.String({ maxLength: 100 })),
    tags: Type.Optional(Type.Array(Type.String())),
    comment: Type.Optional(Type.String({ maxLength: 500 })),
  });

  const UpdateSettingsRecordSchema = Type.Partial(CreateSettingsRecordSchema);

  // 設定記録一覧取得
  fastify.get('/records', {
    schema: {
      summary: '設定記録一覧取得',
      description: 'ユーザーの設定記録一覧を取得します',
      tags: ['Settings'],
      security: [{ bearerAuth: [] }],
      querystring: Type.Object({
        limit: Type.Optional(Type.Integer({ minimum: 1, maximum: 100, default: 20 })),
        offset: Type.Optional(Type.Integer({ minimum: 0, default: 0 })),
        tags: Type.Optional(Type.Array(Type.String())),
        startDate: Type.Optional(Type.String({ format: 'date' })),
        endDate: Type.Optional(Type.String({ format: 'date' })),
      }),
      response: {
        200: Type.Object({
          records: Type.Array(SettingsRecordSchema),
          total: Type.Integer(),
          hasMore: Type.Boolean(),
        }),
      },
    },
    preHandler: [fastify.authenticate],
    handler: async (request, reply) => {
      const { limit = 20, offset = 0, tags, startDate, endDate } = request.query as any;
      const userId = (request as any).user.id;

      // フィルター条件構築
      const conditions = [eq(settingsRecords.userId, userId)];
      
      if (startDate) {
        conditions.push(gte(settingsRecords.createdAt, new Date(startDate)));
      }
      
      if (endDate) {
        const endDateTime = new Date(endDate);
        endDateTime.setHours(23, 59, 59, 999); // 日付の最後の時間
        conditions.push(lte(settingsRecords.createdAt, endDateTime));
      }

      // タグフィルタリング（将来的にJOINで実装）
      // if (tags && tags.length > 0) {
      //   conditions.push(arrayContains(settingsRecords.tags, tags));
      // }

      // データ取得
      const records = await db
        .select()
        .from(settingsRecords)
        .where(and(...conditions))
        .orderBy(desc(settingsRecords.createdAt))
        .limit(limit)
        .offset(offset);

      // 総数取得
      const totalResult = await db
        .select({ count: settingsRecords.id })
        .from(settingsRecords)
        .where(and(...conditions));

      const total = totalResult.length;

      return {
        records: records.map(record => ({
          ...record,
          tags: record.tags || [],
          sensitivity: Number(record.sensitivity),
          createdAt: record.createdAt.toISOString(),
          updatedAt: record.updatedAt.toISOString(),
        })),
        total,
        hasMore: offset + limit < total,
      };
    },
  });

  // 設定記録作成
  fastify.post('/records', {
    schema: {
      summary: '設定記録作成',
      description: '新しい設定記録を作成します',
      tags: ['Settings'],
      security: [{ bearerAuth: [] }],
      body: CreateSettingsRecordSchema,
      response: {
        201: SettingsRecordSchema,
      },
    },
    preHandler: [fastify.authenticate],
    handler: async (request, reply) => {
      const userId = (request as any).user.id;
      const recordData = request.body as any;

      const newRecord: NewSettingsRecord = {
        ...recordData,
        userId,
        tags: recordData.tags || [],
      };

      const [createdRecord] = await db
        .insert(settingsRecords)
        .values(newRecord)
        .returning();

      reply.code(201).send({
        ...createdRecord,
        tags: createdRecord.tags || [],
        sensitivity: Number(createdRecord.sensitivity),
        createdAt: createdRecord.createdAt.toISOString(),
        updatedAt: createdRecord.updatedAt.toISOString(),
      });
    },
  });

  // 設定記録詳細取得
  fastify.get('/records/:id', {
    schema: {
      summary: '設定記録詳細取得',
      description: '指定された設定記録の詳細を取得します',
      tags: ['Settings'],
      security: [{ bearerAuth: [] }],
      params: Type.Object({
        id: Type.String({ format: 'uuid' }),
      }),
      response: {
        200: SettingsRecordSchema,
        404: Type.Object({
          error: Type.String(),
          code: Type.String(),
        }),
      },
    },
    preHandler: [fastify.authenticate],
    handler: async (request, reply) => {
      const { id } = request.params as any;
      const userId = (request as any).user.id;

      const [record] = await db
        .select()
        .from(settingsRecords)
        .where(and(
          eq(settingsRecords.id, id),
          eq(settingsRecords.userId, userId)
        ))
        .limit(1);

      if (!record) {
        return reply.code(404).send({
          error: 'Settings record not found',
          code: 'RECORD_NOT_FOUND',
        });
      }

      return {
        ...record,
        tags: record.tags || [],
        sensitivity: Number(record.sensitivity),
        createdAt: record.createdAt.toISOString(),
        updatedAt: record.updatedAt.toISOString(),
      };
    },
  });

  // 設定記録更新
  fastify.put('/records/:id', {
    schema: {
      summary: '設定記録更新',
      description: '指定された設定記録を更新します',
      tags: ['Settings'],
      security: [{ bearerAuth: [] }],
      params: Type.Object({
        id: Type.String({ format: 'uuid' }),
      }),
      body: UpdateSettingsRecordSchema,
      response: {
        200: SettingsRecordSchema,
        404: Type.Object({
          error: Type.String(),
          code: Type.String(),
        }),
      },
    },
    preHandler: [fastify.authenticate],
    handler: async (request, reply) => {
      const { id } = request.params as any;
      const userId = (request as any).user.id;
      const updateData = request.body as any;

      // 存在確認
      const [existingRecord] = await db
        .select()
        .from(settingsRecords)
        .where(and(
          eq(settingsRecords.id, id),
          eq(settingsRecords.userId, userId)
        ))
        .limit(1);

      if (!existingRecord) {
        return reply.code(404).send({
          error: 'Settings record not found',
          code: 'RECORD_NOT_FOUND',
        });
      }

      // 更新
      const [updatedRecord] = await db
        .update(settingsRecords)
        .set({
          ...updateData,
          updatedAt: new Date(),
        })
        .where(eq(settingsRecords.id, id))
        .returning();

      return {
        ...updatedRecord,
        tags: updatedRecord.tags || [],
        sensitivity: Number(updatedRecord.sensitivity),
        createdAt: updatedRecord.createdAt.toISOString(),
        updatedAt: updatedRecord.updatedAt.toISOString(),
      };
    },
  });

  // 設定記録削除
  fastify.delete('/records/:id', {
    schema: {
      summary: '設定記録削除',
      description: '指定された設定記録を削除します',
      tags: ['Settings'],
      security: [{ bearerAuth: [] }],
      params: Type.Object({
        id: Type.String({ format: 'uuid' }),
      }),
      response: {
        204: Type.Null(),
        404: Type.Object({
          error: Type.String(),
          code: Type.String(),
        }),
      },
    },
    preHandler: [fastify.authenticate],
    handler: async (request, reply) => {
      const { id } = request.params as any;
      const userId = (request as any).user.id;

      const deletedRecords = await db
        .delete(settingsRecords)
        .where(and(
          eq(settingsRecords.id, id),
          eq(settingsRecords.userId, userId)
        ))
        .returning({ id: settingsRecords.id });

      if (deletedRecords.length === 0) {
        return reply.code(404).send({
          error: 'Settings record not found',
          code: 'RECORD_NOT_FOUND',
        });
      }

      reply.code(204).send();
    },
  });

  // サジェスト取得
  fastify.get('/suggestions', {
    schema: {
      summary: '設定入力サジェスト取得',
      description: 'デバイス名などの入力サジェストを取得します',
      tags: ['Settings'],
      security: [{ bearerAuth: [] }],
      response: {
        200: Type.Object({
          mice: Type.Array(Type.String()),
          keyboards: Type.Array(Type.String()),
          mousepads: Type.Array(Type.String()),
        }),
      },
    },
    preHandler: [fastify.authenticate],
    handler: async (request) => {
      // 一般的なゲーミングデバイスのサジェスト
      // 将来的にはユーザーの過去の入力履歴から生成
      return {
        mice: [
          'Logitech G Pro X Superlight',
          'Razer DeathAdder V3',
          'SteelSeries Rival 600',
          'Corsair M65 RGB Elite',
          'Zowie EC2',
          'Glorious Model O',
          'HyperX Pulsefire Haste',
        ],
        keyboards: [
          'Logitech G Pro X',
          'Razer Huntsman Elite',
          'SteelSeries Apex Pro',
          'Corsair K70 RGB',
          'Ducky One 2 Mini',
          'HyperX Alloy FPS Pro',
          'Keychron K6',
        ],
        mousepads: [
          'SteelSeries QcK+',
          'Razer Goliathus Extended',
          'Corsair MM300',
          'HyperX Fury S',
          'Zowie G-SR',
          'Glorious 3XL',
          'Artisan Hayate Otsu',
        ],
      };
    },
  });
};

export default settingsRoutes;