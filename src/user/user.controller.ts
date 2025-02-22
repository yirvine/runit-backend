/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';

@Controller('user')
export class UserController {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>, // ✅ Inject User repository
  ) {}

  /**
   * ✅ Protected route: Fetch authenticated user profile
   */
  @UseGuards(AuthGuard('jwt')) // 🔒 Protects this route with JWT authentication
  @Get('profile')
  async getProfile(@Request() req) {
    console.log('🔍 Authenticated request:', req.user);

    // ✅ Fetch user details from DB using userId from JWT
    const user = await this.userRepository.findOne({
      where: { id: req.user.userId },
    });

    if (!user) {
      return { message: 'User not found' };
    }

    return { message: 'User profile retrieved', user };
  }
}
