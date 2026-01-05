'use client';

// ============================================
// Goals Hook
// ============================================

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  UserGoals,
  GoalAllocation,
  GoalProgress,
  GoalsAnalytics,
  GoalInsight,
  GoalCategory,
  Expense,
  Income,
} from '@/types';
import {
  getGoals,
  saveGoals as saveGoalsService,
  resetGoals as resetGoalsService,
} from '@/services/firebase';
import { useAuth } from './useAuth';
import { GOAL_CATEGORIES } from '@/lib/utils/constants';

// ============================================
// Types
// ============================================

interface UseGoalsOptions {
  expenses?: Expense[];
  income?: Income[];
  autoFetch?: boolean;
}

interface UseGoalsReturn {
  goals: UserGoals | null;
  isLoading: boolean;
  error: string | null;
  analytics: GoalsAnalytics | null;
  saveGoals: (allocations: GoalAllocation[], monthlyIncomeTarget: number) => Promise<void>;
  updateAllocation: (category: GoalCategory, percentage: number) => Promise<void>;
  resetGoals: () => Promise<void>;
  refresh: () => Promise<void>;
}

// ============================================
// Helper Functions
// ============================================

const mapExpenseToGoalCategory = (expenseCategory: string): GoalCategory => {
  // Map expense categories to goal categories
  const needsCategories = ['rent', 'electricity', 'gas', 'wifi', 'groceries'];
  const wantsCategories = ['amazon', 'eating_out', 'miscellaneous'];

  if (needsCategories.includes(expenseCategory)) return 'needs';
  if (wantsCategories.includes(expenseCategory)) return 'wants';
  return 'wants'; // Default to wants
};

const calculateProgress = (
  allocations: GoalAllocation[],
  totalIncome: number,
  expenses: Expense[],
  income: Income[]
): GoalProgress[] => {
  // Calculate actual spending by goal category
  const actualByCategory: Record<GoalCategory, number> = {
    savings: 0,
    investments: 0,
    needs: 0,
    wants: 0,
    debt_repayment: 0,
    emergency_fund: 0,
  };

  // Map expenses to goal categories
  expenses.forEach((expense) => {
    const goalCategory = mapExpenseToGoalCategory(expense.category);
    actualByCategory[goalCategory] += expense.amount;
  });

  // Calculate savings (income - expenses)
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const netSavings = Math.max(0, totalIncome - totalExpenses);

  // For now, assume savings goes to the savings category
  // In a real app, you'd track where money is actually going
  actualByCategory.savings = netSavings;

  return allocations.map((alloc) => {
    const targetAmount = (totalIncome * alloc.targetPercentage) / 100;
    const actualAmount = actualByCategory[alloc.category];
    const actualPercentage = totalIncome > 0 ? (actualAmount / totalIncome) * 100 : 0;
    const difference = actualAmount - targetAmount;

    let status: 'on_track' | 'behind' | 'ahead';
    if (alloc.category === 'needs' || alloc.category === 'wants') {
      // For spending categories, under budget is good
      status = actualAmount <= targetAmount ? 'on_track' : 'behind';
      if (actualAmount < targetAmount * 0.8) status = 'ahead';
    } else {
      // For savings/investment, meeting target is good
      status = actualAmount >= targetAmount * 0.9 ? 'on_track' : 'behind';
      if (actualAmount >= targetAmount * 1.1) status = 'ahead';
    }

    return {
      category: alloc.category,
      targetPercentage: alloc.targetPercentage,
      actualPercentage,
      targetAmount,
      actualAmount,
      difference,
      status,
    };
  });
};

const generateInsights = (progress: GoalProgress[]): GoalInsight[] => {
  const insights: GoalInsight[] = [];

  progress.forEach((p) => {
    const categoryConfig = GOAL_CATEGORIES[p.category];

    if (p.status === 'behind') {
      if (p.category === 'needs' || p.category === 'wants') {
        insights.push({
          type: 'warning',
          category: p.category,
          message: `You're overspending on ${categoryConfig.name} by ${Math.abs(p.difference / 100).toFixed(0)}`,
          action: `Try to reduce ${categoryConfig.name.toLowerCase()} expenses`,
        });
      } else {
        insights.push({
          type: 'warning',
          category: p.category,
          message: `${categoryConfig.name} is ${Math.abs(p.actualPercentage - p.targetPercentage).toFixed(1)}% below target`,
          action: `Consider allocating more to ${categoryConfig.name.toLowerCase()}`,
        });
      }
    } else if (p.status === 'ahead') {
      insights.push({
        type: 'success',
        category: p.category,
        message: `Great job! ${categoryConfig.name} is on track`,
      });
    }
  });

  // Add general tips if doing well
  const onTrackCount = progress.filter((p) => p.status !== 'behind').length;
  if (onTrackCount === progress.length) {
    insights.push({
      type: 'success',
      message: 'All your financial goals are on track! Keep it up!',
    });
  } else if (onTrackCount >= progress.length * 0.7) {
    insights.push({
      type: 'tip',
      message: 'You\'re doing well overall. Small adjustments can help you reach all goals.',
    });
  }

  return insights;
};

const calculateOverallScore = (progress: GoalProgress[]): number => {
  if (progress.length === 0) return 0;

  let totalScore = 0;
  progress.forEach((p) => {
    // Calculate how close to target (0-100)
    let categoryScore: number;

    if (p.category === 'needs' || p.category === 'wants') {
      // For spending: under or at target = good
      if (p.actualPercentage <= p.targetPercentage) {
        categoryScore = 100;
      } else {
        // Penalize overspending
        const overBy = p.actualPercentage - p.targetPercentage;
        categoryScore = Math.max(0, 100 - overBy * 5);
      }
    } else {
      // For savings/investment: at or over target = good
      const ratio = p.targetPercentage > 0 ? p.actualPercentage / p.targetPercentage : 1;
      categoryScore = Math.min(100, ratio * 100);
    }

    totalScore += categoryScore;
  });

  return Math.round(totalScore / progress.length);
};

// ============================================
// Hook
// ============================================

export const useGoals = (options: UseGoalsOptions = {}): UseGoalsReturn => {
  const { expenses = [], income = [], autoFetch = true } = options;
  const { user, isAuthenticated } = useAuth();

  const [goals, setGoals] = useState<UserGoals | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch goals
  const fetchGoals = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setGoals(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const data = await getGoals(user.uid);
      setGoals(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch goals';
      setError(message);
      console.error('Error fetching goals:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user, isAuthenticated]);

  // Auto-fetch on mount
  useEffect(() => {
    if (autoFetch) {
      fetchGoals();
    }
  }, [fetchGoals, autoFetch]);

  // Calculate analytics
  const analytics = useMemo((): GoalsAnalytics | null => {
    if (!goals) return null;

    const totalIncome = income.reduce((sum, i) => sum + i.amount, 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

    const progress = calculateProgress(goals.allocations, totalIncome, expenses, income);
    const insights = generateInsights(progress);
    const overallScore = calculateOverallScore(progress);

    return {
      totalIncome,
      totalAllocated: totalExpenses,
      progress,
      overallScore,
      trend: 0, // TODO: Calculate from historical data
      insights,
    };
  }, [goals, expenses, income]);

  // Save goals
  const saveGoals = useCallback(
    async (allocations: GoalAllocation[], monthlyIncomeTarget: number): Promise<void> => {
      if (!user) throw new Error('Not authenticated');

      try {
        setError(null);
        await saveGoalsService(user.uid, allocations, monthlyIncomeTarget);
        await fetchGoals();
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to save goals';
        setError(message);
        throw err;
      }
    },
    [user, fetchGoals]
  );

  // Update single allocation
  const updateAllocation = useCallback(
    async (category: GoalCategory, percentage: number): Promise<void> => {
      if (!goals) throw new Error('Goals not loaded');

      const updatedAllocations = goals.allocations.map((alloc) =>
        alloc.category === category
          ? { ...alloc, targetPercentage: percentage }
          : alloc
      );

      await saveGoals(updatedAllocations, goals.monthlyIncomeTarget);
    },
    [goals, saveGoals]
  );

  // Reset to defaults
  const resetGoals = useCallback(async (): Promise<void> => {
    if (!user) throw new Error('Not authenticated');

    try {
      setError(null);
      const defaultGoals = await resetGoalsService(user.uid);
      setGoals(defaultGoals);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to reset goals';
      setError(message);
      throw err;
    }
  }, [user]);

  return {
    goals,
    isLoading,
    error,
    analytics,
    saveGoals,
    updateAllocation,
    resetGoals,
    refresh: fetchGoals,
  };
};
