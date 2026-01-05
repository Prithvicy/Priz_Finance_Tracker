// ============================================
// Firebase Configuration
// ============================================

import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

// ============================================
// Firebase Config from Environment
// ============================================

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// ============================================
// Development Mode Check
// ============================================

export const isDevMode = process.env.NEXT_PUBLIC_DEV_MODE === 'true';

// ============================================
// Firebase Initialization
// ============================================

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

// Only initialize if not already initialized and not in dev mode without config
const hasFirebaseConfig = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);

if (hasFirebaseConfig) {
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApps()[0];
  }
  auth = getAuth(app);
  db = getFirestore(app);
}

// ============================================
// Exports
// ============================================

export { app, auth, db };

// Helper to check if Firebase is configured
export const isFirebaseConfigured = (): boolean => {
  return hasFirebaseConfig;
};
