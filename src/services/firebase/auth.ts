// ============================================
// Firebase Authentication Service
// ============================================

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  updateProfile,
} from 'firebase/auth';
import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import { auth, db, isDevMode, isFirebaseConfigured } from './config';
import { UserProfile } from '@/types';
import { DEFAULT_SALARY, DEFAULT_PAY_FREQUENCY, DEFAULT_CURRENCY } from '@/lib/utils/constants';

// ============================================
// Mock User for Development
// ============================================

const mockUser: UserProfile = {
  uid: 'dev-user',
  email: 'dev@example.com',
  displayName: 'Dev User',
  createdAt: Timestamp.now(),
  lastLoginAt: Timestamp.now(),
  defaultSalary: DEFAULT_SALARY,
  payFrequency: DEFAULT_PAY_FREQUENCY,
  nextPayday: Timestamp.fromDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)),
  currency: DEFAULT_CURRENCY,
};

// ============================================
// Authentication Functions
// ============================================

/**
 * Sign in with email and password
 */
export const login = async (email: string, password: string): Promise<UserProfile> => {
  if (isDevMode) {
    return mockUser;
  }

  if (!isFirebaseConfigured()) {
    throw new Error('Firebase is not configured. Please add your Firebase credentials.');
  }

  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  const profile = await getUserProfile(userCredential.user.uid);

  if (!profile) {
    // Create profile for new users
    const newProfile = await createUserProfile(userCredential.user);
    return newProfile;
  }

  // Update last login
  await updateLastLogin(userCredential.user.uid);

  return profile;
};

/**
 * Register a new user with email and password
 */
export const register = async (
  email: string,
  password: string,
  displayName?: string
): Promise<UserProfile> => {
  if (isDevMode) {
    return mockUser;
  }

  if (!isFirebaseConfigured()) {
    throw new Error('Firebase is not configured. Please add your Firebase credentials.');
  }

  const userCredential = await createUserWithEmailAndPassword(auth, email, password);

  // Update display name if provided
  if (displayName) {
    await updateProfile(userCredential.user, { displayName });
  }

  // Create user profile in Firestore
  const profile = await createUserProfile({
    ...userCredential.user,
    displayName: displayName || userCredential.user.displayName,
  } as User);

  return profile;
};

/**
 * Sign out
 */
export const logout = async (): Promise<void> => {
  if (isDevMode) {
    return;
  }

  if (!isFirebaseConfigured()) {
    return;
  }

  await signOut(auth);
};

/**
 * Subscribe to auth state changes
 */
export const subscribeToAuthState = (
  callback: (user: UserProfile | null) => void
): (() => void) => {
  if (isDevMode) {
    // In dev mode, immediately call with mock user
    setTimeout(() => callback(mockUser), 100);
    return () => {};
  }

  if (!isFirebaseConfigured()) {
    callback(null);
    return () => {};
  }

  return onAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser) {
      const profile = await getUserProfile(firebaseUser.uid);
      callback(profile);
    } else {
      callback(null);
    }
  });
};

// ============================================
// User Profile Functions
// ============================================

/**
 * Get user profile from Firestore
 */
export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  if (isDevMode) {
    return mockUser;
  }

  if (!isFirebaseConfigured()) {
    return null;
  }

  const userRef = doc(db, 'users', userId, 'profile', 'data');
  const snapshot = await getDoc(userRef);

  if (!snapshot.exists()) {
    return null;
  }

  return {
    uid: userId,
    ...snapshot.data(),
  } as UserProfile;
};

/**
 * Create user profile for new users
 */
export const createUserProfile = async (user: User): Promise<UserProfile> => {
  const profile: UserProfile = {
    uid: user.uid,
    email: user.email || '',
    displayName: user.displayName || user.email?.split('@')[0] || 'User',
    createdAt: Timestamp.now(),
    lastLoginAt: Timestamp.now(),
    defaultSalary: DEFAULT_SALARY,
    payFrequency: DEFAULT_PAY_FREQUENCY,
    nextPayday: Timestamp.fromDate(getNextBiweeklyPayday()),
    currency: DEFAULT_CURRENCY,
  };

  const userRef = doc(db, 'users', user.uid, 'profile', 'data');
  await setDoc(userRef, profile);

  return profile;
};

/**
 * Update last login timestamp
 */
const updateLastLogin = async (userId: string): Promise<void> => {
  const userRef = doc(db, 'users', userId, 'profile', 'data');
  await setDoc(userRef, { lastLoginAt: Timestamp.now() }, { merge: true });
};

/**
 * Update user profile
 */
export const updateUserProfile = async (
  userId: string,
  updates: Partial<UserProfile>
): Promise<void> => {
  if (isDevMode) {
    Object.assign(mockUser, updates);
    return;
  }

  const userRef = doc(db, 'users', userId, 'profile', 'data');
  await setDoc(userRef, updates, { merge: true });
};

// ============================================
// Helper Functions
// ============================================

/**
 * Calculate next bi-weekly payday (assuming Friday paydays)
 */
const getNextBiweeklyPayday = (): Date => {
  const today = new Date();
  const dayOfWeek = today.getDay();

  // Calculate days until next Friday
  const daysUntilFriday = (5 - dayOfWeek + 7) % 7 || 7;
  const nextFriday = new Date(today);
  nextFriday.setDate(today.getDate() + daysUntilFriday);

  return nextFriday;
};
