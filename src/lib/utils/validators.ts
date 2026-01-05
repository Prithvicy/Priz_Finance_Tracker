// ============================================
// Zod Validation Schemas
// ============================================

import { z } from 'zod';

// ============================================
// Expense Validation
// ============================================

export const expenseCategories = [
  'rent',
  'electricity',
  'gas',
  'wifi',
  'groceries',
  'amazon',
  'eating_out',
  'miscellaneous',
] as const;

export const expenseFormSchema = z.object({
  amount: z
    .string()
    .min(1, 'Amount is required')
    .refine((val) => {
      const num = parseFloat(val);
      return !isNaN(num) && num > 0;
    }, 'Amount must be greater than 0')
    .refine((val) => {
      const num = parseFloat(val);
      return num < 1000000;
    }, 'Amount must be less than $1,000,000'),
  category: z.enum(expenseCategories, {
    message: 'Please select a category',
  }),
  description: z.string().max(200, 'Description must be less than 200 characters').optional(),
  date: z.string().min(1, 'Date is required'),
  isRecurring: z.boolean(),
});

export type ExpenseFormSchema = z.infer<typeof expenseFormSchema>;

// ============================================
// Income Validation
// ============================================

export const incomeTypes = [
  'salary',
  'bonus',
  'freelance',
  'gift',
  'refund',
  'other',
] as const;

export const incomeFormSchema = z.object({
  amount: z
    .string()
    .min(1, 'Amount is required')
    .refine((val) => {
      const num = parseFloat(val);
      return !isNaN(num) && num > 0;
    }, 'Amount must be greater than 0')
    .refine((val) => {
      const num = parseFloat(val);
      return num < 10000000;
    }, 'Amount must be less than $10,000,000'),
  type: z.enum(incomeTypes, {
    message: 'Please select an income type',
  }),
  source: z
    .string()
    .min(1, 'Source is required')
    .max(100, 'Source must be less than 100 characters'),
  date: z.string().min(1, 'Date is required'),
  isRegular: z.boolean(),
  note: z.string().max(300, 'Note must be less than 300 characters').optional(),
});

export type IncomeFormSchema = z.infer<typeof incomeFormSchema>;

// ============================================
// Auth Validation
// ============================================

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export type LoginSchema = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  displayName: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters'),
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export type RegisterSchema = z.infer<typeof registerSchema>;

// ============================================
// Settings Validation
// ============================================

export const settingsSchema = z.object({
  defaultSalary: z
    .string()
    .min(1, 'Salary is required')
    .refine((val) => {
      const num = parseFloat(val);
      return !isNaN(num) && num > 0;
    }, 'Salary must be greater than 0'),
  payFrequency: z.enum(['weekly', 'biweekly', 'monthly']),
  theme: z.enum(['light', 'dark', 'system']),
  dateFormat: z.enum(['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD']),
});

export type SettingsSchema = z.infer<typeof settingsSchema>;

// ============================================
// Utility Validators
// ============================================

export const isValidAmount = (value: string): boolean => {
  const num = parseFloat(value);
  return !isNaN(num) && num > 0 && num < 10000000;
};

export const isValidDate = (value: string): boolean => {
  const date = new Date(value);
  return !isNaN(date.getTime());
};

export const sanitizeString = (value: string): string => {
  return value.trim().replace(/<[^>]*>/g, '');
};
