import { IsString, IsNumber, IsBoolean, IsDateString, IsOptional, Min, Max } from 'class-validator';

export class CreateMatchDataDto {
  @IsString()
  matchId: string;

  @IsDateString()
  gameStartTime: string;

  @IsDateString()
  gameEndTime: string;

  @IsString()
  mapName: string;

  @IsString()
  gameMode: string;

  @IsOptional()
  @IsString()
  rankTier?: string;

  @IsOptional()
  @IsNumber()
  rr?: number;

  @IsString()
  agentName: string;

  @IsNumber()
  @Min(0)
  kills: number;

  @IsNumber()
  @Min(0)
  deaths: number;

  @IsNumber()
  @Min(0)
  assists: number;

  @IsNumber()
  @Min(0)
  combatScore: number;

  @IsNumber()
  @Min(0)
  damageDealt: number;

  @IsNumber()
  @Min(0)
  headshotCount: number;

  @IsNumber()
  @Min(0)
  bodyshotCount: number;

  @IsNumber()
  @Min(0)
  legshotCount: number;

  @IsNumber()
  @Min(1)
  roundsPlayed: number;

  @IsBoolean()
  teamWon: boolean;
}