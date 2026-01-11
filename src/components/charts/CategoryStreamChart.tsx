'use client';

// ============================================
// Category Stream Chart - Stunning Visualization
// Beautiful stream/area chart showing category trends over time
// ============================================

import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { Check, Layers } from 'lucide-react';
import { Expense } from '@/types';
import { MONTHS_SHORT } from '@/lib/utils/constants';
import { useSettings, useCategories } from '@/hooks';
import { cn } from '@/lib/cn';
import { getMonth, getYear } from 'date-fns';
import type { UnifiedCategory } from '@/hooks/useCategories';

// ============================================
// Types
// ============================================

interface CategoryStreamChartProps {
  expenses: Expense[];
  isLoading?: boolean;
}

interface MonthlyData {
  month: string;
  monthIndex: number;
  [key: string]: number | string;
}

// ============================================
// Category Chip Component
// ============================================

const CategoryChip = ({
  category,
  isSelected,
  onClick,
}: {
  category: UnifiedCategory;
  isSelected: boolean;
  onClick: () => void;
}) => {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={cn(
        'relative px-3 py-2 rounded-xl text-sm font-medium transition-all duration-300',
        'flex items-center gap-2 border-2',
        isSelected
          ? 'border-transparent shadow-lg'
          : 'border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50'
      )}
      style={{
        background: isSelected ? `${category.color}20` : undefined,
        borderColor: isSelected ? category.color : undefined,
        color: isSelected ? category.color : undefined,
      }}
    >
      {isSelected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center"
          style={{ background: category.color }}
        >
          <Check className="h-2.5 w-2.5 text-white" />
        </motion.div>
      )}
      <div
        className="w-3 h-3 rounded-full"
        style={{ background: category.color }}
      />
      <span className={cn(!isSelected && 'text-gray-600 dark:text-gray-400')}>
        {category.name}
      </span>
    </motion.button>
  );
};

// ============================================
// Custom Tooltip
// ============================================

const CustomTooltip = ({
  active,
  payload,
  label,
  formatCurrency,
  getCategoryById,
}: {
  active?: boolean;
  payload?: Array<{ dataKey: string; value: number; color: string }>;
  label?: string;
  formatCurrency: (cents: number) => string;
  getCategoryById: (id: string) => UnifiedCategory | undefined;
}) => {
  if (!active || !payload?.length) return null;

  const total = payload.reduce((sum, p) => sum + (p.value || 0), 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-xl p-4 min-w-[200px]"
    >
      <p className="text-sm font-semibold text-gray-900 dark:text-white mb-3 pb-2 border-b border-gray-200 dark:border-gray-700">
        {label}
      </p>
      <div className="space-y-2">
        {payload
          .filter((p) => p.value > 0)
          .sort((a, b) => b.value - a.value)
          .map((entry) => {
            const cat = getCategoryById(entry.dataKey);
            return (
              <div key={entry.dataKey} className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ background: entry.color }}
                  />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {cat?.name || entry.dataKey}
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {formatCurrency(entry.value)}
                </span>
              </div>
            );
          })}
      </div>
      {payload.length > 1 && (
        <div className="mt-3 pt-2 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <span className="text-sm font-medium text-gray-500">Total</span>
          <span className="text-sm font-bold text-gray-900 dark:text-white">
            {formatCurrency(total)}
          </span>
        </div>
      )}
    </motion.div>
  );
};

// ============================================
// Main Component
// ============================================

const CategoryStreamChart = ({ expenses, isLoading }: CategoryStreamChartProps) => {
  const { formatCurrency, settings } = useSettings();
  const { allCategoriesIncludingDeleted, getCategoryById } = useCategories();

  // Initialize with all categories selected by default
  // Use a ref to track if we've done initial setup
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[] | null>(null);

  // Initialize selected categories - select all by default
  useEffect(() => {
    if (allCategoriesIncludingDeleted.length > 0 && selectedCategoryIds === null) {
      setSelectedCategoryIds(allCategoriesIncludingDeleted.map(c => c.id));
    }
  }, [allCategoriesIncludingDeleted, selectedCategoryIds]);

  // When new categories are added, include them in selection
  useEffect(() => {
    if (selectedCategoryIds !== null && allCategoriesIncludingDeleted.length > 0) {
      const currentIds = new Set(selectedCategoryIds);
      const newCategories = allCategoriesIncludingDeleted.filter(c => !currentIds.has(c.id));
      if (newCategories.length > 0) {
        setSelectedCategoryIds(prev => [...(prev || []), ...newCategories.map(c => c.id)]);
      }
    }
  }, [allCategoriesIncludingDeleted, selectedCategoryIds]);

  // Use empty array while loading to prevent errors
  const effectiveSelectedIds = selectedCategoryIds || [];

  // Toggle category selection
  const toggleCategory = (categoryId: string) => {
    setSelectedCategoryIds((prev) => {
      const current = prev || [];
      if (current.includes(categoryId)) {
        // Don't allow deselecting all
        if (current.length === 1) return current;
        return current.filter((c) => c !== categoryId);
      }
      return [...current, categoryId];
    });
  };

  // Select all categories
  const selectAll = () => setSelectedCategoryIds(allCategoriesIncludingDeleted.map(c => c.id));

  // Process data for chart - monthly breakdown by category
  const chartData = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const allCategoryIds = allCategoriesIncludingDeleted.map(c => c.id);
    const monthlyData: MonthlyData[] = MONTHS_SHORT.map((month, idx) => ({
      month,
      monthIndex: idx,
      ...Object.fromEntries(allCategoryIds.map((cat) => [cat, 0])),
    }));

    expenses.forEach((expense) => {
      const date = expense.date.toDate();
      const year = getYear(date);
      const month = getMonth(date);
      const categoryId = expense.category as string;

      // Only include current year expenses for selected categories
      if (year === currentYear && effectiveSelectedIds.includes(categoryId)) {
        (monthlyData[month] as Record<string, number>)[categoryId] =
          ((monthlyData[month] as Record<string, number>)[categoryId] || 0) + expense.amount;
      }
    });

    return monthlyData;
  }, [expenses, effectiveSelectedIds, allCategoriesIncludingDeleted]);

  // Get gradient definitions for each category
  const gradientDefs = useMemo(() => {
    return effectiveSelectedIds.map((categoryId) => {
      const cat = getCategoryById(categoryId);
      const color = cat?.color || '#6B7280';
      return (
        <linearGradient key={categoryId} id={`gradient-${categoryId}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.8} />
          <stop offset="100%" stopColor={color} stopOpacity={0.1} />
        </linearGradient>
      );
    });
  }, [effectiveSelectedIds, getCategoryById]);

  // Currency symbol for Y axis
  const currencySymbol = settings.currency === 'INR' ? '₹' : '$';

  if (isLoading) {
    return (
      <div className="glass-card rounded-2xl p-6">
        <div className="h-8 w-48 bg-gray-200 dark:bg-gray-800 rounded animate-pulse mb-4" />
        <div className="h-[350px] bg-gray-100 dark:bg-gray-800/50 rounded-xl animate-pulse" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass-card rounded-2xl p-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Layers className="h-5 w-5 text-indigo-500" />
            Yearly Category Trends
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Visualize your spending patterns across categories
          </p>
        </div>
        <button
          onClick={selectAll}
          className={cn(
            'text-sm font-medium px-4 py-2 rounded-lg transition-all',
            effectiveSelectedIds.length === allCategoriesIncludingDeleted.length
              ? 'bg-indigo-500/10 text-indigo-500'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
          )}
        >
          {effectiveSelectedIds.length === allCategoriesIncludingDeleted.length ? 'All Selected' : 'Select All'}
        </button>
      </div>

      {/* Category Filters - Scrollable on mobile */}
      <div className="relative -mx-6 px-6 mb-6">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory">
          <AnimatePresence>
            {allCategoriesIncludingDeleted.map((category) => (
              <div key={category.id} className="snap-start flex-shrink-0">
                <CategoryChip
                  category={category}
                  isSelected={effectiveSelectedIds.includes(category.id)}
                  onClick={() => toggleCategory(category.id)}
                />
              </div>
            ))}
          </AnimatePresence>
        </div>
        {/* Fade indicators for scroll */}
        <div className="absolute left-0 top-0 bottom-2 w-6 bg-gradient-to-r from-white dark:from-gray-900 to-transparent pointer-events-none sm:hidden" />
        <div className="absolute right-0 top-0 bottom-2 w-6 bg-gradient-to-l from-white dark:from-gray-900 to-transparent pointer-events-none sm:hidden" />
      </div>

      {/* Chart */}
      <div className="h-[280px] sm:h-[350px] -mx-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <defs>{gradientDefs}</defs>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="rgba(148, 163, 184, 0.1)"
            />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#94a3b8', fontSize: 12 }}
              dy={10}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#94a3b8', fontSize: 12 }}
              tickFormatter={(value) => `${currencySymbol}${(value / 100).toLocaleString()}`}
              width={70}
            />
            <Tooltip
              content={({ active, payload, label }) => (
                <CustomTooltip
                  active={active}
                  payload={payload as Array<{ dataKey: string; value: number; color: string }>}
                  label={String(label ?? '')}
                  formatCurrency={formatCurrency}
                  getCategoryById={getCategoryById}
                />
              )}
              cursor={{ stroke: 'rgba(148, 163, 184, 0.3)', strokeWidth: 1 }}
            />
            {effectiveSelectedIds.map((categoryId, index) => {
              const cat = getCategoryById(categoryId);
              return (
                <Area
                  key={categoryId}
                  type="monotone"
                  dataKey={categoryId}
                  stackId="1"
                  stroke={cat?.color || '#6B7280'}
                  strokeWidth={2}
                  fill={`url(#gradient-${categoryId})`}
                  animationDuration={1000}
                  animationBegin={index * 100}
                />
              );
            })}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-4 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700/50">
        {effectiveSelectedIds.map((categoryId) => {
          const cat = getCategoryById(categoryId);
          return (
            <div key={categoryId} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ background: cat?.color || '#6B7280' }}
              />
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {cat?.name || categoryId}
              </span>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};

export { CategoryStreamChart };
