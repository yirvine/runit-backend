import { Injectable, UnauthorizedException } from '@nestjs/common';
import { OAuth2Client } from 'google-auth-library';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { JwtService } from '@nestjs/jwt'; // ✅ Import JWT service

@Injectable()
export class AuthService {
  private googleClient: OAuth2Client;

  constructor(
    private configService: ConfigService,
    private jwtService: JwtService, // ✅ Inject JWT service
    @InjectRepository(User) private userRepository: Repository<User>, // ✅ Inject User repository
  ) {
    this.googleClient = new OAuth2Client(
      this.configService.get<string>('GOOGLE_CLIENT_ID'),
      this.configService.get<string>('GOOGLE_CLIENT_SECRET'),
    );
  }

  /**
   * ✅ Verifies Google ID token and either fetches or creates a user
   * @param idToken - The Google ID token from the frontend
   * @returns The user object (existing or newly created)
   */
  async verifyGoogleToken(idToken: string) {
    try {
      // ✅ Verify Google token
      const ticket = await this.googleClient.verifyIdToken({
        idToken,
        audience: this.configService.get<string>('GOOGLE_CLIENT_ID'),
      });

      // ✅ Extract user data from token
      const payload = ticket.getPayload();
      if (!payload) {
        throw new UnauthorizedException('Invalid Google token');
      }

      // ✅ Check if user already exists in database
      let user = await this.userRepository.findOne({
        where: { email: payload.email },
      });

      if (!user) {
        // ✅ If user doesn't exist, create a new record
        user = this.userRepository.create({
          email: payload.email,
          name: payload.name,
          profilePicture: payload.picture,
          provider: 'google',
        });

        await this.userRepository.save(user); // ✅ Save new user to database
      }

      // ✅ Generate JWT & Refresh Token
      const tokens = this.generateTokens(user.id, user.email);

      return {
        message: 'User authenticated successfully',
        user,
        ...tokens, // ✅ Return JWT & refresh token
      };
    } catch (error) {
      console.error('Google authentication error:', error);
      throw new UnauthorizedException('Google authentication failed');
    }
  }

  /**
   * ✅ Generates a JWT and refresh token
   * @param userId - The user ID
   * @param email - The user email
   * @returns An object with accessToken and refreshToken
   */
  generateTokens(userId: number, email: string, refresh = true) {
    const payload = { userId, email };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: '24h', // ✅ Short-lived JWT
    });

    if (!refresh) {
      return { accessToken }; // ✅ Only return JWT if refreshing
    }
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: '30d', // ✅ Long-lived refresh token
    });
    return { accessToken, refreshToken };
  }

  /**
   * ✅ Validates the refresh token & returns the decoded payload
   */
  validateRefreshToken(token: string) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return this.jwtService.verify(token); // ✅ Decode & verify refresh token
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async exchangeCodeForTokens(code: string) {
    try {
      console.log('🔍 Exchanging code for tokens:', code);

      const { tokens } = await this.googleClient.getToken({
        code,
        redirect_uri: this.configService.get<string>('GOOGLE_REDIRECT_URI'), // ✅ Add this line
      });

      console.log('✅ Tokens received:', tokens);
      return tokens;
    } catch (error: unknown) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const err = error as any;
      console.error(
        '❌ Google token exchange failed:',
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        err.response?.data || err.message,
      );
      throw new UnauthorizedException('Google authentication failed');
    }
  }
}
