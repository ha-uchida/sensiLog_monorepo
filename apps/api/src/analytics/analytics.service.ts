import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getPerformanceAnalytics(userId: string, filters?: any) {
    const where: Prisma.MatchDataWhereInput = { userId };
    
    if (filters?.startDate || filters?.endDate) {
      where.gameStartTime = {};
      if (filters.startDate) {
        where.gameStartTime.gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        where.gameStartTime.lte = new Date(filters.endDate);
      }
    }

    const matchData = await this.prisma.matchData.findMany({
      where,
      orderBy: { gameStartTime: 'asc' },
    });

    const settingsRecords = await this.prisma.settingsRecord.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
    });

    // Group matches by settings period
    const performanceBySettings = this.groupMatchesBySettings(matchData, settingsRecords);

    // Calculate performance metrics for each settings period
    const analytics = performanceBySettings.map(period => ({
      settingsId: period.settingsId,
      sensitivity: period.sensitivity,
      dpi: period.dpi,
      period: {
        start: period.startDate,
        end: period.endDate,
      },
      matchCount: period.matches.length,
      performance: this.calculatePerformanceMetrics(period.matches),
    }));

    // Overall performance trends
    const trends = this.calculateTrends(matchData);

    return {
      settingsPeriods: analytics,
      overallTrends: trends,
      correlations: this.calculateCorrelations(analytics),
    };
  }

  async comparePerformance(userId: string, period1: any, period2: any) {
    const [data1, data2] = await Promise.all([
      this.getPerformanceData(userId, period1),
      this.getPerformanceData(userId, period2),
    ]);

    const metrics1 = this.calculatePerformanceMetrics(data1.matches);
    const metrics2 = this.calculatePerformanceMetrics(data2.matches);

    return {
      period1: {
        ...period1,
        matchCount: data1.matches.length,
        settings: data1.settings,
        performance: metrics1,
      },
      period2: {
        ...period2,
        matchCount: data2.matches.length,
        settings: data2.settings,
        performance: metrics2,
      },
      comparison: this.compareMetrics(metrics1, metrics2),
    };
  }

  private async getPerformanceData(userId: string, period: any) {
    const matches = await this.prisma.matchData.findMany({
      where: {
        userId,
        gameStartTime: {
          gte: new Date(period.startDate),
          lte: new Date(period.endDate),
        },
      },
    });

    const settings = await this.prisma.settingsRecord.findFirst({
      where: {
        userId,
        createdAt: {
          lte: new Date(period.endDate),
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return { matches, settings };
  }

  private groupMatchesBySettings(matches: any[], settings: any[]) {
    const groups = [];
    
    for (let i = 0; i < settings.length; i++) {
      const currentSettings = settings[i];
      const nextSettings = settings[i + 1];
      
      const periodMatches = matches.filter(match => {
        const matchDate = new Date(match.gameStartTime);
        const settingsDate = new Date(currentSettings.createdAt);
        const nextDate = nextSettings ? new Date(nextSettings.createdAt) : new Date();
        
        return matchDate >= settingsDate && matchDate < nextDate;
      });
      
      if (periodMatches.length > 0) {
        groups.push({
          settingsId: currentSettings.id,
          sensitivity: currentSettings.sensitivity,
          dpi: currentSettings.dpi,
          startDate: currentSettings.createdAt,
          endDate: nextSettings?.createdAt || new Date(),
          matches: periodMatches,
        });
      }
    }
    
    return groups;
  }

  private calculatePerformanceMetrics(matches: any[]) {
    if (matches.length === 0) {
      return {
        avgKills: 0,
        avgDeaths: 0,
        avgAssists: 0,
        avgKdRatio: 0,
        avgHeadshotPercentage: 0,
        avgCombatScore: 0,
        avgAdr: 0,
        winRate: 0,
      };
    }

    const totals = matches.reduce((acc, match) => ({
      kills: acc.kills + match.kills,
      deaths: acc.deaths + match.deaths,
      assists: acc.assists + match.assists,
      wins: acc.wins + (match.teamWon ? 1 : 0),
      headshotPercentage: acc.headshotPercentage + (match.headshotPercentage?.toNumber() || 0),
      combatScore: acc.combatScore + (match.combatScore?.toNumber() || 0),
      adr: acc.adr + (match.adr?.toNumber() || 0),
    }), {
      kills: 0,
      deaths: 0,
      assists: 0,
      wins: 0,
      headshotPercentage: 0,
      combatScore: 0,
      adr: 0,
    });

    const count = matches.length;

    return {
      avgKills: totals.kills / count,
      avgDeaths: totals.deaths / count,
      avgAssists: totals.assists / count,
      avgKdRatio: totals.deaths > 0 ? totals.kills / totals.deaths : totals.kills,
      avgHeadshotPercentage: totals.headshotPercentage / count,
      avgCombatScore: totals.combatScore / count,
      avgAdr: totals.adr / count,
      winRate: (totals.wins / count) * 100,
    };
  }

  private calculateTrends(matches: any[]) {
    if (matches.length < 2) return null;

    const recentMatches = matches.slice(-10);
    const olderMatches = matches.slice(-20, -10);

    const recentMetrics = this.calculatePerformanceMetrics(recentMatches);
    const olderMetrics = this.calculatePerformanceMetrics(olderMatches);

    return {
      kdRatioTrend: ((recentMetrics.avgKdRatio - olderMetrics.avgKdRatio) / olderMetrics.avgKdRatio) * 100,
      headshotTrend: recentMetrics.avgHeadshotPercentage - olderMetrics.avgHeadshotPercentage,
      winRateTrend: recentMetrics.winRate - olderMetrics.winRate,
    };
  }

  private calculateCorrelations(analytics: any[]) {
    if (analytics.length < 2) return null;

    // Simple correlation between sensitivity and performance metrics
    const sensitivities = analytics.map(a => a.sensitivity);
    const kdRatios = analytics.map(a => a.performance.avgKdRatio);
    const headshotPercentages = analytics.map(a => a.performance.avgHeadshotPercentage);

    return {
      sensitivityVsKdRatio: this.pearsonCorrelation(sensitivities, kdRatios),
      sensitivityVsHeadshot: this.pearsonCorrelation(sensitivities, headshotPercentages),
    };
  }

  private pearsonCorrelation(x: number[], y: number[]): number {
    const n = x.length;
    if (n !== y.length || n === 0) return 0;

    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((total, xi, i) => total + xi * y[i], 0);
    const sumX2 = x.reduce((total, xi) => total + xi * xi, 0);
    const sumY2 = y.reduce((total, yi) => total + yi * yi, 0);

    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

    return denominator === 0 ? 0 : numerator / denominator;
  }

  private compareMetrics(metrics1: any, metrics2: any) {
    return {
      kdRatioDiff: ((metrics2.avgKdRatio - metrics1.avgKdRatio) / metrics1.avgKdRatio) * 100,
      headshotDiff: metrics2.avgHeadshotPercentage - metrics1.avgHeadshotPercentage,
      winRateDiff: metrics2.winRate - metrics1.winRate,
      combatScoreDiff: ((metrics2.avgCombatScore - metrics1.avgCombatScore) / metrics1.avgCombatScore) * 100,
      adrDiff: ((metrics2.avgAdr - metrics1.avgAdr) / metrics1.avgAdr) * 100,
    };
  }
}