import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { User } from '../entities/user.entity';
import { ConfigModule } from '@nestjs/config';
@Module({
  imports: [TypeOrmModule.forFeature([User]), ConfigModule], // ✅ Enables User entity in AuthModule
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
