'use client';

// ============================================
// Income List Component
// ============================================

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { Trash2, Edit2, Plus } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { Card, Button, Badge, Modal, ModalFooter } from '@/components/ui';
import { Income } from '@/types';
import { INCOME_TYPES } from '@/lib/utils/constants';
import { formatDateSmart } from '@/lib/utils/formatters';
import { useSettings } from '@/hooks';

// ============================================
// Types
// ============================================

interface IncomeListProps {
  income: Income[];
  isLoading?: boolean;
  onEdit?: (income: Income) => void;
  onDelete?: (id: string) => Promise<void>;
}

// ============================================
// Income Row Component
// ============================================

interface IncomeRowProps {
  income: Income;
  index: number;
  onEdit?: (income: Income) => void;
  onDelete?: (id: string) => void;
  formatCurrency: (cents: number) => string;
}

const IncomeRow = ({ income, index, onEdit, onDelete, formatCurrency }: IncomeRowProps) => {
  const typeConfig = INCOME_TYPES[income.type];
  const IconComponent = LucideIcons[typeConfig.icon as keyof typeof LucideIcons] as React.ElementType;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ delay: index * 0.02, duration: 0.2 }}
      className="group flex items-center gap-3 p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 hover:shadow-md transition-shadow"
    >
      {/* Type Icon */}
      <div
        className="flex-shrink-0 h-10 w-10 rounded-xl flex items-center justify-center"
        style={{ backgroundColor: `${typeConfig.color}15` }}
      >
        {IconComponent && (
          <IconComponent className="h-5 w-5" style={{ color: typeConfig.color }} />
        )}
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0 overflow-hidden">
        <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
          <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
            {income.source}
          </p>
          <Badge variant="success" size="sm">
            {typeConfig.name}
          </Badge>
          {income.isRegular && (
            <Badge variant="info" size="sm">
              Regular
            </Badge>
          )}
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
          {formatDateSmart(income.date)}
          {income.note && ` • ${income.note}`}
        </p>
      </div>

      {/* Amount */}
      <p className="text-sm font-bold text-green-600 dark:text-green-400 whitespace-nowrap flex-shrink-0">
        +{formatCurrency(income.amount)}
      </p>

      {/* Actions - only on hover/desktop */}
      <div className="hidden sm:flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
        {onEdit && (
          <button
            onClick={() => onEdit(income)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <Edit2 className="h-4 w-4" />
          </button>
        )}
        {onDelete && (
          <button
            onClick={() => onDelete(income.id)}
            className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 transition-colors"
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

const IncomeList = ({ income, isLoading, onEdit, onDelete }: IncomeListProps) => {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { formatCurrency } = useSettings();

  // Group by month
  const groupedIncome = income.reduce((groups, inc) => {
    const month = format(inc.date.toDate(), 'yyyy-MM');
    if (!groups[month]) {
      groups[month] = [];
    }
    groups[month].push(inc);
    return groups;
  }, {} as Record<string, Income[]>);

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

  if (income.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-gray-500 dark:text-gray-400 mb-4">No income recorded yet</p>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <AnimatePresence mode="popLayout">
          {Object.entries(groupedIncome)
            .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
            .map(([month, monthIncome]) => (
              <div key={month}>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {format(new Date(month + '-01'), 'MMMM yyyy')}
                  </p>
                  <p className="text-sm font-semibold text-green-600">
                    Total: {formatCurrency(monthIncome.reduce((sum, i) => sum + i.amount, 0))}
                  </p>
                </div>
                <div className="space-y-3">
                  {monthIncome.map((inc, index) => (
                    <IncomeRow
                      key={inc.id}
                      income={inc}
                      index={index}
                      onEdit={onEdit}
                      onDelete={() => setDeleteId(inc.id)}
                      formatCurrency={formatCurrency}
                    />
                  ))}
                </div>
              </div>
            ))}
        </AnimatePresence>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
        title="Delete Income"
        size="sm"
      >
        <p className="text-gray-600 dark:text-gray-400">
          Are you sure you want to delete this income entry? This action cannot be undone.
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

export { IncomeList };
