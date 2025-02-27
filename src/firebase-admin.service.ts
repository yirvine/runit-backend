import * as admin from 'firebase-admin';
import { Injectable } from '@nestjs/common';
import * as dotenv from 'dotenv';

dotenv.config(); // Load environment variables

@Injectable()
export class FirebaseAdminService {
  private firebaseApp: admin.app.App;

  constructor() {
    if (!admin.apps.length) {
      this.firebaseApp = admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        }),
      });
      console.log('🔥 Firebase Admin Initialized in firebase-admin.service.ts');
    } else {
      this.firebaseApp = admin.app();
    }
  }

  async verifyIdToken(idToken: string): Promise<admin.auth.DecodedIdToken> {
    return await this.firebaseApp.auth().verifyIdToken(idToken);
  }
}
