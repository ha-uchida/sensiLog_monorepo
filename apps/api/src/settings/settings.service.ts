import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSettingsDto } from './dto/create-settings.dto';
import { UpdateSettingsDto } from './dto/update-settings.dto';

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createSettingsDto: CreateSettingsDto) {
    return this.prisma.settingsRecord.create({
      data: {
        ...createSettingsDto,
        userId,
      },
    });
  }

  async findAll(userId: string) {
    return this.prisma.settingsRecord.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, userId: string) {
    const setting = await this.prisma.settingsRecord.findFirst({
      where: { id, userId },
    });
    
    if (!setting) {
      throw new NotFoundException('Settings record not found');
    }
    
    return setting;
  }

  async update(id: string, userId: string, updateSettingsDto: UpdateSettingsDto) {
    const setting = await this.findOne(id, userId);
    
    return this.prisma.settingsRecord.update({
      where: { id },
      data: updateSettingsDto,
    });
  }

  async remove(id: string, userId: string) {
    const setting = await this.findOne(id, userId);
    
    return this.prisma.settingsRecord.delete({
      where: { id },
    });
  }

  async findLatest(userId: string) {
    return this.prisma.settingsRecord.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getSuggestions() {
    // Get unique values from the database
    const [mice, keyboards, mousepads, tags] = await Promise.all([
      this.prisma.settingsRecord.findMany({
        where: { mouseDevice: { not: null } },
        distinct: ['mouseDevice'],
        select: { mouseDevice: true },
      }),
      this.prisma.settingsRecord.findMany({
        where: { keyboardDevice: { not: null } },
        distinct: ['keyboardDevice'],
        select: { keyboardDevice: true },
      }),
      this.prisma.settingsRecord.findMany({
        where: { mousepad: { not: null } },
        distinct: ['mousepad'],
        select: { mousepad: true },
      }),
      this.prisma.tag.findMany({
        select: { name: true },
      }),
    ]);

    // Common gaming peripherals as defaults
    const defaultMice = [
      'Logitech G Pro X Superlight',
      'Razer Viper Ultimate',
      'Zowie EC2',
      'Finalmouse Starlight-12',
      'SteelSeries Rival 3',
    ];

    const defaultKeyboards = [
      'Wooting 60HE',
      'SteelSeries Apex Pro',
      'Razer Huntsman V2',
      'Logitech G Pro X',
      'Corsair K70',
    ];

    const defaultMousepads = [
      'Artisan Zero',
      'Logitech G640',
      'SteelSeries QcK',
      'Razer Strider',
      'Zowie GSR',
    ];

    return {
      mice: [...new Set([
        ...defaultMice,
        ...mice.map(m => m.mouseDevice).filter(Boolean),
      ])],
      keyboards: [...new Set([
        ...defaultKeyboards,
        ...keyboards.map(k => k.keyboardDevice).filter(Boolean),
      ])],
      mousepads: [...new Set([
        ...defaultMousepads,
        ...mousepads.map(m => m.mousepad).filter(Boolean),
      ])],
      tags: tags.map(t => t.name),
    };
  }
}