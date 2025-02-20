import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { User } from '../entities/user.entity';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt'; // ✅ Import JWT module

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule], // ✅ Ensures ConfigService is available
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'), // ✅ Loads secret key from .env
        signOptions: { expiresIn: '24h' }, // ✅ JWT tokens expire in 24 hours
      }),
      inject: [ConfigService], // ✅ Injects ConfigService for accessing environment variables
    }),
  ],
  controllers: [AuthController], // ✅ Handles HTTP authentication requests
  providers: [AuthService], // ✅ Provides authentication logic
})
export class AuthModule {}
