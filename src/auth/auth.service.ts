/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { OAuth2Client } from 'google-auth-library';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import axios from 'axios'; // ✅ Import axios for Google API calls

@Injectable()
export class AuthService {
  private googleClient: OAuth2Client;

  constructor(
    private configService: ConfigService,
    private jwtService: JwtService,
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {
    this.googleClient = new OAuth2Client(
      this.configService.get<string>('GOOGLE_CLIENT_ID'),
      this.configService.get<string>('GOOGLE_CLIENT_SECRET'),
    );
  }

  /**
   * ✅ Exchanges authorization code for Google tokens
   */
  async exchangeCodeForTokens(code: string) {
    try {
      console.log('🔍 Exchanging code for tokens:', code);

      const { tokens } = await this.googleClient.getToken({
        code,
        redirect_uri: this.configService.get<string>('GOOGLE_REDIRECT_URI'),
      });

      console.log('✅ Tokens received:', tokens);
      return tokens; // ✅ Only returning tokens, not handling user logic
    } catch (error: unknown) {
      const err = error as any;
      console.error(
        '❌ Google token exchange failed:',
        err.response?.data || err.message,
      );
      throw new UnauthorizedException('Google authentication failed');
    }
  }

  /**
   * ✅ Fetches user information from Google using access token
   */
  async getUserInfoFromGoogle(accessToken: string) {
    try {
      console.log('🔍 Fetching user info from Google...');
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      const { data: userInfo } = await axios.get(
        'https://www.googleapis.com/oauth2/v2/userinfo',
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        },
      );

      console.log('✅ User Info:', userInfo);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return userInfo;
    } catch (error) {
      console.error('❌ Failed to fetch user info:', error);
      throw new UnauthorizedException('Failed to retrieve user data');
    }
  }

  /**
   * ✅ Finds or creates user in the database & generates JWT tokens
   */
  async authenticateOrCreateUser(userInfo: {
    email: string;
    name: string;
    picture: string;
  }) {
    let user = await this.userRepository.findOne({
      where: { email: userInfo.email },
    });

    if (!user) {
      console.log('🔍 User not found, creating new user...');
      user = this.userRepository.create({
        email: userInfo.email,
        name: userInfo.name,
        profilePicture: userInfo.picture,
        provider: 'google',
      });

      console.log('📝 Attempting to save user:', user); // ✅ Add this log
      try {
        await this.userRepository.save(user);
        console.log('✅ User successfully saved!'); // ✅ Confirm save was successful
      } catch (error) {
        console.error('❌ Error saving user:', error); // ✅ Log if save fails
      }
    }

    // ✅ Generate JWT & Refresh Token
    const jwtTokens = this.generateTokens(user.id, user.email);

    return { user, ...jwtTokens };
  }

  /**
   * ✅ Generates a JWT and refresh token
   */
  generateTokens(userId: number, email: string, refresh = true) {
    const payload = { userId, email };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: '24h',
    });

    if (!refresh) {
      return { accessToken };
    }

    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: '30d',
    });

    return { accessToken, refreshToken };
  }

  /**
   * ✅ Validates the refresh token
   */
  validateRefreshToken(token: string) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return this.jwtService.verify(token);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}
