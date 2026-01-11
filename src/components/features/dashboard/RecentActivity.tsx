'use client';

// ============================================
// Recent Activity Component
// ============================================

import { useCallback } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ChevronRight, Trash2 } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, Button, Badge } from '@/components/ui';
import { Expense } from '@/types';
import { CATEGORIES } from '@/lib/utils/constants';
import { formatDateSmart } from '@/lib/utils/formatters';
import { useSettings, useCategories } from '@/hooks';
import { cn } from '@/lib/cn';

// ============================================
// Types
// ============================================

interface RecentActivityProps {
  expenses: Expense[];
  isLoading?: boolean;
  onDelete?: (id: string) => void;
}

// ============================================
// Activity Item Component
// ============================================

interface ActivityItemProps {
  expense: Expense;
  index: number;
  onDelete?: (id: string) => void;
  formatCurrency: (cents: number) => string;
  getCategoryInfo: (id: string) => { name: string; icon: string; color: string; type: string };
}

const ActivityItem = ({ expense, index, onDelete, formatCurrency, getCategoryInfo }: ActivityItemProps) => {
  const category = getCategoryInfo(expense.category as string);
  const IconComponent = LucideIcons[category.icon as keyof typeof LucideIcons] as React.ElementType;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05, duration: 0.2 }}
      className="group flex items-center gap-4 py-3 border-b border-gray-100 dark:border-gray-800 last:border-0"
    >
      {/* Icon */}
      <div
        className="flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center"
        style={{ backgroundColor: `${category.color}20` }}
      >
        {IconComponent && (
          <IconComponent className="h-5 w-5" style={{ color: category.color }} />
        )}
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
            {category.name}
          </p>
          <Badge variant="default" size="sm">
            {category.type}
          </Badge>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
          {formatDateSmart(expense.date)}
          {expense.description && ` • ${expense.description}`}
        </p>
      </div>

      {/* Amount */}
      <div className="flex items-center gap-2">
        <p className="text-sm font-semibold text-gray-900 dark:text-white">
          -{formatCurrency(expense.amount)}
        </p>
        {onDelete && (
          <button
            onClick={() => onDelete(expense.id)}
            className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 transition-all"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>
    </motion.div>
  );
};

// ============================================
// Main Component
// ============================================

const RecentActivity = ({ expenses, isLoading, onDelete }: RecentActivityProps) => {
  const { formatCurrency } = useSettings();
  const { getCategoryById } = useCategories();

  // Helper to get category info (supports both default and custom)
  const getCategoryInfo = useCallback((categoryId: string) => {
    const unified = getCategoryById(categoryId);
    if (unified) {
      return { name: unified.name, icon: unified.icon, color: unified.color, type: unified.type };
    }
    if (categoryId in CATEGORIES) {
      const config = CATEGORIES[categoryId as keyof typeof CATEGORIES];
      return { name: config.name, icon: config.icon, color: config.color, type: config.type };
    }
    return { name: categoryId, icon: 'CreditCard', color: '#6B7280', type: 'variable' };
  }, [getCategoryById]);

  // Get last 8 expenses
  const recentExpenses = expenses.slice(0, 8);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 animate-pulse">
                <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-800" />
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/3 mb-2" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-1/2" />
                </div>
                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-16" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader
        action={
          <Link href="/expenses">
            <Button variant="ghost" size="sm" rightIcon={<ChevronRight className="h-4 w-4" />}>
              View All
            </Button>
          </Link>
        }
      >
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {recentExpenses.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">No recent expenses</p>
            <Link href="/expenses/add">
              <Button variant="primary" size="sm" className="mt-4">
                Add Your First Expense
              </Button>
            </Link>
          </div>
        ) : (
          <div>
            {recentExpenses.map((expense, index) => (
              <ActivityItem
                key={expense.id}
                expense={expense}
                index={index}
                onDelete={onDelete}
                formatCurrency={formatCurrency}
                getCategoryInfo={getCategoryInfo}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export { RecentActivity };
