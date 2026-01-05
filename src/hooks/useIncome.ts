'use client';

// ============================================
// Income Hook
// ============================================

import { useState, useEffect, useCallback } from 'react';
import { Income, NewIncome, DateRange, IncomeType } from '@/types';
import {
  getIncome,
  getIncomeByDateRange,
  addIncome as addIncomeService,
  updateIncome as updateIncomeService,
  deleteIncome as deleteIncomeService,
} from '@/services/firebase';
import { useAuth } from './useAuth';

// ============================================
// Types
// ============================================

interface UseIncomeOptions {
  dateRange?: DateRange;
  type?: IncomeType;
  autoFetch?: boolean;
}

interface UseIncomeReturn {
  income: Income[];
  isLoading: boolean;
  error: string | null;
  addIncome: (income: NewIncome) => Promise<string>;
  updateIncome: (id: string, updates: Partial<NewIncome>) => Promise<void>;
  deleteIncome: (id: string) => Promise<void>;
  refresh: () => Promise<void>;
  totalAmount: number;
}

// ============================================
// Hook
// ============================================

export const useIncome = (options: UseIncomeOptions = {}): UseIncomeReturn => {
  const { dateRange, type, autoFetch = true } = options;
  const { user, isAuthenticated } = useAuth();

  const [income, setIncome] = useState<Income[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch income
  const fetchIncome = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setIncome([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      let data: Income[];

      if (dateRange) {
        data = await getIncomeByDateRange(user.uid, dateRange);
      } else {
        data = await getIncome(user.uid);
      }

      // Filter by type if specified
      if (type) {
        data = data.filter((inc) => inc.type === type);
      }

      setIncome(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch income';
      setError(message);
      console.error('Error fetching income:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user, isAuthenticated, dateRange, type]);

  // Auto-fetch on mount and when dependencies change
  useEffect(() => {
    if (autoFetch) {
      fetchIncome();
    }
  }, [fetchIncome, autoFetch]);

  // Add income
  const addIncome = useCallback(
    async (newIncome: NewIncome): Promise<string> => {
      if (!user) throw new Error('Not authenticated');

      try {
        setError(null);
        const id = await addIncomeService(user.uid, newIncome);
        await fetchIncome(); // Refresh list
        return id;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to add income';
        setError(message);
        throw err;
      }
    },
    [user, fetchIncome]
  );

  // Update income
  const updateIncome = useCallback(
    async (id: string, updates: Partial<NewIncome>): Promise<void> => {
      if (!user) throw new Error('Not authenticated');

      try {
        setError(null);
        await updateIncomeService(user.uid, id, updates);
        await fetchIncome(); // Refresh list
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to update income';
        setError(message);
        throw err;
      }
    },
    [user, fetchIncome]
  );

  // Delete income
  const deleteIncome = useCallback(
    async (id: string): Promise<void> => {
      if (!user) throw new Error('Not authenticated');

      try {
        setError(null);
        await deleteIncomeService(user.uid, id);
        setIncome((prev) => prev.filter((i) => i.id !== id));
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to delete income';
        setError(message);
        throw err;
      }
    },
    [user]
  );

  // Calculate total
  const totalAmount = income.reduce((sum, i) => sum + i.amount, 0);

  return {
    income,
    isLoading,
    error,
    addIncome,
    updateIncome,
    deleteIncome,
    refresh: fetchIncome,
    totalAmount,
  };
};
