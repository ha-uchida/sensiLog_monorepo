import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { CreateSettingsDto } from './dto/create-settings.dto';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('settings')
@UseGuards(JwtAuthGuard)
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Post()
  create(@Request() req: any, @Body() createSettingsDto: CreateSettingsDto) {
    return this.settingsService.create(req.user.userId, createSettingsDto);
  }

  @Get()
  findAll(@Request() req: any) {
    return this.settingsService.findAll(req.user.userId);
  }

  @Get('latest')
  findLatest(@Request() req: any) {
    return this.settingsService.findLatest(req.user.userId);
  }

  @Get('suggestions')
  getSuggestions() {
    return this.settingsService.getSuggestions();
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: any) {
    return this.settingsService.findOne(id, req.user.userId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Request() req: any, @Body() updateSettingsDto: UpdateSettingsDto) {
    return this.settingsService.update(id, req.user.userId, updateSettingsDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: any) {
    return this.settingsService.remove(id, req.user.userId);
  }
}