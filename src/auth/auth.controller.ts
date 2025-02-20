import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Response } from 'express';

@Controller('auth') // ✅ All routes in this controller start with /auth
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('google') // ✅ Handles POST /auth/google
  async googleLogin(@Body('idToken') idToken: string) {
    return this.authService.verifyGoogleToken(idToken);
  }

  @Get('google/callback')
  async googleAuthCallback(@Query('code') code: string, @Res() res: Response) {
    console.log('🔍 Received code:', code); // ✅ Log the received code for debugging
    try {
      if (!code) {
        throw new UnauthorizedException('Missing authorization code');
      }
      const tokens = await this.authService.exchangeCodeForTokens(code);
      return res.json(tokens);
    } catch (error) {
      console.error('❌ Google authentication failed:', error);
      throw new UnauthorizedException('Google authentication failed');
    }
  }

  @Post('refresh')
  refreshToken(@Body('refreshToken') refreshToken: string) {
    try {
      // ✅ Verify refresh token & extract user data
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const decoded = this.authService.validateRefreshToken(refreshToken);
      // ✅ Generate and return a new JWT (without a new refresh token)
      return this.authService.generateTokens(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
        decoded.userId,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
        decoded.email,
        false,
      );
    } catch (error) {
      console.error('❌ Refresh token validation failed:', error);
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}
