'use client';

// ============================================
// Mobile-Friendly Date Picker Component
// ============================================

import { useState, forwardRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Calendar, X } from 'lucide-react';
import { cn } from '@/lib/cn';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  isSameMonth,
  addMonths,
  subMonths,
  isToday,
  getDay,
  startOfWeek,
  endOfWeek,
} from 'date-fns';

// ============================================
// Types
// ============================================

interface DatePickerProps {
  label?: string;
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
  helperText?: string;
  placeholder?: string;
  minDate?: Date;
  maxDate?: Date;
  name?: string;
  onBlur?: () => void;
}

// ============================================
// Component
// ============================================

const DatePicker = forwardRef<HTMLInputElement, DatePickerProps>(
  (
    {
      label,
      value,
      onChange,
      error,
      helperText,
      placeholder = 'Select date',
      minDate,
      maxDate,
      name,
      onBlur,
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(
      value ? new Date(value) : new Date()
    );

    const selectedDate = value ? new Date(value) : null;

    // Update currentMonth when value changes
    useEffect(() => {
      if (value) {
        setCurrentMonth(new Date(value));
      }
    }, [value]);

    const handleDateSelect = (date: Date) => {
      const formatted = format(date, 'yyyy-MM-dd');
      onChange?.(formatted);
      setIsOpen(false);
      onBlur?.();
    };

    const handlePrevMonth = () => {
      setCurrentMonth(subMonths(currentMonth, 1));
    };

    const handleNextMonth = () => {
      setCurrentMonth(addMonths(currentMonth, 1));
    };

    // Get all days to display (including padding days from prev/next months)
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calendarStart = startOfWeek(monthStart);
    const calendarEnd = endOfWeek(monthEnd);
    const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const isDateDisabled = (date: Date) => {
      if (minDate && date < minDate) return true;
      if (maxDate && date > maxDate) return true;
      return false;
    };

    return (
      <div className="w-full">
        {/* Hidden input for form compatibility */}
        <input
          ref={ref}
          type="hidden"
          name={name}
          value={value || ''}
        />

        {label && (
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            {label}
          </label>
        )}

        {/* Trigger Button */}
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className={cn(
            'w-full h-10 px-3 rounded-lg border bg-white text-left',
            'flex items-center justify-between gap-2',
            'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent',
            'dark:bg-gray-900 dark:border-gray-700',
            'transition-colors duration-200',
            error
              ? 'border-red-500'
              : 'border-gray-300 dark:border-gray-600',
            selectedDate
              ? 'text-gray-900 dark:text-gray-100'
              : 'text-gray-400 dark:text-gray-500'
          )}
        >
          <span>
            {selectedDate ? format(selectedDate, 'MMM d, yyyy') : placeholder}
          </span>
          <Calendar className="h-4 w-4 text-gray-400" />
        </button>

        {error && (
          <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">{error}</p>
        )}
        {helperText && !error && (
          <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400">
            {helperText}
          </p>
        )}

        {/* Calendar Modal */}
        <AnimatePresence>
          {isOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsOpen(false)}
                className="fixed inset-0 bg-black/50 z-50"
              />

              {/* Calendar Panel */}
              <motion.div
                initial={{ opacity: 0, y: 100 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 100 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className={cn(
                  'fixed bottom-0 left-0 right-0 z-50',
                  'bg-white dark:bg-gray-900 rounded-t-2xl',
                  'p-4 pb-8 shadow-xl',
                  'max-h-[80vh] overflow-auto',
                  'sm:bottom-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2',
                  'sm:rounded-2xl sm:max-w-sm sm:w-full'
                )}
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Select Date
                  </h3>
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <X className="h-5 w-5 text-gray-500" />
                  </button>
                </div>

                {/* Month Navigation */}
                <div className="flex items-center justify-between mb-4">
                  <button
                    type="button"
                    onClick={handlePrevMonth}
                    className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <ChevronLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  </button>
                  <span className="text-base font-medium text-gray-900 dark:text-white">
                    {format(currentMonth, 'MMMM yyyy')}
                  </span>
                  <button
                    type="button"
                    onClick={handleNextMonth}
                    className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <ChevronRight className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  </button>
                </div>

                {/* Week Days Header */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {weekDays.map((day) => (
                    <div
                      key={day}
                      className="text-center text-xs font-medium text-gray-500 dark:text-gray-400 py-2"
                    >
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-1">
                  {calendarDays.map((day, idx) => {
                    const isSelected = selectedDate && isSameDay(day, selectedDate);
                    const isCurrentMonth = isSameMonth(day, currentMonth);
                    const isTodayDate = isToday(day);
                    const disabled = isDateDisabled(day);

                    return (
                      <button
                        key={idx}
                        type="button"
                        disabled={disabled}
                        onClick={() => handleDateSelect(day)}
                        className={cn(
                          'aspect-square flex items-center justify-center rounded-full',
                          'text-sm font-medium transition-colors',
                          'min-h-[44px]', // Touch-friendly size
                          disabled && 'opacity-30 cursor-not-allowed',
                          !isCurrentMonth && 'text-gray-300 dark:text-gray-600',
                          isCurrentMonth && !isSelected && 'text-gray-900 dark:text-gray-100',
                          isCurrentMonth && !isSelected && 'hover:bg-gray-100 dark:hover:bg-gray-800',
                          isTodayDate && !isSelected && 'ring-2 ring-indigo-500 ring-inset',
                          isSelected && 'bg-indigo-600 text-white hover:bg-indigo-700'
                        )}
                      >
                        {format(day, 'd')}
                      </button>
                    );
                  })}
                </div>

                {/* Quick Actions */}
                <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={() => handleDateSelect(new Date())}
                    className={cn(
                      'flex-1 py-2.5 px-4 rounded-lg text-sm font-medium',
                      'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300',
                      'hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors'
                    )}
                  >
                    Today
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      'flex-1 py-2.5 px-4 rounded-lg text-sm font-medium',
                      'bg-indigo-600 text-white',
                      'hover:bg-indigo-700 transition-colors'
                    )}
                  >
                    Done
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    );
  }
);

DatePicker.displayName = 'DatePicker';

export { DatePicker };
export type { DatePickerProps };
