import { 
  pgTable, 
  uuid, 
  varchar, 
  integer, 
  decimal, 
  timestamp, 
  text, 
  jsonb,
  boolean,
  serial
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ユーザーテーブル
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  riotPuuid: varchar('riot_puuid', { length: 78 }).unique(),
  gameName: varchar('game_name', { length: 16 }),
  tagLine: varchar('tag_line', { length: 5 }),
  accessToken: text('access_token'), // 暗号化して保存
  refreshToken: text('refresh_token'), // 暗号化して保存
  tokenExpiresAt: timestamp('token_expires_at'),
  isAdmin: boolean('is_admin').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 設定記録テーブル
export const settingsRecords = pgTable('settings_records', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  sensitivity: decimal('sensitivity', { precision: 10, scale: 4 }).notNull(),
  dpi: integer('dpi').notNull(),
  mouseDevice: varchar('mouse_device', { length: 100 }),
  keyboardDevice: varchar('keyboard_device', { length: 100 }),
  mousepad: varchar('mousepad', { length: 100 }),
  tags: jsonb('tags').$type<string[]>().default([]),
  comment: text('comment'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 試合データテーブル
export const matchData = pgTable('match_data', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  matchId: varchar('match_id', { length: 50 }).notNull().unique(),
  gameStartTime: timestamp('game_start_time').notNull(),
  gameEndTime: timestamp('game_end_time'),
  mapName: varchar('map_name', { length: 50 }),
  gameMode: varchar('game_mode', { length: 30 }),
  agentName: varchar('agent_name', { length: 30 }),
  
  // パフォーマンス統計
  kills: integer('kills'),
  deaths: integer('deaths'),
  assists: integer('assists'),
  combatScore: decimal('combat_score', { precision: 8, scale: 2 }),
  damageDealt: integer('damage_dealt'),
  headshotCount: integer('headshot_count'),
  bodyshotCount: integer('bodyshot_count'),
  legshotCount: integer('legshot_count'),
  
  // 計算済み指標
  kdRatio: decimal('kd_ratio', { precision: 5, scale: 2 }),
  adr: decimal('adr', { precision: 6, scale: 2 }), // Average Damage per Round
  headshotPercentage: decimal('headshot_percentage', { precision: 5, scale: 2 }),
  
  // 追加データ
  roundsPlayed: integer('rounds_played'),
  teamWon: boolean('team_won'),
  rankTier: varchar('rank_tier', { length: 20 }),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// タグテーブル
export const tags = pgTable('tags', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 50 }).notNull().unique(),
  color: varchar('color', { length: 7 }).default('#007bff').notNull(), // Hex color
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 設定記録とタグの中間テーブル
export const settingsRecordTags = pgTable('settings_record_tags', {
  settingsRecordId: uuid('settings_record_id').references(() => settingsRecords.id, { onDelete: 'cascade' }).notNull(),
  tagId: integer('tag_id').references(() => tags.id, { onDelete: 'cascade' }).notNull(),
});

// チームテーブル（管理者機能用）
export const teams = pgTable('teams', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// チームメンバーテーブル
export const teamMembers = pgTable('team_members', {
  teamId: integer('team_id').references(() => teams.id, { onDelete: 'cascade' }).notNull(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  role: varchar('role', { length: 20 }).default('member').notNull(), // 'admin', 'coach', 'member'
  joinedAt: timestamp('joined_at').defaultNow().notNull(),
});

// 管理者操作ログテーブル
export const adminActions = pgTable('admin_actions', {
  id: uuid('id').primaryKey().defaultRandom(),
  adminUserId: uuid('admin_user_id').references(() => users.id).notNull(),
  targetUserId: uuid('target_user_id').references(() => users.id),
  actionType: varchar('action_type', { length: 50 }).notNull(), // 'create_record', 'update_record', 'delete_record'
  resourceType: varchar('resource_type', { length: 50 }), // 'settings_record', 'match_data'
  resourceId: uuid('resource_id'),
  details: jsonb('details'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// リレーション定義
export const usersRelations = relations(users, ({ many }) => ({
  settingsRecords: many(settingsRecords),
  matchData: many(matchData),
  teamMemberships: many(teamMembers),
  adminActions: many(adminActions, { relationName: 'adminActions' }),
  targetedActions: many(adminActions, { relationName: 'targetedActions' }),
}));

export const settingsRecordsRelations = relations(settingsRecords, ({ one, many }) => ({
  user: one(users, {
    fields: [settingsRecords.userId],
    references: [users.id],
  }),
  settingsRecordTags: many(settingsRecordTags),
}));

export const matchDataRelations = relations(matchData, ({ one }) => ({
  user: one(users, {
    fields: [matchData.userId],
    references: [users.id],
  }),
}));

export const tagsRelations = relations(tags, ({ many }) => ({
  settingsRecordTags: many(settingsRecordTags),
}));

export const settingsRecordTagsRelations = relations(settingsRecordTags, ({ one }) => ({
  settingsRecord: one(settingsRecords, {
    fields: [settingsRecordTags.settingsRecordId],
    references: [settingsRecords.id],
  }),
  tag: one(tags, {
    fields: [settingsRecordTags.tagId],
    references: [tags.id],
  }),
}));

export const teamsRelations = relations(teams, ({ many }) => ({
  teamMembers: many(teamMembers),
}));

export const teamMembersRelations = relations(teamMembers, ({ one }) => ({
  team: one(teams, {
    fields: [teamMembers.teamId],
    references: [teams.id],
  }),
  user: one(users, {
    fields: [teamMembers.userId],
    references: [users.id],
  }),
}));

export const adminActionsRelations = relations(adminActions, ({ one }) => ({
  adminUser: one(users, {
    fields: [adminActions.adminUserId],
    references: [users.id],
    relationName: 'adminActions',
  }),
  targetUser: one(users, {
    fields: [adminActions.targetUserId],
    references: [users.id],
    relationName: 'targetedActions',
  }),
}));