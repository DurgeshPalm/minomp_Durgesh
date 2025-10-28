import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { join } from 'path';
import { readFileSync } from 'fs';

@Injectable()
export class FirebaseService {
  private firebaseApp: admin.app.App;

  constructor() {
    const serviceAccountPath = join(process.cwd(), 'serviceAccountKey.json');
    const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));

    this.firebaseApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  }

  getMessaging() {
    return this.firebaseApp.messaging();
  }
}
