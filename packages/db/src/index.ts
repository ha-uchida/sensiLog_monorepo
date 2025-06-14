import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from './schema';

// 環境変数チェック
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is required');
}

// PostgreSQL接続設定
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

// Drizzle ORM インスタンス
export const db = drizzle(pool, { 
  schema,
  logger: process.env.NODE_ENV === 'development'
});

// スキーマエクスポート
export * from './schema';

// 型エクスポート
export type User = typeof schema.users.$inferSelect;
export type NewUser = typeof schema.users.$inferInsert;

export type SettingsRecord = typeof schema.settingsRecords.$inferSelect;
export type NewSettingsRecord = typeof schema.settingsRecords.$inferInsert;

export type MatchData = typeof schema.matchData.$inferSelect;
export type NewMatchData = typeof schema.matchData.$inferInsert;

export type Tag = typeof schema.tags.$inferSelect;
export type NewTag = typeof schema.tags.$inferInsert;

export type Team = typeof schema.teams.$inferSelect;
export type NewTeam = typeof schema.teams.$inferInsert;

export type TeamMember = typeof schema.teamMembers.$inferSelect;
export type NewTeamMember = typeof schema.teamMembers.$inferInsert;

export type AdminAction = typeof schema.adminActions.$inferSelect;
export type NewAdminAction = typeof schema.adminActions.$inferInsert;

// ユーティリティ型
export type UserWithProfile = User & {
  settingsRecords?: SettingsRecord[];
  matchData?: MatchData[];
};

export type SettingsRecordWithTags = SettingsRecord & {
  settingsRecordTags?: Array<{
    tag: Tag;
  }>;
};

export type MatchDataWithUser = MatchData & {
  user: Pick<User, 'gameName' | 'tagLine'>;
};

export type TeamWithMembers = Team & {
  teamMembers: Array<TeamMember & {
    user: Pick<User, 'id' | 'gameName' | 'tagLine' | 'email'>;
  }>;
};