// ============================================
// Goals Firestore Operations
// ============================================

import {
  collection,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  Timestamp,
} from 'firebase/firestore';
import { db, isDevMode } from './config';
import { UserGoals, GoalAllocation } from '@/types';
import { DEFAULT_GOAL_ALLOCATIONS } from '@/lib/utils/constants';

// ============================================
// Mock Data for Development Mode
// ============================================

let mockGoals: UserGoals | null = null;

const getDefaultGoals = (userId: string): UserGoals => ({
  id: 'default',
  userId,
  allocations: DEFAULT_GOAL_ALLOCATIONS,
  monthlyIncomeTarget: 500000, // $5,000 in cents
  createdAt: Timestamp.now(),
  updatedAt: Timestamp.now(),
});

// ============================================
// CRUD Operations
// ============================================

/**
 * Get user goals
 */
export const getGoals = async (userId: string): Promise<UserGoals> => {
  if (isDevMode) {
    if (!mockGoals) {
      mockGoals = getDefaultGoals(userId);
    }
    return mockGoals;
  }

  const goalsRef = doc(db, 'users', userId, 'goals', 'current');
  const snapshot = await getDoc(goalsRef);

  if (!snapshot.exists()) {
    // Create default goals if none exist
    const defaultGoals = getDefaultGoals(userId);
    await setDoc(goalsRef, defaultGoals);
    return defaultGoals;
  }

  return {
    id: snapshot.id,
    ...snapshot.data(),
  } as UserGoals;
};

/**
 * Save/Update user goals
 */
export const saveGoals = async (
  userId: string,
  allocations: GoalAllocation[],
  monthlyIncomeTarget: number
): Promise<void> => {
  if (isDevMode) {
    mockGoals = {
      id: 'default',
      userId,
      allocations,
      monthlyIncomeTarget,
      createdAt: mockGoals?.createdAt || Timestamp.now(),
      updatedAt: Timestamp.now(),
    };
    return;
  }

  const goalsRef = doc(db, 'users', userId, 'goals', 'current');
  const snapshot = await getDoc(goalsRef);

  if (snapshot.exists()) {
    await updateDoc(goalsRef, {
      allocations,
      monthlyIncomeTarget,
      updatedAt: Timestamp.now(),
    });
  } else {
    await setDoc(goalsRef, {
      userId,
      allocations,
      monthlyIncomeTarget,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
  }
};

/**
 * Update a single allocation
 */
export const updateAllocation = async (
  userId: string,
  category: string,
  targetPercentage: number
): Promise<void> => {
  const goals = await getGoals(userId);
  const updatedAllocations = goals.allocations.map((alloc) =>
    alloc.category === category
      ? { ...alloc, targetPercentage }
      : alloc
  );

  await saveGoals(userId, updatedAllocations, goals.monthlyIncomeTarget);
};

/**
 * Reset goals to defaults
 */
export const resetGoals = async (userId: string): Promise<UserGoals> => {
  const defaultGoals = getDefaultGoals(userId);

  if (isDevMode) {
    mockGoals = defaultGoals;
    return mockGoals;
  }

  const goalsRef = doc(db, 'users', userId, 'goals', 'current');
  await setDoc(goalsRef, defaultGoals);
  return defaultGoals;
};
