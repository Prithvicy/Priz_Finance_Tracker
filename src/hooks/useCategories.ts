'use client';

// ============================================
// Categories Hook - Combines Default + Custom Categories
// ============================================

import { useState, useEffect, useCallback, useMemo } from 'react';
import { CustomCategory, NewCustomCategory, CategoryConfig, ExpenseCategory, CategoryType } from '@/types';
import {
  getCustomCategories,
  addCustomCategory as addCustomCategoryService,
  updateCustomCategory as updateCustomCategoryService,
  deleteCustomCategory as deleteCustomCategoryService,
} from '@/services/firebase';
import { CATEGORIES, FIXED_CATEGORIES, VARIABLE_CATEGORIES } from '@/lib/utils/constants';
import { useAuth } from './useAuth';

// ============================================
// Types
// ============================================

export interface UnifiedCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: CategoryType;
  order: number;
  isCustom: boolean;
}

interface UseCategoriesReturn {
  // Active categories only (for pickers - excludes deleted)
  allCategories: UnifiedCategory[];
  fixedCategories: UnifiedCategory[];
  variableCategories: UnifiedCategory[];
  customCategories: CustomCategory[];

  // All categories including deleted (for charts/display)
  allCategoriesIncludingDeleted: UnifiedCategory[];

  // Category lookup (searches all including deleted)
  getCategoryById: (id: string) => UnifiedCategory | undefined;
  getCategoryConfig: (id: string) => CategoryConfig | CustomCategory | undefined;

  // CRUD for custom categories
  addCustomCategory: (category: NewCustomCategory) => Promise<string>;
  updateCustomCategory: (id: string, updates: Partial<NewCustomCategory>) => Promise<void>;
  deleteCustomCategory: (id: string) => Promise<void>;

  // State
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

// ============================================
// Convert Default Categories to Unified Format
// ============================================

const defaultCategoriesAsUnified: UnifiedCategory[] = Object.entries(CATEGORIES).map(
  ([id, config]) => ({
    id,
    name: config.name,
    icon: config.icon,
    color: config.color,
    type: config.type,
    order: config.order,
    isCustom: false,
  })
);

// ============================================
// Hook
// ============================================

export const useCategories = (): UseCategoriesReturn => {
  const { user, isAuthenticated } = useAuth();

  const [customCategories, setCustomCategories] = useState<CustomCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch custom categories
  const fetchCustomCategories = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setCustomCategories([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const data = await getCustomCategories(user.uid);
      setCustomCategories(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch categories';
      setError(message);
      console.error('Error fetching custom categories:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user, isAuthenticated]);

  // Auto-fetch on mount
  useEffect(() => {
    fetchCustomCategories();
  }, [fetchCustomCategories]);

  // Separate active (not deleted) from all custom categories
  const activeCustomCategories = useMemo(
    () => customCategories.filter((c) => !c.isDeleted),
    [customCategories]
  );

  // All categories including deleted (for display/lookup)
  const allCategoriesIncludingDeleted = useMemo(() => {
    const customAsUnified: UnifiedCategory[] = customCategories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      icon: cat.icon,
      color: cat.color,
      type: cat.type,
      order: cat.order,
      isCustom: true,
    }));

    return [...defaultCategoriesAsUnified, ...customAsUnified].sort((a, b) => a.order - b.order);
  }, [customCategories]);

  // Active categories only (for picker/selection - excludes deleted)
  const allCategories = useMemo(() => {
    const customAsUnified: UnifiedCategory[] = activeCustomCategories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      icon: cat.icon,
      color: cat.color,
      type: cat.type,
      order: cat.order,
      isCustom: true,
    }));

    return [...defaultCategoriesAsUnified, ...customAsUnified].sort((a, b) => a.order - b.order);
  }, [activeCustomCategories]);

  // Split by type (only active categories)
  const fixedCategories = useMemo(
    () => allCategories.filter((c) => c.type === 'fixed'),
    [allCategories]
  );

  const variableCategories = useMemo(
    () => allCategories.filter((c) => c.type === 'variable'),
    [allCategories]
  );

  // Lookup function - searches ALL categories including deleted ones
  const getCategoryById = useCallback(
    (id: string): UnifiedCategory | undefined => {
      return allCategoriesIncludingDeleted.find((c) => c.id === id);
    },
    [allCategoriesIncludingDeleted]
  );

  // Get original config (for backwards compatibility) - includes deleted
  const getCategoryConfig = useCallback(
    (id: string): CategoryConfig | CustomCategory | undefined => {
      // Check default categories first
      if (id in CATEGORIES) {
        return CATEGORIES[id as ExpenseCategory];
      }
      // Then check ALL custom categories (including deleted)
      return customCategories.find((c) => c.id === id);
    },
    [customCategories]
  );

  // Add custom category
  const addCustomCategory = useCallback(
    async (category: NewCustomCategory): Promise<string> => {
      if (!user) throw new Error('Not authenticated');

      try {
        setError(null);
        const id = await addCustomCategoryService(user.uid, category);
        await fetchCustomCategories();
        return id;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to add category';
        setError(message);
        throw err;
      }
    },
    [user, fetchCustomCategories]
  );

  // Update custom category
  const updateCustomCategory = useCallback(
    async (id: string, updates: Partial<NewCustomCategory>): Promise<void> => {
      if (!user) throw new Error('Not authenticated');

      try {
        setError(null);
        await updateCustomCategoryService(user.uid, id, updates);
        await fetchCustomCategories();
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to update category';
        setError(message);
        throw err;
      }
    },
    [user, fetchCustomCategories]
  );

  // Delete custom category (soft delete)
  const deleteCustomCategory = useCallback(
    async (id: string): Promise<void> => {
      if (!user) throw new Error('Not authenticated');

      try {
        setError(null);
        await deleteCustomCategoryService(user.uid, id);
        // Mark as deleted in local state (soft delete)
        setCustomCategories((prev) =>
          prev.map((c) => (c.id === id ? { ...c, isDeleted: true } : c))
        );
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to delete category';
        setError(message);
        throw err;
      }
    },
    [user]
  );

  return {
    allCategories,
    fixedCategories,
    variableCategories,
    customCategories: activeCustomCategories, // Only return active ones for the picker
    allCategoriesIncludingDeleted,
    getCategoryById,
    getCategoryConfig,
    addCustomCategory,
    updateCustomCategory,
    deleteCustomCategory,
    isLoading,
    error,
    refresh: fetchCustomCategories,
  };
};
