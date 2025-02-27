import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { User } from '../entities/user.entity';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt'; // ✅ Import JWT module
import { JwtStrategy } from './jwt.strategy'; // ✅ Import JWT Strategy
import { PassportModule } from '@nestjs/passport';
import { UserController } from '../user/user.controller'; // ✅ Import UserController
import { FirebaseAdminService } from '../firebase-admin.service'; // ✅ Import FirebaseAdminService

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    ConfigModule,
    PassportModule, // ✅ Enables authentication handling

    JwtModule.registerAsync({
      imports: [ConfigModule], // ✅ Ensures ConfigService is available
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'), // ✅ Loads secret key from .env
        signOptions: { expiresIn: '24h' }, // ✅ JWT tokens expire in 24 hours
      }),
      inject: [ConfigService], // ✅ Injects ConfigService for accessing environment variables
    }),
  ],
  controllers: [AuthController, UserController], // ✅ Handles HTTP authentication requests
  providers: [AuthService, JwtStrategy, FirebaseAdminService], // ✅ Provides authentication logic
})
export class AuthModule {}
