'use client';

// ============================================
// Add Custom Category Modal
// ============================================

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as LucideIcons from 'lucide-react';
import { Modal, ModalFooter, Button, Input } from '@/components/ui';
import { NewCustomCategory, CategoryType } from '@/types';
import { cn } from '@/lib/cn';

// ============================================
// Available Icons for Categories
// ============================================

const AVAILABLE_ICONS = [
  'ShoppingBag', 'Coffee', 'Car', 'Heart', 'Star', 'Music', 'Film', 'Book',
  'Gamepad2', 'Dumbbell', 'Stethoscope', 'Pill', 'Baby', 'Dog', 'Cat',
  'Shirt', 'Gift', 'Gem', 'Briefcase', 'GraduationCap', 'Plane', 'Train',
  'Bus', 'Bike', 'Building', 'Trees', 'Flower2', 'Sun', 'Moon', 'Palette',
  'Camera', 'Headphones', 'Smartphone', 'Laptop', 'Tv', 'Watch', 'Glasses',
  'Umbrella', 'Key', 'Lock', 'Tool', 'Wrench', 'Hammer', 'Scissors',
] as const;

// ============================================
// Available Colors for Categories
// ============================================

const AVAILABLE_COLORS = [
  '#3B82F6', // Blue
  '#22C55E', // Green
  '#EAB308', // Yellow
  '#F97316', // Orange
  '#EF4444', // Red
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#14B8A6', // Teal
  '#0EA5E9', // Sky
  '#A855F7', // Violet
  '#F43F5E', // Rose
  '#84CC16', // Lime
];

// ============================================
// Types
// ============================================

interface AddCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (category: NewCustomCategory) => Promise<void>;
}

// ============================================
// Component
// ============================================

export const AddCategoryModal = ({ isOpen, onClose, onAdd }: AddCategoryModalProps) => {
  const [name, setName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState<string>(AVAILABLE_ICONS[0]);
  const [selectedColor, setSelectedColor] = useState(AVAILABLE_COLORS[0]);
  const [selectedType, setSelectedType] = useState<CategoryType>('variable');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError('Please enter a category name');
      return;
    }

    if (name.trim().length > 20) {
      setError('Category name must be 20 characters or less');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await onAdd({
        name: name.trim(),
        icon: selectedIcon,
        color: selectedColor,
        type: selectedType,
      });
      handleClose();
    } catch (err) {
      setError('Failed to create category');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setName('');
    setSelectedIcon(AVAILABLE_ICONS[0]);
    setSelectedColor(AVAILABLE_COLORS[0]);
    setSelectedType('variable');
    setError('');
    onClose();
  };

  const IconComponent = LucideIcons[selectedIcon as keyof typeof LucideIcons] as React.ElementType;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add Custom Category" size="md">
      <div className="space-y-6 py-4">
        {/* Preview */}
        <div className="flex justify-center">
          <motion.div
            key={`${selectedIcon}-${selectedColor}`}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col items-center gap-3"
          >
            <div
              className="h-20 w-20 rounded-2xl flex items-center justify-center shadow-lg"
              style={{ backgroundColor: `${selectedColor}20` }}
            >
              {IconComponent && (
                <IconComponent className="h-10 w-10" style={{ color: selectedColor }} />
              )}
            </div>
            <span className="text-lg font-medium text-gray-700 dark:text-gray-300">
              {name || 'Category Name'}
            </span>
          </motion.div>
        </div>

        {/* Name Input */}
        <div>
          <Input
            label="Category Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Pet Care, Hobbies"
            maxLength={20}
            error={error}
          />
        </div>

        {/* Type Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Category Type
          </label>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setSelectedType('fixed')}
              className={cn(
                'flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200',
                selectedType === 'fixed'
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              )}
            >
              Fixed
            </button>
            <button
              type="button"
              onClick={() => setSelectedType('variable')}
              className={cn(
                'flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200',
                selectedType === 'variable'
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              )}
            >
              Variable
            </button>
          </div>
        </div>

        {/* Color Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Color
          </label>
          <div className="grid grid-cols-6 gap-2">
            {AVAILABLE_COLORS.map((color) => (
              <motion.button
                key={color}
                type="button"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedColor(color)}
                className={cn(
                  'h-10 w-10 rounded-full transition-all duration-200',
                  selectedColor === color
                    ? 'ring-2 ring-offset-2 ring-gray-400 dark:ring-gray-500'
                    : ''
                )}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>

        {/* Icon Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Icon
          </label>
          <div className="grid grid-cols-8 gap-2 max-h-40 overflow-y-auto p-1">
            {AVAILABLE_ICONS.map((iconName) => {
              const Icon = LucideIcons[iconName as keyof typeof LucideIcons] as React.ElementType;
              return (
                <motion.button
                  key={iconName}
                  type="button"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedIcon(iconName)}
                  className={cn(
                    'h-10 w-10 rounded-lg flex items-center justify-center transition-all duration-200',
                    selectedIcon === iconName
                      ? 'bg-gray-200 dark:bg-gray-700 ring-2 ring-gray-400'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                  )}
                >
                  {Icon && <Icon className="h-5 w-5 text-gray-600 dark:text-gray-400" />}
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>

      <ModalFooter>
        <Button variant="secondary" onClick={handleClose}>
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={handleSubmit}
          isLoading={isSubmitting}
          disabled={!name.trim()}
        >
          Create Category
        </Button>
      </ModalFooter>
    </Modal>
  );
};
