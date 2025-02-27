import { Controller, Post, Body, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * ✅ Verify Firebase ID Token (Login Route)
   */
  @Post('login')
  async login(@Body('idToken') idToken: string) {
    try {
      console.log('🔍 Received ID Token:', idToken); // Debugging

      if (!idToken) {
        throw new UnauthorizedException('ID Token is required');
      }

      // ✅ Verify token with Firebase
      const firebaseUser = await this.authService.verifyFirebaseToken(idToken);

      return {
        success: true,
        message: 'User authenticated successfully',
        user: firebaseUser,
      };
    } catch (error) {
      console.error('❌ Firebase Authentication failed:', error);
      throw new UnauthorizedException('Invalid Firebase ID Token');
    }
  }
}
