import { FastifyInstance } from 'fastify';

// Riot API クライアント
export class RiotAPIClient {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey: string, region: string = 'ap') {
    this.apiKey = apiKey;
    this.baseUrl = `https://${region}.api.riotgames.com`;
  }

  // APIリクエストのヘルパー
  private async makeRequest(endpoint: string): Promise<any> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const response = await fetch(url, {
      headers: {
        'X-Riot-Token': this.apiKey,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Riot API error: ${response.status} - ${error}`);
    }

    return await response.json();
  }

  // プレイヤーのPUUIDを取得（ゲーム名 + タグから）
  async getPlayerPuuid(gameName: string, tagLine: string): Promise<string> {
    const endpoint = `/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`;
    const data = await this.makeRequest(endpoint);
    return data.puuid;
  }

  // 試合履歴を取得
  async getMatchHistory(puuid: string, options: { 
    queue?: string;
    count?: number;
    start?: number;
  } = {}): Promise<string[]> {
    const { queue, count = 10, start = 0 } = options;
    let endpoint = `/val/match/v1/matchlists/by-puuid/${puuid}?start=${start}&count=${count}`;
    
    if (queue) {
      endpoint += `&queue=${queue}`;
    }

    const data = await this.makeRequest(endpoint);
    return data.history.map((match: any) => match.matchId);
  }

  // 特定の試合の詳細データを取得
  async getMatchDetails(matchId: string): Promise<any> {
    const endpoint = `/val/match/v1/matches/${matchId}`;
    return await this.makeRequest(endpoint);
  }

  // プレイヤーの試合データを整形
  transformMatchData(matchDetails: any, targetPuuid: string): any {
    const playerData = matchDetails.players.find((p: any) => p.puuid === targetPuuid);
    
    if (!playerData) {
      throw new Error('Player not found in match data');
    }

    const matchInfo = matchDetails.matchInfo;
    const roundResults = matchDetails.roundResults || [];
    
    // チーム勝利判定
    const playerTeam = playerData.teamId;
    const teamWon = matchDetails.teams?.find((t: any) => t.teamId === playerTeam)?.won || false;

    // ラウンド数計算
    const roundsPlayed = roundResults.length;
    
    // ダメージとADR計算
    const totalDamage = playerData.stats?.totalDamage || 0;
    const adr = roundsPlayed > 0 ? totalDamage / roundsPlayed : 0;

    return {
      matchId: matchDetails.matchInfo.matchId,
      gameStartTime: new Date(matchInfo.gameStartMillis),
      gameEndTime: new Date(matchInfo.gameStartMillis + matchInfo.gameLengthMillis),
      mapName: matchInfo.mapId,
      gameMode: matchInfo.queueId,
      agentName: playerData.characterId,
      kills: playerData.stats?.kills || 0,
      deaths: playerData.stats?.deaths || 0,
      assists: playerData.stats?.assists || 0,
      combatScore: playerData.stats?.score || 0,
      headshotPercentage: this.calculateHeadshotPercentage(playerData.stats),
      kdRatio: (playerData.stats?.deaths || 0) > 0 ? 
        (playerData.stats?.kills || 0) / (playerData.stats?.deaths || 0) : 
        (playerData.stats?.kills || 0),
      adr: Math.round(adr),
      damageDealt: totalDamage,
      roundsPlayed,
      teamWon,
      rankTier: null, // VALORANTではマッチデータにランク情報は含まれない
    };
  }

  // ヘッドショット率計算
  private calculateHeadshotPercentage(stats: any): number {
    if (!stats?.damageEvents) return 0;
    
    const headshots = stats.damageEvents.filter((event: any) => 
      event.bodyshot === false && event.legshot === false
    ).length;
    
    const totalShots = stats.damageEvents.length;
    
    return totalShots > 0 ? Math.round((headshots / totalShots) * 100) : 0;
  }

  // レート制限対応のためのディレイ
  async waitForRateLimit(): Promise<void> {
    // Development API Key: 100 requests every 2 minutes
    // 安全のため1.5秒間隔でリクエスト
    await new Promise(resolve => setTimeout(resolve, 1500));
  }
}

// Riot APIサービス
export class RiotAPIService {
  private client: RiotAPIClient;
  private logger: FastifyInstance['log'];

  constructor(apiKey: string, logger: FastifyInstance['log'], region: string = 'ap') {
    this.client = new RiotAPIClient(apiKey, region);
    this.logger = logger;
  }

  // プレイヤーの最新試合データを同期
  async syncPlayerMatches(puuid: string, count: number = 10): Promise<any[]> {
    try {
      this.logger.info(`Starting match sync for PUUID: ${puuid}`);

      // 試合履歴を取得
      const matchIds = await this.client.getMatchHistory(puuid, { count });
      this.logger.info(`Found ${matchIds.length} matches for player`);

      const matches = [];

      // 各試合の詳細を取得（レート制限を考慮）
      for (const matchId of matchIds) {
        try {
          await this.client.waitForRateLimit();
          
          const matchDetails = await this.client.getMatchDetails(matchId);
          const transformedData = this.client.transformMatchData(matchDetails, puuid);
          
          matches.push(transformedData);
          this.logger.info(`Processed match: ${matchId}`);
          
        } catch (error) {
          this.logger.warn(`Failed to process match ${matchId}:`, error);
          continue;
        }
      }

      this.logger.info(`Successfully synced ${matches.length} matches`);
      return matches;

    } catch (error) {
      this.logger.error('Match sync failed:', error);
      throw error;
    }
  }

  // プレイヤー情報を検索
  async findPlayer(gameName: string, tagLine: string): Promise<{ puuid: string }> {
    try {
      const puuid = await this.client.getPlayerPuuid(gameName, tagLine);
      return { puuid };
    } catch (error) {
      this.logger.error(`Failed to find player ${gameName}#${tagLine}:`, error);
      throw error;
    }
  }
}