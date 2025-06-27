import { Module } from '@nestjs/common';
import { MatchDataService } from './match-data.service';
import { MatchDataController } from './match-data.controller';

@Module({
  controllers: [MatchDataController],
  providers: [MatchDataService],
})
export class MatchDataModule {}