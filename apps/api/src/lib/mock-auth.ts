import crypto from 'crypto';

// モックユーザーデータ
export const MOCK_USERS = [
  {
    puuid: 'mock-puuid-player1',
    email: 'player1@example.com',
    game_name: 'SamplePlayer',
    tag_line: '0001',
    access_token: 'mock-access-token-1',
    refresh_token: 'mock-refresh-token-1',
  },
  {
    puuid: 'mock-puuid-player2', 
    email: 'player2@example.com',
    game_name: 'TestUser',
    tag_line: '0002',
    access_token: 'mock-access-token-2',
    refresh_token: 'mock-refresh-token-2',
  },
  {
    puuid: 'mock-puuid-admin',
    email: 'admin@sensilog.com',
    game_name: 'AdminUser',
    tag_line: '0999',
    access_token: 'mock-access-token-admin',
    refresh_token: 'mock-refresh-token-admin',
    is_admin: true,
  },
];

// モック試合データ生成
export function generateMockMatchData(puuid: string, count = 50) {
  const matches = [];
  const agents = ['Jett', 'Phoenix', 'Sage', 'Sova', 'Brimstone', 'Viper', 'Cypher', 'Reyna'];
  const maps = ['Bind', 'Haven', 'Split', 'Ascent', 'Dust2', 'Breeze', 'Fracture', 'Icebox'];
  const gameModes = ['Competitive', 'Unrated', 'Spike Rush'];

  for (let i = 0; i < count; i++) {
    const gameStartTime = new Date(Date.now() - i * 2 * 60 * 60 * 1000); // 2時間間隔
    const agent = agents[Math.floor(Math.random() * agents.length)];
    const map = maps[Math.floor(Math.random() * maps.length)];
    const gameMode = gameModes[Math.floor(Math.random() * gameModes.length)];
    
    // パフォーマンス値をランダム生成（リアルな範囲）
    const kills = Math.floor(Math.random() * 30) + 5;
    const deaths = Math.floor(Math.random() * 25) + 3;
    const assists = Math.floor(Math.random() * 15) + 2;
    const rounds = Math.floor(Math.random() * 10) + 13; // 13-25ラウンド
    const damageDealt = Math.floor(Math.random() * 4000) + 1500;
    const headshotCount = Math.floor(kills * (Math.random() * 0.4 + 0.1)); // 10-50%
    const bodyshotCount = Math.floor(kills * 0.6);
    const legshotCount = kills - headshotCount - bodyshotCount;

    matches.push({
      matchId: `mock-match-${puuid}-${i}`,
      gameStartTime,
      gameEndTime: new Date(gameStartTime.getTime() + (rounds * 2 * 60 * 1000)), // 平均2分/ラウンド
      mapName: map,
      gameMode,
      agentName: agent,
      kills,
      deaths,
      assists,
      combatScore: Math.floor(damageDealt / rounds * 1.2), // ACS計算
      damageDealt,
      headshotCount,
      bodyshotCount,
      legshotCount,
      kdRatio: deaths > 0 ? Number((kills / deaths).toFixed(2)) : kills,
      adr: Number((damageDealt / rounds).toFixed(1)),
      headshotPercentage: Number(((headshotCount / (headshotCount + bodyshotCount + legshotCount)) * 100).toFixed(1)),
      roundsPlayed: rounds,
      teamWon: Math.random() > 0.5,
      rankTier: gameMode === 'Competitive' ? 'GOLD' : null,
    });
  }

  return matches.sort((a, b) => b.gameStartTime.getTime() - a.gameStartTime.getTime());
}

// モック認証処理
export class MockAuthService {
  // モック認証URL生成
  static generateMockAuthUrl(): { authUrl: string; state: string } {
    const state = crypto.randomBytes(16).toString('hex');
    const authUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/mock?state=${state}`;
    
    return { authUrl, state };
  }

  // モック認証コード検証
  static async verifyMockAuthCode(code: string): Promise<any> {
    // コードからユーザーインデックスを抽出
    const userIndex = parseInt(code.replace('mock-code-', '')) || 0;
    const user = MOCK_USERS[userIndex] || MOCK_USERS[0];

    return {
      access_token: user.access_token,
      refresh_token: user.refresh_token,
      expires_in: 3600,
    };
  }

  // モックユーザー情報取得
  static async getMockUserInfo(accessToken: string): Promise<any> {
    const user = MOCK_USERS.find(u => u.access_token === accessToken);
    
    if (!user) {
      throw new Error('Invalid access token');
    }

    return {
      puuid: user.puuid,
      email: user.email,
      game_name: user.game_name,
      tag_line: user.tag_line,
    };
  }

  // 開発モードかどうかの判定
  static isDevMode(): boolean {
    return process.env.NODE_ENV === 'development' || process.env.ENABLE_MOCK_AUTH === 'true';
  }

  // モック試合データ取得
  static async getMockMatches(puuid: string, params: any = {}): Promise<any[]> {
    const { count = 20, startDate, endDate } = params;
    let matches = generateMockMatchData(puuid, 100);

    // 日付フィルタリング
    if (startDate) {
      matches = matches.filter(m => m.gameStartTime >= new Date(startDate));
    }
    if (endDate) {
      matches = matches.filter(m => m.gameStartTime <= new Date(endDate));
    }

    return matches.slice(0, count);
  }
}