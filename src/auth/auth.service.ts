import { Injectable, UnauthorizedException } from '@nestjs/common';
import { OAuth2Client } from 'google-auth-library';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';

@Injectable()
export class AuthService {
  private googleClient: OAuth2Client;

  constructor(
    private configService: ConfigService,
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

      return {
        message: 'User authenticated successfully',
        user,
      };
    } catch (error) {
      console.error('Google authentication error:', error);
      throw new UnauthorizedException('Google authentication failed');
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
