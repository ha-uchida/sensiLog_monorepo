import { Controller, Get, Post, Body, UseGuards, Request, Query } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('performance')
  getPerformance(@Request() req: any, @Query() query: any) {
    return this.analyticsService.getPerformanceAnalytics(req.user.userId, query);
  }

  @Post('comparison')
  comparePerformance(@Request() req: any, @Body() body: any) {
    const { period1, period2 } = body;
    return this.analyticsService.comparePerformance(req.user.userId, period1, period2);
  }
}