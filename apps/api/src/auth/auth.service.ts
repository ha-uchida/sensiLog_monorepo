import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (user && await bcrypt.compare(password, user.accessToken || '')) {
      const { accessToken, refreshToken, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: User) {
    const payload = { email: user.email, sub: user.id, isAdmin: user.isAdmin };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        gameName: user.gameName,
        tagLine: user.tagLine,
        isAdmin: user.isAdmin,
      },
    };
  }

  async riotAuth(riotAuthData: any) {
    const { puuid, gameName, tagLine, accessToken, refreshToken, expiresAt } = riotAuthData;
    
    const riotId = `${gameName}#${tagLine}`;
    
    let user = await this.prisma.user.findUnique({
      where: { riotId },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email: `${gameName.toLowerCase()}@riot.local`,
          riotId,
          gameName,
          tagLine,
          riotPuuid: puuid,
          accessToken,
          refreshToken,
          tokenExpiresAt: new Date(expiresAt),
        },
      });
    } else {
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: {
          accessToken,
          refreshToken,
          tokenExpiresAt: new Date(expiresAt),
          riotPuuid: puuid,
        },
      });
    }

    return this.login(user);
  }

  async validateToken(token: string) {
    try {
      const payload = this.jwtService.verify(token);
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });
      if (!user) {
        throw new UnauthorizedException();
      }
      return user;
    } catch {
      throw new UnauthorizedException();
    }
  }

  async refreshToken(refreshToken: string) {
    try {
      // In a real implementation, you would validate the refresh token
      // For now, we'll decode it and create a new access token
      const payload = this.jwtService.verify(refreshToken, {
        ignoreExpiration: true,
      });
      
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });
      
      if (!user) {
        throw new UnauthorizedException();
      }
      
      return this.login(user);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}