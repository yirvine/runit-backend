import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Controller('user')
export class UserController {
  /**
   * ✅ This route is now protected—requires a valid JWT
   */
  @UseGuards(AuthGuard('jwt')) // 🔒 Protects this route with JWT authentication
  @Get('profile')
  getProfile(@Request() req) {
    return req.user; // ✅ Returns { userId, email } if JWT is valid
  }
}
