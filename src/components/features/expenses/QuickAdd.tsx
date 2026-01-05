'use client';

// ============================================
// Quick Add Expense Component
// ============================================

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as LucideIcons from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, Button, Modal, ModalFooter, CurrencyInput } from '@/components/ui';
import { ExpenseCategory, NewExpense } from '@/types';
import { CATEGORIES, FIXED_CATEGORIES, VARIABLE_CATEGORIES } from '@/lib/utils/constants';
import { cn } from '@/lib/cn';

// ============================================
// Types
// ============================================

interface QuickAddProps {
  onAdd: (expense: NewExpense) => Promise<void>;
  isLoading?: boolean;
}

// ============================================
// Category Button Component
// ============================================

interface CategoryButtonProps {
  category: ExpenseCategory;
  onClick: () => void;
  delay: number;
}

const CategoryButton = ({ category, onClick, delay }: CategoryButtonProps) => {
  const config = CATEGORIES[category];
  const IconComponent = LucideIcons[config.icon as keyof typeof LucideIcons] as React.ElementType;

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.2 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={cn(
        'flex flex-col items-center justify-center gap-2 p-4 rounded-xl',
        'border-2 border-transparent transition-all duration-200',
        'hover:border-gray-200 dark:hover:border-gray-700',
        'hover:shadow-md active:shadow-sm'
      )}
      style={{ backgroundColor: `${config.color}15` }}
    >
      <div
        className="h-12 w-12 rounded-full flex items-center justify-center"
        style={{ backgroundColor: `${config.color}25` }}
      >
        {IconComponent && (
          <IconComponent className="h-6 w-6" style={{ color: config.color }} />
        )}
      </div>
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
        {config.name}
      </span>
    </motion.button>
  );
};

// ============================================
// Main Component
// ============================================

const QuickAdd = ({ onAdd, isLoading }: QuickAddProps) => {
  const [selectedCategory, setSelectedCategory] = useState<ExpenseCategory | null>(null);
  const [amount, setAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCategoryClick = (category: ExpenseCategory) => {
    setSelectedCategory(category);
    setAmount('');
  };

  const handleSubmit = async () => {
    if (!selectedCategory || !amount) return;

    setIsSubmitting(true);
    try {
      await onAdd({
        amount: parseFloat(amount) * 100, // Convert to cents
        category: selectedCategory,
        date: new Date(),
      });
      setSelectedCategory(null);
      setAmount('');
    } catch (error) {
      console.error('Error adding expense:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedCategory(null);
    setAmount('');
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Quick Add</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Fixed Expenses */}
          <div className="mb-6">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
              Fixed Expenses
            </p>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
              {FIXED_CATEGORIES.map((category, index) => (
                <CategoryButton
                  key={category}
                  category={category}
                  onClick={() => handleCategoryClick(category)}
                  delay={index * 0.03}
                />
              ))}
            </div>
          </div>

          {/* Variable Expenses */}
          <div>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
              Variable Expenses
            </p>
            <div className="grid grid-cols-3 gap-3">
              {VARIABLE_CATEGORIES.map((category, index) => (
                <CategoryButton
                  key={category}
                  category={category}
                  onClick={() => handleCategoryClick(category)}
                  delay={(FIXED_CATEGORIES.length + index) * 0.03}
                />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Amount Modal */}
      <Modal
        isOpen={selectedCategory !== null}
        onClose={handleClose}
        title={`Add ${selectedCategory ? CATEGORIES[selectedCategory].name : ''} Expense`}
        size="sm"
      >
        <div className="py-4">
          <CurrencyInput
            label="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            autoFocus
          />
        </div>

        <ModalFooter>
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            isLoading={isSubmitting}
            disabled={!amount || parseFloat(amount) <= 0}
          >
            Add Expense
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
};

export { QuickAdd };
