import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FirebaseAdminService } from '../firebase-admin.service'; // ✅ Import Firebase Service
import { User } from '../entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    private readonly firebaseAdminService: FirebaseAdminService, // ✅ Inject Firebase Service
  ) {}

  /**
   * ✅ Verify Firebase ID Token
   */
  async verifyFirebaseToken(idToken: string) {
    try {
      // 🔹 Verify the ID token with Firebase Admin
      const decodedToken =
        await this.firebaseAdminService.verifyIdToken(idToken);
      console.log('✅ Firebase Token Verified:', decodedToken);

      // 🔹 Extract user info safely
      const {
        uid,
        email,
        name = 'Unknown User',
        picture = null,
      } = decodedToken as {
        uid: string;
        email: string;
        name?: string;
        picture?: string;
      };

      // 🔹 Check if the user exists in PostgreSQL
      let user = await this.userRepository.findOne({ where: { email } });

      // 🔹 If user exists but has no Firebase UID, update it
      if (user && !user.firebaseUid) {
        user.firebaseUid = uid; // Assign the Firebase UID
        await this.userRepository.save(user);
        console.log('✅ Updated existing user with Firebase UID:', user);
      }

      // 🔹 If user does not exist, create a new entry
      if (!user) {
        user = this.userRepository.create({
          firebaseUid: uid,
          email,
          name,
          profilePicture: picture,
          provider: 'firebase',
        });

        await this.userRepository.save(user);
        console.log('✅ New Firebase User Created:', user);
      }

      return user;
    } catch (error) {
      console.error('❌ Firebase token verification failed:', error);
      throw new UnauthorizedException('Invalid Firebase ID Token');
    }
  }
}
