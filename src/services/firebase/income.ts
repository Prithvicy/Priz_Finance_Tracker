// ============================================
// Income Firestore Operations
// ============================================

import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { db, isDevMode } from './config';
import { Income, NewIncome, DateRange } from '@/types';
import { parseCurrencyToCents } from '@/lib/utils/formatters';
import { DEFAULT_SALARY } from '@/lib/utils/constants';

// ============================================
// Mock Data for Development Mode
// ============================================

let mockIncome: Income[] = [];

const generateMockIncome = (): Income[] => {
  const now = new Date();
  const income: Income[] = [];

  // Generate bi-weekly salary entries for the last few months
  for (let i = 0; i < 8; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() - i * 14);

    income.push({
      id: `mock-salary-${i}`,
      userId: 'dev-user',
      amount: DEFAULT_SALARY,
      type: 'salary',
      source: 'Primary Job',
      date: Timestamp.fromDate(date),
      createdAt: Timestamp.fromDate(date),
      updatedAt: Timestamp.fromDate(date),
      isRegular: true,
      note: 'Bi-weekly paycheck',
    });
  }

  // Add a bonus
  const bonusDate = new Date(now);
  bonusDate.setMonth(bonusDate.getMonth() - 1);
  income.push({
    id: 'mock-bonus',
    userId: 'dev-user',
    amount: 50000,
    type: 'bonus',
    source: 'Year-end bonus',
    date: Timestamp.fromDate(bonusDate),
    createdAt: Timestamp.fromDate(bonusDate),
    updatedAt: Timestamp.fromDate(bonusDate),
    isRegular: false,
    note: 'Performance bonus',
  });

  return income.sort((a, b) => b.date.toMillis() - a.date.toMillis());
};

// Initialize mock data
if (isDevMode && mockIncome.length === 0) {
  mockIncome = generateMockIncome();
}

// ============================================
// CRUD Operations
// ============================================

/**
 * Add a new income entry
 */
export const addIncome = async (
  userId: string,
  income: NewIncome
): Promise<string> => {
  if (isDevMode) {
    const newIncome: Income = {
      id: `mock-${Date.now()}`,
      userId,
      amount:
        typeof income.amount === 'string'
          ? parseCurrencyToCents(income.amount)
          : income.amount,
      type: income.type,
      source: income.source,
      date: Timestamp.fromDate(income.date),
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      isRegular: income.isRegular || false,
      note: income.note,
    };
    mockIncome.unshift(newIncome);
    return newIncome.id;
  }

  const incomeRef = collection(db, 'users', userId, 'income');
  const docRef = await addDoc(incomeRef, {
    userId,
    amount:
      typeof income.amount === 'string'
        ? parseCurrencyToCents(income.amount)
        : income.amount,
    type: income.type,
    source: income.source,
    date: Timestamp.fromDate(income.date),
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    isRegular: income.isRegular || false,
    note: income.note || '',
  });

  return docRef.id;
};

/**
 * Get all income for a user
 */
export const getIncome = async (userId: string): Promise<Income[]> => {
  if (isDevMode) {
    return mockIncome;
  }

  const incomeRef = collection(db, 'users', userId, 'income');
  const q = query(incomeRef, orderBy('date', 'desc'));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Income[];
};

/**
 * Get income within a date range
 */
export const getIncomeByDateRange = async (
  userId: string,
  range: DateRange
): Promise<Income[]> => {
  if (isDevMode) {
    return mockIncome.filter((inc) => {
      const date = inc.date.toDate();
      return date >= range.start && date <= range.end;
    });
  }

  const incomeRef = collection(db, 'users', userId, 'income');
  const q = query(
    incomeRef,
    where('date', '>=', Timestamp.fromDate(range.start)),
    where('date', '<=', Timestamp.fromDate(range.end)),
    orderBy('date', 'desc')
  );
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Income[];
};

/**
 * Update an income entry
 */
export const updateIncome = async (
  userId: string,
  incomeId: string,
  updates: Partial<NewIncome>
): Promise<void> => {
  if (isDevMode) {
    const index = mockIncome.findIndex((inc) => inc.id === incomeId);
    if (index !== -1) {
      mockIncome[index] = {
        ...mockIncome[index],
        ...updates,
        amount: updates.amount
          ? typeof updates.amount === 'string'
            ? parseCurrencyToCents(updates.amount)
            : updates.amount
          : mockIncome[index].amount,
        date: updates.date
          ? Timestamp.fromDate(updates.date)
          : mockIncome[index].date,
        updatedAt: Timestamp.now(),
      };
    }
    return;
  }

  const incomeRef = doc(db, 'users', userId, 'income', incomeId);
  const updateData: Record<string, unknown> = {
    ...updates,
    updatedAt: Timestamp.now(),
  };

  if (updates.amount) {
    updateData.amount =
      typeof updates.amount === 'string'
        ? parseCurrencyToCents(updates.amount)
        : updates.amount;
  }

  if (updates.date) {
    updateData.date = Timestamp.fromDate(updates.date);
  }

  await updateDoc(incomeRef, updateData);
};

/**
 * Delete an income entry
 */
export const deleteIncome = async (
  userId: string,
  incomeId: string
): Promise<void> => {
  if (isDevMode) {
    mockIncome = mockIncome.filter((inc) => inc.id !== incomeId);
    return;
  }

  const incomeRef = doc(db, 'users', userId, 'income', incomeId);
  await deleteDoc(incomeRef);
};

/**
 * Get total income for current month
 */
export const getMonthlyIncomeTotal = async (userId: string): Promise<number> => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  const income = await getIncomeByDateRange(userId, { start, end });
  return income.reduce((sum, inc) => sum + inc.amount, 0);
};
