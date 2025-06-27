import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMatchDataDto } from './dto/create-match-data.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class MatchDataService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createMatchDataDto: CreateMatchDataDto) {
    const { headshotCount, bodyshotCount, legshotCount, kills, deaths, combatScore, roundsPlayed, ...rest } = createMatchDataDto;
    
    const totalShots = headshotCount + bodyshotCount + legshotCount;
    const headshotPercentage = totalShots > 0 ? (headshotCount / totalShots) * 100 : 0;
    const kdRatio = deaths > 0 ? kills / deaths : kills;
    const adr = roundsPlayed > 0 ? combatScore / roundsPlayed : 0;
    
    return this.prisma.matchData.create({
      data: {
        ...rest,
        userId,
        headshotCount,
        bodyshotCount,
        legshotCount,
        kills,
        deaths,
        combatScore,
        roundsPlayed,
        headshotPercentage,
        kdRatio,
        adr,
      },
    });
  }

  async findAll(userId: string, filters?: any) {
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
    
    if (filters?.agentName) {
      where.agentName = filters.agentName;
    }
    
    if (filters?.mapName) {
      where.mapName = filters.mapName;
    }
    
    return this.prisma.matchData.findMany({
      where,
      orderBy: { gameStartTime: 'desc' },
    });
  }

  async findOne(id: string, userId: string) {
    const match = await this.prisma.matchData.findFirst({
      where: { id, userId },
    });
    
    if (!match) {
      throw new NotFoundException('Match data not found');
    }
    
    return match;
  }

  async findByMatchId(matchId: string, userId: string) {
    return this.prisma.matchData.findUnique({
      where: {
        userId_matchId: {
          userId,
          matchId,
        },
      },
    });
  }

  async remove(id: string, userId: string) {
    const match = await this.findOne(id, userId);
    
    return this.prisma.matchData.delete({
      where: { id },
    });
  }

  async getStats(userId: string, filters?: any) {
    const matches = await this.findAll(userId, filters);
    
    if (matches.length === 0) {
      return {
        totalMatches: 0,
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
    
    const stats = matches.reduce((acc, match) => ({
      totalMatches: acc.totalMatches + 1,
      totalKills: acc.totalKills + match.kills,
      totalDeaths: acc.totalDeaths + match.deaths,
      totalAssists: acc.totalAssists + match.assists,
      totalWins: acc.totalWins + (match.teamWon ? 1 : 0),
      totalHeadshotPercentage: acc.totalHeadshotPercentage + (match.headshotPercentage?.toNumber() || 0),
      totalCombatScore: acc.totalCombatScore + (match.combatScore?.toNumber() || 0),
      totalAdr: acc.totalAdr + (match.adr?.toNumber() || 0),
    }), {
      totalMatches: 0,
      totalKills: 0,
      totalDeaths: 0,
      totalAssists: 0,
      totalWins: 0,
      totalHeadshotPercentage: 0,
      totalCombatScore: 0,
      totalAdr: 0,
    });
    
    return {
      totalMatches: stats.totalMatches,
      avgKills: stats.totalKills / stats.totalMatches,
      avgDeaths: stats.totalDeaths / stats.totalMatches,
      avgAssists: stats.totalAssists / stats.totalMatches,
      avgKdRatio: stats.totalDeaths > 0 ? stats.totalKills / stats.totalDeaths : stats.totalKills,
      avgHeadshotPercentage: stats.totalHeadshotPercentage / stats.totalMatches,
      avgCombatScore: stats.totalCombatScore / stats.totalMatches,
      avgAdr: stats.totalAdr / stats.totalMatches,
      winRate: (stats.totalWins / stats.totalMatches) * 100,
    };
  }

  async syncMatchData(userId: string) {
    // This would integrate with Riot API to fetch recent matches
    // For now, we'll return a mock response
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user?.riotPuuid) {
      throw new NotFoundException('Riot account not linked');
    }

    // In a real implementation, this would:
    // 1. Call Riot API to get recent matches
    // 2. Process and store the match data
    // 3. Return sync status

    return {
      message: 'Match data sync initiated',
      status: 'processing',
      estimatedTime: '2-3 minutes',
    };
  }
}