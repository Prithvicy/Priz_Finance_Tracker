// ============================================
// Core Type Definitions for Priz Finance Tracker
// ============================================

import { Timestamp } from 'firebase/firestore';

// ============================================
// User Types
// ============================================

export type PayFrequency = 'weekly' | 'biweekly' | 'monthly';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  createdAt: Timestamp;
  lastLoginAt: Timestamp;
  defaultSalary: number;
  payFrequency: PayFrequency;
  nextPayday: Timestamp;
  currency: string;
}

export interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  dateFormat: 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD';
  weekStartsOn: 0 | 1;
  notifyOnExpense: boolean;
  notifyOnBudgetWarning: boolean;
  weeklyDigest: boolean;
  showCentsInAmounts: boolean;
  enableAnalytics: boolean;
  updatedAt: Timestamp;
}

// ============================================
// Expense Types
// ============================================

export type ExpenseCategory =
  | 'rent'
  | 'electricity'
  | 'gas'
  | 'wifi'
  | 'groceries'
  | 'amazon'
  | 'eating_out'
  | 'fuel'
  | 'subscriptions'
  | 'travel'
  | 'miscellaneous';

export type CategoryType = 'fixed' | 'variable';

export interface CategoryConfig {
  id: ExpenseCategory;
  name: string;
  icon: string;
  color: string;
  type: CategoryType;
  order: number;
}

export interface Expense {
  id: string;
  userId: string;
  amount: number;
  category: ExpenseCategory;
  description: string;
  date: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  isRecurring: boolean;
  recurringId?: string;
  tags: string[];
}

export interface NewExpense {
  amount: number;
  category: ExpenseCategory;
  description?: string;
  date: Date;
  isRecurring?: boolean;
  tags?: string[];
}

// ============================================
// Income Types
// ============================================

export type IncomeType =
  | 'salary'
  | 'bonus'
  | 'freelance'
  | 'gift'
  | 'refund'
  | 'other';

export interface Income {
  id: string;
  userId: string;
  amount: number;
  type: IncomeType;
  source: string;
  date: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  isRegular: boolean;
  note?: string;
}

export interface NewIncome {
  amount: number;
  type: IncomeType;
  source: string;
  date: Date;
  isRegular?: boolean;
  note?: string;
}

// ============================================
// Analytics Types
// ============================================

export interface MonthlyTotal {
  month: string;
  year: number;
  total: number;
  count: number;
}

export interface CategoryBreakdown {
  category: ExpenseCategory;
  amount: number;
  percentage: number;
  count: number;
}

export interface WeeklyTrend {
  week: number;
  weekStart: Date;
  weekEnd: Date;
  amount: number;
  average: number;
}

export interface IncomeVsExpense {
  period: string;
  income: number;
  expenses: number;
  net: number;
  savingsRate: number;
}

export interface DailySpending {
  date: Date;
  amount: number;
  intensity: 0 | 1 | 2 | 3 | 4;
}

// ============================================
// UI Types
// ============================================

export type DateRange = {
  start: Date;
  end: Date;
};

export type TimePeriod = 'week' | 'month' | 'quarter' | 'year' | 'custom';

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

export interface QuickStat {
  label: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  trend?: 'up' | 'down' | 'neutral';
}

// ============================================
// Form Types
// ============================================

export interface ExpenseFormData {
  amount: string;
  category: ExpenseCategory;
  description: string;
  date: string;
  isRecurring: boolean;
}

export interface IncomeFormData {
  amount: string;
  type: IncomeType;
  source: string;
  date: string;
  isRegular: boolean;
  note: string;
}

// ============================================
// Auth Types
// ============================================

export interface AuthState {
  user: UserProfile | null;
  loading: boolean;
  error: string | null;
}

export interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName?: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

// ============================================
// Goals Types
// ============================================

export type GoalCategory =
  | 'savings'
  | 'investments'
  | 'needs'
  | 'wants'
  | 'debt_repayment'
  | 'emergency_fund';

export interface GoalAllocation {
  category: GoalCategory;
  targetPercentage: number;
  color: string;
  icon: string;
  name: string;
  description: string;
}

export interface UserGoals {
  id: string;
  userId: string;
  allocations: GoalAllocation[];
  monthlyIncomeTarget: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface GoalProgress {
  category: GoalCategory;
  targetPercentage: number;
  actualPercentage: number;
  targetAmount: number;
  actualAmount: number;
  difference: number;
  status: 'on_track' | 'behind' | 'ahead';
}

export interface GoalsAnalytics {
  totalIncome: number;
  totalAllocated: number;
  progress: GoalProgress[];
  overallScore: number;
  trend: number; // percentage change from last month
  insights: GoalInsight[];
}

export interface GoalInsight {
  type: 'warning' | 'success' | 'tip';
  category?: GoalCategory;
  message: string;
  action?: string;
}
