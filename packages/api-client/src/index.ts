export * from "./api/analytics/analytics";
export * from "./api/authentication/authentication";
export * from "./api/match-data/match-data";
export * from "./api/riot/riot";
export * from "./api/settings/settings";

// スキーマ型エクスポート
// export * from "./schemas";

// Mutator とユーティリティエクスポート
export { customInstance, apiUtils } from "./mutator";

// 一般的に使用される型の再エクスポート
// export type {
//   User,
//   SettingsRecord,
//   CreateSettingsRecord,
//   UpdateSettingsRecord,
//   MatchData,
//   Tag,
//   AnalyticsDataPoint,
//   PerformanceSummary,
//   ComparisonResult,
// } from './schemas';

// React Query関連の型
export type {
  UseQueryOptions,
  UseMutationOptions,
  UseInfiniteQueryOptions,
} from "@tanstack/react-query";
