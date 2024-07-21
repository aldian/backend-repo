import { initializeApp, applicationDefault, cert, AppOptions } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import dotenv from 'dotenv';

dotenv.config();

const isEmulator: boolean = !!process.env.FIRESTORE_EMULATOR_HOST;

const appOptions: AppOptions = isEmulator
  ? { projectId: process.env.FIREBASE_PROJECT_ID }
  : {
      credential: applicationDefault(),
    };

initializeApp(appOptions);

const db: Firestore = getFirestore();

if (isEmulator) {
  db.settings({
    host: process.env.FIRESTORE_EMULATOR_HOST,
    ssl: false,
  });
}

export default db;
