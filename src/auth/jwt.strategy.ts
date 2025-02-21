import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    super({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // ✅ Read JWT from Authorization header
      ignoreExpiration: false, // ✅ Reject expired tokens
      secretOrKey: configService.get<string>('JWT_SECRET'), // ✅ Verify with secret key
    });
  }

  /**
   * ✅ Called automatically by Passport when a valid JWT is received
   */
  validate(payload: { userId: number; email: string }) {
    return { userId: payload.userId, email: payload.email }; // ✅ Attach user info to request
  }
}
