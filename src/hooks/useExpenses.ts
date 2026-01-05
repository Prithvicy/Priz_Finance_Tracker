'use client';

// ============================================
// Expenses Hook
// ============================================

import { useState, useEffect, useCallback } from 'react';
import { Expense, NewExpense, DateRange, ExpenseCategory } from '@/types';
import {
  getExpenses,
  getExpensesByDateRange,
  addExpense as addExpenseService,
  updateExpense as updateExpenseService,
  deleteExpense as deleteExpenseService,
} from '@/services/firebase';
import { useAuth } from './useAuth';

// ============================================
// Types
// ============================================

interface UseExpensesOptions {
  dateRange?: DateRange;
  category?: ExpenseCategory;
  autoFetch?: boolean;
}

interface UseExpensesReturn {
  expenses: Expense[];
  isLoading: boolean;
  error: string | null;
  addExpense: (expense: NewExpense) => Promise<string>;
  updateExpense: (id: string, updates: Partial<NewExpense>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  refresh: () => Promise<void>;
  totalAmount: number;
}

// ============================================
// Hook
// ============================================

export const useExpenses = (options: UseExpensesOptions = {}): UseExpensesReturn => {
  const { dateRange, category, autoFetch = true } = options;
  const { user, isAuthenticated } = useAuth();

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch expenses
  const fetchExpenses = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setExpenses([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      let data: Expense[];

      if (dateRange) {
        data = await getExpensesByDateRange(user.uid, dateRange);
      } else {
        data = await getExpenses(user.uid);
      }

      // Filter by category if specified
      if (category) {
        data = data.filter((expense) => expense.category === category);
      }

      setExpenses(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch expenses';
      setError(message);
      console.error('Error fetching expenses:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user, isAuthenticated, dateRange, category]);

  // Auto-fetch on mount and when dependencies change
  useEffect(() => {
    if (autoFetch) {
      fetchExpenses();
    }
  }, [fetchExpenses, autoFetch]);

  // Add expense
  const addExpense = useCallback(
    async (expense: NewExpense): Promise<string> => {
      if (!user) throw new Error('Not authenticated');

      try {
        setError(null);
        const id = await addExpenseService(user.uid, expense);
        await fetchExpenses(); // Refresh list
        return id;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to add expense';
        setError(message);
        throw err;
      }
    },
    [user, fetchExpenses]
  );

  // Update expense
  const updateExpense = useCallback(
    async (id: string, updates: Partial<NewExpense>): Promise<void> => {
      if (!user) throw new Error('Not authenticated');

      try {
        setError(null);
        await updateExpenseService(user.uid, id, updates);
        await fetchExpenses(); // Refresh list
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to update expense';
        setError(message);
        throw err;
      }
    },
    [user, fetchExpenses]
  );

  // Delete expense
  const deleteExpense = useCallback(
    async (id: string): Promise<void> => {
      if (!user) throw new Error('Not authenticated');

      try {
        setError(null);
        await deleteExpenseService(user.uid, id);
        setExpenses((prev) => prev.filter((e) => e.id !== id));
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to delete expense';
        setError(message);
        throw err;
      }
    },
    [user]
  );

  // Calculate total
  const totalAmount = expenses.reduce((sum, e) => sum + e.amount, 0);

  return {
    expenses,
    isLoading,
    error,
    addExpense,
    updateExpense,
    deleteExpense,
    refresh: fetchExpenses,
    totalAmount,
  };
};
