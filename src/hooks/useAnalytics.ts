'use client';

// ============================================
// Analytics Hook
// ============================================

import { useMemo } from 'react';
import { Expense, Income, CategoryBreakdown, MonthlyTotal, WeeklyTrend, IncomeVsExpense, DailySpending, DateRange } from '@/types';
import {
  calculateTotalExpenses,
  calculateTotalIncome,
  calculateNet,
  calculateSavingsRate,
  calculateCategoryBreakdown,
  calculateMonthlyTotals,
  calculateWeeklyTrend,
  calculateIncomeVsExpenses,
  calculateDailySpending,
  calculateMoMChange,
  getTopCategory,
} from '@/services/analytics';
import { getDateRange, getLastNMonths } from '@/lib/utils/dateUtils';

// ============================================
// Types
// ============================================

interface UseAnalyticsOptions {
  expenses: Expense[];
  income: Income[];
  dateRange?: DateRange;
}

interface UseAnalyticsReturn {
  // Totals
  totalExpenses: number;
  totalIncome: number;
  netAmount: number;
  savingsRate: number;

  // Breakdowns
  categoryBreakdown: CategoryBreakdown[];
  topCategory: CategoryBreakdown | null;
  monthlyTotals: MonthlyTotal[];
  weeklyTrend: WeeklyTrend[];
  incomeVsExpenses: IncomeVsExpense[];
  dailySpending: DailySpending[];

  // Trends
  momChange: number;

  // Helpers
  averageDailySpending: number;
  averageMonthlySpending: number;
  expenseCount: number;
  incomeCount: number;
}

// ============================================
// Hook
// ============================================

export const useAnalytics = ({
  expenses,
  income,
  dateRange,
}: UseAnalyticsOptions): UseAnalyticsReturn => {
  // Use provided date range or default to current month
  const effectiveDateRange = useMemo(() => {
    return dateRange || getDateRange('month');
  }, [dateRange]);

  // Filter data by date range
  const filteredExpenses = useMemo(() => {
    return expenses.filter((e) => {
      const date = e.date.toDate();
      return date >= effectiveDateRange.start && date <= effectiveDateRange.end;
    });
  }, [expenses, effectiveDateRange]);

  const filteredIncome = useMemo(() => {
    return income.filter((i) => {
      const date = i.date.toDate();
      return date >= effectiveDateRange.start && date <= effectiveDateRange.end;
    });
  }, [income, effectiveDateRange]);

  // Calculate totals
  const totalExpenses = useMemo(
    () => calculateTotalExpenses(filteredExpenses),
    [filteredExpenses]
  );

  const totalIncome = useMemo(
    () => calculateTotalIncome(filteredIncome),
    [filteredIncome]
  );

  const netAmount = useMemo(
    () => calculateNet(filteredIncome, filteredExpenses),
    [filteredIncome, filteredExpenses]
  );

  const savingsRate = useMemo(
    () => calculateSavingsRate(filteredIncome, filteredExpenses),
    [filteredIncome, filteredExpenses]
  );

  // Calculate breakdowns
  const categoryBreakdown = useMemo(
    () => calculateCategoryBreakdown(filteredExpenses),
    [filteredExpenses]
  );

  const topCategory = useMemo(
    () => getTopCategory(filteredExpenses),
    [filteredExpenses]
  );

  // Calculate trends using full data (not filtered)
  const monthlyTotals = useMemo(
    () => calculateMonthlyTotals(expenses),
    [expenses]
  );

  const weeklyTrend = useMemo(
    () => calculateWeeklyTrend(expenses, effectiveDateRange.start, effectiveDateRange.end),
    [expenses, effectiveDateRange]
  );

  const incomeVsExpenses = useMemo(
    () => calculateIncomeVsExpenses(income, expenses),
    [income, expenses]
  );

  const dailySpending = useMemo(
    () => calculateDailySpending(expenses, effectiveDateRange.start, effectiveDateRange.end),
    [expenses, effectiveDateRange]
  );

  // Month-over-month change
  const momChange = useMemo(() => calculateMoMChange(expenses), [expenses]);

  // Calculate averages
  const averageDailySpending = useMemo(() => {
    const days = dailySpending.length;
    if (days === 0) return 0;
    return totalExpenses / days;
  }, [totalExpenses, dailySpending]);

  const averageMonthlySpending = useMemo(() => {
    const months = monthlyTotals.length;
    if (months === 0) return 0;
    const total = monthlyTotals.reduce((sum, m) => sum + m.total, 0);
    return total / months;
  }, [monthlyTotals]);

  return {
    totalExpenses,
    totalIncome,
    netAmount,
    savingsRate,
    categoryBreakdown,
    topCategory,
    monthlyTotals,
    weeklyTrend,
    incomeVsExpenses,
    dailySpending,
    momChange,
    averageDailySpending,
    averageMonthlySpending,
    expenseCount: filteredExpenses.length,
    incomeCount: filteredIncome.length,
  };
};
