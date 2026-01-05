// ============================================
// Analytics Calculation Functions
// ============================================

import { Expense, Income, ExpenseCategory, CategoryBreakdown, MonthlyTotal, WeeklyTrend, IncomeVsExpense, DailySpending } from '@/types';
import { SPENDING_INTENSITY } from '@/lib/utils/constants';
import { format, startOfWeek, endOfWeek, eachWeekOfInterval, getMonth, getYear, eachDayOfInterval, startOfMonth, endOfMonth } from 'date-fns';

// ============================================
// Total Calculations
// ============================================

/**
 * Calculate total amount from expenses
 */
export const calculateTotalExpenses = (expenses: Expense[]): number => {
  return expenses.reduce((sum, expense) => sum + expense.amount, 0);
};

/**
 * Calculate total income
 */
export const calculateTotalIncome = (income: Income[]): number => {
  return income.reduce((sum, inc) => sum + inc.amount, 0);
};

/**
 * Calculate net (income - expenses)
 */
export const calculateNet = (income: Income[], expenses: Expense[]): number => {
  return calculateTotalIncome(income) - calculateTotalExpenses(expenses);
};

/**
 * Calculate savings rate as percentage
 */
export const calculateSavingsRate = (income: Income[], expenses: Expense[]): number => {
  const totalIncome = calculateTotalIncome(income);
  if (totalIncome === 0) return 0;

  const totalExpenses = calculateTotalExpenses(expenses);
  const savings = totalIncome - totalExpenses;

  return (savings / totalIncome) * 100;
};

// ============================================
// Category Breakdown
// ============================================

/**
 * Calculate breakdown by category
 */
export const calculateCategoryBreakdown = (expenses: Expense[]): CategoryBreakdown[] => {
  const total = calculateTotalExpenses(expenses);
  if (total === 0) return [];

  const categoryMap = new Map<ExpenseCategory, { amount: number; count: number }>();

  expenses.forEach((expense) => {
    const existing = categoryMap.get(expense.category) || { amount: 0, count: 0 };
    categoryMap.set(expense.category, {
      amount: existing.amount + expense.amount,
      count: existing.count + 1,
    });
  });

  const breakdown: CategoryBreakdown[] = [];

  categoryMap.forEach((data, category) => {
    breakdown.push({
      category,
      amount: data.amount,
      percentage: (data.amount / total) * 100,
      count: data.count,
    });
  });

  return breakdown.sort((a, b) => b.amount - a.amount);
};

/**
 * Get top spending category
 */
export const getTopCategory = (expenses: Expense[]): CategoryBreakdown | null => {
  const breakdown = calculateCategoryBreakdown(expenses);
  return breakdown.length > 0 ? breakdown[0] : null;
};

// ============================================
// Monthly Analysis
// ============================================

/**
 * Calculate monthly totals
 */
export const calculateMonthlyTotals = (expenses: Expense[]): MonthlyTotal[] => {
  const monthlyMap = new Map<string, { total: number; count: number; year: number }>();

  expenses.forEach((expense) => {
    const date = expense.date.toDate();
    const key = `${getYear(date)}-${String(getMonth(date) + 1).padStart(2, '0')}`;
    const existing = monthlyMap.get(key) || { total: 0, count: 0, year: getYear(date) };

    monthlyMap.set(key, {
      total: existing.total + expense.amount,
      count: existing.count + 1,
      year: getYear(date),
    });
  });

  const totals: MonthlyTotal[] = [];

  monthlyMap.forEach((data, key) => {
    const [year, month] = key.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);

    totals.push({
      month: format(date, 'MMM'),
      year: data.year,
      total: data.total,
      count: data.count,
    });
  });

  return totals.sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year;
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months.indexOf(a.month) - months.indexOf(b.month);
  });
};

// ============================================
// Weekly Analysis
// ============================================

/**
 * Calculate weekly spending trend
 */
export const calculateWeeklyTrend = (
  expenses: Expense[],
  startDate: Date,
  endDate: Date
): WeeklyTrend[] => {
  const weeks = eachWeekOfInterval(
    { start: startDate, end: endDate },
    { weekStartsOn: 0 }
  );

  const weeklyData: WeeklyTrend[] = weeks.map((weekStart, index) => {
    const weekEnd = endOfWeek(weekStart, { weekStartsOn: 0 });

    const weekExpenses = expenses.filter((expense) => {
      const date = expense.date.toDate();
      return date >= weekStart && date <= weekEnd;
    });

    const amount = calculateTotalExpenses(weekExpenses);

    return {
      week: index + 1,
      weekStart,
      weekEnd,
      amount,
      average: 0, // Will be calculated after
    };
  });

  // Calculate running average
  let runningTotal = 0;
  weeklyData.forEach((week, index) => {
    runningTotal += week.amount;
    week.average = runningTotal / (index + 1);
  });

  return weeklyData;
};

// ============================================
// Income vs Expenses Comparison
// ============================================

/**
 * Calculate income vs expenses by month
 * Fills in missing months with zero values for continuous chart display
 */
export const calculateIncomeVsExpenses = (
  income: Income[],
  expenses: Expense[]
): IncomeVsExpense[] => {
  const monthlyData = new Map<string, { income: number; expenses: number }>();

  // Get date range - last 6 months including current
  const now = new Date();
  const months: string[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${getYear(d)}-${String(getMonth(d) + 1).padStart(2, '0')}`;
    months.push(key);
    monthlyData.set(key, { income: 0, expenses: 0 });
  }

  // Process income
  income.forEach((inc) => {
    const date = inc.date.toDate();
    const key = `${getYear(date)}-${String(getMonth(date) + 1).padStart(2, '0')}`;
    if (monthlyData.has(key)) {
      const existing = monthlyData.get(key)!;
      monthlyData.set(key, { ...existing, income: existing.income + inc.amount });
    }
  });

  // Process expenses
  expenses.forEach((exp) => {
    const date = exp.date.toDate();
    const key = `${getYear(date)}-${String(getMonth(date) + 1).padStart(2, '0')}`;
    if (monthlyData.has(key)) {
      const existing = monthlyData.get(key)!;
      monthlyData.set(key, { ...existing, expenses: existing.expenses + exp.amount });
    }
  });

  const result: IncomeVsExpense[] = [];

  // Process in order
  months.forEach((key) => {
    const data = monthlyData.get(key)!;
    const [year, month] = key.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    const net = data.income - data.expenses;
    const savingsRate = data.income > 0 ? (net / data.income) * 100 : 0;

    result.push({
      period: format(date, 'MMM yyyy'),
      income: data.income,
      expenses: data.expenses,
      net,
      savingsRate,
    });
  });

  return result;
};

// ============================================
// Daily Spending Analysis
// ============================================

/**
 * Calculate daily spending with intensity levels
 */
export const calculateDailySpending = (
  expenses: Expense[],
  startDate: Date,
  endDate: Date
): DailySpending[] => {
  const days = eachDayOfInterval({ start: startDate, end: endDate });

  return days.map((day) => {
    const dayExpenses = expenses.filter((expense) => {
      const expDate = expense.date.toDate();
      return (
        expDate.getFullYear() === day.getFullYear() &&
        expDate.getMonth() === day.getMonth() &&
        expDate.getDate() === day.getDate()
      );
    });

    const amount = calculateTotalExpenses(dayExpenses);
    let intensity: 0 | 1 | 2 | 3 | 4 = 0;

    if (amount > 0) {
      if (amount < SPENDING_INTENSITY.LOW) intensity = 1;
      else if (amount < SPENDING_INTENSITY.MEDIUM) intensity = 2;
      else if (amount < SPENDING_INTENSITY.HIGH) intensity = 3;
      else intensity = 4;
    }

    return { date: day, amount, intensity };
  });
};

// ============================================
// Percentage Change Calculations
// ============================================

/**
 * Calculate percentage change between two values
 */
export const calculatePercentageChange = (current: number, previous: number): number => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
};

/**
 * Calculate month-over-month change
 */
export const calculateMoMChange = (expenses: Expense[]): number => {
  const now = new Date();
  const currentMonth = { start: startOfMonth(now), end: endOfMonth(now) };
  const lastMonth = {
    start: startOfMonth(new Date(now.getFullYear(), now.getMonth() - 1, 1)),
    end: endOfMonth(new Date(now.getFullYear(), now.getMonth() - 1, 1)),
  };

  const currentTotal = calculateTotalExpenses(
    expenses.filter((e) => {
      const d = e.date.toDate();
      return d >= currentMonth.start && d <= currentMonth.end;
    })
  );

  const lastTotal = calculateTotalExpenses(
    expenses.filter((e) => {
      const d = e.date.toDate();
      return d >= lastMonth.start && d <= lastMonth.end;
    })
  );

  return calculatePercentageChange(currentTotal, lastTotal);
};
