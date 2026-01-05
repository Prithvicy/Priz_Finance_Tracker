// ============================================
// Date Utility Functions
// ============================================

import {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  subDays,
  subWeeks,
  subMonths,
  subYears,
  addDays,
  addWeeks,
  eachDayOfInterval,
  eachWeekOfInterval,
  eachMonthOfInterval,
  isSameDay,
  isSameMonth,
  isSameYear,
  differenceInDays,
  getDay,
  getWeek,
  getMonth,
  getYear,
} from 'date-fns';
import { DateRange, TimePeriod } from '@/types';

// ============================================
// Date Range Generators
// ============================================

/**
 * Get date range for a given period
 */
export const getDateRange = (period: TimePeriod, referenceDate = new Date()): DateRange => {
  const today = startOfDay(referenceDate);

  switch (period) {
    case 'week':
      return {
        start: startOfWeek(today, { weekStartsOn: 0 }),
        end: endOfWeek(today, { weekStartsOn: 0 }),
      };
    case 'month':
      return {
        start: startOfMonth(today),
        end: endOfMonth(today),
      };
    case 'quarter':
      const quarterStart = startOfMonth(subMonths(today, 2));
      return {
        start: quarterStart,
        end: endOfMonth(today),
      };
    case 'year':
      return {
        start: startOfYear(today),
        end: endOfYear(today),
      };
    default:
      return {
        start: startOfMonth(today),
        end: endOfMonth(today),
      };
  }
};

/**
 * Get previous period date range
 */
export const getPreviousPeriod = (period: TimePeriod, referenceDate = new Date()): DateRange => {
  const today = startOfDay(referenceDate);

  switch (period) {
    case 'week':
      const prevWeek = subWeeks(today, 1);
      return {
        start: startOfWeek(prevWeek, { weekStartsOn: 0 }),
        end: endOfWeek(prevWeek, { weekStartsOn: 0 }),
      };
    case 'month':
      const prevMonth = subMonths(today, 1);
      return {
        start: startOfMonth(prevMonth),
        end: endOfMonth(prevMonth),
      };
    case 'quarter':
      const prevQuarter = subMonths(today, 5);
      return {
        start: startOfMonth(prevQuarter),
        end: endOfMonth(subMonths(today, 3)),
      };
    case 'year':
      const prevYear = subYears(today, 1);
      return {
        start: startOfYear(prevYear),
        end: endOfYear(prevYear),
      };
    default:
      const prev = subMonths(today, 1);
      return {
        start: startOfMonth(prev),
        end: endOfMonth(prev),
      };
  }
};

// ============================================
// Pay Period Calculations
// ============================================

/**
 * Calculate next payday from a reference date (bi-weekly)
 */
export const getNextPayday = (lastPayday: Date): Date => {
  return addDays(lastPayday, 14);
};

/**
 * Calculate days until next payday
 */
export const getDaysUntilPayday = (nextPayday: Date): number => {
  const today = startOfDay(new Date());
  const payday = startOfDay(nextPayday);
  return Math.max(0, differenceInDays(payday, today));
};

/**
 * Get current pay period
 */
export const getCurrentPayPeriod = (lastPayday: Date): DateRange => {
  const start = startOfDay(lastPayday);
  const end = endOfDay(addDays(start, 13)); // 14 day period
  return { start, end };
};

// ============================================
// Interval Generators
// ============================================

/**
 * Get all days in a date range
 */
export const getDaysInRange = (range: DateRange): Date[] => {
  return eachDayOfInterval({ start: range.start, end: range.end });
};

/**
 * Get all weeks in a date range
 */
export const getWeeksInRange = (range: DateRange): Date[] => {
  return eachWeekOfInterval({ start: range.start, end: range.end }, { weekStartsOn: 0 });
};

/**
 * Get all months in a date range
 */
export const getMonthsInRange = (range: DateRange): Date[] => {
  return eachMonthOfInterval({ start: range.start, end: range.end });
};

/**
 * Get last N months
 */
export const getLastNMonths = (n: number, referenceDate = new Date()): DateRange => {
  const end = endOfMonth(referenceDate);
  const start = startOfMonth(subMonths(referenceDate, n - 1));
  return { start, end };
};

/**
 * Get last N weeks
 */
export const getLastNWeeks = (n: number, referenceDate = new Date()): DateRange => {
  const end = endOfWeek(referenceDate, { weekStartsOn: 0 });
  const start = startOfWeek(subWeeks(referenceDate, n - 1), { weekStartsOn: 0 });
  return { start, end };
};

// ============================================
// Date Comparison Helpers
// ============================================

/**
 * Check if a date is within a date range
 */
export const isDateInRange = (date: Date, range: DateRange): boolean => {
  return date >= range.start && date <= range.end;
};

/**
 * Check if two dates are the same day
 */
export const areSameDay = (date1: Date, date2: Date): boolean => {
  return isSameDay(date1, date2);
};

/**
 * Check if two dates are in the same month
 */
export const areSameMonth = (date1: Date, date2: Date): boolean => {
  return isSameMonth(date1, date2);
};

/**
 * Check if two dates are in the same year
 */
export const areSameYear = (date1: Date, date2: Date): boolean => {
  return isSameYear(date1, date2);
};

// ============================================
// Date Part Extractors
// ============================================

export const getDayOfWeek = (date: Date): number => getDay(date);
export const getWeekNumber = (date: Date): number => getWeek(date);
export const getMonthNumber = (date: Date): number => getMonth(date);
export const getYearNumber = (date: Date): number => getYear(date);

// ============================================
// Period Labels
// ============================================

/**
 * Get week label (e.g., "Week 1", "Week 2")
 */
export const getWeekLabel = (weekNumber: number): string => {
  return `Week ${weekNumber}`;
};

/**
 * Get month-year key for grouping
 */
export const getMonthYearKey = (date: Date): string => {
  return `${getYearNumber(date)}-${String(getMonthNumber(date) + 1).padStart(2, '0')}`;
};
