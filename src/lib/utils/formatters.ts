// ============================================
// Formatting Utility Functions
// ============================================

import { format, formatDistanceToNow, isToday, isYesterday, isTomorrow } from 'date-fns';
import { Timestamp } from 'firebase/firestore';

// ============================================
// Currency Formatting
// ============================================

/**
 * Format cents to currency string
 * @param cents Amount in cents (e.g., 244800 = $2,448.00)
 * @param showCents Whether to show cents
 */
export const formatCurrency = (cents: number, showCents = true): string => {
  const dollars = cents / 100;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: showCents ? 2 : 0,
    maximumFractionDigits: showCents ? 2 : 0,
  }).format(dollars);
};

/**
 * Format currency for compact display (e.g., $2.4K)
 */
export const formatCurrencyCompact = (cents: number): string => {
  const dollars = cents / 100;
  if (dollars >= 1000000) {
    return `$${(dollars / 1000000).toFixed(1)}M`;
  }
  if (dollars >= 1000) {
    return `$${(dollars / 1000).toFixed(1)}K`;
  }
  return formatCurrency(cents, false);
};

/**
 * Parse currency string to cents
 */
export const parseCurrencyToCents = (value: string): number => {
  const cleaned = value.replace(/[^0-9.-]/g, '');
  const dollars = parseFloat(cleaned) || 0;
  return Math.round(dollars * 100);
};

// ============================================
// Date Formatting
// ============================================

/**
 * Format date for display
 */
export const formatDate = (date: Date | Timestamp, formatStr = 'MMM d, yyyy'): string => {
  const d = date instanceof Timestamp ? date.toDate() : date;
  return format(d, formatStr);
};

/**
 * Format date with smart relative labels
 */
export const formatDateSmart = (date: Date | Timestamp): string => {
  const d = date instanceof Timestamp ? date.toDate() : date;

  if (isToday(d)) return 'Today';
  if (isYesterday(d)) return 'Yesterday';
  if (isTomorrow(d)) return 'Tomorrow';

  return format(d, 'MMM d, yyyy');
};

/**
 * Format date as relative time (e.g., "2 hours ago")
 */
export const formatRelativeTime = (date: Date | Timestamp): string => {
  const d = date instanceof Timestamp ? date.toDate() : date;
  return formatDistanceToNow(d, { addSuffix: true });
};

/**
 * Format date for input fields
 */
export const formatDateForInput = (date: Date): string => {
  return format(date, 'yyyy-MM-dd');
};

/**
 * Parse date from input field
 */
export const parseDateFromInput = (value: string): Date => {
  return new Date(value + 'T00:00:00');
};

/**
 * Format month and year
 */
export const formatMonthYear = (date: Date): string => {
  return format(date, 'MMMM yyyy');
};

/**
 * Format short month
 */
export const formatShortMonth = (date: Date): string => {
  return format(date, 'MMM');
};

// ============================================
// Number Formatting
// ============================================

/**
 * Format percentage
 */
export const formatPercentage = (value: number, decimals = 1): string => {
  return `${value.toFixed(decimals)}%`;
};

/**
 * Format number with commas
 */
export const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('en-US').format(value);
};

/**
 * Format change percentage with sign
 */
export const formatChange = (value: number): string => {
  const sign = value > 0 ? '+' : '';
  return `${sign}${formatPercentage(value)}`;
};

// ============================================
// Text Formatting
// ============================================

/**
 * Capitalize first letter
 */
export const capitalize = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * Format category name for display
 */
export const formatCategoryName = (category: string): string => {
  return category
    .split('_')
    .map(capitalize)
    .join(' ');
};

/**
 * Truncate text with ellipsis
 */
export const truncate = (str: string, maxLength: number): string => {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 3) + '...';
};

// ============================================
// Ordinal Formatting
// ============================================

/**
 * Get ordinal suffix (1st, 2nd, 3rd, etc.)
 */
export const getOrdinalSuffix = (n: number): string => {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
};
