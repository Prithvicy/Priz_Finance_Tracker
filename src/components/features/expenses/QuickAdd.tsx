'use client';

// ============================================
// Quick Add Expense Component
// ============================================

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as LucideIcons from 'lucide-react';
import { Plus, Settings2, X, AlertTriangle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, Button, Modal, ModalFooter, CurrencyInput } from '@/components/ui';
import { NewExpense, NewCustomCategory, Expense } from '@/types';
import { cn } from '@/lib/cn';
import { useSettings, useCategories, useExpenses } from '@/hooks';
import { useToast } from '@/hooks';
import { AddCategoryModal } from '@/components/features/categories';
import type { UnifiedCategory } from '@/hooks/useCategories';

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
  category: UnifiedCategory;
  onClick: () => void;
  onDelete?: () => void;
  delay: number;
  isEditMode: boolean;
}

const CategoryButton = ({ category, onClick, onDelete, delay, isEditMode }: CategoryButtonProps) => {
  const IconComponent = LucideIcons[category.icon as keyof typeof LucideIcons] as React.ElementType;
  const showDelete = isEditMode && category.isCustom;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.2 }}
      className="relative"
    >
      {/* Delete badge for custom categories in edit mode */}
      <AnimatePresence>
        {showDelete && (
          <motion.button
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ duration: 0.15 }}
            onClick={(e) => {
              e.stopPropagation();
              onDelete?.();
            }}
            className="absolute -top-2 -right-2 z-10 h-6 w-6 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </motion.button>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: isEditMode ? 1 : 1.05 }}
        whileTap={{ scale: isEditMode ? 1 : 0.95 }}
        onClick={onClick}
        disabled={isEditMode}
        className={cn(
          'flex flex-col items-center justify-center gap-2 p-4 rounded-xl w-full',
          'border-2 border-transparent transition-all duration-200',
          isEditMode
            ? category.isCustom
              ? 'animate-wiggle border-red-200 dark:border-red-800'
              : 'opacity-50'
            : 'hover:border-gray-200 dark:hover:border-gray-700 hover:shadow-md active:shadow-sm'
        )}
        style={{ backgroundColor: `${category.color}15` }}
      >
        <div
          className="h-12 w-12 rounded-full flex items-center justify-center"
          style={{ backgroundColor: `${category.color}25` }}
        >
          {IconComponent && (
            <IconComponent className="h-6 w-6" style={{ color: category.color }} />
          )}
        </div>
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 line-clamp-1">
          {category.name}
        </span>
      </motion.button>
    </motion.div>
  );
};

// ============================================
// Add Category Button Component
// ============================================

interface AddCategoryButtonProps {
  onClick: () => void;
  delay: number;
  disabled?: boolean;
}

const AddCategoryButton = ({ onClick, delay, disabled }: AddCategoryButtonProps) => {
  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.2 }}
      whileHover={{ scale: disabled ? 1 : 1.05 }}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'flex flex-col items-center justify-center gap-2 p-4 rounded-xl',
        'border-2 border-dashed border-gray-300 dark:border-gray-600',
        'transition-all duration-200',
        disabled
          ? 'opacity-50 cursor-not-allowed'
          : 'hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/30',
        'group'
      )}
    >
      <div className={cn(
        "h-12 w-12 rounded-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 transition-colors",
        !disabled && "group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50"
      )}>
        <Plus className={cn(
          "h-6 w-6 text-gray-400 transition-colors",
          !disabled && "group-hover:text-blue-500"
        )} />
      </div>
      <span className={cn(
        "text-sm font-medium text-gray-500 dark:text-gray-400 transition-colors",
        !disabled && "group-hover:text-blue-600 dark:group-hover:text-blue-400"
      )}>
        Add New
      </span>
    </motion.button>
  );
};

// ============================================
// Main Component
// ============================================

const QuickAdd = ({ onAdd, isLoading }: QuickAddProps) => {
  const { currencySymbol } = useSettings();
  const { fixedCategories, variableCategories, customCategories, addCustomCategory, deleteCustomCategory, getCategoryById } = useCategories();
  const { expenses } = useExpenses();
  const toast = useToast();

  const [selectedCategory, setSelectedCategory] = useState<UnifiedCategory | null>(null);
  const [amount, setAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<UnifiedCategory | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Count expenses using a category
  const getExpenseCount = (categoryId: string) => {
    return expenses.filter(e => e.category === categoryId).length;
  };

  // Check if there are any custom categories
  const hasCustomCategories = customCategories.length > 0;

  const handleCategoryClick = (category: UnifiedCategory) => {
    if (isEditMode) return;
    setSelectedCategory(category);
    setAmount('');
  };

  const handleSubmit = async () => {
    if (!selectedCategory || !amount) return;

    setIsSubmitting(true);
    try {
      await onAdd({
        amount: parseFloat(amount) * 100, // Convert to cents
        category: selectedCategory.id as any, // Type assertion for custom categories
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

  const handleAddCategory = async (category: NewCustomCategory) => {
    try {
      await addCustomCategory(category);
      toast.success(`Category "${category.name}" created!`);
    } catch (error) {
      toast.error('Failed to create category');
      throw error;
    }
  };

  const handleDeleteClick = (category: UnifiedCategory) => {
    setCategoryToDelete(category);
  };

  const handleConfirmDelete = async () => {
    if (!categoryToDelete) return;

    setIsDeleting(true);
    try {
      await deleteCustomCategory(categoryToDelete.id);
      toast.success(`Category "${categoryToDelete.name}" deleted`);
      setCategoryToDelete(null);
      // Exit edit mode if no more custom categories
      if (customCategories.length <= 1) {
        setIsEditMode(false);
      }
    } catch (error) {
      toast.error('Failed to delete category');
    } finally {
      setIsDeleting(false);
    }
  };

  const expenseCountForDelete = categoryToDelete ? getExpenseCount(categoryToDelete.id) : 0;

  return (
    <>
      <Card>
        <CardHeader
          action={
            hasCustomCategories && (
              <Button
                variant={isEditMode ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setIsEditMode(!isEditMode)}
                leftIcon={<Settings2 className="h-4 w-4" />}
              >
                {isEditMode ? 'Done' : 'Edit'}
              </Button>
            )
          }
        >
          <CardTitle>Quick Add</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Edit Mode Banner */}
          <AnimatePresence>
            {isEditMode && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800"
              >
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  Tap the <span className="font-medium text-red-600">X</span> on custom categories to delete them.
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Fixed Expenses */}
          <div className="mb-6">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
              Fixed Expenses
            </p>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
              {fixedCategories.map((category, index) => (
                <CategoryButton
                  key={category.id}
                  category={category}
                  onClick={() => handleCategoryClick(category)}
                  onDelete={() => handleDeleteClick(category)}
                  delay={index * 0.03}
                  isEditMode={isEditMode}
                />
              ))}
              <AddCategoryButton
                onClick={() => setIsAddCategoryOpen(true)}
                delay={fixedCategories.length * 0.03}
                disabled={isEditMode}
              />
            </div>
          </div>

          {/* Variable Expenses */}
          <div>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
              Variable Expenses
            </p>
            <div className="grid grid-cols-3 gap-3">
              {variableCategories.map((category, index) => (
                <CategoryButton
                  key={category.id}
                  category={category}
                  onClick={() => handleCategoryClick(category)}
                  onDelete={() => handleDeleteClick(category)}
                  delay={(fixedCategories.length + index) * 0.03}
                  isEditMode={isEditMode}
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
        title={`Add ${selectedCategory?.name || ''} Expense`}
        size="sm"
      >
        <div className="py-4">
          <CurrencyInput
            label="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            currency={currencySymbol}
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

      {/* Add Category Modal */}
      <AddCategoryModal
        isOpen={isAddCategoryOpen}
        onClose={() => setIsAddCategoryOpen(false)}
        onAdd={handleAddCategory}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={categoryToDelete !== null}
        onClose={() => setCategoryToDelete(null)}
        title="Delete Category"
        size="sm"
      >
        <div className="py-4 space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            Are you sure you want to delete <span className="font-semibold text-gray-900 dark:text-white">"{categoryToDelete?.name}"</span>?
          </p>

          {expenseCountForDelete > 0 && (
            <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
              <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                  {expenseCountForDelete} expense{expenseCountForDelete !== 1 ? 's' : ''} use{expenseCountForDelete === 1 ? 's' : ''} this category
                </p>
                <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                  These expenses will remain but may display differently.
                </p>
              </div>
            </div>
          )}
        </div>

        <ModalFooter>
          <Button variant="secondary" onClick={() => setCategoryToDelete(null)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleConfirmDelete}
            isLoading={isDeleting}
          >
            Delete Category
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
};

export { QuickAdd };
