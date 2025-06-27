import { Controller, Post, Get, Body, UseGuards, Request, UnauthorizedException, Redirect, Query } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) {}

  @Get('riot/login')
  @Redirect()
  riotLogin() {
    const clientId = this.configService.get<string>('RIOT_CLIENT_ID');
    const redirectUri = `${this.configService.get<string>('FRONTEND_URL')}/auth/callback`;
    const riotAuthUrl = `https://auth.riotgames.com/authorize?redirect_uri=${encodeURIComponent(redirectUri)}&client_id=${clientId}&response_type=code&scope=openid`;
    
    return { url: riotAuthUrl };
  }

  @Post('riot/callback')
  async riotCallback(@Body() body: any) {
    return this.authService.riotAuth(body);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getProfile(@Request() req: any) {
    return req.user;
  }

  @Post('refresh')
  async refreshToken(@Body() body: { refreshToken: string }) {
    return this.authService.refreshToken(body.refreshToken);
  }

  @Post('validate')
  async validateToken(@Body() body: { token: string }) {
    const user = await this.authService.validateToken(body.token);
    return { valid: true, user };
  }

  @Post('logout')
  async logout() {
    return { message: 'Logged out successfully' };
  }
}