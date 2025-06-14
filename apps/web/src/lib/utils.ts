import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Tailwind CSSクラスをマージするユーティリティ
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * 数値をフォーマットする
 */
export function formatNumber(
  value: number,
  options?: {
    decimals?: number;
    suffix?: string;
    prefix?: string;
  }
): string {
  const { decimals = 0, suffix = '', prefix = '' } = options || {};
  
  const formatted = value.toFixed(decimals);
  return `${prefix}${formatted}${suffix}`;
}

/**
 * パーセンテージをフォーマットする
 */
export function formatPercentage(value: number, decimals = 1): string {
  return formatNumber(value, { decimals, suffix: '%' });
}

/**
 * K/D比をフォーマットする
 */
export function formatKD(kills: number, deaths: number): string {
  if (deaths === 0) {
    return kills > 0 ? '∞' : '0.00';
  }
  return formatNumber(kills / deaths, { decimals: 2 });
}

/**
 * 日付をフォーマットする
 */
export function formatDate(
  date: Date | string,
  options?: {
    format?: 'short' | 'medium' | 'long' | 'relative';
    includeTime?: boolean;
  }
): string {
  const { format = 'medium', includeTime = false } = options || {};
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  if (format === 'relative') {
    return formatRelativeTime(dateObj);
  }

  const dateOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: format === 'short' ? 'short' : 'long',
    day: 'numeric',
  };

  if (includeTime) {
    dateOptions.hour = '2-digit';
    dateOptions.minute = '2-digit';
  }

  return dateObj.toLocaleDateString('ja-JP', dateOptions);
}

/**
 * 相対時間をフォーマットする
 */
export function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'たった今';
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes}分前`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours}時間前`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays}日前`;
  }

  return formatDate(date, { format: 'medium' });
}

/**
 * 試合時間をフォーマットする
 */
export function formatMatchDuration(
  startTime: Date | string,
  endTime?: Date | string
): string {
  const start = typeof startTime === 'string' ? new Date(startTime) : startTime;
  const end = endTime 
    ? (typeof endTime === 'string' ? new Date(endTime) : endTime)
    : new Date();

  const durationInMinutes = Math.floor((end.getTime() - start.getTime()) / (1000 * 60));
  
  if (durationInMinutes < 60) {
    return `${durationInMinutes}分`;
  }

  const hours = Math.floor(durationInMinutes / 60);
  const minutes = durationInMinutes % 60;
  
  return `${hours}時間${minutes}分`;
}

/**
 * ランクティアを日本語に変換
 */
export function formatRankTier(rankTier: string): string {
  const rankMap: Record<string, string> = {
    'IRON': 'アイアン',
    'BRONZE': 'ブロンズ',
    'SILVER': 'シルバー',
    'GOLD': 'ゴールド',
    'PLATINUM': 'プラチナ',
    'DIAMOND': 'ダイヤモンド',
    'ASCENDANT': 'アセンダント',
    'IMMORTAL': 'イモータル',
    'RADIANT': 'レディアント',
  };

  return rankMap[rankTier.toUpperCase()] || rankTier;
}

/**
 * ゲームモードを日本語に変換
 */
export function formatGameMode(gameMode: string): string {
  const modeMap: Record<string, string> = {
    'COMPETITIVE': 'コンペティティブ',
    'UNRATED': 'アンレート',
    'DEATHMATCH': 'デスマッチ',
    'SPIKE_RUSH': 'スパイクラッシュ',
    'ESCALATION': 'エスカレーション',
    'TEAM_DEATHMATCH': 'チームデスマッチ',
    'SWIFTPLAY': 'スイフトプレイ',
  };

  return modeMap[gameMode.toUpperCase()] || gameMode;
}

/**
 * エラーメッセージを日本語に変換
 */
export function formatErrorMessage(error: any): string {
  if (typeof error === 'string') {
    return error;
  }

  if (error?.response?.data?.error) {
    return error.response.data.error;
  }

  if (error?.message) {
    return error.message;
  }

  return '予期しないエラーが発生しました';
}

/**
 * 値が改善されたかどうかを判定（高い方が良い場合）
 */
export function isImprovement(
  currentValue: number,
  previousValue: number,
  higherIsBetter = true
): 'improvement' | 'decline' | 'same' {
  if (currentValue === previousValue) {
    return 'same';
  }

  const isHigher = currentValue > previousValue;
  
  if (higherIsBetter) {
    return isHigher ? 'improvement' : 'decline';
  } else {
    return isHigher ? 'decline' : 'improvement';
  }
}

/**
 * 変化率を計算
 */
export function calculateChangePercentage(
  currentValue: number,
  previousValue: number
): number {
  if (previousValue === 0) {
    return currentValue > 0 ? 100 : 0;
  }

  return ((currentValue - previousValue) / previousValue) * 100;
}

/**
 * 配列をチャンクに分割
 */
export function chunk<T>(array: T[], size: number): T[][] {
  return Array.from({ length: Math.ceil(array.length / size) }, (_, i) =>
    array.slice(i * size, i * size + size)
  );
}

/**
 * 配列の重複を除去
 */
export function unique<T>(array: T[]): T[] {
  return Array.from(new Set(array));
}

/**
 * オブジェクトから空の値を除去
 */
export function removeEmptyValues<T extends Record<string, any>>(obj: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([_, value]) => 
      value !== null && value !== undefined && value !== ''
    )
  ) as Partial<T>;
}