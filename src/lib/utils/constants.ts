// ============================================
// Application Constants
// ============================================

import { CategoryConfig, ExpenseCategory, GoalCategory, GoalAllocation } from '@/types';

// ============================================
// Default Values
// ============================================

export const DEFAULT_SALARY = 0; // New users start with $0 until they set their income
export const DEFAULT_PAY_FREQUENCY = 'biweekly' as const;
export const DEFAULT_CURRENCY = 'USD';

// ============================================
// Currency Configuration
// ============================================

export type CurrencyCode = 'USD' | 'INR' | 'GBP' | 'EUR';

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  name: string;
  locale: string;
  decimals: number;
}

export const CURRENCIES: Record<CurrencyCode, CurrencyConfig> = {
  USD: {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar',
    locale: 'en-US',
    decimals: 2,
  },
  INR: {
    code: 'INR',
    symbol: '₹',
    name: 'Indian Rupee',
    locale: 'en-IN',
    decimals: 2,
  },
  GBP: {
    code: 'GBP',
    symbol: '£',
    name: 'British Pound',
    locale: 'en-GB',
    decimals: 2,
  },
  EUR: {
    code: 'EUR',
    symbol: '€',
    name: 'Euro',
    locale: 'de-DE',
    decimals: 2,
  },
};

// ============================================
// Category Configuration
// ============================================

export const CATEGORIES: Record<ExpenseCategory, CategoryConfig> = {
  rent: {
    id: 'rent',
    name: 'Rent',
    icon: 'Home',
    color: '#3B82F6',
    type: 'fixed',
    order: 1,
  },
  electricity: {
    id: 'electricity',
    name: 'Electricity',
    icon: 'Zap',
    color: '#EAB308',
    type: 'fixed',
    order: 2,
  },
  gas: {
    id: 'gas',
    name: 'Gas',
    icon: 'Flame',
    color: '#F97316',
    type: 'fixed',
    order: 3,
  },
  wifi: {
    id: 'wifi',
    name: 'WiFi',
    icon: 'Wifi',
    color: '#8B5CF6',
    type: 'fixed',
    order: 4,
  },
  groceries: {
    id: 'groceries',
    name: 'Groceries',
    icon: 'ShoppingCart',
    color: '#22C55E',
    type: 'fixed',
    order: 5,
  },
  amazon: {
    id: 'amazon',
    name: 'Amazon',
    icon: 'Package',
    color: '#FB923C',
    type: 'variable',
    order: 6,
  },
  eating_out: {
    id: 'eating_out',
    name: 'Eating Out',
    icon: 'Utensils',
    color: '#EF4444',
    type: 'variable',
    order: 7,
  },
  fuel: {
    id: 'fuel',
    name: 'Fuel',
    icon: 'Fuel',
    color: '#0EA5E9',
    type: 'variable',
    order: 8,
  },
  subscriptions: {
    id: 'subscriptions',
    name: 'Subscriptions',
    icon: 'RefreshCw',
    color: '#A855F7',
    type: 'fixed',
    order: 9,
  },
  travel: {
    id: 'travel',
    name: 'Travel',
    icon: 'Plane',
    color: '#06B6D4',
    type: 'variable',
    order: 10,
  },
  miscellaneous: {
    id: 'miscellaneous',
    name: 'Miscellaneous',
    icon: 'CreditCard',
    color: '#6B7280',
    type: 'variable',
    order: 11,
  },
};

export const FIXED_CATEGORIES: ExpenseCategory[] = ['rent', 'electricity', 'gas', 'wifi', 'groceries', 'subscriptions'];
export const VARIABLE_CATEGORIES: ExpenseCategory[] = ['amazon', 'eating_out', 'fuel', 'travel', 'miscellaneous'];

// ============================================
// Income Type Configuration
// ============================================

export const INCOME_TYPES = {
  salary: { name: 'Salary', icon: 'Briefcase', color: '#22C55E' },
  bonus: { name: 'Bonus', icon: 'Gift', color: '#8B5CF6' },
  freelance: { name: 'Freelance', icon: 'Laptop', color: '#3B82F6' },
  gift: { name: 'Gift', icon: 'Heart', color: '#EC4899' },
  refund: { name: 'Refund', icon: 'RotateCcw', color: '#14B8A6' },
  other: { name: 'Other', icon: 'DollarSign', color: '#6B7280' },
} as const;

// ============================================
// Time & Date
// ============================================

export const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export const MONTHS_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

export const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
export const DAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// ============================================
// UI Configuration
// ============================================

export const ANIMATION_DURATION = 200;
export const TOAST_DURATION = 4000;
export const DEBOUNCE_DELAY = 300;

export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

// ============================================
// Chart Colors
// ============================================

export const CHART_COLORS = [
  '#3B82F6', // Blue
  '#22C55E', // Green
  '#EAB308', // Yellow
  '#F97316', // Orange
  '#EF4444', // Red
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#14B8A6', // Teal
];

// ============================================
// Spending Intensity Thresholds (in cents)
// ============================================

export const SPENDING_INTENSITY = {
  LOW: 5000,       // $50
  MEDIUM: 10000,   // $100
  HIGH: 20000,     // $200
  VERY_HIGH: 30000, // $300+
};

// ============================================
// Goal Categories Configuration
// ============================================

export const GOAL_CATEGORIES: Record<GoalCategory, Omit<GoalAllocation, 'targetPercentage'>> = {
  savings: {
    category: 'savings',
    name: 'Savings',
    icon: 'PiggyBank',
    color: '#22C55E',
    description: 'Money set aside for future use',
  },
  investments: {
    category: 'investments',
    name: 'Investments',
    icon: 'TrendingUp',
    color: '#8B5CF6',
    description: 'Stocks, mutual funds, crypto, etc.',
  },
  needs: {
    category: 'needs',
    name: 'Needs',
    icon: 'Home',
    color: '#3B82F6',
    description: 'Essential expenses (rent, utilities, groceries)',
  },
  wants: {
    category: 'wants',
    name: 'Wants',
    icon: 'ShoppingBag',
    color: '#F97316',
    description: 'Non-essential lifestyle expenses',
  },
  debt_repayment: {
    category: 'debt_repayment',
    name: 'Debt Repayment',
    icon: 'CreditCard',
    color: '#EF4444',
    description: 'Paying off loans, credit cards',
  },
  emergency_fund: {
    category: 'emergency_fund',
    name: 'Emergency Fund',
    icon: 'Shield',
    color: '#14B8A6',
    description: 'Safety net for unexpected expenses',
  },
};

// Default goal allocations (50/30/20 rule extended)
export const DEFAULT_GOAL_ALLOCATIONS: GoalAllocation[] = [
  { ...GOAL_CATEGORIES.needs, targetPercentage: 50 },
  { ...GOAL_CATEGORIES.wants, targetPercentage: 20 },
  { ...GOAL_CATEGORIES.savings, targetPercentage: 15 },
  { ...GOAL_CATEGORIES.investments, targetPercentage: 10 },
  { ...GOAL_CATEGORIES.emergency_fund, targetPercentage: 5 },
];
