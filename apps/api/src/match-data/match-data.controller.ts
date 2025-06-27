import { Controller, Get, Post, Body, Param, Delete, UseGuards, Request, Query } from '@nestjs/common';
import { MatchDataService } from './match-data.service';
import { CreateMatchDataDto } from './dto/create-match-data.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('match-data')
@UseGuards(JwtAuthGuard)
export class MatchDataController {
  constructor(private readonly matchDataService: MatchDataService) {}

  @Post()
  create(@Request() req: any, @Body() createMatchDataDto: CreateMatchDataDto) {
    return this.matchDataService.create(req.user.userId, createMatchDataDto);
  }

  @Post('sync')
  sync(@Request() req: any) {
    return this.matchDataService.syncMatchData(req.user.userId);
  }

  @Get()
  findAll(@Request() req: any, @Query() query: any) {
    return this.matchDataService.findAll(req.user.userId, query);
  }

  @Get('stats')
  getStats(@Request() req: any, @Query() query: any) {
    return this.matchDataService.getStats(req.user.userId, query);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: any) {
    return this.matchDataService.findOne(id, req.user.userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: any) {
    return this.matchDataService.remove(id, req.user.userId);
  }
}