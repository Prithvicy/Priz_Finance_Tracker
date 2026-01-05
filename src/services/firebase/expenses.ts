// ============================================
// Expense Firestore Operations
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
  writeBatch,
} from 'firebase/firestore';
import { db, isDevMode } from './config';
import { Expense, NewExpense, DateRange } from '@/types';
import { parseCurrencyToCents } from '@/lib/utils/formatters';

// ============================================
// Mock Data for Development Mode
// ============================================

let mockExpenses: Expense[] = [];

const generateMockExpenses = (): Expense[] => {
  const categories = ['rent', 'electricity', 'gas', 'wifi', 'groceries', 'amazon', 'eating_out', 'miscellaneous'] as const;
  const now = new Date();
  const expenses: Expense[] = [];

  for (let i = 0; i < 30; i++) {
    const daysAgo = Math.floor(Math.random() * 60);
    const date = new Date(now);
    date.setDate(date.getDate() - daysAgo);

    expenses.push({
      id: `mock-${i}`,
      userId: 'dev-user',
      amount: Math.floor(Math.random() * 50000) + 1000,
      category: categories[Math.floor(Math.random() * categories.length)],
      description: '',
      date: Timestamp.fromDate(date),
      createdAt: Timestamp.fromDate(date),
      updatedAt: Timestamp.fromDate(date),
      isRecurring: Math.random() > 0.7,
      tags: [],
    });
  }

  // Add fixed expenses
  expenses.push({
    id: 'mock-rent',
    userId: 'dev-user',
    amount: 180000,
    category: 'rent',
    description: 'Monthly rent',
    date: Timestamp.fromDate(new Date(now.getFullYear(), now.getMonth(), 1)),
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    isRecurring: true,
    tags: [],
  });

  return expenses.sort((a, b) => b.date.toMillis() - a.date.toMillis());
};

// Initialize mock data
if (isDevMode && mockExpenses.length === 0) {
  mockExpenses = generateMockExpenses();
}

// ============================================
// CRUD Operations
// ============================================

/**
 * Add a new expense
 */
export const addExpense = async (
  userId: string,
  expense: NewExpense
): Promise<string> => {
  if (isDevMode) {
    const newExpense: Expense = {
      id: `mock-${Date.now()}`,
      userId,
      amount: typeof expense.amount === 'string'
        ? parseCurrencyToCents(expense.amount)
        : expense.amount,
      category: expense.category,
      description: expense.description || '',
      date: Timestamp.fromDate(expense.date),
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      isRecurring: expense.isRecurring || false,
      tags: expense.tags || [],
    };
    mockExpenses.unshift(newExpense);
    return newExpense.id;
  }

  const expensesRef = collection(db, 'users', userId, 'expenses');
  const docRef = await addDoc(expensesRef, {
    userId,
    amount: typeof expense.amount === 'string'
      ? parseCurrencyToCents(expense.amount)
      : expense.amount,
    category: expense.category,
    description: expense.description || '',
    date: Timestamp.fromDate(expense.date),
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    isRecurring: expense.isRecurring || false,
    tags: expense.tags || [],
  });

  return docRef.id;
};

/**
 * Get all expenses for a user
 */
export const getExpenses = async (userId: string): Promise<Expense[]> => {
  if (isDevMode) {
    return mockExpenses;
  }

  const expensesRef = collection(db, 'users', userId, 'expenses');
  const q = query(expensesRef, orderBy('date', 'desc'));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Expense[];
};

/**
 * Get expenses within a date range
 */
export const getExpensesByDateRange = async (
  userId: string,
  range: DateRange
): Promise<Expense[]> => {
  if (isDevMode) {
    return mockExpenses.filter((exp) => {
      const date = exp.date.toDate();
      return date >= range.start && date <= range.end;
    });
  }

  const expensesRef = collection(db, 'users', userId, 'expenses');
  const q = query(
    expensesRef,
    where('date', '>=', Timestamp.fromDate(range.start)),
    where('date', '<=', Timestamp.fromDate(range.end)),
    orderBy('date', 'desc')
  );
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Expense[];
};

/**
 * Update an expense
 */
export const updateExpense = async (
  userId: string,
  expenseId: string,
  updates: Partial<NewExpense>
): Promise<void> => {
  if (isDevMode) {
    const index = mockExpenses.findIndex((exp) => exp.id === expenseId);
    if (index !== -1) {
      mockExpenses[index] = {
        ...mockExpenses[index],
        ...updates,
        amount: updates.amount
          ? typeof updates.amount === 'string'
            ? parseCurrencyToCents(updates.amount)
            : updates.amount
          : mockExpenses[index].amount,
        date: updates.date
          ? Timestamp.fromDate(updates.date)
          : mockExpenses[index].date,
        updatedAt: Timestamp.now(),
      };
    }
    return;
  }

  const expenseRef = doc(db, 'users', userId, 'expenses', expenseId);
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

  await updateDoc(expenseRef, updateData);
};

/**
 * Delete an expense
 */
export const deleteExpense = async (
  userId: string,
  expenseId: string
): Promise<void> => {
  if (isDevMode) {
    mockExpenses = mockExpenses.filter((exp) => exp.id !== expenseId);
    return;
  }

  const expenseRef = doc(db, 'users', userId, 'expenses', expenseId);
  await deleteDoc(expenseRef);
};

/**
 * Delete multiple expenses
 */
export const deleteExpenses = async (
  userId: string,
  expenseIds: string[]
): Promise<void> => {
  if (isDevMode) {
    mockExpenses = mockExpenses.filter((exp) => !expenseIds.includes(exp.id));
    return;
  }

  const batch = writeBatch(db);
  expenseIds.forEach((id) => {
    const expenseRef = doc(db, 'users', userId, 'expenses', id);
    batch.delete(expenseRef);
  });
  await batch.commit();
};
