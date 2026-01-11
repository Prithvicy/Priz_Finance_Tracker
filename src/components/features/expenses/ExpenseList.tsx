'use client';

// ============================================
// Expense List Component
// ============================================

import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { Trash2, Edit2, Filter, Search } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { Card, Button, Input, Badge, Modal, ModalFooter } from '@/components/ui';
import { Expense, ExpenseCategory } from '@/types';
import { CATEGORIES } from '@/lib/utils/constants';
import { formatDateSmart } from '@/lib/utils/formatters';
import { useSettings, useCategories } from '@/hooks';
import { cn } from '@/lib/cn';

// ============================================
// Types
// ============================================

interface ExpenseListProps {
  expenses: Expense[];
  isLoading?: boolean;
  onEdit?: (expense: Expense) => void;
  onDelete?: (id: string) => Promise<void>;
}

// ============================================
// Expense Row Component
// ============================================

interface ExpenseRowProps {
  expense: Expense;
  index: number;
  onEdit?: (expense: Expense) => void;
  onDelete?: (id: string) => void;
  formatCurrency: (cents: number) => string;
  getCategoryInfo: (id: string) => { name: string; icon: string; color: string; type: string };
}

const ExpenseRow = ({ expense, index, onEdit, onDelete, formatCurrency, getCategoryInfo }: ExpenseRowProps) => {
  const category = getCategoryInfo(expense.category as string);
  const IconComponent = LucideIcons[category.icon as keyof typeof LucideIcons] as React.ElementType;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ delay: index * 0.02, duration: 0.2 }}
      className="group flex items-center gap-4 p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 hover:shadow-md transition-shadow"
    >
      {/* Category Icon */}
      <div
        className="flex-shrink-0 h-12 w-12 rounded-xl flex items-center justify-center"
        style={{ backgroundColor: `${category.color}15` }}
      >
        {IconComponent && (
          <IconComponent className="h-6 w-6" style={{ color: category.color }} />
        )}
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <p className="text-sm font-semibold text-gray-900 dark:text-white">
            {category.name}
          </p>
          <Badge
            variant={category.type === 'fixed' ? 'info' : 'warning'}
            size="sm"
          >
            {category.type}
          </Badge>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {formatDateSmart(expense.date)}
          {expense.description && ` • ${expense.description}`}
        </p>
      </div>

      {/* Amount & Actions */}
      <div className="flex items-center gap-3">
        <p className="text-lg font-bold text-gray-900 dark:text-white">
          {formatCurrency(expense.amount)}
        </p>
        <div className="flex items-center gap-1 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
          {onEdit && (
            <button
              onClick={() => onEdit(expense)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <Edit2 className="h-4 w-4" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(expense.id)}
              className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// ============================================
// Main Component
// ============================================

const ExpenseList = ({ expenses, isLoading, onEdit, onDelete }: ExpenseListProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { formatCurrency } = useSettings();
  const { allCategories, getCategoryById } = useCategories();

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

  // Filter expenses
  const filteredExpenses = useMemo(() => expenses.filter((expense) => {
    const catInfo = getCategoryInfo(expense.category as string);
    const matchesSearch =
      searchQuery === '' ||
      catInfo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      expense.description?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === 'all' || expense.category === selectedCategory;

    return matchesSearch && matchesCategory;
  }), [expenses, searchQuery, selectedCategory, getCategoryInfo]);

  // Group by date
  const groupedExpenses = filteredExpenses.reduce((groups, expense) => {
    const date = format(expense.date.toDate(), 'yyyy-MM-dd');
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(expense);
    return groups;
  }, {} as Record<string, Expense[]>);

  const handleConfirmDelete = async () => {
    if (deleteId && onDelete) {
      await onDelete(deleteId);
      setDeleteId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 animate-pulse"
          >
            <div className="h-12 w-12 rounded-xl bg-gray-200 dark:bg-gray-800" />
            <div className="flex-1">
              <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/4 mb-2" />
              <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-1/3" />
            </div>
            <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-20" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <>
      {/* Filters */}
      <div className="flex flex-col gap-3 mb-6">
        <div className="w-full">
          <Input
            placeholder="Search expenses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search className="h-4 w-4" />}
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
          <Button
            variant={selectedCategory === 'all' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory('all')}
            className="flex-shrink-0"
          >
            All
          </Button>
          {allCategories.map((cat) => (
            <Button
              key={cat.id}
              variant={selectedCategory === cat.id ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(cat.id)}
              className="flex-shrink-0 whitespace-nowrap"
            >
              {cat.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Expense List */}
      {Object.keys(groupedExpenses).length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            {searchQuery || selectedCategory !== 'all'
              ? 'No expenses match your filters'
              : 'No expenses yet'}
          </p>
        </Card>
      ) : (
        <div className="space-y-6">
          <AnimatePresence mode="popLayout">
            {Object.entries(groupedExpenses)
              .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
              .map(([date, dayExpenses]) => (
                <div key={date}>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
                    {format(new Date(date), 'EEEE, MMMM d, yyyy')}
                  </p>
                  <div className="space-y-3">
                    {dayExpenses.map((expense, index) => (
                      <ExpenseRow
                        key={expense.id}
                        expense={expense}
                        index={index}
                        onEdit={onEdit}
                        onDelete={() => setDeleteId(expense.id)}
                        formatCurrency={formatCurrency}
                        getCategoryInfo={getCategoryInfo}
                      />
                    ))}
                  </div>
                </div>
              ))}
          </AnimatePresence>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
        title="Delete Expense"
        size="sm"
      >
        <p className="text-gray-600 dark:text-gray-400">
          Are you sure you want to delete this expense? This action cannot be undone.
        </p>
        <ModalFooter>
          <Button variant="secondary" onClick={() => setDeleteId(null)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleConfirmDelete}>
            Delete
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
};

export { ExpenseList };
