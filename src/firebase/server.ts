
import 'dotenv/config';
import { initializeApp, getApps, cert, App } from 'firebase-admin/app';

// This function is modified to ensure it returns a promise that resolves with the initialized app.
// This prevents race conditions where other functions might try to use the app before it's ready.
export async function initAdmin(): Promise<App> {
  const apps = getApps();
  if (apps.length > 0 && apps[0]) {
    return apps[0];
  }

  const serviceKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
    ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
    : null;

  if (!serviceKey) {
    console.error("Firebase Admin SDK service account key not found. Server-side operations will fail.");
    throw new Error("FIREBASE_SERVICE_ACCOUNT_KEY environment variable not set.");
  }
  
  try {
    const adminApp = initializeApp({
      credential: cert(serviceKey),
    });
    return adminApp;
  } catch (e) {
    console.error('Firebase Admin initialization error', e);
    throw new Error("Failed to initialize Firebase Admin SDK.");
  }
}
