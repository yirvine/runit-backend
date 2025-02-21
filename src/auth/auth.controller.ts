/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Controller,
  Post,
  Get,
  Query,
  Res,
  Body,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * ✅ Step 1: Exchange Google Authorization Code for Tokens
   * @param code - The Google authorization code
   */
  @Get('google/callback')
  async googleAuthCallback(@Query('code') code: string, @Res() res: Response) {
    try {
      console.log('🔍 Received code:', code);

      // ✅ Step 1: Exchange code for Google tokens
      const tokens = await this.authService.exchangeCodeForTokens(code);

      if (!tokens.access_token) {
        throw new UnauthorizedException('No access token received from Google');
      }

      // ✅ Step 2: Fetch user info from Google using access token
      const userInfo = await this.authService.getUserInfoFromGoogle(
        tokens.access_token,
      );

      // ✅ Step 3: Authenticate or create user & generate app JWT tokens
      const authResponse =
        await this.authService.authenticateOrCreateUser(userInfo);

      return res.json(authResponse); // ✅ Return user + JWT tokens to frontend
    } catch (error) {
      console.error('❌ Google authentication failed:', error);
      throw new UnauthorizedException('Google authentication failed');
    }
  }

  /**
   * ✅ Step 4: Refresh Access Token using Refresh Token
   * @param refreshToken - The refresh token provided by client
   */
  @Post('refresh-token')
  refreshAccessToken(@Body('refreshToken') refreshToken: string) {
    try {
      console.log('🔄 Refreshing access token...');

      // ✅ Validate & decode refresh token
      const decoded = this.authService.validateRefreshToken(refreshToken);

      // ✅ Generate a new access token (DO NOT generate new refresh token)
      const newAccessToken = this.authService.generateTokens(
        decoded.userId,
        decoded.email,
        false,
      );

      return { accessToken: newAccessToken.accessToken };
    } catch (error) {
      console.error('❌ Refresh token failed:', error);
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}
